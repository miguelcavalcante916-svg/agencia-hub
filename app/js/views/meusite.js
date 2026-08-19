/* AgênciaHub — Meu site (controle do portfólio publicado no site da agência)
   O site lê o arquivo portfolio.json do repositório. Aqui você monta a lista de
   reels/posts do Instagram, gera o JSON e cola no GitHub — a Vercel republica
   o site sozinha. */
(function () {
  'use strict';
  var AH = window.AH;

  /* EDITE se o repositório mudar de nome */
  var LINK_GITHUB = 'https://github.com/miguelcavalcante916-svg/agencia-hub/edit/main/portfolio.json';

  function normalizarUrl(url) {
    url = String(url || '').trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    if (!/instagram\.com\/(reel|p|tv)\//i.test(url)) return null;
    return url.split('?')[0];
  }

  function gerarJSON() {
    return JSON.stringify({
      _ajuda: 'Este arquivo controla o portfólio do site. Gere o conteúdo no sistema (app → Meu site), cole aqui inteiro e salve — a Vercel republica o site sozinha em ~1 minuto.',
      itens: AH.state.portfolio.map(function (p) { return { url: p.url, titulo: p.titulo }; })
    }, null, 2);
  }

  function render(el) {
    var itens = AH.state.portfolio;

    var html = '<div class="card" style="margin-bottom:16px"><div class="card-titulo">' + AH.icons.monitor + 'Como o site e o app se comunicam</div>' +
      '<p class="nota-rodape">O portfólio do site vem do arquivo <b>portfolio.json</b> do repositório. O fluxo: ' +
      '1) monte a lista aqui com os links do Instagram · 2) clique em <b>Copiar JSON</b> · 3) clique em <b>Abrir no GitHub</b>, apague o conteúdo antigo, cole o novo e salve (Commit changes). ' +
      'A Vercel percebe a mudança e republica o site sozinha em ~1 minuto.</p></div>';

    html += '<div class="card" style="margin-bottom:16px"><div class="card-titulo">' + AH.icons.mais + 'Adicionar trabalho ao portfólio</div>' +
      '<form id="form-portfolio" class="form-grid">' +
      AH.ui.campo('Link do reel/post no Instagram *', AH.ui.input('url', '', 'required placeholder="https://www.instagram.com/reel/..."')) +
      AH.ui.campo('Título (aparece se a prévia não carregar)', AH.ui.input('titulo', '', 'placeholder="Ex.: Aftermovie — Vaquejada 2026"')) +
      '<div class="campo-cheio" style="display:flex;justify-content:flex-end">' +
      '<button class="btn btn-primario" type="submit">' + AH.icons.mais + 'Adicionar à lista</button></div>' +
      '</form>' +
      '<p class="nota-rodape">Dica: no Instagram, toque em ⋯ no reel → <b>Copiar link</b>. O post precisa ser público para aparecer no site.</p>' +
      '</div>';

    if (itens.length) {
      html += '<div class="tabela-wrap" style="margin-bottom:16px"><table class="tabela"><thead><tr>' +
        '<th style="width:60px">Ordem</th><th>Trabalho</th><th class="acoes"></th></tr></thead><tbody>';
      itens.forEach(function (p, i) {
        html += '<tr data-i="' + i + '">' +
          '<td><div style="display:flex;gap:4px">' +
          '<button class="btn btn-ghost btn-icon btn-p sempre-visivel" data-acao="subir" title="Subir"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
          '<button class="btn btn-ghost btn-icon btn-p sempre-visivel" data-acao="descer" title="Descer"' + (i === itens.length - 1 ? ' disabled' : '') + '>↓</button>' +
          '</div></td>' +
          '<td><div class="celula-principal">' + AH.esc(p.titulo || 'Sem título') + '</div>' +
          '<div class="celula-sub"><a href="' + AH.esc(p.url) + '" target="_blank" rel="noopener">' + AH.esc(p.url) + '</a></div></td>' +
          '<td class="acoes"><button class="btn btn-ghost btn-icon btn-p" data-acao="remover" title="Remover">' + AH.icons.excluir + '</button></td>' +
          '</tr>';
      });
      html += '</tbody></table></div>';
    } else {
      html += AH.ui.vazio('monitor', 'Portfólio vazio', 'Cole o link de um reel ou post acima para começar a montar o portfólio do site.');
    }

    html += '<div class="card"><div class="card-titulo">' + AH.icons.duplicar + 'Publicar no site</div>' +
      '<label class="campo"><span class="campo-rotulo">Conteúdo do portfolio.json (' + itens.length + ' trabalho' + (itens.length === 1 ? '' : 's') + ')</span>' +
      '<textarea class="input" id="json-portfolio" rows="8" readonly>' + AH.esc(gerarJSON()) + '</textarea></label>' +
      '<div class="config-acoes" style="margin-top:12px">' +
      '<button class="btn btn-primario" id="btn-copiar-json">' + AH.icons.duplicar + 'Copiar JSON</button>' +
      '<a class="btn btn-contorno" href="' + LINK_GITHUB + '" target="_blank" rel="noopener">' + AH.icons.externo + 'Abrir no GitHub para colar</a>' +
      '</div></div>';

    el.innerHTML = html;

    el.querySelector('#form-portfolio').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var url = normalizarUrl(f.get('url'));
      if (url === null) {
        AH.ui.toast('Cole um link de reel ou post do Instagram (instagram.com/reel/... ou /p/...).', 'erro');
        return;
      }
      if (!url) return;
      AH.state.portfolio.push({ id: AH.uid(), url: url, titulo: String(f.get('titulo')).trim() });
      AH.salvar(); AH.ui.toast('Adicionado! Agora copie o JSON e cole no GitHub para publicar.');
      render(el);
    });

    el.querySelectorAll('tbody tr').forEach(function (tr) {
      var i = parseInt(tr.getAttribute('data-i'), 10);
      tr.querySelectorAll('[data-acao]').forEach(function (b) {
        b.addEventListener('click', function () {
          var acao = b.getAttribute('data-acao');
          var lista = AH.state.portfolio;
          if (acao === 'remover') lista.splice(i, 1);
          if (acao === 'subir' && i > 0) { var t = lista[i - 1]; lista[i - 1] = lista[i]; lista[i] = t; }
          if (acao === 'descer' && i < lista.length - 1) { var t2 = lista[i + 1]; lista[i + 1] = lista[i]; lista[i] = t2; }
          AH.salvar(); render(el);
        });
      });
    });

    el.querySelector('#btn-copiar-json').addEventListener('click', function () {
      var ta = el.querySelector('#json-portfolio');
      ta.select();
      var ok = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value).then(function () {
          AH.ui.toast('JSON copiado! Agora cole no GitHub e salve.');
        }, function () {
          try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
          AH.ui.toast(ok ? 'JSON copiado!' : 'Selecione o texto e copie manualmente (Ctrl+C).', ok ? '' : 'erro');
        });
      } else {
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        AH.ui.toast(ok ? 'JSON copiado!' : 'Selecione o texto e copie manualmente (Ctrl+C).', ok ? '' : 'erro');
      }
    });
  }

  AH.views = AH.views || {};
  AH.views.meusite = { titulo: 'Meu site', render: render };
})();
