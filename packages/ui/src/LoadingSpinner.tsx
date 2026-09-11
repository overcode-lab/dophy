"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  text?: string;
  fullPage?: boolean;
  size?: "sm" | "md" | "lg";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = "Memuat data...",
  fullPage = false,
  size = "md",
}) => {
  const isSm = size === "sm";

  const content = (
    <div className={`flex flex-col items-center justify-center ${isSm ? "p-3 space-y-2.5" : "p-6 space-y-3.5"} text-center z-20`}>
      {/* Sleek Dual-Orbit Spinner with Soft Gradient Pulse */}
      <div className={`relative ${isSm ? "w-12 h-12" : "w-16 h-16"} flex items-center justify-center`}>
        {/* Ambient Soft Glow Aura */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-dophy-500/20 via-orange-400/20 to-amber-300/20 blur-lg animate-pulse" />

        {/* Outer Fast Orbit Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[2.5px] border-slate-200/40 border-t-dophy-600 border-r-orange-500 shadow-2xs"
        />

        {/* Counter-rotating Inner Orbit Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
          className="absolute inset-1.5 rounded-full border-[1.5px] border-transparent border-b-dophy-400 border-l-amber-400 opacity-80"
        />

        {/* Center Floating Brand Icon */}
        <motion.div
          animate={{ scale: [0.94, 1.06, 0.94] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="relative z-10 flex items-center justify-center"
        >
          <img
            src="/assets/logo-transparent.png"
            alt="DOPHY"
            className={`${isSm ? "w-7" : "w-9"} h-auto object-contain drop-shadow-xs`}
            onError={(e) => {
              // Fallback to stylized dot if logo asset not available
              e.currentTarget.style.display = "none";
            }}
          />
        </motion.div>
      </div>

      {/* Elegant Typography Label (No Box, No Card Wrapper) */}
      <div className="space-y-0.5">
        <motion.p
          animate={{ opacity: [0.75, 1, 0.75] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="text-xs sm:text-[13px] font-bold text-slate-600 tracking-tight"
        >
          {text}
        </motion.p>
        {fullPage && (
          <p className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-widest">
            DOPHY OFFICIAL SYSTEM
          </p>
        )}
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-slate-50/90 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full flex items-center justify-center"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return content;
};
