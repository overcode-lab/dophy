"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Pencil,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  Sparkles,
  User,
  Target,
  Flame,
  Trophy,
  Zap,
} from "lucide-react";
import { StatusBadge, CustomConfirmModal, LoadingSpinner, Footer } from "@repo/ui";

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Creator Code Edit State
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [codeInputSuffix, setCodeInputSuffix] = useState("");
  const [checkStatus, setCheckStatus] = useState<
    "idle" | "checking" | "available" | "unavailable" | "same" | "invalid"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSavingCode, setIsSavingCode] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  const [saveErrorMessage, setSaveErrorMessage] = useState("");

  // Sales Target Quick Edit State
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState<number | string>(50);
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [targetSuccessMsg, setTargetSuccessMsg] = useState("");
  const [targetErrorMsg, setTargetErrorMsg] = useState("");

  // Announcement Banner Carousel State
  const announcements = dashboardData?.announcements || [];
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isBannerPaused, setIsBannerPaused] = useState(false);
  const [bannerTouchStartX, setBannerTouchStartX] = useState<number | null>(null);

  // Auto-scroll interval for banner carousel (5 seconds)
  useEffect(() => {
    if (announcements.length <= 1 || isBannerPaused) return;

    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length, isBannerPaused]);

  // Touch Swipe Handlers for mobile
  const handleBannerTouchStart = (e: React.TouchEvent) => {
    setIsBannerPaused(true);
    setBannerTouchStartX(e.touches[0]?.clientX ?? null);
  };

  const handleBannerTouchEnd = (e: React.TouchEvent) => {
    setIsBannerPaused(false);
    if (bannerTouchStartX === null) return;
    const touchEndX = e.changedTouches[0]?.clientX ?? bannerTouchStartX;
    const diff = bannerTouchStartX - touchEndX;

    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        // Swiped left -> Next banner
        setActiveBannerIndex((prev) => (prev + 1) % announcements.length);
      } else {
        // Swiped right -> Previous banner
        setActiveBannerIndex((prev) => (prev === 0 ? announcements.length - 1 : prev - 1));
      }
    }
    setBannerTouchStartX(null);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    if (!storedUser) {
      router.push("/partner/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchDashboard(parsedUser.email, parsedUser.id);
  }, [router]);

  const partner = dashboardData?.partner || user || {};

  // Debounced Creator Code Availability Check
  useEffect(() => {
    if (!isEditingCode) return;

    const trimmed = codeInputSuffix.trim().toUpperCase();
    const currentCode = partner?.referral_code || "";
    const currentSuffix = currentCode.startsWith("DARI-") ? currentCode.slice(5) : currentCode;

    if (trimmed.length === 0) {
      setCheckStatus("invalid");
      setStatusMessage("Masukkan 1 - 15 karakter huruf dan/atau angka.");
      return;
    }

    if (trimmed === currentSuffix.toUpperCase()) {
      setCheckStatus("same");
      setStatusMessage("Ini adalah Creator Code Anda saat ini.");
      return;
    }

    // Set status to checking
    setCheckStatus("checking");
    setStatusMessage("Memeriksa ketersediaan kode...");

    const timer = setTimeout(async () => {
      try {
        const fullCodeToCheck = `DARI-${trimmed}`;
        const res = await fetch(
          `/api/partner/code?code=${encodeURIComponent(fullCodeToCheck)}&partner_id=${partner.id}`,
        );
        const data = await res.json();

        if (data.available) {
          setCheckStatus("available");
          setStatusMessage(`Kode '${fullCodeToCheck}' tersedia! Siap digunakan.`);
        } else {
          setCheckStatus("unavailable");
          setStatusMessage(data.message || data.error || `Kode '${fullCodeToCheck}' sudah digunakan.`);
        }
      } catch (err) {
        setCheckStatus("invalid");
        setStatusMessage("Gagal memeriksa ketersediaan kode.");
      }
    }, 500); // 500ms debounce wait

    return () => clearTimeout(timer);
  }, [codeInputSuffix, isEditingCode, partner?.id, partner?.referral_code]);

  const handleStartEditCode = () => {
    const currentCode = partner?.referral_code || "";
    const currentSuffix = currentCode.startsWith("DARI-") ? currentCode.slice(5) : currentCode;
    setCodeInputSuffix(currentSuffix);
    setCheckStatus("same");
    setStatusMessage("Ini adalah Creator Code Anda saat ini.");
    setSaveErrorMessage("");
    setSaveSuccessMessage("");
    setIsEditingCode(true);
  };

  const handleCancelEditCode = () => {
    setIsEditingCode(false);
    setCodeInputSuffix("");
    setCheckStatus("idle");
    setStatusMessage("");
    setSaveErrorMessage("");
  };

  const handleSaveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkStatus !== "available" || isSavingCode) return;

    setIsSavingCode(true);
    setSaveErrorMessage("");

    try {
      const fullCode = `DARI-${codeInputSuffix.trim().toUpperCase()}`;
      const res = await fetch("/api/partner/code", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_id: partner.id,
          code: fullCode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSaveErrorMessage(data.error || "Gagal menyimpan Creator Code.");
        setIsSavingCode(false);
        return;
      }

      // Update local state and localStorage
      setDashboardData((prev: any) => ({
        ...prev,
        partner: {
          ...prev.partner,
          referral_code: data.data?.referral_code || fullCode,
        },
      }));

      const storedUser = localStorage.getItem("dophy_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.referral_code = data.data?.referral_code || fullCode;
        localStorage.setItem("dophy_user", JSON.stringify(parsed));
        setUser(parsed);
      }

      setIsEditingCode(false);
      setSaveSuccessMessage(`Creator Code berhasil diubah menjadi ${fullCode}! 🎉`);
      setTimeout(() => setSaveSuccessMessage(""), 5000);
    } catch (err: any) {
      setSaveErrorMessage("Terjadi kesalahan koneksi server.");
    } finally {
      setIsSavingCode(false);
    }
  };

  const handleStartEditTarget = () => {
    const currentTarget = dashboardData?.stats?.sales_target || partner.sales_target || 50;
    setTargetInput(currentTarget);
    setTargetErrorMsg("");
    setTargetSuccessMsg("");
    setIsEditingTarget(!isEditingTarget);
  };

  const handleSaveTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = Number(targetInput);
    if (isNaN(targetNum) || targetNum < 1) {
      setTargetErrorMsg("Target penjualan minimal 1 pcs");
      return;
    }

    setIsSavingTarget(true);
    setTargetErrorMsg("");

    try {
      const res = await fetch("/api/partner/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_id: partner.id,
          sales_target: Math.round(targetNum),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setTargetErrorMsg(data.error || "Gagal memperbarui target penjualan.");
        return;
      }

      const newTarget = Math.round(targetNum);
      const totalSales = Number(dashboardData?.stats?.total_sales_count || 0);

      // Update local dashboard data
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          partner: {
            ...dashboardData.partner,
            sales_target: newTarget,
          },
          stats: {
            ...dashboardData.stats,
            sales_target: newTarget,
            target_progress_percent: Math.min(100, Math.round((totalSales / newTarget) * 100)),
            remaining_to_target: Math.max(0, newTarget - totalSales),
          },
        });
      }

      // Update localStorage
      const stored = localStorage.getItem("dophy_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.sales_target = newTarget;
        localStorage.setItem("dophy_user", JSON.stringify(parsed));
        setUser(parsed);
      }

      setTargetSuccessMsg("Target penjualan berhasil disimpan! 🎯");
      setIsEditingTarget(false);
      setTimeout(() => setTargetSuccessMsg(""), 4000);
    } catch (err: any) {
      setTargetErrorMsg(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsSavingTarget(false);
    }
  };

  const fetchDashboard = async (email: string, id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/partner/dashboard?email=${encodeURIComponent(email)}&partner_id=${id}`);
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
    const code = dashboardData?.partner?.referral_code || user?.referral_code || "";
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dophy_user");
    localStorage.removeItem("dophy_role");
    router.push("/partner/login");
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat portal partner..." />;
  }

  const stats = dashboardData?.stats || {
    available_balance: partner.available_balance || 0,
    held_balance: partner.held_balance || 0,
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
              Partner
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/partner/profile"
              className="p-2 rounded-xl text-slate-500 hover:text-dophy-600 hover:bg-dophy-50 transition-colors flex items-center gap-1.5 text-xs font-extrabold cursor-pointer"
              title="Profil Saya"
            >
              <User className="w-4 h-4 text-dophy-600" />
              <span className="hidden sm:inline">Profil</span>
            </Link>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 text-xs font-extrabold cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-4 pt-5 space-y-5">
        {/* User Greeting & Status Banner */}
        <section className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selamat Datang 👋</p>
            <h1 className="text-xl font-black text-slate-900 tracking-tight capitalize">
              {partner.full_name || "Creator Partner DOPHY"}
            </h1>
          </div>
          <StatusBadge status={partner.status || "active"} />
        </section>

        {/* ANNOUNCEMENT BANNER CAROUSEL (TOUCH SWIPEABLE & AUTO-SCROLLING) */}
        {announcements.length > 0 && (
          <section className="space-y-2 text-left">
            <div
              className="relative overflow-hidden rounded-3xl"
              onMouseEnter={() => setIsBannerPaused(true)}
              onMouseLeave={() => setIsBannerPaused(false)}
              onTouchStart={handleBannerTouchStart}
              onTouchEnd={handleBannerTouchEnd}
            >
              <AnimatePresence mode="wait">
                {announcements[activeBannerIndex] && (
                  <motion.div
                    key={announcements[activeBannerIndex].id || activeBannerIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-dophy-500/10 border border-orange-200/70 p-5 pt-3.5 shadow-sm backdrop-blur-xs space-y-2 select-none"
                  >
                    {/* Background Decorator Glow */}
                    <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-orange-400/10 rounded-full blur-xl pointer-events-none" />

                    <div className="flex items-start justify-between gap-2 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-dophy-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-dophy-700 bg-dophy-100/80 px-2 py-0.5 rounded-full border border-dophy-200">
                          Pengumuman {announcements.length > 1 ? `(${activeBannerIndex + 1}/${announcements.length})` : ""}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {new Date(announcements[activeBannerIndex].created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="space-y-1 relative z-10">
                      <h4 className="text-sm font-extrabold text-slate-900">{announcements[activeBannerIndex].title}</h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {announcements[activeBannerIndex].content}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pagination Dots (Only if > 1 banner) */}
            {announcements.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-0.5">
                {announcements.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveBannerIndex(idx)}
                    aria-label={`Lihat banner ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeBannerIndex
                        ? "w-6 bg-dophy-600 shadow-2xs"
                        : "w-1.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Aesthetic Separator Line */}
        {dashboardData?.announcements?.length > 0 && (
          <div className="py-0.5 flex items-center">
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rounded-full shadow-xs shadow-orange-500/20" />
          </div>
        )}

        {/* STATS HERO WALLET (BALANCE READY + HELD BALANCE) */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dophy-600 via-dophy-500 to-amber-500 p-6 text-white shadow-xl shadow-dophy-500/20 space-y-4 text-left"
        >
          {/* Subtle Background Glow Circles */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between text-white/80">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-white" />
              <span>Saldo Creator Royalty</span>
            </div>
            <button
              onClick={() => fetchDashboard(partner.email, partner.id)}
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
              href="/partner/withdraw"
              className="w-full py-3 px-4 rounded-2xl bg-white text-dophy-700 hover:bg-dophy-50 font-extrabold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Tarik Uang Royalti</span>
              <ArrowUpRight className="w-4 h-4 text-dophy-600" />
            </Link>
          </div>
        </motion.section>

        {/* ========================================================= */}
        {/* SALES TARGET & MOTIVATIONAL ACHIEVEMENT HERO CARD */}
        {/* ========================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800/90 p-5 text-white shadow-lg shadow-slate-950/20 space-y-3.5 text-left"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -right-10 -top-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Row: Title & Percentage Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Capaian Penjualan</span>

            <span
              className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                (stats.total_sales_count || 0) >= (stats.sales_target || 50)
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
              }`}
            >
              {stats.target_progress_percent || 0}% Tercapai
            </span>
          </div>

          {/* Numbers Display */}
          <div className="relative z-10 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
              {Number(stats.total_sales_count || 0).toLocaleString("id-ID")}
            </span>
            <span className="text-sm font-bold text-slate-400 font-mono">
              / {Number(stats.sales_target || 50).toLocaleString("id-ID")} pcs
            </span>
          </div>

          {/* Sleek Progress Bar */}
          <div className="relative z-10 w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.max(2, Math.min(100, stats.target_progress_percent || 0))}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${
                (stats.total_sales_count || 0) >= (stats.sales_target || 50)
                  ? "bg-emerald-400"
                  : "bg-gradient-to-r from-amber-400 to-orange-400"
              }`}
            />
          </div>

          {/* Persuasive Motivation Narrative */}
          <div className="relative z-10 pt-2 border-t border-white/10 space-y-1.5">
            {(stats.total_sales_count || 0) >= (stats.sales_target || 50) ? (
              <>
                <h4 className="text-base font-black text-emerald-300 flex items-center gap-1.5 mb-2">
                  <span>🎉</span>
                  <span>Luar biasa, target tercapai!</span>
                </h4>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Penjualanmu telah menembus{" "}
                  <strong className="text-white font-bold font-mono">
                    {Number(stats.sales_target || 50).toLocaleString("id-ID")} pcs
                  </strong>
                  . Momentum hebat ini bukti kerja kerasmu, saatnya naikkan target ke level berikutnya untuk hasil
                  royalti yang lebih melimpah! 🚀
                </p>
              </>
            ) : (stats.remaining_to_target || 0) <= 10 ? (
              <>
                <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Garis finish di depan mata!</span>
                </h4>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Tinggal{" "}
                  <strong className="text-amber-300 font-black font-mono underline">
                    {Number(stats.remaining_to_target || 0).toLocaleString("id-ID")} pcs
                  </strong>{" "}
                  lagi untuk menuntaskan target penjualanmu. Gaspol bagikan link & Creator Code-mu ke story dan grup
                  sekarang! 🔥
                </p>
              </>
            ) : (
              <>
                <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <span>🚀</span>
                  <span>Setiap langkah membawamu lebih dekat!</span>
                </h4>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  Tersisa{" "}
                  <strong className="text-white font-bold font-mono">
                    {Number(stats.remaining_to_target || 0).toLocaleString("id-ID")} pcs
                  </strong>{" "}
                  lagi untuk mencapai target. Konsisten bagikan video konten & link promosi DOPHY-mu untuk raih komisi
                  royalti maksimal! ✨
                </p>
              </>
            )}
          </div>
        </motion.section>

        {/* TARGET PENJUALAN BOX WITH INLINE EDIT (MATCHING CREATOR CODE STYLE) */}
        <section className="space-y-2.5">
          {/* Target Success Banner */}
          {targetSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{targetSuccessMsg}</span>
            </motion.div>
          )}

          {/* Header Row: Title & Action */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-extrabold text-slate-600 uppercase tracking-wider text-[11px]">Target Penjualan</span>

            {!isEditingTarget && (
              <button
                type="button"
                onClick={handleStartEditTarget}
                className="inline-flex items-center gap-1 text-[11.5px] font-bold text-dophy-600 hover:text-dophy-700 transition-colors cursor-pointer py-0.5 px-1.5 rounded-lg hover:bg-dophy-50"
              >
                <Pencil className="w-3 h-3" />
                <span>Ubah Target</span>
              </button>
            )}
          </div>

          {!isEditingTarget ? (
            /* VIEW MODE */
            <div
              onClick={handleStartEditTarget}
              className="relative overflow-hidden p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm transition-all hover:border-amber-300 cursor-pointer group"
            >
              {/* Background Target Illustration to save space */}
              <Target className="w-16 h-16 text-amber-500/15 group-hover:text-amber-500/25 transition-colors absolute -right-2 -bottom-2 pointer-events-none stroke-[1.5]" />

              <div className="relative z-10">
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="font-mono font-black text-2xl text-slate-900 tracking-tight">
                    {stats.sales_target || 50}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-sans">pcs</span>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <motion.form
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSaveTarget}
              className="p-4 rounded-2xl bg-white border-2 border-amber-400 shadow-lg shadow-amber-500/10 space-y-3.5 text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800">Kustomisasi Target Penjualan</label>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tentukan target jumlah snack DOPHY yang ingin kamu capai untuk memacu semangat penjualanmu.
                </p>
              </div>

              {/* Preset Quick Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10.5px] font-bold text-slate-400 block">Pilihan Cepat:</span>
                <div className="grid grid-cols-5 gap-1.5">
                  {[25, 50, 100, 250, 500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTargetInput(preset)}
                      className={`py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        Number(targetInput) === preset
                          ? "bg-amber-500 text-white shadow-sm font-black border border-amber-600"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Group */}
              <div className="space-y-1.5">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={targetInput}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                      setTargetInput(clean);
                    }}
                    placeholder="100"
                    autoFocus
                    className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-xs sm:text-sm font-mono font-black text-slate-900 bg-slate-50 transition-all pr-12"
                  />
                  <span className="absolute right-3.5 text-[11px] sm:text-xs font-bold text-slate-400 select-none">
                    pcs
                  </span>
                </div>

                {targetErrorMsg && <p className="text-[11.5px] font-bold text-rose-500">{targetErrorMsg}</p>}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingTarget(false);
                    setTargetErrorMsg("");
                  }}
                  disabled={isSavingTarget}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSavingTarget}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingTarget ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Target</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </section>

        {/* CREATOR CODE BOX WITH INLINE EDIT & DEBOUNCED CHECK */}
        <section className="space-y-2.5">
          {/* Success Banner */}
          {saveSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMessage}</span>
            </motion.div>
          )}

          {/* Header Row: Title & Action */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-extrabold text-slate-600 uppercase tracking-wider text-[11px]">Creator Code</span>

            {!isEditingCode && (
              <button
                type="button"
                onClick={handleStartEditCode}
                className="inline-flex items-center gap-1 text-[11.5px] font-bold text-dophy-600 hover:text-dophy-700 transition-colors cursor-pointer py-0.5 px-1.5 rounded-lg hover:bg-dophy-50"
              >
                <Pencil className="w-3 h-3" />
                <span>Ubah Kode</span>
              </button>
            )}
          </div>

          {!isEditingCode ? (
            /* VIEW MODE */
            <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm transition-all hover:border-slate-300">
              <div
                onClick={handleStartEditCode}
                className="flex-1 flex items-center gap-1.5 px-2 overflow-hidden cursor-pointer"
                title="Klik untuk ubah kode"
              >
                <span className="font-mono font-black text-xs sm:text-sm text-slate-900 tracking-normal sm:tracking-wider truncate">
                  {partner.referral_code || "DARI-..."}
                </span>
              </div>
              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title={copied ? "Tersalin!" : "Salin Creator Code"}
                  className="p-2 rounded-xl text-orange-500 hover:text-orange-600 hover:bg-orange-50 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-orange-500" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <motion.form
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSaveCode}
              className="p-4 rounded-2xl bg-white border-2 border-dophy-400 shadow-lg shadow-dophy-500/10 space-y-3.5 text-left"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                  <span>Kustomisasi Creator Code</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </label>
              </div>

              {/* Input Group with Fixed Prefix */}
              <div className="space-y-1.5">
                <div className="flex items-center rounded-xl border border-slate-300 focus-within:border-dophy-500 focus-within:ring-2 focus-within:ring-dophy-100 overflow-hidden bg-slate-50 transition-all">
                  {/* Fixed Static Prefix */}
                  <span className="px-2.5 sm:px-3.5 py-2 sm:py-2.5 bg-dophy-100/80 text-dophy-800 font-mono font-black text-xs sm:text-sm border-r border-slate-200 shrink-0 select-none">
                    DARI-
                  </span>

                  {/* Dynamic Suffix Input */}
                  <input
                    type="text"
                    maxLength={15}
                    value={codeInputSuffix}
                    onChange={(e) => {
                      // Alphanumeric only, uppercase, max 15 chars
                      const clean = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 15);
                      setCodeInputSuffix(clean);
                    }}
                    placeholder="REINA99"
                    autoFocus
                    className="w-full px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-mono font-black text-slate-900 bg-transparent outline-none uppercase placeholder:text-slate-300 tracking-normal sm:tracking-wider"
                  />

                  {/* Character Counter */}
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 pr-2.5 sm:pr-3 shrink-0">
                    {codeInputSuffix.length}/15
                  </span>
                </div>

                {/* Live Debounce Status Message */}
                <div className="min-h-[16px] flex items-center gap-1.5 text-xs">
                  {checkStatus === "checking" && (
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11.5px]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-dophy-600" />
                      <span>Memeriksa ketersediaan kode...</span>
                    </div>
                  )}

                  {checkStatus === "available" && (
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11.5px]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{statusMessage}</span>
                    </div>
                  )}

                  {checkStatus === "unavailable" && (
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[11.5px]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{statusMessage}</span>
                    </div>
                  )}

                  {checkStatus === "invalid" && (
                    <div className="flex items-center gap-1.5 text-amber-600 font-medium text-[11.5px]">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>{statusMessage}</span>
                    </div>
                  )}
                </div>

                {saveErrorMessage && <p className="text-[11.5px] font-bold text-rose-500">{saveErrorMessage}</p>}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancelEditCode}
                  disabled={isSavingCode}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={checkStatus !== "available" || isSavingCode || codeInputSuffix.trim().length === 0}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-dophy-600 to-orange-500 hover:from-dophy-700 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-dophy-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingCode ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Kode</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </section>

        {/* Aesthetic Separator Line */}
        <div className="py-1 flex items-center">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rounded-full shadow-xs shadow-orange-500/20" />
        </div>

        {/* QUICK MENU BUTTONS - PREMIUM GLASSMORPHISM ROW CARDS */}
        <section className="space-y-4">
          {/* Card 1: Penarikan Dana */}
          <Link
            href="/partner/withdraw"
            className="group relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl shadow-slate-200/50 hover:border-dophy-400 hover:shadow-dophy-500/15 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-between cursor-pointer"
          >
            {/* Background Illustration Icon */}
            <Wallet className="absolute -right-3 -bottom-3 w-28 h-28 text-dophy-500/10 group-hover:text-dophy-500/20 group-hover:scale-110 transition-all duration-500 stroke-[1.2] pointer-events-none" />

            <div className="relative z-10 space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-dophy-600">
                <Wallet className="w-4 h-4" />
                <span>Pencairan Royalti</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-dophy-600 transition-colors">
                Penarikan Dana
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Ajukan pencairan saldo Creator Royalty ke bank/e-wallet
              </p>
            </div>

            <div className="relative z-10 w-10 h-10 rounded-2xl bg-dophy-600 text-white flex items-center justify-center shadow-md shadow-dophy-500/30 group-hover:scale-110 group-hover:bg-dophy-700 transition-all shrink-0">
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Riwayat & Bukti */}
          <Link
            href="/partner/history"
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

          {/* Card 3: Profil & Pengaturan Akun */}
          <Link
            href="/partner/profile"
            className="group relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-xl shadow-slate-200/50 hover:border-violet-400 hover:shadow-violet-500/15 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-between cursor-pointer"
          >
            {/* Background Illustration Icon */}
            <User className="absolute -right-3 -bottom-3 w-28 h-28 text-violet-500/10 group-hover:text-violet-500/20 group-hover:scale-110 transition-all duration-500 stroke-[1.2] pointer-events-none" />

            <div className="relative z-10 space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-violet-600">
                <User className="w-4 h-4" />
                <span>Akun & Informasi</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-violet-600 transition-colors">
                Pengaturan Profil
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Edit kontak WA, rekening/e-wallet, creator code, & target
              </p>
            </div>

            <div className="relative z-10 w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/30 group-hover:scale-110 group-hover:bg-violet-700 transition-all shrink-0">
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        </section>
      </main>

      {/* Reusable Footer */}
      <Footer variant="partner" />

      {/* Logout Confirmation Modal */}
      <CustomConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        variant="warning"
        title="Keluar dari Akun?"
        description="Apakah Anda yakin ingin keluar dari Portal Partner DOPHY? Anda perlu login kembali untuk mengakses dashboard."
        confirmText="Ya, Keluar"
        cancelText="Batal"
      />
    </div>
  );
}
