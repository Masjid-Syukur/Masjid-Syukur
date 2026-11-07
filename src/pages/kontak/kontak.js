/* ==========================================================
   pages/kontak/kontak.js — Formulir kirim pesan jamaah.
   ========================================================== */
import { showToast } from '../../js/shared/components/toast.js';
import { initCommon } from '../../js/main.js';

/* ------------------------------------------------------
   11. FORM HUBUNGI KAMI DI kontak.html
   ------------------------------------------------------ */
function initContactForm() {
  var contactForm = document.getElementById('form-kirim-pesan');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var nama = document.getElementById('pesan-nama').value.trim();
    var kontak = document.getElementById('pesan-kontak').value.trim();
    var tipe = document.getElementById('pesan-tipe').value;
    var pesan = document.getElementById('pesan-isi').value.trim();

    if (typeof window.MasjidDB !== 'undefined') {
      window.MasjidDB.addMessage({
        nama: nama,
        kontak: kontak,
        tipe: tipe,
        pesan: pesan
      });
    }

    contactForm.reset();
    showToast('Alhamdulillah, pesan Anda telah berhasil dikirimkan ke pengurus!');
  });
}


document.addEventListener('DOMContentLoaded', function () {
initCommon();
initContactForm();
});
