"use client";

import React, { useState } from "react";
import { ResponsiveDetailModal } from "@repo/ui";
import { Calendar, CalendarRange, RotateCcw } from "lucide-react";
import { DateFilterType, DateState, MONTH_NAMES, QUICK_DATE_OPTIONS } from "../types";
import { SalesDatePickerModal } from "./SalesDatePickerModal";

interface UniqueReferral {
  code: string;
  name: string;
}

interface SalesFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateType: DateFilterType;
  setDateType: (type: DateFilterType) => void;
  specificDate: DateState | null;
  setSpecificDate: (date: DateState | null) => void;
  rangeStartDate: DateState | null;
  setRangeStartDate: (date: DateState | null) => void;
  rangeEndDate: DateState | null;
  setRangeEndDate: (date: DateState | null) => void;
  selectedProduct: string;
  setSelectedProduct: (product: string) => void;
  selectedReferral: string;
  setSelectedReferral: (referral: string) => void;
  uniqueProducts: string[];
  uniqueReferrals: UniqueReferral[];
  onReset: () => void;
}

export const SalesFilterModal: React.FC<SalesFilterModalProps> = ({
  isOpen,
  onClose,
  dateType,
  setDateType,
  specificDate,
  setSpecificDate,
  rangeStartDate,
  setRangeStartDate,
  rangeEndDate,
  setRangeEndDate,
  selectedProduct,
  setSelectedProduct,
  selectedReferral,
  setSelectedReferral,
  uniqueProducts,
  uniqueReferrals,
  onReset,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<"specific" | "rangeStart" | "rangeEnd">("specific");

  const openPicker = (target: "specific" | "rangeStart" | "rangeEnd") => {
    setDatePickerTarget(target);
    setIsDatePickerOpen(true);
  };

  const handleSaveDate = (savedDate: DateState) => {
    if (datePickerTarget === "specific") {
      setSpecificDate(savedDate);
    } else if (datePickerTarget === "rangeStart") {
      setRangeStartDate(savedDate);
    } else if (datePickerTarget === "rangeEnd") {
      setRangeEndDate(savedDate);
    }
  };

  const getDatePickerTitle = () => {
    switch (datePickerTarget) {
      case "rangeStart":
        return "Pilih Tanggal Mulai";
      case "rangeEnd":
        return "Pilih Tanggal Akhir";
      default:
        return "Pilih Tanggal Spesifik";
    }
  };

  const getCurrentInitialDate = (): DateState | null => {
    switch (datePickerTarget) {
      case "rangeStart":
        return rangeStartDate;
      case "rangeEnd":
        return rangeEndDate;
      default:
        return specificDate;
    }
  };

  return (
    <>
      <ResponsiveDetailModal
        isOpen={isOpen}
        onClose={onClose}
        title="Filter Transaksi"
        subtitle=""
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-2xl bg-dophy-600 hover:bg-dophy-700 text-white font-black text-xs shadow-md shadow-dophy-600/25 transition-all cursor-pointer active:scale-95"
            >
              Terapkan Filter
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-left">
          {/* 1. Filter Tanggal Section */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-900 block flex items-center justify-between">
              <span>Periode / Tanggal Transaksi</span>
              <span className="text-[10px] font-bold text-slate-400">Pilih Mode / Preset</span>
            </label>
            <select
              value={dateType}
              onChange={(e) => setDateType(e.target.value as DateFilterType)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-800 focus:outline-none focus:border-dophy-500 focus:bg-white transition-all shadow-2xs cursor-pointer"
            >
              <option value="all">Semua Tanggal</option>
              <optgroup label="Preset Cepat">
                {QUICK_DATE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Pilihan Kustom">
                <option value="specific">Tanggal Spesifik</option>
                <option value="range">Rentang Tanggal (Date Range)</option>
              </optgroup>
            </select>

            {/* Date Pickers for Specific Date */}
            {dateType === "specific" && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => openPicker("specific")}
                  className="w-full p-3 rounded-2xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/90 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-blue-600/80 block">
                        Tanggal Dipilih
                      </span>
                      <p className="text-xs sm:text-sm font-black text-blue-950">
                        {specificDate
                          ? `${specificDate.day} ${MONTH_NAMES[specificDate.month - 1]} ${specificDate.year}`
                          : "Klik untuk memilih tanggal..."}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-600 group-hover:translate-x-0.5 transition-transform bg-white px-2.5 py-1 rounded-xl border border-blue-200/80 shadow-2xs">
                    Pilih
                  </span>
                </button>
              </div>
            )}

            {/* Date Pickers for Date Range */}
            {dateType === "range" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openPicker("rangeStart")}
                  className="p-3 rounded-2xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/90 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase text-blue-600/80 block">Dari Tanggal</span>
                      <p className="text-xs font-black text-blue-950 truncate">
                        {rangeStartDate
                          ? `${rangeStartDate.day} ${MONTH_NAMES[rangeStartDate.month - 1]} ${rangeStartDate.year}`
                          : "Pilih tanggal mulai..."}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openPicker("rangeEnd")}
                  className="p-3 rounded-2xl bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200/90 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CalendarRange className="w-4 h-4 text-purple-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase text-purple-600/80 block">
                        Sampai Tanggal
                      </span>
                      <p className="text-xs font-black text-purple-950 truncate">
                        {rangeEndDate
                          ? `${rangeEndDate.day} ${MONTH_NAMES[rangeEndDate.month - 1]} ${rangeEndDate.year}`
                          : "Pilih tanggal akhir..."}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="h-[1px] bg-slate-100" />

          {/* 2. Filter Tipe Produk */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-900 block flex items-center justify-between">
              <span>Tipe / Nama Produk</span>
              <span className="text-[10px] font-bold text-slate-400">Pilih Produk</span>
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-800 focus:outline-none focus:border-dophy-500 focus:bg-white transition-all shadow-2xs cursor-pointer"
            >
              <option value="all">Semua Produk Snack</option>
              {uniqueProducts.map((prodName) => (
                <option key={prodName} value={prodName}>
                  {prodName}
                </option>
              ))}
            </select>
          </div>

          <div className="h-[1px] bg-slate-100" />

          {/* 3. Filter Kode Referral / Mitra */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-900 block flex items-center justify-between">
              <span>Creator Code / Creator Partner</span>
              <span className="text-[10px] font-bold text-slate-400">Pilih Creator Partner</span>
            </label>
            <select
              value={selectedReferral}
              onChange={(e) => setSelectedReferral(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-800 focus:outline-none focus:border-dophy-500 focus:bg-white transition-all shadow-2xs cursor-pointer"
            >
              <option value="all">Semua Transaksi (Creator Partner & Direct)</option>
              <option value="none">Hanya Tanpa Creator Code (Direct Sales)</option>
              {uniqueReferrals.map((ref) => (
                <option key={ref.code} value={ref.code}>
                  {ref.code} - {ref.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </ResponsiveDetailModal>

      {/* Date Picker Modal Subcomponent */}
      <SalesDatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        title={getDatePickerTitle()}
        initialDate={getCurrentInitialDate()}
        onSave={handleSaveDate}
      />
    </>
  );
};
