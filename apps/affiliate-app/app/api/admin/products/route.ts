import { NextResponse } from "next/server";
import { getSupabaseAdminClient, ProductSchema } from "@repo/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdminClient();

    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("name");

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

    // Check if product has sales transactions before deleting
    const { data: salesRef } = await supabaseAdmin
      .from("sales")
      .select("id")
      .eq("product_id", id)
      .limit(1);

    if (salesRef && salesRef.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Produk tidak dapat dihapus karena sudah tercatat dalam riwayat transaksi penjualan.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
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
