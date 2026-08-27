/* AgênciaHub — Portal do cliente
   Gera um link exclusivo por cliente com um retrato dos dados dele (projetos,
   aprovações, postagens, agenda, anúncios, leads e cobranças). O link abre uma
   página com cara de aplicativo, sem o painel da agência — e contém SOMENTE os
   dados daquele cliente. */
(function () {
  'use strict';
  var AH = window.AH;

  var PROGRESSO = { briefing: 12, planejamento: 30, producao: 55, edicao: 75, revisao: 90, entregue: 100 };

  /* ---------- página vista pelo cliente ---------- */

  AH.renderPortalHTML = function (d) {
    var ag = d.agencia || {};
    var mmAtual = AH.mesISO(0);
    var campanhas = d.campanhas || [];

    var regsMes = [];
    campanhas.forEach(function (c) {
      (c.registros || []).forEach(function (r) {
        if (String(r.de).slice(0, 7) === mmAtual) regsMes.push(r);
      });
    });
    var mMes = AH.metricasTrafego(regsMes);

    var emAndamento = (d.projetos || []).filter(function (p) { return p.status !== 'entregue'; });
    var proximoEvento = (d.eventos || [])[0] || null;
    var pendentesMat = (d.materiais || []).filter(function (mt) { return mt.status !== 'aprovado'; });
    var aprovadosMat = (d.materiais || []).filter(function (mt) { return mt.status === 'aprovado'; });

    // investimento por mês (para o gráfico, igual ao painel da agência)
    var invMeses = [];
    for (var i = 5; i >= 0; i--) {
      var mm = AH.mesISO(-i), tot = 0;
      campanhas.forEach(function (c) {
        (c.registros || []).forEach(function (r) {
          if (String(r.de).slice(0, 7) === mm) tot += Number(r.investimento) || 0;
        });
      });
      invMeses.push({ mes: mm, total: tot });
    }
    var temGrafico = invMeses.some(function (x) { return x.total > 0; });

    var html = '<div class="portal">';

    /* topo fixo com vidro */
    html += '<header class="portal-topo">' +
      '<div class="brand"><div class="brand-logo" aria-hidden="true"></div>' +
      '<div class="brand-text"><strong>' + AH.esc(ag.nome || 'Agência') + '</strong>' +
      '<span>' + AH.esc(ag.slogan || '') + '</span></div></div>' +
      '<span class="badge badge-laranja">Portal do cliente</span>' +
      '</header>';

    /* saudação */
    html += '<section class="portal-hero revelar">' +
      '<p class="portal-eyebrow">Acompanhamento em tempo de relatório</p>' +
      '<h1>Olá, <span class="grad">' + AH.esc(d.cliente ? d.cliente.nome : 'cliente') + '</span></h1>' +
      '<p class="sub">Tudo o que a ' + AH.esc(ag.nome || 'agência') + ' está fazendo pela sua marca — projetos, conteúdo, anúncios e resultados — em um só lugar.</p>' +
      '<span class="chip">' + AH.icons.calendario + 'Atualizado em ' + AH.fmt.data(d.geradoEm) + (d.geradoHora ? ' às ' + AH.esc(d.geradoHora) : '') + '</span>' +
      '</section>';

    /* navegação por seções */
    var pills = [];
    if (pendentesMat.length || aprovadosMat.length) pills.push(['p-aprovacoes', 'Aprovações']);
    if ((d.projetos || []).length) pills.push(['p-projetos', 'Projetos']);
    if ((d.postagens || []).length) pills.push(['p-postagens', 'Postagens']);
    if ((d.eventos || []).length) pills.push(['p-agenda', 'Agenda']);
    if (campanhas.length) pills.push(['p-anuncios', 'Anúncios']);
    if (d.leads && d.leads.mes) pills.push(['p-leads', 'Leads']);
    if ((d.cobrancas || []).length) pills.push(['p-pagamentos', 'Pagamentos']);
    if (pills.length > 1) {
      html += '<nav class="portal-nav" aria-label="Seções">' + pills.map(function (p) {
        return '<a href="#' + p[0] + '" data-rolar="' + p[0] + '">' + p[1] + '</a>';
      }).join('') + '</nav>';
    }

    /* indicadores */
    var tiles = [];
    tiles.push(tileNum('Projetos em andamento', emAndamento.length, 'num'));
    if (proximoEvento) {
      tiles.push(tileTexto('Próximo compromisso', AH.fmt.dataCurta(proximoEvento.data), AH.esc(proximoEvento.titulo)));
    }
    if (campanhas.length) {
      tiles.push(tileNum('Anúncios no mês', mMes.investimento, 'moeda', 'investimento'));
      tiles.push(tileNum('Resultados no mês', mMes.resultados, 'num',
        mMes.custoResultado != null ? AH.fmt.moeda(mMes.custoResultado) + ' por resultado' : ''));
    }
    html += '<div class="grid grid-4 portal-tiles revelar">' + tiles.join('') + '</div>';

    /* aprovações (processo criativo) */
    if ((d.materiais || []).length) {
      html += secao('p-aprovacoes', 'aprovacao', 'Materiais para você revisar');
      html += '<div class="card revelar" style="padding:8px 16px"><div class="lista">';
      pendentesMat.forEach(function (mt) {
        var rotulo = mt.titulo + (mt.projeto ? ' (projeto: ' + mt.projeto + ')' : '');
        var msgAprovar = 'Olá! APROVO o material "' + rotulo + '". Pode seguir!';
        var msgAjustes = 'Olá! Sobre o material "' + rotulo + '", quero pedir os seguintes ajustes: ';
        html += '<div class="lista-item" style="flex-wrap:wrap">' +
          '<div class="principal"><div class="titulo">' + AH.esc(mt.titulo) + '</div>' +
          '<div class="sub">' + AH.esc(mt.tipo) + (mt.projeto ? ' · ' + AH.esc(mt.projeto) : '') +
          ' · enviado em ' + AH.fmt.data(mt.enviadoEm) + '</div></div>' +
          AH.ui.badgeStatusMaterial(mt.status);
        var botoes = '';
        if (mt.link) botoes += '<a class="btn btn-p btn-contorno" href="' + AH.esc(mt.link) + '" target="_blank" rel="noopener">' + AH.icons.olho + 'Ver material</a>';
        if (ag.whatsapp && mt.status === 'aguardando') {
          botoes += '<a class="btn btn-p btn-verde" href="' + AH.telLink(ag.whatsapp) + '?text=' + encodeURIComponent(msgAprovar) + '" target="_blank" rel="noopener">' + AH.icons.check + 'Aprovar</a>' +
            '<a class="btn btn-p btn-contorno" href="' + AH.telLink(ag.whatsapp) + '?text=' + encodeURIComponent(msgAjustes) + '" target="_blank" rel="noopener">' + AH.icons.editar + 'Pedir ajustes</a>';
        }
        if (botoes) html += '<span style="display:flex;gap:7px;flex-wrap:wrap;width:100%;padding:4px 0 8px">' + botoes + '</span>';
        html += '</div>';
      });
      aprovadosMat.forEach(function (mt) {
        html += '<div class="lista-item"><div class="principal"><div class="titulo">' + AH.esc(mt.titulo) + '</div>' +
          '<div class="sub">' + AH.esc(mt.tipo) + (mt.projeto ? ' · ' + AH.esc(mt.projeto) : '') + '</div></div>' +
          AH.ui.badgeStatusMaterial(mt.status) + '</div>';
      });
      html += '</div></div>';
    }

    /* projetos */
    html += secao('p-projetos', 'projetos', 'Seus projetos');
    if ((d.projetos || []).length) {
      html += '<div class="grid grid-2">';
      d.projetos.forEach(function (p) {
        var pct = PROGRESSO[p.status] != null ? PROGRESSO[p.status] : 50;
        var entregue = p.status === 'entregue';
        html += '<div class="card portal-projeto revelar">' +
          '<div class="cartao-titulo">' + AH.esc(p.titulo) + '</div>' +
          '<div class="toolbar" style="margin:6px 0 10px;gap:7px">' +
          '<span class="badge badge-roxo">' + AH.esc(p.tipo || 'Projeto') + '</span>' +
          (entregue ? '<span class="badge badge-verde">Entregue ✓</span>' : (p.prazo ? '<span class="chip">' + AH.icons.calendario + 'previsão: ' + AH.fmt.data(p.prazo) + '</span>' : '')) +
          '</div>' +
          (p.descricao ? '<p class="celula-sub" style="margin-bottom:10px">' + AH.esc(p.descricao) + '</p>' : '') +
          '<div class="progresso"><div class="progresso-preenchido' + (entregue ? ' progresso-ok' : '') + '" style="--w:' + pct + '%"></div></div>' +
          '<div class="progresso-rotulo"><span>' + AH.esc(AH.nomeColuna(p.status)) + '</span><b>' + pct + '%</b></div>' +
          '</div>';
      });
      html += '</div>';
    } else {
      html += '<p class="nota-rodape revelar">Nenhum projeto em andamento no momento.</p>';
    }

    /* postagens */
    if ((d.postagens || []).length) {
      html += secao('p-postagens', 'conteudo', 'Suas postagens');
      html += '<div class="card revelar" style="padding:8px 16px"><div class="lista">';
      d.postagens.forEach(function (pt) {
        html += '<div class="lista-item">' +
          '<div class="principal"><div class="titulo">' + AH.esc(pt.titulo) + '</div>' +
          '<div class="sub">' + AH.esc(AH.nomeDe(AH.dominio.canaisPostagem, pt.canal)) +
          (pt.formato ? ' · ' + AH.esc(pt.formato) : '') +
          (pt.data ? ' · ' + AH.fmt.data(pt.data) : '') +
          (pt.link ? ' · <a href="' + AH.esc(pt.link) + '" target="_blank" rel="noopener">ver publicação</a>' : '') +
          '</div></div>' +
          AH.ui.badgeStatusPostagem(pt.status) + '</div>';
      });
      html += '</div></div>';
    }

    /* agenda */
    if ((d.eventos || []).length) {
      html += secao('p-agenda', 'calendario', 'Próximos compromissos');
      html += '<div class="card revelar" style="padding:8px 16px"><div class="lista">';
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
    if (campanhas.length) {
      html += secao('p-anuncios', 'megafone', 'Seus anúncios (tráfego pago)');
      if (temGrafico) {
        html += '<div class="card revelar" style="margin-bottom:12px"><div class="card-titulo">' + AH.icons.financeiro +
          'Investimento em anúncios — últimos 6 meses</div>' +
          '<div class="portal-grafico" data-meses="' + AH.esc(JSON.stringify(invMeses)) + '"></div></div>';
      }
      campanhas.forEach(function (c) {
        var m = AH.metricasTrafego(c.registros);
        var unidade = AH.unidadeObjetivo(c.objetivo);
        var ordenados = (c.registros || []).slice().sort(function (a, b) { return String(b.de).localeCompare(String(a.de)); });
        var ultimo = ordenados[0];
        html += '<div class="card revelar" style="margin-bottom:12px">' +
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
          '</div>';
        if (ordenados.length) {
          html += '<div class="portal-mini-tabela tabela-wrap"><table class="tabela"><thead><tr>' +
            '<th>Período</th><th class="num">Investido</th><th class="num">' + AH.esc(capitalizar(unidade)) + '</th><th class="num">Custo/res.</th>' +
            '</tr></thead><tbody>';
          ordenados.slice(0, 3).forEach(function (r) {
            var mr = AH.metricasTrafego([r]);
            html += '<tr><td>' + AH.fmt.dataCurta(r.de) + ' — ' + AH.fmt.dataCurta(r.ate) + '</td>' +
              '<td class="num">' + AH.fmt.moeda(r.investimento) + '</td>' +
              '<td class="num"><b>' + AH.fmt.num(r.resultados) + '</b></td>' +
              '<td class="num">' + (mr.custoResultado != null ? AH.fmt.moeda(mr.custoResultado) : '—') + '</td></tr>';
          });
          html += '</tbody></table></div>';
        }
        if (ultimo) html += '<p class="nota-rodape" style="margin-top:10px">Último período registrado: ' + AH.fmt.data(ultimo.de) + ' a ' + AH.fmt.data(ultimo.ate) + '.</p>';
        html += '</div>';
      });
    }

    /* leads e conversões */
    if (d.leads && d.leads.mes) {
      var lm = d.leads.mes, lg = d.leads.geral;
      html += secao('p-leads', 'leads', 'Leads e conversões — este mês');
      var etapas = [
        ['Novos', lm.novo, 'f-azul'],
        ['Em contato', lm.contato, 'f-ciano'],
        ['Negociação', lm.negociacao, 'f-amarelo'],
        ['Convertidos', lm.convertido, 'f-verde'],
        ['Perdidos', lm.perdido, 'f-cinza']
      ];
      var maxEtapa = Math.max.apply(null, etapas.map(function (e) { return e[1]; }).concat([1]));
      html += '<div class="card revelar">' +
        '<div class="metricas-grid">' +
        metrica('Leads no mês', AH.fmt.num(lm.total)) +
        metrica('Convertidos', AH.fmt.num(lm.convertido)) +
        metrica('Taxa de conversão', lm.taxa != null ? AH.fmt.pct(lm.taxa) : '—') +
        metrica('Valor gerado', AH.fmt.moeda(lm.valor)) +
        '</div>' +
        '<div class="funil">' +
        etapas.map(function (e) {
          return '<div class="funil-linha"><span>' + e[0] + '</span>' +
            '<div class="funil-barra"><i class="funil-fill ' + e[2] + '" style="--w:' + Math.round(e[1] / maxEtapa * 100) + '%"></i></div>' +
            '<b>' + e[1] + '</b></div>';
        }).join('') +
        '</div>' +
        (lg && lg.total
          ? '<p class="nota-rodape" style="margin-top:14px">Desde o início do trabalho: ' + AH.fmt.num(lg.convertido) + ' conversões · ' + AH.fmt.moeda(lg.valor) + ' gerados.</p>'
          : '') +
        '</div>';
    }

    /* cobranças */
    if ((d.cobrancas || []).length) {
      var totalPend = d.cobrancas.reduce(function (a, c) { return a + (Number(c.valor) || 0); }, 0);
      html += secao('p-pagamentos', 'financeiro', 'Pagamentos em aberto');
      html += '<div class="card revelar" style="padding:8px 16px"><div class="lista">';
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

    /* rodapé com convite */
    html += '<div class="portal-cta revelar">' +
      '<h3>Precisa de algo? É só chamar.</h3>' +
      '<p>Dúvidas, ajustes ou uma nova ideia — a gente responde rápido.</p>' +
      (ag.whatsapp
        ? '<a class="btn btn-primario" href="' + AH.telLink(ag.whatsapp) + '" target="_blank" rel="noopener">' + AH.icons.whatsapp + 'Falar com a agência</a>'
        : '') +
      '</div>';

    html += '<footer class="portal-rodape">';
    var contatos = [];
    if (ag.instagram) contatos.push('<a href="' + AH.instaLink(ag.instagram) + '" target="_blank" rel="noopener">' + AH.esc(ag.instagram) + '</a>');
    if (ag.site) contatos.push(AH.esc(ag.site));
    if (ag.email) contatos.push(AH.esc(ag.email));
    if (contatos.length) html += '<p>' + contatos.join(' · ') + '</p>';
    html += '<p class="nota-rodape">' + AH.esc(ag.nome || 'Agência') + ' · portal gerado pelo AgênciaHub</p>';
    html += '</footer>';

    return html + '</div>';

    function tileNum(rotulo, valor, formato, extra) {
      return '<div class="card tile"><div class="tile-rotulo">' + AH.esc(rotulo) + '</div>' +
        '<div class="tile-valor" data-contar="' + (Number(valor) || 0) + '" data-formato="' + formato + '"></div>' +
        (extra ? '<div class="tile-extra">' + AH.esc(extra) + '</div>' : '') + '</div>';
    }
    function tileTexto(rotulo, valor, extra) {
      return '<div class="card tile"><div class="tile-rotulo">' + AH.esc(rotulo) + '</div>' +
        '<div class="tile-valor">' + AH.esc(valor) + '</div>' +
        (extra ? '<div class="tile-extra">' + extra + '</div>' : '') + '</div>';
    }
    function secao(id, icone, titulo) {
      return '<h2 class="portal-secao revelar" id="' + id + '"><span class="icone">' + (AH.icons[icone] || '') + '</span>' + AH.esc(titulo) + '</h2>';
    }
    function metrica(rotulo, valor) {
      return '<div class="metrica"><span>' + AH.esc(rotulo) + '</span><b>' + AH.esc(valor) + '</b></div>';
    }
    function capitalizar(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }
  };

  // Liga as animações e interações do portal depois que o HTML entra na página
  AH.ligarPortal = function (raiz) {
    var g = raiz.querySelector('.portal-grafico');
    if (g) {
      try {
        AH.ui.montarGraficoMeses(g, JSON.parse(g.getAttribute('data-meses')), 'Investimento em anúncios dos últimos 6 meses');
      } catch (e) { /* sem gráfico */ }
    }
    raiz.querySelectorAll('[data-rolar]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var alvo = raiz.querySelector('#' + a.getAttribute('data-rolar'));
        if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    AH.ui.revelarAoRolar(raiz);
    AH.ui._deveAnimar = true;
    AH.ui.animarContadores(raiz);
  };

  /* ---------- modo público (aberto pelo link) ---------- */

  AH.portalPublico = function (payload) {
    document.body.classList.add('modo-portal');
    // se o endereço mudar (ex.: navegar para o painel), recarrega no modo certo
    window.addEventListener('hashchange', function () { location.reload(); });
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
      AH.ligarPortal(raiz);
    }).catch(function (e) {
      console.warn('Portal: não foi possível abrir o link.', e);
      var antigo = e && e.message === 'NAVEGADOR_ANTIGO';
      var titulo = antigo ? 'Atualize o navegador para abrir' : 'Link inválido ou incompleto';
      var texto = antigo
        ? 'Este link precisa de uma versão mais recente do navegador. Atualize o app do seu celular (ou abra o link no Chrome) e tente de novo — se preferir, peça à agência um link novo.'
        : 'Confira se o endereço foi copiado por inteiro e, se precisar, peça um novo link para a agência.';
      raiz.innerHTML = '<div class="portal"><div class="card" style="margin-top:48px;text-align:center;padding:32px">' +
        '<h2 style="margin-bottom:8px">' + titulo + '</h2>' +
        '<p class="nota-rodape">' + texto + '</p>' +
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
      'O cliente abre e vê os projetos, materiais para aprovar, postagens, anúncios, leads e cobranças — só dele, sem acessar o seu painel. ' +
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
      if (snap) AH.ligarPortal(preview);
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
