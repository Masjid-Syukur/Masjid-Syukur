# Panduan Pengembangan

Dokumen ini menjelaskan **implementasi legacy yang masih ada di repository**, bukan arsitektur akhir Website Masjid Syukur Ampel. Untuk gambaran proyek, lihat [README](../README.md); untuk pengoperasian panel pengurus saat ini, lihat [panduan admin](panduan-admin.md).

## Aturan untuk pengembangan berikutnya

Arsitektur yang ditetapkan adalah **frontend stateless dengan Supabase sebagai backend**. Pengembangan fitur baru dan migrasi wajib mengikuti [keputusan arsitektur](arsitektur-stateless-supabase.md) serta [aturan pengembangan](aturan-pengembangan.md). Penyimpanan konten dan akun di browser yang dijelaskan di bawah adalah kondisi legacy, bukan pola yang boleh diperluas untuk produksi.

Integrasi client Supabase, skema, migrasi, konfigurasi environment, dan kebijakan akses belum tersedia. Dokumen ini tetap mempertahankan petunjuk kode saat ini agar kondisi implementasi tidak tertukar dengan target.

## Menjalankan implementasi legacy secara lokal

Implementasi saat ini menggunakan HTML, CSS, dan JavaScript murni. Untuk menjalankannya, tidak ada instalasi dependensi, proses build, backend aplikasi, atau database server yang perlu dijalankan.

- Untuk melihat halaman, buka [`index.html`](../index.html) di browser modern dengan JavaScript aktif.
- Untuk menguji login, penyimpanan data, dan hubungan antarhalaman, gunakan server HTTP statis dari editor atau alat lokal yang tersedia. Arahkan root server ke direktori proyek.
- Gunakan protokol, host, dan port yang konsisten. `localhost` dan `127.0.0.1`, port berbeda, serta HTTP dan HTTPS mempunyai origin dan ruang penyimpanan terpisah.
- Hindari mengandalkan penyimpanan lintas halaman pada `file://`; perilakunya dapat berbeda antarbrowser. Cadangkan data sebelum berpindah origin atau browser.
- Koneksi internet diperlukan untuk layanan eksternal, bukan untuk menjalankan server backend proyek.

Repository belum menyediakan skrip build, lint, atau pengujian otomatis aplikasi. Jangan mengasumsikan tersedia perintah seperti `npm install`, `npm run dev`, atau `npm test`.

## Struktur berkas

### Halaman publik

| Berkas | Peran |
|---|---|
| [`index.html`](../index.html) | Beranda, informasi masjid, jadwal salat berikutnya, dan hitung mundur. |
| [`profil.html`](../profil.html) | Profil, sejarah, visi/misi, serta kepengurusan. |
| [`jadwal.html`](../jadwal.html) | Jadwal salat harian dan jam digital. |
| [`kegiatan.html`](../kegiatan.html) | Agenda dan filter kategori kegiatan. |
| [`pengumuman.html`](../pengumuman.html) | Papan pengumuman untuk jamaah. |
| [`galeri.html`](../galeri.html) | Galeri dokumentasi dan penampil foto (lightbox). |
| [`donasi.html`](../donasi.html) | Informasi rekening, QRIS, dan panduan donasi. |
| [`keuangan.html`](../keuangan.html) | Laporan kas bulanan. |
| [`artikel.html`](../artikel.html) | Artikel keislaman dan berita masjid. |
| [`materi.html`](../materi.html) | Materi/modul kajian dan tautan unduh PDF. |
| [`zakat.html`](../zakat.html) | Kalkulator zakat fitrah, maal, dan penghasilan. |
| [`kontak.html`](../kontak.html) | Alamat, peta, kontak WhatsApp, dan formulir pesan lokal. |

### Panel admin dan aset

| Berkas/direktori | Peran |
|---|---|
| [`login.html`](../login.html) | Formulir dan logika login frontend, termasuk pilihan penyimpanan sesi. |
| [`admin.html`](../admin.html) | Antarmuka dashboard, navigasi, formulir, dan pemeriksaan sesi di frontend. |
| [`css/style.css`](../css/style.css) | Gaya utama website publik dan komponen dasar. |
| [`css/admin.css`](../css/admin.css) | Gaya tambahan untuk login dan dashboard admin. |
| [`js/data-store.js`](../js/data-store.js) | Data awal, penyimpanan lokal, API `MasjidDB`, akun, dan sesi. |
| [`js/script.js`](../js/script.js) | Interaksi halaman publik, rendering konten, jadwal salat, dan formulir kontak. |
| [`js/admin.js`](../js/admin.js) | Objek `AdminApp`: navigasi, formulir pengelolaan, gambar/PDF, serta backup dan pemulihan. |
| [`images/`](../images/) | Logo, ilustrasi, dan gambar yang disimpan sebagai berkas proyek. |
| [`docs/`](./) | Panduan admin dan pengembangan. |

Sebagian gaya dan logika halaman khusus masih berada langsung di HTML, misalnya pada `materi.html` dan `zakat.html`. Header, navigasi, footer, dan beberapa informasi masjid juga ditulis langsung pada masing-masing halaman; jangan menganggap seluruh tampilan berasal dari `MasjidDB`.

## Alur data dan pemuatan skrip

1. Halaman memuat `js/data-store.js`, yang menyediakan `window.MasjidDB`.
2. Saat data diminta, `MasjidDB` membaca JSON dari `localStorage`. Jika belum ada data, data awal dari `DEFAULT_DATA` digunakan dan disimpan. Pembacaan juga menggabungkan beberapa nilai bawaan dan menjalankan penyesuaian kompatibilitas data lama.
3. Halaman publik memuat `js/script.js` setelah data store. Inisialisasi berjalan pada `DOMContentLoaded`; fungsi umum memeriksa keberadaan elemen sebelum mengaktifkan fitur halaman.
4. Formulir admin dihubungkan oleh `js/admin.js` ke metode `MasjidDB`, lalu hasilnya disimpan kembali ke `localStorage`. Login ditangani oleh skrip di `login.html`.
5. Halaman publik membaca data lokal untuk bagian yang dirender secara dinamis. Buka atau muat ulang halaman terkait setelah perubahan untuk memeriksa hasil.

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

- Perubahan `DEFAULT_DATA` di `js/data-store.js` menentukan data awal untuk penyimpanan baru. Data yang sudah tersimpan umumnya tetap mengambil nilai lokal, dengan beberapa penyesuaian bawaan di `loadDatabase()`; mengubah default bukan cara menerbitkan perubahan ke seluruh pengguna.
- Untuk memeriksa data awal tanpa merusak data kerja, gunakan profil browser terpisah. Jika perlu reset, buat backup terlebih dahulu.
- Data artikel dan materi kajian terpisah. `artikel.html` menggunakan artikel, sedangkan menu admin **Materi Kajian (PDF)** menggunakan `getMaterials()`, `addMaterial()`, dan metode materi terkait. Nama internal seperti `sec-articles` atau `renderArticles()` pada panel admin masih digunakan untuk antarmuka materi.
- Perubahan teks yang ditulis langsung di HTML perlu diperiksa pada semua halaman terkait, termasuk navigasi dan footer.

## Integrasi eksternal

### Jadwal salat otomatis

`js/script.js` dan `js/admin.js` mengambil jadwal dari `https://api.aladhan.com/v1/timings/DD-MM-YYYY` dengan konfigurasi saat ini:

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
node --check js/data-store.js
node --check js/script.js
node --check js/admin.js
```

Pemeriksaan ini hanya memvalidasi sintaks berkas JavaScript tersebut, bukan skrip inline di HTML, tampilan browser, ketepatan data, atau keamanan aplikasi.
