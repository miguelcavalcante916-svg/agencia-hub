/* AgênciaHub — Assistente (Claude) integrado ao painel
   Conversa direto com a API da Anthropic usando a chave salva em Configurações.
   A chave fica SOMENTE neste navegador (localStorage) e cada pergunta usa os
   dados atuais da agência como contexto. */
(function () {
  'use strict';
  var AH = window.AH;

  var pensando = false;

  var SUGESTOES = [
    'Como está o mês da agência?',
    'O que está atrasado e o que eu resolvo primeiro?',
    'Escreva uma legenda de Instagram para o Supermercado Central',
    'Monte a pauta da reunião com base nos projetos em andamento'
  ];

  function chave() { return String(AH.state.configuracoes.claudeApiKey || '').trim(); }

  function sistemaPrompt() {
    return 'Você é o assistente interno da ' + (AH.state.configuracoes.nomeAgencia || 'agência') +
      ', uma agência de marketing e produtora audiovisual de Alexandria/RN. Você conversa com o dono ' +
      'da agência dentro do sistema de gestão AgênciaHub.\n\n' +
      'COMO RESPONDER: sempre em português do Brasil. Vá direto ao ponto — nada de introdução, ' +
      'nada de repetir a pergunta, nada de resumo no fim. Prefira 1 a 3 frases; use lista curta só ' +
      'quando forem vários itens. Máximo de 120 palavras, a não ser que peçam um texto pronto ' +
      '(legenda, roteiro, proposta) — aí escreva só o texto final, sem explicação em volta. ' +
      'Se faltar dado para responder, diga em uma frase o que falta.\n\n' +
      'Use os dados reais abaixo para responder perguntas sobre o ' +
      'negócio. Se pedirem algo que se faz dentro do sistema, diga em qual tela fazer ' +
      '(Clientes, Projetos, Tarefas, Calendário, Conteúdo, Aprovações, Propostas, Tráfego pago, ' +
      'Leads, Financeiro, Portal do cliente, Meu site, Configurações).\n\n' +
      '=== DADOS ATUAIS DA AGÊNCIA ===\n' + AH.resumoNegocio();
  }

  var TEMPO_LIMITE = 60000; // 60s: com effort baixo a resposta chega bem antes disso

  function chamarClaude(historico) {
    /* AbortController evita a promessa pendurada para sempre quando a rede cai
       no meio da resposta — sem ele o "digitando..." ficaria eterno */
    var abortar = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var relogio = abortar ? setTimeout(function () { abortar.abort(); }, TEMPO_LIMITE) : null;

    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: abortar ? abortar.signal : undefined,
      headers: {
        'content-type': 'application/json',
        'x-api-key': chave(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'anthropic-beta': 'server-side-fallback-2026-07-01'
      },
      body: JSON.stringify({
        model: AH.state.configuracoes.claudeModelo || 'claude-opus-5',
        /* effort baixo = menos raciocínio interno = resposta bem mais rápida.
           O padrão do modelo é 'high', que é lento demais para um chat de painel. */
        output_config: { effort: 'low' },
        /* teto alto de propósito: ele não alonga a resposta (quem controla o
           tamanho é o prompt), só evita que o texto seja cortado no meio */
        max_tokens: 8000,
        fallbacks: 'default',
        system: sistemaPrompt(),
        messages: historico
      })
    }).then(function (resp) {
      return resp.json().then(function (dados) {
        if (!resp.ok) {
          var msg = (dados && dados.error && dados.error.message) || ('Erro ' + resp.status);
          if (resp.status === 401) msg = 'Chave de API inválida. Confira a chave em Configurações → Assistente Claude.';
          if (resp.status === 429) msg = 'Limite de uso atingido por agora. Tente de novo em instantes.';
          throw new Error(msg);
        }
        if (dados.stop_reason === 'refusal') {
          return 'Não posso ajudar com esse pedido específico — pode reformular?';
        }
        var texto = (dados.content || []).filter(function (b) { return b.type === 'text'; })
          .map(function (b) { return b.text; }).join('\n').trim();
        if (!texto) return '(resposta vazia)';
        if (dados.stop_reason === 'max_tokens') texto += '\n\n(resposta cortada no limite — peça "continue")';
        return texto;
      });
    }).catch(function (erro) {
      // erros de rede do fetch chegam como TypeError, sem mensagem útil em português
      if (erro && erro.name === 'AbortError') throw new Error('A resposta demorou demais. Tente de novo.');
      if (erro instanceof TypeError) throw new Error('Sem conexão com a internet — verifique a rede e tente de novo.');
      throw erro;
    }).then(function (r) {
      if (relogio) clearTimeout(relogio);
      return r;
    }, function (e) {
      if (relogio) clearTimeout(relogio);
      throw e;
    });
  }

  // Markdown bem leve: negrito, itálico e quebras de linha
  function formatar(texto) {
    return AH.esc(texto)
      .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
      .replace(/(^|\n)[-•] /g, '$1• ')
      .replace(/\n/g, '<br>');
  }

  function render(el) {
    if (!chave()) {
      el.innerHTML =
        '<div class="card" style="max-width:640px;margin:24px auto;text-align:center;padding:36px 28px">' +
        '<div class="estado-vazio-icone" style="margin-bottom:14px">' + AH.icons.faisca + '</div>' +
        '<h2 style="margin-bottom:8px">Converse com o Claude aqui dentro</h2>' +
        '<p class="nota-rodape" style="max-width:460px;margin:0 auto 18px">Pergunte "como está o mês?", peça legendas, roteiros e prioridades — o assistente responde usando os dados reais da agência. Para ativar:</p>' +
        '<ol style="text-align:left;max-width:420px;margin:0 auto 20px;color:var(--texto-2);font-size:14px;line-height:2">' +
        '<li>Crie uma chave em <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>;</li>' +
        '<li>Cole a chave em <a href="#/configuracoes">Configurações → Assistente Claude</a>;</li>' +
        '<li>Volte aqui e converse.</li>' +
        '</ol>' +
        '<a class="btn btn-primario" href="#/configuracoes">Configurar agora</a>' +
        '<p class="nota-rodape" style="margin-top:16px">A chave fica salva só neste navegador e o uso é cobrado direto na sua conta Anthropic.</p>' +
        '</div>';
      return;
    }

    var conversa = AH.state.chatAssistente;

    var html = '<div class="chat">';
    html += '<div class="chat-mensagens" id="chat-mensagens">';
    if (!conversa.length) {
      html += '<div class="chat-boasvindas">' +
        '<div class="estado-vazio-icone">' + AH.icons.faisca + '</div>' +
        '<strong>Pronto para ajudar.</strong>' +
        '<p class="nota-rodape">Pergunte sobre o negócio ou peça um texto. Sugestões:</p>' +
        '<div class="chat-sugestoes">' + SUGESTOES.map(function (s) {
          return '<button class="chip" data-sugestao="' + AH.esc(s) + '">' + AH.esc(s) + '</button>';
        }).join('') + '</div></div>';
    } else {
      conversa.forEach(function (m) {
        html += '<div class="chat-msg chat-' + (m.role === 'user' ? 'usuario' : 'claude') + '">' +
          (m.role === 'assistant' ? '<span class="chat-avatar">' + AH.icons.faisca + '</span>' : '') +
          '<div class="chat-balao">' + formatar(m.content) + '</div></div>';
      });
    }
    if (pensando) {
      html += '<div class="chat-msg chat-claude"><span class="chat-avatar">' + AH.icons.faisca + '</span>' +
        '<div class="chat-balao chat-digitando"><i></i><i></i><i></i></div></div>';
    }
    html += '</div>';

    html += '<form class="chat-entrada" id="chat-form">' +
      '<input class="input" id="chat-texto" placeholder="Pergunte algo ou peça um texto..." autocomplete="off"' + (pensando ? ' disabled' : '') + '>' +
      '<button class="btn btn-primario" type="submit"' + (pensando ? ' disabled' : '') + '>Enviar</button>' +
      (conversa.length ? '<button class="btn btn-ghost btn-p" type="button" id="chat-limpar" title="Limpar conversa">' + AH.icons.excluir + '</button>' : '') +
      '</form>';
    html += '<p class="nota-rodape" style="margin-top:8px;text-align:center">O assistente vê um resumo dos dados da agência a cada pergunta · modelo: ' +
      AH.esc(AH.state.configuracoes.claudeModelo || 'claude-opus-5') + ' · <a href="#/configuracoes">trocar</a></p>';
    html += '</div>';

    el.innerHTML = html;

    var caixa = el.querySelector('#chat-mensagens');
    caixa.scrollTop = caixa.scrollHeight;

    el.querySelectorAll('[data-sugestao]').forEach(function (b) {
      b.addEventListener('click', function () { enviar(el, b.getAttribute('data-sugestao')); });
    });

    var form = el.querySelector('#chat-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var texto = el.querySelector('#chat-texto').value.trim();
      if (texto) enviar(el, texto);
    });

    var limpar = el.querySelector('#chat-limpar');
    if (limpar) limpar.addEventListener('click', function () {
      AH.ui.confirmar('Limpar a conversa com o assistente?', function () {
        AH.state.chatAssistente = [];
        AH.salvar(); render(el);
      }, 'Limpar');
    });

    if (!pensando) {
      var campo = el.querySelector('#chat-texto');
      if (campo) campo.focus();
    }
  }

  function enviar(el, texto) {
    if (pensando) return;
    var conversa = AH.state.chatAssistente;
    conversa.push({ role: 'user', content: texto });
    // guarda no máximo 40 mensagens
    if (conversa.length > 40) AH.state.chatAssistente = conversa = conversa.slice(-40);
    AH.salvar();
    pensando = true;
    render(el);

    // envia as últimas 12 mensagens como contexto
    var historico = conversa.slice(-12).map(function (m) { return { role: m.role, content: m.content }; });

    chamarClaude(historico).then(function (resposta) {
      conversa.push({ role: 'assistant', content: resposta });
    }).catch(function (erro) {
      conversa.push({ role: 'assistant', content: '⚠️ ' + (erro && erro.message ? erro.message : 'Não consegui falar com a API — confira a internet e a chave.') });
    }).then(function () {
      pensando = false;
      AH.salvar();
      /* a resposta pode demorar; se o usuário já trocou de tela, não repintar
         por cima do que ele está vendo agora — a conversa fica salva de todo jeito */
      if (!AH.rotaAtualView || AH.rotaAtualView() === 'assistente') render(el);
    });
  }

  AH.views = AH.views || {};
  AH.views.assistente = { titulo: 'Assistente IA', render: render };
})();
