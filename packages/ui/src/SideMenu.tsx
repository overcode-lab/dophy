"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LayoutDashboard,
  ShoppingBag,
  CheckSquare,
  Users,
  Package,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Home,
} from "lucide-react";

export interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutClick?: () => void;
}

export interface SideMenuDesktopProps {
  onLogoutClick?: () => void;
  className?: string;
}

const navigationItems = [
  {
    title: "Dashboard",
    subtitle: "Ringkasan performa & statistik",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    iconBg: "bg-orange-50 text-dophy-600 border-orange-200/90",
    activeBg: "bg-orange-500/10 border-dophy-400 text-dophy-950 shadow-xs ring-1 ring-dophy-500/20",
  },
  {
    title: "Transaksi Penjualan",
    subtitle: "Daftar transaksi & royalti",
    href: "/admin/sales",
    icon: ShoppingBag,
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200/90",
    activeBg: "bg-emerald-500/10 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-500/20",
  },
  {
    title: "Approval Penarikan",
    subtitle: "Verifikasi payout dana",
    href: "/admin/withdrawals",
    icon: CheckSquare,
    iconBg: "bg-sky-50 text-sky-600 border-sky-200/90",
    activeBg: "bg-sky-500/10 border-sky-400 text-sky-950 shadow-xs ring-1 ring-sky-500/20",
  },
  {
    title: "Creator Partner",
    subtitle: "Kelola Creator Partner",
    href: "/admin/partners",
    icon: Users,
    iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200/90",
    activeBg: "bg-indigo-500/10 border-indigo-400 text-indigo-950 shadow-xs ring-1 ring-indigo-500/20",
  },
  {
    title: "Katalog Produk & Stok",
    subtitle: "Varian snack & harga",
    href: "/admin/products",
    icon: Package,
    iconBg: "bg-amber-50 text-amber-600 border-amber-200/90",
    activeBg: "bg-amber-500/10 border-amber-400 text-amber-950 shadow-xs ring-1 ring-amber-500/20",
  },
];

/**
 * Shared Menu Links Content
 */
function SideMenuNavLinks({ onItemClick, isDesktop = false }: { onItemClick?: () => void; isDesktop?: boolean }) {
  const pathname = usePathname();

  return (
    <div className="space-y-1.5">
      {/* Mobile only section label */}
      {!isDesktop && (
        <div className="px-2 py-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Menu Operasional</span>
        </div>
      )}

      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        const IconComponent = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={`group relative p-2.5 sm:p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              isActive
                ? item.activeBg
                : "bg-white/60 hover:bg-white/90 border-slate-200/70 hover:border-slate-300 text-slate-700 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${
                  isActive ? "bg-white text-dophy-600 border-orange-200 shadow-xs" : item.iconBg
                }`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <h4
                  className={`text-xs sm:text-sm font-black tracking-tight truncate ${
                    isActive ? "text-slate-900" : "text-slate-800 group-hover:text-dophy-600"
                  }`}
                >
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium truncate">{item.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {isActive ? (
                <span className="w-2 h-2 rounded-full bg-dophy-500 ring-4 ring-dophy-500/20" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              )}
            </div>
          </Link>
        );
      })}

      {/* Landing Page Link */}
      <div className="pt-2 px-0.5">
        {!isDesktop && (
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
            Website Publik
          </span>
        )}
        <Link
          href="/"
          onClick={onItemClick}
          className="group relative p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-purple-500/10 border border-purple-200/90 hover:border-purple-300 flex items-center justify-between gap-3 text-left transition-all shadow-2xs"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/80 flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105">
              <Home className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <h4 className="text-xs sm:text-sm font-black tracking-tight text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                Landing Page
              </h4>
              <p className="text-[10px] text-slate-500 font-medium truncate">Halaman utama website DOPHY</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      </div>
    </div>
  );
}

/**
 * 📱 MOBILE SLIDE-IN SIDEMENU (WIDTH: 80%, GLASSMORPHISM, SLIDE FROM LEFT TO RIGHT)
 */
export function SideMenu({ isOpen, onClose, onLogoutClick }: SideMenuProps) {
  const handleLogout = () => {
    onClose();
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("dophy_user");
        localStorage.removeItem("dophy_role");
        window.location.href = "/admin/login";
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          {/* Backdrop Overlay with Glass Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity cursor-pointer"
          />

          {/* SideMenu Panel: 80% width with Glassmorphism */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed top-0 bottom-0 left-0 w-[80%] max-w-[340px] bg-white/85 backdrop-blur-2xl h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden border-r border-white/60 text-left"
          >
            {/* Ambient Glass Glow */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Header: Brand & Close Button */}
            <div className="p-4 border-b border-slate-200/60 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/assets/logo-transparent.png"
                  alt="DOPHY Logo"
                  width={130}
                  height={55}
                  className="w-24 sm:w-28 h-auto object-contain drop-shadow-xs"
                />
                <span className="text-[10px] font-black uppercase tracking-wider bg-dophy-50/90 text-dophy-700 px-2 py-0.5 rounded-full border border-dophy-200/80 flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-dophy-600" />
                  <span>Admin</span>
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
                title="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Middle: Navigation Links */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-1 relative z-10">
              <SideMenuNavLinks onItemClick={onClose} isDesktop={false} />
            </div>

            {/* Bottom Footer: Logout */}
            <div className="p-3.5 border-t border-slate-200/60 bg-white/40 backdrop-blur-md relative z-10 space-y-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-rose-500"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>

              <p className="text-[10px] text-center text-slate-400 font-semibold">
                DOPHY Operations v1.0 • © {new Date().getFullYear()}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * 🖥️ DESKTOP STICKY SIDEMENU (ALWAYS VISIBLE ON DESKTOP, POSITION STICKY, HEIGHT FITS CONTENT)
 */
export function SideMenuDesktop({ onLogoutClick, className = "" }: SideMenuDesktopProps) {
  const handleLogout = () => {
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("dophy_user");
        localStorage.removeItem("dophy_role");
        window.location.href = "/admin/login";
      }
    }
  };

  return (
    <aside
      className={`hidden lg:flex flex-col w-64 xl:w-72 shrink-0 sticky top-20 h-fit bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-3.5 sm:p-4 shadow-sm space-y-3 text-left z-20 ${className}`}
    >
      {/* Navigation Links (Directly without top logo/badge duplicate & without label) */}
      <SideMenuNavLinks isDesktop={true} />

      {/* Logout Action */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-rose-500"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
