"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PlusCircle,
  Search,
  AlertCircle,
  ShoppingBag,
  CheckCircle,
  ChevronDown,
  Check,
  Package,
  Coins,
  Receipt,
  Menu,
  UserCheck,
  Users,
  X,
  Wallet,
  Clock,
} from "lucide-react";
import { CustomConfirmModal, ResponsiveDetailModal, LoadingSpinner, Footer, SideMenu, SideMenuDesktop } from "@repo/ui";
import { SalesReceiptModal, SalesReceiptData } from "../components/SalesReceiptModal";

export default function AdminNewSalePage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  // Creator Modal State & Search
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [showNoReferralModal, setShowNoReferralModal] = useState(false);
  const [createdReceipt, setCreatedReceipt] = useState<SalesReceiptData | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    const storedRole = localStorage.getItem("dophy_role");

    if (!storedUser || storedRole !== "admin") {
      router.push("/admin/login");
      return;
    }

    setAdminUser(JSON.parse(storedUser));
    fetchInitialData();
  }, [router]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/sales?t=${Date.now()}`, {
        cache: "no-store",
      });
      const result = await res.json();
      if (result.success) {
        setProducts(result.data.products || []);
        setPartners(result.data.partners || []);
        if (result.data.products?.length > 0) {
          setSelectedProductId(result.data.products[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const reqQty = Math.max(1, Number(quantity) || 1);
  const totalPrice = (selectedProduct ? Number(selectedProduct.price) : 0) * reqQty;
  const commissionPreview = selectedPartner || referralCodeInput ? reqQty * 2000 : 0;

  // Filter partners for modal list
  const filteredPartners = partners.filter((a) => {
    const query = partnerSearch.toLowerCase().trim();
    if (!query) return true;
    return (
      a.referral_code?.toLowerCase().includes(query) ||
      a.full_name?.toLowerCase().includes(query) ||
      a.email?.toLowerCase().includes(query)
    );
  });

  const handleSelectPartner = (partner: any) => {
    setSelectedPartner(partner);
    setReferralCodeInput(partner.referral_code);
    setIsPartnerModalOpen(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedProductId) {
      newErrors.productId = "Pilih produk terlebih dahulu";
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      newErrors.quantity = "Jumlah pcs minimal 1";
    } else if (selectedProduct && Number(quantity) > selectedProduct.stock) {
      newErrors.quantity = `Stok tidak mencukupi (Stok tersedia: ${selectedProduct.stock})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) return;

    // Check if referral code is empty, show confirmation alert first
    if (!referralCodeInput || !referralCodeInput.trim()) {
      setShowNoReferralModal(true);
      return;
    }

    executeSubmit();
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    setGeneralError("");

    try {
      const res = await fetch("/api/admin/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProductId,
          quantity: Number(quantity),
          referral_code: referralCodeInput ? referralCodeInput.trim() : null,
          recorded_by_admin_id: adminUser?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        let errMessage = data.error || "Gagal mencatat penjualan.";
        if (
          errMessage.includes("sales_referral_code_fkey") ||
          errMessage.includes("sales_partner_id_fkey") ||
          errMessage.includes("foreign key")
        ) {
          errMessage = "Creator Code tidak terdaftar";
        }
        setGeneralError(errMessage);
        setIsSubmitting(false);
        return;
      }

      const saleData = data.data;
      setCreatedReceipt({
        id: saleData?.id || `TRX-${Date.now()}`,
        transaction_date: saleData?.transaction_date || new Date().toISOString(),
        product_name: selectedProduct?.name || "DOPHY Snack",
        product_price: selectedProduct ? Number(selectedProduct.price) : 0,
        product_weight: selectedProduct?.weight,
        quantity: Number(quantity),
        total_price: totalPrice,
        referral_code: referralCodeInput ? referralCodeInput.trim() : null,
        partner_name: selectedPartner?.full_name || null,
        admin_name: adminUser?.full_name || "Admin DOPHY",
      });
    } catch (err: any) {
      setGeneralError("Terjadi kesalahan koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewTransaction = () => {
    setCreatedReceipt(null);
    setQuantity("1");
    setReferralCodeInput("");
    setSelectedPartner(null);
    fetchInitialData();
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Menyiapkan form penjualan..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/sales"
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
              title="Kembali ke Transaksi Penjualan"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-base font-black text-slate-900 tracking-tight">Buat Transaksi Baru</h1>
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

          {/* Main Form Container */}
          <main className="flex-1 min-w-0 w-full max-w-2xl mx-auto lg:mx-0 space-y-6 text-left">
            <div className="px-1 space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <PlusCircle className="w-6 h-6 text-dophy-600 shrink-0" />
                <span>Form Transaksi Penjualan</span>
              </h2>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Masukkan detail produk & Creator Code yang digunakan konsumen saat membeli.
              </p>
            </div>

            {generalError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Row 1: Custom Product Select Trigger */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Pilih Produk Snack</label>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(true)}
                  className="w-full p-3.5 rounded-2xl border border-slate-200/90 text-sm font-bold bg-white hover:border-dophy-400 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100 outline-none shadow-2xs cursor-pointer flex items-center justify-between text-left transition-all group relative overflow-hidden"
                >
                  {/* Background Illustration Watermark Icon */}
                  <Package className="absolute -right-2 -bottom-2 w-16 h-16 text-dophy-500/10 stroke-[1.2] pointer-events-none group-hover:scale-110 group-hover:text-dophy-500/15 transition-all" />

                  <div className="relative z-10 space-y-1.5 min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-900 text-sm tracking-tight">
                        {selectedProduct?.name || "Pilih Produk Snack"}
                      </span>
                      {selectedProduct && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-50 text-dophy-700 border border-orange-200/80">
                          {selectedProduct.weight}
                        </span>
                      )}
                    </div>

                    {selectedProduct && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Price Chip */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80">
                          <span className="text-[9px] font-bold text-amber-600">Rp</span>
                          {Number(selectedProduct.price).toLocaleString("id-ID")}
                        </span>

                        {/* Stock Chip */}
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${
                            selectedProduct.stock < 20
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              selectedProduct.stock < 20 ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                          />
                          <span>Stok: {selectedProduct.stock} Pcs</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <ChevronDown className="relative z-10 w-4 h-4 text-slate-400 group-hover:text-dophy-600 transition-colors shrink-0 ml-2" />
                </button>
                {errors.productId && <p className="text-[11px] font-semibold text-rose-500">{errors.productId}</p>}
              </div>

              {/* Row 2: Jumlah Pcs + Creator Code Modal Trigger (1 Single Row) */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* Quantity Input (1 Col) */}
                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Jumlah Pcs</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-sm font-bold bg-white outline-none shadow-2xs ${
                      errors.quantity
                        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                        : "border-slate-200/90 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100"
                    }`}
                  />
                  {errors.quantity && <p className="text-[11px] font-semibold text-rose-500">{errors.quantity}</p>}
                </div>

                {/* Creator Code Trigger Button (2 Cols) */}
                <div className="col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block truncate">
                      Creator Code <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    {selectedPartner && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPartner(null);
                          setReferralCodeInput("");
                        }}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPartnerModalOpen(true)}
                    className={`w-full px-3.5 py-2.5 rounded-2xl border text-sm font-bold bg-white text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs group ${
                      selectedPartner
                        ? "border-emerald-300 bg-gradient-to-r from-emerald-50/50 via-white to-teal-50/40 ring-1 ring-emerald-400/20"
                        : "border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 text-slate-400"
                    }`}
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      {selectedPartner ? (
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-black text-slate-900 truncate capitalize">
                              {selectedPartner.full_name}
                            </span>
                            <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300/80">
                              {selectedPartner.referral_code}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Search className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold truncate text-slate-400">
                            Pilih Creator Code...
                          </span>
                        </div>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0 ml-1.5" />
                  </button>
                </div>
              </div>

              {/* Calculations Preview (1 Row / Item Info, Background Illustration & Colorful) */}
              <div className="space-y-2.5">
                {/* Row 1: Total Harga Sales (Hijau) */}
                <div className="p-3.5 py-2 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-200/90 shadow-2xs flex items-center justify-between gap-3 text-left relative overflow-hidden group">
                  {/* Background Illustration Watermark Icon */}
                  <Receipt className="absolute -right-2 -bottom-2 w-16 h-16 text-emerald-600/10 stroke-[1.2] pointer-events-none group-hover:scale-110 group-hover:text-emerald-600/15 transition-all" />

                  <div className="relative z-10 min-w-0 space-y-0.5">
                    <span className="text-xs font-black text-slate-900 block truncate">Total Harga</span>
                    <span className="text-[11px] font-semibold text-emerald-800/80 block truncate">
                      {reqQty} Pcs × Rp {selectedProduct ? Number(selectedProduct.price).toLocaleString("id-ID") : 0}
                    </span>
                  </div>
                  <strong className="relative z-10 text-base sm:text-lg font-black text-emerald-950 shrink-0">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </strong>
                </div>

                {/* Row 2: Creator Royalty (Biru) */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-indigo-500/15 border border-sky-200/90 shadow-2xs flex items-center justify-between gap-3 text-left relative overflow-hidden group">
                  {/* Background Illustration Watermark Icon */}
                  <Coins className="absolute -right-2 -bottom-2 w-16 h-16 text-sky-600/10 stroke-[1.2] pointer-events-none group-hover:scale-110 group-hover:text-sky-600/15 transition-all" />

                  <div className="relative z-10 min-w-0 space-y-0.5">
                    <span className="text-xs font-black text-slate-900 block truncate">Creator Royalty</span>
                    <span
                      className={`text-[11px] font-semibold block truncate ${
                        commissionPreview > 0 ? "text-sky-800 font-bold" : "text-slate-500"
                      }`}
                    >
                      {commissionPreview > 0 ? "Royalty Rp 2.000 / pcs" : "Tanpa Creator Code (Rp 0)"}
                    </span>
                  </div>
                  <strong className="relative z-10 text-base sm:text-lg font-black text-sky-950 shrink-0">
                    +Rp {commissionPreview.toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-dophy-600 hover:bg-dophy-700 text-white font-extrabold text-sm shadow-md shadow-dophy-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Buat Transaksi</span>
                  </>
                )}
              </button>
            </form>
          </main>
        </div>
      </div>

      {/* Reusable Footer */}
      <Footer variant="admin" />

      {/* Confirmation Alert Modal when Referral Code is Empty */}
      <CustomConfirmModal
        isOpen={showNoReferralModal}
        onClose={() => setShowNoReferralModal(false)}
        onConfirm={() => {
          setShowNoReferralModal(false);
          executeSubmit();
        }}
        isLoading={isSubmitting}
        variant="warning"
        title="Tanpa Creator Code?"
        description="Transaksi penjualan ini akan dicatat tanpa menggunakan Creator Code. Tidak ada alokasi saldo Creator Royalty yang dihitung. Apakah Anda ingin melanjutkan simpan?"
        confirmText="Ya, Lanjutkan Simpan"
        cancelText="Batal / Isi Kode"
      />

      {/* Automatic Payment Receipt / Struk Modal */}
      <SalesReceiptModal
        isOpen={Boolean(createdReceipt)}
        onClose={() => {
          setCreatedReceipt(null);
          router.push("/admin/sales");
          router.refresh();
        }}
        receipt={createdReceipt}
        onNewTransaction={handleNewTransaction}
      />

      {/* Custom Product Selection Modal */}
      <ResponsiveDetailModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Pilih Produk Snack"
      >
        <div className="space-y-2.5 text-left">
          {products.map((p) => {
            const isSelected = p.id === selectedProductId;
            const isLowStock = p.stock < 20;

            return (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProductId(p.id);
                  setIsProductModalOpen(false);
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-3 active:scale-[0.99] ${
                  isSelected
                    ? "bg-gradient-to-r from-orange-50/95 via-white/80 to-amber-50/70 border-dophy-500 shadow-xs ring-1 ring-dophy-500/25"
                    : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                {/* Background Illustration Watermark Icon */}
                <Package
                  className={`absolute -right-2 -bottom-2 w-20 h-20 pointer-events-none transition-transform duration-300 ${
                    isSelected ? "text-dophy-500/15 scale-110 stroke-[1.2]" : "text-slate-400/10 stroke-[1.2]"
                  }`}
                />

                {/* Left Info Content */}
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-black text-slate-900 tracking-tight">{p.name}</h4>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                      {p.weight}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-extrabold text-slate-900">Rp {Number(p.price).toLocaleString("id-ID")}</span>
                    <span className="text-slate-300">•</span>
                    <span className={`font-extrabold ${isLowStock ? "text-rose-600" : "text-emerald-600"}`}>
                      Stok: {p.stock} Pcs
                    </span>
                  </div>
                </div>

                {/* Right Radio Check Circle */}
                <div
                  className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isSelected ? "bg-dophy-600 border-dophy-600 text-white shadow-xs" : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </ResponsiveDetailModal>

      {/* Custom Creator Code Selection Modal */}
      <ResponsiveDetailModal
        isOpen={isPartnerModalOpen}
        onClose={() => {
          setIsPartnerModalOpen(false);
          setPartnerSearch("");
        }}
        title="Pilih Creator Code"
      >
        <div className="space-y-3.5 text-left">
          {/* In-Modal Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, Creator Code, atau email..."
              value={partnerSearch}
              onChange={(e) => setPartnerSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-slate-50 focus:bg-white focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100 outline-none transition-all shadow-2xs"
            />
            {partnerSearch && (
              <button
                type="button"
                onClick={() => setPartnerSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            {/* Special Option: Tanpa Creator Code */}
            <div
              onClick={() => {
                setSelectedPartner(null);
                setReferralCodeInput("");
                setIsPartnerModalOpen(false);
                setPartnerSearch("");
              }}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99] ${
                !selectedPartner
                  ? "bg-gradient-to-r from-slate-100 via-white to-slate-50 border-slate-400/80 shadow-xs ring-1 ring-slate-400/20"
                  : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div className="min-w-0 space-y-0.5">
                <h4 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Tanpa Creator Code</span>
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Transaksi reguler tanpa alokasi komisi Creator Royalty
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                  !selectedPartner ? "bg-slate-800 border-slate-800 text-white shadow-xs" : "border-slate-300 bg-white"
                }`}
              >
                {!selectedPartner && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            {/* Creator List */}
            {filteredPartners.length === 0 ? (
              <div className="py-8 text-center space-y-1.5">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-500">Tidak ada creator yang cocok</p>
                <p className="text-[10px] text-slate-400">Coba kata kunci pencarian nama atau kode lain</p>
              </div>
            ) : (
              filteredPartners.map((partner) => {
                const isSelected = selectedPartner?.id === partner.id;

                return (
                  <div
                    key={partner.id}
                    onClick={() => handleSelectPartner(partner)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-3 active:scale-[0.99] ${
                      isSelected
                        ? "bg-gradient-to-r from-emerald-50/95 via-white/80 to-teal-50/70 border-emerald-500 shadow-xs ring-1 ring-emerald-500/25"
                        : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    {/* Background Illustration Watermark Icon */}
                    <UserCheck
                      className={`absolute -right-2 -bottom-2 w-16 h-16 pointer-events-none transition-transform duration-300 ${
                        isSelected ? "text-emerald-500/15 scale-110 stroke-[1.2]" : "text-slate-400/10 stroke-[1.2]"
                      }`}
                    />

                    {/* Left Info */}
                    <div className="relative z-10 space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight capitalize">
                          {partner.full_name}
                        </h4>
                        <span className="text-[11px] sm:text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80">
                          {partner.referral_code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate">{partner.email}</p>

                      {/* Saldo Information Badges (Ready & Hold) */}
                      <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 flex-wrap">
                        {/* Saldo Ready (Belum Diajukan) */}
                        <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-emerald-50/90 text-emerald-900 border border-emerald-200/90 shadow-2xs">
                          <Wallet className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="text-[10px] text-emerald-700 font-bold">Ready:</span>
                          <span className="text-[11px] sm:text-xs font-black text-emerald-950 font-mono">
                            Rp {Number(partner.available_balance || 0).toLocaleString("id-ID")}
                          </span>
                        </div>

                        {/* Saldo Hold (Sedang Diajukan) */}
                        {Number(partner.held_balance || 0) > 0 ? (
                          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/90 shadow-2xs">
                            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="text-[10px] text-amber-700 font-bold">Hold:</span>
                            <span className="text-[11px] sm:text-xs font-black text-amber-950 font-mono">
                              Rp {Number(partner.held_balance || 0).toLocaleString("id-ID")}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-slate-50 text-slate-500 border border-slate-200/70">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="text-[10px] text-slate-400 font-medium">Hold:</span>
                            <span className="text-[11px] sm:text-xs font-bold text-slate-500 font-mono">Rp 0</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Checkbox */}
                    <div
                      className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        isSelected ? "bg-emerald-600 border-emerald-600 text-white shadow-xs" : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </ResponsiveDetailModal>

      {/* Digital Payment Receipt / Struk Modal upon successful creation */}
      <SalesReceiptModal
        isOpen={Boolean(createdReceipt)}
        onClose={() => {
          setCreatedReceipt(null);
          router.push("/admin/sales");
        }}
        receipt={createdReceipt}
        onNewTransaction={handleNewTransaction}
      />

      {/* Admin Navigation SideMenu (Mobile Drawer) */}
      <SideMenu isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
