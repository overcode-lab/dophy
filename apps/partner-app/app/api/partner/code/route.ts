import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@repo/db";
import { CREATOR_CODE_PREFIX, validateCreatorCode } from "@/lib/referral";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET: Check if a Creator Code is available
 * Query params:
 * - code: string (e.g. DARI-REINA)
 * - partner_id: string (current partner ID to exclude from uniqueness check)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const partnerId = searchParams.get("partner_id");

    if (!code) {
      return NextResponse.json(
        { success: false, available: false, error: "Parameter 'code' wajib disertakan" },
        { status: 400 }
      );
    }

    const validation = validateCreatorCode(code);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, available: false, error: validation.error },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Query partners table for matching referral_code
    let query = supabaseAdmin
      .from("partners")
      .select("id, referral_code")
      .ilike("referral_code", validation.fullCode);

    if (partnerId) {
      query = query.neq("id", partnerId);
    }

    const { data: existing, error } = await query.maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, available: false, error: error.message },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({
        success: true,
        available: false,
        fullCode: validation.fullCode,
        message: `Creator Code '${validation.fullCode}' sudah digunakan oleh partner lain.`,
      });
    }

    return NextResponse.json({
      success: true,
      available: true,
      fullCode: validation.fullCode,
      message: `Creator Code '${validation.fullCode}' tersedia!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, available: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update Creator Code for a Partner
 * Body:
 * - partner_id: string
 * - code: string (e.g. DARI-REINA or REINA)
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { partner_id, code } = body;

    if (!partner_id) {
      return NextResponse.json(
        { success: false, error: "Partner ID wajib diisi" },
        { status: 400 }
      );
    }

    // If user passed just the suffix or full code, format it
    let codeToValidate = code;
    if (typeof code === "string" && !code.toUpperCase().startsWith(CREATOR_CODE_PREFIX)) {
      codeToValidate = `${CREATOR_CODE_PREFIX}${code}`;
    }

    const validation = validateCreatorCode(codeToValidate);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Check uniqueness again before writing
    const { data: existing, error: checkError } = await supabaseAdmin
      .from("partners")
      .select("id")
      .ilike("referral_code", validation.fullCode)
      .neq("id", partner_id)
      .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        { success: false, error: `Gagal memeriksa kode: ${checkError.message}` },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Creator Code '${validation.fullCode}' sudah digunakan oleh partner lain. Silakan pilih kode lain.`,
        },
        { status: 409 }
      );
    }

    // 2. Update referral_code in partners table
    const { data: updatedPartner, error: updateError } = await supabaseAdmin
      .from("partners")
      .update({
        referral_code: validation.fullCode,
      })
      .eq("id", partner_id)
      .select("id, full_name, email, referral_code, status, available_balance, held_balance")
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: `Gagal memperbarui Creator Code: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Creator Code berhasil diubah menjadi ${validation.fullCode}! 🚀`,
      data: updatedPartner,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
