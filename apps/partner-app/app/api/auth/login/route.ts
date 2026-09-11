import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@repo/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    // 2. Fetch role profile from database
    if (role === "admin") {
      const { data: adminProfile } = await supabaseAdmin
        .from("admins")
        .select("*")
        .or(`user_id.eq.${userId},email.eq.${email}`)
        .maybeSingle();

      if (!adminProfile) {
        return NextResponse.json(
          { success: false, error: "Akun ini tidak memiliki hak akses sebagai Admin DOPHY." },
          { status: 403 }
        );
      }

      // Link user_id if not linked yet
      if (!adminProfile.user_id) {
        await supabaseAdmin.from("admins").update({ user_id: userId }).eq("id", adminProfile.id);
      }

      return NextResponse.json({
        success: true,
        role: "admin",
        user: { ...adminProfile, user_id: userId },
        session: authData.session,
      });
    } else {
      // Default to Partner login
      const { data: partnerProfile } = await supabaseAdmin
        .from("partners")
        .select("*")
        .or(`user_id.eq.${userId},email.eq.${email}`)
        .maybeSingle();

      if (!partnerProfile) {
        return NextResponse.json(
          { success: false, error: "Akun ini belum terdaftar sebagai Creator Partner DOPHY." },
          { status: 403 }
        );
      }

      if (partnerProfile.status === "inactive") {
        return NextResponse.json(
          { success: false, error: "Akun Creator Partner Anda sedang dinonaktifkan oleh Admin." },
          { status: 403 }
        );
      }

      // Link user_id if not linked yet
      if (!partnerProfile.user_id) {
        await supabaseAdmin.from("partners").update({ user_id: userId }).eq("id", partnerProfile.id);
      }

      return NextResponse.json({
        success: true,
        role: "partner",
        user: { ...partnerProfile, user_id: userId },
        session: authData.session,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
