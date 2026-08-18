/* AgênciaHub — Leads e conversões (funil por cliente, ligado às campanhas) */
(function () {
  'use strict';
  var AH = window.AH;

  var filtro = { status: 'todos', clienteId: '' };

  function opcoesCampanhas(clienteId) {
    return AH.state.campanhas
      .filter(function (c) { return !clienteId || c.clienteId === clienteId; })
      .map(function (c) { return { id: c.id, nome: c.nome + ' (' + AH.nomeCliente(c.clienteId) + ')' }; });
  }

  function abrirForm(lead) {
    var l = lead || {};
    var ui = AH.ui;
    ui.modal({
      titulo: l.id ? 'Editar lead' : 'Novo lead',
      corpo:
        '<div class="form-grid">' +
        ui.campo('Nome do lead *', ui.input('nome', l.nome, 'required placeholder="Quem entrou em contato"'), 'campo-cheio') +
        ui.campo('Cliente (de quem é o lead) *', ui.selectOpcional('clienteId', ui.opcoesClientes(), l.clienteId, 'Selecione...')) +
        ui.campo('Campanha de origem', ui.selectOpcional('campanhaId', opcoesCampanhas(), l.campanhaId, 'Sem campanha')) +
        ui.campo('Origem', ui.select('origem', AH.dominio.origensLead, l.origem || 'Anúncio Meta')) +
        ui.campo('Data', ui.input('data', l.data || AH.hojeISO(), 'type="date"')) +
        ui.campo('WhatsApp / contato', ui.input('contato', l.contato, 'placeholder="(00) 00000-0000"')) +
        ui.campo('Etapa do funil', ui.select('status', AH.dominio.statusLead, l.status || 'novo')) +
        ui.campo('Valor da conversão (R$)', ui.input('valor', l.valor, 'type="number" min="0" step="0.01" placeholder="preencha se convertido"')) +
        ui.campo('Anotações', ui.textarea('notas', l.notas, 'rows="2"'), 'campo-cheio') +
        '</div>',
      rodape:
        (l.id ? '<button type="button" class="btn btn-perigo a-esquerda" data-excluir>' + AH.icons.excluir + 'Excluir</button>' : '') +
        '<button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>' +
        '<button type="submit" class="btn btn-primario">Salvar</button>',
      aoMontar: function (modal, fechar) {
        var btn = modal.querySelector('[data-excluir]');
        if (btn) btn.addEventListener('click', function () {
          AH.state.leads = AH.state.leads.filter(function (x) { return x.id !== l.id; });
          AH.salvar(); fechar(); AH.ui.toast('Lead excluído.'); AH.rerender();
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
          campanhaId: f.get('campanhaId'),
          origem: f.get('origem'),
          data: f.get('data'),
          contato: String(f.get('contato')).trim(),
          status: f.get('status'),
          valor: Number(f.get('valor')) || 0,
          notas: String(f.get('notas')).trim()
        };
        if (l.id) Object.assign(l, dados);
        else AH.state.leads.push(Object.assign({ id: AH.uid() }, dados));
        AH.salvar(); fechar(); AH.ui.toast('Lead salvo.'); AH.rerender();
      }
    });
  }

  function render(el) {
    var todos = AH.state.leads.slice();
    if (filtro.clienteId) todos = todos.filter(function (l) { return l.clienteId === filtro.clienteId; });

    var mmAtual = AH.mesISO(0);
    var doMes = todos.filter(function (l) { return String(l.data).slice(0, 7) === mmAtual; });
    var resumoMes = AH.resumoLeads(doMes);
    var resumoTudo = AH.resumoLeads(todos);

    var lista = todos;
    if (filtro.status !== 'todos') lista = lista.filter(function (l) { return l.status === filtro.status; });
    lista.sort(function (a, b) { return String(b.data).localeCompare(String(a.data)); });

    var html = '<div class="toolbar">' +
      '<div class="segmentos" id="seg-lead">' +
      seg('todos', 'Todos (' + resumoTudo.total + ')') +
      AH.dominio.statusLead.map(function (s) { return seg(s.id, s.nome); }).join('') +
      '</div>' +
      '<select class="input" id="filtro-cliente-lead" style="width:auto;min-width:160px">' +
      '<option value="">Todos os clientes</option>' +
      AH.ui.opcoesClientes().map(function (c) {
        return '<option value="' + c.id + '"' + (filtro.clienteId === c.id ? ' selected' : '') + '>' + AH.esc(c.nome) + '</option>';
      }).join('') +
      '</select>' +
      '<div class="espaco"></div>' +
      '<button class="btn btn-primario" id="btn-novo-lead">' + AH.icons.mais + 'Novo lead</button>' +
      '</div>';

    html += '<div class="grid grid-4">' +
      tile('Leads no mês', String(resumoMes.total), resumoMes.novo + ' novo(s) sem contato') +
      tile('Em andamento', String(resumoTudo.emAndamento), 'novo + contato + negociação') +
      tile('Convertidos no mês', String(resumoMes.convertido),
        resumoMes.taxa != null ? 'taxa de ' + AH.fmt.pct(resumoMes.taxa) : '') +
      tile('Valor gerado no mês', AH.fmt.moeda(resumoMes.valor), 'soma das conversões', 'verde') +
      '</div>';

    if (!lista.length) {
      html += '<div style="margin-top:16px">' + AH.ui.vazio('leads', 'Nenhum lead aqui',
        'Registre os contatos que as campanhas geram para cada cliente e acompanhe o funil até a conversão.') + '</div>';
    } else {
      html += '<div class="tabela-wrap" style="margin-top:16px"><table class="tabela"><thead><tr>' +
        '<th>Lead</th><th>Cliente</th><th>Origem</th><th>Data</th><th>Etapa</th><th class="num">Valor</th><th class="acoes"></th>' +
        '</tr></thead><tbody>';
      lista.forEach(function (l) {
        var camp = AH.campanhaPorId(l.campanhaId);
        html += '<tr data-id="' + l.id + '">' +
          '<td><div class="celula-principal">' + AH.esc(l.nome) + '</div>' +
          (l.contato ? '<div class="celula-sub"><a href="' + AH.telLink(l.contato) + '" target="_blank" rel="noopener">' + AH.esc(l.contato) + '</a></div>' : '') +
          '</td>' +
          '<td>' + AH.esc(AH.nomeCliente(l.clienteId)) + '</td>' +
          '<td><span class="chip" title="' + AH.esc(camp ? camp.nome : '') + '">' + AH.esc(camp ? camp.nome : l.origem) + '</span></td>' +
          '<td>' + AH.fmt.dataCurta(l.data) + '</td>' +
          '<td><select class="input" data-status style="width:auto;padding:4px 28px 4px 9px;font-size:12.5px">' +
          AH.dominio.statusLead.map(function (s) {
            return '<option value="' + s.id + '"' + (l.status === s.id ? ' selected' : '') + '>' + s.nome + '</option>';
          }).join('') + '</select></td>' +
          '<td class="num">' + (l.status === 'convertido' && l.valor ? '<b style="color:var(--verde)">' + AH.fmt.moeda(l.valor) + '</b>' : '—') + '</td>' +
          '<td class="acoes"><button class="btn btn-ghost btn-icon btn-p" data-acao="editar" title="Editar">' + AH.icons.editar + '</button></td>' +
          '</tr>';
      });
      html += '</tbody></table></div>';
      html += '<p class="nota-rodape" style="margin-top:10px">Ao marcar como <b>Convertido</b>, informe o valor no lead — a taxa de conversão e o valor gerado aparecem no portal do cliente.</p>';
    }

    el.innerHTML = html;

    el.querySelectorAll('#seg-lead button').forEach(function (b) {
      b.addEventListener('click', function () { filtro.status = b.getAttribute('data-v'); render(el); });
    });
    el.querySelector('#filtro-cliente-lead').addEventListener('change', function (e) {
      filtro.clienteId = e.target.value; render(el);
    });
    el.querySelector('#btn-novo-lead').addEventListener('click', function () { abrirForm(null); });
    el.querySelectorAll('tbody tr').forEach(function (tr) {
      var l = AH.state.leads.filter(function (x) { return x.id === tr.getAttribute('data-id'); })[0];
      tr.querySelector('[data-acao="editar"]').addEventListener('click', function () { abrirForm(l); });
      tr.querySelector('[data-status]').addEventListener('change', function (e) {
        l.status = e.target.value;
        AH.salvar();
        if (l.status === 'convertido' && !l.valor) {
          AH.ui.toast('Convertido! Abra o lead e informe o valor da conversão.');
          abrirForm(l);
        }
        render(el);
      });
    });
  }

  function tile(rotulo, valor, extra, cor) {
    return '<div class="card tile"><div class="tile-rotulo">' + AH.esc(rotulo) + '</div>' +
      '<div class="tile-valor"' + (cor ? ' style="color:var(--' + cor + ')"' : '') + '>' + AH.esc(valor) + '</div>' +
      (extra ? '<div class="tile-extra">' + AH.esc(extra) + '</div>' : '') + '</div>';
  }

  function seg(valor, rotulo) {
    return '<button data-v="' + valor + '" class="' + (filtro.status === valor ? 'ativo' : '') + '">' + AH.esc(rotulo) + '</button>';
  }

  AH.views = AH.views || {};
  AH.views.leads = { titulo: 'Leads e conversões', render: render, novo: function () { abrirForm(null); } };
})();
