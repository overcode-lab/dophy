"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Receipt } from "lucide-react";
import { SaleItem } from "../types";

interface SalesCardProps {
  sale: SaleItem;
  index: number;
  onClick: () => void;
}

export const SalesCard: React.FC<SalesCardProps> = ({ sale, index, onClick }) => {
  const hasReferral = Boolean(
    sale.referral_code &&
      sale.referral_code.trim() !== "" &&
      sale.referral_code !== "Tanpa Referral"
  );

  const txDate = new Date(sale.transaction_date);
  const formattedDate = txDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime =
    txDate
      .toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(":", ".") + " WIB";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      onClick={onClick}
      className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-white via-slate-50/60 to-orange-50/30 border border-slate-200/90 shadow-2xs hover:border-dophy-400/80 hover:shadow-md transition-all space-y-2 relative overflow-hidden text-left cursor-pointer active:scale-[0.98] group"
    >
      {/* Background Watermark Illustration */}
      <div className="absolute -right-2 -bottom-2 text-slate-900/[0.04] group-hover:text-dophy-500/[0.08] transition-all duration-300 pointer-events-none -rotate-12 group-hover:scale-110 group-hover:rotate-[-6deg]">
        <Receipt className="w-20 h-20 stroke-[1.2]" />
      </div>

      <div className="relative z-10 space-y-2">
        {/* Row 1: Product Name */}
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-black text-slate-900 group-hover:text-dophy-600 transition-colors truncate">
            {sale.products?.name || "DOPHY Snack"}
          </h4>
        </div>

        {/* Row 2: Date & Time Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70 font-semibold text-[10.5px]">
            <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
            <span>{formattedDate}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/70 font-semibold text-[10.5px]">
            <Clock className="w-3 h-3 text-purple-500 shrink-0" />
            <span>{formattedTime}</span>
          </span>
        </div>

        {/* Row 3: Quantity & Creator Code Chips */}
        <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-xl bg-orange-50 text-dophy-700 font-extrabold text-xs border border-orange-200/80 shadow-2xs">
            {sale.quantity} Pcs
          </span>
          {hasReferral ? (
            <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-mono font-extrabold text-xs border border-emerald-200/80 shadow-2xs">
              {sale.referral_code}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 font-semibold text-xs border border-slate-200/80 shadow-2xs">
              Tanpa Creator Code
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
