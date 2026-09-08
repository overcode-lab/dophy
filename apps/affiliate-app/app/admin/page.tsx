import React from "react";
import Link from "next/link";
import { Button, Card, Badge } from "@repo/ui";
import { ShieldCheck, Package, ShoppingCart, Users, Wallet, Megaphone, ArrowLeft } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm mb-2">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Home
          </Link>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-dophy-500" /> Admin Dashboard — DOPHY
          </h1>
          <p className="text-slate-400 text-sm mt-1">Sistem Pengelolaan Penjualan, Stok, Affiliator, & Pencairan Dana</p>
        </div>
        <Badge variant="warning">Modul Admin Active</Badge>
      </div>

      {/* Modules Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="space-y-3">
          <Package className="w-6 h-6 text-dophy-400" />
          <h3 className="font-bold text-lg">Manajemen Produk & Stok</h3>
          <p className="text-xs text-slate-400">CRUD produk snack 65gr, harga, & update stok masuk/keluar.</p>
        </Card>

        <Card className="space-y-3">
          <ShoppingCart className="w-6 h-6 text-emerald-400" />
          <h3 className="font-bold text-lg">Input Transaksi Penjualan</h3>
          <p className="text-xs text-slate-400">Catat transaksi manual & tautkan kode referral konsumen.</p>
        </Card>

        <Card className="space-y-3">
          <Users className="w-6 h-6 text-sky-400" />
          <h3 className="font-bold text-lg">Manajemen Affiliator</h3>
          <p className="text-xs text-slate-400">Daftar mitra, kode referral unik, saldo kumulatif, & penetapan target.</p>
        </Card>

        <Card className="space-y-3">
          <Wallet className="w-6 h-6 text-amber-400" />
          <h3 className="font-bold text-lg">Manajemen Penarikan Dana</h3>
          <p className="text-xs text-slate-400">Proses penarikan, hold saldo otomatis, & unggah bukti transfer Cloudinary.</p>
        </Card>

        <Card className="space-y-3">
          <Megaphone className="w-6 h-6 text-purple-400" />
          <h3 className="font-bold text-lg">Pengumuman Admin</h3>
          <p className="text-xs text-slate-400">Buat update & pengumuman promo untuk seluruh mitra affiliator.</p>
        </Card>
      </div>
    </div>
  );
}
