/* ==========================================================
   WEBSITE MASJID - script.js (JavaScript murni, tanpa library)
   Semua fitur ditulis sebagai fungsi kecil. Setiap fungsi
   memeriksa dulu apakah elemennya ada di halaman, sehingga
   satu file ini aman dipakai di semua halaman.
   Terintegrasi dengan MasjidDB (data-store.js)
   ========================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------
     KONFIGURASI API JADWAL SALAT OTOMATIS
     Koordinat: Ampel, Kabupaten Boyolali, Jawa Tengah (-7.5333, 110.5833)
     Metode: 20 (Kementerian Agama RI / Kemenag)
     ------------------------------------------------------ */
  var PRAYER_API_CONFIG = {
    latitude: -7.5333,
    longitude: 110.5833,
    method: 20, // Kemenag RI
    cacheKeyPrefix: 'masjid_syukur_jadwal_'
  };

  /* ------------------------------------------------------
     DATA DUMMY & SINKRONISASI DATABASE
     Jika MasjidDB tersedia di window, gunakan data dari MasjidDB
     ------------------------------------------------------ */
  function getPrayerTimesData() {
    if (typeof window.MasjidDB !== 'undefined') {
      return window.MasjidDB.getPrayerTimes();
    }
    return [
      { id: 'imsak', name: 'Imsak', time: '03:59', salat: false },
      { id: 'subuh', name: 'Subuh', time: '04:09', salat: true },
      { id: 'terbit', name: 'Terbit', time: '05:23', salat: false },
      { id: 'dzuhur', name: 'Dzuhur', time: '11:32', salat: true },
      { id: 'ashar', name: 'Ashar', time: '14:41', salat: true },
      { id: 'maghrib', name: 'Maghrib', time: '17:36', salat: true },
      { id: 'isya', name: 'Isya', time: '18:45', salat: true }
    ];
  }

  // Sinkronisasi otomatis dari API jadwal salat
  function syncPrayerTimesFromAPI() {
    var today = new Date();
    var day = pad2(today.getDate());
    var month = pad2(today.getMonth() + 1);
    var year = today.getFullYear();
    var dateString = day + '-' + month + '-' + year;
    var cacheKey = PRAYER_API_CONFIG.cacheKeyPrefix + dateString;

    // 1. Cek apakah jadwal hari ini sudah tersimpan di cache browser
    try {
      var cached = localStorage.getItem(cacheKey);
      if (cached) {
        var parsedCache = JSON.parse(cached);
        if (Array.isArray(parsedCache) && parsedCache.length > 0) {
          applyPrayerTimes(parsedCache);
          return;
        }
      }
    } catch (e) {
      // Abaikan error local storage
    }

    // 2. Jika belum ada atau berganti hari, ambil dari API Aladhan (Metode Kemenag RI)
    var apiUrl = 'https://api.aladhan.com/v1/timings/' + dateString +
      '?latitude=' + PRAYER_API_CONFIG.latitude +
      '&longitude=' + PRAYER_API_CONFIG.longitude +
      '&method=' + PRAYER_API_CONFIG.method;

    fetch(apiUrl)
      .then(function (response) {
        if (!response.ok) throw new Error('Network response not ok');
        return response.json();
      })
      .then(function (res) {
        if (res && res.data && res.data.timings) {
          var t = res.data.timings;
          var clean = function (str) {
            return str ? str.split(' ')[0].substring(0, 5) : '00:00';
          };

          var newPrayerList = [
            { id: 'imsak', name: 'Imsak', time: clean(t.Imsak), salat: false },
            { id: 'subuh', name: 'Subuh', time: clean(t.Fajr), salat: true },
            { id: 'terbit', name: 'Terbit', time: clean(t.Sunrise), salat: false },
            { id: 'dzuhur', name: 'Dzuhur', time: clean(t.Dhuhr), salat: true },
            { id: 'ashar', name: 'Ashar', time: clean(t.Asr), salat: true },
            { id: 'maghrib', name: 'Maghrib', time: clean(t.Maghrib), salat: true },
            { id: 'isya', name: 'Isya', time: clean(t.Isha), salat: true }
          ];

          // Simpan ke cache harian
          try {
            localStorage.setItem(cacheKey, JSON.stringify(newPrayerList));
          } catch (e) {}

          applyPrayerTimes(newPrayerList);
        }
      })
      .catch(function (err) {
        console.warn('Gagal memuat jadwal salat otomatis dari API, memakai jadwal lokal:', err);
      });
  }

  function applyPrayerTimes(prayerList) {
    if (typeof window.MasjidDB !== 'undefined' && typeof window.MasjidDB.updatePrayerTimes === 'function') {
      window.MasjidDB.updatePrayerTimes(prayerList);
    }
    renderPrayerTimes();
  }

  function getFinanceData() {
    if (typeof window.MasjidDB !== 'undefined') {
      return window.MasjidDB.getFinances();
    }
    return {
      '2026-09': {
        label: 'September 2026',
        saldoAwal: 23600000,
        pemasukan: [
          { tgl: '04 Sep 2026', ket: 'Infak Jumat pekan 1', jumlah: 2350000 },
          { tgl: '11 Sep 2026', ket: 'Infak Jumat pekan 2', jumlah: 2610000 },
          { tgl: '13 Sep 2026', ket: 'Donasi transfer rekening', jumlah: 3000000 },
          { tgl: '18 Sep 2026', ket: 'Infak Jumat pekan 3', jumlah: 2480000 },
          { tgl: '21 Sep 2026', ket: 'Sedekah jamaah (kotak amal)', jumlah: 1275000 }
        ],
        pengeluaran: [
          { tgl: '02 Sep 2026', ket: 'Listrik dan air', jumlah: 1850000 },
          { tgl: '05 Sep 2026', ket: 'Honor petugas kebersihan', jumlah: 1500000 },
          { tgl: '10 Sep 2026', ket: 'Konsumsi kajian bulanan', jumlah: 950000 },
          { tgl: '15 Sep 2026', ket: 'Perawatan sound system', jumlah: 720000 },
          { tgl: '20 Sep 2026', ket: 'Perlengkapan kebersihan', jumlah: 380000 }
        ]
      }
    };
  }

  /* ------------------------------------------------------
     FUNGSI BANTU
     ------------------------------------------------------ */
  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Membuat objek Date untuk hari ini pada jam "JJ:MM"
  function timeToDate(timeStr, baseDate) {
    var parts = timeStr.split(':');
    var d = new Date(baseDate.getTime());
    d.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
    return d;
  }

  function formatRupiah(n) {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(n);
  }

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $all(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

  /* ------------------------------------------------------
     1. JADWAL SALAT, JAM DIGITAL, COUNTDOWN, TANGGAL
     ------------------------------------------------------ */

  // Mencari salat berikutnya
  function getNextPrayer(now) {
    var prayersList = getPrayerTimesData();
    var prayers = prayersList.filter(function (p) { return p.salat; });
    for (var i = 0; i < prayers.length; i++) {
      var when = timeToDate(prayers[i].time, now);
      if (when > now) { return { prayer: prayers[i], when: when }; }
    }
    var tomorrow = new Date(now.getTime());
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { prayer: prayers[0], when: timeToDate(prayers[0].time, tomorrow) };
  }

  // Menggambar daftar waktu salat ke setiap elemen [data-prayer-list]
  function renderPrayerTimes() {
    var prayersList = getPrayerTimesData();
    $all('[data-prayer-list]').forEach(function (list) {
      list.innerHTML = '';
      prayersList.forEach(function (p) {
        var li = document.createElement('li');
        li.className = 'prayer-item' + (p.salat ? '' : ' is-minor');
        li.setAttribute('data-prayer', p.id);
        var name = document.createElement('span');
        name.className = 'prayer-name';
        name.textContent = p.name;
        var time = document.createElement('span');
        time.className = 'prayer-time';
        time.textContent = p.time;
        li.appendChild(name);
        li.appendChild(time);
        list.appendChild(li);
      });
    });
  }

  function formatMasehi(now) {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(now);
  }

  function formatHijriah(now) {
    try {
      return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(now);
    } catch (e) {
      return 'Tidak tersedia di browser ini';
    }
  }

  function setText(selector, text) {
    $all(selector).forEach(function (el) { if (el.textContent !== text) { el.textContent = text; } });
  }

  // Dipanggil setiap detik
  function tick() {
    var now = new Date();

    setText('[data-clock]', pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds()));
    setText('[data-date-masehi]', formatMasehi(now));
    setText('[data-date-hijri]', formatHijriah(now));

    var next = getNextPrayer(now);
    var diff = Math.max(0, Math.floor((next.when - now) / 1000));
    var h = Math.floor(diff / 3600);
    var m = Math.floor((diff % 3600) / 60);
    var s = diff % 60;

    setText('[data-countdown]', pad2(h) + ':' + pad2(m) + ':' + pad2(s));
    setText('[data-next-name]', next.prayer.name);
    setText('[data-next-time]', 'Pukul ' + next.prayer.time);

    // Tandai salat berikutnya pada daftar
    $all('.prayer-item').forEach(function (item) {
      item.classList.toggle('is-next', item.getAttribute('data-prayer') === next.prayer.id);
    });
  }

  function initPrayerAndClock() {
    renderPrayerTimes();
    tick();
    setInterval(tick, 1000);
    // Sinkronisasi jadwal otomatis dari API (Kemenag - Ampel Boyolali)
    syncPrayerTimesFromAPI();
  }

  /* ------------------------------------------------------
     2. NAVIGASI HP (HAMBURGER MENU)
     ------------------------------------------------------ */
  function initNav() {
    var toggle = $('.nav-toggle');
    var nav = $('#site-nav');
    if (!toggle || !nav) { return; }

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });
    $all('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1140) { setOpen(false); }
    });
  }

  /* ------------------------------------------------------
     3. LIGHTBOX GALERI
     ------------------------------------------------------ */
  function initLightbox() {
    var items = $all('.gallery-item');
    if (!items.length) { return; }

    var current = 0;
    var lastFocused = null;

    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Tampilan foto diperbesar');
    box.innerHTML =
      '<button type="button" class="lightbox-btn lightbox-close" aria-label="Tutup">&times;</button>' +
      '<button type="button" class="lightbox-btn lightbox-prev" aria-label="Foto sebelumnya">&#8249;</button>' +
      '<img src="" alt="">' +
      '<p class="lightbox-caption"></p>' +
      '<button type="button" class="lightbox-btn lightbox-next" aria-label="Foto berikutnya">&#8250;</button>';
    document.body.appendChild(box);

    var img = $('img', box);
    var caption = $('.lightbox-caption', box);
    var closeBtn = $('.lightbox-close', box);

    function show(index) {
      current = (index + items.length) % items.length;
      var item = items[current];
      img.src = item.getAttribute('data-full');
      img.alt = item.getAttribute('data-caption');
      caption.textContent = item.getAttribute('data-caption') + '  (' + (current + 1) + ' dari ' + items.length + ')';
    }
    function open(index) {
      lastFocused = document.activeElement;
      show(index);
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocused) { lastFocused.focus(); }
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () { open(i); });
    });
    closeBtn.addEventListener('click', close);
    $('.lightbox-prev', box).addEventListener('click', function () { show(current - 1); });
    $('.lightbox-next', box).addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) { close(); } });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) { return; }
      if (e.key === 'Escape') { close(); }
      if (e.key === 'ArrowLeft') { show(current - 1); }
      if (e.key === 'ArrowRight') { show(current + 1); }
    });
  }

  /* ------------------------------------------------------
     4. SALIN NOMOR REKENING + PESAN (TOAST)
     ------------------------------------------------------ */
  var toastTimer = null;
  function showToast(message) {
    var toast = $('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
  }

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  function initCopy() {
    $all('[data-copy]').forEach(function (btn) {
      btn.onclick = function () {
        var text = btn.getAttribute('data-copy');
        var original = btn.innerHTML;

        function done(success) {
          if (success) {
            btn.textContent = 'Tersalin';
            showToast('Nomor rekening tersalin');
            setTimeout(function () { btn.innerHTML = original; }, 2000);
          } else {
            showToast('Gagal menyalin. Salin nomor secara manual.');
          }
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            function () { done(true); },
            function () { done(fallbackCopy(text)); }
          );
        } else {
          done(fallbackCopy(text));
        }
      };
    });
  }

  /* ------------------------------------------------------
     5. FILTER KEGIATAN
     ------------------------------------------------------ */
  function initFilter() {
    var buttons = $all('[data-filter]');
    var cards = $all('[data-category]');
    if (!buttons.length || !cards.length) { return; }
    var empty = $('.empty-state');

    buttons.forEach(function (btn) {
      btn.onclick = function () {
        var filter = btn.getAttribute('data-filter');
        var shown = 0;
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        cards.forEach(function (card) {
          var match = filter === 'semua' || card.getAttribute('data-category') === filter;
          card.hidden = !match;
          if (match) { shown++; }
        });
        if (empty) { empty.classList.toggle('is-visible', shown === 0); }
      };
    });
  }

  /* ------------------------------------------------------
     6. LAPORAN KEUANGAN
     ------------------------------------------------------ */
  function fillTable(tbody, rows) {
    if (!tbody) return 0;
    tbody.innerHTML = '';
    var total = 0;
    (rows || []).forEach(function (row) {
      var tr = document.createElement('tr');
      [['Tanggal', row.tgl, ''], ['Keterangan', row.ket, ''], ['Jumlah', formatRupiah(row.jumlah), 'num']]
        .forEach(function (cell) {
          var td = document.createElement('td');
          td.setAttribute('data-label', cell[0]);
          td.textContent = cell[1];
          if (cell[2]) { td.className = cell[2]; }
          tr.appendChild(td);
        });
      tbody.appendChild(tr);
      total += Number(row.jumlah) || 0;
    });
    return total;
  }

  function initFinance() {
    var select = $('#periode');
    if (!select) { return; }

    var financeData = getFinanceData();
    var keys = Object.keys(financeData).sort().reverse();
    select.innerHTML = '';

    keys.forEach(function (key) {
      var opt = document.createElement('option');
      opt.value = key;
      opt.textContent = financeData[key].label || key;
      select.appendChild(opt);
    });

    function render() {
      var financeCurrent = getFinanceData();
      var data = financeCurrent[select.value] || { label: '-', saldoAwal: 0, pemasukan: [], pengeluaran: [] };
      var totalIn = fillTable($('#tbody-pemasukan'), data.pemasukan);
      var totalOut = fillTable($('#tbody-pengeluaran'), data.pengeluaran);
      var saldo = (data.saldoAwal || 0) + totalIn - totalOut;

      setText('[data-periode]', data.label);
      setText('[data-sum="in"]', formatRupiah(totalIn));
      setText('[data-sum="out"]', formatRupiah(totalOut));
      setText('[data-sum="saldo"]', formatRupiah(saldo));
      setText('[data-sum="awal"]', formatRupiah(data.saldoAwal || 0));
      setText('[data-foot="in"]', formatRupiah(totalIn));
      setText('[data-foot="out"]', formatRupiah(totalOut));
    }
    select.addEventListener('change', render);
    render();
  }

  /* ------------------------------------------------------
     7. ARTIKEL: BACA SELENGKAPNYA
     ------------------------------------------------------ */
  function initArticles() {
    $all('[data-toggle-article]').forEach(function (btn) {
      var target = document.getElementById(btn.getAttribute('aria-controls'));
      if (!target) { return; }
      btn.onclick = function () {
        var open = target.hidden;
        target.hidden = !open;
        btn.setAttribute('aria-expanded', String(open));
        btn.textContent = open ? 'Tutup artikel' : 'Baca selengkapnya';
      };
    });
  }

  /* ------------------------------------------------------
     8. ANIMASI SCROLL SEDERHANA
     ------------------------------------------------------ */
  function initReveal() {
    var items = $all('.reveal');
    if (!items.length) { return; }
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------
     9. TAHUN OTOMATIS DI FOOTER
     ------------------------------------------------------ */
  function initYear() {
    setText('[data-year]', String(new Date().getFullYear()));
  }

  /* ------------------------------------------------------
     10. DYNAMIC CONTENT RENDERING (SINKRONISASI KE HALAMAN PUBLIK)
     ------------------------------------------------------ */
  function renderDynamicContent() {
    if (typeof window.MasjidDB === 'undefined') return;

    // 1. Pengumuman di pengumuman.html
    var annContainer = $('.announce-list');
    if (annContainer) {
      var annList = MasjidDB.getAnnouncements();
      if (annList && annList.length > 0) {
        annContainer.innerHTML = '';
        annList.forEach(function (ann) {
          var article = document.createElement('article');
          article.className = 'announce reveal in-view';
          var hasImgClass = ann.image ? ' has-image' : '';
          var tagUrgent = ann.isUrgent ? ' tag--urgent' : '';
          var imgEl = ann.image ? '<img src="' + escapeHtml(ann.image) + '" alt="' + escapeHtml(ann.title) + '" loading="lazy">' : '';

          article.innerHTML =
            '<time class="announce-date" datetime="' + escapeHtml(ann.date) + '"><strong>' + escapeHtml(ann.day) + '</strong> <span>' + escapeHtml(ann.month) + '</span></time>' +
            '<div class="announce-body' + hasImgClass + '">' +
            '<div>' +
            '<span class="tag' + tagUrgent + '">' + escapeHtml(ann.tag || 'Informasi') + '</span>' +
            '<h3>' + escapeHtml(ann.title) + '</h3>' +
            '<p>' + escapeHtml(ann.content) + '</p>' +
            '</div>' +
            imgEl +
            '</div>';
          annContainer.appendChild(article);
        });
      }
    }

    // 2. Kegiatan di kegiatan.html
    var actContainer = $('.grid--3');
    var isKegiatanPage = window.location.pathname.indexOf('kegiatan.html') !== -1;
    if (isKegiatanPage && actContainer) {
      var actList = MasjidDB.getActivities();
      if (actList && actList.length > 0) {
        actContainer.innerHTML = '';
        actList.forEach(function (act) {
          var article = document.createElement('article');
          article.className = 'card reveal in-view';
          article.setAttribute('data-category', act.category);
          article.innerHTML =
            '<img src="' + escapeHtml(act.image || 'images/poster-kajian.svg') + '" alt="' + escapeHtml(act.title) + '" loading="lazy">' +
            '<div class="card-body">' +
            '<span class="tag" style="align-self:flex-start">' + escapeHtml(act.categoryLabel || act.category) + '</span>' +
            '<h3>' + escapeHtml(act.title) + '</h3>' +
            '<ul class="meta">' +
            '<li><span class="ic ic-cal" aria-hidden="true"></span><span>' + escapeHtml(act.date) + '</span></li>' +
            '<li><span class="ic ic-clock" aria-hidden="true"></span><span>' + escapeHtml(act.time) + '</span></li>' +
            '<li><span class="ic ic-pin" aria-hidden="true"></span><span>' + escapeHtml(act.location) + '</span></li>' +
            '</ul>' +
            '<p>' + escapeHtml(act.description) + '</p>' +
            '</div>';
          actContainer.appendChild(article);
        });
        initFilter(); // re-bind filter listener
      }
    }

    // 3. Artikel di artikel.html
    var isArtikelPage = window.location.pathname.indexOf('artikel.html') !== -1;
    if (isArtikelPage) {
      var artContainer = $('.section .container .article') ? $('.section .container') : null;
      if (artContainer) {
        var artList = MasjidDB.getArticles();
        if (artList && artList.length > 0) {
          // Cari list artikel
          var note = artContainer.querySelector('.note');
          artContainer.innerHTML = '';
          if (note) artContainer.appendChild(note);

          artList.forEach(function (art) {
            var article = document.createElement('article');
            article.className = 'article reveal in-view';
            var formattedBody = (art.fullText || '').split('\n\n').map(function (p) {
              return '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>';
            }).join('');

            article.innerHTML =
              '<img src="' + escapeHtml(art.image || 'images/artikel-1.svg') + '" alt="' + escapeHtml(art.title) + '" loading="lazy">' +
              '<div class="article-body">' +
              '<span class="tag">' + escapeHtml(art.category) + '</span>' +
              '<h2 style="font-size:1.5rem">' + escapeHtml(art.title) + '</h2>' +
              '<time datetime="' + escapeHtml(art.datetime || '') + '">' + escapeHtml(art.date) + '</time>' +
              '<p style="margin-top:8px">' + escapeHtml(art.excerpt) + '</p>' +
              '<div class="article-full" id="' + escapeHtml(art.id) + '" hidden>' +
              formattedBody +
              '</div>' +
              '<button type="button" class="btn btn--outline btn--small btn--inline" data-toggle-article aria-expanded="false" aria-controls="' + escapeHtml(art.id) + '">Baca selengkapnya</button>' +
              '</div>';
            artContainer.appendChild(article);
          });
          initArticles(); // re-bind button listeners
        }
      }
    }

    // 4. Rekening di donasi.html
    var isDonasiPage = window.location.pathname.indexOf('donasi.html') !== -1;
    if (isDonasiPage) {
      var bankGrid = $('#judul-rekening') ? $('#judul-rekening').closest('.container').querySelector('.grid--3') : null;
      var don = MasjidDB.getDonations();
      if (bankGrid && don && don.banks && don.banks.length > 0) {
        bankGrid.innerHTML = '';
        don.banks.forEach(function (b) {
          var card = document.createElement('div');
          card.className = 'card bank reveal in-view';
          card.innerHTML =
            '<p class="bank-name">' + escapeHtml(b.name) + '</p>' +
            '<p class="bank-number">' + escapeHtml(b.number) + '</p>' +
            '<p class="bank-owner">a.n. ' + escapeHtml(b.owner) + '</p>' +
            '<button type="button" class="btn btn--outline btn--small" data-copy="' + escapeHtml(b.cleanNumber || b.number.replace(/\s+/g, '')) + '">' +
            '<span class="ic ic-copy" aria-hidden="true"></span> Salin Nomor Rekening' +
            '</button>';
          bankGrid.appendChild(card);
        });
        initCopy(); // re-bind copy listeners
      }
    }
  }

  /* ------------------------------------------------------
     11. FORM HUBUNGI KAMI DI kontak.html
     ------------------------------------------------------ */
  function initContactForm() {
    var contactForm = document.getElementById('form-kirim-pesan');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nama = document.getElementById('pesan-nama').value.trim();
      var kontak = document.getElementById('pesan-kontak').value.trim();
      var tipe = document.getElementById('pesan-tipe').value;
      var pesan = document.getElementById('pesan-isi').value.trim();

      if (typeof window.MasjidDB !== 'undefined') {
        window.MasjidDB.addMessage({
          nama: nama,
          kontak: kontak,
          tipe: tipe,
          pesan: pesan
        });
      }

      contactForm.reset();
      showToast('Alhamdulillah, pesan Anda telah berhasil dikirimkan ke pengurus!');
    });
  }

  /* ------------------------------------------------------
     MULAI: jalankan semua fitur setelah HTML selesai dimuat
     ------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initPrayerAndClock();
    initLightbox();
    initCopy();
    initFilter();
    initFinance();
    initArticles();
    initReveal();
    initYear();
    renderDynamicContent();
    initContactForm();
  });
})();
