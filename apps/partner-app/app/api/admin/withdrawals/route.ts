import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@repo/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const supabaseAdmin = getSupabaseAdminClient();

    let query = supabaseAdmin
      .from("withdrawals")
      .select("*, partner:partners(id, full_name, email, referral_code, bank_name, bank_account_number)")
      .order("requested_at", { ascending: false });

    if (status && status !== "all") {
      if (status === "cancelled") {
        query = query.or("status.eq.cancelled,and(status.eq.rejected,rejection_reason.ilike.%batal%)");
      } else if (status === "rejected") {
        query = query.eq("status", "rejected").not("rejection_reason", "ilike", "%batal%");
      } else {
        query = query.eq("status", status);
      }
    }

    const { data: withdrawals, error } = await query;

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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { withdrawal_id, action, proof_url, proof_public_id, rejection_reason, admin_id } = body;

    if (!withdrawal_id || !action) {
      return NextResponse.json(
        { success: false, error: "Withdrawal ID dan action wajib diisi" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Fetch withdrawal request
    const { data: withdrawal, error: wdError } = await supabaseAdmin
      .from("withdrawals")
      .select("*, partner:partners(id, available_balance, held_balance)")
      .eq("id", withdrawal_id)
      .single();

    if (wdError || !withdrawal) {
      return NextResponse.json(
        { success: false, error: "Data pengajuan penarikan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (withdrawal.status === "completed" || withdrawal.status === "rejected") {
      return NextResponse.json(
        { success: false, error: "Pengajuan ini sudah selesai diproses sebelumnya." },
        { status: 400 }
      );
    }

    const partner = withdrawal.partner;
    const amount = Number(withdrawal.amount);

    if (action === "approve") {
      if (!proof_url) {
        return NextResponse.json(
          { success: false, error: "Bukti transfer (gambar struk) wajib diunggah." },
          { status: 400 }
        );
      }

      // Update withdrawal record
      const { data: updatedWd, error: updateWdError } = await supabaseAdmin
        .from("withdrawals")
        .update({
          status: "completed",
          proof_url,
          proof_public_id: proof_public_id || null,
          completed_at: new Date().toISOString(),
          processed_by_admin_id: admin_id || null,
        })
        .eq("id", withdrawal_id)
        .select()
        .single();

      if (updateWdError) {
        return NextResponse.json(
          { success: false, error: `Gagal menyetujui penarikan: ${updateWdError.message}` },
          { status: 500 }
        );
      }

      // Clear held balance for partner
      if (partner) {
        const newHeld = Math.max(0, Number(partner.held_balance || 0) - amount);
        await supabaseAdmin
          .from("partners")
          .update({ held_balance: newHeld })
          .eq("id", partner.id);
      }

      return NextResponse.json({
        success: true,
        message: "Penarikan dana berhasil disetujui & bukti transfer tersimpan!",
        data: updatedWd,
      });
    } else if (action === "reject") {
      if (!rejection_reason) {
        return NextResponse.json(
          { success: false, error: "Alasan penolakan wajib diisi." },
          { status: 400 }
        );
      }

      // Update withdrawal record to rejected
      const { data: updatedWd, error: updateWdError } = await supabaseAdmin
        .from("withdrawals")
        .update({
          status: "rejected",
          rejection_reason,
          processed_by_admin_id: admin_id || null,
        })
        .eq("id", withdrawal_id)
        .select()
        .single();

      if (updateWdError) {
        return NextResponse.json(
          { success: false, error: `Gagal menolak penarikan: ${updateWdError.message}` },
          { status: 500 }
        );
      }

      // ROLLBACK: Return held balance back to available balance
      if (partner) {
        const newHeld = Math.max(0, Number(partner.held_balance || 0) - amount);
        const newAvailable = Number(partner.available_balance || 0) + amount;

        await supabaseAdmin
          .from("partners")
          .update({
            available_balance: newAvailable,
            held_balance: newHeld,
          })
          .eq("id", partner.id);
      }

      return NextResponse.json({
        success: true,
        message: "Pengajuan penarikan ditolak. Saldo berhasil dikembalikan ke saldo aktif Creator Partner.",
        data: updatedWd,
      });
    }

    return NextResponse.json(
      { success: false, error: "Aksi tidak dikenal (Gunakan 'approve' atau 'reject')" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
