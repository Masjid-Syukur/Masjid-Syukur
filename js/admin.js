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
      this.initClock();
      this.loadHeaderInfo();
      this.renderOverview();
      this.renderPrayerTimes();
      this.renderAnnouncements();
      this.renderActivities();
      this.renderFinances();
      this.renderArticles();
      this.renderDonations();
      this.renderMessages();
      this.bindForms();
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
        'sec-prayer': 'Kelola Jadwal Salat',
        'sec-announcements': 'Kelola Pengumuman',
        'sec-activities': 'Kelola Kegiatan & Agenda',
        'sec-finances': 'Kelola Laporan Keuangan',
        'sec-articles': 'Kelola Artikel & Berita',
        'sec-donations': 'Kelola Rekening Donasi',
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
        'sec-prayer': 'Kelola Jadwal Salat',
        'sec-announcements': 'Kelola Pengumuman',
        'sec-activities': 'Kelola Kegiatan & Agenda',
        'sec-finances': 'Kelola Laporan Keuangan',
        'sec-articles': 'Kelola Artikel & Berita',
        'sec-donations': 'Kelola Rekening Donasi',
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

    initClock: function () {
      function tick() {
        var now = new Date();
        var str = String(now.getHours()).padStart(2, '0') + ':' +
                  String(now.getMinutes()).padStart(2, '0') + ':' +
                  String(now.getSeconds()).padStart(2, '0');
        var el = document.getElementById('admin-live-clock');
        if (el) el.textContent = str;
      }
      tick();
      setInterval(tick, 1000);
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
      var prayers = MasjidDB.getPrayerTimes();

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

      // Preview Jadwal Salat di Overview
      var prayerListEl = document.getElementById('overview-prayer-list');
      if (prayerListEl) {
        prayerListEl.innerHTML = '';
        prayers.forEach(function (p) {
          var chip = document.createElement('div');
          chip.style.cssText = 'background:#f4f9f7; border:1px solid var(--line); border-radius:8px; padding:10px 18px; text-align:center; min-width:90px;';
          chip.innerHTML = '<span style="display:block; font-size:0.8rem; color:var(--muted); font-weight:600;">' + p.name + '</span>' +
                           '<strong style="font-size:1.15rem; color:var(--pine); font-variant-numeric:tabular-nums;">' + p.time + '</strong>';
          prayerListEl.appendChild(chip);
        });
      }
    },

    // ----------------------------------------------------
    // 3. JADWAL SALAT
    // ----------------------------------------------------
    renderPrayerTimes: function () {
      var prayers = MasjidDB.getPrayerTimes();
      var container = document.getElementById('prayer-inputs-container');
      if (!container) return;

      container.innerHTML = '';
      prayers.forEach(function (p) {
        var box = document.createElement('div');
        box.className = 'prayer-edit-box';
        box.innerHTML =
          '<h4>' + p.name + (p.salat ? ' (Wajib)' : ' (Penanda)') + '</h4>' +
          '<input type="time" name="prayer_' + p.id + '" value="' + p.time + '" required>';
        container.appendChild(box);
      });
    },

    savePrayerTimes: function () {
      var prayers = MasjidDB.getPrayerTimes();
      var updated = prayers.map(function (p) {
        var input = document.querySelector('input[name="prayer_' + p.id + '"]');
        return {
          id: p.id,
          name: p.name,
          time: input ? input.value : p.time,
          salat: p.salat
        };
      });
      MasjidDB.updatePrayerTimes(updated);
      showToast('Jadwal salat berhasil diperbarui!');
      this.renderOverview();
    },

    resetPrayerTimes: function () {
      if (confirm('Kembalikan jadwal salat ke nilai default?')) {
        var defaultTimes = [
          { id: 'imsak',   name: 'Imsak',   time: '04:20', salat: false },
          { id: 'subuh',   name: 'Subuh',   time: '04:30', salat: true },
          { id: 'terbit',  name: 'Terbit',  time: '05:45', salat: false },
          { id: 'dzuhur',  name: 'Dzuhur',  time: '11:55', salat: true },
          { id: 'ashar',   name: 'Ashar',   time: '15:10', salat: true },
          { id: 'maghrib', name: 'Maghrib', time: '17:52', salat: true },
          { id: 'isya',    name: 'Isya',    time: '19:05', salat: true }
        ];
        MasjidDB.updatePrayerTimes(defaultTimes);
        this.renderPrayerTimes();
        this.renderOverview();
        showToast('Jadwal salat dikembalikan ke nilai default.');
      }
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
    // 10B. IMAGE UPLOADER HANDLER (HP / DESKTOP)
    // ----------------------------------------------------
    setupImageUploader: function (prefix, fallbackDefault) {
      var fileInput = document.getElementById(prefix + '-file-input');
      var hiddenInput = document.getElementById(prefix + '-input-image');
      var previewContainer = document.getElementById(prefix + '-preview-container');
      var imgPreview = document.getElementById(prefix + '-img-preview');
      var fileInfo = document.getElementById(prefix + '-file-info');
      var btnRemove = document.getElementById(prefix + '-btn-remove');

      if (!fileInput || !hiddenInput) return;

      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;

        if (fileInfo) fileInfo.textContent = 'Memproses foto...';
        compressImageFile(file, 1200, 900, 0.82, function (dataUrl) {
          hiddenInput.value = dataUrl;
          if (imgPreview) imgPreview.src = dataUrl;
          if (previewContainer) previewContainer.style.display = 'flex';
          if (fileInfo) fileInfo.textContent = file.name + ' (' + Math.round(file.size / 1024) + ' KB)';
          showToast('Foto berhasil dimuat!');
        });
      });

      if (btnRemove) {
        btnRemove.addEventListener('click', function () {
          fileInput.value = '';
          hiddenInput.value = fallbackDefault || '';
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

      if (fileInput) fileInput.value = '';
      if (hiddenInput) hiddenInput.value = imageUrl || '';

      if (imageUrl) {
        if (imgPreview) imgPreview.src = imageUrl;
        if (previewContainer) previewContainer.style.display = 'flex';
        if (fileInfo) fileInfo.textContent = imageUrl.startsWith('data:') ? 'Foto kustom dari perangkat' : 'Gambar aktif';
      } else {
        if (previewContainer) previewContainer.style.display = 'none';
      }
    },

    // ----------------------------------------------------
    // 11. BIND FORM LISTENERS
    // ----------------------------------------------------
    bindForms: function () {
      var self = this;

      // Inisialisasi Uploader Gambar (HP / Desktop)
      self.setupImageUploader('ann', '');
      self.setupImageUploader('act', 'images/poster-kajian.svg');
      self.setupImageUploader('art', 'images/artikel-1.svg');

      // Form Jadwal Salat
      var btnSavePrayer = document.getElementById('btn-save-prayer');
      if (btnSavePrayer) {
        btnSavePrayer.addEventListener('click', function () {
          self.savePrayerTimes();
        });
      }
      var btnResetPrayer = document.getElementById('btn-reset-prayer');
      if (btnResetPrayer) {
        btnResetPrayer.addEventListener('click', function () {
          self.resetPrayerTimes();
        });
      }

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

      // Form Pengaturan Info Masjid
      var info = MasjidDB.getInfo();
      if (document.getElementById('set-nama-masjid')) {
        document.getElementById('set-nama-masjid').value = info.nama || '';
        document.getElementById('set-tagline').value = info.tagline || '';
        document.getElementById('set-alamat').value = info.alamat || '';
        document.getElementById('set-whatsapp').value = info.whatsapp || '';
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
