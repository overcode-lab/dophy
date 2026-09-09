"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, ShieldAlert } from "lucide-react";

export interface CustomConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "success" | "info";
  isLoading?: boolean;
}

export function CustomConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "warning",
  isLoading = false,
}: CustomConfirmModalProps) {
  const iconMap = {
    danger: <ShieldAlert className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
    info: <Info className="w-6 h-6 text-dophy-600" />,
  };

  const bgGlowMap = {
    danger: "from-rose-500/20 via-pink-500/10 to-transparent",
    warning: "from-amber-500/20 via-orange-500/10 to-transparent",
    success: "from-emerald-500/20 via-teal-500/10 to-transparent",
    info: "from-dophy-500/20 via-sky-500/10 to-transparent",
  };

  const iconBadgeMap = {
    danger: "bg-rose-50/90 border-rose-200 text-rose-600 shadow-rose-500/15",
    warning: "bg-amber-50/90 border-amber-200 text-amber-600 shadow-amber-500/15",
    success: "bg-emerald-50/90 border-emerald-200 text-emerald-600 shadow-emerald-500/15",
    info: "bg-dophy-50/90 border-dophy-200 text-dophy-600 shadow-dophy-500/15",
  };

  const confirmBtnMap = {
    danger: "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg shadow-rose-500/25",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25",
    success: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25",
    info: "bg-gradient-to-r from-dophy-600 to-orange-500 hover:from-dophy-700 hover:to-orange-600 text-white shadow-lg shadow-dophy-500/25",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay with Glass Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
          />

          {/* Dialog Panel - Premium Glassmorphism Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: "spring", damping: 26, stiffness: 360 }}
            className="relative w-full max-w-[400px] bg-white/90 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)] border border-white/80 ring-1 ring-slate-900/5 z-10 space-y-5 text-left overflow-hidden"
          >
            {/* Top Ambient Glow inside card */}
            <div className={`absolute -top-16 -left-16 w-44 h-44 bg-gradient-to-br ${bgGlowMap[variant]} rounded-full blur-2xl opacity-70 pointer-events-none`} />

            {/* Header: Icon Badge & Close Button */}
            <div className="relative flex items-center justify-between gap-3">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-sm backdrop-blur-sm ${iconBadgeMap[variant]}`}>
                {iconMap[variant]}
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Content */}
            <div className="relative space-y-2.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {title}
              </h3>
              <p className="text-sm sm:text-base font-semibold text-slate-600 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Footer Action Buttons (Stacked Vertically - 1 Full Row Per Button) */}
            <div className="relative flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`w-full py-3.5 px-6 rounded-2xl text-sm font-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer ${confirmBtnMap[variant]}`}
              >
                {isLoading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{confirmText}</span>
              </button>

              {cancelText && (
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full py-3 px-5 rounded-2xl border border-slate-200/90 bg-white/80 hover:bg-slate-100/90 text-sm font-extrabold text-slate-700 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {cancelText}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
