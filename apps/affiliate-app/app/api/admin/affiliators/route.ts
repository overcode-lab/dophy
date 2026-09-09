import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@repo/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();

    const { data: affiliates, error } = await supabaseAdmin
      .from("affiliates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: affiliates || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { affiliate_id, status, sales_target } = await request.json();

    if (!affiliate_id) {
      return NextResponse.json(
        { success: false, error: "Affiliate ID wajib diisi" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (sales_target !== undefined) updateData.sales_target = sales_target;

    const { data: updated, error } = await supabaseAdmin
      .from("affiliates")
      .update(updateData)
      .eq("id", affiliate_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data Affiliator berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Affiliate ID wajib disertakan" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Check if affiliate has withdrawals
    const { data: withdrawals } = await supabaseAdmin
      .from("withdrawals")
      .select("id")
      .eq("affiliate_id", id)
      .limit(1);

    if (withdrawals && withdrawals.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Mitra tidak dapat dihapus karena sudah memiliki riwayat pencairan/penarikan komisi.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("affiliates")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data mitra affiliator berhasil dihapus!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
