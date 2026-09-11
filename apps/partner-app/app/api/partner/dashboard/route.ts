import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@repo/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const partnerId = searchParams.get("partner_id");

    if (!email && !partnerId) {
      return NextResponse.json(
        { success: false, error: "Email atau Partner ID wajib disertakan" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Fetch partner profile
    let query = supabaseAdmin.from("partners").select("*");
    if (partnerId) {
      query = query.eq("id", partnerId);
    } else if (email) {
      query = query.eq("email", email);
    }

    const { data: partner, error: partnerError } = await query.maybeSingle();

    if (partnerError || !partner) {
      return NextResponse.json(
        { success: false, error: "Data Creator Partner tidak ditemukan" },
        { status: 404 }
      );
    }

    // 2. Fetch sales quantity & count using referral_code or partner_id
    let salesQuery = supabaseAdmin
      .from("sales")
      .select("quantity");

    if (partner.referral_code) {
      salesQuery = salesQuery.or(`referral_code.eq.${partner.referral_code},partner_id.eq.${partner.id}`);
    } else {
      salesQuery = salesQuery.eq("partner_id", partner.id);
    }

    const { data: salesList } = await salesQuery;

    const totalPcsSold = (salesList || []).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const totalTransactions = (salesList || []).length;
    const target = Number(partner.sales_target) > 0 ? Number(partner.sales_target) : 50;
    const progressPercent = Math.min(100, Math.round((totalPcsSold / target) * 100));
    const remainingToTarget = Math.max(0, target - totalPcsSold);

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
      .eq("partner_id", partner.id)
      .order("created_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        partner: partner,
        stats: {
          available_balance: Number(partner.available_balance || 0),
          held_balance: Number(partner.held_balance || 0),
          total_sales_count: totalPcsSold,
          total_transactions: totalTransactions,
          sales_target: target,
          target_progress_percent: progressPercent,
          remaining_to_target: remainingToTarget,
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
