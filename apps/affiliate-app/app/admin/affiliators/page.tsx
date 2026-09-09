"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Target,
  Wallet,
  Building,
  Search,
  Copy,
  Check,
  Edit3,
  Trash2,
  Filter,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Award,
  Menu,
} from "lucide-react";
import { StatusBadge, ResponsiveDetailModal, CustomConfirmModal, LoadingSpinner, Footer, SideMenu, SideMenuDesktop } from "@repo/ui";

const ITEMS_PER_PAGE = 6;

export default function AdminAffiliatorsPage() {
  const router = useRouter();
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [filteredAffiliates, setFilteredAffiliates] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Edit Target / Status Modal State
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
  const [targetInput, setTargetInput] = useState("50");
  const [statusInput, setStatusInput] = useState("active");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Affiliate Confirmation State
  const [affiliateToDelete, setAffiliateToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    const storedRole = localStorage.getItem("dophy_role");

    if (!storedUser || storedRole !== "admin") {
      router.push("/admin/login");
      return;
    }

    fetchAffiliates();
  }, [router]);

  useEffect(() => {
    let result = [...affiliates];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (aff) =>
          aff.full_name?.toLowerCase().includes(q) ||
          aff.email?.toLowerCase().includes(q) ||
          aff.referral_code?.toLowerCase().includes(q) ||
          aff.bank_name?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((aff) => aff.status === statusFilter);
    }

    setFilteredAffiliates(result);
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, statusFilter, affiliates]);

  const fetchAffiliates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/affiliators");
      const data = await res.json();
      if (data.success) {
        setAffiliates(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching affiliates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 400);
  };

  const handleCopyReferral = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenEditModal = (aff: any) => {
    setSelectedAffiliate(aff);
    setStatusInput(aff.status || "active");
    setTargetInput(String(aff.sales_target || 50));
  };

  const handleSaveUpdate = async () => {
    if (!selectedAffiliate) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/affiliators", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliate_id: selectedAffiliate.id,
          status: statusInput,
          sales_target: Number(targetInput),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedAffiliate(null);
        fetchAffiliates();
      }
    } catch (err) {
      console.error("Error updating affiliate:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAffiliate = async () => {
    if (!affiliateToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/admin/affiliators?id=${affiliateToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setAffiliateToDelete(null);
        if (selectedAffiliate?.id === affiliateToDelete.id) {
          setSelectedAffiliate(null);
        }
        fetchAffiliates();
      } else {
        setDeleteError(data.error || "Gagal menghapus data affiliator.");
      }
    } catch (err) {
      setDeleteError("Terjadi kesalahan koneksi server.");
    } finally {
      setIsDeleting(false);
    }
  };

  const visibleItems = filteredAffiliates.slice(0, visibleCount);

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat daftar mitra affiliator DOPHY..." />;
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
              title="Kembali ke Dashboard Admin"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-base font-black text-slate-900 tracking-tight">Manajemen Affiliator</h1>
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
          <main className="flex-1 min-w-0 w-full space-y-6">
        {/* Page Title & Description */}
        <section className="text-left space-y-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kelola Mitra Affiliator 👥</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Daftar mitra terdaftar, pengaturan status aktif/nonaktif, target penjualan snack, serta informasi rekening wallet.
          </p>
        </section>

        {/* Search & Filter Controls */}
        <section className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, email, kode referral, atau bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-dophy-500 focus:ring-2 focus:ring-dophy-500/20 transition-all shadow-2xs"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-dophy-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Semua ({affiliates.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === "active"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Aktif ({affiliates.filter((a) => a.status === "active").length})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === "inactive"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Nonaktif ({affiliates.filter((a) => a.status === "inactive").length})
            </button>
          </div>
        </section>

        {/* Line Separator */}
        <div className="py-0.5 flex items-center">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rounded-full shadow-xs shadow-orange-500/20" />
        </div>

        {/* COMPACT AFFILIATOR ITEM CARDS GRID (SPACE EFFICIENT & RAPI) */}
        {filteredAffiliates.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-slate-800">Tidak Ada Data Affiliator</p>
              <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                {searchQuery
                  ? "Tidak ada mitra yang cocok dengan kata kunci pencarian Anda."
                  : "Belum ada mitra affiliator yang terdaftar di sistem DOPHY."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 pt-3">
              {visibleItems.map((aff, index) => {
                return (
                  <motion.div
                    key={aff.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    onClick={() => handleOpenEditModal(aff)}
                    className="group relative p-4 rounded-2xl bg-slate-100/70 hover:bg-orange-50/60 border border-slate-200/90 hover:border-dophy-300 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 text-left"
                  >
                    {/* Absolute Position Attached Status Badge (Lebih ke Atas) */}
                    <div className="absolute -top-3.5 right-4 z-10">
                      <StatusBadge
                        status={aff.status}
                        className="text-[9px] px-2.5 py-0.5 shadow-xs bg-white"
                      />
                    </div>

                    {/* Left: Full Name & Email (Capitalized, Ample horizontal space) */}
                    <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 capitalize tracking-tight leading-snug group-hover:text-dophy-600 transition-colors">
                        {aff.full_name || "Mitra Affiliator"}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold truncate">{aff.email}</p>
                    </div>

                    {/* Right: Colorful Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div
                        className="w-8 h-8 rounded-xl bg-orange-50 group-hover:bg-dophy-600 text-dophy-600 group-hover:text-white border border-orange-200/90 group-hover:border-dophy-600 flex items-center justify-center transition-all shadow-2xs"
                        title="Edit Data Mitra"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteError("");
                          setAffiliateToDelete(aff);
                        }}
                        className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200/90 hover:border-rose-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
                        title="Hapus Data Mitra"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* LAZY LOAD "MUAT LEBIH BANYAK" BUTTON */}
            {visibleCount < filteredAffiliates.length && (
              <div className="pt-2 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-dophy-400 hover:bg-dophy-50 text-slate-800 font-extrabold text-xs shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 mx-auto cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-dophy-600 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat Mitra Lainnya...</span>
                    </>
                  ) : (
                    <>
                      <span>Muat Lebih Banyak Affiliator ({filteredAffiliates.length - visibleCount} Tersisa)</span>
                      <ChevronDown className="w-4 h-4 text-dophy-600" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Indicator when all data loaded */}
            {visibleCount >= filteredAffiliates.length && filteredAffiliates.length > 0 && (
              <div className="text-center pt-1 pb-4">
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3.5 py-1 rounded-full border border-slate-200">
                  Semua {filteredAffiliates.length} data mitra affiliator telah ditampilkan
                </span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  </div>

      {/* Reusable Footer */}
      <Footer variant="admin" />

      {/* FULLSCREEN POPUP MODAL (COMPACT & ELEGANT WITH COLORFUL CHIPS - NO AVATARS) */}
      <ResponsiveDetailModal
        isOpen={Boolean(selectedAffiliate)}
        onClose={() => setSelectedAffiliate(null)}
        title="Pengaturan Mitra Affiliator"
        subtitle={selectedAffiliate?.full_name ? `Detail Mitra: ${selectedAffiliate.full_name}` : "Kelola status & target"}
      >
        {selectedAffiliate && (
          <div className="space-y-4 text-left py-1">
            {/* User Contact Header (No Initial Avatar Box) */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h4 className="font-black text-slate-900 text-base capitalize leading-snug">
                  {selectedAffiliate.full_name}
                </h4>
                <p className="text-xs text-slate-400 font-semibold">{selectedAffiliate.email}</p>
              </div>

              <StatusBadge status={selectedAffiliate.status} />
            </div>

            {/* STRUCTURED MICRO DASHBOARD (1 ROW / ITEM) */}
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              {/* Kode Referral Box (1 Row) */}
              <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-200/90 flex items-center justify-between gap-2 shadow-2xs">
                <div>
                  <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest block">
                    Kode Referral Unik
                  </span>
                  <span className="font-mono font-black text-sm text-dophy-700 tracking-wide">
                    {selectedAffiliate.referral_code || "DOPHY-..."}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyReferral(selectedAffiliate.referral_code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    copiedCode === selectedAffiliate.referral_code
                      ? "bg-emerald-600 text-white shadow-emerald-500/20"
                      : "bg-white text-dophy-700 border border-orange-200 hover:bg-orange-100 shadow-2xs"
                  }`}
                >
                  {copiedCode === selectedAffiliate.referral_code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-dophy-600" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              {/* Rekening / Wallet Box (1 Row) */}
              <div className="p-3 rounded-2xl bg-sky-50/60 border border-sky-200/80 flex items-center justify-between gap-2 shadow-2xs">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-sky-700 uppercase tracking-wider block flex items-center gap-1">
                    <Building className="w-3 h-3 text-sky-600" />
                    <span>Rekening Bank / Wallet</span>
                  </span>
                  <p className="font-black text-slate-900 text-xs">
                    {selectedAffiliate.bank_name || "Belum Didaftarkan"}
                  </p>
                </div>
                <p className="text-xs font-mono font-black text-sky-900 bg-white px-2.5 py-1 rounded-xl border border-sky-200/80">
                  {selectedAffiliate.bank_account_number || "-"}
                </p>
              </div>

              {/* Saldo Komisi & Target Box (1 Row) */}
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between gap-2 shadow-2xs">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider block flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-emerald-600" />
                    <span>Saldo Komisi Ready</span>
                  </span>
                  <p className="font-black text-emerald-700 text-sm">
                    Rp {Number(selectedAffiliate.available_balance || 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <span className="text-xs font-extrabold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-emerald-200/80">
                  Target: <strong>{selectedAffiliate.sales_target || 50} Pcs</strong>
                </span>
              </div>
            </div>

            {/* FORM CONTROLS (COMPACT & CLEAN) */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Status Akun Mitra
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: Aktif */}
                  <button
                    type="button"
                    onClick={() => setStatusInput("active")}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                      statusInput === "active"
                        ? "border-emerald-500 bg-emerald-50/80 shadow-xs shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-2xs transition-colors ${
                        statusInput === "active" ? "bg-emerald-600 text-white" : "border-2 border-slate-300 bg-white"
                      }`}
                    >
                      {statusInput === "active" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">Mitra Aktif</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          🟢 Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-tight">
                        Kode referral & pencairan saldo komisi berjalan normal.
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Nonaktif */}
                  <button
                    type="button"
                    onClick={() => setStatusInput("inactive")}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                      statusInput === "inactive"
                        ? "border-rose-500 bg-rose-50/80 shadow-xs shadow-rose-500/10 ring-2 ring-rose-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-2xs transition-colors ${
                        statusInput === "inactive" ? "bg-rose-600 text-white" : "border-2 border-slate-300 bg-white"
                      }`}
                    >
                      {statusInput === "inactive" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">Mitra Nonaktif</span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                          🔴 Suspend
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-tight">
                        Akun dibekukan. Kode referral & pencairan dinonaktifkan.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Target Penjualan (Pcs)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-black bg-slate-50 text-slate-900 outline-none focus:border-dophy-500 focus:ring-2 focus:ring-dophy-500/20 transition-all"
                    placeholder="Contoh: 50"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">
                    Pcs
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Target penjualan snack yang dijadikan acuan progres bagi mitra affiliator ini.
                </p>
              </div>
            </div>

            {/* Action Buttons: Simpan (Top Row), Hapus & Batal (Bottom Row) */}
            <div className="pt-3.5 space-y-2.5 border-t border-slate-100">
              {/* Row 1: Primary Simpan Button */}
              <button
                type="button"
                onClick={handleSaveUpdate}
                disabled={isUpdating}
                className="w-full h-11 rounded-2xl bg-dophy-600 hover:bg-dophy-700 text-white font-black text-xs shadow-md shadow-dophy-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>

              {/* Row 2: Secondary Buttons (Hapus & Batal 1 Row) */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setAffiliateToDelete(selectedAffiliate);
                  }}
                  disabled={isUpdating}
                  className="w-full h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Hapus Data Mitra"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Mitra</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAffiliate(null)}
                  disabled={isUpdating}
                  className="w-full h-10 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-extrabold text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </ResponsiveDetailModal>

      {/* Delete Confirmation Modal */}
      <CustomConfirmModal
        isOpen={Boolean(affiliateToDelete)}
        onClose={() => {
          setAffiliateToDelete(null);
          setDeleteError("");
        }}
        onConfirm={() => {
          if (deleteError) {
            setAffiliateToDelete(null);
            setDeleteError("");
          } else {
            handleDeleteAffiliate();
          }
        }}
        isLoading={isDeleting}
        variant={deleteError ? "warning" : "danger"}
        title={deleteError ? "Gagal Menghapus Mitra" : "Hapus Data Mitra Affiliator"}
        description={
          deleteError
            ? deleteError
            : `Apakah Anda yakin ingin menghapus data mitra affiliator "${affiliateToDelete?.full_name || "ini"}" (${affiliateToDelete?.email || ""})? Tindakan ini bersifat permanen.`
        }
        confirmText={deleteError ? "Saya Mengerti" : "Ya, Hapus Mitra"}
        cancelText={deleteError ? "" : "Batal"}
      />

      {/* Admin Navigation SideMenu */}
      <SideMenu isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
