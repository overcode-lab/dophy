"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
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
  Clock,
} from "lucide-react";
import {
  StatusBadge,
  ResponsiveDetailModal,
  CustomConfirmModal,
  LoadingSpinner,
  Footer,
  SideMenu,
  SideMenuDesktop,
} from "@repo/ui";

const ITEMS_PER_PAGE = 6;

export default function AdminPartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<any[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Edit Status Modal State
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [statusInput, setStatusInput] = useState("active");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Partner Confirmation State
  const [partnerToDelete, setPartnerToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    const storedRole = localStorage.getItem("dophy_role");

    if (!storedUser || storedRole !== "admin") {
      router.push("/admin/login");
      return;
    }

    fetchPartners();
  }, [router]);

  useEffect(() => {
    let result = [...partners];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (partner) =>
          partner.full_name?.toLowerCase().includes(q) ||
          partner.email?.toLowerCase().includes(q) ||
          partner.referral_code?.toLowerCase().includes(q) ||
          partner.bank_name?.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((partner) => partner.status === statusFilter);
    }

    setFilteredPartners(result);
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, statusFilter, partners]);

  const fetchPartners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/partners");
      const data = await res.json();
      if (data.success) {
        setPartners(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching partners:", err);
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

  const handleOpenEditModal = (partner: any) => {
    setSelectedPartner(partner);
    setStatusInput(partner.status || "active");
  };

  const handleSaveUpdate = async () => {
    if (!selectedPartner) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/partners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_id: selectedPartner.id,
          status: statusInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedPartner(null);
        fetchPartners();
      }
    } catch (err) {
      console.error("Error updating partner:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePartner = async () => {
    if (!partnerToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/admin/partners?id=${partnerToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        setPartnerToDelete(null);
        if (selectedPartner?.id === partnerToDelete.id) {
          setSelectedPartner(null);
        }
        fetchPartners();
      } else {
        setDeleteError(data.error || "Gagal menghapus data partner.");
      }
    } catch (err) {
      setDeleteError("Terjadi kesalahan koneksi server.");
    } finally {
      setIsDeleting(false);
    }
  };

  const visibleItems = filteredPartners.slice(0, visibleCount);

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat daftar Creator Partner DOPHY..." />;
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
            <h1 className="text-base font-black text-slate-900 tracking-tight">Creator Partner</h1>
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
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kelola Creator Partner 👥</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Daftar partner terdaftar, kelola status aktif/nonaktif, monitoring target, serta informasi pencairan
                royalti.
              </p>
            </section>

            {/* Search & Filter Controls */}
            <section className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, email, Creator Code, atau bank..."
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
                    statusFilter === "all" ? "bg-dophy-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Semua ({partners.length})
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    statusFilter === "active"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Aktif ({partners.filter((a) => a.status === "active").length})
                </button>
                <button
                  onClick={() => setStatusFilter("inactive")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    statusFilter === "inactive"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Nonaktif ({partners.filter((a) => a.status === "inactive").length})
                </button>
              </div>
            </section>

            {/* Line Separator */}
            <div className="py-0.5 flex items-center">
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rounded-full shadow-xs shadow-orange-500/20" />
            </div>

            {/* COMPACT PARTNER ITEM CARDS GRID (SPACE EFFICIENT & RAPI) */}
            {filteredPartners.length === 0 ? (
              <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-slate-800">Tidak Ada Creator Partner</p>
                  <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                    {searchQuery
                      ? "Tidak ada partner yang cocok dengan kata kunci pencarian Anda."
                      : "Belum ada Creator Partner yang terdaftar di sistem DOPHY."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 pt-3">
                  {visibleItems.map((partner, index) => {
                    return (
                      <motion.div
                        key={partner.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        onClick={() => handleOpenEditModal(partner)}
                        className="group relative p-4 rounded-2xl bg-slate-100/70 hover:bg-orange-50/60 border border-slate-200/90 hover:border-dophy-300 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 text-left"
                      >
                        {/* Absolute Position Attached Status Badge (Lebih ke Atas) */}
                        <div className="absolute -top-3.5 right-4 z-10">
                          <StatusBadge
                            status={partner.status}
                            className="text-[9px] px-2.5 py-0.5 shadow-xs bg-white"
                          />
                        </div>

                        {/* Left: Full Name & Email (Capitalized, Ample horizontal space) */}
                        <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                          <h3 className="text-sm sm:text-base font-black text-slate-900 capitalize tracking-tight leading-snug group-hover:text-dophy-600 transition-colors">
                            {partner.full_name || "Creator Partner"}
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold truncate">{partner.email}</p>
                        </div>

                        {/* Right: Colorful Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div
                            className="w-8 h-8 rounded-xl bg-orange-50 group-hover:bg-dophy-600 text-dophy-600 group-hover:text-white border border-orange-200/90 group-hover:border-dophy-600 flex items-center justify-center transition-all shadow-2xs"
                            title="Edit Data Partner"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteError("");
                              setPartnerToDelete(partner);
                            }}
                            className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200/90 hover:border-rose-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
                            title="Hapus Data Partner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* LAZY LOAD "MUAT LEBIH BANYAK" BUTTON */}
                {visibleCount < filteredPartners.length && (
                  <div className="pt-2 text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="px-6 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-dophy-400 hover:bg-dophy-50 text-slate-800 font-extrabold text-xs shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 mx-auto cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {isLoadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-dophy-600 border-t-transparent rounded-full animate-spin" />
                          <span>Memuat Partner Lainnya...</span>
                        </>
                      ) : (
                        <>
                          <span>Muat Lebih Banyak Partner ({filteredPartners.length - visibleCount} Tersisa)</span>
                          <ChevronDown className="w-4 h-4 text-dophy-600" />
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Indicator when all data loaded */}
                {visibleCount >= filteredPartners.length && filteredPartners.length > 0 && (
                  <div className="text-center pt-1 pb-4">
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-3.5 py-1 rounded-full border border-slate-200">
                      Semua {filteredPartners.length} data partner telah ditampilkan
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
        isOpen={Boolean(selectedPartner)}
        onClose={() => setSelectedPartner(null)}
        title="Creator Partner"
        subtitle={
          selectedPartner?.full_name ? (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 text-dophy-700 border border-orange-200/90 text-xs font-black capitalize shadow-2xs">
                {selectedPartner.full_name}
              </span>
              <StatusBadge status={selectedPartner.status} className="!text-[10px] !py-0.5 !px-2" />
            </div>
          ) : undefined
        }
      >
        {selectedPartner && (
          <div className="space-y-3 text-left py-0.5">
            {/* Email Bar */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1 shadow-2xs">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Email Partner</span>
              <p className="font-bold text-xs sm:text-sm text-slate-800 tracking-wide truncate">
                {selectedPartner.email}
              </p>
            </div>

            {/* 2. Structured Micro Dashboard (1 Row / Item) */}
            <div className="space-y-2 text-xs">
              {/* Row 1: Creator Code Box */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-orange-50/80 border border-orange-200/90 flex items-center justify-between gap-3 shadow-2xs">
                <div className="min-w-0 space-y-0.5">
                  <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest block">
                    Creator Code Unik
                  </span>
                  <span className="font-mono font-black text-xs sm:text-sm text-dophy-700 tracking-wide block truncate">
                    {selectedPartner.referral_code || "DOPHY-..."}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyReferral(selectedPartner.referral_code)}
                  className="p-1 text-dophy-600 hover:text-dophy-800 transition-colors cursor-pointer shrink-0"
                  title="Salin Creator Code"
                >
                  {copiedCode === selectedPartner.referral_code ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Row 2: Rekening Bank / Wallet Box */}
              <div className="relative p-2.5 sm:p-3 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-2 shadow-2xs">
                {/* Top Row: Bank Title & Badge Side-by-Side */}
                <div className="flex items-center gap-1.5 flex-wrap pr-8">
                  <span className="font-black text-xs sm:text-sm text-slate-900 uppercase tracking-wide">
                    {selectedPartner.bank_name || "Bank / E-Wallet"}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-sky-800 border border-sky-200/80 shadow-2xs flex items-center gap-1">
                    <Building className="w-3 h-3 text-sky-600" />
                    <span>Rekening / Wallet</span>
                  </span>
                </div>

                {/* Bottom Row: Nomor Rekening with generous gap space */}
                <p className="font-mono font-black text-sm sm:text-base text-slate-900 tracking-wider truncate">
                  {selectedPartner.bank_account_number || "Belum Didaftarkan"}
                </p>

                {/* Absolute Top-Right Copy Button (Icon only without wrapper) */}
                {selectedPartner.bank_account_number && (
                  <button
                    type="button"
                    onClick={() => handleCopyReferral(selectedPartner.bank_account_number)}
                    className="absolute top-0 right-1 sm:top-3 sm:right-3 p-1 text-sky-600 hover:text-sky-800 transition-colors cursor-pointer"
                    title="Salin Nomor Rekening"
                  >
                    {copiedCode === selectedPartner.bank_account_number ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Row 3: Saldo Royalti Ready */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3 shadow-2xs">
                <div className="min-w-0 space-y-0.5 flex-1">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Saldo Ready</span>
                  </span>
                  <p className="text-[10px] text-emerald-700/80 font-medium">Saldo siap ditarik/dicairkan</p>
                </div>
                <strong className="font-mono font-black text-xs sm:text-sm text-emerald-950 shrink-0">
                  Rp {Number(selectedPartner.available_balance || 0).toLocaleString("id-ID")}
                </strong>
              </div>

              {/* Row 4: Saldo Hold (Hanya ditampilkan jika > 0) */}
              {Number(selectedPartner.held_balance || 0) > 0 && (
                <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0 space-y-0.5 flex-1">
                    <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Saldo Hold</span>
                    </span>
                    <p className="text-[10px] text-amber-700/80 font-medium">Proses Pengajuan Pencairan Dana</p>
                  </div>
                  <strong className="font-mono font-black text-xs sm:text-sm text-amber-950 shrink-0">
                    Rp {Number(selectedPartner.held_balance || 0).toLocaleString("id-ID")}
                  </strong>
                </div>
              )}
            </div>

            {/* 3. Status Akun Selector (1 Row / Item) */}
            <div className="space-y-2 pt-1.5 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Status Akun Partner
              </label>

              <div className="space-y-2">
                {/* Option 1: Aktif */}
                <button
                  type="button"
                  onClick={() => setStatusInput("active")}
                  className={`w-full p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    statusInput === "active"
                      ? "border-emerald-500 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-slate-200/90 bg-white hover:border-slate-300 text-slate-600 hover:bg-slate-50/60"
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs sm:text-sm text-slate-900">Partner Aktif</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                        🟢 Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Creator Code & pencairan saldo royalti berjalan normal.
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-colors ${
                      statusInput === "active" ? "bg-emerald-600 text-white" : "border-2 border-slate-300 bg-white"
                    }`}
                  >
                    {statusInput === "active" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>

                {/* Option 2: Nonaktif */}
                <button
                  type="button"
                  onClick={() => setStatusInput("inactive")}
                  className={`w-full p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    statusInput === "inactive"
                      ? "border-rose-500 bg-rose-50/80 shadow-xs ring-1 ring-rose-500/20"
                      : "border-slate-200/90 bg-white hover:border-slate-300 text-slate-600 hover:bg-slate-50/60"
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs sm:text-sm text-slate-900">Partner Nonaktif</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                        🔴 Suspend
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Akun dibekukan. Creator Code & pencairan dinonaktifkan.
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-colors ${
                      statusInput === "inactive" ? "bg-rose-600 text-white" : "border-2 border-slate-300 bg-white"
                    }`}
                  >
                    {statusInput === "inactive" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              </div>
            </div>

            {/* 4. Action Buttons: Simpan & Hapus/Batal */}
            <div className="pt-2 space-y-2 border-t border-slate-100">
              {/* Primary Simpan Button */}
              <button
                type="button"
                onClick={handleSaveUpdate}
                disabled={isUpdating}
                className="w-full h-10 rounded-xl bg-dophy-600 hover:bg-dophy-700 text-white font-black text-xs shadow-md shadow-dophy-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>

              {/* Secondary Buttons: Hapus & Batal */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setPartnerToDelete(selectedPartner);
                  }}
                  disabled={isUpdating}
                  className="w-full h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Hapus Data Partner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Partner</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPartner(null)}
                  disabled={isUpdating}
                  className="w-full h-9 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors flex items-center justify-center cursor-pointer"
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
        isOpen={Boolean(partnerToDelete)}
        onClose={() => {
          setPartnerToDelete(null);
          setDeleteError("");
        }}
        onConfirm={() => {
          if (deleteError) {
            setPartnerToDelete(null);
            setDeleteError("");
          } else {
            handleDeletePartner();
          }
        }}
        isLoading={isDeleting}
        variant={deleteError ? "warning" : "danger"}
        title={deleteError ? "Gagal Menghapus Partner" : "Hapus Data Creator Partner"}
        description={
          deleteError
            ? deleteError
            : `Apakah Anda yakin ingin menghapus data Creator Partner "${partnerToDelete?.full_name || "ini"}" (${partnerToDelete?.email || ""})? Tindakan ini bersifat permanen.`
        }
        confirmText={deleteError ? "Saya Mengerti" : "Ya, Hapus Partner"}
        cancelText={deleteError ? "" : "Batal"}
      />

      {/* Admin Navigation SideMenu */}
      <SideMenu isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
