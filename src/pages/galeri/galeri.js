/* ==========================================================
   pages/galeri/galeri.js — Galeri dokumentasi + filter + lightbox.
   ========================================================== */
import { initCommon } from '../../js/main.js';
import { initFilter } from '../../js/shared/components/filter.js';
import { initLightbox } from '../../js/shared/components/lightbox.js';
import { buildGalleryCard } from '../../js/shared/components/cards.js';

function renderGalleryPage() {
  if (typeof window.MasjidDB === 'undefined' || !window.MasjidDB.getGallery) return;
  var container = document.getElementById('gallery-container');
  if (!container) return;

  var allGal = window.MasjidDB.getGallery();
  if (!allGal || allGal.length === 0) return;

  container.innerHTML = '';
  allGal.forEach(function (item) {
    container.appendChild(buildGalleryCard(item));
  });
}

document.addEventListener('DOMContentLoaded', function () {
  initCommon();
  renderGalleryPage();
  initFilter();
  initLightbox();
});

window.addEventListener('masjid:data-synced', function () {
  renderGalleryPage();
  initLightbox();
});
