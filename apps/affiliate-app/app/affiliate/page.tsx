import React from "react";
import Link from "next/link";
import { Button, Card, Badge } from "@repo/ui";
import { Users, Copy, Wallet, History, FileCheck, Megaphone, ArrowLeft } from "lucide-react";

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm mb-2">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Home
          </Link>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Users className="w-8 h-8 text-sky-400" /> Affiliator Portal — DOPHY
          </h1>
          <p className="text-slate-400 text-sm mt-1">Pantau Performa Referral, Saldo Komisi, & Penarikan Dana</p>
        </div>
        <Badge variant="success">Mitra Affiliator</Badge>
      </div>

      {/* Referral Code Card */}
      <Card className="bg-gradient-to-r from-dophy-950/40 to-slate-900 border-dophy-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Kode Referral Anda</p>
          <p className="text-2xl font-extrabold text-dophy-400 font-mono tracking-widest mt-1">DOPHY-MITRA01</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Copy className="w-4 h-4" /> Salin Kode Referral
        </Button>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="space-y-3">
          <Wallet className="w-6 h-6 text-amber-400" />
          <h3 className="font-bold text-lg">Saldo Komisi & Penarikan</h3>
          <p className="text-xs text-slate-400">Saldo ter-hold otomatis saat diajukan untuk keamanan saldo.</p>
        </Card>

        <Card className="space-y-3">
          <History className="w-6 h-6 text-sky-400" />
          <h3 className="font-bold text-lg">Riwayat Komisi Agregat</h3>
          <p className="text-xs text-slate-400">Mematuhi privasi konsumen: hanya menampilkan total komisi kumulatif.</p>
        </Card>

        <Card className="space-y-3">
          <FileCheck className="w-6 h-6 text-emerald-400" />
          <h3 className="font-bold text-lg">Bukti Transfer Admin</h3>
          <p className="text-xs text-slate-400">Lihat & unduh bukti transfer yang diunggah admin untuk setiap pencairan.</p>
        </Card>
      </div>
    </div>
  );
}
