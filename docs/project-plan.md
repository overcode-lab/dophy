# Dokumentasi Perancangan Aplikasi Creator Partner — DOPHY (Dopamine Snack)

**Versi:** 2.0  
**Tanggal:** September 2026  
**Disusun untuk:** Tim Developer / Programmer  
**Jenis Dokumen:** Product Requirement Document (PRD) & Functional Specification  

---

## 1. Latar Belakang

Dophy adalah usaha snack (kemasan 65 gr) yang ingin memperluas pemasaran melalui skema **Creator Partner Program**. Creator Partner akan mempromosikan produk melalui media sosial atau media lain, menggunakan **Creator Code unik** yang diberikan ke konsumen. Konsumen menggunakan kode tersebut saat membeli langsung ke admin Dophy untuk mendapatkan potongan harga. Admin mencatat Creator Code yang digunakan dan menghitung Creator Royalty partner secara kumulatif.

Untuk mendukung proses ini, dibutuhkan **aplikasi berbasis web** dengan dua entitas pengguna:
1. **Admin (Dophy)** — mengelola penjualan, stok, Creator Partner, dan Creator Royalty.
2. **Creator Partner** — memantau performa referral, royalti, target, dan pengajuan penarikan dana.

---

## 2. Tujuan Aplikasi

- Mengotomatiskan pencatatan penjualan berbasis Creator Code.
- Merekap Creator Royalty partner secara otomatis dan transparan.
- Memberikan visibilitas kepada partner atas performa mereka tanpa mengekspos data pribadi konsumen.
- Menyediakan mekanisme pengajuan dan konfirmasi penarikan dana yang terlacak (auditable).
- Menjadi kanal komunikasi (update/pengumuman) dari admin ke seluruh Creator Partner.

---

## 3. Aktor / Pengguna Sistem

| Aktor | Deskripsi | Akses |
|---|---|---|
| **Admin** | Pemilik/pengelola usaha Dophy | Web app khusus admin (dashboard) |
| **Creator Partner** | Mitra promosi yang mendaftar dan mendapat Creator Code | Web app khusus Creator Partner |
| **Konsumen** | Pembeli produk yang menggunakan Creator Code | Tidak memiliki akun/login — hanya berinteraksi via transaksi yang diinput admin |

> Catatan: Berdasarkan deskripsi, transaksi konsumen **diinput manual oleh admin** (bukan checkout online oleh konsumen sendiri), karena pembelian dilakukan "ke admin Dophy". Jika ke depan Dophy ingin membuka toko online mandiri, ini bisa jadi fase pengembangan lanjutan (lihat bagian 10 — Out of Scope).

---

## 4. Alur Bisnis (Business Flow) — Ringkasan

1. Calon partner mendaftar melalui **App Partner** (halaman daftar).
2. Sistem otomatis membuatkan **Creator Code unik** untuk partner tersebut.
3. Data pendaftaran otomatis muncul di **App Admin**.
4. Creator Partner mempromosikan produk dan membagikan Creator Code ke calon konsumen.
5. Konsumen membeli produk ke admin (langsung/chat/dsb) dan menyebutkan Creator Code.
6. Admin menginput transaksi penjualan beserta Creator Code yang digunakan di App Admin.
7. Sistem otomatis menghitung royalti berdasarkan Creator Code dan menambahkannya ke **saldo kumulatif** partner terkait.
8. Creator Partner dapat memantau saldo, jumlah pengguna Creator Code, dan progres target di App Partner.
9. Creator Partner mengajukan **penarikan dana (withdrawal)** melalui App Partner.
10. Admin memproses transfer secara manual, lalu mengunggah **bukti transfer** di App Admin.
11. Bukti transfer otomatis tampil di App Partner, dan saldo royalti partner berkurang sesuai jumlah penarikan.
12. Riwayat transaksi penarikan tersimpan dan dapat dilihat kedua pihak.

---

## 5. Modul & Fitur — App Admin

### 5.1 Dashboard Admin
- Ringkasan total penjualan, total royalti terutang, jumlah Creator Partner aktif, stok produk.
- Grafik/statistik penjualan berdasarkan periode (harian/mingguan/bulanan).

### 5.2 Manajemen Produk & Stok
- CRUD produk (nama, varian rasa jika ada, harga, kemasan 65 gr, dsb).
- Update stok masuk/keluar.
- Notifikasi/indikator stok menipis (opsional, nice-to-have).

### 5.3 Manajemen Penjualan (Transaksi)
- Input transaksi penjualan manual: produk, jumlah, harga, **Creator Code yang digunakan (opsional bila tanpa referral)**, tanggal transaksi.
- Sistem otomatis mengaitkan transaksi ke Creator Partner pemilik kode (jika ada).
- Sistem otomatis menghitung royalti sesuai aturan royalti yang berlaku (lihat 5.5).
- Riwayat seluruh transaksi penjualan, dapat difilter per partner/per tanggal/per produk.

### 5.4 Manajemen Creator Partner
- Daftar seluruh Creator Partner terdaftar (otomatis masuk saat partner daftar dari App Partner).
- Detail per partner: Creator Code, jumlah penggunaan kode, total royalti kumulatif, saldo saat ini, target (jika ditetapkan).
- Admin dapat menetapkan/mengubah target penjualan per partner (opsional).
- Admin dapat menonaktifkan/menghapus akun partner jika diperlukan.

### 5.5 Manajemen Creator Royalty
- Pengaturan skema royalti (misal: nominal tetap per pcs, atau persentase dari harga jual). Sebaiknya dapat dikonfigurasi oleh admin, tidak hardcode.
- Rekap royalti kumulatif per partner (otomatis terupdate setiap ada transaksi baru).

### 5.6 Manajemen Penarikan Dana
- Daftar pengajuan penarikan dana dari Creator Partner (status: *Diajukan → Diproses → Selesai*, atau *Ditolak*).
- Admin melakukan transfer manual di luar sistem (rekening bank/e-wallet).
- Admin mengunggah **bukti transfer** (gambar/PDF) untuk setiap penarikan yang sudah diproses.
- Update status pengajuan otomatis mengubah tampilan di App Partner.
- Saldo partner otomatis berkurang saat pengajuan disetujui/dikonfirmasi (saldo tertahan saat diajukan — lihat catatan di 7.3).

### 5.7 Update / Pengumuman untuk Creator Partner
- Admin dapat membuat/mengirim pengumuman (teks, bisa disertai gambar) yang akan muncul di App Partner (misal: info promo baru, perubahan skema royalti, pengumuman target).

### 5.8 Manajemen Akun Admin
- Login admin dengan autentikasi aman.
- (Opsional) multi-admin dengan role berbeda jika tim berkembang.

---

## 6. Modul & Fitur — App Partner

### 6.1 Halaman Pendaftaran (Register)
- Form pendaftaran Creator Partner baru (nama, kontak/WhatsApp, email, media sosial, nomor rekening/e-wallet untuk pencairan dana, password).
- Setelah submit, sistem otomatis:
  - Membuat Creator Code unik.
  - Mendaftarkan data ke database dan otomatis muncul di App Admin.
- Login untuk partner yang sudah terdaftar.

### 6.2 Dashboard Creator Partner
- Creator Code milik partner (dengan tombol salin/share).
- Saldo royalti saat ini (real-time berdasarkan kumulatif royalti dikurangi penarikan).
- Jumlah konsumen yang sudah menggunakan Creator Code (angka agregat, **tanpa identitas konsumen**).
- Progres target (jika admin menetapkan target, tampilkan capaian vs target, misal progress bar).
- Feed/list update & pengumuman terbaru dari admin.

### 6.3 Riwayat Creator Royalty
- Daftar riwayat penambahan royalti (tanggal, jumlah royalti masuk) — **tanpa detail data konsumen**, cukup agregat/summary per transaksi (misal: "Creator Royalty dari 1 penjualan pada tanggal X").

### 6.4 Pengajuan Penarikan Dana
- Form pengajuan withdrawal (nominal, rekening tujuan).
- Validasi nominal tidak melebihi saldo tersedia.
- Status pengajuan dapat dipantau (Diajukan / Diproses / Selesai / Ditolak).

### 6.5 Riwayat Transaksi Penarikan Dana
- Daftar seluruh histori penarikan dana beserta status dan tanggal.
- Bukti transfer dari admin dapat dilihat/diunduh langsung pada riwayat terkait.

### 6.6 Profil Creator Partner
- Edit data pribadi, kontak, dan rekening/e-wallet.

---

## 7. Aturan Bisnis Penting (Business Rules)

### 7.1 Privasi Data Konsumen
Creator Partner **tidak boleh** memiliki akses ke data identitas konsumen (nama, kontak, alamat, dsb). Partner hanya melihat data agregat: jumlah penggunaan Creator Code dan nominal royalti.

### 7.2 Creator Code
- Dibuat otomatis oleh sistem saat pendaftaran.
- Satu partner = satu Creator Code aktif.
- Kode bersifat unik di seluruh sistem (tidak boleh duplikat).

### 7.3 Perhitungan Saldo & Penarikan (FINAL — Disepakati)
**Saldo langsung ter-hold (berkurang) saat partner mengajukan penarikan**, bukan menunggu admin menyelesaikan transfer. Ketentuan detailnya:
- Saat partner submit form penarikan, sistem langsung mengurangi *saldo tersedia* sebesar nominal yang diajukan, dan mencatatnya sebagai status **"Diajukan"**.
- Ini mencegah partner mengajukan penarikan ganda yang melebihi saldo yang sebenarnya dimiliki.
- Jika admin **menolak** pengajuan (misal karena rekening tidak valid), saldo yang sempat ter-hold harus **dikembalikan** ke saldo tersedia partner.
- Jika admin **menyelesaikan** transfer, status berubah menjadi **"Selesai"** dan saldo yang sudah dipotong tetap terpotong.

### 7.4 Skema Creator Royalty
Sebaiknya dibuat fleksibel/dapat dikonfigurasi admin (bukan hardcode di kode program).

### 7.5 Target Creator Partner
Target bersifat opsional dan ditentukan oleh admin per partner (atau bisa berlaku umum/global). Sistem menghitung capaian otomatis berdasarkan jumlah transaksi/royalti yang terkumpul dalam periode target.

---

## 8. Struktur Data (Draft Skema Database)

### 8.1 `admins`
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| nama | string | |
| email | string | untuk login |
| password_hash | string | |
| created_at | datetime | |

### 8.2 `partners`
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| nama | string | |
| email | string | untuk login |
| no_hp | string | |
| password_hash | string | |
| referral_code | string (unique) | Creator Code unik |
| no_rekening | string | untuk pencairan dana |
| nama_bank_ewallet | string | |
| status | enum | aktif / nonaktif |
| target_periode | int/nullable | opsional, ditetapkan admin |
| created_at | datetime | |

### 8.3 `products`
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| nama_produk | string | |
| berat | string | default "65 gr" |
| harga | decimal | |
| stok | int | |
| updated_at | datetime | |

### 8.4 `sales` (transaksi penjualan)
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| product_id | FK → products | |
| jumlah | int | |
| total_harga | decimal | |
| partner_id | FK → partners (nullable) | |
| tanggal_transaksi | datetime | |
| komisi_dihasilkan | decimal | Creator Royalty dihitung otomatis |
| dicatat_oleh | FK → admins | |

### 8.5 `commissions` (rekap Creator Royalty)
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| partner_id | FK → partners | |
| sale_id | FK → sales | |
| jumlah_komisi | decimal | |
| status | enum | terhitung / dicairkan |
| created_at | datetime | |

### 8.6 `withdrawals` (pengajuan penarikan dana)
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| partner_id | FK → partners | |
| nominal | decimal | |
| status | enum | diajukan / diproses / selesai / ditolak |
| bukti_transfer_url | string/nullable | diisi admin setelah transfer |
| tanggal_pengajuan | datetime | saldo langsung ter-hold pada saat ini |
| tanggal_selesai | datetime/nullable | |
| alasan_ditolak | string/nullable | diisi jika status = ditolak |

### 8.7 `announcements` (update/pengumuman admin)
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| judul | string | |
| isi | text | |
| gambar_url | string/nullable | |
| created_at | datetime | |
| dibuat_oleh | FK → admins | |

---

## 9. Kebutuhan Non-Fungsional

- **Autentikasi & Otorisasi:** Login terpisah untuk Admin dan Creator Partner, dengan role-based access control.
- **Keamanan Data:** Password ter-hash, data sensitif (rekening) disimpan aman, koneksi HTTPS.
- **Skalabilitas:** Sistem mampu menangani pertambahan jumlah partner dan transaksi.
- **Audit Trail:** Setiap perubahan saldo tercatat dengan jejak yang jelas.
- **Responsif:** Web app responsif diakses dari mobile smartphone maupun desktop.

---

## 10. Di Luar Cakupan (Out of Scope) — Untuk Fase Awal

- Toko online mandiri dengan checkout otomatis oleh konsumen.
- Integrasi payment gateway otomatis untuk pencairan dana.
- Sistem multi-tier / multilevel partner.
- Aplikasi mobile native.

---

## 11. Ringkasan User Flow Utama

**A. Pendaftaran Creator Partner**
`Buka App Partner → Isi form daftar → Submit → Sistem generate Creator Code → Data muncul otomatis di App Admin → Partner login ke dashboard`

**B. Transaksi & Creator Royalty**
`Konsumen order ke admin sambil sebut Creator Code → Admin input transaksi di App Admin → Sistem cocokkan kode → Royalti otomatis masuk ke saldo partner → Partner lihat update saldo di App Partner`

**C. Penarikan Dana**
`Partner ajukan penarikan di App Partner → Saldo ter-hold → Admin lihat pengajuan di App Admin → Admin transfer manual → Admin upload bukti transfer → Status update jadi "Selesai" → Bukti transfer muncul di App Partner`
