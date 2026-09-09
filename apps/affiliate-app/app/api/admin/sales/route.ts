import { NextResponse } from "next/server";
import { getSupabaseAdminClient, SaleInputSchema } from "@repo/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "8", 10));
    const search = searchParams.get("search") || "";
    const product = searchParams.get("product") || "all";
    const referral = searchParams.get("referral") || "all";
    const dateType = searchParams.get("dateType") || "all";
    const specificDate = searchParams.get("specificDate");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Fetch products
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, name, price, stock, weight")
      .order("name");

    // 2. Fetch active affiliates for autocomplete dropdown
    const { data: affiliates } = await supabaseAdmin
      .from("affiliates")
      .select("id, full_name, email, referral_code")
      .eq("status", "active")
      .order("full_name");

    // 3. Build query for paginated sales
    let query = supabaseAdmin
      .from("sales")
      .select(
        "*, products(name, weight, price), affiliates:affiliates!sales_affiliate_id_fkey(full_name, referral_code, email)",
        { count: "exact" }
      );

    // Apply product filter
    if (product !== "all") {
      const matchedProd = products?.find((p) => p.name === product || p.id === product);
      if (matchedProd) {
        query = query.eq("product_id", matchedProd.id);
      }
    }

    // Apply referral filter
    if (referral !== "all") {
      if (referral === "none") {
        query = query.or("referral_code.is.null,referral_code.eq.,referral_code.eq.Tanpa Referral");
      } else {
        query = query.eq("referral_code", referral);
      }
    }

    // Apply date filters
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    if (dateType === "today") {
      const start = new Date(todayYear, todayMonth, todayDate, 0, 0, 0, 0).toISOString();
      const end = new Date(todayYear, todayMonth, todayDate, 23, 59, 59, 999).toISOString();
      query = query.gte("transaction_date", start).lte("transaction_date", end);
    } else if (dateType === "yesterday") {
      const start = new Date(todayYear, todayMonth, todayDate - 1, 0, 0, 0, 0).toISOString();
      const end = new Date(todayYear, todayMonth, todayDate - 1, 23, 59, 59, 999).toISOString();
      query = query.gte("transaction_date", start).lte("transaction_date", end);
    } else if (dateType === "3days") {
      const start = new Date(todayYear, todayMonth, todayDate - 2, 0, 0, 0, 0).toISOString();
      const end = new Date(todayYear, todayMonth, todayDate, 23, 59, 59, 999).toISOString();
      query = query.gte("transaction_date", start).lte("transaction_date", end);
    } else if (dateType === "7days") {
      const start = new Date(todayYear, todayMonth, todayDate - 6, 0, 0, 0, 0).toISOString();
      const end = new Date(todayYear, todayMonth, todayDate, 23, 59, 59, 999).toISOString();
      query = query.gte("transaction_date", start).lte("transaction_date", end);
    } else if (dateType === "14days") {
      const start = new Date(todayYear, todayMonth, todayDate - 13, 0, 0, 0, 0).toISOString();
      const end = new Date(todayYear, todayMonth, todayDate, 23, 59, 59, 999).toISOString();
      query = query.gte("transaction_date", start).lte("transaction_date", end);
    } else if (dateType === "30days") {
      const start = new Date(todayYear, todayMonth, todayDate - 29, 0, 0, 0, 0).toISOString();
      const end = new Date(todayYear, todayMonth, todayDate, 23, 59, 59, 999).toISOString();
      query = query.gte("transaction_date", start).lte("transaction_date", end);
    } else if (dateType === "specific" && specificDate) {
      const parts = specificDate.split("-").map(Number);
      if (parts.length === 3) {
        const start = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0).toISOString();
        const end = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999).toISOString();
        query = query.gte("transaction_date", start).lte("transaction_date", end);
      }
    } else if (dateType === "range") {
      if (startDate) {
        const parts = startDate.split("-").map(Number);
        if (parts.length === 3) {
          const start = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0).toISOString();
          query = query.gte("transaction_date", start);
        }
      }
      if (endDate) {
        const parts = endDate.split("-").map(Number);
        if (parts.length === 3) {
          const end = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999).toISOString();
          query = query.lte("transaction_date", end);
        }
      }
    }

    if (search.trim()) {
      const searchTerm = search.trim();

      // Find matching products
      const { data: matchedProducts } = await supabaseAdmin
        .from("products")
        .select("id")
        .ilike("name", `%${searchTerm}%`);

      const productIds = matchedProducts?.map((p) => p.id) || [];

      // Find matching affiliates
      const { data: matchedAffiliates } = await supabaseAdmin
        .from("affiliates")
        .select("id")
        .or(
          `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,referral_code.ilike.%${searchTerm}%`
        );

      const affiliateIds = matchedAffiliates?.map((a) => a.id) || [];

      // Combine search conditions across sales table & relations
      const orConditions: string[] = [
        `referral_code.ilike.%${searchTerm}%`,
        `id.ilike.%${searchTerm}%`,
      ];

      if (productIds.length > 0) {
        orConditions.push(`product_id.in.(${productIds.join(",")})`);
      }
      if (affiliateIds.length > 0) {
        orConditions.push(`affiliate_id.in.(${affiliateIds.join(",")})`);
      }

      query = query.or(orConditions.join(","));
    }

    // Pagination bounds (8 items per page)
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: sales, count, error: salesError } = await query
      .order("transaction_date", { ascending: false })
      .range(from, to);

    if (salesError) {
      console.error("Error fetching sales history:", salesError);
    }

    // Overall summary metrics across all sales
    const { data: allSalesMetrics } = await supabaseAdmin
      .from("sales")
      .select("total_price, quantity, commission_amount");

    const totalOmset =
      allSalesMetrics?.reduce((sum, s) => sum + Number(s.total_price || 0), 0) || 0;
    const totalPcs =
      allSalesMetrics?.reduce((sum, s) => sum + Number(s.quantity || 0), 0) || 0;
    const totalKomisi =
      allSalesMetrics?.reduce((sum, s) => sum + Number(s.commission_amount || 0), 0) || 0;

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return NextResponse.json(
      {
        success: true,
        data: {
          products: products || [],
          affiliates: affiliates || [],
          sales: sales || [],
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages,
            hasMore,
          },
          summary: {
            totalOmset,
            totalPcs,
            totalKomisi,
          },
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, quantity, referral_code, recorded_by_admin_id } = body;

    const validationResult = SaleInputSchema.safeParse({
      product_id,
      quantity: Number(quantity),
      referral_code,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi data penjualan gagal",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Fetch Product
    const { data: product, error: prodError } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", product_id)
      .single();

    if (prodError || !product) {
      return NextResponse.json({ success: false, error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const reqQty = Number(quantity);

    if (product.stock < reqQty) {
      return NextResponse.json(
        { success: false, error: `Stok produk tidak mencukupi (Stok tersedia: ${product.stock})` },
        { status: 400 },
      );
    }

    // 2. Calculate prices and commission server-side
    const totalPrice = Number(product.price) * reqQty;
    let affiliateId: string | null = null;
    let commissionAmount = 0;

    // Fixed commission: Rp 2.000 per pcs snack (dapat disesuaikan)
    const COMMISSION_PER_PCS = 2000;

    if (referral_code && referral_code.trim()) {
      const cleanRefCode = referral_code.trim();
      const { data: affiliate } = await supabaseAdmin
        .from("affiliates")
        .select("id, available_balance, referral_code, status")
        .eq("referral_code", cleanRefCode)
        .maybeSingle();

      if (!affiliate) {
        return NextResponse.json({ success: false, error: "Kode Referral tidak terdaftar" }, { status: 400 });
      }

      if (affiliate.status !== "active") {
        return NextResponse.json({ success: false, error: "Mitra Affiliate sedang nonaktif" }, { status: 400 });
      }

      affiliateId = affiliate.id;
      commissionAmount = reqQty * COMMISSION_PER_PCS;
    }

    // 3. Deduct product stock
    const newStock = product.stock - reqQty;
    await supabaseAdmin.from("products").update({ stock: newStock }).eq("id", product_id);

    // 4. Insert into sales
    const { data: sale, error: saleError } = await supabaseAdmin
      .from("sales")
      .insert({
        product_id,
        quantity: reqQty,
        total_price: totalPrice,
        referral_code: referral_code ? referral_code.trim() : null,
        affiliate_id: affiliateId,
        commission_amount: commissionAmount,
        recorded_by_admin_id: recorded_by_admin_id || null,
      })
      .select()
      .single();

    if (saleError) {
      if (
        saleError.message?.includes("sales_referral_code_fkey") ||
        saleError.message?.includes("sales_affiliate_id_fkey") ||
        saleError.message?.includes("foreign key")
      ) {
        return NextResponse.json({ success: false, error: "Kode Referral tidak terdaftar" }, { status: 400 });
      }

      return NextResponse.json(
        { success: false, error: `Gagal mencatat transaksi: ${saleError.message}` },
        { status: 500 },
      );
    }

    // 5. If affiliate is valid, insert into commissions & update available_balance
    if (affiliateId && commissionAmount > 0) {
      // Insert commission ledger
      await supabaseAdmin.from("commissions").insert({
        affiliate_id: affiliateId,
        sale_id: sale.id,
        amount: commissionAmount,
        status: "calculated",
      });

      // Update affiliate available balance
      const { data: affData } = await supabaseAdmin
        .from("affiliates")
        .select("available_balance")
        .eq("id", affiliateId)
        .single();

      if (affData) {
        const currentBalance = Number(affData.available_balance || 0);
        await supabaseAdmin
          .from("affiliates")
          .update({ available_balance: currentBalance + commissionAmount })
          .eq("id", affiliateId);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Penjualan berhasil dicatat & komisi dihitung otomatis!",
        data: sale,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 },
    );
  }
}
