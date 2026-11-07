/* ==========================================================
   pages/zakat/zakat.js — Kalkulator zakat fitrah, maal, profesi.
   (Diekstrak dari skrip inline zakat.html)
   ========================================================== */
import { initCommon } from '../../js/main.js';

(function () {
  'use strict';

  function fmt(n) {
    return 'Rp ' + Math.round(n).toLocaleString('id-ID');
  }

  function fmtKg(n) {
    return (Number.isInteger(n) ? n : n.toFixed(1)) + ' kg';
  }

  function val(id) {
    var el = document.getElementById(id);
    if (!el) return 0;
    var v = parseFloat(el.value) || 0;
    return v < 0 ? 0 : v;
  }

  window.salinRekening = function (norek, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(norek).then(function () {
        var original = btn.textContent;
        btn.textContent = 'Tersalin!';
        setTimeout(function () { btn.textContent = original; }, 2000);
      });
    } else {
      alert('Nomor rekening: ' + norek);
    }
  };

  // Navigasi Tab
  var tabBtns = document.querySelectorAll('.zakat-tab-btn');
  var panels = document.querySelectorAll('.zakat-panel');
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-panel');
      tabBtns.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function (p) {
        p.classList.remove('is-active');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      var targetPanel = document.getElementById(target);
      if (targetPanel) targetPanel.classList.add('is-active');
    });
  });

  // 1. Logika Zakat Penghasilan Lazismu
  var selectMetodeNisab = document.getElementById('pghs-metode-nisab');
  var wrapEmas = document.getElementById('wrap-pghs-harga-emas');
  if (selectMetodeNisab && wrapEmas) {
    selectMetodeNisab.addEventListener('change', function () {
      wrapEmas.style.display = (this.value === 'emas') ? 'block' : 'none';
    });
  }

  var btnHitungPghs = document.getElementById('btn-hitung-penghasilan');
  if (btnHitungPghs) {
    btnHitungPghs.addEventListener('click', function () {
      var hargaBeras = val('pghs-harga-beras') || 15000;
      var metodeNisab = document.getElementById('pghs-metode-nisab').value;
      var hargaEmas = val('pghs-harga-emas') || 1550000;

      var gaji = val('pghs-gaji');
      var keb = val('pghs-kebutuhan');
      var utang = val('pghs-tanggungan');

      var totalPengurang = keb + utang;
      var bersih = Math.max(0, gaji - totalPengurang);

      var nisab = 0;
      var nisabLabel = '';
      if (metodeNisab === 'beras') {
        // Putusan Tarjih: 520 kg beras / bulan
        nisab = 520 * hargaBeras;
        nisabLabel = '520 kg beras @ ' + fmt(hargaBeras) + ' = ' + fmt(nisab) + '/bulan';
      } else {
        // Standar Emas: 85 gram / 12 bulan
        nisab = (85 * hargaEmas) / 12;
        nisabLabel = '85 gr emas / 12 bln = ' + fmt(nisab) + '/bulan';
      }

      var wajib = bersih >= nisab && bersih > 0;
      var zakat = wajib ? bersih * 0.025 : 0;

      var el = document.getElementById('result-penghasilan');
      el.style.display = 'block';

      if (wajib) {
        el.className = 'calc-result is-wajib';
        document.getElementById('pghs-result-title').textContent = 'Kewajiban: Wajib Zakat Penghasilan (2,5%)';
        document.getElementById('pghs-amount').textContent = fmt(zakat);
        document.getElementById('pghs-amount-label').textContent = '2,5% dari penghasilan bersih bulanan ' + fmt(bersih);
        document.getElementById('pghs-r-zakat').textContent = fmt(zakat) + ' / bulan';
      } else {
        el.className = 'calc-result is-tidak-wajib';
        document.getElementById('pghs-result-title').textContent = 'Keterangan: Belum Mencapai Batas Wajib Zakat';
        document.getElementById('pghs-amount').textContent = 'Belum Wajib Zakat';
        document.getElementById('pghs-amount-label').textContent = 'Penghasilan bersih ' + fmt(bersih) + ' masih di bawah batas nisab ' + fmt(nisab) + '. Sangat dianjurkan berinfaq/sedekah melalui Lazismu.';
        document.getElementById('pghs-r-zakat').textContent = 'Rp 0 (Dianjurkan Infaq Sukarela)';
      }

      document.getElementById('pghs-r-kotor').textContent = fmt(gaji) + ' / bulan';
      document.getElementById('pghs-r-pokok').textContent = fmt(totalPengurang) + ' / bulan';
      document.getElementById('pghs-r-bersih').textContent = fmt(bersih) + ' / bulan';
      document.getElementById('pghs-r-nisab').textContent = nisabLabel;
    });
  }

  var btnResetPghs = document.getElementById('reset-penghasilan');
  if (btnResetPghs) {
    btnResetPghs.addEventListener('click', function () {
      document.getElementById('pghs-gaji').value = 0;
      document.getElementById('pghs-kebutuhan').value = 0;
      document.getElementById('pghs-tanggungan').value = 0;
      document.getElementById('pghs-harga-beras').value = 15000;
      document.getElementById('pghs-metode-nisab').value = 'beras';
      if (wrapEmas) wrapEmas.style.display = 'none';
      document.getElementById('result-penghasilan').style.display = 'none';
    });
  }

  // 2. Logika Zakat Maal Lazismu
  var btnHitungMaal = document.getElementById('btn-hitung-maal');
  if (btnHitungMaal) {
    btnHitungMaal.addEventListener('click', function () {
      var he = val('maal-harga-emas') || 1550000;
      var nisab = 85 * he;

      var th = val('maal-tabungan') + val('maal-emas') + val('maal-investasi') + val('maal-piutang') + val('maal-usaha') + val('maal-lain');
      var ut = val('maal-utang');
      var hb = Math.max(0, th - ut);

      var wajib = hb >= nisab && hb > 0;
      var zakat = wajib ? hb * 0.025 : 0;

      var el = document.getElementById('result-maal');
      el.style.display = 'block';

      if (wajib) {
        el.className = 'calc-result is-wajib';
        document.getElementById('maal-result-title').textContent = 'Kewajiban: Wajib Zakat Maal (2,5%)';
        document.getElementById('maal-amount').textContent = fmt(zakat);
        document.getElementById('maal-amount-label').textContent = '2,5% dari harta bersih simpanan haul ' + fmt(hb);
        document.getElementById('maal-r-zakat').textContent = fmt(zakat);
      } else {
        el.className = 'calc-result is-tidak-wajib';
        document.getElementById('maal-result-title').textContent = 'Keterangan: Harta Simpanan Belum Mencapai Nisab';
        document.getElementById('maal-amount').textContent = 'Belum Wajib Zakat';
        document.getElementById('maal-amount-label').textContent = 'Harta bersih ' + fmt(hb) + ' masih di bawah nisab 85 gr emas (' + fmt(nisab) + '). Dianjurkan berinfaq sukarela.';
        document.getElementById('maal-r-zakat').textContent = 'Rp 0 (Belum Wajib)';
      }

      document.getElementById('maal-r-total-harta').textContent = fmt(th);
      document.getElementById('maal-r-utang').textContent = fmt(ut);
      document.getElementById('maal-r-bersih').textContent = fmt(hb);
      document.getElementById('maal-r-nisab').textContent = '85 gr @ ' + fmt(he) + ' = ' + fmt(nisab);
    });
  }

  var btnResetMaal = document.getElementById('reset-maal');
  if (btnResetMaal) {
    btnResetMaal.addEventListener('click', function () {
      ['maal-tabungan', 'maal-emas', 'maal-investasi', 'maal-piutang', 'maal-usaha', 'maal-lain', 'maal-utang'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = 0;
      });
      document.getElementById('maal-harga-emas').value = 1550000;
      document.getElementById('result-maal').style.display = 'none';
    });
  }

  // 3. Logika Zakat Fitrah Lazismu
  var btnHitungFitrah = document.getElementById('btn-hitung-fitrah');
  if (btnHitungFitrah) {
    btnHitungFitrah.addEventListener('click', function () {
      var j = val('fitrah-jiwa') || 1;
      var h = val('fitrah-harga-beras') || 15000;
      var m = document.getElementById('fitrah-metode').value;

      var kg = 2.5 * j;
      var uang = kg * h;

      var el = document.getElementById('result-fitrah');
      el.style.display = 'block';

      if (m === 'beras') {
        document.getElementById('fitrah-amount').textContent = fmtKg(kg) + ' Beras';
        document.getElementById('fitrah-amount-label').textContent = 'Atau senilai ' + fmt(uang) + ' jika ditunaikan dalam uang tunai.';
      } else {
        document.getElementById('fitrah-amount').textContent = fmt(uang);
        document.getElementById('fitrah-amount-label').textContent = 'Setara ' + fmtKg(kg) + ' beras pilihan @ ' + fmt(h) + ' / kg.';
      }

      document.getElementById('fitrah-r-jiwa').textContent = j + ' jiwa';
      document.getElementById('fitrah-r-beras').textContent = fmtKg(kg);
      document.getElementById('fitrah-r-total').textContent = (m === 'beras') ? fmtKg(kg) : fmt(uang);
    });
  }

  var btnResetFitrah = document.getElementById('reset-fitrah');
  if (btnResetFitrah) {
    btnResetFitrah.addEventListener('click', function () {
      document.getElementById('fitrah-jiwa').value = 1;
      document.getElementById('fitrah-harga-beras').value = 15000;
      document.getElementById('fitrah-metode').value = 'uang';
      document.getElementById('result-fitrah').style.display = 'none';
    });
  }

})();

document.addEventListener('DOMContentLoaded', initCommon);
