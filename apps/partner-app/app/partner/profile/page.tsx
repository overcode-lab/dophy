"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Phone,
  Landmark,
  CreditCard,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  ShieldCheck,
  Save,
} from "lucide-react";
import { CustomConfirmModal, LoadingSpinner, Footer, StatusBadge } from "@repo/ui";

export default function PartnerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [codeInputSuffix, setCodeInputSuffix] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [salesTarget, setSalesTarget] = useState<number | string>(50);

  // Debounced Code Checking State
  const [checkStatus, setCheckStatus] = useState<"idle" | "checking" | "available" | "unavailable" | "same" | "invalid">("same");
  const [statusMessage, setStatusMessage] = useState("");

  // Submit & Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    if (!storedUser) {
      router.push("/partner/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchProfile(parsedUser.id);
  }, [router]);

  const fetchProfile = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/partner/profile?partner_id=${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const partner = data.data;
        setPartnerData(partner);
        setFullName(partner.full_name || "");
        setPhoneNumber(partner.phone_number || "");
        setBankName(partner.bank_name || "");
        setBankAccountNumber(partner.bank_account_number || "");
        setSalesTarget(partner.sales_target || 50);

        const refCode = partner.referral_code || "";
        const suffix = refCode.startsWith("DARI-") ? refCode.slice(5) : refCode;
        setCodeInputSuffix(suffix);
        setCheckStatus("same");
        setStatusMessage("Ini adalah Creator Code Anda saat ini.");
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced Creator Code Availability Check
  useEffect(() => {
    if (isLoading || !partnerData) return;

    const trimmed = codeInputSuffix.trim().toUpperCase();
    const currentCode = partnerData?.referral_code || "";
    const currentSuffix = currentCode.startsWith("DARI-") ? currentCode.slice(5) : currentCode;

    if (trimmed.length === 0) {
      setCheckStatus("invalid");
      setStatusMessage("Masukkan 1 - 15 karakter huruf atau angka.");
      return;
    }

    if (trimmed === currentSuffix.toUpperCase()) {
      setCheckStatus("same");
      setStatusMessage("Ini adalah Creator Code Anda saat ini.");
      return;
    }

    setCheckStatus("checking");
    setStatusMessage("Memeriksa ketersediaan kode...");

    const timer = setTimeout(async () => {
      try {
        const fullCodeToCheck = `DARI-${trimmed}`;
        const res = await fetch(
          `/api/partner/code?code=${encodeURIComponent(fullCodeToCheck)}&partner_id=${partnerData.id}`
        );
        const data = await res.json();

        if (data.available) {
          setCheckStatus("available");
          setStatusMessage(`Kode '${fullCodeToCheck}' tersedia!`);
        } else {
          setCheckStatus("unavailable");
          setStatusMessage(data.message || data.error || `Kode '${fullCodeToCheck}' sudah digunakan.`);
        }
      } catch (err) {
        setCheckStatus("invalid");
        setStatusMessage("Gagal memeriksa ketersediaan kode.");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [codeInputSuffix, isLoading, partnerData]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Nama lengkap minimal 2 karakter";
    } else if (fullName.trim().length > 50) {
      errors.fullName = "Nama lengkap maksimal 50 karakter";
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      errors.phoneNumber = "Nomor WhatsApp minimal 9 digit";
    }

    if (!codeInputSuffix.trim()) {
      errors.code = "Creator Code wajib diisi";
    } else if (checkStatus === "unavailable") {
      errors.code = "Creator Code sudah digunakan oleh partner lain";
    } else if (checkStatus === "invalid") {
      errors.code = "Creator Code hanya boleh berisi 1-15 karakter huruf/angka";
    }

    const targetNum = Number(salesTarget);
    if (!salesTarget || isNaN(targetNum) || targetNum < 1) {
      errors.salesTarget = "Target penjualan minimal 1 pcs";
    }

    if (!bankName.trim()) {
      errors.bankName = "Nama Bank / E-Wallet wajib diisi";
    }

    if (!bankAccountNumber.trim() || bankAccountNumber.trim().length < 3) {
      errors.bankAccountNumber = "Nomor rekening / e-wallet wajib diisi";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) return;
    if (checkStatus === "checking") return;

    setIsSaving(true);

    try {
      const fullCode = `DARI-${codeInputSuffix.trim().toUpperCase()}`;
      const res = await fetch("/api/partner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_id: partnerData.id,
          full_name: fullName.trim(),
          phone_number: phoneNumber.trim(),
          referral_code: fullCode,
          bank_name: bankName.trim(),
          bank_account_number: bankAccountNumber.trim(),
          sales_target: Math.round(Number(salesTarget)),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setGeneralError(data.error || "Gagal memperbarui profil.");
        setIsSaving(false);
        return;
      }

      const updated = data.data;
      setPartnerData(updated);

      // Sync user session in localStorage
      const storedUser = localStorage.getItem("dophy_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const merged = { ...parsed, ...updated };
        localStorage.setItem("dophy_user", JSON.stringify(merged));
        setUser(merged);
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      setGeneralError("Terjadi kesalahan koneksi server. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat profil partner..." />;
  }

  const partner = partnerData || user || {};

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/partner/dashboard"
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight">Pengaturan Profil</h1>
              <p className="text-[10.5px] font-bold text-slate-400">Creator Partner DOPHY</p>
            </div>
          </div>

          <StatusBadge status={partner.status || "active"} />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-5 space-y-5">
        {/* Profile Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-5 text-white shadow-lg shadow-slate-950/20 space-y-3 text-left"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-dophy-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Background Watermark Illustration */}
          <User className="absolute -right-3 -bottom-3 w-28 h-28 text-white/5 pointer-events-none stroke-[1.2]" />

          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 text-[10.5px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Creator Partner</span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight truncate capitalize">
              {partner.full_name || "Creator Partner"}
            </h2>
            <p className="text-xs text-slate-300 font-medium truncate">{partner.email}</p>
          </div>

          <div className="relative z-10 flex items-center flex-wrap gap-2 pt-1 border-t border-white/10">
            <span className="px-2.5 py-1 rounded-xl bg-white/10 text-white font-mono font-bold text-xs border border-white/15">
              {partner.referral_code || "DARI-..."}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 font-bold text-xs border border-amber-400/25">
              Target: {partner.sales_target || 50} pcs
            </span>
          </div>
        </motion.div>

        {/* General Error Alert */}
        {generalError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
          {/* Nama Lengkap */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">Nama Lengkap</label>
              <span className="text-[10.5px] font-bold text-slate-400">{fullName.length}/50</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                maxLength={50}
                value={fullName}
                onChange={(e) => setFullName(e.target.value.slice(0, 50))}
                placeholder="Nama Lengkap Anda"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold transition-all bg-white border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100 outline-none ${
                  formErrors.fullName ? "border-rose-400 focus:border-rose-500" : ""
                }`}
              />
            </div>
            {formErrors.fullName && <p className="text-[11px] font-semibold text-rose-500">{formErrors.fullName}</p>}
          </div>

          {/* Nomor WhatsApp */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Nomor WhatsApp / HP</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                inputMode="tel"
                maxLength={20}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d+]/g, ""))}
                placeholder="081234567890"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold transition-all bg-white border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100 outline-none ${
                  formErrors.phoneNumber ? "border-rose-400 focus:border-rose-500" : ""
                }`}
              />
            </div>
            {formErrors.phoneNumber && (
              <p className="text-[11px] font-semibold text-rose-500">{formErrors.phoneNumber}</p>
            )}
          </div>

          {/* Creator Code Input with Fixed Prefix */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Creator Code</label>

            <div className="flex items-center rounded-xl border border-slate-200 focus-within:border-dophy-500 focus-within:ring-2 focus-within:ring-dophy-100 overflow-hidden bg-white transition-all">
              <span className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-dophy-100 text-dophy-800 font-mono font-black text-xs sm:text-sm border-r border-slate-200 shrink-0 select-none">
                DARI-
              </span>
              <input
                type="text"
                maxLength={15}
                value={codeInputSuffix}
                onChange={(e) => {
                  const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
                  setCodeInputSuffix(clean);
                }}
                placeholder="KODEMU"
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm font-mono font-black text-slate-900 bg-transparent outline-none uppercase placeholder:text-slate-300 tracking-normal sm:tracking-wider"
              />
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 pr-2.5 sm:pr-3 shrink-0">
                {codeInputSuffix.length}/15
              </span>
            </div>

            {/* Debounce Check Status Indicator */}
            <div className="min-h-[16px] flex items-center gap-1.5 text-xs">
              {checkStatus === "checking" && (
                <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-dophy-600" />
                  <span>Memeriksa ketersediaan kode...</span>
                </div>
              )}
              {checkStatus === "available" && (
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}
              {checkStatus === "unavailable" && (
                <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}
              {checkStatus === "invalid" && (
                <div className="flex items-center gap-1.5 text-amber-600 font-medium text-[11px]">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>
            {formErrors.code && <p className="text-[11px] font-semibold text-rose-500">{formErrors.code}</p>}
          </div>

          {/* Target Penjualan */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Target Penjualan (Pcs)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Target className="w-4 h-4" />
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={salesTarget}
                onChange={(e) => setSalesTarget(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="50"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold transition-all bg-white border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100 outline-none ${
                  formErrors.salesTarget ? "border-rose-400 focus:border-rose-500" : ""
                }`}
              />
            </div>
            <p className="text-[10.5px] font-medium text-slate-400">
              Target bulanan yang ditampilkan pada progress bar dashboard Anda.
            </p>
            {formErrors.salesTarget && (
              <p className="text-[11px] font-semibold text-rose-500">{formErrors.salesTarget}</p>
            )}
          </div>

          {/* Nama Bank */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Nama Bank / E-Wallet</label>
            <input
              type="text"
              maxLength={40}
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="BCA / Mandiri / GoPay / OVO"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all bg-white border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100 outline-none ${
                formErrors.bankName ? "border-rose-400 focus:border-rose-500" : ""
              }`}
            />
            {formErrors.bankName && <p className="text-[11px] font-semibold text-rose-500">{formErrors.bankName}</p>}
          </div>

          {/* Nomor Rekening */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Nomor Rekening / No. HP E-Wallet</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <CreditCard className="w-4 h-4" />
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={25}
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="1234567890"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-semibold transition-all bg-white border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100 outline-none ${
                  formErrors.bankAccountNumber ? "border-rose-400 focus:border-rose-500" : ""
                }`}
              />
            </div>
            <p className="text-[10.5px] font-medium text-slate-400">
              Digunakan sebagai rekening tujuan otomatis saat pencairan Creator Royalty.
            </p>
            {formErrors.bankAccountNumber && (
              <p className="text-[11px] font-semibold text-rose-500">{formErrors.bankAccountNumber}</p>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving || checkStatus === "checking" || checkStatus === "unavailable"}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-dophy-600 to-orange-500 hover:from-dophy-700 hover:to-orange-600 text-white font-black text-sm shadow-lg shadow-dophy-500/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Reusable Footer */}
      <Footer variant="partner" />

      {/* Success Modal */}
      <CustomConfirmModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/partner/dashboard");
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
          router.push("/partner/dashboard");
        }}
        variant="success"
        title="Profil Berhasil Disimpan! 🎉"
        description="Data profil, kontak, Creator Code, dan rekening pencairan Anda telah berhasil diperbarui."
        confirmText="Oke, Sip!"
        cancelText=""
      />
    </div>
  );
}
