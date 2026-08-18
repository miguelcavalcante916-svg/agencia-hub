/* AgênciaHub — Tráfego pago (espelho do Gerenciador de Anúncios: Meta, Google, TikTok) */
(function () {
  'use strict';
  var AH = window.AH;

  var filtro = { plataforma: 'todas', clienteId: '' };

  var LINK_GERENCIADOR = {
    meta: 'https://business.facebook.com/adsmanager',
    google: 'https://ads.google.com',
    tiktok: 'https://ads.tiktok.com'
  };

  function campanhasFiltradas() {
    return AH.state.campanhas.filter(function (c) {
      if (filtro.plataforma !== 'todas' && c.plataforma !== filtro.plataforma) return false;
      if (filtro.clienteId && c.clienteId !== filtro.clienteId) return false;
      return true;
    });
  }

  /* ---------- formulário de campanha ---------- */

  function abrirFormCampanha(campanha) {
    var c = campanha || {};
    var ui = AH.ui;
    ui.modal({
      titulo: c.id ? 'Editar campanha' : 'Nova campanha',
      corpo:
        '<div class="form-grid">' +
        ui.campo('Nome da campanha *', ui.input('nome', c.nome, 'required placeholder="Ex.: Ofertas da semana — WhatsApp"'), 'campo-cheio') +
        ui.campo('Cliente *', ui.selectOpcional('clienteId', ui.opcoesClientes(), c.clienteId, 'Selecione...')) +
        ui.campo('Plataforma', ui.select('plataforma', AH.dominio.plataformas, c.plataforma || 'meta')) +
        ui.campo('Objetivo', ui.select('objetivo', AH.dominio.objetivosTrafego, c.objetivo || 'mensagens')) +
        ui.campo('Status', ui.select('status', AH.dominio.statusCampanha, c.status || 'ativa')) +
        ui.campo('Link da campanha no Gerenciador (opcional)', ui.input('linkGerenciador', c.linkGerenciador, 'placeholder="https://business.facebook.com/adsmanager/..."'), 'campo-cheio') +
        ui.campo('Observações', ui.textarea('notas', c.notas, 'rows="2" placeholder="Verba combinada, públicos, criativos..."'), 'campo-cheio') +
        '</div>',
      rodape:
        (c.id ? '<button type="button" class="btn btn-perigo a-esquerda" data-excluir>' + AH.icons.excluir + 'Excluir</button>' : '') +
        '<button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>' +
        '<button type="submit" class="btn btn-primario">Salvar</button>',
      aoMontar: function (modal, fechar) {
        var btn = modal.querySelector('[data-excluir]');
        if (btn) btn.addEventListener('click', function () {
          fechar();
          AH.ui.confirmar('Excluir a campanha "' + c.nome + '" e todos os seus registros de desempenho?', function () {
            AH.state.campanhas = AH.state.campanhas.filter(function (x) { return x.id !== c.id; });
            AH.salvar(); AH.ui.toast('Campanha excluída.'); AH.rerender();
          });
        });
      },
      aoEnviar: function (form, fechar) {
        var f = new FormData(form);
        if (!String(f.get('nome')).trim() || !f.get('clienteId')) {
          AH.ui.toast('Preencha o nome e o cliente.', 'erro');
          return;
        }
        var dados = {
          nome: String(f.get('nome')).trim(),
          clienteId: f.get('clienteId'),
          plataforma: f.get('plataforma'),
          objetivo: f.get('objetivo'),
          status: f.get('status'),
          linkGerenciador: String(f.get('linkGerenciador')).trim(),
          notas: String(f.get('notas')).trim()
        };
        if (c.id) Object.assign(c, dados);
        else AH.state.campanhas.push(Object.assign({ id: AH.uid(), registros: [] }, dados));
        AH.salvar(); fechar();
        AH.ui.toast(c.id ? 'Campanha atualizada.' : 'Campanha criada. Agora registre o desempenho por período.');
        AH.rerender();
      }
    });
  }

  /* ---------- registros de desempenho ---------- */

  function abrirRegistros(campanha) {
    var ui = AH.ui;
    var unidade = AH.unidadeObjetivo(campanha.objetivo);
    var registros = (campanha.registros || []).slice().sort(function (a, b) { return String(b.de).localeCompare(String(a.de)); });
    var m = AH.metricasTrafego(registros);

    var corpo =
      '<div class="toolbar" style="margin-bottom:12px">' +
      ui.badgePlataforma(campanha.plataforma) + ui.badgeStatusCampanha(campanha.status) +
      '<span class="chip">' + AH.esc(AH.nomeObjetivo(campanha.objetivo)) + '</span>' +
      '<span class="chip">' + AH.esc(AH.nomeCliente(campanha.clienteId)) + '</span>' +
      '</div>' +

      '<div class="metricas-grid">' +
      metrica('Investido (total)', AH.fmt.moeda(m.investimento)) +
      metrica('Alcance', AH.fmt.num(m.alcance)) +
      metrica('Impressões', AH.fmt.num(m.impressoes)) +
      metrica('Cliques', AH.fmt.num(m.cliques)) +
      metrica(capitalizar(unidade), AH.fmt.num(m.resultados)) +
      metrica('Custo por resultado', m.custoResultado != null ? AH.fmt.moeda(m.custoResultado) : '—') +
      metrica('CTR', AH.fmt.pct(m.ctr)) +
      metrica('CPC', m.cpc != null ? AH.fmt.moeda(m.cpc) : '—') +
      (m.roas != null ? metrica('ROAS (retorno)', m.roas.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'x') : '') +
      '</div>';

    if (registros.length) {
      corpo += '<div class="tabela-wrap" style="margin-top:14px"><table class="tabela"><thead><tr>' +
        '<th>Período</th><th class="num">Investido</th><th class="num">Alcance</th><th class="num">Cliques</th>' +
        '<th class="num">' + AH.esc(capitalizar(unidade)) + '</th><th class="num">Custo/res.</th><th class="acoes"></th>' +
        '</tr></thead><tbody>';
      registros.forEach(function (r) {
        var mr = AH.metricasTrafego([r]);
        corpo += '<tr data-reg="' + r.id + '">' +
          '<td>' + AH.fmt.dataCurta(r.de) + ' — ' + AH.fmt.dataCurta(r.ate) + '</td>' +
          '<td class="num">' + AH.fmt.moeda(r.investimento) + '</td>' +
          '<td class="num">' + AH.fmt.num(r.alcance) + '</td>' +
          '<td class="num">' + AH.fmt.num(r.cliques) + '</td>' +
          '<td class="num"><b>' + AH.fmt.num(r.resultados) + '</b></td>' +
          '<td class="num">' + (mr.custoResultado != null ? AH.fmt.moeda(mr.custoResultado) : '—') + '</td>' +
          '<td class="acoes">' +
          '<button type="button" class="btn btn-ghost btn-icon btn-p" data-editar-reg title="Editar">' + AH.icons.editar + '</button>' +
          '<button type="button" class="btn btn-ghost btn-icon btn-p" data-excluir-reg title="Excluir">' + AH.icons.excluir + '</button>' +
          '</td></tr>';
      });
      corpo += '</tbody></table></div>';
    } else {
      corpo += '<p class="nota-rodape" style="margin-top:12px">Nenhum registro ainda. Abra o Gerenciador de Anúncios, copie os números do período e registre aqui — é isso que o cliente vê no portal.</p>';
    }

    var linkExterno = campanha.linkGerenciador || LINK_GERENCIADOR[campanha.plataforma] || '';

    ui.modal({
      titulo: campanha.nome,
      largura: 'g',
      corpo: corpo,
      rodape:
        (linkExterno ? '<a class="btn btn-ghost a-esquerda" href="' + AH.esc(linkExterno) + '" target="_blank" rel="noopener">' + AH.icons.externo + 'Abrir Gerenciador</a>' : '') +
        '<button type="button" class="btn btn-ghost" data-fechar>Fechar</button>' +
        '<button type="submit" class="btn btn-primario">' + AH.icons.mais + 'Registrar período</button>',
      aoMontar: function (modal) {
        modal.querySelectorAll('tr[data-reg]').forEach(function (tr) {
          var r = (campanha.registros || []).filter(function (x) { return x.id === tr.getAttribute('data-reg'); })[0];
          tr.querySelector('[data-editar-reg]').addEventListener('click', function () { abrirFormRegistro(campanha, r); });
          tr.querySelector('[data-excluir-reg]').addEventListener('click', function () {
            campanha.registros = campanha.registros.filter(function (x) { return x.id !== r.id; });
            AH.salvar(); AH.rerender(); abrirRegistros(campanha);
          });
        });
      },
      aoEnviar: function (_f, _fechar) { abrirFormRegistro(campanha, null); }
    });
  }

  function abrirFormRegistro(campanha, registro) {
    var r = registro || {};
    var ui = AH.ui;
    var unidade = AH.unidadeObjetivo(campanha.objetivo);
    var mmAtual = AH.mesISO(0);
    ui.modal({
      titulo: (r.id ? 'Editar' : 'Registrar') + ' desempenho — ' + campanha.nome,
      corpo:
        '<p class="nota-rodape" style="margin-bottom:12px">Copie os números do Gerenciador de Anúncios para o período abaixo.</p>' +
        '<div class="form-grid">' +
        ui.campo('Início do período *', ui.input('de', r.de || mmAtual + '-01', 'type="date" required')) +
        ui.campo('Fim do período *', ui.input('ate', r.ate || AH.hojeISO(), 'type="date" required')) +
        ui.campo('Investimento (R$) *', ui.input('investimento', r.investimento, 'type="number" min="0" step="0.01" required placeholder="0,00"')) +
        ui.campo(capitalizar(unidade) + ' (resultados) *', ui.input('resultados', r.resultados, 'type="number" min="0" step="1" required')) +
        ui.campo('Alcance', ui.input('alcance', r.alcance, 'type="number" min="0" step="1"')) +
        ui.campo('Impressões', ui.input('impressoes', r.impressoes, 'type="number" min="0" step="1"')) +
        ui.campo('Cliques', ui.input('cliques', r.cliques, 'type="number" min="0" step="1"')) +
        ui.campo('Receita gerada (R$, opcional — calcula o ROAS)', ui.input('receita', r.receita, 'type="number" min="0" step="0.01"')) +
        '</div>',
      rodape:
        '<button type="button" class="btn btn-ghost" data-voltar>Voltar</button>' +
        '<button type="submit" class="btn btn-primario">Salvar registro</button>',
      aoMontar: function (modal) {
        modal.querySelector('[data-voltar]').addEventListener('click', function () { abrirRegistros(campanha); });
      },
      aoEnviar: function (form) {
        var f = new FormData(form);
        if (!f.get('de') || !f.get('ate') || f.get('investimento') === '') return;
        var dados = {
          de: f.get('de'),
          ate: f.get('ate'),
          investimento: Number(f.get('investimento')) || 0,
          alcance: Number(f.get('alcance')) || 0,
          impressoes: Number(f.get('impressoes')) || 0,
          cliques: Number(f.get('cliques')) || 0,
          resultados: Number(f.get('resultados')) || 0,
          receita: Number(f.get('receita')) || 0
        };
        if (r.id) Object.assign(r, dados);
        else {
          campanha.registros = campanha.registros || [];
          campanha.registros.push(Object.assign({ id: AH.uid() }, dados));
        }
        AH.salvar(); AH.rerender();
        AH.ui.toast('Desempenho registrado.');
        abrirRegistros(campanha);
      }
    });
  }

  /* ---------- tela principal ---------- */

  function render(el) {
    var lista = campanhasFiltradas();
    var mmAtual = AH.mesISO(0);
    var mMes = AH.metricasTrafego(AH.registrosDoMes(lista, mmAtual));

    var investimentoPorMes = [];
    for (var i = 5; i >= 0; i--) {
      var mm = AH.mesISO(-i);
      var mi = AH.metricasTrafego(AH.registrosDoMes(lista, mm));
      investimentoPorMes.push({ mes: mm, total: mi.investimento });
    }

    var html = '<div class="toolbar">' +
      '<div class="segmentos" id="seg-plat">' +
      segPlat('todas', 'Todas') +
      AH.dominio.plataformas.filter(function (p) { return p.id !== 'outra'; }).map(function (p) {
        return segPlat(p.id, p.curto);
      }).join('') +
      '</div>' +
      '<select class="input" id="filtro-cliente" style="width:auto;min-width:160px">' +
      '<option value="">Todos os clientes</option>' +
      AH.ui.opcoesClientes().map(function (c) {
        return '<option value="' + c.id + '"' + (filtro.clienteId === c.id ? ' selected' : '') + '>' + AH.esc(c.nome) + '</option>';
      }).join('') +
      '</select>' +
      '<div class="espaco"></div>' +
      (filtro.plataforma !== 'todas' && LINK_GERENCIADOR[filtro.plataforma]
        ? '<a class="btn btn-contorno" href="' + LINK_GERENCIADOR[filtro.plataforma] + '" target="_blank" rel="noopener">' + AH.icons.externo + 'Abrir Gerenciador</a>'
        : '') +
      '<button class="btn btn-primario" id="btn-nova">' + AH.icons.mais + 'Nova campanha</button>' +
      '</div>';

    html += '<div class="grid grid-4">' +
      tile('Investido no mês', AH.fmt.moeda(mMes.investimento)) +
      tile('Resultados no mês', AH.fmt.num(mMes.resultados)) +
      tile('Custo por resultado', mMes.custoResultado != null ? AH.fmt.moeda(mMes.custoResultado) : '—') +
      tile('CTR médio', AH.fmt.pct(mMes.ctr)) +
      '</div>';

    html += '<div class="card" style="margin-top:16px"><div class="card-titulo">' + AH.icons.megafone +
      'Investimento em anúncios — últimos 6 meses</div><div id="grafico-trafego"></div></div>';

    if (!lista.length) {
      html += '<div style="margin-top:16px">' + AH.ui.vazio('megafone', 'Nenhuma campanha aqui',
        'Crie uma campanha e registre o desempenho por período — os números aparecem também no portal do cliente.') + '</div>';
    } else {
      html += '<div class="tabela-wrap" style="margin-top:16px"><table class="tabela"><thead><tr>' +
        '<th>Campanha</th><th>Cliente</th><th>Plataforma</th><th>Status</th>' +
        '<th class="num">Investido</th><th class="num">Resultados</th><th class="num">Custo/res.</th><th class="num">CTR</th><th class="acoes"></th>' +
        '</tr></thead><tbody>';
      lista.forEach(function (c) {
        var m = AH.metricasTrafego(c.registros);
        html += '<tr data-id="' + c.id + '">' +
          '<td><div class="celula-principal">' + AH.esc(c.nome) + '</div>' +
          '<div class="celula-sub">' + AH.esc(AH.nomeObjetivo(c.objetivo)) + ' · ' + (c.registros || []).length + ' registro(s)</div></td>' +
          '<td>' + AH.esc(AH.nomeCliente(c.clienteId)) + '</td>' +
          '<td>' + AH.ui.badgePlataforma(c.plataforma) + '</td>' +
          '<td>' + AH.ui.badgeStatusCampanha(c.status) + '</td>' +
          '<td class="num"><b>' + AH.fmt.moeda(m.investimento) + '</b></td>' +
          '<td class="num">' + AH.fmt.num(m.resultados) + ' <span class="celula-sub">' + AH.esc(AH.unidadeObjetivo(c.objetivo)) + '</span></td>' +
          '<td class="num">' + (m.custoResultado != null ? AH.fmt.moeda(m.custoResultado) : '—') + '</td>' +
          '<td class="num">' + AH.fmt.pct(m.ctr) + '</td>' +
          '<td class="acoes">' +
          '<button class="btn btn-p btn-contorno sempre-visivel" data-acao="registros">' + AH.icons.mais + 'Desempenho</button>' +
          '<button class="btn btn-ghost btn-icon btn-p" data-acao="editar" title="Editar campanha">' + AH.icons.editar + '</button>' +
          '</td></tr>';
      });
      html += '</tbody></table></div>';
      html += '<p class="nota-rodape" style="margin-top:10px">Espelhe aqui os números do Gerenciador de Anúncios (semanal ou mensal). Clique em “Desempenho” para ver métricas completas e registrar novos períodos.</p>';
    }

    el.innerHTML = html;

    AH.ui.montarGraficoMeses(el.querySelector('#grafico-trafego'), investimentoPorMes, 'Investimento em anúncios dos últimos 6 meses');

    el.querySelectorAll('#seg-plat button').forEach(function (b) {
      b.addEventListener('click', function () { filtro.plataforma = b.getAttribute('data-v'); render(el); });
    });
    el.querySelector('#filtro-cliente').addEventListener('change', function (e) {
      filtro.clienteId = e.target.value; render(el);
    });
    el.querySelector('#btn-nova').addEventListener('click', function () { abrirFormCampanha(null); });
    el.querySelectorAll('tbody tr').forEach(function (tr) {
      var c = AH.campanhaPorId(tr.getAttribute('data-id'));
      tr.querySelector('[data-acao="registros"]').addEventListener('click', function () { abrirRegistros(c); });
      tr.querySelector('[data-acao="editar"]').addEventListener('click', function () { abrirFormCampanha(c); });
    });
  }

  function tile(rotulo, valor) {
    return '<div class="card tile"><div class="tile-rotulo">' + AH.esc(rotulo) + '</div>' +
      '<div class="tile-valor">' + AH.esc(valor) + '</div></div>';
  }

  function segPlat(valor, rotulo) {
    return '<button data-v="' + valor + '" class="' + (filtro.plataforma === valor ? 'ativo' : '') + '">' + AH.esc(rotulo) + '</button>';
  }

  function capitalizar(s) {
    s = String(s || '');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function metrica(rotulo, valor) {
    return '<div class="metrica"><span>' + AH.esc(rotulo) + '</span><b>' + AH.esc(valor) + '</b></div>';
  }

  AH.views = AH.views || {};
  AH.views.trafego = { titulo: 'Tráfego pago', render: render, novo: function () { abrirFormCampanha(null); } };
})();
