"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveDetailModal } from "@repo/ui";
import { DateState, MONTH_NAMES } from "../types";

interface SalesDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialDate: DateState | null;
  onSave: (date: DateState) => void;
}

export const SalesDatePickerModal: React.FC<SalesDatePickerModalProps> = ({
  isOpen,
  onClose,
  title,
  initialDate,
  onSave,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const [tempDay, setTempDay] = useState<number>(currentDay);
  const [tempMonth, setTempMonth] = useState<number>(currentMonth);
  const [tempYear, setTempYear] = useState<number>(currentYear);

  useEffect(() => {
    if (isOpen) {
      if (initialDate) {
        // Enforce max limit upon opening
        let y = Math.min(initialDate.year, currentYear);
        let m = initialDate.month;
        if (y === currentYear && m > currentMonth) m = currentMonth;
        let maxD =
          y === currentYear && m === currentMonth
            ? currentDay
            : new Date(y, m, 0).getDate();
        let d = Math.min(initialDate.day, maxD);

        setTempYear(y);
        setTempMonth(m);
        setTempDay(d);
      } else {
        setTempDay(currentDay);
        setTempMonth(currentMonth);
        setTempYear(currentYear);
      }
    }
  }, [isOpen, initialDate, currentYear, currentMonth, currentDay]);

  // Max selectable month for selected year
  const maxSelectableMonth = tempYear === currentYear ? currentMonth : 12;

  // Auto-adjust month if it exceeds max allowed for current year
  useEffect(() => {
    if (tempMonth > maxSelectableMonth) {
      setTempMonth(maxSelectableMonth);
    }
  }, [tempYear, maxSelectableMonth, tempMonth]);

  // Max selectable day for selected year and month
  const maxSelectableDay =
    tempYear === currentYear && tempMonth === currentMonth
      ? currentDay
      : new Date(tempYear, tempMonth, 0).getDate();

  // Auto-adjust day if it exceeds max allowed
  useEffect(() => {
    if (tempDay > maxSelectableDay) {
      setTempDay(maxSelectableDay);
    }
  }, [tempMonth, tempYear, maxSelectableDay, tempDay]);

  const handleSave = () => {
    onSave({ day: tempDay, month: tempMonth, year: tempYear });
    onClose();
  };

  const handleSetToday = () => {
    setTempDay(currentDay);
    setTempMonth(currentMonth);
    setTempYear(currentYear);
  };

  // Generate available years from 2024 up to current year
  const startYear = 2024;
  const availableYears = Array.from(
    { length: Math.max(1, currentYear - startYear + 1) },
    (_, i) => startYear + i
  );

  return (
    <ResponsiveDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Pilih tanggal, bulan, dan tahun (maksimal hari ini)"
      footer={
        <div className="flex items-center justify-between gap-2.5 w-full">
          <button
            type="button"
            onClick={handleSetToday}
            className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Hari Ini
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-2xl bg-dophy-600 hover:bg-dophy-700 text-white font-black text-xs shadow-md shadow-dophy-600/25 transition-all cursor-pointer active:scale-95"
            >
              Pilih Tanggal Ini
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-left">
        {/* Live Selected Date Preview Chip */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/90 text-center">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block mb-0.5">
            Pratinjau Tanggal
          </span>
          <p className="text-base sm:text-lg font-black text-slate-900">
            📅 {tempDay} {MONTH_NAMES[tempMonth - 1]} {tempYear}
          </p>
        </div>

        {/* 3 Separate Inputs: Date | Month | Year */}
        <div className="grid grid-cols-3 gap-2">
          {/* 1. Date (1 - maxSelectableDay) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 block text-center">
              Tanggal
            </label>
            <select
              value={tempDay}
              onChange={(e) => setTempDay(Number(e.target.value))}
              className="w-full px-2.5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-800 text-center focus:outline-none focus:border-dophy-500 focus:bg-white shadow-2xs transition-all cursor-pointer"
            >
              {Array.from({ length: maxSelectableDay }, (_, i) => i + 1).map((dayNum) => (
                <option key={dayNum} value={dayNum}>
                  {dayNum}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Month (Januari - maxSelectableMonth) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 block text-center">
              Bulan
            </label>
            <select
              value={tempMonth}
              onChange={(e) => setTempMonth(Number(e.target.value))}
              className="w-full px-2 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-800 text-center focus:outline-none focus:border-dophy-500 focus:bg-white shadow-2xs transition-all cursor-pointer"
            >
              {MONTH_NAMES.slice(0, maxSelectableMonth).map((mName, idx) => (
                <option key={mName} value={idx + 1}>
                  {mName.slice(0, 3)}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Year (2024 - currentYear) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 block text-center">
              Tahun
            </label>
            <select
              value={tempYear}
              onChange={(e) => setTempYear(Number(e.target.value))}
              className="w-full px-2 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-800 text-center focus:outline-none focus:border-dophy-500 focus:bg-white shadow-2xs transition-all cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </ResponsiveDetailModal>
  );
};
