"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Lock,
  CreditCard,
  Landmark,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { CustomConfirmModal } from "@repo/ui";

export default function PartnerRegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    bank_name: "",
    bank_account_number: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Modal State for Success Confirmation
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredData, setRegisteredData] = useState<{ referral_code: string } | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Full Name Validation (2 - 70 chars)
    const trimmedName = formData.full_name.trim();
    if (!trimmedName) {
      newErrors.full_name = "Nama lengkap wajib diisi";
    } else if (trimmedName.length < 2) {
      newErrors.full_name = "Nama minimal 2 karakter";
    } else if (trimmedName.length > 50) {
      newErrors.full_name = "Nama maksimal 50 karakter";
    }

    // Email Validation (Max 100 chars)
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = "Format email tidak valid";
    } else if (trimmedEmail.length > 100) {
      newErrors.email = "Email maksimal 100 karakter";
    }

    // Phone Number Validation (Digits only, 10 - 15 digits)
    const trimmedPhone = formData.phone_number.trim();
    if (!trimmedPhone) {
      newErrors.phone_number = "Nomor WhatsApp / HP wajib diisi";
    } else if (!/^\d+$/.test(trimmedPhone)) {
      newErrors.phone_number = "Nomor HP hanya boleh berisi angka";
    } else if (trimmedPhone.length < 10) {
      newErrors.phone_number = "Nomor HP minimal 10 digit (contoh: 081234567890)";
    } else if (trimmedPhone.length > 15) {
      newErrors.phone_number = "Nomor HP maksimal 15 digit";
    }

    // Password Validation (6 - 64 chars)
    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    } else if (formData.password.length > 64) {
      newErrors.password = "Password maksimal 64 karakter";
    }

    // Bank / E-Wallet Name Validation (Max 40 chars)
    const trimmedBankName = formData.bank_name.trim();
    if (!trimmedBankName) {
      newErrors.bank_name = "Nama Bank / E-Wallet wajib diisi";
    } else if (trimmedBankName.length > 40) {
      newErrors.bank_name = "Nama Bank / E-Wallet maksimal 40 karakter";
    }

    // Bank Account Number Validation (Digits only, 8 - 25 digits)
    const trimmedAccountNum = formData.bank_account_number.trim();
    if (!trimmedAccountNum) {
      newErrors.bank_account_number = "Nomor Rekening / HP E-Wallet wajib diisi";
    } else if (!/^\d+$/.test(trimmedAccountNum)) {
      newErrors.bank_account_number = "Nomor Rekening / HP hanya boleh berisi angka";
    } else if (trimmedAccountNum.length < 8) {
      newErrors.bank_account_number = "Nomor Rekening / HP minimal 8 digit";
    } else if (trimmedAccountNum.length > 25) {
      newErrors.bank_account_number = "Nomor Rekening / HP maksimal 25 digit";
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
      const res = await fetch("/api/partner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.details) {
          const apiErrors: Record<string, string> = {};
          Object.keys(data.details).forEach((key) => {
            apiErrors[key] = data.details[key][0];
          });
          setErrors(apiErrors);
        }
        setGeneralError(data.error || "Pendaftaran gagal. Silakan coba lagi.");
        setIsLoading(false);
        return;
      }

      setRegisteredData(data.data);
      setShowSuccessModal(true);
    } catch (err: any) {
      setGeneralError("Terjadi gangguan koneksi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Background Decorator Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-dophy-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-60" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-lg bg-transparent rounded-none p-0 shadow-none border-none z-10 space-y-6 text-left"
      >
        {/* Header Section */}
        <div className="text-left space-y-3">
          <div className="relative w-48 h-20 sm:w-64 sm:h-28 flex items-center justify-center mx-auto">
            <Image
              src="/assets/logo-transparent.png"
              alt="DOPHY Logo"
              width={260}
              height={130}
              priority
              className="object-contain anim-logo-playful drop-shadow-sm w-48 sm:w-64 h-auto"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dophy-50 border border-dophy-200 text-dophy-700 text-[11px] font-extrabold uppercase tracking-wider">
            <UserPlus className="w-3.5 h-3.5 text-dophy-600" />
            Creator Partner Program
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Daftar Creator Partner DOPHY</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-sm">
            Dapatkan Creator Royalty dari setiap penjualan snack dengan Creator Code unikmu!
          </p>
        </div>

        {/* General Error Alert */}
        {generalError && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{generalError}</span>
          </motion.div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Full Name & Email Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">Nama Lengkap</label>
                <span className="text-[10px] text-slate-400 font-semibold">{formData.full_name.length}/50</span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  maxLength={50}
                  placeholder="Contoh: Budi Santoso"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value.slice(0, 50) })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all bg-slate-50/50 focus:bg-white outline-none ${
                    errors.full_name
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                      : "border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100"
                  }`}
                />
              </div>
              {errors.full_name && <p className="text-[11px] font-semibold text-rose-500">{errors.full_name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">Email</label>
                <span className="text-[10px] text-slate-400 font-semibold">{formData.email.length}/100</span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  maxLength={100}
                  placeholder="budi@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all bg-slate-50/50 focus:bg-white outline-none ${
                    errors.email
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                      : "border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100"
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] font-semibold text-rose-500">{errors.email}</p>}
            </div>
          </div>

          {/* Row 2: WhatsApp Phone & Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp / Phone */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">Nomor WhatsApp / HP</label>
                <span className="text-[10px] text-slate-400 font-semibold">{formData.phone_number.length}/15</span>
              </div>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={15}
                  placeholder="081234567890"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value.replace(/\D/g, "") })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all bg-slate-50/50 focus:bg-white outline-none ${
                    errors.phone_number
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                      : "border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100"
                  }`}
                />
              </div>
              {errors.phone_number && <p className="text-[11px] font-semibold text-rose-500">{errors.phone_number}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">Password</label>
                <span className="text-[10px] text-slate-400 font-semibold">{formData.password.length}/64</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  maxLength={64}
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium transition-all bg-slate-50/50 focus:bg-white outline-none ${
                    errors.password
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                      : "border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] font-semibold text-rose-500">{errors.password}</p>}
            </div>
          </div>

          {/* Aesthetic Orange Line Separator Gap */}
          <div className="py-2.5 my-1 flex items-center">
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rounded-full shadow-xs shadow-orange-500/20" />
          </div>

          {/* Row 3: Bank & Account Number Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Bank / E-Wallet Name */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">Bank / E-Wallet</label>
                <span className="text-[10px] text-slate-400 font-semibold">{formData.bank_name.length}/40</span>
              </div>
              <div className="relative">
                <Landmark className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  maxLength={40}
                  placeholder="BCA / GoPay / OVO / DANA"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all bg-slate-50/50 focus:bg-white outline-none ${
                    errors.bank_name
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                      : "border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100"
                  }`}
                />
              </div>
              {errors.bank_name && <p className="text-[11px] font-semibold text-rose-500">{errors.bank_name}</p>}
            </div>

            {/* Account Number */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">No. Rekening / No. HP</label>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {formData.bank_account_number.length}/25
                </span>
              </div>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={25}
                  placeholder="1234567890"
                  value={formData.bank_account_number}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_account_number: e.target.value.replace(/\D/g, "") })
                  }
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all bg-slate-50/50 focus:bg-white outline-none ${
                    errors.bank_account_number
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                      : "border-slate-200 focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100"
                  }`}
                />
              </div>
              {errors.bank_account_number && (
                <p className="text-[11px] font-semibold text-rose-500">{errors.bank_account_number}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-dophy-600 to-orange-500 hover:from-dophy-700 hover:to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-dophy-500/25 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer pt-3.5"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-left pt-4 border-t border-slate-200/80">
          <p className="text-xs text-slate-500 font-medium">
            Sudah punya akun Creator Partner?{" "}
            <Link
              href="/partner/login"
              className="font-extrabold text-dophy-600 hover:text-dophy-700 underline decoration-dophy-300 underline-offset-4"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Custom Confirmation Success Modal */}
      <CustomConfirmModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/partner/login");
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
          router.push("/partner/login");
        }}
        variant="success"
        title="Pendaftaran Berhasil! 🎉"
        description={`Selamat! Akun Creator Partner Anda telah aktif. Creator Code unik Anda adalah: ${
          registeredData?.referral_code || ""
        }. Silakan login untuk membuka dashboard.`}
        confirmText="Masuk ke Login"
        cancelText="Tutup"
      />
    </div>
  );
}
