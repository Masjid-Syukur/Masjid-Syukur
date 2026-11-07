/* ==========================================================
   js/shared/components/materials-modal.js — Modal daftar materi kajian.
   Memasang window.showMaterialsModal(actId, actTitle) sebagai API global.
   ========================================================== */
import { escapeHtml } from '../utils/dom.js';

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

