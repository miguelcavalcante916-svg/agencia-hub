/* AgênciaHub — Portal do cliente
   Gera um link exclusivo por cliente com um retrato dos dados dele (projetos,
   agenda, anúncios e cobranças). O link abre uma página limpa, sem o painel
   da agência — e contém SOMENTE os dados daquele cliente. */
(function () {
  'use strict';
  var AH = window.AH;

  var PROGRESSO = { briefing: 12, planejamento: 30, producao: 55, edicao: 75, revisao: 90, entregue: 100 };

  /* ---------- página vista pelo cliente ---------- */

  AH.renderPortalHTML = function (d) {
    var ag = d.agencia || {};
    var mmAtual = AH.mesISO(0);

    var regsMes = [];
    var regsTotal = [];
    (d.campanhas || []).forEach(function (c) {
      (c.registros || []).forEach(function (r) {
        regsTotal.push(r);
        if (String(r.de).slice(0, 7) === mmAtual) regsMes.push(r);
      });
    });
    var mMes = AH.metricasTrafego(regsMes);

    var emAndamento = (d.projetos || []).filter(function (p) { return p.status !== 'entregue'; });
    var proximoEvento = (d.eventos || [])[0] || null;

    var html = '<div class="portal">';

    html += '<header class="portal-cab">' +
      '<div class="brand"><div class="brand-logo" aria-hidden="true"></div>' +
      '<div class="brand-text"><strong>' + AH.esc(ag.nome || 'Agência') + '</strong>' +
      '<span>' + AH.esc(ag.slogan || '') + '</span></div></div>' +
      '<span class="badge badge-laranja">Portal do cliente</span>' +
      '</header>';

    html += '<div class="portal-ola">' +
      '<h1>Olá, ' + AH.esc(d.cliente ? d.cliente.nome : 'cliente') + '!</h1>' +
      '<p>Acompanhe aqui o andamento dos seus projetos com a ' + AH.esc(ag.nome || 'agência') + '.</p>' +
      '<span class="chip">' + AH.icons.calendario + 'Atualizado em ' + AH.fmt.data(d.geradoEm) + (d.geradoHora ? ' às ' + AH.esc(d.geradoHora) : '') + '</span>' +
      '</div>';

    var tiles = [];
    tiles.push(tile('Projetos em andamento', String(emAndamento.length)));
    if (proximoEvento) {
      tiles.push(tile('Próximo compromisso', AH.fmt.dataCurta(proximoEvento.data), AH.esc(proximoEvento.titulo)));
    }
    if ((d.campanhas || []).length) {
      tiles.push(tile('Anúncios no mês', AH.fmt.moeda(mMes.investimento), 'investimento'));
      tiles.push(tile('Resultados no mês', AH.fmt.num(mMes.resultados), mMes.custoResultado != null ? AH.fmt.moeda(mMes.custoResultado) + ' por resultado' : ''));
    }
    html += '<div class="grid grid-4 portal-tiles">' + tiles.join('') + '</div>';

    /* projetos */
    html += secao('projetos', 'Seus projetos');
    if ((d.projetos || []).length) {
      html += '<div class="grid grid-2">';
      d.projetos.forEach(function (p) {
        var pct = PROGRESSO[p.status] != null ? PROGRESSO[p.status] : 50;
        var entregue = p.status === 'entregue';
        html += '<div class="card portal-projeto">' +
          '<div class="cartao-titulo">' + AH.esc(p.titulo) + '</div>' +
          '<div class="toolbar" style="margin:6px 0 10px;gap:7px">' +
          '<span class="badge badge-roxo">' + AH.esc(p.tipo || 'Projeto') + '</span>' +
          (entregue ? '<span class="badge badge-verde">Entregue ✓</span>' : (p.prazo ? '<span class="chip">' + AH.icons.calendario + 'previsão: ' + AH.fmt.data(p.prazo) + '</span>' : '')) +
          '</div>' +
          '<div class="progresso"><div class="progresso-preenchido' + (entregue ? ' progresso-ok' : '') + '" style="width:' + pct + '%"></div></div>' +
          '<div class="progresso-rotulo"><span>' + AH.esc(AH.nomeColuna(p.status)) + '</span><b>' + pct + '%</b></div>' +
          '</div>';
      });
      html += '</div>';
    } else {
      html += '<p class="nota-rodape">Nenhum projeto em andamento no momento.</p>';
    }

    /* agenda */
    if ((d.eventos || []).length) {
      html += secao('calendario', 'Próximos compromissos');
      html += '<div class="card" style="padding:8px 16px"><div class="lista">';
      d.eventos.forEach(function (e) {
        var cor = AH.ui.corEvento[e.tipo] || 'cinza';
        html += '<div class="lista-item"><span class="ponto ponto-' + cor + '"></span>' +
          '<div class="principal"><div class="titulo">' + AH.esc(e.titulo) + '</div>' +
          '<div class="sub">' + AH.fmt.data(e.data) + (e.hora ? ' · ' + AH.esc(e.hora) : '') + (e.local ? ' · ' + AH.esc(e.local) : '') + '</div></div>' +
          '<span class="badge badge-' + cor + '">' + AH.esc(AH.ui.nomeEvento[e.tipo] || e.tipo) + '</span></div>';
      });
      html += '</div></div>';
    }

    /* anúncios */
    if ((d.campanhas || []).length) {
      html += secao('megafone', 'Seus anúncios (tráfego pago)');
      d.campanhas.forEach(function (c) {
        var m = AH.metricasTrafego(c.registros);
        var unidade = AH.unidadeObjetivo(c.objetivo);
        var ultimo = (c.registros || []).slice().sort(function (a, b) { return String(b.ate).localeCompare(String(a.ate)); })[0];
        html += '<div class="card" style="margin-bottom:12px">' +
          '<div class="card-titulo" style="margin-bottom:10px">' + AH.esc(c.nome) +
          '<span style="margin-left:auto;display:inline-flex;gap:6px">' + AH.ui.badgePlataforma(c.plataforma) + AH.ui.badgeStatusCampanha(c.status) + '</span></div>' +
          '<div class="metricas-grid">' +
          metrica('Investido', AH.fmt.moeda(m.investimento)) +
          metrica('Alcance', AH.fmt.num(m.alcance)) +
          metrica('Cliques', AH.fmt.num(m.cliques)) +
          metrica(capitalizar(unidade), AH.fmt.num(m.resultados)) +
          metrica('Custo por resultado', m.custoResultado != null ? AH.fmt.moeda(m.custoResultado) : '—') +
          metrica('CTR', AH.fmt.pct(m.ctr)) +
          (m.roas != null ? metrica('Retorno (ROAS)', m.roas.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'x') : '') +
          '</div>' +
          (ultimo ? '<p class="nota-rodape" style="margin-top:10px">Último período registrado: ' + AH.fmt.data(ultimo.de) + ' a ' + AH.fmt.data(ultimo.ate) + '.</p>' : '') +
          '</div>';
      });
    }

    /* cobranças */
    if ((d.cobrancas || []).length) {
      var totalPend = d.cobrancas.reduce(function (a, c) { return a + (Number(c.valor) || 0); }, 0);
      html += secao('financeiro', 'Pagamentos em aberto');
      html += '<div class="card" style="padding:8px 16px"><div class="lista">';
      d.cobrancas.forEach(function (c) {
        html += '<div class="lista-item"><div class="principal">' +
          '<div class="titulo">' + AH.esc(c.descricao) + '</div>' +
          '<div class="sub">vencimento: ' + AH.fmt.data(c.data) + '</div></div>' +
          '<b style="font-variant-numeric:tabular-nums">' + AH.fmt.moeda(c.valor) + '</b></div>';
      });
      html += '</div>';
      html += '<div class="portal-total-pend"><span>Total em aberto</span><b>' + AH.fmt.moeda(totalPend) + '</b></div>';
      if (ag.pix) html += '<p class="nota-rodape" style="margin-top:8px">Chave PIX para pagamento: <b>' + AH.esc(ag.pix) + '</b></p>';
      html += '</div>';
    }

    /* rodapé */
    html += '<footer class="portal-rodape">';
    if (ag.whatsapp) {
      html += '<a class="btn btn-primario" href="' + AH.telLink(ag.whatsapp) + '" target="_blank" rel="noopener">' + AH.icons.whatsapp + 'Falar com a agência</a>';
    }
    var contatos = [];
    if (ag.instagram) contatos.push('<a href="' + AH.instaLink(ag.instagram) + '" target="_blank" rel="noopener">' + AH.esc(ag.instagram) + '</a>');
    if (ag.site) contatos.push(AH.esc(ag.site));
    if (ag.email) contatos.push(AH.esc(ag.email));
    if (contatos.length) html += '<p>' + contatos.join(' · ') + '</p>';
    html += '<p class="nota-rodape">' + AH.esc(ag.nome || 'Agência') + ' · portal gerado pelo AgênciaHub</p>';
    html += '</footer>';

    return html + '</div>';

    function tile(rotulo, valor, extra) {
      return '<div class="card tile"><div class="tile-rotulo">' + AH.esc(rotulo) + '</div>' +
        '<div class="tile-valor">' + AH.esc(valor) + '</div>' +
        (extra ? '<div class="tile-extra">' + extra + '</div>' : '') + '</div>';
    }
    function secao(icone, titulo) {
      return '<h2 class="portal-secao">' + (AH.icons[icone] || '') + AH.esc(titulo) + '</h2>';
    }
    function metrica(rotulo, valor) {
      return '<div class="metrica"><span>' + AH.esc(rotulo) + '</span><b>' + AH.esc(valor) + '</b></div>';
    }
    function capitalizar(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  };

  /* ---------- modo público (aberto pelo link) ---------- */

  AH.portalPublico = function (payload) {
    document.body.classList.add('modo-portal');
    var raiz = document.getElementById('portal-publico');
    if (!raiz) {
      raiz = document.createElement('div');
      raiz.id = 'portal-publico';
      document.body.appendChild(raiz);
    }
    raiz.innerHTML = '<div class="portal"><p class="nota-rodape" style="padding:48px 0;text-align:center">Carregando o seu portal…</p></div>';
    AH.decodificarPortal(payload).then(function (dados) {
      document.title = (dados.agencia && dados.agencia.nome ? dados.agencia.nome + ' · ' : '') + 'Portal do cliente';
      raiz.innerHTML = AH.renderPortalHTML(dados);
    }).catch(function (e) {
      console.warn('Portal: link inválido.', e);
      raiz.innerHTML = '<div class="portal"><div class="card" style="margin-top:48px;text-align:center;padding:32px">' +
        '<h2 style="margin-bottom:8px">Link inválido ou incompleto</h2>' +
        '<p class="nota-rodape">Confira se o endereço foi copiado por inteiro e, se precisar, peça um novo link para a agência.</p>' +
        '</div></div>';
    });
  };

  /* ---------- tela da agência: gerar e enviar o link ---------- */

  var sel = { clienteId: '', incluirCobrancas: true };

  function urlBase() {
    var cfg = String(AH.state.configuracoes.urlPublica || '').trim();
    if (cfg) {
      if (!/^https?:\/\//i.test(cfg)) cfg = 'https://' + cfg;
      return cfg.split('#')[0];
    }
    return location.href.split('#')[0];
  }

  function gerarLink() {
    var snap = AH.snapshotPortal(sel.clienteId, { incluirCobrancas: sel.incluirCobrancas });
    if (!snap) return Promise.resolve('');
    return AH.codificarPortal(snap).then(function (payload) {
      return urlBase() + '#/p?d=' + payload;
    });
  }

  function copiarTexto(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(texto).then(function () { return true; }, function () { return copiarLegado(texto); });
    }
    return Promise.resolve(copiarLegado(texto));
  }

  function copiarLegado(texto) {
    var ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function render(el) {
    // pré-seleção via #/portal?c=<id>
    var m = (location.hash || '').match(/[?&]c=([a-z0-9]+)/i);
    if (m && AH.clientePorId(m[1])) sel.clienteId = m[1];
    if (!sel.clienteId || !AH.clientePorId(sel.clienteId)) {
      var primeiro = AH.ui.opcoesClientes()[0];
      sel.clienteId = primeiro ? primeiro.id : '';
    }

    if (!sel.clienteId) {
      el.innerHTML = AH.ui.vazio('portal', 'Cadastre um cliente primeiro',
        'O portal é gerado por cliente. Cadastre alguém em Clientes e volte aqui.');
      return;
    }

    var ehLocal = !/^https?:/.test(urlBase());

    var html = '<div class="card" style="margin-bottom:16px"><div class="card-titulo">' + AH.icons.portal + 'Como funciona</div>' +
      '<p class="nota-rodape">1) Escolha o cliente · 2) Copie o link exclusivo dele · 3) Envie no WhatsApp. ' +
      'O cliente abre e vê os projetos, a agenda, os resultados dos anúncios e as cobranças — só dele, sem acessar o seu painel. ' +
      '<b>O link é um retrato do momento:</b> depois de atualizar os dados aqui, gere e envie um novo link (ótimo para o relatório semanal).</p>' +
      '</div>';

    html += '<div class="toolbar">' +
      '<select class="input" id="portal-cliente" style="width:auto;min-width:200px">' +
      AH.ui.opcoesClientes().map(function (c) {
        return '<option value="' + c.id + '"' + (sel.clienteId === c.id ? ' selected' : '') + '>' + AH.esc(c.nome) + '</option>';
      }).join('') +
      '</select>' +
      '<label class="chip" style="cursor:pointer;gap:8px"><input type="checkbox" id="portal-cobrancas"' + (sel.incluirCobrancas ? ' checked' : '') + '> Mostrar cobranças pendentes</label>' +
      '<div class="espaco"></div>' +
      '<button class="btn btn-contorno" id="portal-abrir">' + AH.icons.externo + 'Abrir prévia</button>' +
      '<button class="btn btn-primario" id="portal-copiar">' + AH.icons.duplicar + 'Copiar link do portal</button>' +
      '</div>';

    if (ehLocal) {
      html += '<div class="card" style="border-color:rgba(250,204,21,.4);margin-bottom:16px"><p class="nota-rodape">' +
        AH.icons.alerta + ' <b>Atenção:</b> o app está aberto direto do arquivo, então o link gerado só funciona neste computador. ' +
        'Publique o app na internet (GitHub Pages) e informe o endereço em <a href="#/configuracoes">Configurações → Endereço público do app</a> para gerar links que abrem no celular do cliente.</p></div>';
    }

    html += '<label class="campo" style="margin-bottom:18px"><span class="campo-rotulo">Link exclusivo deste cliente</span>' +
      '<input class="input" id="portal-link" readonly value="Gerando link..."></label>';

    html += '<div class="card-titulo">' + AH.icons.olho + 'Prévia — é exatamente isso que o cliente vê</div>' +
      '<div class="portal-preview" id="portal-preview"></div>';

    el.innerHTML = html;

    var inputLink = el.querySelector('#portal-link');
    var preview = el.querySelector('#portal-preview');

    function atualizar() {
      var snap = AH.snapshotPortal(sel.clienteId, { incluirCobrancas: sel.incluirCobrancas });
      preview.innerHTML = snap ? AH.renderPortalHTML(snap) : '';
      inputLink.value = 'Gerando link...';
      gerarLink().then(function (url) { inputLink.value = url; });
    }
    atualizar();

    el.querySelector('#portal-cliente').addEventListener('change', function (e) {
      sel.clienteId = e.target.value;
      atualizar();
    });
    el.querySelector('#portal-cobrancas').addEventListener('change', function (e) {
      sel.incluirCobrancas = e.target.checked;
      atualizar();
    });
    el.querySelector('#portal-copiar').addEventListener('click', function () {
      gerarLink().then(function (url) {
        copiarTexto(url).then(function (ok) {
          AH.ui.toast(ok ? 'Link copiado! Cole no WhatsApp do cliente.' : 'Não consegui copiar — selecione o link no campo e copie manualmente.', ok ? '' : 'erro');
        });
      });
    });
    el.querySelector('#portal-abrir').addEventListener('click', function () {
      gerarLink().then(function (url) { window.open(url, '_blank'); });
    });
    inputLink.addEventListener('click', function () { inputLink.select(); });
  }

  AH.views = AH.views || {};
  AH.views.portal = { titulo: 'Portal do cliente', render: render };
})();
