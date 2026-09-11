"use client";

import React from "react";
import { DateFilterType, QUICK_DATE_OPTIONS, QuickDatePreset } from "../types";

interface SalesQuickFilterChipsProps {
  activeDateType: DateFilterType;
  onSelectPreset: (preset: QuickDatePreset) => void;
  onClear: () => void;
}

export const SalesQuickFilterChips: React.FC<SalesQuickFilterChipsProps> = ({
  activeDateType,
  onSelectPreset,
  onClear,
}) => {
  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 select-none"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* "Semua" chip */}
      <button
        type="button"
        onClick={onClear}
        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer active:scale-95 ${
          activeDateType === "all"
            ? "bg-slate-900 text-white shadow-2xs shadow-slate-900/20"
            : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 shadow-2xs"
        }`}
      >
        Semua
      </button>

      {/* Preset date chips */}
      {QUICK_DATE_OPTIONS.map((opt) => {
        const isActive = activeDateType === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              if (isActive) {
                onClear();
              } else {
                onSelectPreset(opt.id);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5 ${
              isActive
                ? "bg-dophy-600 text-white shadow-md shadow-dophy-600/25 ring-2 ring-dophy-200"
                : "bg-white text-slate-700 hover:text-dophy-700 hover:bg-dophy-50/50 border border-slate-200/90 shadow-2xs"
            }`}
          >
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
