# Website Masjid (HTML, CSS, JavaScript murni)

Website profil dan informasi masjid lengkap, cepat, dan responsif. Dapat dibuka langsung di browser tanpa perlu server backend, framework, maupun instalasi database khusus.

---

## 🚀 Fitur Baru: Panel Admin & Pengelola Konten

Website ini sekarang dilengkapi dengan sistem autentikasi dan panel administrator untuk mengelola seluruh isi website secara langsung dari browser:

1. **Halaman Login Admin (`login.html`)**:
   - Autentikasi pengurus masjid dengan tampilan modern.
   - **Akun Bawaan (Default)**:
     - **Username**: `admin`
     - **Password**: `admin123`
   - *Username dan password dapat diubah kapan saja di menu Pengaturan Admin.*

2. **Panel Dashboard Admin (`admin.html`)**:
   - 📊 **Ikhtisar (Dashboard)**: Statistik ringkas kas, total kegiatan, pengumuman aktif, pesan jamaah, dan akses cepat.
   - 🕌 **Kelola Jadwal Salat**: Ubah jam waktu Imsak, Subuh, Terbit, Dzuhur, Ashar, Maghrib, dan Isya secara real-time.
   - 📢 **Kelola Pengumuman**: Tambah, ubah, hapus pengumuman, serta tandai status penting / mendesak.
   - 📅 **Kelola Kegiatan & Agenda**: Tambah, ubah, hapus jadwal kajian, pengajian, TPA, shalat Jumat, dan kegiatan sosial lengkap dengan tanggal, jam, lokasi, dan poster.
   - 💰 **Kelola Keuangan Kas**: Buat periode bulan baru, atur saldo awal, catat pemasukan dan pengeluaran harian, otomatis menghitung total dan saldo akhir.
   - 📝 **Kelola Artikel & Berita**: Tulis artikel dakwah atau berita kegiatan dengan ringkasan dan isi lengkap.
   - 💳 **Kelola Donasi**: Kelola daftar nomor rekening bank dan catatan transfer untuk jamaah.
   - ✉️ **Kotak Masuk Jamaah**: Baca pertanyaan dan saran yang dikirim pengunjung melalui form di `kontak.html`, dengan tombol balas langsung via WhatsApp.
   - ⚙️ **Pengaturan & Akun**: Ubah identitas masjid, ganti username/password admin.
   - 💾 **Backup & Restore**: Cadangkan seluruh data website ke file JSON atau pulihkan data kapan saja.

---

## 📁 Struktur Berkas

- **Halaman Publik**:
  - `index.html`: Beranda, hero salat berikutnya, countdown, sambutan, informasi singkat.
  - `profil.html`: Sejarah, visi misi, struktur kepengurusan.
  - `jadwal.html`: Jadwal lengkap waktu salat dan jam digital.
  - `kegiatan.html`: Daftar agenda & filter kategori kegiatan.
  - `pengumuman.html`: Papan pengumuman pengurus untuk jamaah.
  - `galeri.html`: Galeri foto kegiatan dengan lightbox.
  - `donasi.html`: Rekening bank, QRIS, dan panduan donasi.
  - `keuangan.html`: Laporan transparansi kas bulanan.
  - `artikel.html`: Bacaan keislaman dan berita masjid.
  - `kontak.html`: Alamat, peta lokasi, kontak WhatsApp, dan form pesan jamaah.

- **Halaman & Berkas Admin**:
  - `login.html`: Halaman login admin.
  - `admin.html`: Panel dashboard admin.
  - `css/admin.css`: Gaya tampilan login & dashboard admin.
  - `js/data-store.js`: Penyimpanan lokal (`MasjidDB`) berbasis `localStorage`.
  - `js/admin.js`: Logika interaktif panel admin.

- **Aset & Skrip Umum**:
  - `css/style.css`: Gaya utama website publik.
  - `js/script.js`: Logika interaktif website publik yang tersinkronisasi otomatis dengan `MasjidDB`.
  - `images/`: Berkas logo, ilustrasi SVG, dan poster kegiatan.

---

## 🛠️ Cara Penggunaan

1. Buka berkas `index.html` pada peramban (browser) apa saja (Chrome, Edge, Firefox, Safari).
2. Untuk masuk ke panel pengelola:
   - Klik tautan **Login Admin** yang terletak di bagian bawah footer setiap halaman, atau langsung buka `login.html`.
   - Masukkan username `admin` dan password `admin123`.
   - Di dashboard admin, Anda dapat langsung menambah/mengubah jadwal salat, kegiatan, pengumuman, kas, dan artikel.
   - Semua perubahan tersimpan di peramban Anda dan langsung tampil pada halaman website publik.
