import { NextResponse } from "next/server";
import { getSupabaseAdminClient, WithdrawalInputSchema } from "@repo/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { affiliate_id, amount, bank_account_number, bank_name } = body;

    if (!affiliate_id) {
      return NextResponse.json(
        { success: false, error: "Affiliate ID wajib diisi" },
        { status: 400 }
      );
    }

    const validationResult = WithdrawalInputSchema.safeParse({
      amount: Number(amount),
      bank_account_number,
      bank_name,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi pengajuan penarikan gagal",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Fetch current affiliate balance
    const { data: affiliate, error: affError } = await supabaseAdmin
      .from("affiliates")
      .select("id, available_balance, held_balance, status")
      .eq("id", affiliate_id)
      .single();

    if (affError || !affiliate) {
      return NextResponse.json(
        { success: false, error: "Data Affiliator tidak ditemukan" },
        { status: 404 }
      );
    }

    if (affiliate.status === "inactive") {
      return NextResponse.json(
        { success: false, error: "Akun Anda sedang dinonaktifkan oleh Admin." },
        { status: 403 }
      );
    }

    const currentAvailable = Number(affiliate.available_balance || 0);
    const requestAmount = Number(amount);

    if (requestAmount > currentAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: `Saldo tidak mencukupi. Saldo tersedia Anda: Rp ${currentAvailable.toLocaleString("id-ID")}`,
        },
        { status: 400 }
      );
    }

    // 2. Atomic Balance Hold Transaction
    const newAvailable = currentAvailable - requestAmount;
    const newHeld = Number(affiliate.held_balance || 0) + requestAmount;

    // Update balance
    const { error: updateError } = await supabaseAdmin
      .from("affiliates")
      .update({
        available_balance: newAvailable,
        held_balance: newHeld,
      })
      .eq("id", affiliate_id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: `Gagal memperbarui saldo: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Insert withdrawal request record
    const { data: withdrawal, error: insertError } = await supabaseAdmin
      .from("withdrawals")
      .insert({
        affiliate_id,
        amount: requestAmount,
        bank_account_number,
        bank_name,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      // Rollback balance if insert failed
      await supabaseAdmin
        .from("affiliates")
        .update({
          available_balance: currentAvailable,
          held_balance: affiliate.held_balance,
        })
        .eq("id", affiliate_id);

      return NextResponse.json(
        { success: false, error: `Gagal membuat catatan penarikan: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pengajuan penarikan dana berhasil! Saldo Anda telah ditahan sementara.",
        data: withdrawal,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get("affiliate_id");

    if (!affiliateId) {
      return NextResponse.json(
        { success: false, error: "Affiliate ID wajib diisi" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const { data: withdrawals, error } = await supabaseAdmin
      .from("withdrawals")
      .select("*")
      .eq("affiliate_id", affiliateId)
      .order("requested_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: withdrawals || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
