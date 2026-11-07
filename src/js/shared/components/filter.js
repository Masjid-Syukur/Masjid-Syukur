/* ==========================================================
   js/shared/components/filter.js — Filter kartu berdasarkan [data-filter] & [data-category].
   ========================================================== */
import { $, $all } from '../utils/dom.js';

/* ------------------------------------------------------
   5. FILTER KEGIATAN
   ------------------------------------------------------ */
export function initFilter() {
  var buttons = $all('[data-filter]');
  var cards = $all('[data-category]');
  if (!buttons.length || !cards.length) { return; }
  var empty = $('.empty-state');

  buttons.forEach(function (btn) {
    btn.onclick = function () {
      var filter = btn.getAttribute('data-filter');
      var shown = 0;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      cards.forEach(function (card) {
        var match = filter === 'semua' || card.getAttribute('data-category') === filter;
        card.hidden = !match;
        if (match) { shown++; }
      });
      if (empty) { empty.classList.toggle('is-visible', shown === 0); }
    };
  });
}
