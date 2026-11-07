# Struktur Proyek

Dokumen ini menjelaskan struktur direktori Website Masjid Syukur Ampel dan aturan pengorganisasian kode. Untuk dasar arsitektur, lihat [arsitektur stateless dengan Supabase](arsitektur-stateless-supabase.md); untuk batas implementasi, lihat [aturan pengembangan](aturan-pengembangan.md).

## Konvensi umum

Struktur mengikuti konvensi umum proyek web (dirujuk dari dokumentasi resmi Astro dan Vite): **`src/` memuat semua kode sumber yang ditulis tangan** — halaman, gaya, dan skrip — sedangkan **`assets/` memuat aset statis murni** (gambar) yang disajikan apa adanya.

- CSS masuk `src/` karena CSS adalah kode sumber, bukan aset.
- Gambar tetap di `assets/images/` (bukan `public/`): tanpa proses build, konvensi `public/` tidak berlaku dan folder ini hanya berisi aset UI statis bawaan.
- Tanpa framework UI dan tanpa proses build; modularitas memakai **ES Modules native** browser.
- **Modularitas utama adalah per halaman (colocation)**: berkas HTML dan JS khusus sebuah halaman berada dalam satu folder yang sama, tidak dipisah ke pohon folder berbeda.

## Struktur saat ini

```text
index.html                  Halaman pengalih (redirect) ke src/pages/home/index.html
assets/
  images/                   Logo, poster, dan foto (satu level, tanpa subfolder)
src/
  css/
    style.css               Gaya global halaman publik
    admin.css               Gaya login dan dashboard admin
  js/
    core/                   Layanan dasar, dimuat sebagai skrip klasik sebelum modul
      data-store.js         window.MasjidDB — penyimpanan legacy localStorage
      supabase-client.js    window.MasjidSupabase — client Supabase
    shared/                 Fungsi global yang dipakai lintas halaman (ES modules)
      utils/
        dom.js              $, $all, escapeHtml, setText, assetUrl
        format.js           pad2, formatRupiah, formatMasehi, formatHijriah (murni)
      components/
        layout.js           Navigasi HP, animasi scroll, tahun footer, bilah musafir
        toast.js            Notifikasi toast dan salin teks (initCopy)
        lightbox.js         Penampil foto diperbesar
        cards.js            Template kartu kegiatan dan kartu galeri bersama
        filter.js           Filter kartu [data-filter] x [data-category]
        announcements.js    Render pengumuman (beranda + halaman pengumuman)
        feeds.js            Feed berita nasional (beranda + halaman artikel)
        contact-info.js     Sinkronisasi tautan WhatsApp/email dari MasjidDB
        materials-modal.js  window.showMaterialsModal (API global)
      prayer-times.js       Jadwal salat, jam digital, hitung mundur (+ API Aladhan)
    main.js                 initCommon(): rangkaian init global tiap halaman publik
  pages/                    Satu folder per halaman; HTML dan JS-nya berdampingan
    home/                   index.html, home.js
    jadwal/                 index.html, jadwal.js
    kegiatan/               index.html, kegiatan.js
    pengumuman/             index.html, pengumuman.js
    galeri/                 index.html, galeri.js
    donasi/                 index.html, donasi.js
    keuangan/               index.html, keuangan.js
    artikel/                index.html, artikel.js
    materi/                 index.html, materi.js   (JS diekstrak dari inline)
    zakat/                  index.html, zakat.js    (JS diekstrak dari inline)
    kontak/                 index.html, kontak.js
    profil/                 index.html, profil.js
    admin/
      index.html            Dashboard pengelolaan konten
      login.html            Login pengurus
      admin.js              Controller dashboard (klasik; calon pecahan per seksi)
      login.js              (diekstrak dari inline login.html)
supabase/                   Migrasi dan pengujian backend (target)
docs/                       Dokumentasi
```

## Aturan pengorganisasian kode

### Modular per halaman (colocation)

- Setiap halaman menempati folder sendiri di `src/pages/<halaman>/`: `index.html` + `<halaman>.js`. Folder boleh berisi file tambahan bila modul membesar (mis. `<halaman>.css` atau `calculator.js` untuk logika murni).
- Setiap halaman memuat modulnya dengan path relatif sefolder: `<script type="module" src="./<halaman>.js">`. Tidak ada skrip global monolitik dan tidak ada skrip inline di HTML.
- **Fungsi global** (dipakai lebih dari satu halaman) berada di `src/js/shared/` dengan `export` eksplisit: utilitas di `shared/utils/`, komponen UI di `shared/components/`, fitur lintas halaman (`prayer-times.js`) di root `shared/`.
- Modul halaman memanggil `initCommon()` (dari `src/js/main.js`) untuk fitur bersama, lalu menjalankan logika khusus halamannya. Re-render setelah sinkronisasi data dilakukan per modul melalui event `masjid:data-synced`.
- Skrip klasik di `src/js/core/` (`data-store.js`, `supabase-client.js`) dimuat lebih dulu dan menyediakan `window.MasjidDB` / `window.MasjidSupabase`; modul mengaksesnya lewat `window` sampai migrasi data selesai.
- Tautan antarhalaman ditulis eksplisit: `href="../<halaman>/index.html"`, karena bentuk ini tetap bekerja saat berkas dibuka tanpa server (mis. `file://`).

### Layering sebagai konsep, bukan folder

Pemisahan presentation dan data diterapkan sebagai **disiplin kode di dalam modul**, bukan sebagai pemisahan folder:

- **Presentation**: fungsi yang menyentuh DOM, merender template, dan memasang event. Template kartu bersama dikumpulkan di `shared/components/cards.js`; fungsi render menerima data sebagai parameter.
- **Data**: akses `MasjidDB`/`MasjidSupabase`, cache, dan pemetaan hanya terjadi di fungsi akses data (saat ini `js/core/`; nanti repository async). Fungsi render tidak boleh menulis query/penyimpanan langsung.
- **Aturan bisnis murni** (perhitungan zakat, logika jadwal, perhitungan kas) adalah fungsi murni tanpa DOM/fetch — contoh: `shared/utils/format.js`. Saat diekstrak, letakkan di file terpisah di dalam folder modul terkait.

### Resolusi path aset gambar

Path gambar dari data konten diresolusi oleh `assetUrl()` di `shared/utils/dom.js`:

- Base dihitung dari **`import.meta.url`** modul (`../../../assets/`), sehingga hasilnya benar berapa pun kedalaman halaman dan tetap bekerja saat hosting di subpath.
- Path relatif `images/...` (data seed dan `localStorage` legacy) diresolusi ke dalam `assets/`. URL absolut (`http:`, `https:`, `data:`, `//`, `/`) diteruskan apa adanya.
- Nilai yang **disimpan** tetap path mentah; resolusi hanya untuk tampilan (`<img src>`, `data-full`, preview foto).
- Pengecualian sementara: `pages/admin/admin.js` masih skrip klasik dan memakai `ASSET_PREFIX = '../../../'` miliknya sendiri sampai dimodulkan pada fase berikutnya.

Path statis langsung di HTML (logo, favicon, gambar hero bawaan) ditulis relatif sesuai kedalaman: `../../../assets/images/...` dari `src/pages/<halaman>/` dan `src/pages/admin/`.

### Halaman pengalih di root

`index.html` di root hanya berisi pengalihan (`<meta http-equiv="refresh">` dan tautan kanonik) ke `src/pages/home/index.html`, agar URL `/` pada hosting statis tetap melayani beranda. Jangan menaruh konten atau logika pada berkas ini.

## Arah penataan berikutnya

1. **Pemecahan `pages/admin/admin.js`** menjadi seksi-seksi (satu modul per menu admin) dan konversi ke ES module.
2. **Ekstraksi logika murni** (kalkulator zakat, perhitungan kas, logika salat berikutnya) ke file terpisah di dalam folder halaman terkait agar dapat diuji tanpa browser.
3. **CSS per halaman (opsional)**: saat dibutuhkan, `<halaman>.css` dapat ditambahkan di folder halaman; stylesheet global dipecah per seksi (`variables`, `reset`, `main`, `components`) mengikuti penanda seksi yang sudah ada di `style.css`. Ekstraksi gaya dari `style.css` ke CSS halaman wajib disertai uji visual per halaman.
4. **Repository async per entitas** sebagai pengganti pemanggilan `MasjidDB` sinkron, bertahap per fitur sesuai aturan pengembangan butir 2 dan 8, hingga `js/core/data-store.js` dapat dihapus.
5. **Pengelompokan `assets/images/`** ke subfolder (logo, poster, galeri, kegiatan, fasilitas) setelah path gambar di data tidak lagi bergantung pada nama folder.

Urutan sengaja dipilih agar setiap langkah dapat diuji dan di-commit terpisah tanpa mengubah perilaku aplikasi.
