"use client";

import React, { useState } from "react";
import { ResponsiveDetailModal } from "@repo/ui";
import { Calendar, Clock, Receipt } from "lucide-react";
import { SaleItem } from "../types";
import { SalesReceiptModal, SalesReceiptData } from "./SalesReceiptModal";

interface SalesDetailModalProps {
  sale: SaleItem | null;
  onClose: () => void;
}

export const SalesDetailModal: React.FC<SalesDetailModalProps> = ({ sale, onClose }) => {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  if (!sale) return null;

  const hasReferral = Boolean(
    sale.referral_code && sale.referral_code.trim() !== "" && sale.referral_code !== "Tanpa Referral",
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
        hour12: false,
      })
      .replace(":", ".") + " WIB";

  const unitPrice = Number(sale.products?.price) || Math.round(Number(sale.total_price) / (sale.quantity || 1));

  const receiptData: SalesReceiptData = {
    id: sale.id,
    transaction_date: sale.transaction_date,
    product_name: sale.products?.name || "DOPHY Snack",
    product_price: unitPrice,
    product_weight: sale.products?.weight,
    quantity: sale.quantity,
    total_price: Number(sale.total_price),
    referral_code: sale.referral_code,
    partner_name: sale.partner?.full_name || null,
    admin_name: "Admin DOPHY",
  };

  return (
    <>
      <ResponsiveDetailModal
        isOpen={Boolean(sale)}
        onClose={onClose}
        title="Detail Transaksi"
        subtitle={`ID: ${sale.id?.slice(0, 13)}...`}
        footer={
          <div className="flex items-center justify-between gap-2.5 w-full">
            <button
              type="button"
              onClick={() => setIsReceiptOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-dophy-50 hover:bg-dophy-100 text-dophy-700 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
            >
              <Receipt className="w-3.5 h-3.5 text-dophy-600" />
              <span>Lihat Nota</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
            >
              Tutup
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-left">
          {/* Header Hero Area */}
          <div className="pb-3 border-b border-slate-100 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                  Produk Dipesan
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {sale.products?.name || "DOPHY Snack"}
                </h3>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-black text-xs inline-flex items-center gap-1.5 shadow-2xs shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sukses</span>
              </span>
            </div>

            {/* Date & Time Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 font-bold text-xs shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{formattedDate}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 font-bold text-xs shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span>{formattedTime}</span>
              </span>
            </div>
          </div>

          {/* Main Metric Chips Banner */}
          {hasReferral ? (
            <div className="space-y-2">
              {/* Row 1: Total Transaksi (Orange) */}
              <div className="p-3 rounded-2xl bg-orange-50/90 border border-orange-200/90 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-dophy-700/80 block">
                  Total Transaksi
                </span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  Rp {Number(sale.total_price).toLocaleString("id-ID")}
                </p>
              </div>

              {/* Row 2: Jumlah (Sky Blue) & Komisi (Emerald) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-2xl bg-sky-50/90 border border-sky-200/90 text-center flex flex-col justify-center">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-sky-700/80 block">Jumlah</span>
                  <p className="text-sm sm:text-base font-black text-sky-900 mt-0.5 leading-tight">
                    {sale.quantity} Pcs
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 text-center flex flex-col justify-center">
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-700/80 block">
                    Creator Royalty
                  </span>
                  <p className="text-sm sm:text-base font-black text-emerald-700 mt-0.5 leading-tight">
                    +Rp {Number(sale.commission_amount).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Single Row for Direct / Without Referral (2 Columns: Orange & Sky Blue) */
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-orange-50/90 border border-orange-200/90 text-center flex flex-col justify-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-dophy-700/80 block">
                  Total Transaksi
                </span>
                <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  Rp {Number(sale.total_price).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50/90 border border-sky-200/90 text-center flex flex-col justify-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-700/80 block">Jumlah</span>
                <p className="text-lg sm:text-xl font-black text-sky-900 tracking-tight mt-0.5">{sale.quantity} Pcs</p>
              </div>
            </div>
          )}

          {/* Rincian Transaksi List */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500 font-semibold shrink-0">Harga Satuan</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold border border-slate-200/80 text-right">
                Rp {unitPrice.toLocaleString("id-ID")} / pcs
              </span>
            </div>

            {sale.products?.weight && (
              <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500 font-semibold shrink-0">Berat Bersih</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold border border-slate-200/80 text-right">
                  {sale.products.weight}
                </span>
              </div>
            )}

            {hasReferral && (
              <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 text-xs">
                <div className="min-w-0">
                  <span className="text-emerald-700 font-bold block leading-tight">Diskon</span>
                  <span className="text-[10.5px] text-emerald-600/80 font-medium block mt-0.5">Hemat Rp 2.000 / pcs</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs sm:text-[13px] border border-emerald-200/80 text-right">
                    - Rp {(Number(sale.commission_amount) || sale.quantity * 2000).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500 font-semibold shrink-0">Creator Code</span>
              <div className="text-right shrink-0">
                {hasReferral ? (
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-mono font-black text-xs border border-purple-200/80 inline-block text-right">
                    {sale.referral_code}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-500 font-semibold text-xs border border-slate-200/80 inline-block text-right">
                    Tanpa Creator Code (Direct)
                  </span>
                )}
              </div>
            </div>

            {hasReferral && sale.partner?.full_name && (
              <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500 font-semibold shrink-0">Creator Partner</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-800 font-bold text-xs border border-sky-200/80 capitalize text-right truncate max-w-[180px] sm:max-w-[240px]">
                  {sale.partner?.full_name}
                </span>
              </div>
            )}

            {hasReferral && sale.partner?.email && (
              <div className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500 font-semibold shrink-0">Email Creator Partner</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-medium text-xs border border-slate-200/80 text-right truncate max-w-[180px] sm:max-w-[240px]">
                  {sale.partner?.email}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 py-2 text-xs">
              <span className="text-slate-500 font-semibold shrink-0">ID Transaksi</span>
              <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/80 truncate max-w-[160px] sm:max-w-[220px] text-right">
                {sale.id}
              </span>
            </div>
          </div>
        </div>
      </ResponsiveDetailModal>

      <SalesReceiptModal isOpen={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} receipt={receiptData} />
    </>
  );
};
