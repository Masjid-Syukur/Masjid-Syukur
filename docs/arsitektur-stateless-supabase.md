# Arsitektur Stateless dengan Backend Supabase

**Status keputusan:** ditetapkan sebagai aturan arsitektur untuk pengembangan berikutnya.

**Status implementasi:** belum diterapkan. Repository saat ini masih menggunakan `MasjidDB`, penyimpanan `localStorage`, dan login frontend. Dokumen ini menetapkan arah pengembangan, bukan menyatakan integrasi Supabase sudah berjalan.

Untuk aturan implementasi, lihat [aturan pengembangan](aturan-pengembangan.md). Kondisi kode saat ini dijelaskan di [panduan pengembangan](pengembangan.md).

## Keputusan utama

Website dikembangkan dengan **frontend stateless dan Supabase sebagai backend**. Supabase menjadi sumber kebenaran untuk data bersama, identitas pengguna, dan berkas unggahan.

Tujuannya adalah agar pengelolaan konten tidak bergantung pada browser pengurus, perubahan dapat dibaca dari perangkat lain, dan hak akses ditegakkan oleh backend. Frontend tetap boleh berupa HTML, CSS, dan JavaScript yang disajikan melalui hosting statis; keputusan ini tidak mewajibkan framework baru.

Database browser sebagai sumber data utama dan login buatan sendiri di frontend tidak boleh diperluas sebagai arsitektur produksi. Backend dengan penyimpanan sesi aplikasi sendiri tidak diperlukan selama kebutuhan dapat dipenuhi oleh layanan Supabase.

## Arti stateless dalam proyek ini

Stateless **bukan berarti seluruh sistem tidak menyimpan state**. PostgreSQL, Storage, dan Auth di Supabase tetap menyimpan data serta sesi yang diperlukan. Website statis juga tidak otomatis stateless: implementasi lama justru bergantung pada database lokal browser.

Batas stateless yang wajib dipenuhi:

- Frontend tidak menjadi satu-satunya tempat penyimpanan data bisnis atau penentu hak akses.
- Membersihkan penyimpanan browser boleh menghilangkan preferensi, cache, atau sesi login lokal, tetapi tidak boleh menghapus konten yang sudah tersimpan di backend.
- Data dan hak akses dapat dimuat kembali dari Supabase setelah reload atau login ulang. Browser baru dapat membaca konten publik tanpa mengimpor backup dari browser pengurus.
- Setiap permintaan terproteksi membawa konteks autentikasi yang diperlukan dan diperiksa oleh backend, bukan bergantung pada flag login buatan frontend.
- Jika Edge Functions digunakan, fungsi tidak bergantung pada memori proses, disk lokal, atau sticky session sebagai penyimpanan bersama. State permanen tetap ditempatkan di layanan backend.

State UI sementara seperti modal terbuka, filter, isian formulir yang belum dikirim, dan hasil kalkulator boleh berada di memori browser.

### Batas penyimpanan browser

| Jenis state | Aturan |
|---|---|
| Konten, konfigurasi masjid, kas, rekening, organisasi, dan pesan jamaah | Disimpan di PostgreSQL melalui Supabase; bukan database utama di browser. |
| Foto, poster, dan PDF unggahan pengurus | Disimpan di Supabase Storage; database menyimpan referensi dan metadata. |
| Identitas, password, dan pengelolaan sesi | Dikelola Supabase Auth. Jangan membuat tabel password atau token login sendiri. |
| Token sesi pada client | Boleh dipersist oleh SDK Auth sesuai rancangan penyimpanan sesi; tetap sensitif dan bukan bukti role admin yang dapat dipercaya dari browser. |
| Preferensi tampilan dan cache data publik | Boleh disimpan lokal jika dapat dibuang dan dimuat ulang, dengan aturan kedaluwarsa/invalidation yang jelas. |
| Data privat, ekspor kas internal, dan pesan jamaah | Jangan dipersist sebagai cache browser secara default. |

Persistensi sesi oleh SDK tidak membatalkan batas stateless di atas. Namun token tetap harus dilindungi dari XSS, tidak dicatat di log, dan tidak ikut diekspor sebagai backup konten. Keluar dari akun harus membersihkan state privat pada client; jangan menjanjikan seluruh access token langsung tidak berlaku tanpa mekanisme backend yang mendukungnya.

## Pembagian tanggung jawab

| Komponen | Tanggung jawab |
|---|---|
| Frontend | Rendering, state UI sementara, validasi untuk pengalaman pengguna, dan pemanggilan layanan data. |
| Supabase PostgreSQL / Data API | Penyimpanan data bersama, relasi, constraint, transaksi, serta kontrol akses berbasis grants dan RLS. |
| Supabase Auth | Login, logout, pemulihan akun, identitas pengguna, dan pengelolaan token/sesi. |
| Supabase Storage | Penyimpanan unggahan dengan kebijakan baca/tulis sesuai tingkat publik atau privat. |
| Supabase Edge Functions, jika diperlukan | Operasi yang membutuhkan secret, integrasi eksternal terproteksi, atau endpoint publik yang membutuhkan kontrol tambahan. |

Akses data langsung dari browser ke Supabase diperbolehkan **hanya jika grants dan kebijakan RLS/Storage sudah membatasi operasi tersebut**. Tidak semua operasi memerlukan Edge Function. Sebaliknya, operasi berprivilege tidak boleh dipindah ke browser demi menghindari kebutuhan backend.

### Alur baca dan tulis

1. Halaman publik meminta data yang diizinkan untuk publik. Draft dan data internal tidak ikut terbaca.
2. Pengurus login melalui Supabase Auth. Status login saja tidak otomatis memberikan hak admin.
3. Permintaan perubahan membawa identitas pengguna; backend memeriksa izin, memvalidasi data, lalu menyimpan perubahan.
4. Frontend menyatakan berhasil hanya setelah backend mengonfirmasi hasilnya.
5. Perangkat lain membaca data terbaru sesuai kebijakan publikasi saat melakukan fetch/refetch. Supabase Realtime bersifat opsional, bukan syarat agar data menjadi bersama.

Kegagalan backend tidak boleh diam-diam dialihkan menjadi penulisan ke `localStorage` dengan pesan sukses. Mode offline-write beserta resolusi konfliknya bukan bagian dari arsitektur saat ini dan membutuhkan keputusan tersendiri.

## Batas akses dan keamanan

- Aktifkan RLS pada setiap tabel yang diekspos melalui Data API, atur grants seminimal mungkin, dan tulis kebijakan per operasi yang dibutuhkan.
- Pengunjung hanya boleh membaca data yang memang dipublikasikan. Hak tulis pengelolaan hanya diberikan kepada pengurus yang diotorisasi di backend.
- Sumber role/keanggotaan admin harus dikelola oleh pihak tepercaya. Flag di browser atau `user_metadata` yang dapat diubah pengguna tidak boleh menentukan otorisasi.
- Pesan jamaah dan informasi keuangan internal tidak boleh menjadi bacaan publik. Laporan keuangan publik hanya mengekspos informasi yang sudah dipilih untuk dipublikasikan, tanpa data pribadi yang tidak diperlukan.
- Jalur pengiriman pesan publik harus memvalidasi input dan membatasi penyalahgunaan di backend. Izin mengirim bukan izin membaca, mengubah, atau menghapus pesan; publishable key bukan perlindungan anti-spam.
- Periksa juga grants pada fungsi/RPC dan perilaku view agar tidak menyediakan jalur bypass terhadap kebijakan tabel.
- Gunakan bucket privat untuk dokumen internal atau draft. Berkas di bucket publik dapat diakses melalui URL publik meskipun baris metadata-nya disembunyikan oleh RLS. Jangan mengandalkan RLS tabel konten untuk melindungi objek publik.

Nama tabel, struktur role, bucket, dan detail kebijakan belum ditentukan oleh dokumen ini. Semua itu harus dirancang dan diuji saat integrasi, bukan diasumsikan sudah tersedia.

## Konfigurasi dan key

- Frontend hanya menggunakan URL proyek dan **publishable key** Supabase. Untuk proyek legacy, `anon` adalah padanan client berprivilege rendah; integrasi baru mengutamakan publishable key.
- Publishable key dapat terlihat oleh pengguna dan bukan secret atau pengganti autentikasi. Keamanan data bergantung pada izin backend yang benar.
- **Secret key, legacy `service_role`, password database, dan secret pihak ketiga tidak boleh masuk HTML, JavaScript client, repository, atau log.** Simpan hanya di lingkungan backend tepercaya.
- `.env` tidak otomatis dibaca oleh HTML/JavaScript statis. Mekanisme konfigurasi publik harus ditetapkan saat integrasi; nilai yang dikirim ke browser tetap bersifat publik walaupun berasal dari environment variable saat build.
- Pisahkan lingkungan pengembangan/pengujian dari produksi. Jangan menguji migrasi atau kebijakan dengan data jamaah asli secara default.

## Konsekuensi dan batasan

- Data bersama membutuhkan akses ke Supabase. UI harus membedakan kondisi loading, kosong, gagal, dan sesi kedaluwarsa; cache tidak boleh menyamarkan data lama sebagai data terbaru.
- Skema, grants, kebijakan, dan perubahan backend harus dapat direproduksi melalui migrasi yang disimpan di repository.
- Hosting frontend statis tetap memungkinkan, tetapi bukan tempat menaruh secret atau database bersama.
- Penggunaan Auth, database, Storage, bandwidth, dan Edge Functions mengikuti kuota serta biaya layanan. Menyimpan kontak jamaah di Supabase juga memerlukan pengaturan akses dan retensi data yang sesuai.
- Backup database, objek Storage, dan prosedur pemulihan backend perlu dirancang bersama. Ekspor JSON legacy bukan backup lengkap Supabase.

## Gap implementasi dan arah migrasi

| Kondisi saat ini | Target wajib |
|---|---|
| `MasjidDB` menyimpan database dalam `localStorage`. | Layanan data asinkron membaca/menulis Supabase. |
| Akun bawaan dan pemeriksaan login dijalankan di frontend. | Akun Supabase Auth dan otorisasi pengurus di backend. |
| Gambar/PDF unggahan menjadi data URL lokal. | Objek di Supabase Storage dengan referensi database. |
| Pesan kontak hanya tersedia pada browser pengirim. | Pesan tersimpan di backend melalui jalur pengiriman terkontrol. |
| Backup/reset mengganti database browser. | Backup, pemulihan, dan operasi destruktif dengan kontrol backend. |

Migrasi harus bertahap per fitur dengan sumber data aktif yang jelas. Jangan membuat dual-write permanen ke Supabase dan database browser. Data legacy hanya boleh diimpor melalui proses eksplisit yang memvalidasi isi, memetakan ID/relasi, dan mencegah duplikasi; password serta token legacy tidak boleh diimpor sebagai akun/sesi baru.

Arsitektur ini belum dianggap terimplementasi sampai data tersimpan lintas perangkat, penghapusan cache tidak menghapus data backend, akses tidak sah ditolak oleh backend, serta aturan Auth, RLS, dan Storage telah diuji. Checklist rinci tersedia di [aturan pengembangan](aturan-pengembangan.md).

## Referensi resmi

- [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
- [Postgres Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Auth sessions](https://supabase.com/docs/guides/auth/sessions)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
