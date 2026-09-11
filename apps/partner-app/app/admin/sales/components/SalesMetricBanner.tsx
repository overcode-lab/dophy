"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface SalesMetricBannerProps {
  totalOmset: number;
  totalPcs: number;
  totalKomisi: number;
  isLoading?: boolean;
}

export const SalesMetricBanner: React.FC<SalesMetricBannerProps> = ({
  totalOmset,
  totalPcs,
  totalKomisi,
  isLoading = false,
}) => {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-5 sm:p-6 text-white shadow-lg shadow-teal-600/20 space-y-3.5 relative overflow-hidden text-left">
      {/* Decorative ambient glow */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/15 blur-xl pointer-events-none" />

      {/* Row 1: Total Omset */}
      <div className="space-y-0.5 relative z-10">
        <span className="text-[11px] font-bold text-teal-100 uppercase tracking-wider block">
          Total Omset Penjualan
        </span>
        {isLoading ? (
          <div className="py-1 flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-white/90 animate-spin" />
            <span className="text-xs font-semibold text-teal-100 animate-pulse">Memuat data...</span>
          </div>
        ) : (
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Rp {totalOmset.toLocaleString("id-ID")}
          </p>
        )}
      </div>

      {/* Divider 1 */}
      <div className="h-[1px] bg-white/20 relative z-10" />

      {/* Row 2: Snack Terjual */}
      <div className="space-y-0.5 relative z-10">
        <span className="text-[11px] font-bold text-teal-100 uppercase tracking-wider block">
          Total Snack Terjual
        </span>
        {isLoading ? (
          <div className="py-1 flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-white/90 animate-spin" />
            <span className="text-xs font-semibold text-teal-100 animate-pulse">Memuat data...</span>
          </div>
        ) : (
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {totalPcs} Pcs
          </p>
        )}
      </div>

      {/* Divider 2 */}
      <div className="h-[1px] bg-white/20 relative z-10" />

      {/* Row 3: Total Komisi */}
      <div className="space-y-0.5 relative z-10">
        <span className="text-[11px] font-bold text-teal-100 uppercase tracking-wider block">
          Total Creator Royalty Terdistribusi
        </span>
        {isLoading ? (
          <div className="py-1 flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-white/90 animate-spin" />
            <span className="text-xs font-semibold text-teal-100 animate-pulse">Memuat data...</span>
          </div>
        ) : (
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Rp {totalKomisi.toLocaleString("id-ID")}
          </p>
        )}
      </div>
    </div>
  );
};
