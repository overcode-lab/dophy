"use client";

import React from "react";
import Image from "next/image";

interface FooterProps {
  variant?: "admin" | "partner";
}

export const Footer: React.FC<FooterProps> = ({ variant = "partner" }) => {
  const isAdmin = variant === "admin";

  return (
    <footer className="max-w-5xl mx-auto px-4 pt-10 pb-8 text-center space-y-5 relative z-10">
      {/* Top Warm Glow Divider Line */}
      <div className="py-1 flex items-center">
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-orange-500/80 to-transparent rounded-full shadow-xs shadow-orange-500/20" />
      </div>

      {/* Main Footer Content */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <Image
            src="/assets/logo-transparent.png"
            alt="DOPHY Logo"
            width={120}
            height={60}
            className="w-24 h-auto object-contain anim-logo-playful drop-shadow-xs"
          />
          <span className="text-slate-300 font-light">|</span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
            {isAdmin ? "Admin Control Panel" : "Mitra Creator Portal"}
          </span>
        </div>

        {/* Middle: Feature Badges */}
        <div className="flex items-center gap-2 text-[10px] font-extrabold">
          <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200/60">
            🍿 Dopamine Snack
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60">
            ⚡ Real-Time System
          </span>
        </div>

        {/* Right: Copyright */}
        <p className="text-[11px] text-slate-400 font-medium">
          © {new Date().getFullYear()} DOPHY. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
