/* AgênciaHub — Aprovações (materiais criativos enviados ao cliente) */
(function () {
  'use strict';
  var AH = window.AH;

  var filtro = 'pendentes'; // pendentes | aprovados | todos

  function abrirForm(material) {
    var mt = material || {};
    var ui = AH.ui;
    ui.modal({
      titulo: mt.id ? 'Editar material' : 'Enviar material para aprovação',
      corpo:
        '<div class="form-grid">' +
        ui.campo('Nome do material *', ui.input('titulo', mt.titulo, 'required placeholder="Ex.: Corte 1 — vídeo institucional"'), 'campo-cheio') +
        ui.campo('Cliente *', ui.selectOpcional('clienteId', ui.opcoesClientes(), mt.clienteId, 'Selecione...')) +
        ui.campo('Projeto', ui.selectOpcional('projetoId', ui.opcoesProjetos(), mt.projetoId, 'Sem projeto')) +
        ui.campo('Tipo', ui.select('tipo', AH.dominio.tiposMaterial, mt.tipo || 'Vídeo')) +
        ui.campo('Situação', ui.select('status', AH.dominio.statusMaterial, mt.status || 'aguardando')) +
        ui.campo('Link do material (Drive, YouTube não listado, WeTransfer...)', ui.input('link', mt.link, 'placeholder="https://drive.google.com/..."'), 'campo-cheio') +
        ui.campo('Observações', ui.textarea('notas', mt.notas, 'rows="2" placeholder="O que o cliente deve olhar, versão, pendências..."'), 'campo-cheio') +
        '</div>',
      rodape:
        (mt.id ? '<button type="button" class="btn btn-perigo a-esquerda" data-excluir>' + AH.icons.excluir + 'Excluir</button>' : '') +
        '<button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>' +
        '<button type="submit" class="btn btn-primario">Salvar</button>',
      aoMontar: function (modal, fechar) {
        var btn = modal.querySelector('[data-excluir]');
        if (btn) btn.addEventListener('click', function () {
          AH.state.materiais = AH.state.materiais.filter(function (x) { return x.id !== mt.id; });
          AH.salvar(); fechar(); AH.ui.toast('Material excluído.'); AH.rerender();
        });
      },
      aoEnviar: function (form, fechar) {
        var f = new FormData(form);
        if (!String(f.get('titulo')).trim() || !f.get('clienteId')) {
          AH.ui.toast('Preencha o nome e o cliente.', 'erro');
          return;
        }
        var dados = {
          titulo: String(f.get('titulo')).trim(),
          clienteId: f.get('clienteId'),
          projetoId: f.get('projetoId'),
          tipo: f.get('tipo'),
          status: f.get('status'),
          link: String(f.get('link')).trim(),
          notas: String(f.get('notas')).trim()
        };
        if (mt.id) Object.assign(mt, dados);
        else AH.state.materiais.push(Object.assign({ id: AH.uid(), enviadoEm: AH.hojeISO() }, dados));
        AH.salvar(); fechar();
        AH.ui.toast(mt.id ? 'Material atualizado.' : 'Material registrado. Gere o link do portal para o cliente revisar.');
        AH.rerender();
      }
    });
  }

  function render(el) {
    var todos = AH.state.materiais.slice();
    var pendentes = todos.filter(function (mt) { return mt.status !== 'aprovado'; });

    var lista;
    if (filtro === 'pendentes') lista = pendentes;
    else if (filtro === 'aprovados') lista = todos.filter(function (mt) { return mt.status === 'aprovado'; });
    else lista = todos;
    lista.sort(function (a, b) { return String(b.enviadoEm).localeCompare(String(a.enviadoEm)); });

    var html = '<div class="toolbar">' +
      '<div class="segmentos" id="seg-mat">' +
      seg('pendentes', 'Pendentes (' + pendentes.length + ')') +
      seg('aprovados', 'Aprovados') +
      seg('todos', 'Todos') +
      '</div>' +
      '<div class="espaco"></div>' +
      '<button class="btn btn-primario" id="btn-novo-mat">' + AH.icons.mais + 'Enviar material</button>' +
      '</div>';

    html += '<div class="card" style="margin-bottom:16px"><p class="nota-rodape">' +
      'Registre aqui cada material que precisa do "ok" do cliente (corte de vídeo, arte, roteiro) com o link do arquivo. ' +
      'No <a href="#/portal">portal do cliente</a>, ele vê o material e responde com um toque pelo WhatsApp: <b>Aprovar</b> ou <b>Pedir ajustes</b>. ' +
      'Quando a resposta chegar, atualize a situação aqui.</p></div>';

    if (!lista.length) {
      html += AH.ui.vazio('aprovacao', filtro === 'pendentes' ? 'Nada aguardando aprovação' : 'Nenhum material aqui',
        'Envie um material para aprovação e acompanhe as respostas dos clientes.');
    } else {
      html += '<div class="tabela-wrap"><table class="tabela"><thead><tr>' +
        '<th>Material</th><th>Cliente</th><th>Tipo</th><th>Enviado em</th><th>Situação</th><th class="acoes"></th>' +
        '</tr></thead><tbody>';
      lista.forEach(function (mt) {
        var proj = AH.projetoPorId(mt.projetoId);
        html += '<tr data-id="' + mt.id + '">' +
          '<td><div class="celula-principal">' + AH.esc(mt.titulo) + '</div>' +
          '<div class="celula-sub">' + (proj ? AH.esc(proj.titulo) : '') +
          (mt.link ? (proj ? ' · ' : '') + '<a href="' + AH.esc(mt.link) + '" target="_blank" rel="noopener">abrir material</a>' : '') +
          '</div></td>' +
          '<td>' + AH.esc(AH.nomeCliente(mt.clienteId)) + '</td>' +
          '<td><span class="chip">' + AH.esc(mt.tipo) + '</span></td>' +
          '<td>' + AH.fmt.dataCurta(mt.enviadoEm) + '</td>' +
          '<td><select class="input" data-status style="width:auto;padding:4px 28px 4px 9px;font-size:12.5px">' +
          AH.dominio.statusMaterial.map(function (s) {
            return '<option value="' + s.id + '"' + (mt.status === s.id ? ' selected' : '') + '>' + s.nome + '</option>';
          }).join('') + '</select></td>' +
          '<td class="acoes"><button class="btn btn-ghost btn-icon btn-p" data-acao="editar" title="Editar">' + AH.icons.editar + '</button></td>' +
          '</tr>';
      });
      html += '</tbody></table></div>';
    }

    el.innerHTML = html;

    el.querySelectorAll('#seg-mat button').forEach(function (b) {
      b.addEventListener('click', function () { filtro = b.getAttribute('data-v'); render(el); });
    });
    el.querySelector('#btn-novo-mat').addEventListener('click', function () { abrirForm(null); });
    el.querySelectorAll('tbody tr').forEach(function (tr) {
      var mt = AH.state.materiais.filter(function (x) { return x.id === tr.getAttribute('data-id'); })[0];
      tr.querySelector('[data-acao="editar"]').addEventListener('click', function () { abrirForm(mt); });
      tr.querySelector('[data-status]').addEventListener('change', function (e) {
        mt.status = e.target.value;
        AH.salvar(); render(el);
      });
    });
  }

  function seg(valor, rotulo) {
    return '<button data-v="' + valor + '" class="' + (filtro === valor ? 'ativo' : '') + '">' + AH.esc(rotulo) + '</button>';
  }

  AH.views = AH.views || {};
  AH.views.aprovacoes = { titulo: 'Aprovações', render: render, novo: function () { abrirForm(null); } };
})();
