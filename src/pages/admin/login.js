/* ==========================================================
   pages/admin/login.js — Formulir login pengurus.
   (Diekstrak dari skrip inline login.html)
   ========================================================== */

    (function () {
  // Jika sudah login, langsung alihkan ke halaman admin
  if (typeof MasjidDB !== 'undefined' && MasjidDB.isLoggedIn()) {
    window.location.replace('index.html');
    return;
  }

  var form = document.getElementById('form-login');
  var usernameInput = document.getElementById('username');
  var passwordInput = document.getElementById('password');
  var rememberInput = document.getElementById('remember-me');
  var alertBox = document.getElementById('login-alert');
  var btnSubmit = document.getElementById('btn-submit');
  var btnText = document.getElementById('btn-text');
  var toggleEye = document.getElementById('toggle-password');

  // Toggle visibilitas password
  toggleEye.addEventListener('click', function () {
    var isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleEye.innerHTML = isPassword 
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
  });

  // Submit form login: KHUSUS SUPABASE AUTH (Tanpa Fallback Lokal)
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    alertBox.classList.remove('is-visible');

    var email = usernameInput.value.trim();
    var password = passwordInput.value;
    var remember = rememberInput.checked;

    if (!email.includes('@')) {
      alertBox.querySelector('.alert-text').textContent = 'Masukkan alamat email yang valid.';
      alertBox.classList.add('is-visible');
      usernameInput.focus();
      return;
    }

    btnSubmit.disabled = true;
    btnText.textContent = 'Memverifikasi ke Supabase...';

    if (typeof window.MasjidSupabase === 'undefined' || !window.MasjidSupabase.isReady()) {
      alertBox.querySelector('.alert-text').textContent = 'Layanan Supabase belum terhubung. Periksa koneksi internet.';
      alertBox.classList.add('is-visible');
      btnSubmit.disabled = false;
      btnText.textContent = 'Masuk ke Dashboard';
      return;
    }

    try {
      var sbRes = await window.MasjidSupabase.login(email, password);
      if (sbRes.success) {
        btnText.textContent = 'Login Berhasil! Mengalihkan...';
        var displayName = (sbRes.user.user_metadata && sbRes.user.user_metadata.display_name) || sbRes.user.email.split('@')[0];
        MasjidDB.setSession({
          user: sbRes.user.email,
          displayName: displayName,
          email: sbRes.user.email,
          token: (sbRes.session && sbRes.session.access_token) || ('sb_' + Date.now())
        }, remember);

        setTimeout(function () {
          window.location.replace('index.html');
        }, 300);
      } else {
        var errMsg = sbRes.message || 'Email atau password salah!';
        if (errMsg.includes('Invalid login credentials')) {
          errMsg = 'Email atau password tidak terdaftar di Supabase.';
        }
        alertBox.querySelector('.alert-text').textContent = errMsg;
        alertBox.classList.add('is-visible');
        btnSubmit.disabled = false;
        btnText.textContent = 'Masuk ke Dashboard';
        passwordInput.focus();
        passwordInput.select();
      }
    } catch (err) {
      alertBox.querySelector('.alert-text').textContent = 'Terjadi kesalahan jaringan saat menghubungi Supabase.';
      alertBox.classList.add('is-visible');
      btnSubmit.disabled = false;
      btnText.textContent = 'Masuk ke Dashboard';
    }
  });
})();
