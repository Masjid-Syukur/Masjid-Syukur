/* ==========================================================
   pages/home/home.js — Beranda: pengumuman, kegiatan terdekat,
   galeri terbaru, dan feed berita nasional.
   ========================================================== */
import { initCommon } from '../../js/main.js';
import { renderAnnouncements } from '../../js/shared/components/announcements.js';
import { initNationalFeeds } from '../../js/shared/components/feeds.js';
import { initLightbox } from '../../js/shared/components/lightbox.js';
import { buildActivityCard, buildGalleryCard } from '../../js/shared/components/cards.js';

function renderHomeActivities() {
  if (typeof window.MasjidDB === 'undefined') return;
  var container = document.getElementById('home-activities-container');
  if (!container) return;

  var acts = window.MasjidDB.getActivities();
  if (!acts || acts.length === 0) return;

  container.innerHTML = '';
  acts.slice(0, 3).forEach(function (act) {
    container.appendChild(buildActivityCard(act, false));
  });
}

function renderHomeGallery() {
  if (typeof window.MasjidDB === 'undefined' || !window.MasjidDB.getGallery) return;
  var container = document.getElementById('home-gallery-container');
  if (!container) return;

  var list = window.MasjidDB.getGallery();
  if (!list || list.length === 0) return;

  container.innerHTML = '';
  list.slice(0, 6).forEach(function (item) {
    container.appendChild(buildGalleryCard(item));
  });
}

function renderHomeDynamic() {
  renderAnnouncements();
  renderHomeActivities();
  renderHomeGallery();
  initLightbox(); // re-bind item galeri hasil render
}

document.addEventListener('DOMContentLoaded', function () {
  initCommon();
  renderHomeDynamic();
  initNationalFeeds();
});

window.addEventListener('masjid:data-synced', renderHomeDynamic);
