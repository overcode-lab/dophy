"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, Landmark, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { CustomConfirmModal, LoadingSpinner, Footer } from "@repo/ui";

export default function PartnerWithdrawPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setBankName(parsedUser.bank_name || "");
    setAccountNumber(parsedUser.bank_account_number || "");
    fetchPartnerProfile(parsedUser.id);
  }, [router]);

  const fetchPartnerProfile = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/partner/dashboard?partner_id=${id}`);
      const data = await res.json();
      if (data.success) {
        const partner = data.data.partner;
        setPartnerData(partner);
        setBankName(partner.bank_name || "");
        setAccountNumber(partner.bank_account_number || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat formulir penarikan..." />;
  }

  const availableBalance = Number(partnerData?.available_balance || user?.available_balance || 0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const reqAmount = Number(amount);

    if (!amount || isNaN(reqAmount) || reqAmount <= 0) {
      newErrors.amount = "Nominal penarikan harus lebih dari Rp 0";
    } else if (reqAmount > availableBalance) {
      newErrors.amount = `Nominal melebihi saldo tersedia (Rp ${availableBalance.toLocaleString("id-ID")})`;
    }

    if (!bankName.trim()) {
      newErrors.bankName = "Bank / E-Wallet tujuan wajib diisi";
    }

    if (!accountNumber.trim()) {
      newErrors.accountNumber = "Nomor rekening tujuan wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await fetch("/api/partner/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_id: partnerData?.id || user?.id,
          amount: Number(amount),
          bank_name: bankName,
          bank_account_number: accountNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setGeneralError(data.error || "Pengajuan penarikan gagal. Silakan coba lagi.");
        setIsLoading(false);
        return;
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      setGeneralError("Terjadi gangguan koneksi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2.5">
          <Link
            href="/partner/dashboard"
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-black text-slate-900 tracking-tight">Penarikan Creator Royalty</h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-5 space-y-5">
        {/* Balance Area (No Outer Card Wrapper) */}
        <div className="space-y-1 text-left px-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Royalti Tersedia</p>
          <h2 className="text-3xl font-black text-dophy-600 tracking-tight">
            Rp {availableBalance.toLocaleString("id-ID")}
          </h2>
        </div>

        {/* Aesthetic Separator Line */}
        <div className="py-1 flex items-center">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rounded-full shadow-xs shadow-orange-500/20" />
        </div>

        {/* General Error Alert */}
        {generalError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Withdrawal Form (No Outer Card Wrapper) */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Nominal Penarikan Royalti (Rp)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={12}
                placeholder="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-bold transition-all bg-white border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100 outline-none shadow-xs ${
                  errors.amount ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100" : ""
                }`}
              />
            </div>
            {errors.amount && <p className="text-[11px] font-semibold text-rose-500">{errors.amount}</p>}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              <Landmark className="w-3.5 h-3.5 text-dophy-600" />
              <span>Rekening / E-Wallet Tujuan</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Nama Bank / E-Wallet</label>
              <input
                type="text"
                maxLength={40}
                placeholder="BCA / GoPay"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className={`w-full px-3.5 py-3 rounded-xl border text-sm font-medium transition-all bg-white border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100 outline-none shadow-xs ${
                  errors.bankName ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100" : ""
                }`}
              />
              {errors.bankName && <p className="text-[11px] font-semibold text-rose-500">{errors.bankName}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">No. Rekening / No. HP E-Wallet</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={25}
                placeholder="1234567890"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                className={`w-full px-3.5 py-3 rounded-xl border text-sm font-medium transition-all bg-white border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100 outline-none shadow-xs ${
                  errors.accountNumber ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100" : ""
                }`}
              />
              {errors.accountNumber && (
                <p className="text-[11px] font-semibold text-rose-500">{errors.accountNumber}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-dophy-600 to-orange-500 hover:from-dophy-700 hover:to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-dophy-500/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer pt-3.5 mt-4"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Kirim Pengajuan Penarikan</span>
            )}
          </button>
        </form>
      </main>

      {/* Reusable Footer */}
      <Footer variant="partner" />

      {/* Success Confirm Modal */}
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
        title="Pengajuan Berhasil Dikirim! 🚀"
        description="Saldo Anda sebesar nominal yang ditarik telah ditahan sementara. Admin DOPHY akan memproses transfer manual dan mengunggah bukti transfer secepatnya."
        confirmText="Kembali ke Dashboard"
        cancelText="Tutup"
      />
    </div>
  );
}
