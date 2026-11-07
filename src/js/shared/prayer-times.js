/* ==========================================================
 shared/prayer-times.js — Jadwal salat, jam digital, hitung mundur.
 Sumber: MasjidDB + API Aladhan (Kemenag RI), cache harian per tanggal.
 ========================================================== */
import { pad2, formatMasehi, formatHijriah } from './utils/format.js';
import { $all, setText } from './utils/dom.js';

/* ------------------------------------------------------
   KONFIGURASI API JADWAL SALAT OTOMATIS
   Koordinat: Ampel, Kabupaten Boyolali, Jawa Tengah (-7.5333, 110.5833)
   Metode: 20 (Kementerian Agama RI / Kemenag)
   ------------------------------------------------------ */
var PRAYER_API_CONFIG = {
  latitude: -7.5333,
  longitude: 110.5833,
  method: 20, // Kemenag RI
  cacheKeyPrefix: 'masjid_syukur_jadwal_'
};

/* ------------------------------------------------------
   DATA DUMMY & SINKRONISASI DATABASE
   Jika MasjidDB tersedia di window, gunakan data dari MasjidDB
   ------------------------------------------------------ */
function getPrayerTimesData() {
  if (typeof window.MasjidDB !== 'undefined') {
    return window.MasjidDB.getPrayerTimes();
  }
  return [
    { id: 'imsak', name: 'Imsak', time: '03:59', salat: false },
    { id: 'subuh', name: 'Subuh', time: '04:09', salat: true },
    { id: 'terbit', name: 'Terbit', time: '05:23', salat: false },
    { id: 'dzuhur', name: 'Dzuhur', time: '11:32', salat: true },
    { id: 'ashar', name: 'Ashar', time: '14:41', salat: true },
    { id: 'maghrib', name: 'Maghrib', time: '17:36', salat: true },
    { id: 'isya', name: 'Isya', time: '18:45', salat: true }
  ];
}

// Sinkronisasi otomatis dari API jadwal salat
function syncPrayerTimesFromAPI() {
  var today = new Date();
  var day = pad2(today.getDate());
  var month = pad2(today.getMonth() + 1);
  var year = today.getFullYear();
  var dateString = day + '-' + month + '-' + year;
  var cacheKey = PRAYER_API_CONFIG.cacheKeyPrefix + dateString;

  // 1. Cek apakah jadwal hari ini sudah tersimpan di cache browser
  try {
    var cached = localStorage.getItem(cacheKey);
    if (cached) {
      var parsedCache = JSON.parse(cached);
      if (Array.isArray(parsedCache) && parsedCache.length > 0) {
        applyPrayerTimes(parsedCache);
        return;
      }
    }
  } catch (e) {
    // Abaikan error local storage
  }

  // 2. Jika belum ada atau berganti hari, ambil dari API Aladhan (Metode Kemenag RI)
  var apiUrl = 'https://api.aladhan.com/v1/timings/' + dateString +
    '?latitude=' + PRAYER_API_CONFIG.latitude +
    '&longitude=' + PRAYER_API_CONFIG.longitude +
    '&method=' + PRAYER_API_CONFIG.method;

  fetch(apiUrl)
    .then(function (response) {
      if (!response.ok) throw new Error('Network response not ok');
      return response.json();
    })
    .then(function (res) {
      if (res && res.data && res.data.timings) {
        var t = res.data.timings;
        var clean = function (str) {
          return str ? str.split(' ')[0].substring(0, 5) : '00:00';
        };

        var newPrayerList = [
          { id: 'imsak', name: 'Imsak', time: clean(t.Imsak), salat: false },
          { id: 'subuh', name: 'Subuh', time: clean(t.Fajr), salat: true },
          { id: 'terbit', name: 'Terbit', time: clean(t.Sunrise), salat: false },
          { id: 'dzuhur', name: 'Dzuhur', time: clean(t.Dhuhr), salat: true },
          { id: 'ashar', name: 'Ashar', time: clean(t.Asr), salat: true },
          { id: 'maghrib', name: 'Maghrib', time: clean(t.Maghrib), salat: true },
          { id: 'isya', name: 'Isya', time: clean(t.Isha), salat: true }
        ];

        // Simpan ke cache harian
        try {
          localStorage.setItem(cacheKey, JSON.stringify(newPrayerList));
        } catch (e) { }

        applyPrayerTimes(newPrayerList);
      }
    })
    .catch(function (err) {
      console.warn('Gagal memuat jadwal salat otomatis dari API, memakai jadwal lokal:', err);
    });
}

function applyPrayerTimes(prayerList) {
  if (typeof window.MasjidDB !== 'undefined' && typeof window.MasjidDB.updatePrayerTimes === 'function') {
    window.MasjidDB.updatePrayerTimes(prayerList);
  }
  renderPrayerTimes();
}

// Membuat objek Date untuk hari ini pada jam "JJ:MM"
function timeToDate(timeStr, baseDate) {
  var parts = timeStr.split(':');
  var d = new Date(baseDate.getTime());
  d.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
  return d;
}
/* ------------------------------------------------------
   1. JADWAL SALAT, JAM DIGITAL, COUNTDOWN, TANGGAL
   ------------------------------------------------------ */

// Mencari salat berikutnya
function getNextPrayer(now) {
  var prayersList = getPrayerTimesData();
  var prayers = prayersList.filter(function (p) { return p.salat; });
  for (var i = 0; i < prayers.length; i++) {
    var when = timeToDate(prayers[i].time, now);
    if (when > now) { return { prayer: prayers[i], when: when }; }
  }
  var tomorrow = new Date(now.getTime());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { prayer: prayers[0], when: timeToDate(prayers[0].time, tomorrow) };
}

// Menggambar daftar waktu salat ke setiap elemen [data-prayer-list]
function renderPrayerTimes() {
  var prayersList = getPrayerTimesData();
  $all('[data-prayer-list]').forEach(function (list) {
    list.innerHTML = '';
    prayersList.forEach(function (p) {
      var li = document.createElement('li');
      li.className = 'prayer-item' + (p.salat ? '' : ' is-minor');
      li.setAttribute('data-prayer', p.id);
      var name = document.createElement('span');
      name.className = 'prayer-name';
      name.textContent = p.name;
      var time = document.createElement('span');
      time.className = 'prayer-time';
      time.textContent = p.time;
      li.appendChild(name);
      li.appendChild(time);
      list.appendChild(li);
    });
  });
}

function tick() {
  var now = new Date();

  setText('[data-clock]', pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds()));
  setText('[data-date-masehi]', formatMasehi(now));
  setText('[data-date-hijri]', formatHijriah(now));

  var next = getNextPrayer(now);
  var diff = Math.max(0, Math.floor((next.when - now) / 1000));
  var h = Math.floor(diff / 3600);
  var m = Math.floor((diff % 3600) / 60);
  var s = diff % 60;

  setText('[data-countdown]', pad2(h) + ':' + pad2(m) + ':' + pad2(s));
  setText('[data-next-name]', next.prayer.name);
  setText('[data-next-time]', 'Pukul ' + next.prayer.time);

  // Tandai salat berikutnya pada daftar
  $all('.prayer-item').forEach(function (item) {
    item.classList.toggle('is-next', item.getAttribute('data-prayer') === next.prayer.id);
  });
}

export function initPrayerAndClock() {
  renderPrayerTimes();
  tick();
  setInterval(tick, 1000);
  // Sinkronisasi jadwal otomatis dari API (Kemenag - Ampel Boyolali)
  syncPrayerTimesFromAPI();
}
