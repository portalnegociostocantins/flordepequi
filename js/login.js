(function () {
  'use strict';
  var KEY = 'fdp-auth';
  var A = window.ADMIN_AUTH || {};
  var login = document.getElementById('login'), panel = document.getElementById('panel');
  var msg = document.getElementById('login-msg'), pass = document.getElementById('login-pass');

  function sha256(text) {
    var bytes = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', bytes).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }
  function show(ok) { login.hidden = ok; panel.hidden = !ok; if (ok) window.scrollTo(0, 0); else pass.focus(); }

  var unlocked = false;
  try { unlocked = sessionStorage.getItem(KEY) === A.hash; } catch (e) {}
  show(unlocked);

  var fails = 0, lockedUntil = 0;
  document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (Date.now() < lockedUntil) { msg.textContent = 'Aguarde alguns segundos para tentar de novo.'; return; }
    if (!(window.crypto && crypto.subtle)) { msg.textContent = 'Este navegador não consegue verificar a senha aqui. Abra o painel pelo endereço https do site.'; return; }
    sha256((A.salt || '') + pass.value).then(function (h) {
      if (h === A.hash) {
        try { sessionStorage.setItem(KEY, h); } catch (err) {}
        pass.value = ''; msg.textContent = ''; fails = 0; show(true);
      } else {
        fails++; msg.textContent = 'Senha incorreta.';
        if (fails >= 3) { lockedUntil = Date.now() + 5000 * fails; msg.textContent = 'Senha incorreta. Aguarde alguns segundos antes de tentar de novo.'; }
        pass.select();
      }
    });
  });
  document.getElementById('btn-logout').addEventListener('click', function () {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    show(false);
  });
})();
