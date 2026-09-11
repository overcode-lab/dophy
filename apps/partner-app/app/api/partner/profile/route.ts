import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@repo/db";
import { validateCreatorCode } from "@/lib/referral";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/partner/profile?partner_id=...
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partner_id");

    if (!partnerId) {
      return NextResponse.json(
        { success: false, error: "Partner ID wajib disertakan" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const { data: partner, error } = await supabaseAdmin
      .from("partners")
      .select("id, user_id, full_name, email, phone_number, referral_code, bank_name, bank_account_number, sales_target, status, available_balance, held_balance, created_at, updated_at")
      .eq("id", partnerId)
      .maybeSingle();

    if (error || !partner) {
      return NextResponse.json(
        { success: false, error: "Data partner tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: partner,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/partner/profile
 * Body:
 * - partner_id: string (required)
 * - full_name?: string
 * - phone_number?: string
 * - referral_code?: string
 * - bank_name?: string
 * - bank_account_number?: string
 * - sales_target?: number
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      partner_id,
      full_name,
      phone_number,
      referral_code,
      bank_name,
      bank_account_number,
      sales_target,
    } = body;

    if (!partner_id) {
      return NextResponse.json(
        { success: false, error: "Partner ID wajib diisi" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Verify partner exists
    const { data: currentPartner, error: fetchError } = await supabaseAdmin
      .from("partners")
      .select("id, referral_code")
      .eq("id", partner_id)
      .maybeSingle();

    if (fetchError || !currentPartner) {
      return NextResponse.json(
        { success: false, error: "Partner tidak ditemukan" },
        { status: 404 }
      );
    }

    const updatePayload: Record<string, any> = {};

    // Validate full_name
    if (full_name !== undefined) {
      if (!full_name || full_name.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: "Nama lengkap minimal 2 karakter" },
          { status: 400 }
        );
      }
      if (full_name.trim().length > 50) {
        return NextResponse.json(
          { success: false, error: "Nama lengkap maksimal 50 karakter" },
          { status: 400 }
        );
      }
      updatePayload.full_name = full_name.trim();
    }

    // Validate phone_number
    if (phone_number !== undefined) {
      const cleanPhone = phone_number.replace(/\D/g, "");
      if (cleanPhone.length < 9) {
        return NextResponse.json(
          { success: false, error: "Nomor WhatsApp minimal 9 digit" },
          { status: 400 }
        );
      }
      updatePayload.phone_number = phone_number.trim();
    }

    // Validate bank details
    if (bank_name !== undefined) {
      if (!bank_name || bank_name.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: "Nama Bank / E-Wallet wajib diisi" },
          { status: 400 }
        );
      }
      updatePayload.bank_name = bank_name.trim();
    }

    if (bank_account_number !== undefined) {
      if (!bank_account_number || bank_account_number.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: "Nomor rekening / nomor HP e-wallet wajib diisi" },
          { status: 400 }
        );
      }
      updatePayload.bank_account_number = bank_account_number.trim();
    }

    // Validate sales_target
    if (sales_target !== undefined) {
      const targetNum = Number(sales_target);
      if (isNaN(targetNum) || targetNum < 1) {
        return NextResponse.json(
          { success: false, error: "Target penjualan minimal 1 pcs" },
          { status: 400 }
        );
      }
      updatePayload.sales_target = Math.round(targetNum);
    }

    // Validate referral_code if changed
    if (referral_code !== undefined && referral_code !== currentPartner.referral_code) {
      const validation = validateCreatorCode(referral_code);
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }

      // Check uniqueness against other partners
      const { data: existing, error: checkError } = await supabaseAdmin
        .from("partners")
        .select("id")
        .ilike("referral_code", validation.fullCode)
        .neq("id", partner_id)
        .maybeSingle();

      if (checkError) {
        return NextResponse.json(
          { success: false, error: `Gagal memeriksa Creator Code: ${checkError.message}` },
          { status: 500 }
        );
      }

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: `Creator Code '${validation.fullCode}' sudah digunakan oleh partner lain.`,
          },
          { status: 409 }
        );
      }

      updatePayload.referral_code = validation.fullCode;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada data yang diubah" },
        { status: 400 }
      );
    }

    // 2. Perform update
    const { data: updatedPartner, error: updateError } = await supabaseAdmin
      .from("partners")
      .update(updatePayload)
      .eq("id", partner_id)
      .select("id, user_id, full_name, email, phone_number, referral_code, bank_name, bank_account_number, sales_target, status, available_balance, held_balance, created_at, updated_at")
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: `Gagal memperbarui profil: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profil Creator Partner berhasil diperbarui! 🎉",
      data: updatedPartner,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
