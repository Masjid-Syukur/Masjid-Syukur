/* ==========================================================
   WEBSITE MASJID - admin.js
   Controller logika antarmuka Dashboard Admin Masjid Syukur Ampel Boyolali
   Menggunakan data-store.js (MasjidDB)
   ========================================================== */

(function () {
  'use strict';

  // Format Helper
  function formatRupiah(num) {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(num) || 0);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Notifikasi Toast
  function showToast(message, isError) {
    var toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.background = isError ? 'var(--admin-danger)' : 'var(--pine-deep)';
    toast.classList.add('is-visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2400);
  }

  // Helper kompresi gambar agar hemat penyimpanan localStorage
  function compressImageFile(file, maxWidth, maxHeight, quality, callback) {
    if (!file || !file.type.match(/^image\//)) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var w = img.width;
        var h = img.height;
        if (w > maxWidth || h > maxHeight) {
          var ratio = Math.min(maxWidth / w, maxHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var dataUrl = canvas.toDataURL('image/jpeg', quality || 0.82);
        callback(dataUrl);
      };
      img.onerror = function () {
        callback(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Objek Utama AdminApp
  window.AdminApp = {
    currentTab: 'sec-overview',
    currentPeriod: null,

    init: function () {
      this.bindNav();
      if (this.CropperTool) {
        this.CropperTool.init();
      }
      this.syncPrayerTimesFromAPI();
      this.initClock();
      this.loadHeaderInfo();
      this.renderOverview();
      this.renderAnnouncements();
      this.renderActivities();
      this.renderFinances();
      this.renderArticles();
      this.renderDonations();
      this.renderOrganization();
      this.renderMessages();
      this.bindForms();
    },

    closeCropperModal: function () {
      if (this.CropperTool) {
        this.CropperTool.close();
      }
    },

    // ----------------------------------------------------
    // 1. NAVIGASI TAB & MOBILE SIDEBAR
    // ----------------------------------------------------
    bindNav: function () {
      var self = this;
      var navButtons = document.querySelectorAll('.admin-nav-item');
      var sidebar = document.getElementById('admin-sidebar');
      var toggleBtn = document.getElementById('toggle-sidebar');
      var pageTitle = document.getElementById('page-title');

      var titles = {
        'sec-overview': 'Ikhtisar Panel Admin',
        'sec-announcements': 'Kelola Pengumuman',
        'sec-activities': 'Kelola Kegiatan & Agenda',
        'sec-finances': 'Kelola Laporan Keuangan',
        'sec-articles': 'Kelola Artikel & Berita',
        'sec-donations': 'Kelola Rekening Donasi',
        'sec-organization': 'Kelola Struktur Organisasi',
        'sec-messages': 'Kotak Masuk Jamaah',
        'sec-settings': 'Pengaturan Sistem & Profil'
      };

      navButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var targetSec = btn.getAttribute('data-section');
          self.switchTab(targetSec);
          if (window.innerWidth <= 991 && sidebar) {
            sidebar.classList.remove('is-open');
          }
        });
      });

      if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function () {
          sidebar.classList.toggle('is-open');
        });
      }

      // Logout
      var logoutBtn = document.getElementById('btn-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
          if (confirm('Apakah Anda yakin ingin keluar dari panel admin?')) {
            MasjidDB.logout();
            window.location.replace('login.html');
          }
        });
      }
    },

    switchTab: function (sectionId) {
      this.currentTab = sectionId;

      // Update tombol aktif
      document.querySelectorAll('.admin-nav-item').forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-section') === sectionId);
      });

      // Update seksi aktif
      document.querySelectorAll('.admin-section').forEach(function (sec) {
        sec.classList.toggle('is-active', sec.id === sectionId);
      });

      // Update page title
      var titles = {
        'sec-overview': 'Ikhtisar Panel Admin',
        'sec-announcements': 'Kelola Pengumuman',
        'sec-activities': 'Kelola Kegiatan & Agenda',
        'sec-finances': 'Kelola Laporan Keuangan',
        'sec-articles': 'Kelola Artikel & Berita',
        'sec-donations': 'Kelola Rekening Donasi',
        'sec-organization': 'Kelola Struktur Organisasi',
        'sec-messages': 'Kotak Masuk Jamaah',
        'sec-settings': 'Pengaturan Sistem & Profil'
      };
      var pt = document.getElementById('page-title');
      if (pt && titles[sectionId]) {
        pt.textContent = titles[sectionId];
      }

      // Refresh overview jika beralih ke overview
      if (sectionId === 'sec-overview') {
        this.renderOverview();
      }
    },

    syncPrayerTimesFromAPI: function () {
      var today = new Date();
      var day = String(today.getDate()).padStart(2, '0');
      var month = String(today.getMonth() + 1).padStart(2, '0');
      var year = today.getFullYear();
      var dateString = day + '-' + month + '-' + year;
      var cacheKey = 'masjid_syukur_jadwal_' + dateString;

      try {
        var cached = localStorage.getItem(cacheKey);
        if (cached) {
          var parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            MasjidDB.updatePrayerTimes(parsed);
            return;
          }
        }
      } catch (e) {}

      var apiUrl = 'https://api.aladhan.com/v1/timings/' + dateString +
        '?latitude=-7.5333&longitude=110.5833&method=20';

      fetch(apiUrl)
        .then(function (res) { return res.json(); })
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
            try {
              localStorage.setItem(cacheKey, JSON.stringify(newPrayerList));
            } catch (e) {}
            MasjidDB.updatePrayerTimes(newPrayerList);
          }
        })
        .catch(function (err) {
          console.warn('API jadwal salat otomatis belum terhubung, memakai jadwal lokal:', err);
        });
    },

    initClock: function () {
      var self = this;

      function pad2(n) { return n < 10 ? '0' + n : String(n); }

      function timeToDate(timeStr, baseDate) {
        var parts = timeStr.split(':');
        var d = new Date(baseDate.getTime());
        d.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
        return d;
      }

      function getNextPrayer(now) {
        var prayers = MasjidDB.getPrayerTimes().filter(function (p) { return p.salat; });
        for (var i = 0; i < prayers.length; i++) {
          var when = timeToDate(prayers[i].time, now);
          if (when > now) { return { prayer: prayers[i], when: when }; }
        }
        var tomorrow = new Date(now.getTime());
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { prayer: prayers[0], when: timeToDate(prayers[0].time, tomorrow) };
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
          return 'Kalender Hijriah';
        }
      }

      function setText(selector, val) {
        document.querySelectorAll(selector).forEach(function (el) {
          if (el.textContent !== val) el.textContent = val;
        });
      }

      function tick() {
        var now = new Date();
        var timeStr = pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());

        var elLive = document.getElementById('admin-live-clock');
        if (elLive) elLive.textContent = timeStr;
        setText('[data-clock]', timeStr);

        var masehiStr = formatMasehi(now);
        var hijriStr = formatHijriah(now);
        setText('[data-date-masehi]', masehiStr);
        setText('[data-date-hijri]', hijriStr);

        var next = getNextPrayer(now);
        var diff = Math.max(0, Math.floor((next.when - now) / 1000));
        var h = Math.floor(diff / 3600);
        var m = Math.floor((diff % 3600) / 60);
        var s = diff % 60;
        var countdownStr = pad2(h) + ':' + pad2(m) + ':' + pad2(s);

        setText('[data-next-name]', next.prayer.name);
        setText('[data-next-time]', 'Pukul ' + next.prayer.time + ' WIB');
        setText('[data-countdown]', countdownStr);

        var topNext = document.getElementById('topbar-next-name');
        if (topNext) topNext.textContent = next.prayer.name + ' ' + next.prayer.time;
        var topCd = document.getElementById('topbar-countdown');
        if (topCd) topCd.textContent = '-' + countdownStr;

        // Highlight salat berikutnya di grid
        document.querySelectorAll('.admin-prayer-tile').forEach(function (tile) {
          var pid = tile.getAttribute('data-pid');
          tile.classList.toggle('is-active-prayer', pid === next.prayer.id);
        });
      }

      this.renderAdminPrayerGrid();
      tick();
      setInterval(tick, 1000);
    },

    renderAdminPrayerGrid: function () {
      var grid = document.getElementById('admin-prayer-grid');
      if (!grid) return;
      var prayers = MasjidDB.getPrayerTimes();
      grid.innerHTML = '';
      prayers.forEach(function (p) {
        var li = document.createElement('li');
        li.className = 'admin-prayer-tile';
        li.setAttribute('data-pid', p.id);
        li.innerHTML =
          '<span class="p-name">' + escapeHtml(p.name) + (p.salat ? '' : ' *') + '</span>' +
          '<strong class="p-time">' + escapeHtml(p.time) + '</strong>';
        grid.appendChild(li);
      });
    },

    loadHeaderInfo: function () {
      var sess = MasjidDB.getCurrentSession();
      var info = MasjidDB.getInfo();
      var userNameEl = document.getElementById('admin-user-name');
      var mosqueNameEl = document.getElementById('sidebar-mosque-name');
      if (userNameEl && sess) {
        userNameEl.textContent = sess.displayName || sess.user || 'Pengurus';
      }
      if (mosqueNameEl && info) {
        mosqueNameEl.textContent = info.nama || 'Masjid Syukur Ampel';
      }
    },

    // ----------------------------------------------------
    // 2. OVERVIEW (IKHTISAR)
    // ----------------------------------------------------
    renderOverview: function () {
      var finances = MasjidDB.getFinances();
      var annList = MasjidDB.getAnnouncements();
      var actList = MasjidDB.getActivities();
      var artList = MasjidDB.getArticles();
      var msgList = MasjidDB.getMessages();

      // Hitung saldo kas periode terbaru
      var periodKeys = Object.keys(finances).sort().reverse();
      var currentSaldo = 0;
      if (periodKeys.length > 0) {
        var latest = finances[periodKeys[0]];
        var inSum = (latest.pemasukan || []).reduce(function (a, b) { return a + (Number(b.jumlah) || 0); }, 0);
        var outSum = (latest.pengeluaran || []).reduce(function (a, b) { return a + (Number(b.jumlah) || 0); }, 0);
        currentSaldo = (latest.saldoAwal || 0) + inSum - outSum;
      }

      var elSaldo = document.getElementById('stat-saldo-kas');
      if (elSaldo) elSaldo.textContent = formatRupiah(currentSaldo);

      var elAnn = document.getElementById('stat-ann-count');
      if (elAnn) elAnn.textContent = annList.length;
      var badgeAnn = document.getElementById('badge-ann-count');
      if (badgeAnn) badgeAnn.textContent = annList.length;

      var elAct = document.getElementById('stat-act-count');
      if (elAct) elAct.textContent = actList.length;
      var badgeAct = document.getElementById('badge-act-count');
      if (badgeAct) badgeAct.textContent = actList.length;

      var unreadMsg = msgList.filter(function (m) { return !m.dibaca; }).length;
      var elMsg = document.getElementById('stat-msg-count');
      if (elMsg) elMsg.textContent = unreadMsg + ' baru';
      var badgeMsg = document.getElementById('badge-msg-unread');
      if (badgeMsg) {
        badgeMsg.textContent = unreadMsg;
        badgeMsg.style.display = unreadMsg > 0 ? 'inline-block' : 'none';
      }

      var orgMembers = MasjidDB.getMembers();
      var badgeOrg = document.getElementById('badge-org-count');
      if (badgeOrg) badgeOrg.textContent = orgMembers.length;

      this.renderAdminPrayerGrid();
    },

    // ----------------------------------------------------
    // 4. PENGUMUMAN
    // ----------------------------------------------------
    renderAnnouncements: function () {
      var list = MasjidDB.getAnnouncements();
      var tbody = document.getElementById('table-announcements-body');
      if (!tbody) return;

      tbody.innerHTML = '';
      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--muted)">Belum ada pengumuman. Klik "+ Tambah Pengumuman Baru" untuk membuat pengumuman pertama.</td></tr>';
        return;
      }

      list.forEach(function (ann) {
        var tr = document.createElement('tr');
        var urgentBadge = ann.isUrgent ? '<span class="admin-badge admin-badge-warning" style="margin-left:6px;">Penting</span>' : '';
        tr.innerHTML =
          '<td><span style="font-weight:600">' + ann.day + ' ' + ann.month + '</span> <span style="color:var(--muted); font-size:0.85rem">(' + (ann.date || '-') + ')</span></td>' +
          '<td><strong>' + escapeHtml(ann.title) + '</strong><br><span style="color:var(--muted); font-size:0.88rem;">' + escapeHtml(ann.content.substring(0, 75)) + '...</span></td>' +
          '<td><span class="admin-badge admin-badge-info">' + escapeHtml(ann.tag || 'Umum') + '</span>' + urgentBadge + '</td>' +
          '<td><span class="admin-badge admin-badge-success">Aktif</span></td>' +
          '<td class="actions">' +
          '<button type="button" class="btn-action-icon" title="Edit" onclick="AdminApp.editAnnouncement(\'' + ann.id + '\')">✏️</button> ' +
          '<button type="button" class="btn-action-icon is-danger" title="Hapus" onclick="AdminApp.deleteAnnouncement(\'' + ann.id + '\')">🗑️</button>' +
          '</td>';
        tbody.appendChild(tr);
      });

      this.renderOverview();
    },

    openAnnouncementModal: function (item) {
      document.getElementById('form-announcement').reset();
      document.getElementById('ann-id').value = item ? item.id : '';
      document.getElementById('modal-ann-title').textContent = item ? 'Ubah Pengumuman' : 'Tambah Pengumuman Baru';

      if (item) {
        document.getElementById('ann-input-title').value = item.title || '';
        document.getElementById('ann-input-date').value = item.date || '';
        document.getElementById('ann-input-tag').value = item.tag || 'Informasi';
        document.getElementById('ann-input-urgent').checked = !!item.isUrgent;
        document.getElementById('ann-input-content').value = item.content || '';
        this.setImageUploaderValue('ann', item.image || '');
      } else {
        document.getElementById('ann-input-date').value = new Date().toISOString().split('T')[0];
        this.setImageUploaderValue('ann', '');
      }

      this.openModal('modal-announcement');
    },

    editAnnouncement: function (id) {
      var item = MasjidDB.getAnnouncements().find(function (a) { return a.id === id; });
      if (item) this.openAnnouncementModal(item);
    },

    deleteAnnouncement: function (id) {
      if (confirm('Yakin ingin menghapus pengumuman ini?')) {
        MasjidDB.deleteAnnouncement(id);
        this.renderAnnouncements();
        showToast('Pengumuman berhasil dihapus.');
      }
    },

    // ----------------------------------------------------
    // 5. KEGIATAN & AGENDA
    // ----------------------------------------------------
    renderActivities: function (filterCategory) {
      var list = MasjidDB.getActivities();
      var tbody = document.getElementById('table-activities-body');
      if (!tbody) return;

      var filter = filterCategory || (document.getElementById('filter-activity-category') ? document.getElementById('filter-activity-category').value : 'semua');
      var filtered = list.filter(function (act) {
        return filter === 'semua' || act.category === filter;
      });

      tbody.innerHTML = '';
      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--muted)">Belum ada kegiatan untuk kategori ini.</td></tr>';
        return;
      }

      filtered.forEach(function (act) {
        var tr = document.createElement('tr');
        var imgThumb = act.image ? '<img src="' + act.image + '" alt="" style="width:50px; height:34px; object-fit:cover; border-radius:4px;">' : '<span style="color:var(--muted)">-</span>';
        tr.innerHTML =
          '<td>' + imgThumb + '</td>' +
          '<td><strong>' + escapeHtml(act.title) + '</strong><br><span style="color:var(--muted); font-size:0.86rem">' + escapeHtml((act.description || '').substring(0, 60)) + '...</span></td>' +
          '<td><span class="admin-badge admin-badge-info">' + escapeHtml(act.categoryLabel || act.category) + '</span></td>' +
          '<td>' + escapeHtml(act.date) + '<br><span style="color:var(--muted); font-size:0.86rem;">' + escapeHtml(act.time) + '</span></td>' +
          '<td>' + escapeHtml(act.location) + '</td>' +
          '<td class="actions">' +
          '<button type="button" class="btn-action-icon" title="Edit" onclick="AdminApp.editActivity(\'' + act.id + '\')">✏️</button> ' +
          '<button type="button" class="btn-action-icon is-danger" title="Hapus" onclick="AdminApp.deleteActivity(\'' + act.id + '\')">🗑️</button>' +
          '</td>';
        tbody.appendChild(tr);
      });

      this.renderOverview();
    },

    openActivityModal: function (item) {
      document.getElementById('form-activity').reset();
      document.getElementById('act-id').value = item ? item.id : '';
      document.getElementById('modal-act-title').textContent = item ? 'Ubah Kegiatan' : 'Tambah Kegiatan Baru';

      if (item) {
        document.getElementById('act-input-title').value = item.title || '';
        document.getElementById('act-input-cat').value = item.category || 'kajian';
        document.getElementById('act-input-date').value = item.date || '';
        document.getElementById('act-input-time').value = item.time || '';
        document.getElementById('act-input-loc').value = item.location || '';
        document.getElementById('act-input-desc').value = item.description || '';
        this.setImageUploaderValue('act', item.image || 'images/poster-kajian.svg');
      } else {
        this.setImageUploaderValue('act', 'images/poster-kajian.svg');
      }

      this.openModal('modal-activity');
    },

    editActivity: function (id) {
      var item = MasjidDB.getActivities().find(function (a) { return a.id === id; });
      if (item) this.openActivityModal(item);
    },

    deleteActivity: function (id) {
      if (confirm('Yakin ingin menghapus kegiatan ini?')) {
        MasjidDB.deleteActivity(id);
        this.renderActivities();
        showToast('Kegiatan berhasil dihapus.');
      }
    },

    // ----------------------------------------------------
    // 6. LAPORAN KEUANGAN
    // ----------------------------------------------------
    renderFinances: function () {
      var finances = MasjidDB.getFinances();
      var periodSelect = document.getElementById('admin-finance-period');
      if (!periodSelect) return;

      var keys = Object.keys(finances).sort().reverse();
      periodSelect.innerHTML = '';

      if (keys.length === 0) {
        // Buat default periode jika belum ada
        finances['2026-09'] = { label: 'September 2026', saldoAwal: 0, pemasukan: [], pengeluaran: [] };
        MasjidDB.setFinancePeriod('2026-09', finances['2026-09']);
        keys = ['2026-09'];
      }

      keys.forEach(function (k) {
        var opt = document.createElement('option');
        opt.value = k;
        opt.textContent = finances[k].label || k;
        periodSelect.appendChild(opt);
      });

      if (!this.currentPeriod || !finances[this.currentPeriod]) {
        this.currentPeriod = keys[0];
      }
      periodSelect.value = this.currentPeriod;

      this.renderPeriodData(this.currentPeriod);
    },

    renderPeriodData: function (periodKey) {
      this.currentPeriod = periodKey;
      var data = MasjidDB.getFinancePeriod(periodKey);
      if (!data) return;

      var inSum = (data.pemasukan || []).reduce(function (a, b) { return a + (Number(b.jumlah) || 0); }, 0);
      var outSum = (data.pengeluaran || []).reduce(function (a, b) { return a + (Number(b.jumlah) || 0); }, 0);
      var saldo = (data.saldoAwal || 0) + inSum - outSum;

      document.getElementById('fin-stat-awal').textContent = formatRupiah(data.saldoAwal || 0);
      document.getElementById('fin-stat-in').textContent = formatRupiah(inSum);
      document.getElementById('fin-stat-out').textContent = formatRupiah(outSum);
      document.getElementById('fin-stat-saldo').textContent = formatRupiah(saldo);

      // Render Pemasukan
      var tbodyIn = document.getElementById('table-income-body');
      tbodyIn.innerHTML = '';
      if (!data.pemasukan || data.pemasukan.length === 0) {
        tbodyIn.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--muted); padding:16px;">Belum ada catatan pemasukan.</td></tr>';
      } else {
        data.pemasukan.forEach(function (row) {
          var tr = document.createElement('tr');
          tr.innerHTML =
            '<td>' + escapeHtml(row.tgl) + '</td>' +
            '<td>' + escapeHtml(row.ket) + '</td>' +
            '<td style="text-align:right; font-weight:600; color:var(--pine); font-variant-numeric:tabular-nums;">' + formatRupiah(row.jumlah) + '</td>' +
            '<td class="actions"><button type="button" class="btn-action-icon is-danger" onclick="AdminApp.deleteFinanceRow(\'pemasukan\', \'' + row.id + '\')">🗑️</button></td>';
          tbodyIn.appendChild(tr);
        });
      }

      // Render Pengeluaran
      var tbodyOut = document.getElementById('table-expense-body');
      tbodyOut.innerHTML = '';
      if (!data.pengeluaran || data.pengeluaran.length === 0) {
        tbodyOut.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--muted); padding:16px;">Belum ada catatan pengeluaran.</td></tr>';
      } else {
        data.pengeluaran.forEach(function (row) {
          var tr = document.createElement('tr');
          tr.innerHTML =
            '<td>' + escapeHtml(row.tgl) + '</td>' +
            '<td>' + escapeHtml(row.ket) + '</td>' +
            '<td style="text-align:right; font-weight:600; color:#b45309; font-variant-numeric:tabular-nums;">' + formatRupiah(row.jumlah) + '</td>' +
            '<td class="actions"><button type="button" class="btn-action-icon is-danger" onclick="AdminApp.deleteFinanceRow(\'pengeluaran\', \'' + row.id + '\')">🗑️</button></td>';
          tbodyOut.appendChild(tr);
        });
      }

      this.renderOverview();
    },

    editInitialBalance: function () {
      var data = MasjidDB.getFinancePeriod(this.currentPeriod);
      if (!data) return;
      var promptVal = prompt('Masukkan Saldo Awal Periode ' + data.label + ' (Angka saja):', data.saldoAwal || 0);
      if (promptVal !== null) {
        var num = Number(promptVal.replace(/[^0-9]/g, '')) || 0;
        data.saldoAwal = num;
        MasjidDB.setFinancePeriod(this.currentPeriod, data);
        this.renderPeriodData(this.currentPeriod);
        showToast('Saldo awal berhasil diperbarui.');
      }
    },

    deleteFinanceRow: function (type, id) {
      if (confirm('Hapus transaksi ini?')) {
        MasjidDB.deleteFinanceTransaction(this.currentPeriod, type, id);
        this.renderPeriodData(this.currentPeriod);
        showToast('Transaksi dihapus.');
      }
    },

    openNewPeriodModal: function () {
      document.getElementById('form-new-period').reset();
      this.openModal('modal-new-period');
    },

    // ----------------------------------------------------
    // 7. ARTIKEL & BERITA
    // ----------------------------------------------------
    renderArticles: function () {
      var list = MasjidDB.getArticles();
      var tbody = document.getElementById('table-articles-body');
      if (!tbody) return;

      tbody.innerHTML = '';
      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--muted)">Belum ada artikel. Klik "+ Tulis Artikel Baru".</td></tr>';
        return;
      }

      list.forEach(function (art) {
        var tr = document.createElement('tr');
        var imgThumb = art.image ? '<img src="' + art.image + '" alt="" style="width:48px; height:34px; object-fit:cover; border-radius:4px;">' : '-';
        tr.innerHTML =
          '<td>' + imgThumb + '</td>' +
          '<td><strong>' + escapeHtml(art.title) + '</strong><br><span style="color:var(--muted); font-size:0.86rem">' + escapeHtml((art.excerpt || '').substring(0, 60)) + '...</span></td>' +
          '<td><span class="admin-badge admin-badge-info">' + escapeHtml(art.category) + '</span></td>' +
          '<td>' + escapeHtml(art.author || '-') + '</td>' +
          '<td>' + escapeHtml(art.date) + '</td>' +
          '<td class="actions">' +
          '<button type="button" class="btn-action-icon" title="Edit" onclick="AdminApp.editArticle(\'' + art.id + '\')">✏️</button> ' +
          '<button type="button" class="btn-action-icon is-danger" title="Hapus" onclick="AdminApp.deleteArticle(\'' + art.id + '\')">🗑️</button>' +
          '</td>';
        tbody.appendChild(tr);
      });
    },

    openArticleModal: function (item) {
      document.getElementById('form-article').reset();
      document.getElementById('art-id').value = item ? item.id : '';
      document.getElementById('modal-art-title').textContent = item ? 'Ubah Artikel' : 'Tulis Artikel Baru';

      if (item) {
        document.getElementById('art-input-title').value = item.title || '';
        document.getElementById('art-input-cat').value = item.category || 'Artikel keislaman';
        document.getElementById('art-input-author').value = item.author || '';
        document.getElementById('art-input-date').value = item.date || '';
        document.getElementById('art-input-excerpt').value = item.excerpt || '';
        document.getElementById('art-input-full').value = item.fullText || '';
        this.setImageUploaderValue('art', item.image || 'images/artikel-1.svg');
      } else {
        var d = new Date();
        document.getElementById('art-input-date').value = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(d);
        this.setImageUploaderValue('art', 'images/artikel-1.svg');
      }

      this.openModal('modal-article');
    },

    editArticle: function (id) {
      var item = MasjidDB.getArticles().find(function (a) { return a.id === id; });
      if (item) this.openArticleModal(item);
    },

    deleteArticle: function (id) {
      if (confirm('Yakin ingin menghapus artikel ini?')) {
        MasjidDB.deleteArticle(id);
        this.renderArticles();
        showToast('Artikel berhasil dihapus.');
      }
    },

    // ----------------------------------------------------
    // 8. DONASI & REKENING
    // ----------------------------------------------------
    renderDonations: function () {
      var don = MasjidDB.getDonations();
      var tbody = document.getElementById('table-donations-body');
      if (!tbody) return;

      tbody.innerHTML = '';
      (don.banks || []).forEach(function (b) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td><strong>' + escapeHtml(b.name) + '</strong></td>' +
          '<td><code style="font-size:1.05rem; font-weight:700; color:var(--pine);">' + escapeHtml(b.number) + '</code></td>' +
          '<td>' + escapeHtml(b.owner) + '</td>' +
          '<td class="actions">' +
          '<button type="button" class="btn-action-icon" title="Edit" onclick="AdminApp.editBank(\'' + b.id + '\')">✏️</button> ' +
          '<button type="button" class="btn-action-icon is-danger" title="Hapus" onclick="AdminApp.deleteBank(\'' + b.id + '\')">🗑️</button>' +
          '</td>';
        tbody.appendChild(tr);
      });

      var notesEl = document.getElementById('donation-notes');
      if (notesEl) {
        notesEl.value = don.notes || '';
      }
    },

    openBankModal: function (item) {
      document.getElementById('form-bank').reset();
      document.getElementById('bank-id').value = item ? item.id : '';
      document.getElementById('modal-bank-title').textContent = item ? 'Ubah Rekening Bank' : 'Tambah Rekening Bank';

      if (item) {
        document.getElementById('bank-input-name').value = item.name || '';
        document.getElementById('bank-input-number').value = item.number || '';
        document.getElementById('bank-input-owner').value = item.owner || '';
      }

      this.openModal('modal-bank');
    },

    editBank: function (id) {
      var don = MasjidDB.getDonations();
      var item = (don.banks || []).find(function (b) { return b.id === id; });
      if (item) this.openBankModal(item);
    },

    deleteBank: function (id) {
      if (confirm('Hapus rekening bank ini?')) {
        var don = MasjidDB.getDonations();
        don.banks = (don.banks || []).filter(function (b) { return b.id !== id; });
        MasjidDB.updateDonations(don);
        this.renderDonations();
        showToast('Rekening bank dihapus.');
      }
    },

    // ----------------------------------------------------
    // 9. KOTAK MASUK (PESAN JAMAAH)
    // ----------------------------------------------------
    renderMessages: function (statusFilter) {
      var list = MasjidDB.getMessages();
      var tbody = document.getElementById('table-messages-body');
      if (!tbody) return;

      var filter = statusFilter || (document.getElementById('filter-message-status') ? document.getElementById('filter-message-status').value : 'all');
      var filtered = list.filter(function (m) {
        if (filter === 'unread') return !m.dibaca;
        if (filter === 'read') return m.dibaca;
        return true;
      });

      tbody.innerHTML = '';
      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:32px; color:var(--muted)">Belum ada pesan yang cocok dengan filter ini.</td></tr>';
        return;
      }

      filtered.forEach(function (m) {
        var tr = document.createElement('tr');
        if (!m.dibaca) {
          tr.style.background = '#fefdfa';
        }
        var statusBadge = m.dibaca ? '<span class="admin-badge admin-badge-info">Dibaca</span>' : '<span class="admin-badge admin-badge-warning">Baru</span>';

        // Cek nomor wa untuk tombol balas
        var cleanPhone = (m.kontak || '').replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);
        var waBtn = cleanPhone.length >= 9
          ? '<a class="btn-action-icon" href="https://wa.me/' + cleanPhone + '" target="_blank" rel="noopener" title="Balas via WhatsApp">💬</a> '
          : '';

        tr.innerHTML =
          '<td><span style="font-size:0.86rem; color:var(--muted);">' + escapeHtml(m.waktu) + '</span></td>' +
          '<td><strong>' + escapeHtml(m.nama) + '</strong></td>' +
          '<td>' + escapeHtml(m.kontak) + '</td>' +
          '<td><span class="admin-badge admin-badge-info">' + escapeHtml(m.tipe || 'Pesan') + '</span> ' + statusBadge + '</td>' +
          '<td><div style="max-width:320px; font-size:0.9rem;">' + escapeHtml(m.pesan) + '</div></td>' +
          '<td class="actions">' +
          waBtn +
          (!m.dibaca ? '<button type="button" class="btn-action-icon" title="Tandai Sudah Dibaca" onclick="AdminApp.markMsgRead(\'' + m.id + '\')">✓</button> ' : '') +
          '<button type="button" class="btn-action-icon is-danger" title="Hapus" onclick="AdminApp.deleteMsg(\'' + m.id + '\')">🗑️</button>' +
          '</td>';
        tbody.appendChild(tr);
      });

      this.renderOverview();
    },

    markMsgRead: function (id) {
      MasjidDB.markMessageRead(id, true);
      this.renderMessages();
      showToast('Pesan ditandai sudah dibaca.');
    },

    deleteMsg: function (id) {
      if (confirm('Hapus pesan ini?')) {
        MasjidDB.deleteMessage(id);
        this.renderMessages();
        showToast('Pesan dihapus.');
      }
    },

    // ----------------------------------------------------
    // 9B. STRUKTUR ORGANISASI TAKMIR
    // ----------------------------------------------------
    renderOrganization: function (filterCategory) {
      var org = MasjidDB.getOrganization();
      var members = (org && org.members) || [];
      var tbody = document.getElementById('table-org-body');
      var filterSelect = document.getElementById('filter-org-category');
      var totalCountEl = document.getElementById('org-total-count');
      var badgeOrg = document.getElementById('badge-org-count');

      // Update meta header info
      if (org && org.meta) {
        var metaTitle = document.getElementById('org-meta-display-title');
        var metaPeriod = document.getElementById('org-meta-display-period');
        var metaDate = document.getElementById('org-meta-display-date');
        if (metaTitle && org.meta.title) metaTitle.textContent = org.meta.title;
        if (metaPeriod && org.meta.period) metaPeriod.textContent = org.meta.period;
        if (metaDate && org.meta.effectiveDate) metaDate.textContent = 'Ditetapkan: ' + org.meta.effectiveDate;
      }

      if (totalCountEl) totalCountEl.textContent = members.length;
      if (badgeOrg) badgeOrg.textContent = members.length;

      // Update filter options
      if (filterSelect) {
        var currentFilter = filterCategory || filterSelect.value || 'semua';
        var categories = (org.categories && org.categories.slice()) || [];
        members.forEach(function (m) {
          if (m.category && categories.indexOf(m.category) === -1) {
            categories.push(m.category);
          }
        });

        filterSelect.innerHTML = '<option value="semua">Semua Divisi / Seksi (' + members.length + ')</option>';
        categories.forEach(function (cat) {
          var count = members.filter(function (m) { return m.category === cat; }).length;
          var opt = document.createElement('option');
          opt.value = cat;
          opt.textContent = cat + ' (' + count + ')';
          if (cat === currentFilter) opt.selected = true;
          filterSelect.appendChild(opt);
        });
      }

      if (!tbody) return;

      var filter = filterCategory || (filterSelect ? filterSelect.value : 'semua');
      var filtered = members.filter(function (m) {
        return filter === 'semua' || m.category === filter;
      });

      tbody.innerHTML = '';
      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:32px; color:var(--muted)">Belum ada data pengurus untuk filter ini. Klik "+ Tambah Pengurus Baru".</td></tr>';
        return;
      }

      var helperInitial = function (name) {
        if (!name) return '•';
        var clean = name.replace(/^(Pak|Bu|Mas|Mbak|Ust|Ustadz|Dokter|Dr\.)\s+/i, '').trim();
        return (clean ? clean.charAt(0) : name.charAt(0)).toUpperCase();
      };

      filtered.forEach(function (m) {
        var tr = document.createElement('tr');
        var photoHtml = m.image
          ? '<img src="' + escapeHtml(m.image) + '" alt="' + escapeHtml(m.name) + '" style="width:42px; height:42px; border-radius:50%; object-fit:cover; border:2px solid var(--mint); display:block;">'
          : '<div style="width:42px; height:42px; border-radius:50%; background:var(--mint); color:var(--pine); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:1.1rem;">' + escapeHtml(helperInitial(m.name)) + '</div>';

        tr.innerHTML =
          '<td>' + photoHtml + '</td>' +
          '<td><strong>' + escapeHtml(m.name) + '</strong></td>' +
          '<td><span class="admin-badge admin-badge-success">' + escapeHtml(m.role || '-') + '</span></td>' +
          '<td><span style="font-size:0.9rem; color:var(--pine-deep); font-weight:500;">' + escapeHtml(m.category || '-') + '</span></td>' +
          '<td class="actions">' +
          '<button type="button" class="btn-action-icon" title="Edit" onclick="AdminApp.editMember(\'' + m.id + '\')">✏️</button> ' +
          '<button type="button" class="btn-action-icon is-danger" title="Hapus" onclick="AdminApp.deleteMember(\'' + m.id + '\')">🗑️</button>' +
          '</td>';
        tbody.appendChild(tr);
      });

      this.renderOverview();
    },

    openMemberModal: function (item) {
      document.getElementById('form-member').reset();
      document.getElementById('member-id').value = item ? item.id : '';
      document.getElementById('modal-member-title').textContent = item ? 'Ubah Data Pengurus' : 'Tambah Pengurus Baru';

      if (item) {
        document.getElementById('member-input-name').value = item.name || '';
        document.getElementById('member-input-role').value = item.role || '';
        document.getElementById('member-input-category').value = item.category || '';
        this.setImageUploaderValue('member', item.image || '');
      } else {
        var currentFilter = document.getElementById('filter-org-category') ? document.getElementById('filter-org-category').value : '';
        if (currentFilter && currentFilter !== 'semua') {
          document.getElementById('member-input-category').value = currentFilter;
        }
        this.setImageUploaderValue('member', '');
      }

      this.openModal('modal-member');
    },

    editMember: function (id) {
      var item = MasjidDB.getMembers().find(function (m) { return m.id === id; });
      if (item) this.openMemberModal(item);
    },

    deleteMember: function (id) {
      if (confirm('Yakin ingin menghapus pengurus ini dari susunan organisasi?')) {
        MasjidDB.deleteMember(id);
        this.renderOrganization();
        showToast('Pengurus berhasil dihapus.');
      }
    },

    openOrgMetaModal: function () {
      var org = MasjidDB.getOrganization();
      var meta = (org && org.meta) || {};
      document.getElementById('org-input-meta-title').value = meta.title || 'Struktur Takmir & Pengelola';
      document.getElementById('org-input-meta-period').value = meta.period || 'Perubahan ke-2 • Periode 2023 – Januari 2028';
      document.getElementById('org-input-meta-date').value = meta.effectiveDate || '01 September 2026';
      this.openModal('modal-org-meta');
    },

    // ----------------------------------------------------
    // 10. MODAL HELPER
    // ----------------------------------------------------
    openModal: function (modalId) {
      var m = document.getElementById(modalId);
      if (m) m.classList.add('is-open');
    },

    closeModal: function (modalId) {
      var m = document.getElementById(modalId);
      if (m) m.classList.remove('is-open');
    },

    // ----------------------------------------------------
    // 10B. IMAGE CROPPER TOOL (POTONG & PUSATKAN FOTO)
    // ----------------------------------------------------
    CropperTool: {
      activePrefix: null,
      activeCallback: null,
      currentDataUrl: null,
      originalImg: null,
      rotation: 0,
      zoom: 1.0,
      aspectRatio: 1,
      isMember: false,
      box: { x: 0, y: 0, w: 100, h: 100 },
      imgDisplay: { w: 100, h: 100, scale: 1, isRotated90: false },
      isDraggingBox: false,
      isResizingHandle: null,
      dragStart: { x: 0, y: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 },

      init: function () {
        var self = this;
        var modal = document.getElementById('modal-image-cropper');
        if (!modal) return;

        // Pilihan Rasio Aspek
        var ratioBtns = modal.querySelectorAll('.cropper-btn-pill');
        ratioBtns.forEach(function (btn) {
          btn.addEventListener('click', function () {
            ratioBtns.forEach(function (b) { b.classList.remove('is-active'); });
            btn.classList.add('is-active');
            var r = btn.getAttribute('data-ratio');
            if (r === '1:1') self.aspectRatio = 1;
            else if (r === '16:9') self.aspectRatio = 16 / 9;
            else if (r === '4:3') self.aspectRatio = 4 / 3;
            else self.aspectRatio = null;
            self.applyAspectRatioToBox();
          });
        });

        // Kontrol Zoom
        var zoomRange = document.getElementById('cropper-zoom-range');
        var btnZoomIn = document.getElementById('cropper-btn-zoom-in');
        var btnZoomOut = document.getElementById('cropper-btn-zoom-out');

        if (zoomRange) {
          zoomRange.addEventListener('input', function () {
            self.setZoom(parseInt(this.value, 10) / 100);
          });
        }
        if (btnZoomIn) {
          btnZoomIn.addEventListener('click', function () {
            self.setZoom(Math.min(3.0, self.zoom + 0.15));
          });
        }
        if (btnZoomOut) {
          btnZoomOut.addEventListener('click', function () {
            self.setZoom(Math.max(0.5, self.zoom - 0.15));
          });
        }

        // Scroll wheel zoom pada viewport
        var viewport = document.getElementById('cropper-viewport-wrap');
        if (viewport) {
          viewport.addEventListener('wheel', function (e) {
            e.preventDefault();
            var delta = e.deltaY < 0 ? 0.1 : -0.1;
            self.setZoom(Math.min(3.0, Math.max(0.5, self.zoom + delta)));
          }, { passive: false });
        }

        // Rotasi 90 derajat
        var btnRotate = document.getElementById('cropper-btn-rotate');
        if (btnRotate) {
          btnRotate.addEventListener('click', function () {
            self.rotation = (self.rotation + 90) % 360;
            self.updateImageDisplay(true);
          });
        }

        // Tombol Pusatkan Box ke Tengah Foto
        var btnCenter = document.getElementById('cropper-btn-center');
        if (btnCenter) {
          btnCenter.addEventListener('click', function () {
            self.centerBox();
          });
        }

        // Tombol Reset Ukuran Asli
        var btnReset = document.getElementById('cropper-btn-reset');
        if (btnReset) {
          btnReset.addEventListener('click', function () {
            self.zoom = 1.0;
            self.rotation = 0;
            self.updateImageDisplay(true);
          });
        }

        // Tombol Terapkan Potongan (Crop)
        var btnApply = document.getElementById('cropper-btn-apply');
        if (btnApply) {
          btnApply.addEventListener('click', function () {
            self.cropAndApply();
          });
        }

        // Pasang event pointer untuk drag & resize box
        self.bindPointerEvents();
      },

      setZoom: function (val) {
        this.zoom = Math.min(3.0, Math.max(0.5, val));
        var zoomRange = document.getElementById('cropper-zoom-range');
        var zoomLevel = document.getElementById('cropper-zoom-level');
        if (zoomRange) zoomRange.value = Math.round(this.zoom * 100);
        if (zoomLevel) zoomLevel.textContent = Math.round(this.zoom * 100) + '%';
        this.updateImageDisplay(false);
      },

      open: function (prefix, dataUrl, preferredRatio, callback) {
        var self = this;
        self.activePrefix = prefix;
        self.currentDataUrl = dataUrl;
        self.activeCallback = callback;
        self.rotation = 0;
        self.zoom = 1.0;
        self.isMember = (prefix === 'member');

        if (preferredRatio) {
          self.aspectRatio = preferredRatio;
        } else {
          self.aspectRatio = self.isMember ? 1 : 16 / 9;
        }

        var modal = document.getElementById('modal-image-cropper');
        if (!modal) return;

        // Sesuaikan tombol ratio aktif
        var ratioBtns = modal.querySelectorAll('.cropper-btn-pill');
        ratioBtns.forEach(function (btn) {
          var r = btn.getAttribute('data-ratio');
          var matches = false;
          if (self.aspectRatio === 1 && r === '1:1') matches = true;
          else if (self.aspectRatio && Math.abs(self.aspectRatio - 16 / 9) < 0.05 && r === '16:9') matches = true;
          else if (self.aspectRatio && Math.abs(self.aspectRatio - 4 / 3) < 0.05 && r === '4:3') matches = true;
          else if (self.aspectRatio === null && r === 'free') matches = true;
          btn.classList.toggle('is-active', matches);
        });

        // Tampilkan panduan lingkaran jika foto pengurus
        var circleGuide = document.getElementById('cropper-circle-guide');
        if (circleGuide) {
          circleGuide.classList.toggle('is-visible', self.isMember);
        }

        var targetImg = document.getElementById('cropper-target-img');
        self.originalImg = new Image();
        self.originalImg.onload = function () {
          if (targetImg) {
            targetImg.src = dataUrl;
          }
          modal.classList.add('is-open');
          setTimeout(function () {
            self.setZoom(1.0);
            self.updateImageDisplay(true);
          }, 60);
        };
        self.originalImg.onerror = function () {
          showToast('Format gambar tidak dapat dibaca untuk dipotong.', true);
        };
        self.originalImg.src = dataUrl;
      },

      close: function () {
        var modal = document.getElementById('modal-image-cropper');
        if (modal) modal.classList.remove('is-open');
      },

      updateImageDisplay: function (resetBox) {
        var self = this;
        var viewport = document.getElementById('cropper-viewport-wrap');
        var targetImg = document.getElementById('cropper-target-img');
        var stage = document.getElementById('cropper-stage');
        if (!viewport || !targetImg || !self.originalImg) return;

        var isRotated90 = (self.rotation === 90 || self.rotation === 270);
        var nw = isRotated90 ? self.originalImg.naturalHeight : self.originalImg.naturalWidth;
        var nh = isRotated90 ? self.originalImg.naturalWidth : self.originalImg.naturalHeight;

        if (!nw || !nh) return;

        var vw = viewport.clientWidth || 600;
        var vh = viewport.clientHeight || 400;

        var pad = 36;
        var fitW = vw - pad;
        var fitH = vh - pad;

        var scale = Math.min(fitW / nw, fitH / nh) * self.zoom;
        var dispW = Math.round(nw * scale);
        var dispH = Math.round(nh * scale);

        self.imgDisplay = {
          w: dispW,
          h: dispH,
          scale: scale,
          nw: nw,
          nh: nh,
          isRotated90: isRotated90
        };

        stage.style.width = dispW + 'px';
        stage.style.height = dispH + 'px';

        targetImg.style.width = (isRotated90 ? dispH : dispW) + 'px';
        targetImg.style.height = (isRotated90 ? dispW : dispH) + 'px';
        targetImg.style.transform = 'rotate(' + self.rotation + 'deg)';

        if (resetBox || !self.box || self.box.w <= 0) {
          self.initBoxPosition();
        } else {
          self.clampBox();
        }

        self.renderBox();
      },

      initBoxPosition: function () {
        var dispW = this.imgDisplay.w;
        var dispH = this.imgDisplay.h;
        var boxW, boxH;

        if (this.aspectRatio) {
          if (dispW / dispH > this.aspectRatio) {
            boxH = Math.round(dispH * 0.85);
            boxW = Math.round(boxH * this.aspectRatio);
          } else {
            boxW = Math.round(dispW * 0.85);
            boxH = Math.round(boxW / this.aspectRatio);
          }
        } else {
          boxW = Math.round(dispW * 0.82);
          boxH = Math.round(dispH * 0.82);
        }

        boxW = Math.max(40, Math.min(dispW, boxW));
        boxH = Math.max(40, Math.min(dispH, boxH));

        var boxX = Math.round((dispW - boxW) / 2);
        var boxY = Math.round((dispH - boxH) / 2);

        this.box = { x: boxX, y: boxY, w: boxW, h: boxH };
      },

      centerBox: function () {
        if (!this.box) return;
        var dispW = this.imgDisplay.w;
        var dispH = this.imgDisplay.h;
        this.box.x = Math.round((dispW - this.box.w) / 2);
        this.box.y = Math.round((dispH - this.box.h) / 2);
        this.clampBox();
        this.renderBox();
      },

      applyAspectRatioToBox: function () {
        if (!this.box) return;
        if (this.aspectRatio) {
          var dispW = this.imgDisplay.w;
          var dispH = this.imgDisplay.h;
          var targetW = this.box.w;
          var targetH = Math.round(targetW / this.aspectRatio);

          if (targetH > dispH) {
            targetH = Math.round(dispH * 0.85);
            targetW = Math.round(targetH * this.aspectRatio);
          }
          if (targetW > dispW) {
            targetW = Math.round(dispW * 0.85);
            targetH = Math.round(targetW / this.aspectRatio);
          }

          this.box.w = Math.max(40, targetW);
          this.box.h = Math.max(40, targetH);
          this.clampBox();
        }
        this.renderBox();
      },

      clampBox: function () {
        var dispW = this.imgDisplay.w;
        var dispH = this.imgDisplay.h;
        if (this.box.w > dispW) this.box.w = dispW;
        if (this.box.h > dispH) this.box.h = dispH;
        if (this.box.x < 0) this.box.x = 0;
        if (this.box.y < 0) this.box.y = 0;
        if (this.box.x + this.box.w > dispW) this.box.x = Math.max(0, dispW - this.box.w);
        if (this.box.y + this.box.h > dispH) this.box.y = Math.max(0, dispH - this.box.h);
      },

      renderBox: function () {
        var boxEl = document.getElementById('cropper-box');
        if (!boxEl) return;
        boxEl.style.left = this.box.x + 'px';
        boxEl.style.top = this.box.y + 'px';
        boxEl.style.width = this.box.w + 'px';
        boxEl.style.height = this.box.h + 'px';
      },

      bindPointerEvents: function () {
        var self = this;
        var boxEl = document.getElementById('cropper-box');
        if (!boxEl) return;

        // Event resize melalui handle
        var handles = boxEl.querySelectorAll('.cropper-handle');
        handles.forEach(function (h) {
          h.addEventListener('pointerdown', function (e) {
            e.stopPropagation();
            e.preventDefault();
            self.isResizingHandle = h.getAttribute('data-dir');
            self.dragStart = {
              x: e.clientX,
              y: e.clientY,
              boxX: self.box.x,
              boxY: self.box.y,
              boxW: self.box.w,
              boxH: self.box.h
            };
            h.setPointerCapture(e.pointerId);
          });

          h.addEventListener('pointermove', function (e) {
            if (!self.isResizingHandle) return;
            e.stopPropagation();
            e.preventDefault();
            self.handleResizeMove(e.clientX, e.clientY);
          });

          var stopResize = function (e) {
            if (self.isResizingHandle) {
              self.isResizingHandle = null;
              try { h.releasePointerCapture(e.pointerId); } catch (err) {}
            }
          };
          h.addEventListener('pointerup', stopResize);
          h.addEventListener('pointercancel', stopResize);
        });

        // Event drag geser posisi box
        boxEl.addEventListener('pointerdown', function (e) {
          if (e.target.classList.contains('cropper-handle')) return;
          e.preventDefault();
          self.isDraggingBox = true;
          self.dragStart = {
            x: e.clientX,
            y: e.clientY,
            boxX: self.box.x,
            boxY: self.box.y
          };
          boxEl.setPointerCapture(e.pointerId);
        });

        boxEl.addEventListener('pointermove', function (e) {
          if (!self.isDraggingBox) return;
          e.preventDefault();
          var dx = e.clientX - self.dragStart.x;
          var dy = e.clientY - self.dragStart.y;
          self.box.x = self.dragStart.boxX + dx;
          self.box.y = self.dragStart.boxY + dy;
          self.clampBox();
          self.renderBox();
        });

        var stopDrag = function (e) {
          if (self.isDraggingBox) {
            self.isDraggingBox = false;
            try { boxEl.releasePointerCapture(e.pointerId); } catch (err) {}
          }
        };
        boxEl.addEventListener('pointerup', stopDrag);
        boxEl.addEventListener('pointercancel', stopDrag);
      },

      handleResizeMove: function (clientX, clientY) {
        var self = this;
        var dx = clientX - self.dragStart.x;
        var dy = clientY - self.dragStart.y;
        var dir = self.isResizingHandle;
        var s = self.dragStart;
        var newX = s.boxX;
        var newY = s.boxY;
        var newW = s.boxW;
        var newH = s.boxH;
        var ratio = self.aspectRatio;

        if (dir.indexOf('r') !== -1) newW = Math.max(40, s.boxW + dx);
        if (dir.indexOf('b') !== -1) newH = Math.max(40, s.boxH + dy);
        if (dir.indexOf('l') !== -1) {
          var proposedW = s.boxW - dx;
          if (proposedW >= 40) {
            newW = proposedW;
            newX = s.boxX + dx;
          }
        }
        if (dir.indexOf('t') !== -1) {
          var proposedH = s.boxH - dy;
          if (proposedH >= 40) {
            newH = proposedH;
            newY = s.boxY + dy;
          }
        }

        if (ratio) {
          if (dir === 'ml' || dir === 'mr') {
            newH = Math.round(newW / ratio);
            newY = s.boxY + (s.boxH - newH) / 2;
          } else if (dir === 'tc' || dir === 'bc') {
            newW = Math.round(newH * ratio);
            newX = s.boxX + (s.boxW - newW) / 2;
          } else {
            var byWidth = Math.abs(dx) > Math.abs(dy);
            if (byWidth) {
              newH = Math.round(newW / ratio);
              if (dir.indexOf('t') !== -1) newY = s.boxY + (s.boxH - newH);
            } else {
              newW = Math.round(newH * ratio);
              if (dir.indexOf('l') !== -1) newX = s.boxX + (s.boxW - newW);
            }
          }
        }

        self.box.x = newX;
        self.box.y = newY;
        self.box.w = newW;
        self.box.h = newH;
        self.clampBox();
        self.renderBox();
      },

      cropAndApply: function () {
        var self = this;
        if (!self.originalImg || !self.box) return;

        var rotCanvas = document.createElement('canvas');
        var rotCtx = rotCanvas.getContext('2d');
        var nw = self.originalImg.naturalWidth;
        var nh = self.originalImg.naturalHeight;
        var rot = self.rotation;

        if (rot === 90 || rot === 270) {
          rotCanvas.width = nh;
          rotCanvas.height = nw;
        } else {
          rotCanvas.width = nw;
          rotCanvas.height = nh;
        }

        rotCtx.translate(rotCanvas.width / 2, rotCanvas.height / 2);
        rotCtx.rotate((rot * Math.PI) / 180);
        rotCtx.drawImage(self.originalImg, -nw / 2, -nh / 2);

        var scale = rotCanvas.width / self.imgDisplay.w;
        var srcX = Math.round(self.box.x * scale);
        var srcY = Math.round(self.box.y * scale);
        var srcW = Math.round(self.box.w * scale);
        var srcH = Math.round(self.box.h * scale);

        srcX = Math.max(0, Math.min(rotCanvas.width - 1, srcX));
        srcY = Math.max(0, Math.min(rotCanvas.height - 1, srcY));
        srcW = Math.min(rotCanvas.width - srcX, srcW);
        srcH = Math.min(rotCanvas.height - srcY, srcH);

        var maxDim = self.isMember ? 800 : 1200;
        var targetW = srcW;
        var targetH = srcH;
        if (targetW > maxDim || targetH > maxDim) {
          var r = Math.min(maxDim / targetW, maxDim / targetH);
          targetW = Math.round(targetW * r);
          targetH = Math.round(targetH * r);
        }
        targetW = Math.max(10, targetW);
        targetH = Math.max(10, targetH);

        var finalCanvas = document.createElement('canvas');
        finalCanvas.width = targetW;
        finalCanvas.height = targetH;
        var finalCtx = finalCanvas.getContext('2d');
        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = 'high';
        finalCtx.drawImage(rotCanvas, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

        var croppedDataUrl = finalCanvas.toDataURL('image/jpeg', 0.85);

        if (typeof self.activeCallback === 'function') {
          self.activeCallback(croppedDataUrl);
        }

        self.close();
        showToast('Foto berhasil dipotong & dipusatkan!');
      }
    },

    // ----------------------------------------------------
    // 10C. IMAGE UPLOADER HANDLER (HP / DESKTOP)
    // ----------------------------------------------------
    setupImageUploader: function (prefix, fallbackDefault, defaultAspectRatio) {
      var self = this;
      var fileInput = document.getElementById(prefix + '-file-input');
      var hiddenInput = document.getElementById(prefix + '-input-image');
      var previewContainer = document.getElementById(prefix + '-preview-container');
      var imgPreview = document.getElementById(prefix + '-img-preview');
      var fileInfo = document.getElementById(prefix + '-file-info');
      var btnRemove = document.getElementById(prefix + '-btn-remove');
      var btnCrop = document.getElementById(prefix + '-btn-crop');

      if (!fileInput || !hiddenInput) return;

      if (!self._originalImages) self._originalImages = {};

      var applyImage = function (dataUrl, note) {
        hiddenInput.value = dataUrl;
        if (imgPreview) imgPreview.src = dataUrl;
        if (previewContainer) previewContainer.style.display = 'flex';
        if (fileInfo) fileInfo.textContent = note || 'Foto siap disimpan';
      };

      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;

        if (fileInfo) fileInfo.textContent = 'Membuka pemotong foto...';
        var reader = new FileReader();
        reader.onload = function (e) {
          var rawDataUrl = e.target.result;
          self._originalImages[prefix] = rawDataUrl;

          // Buka modal crop otomatis agar posisi objek foto bisa disesuaikan pas di tengah
          self.CropperTool.open(prefix, rawDataUrl, defaultAspectRatio, function (croppedUrl) {
            applyImage(croppedUrl, file.name + ' (Dipangkas)');
          });
        };
        reader.readAsDataURL(file);
      });

      if (btnCrop) {
        btnCrop.addEventListener('click', function () {
          var currentImg = self._originalImages[prefix] || hiddenInput.value || (imgPreview && imgPreview.src);
          if (!currentImg) {
            showToast('Pilih foto terlebih dahulu sebelum memotong.', true);
            return;
          }
          self.CropperTool.open(prefix, currentImg, defaultAspectRatio, function (croppedUrl) {
            applyImage(croppedUrl, 'Foto dipotong ulang');
          });
        });
      }

      if (btnRemove) {
        btnRemove.addEventListener('click', function () {
          fileInput.value = '';
          hiddenInput.value = fallbackDefault || '';
          self._originalImages[prefix] = null;
          if (fallbackDefault && imgPreview) {
            imgPreview.src = fallbackDefault;
            if (fileInfo) fileInfo.textContent = 'Gambar bawaan';
          } else {
            if (previewContainer) previewContainer.style.display = 'none';
          }
          showToast('Foto direset.');
        });
      }
    },

    setImageUploaderValue: function (prefix, imageUrl) {
      var fileInput = document.getElementById(prefix + '-file-input');
      var hiddenInput = document.getElementById(prefix + '-input-image');
      var previewContainer = document.getElementById(prefix + '-preview-container');
      var imgPreview = document.getElementById(prefix + '-img-preview');
      var fileInfo = document.getElementById(prefix + '-file-info');

      if (!this._originalImages) this._originalImages = {};
      this._originalImages[prefix] = imageUrl || '';

      if (fileInput) fileInput.value = '';
      if (hiddenInput) hiddenInput.value = imageUrl || '';

      if (imageUrl) {
        if (imgPreview) imgPreview.src = imageUrl;
        if (previewContainer) previewContainer.style.display = 'flex';
        if (fileInfo) fileInfo.textContent = imageUrl.startsWith('data:') ? 'Foto kustom' : 'Gambar aktif';
      } else {
        if (previewContainer) previewContainer.style.display = 'none';
      }
    },

    // ----------------------------------------------------
    // 11. BIND FORM LISTENERS
    // ----------------------------------------------------
    bindForms: function () {
      var self = this;

      // Inisialisasi Uploader Gambar (HP / Desktop) dengan Pemotong Foto (Crop)
      self.setupImageUploader('ann', '', 16 / 9);
      self.setupImageUploader('act', 'images/poster-kajian.svg', 16 / 9);
      self.setupImageUploader('art', 'images/artikel-1.svg', 16 / 9);
      self.setupImageUploader('member', '', 1);

      // Form Submit Pengumuman
      var formAnn = document.getElementById('form-announcement');
      if (formAnn) {
        formAnn.addEventListener('submit', function (e) {
          e.preventDefault();
          var id = document.getElementById('ann-id').value;
          var title = document.getElementById('ann-input-title').value;
          var date = document.getElementById('ann-input-date').value;
          var tag = document.getElementById('ann-input-tag').value;
          var isUrgent = document.getElementById('ann-input-urgent').checked;
          var image = document.getElementById('ann-input-image').value;
          var content = document.getElementById('ann-input-content').value;

          var payload = {
            title: title,
            date: date,
            tag: tag,
            isUrgent: isUrgent,
            image: image,
            content: content
          };

          if (id) {
            MasjidDB.updateAnnouncement(id, payload);
            showToast('Pengumuman berhasil diperbarui!');
          } else {
            MasjidDB.addAnnouncement(payload);
            showToast('Pengumuman baru berhasil ditambahkan!');
          }

          self.closeModal('modal-announcement');
          self.renderAnnouncements();
        });
      }

      // Filter Kategori Kegiatan
      var filterAct = document.getElementById('filter-activity-category');
      if (filterAct) {
        filterAct.addEventListener('change', function () {
          self.renderActivities(this.value);
        });
      }

      // Form Submit Kegiatan
      var formAct = document.getElementById('form-activity');
      if (formAct) {
        formAct.addEventListener('submit', function (e) {
          e.preventDefault();
          var id = document.getElementById('act-id').value;
          var title = document.getElementById('act-input-title').value;
          var cat = document.getElementById('act-input-cat').value;
          var date = document.getElementById('act-input-date').value;
          var time = document.getElementById('act-input-time').value;
          var loc = document.getElementById('act-input-loc').value;
          var image = document.getElementById('act-input-image').value;
          var desc = document.getElementById('act-input-desc').value;

          var catLabels = {
            kajian: 'Kajian',
            pengajian: 'Pengajian',
            tpa: 'TPA/TPQ',
            jumat: 'Shalat Jumat',
            santunan: 'Santunan',
            sosial: 'Kegiatan sosial',
            ramadan: 'Ramadan'
          };

          var payload = {
            title: title,
            category: cat,
            categoryLabel: catLabels[cat] || cat,
            date: date,
            time: time,
            location: loc,
            image: image,
            description: desc
          };

          if (id) {
            MasjidDB.updateActivity(id, payload);
            showToast('Kegiatan berhasil diperbarui!');
          } else {
            MasjidDB.addActivity(payload);
            showToast('Kegiatan baru berhasil ditambahkan!');
          }

          self.closeModal('modal-activity');
          self.renderActivities();
        });
      }

      // Ganti Periode Keuangan
      var periodSelect = document.getElementById('admin-finance-period');
      if (periodSelect) {
        periodSelect.addEventListener('change', function () {
          self.renderPeriodData(this.value);
        });
      }

      // Hapus Periode Keuangan
      var btnDelPeriod = document.getElementById('btn-delete-period');
      if (btnDelPeriod) {
        btnDelPeriod.addEventListener('click', function () {
          if (confirm('Hapus seluruh data keuangan periode ini?')) {
            MasjidDB.deleteFinancePeriod(self.currentPeriod);
            self.renderFinances();
            showToast('Periode dihapus.');
          }
        });
      }

      // Form Tambah Periode Baru
      var formNewPeriod = document.getElementById('form-new-period');
      if (formNewPeriod) {
        formNewPeriod.addEventListener('submit', function (e) {
          e.preventDefault();
          var key = document.getElementById('period-key').value.trim();
          var label = document.getElementById('period-label').value.trim();
          var saldoAwal = Number(document.getElementById('period-saldo-awal').value) || 0;

          MasjidDB.setFinancePeriod(key, {
            label: label,
            saldoAwal: saldoAwal,
            pemasukan: [],
            pengeluaran: []
          });

          self.closeModal('modal-new-period');
          self.currentPeriod = key;
          self.renderFinances();
          showToast('Periode baru ' + label + ' berhasil dibuat!');
        });
      }

      // Form Tambah Pemasukan
      var formAddIncome = document.getElementById('form-add-income');
      if (formAddIncome) {
        formAddIncome.addEventListener('submit', function (e) {
          e.preventDefault();
          var tgl = document.getElementById('income-tgl').value.trim();
          var ket = document.getElementById('income-ket').value.trim();
          var jumlah = Number(document.getElementById('income-jumlah').value) || 0;

          MasjidDB.addFinanceTransaction(self.currentPeriod, 'pemasukan', {
            tgl: tgl,
            ket: ket,
            jumlah: jumlah
          });

          formAddIncome.reset();
          self.renderPeriodData(self.currentPeriod);
          showToast('Pemasukan sebesar ' + formatRupiah(jumlah) + ' berhasil dicatat.');
        });
      }

      // Form Tambah Pengeluaran
      var formAddExpense = document.getElementById('form-add-expense');
      if (formAddExpense) {
        formAddExpense.addEventListener('submit', function (e) {
          e.preventDefault();
          var tgl = document.getElementById('expense-tgl').value.trim();
          var ket = document.getElementById('expense-ket').value.trim();
          var jumlah = Number(document.getElementById('expense-jumlah').value) || 0;

          MasjidDB.addFinanceTransaction(self.currentPeriod, 'pengeluaran', {
            tgl: tgl,
            ket: ket,
            jumlah: jumlah
          });

          formAddExpense.reset();
          self.renderPeriodData(self.currentPeriod);
          showToast('Pengeluaran sebesar ' + formatRupiah(jumlah) + ' berhasil dicatat.');
        });
      }

      // Form Submit Artikel
      var formArt = document.getElementById('form-article');
      if (formArt) {
        formArt.addEventListener('submit', function (e) {
          e.preventDefault();
          var id = document.getElementById('art-id').value;
          var title = document.getElementById('art-input-title').value;
          var cat = document.getElementById('art-input-cat').value;
          var author = document.getElementById('art-input-author').value;
          var date = document.getElementById('art-input-date').value;
          var image = document.getElementById('art-input-image').value;
          var excerpt = document.getElementById('art-input-excerpt').value;
          var fullText = document.getElementById('art-input-full').value;

          var payload = {
            title: title,
            category: cat,
            author: author,
            date: date,
            image: image,
            excerpt: excerpt,
            fullText: fullText
          };

          if (id) {
            MasjidDB.updateArticle(id, payload);
            showToast('Artikel berhasil diperbarui!');
          } else {
            MasjidDB.addArticle(payload);
            showToast('Artikel baru berhasil diterbitkan!');
          }

          self.closeModal('modal-article');
          self.renderArticles();
        });
      }

      // Form Submit Bank
      var formBank = document.getElementById('form-bank');
      if (formBank) {
        formBank.addEventListener('submit', function (e) {
          e.preventDefault();
          var id = document.getElementById('bank-id').value;
          var name = document.getElementById('bank-input-name').value;
          var number = document.getElementById('bank-input-number').value;
          var owner = document.getElementById('bank-input-owner').value;
          var cleanNumber = number.replace(/[^0-9]/g, '');

          var don = MasjidDB.getDonations();
          if (!don.banks) don.banks = [];

          if (id) {
            var b = don.banks.find(function (x) { return x.id === id; });
            if (b) {
              b.name = name;
              b.number = number;
              b.cleanNumber = cleanNumber;
              b.owner = owner;
            }
          } else {
            don.banks.push({
              id: 'bank-' + Date.now(),
              name: name,
              number: number,
              cleanNumber: cleanNumber,
              owner: owner
            });
          }

          MasjidDB.updateDonations(don);
          self.closeModal('modal-bank');
          self.renderDonations();
          showToast('Rekening bank berhasil disimpan!');
        });
      }

      // Form Simpan Catatan Donasi
      var formDonNotes = document.getElementById('form-donation-notes');
      if (formDonNotes) {
        formDonNotes.addEventListener('submit', function (e) {
          e.preventDefault();
          var don = MasjidDB.getDonations();
          don.notes = document.getElementById('donation-notes').value;
          MasjidDB.updateDonations(don);
          showToast('Catatan petunjuk donasi berhasil disimpan!');
        });
      }

      // Filter Pesan Masuk
      var filterMsg = document.getElementById('filter-message-status');
      if (filterMsg) {
        filterMsg.addEventListener('change', function () {
          self.renderMessages(this.value);
        });
      }

      // Filter Divisi Pengurus Organisasi
      var filterOrg = document.getElementById('filter-org-category');
      if (filterOrg) {
        filterOrg.addEventListener('change', function () {
          self.renderOrganization(this.value);
        });
      }

      // Form Submit Pengurus (Tambah / Ubah)
      var formMember = document.getElementById('form-member');
      if (formMember) {
        formMember.addEventListener('submit', function (e) {
          e.preventDefault();
          var id = document.getElementById('member-id').value;
          var name = document.getElementById('member-input-name').value.trim();
          var role = document.getElementById('member-input-role').value.trim();
          var cat = document.getElementById('member-input-category').value.trim();
          var image = document.getElementById('member-input-image').value;

          var payload = {
            name: name,
            role: role,
            category: cat,
            image: image
          };

          if (id) {
            MasjidDB.updateMember(id, payload);
            showToast('Data pengurus berhasil diperbarui!');
          } else {
            MasjidDB.addMember(payload);
            showToast('Pengurus baru berhasil ditambahkan!');
          }

          self.closeModal('modal-member');
          self.renderOrganization();
        });
      }

      // Form Submit Pengaturan Periode Organisasi
      var formOrgMeta = document.getElementById('form-org-meta');
      if (formOrgMeta) {
        formOrgMeta.addEventListener('submit', function (e) {
          e.preventDefault();
          var title = document.getElementById('org-input-meta-title').value.trim();
          var period = document.getElementById('org-input-meta-period').value.trim();
          var date = document.getElementById('org-input-meta-date').value.trim();

          MasjidDB.updateOrganizationMeta({
            title: title,
            period: period,
            effectiveDate: date
          });

          self.closeModal('modal-org-meta');
          self.renderOrganization();
          showToast('Pengaturan periode kepengurusan berhasil disimpan!');
        });
      }

      // Form Pengaturan Info Masjid
      var info = MasjidDB.getInfo();
      if (document.getElementById('set-nama-masjid')) {
        document.getElementById('set-nama-masjid').value = info.nama || '';
        document.getElementById('set-tagline').value = info.tagline || '';
        document.getElementById('set-alamat').value = info.alamat || '';
        document.getElementById('set-whatsapp').value = info.whatsapp || '0856-4206-7333';
        if (document.getElementById('set-whatsapp-malam')) {
          document.getElementById('set-whatsapp-malam').value = info.whatsappMalam || '0858-6790-7527';
        }
        document.getElementById('set-email').value = info.email || '';
        document.getElementById('set-jam-buka').value = info.jamBuka || '';
      }

      var formSetInfo = document.getElementById('form-settings-info');
      if (formSetInfo) {
        formSetInfo.addEventListener('submit', function (e) {
          e.preventDefault();
          var updatedInfo = {
            nama: document.getElementById('set-nama-masjid').value,
            tagline: document.getElementById('set-tagline').value,
            alamat: document.getElementById('set-alamat').value,
            whatsapp: document.getElementById('set-whatsapp').value,
            whatsappMalam: document.getElementById('set-whatsapp-malam') ? document.getElementById('set-whatsapp-malam').value : (info.whatsappMalam || '0858-6790-7527'),
            email: document.getElementById('set-email').value,
            jamBuka: document.getElementById('set-jam-buka').value
          };
          MasjidDB.updateInfo(updatedInfo);
          self.loadHeaderInfo();
          showToast('Identitas masjid berhasil disimpan!');
        });
      }

      // Form Pengaturan Akun Admin
      var formSetAcc = document.getElementById('form-settings-account');
      if (formSetAcc) {
        formSetAcc.addEventListener('submit', function (e) {
          e.preventDefault();
          var name = document.getElementById('set-admin-name').value;
          var user = document.getElementById('set-admin-user').value;
          var currPass = document.getElementById('set-admin-curr-pass').value;
          var newPass = document.getElementById('set-admin-new-pass').value;

          var res = MasjidDB.updateAdminCredentials(currPass, user, newPass, name);
          if (res.success) {
            showToast(res.message);
            formSetAcc.reset();
            self.loadHeaderInfo();
          } else {
            alert(res.message);
          }
        });
      }

      // Backup JSON Export
      var btnExport = document.getElementById('btn-export-backup');
      if (btnExport) {
        btnExport.addEventListener('click', function () {
          var json = MasjidDB.exportJSON();
          var blob = new Blob([json], { type: 'application/json' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'backup-website-masjid-' + new Date().toISOString().split('T')[0] + '.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast('File backup berhasil diunduh!');
        });
      }

      // Backup JSON Import
      var fileImport = document.getElementById('file-import-backup');
      if (fileImport) {
        fileImport.addEventListener('change', function (e) {
          var file = e.target.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function (evt) {
            var res = MasjidDB.importJSON(evt.target.result);
            if (res.success) {
              alert('Data berhasil dipulihkan dari cadangan!');
              window.location.reload();
            } else {
              alert('Gagal memulihkan data: ' + res.error);
            }
          };
          reader.readAsText(file);
        });
      }

      // Factory Reset
      var btnResetAll = document.getElementById('btn-factory-reset');
      if (btnResetAll) {
        btnResetAll.addEventListener('click', function () {
          if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh database website ke data awal pabrik? Semua perubahan Anda akan hilang.')) {
            MasjidDB.reset();
            alert('Database website telah direset ke setelan awal.');
            window.location.reload();
          }
        });
      }
    }
  };

  // Mulai saat DOM siap
  document.addEventListener('DOMContentLoaded', function () {
    AdminApp.init();
  });
})();
