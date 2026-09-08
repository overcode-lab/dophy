# Dokumentasi Perancangan Aplikasi Affiliate — DOPHY (Dopamine Snack)

**Versi:** 1.0
**Tanggal:** September 2026
**Disusun untuk:** Tim Developer / Programmer
**Jenis Dokumen:** Product Requirement Document (PRD) & Functional Specification

---

## 1. Latar Belakang

Dophy adalah usaha snack (kemasan 65 gr) yang ingin memperluas pemasaran melalui skema **affiliate marketing**. Affiliator akan mempromosikan produk melalui media sosial atau media lain, menggunakan **kode referral unik** yang diberikan ke konsumen. Konsumen menggunakan kode tersebut saat membeli langsung ke admin Dophy untuk mendapatkan potongan harga. Admin mencatat kode referral yang digunakan dan menghitung komisi affiliator secara kumulatif.

Untuk mendukung proses ini, dibutuhkan **aplikasi berbasis web** dengan dua entitas pengguna:
1. **Admin (Dophy)** — mengelola penjualan, stok, affiliator, dan komisi.
2. **Affiliator** — memantau performa referral, komisi, target, dan pengajuan penarikan dana.

---

## 2. Tujuan Aplikasi

- Mengotomatiskan pencatatan penjualan berbasis kode referral.
- Merekap komisi affiliator secara otomatis dan transparan.
- Memberikan visibilitas kepada affiliator atas performa mereka tanpa mengekspos data pribadi konsumen.
- Menyediakan mekanisme pengajuan dan konfirmasi penarikan dana yang terlacak (auditable).
- Menjadi kanal komunikasi (update/pengumuman) dari admin ke seluruh affiliator.

---

## 3. Aktor / Pengguna Sistem

| Aktor | Deskripsi | Akses |
|---|---|---|
| **Admin** | Pemilik/pengelola usaha Dophy | Web app khusus admin (dashboard) |
| **Affiliator** | Mitra promosi yang mendaftar dan mendapat kode referral | Web app khusus affiliator |
| **Konsumen** | Pembeli produk yang menggunakan kode referral | Tidak memiliki akun/login — hanya berinteraksi via transaksi yang diinput admin |

> Catatan: Berdasarkan deskripsi, transaksi konsumen **diinput manual oleh admin** (bukan checkout online oleh konsumen sendiri), karena pembelian dilakukan "ke admin Dophy". Jika ke depan Dophy ingin membuka toko online mandiri, ini bisa jadi fase pengembangan lanjutan (lihat bagian 10 — Out of Scope).

---

## 4. Alur Bisnis (Business Flow) — Ringkasan

1. Calon affiliator mendaftar melalui **App Affiliator** (halaman daftar).
2. Sistem otomatis membuatkan **kode referral unik** untuk affiliator tersebut.
3. Data pendaftaran otomatis muncul di **App Admin**.
4. Affiliator mempromosikan produk dan membagikan kode referral ke calon konsumen.
5. Konsumen membeli produk ke admin (langsung/chat/dsb) dan menyebutkan kode referral.
6. Admin menginput transaksi penjualan beserta kode referral yang digunakan di App Admin.
7. Sistem otomatis menghitung komisi berdasarkan kode referral dan menambahkannya ke **saldo kumulatif** affiliator terkait.
8. Affiliator dapat memantau saldo, jumlah pengguna kode referral, dan progres target di App Affiliator.
9. Affiliator mengajukan **penarikan dana (withdrawal)** melalui App Affiliator.
10. Admin memproses transfer secara manual, lalu mengunggah **bukti transfer** di App Admin.
11. Bukti transfer otomatis tampil di App Affiliator, dan saldo affiliator berkurang sesuai jumlah penarikan.
12. Riwayat transaksi penarikan tersimpan dan dapat dilihat kedua pihak.

---

## 5. Modul & Fitur — App Admin

### 5.1 Dashboard Admin
- Ringkasan total penjualan, total komisi terutang, jumlah affiliator aktif, stok produk.
- Grafik/statistik penjualan berdasarkan periode (harian/mingguan/bulanan).

### 5.2 Manajemen Produk & Stok
- CRUD produk (nama, varian rasa jika ada, harga, kemasan 65 gr, dsb).
- Update stok masuk/keluar.
- Notifikasi/indikator stok menipis (opsional, nice-to-have).

### 5.3 Manajemen Penjualan (Transaksi)
- Input transaksi penjualan manual: produk, jumlah, harga, **kode referral yang digunakan (opsional bila tanpa referral)**, tanggal transaksi.
- Sistem otomatis mengaitkan transaksi ke affiliator pemilik kode referral (jika ada).
- Sistem otomatis menghitung komisi sesuai aturan komisi yang berlaku (lihat 5.5).
- Riwayat seluruh transaksi penjualan, dapat difilter per affiliator/per tanggal/per produk.

### 5.4 Manajemen Affiliator
- Daftar seluruh affiliator terdaftar (otomatis masuk saat affiliator daftar dari App Affiliator).
- Detail per affiliator: kode referral, jumlah penggunaan kode, total komisi kumulatif, saldo saat ini, target (jika ditetapkan).
- Admin dapat menetapkan/mengubah target penjualan per affiliator (opsional).
- Admin dapat menonaktifkan/menghapus akun affiliator jika diperlukan.

### 5.5 Manajemen Komisi
- Pengaturan skema komisi (misal: nominal tetap per pcs, atau persentase dari harga jual). Sebaiknya dapat dikonfigurasi oleh admin, tidak hardcode.
- Rekap komisi kumulatif per affiliator (otomatis terupdate setiap ada transaksi baru).

### 5.6 Manajemen Penarikan Dana
- Daftar pengajuan penarikan dana dari affiliator (status: *Diajukan → Diproses → Selesai*, atau *Ditolak*).
- Admin melakukan transfer manual di luar sistem (rekening bank/e-wallet).
- Admin mengunggah **bukti transfer** (gambar/PDF) untuk setiap penarikan yang sudah diproses.
- Update status pengajuan otomatis mengubah tampilan di App Affiliator.
- Saldo affiliator otomatis berkurang saat pengajuan disetujui/dikonfirmasi (perlu didefinisikan: berkurang saat *diajukan* atau saat *selesai* — lihat catatan di 7.3).

### 5.7 Update / Pengumuman untuk Affiliator
- Admin dapat membuat/mengirim pengumuman (teks, bisa disertai gambar) yang akan muncul di App Affiliator (misal: info promo baru, perubahan skema komisi, pengumuman target).

### 5.8 Manajemen Akun Admin
- Login admin dengan autentikasi aman.
- (Opsional) multi-admin dengan role berbeda jika tim berkembang.

---

## 6. Modul & Fitur — App Affiliator

### 6.1 Halaman Pendaftaran (Register)
- Form pendaftaran affiliator baru (nama, kontak/WhatsApp, email, media sosial, nomor rekening/e-wallet untuk pencairan dana, password).
- Setelah submit, sistem otomatis:
  - Membuat kode referral unik.
  - Mendaftarkan data ke database dan otomatis muncul di App Admin.
- Login untuk affiliator yang sudah terdaftar.

### 6.2 Dashboard Affiliator
- Kode referral milik affiliator (dengan tombol salin/share).
- Saldo komisi saat ini (real-time berdasarkan kumulatif komisi dikurangi penarikan).
- Jumlah konsumen yang sudah menggunakan kode referral (angka agregat, **tanpa identitas konsumen**).
- Progres target (jika admin menetapkan target, tampilkan capaian vs target, misal progress bar).
- Feed/list update & pengumuman terbaru dari admin.

### 6.3 Riwayat Komisi
- Daftar riwayat penambahan komisi (tanggal, jumlah komisi masuk) — **tanpa detail data konsumen**, cukup agregat/summary per transaksi (misal: "Komisi dari 1 penjualan pada tanggal X").

### 6.4 Pengajuan Penarikan Dana
- Form pengajuan withdrawal (nominal, rekening tujuan).
- Validasi nominal tidak melebihi saldo tersedia.
- Status pengajuan dapat dipantau (Diajukan / Diproses / Selesai / Ditolak).

### 6.5 Riwayat Transaksi Penarikan Dana
- Daftar seluruh histori penarikan dana beserta status dan tanggal.
- Bukti transfer dari admin dapat dilihat/diunduh langsung pada riwayat terkait.

### 6.6 Profil Affiliator
- Edit data pribadi, kontak, dan rekening/e-wallet.

---

## 7. Aturan Bisnis Penting (Business Rules)

### 7.1 Privasi Data Konsumen
Affiliator **tidak boleh** memiliki akses ke data identitas konsumen (nama, kontak, alamat, dsb). Affiliator hanya melihat data agregat: jumlah penggunaan kode referral dan nominal komisi.

### 7.2 Kode Referral
- Dibuat otomatis oleh sistem saat pendaftaran (contoh format: `DOPHY-<nama/kode unik>` atau kombinasi acak, perlu disepakati dengan developer).
- Satu affiliator = satu kode referral aktif (kecuali dibutuhkan multi-kode di kemudian hari).
- Kode bersifat unik di seluruh sistem (tidak boleh duplikat).

### 7.3 Perhitungan Saldo & Penarikan (FINAL — Disepakati)
**Saldo langsung ter-hold (berkurang) saat affiliator mengajukan penarikan**, bukan menunggu admin menyelesaikan transfer. Ketentuan detailnya:
- Saat affiliator submit form penarikan, sistem langsung mengurangi *saldo tersedia* sebesar nominal yang diajukan, dan mencatatnya sebagai status **"Diajukan"**.
- Ini mencegah affiliator mengajukan penarikan ganda yang melebihi saldo yang sebenarnya dimiliki.
- Jika admin **menolak** pengajuan (misal karena rekening tidak valid), saldo yang sempat ter-hold harus **dikembalikan** ke saldo tersedia affiliator.
- Jika admin **menyelesaikan** transfer, status berubah menjadi **"Selesai"** dan saldo yang sudah dipotong tetap terpotong (tidak dikembalikan lagi).
- Developer perlu memastikan mekanisme ini konsisten di database (misal dengan field `saldo_tersedia` dan `saldo_tertahan`, atau dihitung dari ledger `commissions` dikurangi total `withdrawals` yang berstatus "Diajukan"/"Diproses"/"Selesai").

### 7.4 Skema Komisi
Sebaiknya dibuat fleksibel/dapat dikonfigurasi admin (bukan hardcode di kode program), karena nominal atau skema komisi berpotensi berubah.

### 7.5 Target Affiliator
Target bersifat opsional dan ditentukan oleh admin per affiliator (atau bisa berlaku umum/global). Sistem menghitung capaian otomatis berdasarkan jumlah transaksi/komisi yang terkumpul dalam periode target.

---

## 8. Struktur Data (Draft Skema Database)

> Ini adalah draft awal entitas data untuk membantu developer merancang database. Detail tipe data & relasi dapat disesuaikan saat implementasi.

### 8.1 `admins`
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| nama | string | |
| email | string | untuk login |
| password_hash | string | |
| created_at | datetime | |

### 8.2 `affiliators`
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| nama | string | |
| email | string | untuk login |
| no_hp | string | |
| password_hash | string | |
| kode_referral | string (unique) | dibuat otomatis sistem |
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
| kode_referral_digunakan | FK → affiliators.kode_referral (nullable) | |
| tanggal_transaksi | datetime | |
| komisi_dihasilkan | decimal | dihitung otomatis |
| dicatat_oleh | FK → admins | |

### 8.5 `commissions` (rekap komisi, bisa berupa ledger/riwayat)
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| affiliator_id | FK → affiliators | |
| sale_id | FK → sales | |
| jumlah_komisi | decimal | |
| status | enum | terhitung / dicairkan |
| created_at | datetime | |

### 8.6 `withdrawals` (pengajuan penarikan dana)
| Field | Tipe | Keterangan |
|---|---|---|
| id | UUID/int | Primary key |
| affiliator_id | FK → affiliators | |
| nominal | decimal | |
| status | enum | diajukan / diproses / selesai / ditolak |
| bukti_transfer_url | string/nullable | diisi admin setelah transfer |
| tanggal_pengajuan | datetime | saldo langsung ter-hold pada saat ini |
| tanggal_selesai | datetime/nullable | |
| alasan_ditolak | string/nullable | diisi jika status = ditolak; saldo yang ter-hold dikembalikan |

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

- **Autentikasi & Otorisasi:** Login terpisah untuk Admin dan Affiliator, dengan role-based access control agar affiliator tidak bisa mengakses data admin/konsumen.
- **Keamanan Data:** Password ter-hash, data sensitif (rekening) disimpan aman, koneksi HTTPS.
- **Skalabilitas:** Sistem harus mampu menangani pertambahan jumlah affiliator dan transaksi tanpa perlu perombakan besar.
- **Audit Trail:** Setiap perubahan saldo (komisi masuk, penarikan) harus tercatat dengan jejak yang jelas (siapa, kapan, berapa) untuk menghindari sengketa.
- **Notifikasi (opsional, nice-to-have):** Notifikasi email/WhatsApp saat status penarikan berubah atau ada pengumuman baru.
- **Responsif:** Web app idealnya responsif (dapat diakses baik dari desktop maupun HP), karena affiliator kemungkinan besar mengakses dari HP.

---

## 10. Di Luar Cakupan (Out of Scope) — Untuk Fase Awal

Hal-hal berikut **tidak** termasuk dalam cakupan versi pertama, namun bisa menjadi pengembangan lanjutan:
- Toko online mandiri dengan checkout otomatis oleh konsumen (saat ini transaksi dicatat manual oleh admin).
- Integrasi payment gateway otomatis untuk pencairan dana (saat ini transfer dilakukan manual oleh admin).
- Sistem multi-level affiliate (affiliate merekrut sub-affiliate).
- Aplikasi mobile native (versi awal berbasis web).

---

## 11. Ringkasan User Flow Utama

**A. Pendaftaran Affiliator**
`Buka App Affiliator → Isi form daftar → Submit → Sistem generate kode referral → Data muncul otomatis di App Admin → Affiliator login ke dashboard`

**B. Transaksi & Komisi**
`Konsumen order ke admin sambil sebut kode referral → Admin input transaksi di App Admin → Sistem cocokkan kode referral → Komisi otomatis masuk ke saldo affiliator → Affiliator lihat update saldo & histori di App Affiliator`

**C. Penarikan Dana**
`Affiliator ajukan penarikan di App Affiliator → Saldo ter-hold → Admin lihat pengajuan di App Admin → Admin transfer manual → Admin upload bukti transfer → Status update jadi "Selesai" → Bukti transfer & histori muncul otomatis di App Affiliator`

---

## 12. Catatan untuk Developer

- Perhitungan komisi dan saldo sebaiknya dilakukan di sisi **backend/server** (bukan di frontend) untuk menghindari manipulasi data.
- Kode referral harus dijamin unik di level database (unique constraint).
- Sebaiknya sediakan halaman/panel konfigurasi skema komisi agar admin tidak perlu minta bantuan developer setiap kali ada perubahan skema.
- Aturan saldo (poin 7.3) sudah difinalkan: saldo ter-hold sejak pengajuan penarikan dibuat, bukan menunggu transfer selesai. Pastikan logika pengembalian saldo saat pengajuan ditolak juga diimplementasikan dengan benar.

---

*Dokumen ini adalah draf awal untuk kebutuhan development dan dapat disesuaikan lebih lanjut bersama tim programmer sesuai kebutuhan teknis dan kompleksitas implementasi.*
