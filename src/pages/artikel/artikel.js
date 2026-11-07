/* ==========================================================
   pages/artikel/artikel.js — Artikel keislaman + feed berita nasional.
   ========================================================== */
import { escapeHtml, assetUrl } from '../../js/shared/utils/dom.js';
import { initNationalFeeds } from '../../js/shared/components/feeds.js';
import { initCommon } from '../../js/main.js';

  /* ------------------------------------------------------
 7. ARTIKEL: BACA SELENGKAPNYA
 ------------------------------------------------------ */
  function initArticles() {
$all('[data-toggle-article]').forEach(function (btn) {
  var target = document.getElementById(btn.getAttribute('aria-controls'));
  if (!target) { return; }
  btn.onclick = function () {
    var open = target.hidden;
    target.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Tutup artikel' : 'Baca selengkapnya';
  };
});
  }

function renderArtikelPage() {
if (typeof window.MasjidDB === 'undefined') return;
// 3. Artikel di artikel.html
var isArtikelPage = window.location.pathname.indexOf('/artikel/') !== -1;
if (isArtikelPage) {
  var artListContainer = document.getElementById('art-list-container');
  var artEmptyState = document.getElementById('art-empty-state');
  var artFilterBar = document.getElementById('art-filter-bar');

  if (artListContainer) {
    var artList = MasjidDB.getArticles();
    if (artList && artList.length > 0) {
      artListContainer.innerHTML = '';

      artList.forEach(function (art, idx) {
        var article = document.createElement('article');
        article.className = 'article reveal in-view';
        article.setAttribute('data-art-category', art.categorySlug || 'artikel-islami');
        if (idx > 0) { article.style.marginTop = '24px'; }

        // Parsed body paragraphs
        var formattedBody = (art.fullText || '').split('\n\n').map(function (p) {
          return '<p>' + escapeHtml(p).replace(/\n/g, '<br>') + '</p>';
        }).join('');

        // Category badge emoji
        var catEmoji = { 'artikel-islami': '📖', 'materi-kajian': '📝', 'ringkasan-khotbah': '🕌', 'video-ceramah': '🎬' };
        var emoji = catEmoji[art.categorySlug] || '📚';

        // Optional: quote box
        var quoteHtml = '';
        if (art.quoteArab) {
          quoteHtml =
            '<div class="article-quote-box">' +
            '<p>' + escapeHtml(art.quoteArab) + '</p>' +
            '<small>' + escapeHtml(art.quoteTranslation || '') + (art.quoteSource ? ' — ' + escapeHtml(art.quoteSource) : '') + '</small>' +
            '</div>';
        }

        // Optional: video embed
        var videoHtml = '';
        if (art.videoUrl) {
          videoHtml =
            '<div class="article-video-wrap">' +
            '<iframe src="' + escapeHtml(art.videoUrl) + '" title="Video: ' + escapeHtml(art.title) + '" allowfullscreen loading="lazy"></iframe>' +
            '</div>';
        }

        // Optional: download box
        var downloadHtml = '';
        if (art.downloadUrl) {
          downloadHtml =
            '<div class="article-download-box">' +
            '<div class="article-download-info">' +
            '<span class="dl-icon">📄</span>' +
            '<div><strong>' + escapeHtml(art.downloadLabel || 'Unduh Materi') + '</strong>' +
            (art.downloadSize ? '<span>' + escapeHtml(art.downloadSize) + '</span>' : '') +
            '</div></div>' +
            '<a href="' + escapeHtml(art.downloadUrl) + '" class="btn btn--primary btn--small" target="_blank" rel="noopener">Unduh</a>' +
            '</div>';
        }

        var btnLabel = art.videoUrl ? 'Tonton &amp; baca selengkapnya' : 'Baca selengkapnya';

        article.innerHTML =
          '<div class="article-thumb-wrap">' +
          '<img src="' + escapeHtml(assetUrl(art.image || 'images/depan-masjid.jpg')) + '" alt="' + escapeHtml(art.title) + '" loading="lazy">' +
          '<span class="article-thumb-badge">' + emoji + ' ' + escapeHtml(art.category) + '</span>' +
          '</div>' +
          '<div class="article-body">' +
          '<div class="article-meta-row">' +
          '<span class="article-author-tag">✍️ ' + escapeHtml(art.author || 'Takmir Masjid Syukur') + '</span>' +
          '<time datetime="' + escapeHtml(art.datetime || '') + '">' + escapeHtml(art.date) + '</time>' +
          '</div>' +
          '<h2 style="font-size:1.5rem">' + escapeHtml(art.title) + '</h2>' +
          '<p style="margin-top:8px">' + escapeHtml(art.excerpt) + '</p>' +
          '<div class="article-full" id="art-full-' + escapeHtml(art.id) + '" hidden>' +
          quoteHtml +
          videoHtml +
          formattedBody +
          downloadHtml +
          '</div>' +
          '<div class="article-actions">' +
          '<button type="button" class="btn btn--outline btn--small btn--inline" data-toggle-article aria-expanded="false" aria-controls="art-full-' + escapeHtml(art.id) + '">' + btnLabel + '</button>' +
          '</div>' +
          '</div>';
        artListContainer.appendChild(article);
      });
      initArticles(); // re-bind button listeners
    }
  }

  // Filter kategori artikel lokal (jika ada)
  if (artFilterBar) {
    var artFilterBtns = artFilterBar.querySelectorAll('[data-art-filter]');
    artFilterBtns.forEach(function (btn) {
      btn.onclick = function () {
        var filter = btn.getAttribute('data-art-filter');
        var allCards = (artListContainer || document.getElementById('art-list-container')).querySelectorAll('[data-art-category]');
        var shown = 0;
        artFilterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        allCards.forEach(function (card) {
          var match = filter === 'semua' || card.getAttribute('data-art-category') === filter;
          card.hidden = !match;
          if (match) { shown++; }
        });
        if (artEmptyState) { artEmptyState.hidden = shown > 0; }
      };
    });
  }
}
}

document.addEventListener('DOMContentLoaded', function () {
  initCommon();
  renderArtikelPage();
  initNationalFeeds();
});

window.addEventListener('masjid:data-synced', function () {
  renderArtikelPage();
});
