/* AgênciaHub — Conteúdo (pipeline de postagens por cliente) */
(function () {
  'use strict';
  var AH = window.AH;

  var filtro = { status: 'todas', clienteId: '' };
  var PROXIMO = { ideia: 'producao', producao: 'aprovacao', aprovacao: 'agendada', agendada: 'publicada' };

  function abrirForm(postagem) {
    var pt = postagem || {};
    var ui = AH.ui;
    ui.modal({
      titulo: pt.id ? 'Editar postagem' : 'Nova postagem',
      corpo:
        '<div class="form-grid">' +
        ui.campo('Título / ideia *', ui.input('titulo', pt.titulo, 'required placeholder="Ex.: Reels — Ofertas da semana"'), 'campo-cheio') +
        ui.campo('Cliente *', ui.selectOpcional('clienteId', ui.opcoesClientes(), pt.clienteId, 'Selecione...')) +
        ui.campo('Projeto', ui.selectOpcional('projetoId', ui.opcoesProjetos(), pt.projetoId, 'Sem projeto')) +
        ui.campo('Canal', ui.select('canal', AH.dominio.canaisPostagem, pt.canal || 'instagram')) +
        ui.campo('Formato', ui.select('formato', AH.dominio.formatosPostagem, pt.formato || 'Reels')) +
        ui.campo('Data planejada', ui.input('data', pt.data || AH.diasISO(2), 'type="date"')) +
        ui.campo('Etapa', ui.select('status', AH.dominio.statusPostagem, pt.status || 'ideia')) +
        ui.campo('Legenda / roteiro', ui.textarea('legenda', pt.legenda, 'rows="3" placeholder="Legenda, hashtags, CTA..."'), 'campo-cheio') +
        ui.campo('Link da publicação (depois de publicada)', ui.input('linkPublicacao', pt.linkPublicacao, 'placeholder="https://instagram.com/p/..."'), 'campo-cheio') +
        '</div>',
      rodape:
        (pt.id ? '<button type="button" class="btn btn-perigo a-esquerda" data-excluir>' + AH.icons.excluir + 'Excluir</button>' : '') +
        '<button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>' +
        '<button type="submit" class="btn btn-primario">Salvar</button>',
      aoMontar: function (modal, fechar) {
        var btn = modal.querySelector('[data-excluir]');
        if (btn) btn.addEventListener('click', function () {
          AH.state.postagens = AH.state.postagens.filter(function (x) { return x.id !== pt.id; });
          AH.salvar(); fechar(); AH.ui.toast('Postagem excluída.'); AH.rerender();
        });
      },
      aoEnviar: function (form, fechar) {
        var f = new FormData(form);
        if (!String(f.get('titulo')).trim() || !f.get('clienteId')) {
          AH.ui.toast('Preencha o título e o cliente.', 'erro');
          return;
        }
        var dados = {
          titulo: String(f.get('titulo')).trim(),
          clienteId: f.get('clienteId'),
          projetoId: f.get('projetoId'),
          canal: f.get('canal'),
          formato: f.get('formato'),
          data: f.get('data'),
          status: f.get('status'),
          legenda: String(f.get('legenda')).trim(),
          linkPublicacao: String(f.get('linkPublicacao')).trim()
        };
        if (pt.id) Object.assign(pt, dados);
        else AH.state.postagens.push(Object.assign({ id: AH.uid() }, dados));
        AH.salvar(); fechar(); AH.ui.toast('Postagem salva.'); AH.rerender();
      }
    });
  }

  function render(el) {
    var todas = AH.state.postagens.slice();
    var mmAtual = AH.mesISO(0);

    var doMes = todas.filter(function (pt) { return String(pt.data).slice(0, 7) === mmAtual; }).length;
    var emAprovacao = todas.filter(function (pt) { return pt.status === 'aprovacao'; }).length;
    var agendadas = todas.filter(function (pt) { return pt.status === 'agendada'; }).length;
    var publicadasMes = todas.filter(function (pt) { return pt.status === 'publicada' && String(pt.data).slice(0, 7) === mmAtual; }).length;

    var lista = todas;
    if (filtro.status !== 'todas') lista = lista.filter(function (pt) { return pt.status === filtro.status; });
    if (filtro.clienteId) lista = lista.filter(function (pt) { return pt.clienteId === filtro.clienteId; });
    lista.sort(function (a, b) {
      if ((a.status === 'publicada') !== (b.status === 'publicada')) return a.status === 'publicada' ? 1 : -1;
      return String(a.data || '9999').localeCompare(String(b.data || '9999'));
    });

    var html = '<div class="toolbar">' +
      '<div class="segmentos" id="seg-post">' +
      seg('todas', 'Todas') +
      AH.dominio.statusPostagem.map(function (s) { return seg(s.id, s.nome); }).join('') +
      '</div>' +
      '<select class="input" id="filtro-cliente-post" style="width:auto;min-width:160px">' +
      '<option value="">Todos os clientes</option>' +
      AH.ui.opcoesClientes().map(function (c) {
        return '<option value="' + c.id + '"' + (filtro.clienteId === c.id ? ' selected' : '') + '>' + AH.esc(c.nome) + '</option>';
      }).join('') +
      '</select>' +
      '<div class="espaco"></div>' +
      '<button class="btn btn-primario" id="btn-nova-post">' + AH.icons.mais + 'Nova postagem</button>' +
      '</div>';

    html += '<div class="grid grid-4">' +
      tile('Planejadas no mês', doMes) +
      tile('Em aprovação', emAprovacao) +
      tile('Agendadas', agendadas) +
      tile('Publicadas no mês', publicadasMes) +
      '</div>';

    if (!lista.length) {
      html += '<div style="margin-top:16px">' + AH.ui.vazio('conteudo', 'Nenhuma postagem aqui',
        'Planeje o conteúdo dos clientes: da ideia à publicação, tudo aparece no calendário e no portal do cliente.') + '</div>';
    } else {
      html += '<div class="tabela-wrap" style="margin-top:16px"><table class="tabela"><thead><tr>' +
        '<th>Postagem</th><th>Cliente</th><th>Canal</th><th>Data</th><th>Etapa</th><th class="acoes"></th>' +
        '</tr></thead><tbody>';
      lista.forEach(function (pt) {
        var podeAvancar = PROXIMO[pt.status];
        html += '<tr data-id="' + pt.id + '">' +
          '<td><div class="celula-principal">' + AH.esc(pt.titulo) + '</div>' +
          '<div class="celula-sub">' + AH.esc(pt.formato || '') +
          (pt.linkPublicacao ? ' · <a href="' + AH.esc(pt.linkPublicacao) + '" target="_blank" rel="noopener">ver publicação</a>' : '') +
          '</div></td>' +
          '<td>' + AH.esc(AH.nomeCliente(pt.clienteId)) + '</td>' +
          '<td>' + AH.ui.badgeCanal(pt.canal) + '</td>' +
          '<td>' + (pt.data ? AH.fmt.dataCurta(pt.data) : '—') + '</td>' +
          '<td>' + AH.ui.badgeStatusPostagem(pt.status) + '</td>' +
          '<td class="acoes">' +
          (podeAvancar
            ? '<button class="btn btn-p btn-contorno sempre-visivel" data-acao="avancar" title="Avançar etapa">' +
              AH.esc(AH.nomeDe(AH.dominio.statusPostagem, podeAvancar)) + ' →</button>'
            : '') +
          '<button class="btn btn-ghost btn-icon btn-p" data-acao="editar" title="Editar">' + AH.icons.editar + '</button>' +
          '</td></tr>';
      });
      html += '</tbody></table></div>';
      html += '<p class="nota-rodape" style="margin-top:10px">As postagens com data aparecem automaticamente no Calendário e no portal do cliente.</p>';
    }

    el.innerHTML = html;

    el.querySelectorAll('#seg-post button').forEach(function (b) {
      b.addEventListener('click', function () { filtro.status = b.getAttribute('data-v'); render(el); });
    });
    el.querySelector('#filtro-cliente-post').addEventListener('change', function (e) {
      filtro.clienteId = e.target.value; render(el);
    });
    el.querySelector('#btn-nova-post').addEventListener('click', function () { abrirForm(null); });
    el.querySelectorAll('tbody tr').forEach(function (tr) {
      var pt = AH.state.postagens.filter(function (x) { return x.id === tr.getAttribute('data-id'); })[0];
      var av = tr.querySelector('[data-acao="avancar"]');
      if (av) av.addEventListener('click', function () {
        pt.status = PROXIMO[pt.status];
        AH.salvar();
        AH.ui.toast('"' + pt.titulo + '" → ' + AH.nomeDe(AH.dominio.statusPostagem, pt.status));
        render(el);
      });
      tr.querySelector('[data-acao="editar"]').addEventListener('click', function () { abrirForm(pt); });
    });
  }

  function tile(rotulo, valor) {
    return '<div class="card tile"><div class="tile-rotulo">' + AH.esc(rotulo) + '</div>' +
      '<div class="tile-valor">' + AH.esc(String(valor)) + '</div></div>';
  }

  function seg(valor, rotulo) {
    return '<button data-v="' + valor + '" class="' + (filtro.status === valor ? 'ativo' : '') + '">' + AH.esc(rotulo) + '</button>';
  }

  AH.views = AH.views || {};
  AH.views.conteudo = {
    titulo: 'Conteúdo',
    render: render,
    novo: function () { abrirForm(null); },
    editarPostagem: function (id) {
      var pt = AH.state.postagens.filter(function (x) { return x.id === id; })[0];
      if (pt) abrirForm(pt);
    }
  };
})();
