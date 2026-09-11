"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Upload,
  FileText,
  AlertCircle,
  Calendar,
  Menu,
  X,
  ExternalLink,
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
import { uploadPartnerAssetToCloudinary } from "@repo/cloudinary";

export default function AdminWithdrawalsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Approval Modal State
  const [selectedApproveWd, setSelectedApproveWd] = useState<any>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [approvalError, setApprovalError] = useState("");

  // Rejection Modal State
  const [selectedRejectWd, setSelectedRejectWd] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionError, setRejectionError] = useState("");

  // Detail Modal State
  const [selectedDetailWd, setSelectedDetailWd] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    const storedRole = localStorage.getItem("dophy_role");

    if (!storedUser || storedRole !== "admin") {
      router.push("/admin/login");
      return;
    }

    setAdminUser(JSON.parse(storedUser));
    fetchWithdrawals();
  }, [router]);

  const fetchWithdrawals = async (status = activeFilter) => {
    setIsLoading(true);
    try {
      const url = status === "all" ? "/api/admin/withdrawals" : `/api/admin/withdrawals?status=${status}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setWithdrawals(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat daftar pengajuan penarikan..." />;
  }

  const handleFilterChange = (status: string) => {
    setActiveFilter(status);
    fetchWithdrawals(status);
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const preview = URL.createObjectURL(file);
      setProofPreviewUrl(preview);
    }
  };

  const handleApproveSubmit = async () => {
    if (!selectedApproveWd) return;
    if (!proofFile) {
      setApprovalError("Wajib mengunggah foto / screenshot bukti transfer.");
      return;
    }

    setIsUploading(true);
    setApprovalError("");

    try {
      const partner = selectedApproveWd.partner || {};
      const referralCode = partner.referral_code || "DOPHY-GENERAL";
      const fullName = partner.full_name || "Partner";

      // 1. Upload proof screenshot to Cloudinary subfolder:
      // dophy/{env}/partners/{referralCode}_{slugName}/withdrawals/
      const uploadRes = await uploadPartnerAssetToCloudinary({
        file: proofFile,
        referralCode,
        partnerName: fullName,
        folderType: "withdrawals",
      });

      // 2. Patch withdrawal to completed
      const res = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawal_id: selectedApproveWd.id,
          action: "approve",
          proof_url: uploadRes.url,
          proof_public_id: uploadRes.public_id,
          admin_id: adminUser?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setApprovalError(data.error || "Gagal menyetujui penarikan.");
        setIsUploading(false);
        return;
      }

      setSelectedApproveWd(null);
      setProofFile(null);
      setProofPreviewUrl("");
      fetchWithdrawals(activeFilter);
    } catch (err: any) {
      setApprovalError(`Error upload: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedRejectWd) return;
    if (!rejectionReason.trim()) {
      setRejectionError("Alasan penolakan wajib diisi.");
      return;
    }

    setIsRejecting(true);
    setRejectionError("");

    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawal_id: selectedRejectWd.id,
          action: "reject",
          rejection_reason: rejectionReason,
          admin_id: adminUser?.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setRejectionError(data.error || "Gagal menolak penarikan.");
        setIsRejecting(false);
        return;
      }

      setSelectedRejectWd(null);
      setRejectionReason("");
      fetchWithdrawals(activeFilter);
    } catch (err: any) {
      setRejectionError("Terjadi gangguan koneksi server.");
    } finally {
      setIsRejecting(false);
    }
  };

  const getBankStyle = (name = "") => {
    const b = name.toLowerCase();
    if (b.includes("gopay")) return "bg-sky-50 text-sky-700 border-sky-200/90";
    if (b.includes("dana")) return "bg-blue-50 text-blue-700 border-blue-200/90";
    if (b.includes("ovo")) return "bg-purple-50 text-purple-700 border-purple-200/90";
    if (b.includes("shopee") || b.includes("spay")) return "bg-orange-50 text-orange-700 border-orange-200/90";
    if (b.includes("bca")) return "bg-blue-50 text-blue-800 border-blue-200/90";
    if (b.includes("mandiri")) return "bg-amber-50 text-amber-800 border-amber-200/90";
    if (b.includes("bri")) return "bg-teal-50 text-teal-800 border-teal-200/90";
    if (b.includes("bni")) return "bg-emerald-50 text-emerald-800 border-emerald-200/90";
    return "bg-cyan-50 text-cyan-800 border-cyan-200/90";
  };

  const formatFullDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeFormatted =
      d
        .toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(":", ".") + " WIB";
    return `${dateFormatted}, ${timeFormatted}`;
  };

  const isCancelledStatus = (item: any) => {
    return (
      item?.status === "cancelled" ||
      item?.status === "canceled" ||
      (item?.status === "rejected" && item?.rejection_reason?.toLowerCase().includes("batal"))
    );
  };

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
              <Image
                src="/assets/logo-transparent.png"
                alt="DOPHY"
                width={120}
                height={60}
                className="w-24 sm:w-28 h-auto object-contain anim-logo-playful drop-shadow-xs"
              />
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                Admin
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors lg:hidden cursor-pointer"
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
          <main className="flex-1 min-w-0 w-full space-y-5">
            {/* Status Filter Chips (Compact Auto-width Flex Wrap - No Column Lock, No Screen Overlap) */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "all", label: "Semua" },
                { key: "pending", label: "Diajukan ⏳" },
                { key: "completed", label: "Selesai ✅" },
                { key: "rejected", label: "Ditolak ❌" },
                { key: "cancelled", label: "Dibatalkan 🚫" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleFilterChange(tab.key)}
                  className={`w-auto py-1.5 sm:py-2 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer inline-flex items-center justify-center whitespace-nowrap shadow-2xs active:scale-95 ${
                    activeFilter === tab.key
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Withdrawals Queue List */}
            {isLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                <div className="w-6 h-6 border-2 border-dophy-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Memuat antrean penarikan...</span>
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
                <h3 className="text-sm font-extrabold text-slate-900">Tidak Ada Antrean Penarikan</h3>
                <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                  Seluruh pengajuan penarikan dana dari Creator Partner dengan status filter ini telah bersih.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
                {withdrawals.map((item, index) => {
                  const partner = item.partner || {};
                  const cancelled = isCancelledStatus(item);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      onClick={() => setSelectedDetailWd(item)}
                      className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs hover:border-dophy-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5 text-left cursor-pointer active:scale-[0.99] group"
                    >
                      {/* Header: Name (Left) + StatusBadge (Right) */}
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-dophy-600 transition-colors truncate">
                          {partner.full_name || "Creator Partner"}
                        </h3>
                        <StatusBadge status={cancelled ? "cancelled" : item.status} />
                      </div>

                      {/* Row 2: Referral Code Chip */}
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono text-[10.5px] font-extrabold border border-purple-200/80 shadow-2xs shrink-0">
                          {partner.referral_code || "TANPA KODE"}
                        </span>
                        {partner.email && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10.5px] border border-slate-200/80 shadow-2xs truncate max-w-[200px]">
                            {partner.email}
                          </span>
                        )}
                      </div>

                      {/* Row 3: Date (Left) + Nominal (Right) */}
                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 mt-auto">
                        <span className="inline-flex items-center gap-1.5 text-slate-400 font-bold text-[11px] truncate">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {new Date(item.requested_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </span>

                        <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight shrink-0">
                          Rp {Number(item.amount).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* APPROVAL & CLOUDINARY UPLOAD MODAL */}
      <ResponsiveDetailModal
        isOpen={Boolean(selectedApproveWd)}
        onClose={() => setSelectedApproveWd(null)}
        title="Upload Bukti & Konfirmasi"
        subtitle={`Creator Partner: ${selectedApproveWd?.partner?.full_name || "Partner"} (${selectedApproveWd?.partner?.referral_code || "TANPA KODE"})`}
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setSelectedApproveWd(null)}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApproveSubmit}
              disabled={isUploading || !proofFile}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Setujui</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-left">
          {/* Transfer Summary Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nominal</span>
              <span className="text-base sm:text-lg font-black text-slate-900">
                Rp {Number(selectedApproveWd?.amount || 0).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="h-[1px] bg-slate-200/60" />
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] border shadow-2xs capitalize ${getBankStyle(
                    selectedApproveWd?.bank_name,
                  )}`}
                >
                  {selectedApproveWd?.bank_name}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 font-mono font-black text-[11px] border border-indigo-200 shadow-2xs">
                  {selectedApproveWd?.bank_account_number}
                </span>
              </div>
            </div>
          </div>

          {approvalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {approvalError}
            </div>
          )}

          {/* Screenshot Upload Dropzone */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 block">Bukti Struk Transfer</label>

            {!proofPreviewUrl ? (
              <label className="border-2 border-dashed border-slate-200 hover:border-dophy-400 hover:bg-dophy-50/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all group bg-slate-50/50">
                <input type="file" accept="image/*" onChange={handleProofChange} className="hidden" />
                <div className="w-10 h-10 rounded-xl bg-dophy-50 text-dophy-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">Klik untuk pilih foto struk transfer</p>
                  <p className="text-[10.5px] font-bold text-slate-400 mt-0.5">Format gambar JPG, PNG (Maks. 5MB)</p>
                </div>
              </label>
            ) : (
              <div className="space-y-2">
                <div className="relative w-full h-44 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 shadow-2xs">
                  <Image src={proofPreviewUrl} alt="Preview Bukti" fill className="object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setProofFile(null);
                      setProofPreviewUrl("");
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white transition-all shadow-md cursor-pointer active:scale-95"
                    title="Ganti Foto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Foto bukti transfer siap di-upload</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </ResponsiveDetailModal>

      {/* REJECTION MODAL */}
      <ResponsiveDetailModal
        isOpen={Boolean(selectedRejectWd)}
        onClose={() => setSelectedRejectWd(null)}
        title="Tolak Pengajuan Penarikan"
        subtitle={`Saldo Rp ${Number(selectedRejectWd?.amount || 0).toLocaleString("id-ID")} akan dikembalikan ke Creator Partner`}
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setSelectedRejectWd(null)}
              disabled={isRejecting}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleRejectSubmit}
              disabled={isRejecting}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isRejecting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Tolak & Rollback Saldo</span>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-left">
          {rejectionError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {rejectionError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 block">Alasan Penolakan</label>
            <textarea
              rows={3}
              placeholder="Contoh: Nomor rekening tidak ditemukan / nama penerima tidak cocok."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:border-dophy-500 outline-none shadow-2xs transition-all"
            />
          </div>
        </div>
      </ResponsiveDetailModal>

      {/* DETAIL MODAL */}
      <ResponsiveDetailModal
        isOpen={Boolean(selectedDetailWd)}
        onClose={() => setSelectedDetailWd(null)}
        title="Detail Penarikan Dana"
        subtitle={`Creator Partner: ${selectedDetailWd?.partner?.full_name || "Creator Partner"}`}
        footer={
          selectedDetailWd ? (
            selectedDetailWd.status === "pending" ? (
              <div className="flex items-center justify-end gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRejectWd(selectedDetailWd);
                    setSelectedDetailWd(null);
                    setRejectionReason("");
                    setRejectionError("");
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Tolak</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedApproveWd(selectedDetailWd);
                    setSelectedDetailWd(null);
                    setProofFile(null);
                    setProofPreviewUrl("");
                    setApprovalError("");
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Upload Bukti & Setujui</span>
                </button>
              </div>
            ) : selectedDetailWd.proof_url ? (
              <div className="flex items-center justify-between gap-2.5 w-full">
                <a
                  href={selectedDetailWd.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Gambar Asli</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedDetailWd(null)}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-end w-full">
                <button
                  type="button"
                  onClick={() => setSelectedDetailWd(null)}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Tutup
                </button>
              </div>
            )
          ) : undefined
        }
      >
        {selectedDetailWd ? (
          <div className="space-y-3.5 text-left">
            {/* Nominal & Status Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Nominal Penarikan
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Rp {Number(selectedDetailWd.amount || 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <StatusBadge status={isCancelledStatus(selectedDetailWd) ? "cancelled" : selectedDetailWd.status} />
              </div>
            </div>

            {/* Partner Info Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Informasi Creator Partner
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Nama:</span>
                  <span className="font-extrabold text-slate-900">
                    {selectedDetailWd.partner?.full_name || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Creator Code:</span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono text-[10.5px] font-extrabold border border-purple-200/80">
                    {selectedDetailWd.partner?.referral_code || "TANPA KODE"}
                  </span>
                </div>
                {selectedDetailWd.partner?.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Email:</span>
                    <span className="font-bold text-slate-700">
                      {selectedDetailWd.partner?.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Destination Bank / Account */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Rekening / E-Wallet Tujuan
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-lg font-black text-[11px] border shadow-2xs capitalize ${getBankStyle(
                    selectedDetailWd.bank_name
                  )}`}
                >
                  {selectedDetailWd.bank_name || "Bank / E-Wallet"}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 font-mono font-black text-[11px] border border-indigo-200/90 shadow-2xs">
                  {selectedDetailWd.bank_account_number}
                </span>
              </div>
            </div>

            {/* Timestamp Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Waktu Transaksi
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-slate-500 font-bold shrink-0">Diajukan:</span>
                  <span className="font-extrabold text-slate-800 text-right">
                    {formatFullDateTime(selectedDetailWd.requested_at)}
                  </span>
                </div>
                {selectedDetailWd.completed_at && (
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1.5 border-t border-slate-200/60">
                    <span className="text-slate-500 font-bold shrink-0">
                      {isCancelledStatus(selectedDetailWd)
                        ? "Dibatalkan:"
                        : selectedDetailWd.status === "rejected"
                        ? "Ditolak:"
                        : "Diselesaikan:"}
                    </span>
                    <span className="font-extrabold text-slate-800 text-right">
                      {formatFullDateTime(selectedDetailWd.completed_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Cancellation Notice (If cancelled by Creator Partner) */}
            {isCancelledStatus(selectedDetailWd) && (
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-start gap-2">
                <span className="font-black text-slate-800 shrink-0">Keterangan:</span>
                <p className="font-medium text-slate-700">
                  Pengajuan penarikan ini telah dibatalkan oleh Creator Partner. Saldo tertahan telah dikembalikan secara otomatis ke saldo aktif partner.
                </p>
              </div>
            )}

            {/* Receipt Image (If completed & has proof) */}
            {selectedDetailWd.proof_url && (
              <div className="space-y-1.5">
                <span className="text-xs font-black text-slate-800 block">Bukti Struk Transfer</span>
                <div className="relative w-full h-80 sm:h-96 flex items-center justify-center">
                  <Image src={selectedDetailWd.proof_url} alt="Bukti Transfer Admin" fill className="object-contain" />
                </div>
              </div>
            )}

            {/* Rejection reason (If rejected by Admin) */}
            {selectedDetailWd.status === "rejected" &&
              !isCancelledStatus(selectedDetailWd) &&
              selectedDetailWd.rejection_reason && (
                <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/90 text-rose-800 text-xs font-semibold flex items-start gap-2">
                  <span className="font-black text-rose-600 shrink-0">Alasan Ditolak:</span>
                  <p className="font-medium text-slate-700">{selectedDetailWd.rejection_reason}</p>
                </div>
              )}
          </div>
        ) : null}
      </ResponsiveDetailModal>

      {/* Reusable Footer */}
      <Footer variant="admin" />

      {/* Admin Navigation SideMenu */}
      <SideMenu isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
