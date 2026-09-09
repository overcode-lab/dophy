"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email Admin wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "admin" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setGeneralError(data.error || "Login gagal. Periksa kredensial Admin Anda.");
        setIsLoading(false);
        return;
      }

      // Store basic session / admin user info locally
      if (typeof window !== "undefined") {
        localStorage.setItem("dophy_user", JSON.stringify(data.user));
        localStorage.setItem("dophy_role", "admin");
      }

      router.push("/admin/dashboard");
    } catch (err: any) {
      setGeneralError("Terjadi gangguan jaringan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Background Decorator Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-slate-200/60 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-dophy-100/60 rounded-full blur-3xl opacity-60" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-md bg-transparent rounded-none p-0 shadow-none border-none z-10 space-y-6 text-left"
      >
        {/* Header Section */}
        <div className="text-left space-y-3">
          <div className="relative w-48 h-20 sm:w-64 sm:h-28 flex items-center justify-start">
            <Image
              src="/assets/logo-transparent.png"
              alt="DOPHY Logo"
              width={260}
              height={130}
              priority
              className="object-contain anim-logo-playful drop-shadow-sm w-48 sm:w-64 h-auto"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-dophy-600" />
            Admin Operations Panel
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Login Admin DOPHY</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-sm">
            Masuk ke pusat kendali operasional penjualan, pencairan dana, & kelola affiliator.
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-700 block">Email Admin</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="admin@dophy.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all bg-slate-50/50 focus:bg-white outline-none ${
                  errors.email
                    ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                    : "border-slate-200 focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] font-semibold text-rose-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-700 block">Password Admin</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                maxLength={64}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium transition-all bg-slate-50/50 focus:bg-white outline-none ${
                  errors.password
                    ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                    : "border-slate-200 focus:border-slate-700 focus:ring-2 focus:ring-slate-100"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-lg shadow-slate-900/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer pt-3.5"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Masuk Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <Link
            href="/affiliate/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-dophy-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Portal Login Affiliator</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
