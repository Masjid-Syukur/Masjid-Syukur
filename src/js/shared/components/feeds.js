/* ==========================================================
   js/shared/components/feeds.js — Feed berita nasional & persyarikatan.
   Dipakai halaman beranda (3 terbaru) dan artikel (lengkap).
   Sumber: feed2json + cache localStorage, dengan data cadangan.
   ========================================================== */
import { escapeHtml } from '../utils/dom.js';

export function initNationalFeeds() {
  var feedContainer = document.getElementById('national-feed-container');
  var homeContainer = document.getElementById('home-national-feed-container');
  var loadingEl = document.getElementById('national-feed-loading');

  if (!feedContainer && !homeContainer) return;

  // Peta URL gambar terverifikasi untuk setiap tautan berita resmi pusat
  var KNOWN_PUSAT_IMAGES = {
    'https://muhammadiyah.or.id/2026/10/begini-tiga-fungsi-musibah-bagi-orang-beriman/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/08/kumpulan-doa-sehari-hari.jpeg',
    'https://muhammadiyah.or.id/2026/10/muhammadiyah-siapkan-teknologi-desalinasi-untuk-penuhi-kebutuhan-air-minum-warga-kampung-akuarium/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/muhammadiyah-siapkan-teknologi-desalinasi-untuk-penuhi-kebutuhan-air-minum-warga-kampung-akuarium.jpeg',
    'https://muhammadiyah.or.id/2026/10/aisyiyah-hadirkan-rumah-oksigen-untuk-lindungi-balita-terdampak-karhutla-di-kalbar/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/aisyiyah-hadirkan-rumah-oksigen-untuk-lindungi-balita-terdampak-karhutla-di-kalbar.jpeg',
    'https://muhammadiyah.or.id/2026/10/muhammadiyah-hadirkan-layanan-kanker-berteknologi-modern-di-rs-unimus/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/muhammadiyah-hadirkan-layanan-kanker-berteknologi-modern-di-rs-unimus.jpeg',
    'https://muhammadiyah.or.id/2026/10/lewat-persahabatan-lintas-budaya-pcim-hungaria-kenalkan-islam-berkemajuan-di-eropa/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/lewat-persahabatan-lintas-budaya-pcim-hungaria-kenalkan-islam-berkemajuan-di-eropa.jpeg',
    'https://muhammadiyah.or.id/2026/10/agus-taufiqurrahman-tekankan-sinergi-dan-kolaborasi-untuk-sukseskan-tanwir-muhammadiyah-2026/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/agus-taufiqurrahman-tekankan-sinergi-dan-kolaborasi-untuk-sukseskan-tanwir-muhammadiyah-2026.jpeg',
    'https://muhammadiyah.or.id/2026/10/muhammadiyah-jadi-rujukan-penguatan-tata-kelola-dan-pemberdayaan-umat/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/muhammadiyah-jadi-rujukan-penguatan-tata-kelola-dan-pemberdayaan-umat.jpeg',
    'https://muhammadiyah.or.id/2026/10/muhadjir-effendy-jadikan-tahajud-sebagai-ciri-khas-kader-muhammadiyah/': 'https://muhammadiyah.or.id/wp-content/uploads/2024/05/20230402110357_IMG_0230.jpg',
    'https://muhammadiyah.or.id/2026/10/kemajuan-umat-dimulai-dari-pengamalan-ajaran-islam/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/kemajuan-umat-dimulai-dari-pengamalan-ajaran-islam.jpeg',
    'https://muhammadiyah.or.id/2026/10/kisah-ummu-salamah-mengajarkan-husnuzan-kepada-allah-saat-menghadapi-musibah/': 'https://muhammadiyah.or.id/wp-content/uploads/2025/09/Doa-untuk-Meredakan-Kecemasan-dan-Stres-Berdasarkan-Sunah-Nabi-Saw.webp',
    'https://muhammadiyah.or.id/2026/10/jelang-tanwir-dan-milad-ke-114-muhammadiyah-siapkan-lo-yang-solid-dan-profesional/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/jelang-tanwir-dan-milad-ke-114-muhammadiyah-siapkan-lo-yang-solid-dan-profesional.jpeg',
    'https://muhammadiyah.or.id/2026/10/perkuat-kesehatan-mental-dengan-membiasakan-diri-bersyukur/': 'https://muhammadiyah.or.id/wp-content/uploads/2024/09/kesehatan-mental.jpg',
    'https://muhammadiyah.or.id/2026/10/lindungi-generasi-muda-muhammadiyah-tegaskan-kebijakan-bebas-rokok/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/02/muhammadiyah-tegaskan-merokok-haram-dan-membatalkan-puasa.jpeg',
    'https://muhammadiyah.or.id/2026/10/perkuat-dakwah-diaspora-pcim-arab-saudi-dan-britania-raya-bahas-kolaborasi-umrah-transit/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/perkuat-dakwah-diaspora-pcim-arab-saudi-dan-britania-raya-bahas-kolaborasi-umrah-transit.jpeg',
    'https://muhammadiyah.or.id/2026/10/dpp-imm-tetapkan-kalimantan-selatan-tuan-rumah-muktamar-xxi/': 'https://muhammadiyah.or.id/wp-content/uploads/2024/08/imm-jateng.png',
    'https://muhammadiyah.or.id/2026/10/haedar-nashir-ungkap-tiga-kunci-penguatan-ekonomi-umat/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/haedar-nashir-ungkap-tiga-kunci-penguatan-ekonomi-umat.jpeg',
    'https://muhammadiyah.or.id/2026/10/syamsi-ali-ajak-warga-muhammadiyah-perkuat-dakwah-global-berbasis-ilmu-dan-akhlak/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/syamsi-ali-ajak-warga-muhammadiyah-perkuat-dakwah-global-berbasis-ilmu-dan-akhlak.jpeg',
    'https://muhammadiyah.or.id/2026/10/gubernur-sulteng-siap-kerahkan-jajaran-pemprov-untuk-sukseskan-tanwir-muhammadiyah/': 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/gubernur-sulteng-siap-kerahkan-jajaran-pemprov-untuk-sukseskan-tanwir-muhammadiyah.jpeg'
  };

  // Koleksi 18 berita resmi dari pusat dengan masing-masing gambar unik dan terverifikasi
  var fallbackFeeds = [
    {
      title: 'Begini Tiga Fungsi Musibah bagi Orang Beriman',
      source: 'Majelis Tarjih',
      date: '20 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/begini-tiga-fungsi-musibah-bagi-orang-beriman/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/08/kumpulan-doa-sehari-hari.jpeg',
      snippet: 'Ujian hidup hadir bukan semata beban, melainkan sebagai media pengampunan dosa, peningkatan derajat spiritual, dan sarana muhasabah diri bagi setiap muslim.'
    },
    {
      title: 'Muhammadiyah Siapkan Teknologi Desalinasi untuk Penuhi Kebutuhan Air Minum Warga Kampung Akuarium',
      source: 'PP Muhammadiyah',
      date: '20 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/muhammadiyah-siapkan-teknologi-desalinasi-untuk-penuhi-kebutuhan-air-minum-warga-kampung-akuarium/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/muhammadiyah-siapkan-teknologi-desalinasi-untuk-penuhi-kebutuhan-air-minum-warga-kampung-akuarium.jpeg',
      snippet: 'Penerapan teknologi pengolahan air laut menjadi air tawar higienis dihadirkan persyarikatan guna memperluas akses sanitasi bersih bagi masyarakat pesisir.'
    },
    {
      title: '‘Aisyiyah Hadirkan Rumah Oksigen untuk Lindungi Balita Terdampak Karhutla di Kalbar',
      source: 'Aisyiyah Pusat',
      date: '20 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/aisyiyah-hadirkan-rumah-oksigen-untuk-lindungi-balita-terdampak-karhutla-di-kalbar/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/aisyiyah-hadirkan-rumah-oksigen-untuk-lindungi-balita-terdampak-karhutla-di-kalbar.jpeg',
      snippet: 'Pimpinan Pusat ‘Aisyiyah bergerak cepat menyediakan bilik ramah anak dan fasilitas oksigen gratis untuk menjaga pernapasan balita di wilayah terdampak kabut asap.'
    },
    {
      title: 'Muhammadiyah Hadirkan Layanan Kanker Berteknologi Modern di RS UNIMUS',
      source: 'Kesehatan Umat',
      date: '20 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/muhammadiyah-hadirkan-layanan-kanker-berteknologi-modern-di-rs-unimus/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/muhammadiyah-hadirkan-layanan-kanker-berteknologi-modern-di-rs-unimus.jpeg',
      snippet: 'Perkembangan teknologi medis di era modern merevolusi standar perawatan pasien. Semangat transformasi itulah yang menjadi pijakan dalam peresmian layanan RS Unimus Cancer Care.'
    },
    {
      title: 'Lewat Persahabatan Lintas Budaya, PCIM Hungaria Kenalkan Islam Berkemajuan di Eropa',
      source: 'Dakwah Global',
      date: '20 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/lewat-persahabatan-lintas-budaya-pcim-hungaria-kenalkan-islam-berkemajuan-di-eropa/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/lewat-persahabatan-lintas-budaya-pcim-hungaria-kenalkan-islam-berkemajuan-di-eropa.jpeg',
      snippet: 'Pimpinan Cabang Istimewa Muhammadiyah Hungaria aktif mengenalkan nilai-nilai Islam berkemajuan yang damai, santun, dan inklusif kepada masyarakat internasional di Eropa.'
    },
    {
      title: 'Agus Taufiqurrahman Tekankan Sinergi dan Kolaborasi untuk Sukseskan Tanwir Muhammadiyah 2026',
      source: 'PP Muhammadiyah',
      date: '19 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/agus-taufiqurrahman-tekankan-sinergi-dan-kolaborasi-untuk-sukseskan-tanwir-muhammadiyah-2026/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/agus-taufiqurrahman-tekankan-sinergi-dan-kolaborasi-untuk-sukseskan-tanwir-muhammadiyah-2026.jpeg',
      snippet: 'Ketua Pimpinan Pusat Muhammadiyah Agus Taufiqurrahman menekankan pentingnya sinergi dan kolaborasi seluruh pihak untuk menyukseskan agenda Tanwir Muhammadiyah 2026 di Palu.'
    },
    {
      title: 'Muhammadiyah Jadi Rujukan Penguatan Tata Kelola dan Pemberdayaan Umat',
      source: 'Tata Kelola Umat',
      date: '19 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/muhammadiyah-jadi-rujukan-penguatan-tata-kelola-dan-pemberdayaan-umat/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/muhammadiyah-jadi-rujukan-penguatan-tata-kelola-dan-pemberdayaan-umat.jpeg',
      snippet: 'Keberhasilan persyarikatan mengelola ribuan amal usaha pendidikan, kesehatan, dan filantropi menjadikan Muhammadiyah rujukan penguatan tata kelola kelembagaan kemandirian umat.'
    },
    {
      title: 'Muhadjir Effendy: Jadikan Tahajud sebagai Ciri Khas Kader Muhammadiyah',
      source: 'Kader & Spiritual',
      date: '19 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/muhadjir-effendy-jadikan-tahajud-sebagai-ciri-khas-kader-muhammadiyah/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2024/05/20230402110357_IMG_0230.jpg',
      snippet: 'Ketua PP Muhammadiyah Muhadjir Effendy mengajak seluruh kader dan warga persyarikatan membiasakan qiyamul lail dan salat tahajud sebagai modal spiritual pergerakan.'
    },
    {
      title: 'Kemajuan Umat Dimulai dari Pengamalan Ajaran Islam',
      source: 'Wawasan Keislaman',
      date: '19 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/kemajuan-umat-dimulai-dari-pengamalan-ajaran-islam/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/kemajuan-umat-dimulai-dari-pengamalan-ajaran-islam.jpeg',
      snippet: 'Pengamalan nilai-nilai Islam secara murni dan berkemajuan menjadi fondasi utama lahirnya peradaban umat yang unggul, mandiri, dan berdaya saing global.'
    },
    {
      title: 'Kisah Ummu Salamah Mengajarkan Husnuzan kepada Allah saat Menghadapi Musibah',
      source: 'Keluarga Sakinah',
      date: '19 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/kisah-ummu-salamah-mengajarkan-husnuzan-kepada-allah-saat-menghadapi-musibah/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2025/09/Doa-untuk-Meredakan-Kecemasan-dan-Stres-Berdasarkan-Sunah-Nabi-Saw.webp',
      snippet: 'Keteladanan Ummu Salamah dalam menjaga prasangka baik kepada Allah dan doa saat musibah menjadi inspirasi berharga bagi setiap muslim dalam menghadapi ujian hidup.'
    },
    {
      title: 'Jelang Tanwir dan Milad ke-114, Muhammadiyah Siapkan LO yang Solid dan Profesional',
      source: 'PP Muhammadiyah',
      date: '19 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/jelang-tanwir-dan-milad-ke-114-muhammadiyah-siapkan-lo-yang-solid-dan-profesional/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/jelang-tanwir-dan-milad-ke-114-muhammadiyah-siapkan-lo-yang-solid-dan-profesional.jpeg',
      snippet: 'Panitia Tanwir dan Resepsi Milad ke-114 Muhammadiyah menggelar pembekalan Liaison Officer (LO) guna memastikan pelayanan prima bagi seluruh utusan persyarikatan se-Indonesia.'
    },
    {
      title: 'Perkuat Kesehatan Mental dengan Membiasakan Diri Bersyukur',
      source: 'Majelis Tarjih',
      date: '19 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/perkuat-kesehatan-mental-dengan-membiasakan-diri-bersyukur/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2024/09/kesehatan-mental.jpg',
      snippet: 'Majelis Tarjih dan Tajdid mengajak umat Islam membudayakan rasa syukur dalam kehidupan sehari-hari sebagai benteng spiritual sekaligus terapi kesehatan mental.'
    },
    {
      title: 'Lindungi Generasi Muda, Muhammadiyah Tegaskan Kebijakan Bebas Rokok',
      source: 'Kesehatan Umat',
      date: '19 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/lindungi-generasi-muda-muhammadiyah-tegaskan-kebijakan-bebas-rokok/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/02/muhammadiyah-tegaskan-merokok-haram-dan-membatalkan-puasa.jpeg',
      snippet: 'Wakil Ketua Majelis Tarjih menegaskan komitmen kawasan tanpa rokok di seluruh institusi pendidikan dan kesehatan Muhammadiyah untuk melindungi generasi masa depan.'
    },
    {
      title: 'Perkuat Dakwah Diaspora, PCIM Arab Saudi dan Britania Raya Bahas Kolaborasi Umrah Transit',
      source: 'PCIM Internasional',
      date: '19 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/perkuat-dakwah-diaspora-pcim-arab-saudi-dan-britania-raya-bahas-kolaborasi-umrah-transit/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/perkuat-dakwah-diaspora-pcim-arab-saudi-dan-britania-raya-bahas-kolaborasi-umrah-transit.jpeg',
      snippet: 'Pimpinan Cabang Istimewa Muhammadiyah Arab Saudi dan PCIM Britania Raya menjajaki sinergi pelayanan ibadah umrah transit dan penguatan jaringan dakwah diaspora.'
    },
    {
      title: 'DPP IMM Tetapkan Kalimantan Selatan Tuan Rumah Muktamar XXI',
      source: 'Kabar Persyarikatan',
      date: '19 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/dpp-imm-tetapkan-kalimantan-selatan-tuan-rumah-muktamar-xxi/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2024/08/imm-jateng.png',
      snippet: 'Dewan Pimpinan Pusat Ikatan Mahasiswa Muhammadiyah resmi menetapkan DPD IMM Kalimantan Selatan sebagai tuan rumah perhelatan Muktamar XXI IMM tahun 2027.'
    },
    {
      title: 'Haedar Nashir Ungkap Tiga Kunci Penguatan Ekonomi Umat',
      source: 'Ekonomi Persyarikatan',
      date: '18 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/haedar-nashir-ungkap-tiga-kunci-penguatan-ekonomi-umat/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/haedar-nashir-ungkap-tiga-kunci-penguatan-ekonomi-umat.jpeg',
      snippet: 'Ketua Umum PP Muhammadiyah Haedar Nashir memaparkan tiga pilar strategis dalam membangkitkan kedaulatan ekonomi masyarakat melalui sinergi bisnis persyarikatan.'
    },
    {
      title: 'Syamsi Ali Ajak Warga Muhammadiyah Perkuat Dakwah Global Berbasis Ilmu dan Akhlak',
      source: 'Dakwah Global',
      date: '18 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/syamsi-ali-ajak-warga-muhammadiyah-perkuat-dakwah-global-berbasis-ilmu-dan-akhlak/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/syamsi-ali-ajak-warga-muhammadiyah-perkuat-dakwah-global-berbasis-ilmu-dan-akhlak.jpeg',
      snippet: 'Imam Islamic Center New York Shamsi Ali menekankan pentingnya penguasaan literasi dan keteladanan akhlak mulia dalam menyebarkan syiar Islam di kancah dunia.'
    },
    {
      title: 'Gubernur Sulteng Siap Kerahkan Jajaran Pemprov untuk Sukseskan Tanwir Muhammadiyah',
      source: 'PP Muhammadiyah',
      date: '18 Oktober 2026',
      link: 'https://muhammadiyah.or.id/2026/10/gubernur-sulteng-siap-kerahkan-jajaran-pemprov-untuk-sukseskan-tanwir-muhammadiyah/',
      image: 'https://muhammadiyah.or.id/wp-content/uploads/2026/10/gubernur-sulteng-siap-kerahkan-jajaran-pemprov-untuk-sukseskan-tanwir-muhammadiyah.jpeg',
      snippet: 'Pemerintah Provinsi Sulawesi Tengah menyatakan dukungan penuh dan siap mengerahkan seluruh jajaran untuk menyukseskan Tanwir Muhammadiyah di Palu.'
    }
  ];

  function resolveUniquePusatImage(it, idx) {
    var link = (it && (it.link || it.url)) ? (it.link || it.url) : '';
    // 1. Cek dari peta tautan yang sudah diverifikasi
    if (link && KNOWN_PUSAT_IMAGES[link]) {
      return KNOWN_PUSAT_IMAGES[link];
    }
    // 2. Jika item sudah memiliki URL gambar eksternal yang bukan gambar kembar default
    if (it && it.image && typeof it.image === 'string' && it.image.indexOf('http') === 0 && it.image.indexOf('images/') === -1) {
      return it.image;
    }
    // 3. Ekstrak otomatis dari struktur permalink WordPress resmi: YYYY/MM/slug.jpeg
    var m = link.match(/muhammadiyah\.or\.id\/(\d{4})\/(\d{2})\/([^\/]+)\//);
    if (m) {
      return 'https://muhammadiyah.or.id/wp-content/uploads/' + m[1] + '/' + m[2] + '/' + m[3] + '.jpeg';
    }
    // 4. Pilih dari koleksi variasi gambar resmi unik agar tidak pernah terjadi kartu kembar
    var poolIndex = (typeof idx === 'number') ? (idx % fallbackFeeds.length) : 0;
    return fallbackFeeds[poolIndex].image;
  }

  function renderFeedItems(items) {
    if (loadingEl) loadingEl.style.display = 'none';

    // Render untuk halaman Berita (artikel.html) - tampilkan seluruh koleksi lengkap
    if (feedContainer) {
      feedContainer.innerHTML = '';
      items.forEach(function (it, idx) {
        var card = document.createElement('article');
        card.className = 'feed-card reveal in-view';
        var actualImg = resolveUniquePusatImage(it, idx);
        card.innerHTML =
          '<div class="feed-card-thumb">' +
          '<a href="' + escapeHtml(it.link) + '" target="_blank" rel="noopener noreferrer" style="display:block; width:100%; height:100%;">' +
          '<img src="' + escapeHtml(actualImg) + '" alt="' + escapeHtml(it.title) + '" loading="lazy" referrerpolicy="no-referrer">' +
          '</a>' +
          '<span class="feed-source-badge">' + escapeHtml(it.source || 'Wawasan Islam') + '</span>' +
          '</div>' +
          '<div class="feed-card-body">' +
          '<div class="feed-meta">' +
          '<span>' + escapeHtml(it.date) + '</span>' +
          '</div>' +
          '<h3 class="feed-card-title"><a href="' + escapeHtml(it.link) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(it.title) + '</a></h3>' +
          '<p class="feed-card-excerpt">' + escapeHtml(it.snippet) + '</p>' +
          '<div class="feed-card-footer">' +
          '<a href="' + escapeHtml(it.link) + '" target="_blank" rel="noopener noreferrer" class="feed-read-link">Baca Berita Selengkapnya &rarr;</a>' +
          '</div>' +
          '</div>';
        feedContainer.appendChild(card);
      });
    }

    // Render untuk Beranda (index.html) - ambil 3 berita teratas terbaru
    if (homeContainer) {
      homeContainer.innerHTML = '';
      items.slice(0, 3).forEach(function (it, idx) {
        var card = document.createElement('article');
        card.className = 'feed-card reveal in-view';
        var actualImg = resolveUniquePusatImage(it, idx);
        card.innerHTML =
          '<div class="feed-card-thumb">' +
          '<a href="' + escapeHtml(it.link) + '" target="_blank" rel="noopener noreferrer" style="display:block; width:100%; height:100%;">' +
          '<img src="' + escapeHtml(actualImg) + '" alt="' + escapeHtml(it.title) + '" loading="lazy" referrerpolicy="no-referrer">' +
          '</a>' +
          '<span class="feed-source-badge">' + escapeHtml(it.source || 'Wawasan Islam') + '</span>' +
          '</div>' +
          '<div class="feed-card-body">' +
          '<div class="feed-meta">' +
          '<span>' + escapeHtml(it.date) + '</span>' +
          '</div>' +
          '<h3 class="feed-card-title"><a href="' + escapeHtml(it.link) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(it.title) + '</a></h3>' +
          '<p class="feed-card-excerpt">' + escapeHtml(it.snippet) + '</p>' +
          '<div class="feed-card-footer">' +
          '<a href="' + escapeHtml(it.link) + '" target="_blank" rel="noopener noreferrer" class="feed-read-link">Baca Selengkapnya &rarr;</a>' +
          '</div>' +
          '</div>';
        homeContainer.appendChild(card);
      });
    }
  }

  // 1. Bersihkan cache versi terdahulu yang sempat menyimpan gambar duplikat
  try {
    localStorage.removeItem('masjid_national_news_cache');
    localStorage.removeItem('masjid_pusat_news_cache_v4');
    var cacheKey = 'masjid_pusat_news_cache_v5';
    var cached = localStorage.getItem(cacheKey);
    if (cached) {
      var parsed = JSON.parse(cached);
      if (parsed && parsed.items && parsed.items.length >= 6) {
        renderFeedItems(parsed.items);
      } else {
        renderFeedItems(fallbackFeeds);
      }
    } else {
      renderFeedItems(fallbackFeeds);
    }
  } catch (e) {
    renderFeedItems(fallbackFeeds);
  }

  // 2. Multi-source live fetch otomatis dengan ekstraksi gambar cerdas
  var feedUrls = [
    { url: 'https://feed2json.org/convert?url=' + encodeURIComponent('https://muhammadiyah.or.id/feed/'), source: 'PP Muhammadiyah' }
  ];

  var controller = window.AbortController ? new AbortController() : null;
  var timeoutId = setTimeout(function () {
    if (controller) controller.abort();
  }, 5000);

  var fetchPromises = feedUrls.map(function (src) {
    return fetch(src.url, { signal: controller ? controller.signal : undefined })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.items && data.items.length > 0) {
          return data.items.map(function (it, idx) {
            var cleanDesc = (it.summary || it.content_html || it.description || '').replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
            var pubDate = it.date_published ? new Date(it.date_published) : new Date();
            var postLink = it.url || it.link;
            var resolvedImg = resolveUniquePusatImage({ link: postLink }, idx);
            return {
              title: (it.title || '').replace(/&amp;/g, '&'),
              source: src.source,
              rawDate: pubDate,
              date: pubDate.toLocaleDateString('id-ID', { dateStyle: 'medium' }),
              link: postLink,
              image: resolvedImg,
              snippet: cleanDesc.length > 140 ? cleanDesc.substring(0, 140) + '...' : cleanDesc
            };
          });
        }
        return [];
      })
      .catch(function () { return []; });
  });

  Promise.all(fetchPromises)
    .then(function (results) {
      clearTimeout(timeoutId);
      var allLive = [];
      results.forEach(function (items) {
        allLive = allLive.concat(items);
      });

      if (allLive.length >= 4) {
        // Urutkan berita berdasarkan tanggal rilis paling baru
        allLive.sort(function (a, b) {
          return (b.rawDate ? b.rawDate.getTime() : 0) - (a.rawDate ? a.rawDate.getTime() : 0);
        });

        // Ambil hingga 18 berita teratas
        var finalItems = allLive.slice(0, 18);

        try {
          localStorage.setItem('masjid_pusat_news_cache_v5', JSON.stringify({
            timestamp: Date.now(),
            items: finalItems
          }));
        } catch (e) { }

        renderFeedItems(finalItems);
      } else {
        renderFeedItems(fallbackFeeds);
      }
    })
    .catch(function () {
      clearTimeout(timeoutId);
      var hasRendered = (feedContainer && feedContainer.children.length > 0) || (homeContainer && homeContainer.children.length > 0);
      if (!hasRendered) {
        renderFeedItems(fallbackFeeds);
      }
    });
}
