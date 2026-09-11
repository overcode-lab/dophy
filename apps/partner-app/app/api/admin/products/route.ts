import { NextResponse } from "next/server";
import { getSupabaseAdminClient, ProductSchema } from "@repo/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();

    // Select active products (where is_active is true or null)
    let { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .neq("is_active", false)
      .order("name");

    // Fallback if is_active column does not exist yet in DB
    if (error && (error.code === "42703" || error.message?.includes("is_active"))) {
      const fallback = await supabaseAdmin
        .from("products")
        .select("*")
        .order("name");
      products = fallback.data;
      error = fallback.error;
    }

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: products || [],
    });
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

    const validationResult = ProductSchema.safeParse({
      ...body,
      price: Number(body.price),
      stock: Number(body.stock),
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi data produk gagal",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const { data: newProduct, error } = await supabaseAdmin
      .from("products")
      .insert(validationResult.data)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil ditambahkan!",
        data: newProduct,
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

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, price, stock, weight } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID wajib diisi" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name;
    if (weight) updateData.weight = weight;
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);

    const { data: updated, error } = await supabaseAdmin
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data produk & stok berhasil diperbarui!",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID wajib disertakan" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Try soft delete first (setting is_active = false)
    const { data: softDeleted, error: softDeleteError } = await supabaseAdmin
      .from("products")
      .update({ is_active: false })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (!softDeleteError && softDeleted) {
      return NextResponse.json({
        success: true,
        message: "Produk berhasil dihapus dari katalog aktif!",
      });
    }

    // 2. Fallback if is_active column is not yet present in DB:
    // Check if product has sales transactions
    const { data: salesRef } = await supabaseAdmin
      .from("sales")
      .select("id")
      .eq("product_id", id)
      .limit(1);

    if (salesRef && salesRef.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Jalankan migrasi SQL 'is_active' pada database Supabase agar produk dapat dinonaktifkan tanpa menghapus riwayat transaksi.",
        },
        { status: 400 }
      );
    }

    // If product has no sales history, safe to hard delete
    const { error: hardDeleteError } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (hardDeleteError) {
      return NextResponse.json(
        { success: false, error: hardDeleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  }
}
