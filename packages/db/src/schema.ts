import { z } from "zod";

// ==========================================
// 1. ADMIN SCHEMA
// ==========================================
export const AdminSchema = z.object({
  id: z.string().uuid().optional(),
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  created_at: z.string().optional(),
});
export type Admin = z.infer<typeof AdminSchema>;


// ==========================================
// 2. AFFILIATOR SCHEMA
// ==========================================
export const AffiliatorStatusEnum = z.enum(["aktif", "nonaktif"]);

export const AffiliatorRegisterSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  no_hp: z.string().min(10, "Nomor HP minimal 10 digit"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  no_rekening: z.string().min(3, "Nomor rekening wajib diisi"),
  nama_bank_ewallet: z.string().min(2, "Nama bank / E-Wallet wajib diisi"),
});

export const AffiliatorSchema = AffiliatorRegisterSchema.extend({
  id: z.string().uuid().optional(),
  kode_referral: z.string().min(3),
  status: AffiliatorStatusEnum.default("aktif"),
  target_periode: z.number().nullable().optional(),
  created_at: z.string().optional(),
});
export type Affiliator = z.infer<typeof AffiliatorSchema>;
export type AffiliatorRegisterInput = z.infer<typeof AffiliatorRegisterSchema>;


// ==========================================
// 3. PRODUCT SCHEMA
// ==========================================
export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  nama_produk: z.string().min(2, "Nama produk wajib diisi"),
  berat: z.string().default("65 gr"),
  harga: z.number().positive("Harga harus lebih besar dari 0"),
  stok: z.number().int().min(0, "Stok tidak boleh negatif"),
  updated_at: z.string().optional(),
});
export type Product = z.infer<typeof ProductSchema>;


// ==========================================
// 4. SALE (TRANSACTION) SCHEMA
// ==========================================
export const SaleInputSchema = z.object({
  product_id: z.string().uuid("Pilih produk yang valid"),
  jumlah: z.number().int().positive("Jumlah minimal 1"),
  kode_referral_digunakan: z.string().optional().nullable(),
  tanggal_transaksi: z.string().optional(),
});

export const SaleSchema = SaleInputSchema.extend({
  id: z.string().uuid().optional(),
  total_harga: z.number().nonnegative(),
  komisi_dihasilkan: z.number().nonnegative(),
  dicatat_oleh: z.string().uuid().optional(),
});
export type Sale = z.infer<typeof SaleSchema>;
export type SaleInput = z.infer<typeof SaleInputSchema>;


// ==========================================
// 5. COMMISSION SCHEMA
// ==========================================
export const CommissionStatusEnum = z.enum(["terhitung", "dicairkan"]);

export const CommissionSchema = z.object({
  id: z.string().uuid().optional(),
  affiliator_id: z.string().uuid(),
  sale_id: z.string().uuid(),
  jumlah_komisi: z.number().nonnegative(),
  status: CommissionStatusEnum.default("terhitung"),
  created_at: z.string().optional(),
});
export type Commission = z.infer<typeof CommissionSchema>;


// ==========================================
// 6. WITHDRAWAL (PENARIKAN DANA) SCHEMA
// ==========================================
export const WithdrawalStatusEnum = z.enum(["diajukan", "diproses", "selesai", "ditolak"]);

export const WithdrawalInputSchema = z.object({
  nominal: z.number().positive("Nominal penarikan harus lebih dari 0"),
  rekening_tujuan: z.string().min(3, "Rekening tujuan wajib diisi"),
  bank_tujuan: z.string().min(2, "Bank/E-Wallet tujuan wajib diisi"),
});

export const WithdrawalSchema = WithdrawalInputSchema.extend({
  id: z.string().uuid().optional(),
  affiliator_id: z.string().uuid(),
  status: WithdrawalStatusEnum.default("diajukan"),
  bukti_transfer_url: z.string().nullable().optional(),
  tanggal_pengajuan: z.string().optional(),
  tanggal_selesai: z.string().nullable().optional(),
  alasan_ditolak: z.string().nullable().optional(),
});
export type Withdrawal = z.infer<typeof WithdrawalSchema>;
export type WithdrawalInput = z.infer<typeof WithdrawalInputSchema>;


// ==========================================
// 7. ANNOUNCEMENT SCHEMA
// ==========================================
export const AnnouncementSchema = z.object({
  id: z.string().uuid().optional(),
  judul: z.string().min(3, "Judul pengumuman wajib diisi"),
  isi: z.string().min(5, "Isi pengumuman wajib diisi"),
  gambar_url: z.string().nullable().optional(),
  created_at: z.string().optional(),
  dibuat_oleh: z.string().uuid().optional(),
});
export type Announcement = z.infer<typeof AnnouncementSchema>;
