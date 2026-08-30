/* AgênciaHub — Configurações da agência, backup e dados */
(function () {
  'use strict';
  var AH = window.AH;

  function render(el) {
    var cfg = AH.state.configuracoes;
    var ui = AH.ui;

    var html = '<div class="config-secoes">';

    html += '<div class="card"><div class="card-titulo">' + AH.icons.config + 'Dados da agência</div>' +
      '<form id="form-cfg"><div class="form-grid">' +
      ui.campo('Nome da agência *', ui.input('nomeAgencia', cfg.nomeAgencia, 'required')) +
      ui.campo('Slogan / área de atuação', ui.input('slogan', cfg.slogan)) +
      ui.campo('WhatsApp', ui.input('whatsapp', cfg.whatsapp, 'placeholder="(00) 00000-0000"')) +
      ui.campo('E-mail', ui.input('email', cfg.email, 'type="email"')) +
      ui.campo('Instagram', ui.input('instagram', cfg.instagram, 'placeholder="@suaagencia"')) +
      ui.campo('Site', ui.input('site', cfg.site, 'placeholder="www.suaagencia.com.br"')) +
      ui.campo('Cidade / UF', ui.input('cidade', cfg.cidade)) +
      ui.campo('CNPJ', ui.input('cnpj', cfg.cnpj)) +
      ui.campo('Chave PIX (sai nas propostas)', ui.input('pix', cfg.pix), 'campo-cheio') +
      ui.campo('Endereço público do app (usado nos links do portal do cliente)', ui.input('urlPublica', cfg.urlPublica, 'placeholder="https://seu-usuario.github.io/agencia-hub/"'), 'campo-cheio') +
      ui.campo('Condições de pagamento padrão', ui.textarea('condicoesPadrao', cfg.condicoesPadrao, 'rows="2"'), 'campo-cheio') +
      '</div>' +
      '<div style="margin-top:14px;display:flex;justify-content:flex-end">' +
      '<button class="btn btn-primario" type="submit">Salvar dados</button></div></form>' +
      '<p class="nota-rodape" style="margin-top:8px">Esses dados aparecem no cabeçalho das propostas impressas e no menu lateral.</p>' +
      '</div>';

    html += '<div class="card"><div class="card-titulo">' + AH.icons.faisca + 'Assistente Claude (IA)</div>' +
      '<p class="nota-rodape" style="margin-bottom:12px">Converse com o Claude dentro do painel (menu <a href="#/assistente">Assistente IA</a>) — ele responde usando os dados da agência. ' +
      'Crie a sua chave em <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>. ' +
      'A chave fica salva <b>somente neste navegador</b> e o uso é cobrado na sua conta Anthropic. Não compartilhe a chave com ninguém.</p>' +
      '<form id="form-claude"><div class="form-grid">' +
      ui.campo('Chave da API (sk-ant-...)', ui.input('claudeApiKey', cfg.claudeApiKey, 'type="password" autocomplete="off" placeholder="sk-ant-..."')) +
      ui.campo('Modelo', ui.select('claudeModelo', [
        { id: 'claude-opus-5', nome: 'Claude Opus 5 — padrão, mais inteligente' },
        { id: 'claude-sonnet-5', nome: 'Claude Sonnet 5 — equilíbrio' },
        { id: 'claude-haiku-4-5', nome: 'Claude Haiku 4.5 — mais econômico' }
      ], cfg.claudeModelo || 'claude-opus-5')) +
      '</div>' +
      '<div style="margin-top:14px;display:flex;justify-content:flex-end">' +
      '<button class="btn btn-primario" type="submit">Salvar assistente</button></div></form>' +
      '</div>';

    html += '<div class="card"><div class="card-titulo">' + AH.icons.config + 'Senha do painel</div>' +
      '<p class="nota-rodape" style="margin-bottom:12px">A senha que tranca este painel. Ela é guardada com hash no servidor — ' +
      'nem eu nem ninguém consegue ler depois. Se esquecer, dá para redefinir com a chave de administração.</p>' +
      '<div class="grade-form">' +
      '<label class="campo"><span class="campo-rotulo">Senha atual</span>' +
      '<input class="input" id="painel-atual" type="password" autocomplete="off" placeholder="deixe em branco se ainda não tem"></label>' +
      '<label class="campo"><span class="campo-rotulo">Senha nova (mínimo 6)</span>' +
      '<input class="input" id="painel-nova" type="password" autocomplete="new-password"></label>' +
      '<label class="campo"><span class="campo-rotulo">Chave de administração (só se esqueceu a atual)</span>' +
      '<input class="input" id="painel-chave" type="password" autocomplete="off" placeholder="opcional"></label>' +
      '</div>' +
      '<div class="toolbar" style="margin-top:12px">' +
      '<button class="btn btn-primario" id="painel-salvar">Salvar senha do painel</button>' +
      '<button class="btn btn-ghost" id="painel-sair">Sair deste aparelho</button>' +
      '</div>' +
      '<p class="nota-rodape" id="painel-aviso" style="margin-top:10px"></p>' +
      '</div>';

    html += '<div class="card"><div class="card-titulo">' + AH.icons.download + 'Backup dos dados</div>' +
      '<p class="nota-rodape" style="margin-bottom:12px">Tudo fica salvo <b>somente neste navegador</b>. Exporte um backup com frequência e guarde no seu Drive — assim você não perde nada se trocar de computador ou limpar o navegador.</p>' +
      '<div class="config-acoes">' +
      '<button class="btn" id="btn-exportar">' + AH.icons.download + 'Exportar backup (.json)</button>' +
      '<button class="btn" id="btn-importar">' + AH.icons.upload + 'Importar backup</button>' +
      '<input type="file" id="arquivo-importar" accept="application/json,.json" hidden>' +
      '</div></div>';

    html += '<div class="card"><div class="card-titulo">' + AH.icons.alerta + 'Zona de risco</div>' +
      '<div class="config-acoes">' +
      '<button class="btn btn-contorno" id="btn-demo">Restaurar dados de demonstração</button>' +
      '<button class="btn btn-perigo" id="btn-limpar">' + AH.icons.excluir + 'Apagar todos os dados</button>' +
      '</div></div>';

    html += '<p class="nota-rodape">AgênciaHub · sistema de gestão para agências de marketing e produtoras audiovisuais. Funciona 100% no navegador, sem mensalidade e sem internet.</p>';
    html += '</div>';

    el.innerHTML = html;

    /* ---------- senha do painel ---------- */
    (function () {
      var aviso = el.querySelector('#painel-aviso');
      function dizer(msg, ruim) {
        aviso.innerHTML = msg;
        aviso.style.color = ruim ? '#ffb9b9' : 'var(--texto-2)';
      }
      if (AH.avisoPainel) dizer(AH.icons.alerta + ' ' + AH.esc(AH.avisoPainel), true);

      el.querySelector('#painel-salvar').addEventListener('click', function () {
        var nova = el.querySelector('#painel-nova').value;
        if (nova.length < 6) { dizer('A senha nova precisa ter pelo menos 6 caracteres.', true); return; }
        dizer('Salvando…');
        fetch('/api/agencia/senha', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            novaSenha: nova,
            senhaAtual: el.querySelector('#painel-atual').value || undefined,
            chave: el.querySelector('#painel-chave').value || undefined
          })
        }).then(function (r) {
          return r.json().then(function (j) { return { status: r.status, corpo: j }; });
        }).then(function (r) {
          if (r.status === 200) {
            el.querySelector('#painel-nova').value = '';
            el.querySelector('#painel-atual').value = '';
            el.querySelector('#painel-chave').value = '';
            dizer(r.corpo.primeira
              ? 'Senha definida. A partir de agora o painel pede ela para abrir.'
              : 'Senha trocada. Os outros aparelhos vão pedir a nova no próximo acesso.');
          } else if (r.corpo && r.corpo.codigo === 'NAO_CONFIGURADO') {
            dizer('O banco ainda não foi criado na Vercel, então não dá para guardar a senha. Sem ele o painel fica aberto.', true);
          } else {
            dizer(AH.esc((r.corpo && r.corpo.erro) || ('Erro ' + r.status)), true);
          }
        }).catch(function () { dizer('Sem conexão com o servidor.', true); });
      });

      el.querySelector('#painel-sair').addEventListener('click', function () {
        AH.ui.confirmar('Sair do painel neste aparelho? Ele vai pedir a senha de novo.', function () {
          if (AH.esquecerPainel) AH.esquecerPainel();
        }, 'Sair');
      });
    })();

    el.querySelector('#form-cfg').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      ['nomeAgencia', 'slogan', 'whatsapp', 'email', 'instagram', 'site', 'cidade', 'cnpj', 'pix', 'urlPublica', 'condicoesPadrao'].forEach(function (k) {
        cfg[k] = String(f.get(k) || '').trim();
      });
      if (!cfg.nomeAgencia) cfg.nomeAgencia = 'Agência Cavalcante';
      AH.salvar();
      AH.atualizarMarca();
      AH.ui.toast('Dados da agência salvos.');
    });

    el.querySelector('#form-claude').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      cfg.claudeApiKey = String(f.get('claudeApiKey') || '').trim();
      cfg.claudeModelo = f.get('claudeModelo') || 'claude-opus-5';
      AH.salvar();
      AH.ui.toast(cfg.claudeApiKey ? 'Assistente configurado! Abra o menu Assistente IA.' : 'Chave removida.');
    });

    el.querySelector('#btn-exportar').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(AH.state, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'agenciahub-backup-' + AH.hojeISO() + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
      AH.ui.toast('Backup exportado.');
    });

    var inputArquivo = el.querySelector('#arquivo-importar');
    el.querySelector('#btn-importar').addEventListener('click', function () { inputArquivo.click(); });
    inputArquivo.addEventListener('change', function () {
      var arq = inputArquivo.files[0];
      if (!arq) return;
      var leitor = new FileReader();
      leitor.onload = function () {
        try {
          var dados = JSON.parse(leitor.result);
          if (!dados || typeof dados !== 'object' || !dados.configuracoes) throw new Error('formato');
          AH.ui.confirmar('Importar este backup? Os dados atuais deste navegador serão substituídos.', function () {
            var base = AH.estadoVazio();
            Object.keys(base).forEach(function (k) { if (dados[k] === undefined) dados[k] = base[k]; });
            AH.state = dados;
            AH.salvar();
            AH.atualizarMarca();
            AH.ui.toast('Backup importado.');
            AH.rerender();
          }, 'Importar');
        } catch (e) {
          AH.ui.toast('Arquivo inválido — exporte o backup pelo próprio AgênciaHub.', 'erro');
        }
      };
      leitor.readAsText(arq);
      inputArquivo.value = '';
    });

    el.querySelector('#btn-demo').addEventListener('click', function () {
      AH.ui.confirmar('Substituir os dados atuais pelos dados de demonstração?', function () {
        AH.restaurarDemo();
        AH.atualizarMarca();
        AH.ui.toast('Dados de demonstração restaurados.');
        AH.rerender();
      }, 'Restaurar');
    });

    el.querySelector('#btn-limpar').addEventListener('click', function () {
      AH.ui.confirmar('Apagar TODOS os dados (clientes, projetos, financeiro...)? Essa ação não tem volta — exporte um backup antes.', function () {
        AH.limparTudo();
        AH.atualizarMarca();
        AH.ui.toast('Dados apagados. Começando do zero.');
        AH.rerender();
      }, 'Apagar tudo');
    });
  }

  AH.views = AH.views || {};
  AH.views.config = { titulo: 'Configurações', render: render };
})();
