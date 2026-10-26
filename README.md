# Website Masjid Syukur Ampel

Website profil dan informasi Masjid Syukur Ampel, Boyolali, untuk membantu jamaah dan musafir mengakses informasi masjid. Pengurus dapat mencoba pengelolaan konten melalui panel admin berbasis browser.

## Fitur utama

- Profil masjid, fasilitas, dan struktur kepengurusan.
- Jadwal salat harian, jam digital, dan hitung mundur salat berikutnya.
- Kegiatan, pengumuman, galeri dokumentasi, serta artikel keislaman.
- Materi kajian dengan tautan atau berkas PDF.
- Informasi donasi, laporan kas bulanan, dan kalkulator zakat.
- Kontak, lokasi, serta formulir pesan jamaah.
- Panel admin untuk pengelolaan data lokal, termasuk backup dan pemulihan JSON.

## Status dan batasan

Implementasi repository saat ini masih menggunakan penyimpanan lokal browser dan belum terhubung ke backend bersama. **Arsitektur target untuk pengembangan berikutnya adalah frontend stateless dengan Supabase sebagai backend, sumber kebenaran data, Auth, dan Storage.**

- Kode yang ada masih menyimpan data panel admin di `localStorage`; ini adalah implementasi legacy yang tidak boleh diperluas sebagai database produksi.
- Integrasi Supabase belum tersedia di repository ini. Jangan menganggap data sudah tersinkronisasi antarperangkat atau bahwa login frontend saat ini sudah aman untuk produksi.
- Jadwal salat otomatis dan layanan eksternal lainnya memerlukan internet. Jika pengambilan jadwal gagal, website menggunakan jadwal lokal yang perlu diperiksa kesesuaiannya.

Aturan arsitektur dan batas implementasi tersedia di [arsitektur Stateless dengan Supabase](docs/arsitektur-stateless-supabase.md) dan [aturan pengembangan](docs/aturan-pengembangan.md).

## Mulai menjalankan

1. Unduh atau clone repository ini.
2. Untuk melihat implementasi legacy saat ini, buka [`index.html`](index.html) di browser modern dengan JavaScript dan penyimpanan lokal aktif. Tidak perlu instalasi dependensi atau proses build.
3. Untuk mencoba panel pengelola legacy, buka [`login.html`](login.html) dan ikuti [panduan admin](docs/panduan-admin.md).
4. Saat integrasi Supabase dimulai, ikuti [aturan pengembangan](docs/aturan-pengembangan.md); setup backend dan environment belum tersedia di repository ini.

Untuk pengujian antarhalaman dan panel admin, gunakan server HTTP statis lokal dari editor atau alat yang tersedia, dengan alamat dan port yang konsisten. Perilaku penyimpanan saat membuka berkas langsung melalui `file://` dapat berbeda antarbrowser; lihat [panduan pengembangan](docs/pengembangan.md).

## Teknologi

- HTML, CSS, dan JavaScript murni pada frontend saat ini.
- Arsitektur target: Supabase untuk PostgreSQL, Auth, Storage, dan layanan backend yang diperlukan.
- Implementasi legacy saat ini masih memakai `localStorage`/`sessionStorage`; lihat [arsitektur Stateless dengan Supabase](docs/arsitektur-stateless-supabase.md).
- API Aladhan untuk jadwal salat otomatis dan Google Fonts untuk font web.

## Struktur singkat

```text
README.md                  Pengenalan dan cara mulai
*.html                     Halaman publik, login, dan panel admin
css/                       Gaya tampilan publik dan admin
js/                        Penyimpanan data dan logika antarmuka
images/                    Logo, ilustrasi, dan gambar
docs/                      Panduan admin dan pengembangan
```

Rincian peran halaman dan skrip tersedia di [panduan pengembangan](docs/pengembangan.md).

## Dokumentasi lanjutan

- [Panduan admin](docs/panduan-admin.md): login, pengelolaan konten, pengaturan akun, backup, dan pemulihan data legacy.
- [Panduan pengembangan](docs/pengembangan.md): struktur berkas, alur data legacy, integrasi eksternal, serta pemeriksaan perubahan.
- [Arsitektur Stateless dengan Supabase](docs/arsitektur-stateless-supabase.md): keputusan arsitektur target, batas state, Auth, RLS, Storage, dan gap migrasi.
- [Aturan pengembangan](docs/aturan-pengembangan.md): aturan wajib untuk fitur baru, keamanan backend, migrasi, dan checklist review.
