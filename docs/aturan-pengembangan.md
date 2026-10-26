# Aturan Pengembangan Website

Aturan ini berlaku untuk fitur baru dan migrasi Website Masjid Syukur Ampel. Kata **wajib** dan **dilarang** adalah batas review; pengecualian harus disepakati dan didokumentasikan sebelum implementasi.

Dasar arsitektur: [frontend stateless dengan backend Supabase](arsitektur-stateless-supabase.md). [Panduan pengembangan](pengembangan.md) menjelaskan implementasi legacy saat ini, bukan pola penyimpanan yang boleh diperluas.

## 1. Jaga batas stateless

- **Wajib:** simpan data bisnis bersama di Supabase, bukan pada browser pengurus, memori proses, atau disk lokal suatu instance.
- **Boleh:** simpan filter, modal, dan isian formulir sementara di memori; simpan preferensi atau cache publik yang dapat dibuat ulang dengan batas kesegaran yang jelas.
- **Dilarang:** menjadikan `localStorage`, `sessionStorage`, IndexedDB, atau berkas JSON hasil ekspor sebagai database produksi utama atau cara wajib untuk menerbitkan konten.
- Persistensi sesi melalui SDK Supabase Auth diperbolehkan. Token adalah data sensitif, bukan penentu role dari sisi client; jangan membuat token atau flag login pengganti.
- Jangan menambah fallback tulis lokal yang menampilkan sukses ketika Supabase gagal. Mode demo harus eksplisit dan terpisah dari produksi.

## 2. Pusatkan akses backend dan tangani operasi asinkron

- Gunakan satu lapisan layanan data/client Supabase yang dikonfigurasi konsisten per halaman, bukan query duplikat yang tersebar pada setiap event handler atau HTML.
- Pertahankan pemisahan logika UI, akses data, dan aturan backend tanpa menambah abstraksi atau framework yang tidak diperlukan.
- API data yang berpindah dari `MasjidDB` sinkron ke Supabase wajib diperlakukan asinkron. Perbarui seluruh pemanggil terkait, termasuk rendering publik, dashboard, dan formulir.
- Sediakan state loading, kosong, berhasil, gagal, dan sesi kedaluwarsa sesuai kebutuhan. Periksa error serta hasil operasi, bukan hanya selesainya Promise atau tidak adanya exception.
- Tampilkan sukses setelah backend mengonfirmasi penyimpanan. UI optimistis, jika digunakan, harus dapat rollback atau refetch saat gagal.
- Hindari submit ganda. Retry pada operasi yang dapat menggandakan pesan, transaksi, atau unggahan harus mempunyai mekanisme idempotensi/deduplikasi yang ditegakkan backend.
- Setelah mutasi, refetch atau perbarui cache secara terarah. Jangan menganggap semua tab/perangkat otomatis diperbarui tanpa polling, refetch, atau subscription yang memang diimplementasikan.

## 3. Gunakan Supabase Auth dan otorisasi backend

- Login, logout, pemulihan akun, dan token sesi wajib menggunakan Supabase Auth; jangan menyimpan password dalam tabel konten, berkas frontend, atau ekspor data aplikasi.
- Akun pengurus harus disediakan melalui proses admin tepercaya. Pendaftaran pengguna, jika suatu saat diaktifkan, tidak boleh otomatis memberi hak pengurus.
- Menyembunyikan tombol, memeriksa flag browser, atau melakukan redirect dari `admin.html` hanya melayani UX, bukan keamanan.
- Role/keanggotaan pengurus wajib diverifikasi backend dari sumber yang tidak dapat dinaikkan sendiri oleh pengguna biasa. Jangan mempercayai `user_metadata` atau field role yang dapat ditulis client.
- Gunakan SDK untuk pengelolaan sesi dan pembersihan saat logout. Bersihkan state/cache privat saat akun berganti atau sesi berakhir, dan hindari menyimpan salinan token di luar penyimpanan Auth yang dirancang.
- Batasi skrip pihak ketiga dan render konten pengguna dengan escaping/sanitasi yang sesuai. Persistensi token di browser tetap memiliki risiko XSS.

## 4. Terapkan least privilege di database, Storage, dan fungsi

- RLS wajib aktif pada tabel yang diekspos ke client. Atur grants dan kebijakan `SELECT`, `INSERT`, `UPDATE`, serta `DELETE` sesuai kebutuhan; tidak memiliki kebijakan tulis harus benar-benar berarti tidak dapat menulis.
- Hak baca publik hanya untuk konten yang sengaja dipublikasikan. Draft, role admin, kontak jamaah, dan data keuangan internal tidak boleh ikut diekspos.
- Hak tulis pengelolaan mensyaratkan pengurus yang diotorisasi, bukan sekadar pengguna berstatus `authenticated`.
- Uji pengguna biasa yang mencoba mengubah role sendiri, membaca pesan, atau memodifikasi konten. Hak admin tidak boleh dapat diperoleh dari payload client.
- View dan RPC harus ditinjau agar tidak membypass kontrol akses tabel. Fungsi berprivilege harus memiliki pemeriksaan pemanggil, scope izin minimal, dan konfigurasi aman seperti `search_path` terikat bila menggunakan `SECURITY DEFINER`.
- Edge Function yang dipanggil client tetap wajib memeriksa identitas dan otorisasi. Jika memakai secret key berprivilege, fungsi bertanggung jawab menerapkan batas aksesnya sendiri.
- Pengiriman pesan publik harus membatasi input dan penyalahgunaan di backend, misalnya validasi, rate limiting yang tidak hanya di memori instance, dan challenge bila diperlukan. Jangan memberikan izin baca kotak masuk kepada pengirim anonim.
- Keuangan dan mutasi multi-baris yang harus konsisten wajib menggunakan transaksi/aturan backend. Jangan mempercayai saldo atau role yang dihitung/dikirim browser sebagai nilai otoritatif.

## 5. Simpan unggahan di Supabase Storage

- Foto, poster, dan PDF yang dikelola admin disimpan sebagai objek Storage, bukan base64/data URL permanen dalam database atau browser. Aset UI statis seperti logo bawaan masih boleh berada di repository.
- Simpan bucket/path dan metadata yang diperlukan di database. Jangan menyimpan signed URL yang dapat kedaluwarsa sebagai referensi permanen.
- Tetapkan akses publik atau privat secara sengaja. Bucket publik tidak cocok untuk draft atau data internal; gunakan bucket privat dengan akses terotorisasi atau signed URL berumur terbatas untuk kebutuhan tersebut.
- Batasi ukuran, jenis berkas, path, dan izin upload/update/delete di backend/Storage. Validasi browser hanya pelengkap.
- Upload objek dan perubahan baris database bukan satu transaksi atomik. Tangani kegagalan parsial, objek yatim, dan penghapusan aman; jangan menghapus objek lama sebelum referensi penggantinya berhasil disimpan.

## 6. Lindungi konfigurasi dan secret

- Konfigurasi frontend hanya boleh berisi URL Supabase serta publishable key. Legacy `anon` hanya digunakan bila kompatibilitas proyek mengharuskannya; jangan menganggap key publik sebagai rahasia.
- Secret key, legacy `service_role`, kredensial database, token privat pihak ketiga, dan backup berisi data pribadi dilarang masuk client, Git, log, atau screenshot publik.
- Gunakan secret manager/environment backend untuk secret. Memindahkan secret ke variabel build yang kemudian dibundel ke JavaScript tidak membuatnya aman.
- Konfigurasi URL proyek, redirect Auth, dan pemuatan konfigurasi publik wajib dijelaskan saat integrasi. `.env` tidak otomatis dibaca oleh website HTML statis.
- Pisahkan development/test dan produksi. Gunakan data sintetis untuk pengujian secara default; jangan melakukan reset produksi dari panel yang awalnya dibuat untuk database browser.
- Jangan menambahkan dependency melalui URL CDN tanpa versi tetap. Pilih SDK dan cara pemuatan yang kompatibel dengan toolchain saat integrasi, lalu dokumentasikan cara menjalankannya.

## 7. Buat perubahan backend dapat direproduksi

Belum ada direktori Supabase, skema, bucket, atau proses deployment backend yang disiapkan di repository ini. Saat integrasi dimulai:

- Simpan migrasi skema, constraint, index, grants, RLS, dan fungsi SQL pada konvensi `supabase/migrations/`; simpan pengujian database/kebijakan pada `supabase/tests/`. Lokasi ini adalah target, bukan direktori yang sudah tersedia.
- Catat pengaturan Auth, Storage, Edge Functions, dan deployment yang belum dapat dicakup migrasi agar dapat direproduksi tanpa menebak konfigurasi Dashboard.
- Jangan mengubah skema/kebijakan hanya melalui Dashboard tanpa rekam perubahan versi yang setara.
- Rancang primary key, relasi, constraint, waktu, dan data uang di backend. Nilai rupiah harus memakai representasi numerik yang tepat, bukan perhitungan floating-point browser sebagai sumber kebenaran.
- Sertakan index yang relevan bagi query/RLS, pagination untuk daftar, serta pengambilan kolom seperlunya. Jangan membuka data privat demi mengurangi jumlah query.
- Untuk perubahan destruktif atau yang tidak kompatibel, siapkan backup, strategi deployment, dan prosedur pemulihan. Restore database dan objek Storage perlu diuji sebagai dua aspek yang berbeda.

## 8. Migrasikan legacy secara eksplisit

- Migrasikan per fitur dengan sumber data aktif yang jelas. Pembaruan dokumentasi ini tidak sekaligus mengganti kode legacy.
- Jangan membuat dual-write permanen ke database browser dan Supabase. Adaptor sementara boleh ada jika terbatas dan langkah penghapusannya terdokumentasi.
- Data legacy tidak boleh otomatis diunggah setiap kali halaman dibuka. Impor harus melalui tindakan admin yang eksplisit, validasi skema/isi, pemetaan relasi, dan deduplikasi.
- Jangan mengimpor password, token, atau flag admin legacy sebagai identitas Auth. Pengurus harus menggunakan akun Supabase Auth yang disediakan secara terpisah.
- Jangan menanam ulang `DEFAULT_DATA` ke backend setiap reload atau menghidupkan fitur reset pabrik browser sebagai reset database bersama.
- Pindahkan lampiran data URL ke Storage secara terkontrol dan verifikasi referensinya. Hapus mekanisme lokal untuk fitur yang sudah bermigrasi setelah hasilnya diverifikasi.
- Perbarui README, panduan teknis, dan panduan admin hanya sesuai fitur yang benar-benar sudah beralih. Jangan menyebut seluruh proyek sudah terintegrasi ketika baru sebagian.

## 9. Checklist sebelum perubahan dinyatakan selesai

Selain memeriksa sintaks dan UI, perubahan yang memakai Supabase wajib memverifikasi hal berikut:

- [ ] Reload dan login ulang dapat memuat kembali data dari backend tanpa impor JSON browser.
- [ ] Perubahan admin yang dipublikasikan terlihat pada browser/perangkat lain melalui fetch/refetch.
- [ ] Menghapus cache/penyimpanan browser tidak menghapus data backend; kebutuhan login ulang dapat diterima.
- [ ] Pengunjung anonim hanya membaca konten publik dan tidak dapat memutasi konten pengelolaan.
- [ ] Pengguna login non-pengurus tidak dapat menulis konten admin, menaikkan role sendiri, atau membaca data privat.
- [ ] Pengurus dapat menjalankan operasi yang diizinkan; hasil baris/objek benar-benar berubah, bukan sekadar respons tanpa error.
- [ ] Draft, pesan, laporan internal, view/RPC, dan objek Storage tidak dapat diakses melalui jalur alternatif yang tidak diizinkan.
- [ ] Loading, kegagalan jaringan, kegagalan upload, sesi kedaluwarsa, submit ulang, dan konflik perubahan tidak menghasilkan sukses palsu atau duplikasi yang tidak ditangani.
- [ ] Tidak ada secret, password, token sesi, atau data pribadi dalam bundle, repository, dan log.
- [ ] Migrasi dapat dijalankan pada lingkungan uji yang bersih dan tes allow/deny untuk kebijakan terkait lulus tanpa memakai key yang membypass RLS sebagai bukti keamanan client.
- [ ] Dokumentasi setup, cara menjalankan tes, dan status migrasi diperbarui sesuai implementasi.

Ini adalah kriteria penerimaan untuk implementasi mendatang, **bukan hasil pengujian yang sudah lulus**. Tes otomatis yang relevan untuk layanan data, Auth, RLS, dan Storage harus ditambahkan bersama integrasi. Perintah pengujiannya baru boleh dicantumkan sebagai siap dijalankan setelah toolchain dan konfigurasi backend benar-benar tersedia.
