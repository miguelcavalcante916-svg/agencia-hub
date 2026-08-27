/* AgênciaHub — roteador e inicialização */
(function () {
  'use strict';
  var AH = window.AH;

  var ROTAS = [
    { hash: '#/dashboard', view: 'dashboard', nome: 'Visão geral', icone: 'dashboard' },
    { hash: '#/assistente', view: 'assistente', nome: 'Assistente IA', icone: 'faisca' },
    { hash: '#/clientes', view: 'clientes', nome: 'Clientes', icone: 'clientes' },
    { hash: '#/projetos', view: 'projetos', nome: 'Projetos', icone: 'projetos' },
    { hash: '#/tarefas', view: 'tarefas', nome: 'Tarefas', icone: 'tarefas' },
    { hash: '#/calendario', view: 'calendario', nome: 'Calendário', icone: 'calendario' },
    { hash: '#/conteudo', view: 'conteudo', nome: 'Conteúdo', icone: 'conteudo' },
    { hash: '#/aprovacoes', view: 'aprovacoes', nome: 'Aprovações', icone: 'aprovacao' },
    { hash: '#/propostas', view: 'propostas', nome: 'Propostas', icone: 'propostas' },
    { hash: '#/trafego', view: 'trafego', nome: 'Tráfego pago', icone: 'megafone' },
    { hash: '#/leads', view: 'leads', nome: 'Leads', icone: 'leads' },
    { hash: '#/financeiro', view: 'financeiro', nome: 'Financeiro', icone: 'financeiro' },
    { hash: '#/portal', view: 'portal', nome: 'Portal do cliente', icone: 'portal' },
    { hash: '#/meusite', view: 'meusite', nome: 'Meu site', icone: 'monitor' },
    { hash: '#/equipamentos', view: 'equipamentos', nome: 'Equipamentos', icone: 'equipamentos' },
    { hash: '#/equipe', view: 'equipe', nome: 'Equipe', icone: 'equipe' },
    { hash: '#/configuracoes', view: 'config', nome: 'Configurações', icone: 'config' }
  ];

  var rotaAtual = null;

  function contadores() {
    return {
      tarefas: AH.state.tarefas.filter(function (t) { return !t.feita; }).length,
      projetos: AH.state.projetos.filter(function (p) { return p.status !== 'entregue'; }).length,
      aprovacoes: AH.state.materiais.filter(function (m) { return m.status === 'aguardando'; }).length,
      leads: AH.state.leads.filter(function (l) { return l.status === 'novo'; }).length
    };
  }

  function montarNav() {
    var nav = document.getElementById('nav');
    var cont = contadores();
    nav.innerHTML = ROTAS.map(function (r) {
      var extra = '';
      if (r.view === 'tarefas' && cont.tarefas) extra = '<span class="nav-cont">' + cont.tarefas + '</span>';
      if (r.view === 'projetos' && cont.projetos) extra = '<span class="nav-cont">' + cont.projetos + '</span>';
      if (r.view === 'aprovacoes' && cont.aprovacoes) extra = '<span class="nav-cont">' + cont.aprovacoes + '</span>';
      if (r.view === 'leads' && cont.leads) extra = '<span class="nav-cont">' + cont.leads + '</span>';
      return '<a class="nav-item' + (rotaAtual && rotaAtual.view === r.view ? ' ativo' : '') + '" href="' + r.hash + '">' +
        AH.icons[r.icone] + '<span>' + r.nome + '</span>' + extra + '</a>';
    }).join('');
  }

  AH.atualizarMarca = function () {
    var cfg = AH.state.configuracoes;
    document.getElementById('brand-agencia').textContent = cfg.nomeAgencia || 'Sua agência';
    document.title = (cfg.nomeAgencia && cfg.nomeAgencia !== 'Sua agência' ? cfg.nomeAgencia + ' · ' : '') + 'AgênciaHub';
  };

  function fecharSidebarMobile() {
    document.getElementById('sidebar').classList.remove('aberta');
    document.getElementById('sidebar-backdrop').hidden = true;
  }

  function navegar() {
    var hash = location.hash || '#/dashboard';
    // link de portal colado na mesma aba → recarrega no modo público
    if (/^#\/p\?d=/.test(hash)) { location.reload(); return; }
    var rota = ROTAS.filter(function (r) { return hash.indexOf(r.hash) === 0; })[0] || ROTAS[0];
    rotaAtual = rota;

    AH.ui.fecharModal();
    fecharSidebarMobile();

    var view = AH.views[rota.view];
    var el = document.getElementById('view');
    /* Se o arquivo desta tela não carregou (rede caiu no meio), mostramos um
       aviso em vez de deixar o app congelado sem explicação. */
    if (!view || typeof view.render !== 'function') {
      document.getElementById('page-title').textContent = rota.nome;
      el.innerHTML = '<div class="card" style="text-align:center;padding:34px">' +
        '<h2 style="margin-bottom:6px">Esta tela não carregou</h2>' +
        '<p class="nota-rodape">Recarregue a página. Se continuar assim, confira a conexão.</p></div>';
      montarNav();
      return;
    }
    document.getElementById('page-title').textContent = view.titulo || rota.nome;
    AH.ui._deveAnimar = true;
    try {
      view.render(el);
    } catch (erro) {
      console.error('Falha ao montar a tela:', erro);
      el.innerHTML = '<div class="card" style="text-align:center;padding:34px">' +
        '<h2 style="margin-bottom:6px">Algo deu errado nesta tela</h2>' +
        '<p class="nota-rodape">Recarregue a página. Seus dados continuam salvos.</p></div>';
    }
    montarNav();
    el.scrollTop = 0;
    window.scrollTo(0, 0);
    // reinicia a animação de entrada da tela
    el.classList.remove('entrando');
    void el.offsetWidth;
    el.classList.add('entrando');
  }

  // Qual tela está aberta agora (usado por telas que respondem depois de um tempo)
  AH.rotaAtualView = function () { return rotaAtual ? rotaAtual.view : null; };

  // Rerenderiza a tela atual (chamado após qualquer alteração de dados)
  AH.rerender = function () {
    if (!rotaAtual) return;
    AH.views[rotaAtual.view].render(document.getElementById('view'));
    montarNav();
  };

  function iniciar() {
    // modo público: link do portal do cliente (#/p?d=...) — sem painel da agência
    var portal = (location.hash || '').match(/^#\/p\?d=(.+)$/);
    if (portal) {
      AH.portalPublico(portal[1]);
      return;
    }

    AH.carregar();
    AH.atualizarMarca();

    /* Se não deu para ler o que estava salvo, o usuário PRECISA saber — senão
       ele acha que perdeu tudo. A cópia bruta foi guardada em AH.carregar(). */
    if (AH.dadosIlegiveis) {
      var aviso = document.createElement('div');
      aviso.setAttribute('role', 'alert');
      aviso.style.cssText = 'position:sticky;top:0;z-index:60;background:rgba(248,113,113,.14);' +
        'border-bottom:1px solid rgba(248,113,113,.4);color:#f8d4d4;padding:11px 18px;font-size:13.5px';
      aviso.innerHTML = '<strong>Não consegui ler os seus dados salvos.</strong> ' +
        'Abri a demonstração para você continuar, mas <b>nada foi apagado</b>: guardei uma cópia do ' +
        'conteúdo original no navegador. Antes de cadastrar coisas novas, fale comigo para tentar recuperar.';
      document.querySelector('.main').prepend(aviso);
    }

    var hoje = new Date();
    document.getElementById('sidebar-hoje').textContent =
      hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    document.getElementById('btn-menu').addEventListener('click', function () {
      document.getElementById('sidebar').classList.add('aberta');
      document.getElementById('sidebar-backdrop').hidden = false;
    });
    document.getElementById('sidebar-backdrop').addEventListener('click', fecharSidebarMobile);

    window.addEventListener('hashchange', navegar);
    if (!location.hash) location.hash = '#/dashboard';
    navegar();

    // app instalável (PWA) — só quando servido por http(s)
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(function () { /* sem suporte, segue normal */ });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
