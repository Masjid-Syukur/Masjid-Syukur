/* ==========================================================
   js/main.js — Inisialisasi fitur global untuk semua
   halaman publik. Setiap modul halaman memanggil initCommon()
   sekali, lalu menjalankan logika khusus halamannya.
   ========================================================== */
import { initPrayerAndClock } from './shared/prayer-times.js';
import { initNav, initReveal, initYear, initMobileMusafirBar } from './shared/components/layout.js';
import { syncContactInfo } from './shared/components/contact-info.js';
import './shared/components/materials-modal.js';

export function initCommon() {
  initNav();
  initPrayerAndClock();
  initReveal();
  initYear();
  syncContactInfo();
  initMobileMusafirBar();

  // Sinkronisasi ulang info kontak jika data diperbarui dari Supabase
  window.addEventListener('masjid:data-synced', syncContactInfo);
}
