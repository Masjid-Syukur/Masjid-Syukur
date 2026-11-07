/* ==========================================================
   js/shared/components/layout.js — Kerangka halaman: navigasi HP, animasi scroll,
   tahun footer otomatis, dan bilah akses cepat musafir (mobile).
   ========================================================== */
import { $, $all, setText } from '../utils/dom.js';

/* ------------------------------------------------------
   2. NAVIGASI HP (HAMBURGER MENU)
   ------------------------------------------------------ */
export function initNav() {
  var toggle = $('.nav-toggle');
  var nav = $('#site-nav');
  if (!toggle || !nav) { return; }

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  }

  toggle.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
  });
  $all('a', nav).forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 1140) { setOpen(false); }
  });
}

/* ------------------------------------------------------
   8. ANIMASI SCROLL SEDERHANA
   ------------------------------------------------------ */
export function initReveal() {
  var items = $all('.reveal');
  if (!items.length) { return; }
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(function (el) { observer.observe(el); });
}
/* ------------------------------------------------------
   9. TAHUN OTOMATIS DI FOOTER
   ------------------------------------------------------ */
export function initYear() {
  setText('[data-year]', String(new Date().getFullYear()));
}

/* ------------------------------------------------------
   12. BILAH AKSI CEPAT MUSAFIR (MOBILE FLOATING BAR)
   Khusus tampilan smartphone (jalur arteri Solo-Semarang)
   ------------------------------------------------------ */
export function initMobileMusafirBar() {
  if (document.getElementById('mobile-musafir-bar')) return;

  var waNumber = '6285867907527';
  var mosqueName = "Masjid Syukur Ampel Boyolali";
  if (typeof window.MasjidDB !== 'undefined' && typeof window.MasjidDB.getInfo === 'function') {
    var info = window.MasjidDB.getInfo();
    var malam = info && (info.whatsappMalam || info.whatsapp);
    if (malam) {
      waNumber = String(malam).replace(/\D/g, '');
      if (waNumber.startsWith('0')) waNumber = '62' + waNumber.slice(1);
    }
    if (info && info.nama) {
      mosqueName = info.nama;
    }
  }

  var mapsUrl = 'https://www.google.com/maps/dir/?api=1&destination=-7.44796043268759,110.53998776688994&travelmode=driving';
  var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent("Assalamu'alaikum Pelayanan 24 Jam " + mosqueName + ", saya musafir dalam perjalanan, butuh informasi singgah & fasilitas.");

  // Buat HTML Floating Action Bar
  var bar = document.createElement('nav');
  bar.id = 'mobile-musafir-bar';
  bar.className = 'mobile-musafir-bar';
  bar.setAttribute('aria-label', 'Bilah Akses Cepat Musafir');
  bar.innerHTML = [
    '<div class="musafir-bar-inner">',
    '  <a href="' + mapsUrl + '" target="_blank" rel="noopener" class="musafir-bar-item" id="musafir-btn-maps">',
    '    <div class="musafir-bar-icon-wrap">',
    '      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    '    </div>',
    '    <span>Rute Maps</span>',
    '  </a>',
    '  <button type="button" class="musafir-bar-item is-highlight" id="musafir-btn-sheet">',
    '    <div class="musafir-bar-icon-wrap">',
    '      <span class="musafir-badge-dot" aria-hidden="true"></span>',
    '      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
    '    </div>',
    '    <span>Layanan 24J</span>',
    '  </button>',
    '  <a href="' + waUrl + '" target="_blank" rel="noopener" class="musafir-bar-item" id="musafir-btn-wa">',
    '    <div class="musafir-bar-icon-wrap">',
    '      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
    '    </div>',
    '    <span>WA Malam 24J</span>',
    '  </a>',
    '  <a href="../jadwal/index.html" class="musafir-bar-item" id="musafir-btn-salat">',
    '    <div class="musafir-bar-icon-wrap">',
    '      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    '    </div>',
    '    <span id="musafir-label-next">Jadwal Salat</span>',
    '  </a>',
    '</div>'
  ].join('');

  // Buat HTML Bottom Sheet Fasilitas Musafir
  var sheet = document.createElement('div');
  sheet.id = 'musafir-modal-sheet';
  sheet.className = 'musafir-modal-backdrop';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-hidden', 'true');
  sheet.innerHTML = [
    '<div class="musafir-sheet-card">',
    '  <div class="musafir-sheet-handle-bar"><span class="sheet-pill"></span></div>',
    '  <div class="musafir-sheet-header">',
    '    <div class="sheet-title-group">',
    '      <span class="sheet-status-pill">● Terbuka 24 Jam Penuh</span>',
    '      <h3>Layanan Ramah Musafir</h3>',
    '      <p>Masjid Syukur Ampel terbuka lebar menyambut musafir di jalur Solo–Semarang.</p>',
    '    </div>',
    '    <button type="button" class="musafir-sheet-close" id="musafir-sheet-close" aria-label="Tutup">&times;</button>',
    '  </div>',
    '  <div class="musafir-sheet-body">',
    '    <div class="musafir-feature-grid">',
    '      <div class="feature-item">',
    '        <div class="feature-icon">☕</div>',
    '        <div>',
    '          <strong>Kopi, Teh &amp; Air Gratis 24 Jam</strong>',
    '          <span>Tersedia dispenser &amp; aneka seduhan hangat cuma-cuma untuk melepas penat di perjalanan.</span>',
    '        </div>',
    '      </div>',
    '      <div class="feature-item">',
    '        <div class="feature-icon">🛏️</div>',
    '        <div>',
    '          <strong>Kasur &amp; Ruang Rehat Musafir</strong>',
    '          <span>Bagi musafir yang mengantuk berat, silakan beristirahat nyaman agar perjalanan tetap selamat.</span>',
    '        </div>',
    '      </div>',
    '      <div class="feature-item">',
    '        <div class="feature-icon">🚿</div>',
    '        <div>',
    '          <strong>Toilet &amp; Tempat Wudhu Harum Bersih</strong>',
    '          <span>Terawat berkala dengan standar kebersihan tinggi dan pasokan air sejuk pegunungan Boyolali.</span>',
    '        </div>',
    '      </div>',
    '      <div class="feature-item">',
    '        <div class="feature-icon">🅿️</div>',
    '        <div>',
    '          <strong>Parkir Luas &amp; Aman</strong>',
    '          <span>Tepat di tepi jalan arteri nasional, aman untuk mobil pribadi, motor, hingga bus rombongan.</span>',
    '        </div>',
    '      </div>',
    '      <div class="feature-item">',
    '        <div class="feature-icon">📶</div>',
    '        <div>',
    '          <strong>Wi-Fi Gratis &amp; Colokan Listrik</strong>',
    '          <span>Mudah mengisi daya baterai HP dan mengakses navigasi/komunikasi perjalanan.</span>',
    '        </div>',
    '      </div>',
    '    </div>',
    '    <div class="musafir-sheet-actions">',
    '      <a href="' + mapsUrl + '" target="_blank" rel="noopener" class="btn btn--primary sheet-btn">',
    '        🧭 Navigasi Google Maps Sekarang',
    '      </a>',
    '      <a href="' + waUrl + '" target="_blank" rel="noopener" class="btn btn--outline sheet-btn">',
    '        💬 Hubungi Pelayanan Malam di WhatsApp',
    '      </a>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('');

  document.body.appendChild(bar);
  document.body.appendChild(sheet);

  var btnSheet = document.getElementById('musafir-btn-sheet');
  var btnClose = document.getElementById('musafir-sheet-close');

  var openSheet = function () {
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sheet-open');
  };

  var closeSheet = function () {
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sheet-open');
  };

  if (btnSheet) btnSheet.addEventListener('click', openSheet);
  if (btnClose) btnClose.addEventListener('click', closeSheet);

  sheet.addEventListener('click', function (e) {
    if (e.target === sheet) closeSheet();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet();
  });

  // Update label salat berikutnya di bar
  var updateBarPrayerLabel = function () {
    var nextEl = document.querySelector('[data-next-name]');
    var barLabel = document.getElementById('musafir-label-next');
    if (nextEl && barLabel && nextEl.textContent && nextEl.textContent !== 'Memuat...') {
      barLabel.textContent = nextEl.textContent;
    }
  };
  setTimeout(updateBarPrayerLabel, 700);
  setInterval(updateBarPrayerLabel, 5000);
}

