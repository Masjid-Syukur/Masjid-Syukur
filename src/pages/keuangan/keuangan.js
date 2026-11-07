/* ==========================================================
   pages/keuangan/keuangan.js — Laporan kas bulanan.
   ========================================================== */
import { $, setText } from '../../js/shared/utils/dom.js';
import { formatRupiah } from '../../js/shared/utils/format.js';
import { initCommon } from '../../js/main.js';

function getFinanceData() {
  if (typeof window.MasjidDB !== 'undefined') {
    return window.MasjidDB.getFinances();
  }
  return {
    '2026-10': {
      label: 'Oktober 2026',
      saldoAwal: 512000,
      pemasukan: [
        { id: 'in-10-1', tgl: '02 Okt 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 1", jumlah: 645000 },
        { id: 'in-10-2', tgl: '09 Okt 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 2", jumlah: 910000 },
        { id: 'in-10-3', tgl: '16 Okt 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 3", jumlah: 940000 },
        { id: 'in-10-4', tgl: '23 Okt 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 4", jumlah: 690000 },
        { id: 'in-10-5', tgl: '25 Okt 2026', ket: 'Subsidi infaq Salam Subuh Bulan Oktober 2026', jumlah: 341500 }
      ],
      pengeluaran: [
        { id: 'out-10-1', tgl: '05 Okt 2026', ket: 'Pulsa Listrik (Biaya Utilitas)', jumlah: 510000 },
        { id: 'out-10-2', tgl: '08 Okt 2026', ket: 'Langganan Internet (Biaya Utilitas)', jumlah: 250000 },
        { id: 'out-10-3', tgl: '01 Okt 2026', ket: 'Honor Marbot (Honorarium Rutin)', jumlah: 1000000 },
        { id: 'out-10-4', tgl: '01 Okt 2026', ket: 'Honor Pembantu Kebersihan (Honorarium Rutin)', jumlah: 200000 },
        { id: 'out-10-5', tgl: '01 Okt 2026', ket: 'Honor Pembantu Umum (Honorarium Rutin)', jumlah: 300000 },
        { id: 'out-10-6', tgl: '01 Okt 2026', ket: 'Honor Pelayanan Malam (Honorarium Rutin)', jumlah: 350000 },
        { id: 'out-10-7', tgl: '12 Okt 2026', ket: 'Pelayanan Dahaga (Gula + Teh + Kopi + Galon)', jumlah: 546000 },
        { id: 'out-10-8', tgl: '15 Okt 2026', ket: 'Air Mineral (Flow)', jumlah: 127000 },
        { id: 'out-10-9', tgl: '18 Okt 2026', ket: 'Majalah Suara Muhammadiyah Per bulan', jumlah: 50000 },
        { id: 'out-10-10', tgl: '22 Okt 2026', ket: 'Bahan-bahan Pewangi, Pembersih dll', jumlah: 107500 }
      ]
    },
    '2026-09': {
      label: 'September 2026',
      saldoAwal: 2076000,
      pemasukan: [
        { id: 'in-9-1', tgl: '04 Sep 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 1", jumlah: 760000 },
        { id: 'in-9-2', tgl: '11 Sep 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 2", jumlah: 635000 },
        { id: 'in-9-3', tgl: '18 Sep 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 3", jumlah: 540000 },
        { id: 'in-9-4', tgl: '25 Sep 2026', ket: "Kotak Infaq / Shodaqoh Jum'at 4", jumlah: 650000 },
        { id: 'in-9-5', tgl: '30 Sep 2026', ket: 'Subsidi infaq Salam Subuh Bulan September 2026', jumlah: 313000 }
      ],
      pengeluaran: [
        { id: 'out-9-1', tgl: '05 Sep 2026', ket: 'Pulsa Listrik (Biaya Utilitas)', jumlah: 263000 },
        { id: 'out-9-2', tgl: '08 Sep 2026', ket: 'Tagihan Internet (Biaya Utilitas)', jumlah: 250000 },
        { id: 'out-9-3', tgl: '01 Sep 2026', ket: 'Honor Marbot (Honorarium Rutin)', jumlah: 1000000 },
        { id: 'out-9-4', tgl: '01 Sep 2026', ket: 'Honor Pembantu Kebersihan (Honorarium Rutin)', jumlah: 200000 },
        { id: 'out-9-5', tgl: '01 Sep 2026', ket: 'Honor Pembantu Umum (Honorarium Rutin)', jumlah: 300000 },
        { id: 'out-9-6', tgl: '01 Sep 2026', ket: 'Tunggakan 1 Bulan yg lalu (Pembantu Umum)', jumlah: 300000 },
        { id: 'out-9-7', tgl: '01 Sep 2026', ket: 'Honor Pelayanan Malam (Honorarium Rutin)', jumlah: 350000 },
        { id: 'out-9-8', tgl: '10 Sep 2026', ket: 'Kajian Rutin Tarjih (1 Kali)', jumlah: 200000 },
        { id: 'out-9-9', tgl: '15 Sep 2026', ket: 'Belajar Tahsin (4 Kali) 1 Orang @ 50.000', jumlah: 200000 },
        { id: 'out-9-10', tgl: '20 Sep 2026', ket: "Jum'at Berkah/Kebersihan/Isah-Isah 2 Org (4 kali)", jumlah: 200000 },
        { id: 'out-9-11', tgl: '12 Sep 2026', ket: 'Pelayanan Dahaga (Gula + Teh + Kopi)', jumlah: 163000 },
        { id: 'out-9-12', tgl: '14 Sep 2026', ket: 'Air Galon (5 Kali)', jumlah: 40000 },
        { id: 'out-9-13', tgl: '16 Sep 2026', ket: 'Air Mineral (5 Kali) - Pembelian 1', jumlah: 52000 },
        { id: 'out-9-14', tgl: '19 Sep 2026', ket: 'Air Mineral (5 Kali) - Pembelian 2', jumlah: 52000 },
        { id: 'out-9-15', tgl: '22 Sep 2026', ket: 'Air Mineral (5 Kali) - Pembelian 3', jumlah: 78000 },
        { id: 'out-9-16', tgl: '26 Sep 2026', ket: 'Air Mineral (5 Kali) - Pembelian 4', jumlah: 52000 },
        { id: 'out-9-17', tgl: '18 Sep 2026', ket: 'Majalah Suara Muhammadiyah Per bulan', jumlah: 50000 },
        { id: 'out-9-18', tgl: '23 Sep 2026', ket: 'Bahan-bahan Pewangi', jumlah: 375000 },
        { id: 'out-9-19', tgl: '24 Sep 2026', ket: 'Lain-lain (Kunci, plastik, dll)', jumlah: 22000 },
        { id: 'out-9-20', tgl: '24 Sep 2026', ket: 'Mama Lemon (Pembersih)', jumlah: 15000 },
        { id: 'out-9-21', tgl: '28 Sep 2026', ket: 'Cuci Mukena dan Sarung Bulan Juli - September (3 Bln)', jumlah: 100000 },
        { id: 'out-9-22', tgl: '28 Sep 2026', ket: 'Tunggakan 2 Bulan yg lalu (Cuci Mukena, Sarung)', jumlah: 200000 }
      ]
    }
  };
}
/* ------------------------------------------------------
   6. LAPORAN KEUANGAN
   ------------------------------------------------------ */
function fillTable(tbody, rows) {
  if (!tbody) return 0;
  tbody.innerHTML = '';
  var total = 0;
  (rows || []).forEach(function (row) {
    var tr = document.createElement('tr');
    [['Tanggal', row.tgl, ''], ['Keterangan', row.ket, ''], ['Jumlah', formatRupiah(row.jumlah), 'num']]
      .forEach(function (cell) {
        var td = document.createElement('td');
        td.setAttribute('data-label', cell[0]);
        td.textContent = cell[1];
        if (cell[2]) { td.className = cell[2]; }
        tr.appendChild(td);
      });
    tbody.appendChild(tr);
    total += Number(row.jumlah) || 0;
  });
  return total;
}

function initFinance() {
  var select = $('#periode');
  if (!select) { return; }

  var financeData = getFinanceData();
  var keys = Object.keys(financeData).sort().reverse();
  select.innerHTML = '';

  keys.forEach(function (key) {
    var opt = document.createElement('option');
    opt.value = key;
    opt.textContent = financeData[key].label || key;
    select.appendChild(opt);
  });

  function render() {
    var financeCurrent = getFinanceData();
    var data = financeCurrent[select.value] || { label: '-', saldoAwal: 0, pemasukan: [], pengeluaran: [] };
    var totalIn = fillTable($('#tbody-pemasukan'), data.pemasukan);
    var totalOut = fillTable($('#tbody-pengeluaran'), data.pengeluaran);
    var saldo = (data.saldoAwal || 0) + totalIn - totalOut;

    setText('[data-periode]', data.label);
    setText('[data-sum="in"]', formatRupiah(totalIn));
    setText('[data-sum="out"]', formatRupiah(totalOut));
    setText('[data-sum="saldo"]', formatRupiah(saldo));
    setText('[data-sum="awal"]', formatRupiah(data.saldoAwal || 0));
    setText('[data-foot="in"]', formatRupiah(totalIn));
    setText('[data-foot="out"]', formatRupiah(totalOut));
  }
  select.addEventListener('change', render);
  render();
}

document.addEventListener('DOMContentLoaded', function () {
initCommon();
initFinance();
});

window.addEventListener('masjid:data-synced', initFinance);
