import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@repo/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();

    const { data: partners, error } = await supabaseAdmin
      .from("partners")
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
      data: partners || [],
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
    const body = await request.json();
    const partner_id = body.partner_id;
    const { status } = body;

    if (!partner_id) {
      return NextResponse.json(
        { success: false, error: "Partner ID wajib diisi" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;

    const { data: updated, error } = await supabaseAdmin
      .from("partners")
      .update(updateData)
      .eq("id", partner_id)
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
      message: "Data Creator Partner berhasil diperbarui",
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
        { success: false, error: "Partner ID wajib disertakan" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Check if partner has withdrawals
    const { data: withdrawals } = await supabaseAdmin
      .from("withdrawals")
      .select("id")
      .eq("partner_id", id)
      .limit(1);

    if (withdrawals && withdrawals.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Creator Partner tidak dapat dihapus karena sudah memiliki riwayat pencairan/penarikan Creator Royalty.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("partners")
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
      message: "Data Creator Partner berhasil dihapus!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
