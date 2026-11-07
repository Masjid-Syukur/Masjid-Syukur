/* ==========================================================
   pages/kegiatan/kegiatan.js — Daftar kegiatan + filter kategori.
   ========================================================== */
import { initCommon } from '../../js/main.js';
import { initFilter } from '../../js/shared/components/filter.js';
import { buildActivityCard } from '../../js/shared/components/cards.js';

function renderActivities() {
  if (typeof window.MasjidDB === 'undefined') return;
  var actContainer = document.querySelector('.grid--3');
  if (!actContainer) return;

  var actList = window.MasjidDB.getActivities();
  if (!actList || actList.length === 0) return;

  actContainer.innerHTML = '';
  actList.forEach(function (act) {
    actContainer.appendChild(buildActivityCard(act, true));
  });
  initFilter(); // re-bind filter listener untuk kartu baru
}

document.addEventListener('DOMContentLoaded', function () {
  initCommon();
  renderActivities();
});

window.addEventListener('masjid:data-synced', renderActivities);
