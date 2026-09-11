"use client";

import React, { useState } from "react";
import { Download, Share2, Copy, Check, CheckCircle2, ArrowRight, Sparkles, ReceiptText } from "lucide-react";
import { ResponsiveDetailModal } from "@repo/ui";

export interface SalesReceiptData {
  id: string;
  transaction_date?: string;
  product_name: string;
  product_price: number;
  product_weight?: string;
  quantity: number;
  total_price: number;
  referral_code?: string | null;
  partner_name?: string | null;
  admin_name?: string | null;
}

interface SalesReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: SalesReceiptData | null;
  onNewTransaction?: () => void;
}

export const SalesReceiptModal: React.FC<SalesReceiptModalProps> = ({ isOpen, onClose, receipt, onNewTransaction }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!receipt) return null;

  const invoiceNumber = `INV/${(receipt.id || "00000000").slice(0, 8).toUpperCase()}`;
  const txDate = receipt.transaction_date ? new Date(receipt.transaction_date) : new Date();

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

  const hasReferral = Boolean(
    receipt.referral_code &&
    receipt.referral_code.trim() !== "" &&
    receipt.referral_code !== "Tanpa Referral" &&
    receipt.referral_code !== "-",
  );

  const qty = Number(receipt.quantity) || 1;
  const unitPrice = Number(receipt.product_price) || 0;
  const grossTotal = qty * unitPrice;
  const discountPerPcs = 3000;
  const totalDiscount = hasReferral ? qty * discountPerPcs : 0;
  const finalTotal = hasReferral ? Math.max(0, grossTotal - totalDiscount) : Number(receipt.total_price) || grossTotal;

  // Formatted WhatsApp / Copy Text
  const getReceiptPlainText = () => {
    const lines = [
      `🧾 *NOTA PEMBAYARAN DOPHY* 🧾`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `No. Invoice : ${invoiceNumber}`,
      `Tanggal     : ${formattedDate}`,
      `Waktu       : ${formattedTime}`,
      `Status      : LUNAS ✅`,
      `━━━━━━━━━━━━━━━━━━━━━━━━`,
      `*Rincian Pesanan:*`,
      `• ${receipt.product_name} ${receipt.product_weight ? `(${receipt.product_weight})` : ""}`,
      `  ${qty} Pcs × Rp ${unitPrice.toLocaleString("id-ID")} = Rp ${grossTotal.toLocaleString("id-ID")}`,
    ];

    if (hasReferral) {
      lines.push(`• Diskon`);
      lines.push(`  Hemat Rp 3.000 / pcs × ${qty} Pcs = -Rp ${totalDiscount.toLocaleString("id-ID")}`);
    }

    lines.push(``);
    lines.push(`*TOTAL PEMBAYARAN : Rp ${finalTotal.toLocaleString("id-ID")}*`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━`);

    if (hasReferral) {
      lines.push(`🎉 *Selamat! Anda sudah menghemat sebanyak Rp ${totalDiscount.toLocaleString("id-ID")}*`);
    } else {
      lines.push(`_Terima kasih telah berbelanja di DOPHY._ 🙏✨`);
    }

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`_Simpan nota ini sebagai bukti pembayaran yang sah._`);

    return lines.join("\n");
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getReceiptPlainText());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareWhatsApp = () => {
    const text = getReceiptPlainText();
    if (navigator.share) {
      navigator
        .share({
          title: `Nota Pembayaran ${invoiceNumber}`,
          text: text,
        })
        .catch(() => {
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
        });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  // Generate and Download crisp PNG Struk Card with Plus Jakarta Sans
  const handleDownloadImage = async () => {
    setIsDownloading(true);

    try {
      if (typeof document !== "undefined" && document.fonts) {
        await document.fonts.ready;
      }

      const scale = 2;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = 400;
      const height = hasReferral ? 465 : 374;

      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // 1. Clean Background (Borderless)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // 2. Header Brand
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 20px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DOPHY SNACK", width / 2, 38);

      ctx.fillStyle = "#64748b";
      ctx.font = "800 10px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("NOTA PEMBAYARAN", width / 2, 54);

      // Invoice & Status Pill
      ctx.fillStyle = "#ecfdf5";
      ctx.beginPath();
      ctx.roundRect(width / 2 - 46, 64, 92, 22, 11);
      ctx.fill();
      ctx.strokeStyle = "#a7f3d0";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#047857";
      ctx.font = "800 11px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("LUNAS ✓", width / 2, 79);

      // Dashed Line 1
      ctx.strokeStyle = "#e2e8f0";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(24, 100);
      ctx.lineTo(width - 24, 100);
      ctx.stroke();
      ctx.setLineDash([]);

      // Invoice info row (Separated No. Invoice, Tanggal, Waktu)
      ctx.textAlign = "left";
      ctx.fillStyle = "#64748b";
      ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("No. Invoice", 24, 126);
      ctx.fillText("Tanggal", 24, 146);
      ctx.fillText("Waktu", 24, 166);

      ctx.textAlign = "right";
      ctx.fillStyle = "#0f172a";
      ctx.font = "800 11.5px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(invoiceNumber, width - 24, 126);

      ctx.font = "700 11px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(formattedDate, width - 24, 146);
      ctx.fillText(formattedTime, width - 24, 166);

      // Dashed Line 2
      ctx.strokeStyle = "#e2e8f0";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(24, 182);
      ctx.lineTo(width - 24, 182);
      ctx.stroke();
      ctx.setLineDash([]);

      // Products Section Header
      ctx.textAlign = "left";
      ctx.fillStyle = "#94a3b8";
      ctx.font = "800 9.5px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("RINCIAN PESANAN", 24, 202);

      // Product Item Name
      ctx.fillStyle = "#0f172a";
      ctx.font = "800 13px 'Plus Jakarta Sans', sans-serif";
      const productTitle = `${receipt.product_name} ${receipt.product_weight ? `(${receipt.product_weight})` : ""}`;
      ctx.fillText(productTitle.length > 32 ? productTitle.slice(0, 30) + "..." : productTitle, 24, 222);

      // Product Qty & Gross Price
      ctx.fillStyle = "#64748b";
      ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(`${qty} Pcs × Rp ${unitPrice.toLocaleString("id-ID")}`, 24, 240);

      ctx.textAlign = "right";
      ctx.fillStyle = "#0f172a";
      ctx.font = "800 12.5px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(`Rp ${grossTotal.toLocaleString("id-ID")}`, width - 24, 240);

      let currentY = 240;

      // Discount Item Row if has referral
      if (hasReferral) {
        currentY += 24;
        ctx.textAlign = "left";
        ctx.fillStyle = "#059669";
        ctx.font = "800 12px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("Diskon", 24, currentY);

        ctx.fillStyle = "#10b981";
        ctx.font = "600 10.5px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(`Hemat Rp 3.000 / pcs × ${qty} Pcs`, 24, currentY + 16);

        ctx.textAlign = "right";
        ctx.fillStyle = "#059669";
        ctx.font = "800 12.5px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(`- Rp ${totalDiscount.toLocaleString("id-ID")}`, width - 24, currentY + 8);

        currentY += 16;
      }

      // Highlighted Total Box
      currentY += 20;
      ctx.fillStyle = "#ecfdf5";
      ctx.beginPath();
      ctx.roundRect(20, currentY, width - 40, 50, 14);
      ctx.fill();
      ctx.strokeStyle = "#a7f3d0";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.fillStyle = "#065f46";
      ctx.font = "800 11px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText("TOTAL PEMBAYARAN", 34, currentY + 30);

      ctx.textAlign = "right";
      ctx.fillStyle = "#047857";
      ctx.font = "900 18px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(`Rp ${finalTotal.toLocaleString("id-ID")}`, width - 34, currentY + 31);

      // Dashed Line 3
      currentY += 66;
      ctx.strokeStyle = "#e2e8f0";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(24, currentY);
      ctx.lineTo(width - 24, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Savings Appreciation & Footer
      if (hasReferral) {
        currentY += 28; // Luas gap dari line separator ke title
        ctx.textAlign = "left";
        ctx.fillStyle = "#065f46";
        ctx.font = "900 13.5px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(`🎉 Selamat! Anda Berhasil Menghemat Rp ${totalDiscount.toLocaleString("id-ID")}`, 24, currentY);

        // Dashed Line 4
        currentY += 24;
        ctx.strokeStyle = "#e2e8f0";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(24, currentY);
        ctx.lineTo(width - 24, currentY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Footer note
        currentY += 24;
        ctx.textAlign = "center";
        ctx.fillStyle = "#94a3b8";
        ctx.font = "600 10px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("Simpan nota ini sebagai bukti pembayaran yang sah.", width / 2, currentY);
      } else {
        // Footer note directly
        currentY += 22;
        ctx.textAlign = "center";
        ctx.fillStyle = "#94a3b8";
        ctx.font = "600 10px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText("Simpan nota ini sebagai bukti pembayaran yang sah.", width / 2, currentY);
      }

      // Download file
      const link = document.createElement("a");
      link.download = `Nota_DOPHY_${(receipt.id || "00000000").slice(0, 8).toUpperCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Error generating receipt image:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ResponsiveDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nota Pembayaran"
      subtitle="Transaksi penjualan berhasil dicatat"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 w-full">
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>{isDownloading ? "Mengunduh..." : "Download"}</span>
            </button>
          </div>

          <div className="w-full sm:w-auto flex items-center justify-end">
            {onNewTransaction ? (
              <button
                type="button"
                onClick={onNewTransaction}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Transaksi Baru</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95 text-center"
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-left font-sans">
        {/* Visual Receipt (Clean Modern Minimalist Aesthetic - Borderless) */}
        <div className="space-y-3.5 px-0.5 sm:px-1">
          {/* Receipt Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5">
              <span className="text-base font-black text-slate-900 tracking-tight">DOPHY SNACK</span>
            </div>
            <p className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-wider">NOTA PEMBAYARAN</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[11px] border border-emerald-200/80 shadow-2xs mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LUNAS</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200 my-1" />

          {/* Invoice Meta: Separated No. Invoice, Tanggal, and Waktu */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">No. Invoice</span>
              <span className="font-extrabold text-slate-900 tracking-tight">{invoiceNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Tanggal</span>
              <span className="font-bold text-slate-800">{formattedDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Waktu</span>
              <span className="font-bold text-slate-800">{formattedTime}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200 my-1" />

          {/* Line Items */}
          <div className="space-y-2.5 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Rincian Pesanan
            </span>

            {/* Product Item Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-black text-slate-900 leading-tight">
                  {receipt.product_name}
                  {receipt.product_weight && (
                    <span className="text-[10px] font-bold text-slate-400 ml-1">({receipt.product_weight})</span>
                  )}
                </p>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  {qty} Pcs × Rp {unitPrice.toLocaleString("id-ID")}
                </p>
              </div>
              <span className="font-black text-slate-900 text-right shrink-0">
                Rp {grossTotal.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Creator Code Discount Row */}
            {hasReferral && (
              <div className="flex items-start justify-between gap-2 pt-1.5 border-t border-dashed border-slate-100">
                <div className="min-w-0">
                  <p className="font-black text-emerald-700 leading-tight">Diskon</p>
                  <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">Hemat Rp 3.000 / pcs × {qty} Pcs</p>
                </div>
                <span className="font-black text-emerald-600 text-right shrink-0">
                  - Rp {totalDiscount.toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>

          {/* Total Amount Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-center justify-between gap-2 shadow-2xs">
            <span className="text-xs font-black text-slate-800">Total Pembayaran</span>
            <span className="text-lg font-black text-emerald-700 tracking-tight">
              Rp {finalTotal.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200 my-1" />

          {/* Appreciation / Savings Narrative (Borderless, Clean Left-aligned) */}
          {hasReferral ? (
            <div className="py-1 text-left">
              <p className="text-base sm:text-lg font-black text-emerald-800 leading-snug tracking-tight">
                🎉 Selamat! Anda Berhasil Menghemat Rp {totalDiscount.toLocaleString("id-ID")}
              </p>
            </div>
          ) : (
            <div className="py-1 text-left">
              <p className="text-sm font-extrabold text-slate-800">Terima kasih telah berbelanja di DOPHY!</p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200 my-1" />

          {/* Footer Note */}
          <div className="text-center pt-0.5">
            <p className="text-[11px] font-medium text-slate-400">Simpan nota ini sebagai bukti pembayaran yang sah.</p>
          </div>
        </div>

        {/* Quick Copy Text Button */}
        <button
          type="button"
          onClick={handleCopyText}
          className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.99]"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-black">Teks Nota Disalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Salin Teks Nota</span>
            </>
          )}
        </button>
      </div>
    </ResponsiveDetailModal>
  );
};
