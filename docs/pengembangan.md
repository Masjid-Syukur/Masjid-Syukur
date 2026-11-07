# Panduan Pengembangan

Dokumen ini menjelaskan **implementasi legacy yang masih ada di repository**, bukan arsitektur akhir Website Masjid Syukur Ampel. Untuk gambaran proyek, lihat [README](../README.md); untuk pengoperasian panel pengurus saat ini, lihat [panduan admin](panduan-admin.md).

## Aturan untuk pengembangan berikutnya

Arsitektur yang ditetapkan adalah **frontend stateless dengan Supabase sebagai backend**. Pengembangan fitur baru dan migrasi wajib mengikuti [keputusan arsitektur](arsitektur-stateless-supabase.md) serta [aturan pengembangan](aturan-pengembangan.md). Penyimpanan konten dan akun di browser yang dijelaskan di bawah adalah kondisi legacy, bukan pola yang boleh diperluas untuk produksi.

Integrasi client Supabase, skema, migrasi, konfigurasi environment, dan kebijakan akses belum tersedia. Dokumen ini tetap mempertahankan petunjuk kode saat ini agar kondisi implementasi tidak tertukar dengan target.

## Menjalankan implementasi legacy secara lokal

Implementasi saat ini menggunakan HTML, CSS, dan JavaScript murni. Untuk menjalankannya, tidak ada instalasi dependensi, proses build, backend aplikasi, atau database server yang perlu dijalankan.

- Untuk melihat halaman, buka [`src/pages/home/index.html`](../src/pages/home/index.html) di browser modern dengan JavaScript aktif.
- Untuk menguji login, penyimpanan data, dan hubungan antarhalaman, gunakan server HTTP statis dari editor atau alat lokal yang tersedia. Arahkan root server ke direktori proyek.
- Gunakan protokol, host, dan port yang konsisten. `localhost` dan `127.0.0.1`, port berbeda, serta HTTP dan HTTPS mempunyai origin dan ruang penyimpanan terpisah.
- Hindari mengandalkan penyimpanan lintas halaman pada `file://`; perilakunya dapat berbeda antarbrowser. Cadangkan data sebelum berpindah origin atau browser.
- Koneksi internet diperlukan untuk layanan eksternal, bukan untuk menjalankan server backend proyek.

Repository belum menyediakan skrip build, lint, atau pengujian otomatis aplikasi. Jangan mengasumsikan tersedia perintah seperti `npm install`, `npm run dev`, atau `npm test`.

## Struktur berkas

Struktur direktori, aturan pemisahan layer presentation/domain/data, dan mekanisme resolusi path aset dijelaskan di [struktur proyek](struktur-proyek.md). Tabel berikut merinci peran tiap berkas.

### Halaman publik

| Berkas | Peran |
|---|---|
| [`src/pages/home/index.html`](../src/pages/home/index.html) | Beranda, informasi masjid, jadwal salat berikutnya, dan hitung mundur. |
| [`src/pages/profil/index.html`](../src/pages/profil/index.html) | Profil, sejarah, visi/misi, serta kepengurusan. |
| [`src/pages/jadwal/index.html`](../src/pages/jadwal/index.html) | Jadwal salat harian dan jam digital. |
| [`src/pages/kegiatan/index.html`](../src/pages/kegiatan/index.html) | Agenda dan filter kategori kegiatan. |
| [`src/pages/pengumuman/index.html`](../src/pages/pengumuman/index.html) | Papan pengumuman untuk jamaah. |
| [`src/pages/galeri/index.html`](../src/pages/galeri/index.html) | Galeri dokumentasi dan penampil foto (lightbox). |
| [`src/pages/donasi/index.html`](../src/pages/donasi/index.html) | Informasi rekening, QRIS, dan panduan donasi. |
| [`src/pages/keuangan/index.html`](../src/pages/keuangan/index.html) | Laporan kas bulanan. |
| [`src/pages/artikel/index.html`](../src/pages/artikel/index.html) | Artikel keislaman dan berita masjid. |
| [`src/pages/materi/index.html`](../src/pages/materi/index.html) | Materi/modul kajian dan tautan unduh PDF. |
| [`src/pages/zakat/index.html`](../src/pages/zakat/index.html) | Kalkulator zakat fitrah, maal, dan penghasilan. |
| [`src/pages/kontak/index.html`](../src/pages/kontak/index.html) | Alamat, peta, kontak WhatsApp, dan formulir pesan lokal. |

### Panel admin dan aset

| Berkas/direktori | Peran |
|---|---|
| [`src/pages/admin/login.html`](../src/pages/admin/login.html) | Formulir dan logika login frontend, termasuk pilihan penyimpanan sesi. |
| [`src/pages/admin/index.html`](../src/pages/admin/index.html) | Antarmuka dashboard, navigasi, formulir, dan pemeriksaan sesi di frontend. |
| [`src/css/style.css`](../src/css/style.css) | Gaya utama website publik dan komponen dasar. |
| [`src/css/admin.css`](../src/css/admin.css) | Gaya tambahan untuk login dan dashboard admin. |
| [`src/js/core/data-store.js`](../src/js/core/data-store.js) | Data awal, penyimpanan lokal, API `MasjidDB`, akun, dan sesi. |
| [`src/pages/<halaman>/<halaman>.js`](../src/pages/<halaman>/<halaman>.js) | Interaksi halaman publik, rendering konten, jadwal salat, dan formulir kontak. |
| [`src/pages/admin/admin.js`](../src/pages/admin/admin.js) | Objek `AdminApp`: navigasi, formulir pengelolaan, gambar/PDF, serta backup dan pemulihan. |
| [`assets/images/`](../assets/images/) | Logo, ilustrasi, dan gambar yang disimpan sebagai berkas proyek. |
| [`docs/`](./) | Panduan admin dan pengembangan. |

Seluruh logika halaman berada di modul ES per halaman pada `src/pages/<halaman>/<halaman>.js`; skrip inline di HTML sudah diekstraksi (termasuk `materi.html`, `zakat.html`, dan `login.html`). Header, navigasi, footer, dan beberapa informasi masjid masih ditulis langsung pada masing-masing halaman HTML; jangan menganggap seluruh tampilan berasal dari `MasjidDB`.

## Alur data dan pemuatan skrip

1. Halaman memuat `src/js/core/supabase-client.js` dan `src/js/core/data-store.js` sebagai skrip klasik, yang menyediakan `window.MasjidSupabase` dan `window.MasjidDB`.
2. Saat data diminta, `MasjidDB` membaca JSON dari `localStorage`. Jika belum ada data, data awal dari `DEFAULT_DATA` digunakan dan disimpan. Pembacaan juga menggabungkan beberapa nilai bawaan dan menjalankan penyesuaian kompatibilitas data lama.
3. Setiap halaman memuat modul ES-nya sendiri yang berada satu folder dengan berkas HTML-nya (`<script type="module" src="./<halaman>.js">`). Modul halaman mengimpor fungsi global dari `src/js/shared/` — `initCommon()` dari `src/js/main.js` menjalankan fitur bersama (navigasi, jam/jadwal salat, animasi scroll, tahun footer, info kontak, bilah musafir), lalu modul menjalankan logika khusus halamannya pada `DOMContentLoaded`.
4. Formulir admin dihubungkan oleh `src/pages/admin/admin.js` ke metode `MasjidDB`, lalu hasilnya disimpan kembali ke `localStorage`. Login ditangani oleh `src/pages/admin/login.js`.
5. Halaman publik membaca data lokal untuk bagian yang dirender secara dinamis. Buka atau muat ulang halaman terkait setelah perubahan untuk memeriksa hasil. Pembaruan dari Supabase memicu event `masjid:data-synced`, dan tiap modul halaman me-render ulang bagiannya masing-masing.

**Pada implementasi legacy ini belum ada API backend atau mekanisme penerbitan konten bersama.** Unggahan ke hosting statis hanya menyajikan berkas proyek; data lokal milik admin tidak ikut terkirim kepada browser pengunjung lain. Ini adalah gap yang harus diganti oleh akses data Supabase, bukan alasan untuk menambah mekanisme sinkronisasi JSON browser.

### Penyimpanan browser

| Kunci | Penyimpanan | Isi |
|---|---|---|
| `masjid_syukur_db_v5` | `localStorage` | Data `MasjidDB`: identitas, jadwal, pengumuman, kegiatan, galeri, keuangan, artikel, materi, donasi, organisasi, pesan, dan akun admin. |
| `masjid_admin_session_v1` | `localStorage` atau `sessionStorage` | Sesi admin; pilihan **Ingat saya** memakai `localStorage`, selain itu memakai `sessionStorage`. |
| `masjid_syukur_jadwal_DD-MM-YYYY` | `localStorage` | Cache jadwal salat per tanggal. |

Data hanya tersedia pada browser/profil dan origin yang sama. Mode privat, penghapusan data situs, atau keterbatasan kapasitas dapat menghilangkan data atau menggagalkan penyimpanan. Gambar dan PDF dari panel admin dapat disimpan sebagai data URL, sehingga menambah ukuran data lokal.

`saveDatabase()` mencatat kegagalan penyimpanan ke Console dan mengembalikan `false`, tetapi sebagian pemanggil tetap menampilkan notifikasi berhasil tanpa memeriksa hasil tersebut. Untuk pemeriksaan manual, muat ulang halaman dan pastikan perubahan benar-benar bertahan; jangan hanya mengandalkan notifikasi.

### Mengubah data awal

- Perubahan `DEFAULT_DATA` di `src/js/core/data-store.js` menentukan data awal untuk penyimpanan baru. Data yang sudah tersimpan umumnya tetap mengambil nilai lokal, dengan beberapa penyesuaian bawaan di `loadDatabase()`; mengubah default bukan cara menerbitkan perubahan ke seluruh pengguna.
- Untuk memeriksa data awal tanpa merusak data kerja, gunakan profil browser terpisah. Jika perlu reset, buat backup terlebih dahulu.
- Data artikel dan materi kajian terpisah. `artikel.html` menggunakan artikel, sedangkan menu admin **Materi Kajian (PDF)** menggunakan `getMaterials()`, `addMaterial()`, dan metode materi terkait. Nama internal seperti `sec-articles` atau `renderArticles()` pada panel admin masih digunakan untuk antarmuka materi.
- Perubahan teks yang ditulis langsung di HTML perlu diperiksa pada semua halaman terkait, termasuk navigasi dan footer.

## Integrasi eksternal

### Jadwal salat otomatis

`src/js/shared/prayer-times.js` (halaman publik) dan `src/pages/admin/admin.js` (panel admin) mengambil jadwal dari `https://api.aladhan.com/v1/timings/DD-MM-YYYY` dengan konfigurasi saat ini:

- Latitude: `-7.5333`.
- Longitude: `110.5833`.
- Metode: `20` (Kementerian Agama RI/Kemenag).

Alur pemuatan memeriksa cache harian terlebih dahulu, lalu meminta jadwal jika cache belum tersedia. Hasil diterapkan ke `MasjidDB` dan disimpan sebagai cache. Saat permintaan gagal, aplikasi tetap memakai jadwal lokal; jadwal tersebut belum tentu sesuai dengan tanggal saat ini.

Belum tersedia editor jadwal manual di panel admin. Jika konfigurasi lokasi/metode diubah, periksa **kedua skrip** dan tangani cache harian lama secara terarah karena nama kuncinya hanya memuat tanggal, bukan lokasi/metode. Perubahan jadwal lokal manual juga dapat ditimpa ketika jadwal dari cache/API diterapkan kembali.

### Font, peta, dan tautan kontak

Halaman menggunakan Google Fonts; peta dan tautan WhatsApp/media sosial juga bergantung pada layanan pihak ketiga. Permintaan font, jadwal, atau peta dan pembukaan tautan eksternal melibatkan koneksi ke penyedia terkait. Tidak ada pengiriman formulir kontak ke backend proyek: formulir hanya memanggil `MasjidDB.addMessage()`.

## Akun, backup, dan batas keamanan

- `MasjidDB.login()` membandingkan username/password dengan data lokal. Password disimpan tanpa enkripsi dan `isLoggedIn()` memeriksa keberadaan token pada penyimpanan browser, bukan sesi yang divalidasi server.
- Pemeriksaan login di frontend dapat dimodifikasi oleh pengguna browser. Jangan memperlakukannya sebagai pembatas akses produksi atau tempat penyimpanan rahasia. Akun bawaan untuk percobaan dijelaskan di [panduan admin](panduan-admin.md).
- `exportJSON()` mengekspor data `MasjidDB`, termasuk kredensial dan pesan. Jangan commit hasil backup atau membagikannya melalui repository publik.
- `importJSON()` mengganti database lokal dan hanya memeriksa keberadaan `adminUser` serta `prayerTimes` sebagai validasi awal. Gunakan backup tepercaya dan kompatibel; jangan menganggap impor memvalidasi seluruh skema.
- Sesi login, cache jadwal harian, dan berkas proyek tidak termasuk dalam ekspor `MasjidDB`. Berkas yang hanya dirujuk melalui path/URL perlu dicadangkan terpisah.

Untuk target produksi, penyimpanan bersama menggunakan Supabase PostgreSQL/Storage, identitas dikelola Supabase Auth, dan otorisasi ditegakkan melalui grants, RLS, serta kontrol backend terkait. Mengganti kredensial bawaan atau menggunakan hosting statis saja tidak menyelesaikan batasan ini. Ikuti [aturan pengembangan](aturan-pengembangan.md), termasuk larangan membawa password/token legacy ke akun Auth.

## Pemeriksaan perubahan legacy

Belum ada test suite aplikasi di repository. Gunakan profil browser khusus pengujian agar data kerja tidak tertimpa. Pemeriksaan di bawah berlaku untuk kode legacy; integrasi Supabase juga wajib memenuhi [checklist aturan pengembangan](aturan-pengembangan.md), terutama tes lintas perangkat, Auth, RLS, dan Storage.

1. Buka halaman yang diubah melalui HTTP statis dan periksa Console serta Network di DevTools.
2. Periksa navigasi dan tampilan pada lebar layar desktop serta ponsel.
3. Jika mengubah data store atau admin, coba login, tambah/ubah/hapus data uji, lalu muat ulang untuk memeriksa persistensi dan tampilan publik pada origin yang sama.
4. Jika mengubah backup, uji ekspor dan pemulihan pada profil uji; pastikan konten serta kredensial sesuai backup.
5. Jika mengubah jadwal, periksa pemuatan cache/API dan kondisi jaringan gagal; jangan menganggap data lokal otomatis mutakhir.
6. Periksa bahwa tautan dokumentasi masih menuju berkas yang benar dan perbarui panduan terkait jika perilaku pengguna berubah.

Jika Node.js tersedia, pemeriksaan sintaks skrip terpisah dapat dilakukan dari root proyek tanpa memasang dependensi:

```sh
node --check src/js/core/data-store.js
node --check src/js/shared/prayer-times.js
node --check src/pages/zakat/zakat.js
node --check src/pages/admin/admin.js
```

Untuk memeriksa seluruh modul sekaligus:

```sh
find src/js -name "*.js" -exec node --check {} \;
```

Pemeriksaan ini hanya memvalidasi sintaks berkas JavaScript tersebut, bukan skrip inline di HTML, tampilan browser, ketepatan data, atau keamanan aplikasi.
