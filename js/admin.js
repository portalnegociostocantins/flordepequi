(function () {
  'use strict';

  var DRAFT_KEY = 'fdp-rascunho';
  var GH_KEY = 'fdp-github';
  var CONTENT_PATH = 'js/content.js';

  var ORIGINAL = JSON.parse(JSON.stringify(window.SITE_CONTENT || {}));
  var data = JSON.parse(JSON.stringify(ORIGINAL));
  var hasDraft = false;
  try {
    var saved = localStorage.getItem(DRAFT_KEY);
    if (saved) { data = JSON.parse(saved); hasDraft = true; }
  } catch (e) {}

  var gh = { owner: '', repo: '', branch: 'main', token: '', remember: false };
  try {
    var g0 = localStorage.getItem(GH_KEY);
    if (g0) { gh = Object.assign(gh, JSON.parse(g0)); gh.remember = true; }
  } catch (e) {}

  var $ = function (s) { return document.querySelector(s); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function getP(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function setP(o, p, v) {
    var ks = p.split('.'), last = ks.pop();
    var t = ks.reduce(function (a, k) { if (a[k] == null) a[k] = {}; return a[k]; }, o);
    t[last] = v;
  }
  function fid(p) { return 'f-' + p.replace(/\./g, '-'); }
  function status(m) { $('#status').textContent = m; }

  /* ---------- campos ---------- */
  function field(path, label, o) {
    o = o || {};
    var v = getP(data, path), id = fid(path), t = o.type || 'text';
    if (t === 'bool') {
      return '<div class="fld-bool"><input id="' + id + '" type="checkbox" data-path="' + path + '" data-type="bool"' + (v ? ' checked' : '') + '><label for="' + id + '">' + esc(label) + '</label></div>';
    }
    if (t === 'color') {
      return '<div class="fld-color"><input id="' + id + '" type="color" data-path="' + path + '" data-type="text" value="' + esc(v || '#000000') + '"><label for="' + id + '">' + esc(label) + '</label></div>';
    }
    var inner;
    if (t === 'area') inner = '<textarea id="' + id + '" rows="4" data-path="' + path + '" data-type="text">' + esc(v) + '</textarea>';
    else if (t === 'lines') inner = '<textarea id="' + id + '" rows="6" data-path="' + path + '" data-type="lines">' + esc((v || []).join('\n')) + '</textarea>';
    else inner = '<input id="' + id + '" type="text" data-path="' + path + '" data-type="text" value="' + esc(v) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + '>';
    return '<div class="fld"><label for="' + id + '">' + esc(label) + '</label>' + inner + '</div>' + (o.hint ? '<p class="hint">' + esc(o.hint) + '</p>' : '');
  }

  function uploadBlock(path, kind) {
    var v = getP(data, path);
    return '<div class="upload-row"><input type="file" accept="image/*" data-upload="' + path + '" data-kind="' + kind + '" aria-label="Enviar imagem"></div>' +
      (v ? '<img class="thumb" src="' + esc(/^(https?:|\/)/.test(v) ? v : v) + '" alt="" onerror="this.style.display=\'none\'">' : '');
  }

  function listEditor(path, o) {
    var arr = getP(data, path) || [];
    var h = '';
    arr.forEach(function (it, i) {
      var title = o.title(it, i) || (o.noun + ' ' + (i + 1));
      h += '<div class="item"><div class="item-head"><span class="item-title">' + esc(title) + '</span><span class="item-tools">' +
        '<button type="button" class="mini" data-act="up" data-path="' + path + '" data-i="' + i + '"' + (i === 0 ? ' disabled' : '') + ' aria-label="Subir">↑</button>' +
        '<button type="button" class="mini" data-act="down" data-path="' + path + '" data-i="' + i + '"' + (i === arr.length - 1 ? ' disabled' : '') + ' aria-label="Descer">↓</button>' +
        '<button type="button" class="mini" data-act="del" data-path="' + path + '" data-i="' + i + '" aria-label="Remover">Remover</button></span></div>' +
        o.fields(path + '.' + i, i) + '</div>';
    });
    h += '<button type="button" class="btn btn-ghost add-btn" data-act="add" data-path="' + path + '">' + esc(o.addLabel) + '</button>';
    return h;
  }

  var SEC_LABEL = { cardapio: 'Cardápio', bomboniere: 'Picolés e bomboniere', pagamento: 'Cartões e vales', delivery: 'Delivery', contato: 'Contato e redes' };
  var COLORS = [
    ['wood', 'Fundo da página'], ['wood2', 'Fundo do cabeçalho e dos cartões'], ['wood3', 'Fundo ao passar o mouse'],
    ['line', 'Linhas e bordas'], ['ink', 'Texto principal'], ['inkDim', 'Texto secundário'],
    ['pequi', 'Amarelo (botões e destaques)'], ['pequiInk', 'Texto sobre o amarelo'], ['brasa', 'Vinho (faixa de cartões)'], ['folha', 'Verde (ícones)']
  ];

  function group(title, body) {
    return '<details class="grp" data-g="' + esc(title) + '"><summary>' + esc(title) + '</summary><div class="grp-body">' + body + '</div></details>';
  }

  function build() {
    var h = '';

    h += group('Geral e Google',
      field('site.title', 'Título da aba do navegador e do Google') +
      field('site.description', 'Descrição que aparece no Google', { type: 'area' }) +
      field('logo', 'Logo (caminho do arquivo)', { ph: 'assets/logo.png', hint: 'Para trocar a logo, envie uma imagem abaixo ou coloque o arquivo na pasta assets e escreva o caminho aqui.' }) +
      uploadBlock('logo', 'logo') +
      field('footerText', 'Texto do rodapé'));

    h += group('Aviso no topo',
      field('notice.enabled', 'Mostrar faixa de aviso acima do cabeçalho', { type: 'bool' }) +
      field('notice.text', 'Texto do aviso') +
      field('notice.url', 'Link do aviso (opcional)', { ph: 'https://' }));

    var sec = '<p class="hint">Use as setas para mudar a ordem. Desmarque para esconder a seção. Deixe o nome do menu em branco para tirá-la do menu.</p>';
    (data.sections || []).forEach(function (s, i) {
      var p = 'sections.' + i;
      sec += '<div class="item"><div class="item-head"><span class="item-title">' + esc(SEC_LABEL[s.id] || s.id) + '</span><span class="item-tools">' +
        '<button type="button" class="mini" data-act="up" data-path="sections" data-i="' + i + '"' + (i === 0 ? ' disabled' : '') + ' aria-label="Subir">↑</button>' +
        '<button type="button" class="mini" data-act="down" data-path="sections" data-i="' + i + '"' + (i === data.sections.length - 1 ? ' disabled' : '') + ' aria-label="Descer">↓</button></span></div>' +
        field(p + '.visible', 'Mostrar esta seção', { type: 'bool' }) + field(p + '.nav', 'Nome no menu') + '</div>';
    });
    h += group('Ordem e visibilidade das seções', sec);

    h += group('Cores', COLORS.map(function (c) { return field('colors.' + c[0], c[1], { type: 'color' }); }).join(''));

    h += group('Topo da página',
      field('eyebrow', 'Linha acima do título') + field('heroTitle', 'Título') + field('heroText', 'Texto de apresentação', { type: 'area' }) +
      '<div class="two">' + field('badgeBig', 'Selo: número') + field('badgeSmall', 'Selo: legenda') + '</div>' +
      '<div class="two">' + field('ctaMapsLabel', 'Botão do mapa') + field('ctaDeliveryLabel', 'Botão do delivery') + '</div>' +
      field('facts', 'Destaques abaixo do topo (um por linha)', { type: 'lines' }));

    h += group('WhatsApp',
      field('whatsapp.enabled', 'Mostrar botões de WhatsApp', { type: 'bool' }) +
      field('whatsapp.floating', 'Mostrar botão flutuante no canto da tela', { type: 'bool' }) +
      field('whatsapp.phone', 'Número com DDI e DDD, só dígitos', { ph: '5563985011530' }) +
      field('whatsapp.message', 'Mensagem que já vem escrita', { type: 'area' }) +
      field('whatsapp.label', 'Texto do botão do topo'));

    h += group('Cardápio',
      field('menuEyebrow', 'Linha acima do título') + field('menuTitle', 'Título da seção') +
      listEditor('blocks', {
        noun: 'Bloco', addLabel: 'Adicionar bloco', title: function (b) { return b.title; },
        fields: function (p) {
          return '<div class="two">' + field(p + '.big', 'Texto grande') + field(p + '.small', 'Legenda do texto grande') + '</div>' +
            field(p + '.title', 'Título') + field(p + '.text', 'Descrição', { type: 'area' });
        }
      }));

    h += group('Fotos',
      '<p class="hint">As fotos aparecem em uma galeria abaixo do cardápio. Sem fotos, a galeria não aparece.</p>' +
      listEditor('photos', {
        noun: 'Foto', addLabel: 'Adicionar foto', title: function (p) { return p.alt || p.src; },
        fields: function (p) { return field(p + '.src', 'Arquivo ou endereço da foto', { ph: 'assets/fotos/churrasco.jpg' }) + uploadBlock(p + '.src', 'foto') + field(p + '.alt', 'Descrição da foto'); }
      }));

    h += group('Picolés e bomboniere',
      field('sweetEyebrow', 'Linha acima do título') + field('sweetTitle', 'Título') + field('sweetText', 'Texto', { type: 'area' }) +
      field('sweetItems', 'Itens (um por linha)', { type: 'lines' }));

    h += group('Cartões e vales',
      field('payTitle', 'Título') + field('paySub', 'Subtítulo') + field('payItems', 'Vales aceitos (um por linha)', { type: 'lines' }));

    h += group('Delivery',
      field('delEyebrow', 'Linha acima do título') + field('delTitle', 'Título') + field('delAppsTitle', 'Título da lista de apps') +
      listEditor('delApps', {
        noun: 'App', addLabel: 'Adicionar app de entrega', title: function (a) { return a.name; },
        fields: function (p) { return '<div class="two">' + field(p + '.name', 'Nome') + field(p + '.url', 'Link (opcional)', { ph: 'https://' }) + '</div>'; }
      }) +
      field('delAppName', 'Nome do app próprio') + field('delAppText', 'Texto do app próprio', { type: 'area' }) +
      field('delAppPlayUrl', 'Link do Google Play', { ph: 'https://play.google.com/...' }) +
      field('delAppStoreUrl', 'Link da App Store (opcional)', { ph: 'https://apps.apple.com/...' }) +
      field('phoneLabel', 'Texto acima do telefone') + field('phone', 'Telefone'));

    h += group('Contato e redes sociais',
      field('contactTitle', 'Título') + field('address', 'Endereço', { type: 'area' }) + field('hours', 'Horários de funcionamento', { type: 'area' }) +
      field('mapsUrl', 'Link do Google Maps', { ph: 'https://www.google.com/maps/...' }) +
      listEditor('social', {
        noun: 'Rede', addLabel: 'Adicionar rede social', title: function (x) { return x.label; },
        fields: function (p) { return '<div class="two">' + field(p + '.label', 'Nome') + field(p + '.handle', 'Usuário ou descrição') + '</div>' + field(p + '.url', 'Link', { ph: 'https://' }); }
      }));

    h += group('Publicar direto no GitHub',
      '<p class="hint">Opcional. Com isto, o botão "Publicar no GitHub" grava as mudanças e as fotos no repositório sem baixar nada. Crie um token em GitHub &gt; Settings &gt; Developer settings &gt; Personal access tokens &gt; Fine-grained tokens, escolha só este repositório e dê a permissão <strong>Contents: Read and write</strong>.</p>' +
      '<div class="two"><div class="fld"><label for="gh-owner">Usuário ou organização</label><input id="gh-owner" type="text" data-gh="owner" value="' + esc(gh.owner) + '"></div>' +
      '<div class="fld"><label for="gh-repo">Repositório</label><input id="gh-repo" type="text" data-gh="repo" value="' + esc(gh.repo) + '"></div></div>' +
      '<div class="two"><div class="fld"><label for="gh-branch">Branch</label><input id="gh-branch" type="text" data-gh="branch" value="' + esc(gh.branch) + '"></div>' +
      '<div class="fld"><label for="gh-token">Token</label><input id="gh-token" type="password" data-gh="token" value="' + esc(gh.token) + '" autocomplete="off"></div></div>' +
      '<div class="fld-bool"><input id="gh-remember" type="checkbox" data-gh="remember"' + (gh.remember ? ' checked' : '') + '><label for="gh-remember">Lembrar neste navegador</label></div>' +
      '<p class="hint">O token fica só neste navegador e é usado apenas para falar com o GitHub. Marque "Lembrar" só em um computador seu. Se desconfiar de vazamento, apague o token no GitHub.</p>');

    return h;
  }

  var form = $('#form');
  function render() {
    var open = {};
    form.querySelectorAll('details.grp').forEach(function (d) { open[d.getAttribute('data-g')] = d.open; });
    var y = window.scrollY;
    form.innerHTML = build();
    form.querySelectorAll('details.grp').forEach(function (d) { if (open[d.getAttribute('data-g')]) d.open = true; });
    window.scrollTo(0, y);
  }

  /* ---------- rascunho ---------- */
  var saveTimer = null;
  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
  }
  function touch() { clearTimeout(saveTimer); saveTimer = setTimeout(saveDraft, 400); }
  function saveGh() {
    try {
      if (gh.remember) localStorage.setItem(GH_KEY, JSON.stringify(gh)); else localStorage.removeItem(GH_KEY);
    } catch (e) {}
  }

  /* ---------- eventos ---------- */
  form.addEventListener('input', function (e) {
    var el = e.target;
    var p = el.getAttribute('data-path');
    if (p) {
      var t = el.getAttribute('data-type');
      setP(data, p, t === 'lines' ? el.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean) : el.value);
      touch();
      return;
    }
    var k = el.getAttribute('data-gh');
    if (k && k !== 'remember') { gh[k] = el.value.trim(); saveGh(); }
  });
  form.addEventListener('change', function (e) {
    var el = e.target;
    var p = el.getAttribute('data-path');
    if (p && el.getAttribute('data-type') === 'bool') { setP(data, p, el.checked); touch(); return; }
    if (el.getAttribute('data-gh') === 'remember') { gh.remember = el.checked; saveGh(); return; }
    if (el.hasAttribute('data-upload')) { uploadFile(el); }
  });

  var NEW_ITEMS = {
    blocks: function () { return { big: '', small: '', title: 'Novo bloco', text: '' }; },
    photos: function () { return { src: '', alt: '' }; },
    delApps: function () { return { name: 'Novo app', url: '' }; },
    social: function () { return { label: 'Nova rede', handle: '', url: '' }; }
  };
  form.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b || b.disabled) return;
    var act = b.getAttribute('data-act'), p = b.getAttribute('data-path'), i = parseInt(b.getAttribute('data-i'), 10);
    var arr = getP(data, p);
    if (!arr) { arr = []; setP(data, p, arr); }
    if (act === 'add') arr.push(NEW_ITEMS[p]());
    else if (act === 'del') arr.splice(i, 1);
    else if (act === 'up' && i > 0) { var a = arr[i]; arr[i] = arr[i - 1]; arr[i - 1] = a; }
    else if (act === 'down' && i < arr.length - 1) { var c = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = c; }
    saveDraft(); render();
  });

  /* ---------- GitHub ---------- */
  function ghReady() { return gh.owner && gh.repo && gh.branch && gh.token; }
  function ghUrl(path) {
    return 'https://api.github.com/repos/' + encodeURIComponent(gh.owner) + '/' + encodeURIComponent(gh.repo) + '/contents/' + path.split('/').map(encodeURIComponent).join('/');
  }
  function ghHeaders() {
    return { 'Authorization': 'Bearer ' + gh.token, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  }
  function ghError(res) {
    if (res.status === 401) return 'O GitHub recusou o token. Confira se ele está correto e não expirou.';
    if (res.status === 403) return 'O token não tem permissão de escrita (Contents: Read and write) neste repositório.';
    if (res.status === 404) return 'Repositório, usuário ou branch não encontrado. Confira os dados em "Publicar direto no GitHub".';
    if (res.status === 409 || res.status === 422) return 'O arquivo mudou no GitHub enquanto você editava. Tente publicar de novo.';
    return 'Não foi possível falar com o GitHub (erro ' + res.status + ').';
  }
  async function ghPut(path, base64, message) {
    var sha;
    var r = await fetch(ghUrl(path) + '?ref=' + encodeURIComponent(gh.branch), { headers: ghHeaders() });
    if (r.ok) sha = (await r.json()).sha;
    else if (r.status !== 404) throw new Error(ghError(r));
    var body = { message: message, content: base64, branch: gh.branch };
    if (sha) body.sha = sha;
    var w = await fetch(ghUrl(path), { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, ghHeaders()), body: JSON.stringify(body) });
    if (!w.ok) throw new Error(ghError(w));
  }
  function utf8b64(str) { return btoa(unescape(encodeURIComponent(str))); }
  function contentText() {
    return '/* Conteúdo do site. Gerado pelo painel admin.html. Pode ser editado à mão. */\nwindow.SITE_CONTENT = ' + JSON.stringify(data, null, 2) + ';\n';
  }
  function slug(name) {
    return name.toLowerCase().replace(/\.[a-z0-9]+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'imagem';
  }
  function readAsBase64(blob) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(String(fr.result).split(',')[1]); };
      fr.onerror = function () { rej(new Error('Não foi possível ler o arquivo.')); };
      fr.readAsDataURL(blob);
    });
  }
  function resizeToJpeg(file, max) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var k = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? res(b) : rej(new Error('Não foi possível reduzir a imagem.')); }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('Este arquivo não parece ser uma imagem.')); };
      img.src = url;
    });
  }

  async function uploadFile(input) {
    var file = input.files && input.files[0];
    var path = input.getAttribute('data-upload'), kind = input.getAttribute('data-kind');
    if (!file) return;
    var target = kind === 'logo' ? 'assets/' + slug(file.name) + '-logo' + (/\.png$/i.test(file.name) ? '.png' : /\.svg$/i.test(file.name) ? '.svg' : /\.webp$/i.test(file.name) ? '.webp' : '.jpg')
      : 'assets/fotos/' + slug(file.name) + '.jpg';
    if (!ghReady()) {
      setP(data, path, target); saveDraft(); render();
      status('Nome cadastrado: ' + target + '. Sem a publicação configurada, envie o arquivo manualmente para essa pasta no GitHub.');
      return;
    }
    status('Enviando imagem para o GitHub…');
    try {
      var blob = kind === 'logo' ? file : await resizeToJpeg(file, 1600);
      await ghPut(target, await readAsBase64(blob), 'Envia imagem pelo painel');
      setP(data, path, target); saveDraft(); render();
      status('Imagem enviada para ' + target + '. Clique em "Publicar no GitHub" para atualizar o site com ela.');
    } catch (err) {
      status(err.message || 'Não foi possível enviar a imagem.');
    }
  }

  /* ---------- botões do topo ---------- */
  $('#btn-preview').addEventListener('click', function () {
    if (!saveDraft()) { status('Este navegador bloqueou o rascunho. Use uma janela normal (não privada).'); return; }
    window.open('index.html?preview=1', '_blank', 'noopener');
    status('Pré-visualização aberta em outra aba. Ela mostra o rascunho, sem publicar nada.');
  });

  $('#btn-download').addEventListener('click', function () {
    saveDraft();
    var blob = new Blob([contentText()], { type: 'text/javascript;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'content.js';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    status('Arquivo content.js baixado. Substitua js/content.js no repositório do GitHub.');
  });

  var publishing = false;
  async function doPublish() {
    if (publishing) return false;
    if (!ghReady()) {
      var d = form.querySelector('details[data-g="Publicar direto no GitHub"]');
      if (d) { d.open = true; d.scrollIntoView({ block: 'center' }); }
      status('Preencha usuário, repositório, branch e token em "Publicar direto no GitHub", ou use "Baixar content.js".');
      return false;
    }
    publishing = true; saveDraft(); status('Publicando…');
    var ok = false;
    try {
      await ghPut(CONTENT_PATH, utf8b64(contentText()), 'Atualiza conteúdo do site pelo painel');
      status('Publicado. O site atualiza em 1 a 3 minutos.'); ok = true;
    } catch (err) {
      status(err.message || 'Não foi possível publicar.');
    }
    publishing = false;
    return ok;
  }
  $('#btn-publish').addEventListener('click', doPublish);

  $('#btn-save').addEventListener('click', async function () {
    if (!saveDraft()) { status('Este navegador bloqueou o rascunho. Use uma janela normal (não privada).'); return; }
    if (ghReady()) { await doPublish(); return; }
    $('#btn-download').click();
    status('Alterações salvas como rascunho e content.js baixado. Substitua js/content.js no GitHub para colocar no ar.');
  });

  var confirmReset = false, resetTimer = null;
  $('#btn-reset').addEventListener('click', function () {
    var b = $('#btn-reset');
    if (!confirmReset) {
      confirmReset = true; b.textContent = 'Clique de novo para confirmar';
      resetTimer = setTimeout(function () { confirmReset = false; b.textContent = 'Descartar rascunho e voltar ao publicado'; }, 4000);
      return;
    }
    clearTimeout(resetTimer); confirmReset = false; b.textContent = 'Descartar rascunho e voltar ao publicado';
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    data = JSON.parse(JSON.stringify(ORIGINAL));
    render(); status('Voltou ao conteúdo que está publicado no site.');
  });

  render();
  status(hasDraft ? 'Rascunho anterior carregado deste navegador.' : 'Mostrando o conteúdo que está publicado no site.');
})();
