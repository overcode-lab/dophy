import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@repo/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const affiliateId = searchParams.get("affiliate_id");

    if (!email && !affiliateId) {
      return NextResponse.json(
        { success: false, error: "Email atau Affiliate ID wajib disertakan" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Fetch affiliate profile
    let query = supabaseAdmin.from("affiliates").select("*");
    if (affiliateId) {
      query = query.eq("id", affiliateId);
    } else if (email) {
      query = query.eq("email", email);
    }

    const { data: affiliate, error: affiliateError } = await query.maybeSingle();

    if (affiliateError || !affiliate) {
      return NextResponse.json(
        { success: false, error: "Data Affiliator tidak ditemukan" },
        { status: 404 }
      );
    }

    // 2. Fetch sales count using referral_code
    const { count: totalSalesCount } = await supabaseAdmin
      .from("sales")
      .select("id", { count: "exact", head: true })
      .eq("referral_code", affiliate.referral_code);

    // 3. Fetch announcements
    const { data: announcements } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    // 4. Fetch recent commissions
    const { data: recentCommissions } = await supabaseAdmin
      .from("commissions")
      .select("*, sales(quantity, total_price, transaction_date)")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        affiliate,
        stats: {
          available_balance: Number(affiliate.available_balance || 0),
          held_balance: Number(affiliate.held_balance || 0),
          total_sales_count: totalSalesCount || 0,
          sales_target: affiliate.sales_target || 50,
          target_progress_percent: Math.min(
            100,
            Math.round(((totalSalesCount || 0) / (affiliate.sales_target || 50)) * 100)
          ),
        },
        announcements: announcements || [],
        recent_commissions: recentCommissions || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
