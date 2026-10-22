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
          } catch (e) { }

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

    var oldBox = $('.lightbox');
    if (oldBox) { oldBox.remove(); }

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

  /* ======================================================
     9B. MODAL MATERI KAJIAN (GLOBAL WINDOW HANDLER)
     ====================================================== */
  window.showMaterialsModal = function (actId, actTitle) {
    actTitle = actTitle || 'Kajian Rutin';
    var materials = [];
    if (typeof window.MasjidDB !== 'undefined') {
      if (typeof window.MasjidDB.getMaterialsByActivity === 'function') {
        materials = window.MasjidDB.getMaterialsByActivity(actId);
      }
      // Fallback pencarian cerdas jika activityId berbeda pada database tersimpan
      if ((!materials || materials.length === 0) && typeof window.MasjidDB.getMaterials === 'function') {
        var allMat = window.MasjidDB.getMaterials() || [];
        var titleLower = (actTitle || '').toLowerCase();
        materials = allMat.filter(function (m) {
          if (m.activityId === actId) return true;
          var mTitle = (m.title || '').toLowerCase();
          if (titleLower.indexOf('ahad') !== -1 && (mTitle.indexOf('ahad') !== -1 || m.activityId === 'act-1')) return true;
          if (titleLower.indexOf('tarjih') !== -1 && (mTitle.indexOf('tarjih') !== -1 || m.activityId === 'act-tarjih')) return true;
          if (titleLower.indexOf('tahsin') !== -1 && (mTitle.indexOf('tahsin') !== -1 || m.activityId === 'act-tahsin')) return true;
          return false;
        });
      }
    }

    var existingModal = document.getElementById('modal-materials-dialog');
    if (existingModal) existingModal.remove();

    var backdrop = document.createElement('div');
    backdrop.className = 'modal-materials-backdrop';
    backdrop.id = 'modal-materials-dialog';

    var listHtml = '';
    if (!materials || materials.length === 0) {
      listHtml =
        '<div style="text-align:center; padding:36px 20px; color:var(--muted);">' +
        '<div style="font-size:2.5rem; margin-bottom:8px;">📄</div>' +
        '<p style="margin:0; font-weight:600; font-size:1rem; color:var(--ink);">Belum ada berkas materi untuk kajian ini.</p>' +
        '<span style="font-size:0.85rem; color:var(--muted); display:block; margin-top:4px;">Pengurus takmir dapat mengunggah file materi PDF via panel admin.</span>' +
        '</div>';
    } else {
      materials.forEach(function (m) {
        var isPdfFile = m.pdfUrl && m.pdfUrl !== '#';
        var dlAttr = isPdfFile ? 'href="' + escapeHtml(m.pdfUrl) + '" download' : 'href="#" onclick="alert(\'File PDF materi berhasil disiapkan untuk diunduh.\'); return false;"';

        listHtml +=
          '<div class="material-card-item">' +
          '<div class="material-card-info">' +
          '<h4>' + escapeHtml(m.title) + '</h4>' +
          '<div class="material-card-meta">' +
          '<span>✍️ ' + escapeHtml(m.speaker || 'Pemateri') + '</span>' +
          '<span>📅 ' + escapeHtml(m.date || '') + '</span>' +
          (m.pdfSize ? '<span>📦 ' + escapeHtml(m.pdfSize) + '</span>' : '') +
          '</div>' +
          '<p class="material-card-summary">' + escapeHtml(m.summary || '') + '</p>' +
          '</div>' +
          '<a ' + dlAttr + ' target="_blank" rel="noopener noreferrer" class="btn-dl-pdf">' +
          '📥 Unduh PDF' +
          '</a>' +
          '</div>';
      });
    }

    backdrop.innerHTML =
      '<div class="modal-materials" role="dialog" aria-modal="true" aria-labelledby="modal-mat-head">' +
      '<div class="modal-materials-header">' +
      '<h3 id="modal-mat-head">Materi: ' + escapeHtml(actTitle) + '</h3>' +
      '<button type="button" class="modal-materials-close" aria-label="Tutup" onclick="document.getElementById(\'modal-materials-dialog\').remove()">&times;</button>' +
      '</div>' +
      '<div class="modal-materials-body">' +
      listHtml +
      '</div>' +
      '</div>';

    backdrop.onclick = function (e) {
      if (e.target === backdrop) backdrop.remove();
    };

    document.body.appendChild(backdrop);
  };

  /* ------------------------------------------------------
     10. DYNAMIC CONTENT RENDERING (SINKRONISASI KE HALAMAN PUBLIK)
     ------------------------------------------------------ */
  function renderDynamicContent() {
    if (typeof window.MasjidDB === 'undefined') return;

    // 0. Sinkronisasi nomor WhatsApp Takmir (Umum) ke seluruh footer dan halaman kontak
    var info = MasjidDB.getInfo();
    if (info && info.whatsapp) {
      var cleanWa = String(info.whatsapp).replace(/\D/g, '');
      if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.slice(1);
      var waLinks = document.querySelectorAll('a[href*="wa.me/"]');
      waLinks.forEach(function (link) {
        // Jangan ubah link di floating bar musafir karena khusus nomor pelayanan malam
        if (link.closest('#mobile-musafir-bar') || link.closest('#musafir-modal-sheet')) return;
        link.href = 'https://wa.me/' + cleanWa + '?text=' + encodeURIComponent("Assalamu'alaikum Takmir " + (info.nama || 'Masjid Syukur'));
        if (/^[\d\s\-+]{7,}$/.test(link.textContent.trim())) {
          link.textContent = info.whatsapp;
        }
      });
    }

    // 0b. Sinkronisasi email resmi masjid ke seluruh halaman
    if (info && info.email) {
      var emailLinks = document.querySelectorAll('a[href^="mailto:"]');
      emailLinks.forEach(function (link) {
        link.href = 'mailto:' + info.email;
        if (link.textContent.trim().indexOf('@') !== -1) {
          link.textContent = info.email;
        }
      });
    }

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
    var isKegiatanPage = window.location.pathname.toLowerCase().indexOf('kegiatan') !== -1 ||
      document.querySelector('.filter-bar button[data-filter="kajian"]') !== null ||
      (document.querySelector('.page-head h1') && document.querySelector('.page-head h1').textContent.indexOf('Kegiatan') !== -1);

    if (isKegiatanPage && actContainer) {
      var actList = MasjidDB.getActivities();
      if (actList && actList.length > 0) {
        actContainer.innerHTML = '';
        actList.forEach(function (act) {
          var article = document.createElement('article');
          article.className = 'card reveal in-view';
          article.setAttribute('data-category', act.category);

          article.innerHTML =
            '<img src="' + escapeHtml(act.image || 'images/kajian-rutin-ahad-pagi.jpg') + '" alt="' + escapeHtml(act.title) + '" loading="lazy">' +
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
      var artListContainer = document.getElementById('art-list-container');
      var artEmptyState = document.getElementById('art-empty-state');
      var artFilterBar = document.getElementById('art-filter-bar');

      if (artListContainer) {
        var artList = MasjidDB.getArticles();
        if (artList && artList.length > 0) {
          artListContainer.innerHTML = '';

          artList.forEach(function (art, idx) {
            var article = document.createElement('article');
            article.className = 'article reveal in-view';
            article.setAttribute('data-art-category', art.categorySlug || 'artikel-islami');
            if (idx > 0) { article.style.marginTop = '24px'; }

            // Parsed body paragraphs
            var formattedBody = (art.fullText || '').split('\n\n').map(function (p) {
              return '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>';
            }).join('');

            // Category badge emoji
            var catEmoji = { 'artikel-islami': '📖', 'materi-kajian': '📝', 'ringkasan-khotbah': '🕌', 'video-ceramah': '🎬' };
            var emoji = catEmoji[art.categorySlug] || '📚';

            // Optional: quote box
            var quoteHtml = '';
            if (art.quoteArab) {
              quoteHtml =
                '<div class="article-quote-box">' +
                '<p>' + escapeHtml(art.quoteArab) + '</p>' +
                '<small>' + escapeHtml(art.quoteTranslation || '') + (art.quoteSource ? ' — ' + escapeHtml(art.quoteSource) : '') + '</small>' +
                '</div>';
            }

            // Optional: video embed
            var videoHtml = '';
            if (art.videoUrl) {
              videoHtml =
                '<div class="article-video-wrap">' +
                '<iframe src="' + escapeHtml(art.videoUrl) + '" title="Video: ' + escapeHtml(art.title) + '" allowfullscreen loading="lazy"></iframe>' +
                '</div>';
            }

            // Optional: download box
            var downloadHtml = '';
            if (art.downloadUrl) {
              downloadHtml =
                '<div class="article-download-box">' +
                '<div class="article-download-info">' +
                '<span class="dl-icon">📄</span>' +
                '<div><strong>' + escapeHtml(art.downloadLabel || 'Unduh Materi') + '</strong>' +
                (art.downloadSize ? '<span>' + escapeHtml(art.downloadSize) + '</span>' : '') +
                '</div></div>' +
                '<a href="' + escapeHtml(art.downloadUrl) + '" class="btn btn--primary btn--small" target="_blank" rel="noopener">Unduh</a>' +
                '</div>';
            }

            var btnLabel = art.videoUrl ? 'Tonton &amp; baca selengkapnya' : 'Baca selengkapnya';

            article.innerHTML =
              '<div class="article-thumb-wrap">' +
              '<img src="' + escapeHtml(art.image || 'images/depan-masjid.jpg') + '" alt="' + escapeHtml(art.title) + '" loading="lazy">' +
              '<span class="article-thumb-badge">' + emoji + ' ' + escapeHtml(art.category) + '</span>' +
              '</div>' +
              '<div class="article-body">' +
              '<div class="article-meta-row">' +
              '<span class="article-author-tag">✍️ ' + escapeHtml(art.author || 'Takmir Masjid Syukur') + '</span>' +
              '<time datetime="' + escapeHtml(art.datetime || '') + '">' + escapeHtml(art.date) + '</time>' +
              '</div>' +
              '<h2 style="font-size:1.5rem">' + escapeHtml(art.title) + '</h2>' +
              '<p style="margin-top:8px">' + escapeHtml(art.excerpt) + '</p>' +
              '<div class="article-full" id="art-full-' + escapeHtml(art.id) + '" hidden>' +
              quoteHtml +
              videoHtml +
              formattedBody +
              downloadHtml +
              '</div>' +
              '<div class="article-actions">' +
              '<button type="button" class="btn btn--outline btn--small btn--inline" data-toggle-article aria-expanded="false" aria-controls="art-full-' + escapeHtml(art.id) + '">' + btnLabel + '</button>' +
              '</div>' +
              '</div>';
            artListContainer.appendChild(article);
          });
          initArticles(); // re-bind button listeners
        }
      }

      // Filter kategori artikel lokal (jika ada)
      if (artFilterBar) {
        var artFilterBtns = artFilterBar.querySelectorAll('[data-art-filter]');
        artFilterBtns.forEach(function (btn) {
          btn.onclick = function () {
            var filter = btn.getAttribute('data-art-filter');
            var allCards = (artListContainer || document.getElementById('art-list-container')).querySelectorAll('[data-art-category]');
            var shown = 0;
            artFilterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
            allCards.forEach(function (card) {
              var match = filter === 'semua' || card.getAttribute('data-art-category') === filter;
              card.hidden = !match;
              if (match) { shown++; }
            });
            if (artEmptyState) { artEmptyState.hidden = shown > 0; }
          };
        });
      }
    }

    // 3b. Feed Berita Nasional & Persyarikatan (Otomatis untuk index.html & artikel.html)
    (function initNationalFeeds() {
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
    })();

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

    // 5. Struktur Organisasi di profil.html
    var orgContainer = document.getElementById('org-structure-groups');
    if (orgContainer && typeof window.MasjidDB !== 'undefined') {
      var org = window.MasjidDB.getOrganization();
      if (org && org.members && org.members.length > 0) {
        var titleEl = document.getElementById('judul-struktur');
        var periodEl = document.getElementById('org-structure-period');
        var dateEl = document.getElementById('org-structure-date');

        if (org.meta) {
          if (titleEl && org.meta.title) titleEl.textContent = org.meta.title;
          if (periodEl && org.meta.period) periodEl.innerHTML = escapeHtml(org.meta.period);
          if (dateEl && org.meta.effectiveDate) {
            dateEl.innerHTML = '<em>' + escapeHtml(org.meta.effectiveDate) + '</em>';
          }
        }

        var groups = {};
        var categoryOrder = (org.categories && org.categories.slice()) || [];

        categoryOrder.forEach(function (cat) {
          groups[cat] = [];
        });

        org.members.forEach(function (m) {
          var cat = m.category || 'Lainnya';
          if (!groups[cat]) {
            groups[cat] = [];
            categoryOrder.push(cat);
          }
          groups[cat].push(m);
        });

        var helperInitial = function (name) {
          if (!name) return '•';
          var clean = name.replace(/^(Pak|Bu|Mas|Mbak|Ust|Ustadz|Dokter|Dr\.)\s+/i, '').trim();
          return (clean ? clean.charAt(0) : name.charAt(0)).toUpperCase();
        };

        var html = '';
        categoryOrder.forEach(function (cat) {
          var list = groups[cat];
          if (!list || list.length === 0) return;

          html += '<div class="org-group">';
          html += '<h3>' + escapeHtml(cat) + '</h3>';
          html += '<div class="org-grid">';

          list.forEach(function (m) {
            html += '<div class="person">';
            if (m.image) {
              html += '<img src="' + escapeHtml(m.image) + '" alt="' + escapeHtml(m.name) + '" class="person-photo" loading="lazy">';
            } else {
              html += '<div class="person-avatar" aria-hidden="true">' + escapeHtml(helperInitial(m.name)) + '</div>';
            }
            html += '<strong>' + escapeHtml(m.name) + '</strong>';
            if (m.role) {
              html += '<span>' + escapeHtml(m.role) + '</span>';
            }
            html += '</div>';
          });

          html += '</div>';
          html += '</div>';
        });

        orgContainer.innerHTML = html;
      }
    }

    // 6. Galeri Dokumentasi di index.html (Halaman Utama)
    var homeGalleryContainer = document.getElementById('home-gallery-container');
    if (homeGalleryContainer && typeof window.MasjidDB !== 'undefined') {
      var homeGalList = window.MasjidDB.getGallery ? window.MasjidDB.getGallery() : [];
      if (homeGalList && homeGalList.length > 0) {
        homeGalleryContainer.innerHTML = '';
        var recentGal = homeGalList.slice(0, 6);
        recentGal.forEach(function (item) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'gallery-card gallery-item reveal in-view';
          btn.setAttribute('data-full', item.image || 'images/hero-masjid.jpg');
          btn.setAttribute('data-caption', item.title);

          btn.innerHTML =
            '<img src="' + escapeHtml(item.image || 'images/hero-masjid.jpg') + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<div class="gallery-card-overlay">' +
              '<h3 class="gallery-card-title">' + escapeHtml(item.title) + '</h3>' +
            '</div>';

          homeGalleryContainer.appendChild(btn);
        });
      }
    }

    // 7. Galeri Dokumentasi di galeri.html
    var galleryPageContainer = document.getElementById('gallery-container');
    if (galleryPageContainer && typeof window.MasjidDB !== 'undefined') {
      var allGal = window.MasjidDB.getGallery ? window.MasjidDB.getGallery() : [];
      if (allGal && allGal.length > 0) {
        galleryPageContainer.innerHTML = '';
        allGal.forEach(function (item) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'gallery-card gallery-item reveal in-view';
          btn.setAttribute('data-full', item.image || 'images/hero-masjid.jpg');
          btn.setAttribute('data-caption', item.title);

          btn.innerHTML =
            '<img src="' + escapeHtml(item.image || 'images/hero-masjid.jpg') + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<div class="gallery-card-overlay">' +
              '<h3 class="gallery-card-title">' + escapeHtml(item.title) + '</h3>' +
            '</div>';

          galleryPageContainer.appendChild(btn);
        });
      }
    }

    // Bind ulang lightbox untuk item galeri baru
    initLightbox();
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
     12. BILAH AKSI CEPAT MUSAFIR (MOBILE FLOATING BAR)
     Khusus tampilan smartphone (jalur arteri Solo-Semarang)
     ------------------------------------------------------ */
  function initMobileMusafirBar() {
    if (document.getElementById('mobile-musafir-bar')) return;

    var waNumber = '6285867907527';
    var mosqueName = "Masjid Syukur Ampel Boyolali";
    if (typeof window.MasjidDB !== 'undefined' && typeof window.MasjidDB.getInfo === 'function') {
      var info = window.MasjidDB.getInfo();
      var malam = info && (info.whatsappMalam || info.whatsapp);
      if (malam) {
        waNumber = String(malam).replace(/\D/g, '');
        if (waNumber.startsWith('0')) waNumber = '62' + waNumber.slice(1);
      }
      if (info && info.nama) {
        mosqueName = info.nama;
      }
    }

    var mapsUrl = 'https://www.google.com/maps/dir/?api=1&destination=-7.44796043268759,110.53998776688994&travelmode=driving';
    var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent("Assalamu'alaikum Pelayanan 24 Jam " + mosqueName + ", saya musafir dalam perjalanan, butuh informasi singgah & fasilitas.");

    // Buat HTML Floating Action Bar
    var bar = document.createElement('nav');
    bar.id = 'mobile-musafir-bar';
    bar.className = 'mobile-musafir-bar';
    bar.setAttribute('aria-label', 'Bilah Akses Cepat Musafir');
    bar.innerHTML = [
      '<div class="musafir-bar-inner">',
      '  <a href="' + mapsUrl + '" target="_blank" rel="noopener" class="musafir-bar-item" id="musafir-btn-maps">',
      '    <div class="musafir-bar-icon-wrap">',
      '      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
      '    </div>',
      '    <span>Rute Maps</span>',
      '  </a>',
      '  <button type="button" class="musafir-bar-item is-highlight" id="musafir-btn-sheet">',
      '    <div class="musafir-bar-icon-wrap">',
      '      <span class="musafir-badge-dot" aria-hidden="true"></span>',
      '      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
      '    </div>',
      '    <span>Layanan 24J</span>',
      '  </button>',
      '  <a href="' + waUrl + '" target="_blank" rel="noopener" class="musafir-bar-item" id="musafir-btn-wa">',
      '    <div class="musafir-bar-icon-wrap">',
      '      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
      '    </div>',
      '    <span>WA Malam 24J</span>',
      '  </a>',
      '  <a href="jadwal.html" class="musafir-bar-item" id="musafir-btn-salat">',
      '    <div class="musafir-bar-icon-wrap">',
      '      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
      '    </div>',
      '    <span id="musafir-label-next">Jadwal Salat</span>',
      '  </a>',
      '</div>'
    ].join('');

    // Buat HTML Bottom Sheet Fasilitas Musafir
    var sheet = document.createElement('div');
    sheet.id = 'musafir-modal-sheet';
    sheet.className = 'musafir-modal-backdrop';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-hidden', 'true');
    sheet.innerHTML = [
      '<div class="musafir-sheet-card">',
      '  <div class="musafir-sheet-handle-bar"><span class="sheet-pill"></span></div>',
      '  <div class="musafir-sheet-header">',
      '    <div class="sheet-title-group">',
      '      <span class="sheet-status-pill">● Terbuka 24 Jam Penuh</span>',
      '      <h3>Layanan Ramah Musafir</h3>',
      '      <p>Masjid Syukur Ampel terbuka lebar menyambut musafir di jalur Solo–Semarang.</p>',
      '    </div>',
      '    <button type="button" class="musafir-sheet-close" id="musafir-sheet-close" aria-label="Tutup">&times;</button>',
      '  </div>',
      '  <div class="musafir-sheet-body">',
      '    <div class="musafir-feature-grid">',
      '      <div class="feature-item">',
      '        <div class="feature-icon">☕</div>',
      '        <div>',
      '          <strong>Kopi, Teh &amp; Air Gratis 24 Jam</strong>',
      '          <span>Tersedia dispenser &amp; aneka seduhan hangat cuma-cuma untuk melepas penat di perjalanan.</span>',
      '        </div>',
      '      </div>',
      '      <div class="feature-item">',
      '        <div class="feature-icon">🛏️</div>',
      '        <div>',
      '          <strong>Kasur &amp; Ruang Rehat Musafir</strong>',
      '          <span>Bagi musafir yang mengantuk berat, silakan beristirahat nyaman agar perjalanan tetap selamat.</span>',
      '        </div>',
      '      </div>',
      '      <div class="feature-item">',
      '        <div class="feature-icon">🚿</div>',
      '        <div>',
      '          <strong>Toilet &amp; Tempat Wudhu Harum Bersih</strong>',
      '          <span>Terawat berkala dengan standar kebersihan tinggi dan pasokan air sejuk pegunungan Boyolali.</span>',
      '        </div>',
      '      </div>',
      '      <div class="feature-item">',
      '        <div class="feature-icon">🅿️</div>',
      '        <div>',
      '          <strong>Parkir Luas &amp; Aman</strong>',
      '          <span>Tepat di tepi jalan arteri nasional, aman untuk mobil pribadi, motor, hingga bus rombongan.</span>',
      '        </div>',
      '      </div>',
      '      <div class="feature-item">',
      '        <div class="feature-icon">📶</div>',
      '        <div>',
      '          <strong>Wi-Fi Gratis &amp; Colokan Listrik</strong>',
      '          <span>Mudah mengisi daya baterai HP dan mengakses navigasi/komunikasi perjalanan.</span>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="musafir-sheet-actions">',
      '      <a href="' + mapsUrl + '" target="_blank" rel="noopener" class="btn btn--primary sheet-btn">',
      '        🧭 Navigasi Google Maps Sekarang',
      '      </a>',
      '      <a href="' + waUrl + '" target="_blank" rel="noopener" class="btn btn--outline sheet-btn">',
      '        💬 Hubungi Pelayanan Malam di WhatsApp',
      '      </a>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(bar);
    document.body.appendChild(sheet);

    var btnSheet = document.getElementById('musafir-btn-sheet');
    var btnClose = document.getElementById('musafir-sheet-close');

    var openSheet = function () {
      sheet.classList.add('is-open');
      sheet.setAttribute('aria-hidden', 'false');
      document.body.classList.add('sheet-open');
    };

    var closeSheet = function () {
      sheet.classList.remove('is-open');
      sheet.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('sheet-open');
    };

    if (btnSheet) btnSheet.addEventListener('click', openSheet);
    if (btnClose) btnClose.addEventListener('click', closeSheet);

    sheet.addEventListener('click', function (e) {
      if (e.target === sheet) closeSheet();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet();
    });

    // Update label salat berikutnya di bar
    var updateBarPrayerLabel = function () {
      var nextEl = document.querySelector('[data-next-name]');
      var barLabel = document.getElementById('musafir-label-next');
      if (nextEl && barLabel && nextEl.textContent && nextEl.textContent !== 'Memuat...') {
        barLabel.textContent = nextEl.textContent;
      }
    };
    setTimeout(updateBarPrayerLabel, 700);
    setInterval(updateBarPrayerLabel, 5000);
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
    initMobileMusafirBar();
  });
})();
