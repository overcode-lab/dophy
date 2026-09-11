"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  TrendingUp,
  Wallet,
  Users,
  Package,
  PlusCircle,
  CheckSquare,
  LogOut,
  ShoppingBag,
  ArrowRight,
  Menu,
} from "lucide-react";
import { StatusBadge, CustomConfirmModal, LoadingSpinner, Footer, SideMenu, SideMenuDesktop } from "@repo/ui";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    totalSales: 0,
    totalCommissions: 0,
    activePartners: 0,
    lowStockAlerts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    const storedRole = localStorage.getItem("dophy_role");

    if (!storedUser || storedRole !== "admin") {
      router.push("/admin/login");
      return;
    }

    setAdminUser(JSON.parse(storedUser));
    fetchAdminOverview();
  }, [router]);

  const fetchAdminOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/sales?t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        const salesList = data.data.sales || [];
        const totalSalesSum = salesList.reduce((acc: number, curr: any) => acc + Number(curr.total_price || 0), 0);
        const totalCommSum = salesList.reduce((acc: number, curr: any) => acc + Number(curr.commission_amount || 0), 0);

        setStats({
          totalSales: totalSalesSum,
          totalCommissions: totalCommSum,
          activePartners: data.data.partners?.length || 0,
          lowStockAlerts: data.data.products?.filter((p: any) => p.stock < 20)?.length || 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("dophy_user");
    localStorage.removeItem("dophy_role");
    router.push("/admin/login");
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat dashboard admin..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo-transparent.png"
              alt="DOPHY Admin"
              width={160}
              height={80}
              className="w-28 sm:w-40 h-auto object-contain anim-logo-playful drop-shadow-xs"
            />
            <span className="text-xs font-black uppercase tracking-wider bg-dophy-50 text-dophy-700 px-3 py-1 rounded-full border border-dophy-200 flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-dophy-600" />
              <span>Admin</span>
            </span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Desktop Sticky SideMenu */}
          <SideMenuDesktop onLogoutClick={() => setShowLogoutModal(true)} />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {/* Admin Title */}
            <section className="text-left space-y-3.5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                  Command Center 🚀
                </h1>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Ringkasan performa ekosistem partner, arus penjualan snack, stok produk, dan verifikasi penarikan
                  Creator Royalty.
                </p>
              </div>

              <div>
                <Link
                  href="/admin/sales/new"
                  className="group inline-flex items-center gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-white hover:bg-orange-50/60 border border-orange-200 hover:border-dophy-400 text-slate-800 hover:text-dophy-700 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5 text-dophy-600 group-hover:rotate-90 group-hover:scale-110 transition-transform duration-300 shrink-0" />
                  <span className="text-sm font-black tracking-normal">Input Transaksi Baru</span>
                </Link>
              </div>
            </section>

            {/* Line Separator */}
            <div className="py-0.5 flex items-center">
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rounded-full shadow-xs shadow-orange-500/20" />
            </div>

            {/* 4 METRICS CARDS GRID (2 TOP, 2 BOTTOM - SOLID VIBRANT CARDS) */}
            <section className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Card 1: Total Penjualan */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 p-3.5 sm:p-5 shadow-lg shadow-emerald-600/20 text-left flex flex-col justify-between min-h-[105px] sm:min-h-[115px] border border-emerald-400/30"
              >
                <TrendingUp className="absolute -right-3 -bottom-3 w-16 sm:w-24 h-16 sm:h-24 text-white/15 stroke-[1.2] pointer-events-none" />
                <div className="flex items-center justify-between gap-1 relative z-10">
                  <span className="text-[10px] sm:text-xs font-black text-emerald-100 uppercase tracking-wider leading-tight">
                    Total Penjualan
                  </span>
                  <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-xs text-white border border-white/30 shrink-0 shadow-xs">
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <h3 className="text-sm sm:text-2xl font-black text-white relative z-10 truncate mt-2 drop-shadow-xs">
                  Rp {Number(stats.totalSales).toLocaleString("id-ID")}
                </h3>
              </motion.div>

              {/* Card 2: Royalti Terhitung */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-dophy-600 via-orange-500 to-amber-500 p-3.5 sm:p-5 shadow-lg shadow-dophy-600/20 text-left flex flex-col justify-between min-h-[105px] sm:min-h-[115px] border border-orange-400/30"
              >
                <Wallet className="absolute -right-3 -bottom-3 w-16 sm:w-24 h-16 sm:h-24 text-white/15 stroke-[1.2] pointer-events-none" />
                <div className="flex items-center justify-between gap-1 relative z-10">
                  <span className="text-[10px] sm:text-xs font-black text-orange-100 uppercase tracking-wider leading-tight">
                    Creator Royalty
                  </span>
                  <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-xs text-white border border-white/30 shrink-0 shadow-xs">
                    <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <h3 className="text-sm sm:text-2xl font-black text-white relative z-10 truncate mt-2 drop-shadow-xs">
                  Rp {Number(stats.totalCommissions).toLocaleString("id-ID")}
                </h3>
              </motion.div>

              {/* Card 3: Partner Aktif */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 p-3.5 sm:p-5 shadow-lg shadow-blue-600/20 text-left flex flex-col justify-between min-h-[105px] sm:min-h-[115px] border border-blue-400/30"
              >
                <Users className="absolute -right-3 -bottom-3 w-16 sm:w-24 h-16 sm:h-24 text-white/15 stroke-[1.2] pointer-events-none" />
                <div className="flex items-center justify-between gap-1 relative z-10">
                  <span className="text-[10px] sm:text-xs font-black text-blue-100 uppercase tracking-wider leading-tight">
                    Partner Aktif
                  </span>
                  <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-xs text-white border border-white/30 shrink-0 shadow-xs">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <h3 className="text-sm sm:text-2xl font-black text-white relative z-10 truncate mt-2 drop-shadow-xs">
                  {stats.activePartners} Partner
                </h3>
              </motion.div>

              {/* Card 4: Alert Stok */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-purple-600 p-3.5 sm:p-5 shadow-lg shadow-rose-600/20 text-left flex flex-col justify-between min-h-[105px] sm:min-h-[115px] border border-rose-400/30"
              >
                <Package className="absolute -right-3 -bottom-3 w-16 sm:w-24 h-16 sm:h-24 text-white/15 stroke-[1.2] pointer-events-none" />
                <div className="flex items-center justify-between gap-1 relative z-10">
                  <span className="text-[10px] sm:text-xs font-black text-rose-100 uppercase tracking-wider leading-tight">
                    Persediaan
                  </span>
                  <div className="p-1 sm:p-2 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-xs text-white border border-white/30 shrink-0 shadow-xs">
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <h3 className="text-sm sm:text-2xl font-black text-white relative z-10 truncate mt-2 drop-shadow-xs">
                  {stats.lowStockAlerts === 0 ? "Stok Aman" : `${stats.lowStockAlerts} Produk Menipis`}
                </h3>
              </motion.div>
            </section>

            {/* Line Separator */}
            <div className="py-0.5 flex items-center">
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rounded-full shadow-xs shadow-orange-500/20" />
            </div>

            {/* ADMIN QUICK NAVIGATION */}
            <section className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: Riwayat Penjualan */}
                <Link
                  href="/admin/sales"
                  className="group relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-orange-50/70 backdrop-blur-xl border border-orange-200/80 shadow-md shadow-orange-500/5 hover:shadow-xl hover:shadow-orange-500/15 hover:border-dophy-400 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-between text-left"
                >
                  {/* Background Illustration Icon */}
                  <ShoppingBag className="absolute -right-4 -bottom-4 w-32 h-32 text-dophy-500/10 group-hover:text-dophy-500/20 group-hover:scale-110 transition-all duration-500 stroke-[1.2] pointer-events-none" />

                  <div className="relative z-10 max-w-[80%]">
                    <h4 className="text-base font-black text-slate-900 group-hover:text-dophy-600 transition-colors">
                      Transaksi Penjualan
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">
                      Kelola dan pantau seluruh transaksi penjualan & royalti.
                    </p>
                  </div>

                  <div className="relative z-10 w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-dophy-600 group-hover:text-white group-hover:scale-110 transition-all shadow-xs shrink-0">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>

                {/* Card 2: Approval Penarikan */}
                <Link
                  href="/admin/withdrawals"
                  className="group relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-emerald-50/70 backdrop-blur-xl border border-emerald-200/80 shadow-md shadow-emerald-500/5 hover:shadow-xl hover:shadow-emerald-500/15 hover:border-emerald-400 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-between text-left"
                >
                  {/* Background Illustration Icon */}
                  <CheckSquare className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/10 group-hover:text-emerald-500/20 group-hover:scale-110 transition-all duration-500 stroke-[1.2] pointer-events-none" />

                  <div className="relative z-10 max-w-[80%]">
                    <h4 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Approval Penarikan
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">
                      Verifikasi pencairan saldo & upload bukti transfer bank.
                    </p>
                  </div>

                  <div className="relative z-10 w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110 transition-all shadow-xs shrink-0">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>

                {/* Card 3: Kelola Creator Partner */}
                <Link
                  href="/admin/partners"
                  className="group relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-sky-50/70 backdrop-blur-xl border border-sky-200/80 shadow-md shadow-sky-500/5 hover:shadow-xl hover:shadow-sky-500/15 hover:border-sky-400 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-between text-left"
                >
                  {/* Background Illustration Icon */}
                  <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-sky-500/10 group-hover:text-sky-500/20 group-hover:scale-110 transition-all duration-500 stroke-[1.2] pointer-events-none" />

                  <div className="relative z-10 max-w-[80%]">
                    <h4 className="text-base font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                      Kelola Creator Partner
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">
                      Atur status aktif/nonaktif partner & target penjualan.
                    </p>
                  </div>

                  <div className="relative z-10 w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white group-hover:scale-110 transition-all shadow-xs shrink-0">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>

                {/* Card 4: Katalog Produk */}
                <Link
                  href="/admin/products"
                  className="group relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-amber-50/70 backdrop-blur-xl border border-amber-200/80 shadow-md shadow-amber-500/5 hover:shadow-xl hover:shadow-amber-500/15 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-between text-left"
                >
                  {/* Background Illustration Icon */}
                  <Package className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500/10 group-hover:text-amber-500/20 group-hover:scale-110 transition-all duration-500 stroke-[1.2] pointer-events-none" />

                  <div className="relative z-10 max-w-[80%]">
                    <h4 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                      Katalog Produk
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">
                      Update stok persediaan snack & harga jual produk.
                    </p>
                  </div>

                  <div className="relative z-10 w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white group-hover:scale-110 transition-all shadow-xs shrink-0">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Reusable Attractive Footer */}
      <Footer variant="admin" />

      {/* Admin Navigation SideMenu */}
      <SideMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLogoutClick={() => setShowLogoutModal(true)}
      />

      {/* Admin Logout Confirmation Modal */}
      <CustomConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        variant="warning"
        title="Keluar dari Panel Admin?"
        description="Apakah Anda yakin ingin keluar dari Admin Panel DOPHY Operations? Sesi admin Anda akan diakhiri."
        confirmText="Ya, Keluar"
        cancelText="Batal"
      />
    </div>
  );
}
