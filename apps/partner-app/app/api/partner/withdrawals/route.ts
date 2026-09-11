import { NextResponse } from "next/server";
import { getSupabaseAdminClient, WithdrawalInputSchema } from "@repo/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partner_id, amount, bank_account_number, bank_name } = body;

    if (!partner_id) {
      return NextResponse.json(
        { success: false, error: "Partner ID wajib diisi" },
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

    // 1. Fetch current partner balance
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from("partners")
      .select("id, available_balance, held_balance, status")
      .eq("id", partner_id)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { success: false, error: "Data Creator Partner tidak ditemukan" },
        { status: 404 }
      );
    }

    if (partner.status === "inactive") {
      return NextResponse.json(
        { success: false, error: "Akun Anda sedang dinonaktifkan oleh Admin." },
        { status: 403 }
      );
    }

    const currentAvailable = Number(partner.available_balance || 0);
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
    const newHeld = Number(partner.held_balance || 0) + requestAmount;

    // Update balance
    const { error: updateError } = await supabaseAdmin
      .from("partners")
      .update({
        available_balance: newAvailable,
        held_balance: newHeld,
      })
      .eq("id", partner_id);

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
        partner_id: partner_id,
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
        .from("partners")
        .update({
          available_balance: currentAvailable,
          held_balance: partner.held_balance,
        })
        .eq("id", partner_id);

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
    const partnerId = searchParams.get("partner_id");

    if (!partnerId) {
      return NextResponse.json(
        { success: false, error: "Partner ID wajib diisi" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const { data: withdrawals, error } = await supabaseAdmin
      .from("withdrawals")
      .select("*")
      .eq("partner_id", partnerId)
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

/**
 * PATCH /api/partner/withdrawals
 * Cancel a pending withdrawal request and return held balance back to available balance
 * Body:
 * - withdrawal_id: string
 * - partner_id: string
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { withdrawal_id, partner_id } = body;

    if (!withdrawal_id || !partner_id) {
      return NextResponse.json(
        { success: false, error: "Withdrawal ID dan Partner ID wajib disertakan" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Fetch withdrawal record and verify status is pending and partner owns it
    const { data: withdrawal, error: wdError } = await supabaseAdmin
      .from("withdrawals")
      .select("id, partner_id, amount, status")
      .eq("id", withdrawal_id)
      .single();

    if (wdError || !withdrawal) {
      return NextResponse.json(
        { success: false, error: "Data pengajuan penarikan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (withdrawal.partner_id !== partner_id) {
      return NextResponse.json(
        { success: false, error: "Anda tidak memiliki izin untuk membatalkan pengajuan ini" },
        { status: 403 }
      );
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: "Hanya pengajuan dengan status 'Diajukan' yang dapat dibatalkan",
        },
        { status: 400 }
      );
    }

    const cancelAmount = Number(withdrawal.amount || 0);

    // 2. Fetch current partner balance
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from("partners")
      .select("id, available_balance, held_balance")
      .eq("id", partner_id)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { success: false, error: "Data Creator Partner tidak ditemukan" },
        { status: 404 }
      );
    }

    // 3. Update withdrawal status to cancelled (with fallback if DB enum hasn't been altered yet)
    let updatedWd: any = null;
    let updateWdError: any = null;

    const res1 = await supabaseAdmin
      .from("withdrawals")
      .update({
        status: "cancelled",
        rejection_reason: "Dibatalkan oleh Creator Partner",
        completed_at: new Date().toISOString(),
      })
      .eq("id", withdrawal_id)
      .select()
      .single();

    if (res1.error) {
      const res2 = await supabaseAdmin
        .from("withdrawals")
        .update({
          status: "rejected",
          rejection_reason: "Dibatalkan oleh Creator Partner",
          completed_at: new Date().toISOString(),
        })
        .eq("id", withdrawal_id)
        .select()
        .single();

      updatedWd = res2.data;
      updateWdError = res2.error;
    } else {
      updatedWd = res1.data;
    }

    if (updateWdError) {
      return NextResponse.json(
        { success: false, error: `Gagal membatalkan pengajuan: ${updateWdError.message}` },
        { status: 500 }
      );
    }

    // 4. Return held balance back to available balance
    const currentHeld = Number(partner.held_balance || 0);
    const currentAvailable = Number(partner.available_balance || 0);
    const newHeld = Math.max(0, currentHeld - cancelAmount);
    const newAvailable = currentAvailable + cancelAmount;

    const { data: updatedPartner, error: updatePartnerError } = await supabaseAdmin
      .from("partners")
      .update({
        available_balance: newAvailable,
        held_balance: newHeld,
      })
      .eq("id", partner_id)
      .select("id, available_balance, held_balance")
      .single();

    if (updatePartnerError) {
      return NextResponse.json(
        {
          success: false,
          error: `Status dibatalkan namun gagal mengembalikan saldo: ${updatePartnerError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pengajuan penarikan berhasil dibatalkan. Saldo tertahan telah dikembalikan ke saldo utama Anda.",
      data: {
        withdrawal: updatedWd,
        partner: updatedPartner,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
