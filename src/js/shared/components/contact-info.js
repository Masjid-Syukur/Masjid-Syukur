/* ==========================================================
   js/shared/components/contact-info.js — Sinkronisasi info kontak dari MasjidDB
   ke tautan WhatsApp & email di seluruh halaman.
   ========================================================== */

export function syncContactInfo() {
  if (typeof window.MasjidDB === 'undefined') return;

// 0. Sinkronisasi nomor WhatsApp Takmir (Umum) ke seluruh footer dan halaman kontak
var info = MasjidDB.getInfo();
if (info && info.whatsapp) {
  var cleanWa = String(info.whatsapp).replace(/\D/g, '');
  if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.slice(1);
  var waLinks = document.querySelectorAll('a[href*="wa.me/"]');
  waLinks.forEach(function (link) {
    // Jangan ubah link di floating bar musafir karena khusus nomor pelayanan malam
    if (link.closest('#mobile-musafir-bar') || link.closest('#musafir-modal-sheet')) return;
    link.href = 'https://wa.me/' + cleanWa + '?text=' + encodeURIComponent("Assalamu'alaikum Takmir " + (info.nama || 'Masjid Syukur'));
    if (/^[\d\s\-+]{7,}$/.test(link.textContent.trim())) {
      link.textContent = info.whatsapp;
    }
  });
}

// 0b. Sinkronisasi email resmi masjid ke seluruh halaman
if (info && info.email) {
  var emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach(function (link) {
    link.href = 'mailto:' + info.email;
    if (link.textContent.trim().indexOf('@') !== -1) {
      link.textContent = info.email;
    }
  });
}
}
