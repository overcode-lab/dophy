"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  text?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = "Memuat data...",
  fullPage = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center z-50">
      {/* Sleek Double-Orbit Spinner with Glowing Aura & Floating Logo (No Card Wrapper) */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Ambient Soft Glow Background Aura */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-dophy-500/20 to-orange-500/20 blur-xl animate-pulse" />

        {/* Outer Orbit Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[2.5px] border-orange-100 border-t-dophy-600 border-r-orange-500"
        />

        {/* Counter-rotating Inner Orbit Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
          className="absolute inset-2 rounded-full border-[1.5px] border-transparent border-b-dophy-400 border-l-amber-400 opacity-70"
        />

        {/* Center Floating Brand Icon / Logo (No Box / No Card Wrapper) */}
        <motion.div
          animate={{ scale: [0.92, 1.08, 0.92] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative z-10 flex items-center justify-center"
        >
          <img
            src="/assets/logo-transparent.png"
            alt="DOPHY"
            className="w-12 h-auto object-contain drop-shadow-xs"
            onError={(e) => {
              // Fallback if image path fails in non-app contexts
              e.currentTarget.style.display = "none";
            }}
          />
        </motion.div>
      </div>

      {/* Modern Shimmering Text Label */}
      <div className="space-y-1">
        <motion.p
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="text-xs sm:text-sm font-black bg-gradient-to-r from-dophy-600 via-orange-500 to-amber-600 bg-clip-text text-transparent tracking-tight"
        >
          {text}
        </motion.p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          DOPHY OFFICIAL SYSTEM
        </p>
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
