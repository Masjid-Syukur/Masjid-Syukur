/* ==========================================================
   js/shared/components/announcements.js — Render daftar pengumuman dari MasjidDB.
   Dipakai halaman pengumuman dan beranda.
   ========================================================== */
import { $, escapeHtml, assetUrl } from '../utils/dom.js';

export function renderAnnouncements() {
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
      var imgEl = ann.image ? '<img src="' + escapeHtml(assetUrl(ann.image)) + '" alt="' + escapeHtml(ann.title) + '" loading="lazy">' : '';

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
}
