(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function safeUrl(u) { u = String(u || '').trim(); return /^https?:\/\//i.test(u) ? u : ''; }
  function safeSrc(u) {
    u = String(u || '').trim();
    return /^(https?:\/\/|assets\/|\.\/|\/)/i.test(u) ? u : 'assets/fotos/' + u;
  }
  function lines(a) { return (a || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join(''); }

  // Conteúdo: js/content.js. Com ?preview=1 usa o rascunho salvo pelo painel (admin.html).
  var s = window.SITE_CONTENT || {};
  if (/[?&]preview=1/.test(location.search)) {
    try {
      var d = localStorage.getItem('fdp-rascunho');
      if (d) s = JSON.parse(d);
    } catch (e) {}
  }

  var COLOR_VARS = {
    wood: '--wood', wood2: '--wood-2', wood3: '--wood-3', line: '--line', ink: '--ink', inkDim: '--ink-dim',
    pequi: '--pequi', pequiInk: '--pequi-ink', brasa: '--brasa', folha: '--folha'
  };
  Object.keys(s.colors || {}).forEach(function (k) {
    if (COLOR_VARS[k] && /^#[0-9a-f]{3,8}$/i.test(s.colors[k])) {
      document.documentElement.style.setProperty(COLOR_VARS[k], s.colors[k]);
    }
  });
  if (s.site && s.site.title) document.title = s.site.title;
  if (s.site && s.site.description) {
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', s.site.description);
  }

  var LOGO = safeSrc(s.logo || 'assets/logo.png');
  var SV = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  var I = {
    pin: SV + ' width="18" height="18"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    check: SV + ' width="20" height="20" stroke-width="3"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    ig: SV + ' width="26" height="26"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
    fb: SV + ' width="26" height="26"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z"/></svg>',
    link: SV + ' width="26" height="26"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
    copy: SV + ' width="18" height="18"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
    wa: SV + ' width="20" height="20"><path d="M4 20l1.2-4.1A8 8 0 1 1 8.2 19z"/><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1.2-1.2-1.8-1-.8.6c-.8-.3-1.6-1.1-1.9-1.9l.6-.8-1-1.8z" fill="currentColor" stroke="none"/></svg>',
    out: SV + ' width="16" height="16"><path d="M7 17L17 7M9 7h8v8"/></svg>'
  };

  function logoImg() {
    return '<img src="' + esc(LOGO) + '" alt="Logo da Flor de Pequi Churrascaria" width="640" height="345">';
  }
  function waUrl() {
    var w = s.whatsapp || {};
    var digits = String(w.phone || '').replace(/\D/g, '');
    if (!w.enabled || !digits) return '';
    return 'https://wa.me/' + digits + (w.message ? '?text=' + encodeURIComponent(w.message) : '');
  }
  function iconFor(url) {
    return /instagram/i.test(url) ? I.ig : /facebook|fb\.com/i.test(url) ? I.fb : I.link;
  }

  var SECTIONS = {
    cardapio: function () {
      return '<section class="sec" id="cardapio"><div class="wrap"><div class="sec-head"><p class="eyebrow">' + esc(s.menuEyebrow) + '</p><h2>' + esc(s.menuTitle) + '</h2></div><div class="rows">' +
        (s.blocks || []).map(function (b) {
          return '<article class="row"><div class="big"><span class="big-n">' + esc(b.big) + '</span><span class="big-s">' + esc(b.small) + '</span></div><div class="row-body"><h3>' + esc(b.title) + '</h3><p>' + esc(b.text) + '</p></div></article>';
        }).join('') + '</div>' +
        ((s.photos && s.photos.length) ? '<ul class="gallery">' + s.photos.map(function (p) {
          return '<li><img loading="lazy" src="' + esc(safeSrc(p.src)) + '" alt="' + esc(p.alt || 'Foto da Flor de Pequi Churrascaria') + '"></li>';
        }).join('') + '</ul>' : '') + '</div></section>';
    },
    bomboniere: function () {
      return '<section class="sweet" id="bomboniere"><div class="wrap sweet-in"><div><p class="eyebrow">' + esc(s.sweetEyebrow) + '</p><h2>' + esc(s.sweetTitle) + '</h2><p class="sub">' + esc(s.sweetText) + '</p></div><ul class="chips">' + lines(s.sweetItems) + '</ul></div></section>';
    },
    pagamento: function () {
      return '<section class="pay" id="pagamento"><div class="wrap pay-in"><div><h2>' + esc(s.payTitle) + '</h2><p class="sub">' + esc(s.paySub) + '</p></div><ul class="vouchers">' +
        (s.payItems || []).map(function (x) { return '<li>' + I.check + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div></section>';
    },
    delivery: function () {
      var digits = String(s.phone || '').replace(/\D/g, '');
      var wa = waUrl();
      var apps = (s.delApps || []).map(function (a) {
        var u = safeUrl(a.url);
        return '<li>' + (u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(a.name) + I.out + '</a>' : esc(a.name)) + '</li>';
      }).join('');
      var play = safeUrl(s.delAppPlayUrl), store = safeUrl(s.delAppStoreUrl);
      return '<section class="sec" id="delivery"><div class="wrap"><div class="sec-head"><p class="eyebrow">' + esc(s.delEyebrow) + '</p><h2>' + esc(s.delTitle) + '</h2></div><div class="del-grid">' +
        '<div class="card"><h3>' + esc(s.delAppsTitle) + '</h3><ul class="apps">' + apps + '</ul></div>' +
        '<div class="card"><h3>App próprio</h3><p class="big-line">' + esc(s.delAppName) + '</p><p>' + esc(s.delAppText) + '</p>' +
        ((play || store) ? '<div class="store-links">' +
          (play ? '<a class="btn btn-pequi" href="' + esc(play) + '" target="_blank" rel="noopener">Baixar no Google Play</a>' : '') +
          (store ? '<a class="btn btn-ghost" href="' + esc(store) + '" target="_blank" rel="noopener">Baixar na App Store</a>' : '') + '</div>' : '') + '</div>' +
        '<div class="card"><h3>' + esc(s.phoneLabel) + '</h3><a class="phone-num" id="phone-text" href="tel:+55' + esc(digits) + '">' + esc(s.phone) + '</a>' +
        '<div class="btn-row"><button type="button" class="btn btn-ghost" id="copy-phone">' + I.copy + 'Copiar número</button>' +
        (wa ? '<a class="btn btn-wa" href="' + esc(wa) + '" target="_blank" rel="noopener">' + I.wa + 'WhatsApp</a>' : '') + '</div></div>' +
        '</div></div></section>';
    },
    contato: function () {
      var maps = safeUrl(s.mapsUrl) || '#';
      return '<section class="sec contact" id="contato"><div class="wrap contact-in"><div><h2>' + esc(s.contactTitle) + '</h2><dl class="info"><div><dt>Endereço</dt><dd>' + esc(s.address) + '</dd></div>' +
        (s.hours ? '<div><dt>Horários</dt><dd>' + esc(s.hours) + '</dd></div>' : '') +
        '</dl><a class="btn btn-pequi" href="' + esc(maps) + '" target="_blank" rel="noopener">' + I.pin + 'Abrir no Google Maps</a></div>' +
        '<ul class="social">' + (s.social || []).map(function (x) {
          var u = safeUrl(x.url); if (!u) return '';
          return '<li><a href="' + esc(u) + '" target="_blank" rel="noopener">' + iconFor(u) + '<span>' + esc(x.label) + '<small>' + esc(x.handle) + '</small></span></a></li>';
        }).join('') + '</ul></div></section>';
    }
  };

  function render() {
    var maps = safeUrl(s.mapsUrl) || '#';
    var wa = waUrl();
    var secs = (s.sections || []).filter(function (x) { return x.visible !== false && SECTIONS[x.id]; });
    var h = '';

    if (s.notice && s.notice.enabled && s.notice.text) {
      var nu = safeUrl(s.notice.url);
      h += '<div class="notice"><div class="wrap notice-in">' + (nu ? '<a href="' + esc(nu) + '" target="_blank" rel="noopener">' + esc(s.notice.text) + '</a>' : esc(s.notice.text)) + '</div></div>';
    }

    h += '<header class="top"><div class="wrap top-in"><a class="brand" href="#topo" aria-label="Flor de Pequi Churrascaria, ir ao topo">' + logoImg() + '</a>' +
      '<nav class="nav" aria-label="Seções da página">' + secs.filter(function (x) { return x.nav; }).map(function (x) { return '<a href="#' + esc(x.id) + '">' + esc(x.nav) + '</a>'; }).join('') + '</nav>' +
      '<a class="btn btn-pequi" href="' + esc(maps) + '" target="_blank" rel="noopener">' + I.pin + esc(s.ctaMapsLabel || 'Como chegar') + '</a></div></header>';

    h += '<main><section class="hero" id="topo"><div class="wrap hero-in"><div class="hero-copy"><p class="eyebrow">' + esc(s.eyebrow) + '</p><h1>' + esc(s.heroTitle) + '</h1><p class="lead">' + esc(s.heroText) + '</p>' +
      '<div class="cta">' +
      (wa ? '<a class="btn btn-wa" href="' + esc(wa) + '" target="_blank" rel="noopener">' + I.wa + esc((s.whatsapp && s.whatsapp.label) || 'Chamar no WhatsApp') + '</a>' : '') +
      '<a class="btn btn-pequi" href="' + esc(maps) + '" target="_blank" rel="noopener">' + I.pin + esc(s.ctaMapsLabel || 'Como chegar') + '</a>' +
      '<a class="btn btn-ghost" href="#delivery">' + esc(s.ctaDeliveryLabel || 'Pedir delivery') + '</a></div></div>' +
      '<div class="hero-logo"><div class="badge"><b>' + esc(s.badgeBig) + '</b><span>' + esc(s.badgeSmall) + '</span></div>' + logoImg() + '</div></div>' +
      '<div class="wrap"><ul class="facts">' + (s.facts || []).map(function (x) { return '<li>' + I.check + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul></div></section>';

    h += secs.map(function (x) { return SECTIONS[x.id](); }).join('') + '</main>';

    h += '<footer class="foot"><div class="wrap foot-in">' + logoImg() + '<p>© ' + new Date().getFullYear() + ' ' + esc(s.footerText) + ' <a class="adm-link" href="admin.html" rel="nofollow">Admin</a></p></div></footer>';

    if (wa && s.whatsapp.floating) {
      h += '<a class="btn btn-wa wa-fab" href="' + esc(wa) + '" target="_blank" rel="noopener" aria-label="Chamar no WhatsApp">' + I.wa + 'WhatsApp</a>';
    }

    $('#app').innerHTML = h;
    var cp = $('#copy-phone');
    if (cp) cp.addEventListener('click', function () { copyText(String(s.phone || ''), $('#phone-text')); });
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status');
      document.body.appendChild(t);
    }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2400);
  }
  function selectNode(node) {
    try {
      var r = document.createRange(); r.selectNodeContents(node);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      toast('Número selecionado. Copie com Ctrl+C.');
    } catch (e) {}
  }
  function copyText(text, node) {
    try {
      navigator.clipboard.writeText(text).then(function () { toast('Número copiado'); }, function () { selectNode(node); });
    } catch (e) { selectNode(node); }
  }

  render();
})();
