"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
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
      className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-dophy-300 hover:shadow-md transition-all space-y-2 relative overflow-hidden text-left cursor-pointer active:scale-[0.98] group"
    >
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
          <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-mono font-extrabold text-xs border border-purple-200/80 shadow-2xs">
            {sale.referral_code}
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-500 font-semibold text-xs border border-slate-200/80 shadow-2xs">
            Tanpa Creator Code
          </span>
        )}
      </div>
    </motion.div>
  );
};
