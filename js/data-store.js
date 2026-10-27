/* ==========================================================
   WEBSITE MASJID - data-store.js
   Penyimpanan data lokal (localStorage) terpusat untuk:
   - Identitas masjid & kontak
   - Jadwal salat
   - Pengumuman
   - Kegiatan / agenda
   - Laporan keuangan
   - Artikel / berita
   - Rekening donasi
   - Pesan kontak jamaah
   - Autentikasi admin
   ========================================================== */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MasjidDB = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var STORAGE_KEY = 'masjid_syukur_db_v6';
  var SESSION_KEY = 'masjid_admin_session_v1';

  // Data awal default (Masjid Syukur Ampel Boyolali)
  var DEFAULT_DATA = {
    info: {
      nama: 'Masjid Syukur Ampel',
      tagline: 'Masjid Ramah Musafir 24 Jam di Jalur Solo–Semarang',
      alamat: 'Jl. Raya Boyolali - Semarang No.141, Dusun 2, Kaligentong, Kec. Ampel, Kabupaten Boyolali, Jawa Tengah 57352',
      whatsapp: '0856-4206-7333',
      whatsappNumber: '6285642067333',
      whatsappMalam: '0858-6790-7527',
      whatsappMalamNumber: '6285867907527',
      email: 'takmir@masjidsyukur.or.id',
      jamBuka: 'Masjid & Layanan Musafir: Terbuka 24 Jam Penuh (Non-Stop).\nSekretariat & Takmir: Setiap hari, 07:00 - 21:00 WIB.',
      kapasitas: '1.000 jamaah',
      tahunBerdiri: 'Binaan PDM Boyolali & PCM Ampel',
      fasilitas: 'Kopi & Teh Gratis 24 Jam, Free Wi-Fi, Kasur Rehat Musafir, Toilet & Tempat Wudhu Bersih, Parkir Luas Aman',
      sambutanKetua: 'Assalamu\'alaikum warahmatullahi wabarakatuh. Selamat datang di situs resmi Masjid Syukur Ampel Boyolali. Terinspirasi oleh semangat kemakmuran Masjid Jogokariyan Yogyakarta, takmir masjid bertekad memberikan pelayanan terbaik bagi warga sekitar maupun para musafir yang melintasi jalur Solo–Semarang. Kami membuka pintu 24 jam penuh dengan fasilitas minuman hangat gratis, tempat istirahat yang nyaman, serta berbagai program keilmuan dan sosial umat. Mari bersama memakmurkan rumah Allah.',
      instagram: 'masjidsyukur.ampel',
      afiliasi: 'Pimpinan Daerah Muhammadiyah (PDM) Boyolali, satu kompleks kantor PCM Ampel & Gladagsari',
      ciriKhas: 'Bangunan bercat biru mencolok yang ikonik persis di tepi jalan arteri nasional Solo–Semarang'
    },

    prayerTimes: [
      { id: 'imsak', name: 'Imsak', time: '03:59', salat: false },
      { id: 'subuh', name: 'Subuh', time: '04:09', salat: true },
      { id: 'terbit', name: 'Terbit', time: '05:23', salat: false },
      { id: 'dzuhur', name: 'Dzuhur', time: '11:32', salat: true },
      { id: 'ashar', name: 'Ashar', time: '14:41', salat: true },
      { id: 'maghrib', name: 'Maghrib', time: '17:36', salat: true },
      { id: 'isya', name: 'Isya', time: '18:45', salat: true }
    ],

    announcements: [
      {
        id: 'ann-1',
        date: '2026-09-28',
        day: '28',
        month: 'Sep',
        tag: 'Musafir 24 Jam',
        isUrgent: true,
        title: 'Layanan Istirahat & Minuman Hangat Gratis 24 Jam Non-Stop',
        content: 'Bagi seluruh musafir dan pengendara rute Solo–Semarang yang lelah atau mengantuk, silakan singgah di Masjid Syukur. Takmir menyediakan kopi, teh, air galon, kasur rehat sejenak, dan Wi-Fi gratis demi keselamatan perjalanan Anda.',
        image: ''
      },
      {
        id: 'ann-2',
        date: '2026-10-04',
        day: '04',
        month: 'Okt',
        tag: 'Kajian Rutin',
        isUrgent: false,
        title: 'Kajian Ahad Pagi Terbuka untuk Umum Putra & Putri',
        content: 'Hadirilah Kajian Ahad Pagi Masjid Syukur Ampel mulai pukul 06.00 WIB bersama ustaz tamu pilihan. Terbuka untuk umum jamaah putra dan putri, dilanjutkan sarapan bersama.',
        image: 'images/kajian-rutin-ahad-pagi.jpg'
      },
      {
        id: 'ann-3',
        date: '2026-10-10',
        day: '10',
        month: 'Okt',
        tag: 'Santunan Yatim',
        isUrgent: false,
        title: 'Program Orang Tua Asuh: Santunan Rutin 140 Anak Yatim & Dhuafa',
        content: 'Mari raih naungan surga bersama Rasulullah SAW dengan menjadi Orang Tua Asuh bagi 140 anak yatim dan dhuafa binaan PAYDM Syukur Gladagsari. Pilihan paket donasi bulanan Rp 50.000, Rp 100.000, Rp 150.000, tak terhingga, serta sedekah beras (min. 1 kg). Rekening BRI: 6648-01-032765-53-7 an. MUHAMMADIYAH SYUKUR (Konfirmasi: Bu Nur Chasanah 0822-2106-1314 / Maria Ulfa 0858-0327-3774).',
        image: 'images/program-orang-tua-asuh.jpg'
      },
      {
        id: 'ann-4',
        date: '2026-09-20',
        day: '20',
        month: 'Sep',
        tag: 'Informasi',
        isUrgent: false,
        title: 'Program I\'tikaf 10 Malam Terakhir Ramadhan Berfasilitas Lengkap',
        content: 'Setiap bulan suci Ramadhan, Masjid Syukur menyelenggarakan I\'tikaf gratis dengan fasilitas kasur, hidangan buka puasa, dan makan sahur untuk para mutakif.',
        image: ''
      }
    ],

    activities: [
      {
        id: 'act-1',
        title: 'Kajian Rutin Ahad Pagi',
        category: 'kajian',
        categoryLabel: 'Kajian Rutin',
        date: 'Ahad setiap pekan',
        time: '06:00 - 07:00 WIB',
        location: 'Ruang utama & aula Masjid Syukur',
        description: 'Kajian tematik rutin bersama Ust. Teja Nurcahya terbuka untuk umum jamaah putra dan putri, diakhiri dengan sarapan pagi bersama.',
        image: 'images/kajian-rutin-ahad-pagi.jpg'
      },
      {
        id: 'act-tarjih',
        title: 'Kajian Rutin Tarjih',
        category: 'kajian',
        categoryLabel: 'Kajian Rutin',
        date: 'Setiap hari Rabu',
        time: 'Ba\'da Maghrib - Isya',
        location: 'Ruang utama Masjid Syukur',
        description: 'Mengkaji dalil dan fikih bersama Ust. Nursono Sidiq (Pekan 1: Aqidah, Pekan 2: Ibadah, Pekan 3: Muamalah, Pekan 4: Fatwa Tarjih Terkini).',
        image: 'images/kajian-rutin-tarjih.jpg'
      },
      {
        id: 'act-tahsin',
        title: 'Belajar Tahsin Al-Qur\'an (Putra)',
        category: 'kajian',
        categoryLabel: 'Tahsin Al-Qur\'an',
        date: 'Setiap hari Ahad',
        time: 'Ba\'da Maghrib - Isya',
        location: 'Masjid Syukur Ampel',
        description: 'Bimbingan membaca Al-Qur\'an dengan tartil dan tajwid yang benar bersama Ust. Abdullah Nur Husna Al Hafidz.',
        image: 'images/belajar-tahsin.jpg'
      },
      {
        id: 'act-2',
        title: 'Layanan Singgah & Istirahat Ramah Musafir',
        category: 'sosial',
        categoryLabel: 'Ramah Musafir',
        date: 'Setiap hari (24 Jam Non-Stop)',
        time: 'Terbuka 24 Jam Penuh',
        location: 'Selasar & Ruang Rehat Musafir',
        description: 'Fasilitas rehat tidur beralas kasur, sajian teh & kopi panas cuma-cuma, colokan charger, dan Wi-Fi gratis bagi pengendara jalur Solo–Semarang.',
        image: 'images/fasilitas-teh-kopi.jpg'
      },
      {
        id: 'act-3',
        title: 'Shalat Lima Waktu & Shalat Jamak Qashar Berjamaah',
        category: 'jumat',
        categoryLabel: 'Ibadah Wajib',
        date: 'Setiap hari 5 waktu',
        time: 'Sesuai jadwal salat harian',
        location: 'Ruang shalat utama ber-AC & sejuk',
        description: 'Pelaksanaan shalat berjamaah tepat waktu dengan suasana khusyuk, karpet bersih wangi, dan fasilitas wudhu yang selalu terawat.',
        image: 'images/sholat-berjamaah.jpg'
      },
      {
        id: 'act-4',
        title: 'Jumat Berkah & Shalat Jumat Berjamaah',
        category: 'jumat',
        categoryLabel: 'Shalat Jumat & Sosial',
        date: 'Jumat setiap pekan',
        time: '11:30 WIB s.d. selesai',
        location: 'Ruang utama, selasar, & teras Masjid Syukur',
        description: 'Pelaksanaan Shalat Jumat berjamaah dilanjutkan santap makan siang prasmanan gratis untuk seluruh jamaah dan musafir.',
        image: 'images/jumat-berkah.jpg'
      },
      {
        id: 'act-5',
        title: 'Program I\'tikaf Ramadhan 10 Malam Terakhir',
        category: 'kajian',
        categoryLabel: 'Ramadhan',
        date: '10 Malam Terakhir Ramadhan',
        time: '20:30 - Subuh WIB',
        location: 'Masjid Syukur Ampel',
        description: 'I\'tikaf berfasilitas kasur tidur (kuota terbatas), bimbingan qiyamul lail, tausiyah, serta sajian ifthar dan santap sahur gratis.',
        image: 'images/poster-ramadan.svg'
      },
      {
        id: 'act-6',
        title: 'Program Orang Tua Asuh (Santunan 140 Yatim & Dhuafa)',
        category: 'santunan',
        categoryLabel: 'Santunan',
        date: 'Rutin setiap bulan',
        time: 'Penyaluran Tiap Bulan',
        location: 'Panti Asuhan Yatim & Dhuafa Muhammadiyah (PAYDM) Syukur, Gladagsari',
        description: 'Program santunan rutin bulanan bagi 140 anak yatim dan dhuafa binaan PAYDM Syukur di Kalitengah, Gladagsari. Pilihan paket donasi bulanan Rp 50rb, Rp 100rb, Rp 150rb, tak terhingga, dan donasi beras (min. 1 kg). Rekening Bank BRI: 6648-01-032765-53-7 an. MUHAMMADIYAH SYUKUR.',
        image: 'images/program-orang-tua-asuh.jpg'
      }
    ],

    finances: {
      '2026-10': {
        label: 'Oktober 2026',
        saldoAwal: 512000,
        pemasukan: [
          { id: 'in-10-1', tgl: '02 Okt 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 1", jumlah: 645000 },
          { id: 'in-10-2', tgl: '09 Okt 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 2", jumlah: 910000 },
          { id: 'in-10-3', tgl: '16 Okt 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 3", jumlah: 940000 },
          { id: 'in-10-4', tgl: '23 Okt 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 4", jumlah: 690000 },
          { id: 'in-10-5', tgl: '25 Okt 2026', ket: 'Subsidi infaq Salam Subuh Bulan Oktober 2026', jumlah: 341500 }
        ],
        pengeluaran: [
          { id: 'out-10-1', tgl: '05 Okt 2026', ket: 'Pulsa Listrik (Biaya Utilitas)', jumlah: 510000 },
          { id: 'out-10-2', tgl: '08 Okt 2026', ket: 'Langganan Internet (Biaya Utilitas)', jumlah: 250000 },
          { id: 'out-10-3', tgl: '01 Okt 2026', ket: 'Honor Marbot (Honorarium Rutin)', jumlah: 1000000 },
          { id: 'out-10-4', tgl: '01 Okt 2026', ket: 'Honor Pembantu Kebersihan (Honorarium Rutin)', jumlah: 200000 },
          { id: 'out-10-5', tgl: '01 Okt 2026', ket: 'Honor Pembantu Umum (Honorarium Rutin)', jumlah: 300000 },
          { id: 'out-10-6', tgl: '01 Okt 2026', ket: 'Honor Pelayanan Malam (Honorarium Rutin)', jumlah: 350000 },
          { id: 'out-10-7', tgl: '12 Okt 2026', ket: 'Pelayanan Dahaga (Gula + Teh + Kopi + Galon)', jumlah: 546000 },
          { id: 'out-10-8', tgl: '15 Okt 2026', ket: 'Air Mineral (Flow)', jumlah: 127000 },
          { id: 'out-10-9', tgl: '18 Okt 2026', ket: 'Majalah Suara Muhammadiyah Per bulan', jumlah: 50000 },
          { id: 'out-10-10', tgl: '22 Okt 2026', ket: 'Bahan-bahan Pewangi, Pembersih dll', jumlah: 107500 }
        ]
      },
      '2026-09': {
        label: 'September 2026',
        saldoAwal: 2076000,
        pemasukan: [
          { id: 'in-9-1', tgl: '04 Sep 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 1", jumlah: 760000 },
          { id: 'in-9-2', tgl: '11 Sep 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 2", jumlah: 635000 },
          { id: 'in-9-3', tgl: '18 Sep 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 3", jumlah: 540000 },
          { id: 'in-9-4', tgl: '25 Sep 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 4", jumlah: 650000 },
          { id: 'in-9-5', tgl: '30 Sep 2026', ket: 'Subsidi infaq Salam Subuh Bulan September 2026', jumlah: 313000 }
        ],
        pengeluaran: [
          { id: 'out-9-1', tgl: '05 Sep 2026', ket: 'Pulsa Listrik (Biaya Utilitas)', jumlah: 263000 },
          { id: 'out-9-2', tgl: '08 Sep 2026', ket: 'Tagihan Internet (Biaya Utilitas)', jumlah: 250000 },
          { id: 'out-9-3', tgl: '01 Sep 2026', ket: 'Honor Marbot (Honorarium Rutin)', jumlah: 1000000 },
          { id: 'out-9-4', tgl: '01 Sep 2026', ket: 'Honor Pembantu Kebersihan (Honorarium Rutin)', jumlah: 200000 },
          { id: 'out-9-5', tgl: '01 Sep 2026', ket: 'Honor Pembantu Umum (Honorarium Rutin)', jumlah: 300000 },
          { id: 'out-9-6', tgl: '01 Sep 2026', ket: 'Tunggakan 1 Bulan yg lalu (Pembantu Umum)', jumlah: 300000 },
          { id: 'out-9-7', tgl: '01 Sep 2026', ket: 'Honor Pelayanan Malam (Honorarium Rutin)', jumlah: 350000 },
          { id: 'out-9-8', tgl: '10 Sep 2026', ket: 'Kajian Rutin Tarjih (1 Kali)', jumlah: 200000 },
          { id: 'out-9-9', tgl: '15 Sep 2026', ket: 'Belajar Tahsin (4 Kali) 1 Orang @ 50.000', jumlah: 200000 },
          { id: 'out-9-10', tgl: '20 Sep 2026', ket: "Jum'at Berkah/Kebersihan/Isah-Isah 2 Org (4 kali)", jumlah: 200000 },
          { id: 'out-9-11', tgl: '12 Sep 2026', ket: 'Pelayanan Dahaga (Gula + Teh + Kopi)', jumlah: 163000 },
          { id: 'out-9-12', tgl: '14 Sep 2026', ket: 'Air Galon (5 Kali)', jumlah: 40000 },
          { id: 'out-9-13', tgl: '16 Sep 2026', ket: 'Air Mineral (5 Kali) - Pembelian 1', jumlah: 52000 },
          { id: 'out-9-14', tgl: '19 Sep 2026', ket: 'Air Mineral (5 Kali) - Pembelian 2', jumlah: 52000 },
          { id: 'out-9-15', tgl: '22 Sep 2026', ket: 'Air Mineral (5 Kali) - Pembelian 3', jumlah: 78000 },
          { id: 'out-9-16', tgl: '26 Sep 2026', ket: 'Air Mineral (5 Kali) - Pembelian 4', jumlah: 52000 },
          { id: 'out-9-17', tgl: '18 Sep 2026', ket: 'Majalah Suara Muhammadiyah Per bulan', jumlah: 50000 },
          { id: 'out-9-18', tgl: '23 Sep 2026', ket: 'Bahan-bahan Pewangi', jumlah: 375000 },
          { id: 'out-9-19', tgl: '24 Sep 2026', ket: 'Lain-lain (Kunci, plastik, dll)', jumlah: 22000 },
          { id: 'out-9-20', tgl: '24 Sep 2026', ket: 'Mama Lemon (Pembersih)', jumlah: 15000 },
          { id: 'out-9-21', tgl: '28 Sep 2026', ket: 'Cuci Mukena dan Sarung Bulan Juli - September (3 Bln)', jumlah: 100000 },
          { id: 'out-9-22', tgl: '28 Sep 2026', ket: 'Tunggakan 2 Bulan yg lalu (Cuci Mukena, Sarung)', jumlah: 200000 }
        ]
      }
    },

    articles: [
      // ── ARTIKEL ISLAMI ───────────────────────────────────────────
      {
        id: 'art-1',
        title: 'Menjaga Salat Berjamaah di Tengah Kesibukan Perjalanan',
        category: 'Artikel Islami',
        categorySlug: 'artikel-islami',
        author: 'Takmir Masjid Syukur',
        date: 'Ahad, 20 September 2026',
        datetime: '2026-09-20',
        image: 'images/sholat-berjamaah.jpg',
        excerpt: 'Tips praktis bagi musafir dan pengendara agar tidak melewatkan waktu salat meski dalam perjalanan jauh di jalur Solo–Semarang.',
        quoteArab: 'وَإِذَا ضَرَبْتُمْ فِي الْأَرْضِ فَلَيْسَ عَلَيْكُمْ جُنَاحٌ أَنْ تَقْصُرُوا مِنَ الصَّلَاةِ',
        quoteTranslation: '"Dan apabila kamu bepergian di muka bumi, maka tidaklah mengapa kamu mengqashar shalat."',
        quoteSource: '(QS. An-Nisā\': 101)',
        fullText: 'Bagi musafir yang menempuh perjalanan jauh seperti rute Solo–Semarang, menjaga salat tepat waktu bisa menjadi tantangan tersendiri. Masjid Syukur Ampel hadir sebagai solusi: buka 24 jam, mudah diakses, dan berada persis di pinggir jalan utama Kaligentong, Ampel.\n\nIslam memberikan kemudahan bagi musafir melalui keringanan jamak (menggabungkan dua waktu salat) dan qashar (meringkas salat empat rakaat menjadi dua). Rukhshah ini adalah bentuk kasih sayang Allah kepada hamba-Nya yang sedang dalam perjalanan. Jangan ragu memanfaatkannya sesuai syarat yang ditetapkan para ulama.\n\nRencanakan rute perjalanan dengan memperhatikan waktu salat. Gunakan aplikasi waktu salat untuk mengetahui posisi masjid terdekat di setiap titik perjalanan. Masjid Syukur Ampel di Kaligentong adalah oase sempurna di jalur Solo–Semarang untuk singgah salat, rehat, dan mengisi energi sebelum melanjutkan perjalanan.'
      },
      {
        id: 'art-2',
        title: 'Adab dan Keutamaan Beristirahat di Masjid bagi Para Musafir',
        category: 'Artikel Islami',
        categorySlug: 'artikel-islami',
        author: 'Ust. Pembina Takmir',
        date: 'Jumat, 11 September 2026',
        datetime: '2026-09-11',
        image: 'images/kasur-musafir.jpg',
        excerpt: 'Panduan fiqih dan etika bagi musafir yang memanfaatkan fasilitas masjid untuk shalat jamak/qashar dan beristirahat sejenak.',
        quoteArab: 'إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ',
        quoteTranslation: '"Hanyalah yang memakmurkan masjid-masjid Allah ialah orang-orang yang beriman kepada Allah dan Hari Kemudian."',
        quoteSource: '(QS. At-Taubah: 18)',
        fullText: 'Islam adalah agama yang memberikan banyak kemudahan (rukhshah) bagi musafir, termasuk shalat jamak dan qashar serta hak mendapatkan perlindungan dan tempat singgah yang aman. Masjid adalah rumah Allah yang terbuka untuk seluruh umat, termasuk para musafir yang membutuhkan tempat berteduh dan beristirahat.\n\nSaat beristirahat di Masjid Syukur, jamaah dianjurkan tetap menjaga kesucian tempat shalat, meletakkan alas kaki pada rak yang telah disediakan, serta menggunakan fasilitas air dan listrik secara bijak. Tidur di area selasar atau ruang istirahat yang telah disediakan takmir memungkinkan kenyamanan bersama tetap terpelihara.\n\nTak lupa, selipkan doa kebaikan untuk para pengurus, donatur, dan relawan yang telah ikhlas mewakafkan tenaga demi melayani tamu-tamu Allah 24 jam sehari. Sebuah ucapan jazakumullah khairan kepada takmir sudah cukup sebagai bentuk penghargaan yang tulus.'
      },
      {
        id: 'art-berita',
        title: 'Masjid Syukur Ampel: Oase Ramah Musafir 24 Jam di Jalur Solo–Semarang',
        category: 'Artikel Islami',
        categorySlug: 'artikel-islami',
        author: 'Takmir Masjid Syukur',
        date: 'Ahad, 6 September 2026',
        datetime: '2026-09-06',
        image: 'images/depan-masjid.jpg',
        excerpt: 'Mengenal lebih dekat Masjid Syukur Ampel Boyolali, masjid ramah musafir 24 jam yang ikonik dengan bangunan bercat biru di jalur utama Solo–Semarang.',
        fullText: 'Masjid Jami\' Syukur Ampel Boyolali bukan sekadar tempat ibadah biasa. Berdiri di tepi jalan arteri nasional yang menghubungkan Solo menuju Semarang (via Boyolali–Salatiga), masjid bercat biru mencolok ini telah menjadi landmark dan oase bagi jutaan pengendara yang melintas setiap tahunnya.\n\nTerinspirasi dari kemakmuran Masjid Jogokariyan Yogyakarta, takmir Masjid Syukur berkomitmen menyediakan layanan gratis 24 jam non-stop: kopi & teh panas, kasur rehat, Wi-Fi kencang, toilet & tempat wudhu bersih, serta parkir luas. Semua ini disediakan cuma-cuma sebagai bentuk kemuliaan akhlak dan pelayanan terbaik kepada tamu Allah.\n\nMasjid ini berada di bawah naungan PDM Boyolali dan satu kompleks dengan PCM Ampel & Gladagsari. Takmir berpegang teguh pada prinsip bahwa setiap rupiah infak jamaah harus berputar menjadi manfaat nyata, bukan mengendap di rekening.'
      },
      // ── MATERI KAJIAN ────────────────────────────────────────────
      {
        id: 'art-mk-1',
        title: 'Ringkasan Materi Tarjih: Tata Cara Shalat Jamak & Qashar bagi Musafir',
        category: 'Materi Kajian',
        categorySlug: 'materi-kajian',
        author: 'Ust. Nursono Sidiq',
        date: 'Rabu, 8 Oktober 2026',
        datetime: '2026-10-08',
        image: 'images/kajian-rutin-tarjih.jpg',
        excerpt: 'Rangkuman dalil dan ketentuan fiqih tentang shalat jamak & qashar bagi musafir, hasil kajian Tarjih Masjid Syukur Ampel.',
        downloadUrl: '#',
        downloadLabel: 'Unduh Materi Tarjih (PDF)',
        downloadSize: 'PDF • 1,2 MB',
        quoteArab: 'وَإِذَا ضَرَبْتُمْ فِي الْأَرْضِ فَلَيْسَ عَلَيْكُمْ جُنَاحٌ أَنْ تَقْصُرُوا مِنَ الصَّلَاةِ',
        quoteTranslation: '"Dan apabila kamu bepergian di muka bumi, maka tidaklah mengapa kamu mengqashar shalat."',
        quoteSource: '(QS. An-Nisā\': 101)',
        fullText: 'Kajian Tarjih pekan ini membahas tuntas ketentuan shalat bagi musafir: kapan boleh jamak, qashar, atau keduanya? Berikut ringkasan poin-poin penting dari pembahasan Ust. Nursono Sidiq.\n\nSyarat musafir yang boleh mengqashar: (1) menempuh jarak minimal 81 km (pendapat mayoritas ulama), (2) tidak berniat bermukim lebih dari 4 hari di tujuan, (3) safarnya bukan untuk tujuan maksiat. Adapun shalat jamak (menggabungkan Dzuhur+Ashar atau Maghrib+Isya) boleh dilakukan baik dalam perjalanan maupun dalam kondisi darurat tertentu.\n\nMasjid Syukur Ampel menjadi tempat yang tepat bagi musafir untuk melaksanakan jamak & qashar dengan tenang. Imam shalat akan mengingatkan di awal bahwa shalat diqashar bagi yang berniat safar.'
      },
      {
        id: 'art-mk-2',
        title: 'Materi Tahsin: Kaidah Tajwid Dasar — Makharijul Huruf & Sifatul Huruf',
        category: 'Materi Kajian',
        categorySlug: 'materi-kajian',
        author: 'Ust. Abdullah Nur Husna Al Hafidz',
        date: 'Ahad, 5 Oktober 2026',
        datetime: '2026-10-05',
        image: 'images/kegiatan-belajar-tahsin.jpg',
        excerpt: 'Materi pembelajaran Tahsin Al-Qur\'an: kaidah makhraj dan sifat huruf hijaiyah sebagai fondasi membaca Al-Qur\'an dengan benar.',
        downloadUrl: '#',
        downloadLabel: 'Unduh Materi Tahsin (PDF)',
        downloadSize: 'PDF • 850 KB',
        fullText: 'Membaca Al-Qur\'an dengan tajwid yang benar adalah kewajiban setiap Muslim. Tajwid secara bahasa berarti memperbaiki atau memperindah, sedangkan secara istilah berarti memberikan hak dan mustahak setiap huruf hijaiyah.\n\nMakharijul Huruf (tempat keluarnya huruf) dibagi menjadi 5 kelompok: Al-Jauf (rongga mulut & tenggorokan), Al-Halq (tenggorokan), Al-Lisan (lidah), Asy-Syafatain (dua bibir), dan Al-Khaisyum (hidung). Memahami makhraj yang benar adalah fondasi utama tahsin.\n\nPeserta diharapkan berlatih mandiri minimal 15 menit per hari dengan membaca Al-Qur\'an pelan-pelan, memperhatikan makhraj setiap huruf. Kajian Tahsin Ahad malam ba\'da Maghrib di Masjid Syukur terbuka untuk umum (putra).'
      },
      // ── RINGKASAN KHOTBAH ────────────────────────────────────────
      {
        id: 'art-kh-1',
        title: 'Ringkasan Khotbah Jumat: Menjadi Musafir yang Bermartabat',
        category: 'Ringkasan Khotbah',
        categorySlug: 'ringkasan-khotbah',
        author: 'Khatib: Ust. Teja Nurcahya',
        date: 'Jumat, 10 Oktober 2026',
        datetime: '2026-10-10',
        image: 'images/jumat-berkah.jpg',
        excerpt: 'Ringkasan khotbah Jumat yang membahas akhlak seorang musafir Muslim: menjaga salat, adab di perjalanan, dan memanfaatkan kemudahan syariat.',
        quoteArab: 'الْمُسَافِرُ وَمَالُهُ عَلَى قَلَقٍ حَتَّى يَرْجِعَ إِلَى أَهْلِهِ',
        quoteTranslation: '"Seorang musafir dan hartanya berada dalam kegoyahan hingga ia kembali kepada keluarganya."',
        quoteSource: '(HR. Tirmidzi, dinilai hasan)',
        fullText: 'Khotbah pertama membuka dengan firman Allah bahwa bumi ini luas dan diciptakan untuk manusia melakukan perjalanan. Perjalanan jauh bukan hanya soal fisik, tetapi juga ujian keimanan: akankah kita tetap menjaga salat, menjaga lisan, dan menjaga akhlak saat jauh dari rumah?\n\nIslam memerintahkan para musafir untuk memanfaatkan rukhshah (kemudahan) dengan penuh syukur, bukan menyalahgunakannya. Shalat jamak dan qashar adalah hadiah dari Allah, bukan alasan untuk meremehkan ibadah. Masjid-masjid di tepi jalan, seperti Masjid Syukur Ampel, hadir sebagai tempat singgah yang menjaga keistiqamahan perjalanan kita.\n\nKhotbah kedua ditutup dengan doa agar setiap musafir yang singgah di Masjid Syukur kembali ke rumah dalam keadaan selamat, sehat, dan membawa berkah. Shalat Jumat dihadiri sekitar 300 jamaah dan dilanjutkan makan siang prasmanan gratis (Jumat Berkah).'
      },
      {
        id: 'art-kh-2',
        title: 'Ringkasan Khotbah Jumat: Keutamaan Membangun dan Memakmurkan Masjid',
        category: 'Ringkasan Khotbah',
        categorySlug: 'ringkasan-khotbah',
        author: 'Khatib: Ust. Ahmad Fauzi',
        date: 'Jumat, 26 September 2026',
        datetime: '2026-09-26',
        image: 'images/makan-bersama-setelah-kajian-subuh.jpg',
        excerpt: 'Ringkasan khotbah tentang keutamaan membangun masjid dan memakmurkannya dengan berbagai kegiatan ibadah dan sosial.',
        quoteArab: 'مَنْ بَنَى مَسْجِدًا لِلَّهِ بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ',
        quoteTranslation: '"Barangsiapa yang membangun masjid karena Allah, maka Allah akan membangunkan untuknya sebuah rumah di surga."',
        quoteSource: '(HR. Bukhari & Muslim)',
        fullText: 'Khotbah kali ini mengajak seluruh jamaah merenungkan kemuliaan berinvestasi untuk masjid. Bukan sekadar bangunan fisik, memakmurkan masjid juga berarti mengisinya dengan shalat berjamaah, kajian ilmu, dan kegiatan sosial yang bermanfaat bagi umat.\n\nMasjid Syukur Ampel adalah bukti nyata bagaimana sedekah dan infak yang mengalir deras dari jamaah berubah menjadi ribuan cangkir kopi dan teh hangat untuk musafir yang kelelahan. Setiap donasi yang terkumpul dikelola secara transparan dan akuntabel, dan laporannya dapat diakses oleh seluruh jamaah melalui website resmi masjid.\n\nKhatib mengajak seluruh jamaah untuk ikut memakmurkan masjid, minimal dengan hadir shalat berjamaah secara rutin. Karena masjid yang ramai dengan jamaah adalah tanda keimanan yang kuat dari masyarakat sekitarnya.'
      },
      // ── VIDEO CERAMAH ────────────────────────────────────────────
      {
        id: 'art-vid-1',
        title: 'Video Kajian Ahad Pagi: Birrul Walidain di Era Modern',
        category: 'Video Ceramah',
        categorySlug: 'video-ceramah',
        author: 'Ust. Teja Nurcahya',
        date: 'Ahad, 12 Oktober 2026',
        datetime: '2026-10-12',
        image: 'images/kajian-rutin-ahad-pagi.jpg',
        excerpt: 'Rekaman kajian Ahad Pagi bersama Ust. Teja Nurcahya membahas birrul walidain (berbakti kepada orang tua) di era digital dan tantangan modernitas.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        fullText: 'Kajian Ahad Pagi pekan ini mengangkat tema yang sangat dekat dengan kehidupan sehari-hari: bagaimana seorang anak yang sudah dewasa tetap bisa berbakti kepada orang tua di tengah kesibukan kerja, perjalanan jauh, dan kehidupan kota modern?\n\nUst. Teja memulai kajian dengan membacakan ayat tentang birrul walidain (QS. Al-Isra\': 23-24) dan beberapa hadits Nabi ﷺ tentang keutamaan berbakti kepada ibu-bapak. Beliau menekankan bahwa birrul walidain tidak hanya soal materi, tetapi juga waktu, perhatian, dan doa.\n\nKajian berlangsung penuh khidmat dan dihadiri lebih dari 150 jamaah putra-putri. Setelah kajian, peserta diajak makan pagi bersama (nasi bungkus dan gorengan hangat) yang telah disiapkan relawan Masjid Syukur. Kajian Ahad Pagi rutin digelar setiap pekan pukul 06.00–07.00 WIB, terbuka untuk umum.'
      },
      {
        id: 'art-vid-2',
        title: 'Video Kajian Tarjih: Hukum Shalat di Atas Kendaraan',
        category: 'Video Ceramah',
        categorySlug: 'video-ceramah',
        author: 'Ust. Nursono Sidiq',
        date: 'Rabu, 1 Oktober 2026',
        datetime: '2026-10-01',
        image: 'images/kegiatan-belajar-tarjih-rutin.jpg',
        excerpt: 'Rekaman kajian Tarjih membahas hukum dan tata cara shalat di atas kendaraan bergerak (bus, kereta, pesawat) berdasarkan dalil Al-Qur\'an dan Sunnah.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        quoteArab: 'وَلِلَّهِ الْمَشْرِقُ وَالْمَغْرِبُ ۚ فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ',
        quoteTranslation: '"Kepunyaan Allah-lah timur dan barat, maka ke mana pun kamu menghadap, di situlah wajah Allah."',
        quoteSource: '(QS. Al-Baqarah: 115)',
        fullText: 'Kajian Tarjih malam ini membahas pertanyaan praktis yang sering menghantui para musafir: bolehkah shalat di atas bus atau kereta yang sedang bergerak? Apakah salatnya sah jika tidak menghadap kiblat dengan tepat?\n\nUst. Nursono menjelaskan bahwa ulama sepakat shalat sunnah di atas kendaraan bergerak hukumnya boleh, dan boleh menghadap ke arah perjalanan. Adapun shalat fardhu, jika benar-benar tidak memungkinkan berhenti, boleh dilakukan di atas kendaraan menghadap kiblat semampu mungkin.\n\nKajian direkam secara langsung dan dapat ditonton ulang melalui kanal YouTube Masjid Syukur. Video ini diharapkan bermanfaat bagi para musafir yang sering bepergian jauh dan membutuhkan panduan fiqih safar yang praktis.'
      }
    ],

    donations: {
      banks: [
        {
          id: 'bank-bri-santunan',
          name: 'Bank BRI (Khusus Santunan 140 Yatim & Dhuafa)',
          number: '6648-01-032765-53-7',
          cleanNumber: '664801032765537',
          owner: 'Unit Gladagsari Boyolali an. MUHAMMADIYAH SYUKUR'
        },
        {
          id: 'bank-1',
          name: 'Bank Syariah Indonesia (BSI)',
          number: '7220 0192 83',
          cleanNumber: '7220019283',
          owner: 'Masjid Syukur Ampel'
        },
        {
          id: 'bank-2',
          name: 'Bank Jateng Syariah',
          number: '5023 0128 47',
          cleanNumber: '5023012847',
          owner: 'Takmir Masjid Syukur Boyolali'
        },
        {
          id: 'bank-3',
          name: 'Bank Mandiri',
          number: '138 0098 7654 32',
          cleanNumber: '1380098765432',
          owner: 'Kas Masjid Syukur Ampel'
        }
      ],
      qrisImage: 'images/qris-contoh.svg',
      notes: 'Donasi disalurkan untuk operasional layanan musafir 24 jam dan santunan rutin 140 anak yatim & dhuafa binaan PAYDM Syukur Gladagsari (BRI: 6648-01-032765-53-7 an. MUHAMMADIYAH SYUKUR). Konfirmasi WA: 0822-2106-1314 (Nur Chasanah) / 0858-0327-3774 (Maria Ulfa).'
    },

    materials: [],

    messages: [
      {
        id: 'msg-1',
        nama: 'Bambang Triyono (Musafir Semarang)',
        kontak: '081329881234',
        tipe: 'Apresiasi & Doa',
        pesan: 'Assalamu\'alaikum. Terima kasih banyak untuk takmir Masjid Syukur Ampel. Semalam saya dan keluarga dari Solo ke Semarang ngantuk berat, tertolong sekali bisa tidur nyenyak di kasur masjid dan ngopi gratis. Masjid sangat bersih dan berkah!',
        waktu: '2026-09-27 06:15',
        dibaca: true
      },
      {
        id: 'msg-2',
        nama: 'Keluarga Jamaah Ampel',
        kontak: '085728114455',
        tipe: 'Pertanyaan',
        pesan: 'Assalamu\'alaikum ustadz, apakah Kajian Ahad Pagi pekan depan membawa kitab khusus dan apakah parkir mobil muat banyak?',
        waktu: '2026-09-28 08:30',
        dibaca: false
      }
    ],

    adminUser: {
      username: 'admin',
      password: 'admin123',
      displayName: 'Takmir Masjid Syukur',
      email: 'takmir@masjidsyukur.or.id'
    },

    organization: {
      meta: {
        title: 'Struktur Takmir & Pengelola',
        period: 'Perubahan ke-2 • Periode 2023 – Januari 2028',
        effectiveDate: '01 September 2026',
        description: 'Draf Struktur Organisasi Takmir Masjid Syukur di bawah binaan PDM Boyolali & PCM Ampel.'
      },
      categories: [
        'Pembina & Penasehat',
        'Pimpinan Harian',
        'Seksi Ibadah dan Kajian',
        'Seksi Humas dan Sosial',
        'Seksi Pengajian Anak',
        'Seksi Pemeliharaan dan Pengelolaan Aset',
        'Seksi Kebersihan',
        'Seksi Keamanan',
        'Seksi Sarpras',
        'Seksi Publikasi dan Informasi',
        'Seksi Pemberdayaan Jamaah'
      ],
      members: [
        // Pembina & Penasehat
        { id: 'org-1', name: 'LPCR dan Pembinaan Masjid PDM Boyolali', role: 'Pembina', category: 'Pembina & Penasehat', image: '' },
        { id: 'org-2', name: 'Ketua PCM Gladagsari', role: 'Penasehat', category: 'Pembina & Penasehat', image: '' },
        { id: 'org-3', name: 'Ketua PCM Ampel', role: 'Penasehat', category: 'Pembina & Penasehat', image: '' },

        // Pimpinan Harian
        { id: 'org-4', name: 'Sasongko Putra', role: 'Ketua', category: 'Pimpinan Harian', image: '' },
        { id: 'org-5', name: 'Muhammad Sibghoh Talloh Al Mujtaba', role: 'Sekretaris', category: 'Pimpinan Harian', image: '' },
        { id: 'org-6', name: 'LazisMU KL Masjid Syukur', role: 'Bendahara', category: 'Pimpinan Harian', image: '' },

        // Seksi Ibadah dan Kajian
        { id: 'org-7', name: 'Pak Muhtarom', role: 'Koordinator', category: 'Seksi Ibadah dan Kajian', image: '' },
        { id: 'org-8', name: 'Pak Pardi', role: 'Kajian Tarjih', category: 'Seksi Ibadah dan Kajian', image: '' },
        { id: 'org-9', name: 'Bu Tati Lisnawati', role: 'Kajian Ahad Pagi', category: 'Seksi Ibadah dan Kajian', image: '' },
        { id: 'org-10', name: 'Bu Sri Munarti', role: 'Kajian Salam Subuh', category: 'Seksi Ibadah dan Kajian', image: '' },
        { id: 'org-11', name: 'Mas Kenzo', role: 'Belajar Tahsin', category: 'Seksi Ibadah dan Kajian', image: '' },

        // Seksi Humas dan Sosial
        { id: 'org-12', name: 'Pak Listyo Utomo', role: 'Koordinator', category: 'Seksi Humas dan Sosial', image: '' },
        { id: 'org-13', name: 'Pak Mulyono', role: 'Bantuan Musafir', category: 'Seksi Humas dan Sosial', image: '' },
        { id: 'org-14', name: 'Pak Bayu', role: 'Bantuan Sosial Insidental', category: 'Seksi Humas dan Sosial', image: '' },
        { id: 'org-15', name: 'Bu Partini', role: 'Bantuan Sosial Insidental', category: 'Seksi Humas dan Sosial', image: '' },

        // Seksi Pengajian Anak
        { id: 'org-16', name: 'Bu Pipit', role: 'Koordinator', category: 'Seksi Pengajian Anak', image: '' },
        { id: 'org-17', name: 'Mas Widodo', role: 'Anggota', category: 'Seksi Pengajian Anak', image: '' },
        { id: 'org-18', name: 'Pak Ivan', role: 'Anggota', category: 'Seksi Pengajian Anak', image: '' },

        // Seksi Pemeliharaan dan Pengelolaan Aset
        { id: 'org-19', name: 'Mas Rifki', role: 'Koordinator', category: 'Seksi Pemeliharaan dan Pengelolaan Aset', image: '' },
        { id: 'org-20', name: 'Mas Indra', role: 'Anggota', category: 'Seksi Pemeliharaan dan Pengelolaan Aset', image: '' },

        // Seksi Kebersihan
        { id: 'org-21', name: 'Pak Widodo', role: 'Koordinator', category: 'Seksi Kebersihan', image: '' },
        { id: 'org-22', name: 'Pak Totok', role: 'Anggota', category: 'Seksi Kebersihan', image: '' },

        // Seksi Keamanan
        { id: 'org-23', name: 'Pak Nur Kokam', role: 'Koordinator', category: 'Seksi Keamanan', image: '' },
        { id: 'org-24', name: 'Pak Rosedi Kokam', role: 'Anggota', category: 'Seksi Keamanan', image: '' },

        // Seksi Sarpras
        { id: 'org-25', name: 'Pak Sutarno', role: 'Koordinator', category: 'Seksi Sarpras', image: '' },
        { id: 'org-26', name: 'Pak Muhlis', role: 'Anggota', category: 'Seksi Sarpras', image: '' },
        { id: 'org-27', name: 'Pak Giri', role: 'Anggota', category: 'Seksi Sarpras', image: '' },

        // Seksi Publikasi dan Informasi
        { id: 'org-28', name: 'Pak Rudy', role: 'Koordinator', category: 'Seksi Publikasi dan Informasi', image: '' },
        { id: 'org-29', name: 'Mas Wildan', role: 'Anggota', category: 'Seksi Publikasi dan Informasi', image: '' },
        { id: 'org-30', name: 'Mas Ilham', role: 'Anggota', category: 'Seksi Publikasi dan Informasi', image: '' },
        { id: 'org-31', name: 'Mas Astalik', role: 'Anggota', category: 'Seksi Publikasi dan Informasi', image: '' },

        // Seksi Pemberdayaan Jamaah
        { id: 'org-32', name: 'Pak Bowo', role: 'Syukur Farm', category: 'Seksi Pemberdayaan Jamaah', image: '' },
        { id: 'org-33', name: 'Pak Sarana', role: 'Ta\'awun Syukur', category: 'Seksi Pemberdayaan Jamaah', image: '' },
        { id: 'org-34', name: 'Bu Budiyah', role: 'Makan diSyukur Gratis', category: 'Seksi Pemberdayaan Jamaah', image: '' },
        { id: 'org-35', name: 'Bu Endang', role: 'Syukur Mart', category: 'Seksi Pemberdayaan Jamaah', image: '' },
        { id: 'org-36', name: 'Bu Nurhasanah', role: 'Syukur Preloved', category: 'Seksi Pemberdayaan Jamaah', image: '' },
        { id: 'org-37', name: 'Pak Teguh', role: 'Syukur Air Mineral', category: 'Seksi Pemberdayaan Jamaah', image: '' },
        { id: 'org-38', name: 'Bu Dokter Titik Suryaningsih', role: 'Jum\'at Berkah', category: 'Seksi Pemberdayaan Jamaah', image: '' },
        { id: 'org-39', name: 'Bu Nuly', role: 'Santunan PAYDM Syukur', category: 'Seksi Pemberdayaan Jamaah', image: '' }
      ]
    },

    gallery: [
      {
        id: 'gal-hero',
        title: 'Bangunan Biru Ikonik',
        description: 'Bangunan biru ikonik Masjid Syukur di tepi jalur utama Solo–Semarang',
        date: '2026-09-01',
        category: 'fasilitas',
        categoryLabel: 'Fasilitas Musafir',
        image: 'images/hero-masjid.jpg'
      },
      {
        id: 'gal-depan',
        title: 'Fasad Layanan & Kantor PCM',
        description: 'Fasad depan kantor layanan Masjid Syukur & PCM Ampel',
        date: '2026-09-03',
        category: 'fasilitas',
        categoryLabel: 'Fasilitas Musafir',
        image: 'images/depan-masjid.jpg'
      },
      {
        id: 'gal-sholat',
        title: 'Shalat Berjamaah Khusyuk',
        description: 'Suasana shalat berjamaah di ruang utama Masjid Syukur yang sejuk & khusyuk',
        date: '2026-09-05',
        category: 'ibadah',
        categoryLabel: 'Ibadah Shalat',
        image: 'images/sholat-berjamaah.jpg'
      },
      {
        id: 'gal-teh-kopi',
        title: 'Pojok Kopi & Teh Gratis 24 Jam',
        description: 'Pojok kopi, teh panas, air galon, dan lemari makanan gratis 24 jam untuk musafir',
        date: '2026-09-08',
        category: 'fasilitas',
        categoryLabel: 'Fasilitas Musafir',
        image: 'images/fasilitas-teh-kopi.jpg'
      },
      {
        id: 'gal-kasur',
        title: 'Fasilitas Rehat Kasur Musafir',
        description: 'Fasilitas kasur busa empuk dan karpet bersih untuk istirahat musafir yang kelelahan',
        date: '2026-09-10',
        category: 'fasilitas',
        categoryLabel: 'Fasilitas Musafir',
        image: 'images/kasur-musafir.jpg'
      },
      {
        id: 'gal-santai',
        title: 'Area Santai & Wudhu Bersih',
        description: 'Area santai berpayung teduh dan tempat wudhu luar yang bersih dan terawat',
        date: '2026-09-12',
        category: 'fasilitas',
        categoryLabel: 'Fasilitas Musafir',
        image: 'images/tempat-santai.jpg'
      },
      {
        id: 'gal-tarjih',
        title: 'Kajian Rutin Tarjih',
        description: 'Suasana antusiasme jamaah dalam mengikuti Kajian Rutin Tarjih di ruang utama',
        date: '2026-09-17',
        category: 'kegiatan',
        categoryLabel: 'Kegiatan Dakwah',
        image: 'images/kegiatan-belajar-tarjih-rutin.jpg'
      },
      {
        id: 'gal-tahsin',
        title: 'Belajar Tahsin Al-Qur\'an',
        description: 'Kegiatan pembelajaran Tahsin Al-Qur\'an bersama jamaah di serambi masjid',
        date: '2026-09-20',
        category: 'kegiatan',
        categoryLabel: 'Kegiatan Dakwah',
        image: 'images/kegiatan-belajar-tahsin.jpg'
      },
      {
        id: 'gal-jumat',
        title: 'Program Jumat Berkah',
        description: 'Program Jumat Berkah: Berbagi makanan dan hidangan prasmanan untuk jamaah dan musafir',
        date: '2026-09-25',
        category: 'sosial',
        categoryLabel: 'Sosial & Berbagi',
        image: 'images/jumat-berkah.jpg'
      },
      {
        id: 'gal-makan-ahad',
        title: 'Sarapan Bersama Jamaah Ahad Pagi',
        description: 'Sarapan dan makan bersama jamaah setelah Kajian Rutin Ahad Pagi',
        date: '2026-09-27',
        category: 'kegiatan',
        categoryLabel: 'Kegiatan Dakwah',
        image: 'images/makan-bersama-setelah-kajian-rutin-ahad-pagi.jpg'
      },
      {
        id: 'gal-cctv',
        title: 'Sistem Keamanan CCTV 24 Jam',
        description: 'Sistem keamanan lingkungan terpantau kamera CCTV 24 jam non-stop demi kenyamanan jamaah',
        date: '2026-10-02',
        category: 'fasilitas',
        categoryLabel: 'Fasilitas Musafir',
        image: 'images/cctv-24jam.jpg'
      }
    ]
  };

  // Helper deep clone
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Load from localStorage or initialize with defaults
  function loadDatabase() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        saveDatabase(DEFAULT_DATA);
        return clone(DEFAULT_DATA);
      }
      var parsed = JSON.parse(raw);
      var merged = Object.assign({}, DEFAULT_DATA, parsed);
      if (parsed.info) {
        merged.info = Object.assign({}, DEFAULT_DATA.info, parsed.info);
        if (merged.info.whatsapp === '0812-2555-5858') {
          merged.info.whatsapp = DEFAULT_DATA.info.whatsapp;
          merged.info.whatsappNumber = DEFAULT_DATA.info.whatsappNumber;
        }
        if (!merged.info.whatsappMalam) {
          merged.info.whatsappMalam = DEFAULT_DATA.info.whatsappMalam;
          merged.info.whatsappMalamNumber = DEFAULT_DATA.info.whatsappMalamNumber;
        }
      }
      if (!merged.organization || !merged.organization.members || merged.organization.members.length === 0) {
        merged.organization = clone(DEFAULT_DATA.organization);
      }
      if (merged.materials && Array.isArray(merged.materials)) {
        // Bersihkan materi dummy bawaan (mat-1 s/d mat-5) jika sebelumnya ada di localStorage
        merged.materials = merged.materials.filter(function (m) {
          return m.id !== 'mat-1' && m.id !== 'mat-2' && m.id !== 'mat-3' && m.id !== 'mat-4' && m.id !== 'mat-5';
        });
      } else {
        merged.materials = [];
      }
      if (!merged.gallery || merged.gallery.length === 0) {
        merged.gallery = clone(DEFAULT_DATA.gallery);
      } else {
        // Hapus contoh pawai jika tersimpan sebelumnya di localStorage
        merged.gallery = merged.gallery.filter(function (g) {
          return g.id !== 'gal-pawai' && (!g.title || g.title.toLowerCase().indexOf('pawai') === -1) && (!g.image || g.image.indexOf('pawai') === -1);
        });
      }
      // Pastikan keselarasan ID kegiatan kajian untuk materi
      if (merged.activities && merged.activities.length > 0) {
        merged.activities.forEach(function (act) {
          if (act.title && act.title.indexOf('Tarjih') !== -1) {
            act.id = 'act-tarjih';
          } else if (act.title && act.title.indexOf('Tahsin') !== -1) {
            act.id = 'act-tahsin';
          } else if (act.title && act.title.indexOf('Ahad Pagi') !== -1) {
            act.id = 'act-1';
          }
          // Sinkronisasi data kegiatan santunan ke program orang tua asuh resmi
          if (act.category === 'santunan' || act.id === 'act-6' || (act.image && act.image.indexOf('poster-santunan') !== -1)) {
            act.title = 'Program Orang Tua Asuh (Santunan 140 Yatim & Dhuafa)';
            act.image = 'images/program-orang-tua-asuh.jpg';
            act.date = 'Rutin setiap bulan';
            act.time = 'Penyaluran Tiap Bulan';
            act.location = 'Panti Asuhan Yatim & Dhuafa Muhammadiyah (PAYDM) Syukur, Gladagsari';
            act.description = 'Program santunan rutin bulanan bagi 140 anak yatim dan dhuafa binaan PAYDM Syukur di Kalitengah, Gladagsari. Pilihan paket donasi bulanan Rp 50rb, Rp 100rb, Rp 150rb, tak terhingga, dan donasi beras (min. 1 kg). Rekening Bank BRI: 6648-01-032765-53-7 an. MUHAMMADIYAH SYUKUR.';
          }
        });
      }
      // Sinkronisasi pengumuman santunan
      if (merged.announcements && merged.announcements.length > 0) {
        merged.announcements.forEach(function (ann) {
          if (ann.id === 'ann-3' || (ann.title && ann.title.indexOf('Santunan') !== -1)) {
            ann.title = 'Program Orang Tua Asuh: Santunan Rutin 140 Anak Yatim & Dhuafa';
            ann.image = 'images/program-orang-tua-asuh.jpg';
            ann.tag = 'Santunan Yatim';
            ann.content = 'Mari raih naungan surga bersama Rasulullah SAW dengan menjadi Orang Tua Asuh bagi 140 anak yatim dan dhuafa binaan PAYDM Syukur Gladagsari. Pilihan paket donasi bulanan Rp 50.000, Rp 100.000, Rp 150.000, tak terhingga, serta sedekah beras (min. 1 kg). Rekening BRI: 6648-01-032765-53-7 an. MUHAMMADIYAH SYUKUR (Konfirmasi: Bu Nur Chasanah 0822-2106-1314 / Maria Ulfa 0858-0327-3774).';
          }
        });
      }
      // Sinkronisasi rekening BRI Santunan
      if (merged.donations && merged.donations.banks) {
        var hasBri = merged.donations.banks.some(function (b) {
          return b.id === 'bank-bri-santunan' || (b.number && b.number.replace(/\D/g, '') === '664801032765537');
        });
        if (!hasBri) {
          merged.donations.banks.unshift({
            id: 'bank-bri-santunan',
            name: 'Bank BRI (Khusus Santunan 140 Yatim & Dhuafa)',
            number: '6648-01-032765-53-7',
            cleanNumber: '664801032765537',
            owner: 'Unit Gladagsari Boyolali an. MUHAMMADIYAH SYUKUR'
          });
        }
      }
      // Sinkronisasi data laporan keuangan resmi (September & Oktober 2026)
      if (!merged.finances || !merged.finances['2026-10'] || (merged.finances['2026-09'] && merged.finances['2026-09'].saldoAwal === 28500000)) {
        merged.finances = clone(DEFAULT_DATA.finances);
      }
      return merged;
    } catch (e) {
      console.warn('Gagal membaca database dari localStorage, menggunakan default:', e);
      return clone(DEFAULT_DATA);
    }
  }

  function saveDatabase(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Gagal menyimpan ke localStorage:', e);
      return false;
    }
  }

  // Generate unique ID
  function genId(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
  }

  // API Eksternal
  var MasjidDB = {
    // Membaca seluruh data
    getAll: function () {
      return loadDatabase();
    },

    // Reset ke data awal pabrik
    reset: function () {
      saveDatabase(DEFAULT_DATA);
      return clone(DEFAULT_DATA);
    },

    // Ekspor format JSON String
    exportJSON: function () {
      return JSON.stringify(loadDatabase(), null, 2);
    },

    // Impor JSON String
    importJSON: function (jsonString) {
      try {
        var parsed = JSON.parse(jsonString);
        if (!parsed.adminUser || !parsed.prayerTimes) {
          throw new Error('Format data tidak sesuai skema MasjidDB.');
        }
        saveDatabase(parsed);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },

    /* ==========================================================
       AUTENTIKASI ADMIN
       ========================================================== */
    login: function (username, password, remember) {
      var db = loadDatabase();
      var user = db.adminUser || DEFAULT_DATA.adminUser;

      if (username.trim() === user.username && password.trim() === user.password) {
        var session = {
          user: user.username,
          displayName: user.displayName || 'Administrator',
          token: 'token_' + Date.now(),
          loginTime: new Date().toISOString()
        };
        if (remember) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } else {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
        return { success: true, session: session };
      }
      return { success: false, message: 'Username atau password salah!' };
    },

    isLoggedIn: function () {
      var sess = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (!sess) return false;
      try {
        var data = JSON.parse(sess);
        return !!(data && data.token);
      } catch (e) {
        return false;
      }
    },

    getCurrentSession: function () {
      var sess = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
      if (!sess) return null;
      try { return JSON.parse(sess); } catch (e) { return null; }
    },

    logout: function () {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
      return true;
    },

    updateAdminCredentials: function (currentPassword, newUsername, newPassword, displayName) {
      var db = loadDatabase();
      if (currentPassword !== db.adminUser.password) {
        return { success: false, message: 'Password saat ini tidak cocok!' };
      }
      if (newUsername && newUsername.trim()) {
        db.adminUser.username = newUsername.trim();
      }
      if (newPassword && newPassword.trim()) {
        db.adminUser.password = newPassword.trim();
      }
      if (displayName && displayName.trim()) {
        db.adminUser.displayName = displayName.trim();
      }
      saveDatabase(db);
      return { success: true, message: 'Kredensial admin berhasil diperbarui!' };
    },

    /* ==========================================================
       INFORMASI MASJID
       ========================================================== */
    getInfo: function () {
      return loadDatabase().info || DEFAULT_DATA.info;
    },
    updateInfo: function (newInfo) {
      var db = loadDatabase();
      db.info = Object.assign({}, db.info, newInfo);
      saveDatabase(db);
      return db.info;
    },

    /* ==========================================================
       JADWAL SALAT
       ========================================================== */
    getPrayerTimes: function () {
      return loadDatabase().prayerTimes || DEFAULT_DATA.prayerTimes;
    },
    updatePrayerTimes: function (newTimes) {
      var db = loadDatabase();
      db.prayerTimes = newTimes;
      saveDatabase(db);
      return db.prayerTimes;
    },

    /* ==========================================================
       PENGUMUMAN
       ========================================================== */
    getAnnouncements: function () {
      return loadDatabase().announcements || [];
    },
    addAnnouncement: function (ann) {
      var db = loadDatabase();
      ann.id = ann.id || genId('ann');
      if (!ann.date) {
        ann.date = new Date().toISOString().split('T')[0];
      }
      // Ekstrak hari dan singkatan bulan
      var d = new Date(ann.date);
      if (!isNaN(d.getTime())) {
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        ann.day = String(d.getDate()).padStart(2, '0');
        ann.month = months[d.getMonth()];
      }
      db.announcements.unshift(ann);
      saveDatabase(db);
      return ann;
    },
    updateAnnouncement: function (id, updated) {
      var db = loadDatabase();
      var idx = db.announcements.findIndex(function (a) { return a.id === id; });
      if (idx !== -1) {
        if (updated.date) {
          var d = new Date(updated.date);
          if (!isNaN(d.getTime())) {
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            updated.day = String(d.getDate()).padStart(2, '0');
            updated.month = months[d.getMonth()];
          }
        }
        db.announcements[idx] = Object.assign({}, db.announcements[idx], updated);
        saveDatabase(db);
        return db.announcements[idx];
      }
      return null;
    },
    deleteAnnouncement: function (id) {
      var db = loadDatabase();
      db.announcements = db.announcements.filter(function (a) { return a.id !== id; });
      saveDatabase(db);
      return true;
    },

    /* ==========================================================
       KEGIATAN / AGENDA
       ========================================================== */
    getActivities: function () {
      return loadDatabase().activities || [];
    },
    addActivity: function (act) {
      var db = loadDatabase();
      act.id = act.id || genId('act');
      db.activities.unshift(act);
      saveDatabase(db);
      return act;
    },
    updateActivity: function (id, updated) {
      var db = loadDatabase();
      var idx = db.activities.findIndex(function (a) { return a.id === id; });
      if (idx !== -1) {
        db.activities[idx] = Object.assign({}, db.activities[idx], updated);
        saveDatabase(db);
        return db.activities[idx];
      }
      return null;
    },
    deleteActivity: function (id) {
      var db = loadDatabase();
      db.activities = db.activities.filter(function (a) { return a.id !== id; });
      saveDatabase(db);
      return true;
    },

    /* ==========================================================
       LAPORAN KEUANGAN
       ========================================================== */
    getFinances: function () {
      return loadDatabase().finances || DEFAULT_DATA.finances;
    },
    getFinancePeriod: function (periodKey) {
      var fin = this.getFinances();
      return fin[periodKey] || null;
    },
    setFinancePeriod: function (periodKey, periodData) {
      var db = loadDatabase();
      if (!db.finances) db.finances = {};
      db.finances[periodKey] = periodData;
      saveDatabase(db);
      return db.finances[periodKey];
    },
    deleteFinancePeriod: function (periodKey) {
      var db = loadDatabase();
      if (db.finances && db.finances[periodKey]) {
        delete db.finances[periodKey];
        saveDatabase(db);
        return true;
      }
      return false;
    },
    addFinanceTransaction: function (periodKey, type, item) {
      // type: 'pemasukan' atau 'pengeluaran'
      var db = loadDatabase();
      if (!db.finances[periodKey]) return null;
      item.id = item.id || genId(type === 'pemasukan' ? 'in' : 'out');
      item.jumlah = Number(item.jumlah) || 0;
      db.finances[periodKey][type].push(item);
      saveDatabase(db);
      return item;
    },
    deleteFinanceTransaction: function (periodKey, type, itemId) {
      var db = loadDatabase();
      if (!db.finances[periodKey]) return false;
      db.finances[periodKey][type] = db.finances[periodKey][type].filter(function (it) {
        return it.id !== itemId;
      });
      saveDatabase(db);
      return true;
    },

    /* ==========================================================
       ARTIKEL & BERITA
       ========================================================== */
    getArticles: function () {
      return loadDatabase().articles || [];
    },
    addArticle: function (art) {
      var db = loadDatabase();
      art.id = art.id || genId('art');
      db.articles.unshift(art);
      saveDatabase(db);
      return art;
    },
    updateArticle: function (id, updated) {
      var db = loadDatabase();
      var idx = db.articles.findIndex(function (a) { return a.id === id; });
      if (idx !== -1) {
        db.articles[idx] = Object.assign({}, db.articles[idx], updated);
        saveDatabase(db);
        return db.articles[idx];
      }
      return null;
    },
    deleteArticle: function (id) {
      var db = loadDatabase();
      db.articles = db.articles.filter(function (a) { return a.id !== id; });
      saveDatabase(db);
      return true;
    },

    /* ==========================================================
       MATERI KAJIAN (DOKUMEN & MODUL)
       ========================================================== */
    getMaterials: function () {
      var db = loadDatabase();
      if (!db.materials) {
        db.materials = [];
      }
      return db.materials;
    },
    getMaterialsByActivity: function (activityId) {
      var all = this.getMaterials();
      var filtered = all.filter(function (m) {
        return m.activityId === activityId;
      });
      if (filtered.length > 0) return filtered;

      // Fallback jika ID berbeda (misal act-tarjih / act-1 / act-tahsin)
      var idLower = String(activityId || '').toLowerCase();
      return all.filter(function (m) {
        if (idLower.indexOf('ahad') !== -1 || idLower === 'act-1') {
          return m.activityId === 'act-1' || (m.title && m.title.toLowerCase().indexOf('ahad') !== -1);
        }
        if (idLower.indexOf('tarjih') !== -1 || idLower === 'act-tarjih') {
          return m.activityId === 'act-tarjih' || (m.title && m.title.toLowerCase().indexOf('tarjih') !== -1);
        }
        if (idLower.indexOf('tahsin') !== -1 || idLower === 'act-tahsin') {
          return m.activityId === 'act-tahsin' || (m.title && m.title.toLowerCase().indexOf('tahsin') !== -1);
        }
        return false;
      });
    },
    addMaterial: function (mat) {
      var db = loadDatabase();
      mat.id = mat.id || genId('mat');
      if (!db.materials) db.materials = [];
      db.materials.unshift(mat);
      saveDatabase(db);
      return mat;
    },
    updateMaterial: function (id, updated) {
      var db = loadDatabase();
      if (!db.materials) db.materials = [];
      var idx = db.materials.findIndex(function (m) { return m.id === id; });
      if (idx !== -1) {
        db.materials[idx] = Object.assign({}, db.materials[idx], updated);
        saveDatabase(db);
        return db.materials[idx];
      }
      return null;
    },
    deleteMaterial: function (id) {
      var db = loadDatabase();
      if (!db.materials) return true;
      db.materials = db.materials.filter(function (m) { return m.id !== id; });
      saveDatabase(db);
      return true;
    },

    /* ==========================================================
       DONASI & REKENING
       ========================================================== */
    getDonations: function () {
      return loadDatabase().donations || DEFAULT_DATA.donations;
    },
    updateDonations: function (newDonations) {
      var db = loadDatabase();
      db.donations = Object.assign({}, db.donations, newDonations);
      saveDatabase(db);
      return db.donations;
    },

    /* ==========================================================
       KOTAK MASUK (PESAN JAMAAH)
       ========================================================== */
    getMessages: function () {
      return loadDatabase().messages || [];
    },
    addMessage: function (msg) {
      var db = loadDatabase();
      if (!db.messages) db.messages = [];
      msg.id = msg.id || genId('msg');
      var now = new Date();
      msg.waktu = now.toISOString().replace('T', ' ').substring(0, 16);
      msg.dibaca = false;
      db.messages.unshift(msg);
      saveDatabase(db);
      return msg;
    },
    markMessageRead: function (id, isRead) {
      var db = loadDatabase();
      var msg = (db.messages || []).find(function (m) { return m.id === id; });
      if (msg) {
        msg.dibaca = isRead !== false;
        saveDatabase(db);
        return true;
      }
      return false;
    },
    deleteMessage: function (id) {
      var db = loadDatabase();
      db.messages = (db.messages || []).filter(function (m) { return m.id !== id; });
      saveDatabase(db);
      return true;
    },

    /* ==========================================================
       STRUKTUR ORGANISASI TAKMIR
       ========================================================== */
    getOrganization: function () {
      var db = loadDatabase();
      return db.organization || DEFAULT_DATA.organization;
    },

    updateOrganizationMeta: function (meta) {
      var db = loadDatabase();
      if (!db.organization) db.organization = clone(DEFAULT_DATA.organization);
      db.organization.meta = Object.assign({}, db.organization.meta, meta);
      saveDatabase(db);
      return db.organization.meta;
    },

    getMembers: function (filterCategory) {
      var org = this.getOrganization();
      var list = (org && org.members) || [];
      if (!filterCategory || filterCategory === 'semua') {
        return list;
      }
      return list.filter(function (m) {
        return m.category === filterCategory;
      });
    },

    addMember: function (member) {
      var db = loadDatabase();
      if (!db.organization) db.organization = clone(DEFAULT_DATA.organization);
      if (!db.organization.members) db.organization.members = [];
      member.id = member.id || genId('org');
      db.organization.members.push(member);
      // Jika ada kategori baru yang belum terdaftar di categories, tambahkan juga
      if (member.category && db.organization.categories && db.organization.categories.indexOf(member.category) === -1) {
        db.organization.categories.push(member.category);
      }
      saveDatabase(db);
      return member;
    },

    updateMember: function (id, updated) {
      var db = loadDatabase();
      if (!db.organization || !db.organization.members) return null;
      var idx = db.organization.members.findIndex(function (m) { return m.id === id; });
      if (idx !== -1) {
        db.organization.members[idx] = Object.assign({}, db.organization.members[idx], updated);
        if (updated.category && db.organization.categories && db.organization.categories.indexOf(updated.category) === -1) {
          db.organization.categories.push(updated.category);
        }
        saveDatabase(db);
        return db.organization.members[idx];
      }
      return null;
    },

    deleteMember: function (id) {
      var db = loadDatabase();
      if (!db.organization || !db.organization.members) return false;
      db.organization.members = db.organization.members.filter(function (m) { return m.id !== id; });
      saveDatabase(db);
      return true;
    },

    /* ==========================================================
       GALERI DOKUMENTASI
       ========================================================== */
    getGallery: function (filterCategory) {
      var list = loadDatabase().gallery || DEFAULT_DATA.gallery;
      if (!filterCategory || filterCategory === 'semua') {
        return list;
      }
      return list.filter(function (item) {
        return item.category === filterCategory;
      });
    },

    addGalleryItem: function (item) {
      var db = loadDatabase();
      if (!db.gallery) db.gallery = clone(DEFAULT_DATA.gallery);
      item.id = item.id || genId('gal');
      if (!item.date) {
        item.date = new Date().toISOString().split('T')[0];
      }
      db.gallery.unshift(item);
      saveDatabase(db);
      return item;
    },

    updateGalleryItem: function (id, updated) {
      var db = loadDatabase();
      if (!db.gallery) db.gallery = clone(DEFAULT_DATA.gallery);
      var idx = db.gallery.findIndex(function (g) { return g.id === id; });
      if (idx !== -1) {
        db.gallery[idx] = Object.assign({}, db.gallery[idx], updated);
        saveDatabase(db);
        return db.gallery[idx];
      }
      return null;
    },

    deleteGalleryItem: function (id) {
      var db = loadDatabase();
      if (!db.gallery) return true;
      db.gallery = db.gallery.filter(function (g) { return g.id !== id; });
      saveDatabase(db);
      return true;
    }
  };

  // Pastikan inisialisasi awal saat pertama kali dimuat
  loadDatabase();

  return MasjidDB;
});
