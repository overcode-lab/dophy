"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, History, FileText, ExternalLink, Calendar, Wallet } from "lucide-react";
import { StatusBadge, ResponsiveDetailModal, LoadingSpinner, Footer } from "@repo/ui";

export default function AffiliateHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Transfer Proof Viewer
  const [selectedProof, setSelectedProof] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    if (!storedUser) {
      router.push("/affiliate/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchHistory(parsedUser.id);
  }, [router]);

  const fetchHistory = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/affiliate/withdrawals?affiliate_id=${id}`);
      const data = await res.json();
      if (data.success) {
        setWithdrawals(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat riwayat penarikan komisi..." />;
  }

  const getBankStyle = (name = "") => {
    const b = name.toLowerCase();
    if (b.includes("gopay")) return "bg-sky-50 text-sky-700 border-sky-200/90";
    if (b.includes("dana")) return "bg-blue-50 text-blue-700 border-blue-200/90";
    if (b.includes("ovo")) return "bg-purple-50 text-purple-700 border-purple-200/90";
    if (b.includes("shopee") || b.includes("spay")) return "bg-orange-50 text-orange-700 border-orange-200/90";
    if (b.includes("bca")) return "bg-blue-50 text-blue-800 border-blue-200/90";
    if (b.includes("mandiri")) return "bg-amber-50 text-amber-800 border-amber-200/90";
    if (b.includes("bri")) return "bg-teal-50 text-teal-800 border-teal-200/90";
    if (b.includes("bni")) return "bg-emerald-50 text-emerald-800 border-emerald-200/90";
    return "bg-cyan-50 text-cyan-800 border-cyan-200/90";
  };

  const formatFullDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeFormatted =
      d
        .toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(":", ".") + " WIB";
    return `${dateFormatted}, ${timeFormatted}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-2.5">
          <Link
            href="/affiliate/dashboard"
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-black text-slate-900 tracking-tight">Riwayat Penarikan Dana</h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-5 space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            <div className="w-6 h-6 border-2 border-dophy-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Memuat riwayat penarikan...</span>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">Belum Ada Riwayat Penarikan</h3>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
              Seluruh histori pengajuan penarikan dana dan bukti transfer dari admin akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {withdrawals.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                onClick={() => setSelectedProof(item)}
                className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs hover:border-dophy-300 hover:shadow-xs transition-all space-y-2.5 text-left cursor-pointer active:scale-[0.99] group"
              >
                {/* Header: Date (Left) + StatusBadge (Right) */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {new Date(item.requested_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                  <StatusBadge status={item.status} />
                </div>

                {/* Row 2: Nominal Penarikan */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400">Nominal Penarikan</span>
                  <span className="text-base font-black text-slate-900 tracking-tight shrink-0">
                    Rp {Number(item.amount).toLocaleString("id-ID")}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Reusable Footer */}
      <Footer variant="affiliate" />

      {/* Transfer Detail & Proof Modal Viewer */}
      <ResponsiveDetailModal
        isOpen={Boolean(selectedProof)}
        onClose={() => setSelectedProof(null)}
        title="Detail Penarikan Dana"
        subtitle={
          selectedProof ? `ID: WD-${selectedProof.id.slice(0, 8).toUpperCase()}` : undefined
        }
        footer={
          selectedProof ? (
            selectedProof.proof_url ? (
              <div className="flex items-center justify-between gap-2.5 w-full">
                <a
                  href={selectedProof.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Gambar Asli</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedProof(null)}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-end w-full">
                <button
                  type="button"
                  onClick={() => setSelectedProof(null)}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Tutup
                </button>
              </div>
            )
          ) : undefined
        }
      >
        {selectedProof ? (
          <div className="space-y-3.5 text-left">
            {/* Nominal & Status Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Nominal Penarikan
                  </span>
                  <p className="text-xl font-black text-slate-900 tracking-tight">
                    Rp {Number(selectedProof.amount || 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <StatusBadge status={selectedProof.status} />
              </div>
            </div>

            {/* Destination Bank / Account */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Rekening / E-Wallet Tujuan
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-lg font-black text-[11px] border shadow-2xs capitalize ${getBankStyle(
                    selectedProof.bank_name
                  )}`}
                >
                  {selectedProof.bank_name || "Bank / E-Wallet"}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 font-mono font-black text-[11px] border border-indigo-200/90 shadow-2xs">
                  {selectedProof.bank_account_number}
                </span>
              </div>
            </div>

            {/* Timestamp Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Waktu Transaksi
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-slate-500 font-bold shrink-0">Diajukan:</span>
                  <span className="font-extrabold text-slate-800 text-right">
                    {formatFullDateTime(selectedProof.requested_at)}
                  </span>
                </div>
                {selectedProof.completed_at && (
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1.5 border-t border-slate-200/60">
                    <span className="text-slate-500 font-bold shrink-0">
                      {selectedProof.status === "rejected" ? "Ditolak:" : "Diselesaikan:"}
                    </span>
                    <span className="font-extrabold text-slate-800 text-right">
                      {formatFullDateTime(selectedProof.completed_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Receipt Image (If completed & has proof) */}
            {selectedProof.proof_url && (
              <div className="space-y-1.5">
                <span className="text-xs font-black text-slate-800 block">Bukti Struk Transfer</span>
                <div className="relative w-full h-80 sm:h-96 flex items-center justify-center">
                  <Image src={selectedProof.proof_url} alt="Bukti Transfer" fill className="object-contain" />
                </div>
              </div>
            )}

            {/* Rejection reason (If rejected) */}
            {selectedProof.status === "rejected" && selectedProof.rejection_reason && (
              <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/90 text-rose-800 text-xs font-semibold flex items-start gap-2">
                <span className="font-black text-rose-600 shrink-0">Alasan Ditolak:</span>
                <p className="font-medium text-slate-700">{selectedProof.rejection_reason}</p>
              </div>
            )}
          </div>
        ) : null}
      </ResponsiveDetailModal>
    </div>
  );
}
