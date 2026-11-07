/* ==========================================================
   pages/pengumuman/pengumuman.js — Papan pengumuman jamaah.
   ========================================================== */
import { initCommon } from '../../js/main.js';
import { renderAnnouncements } from '../../js/shared/components/announcements.js';

document.addEventListener('DOMContentLoaded', function () {
  initCommon();
  renderAnnouncements();
});

window.addEventListener('masjid:data-synced', renderAnnouncements);
