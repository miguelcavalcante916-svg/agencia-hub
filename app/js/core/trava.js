/* AgênciaHub — trava do painel
   Confere a senha NO SERVIDOR antes de liberar o app. A senha nunca existe
   neste arquivo: o que o navegador manda é a tentativa, e quem decide é a
   função em /api/agencia/entrar.

   REGRA DE OURO: em qualquer dúvida, a trava ABRE. Servidor fora do ar,
   banco não configurado, sem internet, senha nunca definida — em todos
   esses casos você entra, com aviso na tela. Ficar trancado para fora do
   próprio sistema por causa de uma variável que faltou seria muito pior do
   que o risco que essa trava cobre. */
(function () {
  'use strict';
  var AH = window.AH = window.AH || {};

  var CHAVE = 'agenciahub:painel:token';
  var trava = document.getElementById('trava');
  var app = document.getElementById('app');
  if (!trava || !app) return;

  var form = document.getElementById('trava-form');
  var campo = document.getElementById('trava-senha');
  var btn = document.getElementById('trava-btn');
  var erro = document.getElementById('trava-erro');
  var nota = document.getElementById('trava-nota');

  /* o portal público do cliente não passa por aqui: é outra porta */
  if (/^#\/p(\?|$)/.test(location.hash || '')) { AH.painelLiberado = true; return; }

  function ler() { try { return localStorage.getItem(CHAVE); } catch (e) { return null; } }
  function guardar(t) { try { localStorage.setItem(CHAVE, t); } catch (e) { /* aba anônima */ } }
  AH.esquecerPainel = function () {
    try { localStorage.removeItem(CHAVE); } catch (e) {}
    location.reload();
  };

  var liberou = false;
  function liberar(aviso) {
    if (liberou) return;
    liberou = true;
    AH.painelLiberado = true;
    trava.hidden = true;
    app.style.visibility = '';
    if (aviso) AH.avisoPainel = aviso;
    document.dispatchEvent(new CustomEvent('painel-liberado'));
  }

  function pedirTrava() {
    trava.hidden = false;
    app.style.visibility = 'hidden';
    setTimeout(function () { campo.focus(); }, 40);
  }

  function chamar(corpo) {
    var abortar = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var relogio = abortar ? setTimeout(function () { abortar.abort(); }, 12000) : null;
    return fetch('/api/agencia/entrar', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(corpo),
      signal: abortar ? abortar.signal : undefined
    }).then(function (r) {
      if (relogio) clearTimeout(relogio);
      return r.json().then(function (j) { return { status: r.status, corpo: j }; });
    }, function (e) {
      if (relogio) clearTimeout(relogio);
      throw e;
    });
  }

  /* ---------- abertura ---------- */
  app.style.visibility = 'hidden';

  var token = ler();
  chamar(token ? { token: token } : {})
    .then(function (r) {
      if (r.status === 200) {
        if (r.corpo.token) guardar(r.corpo.token);
        liberar(r.corpo.semSenha
          ? 'O painel ainda está SEM SENHA. Defina uma em Configurações → Senha do painel.'
          : null);
        return;
      }
      if (r.corpo && r.corpo.codigo === 'NAO_CONFIGURADO') {
        liberar('A trava do painel ainda não foi ligada na Vercel — qualquer pessoa com o endereço /app/ entra aqui.');
        return;
      }
      /* 401: token velho ou senha exigida */
      try { localStorage.removeItem(CHAVE); } catch (e) {}
      pedirTrava();
      nota.innerHTML = 'Esqueceu? Você pode redefinir com a <b>chave de administração</b> ' +
        'que você guardou na Vercel — peça ajuda para quem montou o sistema.';
    })
    .catch(function () {
      /* servidor inalcançável: abre, avisando. Nunca trancar por rede. */
      liberar('Não consegui falar com o servidor para conferir a senha do painel. Entrei sem conferir — se você não está na sua rede de confiança, feche esta aba.');
    });

  /* ---------- envio da senha ---------- */
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    erro.hidden = true;
    var s = campo.value;
    if (!s) { erro.textContent = 'Digite a senha.'; erro.hidden = false; return; }

    btn.disabled = true; btn.textContent = 'Conferindo…';
    chamar({ senha: s }).then(function (r) {
      btn.disabled = false; btn.textContent = 'Entrar no painel';
      if (r.status === 200) { guardar(r.corpo.token); liberar(null); return; }
      erro.textContent = (r.corpo && r.corpo.erro) || 'Não consegui conferir agora.';
      erro.hidden = false;
      campo.select();
    }).catch(function () {
      btn.disabled = false; btn.textContent = 'Entrar no painel';
      erro.textContent = 'Sem conexão com o servidor. Verifique a internet.';
      erro.hidden = false;
    });
  });
})();
