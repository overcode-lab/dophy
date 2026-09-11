"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  History,
  ExternalLink,
  Calendar,
  Clock,
  AlertCircle,
  Ban,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  StatusBadge,
  ResponsiveDetailModal,
  CustomConfirmModal,
  LoadingSpinner,
  Footer,
} from "@repo/ui";

export default function PartnerHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Transfer Proof & Detail Viewer
  const [selectedProof, setSelectedProof] = useState<any>(null);

  // Cancellation State
  const [withdrawalToCancel, setWithdrawalToCancel] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    if (!storedUser) {
      router.push("/partner/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchHistory(parsedUser.id);
  }, [router]);

  const fetchHistory = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/partner/withdrawals?partner_id=${id}`);
      const data = await res.json();
      if (data.success) {
        setWithdrawals(data.data || []);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!withdrawalToCancel || !user?.id || isCancelling) return;

    setIsCancelling(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/partner/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawal_id: withdrawalToCancel.id,
          partner_id: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setActionMessage({
          type: "error",
          text: data.error || "Gagal membatalkan pengajuan penarikan.",
        });
        setWithdrawalToCancel(null);
        return;
      }

      // Success: Close modals and refresh history
      setActionMessage({
        type: "success",
        text: "Pengajuan berhasil dibatalkan! Saldo tertahan telah dikembalikan ke Saldo Tersedia Anda.",
      });

      setWithdrawalToCancel(null);
      setSelectedProof(null);

      // Refresh list
      await fetchHistory(user.id);

      // Auto dismiss success toast after 5s
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.message || "Terjadi kesalahan jaringan saat membatalkan pengajuan.",
      });
      setWithdrawalToCancel(null);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage text="Memuat riwayat penarikan Creator Royalty..." />;
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

  const formatDateOnly = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTimeOnly = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return (
      d
        .toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(":", ".") + " WIB"
    );
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

  const isCancelledStatus = (item: any) => {
    return (
      item?.status === "cancelled" ||
      item?.status === "canceled" ||
      (item?.status === "rejected" && item?.rejection_reason?.toLowerCase().includes("batal"))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/partner/dashboard"
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-base font-black text-slate-900 tracking-tight">Riwayat Penarikan Royalti</h1>
          </div>

          <button
            onClick={() => user?.id && fetchHistory(user.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-5 space-y-4">
        {/* Action Notification Alert */}
        {actionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-start gap-2.5 ${
              actionMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed">{actionMessage.text}</p>
          </motion.div>
        )}

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
            <h3 className="text-sm font-extrabold text-slate-900">Belum Ada Riwayat Penarikan Royalti</h3>
            <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
              Seluruh histori pengajuan penarikan Creator Royalty dan bukti transfer dari admin akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {withdrawals.map((item, index) => {
              const cancelled = isCancelledStatus(item);
              const isPending = item.status === "pending";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  onClick={() => setSelectedProof(item)}
                  className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs hover:border-dophy-300 hover:shadow-xs transition-all space-y-2.5 text-left cursor-pointer active:scale-[0.99] group"
                >
                  {/* Header: Date & Time Chips (Left) + StatusBadge (Right) */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Date Chip - Soft Indigo / Purple Tint */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50/90 text-indigo-700 border border-indigo-200/90 text-[11px] font-bold shadow-2xs">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{formatDateOnly(item.requested_at)}</span>
                      </span>

                      {/* Time Chip - Soft Amber / Honey Gold Tint */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50/90 text-amber-800 border border-amber-200/90 text-[11px] font-extrabold shadow-2xs font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{formatTimeOnly(item.requested_at)}</span>
                      </span>
                    </div>

                    <StatusBadge status={cancelled ? "cancelled" : item.status} />
                  </div>

                  {/* Row 2: Nominal Penarikan & Action Button */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                        Nominal Penarikan
                      </span>
                      <span className="text-base font-black text-slate-900 tracking-tight">
                        Rp {Number(item.amount).toLocaleString("id-ID")}
                      </span>
                    </div>

                    {isPending && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWithdrawalToCancel(item);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-extrabold transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1"
                        title="Batalkan Pengajuan Ini"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Batalkan</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Reusable Footer */}
      <Footer variant="partner" />

      {/* Transfer Detail & Proof Modal Viewer */}
      <ResponsiveDetailModal
        isOpen={Boolean(selectedProof)}
        onClose={() => setSelectedProof(null)}
        title="Detail Penarikan Dana"
        subtitle={selectedProof ? `ID: WD-${selectedProof.id.slice(0, 8).toUpperCase()}` : undefined}
        footer={
          selectedProof ? (
            selectedProof.status === "pending" ? (
              <div className="flex items-center justify-between gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => setWithdrawalToCancel(selectedProof)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Batalkan Pengajuan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProof(null)}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Tutup
                </button>
              </div>
            ) : selectedProof.proof_url ? (
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
                <StatusBadge
                  status={isCancelledStatus(selectedProof) ? "cancelled" : selectedProof.status}
                />
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
                    selectedProof.bank_name,
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
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-slate-500 font-bold shrink-0">Diajukan:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50/90 text-indigo-700 border border-indigo-200/90 text-[10.5px] font-bold">
                      <Calendar className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span>{formatDateOnly(selectedProof.requested_at)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50/90 text-amber-800 border border-amber-200/90 text-[10.5px] font-extrabold font-mono">
                      <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{formatTimeOnly(selectedProof.requested_at)}</span>
                    </span>
                  </div>
                </div>
                {selectedProof.completed_at && (
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-200/60">
                    <span className="text-slate-500 font-bold shrink-0">
                      {isCancelledStatus(selectedProof)
                        ? "Dibatalkan:"
                        : selectedProof.status === "rejected"
                        ? "Ditolak:"
                        : "Diselesaikan:"}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10.5px] font-bold">
                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{formatDateOnly(selectedProof.completed_at)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10.5px] font-extrabold font-mono">
                        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{formatTimeOnly(selectedProof.completed_at)}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Notice */}
            {selectedProof.status === "pending" && (
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-800 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-black text-amber-900">Pengajuan Sedang Ditinjau</p>
                  <p className="text-amber-700 font-medium leading-relaxed">
                    Saldo sebesar Rp {Number(selectedProof.amount).toLocaleString("id-ID")} saat ini sedang ditahan. Anda dapat membatalkan pengajuan ini sewaktu-waktu sebelum diproses admin.
                  </p>
                </div>
              </div>
            )}

            {/* Cancelled Notice */}
            {isCancelledStatus(selectedProof) && (
              <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200 text-slate-700 text-xs font-semibold flex items-start gap-2.5">
                <Ban className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-black text-slate-900">Pengajuan Dibatalkan</p>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    Pengajuan penarikan ini telah dibatalkan oleh Anda. Saldo sebesar Rp{" "}
                    {Number(selectedProof.amount || 0).toLocaleString("id-ID")} telah dikembalikan secara utuh ke Saldo Tersedia Anda.
                  </p>
                </div>
              </div>
            )}

            {/* Receipt Image (If completed & has proof) */}
            {selectedProof.proof_url && (
              <div className="space-y-1.5">
                <span className="text-xs font-black text-slate-800 block">Bukti Struk Transfer</span>
                <div className="relative w-full h-80 sm:h-96 flex items-center justify-center">
                  <Image src={selectedProof.proof_url} alt="Bukti Transfer" fill className="object-contain" />
                </div>
              </div>
            )}

            {/* Rejection reason (If rejected by Admin) */}
            {selectedProof.status === "rejected" &&
              !isCancelledStatus(selectedProof) &&
              selectedProof.rejection_reason && (
                <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200/90 text-rose-800 text-xs font-semibold flex items-start gap-2">
                  <span className="font-black text-rose-600 shrink-0">Alasan Ditolak:</span>
                  <p className="font-medium text-slate-700">{selectedProof.rejection_reason}</p>
                </div>
              )}
          </div>
        ) : null}
      </ResponsiveDetailModal>

      {/* Confirmation Modal to Cancel Withdrawal */}
      <CustomConfirmModal
        isOpen={Boolean(withdrawalToCancel)}
        onClose={() => !isCancelling && setWithdrawalToCancel(null)}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
        variant="danger"
        title="Batalkan Pengajuan Penarikan?"
        description={`Apakah Anda yakin ingin membatalkan pengajuan penarikan sebesar Rp ${Number(
          withdrawalToCancel?.amount || 0
        ).toLocaleString(
          "id-ID"
        )}? Saldo yang sedang tertahan akan langsung dikembalikan ke Saldo Tersedia Anda.`}
        confirmText="Ya, Batalkan"
        cancelText="Kembali"
      />
    </div>
  );
}
