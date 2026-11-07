/* ==========================================================
   pages/donasi/donasi.js — Render rekening donasi + salin nomor.
   ========================================================== */
import { $, escapeHtml } from '../../js/shared/utils/dom.js';
import { initCopy } from '../../js/shared/components/toast.js';
import { initCommon } from '../../js/main.js';

function renderBanks() {
  if (typeof window.MasjidDB === 'undefined') return;
// 4. Rekening di donasi.html
var isDonasiPage = window.location.pathname.indexOf('/donasi/') !== -1;
if (isDonasiPage) {
  var bankGrid = $('#judul-rekening') ? $('#judul-rekening').closest('.container').querySelector('.grid--2, .grid--3, .grid') : null;
  var don = MasjidDB.getDonations();
  if (bankGrid && don && don.banks && don.banks.length > 0) {
    bankGrid.innerHTML = '';
    don.banks.forEach(function (b) {
      var card = document.createElement('div');
      card.className = 'card bank reveal in-view';
      var noteHtml = b.keterangan ? '<p style="font-size:0.85rem; color:var(--muted); margin-bottom:14px; line-height:1.4;">' + escapeHtml(b.keterangan) + '</p>' : '';
      card.innerHTML =
        '<p class="bank-name">' + escapeHtml(b.name) + '</p>' +
        '<p class="bank-number">' + escapeHtml(b.number) + '</p>' +
        '<p class="bank-owner">a.n. ' + escapeHtml(b.owner) + '</p>' +
        noteHtml +
        '<button type="button" class="btn btn--outline btn--small" data-copy="' + escapeHtml(b.cleanNumber || b.number.replace(/\s+/g, '')) + '">' +
        '<span class="ic ic-copy" aria-hidden="true"></span> Salin Nomor Rekening' +
        '</button>';
      bankGrid.appendChild(card);
    });
    initCopy(); // re-bind copy listeners
  }
}
}

document.addEventListener('DOMContentLoaded', function () {
  initCommon();
  initCopy();
  renderBanks();
});

window.addEventListener('masjid:data-synced', renderBanks);
