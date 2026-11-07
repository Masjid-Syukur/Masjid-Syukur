/* ==========================================================
   js/shared/components/cards.js — Template kartu yang dipakai lintas halaman.
   buildActivityCard: halaman kegiatan (dengan kategori) & beranda.
   buildGalleryCard: halaman galeri & beranda.
   ========================================================== */
import { escapeHtml, assetUrl } from '../utils/dom.js';

export function buildActivityCard(act, withCategory) {
  var article = document.createElement('article');
  article.className = 'card reveal in-view';
  if (withCategory) article.setAttribute('data-category', act.category);

  article.innerHTML =
    '<img src="' + escapeHtml(assetUrl(act.image || 'images/kajian-rutin-ahad-pagi.jpg')) + '" alt="' + escapeHtml(act.title) + '" loading="lazy">' +
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
  return article;
}

export function buildGalleryCard(item) {
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'gallery-card gallery-item reveal in-view';
  btn.setAttribute('data-full', assetUrl(item.image || 'images/hero-masjid.jpg'));
  btn.setAttribute('data-caption', item.title);

  btn.innerHTML =
    '<img src="' + escapeHtml(assetUrl(item.image || 'images/hero-masjid.jpg')) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
    '<div class="gallery-card-overlay">' +
    '<h3 class="gallery-card-title">' + escapeHtml(item.title) + '</h3>' +
    '</div>';
  return btn;
}
