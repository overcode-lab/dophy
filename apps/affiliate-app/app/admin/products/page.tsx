"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Package, PlusCircle, Edit, Trash2, AlertCircle, Menu } from "lucide-react";
import { ResponsiveDetailModal, CustomConfirmModal, LoadingSpinner, Footer, SideMenu, SideMenuDesktop } from "@repo/ui";

// Theme mapping helper for colorful product cards
const getProductTheme = (name: string) => {
  const lowerName = (name || "").toLowerCase();
  if (lowerName.includes("chocolate") || lowerName.includes("cokelat") || lowerName.includes("coklat")) {
    return {
      cardBg:
        "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border-amber-200/80 hover:border-amber-300/90 shadow-amber-500/5",
      headerBadge: "bg-amber-500/15 text-amber-900 border-amber-300/60",
      iconBg: "bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25",
      priceText: "text-amber-950",
      tagline: "Varian Cokelat Premium",
    };
  } else if (lowerName.includes("coffee") || lowerName.includes("kopi")) {
    return {
      cardBg:
        "bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border-emerald-200/80 hover:border-emerald-300/90 shadow-emerald-500/5",
      headerBadge: "bg-emerald-500/15 text-emerald-900 border-emerald-300/60",
      iconBg: "bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25",
      priceText: "text-emerald-950",
      tagline: "Varian Kopi Spesial",
    };
  } else if (lowerName.includes("cheese") || lowerName.includes("keju")) {
    return {
      cardBg:
        "bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-orange-500/10 border-yellow-200/80 hover:border-yellow-300/90 shadow-yellow-500/5",
      headerBadge: "bg-yellow-500/15 text-yellow-900 border-yellow-300/60",
      iconBg: "bg-gradient-to-br from-yellow-500 to-amber-500 text-white shadow-md shadow-yellow-500/25",
      priceText: "text-yellow-950",
      tagline: "Varian Keju Gurih",
    };
  }
  return {
    cardBg:
      "bg-gradient-to-br from-orange-500/10 via-dophy-500/5 to-rose-500/10 border-orange-200/80 hover:border-orange-300/90 shadow-orange-500/5",
    headerBadge: "bg-orange-500/15 text-orange-900 border-orange-300/60",
    iconBg: "bg-gradient-to-br from-dophy-600 to-orange-600 text-white shadow-md shadow-orange-500/25",
    priceText: "text-orange-950",
    tagline: "Snack DOPHY Original",
  };
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Edit Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [nameInput, setNameInput] = useState("");
  const [weightInput, setWeightInput] = useState("65 gr");
  const [stockInput, setStockInput] = useState("100");
  const [priceInput, setPriceInput] = useState("15000");
  const [isUpdating, setIsUpdating] = useState(false);

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWeight, setNewWeight] = useState("65 gr");
  const [newPrice, setNewPrice] = useState("15000");
  const [newStock, setNewStock] = useState("100");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Delete Product Confirmation State
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    const storedRole = localStorage.getItem("dophy_role");

    if (!storedUser || storedRole !== "admin") {
      router.push("/admin/login");
      return;
    }

    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (p: any) => {
    setSelectedProduct(p);
    setNameInput(p.name);
    setWeightInput(p.weight || "65 gr");
    setStockInput(String(p.stock));
    setPriceInput(String(p.price));
  };

  const handleSaveProduct = async () => {
    if (!selectedProduct) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedProduct.id,
          name: nameInput,
          weight: weightInput,
          stock: Number(stockInput),
          price: Number(priceInput),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");

    if (!newName.trim()) {
      setAddError("Nama produk wajib diisi");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          weight: newWeight.trim(),
          price: Number(newPrice),
          stock: Number(newStock),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewName("");
        setNewWeight("65 gr");
        setNewPrice("15000");
        setNewStock("100");
        fetchProducts();
      } else {
        setAddError(data.error || "Gagal menambahkan produk.");
      }
    } catch (err) {
      setAddError("Terjadi kesalahan koneksi server.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/admin/products?id=${productToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setProductToDelete(null);
        if (selectedProduct?.id === productToDelete.id) {
          setSelectedProduct(null);
        }
        fetchProducts();
      } else {
        setDeleteError(data.error || "Gagal menghapus produk.");
      }
    } catch (err) {
      setDeleteError("Terjadi kesalahan koneksi server.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat katalog produk DOPHY..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/dashboard"
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 tracking-tight">Katalog Produk</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-dophy-700 font-extrabold text-[11px] border border-orange-200">
                {products.length} Produk
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden p-1.5 text-slate-700 hover:text-dophy-600 transition-colors flex items-center justify-center cursor-pointer"
            title="Buka Menu Navigasi Admin"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Container with Desktop Sticky SideMenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Desktop Sticky SideMenu */}
          <SideMenuDesktop />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 w-full space-y-5 text-left">
        {/* Section Header & Content Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Katalog Snack</span>
              <span>🍪</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Kelola katalog varian produk, penyesuaian harga eceran, dan pemantauan stok real-time.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => {
                setAddError("");
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-dophy-600 hover:bg-dophy-700 text-white font-black text-xs shadow-lg shadow-dophy-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* Line Separator */}
        <div className="py-0.5 flex items-center">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rounded-full shadow-xs shadow-orange-500/20" />
        </div>

        {/* Product Grid (Compact & Space Efficient) */}
        {products.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-dophy-600 flex items-center justify-center mx-auto">
              <Package className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-extrabold text-slate-800">Katalog Produk Kosong</p>
              <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                Belum ada produk snack yang ditambahkan ke dalam katalog.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-dophy-600 text-white font-extrabold text-xs shadow-md shadow-dophy-500/20 hover:bg-dophy-700 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Produk Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {products.map((p) => {
              const theme = getProductTheme(p.name);
              const isLowStock = p.stock < 20;

              return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.15 }}
                  className={`p-3.5 rounded-2xl border backdrop-blur-sm relative overflow-hidden transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between gap-2.5 group ${theme.cardBg}`}
                >
                  {/* Decorative Background Illustration Watermark */}
                  <Package className="absolute -right-2 -bottom-2 w-20 h-20 text-slate-900/5 stroke-[1.2] pointer-events-none group-hover:scale-105 transition-transform" />

                  {/* Top Bar: Name + Weight + Action Buttons */}
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <h3 className="font-black text-xs sm:text-sm text-slate-900 tracking-tight truncate">{p.name}</h3>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-lg border shrink-0 ${theme.headerBadge}`}
                      >
                        {p.weight}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-700 hover:text-dophy-700 border border-slate-200/90 shadow-2xs transition-all flex items-center gap-1 text-[11px] font-extrabold cursor-pointer active:scale-95"
                        title="Edit Produk"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setDeleteError("");
                          setProductToDelete(p);
                        }}
                        className="p-1 rounded-lg bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/90 shadow-2xs transition-all flex items-center justify-center cursor-pointer active:scale-95"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Bar: Price & Stock Status Badges */}
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs sm:text-sm font-black tracking-tight ${theme.priceText}`}>
                        Rp {Number(p.price).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div
                      className={`px-2 py-0.5 rounded-lg font-black text-[11px] flex items-center gap-1 border shrink-0 ${
                        isLowStock
                          ? "bg-rose-50/90 text-rose-700 border-rose-200/90"
                          : "bg-emerald-50/90 text-emerald-700 border-emerald-200/90"
                      }`}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            isLowStock ? "bg-rose-400" : "bg-emerald-400"
                          }`}
                        />
                        <span
                          className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                            isLowStock ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                        />
                      </span>
                      <span>{p.stock} Pcs</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  </div>

      {/* Reusable Footer */}
      <Footer variant="admin" />

      {/* Edit Product Modal */}
      <ResponsiveDetailModal
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        title="Edit Produk & Stok"
        subtitle={selectedProduct?.name}
      >
        <div className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Nama Produk</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Berat / Satuan</label>
              <input
                type="text"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Harga (Rp)</label>
              <input
                type="number"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Stok Tersedia (Pcs)</label>
            <input
              type="number"
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white outline-none"
            />
          </div>

          {/* Action Buttons: Simpan (Top Row), Hapus & Batal (Bottom Row) */}
          <div className="pt-3.5 space-y-2.5 border-t border-slate-100">
            {/* Row 1: Primary Simpan Button */}
            <button
              onClick={handleSaveProduct}
              disabled={isUpdating}
              className="w-full h-11 rounded-2xl bg-dophy-600 hover:bg-dophy-700 text-white font-black text-xs shadow-md shadow-dophy-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
            </button>

            {/* Row 2: Secondary Buttons (Hapus & Batal 1 Row) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setDeleteError("");
                  setProductToDelete(selectedProduct);
                }}
                disabled={isUpdating}
                className="w-full h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Hapus Produk"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Produk</span>
              </button>

              <button
                onClick={() => setSelectedProduct(null)}
                disabled={isUpdating}
                className="w-full h-10 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-extrabold text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </ResponsiveDetailModal>

      {/* Add Product Modal */}
      <ResponsiveDetailModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Produk Baru"
        subtitle="Tambahkan varian snack baru ke katalog DOPHY"
      >
        <form onSubmit={handleAddProduct} className="space-y-4 text-left">
          {addError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{addError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Nama Produk Varian</label>
            <input
              type="text"
              placeholder="Contoh: DOPHY Cheese Crunchy"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Berat / Satuan</label>
              <input
                type="text"
                placeholder="65 gr"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Harga Eceran (Rp)</label>
              <input
                type="number"
                placeholder="15000"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Stok Awal (Pcs)</label>
            <input
              type="number"
              placeholder="100"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:bg-white outline-none"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              disabled={isAdding}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="px-5 py-2 rounded-xl bg-dophy-600 hover:bg-dophy-700 text-white font-extrabold text-xs shadow-md shadow-dophy-500/20 cursor-pointer"
            >
              {isAdding ? "Menambahkan..." : "Tambah Produk"}
            </button>
          </div>
        </form>
      </ResponsiveDetailModal>

      {/* Delete Confirmation Modal */}
      <CustomConfirmModal
        isOpen={Boolean(productToDelete)}
        onClose={() => {
          setProductToDelete(null);
          setDeleteError("");
        }}
        onConfirm={handleDeleteProduct}
        isLoading={isDeleting}
        variant="danger"
        title="Hapus Produk?"
        description={
          deleteError
            ? deleteError
            : `Apakah Anda yakin ingin menghapus "${productToDelete?.name}" dari katalog? Tindakan ini tidak dapat dibatalkan.`
        }
        confirmText={isDeleting ? "Menghapus..." : "Ya, Hapus Produk"}
        cancelText="Batal"
      />

      {/* Admin Navigation SideMenu */}
      <SideMenu isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
