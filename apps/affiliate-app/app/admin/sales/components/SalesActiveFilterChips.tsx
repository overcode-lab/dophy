"use client";

import React from "react";
import { Calendar, CalendarRange, Package, RotateCcw } from "lucide-react";
import { DateFilterType, DateState, MONTH_NAMES, QUICK_DATE_OPTIONS } from "../types";

interface SalesActiveFilterChipsProps {
  isFilterActive: boolean;
  dateType: DateFilterType;
  specificDate: DateState | null;
  rangeStartDate: DateState | null;
  rangeEndDate: DateState | null;
  selectedProduct: string;
  selectedReferral: string;
  onReset: () => void;
}

export const SalesActiveFilterChips: React.FC<SalesActiveFilterChipsProps> = ({
  isFilterActive,
  dateType,
  specificDate,
  rangeStartDate,
  rangeEndDate,
  selectedProduct,
  selectedReferral,
  onReset,
}) => {
  if (!isFilterActive) return null;

  const quickPresetOption = QUICK_DATE_OPTIONS.find((opt) => opt.id === dateType);

  return (
    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
      <span className="text-[11px] font-bold text-slate-400 mr-1">Filter Aktif:</span>

      {/* Quick Preset Chip */}
      {quickPresetOption && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-dophy-50 text-dophy-800 border border-dophy-200/80 font-bold text-[10.5px]">
          <Calendar className="w-3 h-3 text-dophy-600" />
          <span>{quickPresetOption.label}</span>
        </span>
      )}

      {/* Specific Date Chip */}
      {dateType === "specific" && specificDate && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-bold text-[10.5px]">
          <Calendar className="w-3 h-3" />
          <span>{`${specificDate.day} ${MONTH_NAMES[specificDate.month - 1]} ${specificDate.year}`}</span>
        </span>
      )}

      {/* Date Range Chip */}
      {dateType === "range" && (rangeStartDate || rangeEndDate) && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 font-bold text-[10.5px]">
          <CalendarRange className="w-3 h-3" />
          <span>
            {rangeStartDate
              ? `${rangeStartDate.day} ${MONTH_NAMES[rangeStartDate.month - 1].slice(0, 3)}`
              : "Awal"}
            {" - "}
            {rangeEndDate
              ? `${rangeEndDate.day} ${MONTH_NAMES[rangeEndDate.month - 1].slice(0, 3)} ${rangeEndDate.year}`
              : "Akhir"}
          </span>
        </span>
      )}

      {/* Product Filter Chip */}
      {selectedProduct !== "all" && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 font-bold text-[10.5px]">
          <Package className="w-3 h-3" />
          <span>{selectedProduct}</span>
        </span>
      )}

      {/* Referral Filter Chip */}
      {selectedReferral !== "all" && (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 font-bold text-[10.5px]">
          <span>
            {selectedReferral === "none" ? "Tanpa Referral" : selectedReferral}
          </span>
        </span>
      )}

      {/* Quick Reset Button */}
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10.5px] font-bold cursor-pointer transition-colors"
      >
        <RotateCcw className="w-2.5 h-2.5" />
        <span>Reset</span>
      </button>
    </div>
  );
};
