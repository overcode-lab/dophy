"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface ResponsiveDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function ResponsiveDetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: ResponsiveDetailModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity cursor-pointer"
          />

          {/* Modal Centering / Positioning Wrapper */}
          <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4 text-center">
            {/* Modal Container: Fullscreen on Mobile (< sm), Centered Card Box on Desktop (>= sm) */}
            <motion.div
              initial={{ y: "100%", opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] sm:max-w-lg bg-white rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border sm:border-slate-100 flex flex-col z-10 overflow-hidden text-left mx-auto"
            >
              {/* Top Handle Indicator for Mobile */}
              <div className="sm:hidden w-full flex items-center justify-center pt-3 pb-1 shrink-0">
                <div className="w-12 h-1.5 rounded-full bg-slate-200" />
              </div>

              {/* Modal Header */}
              <div className="px-4 sm:px-6 pt-3 pb-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-white sticky top-0 z-20 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
                  {subtitle && <p className="text-xs font-medium text-slate-500 mt-0.5">{subtitle}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5 overflow-y-auto space-y-4 font-sans text-slate-700 text-sm">
                {children}
              </div>

              {/* Optional Modal Footer */}
              {footer && (
                <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-end gap-3 sticky bottom-0 z-20 shrink-0">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
