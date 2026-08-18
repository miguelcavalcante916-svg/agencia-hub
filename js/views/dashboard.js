/* AgênciaHub — Painel (visão geral) */
(function () {
  'use strict';
  var AH = window.AH;

  function receitaPorMes(qtdMeses) {
    var meses = [];
    for (var i = qtdMeses - 1; i >= 0; i--) {
      var mm = AH.mesISO(-i);
      var total = AH.state.lancamentos.reduce(function (acc, l) {
        if (l.tipo === 'receita' && String(l.data).slice(0, 7) === mm) return acc + (Number(l.valor) || 0);
        return acc;
      }, 0);
      meses.push({ mes: mm, total: total });
    }
    return meses;
  }

  function render(el) {
    var st = AH.state;
    var hoje = AH.hojeISO();
    var mm = hoje.slice(0, 7);

    var recebidoMes = 0, aReceber = 0;
    st.lancamentos.forEach(function (l) {
      if (l.tipo !== 'receita') return;
      if (String(l.data).slice(0, 7) === mm && l.status === 'pago') recebidoMes += Number(l.valor) || 0;
      if (l.status === 'pendente') aReceber += Number(l.valor) || 0;
    });

    var emAndamento = st.projetos.filter(function (p) { return p.status !== 'entregue'; });
    var pendentes = st.tarefas.filter(function (t) { return !t.feita; });
    var atrasadas = pendentes.filter(function (t) { return t.prazo && AH.diasAte(t.prazo) < 0; });
    var propostasEnviadas = st.propostas.filter(function (p) { return p.status === 'enviada'; });
    var valorEnviadas = propostasEnviadas.reduce(function (a, p) { return a + AH.totalProposta(p); }, 0);
    var clientesAtivos = st.clientes.filter(function (c) { return c.status === 'ativo'; }).length;

    var dadosGrafico = receitaPorMes(6);

    var proximosEventos = st.eventos
      .filter(function (e) { return e.data >= hoje; })
      .sort(function (a, b) { return (a.data + a.hora).localeCompare(b.data + b.hora); })
      .slice(0, 5);

    var prazosProximos = emAndamento
      .filter(function (p) { return p.prazo; })
      .sort(function (a, b) { return a.prazo.localeCompare(b.prazo); })
      .slice(0, 5);

    var html = '';

    html += '<div class="grid grid-4">';
    html += tile(AH.icons.dinheiro, 'Recebido no mês', recebidoMes, 'moeda',
      'A receber (pendente): <b>' + AH.fmt.moeda(aReceber) + '</b>');
    html += tile(AH.icons.projetos, 'Projetos em andamento', emAndamento.length, 'num',
      clientesAtivos + ' cliente' + (clientesAtivos === 1 ? '' : 's') + ' ativo' + (clientesAtivos === 1 ? '' : 's'));
    html += tile(AH.icons.tarefas, 'Tarefas pendentes', pendentes.length, 'num',
      atrasadas.length ? '<b>' + atrasadas.length + ' atrasada' + (atrasadas.length === 1 ? '' : 's') + '</b>' : 'Nenhuma atrasada 🎉',
      atrasadas.length ? 'tile-alerta' : '');
    html += tile(AH.icons.propostas, 'Propostas aguardando', propostasEnviadas.length, 'num',
      'Em negociação: <b>' + AH.fmt.moeda(valorEnviadas) + '</b>');
    html += '</div>';

    html += '<div class="grid grid-principal" style="margin-top:16px">';

    // coluna esquerda: gráfico + prazos
    html += '<div class="grid" style="gap:16px">';
    html += '<div class="card"><div class="card-titulo">' + AH.icons.financeiro + 'Receita — últimos 6 meses</div>' +
      '<div id="grafico-receita"></div></div>';

    html += '<div class="card"><div class="card-titulo">' + AH.icons.alerta + 'Prazos de projetos' +
      '<a href="#/projetos" class="ver-todos">ver kanban →</a></div>';
    if (prazosProximos.length) {
      html += '<div class="lista">';
      prazosProximos.forEach(function (p) {
        html += '<div class="lista-item"><div class="principal">' +
          '<div class="titulo">' + AH.esc(p.titulo) + '</div>' +
          '<div class="sub">' + AH.esc(AH.nomeCliente(p.clienteId)) + ' · ' + AH.esc(AH.nomeColuna(p.status)) + '</div>' +
          '</div>' + AH.ui.prazoBadge(p.prazo) + '</div>';
      });
      html += '</div>';
    } else {
      html += AH.ui.vazio('projetos', 'Nenhum projeto em andamento', 'Crie um projeto para acompanhar prazos aqui.');
    }
    html += '</div>';
    html += '</div>';

    // coluna direita: agenda + atalhos
    html += '<div class="grid" style="gap:16px">';
    html += '<div class="card"><div class="card-titulo">' + AH.icons.calendario + 'Próximos compromissos' +
      '<a href="#/calendario" class="ver-todos">calendário →</a></div>';
    if (proximosEventos.length) {
      html += '<div class="lista">';
      proximosEventos.forEach(function (e) {
        var cor = AH.ui.corEvento[e.tipo] || 'cinza';
        html += '<div class="lista-item"><span class="ponto ponto-' + cor + '"></span><div class="principal">' +
          '<div class="titulo">' + AH.esc(e.titulo) + '</div>' +
          '<div class="sub">' + AH.fmt.dataCurta(e.data) + (e.hora ? ' · ' + AH.esc(e.hora) : '') +
          (e.clienteId ? ' · ' + AH.esc(AH.nomeCliente(e.clienteId)) : '') + '</div>' +
          '</div><span class="badge badge-' + cor + '">' + AH.esc(AH.ui.nomeEvento[e.tipo] || e.tipo) + '</span></div>';
      });
      html += '</div>';
    } else {
      html += AH.ui.vazio('calendario', 'Agenda livre', 'Nenhum compromisso a partir de hoje. Agende gravações e entregas no calendário.');
    }
    html += '</div>';

    html += '<div class="card"><div class="card-titulo">' + AH.icons.mais + 'Atalhos</div>' +
      '<div class="grid grid-2" style="gap:9px">' +
      '<button class="btn" data-atalho="cliente">' + AH.icons.clientes + 'Novo cliente</button>' +
      '<button class="btn" data-atalho="projeto">' + AH.icons.projetos + 'Novo projeto</button>' +
      '<button class="btn" data-atalho="tarefa">' + AH.icons.tarefas + 'Nova tarefa</button>' +
      '<button class="btn" data-atalho="proposta">' + AH.icons.propostas + 'Nova proposta</button>' +
      '</div></div>';

    html += '</div></div>';

    el.innerHTML = html;

    AH.ui.montarGraficoMeses(el.querySelector('#grafico-receita'), dadosGrafico, 'Receita dos últimos 6 meses');
    AH.ui.animarContadores(el);

    el.querySelectorAll('[data-atalho]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var qual = btn.getAttribute('data-atalho');
        if (qual === 'cliente') { location.hash = '#/clientes'; setTimeout(function () { AH.views.clientes.novo(); }, 60); }
        if (qual === 'projeto') { location.hash = '#/projetos'; setTimeout(function () { AH.views.projetos.novo(); }, 60); }
        if (qual === 'tarefa') { location.hash = '#/tarefas'; setTimeout(function () { AH.views.tarefas.novo(); }, 60); }
        if (qual === 'proposta') { location.hash = '#/propostas'; setTimeout(function () { AH.views.propostas.novo(); }, 60); }
      });
    });
  }

  function tile(icone, rotulo, valor, formato, extra, classe) {
    return '<div class="card tile ' + (classe || '') + '">' +
      '<div class="tile-rotulo">' + icone + AH.esc(rotulo) + '</div>' +
      '<div class="tile-valor" data-contar="' + (Number(valor) || 0) + '" data-formato="' + formato + '"></div>' +
      (extra ? '<div class="tile-extra">' + extra + '</div>' : '') +
      '</div>';
  }

  AH.views = AH.views || {};
  AH.views.dashboard = { titulo: 'Visão geral', render: render };
})();
