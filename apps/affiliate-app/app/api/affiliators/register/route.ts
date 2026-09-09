import { NextResponse } from "next/server";
import { AffiliateRegisterSchema, getSupabaseAdminClient } from "@repo/db";
import { generateReferralCode } from "@/lib/referral";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate payload with Zod
    const validationResult = AffiliateRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi data gagal",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { full_name, email, phone_number, password, bank_account_number, bank_name } = validationResult.data;

    const supabaseAdmin = getSupabaseAdminClient();

    // 2. Check if affiliate email already exists in public.affiliates
    const { data: existingAffiliate } = await supabaseAdmin
      .from("affiliates")
      .select("id, email, referral_code")
      .eq("email", email)
      .maybeSingle();

    if (existingAffiliate) {
      return NextResponse.json(
        {
          success: false,
          error: "Email sudah terdaftar sebagai Affiliator. Silakan login.",
        },
        { status: 409 }
      );
    }

    // 3. Create user in Supabase Auth (or signup)
    let authUserId: string | null = null;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: "affiliate",
      },
    });

    if (authError) {
      // If user already exists in auth.users, try to get existing user ID
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const existingAuthUser = userList?.users?.find((u) => u.email === email);
      if (existingAuthUser) {
        authUserId = existingAuthUser.id;
      } else {
        return NextResponse.json(
          {
            success: false,
            error: `Gagal membuat akun auth: ${authError.message}`,
          },
          { status: 500 }
        );
      }
    } else {
      authUserId = authData.user.id;
    }

    // 4. Generate unique referral code
    let referralCode = generateReferralCode(full_name);
    let attempts = 0;

    while (attempts < 5) {
      const { data: codeCheck } = await supabaseAdmin
        .from("affiliates")
        .select("id")
        .eq("referral_code", referralCode)
        .maybeSingle();

      if (!codeCheck) break;
      referralCode = generateReferralCode(full_name);
      attempts++;
    }

    // 5. Insert into public.affiliates table
    const { data: newAffiliate, error: insertError } = await supabaseAdmin
      .from("affiliates")
      .insert({
        user_id: authUserId,
        full_name,
        email,
        phone_number,
        referral_code: referralCode,
        bank_account_number,
        bank_name,
        status: "active",
        available_balance: 0,
        held_balance: 0,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          error: `Gagal menyimpan data affiliator: ${insertError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran Affiliator berhasil!",
        data: newAffiliate,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Terjadi kesalahan server internal",
      },
      { status: 500 }
    );
  }
}
