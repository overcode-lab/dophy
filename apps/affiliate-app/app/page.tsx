import React from "react";
import Link from "next/link";
import { Button, Card, Badge } from "@repo/ui";
import { ShieldCheck, Users, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-dophy-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full text-center z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-dophy-500/10 border border-dophy-500/30 text-dophy-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> DOPHY Affiliate Application v1.0
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Platform Affiliate & Dashboard System <span className="text-dophy-500">DOPHY</span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
          Kelola penjualan referral, akumulasi komisi affiliator, pencairan dana, dan pengumuman dalam satu portal terpadu.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 max-w-2xl mx-auto">
          <Card className="text-left space-y-4 hover:border-dophy-500/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-dophy-500/10 border border-dophy-500/30 flex items-center justify-center text-dophy-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
                <Badge variant="warning">Internal Only</Badge>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Input penjualan manual, kelola produk & stok, tinjau pengajuan penarikan dana, & unggah bukti transfer.
              </p>
            </div>
            <Link href="/admin" className="block pt-2">
              <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                Masuk ke Admin <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>

          <Card className="text-left space-y-4 hover:border-sky-500/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Affiliator Portal</h2>
                <Badge variant="success">Mitra Dophy</Badge>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Pantau saldo komisi, kode referral unik, ajukan penarikan dana, & lihat bukti transfer.
              </p>
            </div>
            <Link href="/affiliate" className="block pt-2">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                Masuk ke Affiliator <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </main>
  );
}
