/* ==========================================================
   js/shared/utils/format.js — Utilitas format angka & tanggal.
   Fungsi murni tanpa akses DOM maupun penyimpanan.
   ========================================================== */

export function pad2(n) { return n < 10 ? '0' + n : String(n); }

export function formatRupiah(n) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n);
}

export function formatMasehi(now) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(now);
}

export function formatHijriah(now) {
  try {
    return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(now);
  } catch (e) {
    return 'Tidak tersedia di browser ini';
  }
}
