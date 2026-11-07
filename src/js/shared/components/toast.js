/* ==========================================================
   js/shared/components/toast.js — Notifikasi toast & salin teks (mis. nomor rekening).
   ========================================================== */
import { $, $all } from '../utils/dom.js';

/* ------------------------------------------------------
   4. SALIN NOMOR REKENING + PESAN (TOAST)
   ------------------------------------------------------ */
var toastTimer = null;
export function showToast(message) {
  var toast = $('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
}

function fallbackCopy(text) {
  var area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  var ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  document.body.removeChild(area);
  return ok;
}

export function initCopy() {
  $all('[data-copy]').forEach(function (btn) {
    btn.onclick = function () {
      var text = btn.getAttribute('data-copy');
      var original = btn.innerHTML;

      function done(success) {
        if (success) {
          btn.textContent = 'Tersalin';
          showToast('Nomor rekening tersalin');
          setTimeout(function () { btn.innerHTML = original; }, 2000);
        } else {
          showToast('Gagal menyalin. Salin nomor secara manual.');
        }
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { done(true); },
          function () { done(fallbackCopy(text)); }
        );
      } else {
        done(fallbackCopy(text));
      }
    };
  });
}

