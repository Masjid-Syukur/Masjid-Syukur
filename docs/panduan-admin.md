# Panduan Admin

Panduan operasional **panel legacy yang saat ini masih ada di repository**. Arsitektur berikutnya menggunakan [frontend stateless dan backend Supabase](arsitektur-stateless-supabase.md), tetapi integrasinya belum diterapkan. Akun bawaan, backup JSON browser, dan batasan lokal di panduan ini bukan mekanisme target Supabase.

Untuk pengenalan proyek, lihat [README](../README.md); untuk detail implementasi saat ini, lihat [panduan pengembangan](pengembangan.md).

## Sebelum mulai

Panel admin saat ini mengelola **data lokal pada browser**, bukan data website yang dibagikan melalui server.

- Gunakan browser/profil dan origin yang sama untuk login, mengelola data, dan melihat hasil pada halaman publik. Origin mencakup protokol, host, dan port.
- Gunakan server HTTP statis lokal untuk pengujian yang lebih konsisten. Penyimpanan pada alamat `file://` dapat berbeda antarbrowser.
- Mengunggah berkas website ke hosting statis tidak mengunggah perubahan yang tersimpan di browser Anda.
- Jangan gunakan panel ini untuk menyimpan data sensitif. Login frontend bukan perlindungan akses yang memadai untuk sistem produksi.

## Login dan logout

1. Buka [halaman login](../login.html).
2. Pada data awal, gunakan akun bawaan berikut:

   | Isian | Nilai bawaan |
   |---|---|
   | Username | `admin` |
   | Password | `admin123` |

3. Tentukan apakah akan mengaktifkan **Ingat saya di perangkat ini**. Jangan gunakan pilihan ini di perangkat bersama.
4. Klik **Masuk ke Dashboard**. Setelah berhasil, Anda diarahkan ke [panel admin](../admin.html).
5. Setelah selesai, gunakan **Keluar (Logout)** di panel admin.

Jika akun pernah diubah, gunakan kredensial terbaru pada browser tersebut. Mengganti password tidak mengubah login frontend menjadi autentikasi server yang aman; jangan memakai password dari akun pribadi atau layanan lain.

## Menu pengelolaan

| Menu | Kegunaan |
|---|---|
| **Ikhtisar (Dashboard)** | Melihat ringkasan kas, konten, pesan jamaah, jadwal salat, dan akses cepat. |
| **Pengumuman** | Menambah, mengubah, atau menghapus pengumuman, termasuk penanda penting/mendesak dan gambar. |
| **Kegiatan & Agenda** | Mengelola judul, kategori, jadwal, lokasi, deskripsi, dan poster kegiatan. |
| **Galeri Dokumentasi** | Menambah, mengubah, atau menghapus foto beserta keterangannya. |
| **Laporan Keuangan** | Membuat periode, mengatur saldo awal, mencatat pemasukan/pengeluaran, serta melihat perhitungan saldo. |
| **Materi Kajian (PDF)** | Mengaitkan materi dengan agenda kajian, mengisi judul, pemateri, tanggal, ringkasan, dan berkas atau tautan PDF. |
| **Rekening Donasi** | Mengelola rekening bank dan catatan donasi. |
| **Struktur Organisasi** | Mengelola data pengurus, jabatan, kategori, dan foto. |
| **Kotak Masuk Jamaah** | Membaca pesan lokal, menandai sudah dibaca, menghapus, dan membuka WhatsApp jika kontak berupa nomor yang sesuai. |
| **Pengaturan & Akun** | Mengubah identitas masjid, kredensial admin, serta melakukan backup, pemulihan, dan reset. |

### Menambah atau mengubah konten

1. Pilih menu yang sesuai, lalu gunakan tombol tambah atau ikon edit pada data yang ingin diubah.
2. Lengkapi formulir dan simpan perubahan.
3. Buka atau muat ulang halaman publik terkait pada browser/profil dan origin yang sama untuk memeriksa hasil.
4. Periksa kembali isi dan lampiran setelah memuat ulang, terutama setelah menambahkan gambar atau PDF berukuran besar.

Mengunggah gambar atau PDF di panel admin menyimpannya sebagai data lokal, bukan mengirim berkas ke server. Kapasitas penyimpanan browser terbatas; gunakan berkas berukuran kecil dan buat backup berkala. Materi bawaan yang tautan PDF-nya masih `#` belum mempunyai berkas unduhan.

### Laporan keuangan

1. Pilih periode yang tersedia atau buat periode baru.
2. Atur saldo awal periode.
3. Catat pemasukan dan pengeluaran melalui formulir masing-masing.
4. Periksa rincian transaksi dan saldo akhir yang dihitung dari saldo awal, pemasukan, dan pengeluaran.

Penghapusan transaksi atau periode mengubah data lokal. Cadangkan data sebelum melakukan penghapusan besar.

### Jadwal salat dan artikel

Jadwal salat diambil otomatis dari API Aladhan untuk koordinat Ampel, Boyolali, dengan metode 20 (Kemenag), lalu disimpan di browser sebagai cache harian. Jika API tidak dapat diakses, jadwal lokal tetap digunakan; periksa tanggal dan kesesuaiannya sebelum dijadikan acuan.

Panel admin saat ini **tidak menyediakan menu penyuntingan jadwal salat manual atau editor artikel/berita**. Menu **Materi Kajian (PDF)** mengelola materi, bukan artikel di `artikel.html`. Perubahan konfigurasi jadwal dan data awal artikel dijelaskan di [panduan pengembangan](pengembangan.md).

### Kotak masuk jamaah

Formulir pada [halaman kontak](../kontak.html) hanya menyimpan pesan pada browser/profil dan origin tempat formulir diisi. Pesan dari perangkat jamaah lain **belum dikirim ke perangkat pengurus**, email, atau server. Untuk menghubungi pengurus lintas perangkat, gunakan tautan kontak WhatsApp yang tersedia.

## Mengubah identitas dan akun

1. Buka **Pengaturan & Akun**.
2. Pada **Identitas & Kontak Masjid**, ubah informasi yang diperlukan, lalu klik **Simpan Identitas Masjid**.
3. Pada **Kredensial Akun Administrator**, isi nama tampilan atau username baru jika diperlukan.
4. Masukkan password saat ini untuk konfirmasi. Isi password baru hanya jika ingin menggantinya.
5. Klik **Perbarui Akun Admin**.

Perubahan ini hanya berlaku pada data lokal browser tersebut. Informasi yang ditulis langsung di HTML tidak otomatis seluruhnya berubah melalui pengaturan; developer perlu memeriksa halaman terkait.

## Backup dan pemulihan

Semua tindakan berikut tersedia di **Pengaturan & Akun → Backup & Pemulihan Data**.

### Membuat backup

1. Klik **Unduh Backup Data (JSON)**.
2. Simpan berkas `backup-website-masjid-YYYY-MM-DD.json` di lokasi yang aman.

Backup berisi data `MasjidDB`, termasuk **username, password admin tanpa enkripsi, dan pesan jamaah**. Jangan mengunggahnya ke repository publik atau membagikannya sembarangan. Backup bukan salinan berkas HTML/CSS/JavaScript, sesi login, atau cache jadwal harian. Aset yang hanya dirujuk melalui path/URL juga tidak disalin sebagai berkas terpisah.

### Memulihkan backup

1. Unduh backup data saat ini terlebih dahulu agar dapat dikembalikan jika diperlukan.
2. Klik **Pulihkan dari File JSON**, lalu pilih backup yang tepercaya dan kompatibel dengan versi proyek.
3. Pemulihan mengganti data lokal, bukan menggabungkannya. Pemilihan berkas langsung memulai proses pembacaan dan impor.
4. Setelah pemberitahuan berhasil dan halaman dimuat ulang, periksa kembali konten dan pengaturan akun.

Kredensial admin ikut diganti oleh data di backup. Jika perlu login kembali, gunakan akun yang tersimpan dalam backup tersebut. Impor dapat dipakai untuk memindahkan data secara manual ke browser/origin lain, tetapi **bukan sinkronisasi otomatis atau penerbitan ke semua pengunjung**.

### Reset ke data bawaan

Gunakan **Reset ke Data Bawaan Pabrik** hanya jika memang ingin mengganti seluruh data `MasjidDB` dengan data awal proyek. Setelah konfirmasi, konten, akun, dan perubahan lokal dikembalikan ke nilai bawaan. Buat backup terlebih dahulu; reset bukan cara untuk memperbaiki sinkronisasi antarperangkat.

## Jika perubahan tidak terlihat

- Pastikan halaman publik memakai browser/profil, protokol, host, dan port yang sama dengan panel admin, lalu muat ulang halaman.
- Jika semula membuka `file://` lalu beralih ke HTTP, data berada pada ruang penyimpanan berbeda. Gunakan backup dan pemulihan untuk memindahkannya.
- Jika penyimpanan situs diblokir, penuh, atau dihapus, perubahan dapat gagal disimpan atau hilang. Mode privat juga dapat membuang data setelah sesi ditutup.
- Jika suatu teks tetap sama, teks tersebut mungkin masih ditulis langsung di HTML. Minta developer memeriksa sumber halaman; jangan melakukan reset sebelum mencadangkan data.
