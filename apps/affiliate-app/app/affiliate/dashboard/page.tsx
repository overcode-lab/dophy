"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Wallet,
  Copy,
  Check,
  TrendingUp,
  Award,
  ArrowUpRight,
  History,
  LogOut,
  Bell,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { StatusBadge, CustomConfirmModal, LoadingSpinner, Footer } from "@repo/ui";

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    if (!storedUser) {
      router.push("/affiliate/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchDashboard(parsedUser.email, parsedUser.id);
  }, [router]);

  const fetchDashboard = async (email: string, id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/affiliate/dashboard?email=${encodeURIComponent(email)}&affiliate_id=${id}`);
      const result = await res.json();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    const code = dashboardData?.affiliate?.referral_code || user?.referral_code || "";
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dophy_user");
    localStorage.removeItem("dophy_role");
    router.push("/affiliate/login");
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat portal affiliator..." />;
  }

  const affiliate = dashboardData?.affiliate || user || {};
  const stats = dashboardData?.stats || {
    available_balance: affiliate.available_balance || 0,
    held_balance: affiliate.held_balance || 0,
    total_sales_count: 0,
    sales_target: 50,
    target_progress_percent: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/assets/logo-transparent.png"
              alt="DOPHY"
              width={140}
              height={70}
              className="w-28 sm:w-36 h-auto object-contain anim-logo-playful drop-shadow-xs"
            />
            <span className="text-[10px] font-black uppercase tracking-wider bg-dophy-100 text-dophy-800 px-2.5 py-0.5 rounded-full border border-dophy-200">
              Affiliate
            </span>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 text-xs font-extrabold cursor-pointer"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-4 pt-5 space-y-5">
        {/* User Greeting & Status Banner */}
        <section className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selamat Datang 👋</p>
            <h1 className="text-xl font-black text-slate-900 tracking-tight capitalize">
              {affiliate.full_name || "Affiliator DOPHY"}
            </h1>
          </div>
          <StatusBadge status={affiliate.status || "active"} />
        </section>

        {/* ANNOUNCEMENT BANNER CARD (MOVED TO TOP & BEAUTIFIED, NO SECTION LABEL) */}
        {dashboardData?.announcements?.length > 0 && (
          <section className="space-y-3 text-left">
            {dashboardData.announcements.map((item: any) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-dophy-500/10 border border-orange-200/70 p-5 shadow-sm backdrop-blur-xs space-y-2"
              >
                {/* Background Decorator Glow */}
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-orange-400/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-start justify-between gap-2 relative z-10">
                  <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-snug">
                    {item.title}
                  </h4>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold relative z-10">
                  {item.content}
                </p>
              </motion.div>
            ))}
          </section>
        )}

        {/* Aesthetic Separator Line */}
        {dashboardData?.announcements?.length > 0 && (
          <div className="py-0.5 flex items-center">
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rounded-full shadow-xs shadow-orange-500/20" />
          </div>
        )}

        {/* FINANCIAL BALANCE HERO CARD */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-br from-dophy-600 via-dophy-500 to-orange-500 p-6 text-white shadow-xl shadow-dophy-500/25 relative overflow-hidden space-y-4"
        >
          {/* Subtle Background Glow Circles */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between text-white/80">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-white" />
              <span>Saldo Komisi Anda</span>
            </div>
            <button
              onClick={() => fetchDashboard(affiliate.email, affiliate.id)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors active:scale-95 cursor-pointer"
              title="Refresh Saldo"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div>
            <p className="text-xs text-white/80 font-medium">Saldo Tersedia (Siap Ditarik)</p>
            <h2 className="text-3xl font-black tracking-tight text-white mt-1">
              Rp {Number(stats.available_balance).toLocaleString("id-ID")}
            </h2>
          </div>

          {/* Held Balance Indicator */}
          {Number(stats.held_balance) > 0 && (
            <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
              <span className="text-white/80 font-medium">Saldo Tertahan (Dalam Proses):</span>
              <span className="font-extrabold text-amber-200">
                Rp {Number(stats.held_balance).toLocaleString("id-ID")}
              </span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-1">
            <Link
              href="/affiliate/withdraw"
              className="w-full py-3 px-4 rounded-2xl bg-white text-dophy-700 hover:bg-dophy-50 font-extrabold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Tarik Uang Komisi</span>
              <ArrowUpRight className="w-4 h-4 text-dophy-600" />
            </Link>
          </div>
        </motion.section>

        {/* Aesthetic Separator Line */}
        <div className="py-1 flex items-center">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rounded-full shadow-xs shadow-orange-500/20" />
        </div>

        {/* REFERRAL CODE COPY BOX (NO OUTER CARD WRAPPER) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider">Kode Referral</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <div className="flex-1 font-mono font-black text-base text-slate-900 px-2 tracking-wider">
              {affiliate.referral_code || "DOPHY-..."}
            </div>
            <button
              onClick={handleCopyCode}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                copied
                  ? "bg-emerald-600 text-white shadow-emerald-500/20"
                  : "bg-dophy-600 hover:bg-dophy-700 text-white shadow-dophy-500/20"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Aesthetic Separator Line */}
        <div className="py-1 flex items-center">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rounded-full shadow-xs shadow-orange-500/20" />
        </div>

        {/* QUICK MENU BUTTONS - PREMIUM GLASSMORPHISM ROW CARDS */}
        <section className="space-y-4">
          {/* Card 1: Penarikan Dana */}
          <Link
            href="/affiliate/withdraw"
            className="group relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl shadow-slate-200/50 hover:border-dophy-400 hover:shadow-dophy-500/15 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-between cursor-pointer"
          >
            {/* Background Illustration Icon */}
            <Wallet className="absolute -right-3 -bottom-3 w-28 h-28 text-dophy-500/10 group-hover:text-dophy-500/20 group-hover:scale-110 transition-all duration-500 stroke-[1.2] pointer-events-none" />

            <div className="relative z-10 space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-dophy-600">
                <Wallet className="w-4 h-4" />
                <span>Pencairan Komisi</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-dophy-600 transition-colors">
                Penarikan Dana
              </h3>
              <p className="text-xs text-slate-500 font-medium">Ajukan pencairan saldo komisi ke bank/e-wallet</p>
            </div>

            <div className="relative z-10 w-10 h-10 rounded-2xl bg-dophy-600 text-white flex items-center justify-center shadow-md shadow-dophy-500/30 group-hover:scale-110 group-hover:bg-dophy-700 transition-all shrink-0">
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Riwayat & Bukti */}
          <Link
            href="/affiliate/history"
            className="group relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl shadow-slate-200/50 hover:border-amber-400 hover:shadow-amber-500/15 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-between cursor-pointer"
          >
            {/* Background Illustration Icon */}
            <History className="absolute -right-3 -bottom-3 w-28 h-28 text-amber-500/10 group-hover:text-amber-500/20 group-hover:scale-110 transition-all duration-500 stroke-[1.2] pointer-events-none" />

            <div className="relative z-10 space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-600">
                <History className="w-4 h-4" />
                <span>Histori & Struk</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                Riwayat & Bukti Transfer
              </h3>
              <p className="text-xs text-slate-500 font-medium">Lihat riwayat pencairan & foto struk admin</p>
            </div>

            <div className="relative z-10 w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-110 group-hover:bg-amber-600 transition-all shrink-0">
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        </section>
      </main>

      {/* Reusable Footer */}
      <Footer variant="affiliate" />

      {/* Logout Confirmation Modal */}
      <CustomConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        variant="warning"
        title="Keluar dari Akun?"
        description="Apakah Anda yakin ingin keluar dari Affiliate DOPHY? Anda perlu login kembali untuk mengakses dashboard."
        confirmText="Ya, Keluar"
        cancelText="Batal"
      />
    </div>
  );
}
