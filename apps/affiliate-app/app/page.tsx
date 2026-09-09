"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Award, UserPlus, LogIn } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between relative overflow-hidden">
      {/* Background Decorator Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-dophy-100/60 rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl opacity-60" />
      </div>

      {/* Header Bar */}
      <header className="max-w-6xl mx-auto w-full px-5 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/logo-transparent.png"
            alt="DOPHY Logo"
            width={260}
            height={130}
            priority
            className="w-44 sm:w-60 md:w-72 h-auto object-contain anim-logo-playful drop-shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/affiliate/login"
            className="px-4 py-2 rounded-xl bg-dophy-600 hover:bg-dophy-700 text-white text-xs font-black shadow-md shadow-dophy-500/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <span>Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto w-full px-5 py-6 sm:py-12 text-left sm:text-center z-10 space-y-6 sm:space-y-8 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3 sm:space-y-4"
        >
          <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-slate-900 max-w-4xl sm:mx-auto leading-[1.15]">
            Ubah Hobi Ngemil & Share Kode Referral Jadi <span className="text-dophy-600">Penghasilan Nyata</span> 🍿💸
          </h1>
          <p className="text-slate-600 text-sm sm:text-lg max-w-2xl sm:mx-auto font-medium leading-relaxed">
            Bergabunglah sebagai Mitra Creator DOPHY! Dapatkan komisi menarik dari setiap penjualan produk snack DOPHY. Pantau akumulasi komisi secara real-time dan cairkan dana kapan saja langsung ke rekening bank atau e-wallet milikmu.
          </p>
        </motion.div>

        {/* Aesthetic Glassy Rectangular Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl sm:mx-auto pt-2 text-left"
        >
          {/* Card 1: Masuk / Login Affiliator */}
          <Link
            href="/affiliate/login"
            className="group relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-xl shadow-slate-200/50 hover:border-dophy-400 hover:shadow-dophy-500/15 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-between"
          >
            {/* Background Illustration Icon */}
            <LogIn className="absolute -right-3 -bottom-3 w-28 h-28 text-dophy-500/10 group-hover:text-dophy-500/20 group-hover:scale-110 transition-all duration-500 stroke-[1.2] pointer-events-none" />

            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-dophy-600">
                <LogIn className="w-4 h-4" />
                <span>Portal Mitra</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-dophy-600 transition-colors">
                Masuk / Login
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Pantau saldo komisi & histori</p>
            </div>

            <div className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-dophy-600 text-white flex items-center justify-center shadow-md shadow-dophy-500/30 group-hover:scale-110 group-hover:bg-dophy-700 transition-all">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Daftar Mitra Baru */}
          <Link
            href="/affiliate/register"
            className="group relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-xl shadow-slate-200/50 hover:border-dophy-400 hover:shadow-dophy-500/15 transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-between"
          >
            {/* Background Illustration Icon */}
            <UserPlus className="absolute -right-3 -bottom-3 w-28 h-28 text-dophy-500/10 group-hover:text-dophy-500/20 group-hover:scale-110 transition-all duration-500 stroke-[1.2] pointer-events-none" />

            <div className="relative z-10 space-y-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600">
                <UserPlus className="w-4 h-4" />
                <span>Mitra Baru</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-dophy-600 transition-colors">
                Daftar Mitra
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Dapatkan Kode Referral unik</p>
            </div>

            <div className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20 group-hover:scale-110 group-hover:bg-dophy-600 transition-all">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </motion.div>

        {/* Feature Highlights Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-center gap-2 sm:gap-6 text-xs font-bold text-slate-500 pt-3 sm:pt-6"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-dophy-500" />
            <span>Kode Referral Unik</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Komisi Real-Time</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Pencairan Transparan</span>
          </div>
        </motion.div>
      </section>

      {/* Shortened Clean Footer */}
      <footer className="max-w-6xl mx-auto w-full px-5 py-4 text-left sm:text-center text-xs font-semibold text-slate-400 border-t border-slate-200/60 z-10">
        © {new Date().getFullYear()} DOPHY. All rights reserved.
      </footer>
    </main>
  );
}
