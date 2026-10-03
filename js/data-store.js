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

  var STORAGE_KEY = 'masjid_syukur_db_v3';
  var SESSION_KEY = 'masjid_admin_session_v1';

  // Data awal default (Masjid Syukur Ampel Boyolali)
  var DEFAULT_DATA = {
    info: {
      nama: 'Masjid Syukur Ampel',
      tagline: 'Masjid Ramah Musafir 24 Jam di Jalur Solo–Semarang',
      alamat: 'Jl. Raya Boyolali - Semarang No.141, Dusun 2, Kaligentong, Kec. Ampel, Kabupaten Boyolali, Jawa Tengah 57352',
      whatsapp: '0812-2555-5858',
      whatsappNumber: '6281225555858',
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
        image: 'images/pengumuman-1.svg'
      },
      {
        id: 'ann-3',
        date: '2026-10-10',
        day: '10',
        month: 'Okt',
        tag: 'Sosial',
        isUrgent: false,
        title: 'Penyaluran Santunan Yatim & Kaum Dhuafa Wilayah Ampel',
        content: 'Alhamdulillah, amanah zakat, infak, dan sedekah jamaah disalurkan untuk santunan pendidikan anak yatim dan bantuan kebutuhan pokok kaum dhuafa binaan PCM Ampel.',
        image: ''
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
        categoryLabel: 'Kajian',
        date: 'Ahad setiap pekan',
        time: '06:00 - 07:30 WIB',
        location: 'Ruang utama Masjid Syukur Ampel',
        description: 'Kajian tematik tafsir dan akhlak bersama ustaz kompeten. Terbuka untuk jamaah putra dan putri, dilanjutkan hidangan sarapan pagi bersama.',
        image: 'images/poster-kajian.svg'
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
        image: 'images/poster-sosial.svg'
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
        image: 'images/poster-jumat.svg'
      },
      {
        id: 'act-4',
        title: 'Shalat Jumat Berjamaah & Khutbah Mingguan',
        category: 'jumat',
        categoryLabel: 'Shalat Jumat',
        date: 'Jumat setiap pekan',
        time: '11:40 WIB s.d. selesai',
        location: 'Ruang utama, selasar, & aula PCM',
        description: 'Ibadah Shalat Jumat berjamaah bagi warga sekitar dan para musafir yang sedang melintas di jalan arteri Solo–Semarang.',
        image: 'images/poster-jumat.svg'
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
        title: 'Santunan Rutin Yatim & Dhuafa Ampel',
        category: 'santunan',
        categoryLabel: 'Santunan',
        date: 'Pekan pertama tiap bulan',
        time: '09:00 - 11:30 WIB',
        location: 'Kompleks Masjid Syukur & PCM Ampel',
        description: 'Penyaluran dana infak, sedekah, dan kurban untuk santunan tunai serta paket sembako bagi keluarga prasejahtera binaan Boyolali.',
        image: 'images/poster-santunan.svg'
      }
    ],

    finances: {
      '2026-09': {
        label: 'September 2026',
        saldoAwal: 28500000,
        pemasukan: [
          { id: 'in-1', tgl: '04 Sep 2026', ket: 'Kotak Infak Musafir & Jamaah Pekan 1', jumlah: 3850000 },
          { id: 'in-2', tgl: '11 Sep 2026', ket: 'Infak Jumat & Donasi Musafir Pekan 2', jumlah: 4210000 },
          { id: 'in-3', tgl: '13 Sep 2026', ket: 'Transfer Donasi Operasional Ramah Musafir', jumlah: 5000000 },
          { id: 'in-4', tgl: '18 Sep 2026', ket: 'Infak Jumat & Kajian Ahad Pagi', jumlah: 3740000 },
          { id: 'in-5', tgl: '21 Sep 2026', ket: 'Sedekah Jamaah & Kotak Kopi Musafir', jumlah: 2150000 }
        ],
        pengeluaran: [
          { id: 'out-1', tgl: '02 Sep 2026', ket: 'Kopi, teh, gula, & air galon gratis musafir', jumlah: 1650000 },
          { id: 'out-2', tgl: '05 Sep 2026', ket: 'Honor petugas kebersihan 24 jam & wudhu', jumlah: 2000000 },
          { id: 'out-3', tgl: '10 Sep 2026', ket: 'Konsumsi sarapan Kajian Ahad Pagi', jumlah: 1250000 },
          { id: 'out-4', tgl: '15 Sep 2026', ket: 'Listrik, air PDAM, & langganan Wi-Fi musafir', jumlah: 2450000 },
          { id: 'out-5', tgl: '20 Sep 2026', ket: 'Perawatan kasur rehat & sabun pembersih wudhu', jumlah: 680000 }
        ]
      },
      '2026-08': {
        label: 'Agustus 2026',
        saldoAwal: 21400000,
        pemasukan: [
          { id: 'in-10', tgl: '07 Agu 2026', ket: 'Infak Jumat pekan 1', jumlah: 3200000 },
          { id: 'in-11', tgl: '14 Agu 2026', ket: 'Infak Jumat & kotak musafir', jumlah: 3640000 },
          { id: 'in-12', tgl: '21 Agu 2026', ket: 'Infak Kajian Ahad Pagi', jumlah: 2890000 },
          { id: 'in-13', tgl: '28 Agu 2026', ket: 'Infak Jumat pekan 4', jumlah: 3460000 },
          { id: 'in-14', tgl: '30 Agu 2026', ket: 'Donasi transfer rekening', jumlah: 3500000 }
        ],
        pengeluaran: [
          { id: 'out-10', tgl: '03 Agu 2026', ket: 'Logistik kopi, teh, & air galon musafir', jumlah: 1550000 },
          { id: 'out-11', tgl: '05 Agu 2026', ket: 'Honor petugas kebersihan', jumlah: 2000000 },
          { id: 'out-12', tgl: '17 Agu 2026', ket: 'Kegiatan dakwah & pengajian warga', jumlah: 1450000 },
          { id: 'out-13', tgl: '24 Agu 2026', ket: 'Perbaikan instalasi keran wudhu & kamar mandi', jumlah: 920000 }
        ]
      }
    },

    articles: [
      {
        id: 'art-1',
        title: 'Masjid Syukur Ampel: Oase Ramah Musafir 24 Jam di Jalur Solo–Semarang',
        category: 'Profil & Karakteristik',
        author: 'Takmir Masjid Syukur',
        date: 'Senin, 28 September 2026',
        datetime: '2026-09-28',
        image: 'images/artikel-1.svg',
        excerpt: 'Dikenal dengan cat biru ikonik di tepi jalan arteri Boyolali-Semarang, Masjid Syukur melayani musafir 24 jam dengan fasilitas kopi hangat, Wi-Fi, dan tempat tidur gratis.',
        fullText: 'Bagi pengendara yang kerap melintasi jalur utama Solo–Semarang non-tol, bangunan megah dengan balutan cat biru mencolok di Dusun Kaligentong, Kecamatan Ampel, Boyolali ini tentu sudah tidak asing lagi. Masjid Syukur bukan sekadar rumah ibadah biasa, melainkan bertransformasi menjadi rest area non-tol yang memuliakan setiap musafir.\n\nMasjid ini berada di bawah naungan Pimpinan Daerah Muhammadiyah (PDM) Boyolali dan satu kompleks dengan PCM Ampel dan Gladagsari. Mengusung konsep keterbukaan penuh 24 jam, takmir berpegang teguh pada prinsip bahwa rumah Allah harus selalu terbuka untuk siapa saja yang ingin bersujud maupun merebahkan badan sejenak demi melepas lelah.\n\nTakmir secara berkelanjutan menyediakan kopi, teh, dan air galon secara gratis, jaringan internet nirkabel (Wi-Fi), serta alas tidur berupa karpet dan kasur yang higienis. Fasilitas sanitasi dan wudhu selalu dipelihara dalam kondisi prima agar para musafir kembali segar dan bertenaga melanjutkan perjalanan.'
      },
      {
        id: 'art-2',
        title: 'Mengadopsi Spirit Jogokariyan: Masjid Makmur yang Memakmurkan Jamaah',
        category: 'Manajemen Masjid',
        author: 'Pengurus PCM Ampel',
        date: 'Jumat, 18 September 2026',
        datetime: '2026-09-18',
        image: 'images/artikel-2.svg',
        excerpt: 'Bagaimana takmir Masjid Syukur terinspirasi oleh pengelolaan Masjid Jogokariyan Yogyakarta dalam melayani umat dan menghidupkan masjid siang-malam.',
        fullText: 'Pola tata kelola dan pelayanan di Masjid Syukur Ampel berkiblat langsung pada keberhasilan Masjid Jogokariyan Yogyakarta. Prinsip utamanya: infak jamaah tidak ditumpuk menjadi saldo mengendap di bank, melainkan dioptimalkan secepat mungkin untuk kemaslahatan dan pelayanan nyata.\n\nDengan memanjakan jamaah melalui fasilitas cuma-cuma, masjid menjadi magnet yang dicintai masyarakat sekitar dan para pemuda. Dakwah modern melalui Wi-Fi gratis dan ruang berkumpul yang positif berhasil merangkul generasi milenial dan Gen-Z untuk akrab dengan masjid.\n\nSetiap rupiah yang diinfakkan oleh para donatur berputar menjadi cangkir kopi para musafir yang mengantuk, kenyamanan kasur bagi mereka yang letih di jalan, serta beasiswa dan santunan anak yatim.'
      },
      {
        id: 'art-3',
        title: 'Adab dan Keutamaan Beristirahat di Masjid bagi Para Musafir',
        category: 'Artikel Keislaman',
        author: 'Ustaz Pembina Takmir',
        date: 'Ahad, 13 September 2026',
        datetime: '2026-09-13',
        image: 'images/artikel-3.svg',
        excerpt: 'Panduan fiqih dan etika bagi musafir yang memanfaatkan fasilitas masjid untuk shalat jamak/qashar dan istirahat sejenak.',
        fullText: 'Islam adalah agama yang memberikan banyak kemudahan (rukhshah) bagi musafir, termasuk shalat jamak dan qashar serta hak mendapatkan perlindungan dan tempat singgah yang aman.\n\nSaat beristirahat di Masjid Syukur, jamaah dianjurkan tetap menjaga kesucian tempat shalat, meletakkan alas kaki pada tempat yang ditentukan, serta menggunakan fasilitas air dan listrik secara bijak. Tidur di area selasar atau ruang istirahat yang telah disediakan takmir memungkinkan kenyamanan bersama tetap terpelihara.\n\nTak lupa, selipkan doa kebaikan untuk para pengurus, donatur, dan relawan yang telah ikhlas mewakafkan tenaga demi melayani tamu-tamu Allah 24 jam sehari.'
      }
    ],

    donations: {
      banks: [
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
      notes: 'Donasi Anda disalurkan langsung untuk operasional layanan musafir 24 jam (kopi/teh/air gratis, kebersihan toilet & wudhu), santunan yatim dhuafa, dan kegiatan syiar dakwah. Konfirmasikan transfer via WhatsApp takmir.'
    },

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
    }
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
      // pastikan field-field penting selalu ada jika skema diupdate
      var merged = Object.assign({}, DEFAULT_DATA, parsed);
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
    }
  };

  // Pastikan inisialisasi awal saat pertama kali dimuat
  loadDatabase();

  return MasjidDB;
});
