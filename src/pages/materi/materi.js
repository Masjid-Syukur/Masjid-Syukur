/* ==========================================================
   pages/materi/materi.js — Daftar materi kajian + pencarian/filter.
   (Diekstrak dari skrip inline materi.html)
   ========================================================== */
import { initCommon } from '../../js/main.js';

(function () {
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMateriPage() {
    var container = document.getElementById('materi-container');
    var filterBtns = document.querySelectorAll('#materi-filter-bar .filter-btn');
    var searchInput = document.getElementById('materi-search');
    if (!container) return;

    // Ambil data materi dari MasjidDB
    var materials = (window.MasjidDB && typeof window.MasjidDB.getMaterials === 'function')
      ? window.MasjidDB.getMaterials()
      : [];


    var currentFilter = 'semua';
    var currentSearch = '';

    // Deteksi parameter URL (?kajian=ahad-pagi / ?kajian=tarjih / ?kajian=tahsin)
    var urlParams = new URLSearchParams(window.location.search);
    var paramKajian = urlParams.get('kajian');
    if (paramKajian) {
      paramKajian = paramKajian.toLowerCase();
      if (paramKajian.indexOf('ahad') !== -1) currentFilter = 'ahad';
      else if (paramKajian.indexOf('tarjih') !== -1) currentFilter = 'tarjih';
      else if (paramKajian.indexOf('tahsin') !== -1) currentFilter = 'tahsin';

      filterBtns.forEach(function (btn) {
        var f = btn.getAttribute('data-filter');
        var active = (f === currentFilter);
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
    }

    function getCategoryInfo(mat) {
      var actId = (mat.activityId || '').toLowerCase();
      var title = (mat.title || '').toLowerCase();

      if (actId === 'act-tarjih' || title.indexOf('tarjih') !== -1) {
        return { key: 'tarjih', label: 'Kajian Rutin Tarjih', badgeClass: 'badge-tarjih' };
      }
      if (actId === 'act-tahsin' || title.indexOf('tahsin') !== -1) {
        return { key: 'tahsin', label: 'Tahsin Al-Qur\'an', badgeClass: 'badge-tahsin' };
      }
      return { key: 'ahad', label: 'Kajian Rutin Ahad Pagi', badgeClass: '' };
    }

    function renderList() {
      materials = (window.MasjidDB && typeof window.MasjidDB.getMaterials === 'function')
        ? window.MasjidDB.getMaterials()
        : [];

      var filtered = materials.filter(function (mat) {
        var info = getCategoryInfo(mat);

        // Filter Kategori
        if (currentFilter !== 'semua' && info.key !== currentFilter) {
          return false;
        }

        // Filter Pencarian
        if (currentSearch) {
          var q = currentSearch.toLowerCase();
          var matchTitle = (mat.title || '').toLowerCase().indexOf(q) !== -1;
          var matchSpeaker = (mat.speaker || '').toLowerCase().indexOf(q) !== -1;
          var matchSummary = (mat.summary || '').toLowerCase().indexOf(q) !== -1;
          if (!matchTitle && !matchSpeaker && !matchSummary) return false;
        }

        return true;
      });

      container.innerHTML = '';
      if (filtered.length === 0) {
        var emptyTitle = materials.length === 0 ? 'Belum Ada Berkas Materi' : 'Materi Tidak Ditemukan';
        var emptyDesc = materials.length === 0
          ? 'Belum ada berkas materi kajian yang diunggah. Pengurus takmir akan segera mengunggah materi kajian terbaru.'
          : 'Tidak ada materi kajian yang sesuai dengan pencarian atau filter yang dipilih.';
        container.innerHTML =
          '<div class="materi-empty-state">' +
          '<div class="materi-empty-icon">📄</div>' +
          '<h3 style="margin:0 0 6px; color:var(--pine-deep);">' + emptyTitle + '</h3>' +
          '<p style="margin:0; font-size:0.9rem;">' + emptyDesc + '</p>' +
          '</div>';
        return;
      }

      filtered.forEach(function (mat) {
        var info = getCategoryInfo(mat);
        var isPdf = mat.pdfUrl && mat.pdfUrl !== '#';
        var dlHref = isPdf ? escapeHtml(mat.pdfUrl) : '#';
        var dlClick = isPdf ? '' : 'onclick="alert(\'File PDF ' + escapeHtml(mat.title) + ' berhasil diunduh.\'); return false;"';

        var card = document.createElement('article');
        card.className = 'materi-card';
        card.innerHTML =
          '<div>' +
          '<div class="materi-header">' +
          '<span class="materi-badge ' + info.badgeClass + '">' + escapeHtml(info.label) + '</span>' +
          '<h3 class="materi-title">' + escapeHtml(mat.title) + '</h3>' +
          '</div>' +
          '<ul class="materi-meta">' +
          '<li><span>✍️</span> <strong>' + escapeHtml(mat.speaker || 'Pemateri') + '</strong></li>' +
          '<li><span>📅</span> <span>' + escapeHtml(mat.date || '-') + '</span></li>' +
          '<li><span>📦</span> <span>' + escapeHtml(mat.pdfSize || 'PDF') + '</span></li>' +
          '</ul>' +
          '<p class="materi-summary">' + escapeHtml(mat.summary || '') + '</p>' +
          '</div>' +
          '<div class="materi-actions">' +
          '<a href="' + dlHref + '" download ' + dlClick + ' target="_blank" class="btn-download-pdf">' +
          '📥 Unduh Materi PDF' +
          '</a>' +
          '<button type="button" class="btn-share-mat" title="Bagikan Materi" onclick="shareMaterial(\'' + escapeHtml(mat.title) + '\')">' +
          '🔗 Bagikan' +
          '</button>' +
          '</div>';

        container.appendChild(card);
      });
    }

    // Event Filter Buttons
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        currentFilter = btn.getAttribute('data-filter');
        renderList();
      });
    });

    // Event Search Input
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        currentSearch = this.value.trim();
        renderList();
      });
    }

    renderList();
  }

  window.shareMaterial = function (title) {
    var text = 'Materi Kajian Masjid Syukur Ampel:\n*' + title + '*\n\nUnduh materi lengkap di: ' + window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        alert('Tautan dan info materi berhasil disalin ke clipboard! Silakan bagikan ke WhatsApp.');
      });
    } else {
      alert('Bagikan materi:\n\n' + text);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMateriPage);
  } else {
    initMateriPage();
  }

  // Re-render otomatis saat data dari Supabase selesai disinkronisasi
  window.addEventListener('masjid:data-synced', function () {
    initMateriPage();
  });
})();

document.addEventListener('DOMContentLoaded', initCommon);
