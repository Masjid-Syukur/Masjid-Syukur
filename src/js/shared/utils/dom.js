/* ==========================================================
   js/shared/utils/dom.js — Helper DOM & resolusi aset.
   Dipakai oleh modul shared lain dan semua modul halaman.
   ========================================================== */

export function $(selector, root) { return (root || document).querySelector(selector); }

export function $all(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function setText(selector, text) {
  $all(selector).forEach(function (el) { if (el.textContent !== text) { el.textContent = text; } });
}

/* Resolusi path gambar dari data konten.
   Data konten menyimpan path relatif 'images/...' (data seed dan
   localStorage legacy). Base URL dihitung dari lokasi modul ini
   (import.meta.url), sehingga hasilnya benar berapa pun kedalaman
   halaman yang memakai, termasuk saat hosting di subpath.
   URL absolut (http/https/data/) diteruskan apa adanya. */
var ASSETS_BASE = new URL('../../../assets/', import.meta.url);

export function assetUrl(path) {
  if (!path || typeof path !== 'string') return path;
  if (path.indexOf('data:') === 0 || path.indexOf('http:') === 0 ||
    path.indexOf('https:') === 0 || path.indexOf('//') === 0 ||
    path.charAt(0) === '/') {
    return path;
  }
  return new URL(path, ASSETS_BASE).href;
}
