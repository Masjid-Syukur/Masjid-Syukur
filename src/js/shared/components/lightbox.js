/* ==========================================================
   js/shared/components/lightbox.js — Penampil foto diperbesar untuk item galeri.
   ========================================================== */
import { $, $all } from '../utils/dom.js';

/* ------------------------------------------------------
   3. LIGHTBOX GALERI
   ------------------------------------------------------ */
export function initLightbox() {
  var items = $all('.gallery-item');
  if (!items.length) { return; }

  var current = 0;
  var lastFocused = null;

  var oldBox = $('.lightbox');
  if (oldBox) { oldBox.remove(); }

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Tampilan foto diperbesar');
  box.innerHTML =
    '<button type="button" class="lightbox-btn lightbox-close" aria-label="Tutup">&times;</button>' +
    '<button type="button" class="lightbox-btn lightbox-prev" aria-label="Foto sebelumnya">&#8249;</button>' +
    '<img src="" alt="">' +
    '<p class="lightbox-caption"></p>' +
    '<button type="button" class="lightbox-btn lightbox-next" aria-label="Foto berikutnya">&#8250;</button>';
  document.body.appendChild(box);

  var img = $('img', box);
  var caption = $('.lightbox-caption', box);
  var closeBtn = $('.lightbox-close', box);

  function show(index) {
    current = (index + items.length) % items.length;
    var item = items[current];
    img.src = item.getAttribute('data-full');
    img.alt = item.getAttribute('data-caption');
    caption.textContent = item.getAttribute('data-caption') + '  (' + (current + 1) + ' dari ' + items.length + ')';
  }
  function open(index) {
    lastFocused = document.activeElement;
    show(index);
    box.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function close() {
    box.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused) { lastFocused.focus(); }
  }

  items.forEach(function (item, i) {
    item.addEventListener('click', function () { open(i); });
  });
  closeBtn.addEventListener('click', close);
  $('.lightbox-prev', box).addEventListener('click', function () { show(current - 1); });
  $('.lightbox-next', box).addEventListener('click', function () { show(current + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) { close(); } });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('is-open')) { return; }
    if (e.key === 'Escape') { close(); }
    if (e.key === 'ArrowLeft') { show(current - 1); }
    if (e.key === 'ArrowRight') { show(current + 1); }
  });
}

