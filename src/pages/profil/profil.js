/* ==========================================================
   pages/profil/profil.js — Render struktur organisasi/kepengurusan.
   ========================================================== */
import { escapeHtml, assetUrl } from '../../js/shared/utils/dom.js';
import { initCommon } from '../../js/main.js';

function renderOrganization() {
  if (typeof window.MasjidDB === 'undefined') return;
// 5. Struktur Organisasi di profil.html
var orgContainer = document.getElementById('org-structure-groups');
if (orgContainer && typeof window.MasjidDB !== 'undefined') {
  var org = window.MasjidDB.getOrganization();
  if (org && org.members && org.members.length > 0) {
    var titleEl = document.getElementById('judul-struktur');
    var periodEl = document.getElementById('org-structure-period');
    var dateEl = document.getElementById('org-structure-date');

    if (org.meta) {
      if (titleEl && org.meta.title) titleEl.textContent = org.meta.title;
      if (periodEl && org.meta.period) periodEl.innerHTML = escapeHtml(org.meta.period);
      if (dateEl && org.meta.effectiveDate) {
        dateEl.innerHTML = '<em>' + escapeHtml(org.meta.effectiveDate) + '</em>';
      }
    }

    var groups = {};
    var categoryOrder = (org.categories && org.categories.slice()) || [];

    categoryOrder.forEach(function (cat) {
      groups[cat] = [];
    });

    org.members.forEach(function (m) {
      var cat = m.category || 'Lainnya';
      if (!groups[cat]) {
        groups[cat] = [];
        categoryOrder.push(cat);
      }
      groups[cat].push(m);
    });

    var helperInitial = function (name) {
      if (!name) return '•';
      var clean = name.replace(/^(Pak|Bu|Mas|Mbak|Ust|Ustadz|Dokter|Dr\.)\s+/i, '').trim();
      return (clean ? clean.charAt(0) : name.charAt(0)).toUpperCase();
    };

    var html = '';
    categoryOrder.forEach(function (cat) {
      var list = groups[cat];
      if (!list || list.length === 0) return;

      html += '<div class="org-group">';
      html += '<h3>' + escapeHtml(cat) + '</h3>';
      html += '<div class="org-grid">';

      list.forEach(function (m) {
        html += '<div class="person">';
        if (m.image) {
          html += '<img src="' + escapeHtml(assetUrl(m.image)) + '" alt="' + escapeHtml(m.name) + '" class="person-photo" loading="lazy">';
        } else {
          html += '<div class="person-avatar" aria-hidden="true">' + escapeHtml(helperInitial(m.name)) + '</div>';
        }
        html += '<strong>' + escapeHtml(m.name) + '</strong>';
        if (m.role) {
          html += '<span>' + escapeHtml(m.role) + '</span>';
        }
        html += '</div>';
      });

      html += '</div>';
      html += '</div>';
    });

    orgContainer.innerHTML = html;
  }
}

}

document.addEventListener('DOMContentLoaded', function () {
  initCommon();
  renderOrganization();
});

window.addEventListener('masjid:data-synced', renderOrganization);
