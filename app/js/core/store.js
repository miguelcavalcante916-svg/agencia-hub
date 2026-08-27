/* AgênciaHub — armazenamento, dados de demonstração e utilitários de domínio */
(function () {
  'use strict';

  var STORAGE_KEY = 'agenciahub:dados:v1';

  var AH = (window.AH = window.AH || {});

  /* ---------- utilitários básicos ---------- */

  AH.uid = function () {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  };

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  AH.hojeISO = function () {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };

  // Desloca a data de hoje em `dias` e devolve YYYY-MM-DD
  AH.diasISO = function (dias) {
    var d = new Date();
    d.setDate(d.getDate() + dias);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  };

  // Primeiro dia do mês deslocado em `meses`, como YYYY-MM
  AH.mesISO = function (meses) {
    var d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + (meses || 0));
    return d.getFullYear() + '-' + pad(d.getMonth() + 1);
  };

  AH.fmt = {
    moeda: function (v) {
      return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
    // '2026-08-18' -> '18/08/2026' (sem fuso: trata como data local)
    data: function (iso) {
      if (!iso) return '—';
      var p = String(iso).slice(0, 10).split('-');
      if (p.length !== 3) return iso;
      return p[2] + '/' + p[1] + '/' + p[0];
    },
    dataCurta: function (iso) {
      if (!iso) return '—';
      var p = String(iso).slice(0, 10).split('-');
      var meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      return parseInt(p[2], 10) + ' ' + meses[parseInt(p[1], 10) - 1];
    },
    mesAno: function (yyyymm) {
      var meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      var p = String(yyyymm).split('-');
      return meses[parseInt(p[1], 10) - 1] + ' de ' + p[0];
    },
    mesCurto: function (yyyymm) {
      var meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      var p = String(yyyymm).split('-');
      return meses[parseInt(p[1], 10) - 1] + '/' + p[0].slice(2);
    },
    iniciais: function (nome) {
      var partes = String(nome || '?').trim().split(/\s+/);
      var s = partes[0].charAt(0) + (partes.length > 1 ? partes[partes.length - 1].charAt(0) : '');
      return s.toUpperCase();
    },
    num: function (n) {
      return (Number(n) || 0).toLocaleString('pt-BR');
    },
    // fração (0.024) -> "2,4%"
    pct: function (frac) {
      if (frac == null || !isFinite(frac)) return '—';
      return (frac * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
    }
  };

  // Diferença em dias entre hoje e uma data ISO (negativo = atrasado)
  AH.diasAte = function (iso) {
    if (!iso) return null;
    var p = String(iso).slice(0, 10).split('-');
    var alvo = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return Math.round((alvo - hoje) / 86400000);
  };

  /* ---------- vocabulário do domínio ---------- */

  AH.dominio = {
    colunasProjeto: [
      { id: 'briefing', nome: 'Briefing' },
      { id: 'planejamento', nome: 'Planejamento' },
      { id: 'producao', nome: 'Produção' },
      { id: 'edicao', nome: 'Edição / Design' },
      { id: 'revisao', nome: 'Revisão do cliente' },
      { id: 'entregue', nome: 'Entregue' }
    ],
    tiposProjeto: [
      'Vídeo institucional', 'Social media', 'Cobertura de evento', 'Tráfego pago',
      'Identidade visual', 'Filmagem com drone', 'Site / Landing page',
      'Ensaio fotográfico', 'Podcast', 'Outro'
    ],
    statusCliente: [
      { id: 'lead', nome: 'Lead' },
      { id: 'ativo', nome: 'Ativo' },
      { id: 'inativo', nome: 'Inativo' }
    ],
    segmentos: [
      'Agronegócio', 'Alimentação', 'Educação', 'Eventos', 'Imobiliário',
      'Indústria', 'Moda', 'Saúde', 'Serviços', 'Varejo', 'Outro'
    ],
    prioridades: [
      { id: 'alta', nome: 'Alta' },
      { id: 'media', nome: 'Média' },
      { id: 'baixa', nome: 'Baixa' }
    ],
    tiposEvento: [
      { id: 'gravacao', nome: 'Gravação' },
      { id: 'entrega', nome: 'Entrega' },
      { id: 'reuniao', nome: 'Reunião' },
      { id: 'postagem', nome: 'Postagem' },
      { id: 'outro', nome: 'Outro' }
    ],
    statusProposta: [
      { id: 'rascunho', nome: 'Rascunho' },
      { id: 'enviada', nome: 'Enviada' },
      { id: 'aprovada', nome: 'Aprovada' },
      { id: 'recusada', nome: 'Recusada' }
    ],
    categoriasReceita: ['Projeto', 'Mensalidade (fee)', 'Locação de equipamento', 'Outro'],
    categoriasDespesa: ['Equipamento', 'Software / Assinaturas', 'Equipe / Freela', 'Transporte', 'Impostos', 'Marketing', 'Outro'],
    categoriasEquipamento: ['Câmera', 'Lente', 'Drone', 'Iluminação', 'Áudio', 'Estabilizador / Gimbal', 'Computador', 'Acessório'],
    statusEquipamento: [
      { id: 'disponivel', nome: 'Disponível' },
      { id: 'em_uso', nome: 'Em uso' },
      { id: 'manutencao', nome: 'Manutenção' }
    ],
    funcoes: [
      'Direção', 'Filmmaker', 'Edição de vídeo', 'Social media', 'Design',
      'Gestão de tráfego', 'Fotografia', 'Atendimento / Comercial', 'Roteiro'
    ],
    servicosSugeridos: [
      'Vídeo institucional (roteiro + captação + edição)',
      'Pacote social media mensal (12 posts + 8 stories)',
      'Cobertura de evento (diária de filmagem)',
      'Diária de filmagem com drone',
      'Edição de vídeo (por minuto finalizado)',
      'Gestão de tráfego pago (mensal)',
      'Identidade visual completa',
      'Ensaio fotográfico (até 3h)',
      'Captação e edição de podcast (por episódio)',
      'Landing page'
    ],
    plataformas: [
      { id: 'meta', nome: 'Meta Ads (Facebook/Instagram)', curto: 'Meta' },
      { id: 'google', nome: 'Google Ads', curto: 'Google' },
      { id: 'tiktok', nome: 'TikTok Ads', curto: 'TikTok' },
      { id: 'outra', nome: 'Outra plataforma', curto: 'Outra' }
    ],
    objetivosTrafego: [
      { id: 'mensagens', nome: 'Mensagens / WhatsApp', unidade: 'conversas' },
      { id: 'cadastros', nome: 'Cadastros (leads)', unidade: 'leads' },
      { id: 'conversoes', nome: 'Vendas / Conversões', unidade: 'vendas' },
      { id: 'trafego', nome: 'Tráfego (cliques no link)', unidade: 'cliques no link' },
      { id: 'engajamento', nome: 'Engajamento', unidade: 'interações' },
      { id: 'alcance', nome: 'Alcance / Reconhecimento', unidade: 'resultados' },
      { id: 'seguidores', nome: 'Seguidores', unidade: 'seguidores' }
    ],
    statusCampanha: [
      { id: 'ativa', nome: 'Ativa' },
      { id: 'pausada', nome: 'Pausada' },
      { id: 'encerrada', nome: 'Encerrada' }
    ],
    canaisPostagem: [
      { id: 'instagram', nome: 'Instagram' },
      { id: 'facebook', nome: 'Facebook' },
      { id: 'tiktok', nome: 'TikTok' },
      { id: 'youtube', nome: 'YouTube' },
      { id: 'outro', nome: 'Outro' }
    ],
    formatosPostagem: ['Reels', 'Post estático', 'Carrossel', 'Story', 'Vídeo longo', 'Outro'],
    statusPostagem: [
      { id: 'ideia', nome: 'Ideia' },
      { id: 'producao', nome: 'Em produção' },
      { id: 'aprovacao', nome: 'Em aprovação' },
      { id: 'agendada', nome: 'Agendada' },
      { id: 'publicada', nome: 'Publicada' }
    ],
    tiposMaterial: ['Vídeo', 'Arte / Design', 'Roteiro', 'Foto', 'Outro'],
    statusMaterial: [
      { id: 'aguardando', nome: 'Aguardando cliente' },
      { id: 'ajustes', nome: 'Em ajustes' },
      { id: 'aprovado', nome: 'Aprovado' }
    ],
    statusLead: [
      { id: 'novo', nome: 'Novo' },
      { id: 'contato', nome: 'Em contato' },
      { id: 'negociacao', nome: 'Negociação' },
      { id: 'convertido', nome: 'Convertido' },
      { id: 'perdido', nome: 'Perdido' }
    ],
    origensLead: ['Anúncio Meta', 'Anúncio Google', 'Anúncio TikTok', 'Orgânico / Perfil', 'Indicação', 'WhatsApp', 'Outro']
  };

  // Busca o nome de um item {id, nome} numa lista do domínio
  AH.nomeDe = function (lista, id) {
    var x = (lista || []).filter(function (i) { return i.id === id; })[0];
    return x ? x.nome : id;
  };

  AH.nomeColuna = function (id) {
    var c = AH.dominio.colunasProjeto.filter(function (x) { return x.id === id; })[0];
    return c ? c.nome : id;
  };

  /* ---------- estado + persistência ---------- */

  function estadoVazio() {
    return {
      versao: 1,
      configuracoes: {
        nomeAgencia: 'Agência Cavalcante',
        slogan: 'Criatividade é estratégia. Estratégia é Cavalcante.',
        responsavel: '',
        email: '',
        whatsapp: '5584999492725',
        instagram: '@cavalcante.media',
        site: 'https://agenciacavalcante.com',
        cidade: '',
        cnpj: '',
        pix: '',
        urlPublica: 'https://agenciacavalcante.com/app/',
        claudeApiKey: '',
        claudeModelo: 'claude-opus-5',
        condicoesPadrao: '50% na aprovação e 50% na entrega. Valores válidos conforme prazo da proposta.'
      },
      clientes: [],
      projetos: [],
      tarefas: [],
      eventos: [],
      propostas: [],
      lancamentos: [],
      equipamentos: [],
      equipe: [],
      campanhas: [],
      postagens: [],
      materiais: [],
      leads: [],
      portfolio: [],
      chatAssistente: [],
      proximoNumeroProposta: 1
    };
  }

  AH.carregar = function () {
    try {
      var bruto = localStorage.getItem(STORAGE_KEY);
      if (bruto) {
        var dados = JSON.parse(bruto);
        // garante chaves novas em dados antigos
        var base = estadoVazio();
        Object.keys(base).forEach(function (k) {
          if (dados[k] === undefined) dados[k] = base[k];
        });
        AH.state = dados;
        return;
      }
    } catch (e) {
      /* Não conseguimos ler o que estava salvo. NUNCA apagar por cima: guardamos
         a cópia bruta com data e hora, para dar chance de recuperar depois. */
      console.warn('AgênciaHub: falha ao ler os dados salvos.', e);
      try {
        var bruto2 = localStorage.getItem(STORAGE_KEY);
        if (bruto2) localStorage.setItem(STORAGE_KEY + ':corrompido-' + Date.now(), bruto2);
      } catch (e2) { /* sem espaço para a cópia: seguimos mesmo assim */ }
      AH.dadosIlegiveis = true;
    }
    AH.state = AH.dadosDemo();
    AH.salvar();
  };

  var jaAvisouQueNaoSalva = false;

  /* Devolve true quando gravou. Em aba anônima, armazenamento bloqueado ou
     cheio, isso é false — e o usuário precisa saber disso ANTES de trabalhar
     uma hora e perder tudo, então mostramos uma faixa fixa (uma única vez). */
  AH.salvar = function () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(AH.state));
      return true;
    } catch (e) {
      console.error('AgênciaHub: não foi possível salvar no navegador.', e);
      if (!jaAvisouQueNaoSalva) {
        jaAvisouQueNaoSalva = true;
        var faixa = document.createElement('div');
        faixa.setAttribute('role', 'alert');
        faixa.style.cssText = 'position:sticky;top:0;z-index:70;background:rgba(248,113,113,.16);' +
          'border-bottom:1px solid rgba(248,113,113,.45);color:#f8d4d4;padding:11px 18px;font-size:13.5px';
        faixa.innerHTML = '<strong>Este navegador não está guardando os dados.</strong> ' +
          'Costuma ser janela anônima ou armazenamento cheio. Nada do que você fizer aqui será salvo — ' +
          'abra o app numa janela normal, ou exporte um backup em Configurações antes de fechar.';
        var alvo = document.querySelector('.main');
        if (alvo) alvo.prepend(faixa);
      }
      return false;
    }
  };

  AH.limparTudo = function () {
    AH.state = estadoVazio();
    AH.salvar();
  };

  AH.restaurarDemo = function () {
    AH.state = AH.dadosDemo();
    AH.salvar();
  };

  AH.estadoVazio = estadoVazio;

  /* ---------- consultas comuns ---------- */

  AH.clientePorId = function (id) {
    return AH.state.clientes.filter(function (c) { return c.id === id; })[0] || null;
  };
  AH.projetoPorId = function (id) {
    return AH.state.projetos.filter(function (p) { return p.id === id; })[0] || null;
  };
  AH.membroPorId = function (id) {
    return AH.state.equipe.filter(function (m) { return m.id === id; })[0] || null;
  };
  AH.nomeCliente = function (id) {
    var c = AH.clientePorId(id);
    return c ? c.nome : 'Sem cliente';
  };

  AH.totalProposta = function (p) {
    var soma = (p.itens || []).reduce(function (acc, it) {
      return acc + (Number(it.qtd) || 0) * (Number(it.valor) || 0);
    }, 0);
    return Math.max(0, soma - (Number(p.desconto) || 0));
  };

  /* ---------- tráfego pago ---------- */

  AH.campanhaPorId = function (id) {
    return AH.state.campanhas.filter(function (c) { return c.id === id; })[0] || null;
  };

  AH.nomePlataforma = function (id, curto) {
    var p = AH.dominio.plataformas.filter(function (x) { return x.id === id; })[0];
    return p ? (curto ? p.curto : p.nome) : id;
  };

  AH.unidadeObjetivo = function (id) {
    var o = AH.dominio.objetivosTrafego.filter(function (x) { return x.id === id; })[0];
    return o ? o.unidade : 'resultados';
  };

  AH.nomeObjetivo = function (id) {
    var o = AH.dominio.objetivosTrafego.filter(function (x) { return x.id === id; })[0];
    return o ? o.nome : id;
  };

  // Soma os registros informados (ou todos da campanha) e deriva as métricas
  AH.metricasTrafego = function (registros) {
    var t = { investimento: 0, alcance: 0, impressoes: 0, cliques: 0, resultados: 0, receita: 0 };
    (registros || []).forEach(function (r) {
      t.investimento += Number(r.investimento) || 0;
      t.alcance += Number(r.alcance) || 0;
      t.impressoes += Number(r.impressoes) || 0;
      t.cliques += Number(r.cliques) || 0;
      t.resultados += Number(r.resultados) || 0;
      t.receita += Number(r.receita) || 0;
    });
    t.ctr = t.impressoes > 0 ? t.cliques / t.impressoes : null;
    t.cpc = t.cliques > 0 ? t.investimento / t.cliques : null;
    t.cpm = t.impressoes > 0 ? (t.investimento / t.impressoes) * 1000 : null;
    t.custoResultado = t.resultados > 0 ? t.investimento / t.resultados : null;
    t.roas = t.receita > 0 && t.investimento > 0 ? t.receita / t.investimento : null;
    return t;
  };

  // Registros de uma lista de campanhas cujo início cai no mês YYYY-MM
  AH.registrosDoMes = function (campanhas, yyyymm) {
    var lista = [];
    campanhas.forEach(function (c) {
      (c.registros || []).forEach(function (r) {
        if (String(r.de).slice(0, 7) === yyyymm) lista.push(r);
      });
    });
    return lista;
  };

  /* ---------- leads e conversões ---------- */

  // Resumo do funil para uma lista de leads
  AH.resumoLeads = function (leads) {
    var r = { total: leads.length, novo: 0, contato: 0, negociacao: 0, convertido: 0, perdido: 0, valor: 0 };
    leads.forEach(function (l) {
      if (r[l.status] !== undefined) r[l.status]++;
      if (l.status === 'convertido') r.valor += Number(l.valor) || 0;
    });
    r.emAndamento = r.novo + r.contato + r.negociacao;
    r.taxa = r.total > 0 ? r.convertido / r.total : null;
    return r;
  };

  /* ---------- dados de demonstração ---------- */

  AH.dadosDemo = function () {
    var s = estadoVazio();
    var d = AH.diasISO, m = AH.mesISO;

    s.configuracoes.nomeAgencia = 'Agência Cavalcante';
    s.configuracoes.slogan = 'Marketing & Produção Audiovisual';
    s.configuracoes.condicoesPadrao = '50% na aprovação e 50% na entrega. Proposta válida por 15 dias.';

    var eq = function (nome, funcao, whatsapp, cor) {
      return { id: AH.uid(), nome: nome, funcao: funcao, email: '', whatsapp: whatsapp || '', cor: cor };
    };
    var m1 = eq('Você', 'Direção', '', '#5878ff');
    var m2 = eq('Ana Souza', 'Edição de vídeo', '(88) 99999-0002', '#a78bfa');
    var m3 = eq('Pedro Lima', 'Filmmaker', '(88) 99999-0003', '#60a5fa');
    var m4 = eq('Carla Dias', 'Social media', '(88) 99999-0004', '#f472b6');
    s.equipe = [m1, m2, m3, m4];

    var cli = function (nome, empresa, segmento, status, whatsapp, instagram, origem) {
      return {
        id: AH.uid(), nome: nome, empresa: empresa, segmento: segmento, status: status,
        email: '', whatsapp: whatsapp || '', instagram: instagram || '', origem: origem || 'Indicação',
        notas: '', criadoEm: AH.hojeISO()
      };
    };
    var c1 = cli('Haras Boa Vista', 'Haras Boa Vista', 'Agronegócio', 'ativo', '(88) 98888-0001', '@harasboavista');
    var c2 = cli('Supermercado Central', 'Central Ltda', 'Varejo', 'ativo', '(88) 98888-0002', '@supercentral', 'Instagram');
    var c3 = cli('Clínica Vida', 'Clínica Vida', 'Saúde', 'ativo', '(88) 98888-0003', '@clinicavida');
    var c4 = cli('Parque de Vaquejada Serra Verde', 'Serra Verde Eventos', 'Eventos', 'ativo', '(88) 98888-0004', '@vaquejadaserraverde', 'Evento');
    var c5 = cli('Loja Estilo Sertão', 'Estilo Sertão', 'Moda', 'lead', '(88) 98888-0005', '@estilosertao', 'Instagram');
    var c6 = cli('Colégio Saber', 'Colégio Saber', 'Educação', 'inativo', '(88) 98888-0006', '@colegiosaber');
    s.clientes = [c1, c2, c3, c4, c5, c6];

    var proj = function (titulo, clienteId, tipo, status, prazo, valor, respId, descricao) {
      return {
        id: AH.uid(), titulo: titulo, clienteId: clienteId, tipo: tipo, status: status,
        prazo: prazo, valor: valor, responsavelId: respId, descricao: descricao || '',
        criadoEm: AH.hojeISO()
      };
    };
    var p1 = proj('Aftermovie da vaquejada', c4.id, 'Cobertura de evento', 'edicao', d(4), 4500, m2.id, 'Vídeo resumo de 2 min + cortes para reels.');
    var p2 = proj('Vídeo institucional 2 min', c3.id, 'Vídeo institucional', 'producao', d(9), 6800, m3.id, 'Roteiro aprovado. Gravação na clínica.');
    var p3 = proj('Social media — agosto', c2.id, 'Social media', 'producao', d(12), 1900, m4.id, '12 posts + 8 stories + relatório.');
    var p4 = proj('Campanha de tráfego — inauguração', c2.id, 'Tráfego pago', 'planejamento', d(6), 1500, m1.id, 'Meta Ads. Verba do cliente: R$ 2.000.');
    var p5 = proj('Ensaio do plantel', c1.id, 'Ensaio fotográfico', 'briefing', d(15), 2200, m3.id, 'Fotos dos animais para catálogo de leilão.');
    var p6 = proj('Identidade visual da loja', c5.id, 'Identidade visual', 'briefing', d(20), 3200, m1.id, 'Logo + paleta + papelaria básica.');
    var p7 = proj('Vídeo aéreo do haras', c1.id, 'Filmagem com drone', 'revisao', d(2), 1800, m3.id, 'Aguardando retorno do cliente sobre o corte 1.');
    var p8 = proj('Making of — festa junina', c6.id, 'Cobertura de evento', 'entregue', d(-9), 1600, m2.id, 'Entregue e aprovado.');
    s.projetos = [p1, p2, p3, p4, p5, p6, p7, p8];

    var tarefa = function (titulo, projetoId, respId, prioridade, prazo, feita) {
      return {
        id: AH.uid(), titulo: titulo, projetoId: projetoId || '', responsavelId: respId || '',
        prioridade: prioridade, prazo: prazo || '', feita: !!feita, criadoEm: AH.hojeISO()
      };
    };
    s.tarefas = [
      tarefa('Selecionar takes do aftermovie', p1.id, m2.id, 'alta', d(1)),
      tarefa('Trilha e color do aftermovie', p1.id, m2.id, 'alta', d(3)),
      tarefa('Confirmar diária do drone', p2.id, m3.id, 'media', d(2)),
      tarefa('Agendar gravação com a Dra. Paula', p2.id, m1.id, 'alta', d(-1)),
      tarefa('Aprovar calendário de posts com o cliente', p3.id, m4.id, 'media', d(2)),
      tarefa('Subir campanha no Gerenciador', p4.id, m1.id, 'alta', d(5)),
      tarefa('Enviar contrato da identidade visual', p6.id, m1.id, 'baixa', d(7)),
      tarefa('Cobrar retorno do corte 1 (drone)', p7.id, m1.id, 'media', d(0)),
      tarefa('Emitir NF do making of', p8.id, m1.id, 'baixa', d(-3), true),
      tarefa('Backup dos cartões no HD 2', '', m2.id, 'media', d(-2), true)
    ];

    var ev = function (titulo, data, hora, tipo, clienteId, local) {
      return {
        id: AH.uid(), titulo: titulo, data: data, hora: hora || '', tipo: tipo,
        clienteId: clienteId || '', projetoId: '', local: local || '', notas: ''
      };
    };
    s.eventos = [
      ev('Gravação — Clínica Vida', d(3), '08:00', 'gravacao', c3.id, 'Clínica Vida, Centro'),
      ev('Entrega — Aftermovie', d(4), '18:00', 'entrega', c4.id, ''),
      ev('Reunião de pauta — Supermercado', d(1), '14:30', 'reuniao', c2.id, 'Online'),
      ev('Posts da semana — Supermercado', d(2), '10:00', 'postagem', c2.id, ''),
      ev('Voo de drone — Haras', d(6), '05:30', 'gravacao', c1.id, 'Haras Boa Vista'),
      ev('Entrega — corte final drone', d(5), '', 'entrega', c1.id, ''),
      ev('Reunião comercial — Estilo Sertão', d(7), '16:00', 'reuniao', c5.id, 'Loja do cliente')
    ];

    var num = 1;
    var prop = function (clienteId, titulo, status, itens, desconto, criadoEm, validade) {
      return {
        id: AH.uid(), numero: num++, clienteId: clienteId, titulo: titulo, status: status,
        itens: itens, desconto: desconto || 0, validade: validade || d(15),
        condicoes: s.configuracoes.condicoesPadrao, notas: '', criadoEm: criadoEm || AH.hojeISO()
      };
    };
    var pr1 = prop(c5.id, 'Identidade visual + lançamento', 'enviada', [
      { descricao: 'Identidade visual completa', qtd: 1, valor: 3200 },
      { descricao: 'Pacote social media mensal (12 posts + 8 stories)', qtd: 1, valor: 1900 }
    ], 300, d(-2));
    var pr2 = prop(c1.id, 'Vídeo aéreo do haras', 'aprovada', [
      { descricao: 'Diária de filmagem com drone', qtd: 1, valor: 1200 },
      { descricao: 'Edição de vídeo (por minuto finalizado)', qtd: 2, valor: 300 }
    ], 0, d(-12));
    var pr3 = prop(c2.id, 'Cobertura da inauguração', 'rascunho', [
      { descricao: 'Cobertura de evento (diária de filmagem)', qtd: 1, valor: 1500 },
      { descricao: 'Cortes para reels (pacote com 4)', qtd: 1, valor: 800 }
    ], 0);
    var pr4 = prop(c6.id, 'Vídeo de matrículas 2027', 'recusada', [
      { descricao: 'Vídeo institucional (roteiro + captação + edição)', qtd: 1, valor: 5500 }
    ], 0, d(-25), d(-10));
    s.propostas = [pr1, pr2, pr3, pr4];
    s.proximoNumeroProposta = num;

    var lanc = function (tipo, descricao, categoria, valor, data, status, clienteId, projetoId) {
      return {
        id: AH.uid(), tipo: tipo, descricao: descricao, categoria: categoria,
        valor: valor, data: data, status: status, clienteId: clienteId || '', projetoId: projetoId || '',
        propostaId: ''
      };
    };
    var mmAtual = m(0);
    s.lancamentos = [
      // meses anteriores (para o gráfico do painel)
      lanc('receita', 'Vídeo de lançamento — Estilo Sertão', 'Projeto', 2800, m(-5) + '-15', 'pago', c5.id),
      lanc('receita', 'Social media — Supermercado', 'Mensalidade (fee)', 1700, m(-5) + '-05', 'pago', c2.id),
      lanc('receita', 'Cobertura leilão — Haras', 'Projeto', 3900, m(-4) + '-20', 'pago', c1.id),
      lanc('receita', 'Social media — Supermercado', 'Mensalidade (fee)', 1700, m(-4) + '-05', 'pago', c2.id),
      lanc('receita', 'Institucional — Colégio Saber', 'Projeto', 5200, m(-3) + '-12', 'pago', c6.id),
      lanc('receita', 'Social media — Supermercado', 'Mensalidade (fee)', 1900, m(-3) + '-05', 'pago', c2.id),
      lanc('receita', 'Ensaio — Clínica Vida', 'Projeto', 1400, m(-2) + '-18', 'pago', c3.id),
      lanc('receita', 'Social media — Supermercado', 'Mensalidade (fee)', 1900, m(-2) + '-05', 'pago', c2.id),
      lanc('receita', 'Making of festa junina — 1ª parcela', 'Projeto', 800, m(-1) + '-10', 'pago', c6.id, p8.id),
      lanc('receita', 'Social media — Supermercado', 'Mensalidade (fee)', 1900, m(-1) + '-05', 'pago', c2.id),
      lanc('receita', 'Drone haras — 50% aprovação', 'Projeto', 900, m(-1) + '-22', 'pago', c1.id, p7.id),
      // mês atual
      lanc('receita', 'Social media — Supermercado', 'Mensalidade (fee)', 1900, mmAtual + '-05', 'pago', c2.id, p3.id),
      lanc('receita', 'Aftermovie — 50% na aprovação', 'Projeto', 2250, mmAtual + '-08', 'pago', c4.id, p1.id),
      lanc('receita', 'Aftermovie — 50% na entrega', 'Projeto', 2250, AH.diasISO(4), 'pendente', c4.id, p1.id),
      lanc('receita', 'Institucional clínica — entrada', 'Projeto', 3400, AH.diasISO(2), 'pendente', c3.id, p2.id),
      lanc('despesa', 'Adobe Creative Cloud', 'Software / Assinaturas', 290, mmAtual + '-03', 'pago'),
      lanc('despesa', 'Freela captação — Pedro (diária extra)', 'Equipe / Freela', 350, mmAtual + '-07', 'pago'),
      lanc('despesa', 'Combustível — gravações', 'Transporte', 220, mmAtual + '-09', 'pago'),
      lanc('despesa', 'Cartão SD 128GB', 'Equipamento', 180, mmAtual + '-10', 'pendente')
    ];

    var eqp = function (nome, categoria, marca, serial, status) {
      return { id: AH.uid(), nome: nome, categoria: categoria, marca: marca || '', serial: serial || '', status: status, notas: '' };
    };
    s.equipamentos = [
      eqp('Sony FX30', 'Câmera', 'Sony', 'FX30-0142', 'em_uso'),
      eqp('Canon R6', 'Câmera', 'Canon', 'R6-8830', 'disponivel'),
      eqp('Sigma 18-35mm f/1.8', 'Lente', 'Sigma', '', 'disponivel'),
      eqp('Sony 70-200mm f/2.8', 'Lente', 'Sony', '', 'em_uso'),
      eqp('DJI Mavic 3 Pro', 'Drone', 'DJI', 'MAV3-2211', 'disponivel'),
      eqp('DJI RS 3', 'Estabilizador / Gimbal', 'DJI', '', 'disponivel'),
      eqp('Kit iluminação Amaran (2x 200d)', 'Iluminação', 'Aputure', '', 'disponivel'),
      eqp('Lapela Rode Wireless GO II', 'Áudio', 'Rode', '', 'em_uso'),
      eqp('Zoom H6 (gravador)', 'Áudio', 'Zoom', '', 'manutencao'),
      eqp('MacBook Pro M2 (ilha de edição)', 'Computador', 'Apple', '', 'em_uso')
    ];

    var reg = function (de, ate, investimento, alcance, impressoes, cliques, resultados, receita) {
      return {
        id: AH.uid(), de: de, ate: ate, investimento: investimento, alcance: alcance,
        impressoes: impressoes, cliques: cliques, resultados: resultados, receita: receita || 0
      };
    };
    s.campanhas = [
      {
        id: AH.uid(), clienteId: c2.id, nome: 'Ofertas da semana — WhatsApp',
        plataforma: 'meta', objetivo: 'mensagens', status: 'ativa',
        linkGerenciador: '', notas: 'Verba do cliente: R$ 650/mês.',
        registros: [
          reg(m(-2) + '-01', m(-2) + '-28', 600, 45200, 89400, 2140, 182),
          reg(m(-1) + '-01', m(-1) + '-28', 650, 52100, 103800, 2410, 214),
          reg(mmAtual + '-01', AH.hojeISO(), 480, 38300, 71200, 1760, 158)
        ]
      },
      {
        id: AH.uid(), clienteId: c5.id, nome: 'Lançamento da coleção — cadastros',
        plataforma: 'meta', objetivo: 'cadastros', status: 'ativa',
        linkGerenciador: '', notas: '',
        registros: [
          reg(m(-1) + '-10', m(-1) + '-28', 300, 21500, 40200, 980, 64),
          reg(mmAtual + '-01', AH.hojeISO(), 350, 24800, 47600, 1130, 78)
        ]
      },
      {
        id: AH.uid(), clienteId: c3.id, nome: 'Agendamentos — Pesquisa Google',
        plataforma: 'google', objetivo: 'conversoes', status: 'pausada',
        linkGerenciador: '', notas: 'Pausada a pedido do cliente até a reforma da recepção.',
        registros: [
          reg(m(-2) + '-01', m(-2) + '-28', 420, 8900, 15400, 640, 22, 3300),
          reg(m(-1) + '-01', m(-1) + '-15', 210, 4300, 7600, 310, 11, 1650)
        ]
      }
    ];
    var camp1 = s.campanhas[0], camp2 = s.campanhas[1], camp3 = s.campanhas[2];

    var post = function (clienteId, titulo, canal, formato, data, status, projetoId) {
      return {
        id: AH.uid(), clienteId: clienteId, projetoId: projetoId || '', titulo: titulo,
        canal: canal, formato: formato, data: data, status: status, legenda: '', linkPublicacao: ''
      };
    };
    s.postagens = [
      post(c2.id, 'Reels — Ofertas da semana', 'instagram', 'Reels', d(1), 'agendada', p3.id),
      post(c2.id, 'Carrossel — Receitas com produtos da loja', 'instagram', 'Carrossel', d(3), 'aprovacao', p3.id),
      post(c2.id, 'Post — Sorteio de aniversário da loja', 'instagram', 'Post estático', d(6), 'producao', p3.id),
      post(c2.id, 'Story — Bastidores da gravação', 'instagram', 'Story', d(2), 'ideia', p3.id),
      post(c2.id, 'Reels — Tour pela loja reformada', 'instagram', 'Reels', d(-2), 'publicada', p3.id),
      post(c5.id, 'Reels — Teaser da nova coleção', 'tiktok', 'Reels', d(4), 'producao'),
      post(c5.id, 'Carrossel — Lookbook agosto', 'instagram', 'Carrossel', d(7), 'ideia')
    ];

    var mat = function (clienteId, projetoId, titulo, tipo, status, enviadoEm, link) {
      return {
        id: AH.uid(), clienteId: clienteId, projetoId: projetoId || '', titulo: titulo,
        tipo: tipo, status: status, enviadoEm: enviadoEm, link: link || '', notas: ''
      };
    };
    s.materiais = [
      mat(c4.id, p1.id, 'Corte 1 — Aftermovie da vaquejada', 'Vídeo', 'aguardando', d(-1)),
      mat(c2.id, p3.id, 'Artes do carrossel de receitas', 'Arte / Design', 'aguardando', d(0)),
      mat(c3.id, p2.id, 'Roteiro do vídeo institucional', 'Roteiro', 'aprovado', d(-3)),
      mat(c5.id, p6.id, 'Logo — caminho criativo 2', 'Arte / Design', 'ajustes', d(-2))
    ];

    var lead = function (clienteId, campanhaId, nome, contato, origem, data, status, valor) {
      return {
        id: AH.uid(), clienteId: clienteId, campanhaId: campanhaId || '', nome: nome,
        contato: contato || '', origem: origem, data: data, status: status,
        valor: valor || 0, notas: ''
      };
    };
    s.leads = [
      lead(c2.id, camp1.id, 'Maria das Graças', '(88) 97777-0001', 'Anúncio Meta', d(-1), 'convertido', 180),
      lead(c2.id, camp1.id, 'João Ferreira', '(88) 97777-0002', 'Anúncio Meta', d(-2), 'convertido', 220),
      lead(c2.id, camp1.id, 'Rita Cavalcanti', '(88) 97777-0003', 'Anúncio Meta', d(0), 'contato'),
      lead(c2.id, camp1.id, 'Severino Alves', '', 'Anúncio Meta', d(0), 'novo'),
      lead(c2.id, '', 'Dona Lurdes (balcão)', '', 'Indicação', d(-4), 'convertido', 95),
      lead(c5.id, camp2.id, 'Ana Beatriz', '(88) 97777-0005', 'Anúncio Meta', d(-1), 'convertido', 350),
      lead(c5.id, camp2.id, 'Camila Rocha', '(88) 97777-0006', 'Anúncio Meta', d(-3), 'negociacao'),
      lead(c5.id, camp2.id, 'Patrícia Nunes', '', 'Anúncio Meta', d(0), 'novo'),
      lead(c5.id, camp2.id, 'Fernanda Melo', '', 'Anúncio Meta', d(-6), 'perdido'),
      lead(c3.id, camp3.id, 'Carlos Andrade', '(88) 97777-0009', 'Anúncio Google', m(-1) + '-20', 'convertido', 900),
      lead(c3.id, camp3.id, 'Helena Castro', '', 'Anúncio Google', d(-2), 'contato')
    ];

    return s;
  };

  /* ---------- resumo do negócio (contexto do assistente Claude) ---------- */

  AH.resumoNegocio = function () {
    var s = AH.state;
    var hoje = AH.hojeISO();
    var mm = hoje.slice(0, 7);
    var linhas = [];

    linhas.push('Data de hoje: ' + AH.fmt.data(hoje));
    linhas.push('Agência: ' + (s.configuracoes.nomeAgencia || 'Agência') + ' — ' + (s.configuracoes.slogan || ''));

    var ativos = s.clientes.filter(function (c) { return c.status === 'ativo'; });
    linhas.push('Clientes: ' + s.clientes.length + ' no total, ' + ativos.length + ' ativos (' +
      ativos.map(function (c) { return c.nome; }).join(', ') + ').');

    var emAndamento = s.projetos.filter(function (p) { return p.status !== 'entregue'; });
    if (emAndamento.length) {
      linhas.push('Projetos em andamento: ' + emAndamento.map(function (p) {
        return p.titulo + ' [' + AH.nomeCliente(p.clienteId) + ' · ' + AH.nomeColuna(p.status) +
          (p.prazo ? ' · prazo ' + AH.fmt.data(p.prazo) : '') + ']';
      }).join('; '));
    }

    var pendentes = s.tarefas.filter(function (t) { return !t.feita; });
    var atrasadas = pendentes.filter(function (t) { return t.prazo && AH.diasAte(t.prazo) < 0; });
    linhas.push('Tarefas pendentes: ' + pendentes.length + (atrasadas.length ? ' (ATRASADAS: ' +
      atrasadas.map(function (t) { return t.titulo; }).join('; ') + ')' : ''));

    var eventosProx = s.eventos.filter(function (e) { return e.data >= hoje; })
      .sort(function (a, b) { return (a.data + a.hora).localeCompare(b.data + b.hora); }).slice(0, 6);
    if (eventosProx.length) {
      linhas.push('Próximos compromissos: ' + eventosProx.map(function (e) {
        return AH.fmt.data(e.data) + (e.hora ? ' ' + e.hora : '') + ' — ' + e.titulo;
      }).join('; '));
    }

    var recebido = 0, aReceber = 0, despesas = 0;
    s.lancamentos.forEach(function (l) {
      var v = Number(l.valor) || 0;
      if (l.tipo === 'receita' && String(l.data).slice(0, 7) === mm && l.status === 'pago') recebido += v;
      if (l.tipo === 'receita' && l.status === 'pendente') aReceber += v;
      if (l.tipo === 'despesa' && String(l.data).slice(0, 7) === mm && l.status === 'pago') despesas += v;
    });
    linhas.push('Financeiro do mês: recebido ' + AH.fmt.moeda(recebido) + ', despesas ' + AH.fmt.moeda(despesas) +
      ', a receber (pendente, total) ' + AH.fmt.moeda(aReceber) + '.');

    var enviadas = s.propostas.filter(function (p) { return p.status === 'enviada'; });
    if (enviadas.length) {
      linhas.push('Propostas em negociação: ' + enviadas.map(function (p) {
        return '#' + p.numero + ' ' + p.titulo + ' (' + AH.nomeCliente(p.clienteId) + ', ' + AH.fmt.moeda(AH.totalProposta(p)) + ')';
      }).join('; '));
    }

    var campAtivas = s.campanhas.filter(function (c) { return c.status === 'ativa'; });
    if (campAtivas.length) {
      var mMes = AH.metricasTrafego(AH.registrosDoMes(s.campanhas, mm));
      linhas.push('Tráfego pago no mês: investido ' + AH.fmt.moeda(mMes.investimento) + ', ' + AH.fmt.num(mMes.resultados) +
        ' resultados' + (mMes.custoResultado != null ? ', custo por resultado ' + AH.fmt.moeda(mMes.custoResultado) : '') +
        '. Campanhas ativas: ' + campAtivas.map(function (c) { return c.nome + ' (' + AH.nomeCliente(c.clienteId) + ')'; }).join('; '));
    }

    if (s.leads.length) {
      var rl = AH.resumoLeads(s.leads.filter(function (l) { return String(l.data).slice(0, 7) === mm; }));
      linhas.push('Leads no mês: ' + rl.total + ' (' + rl.convertido + ' convertidos, valor gerado ' + AH.fmt.moeda(rl.valor) + ').');
    }

    var aguardando = s.materiais.filter(function (m) { return m.status === 'aguardando'; });
    if (aguardando.length) {
      linhas.push('Materiais aguardando aprovação do cliente: ' + aguardando.map(function (m) {
        return m.titulo + ' (' + AH.nomeCliente(m.clienteId) + ')';
      }).join('; '));
    }

    return linhas.join('\n');
  };

  /* ---------- portal do cliente: retrato dos dados + codificação para link ---------- */

  // Monta o "retrato" (snapshot) que vai dentro do link do portal.
  // Contém APENAS os dados daquele cliente — nada da agência ou de outros clientes vaza.
  AH.snapshotPortal = function (clienteId, opcoes) {
    opcoes = opcoes || {};
    var c = AH.clientePorId(clienteId);
    if (!c) return null;
    var cfg = AH.state.configuracoes;
    var hoje = AH.hojeISO();
    var agora = new Date();

    var projetos = AH.state.projetos
      .filter(function (p) { return p.clienteId === clienteId; })
      .sort(function (a, b) { return String(a.prazo || '9999').localeCompare(String(b.prazo || '9999')); })
      .map(function (p) {
        return {
          titulo: p.titulo, tipo: p.tipo, status: p.status, prazo: p.prazo || '',
          descricao: String(p.descricao || '').slice(0, 180)
        };
      });

    var eventos = AH.state.eventos
      .filter(function (e) { return e.clienteId === clienteId && e.data >= hoje; })
      .sort(function (a, b) { return (a.data + a.hora).localeCompare(b.data + b.hora); })
      .slice(0, 8)
      .map(function (e) {
        return { titulo: e.titulo, data: e.data, hora: e.hora || '', tipo: e.tipo, local: e.local || '' };
      });

    var campanhas = AH.state.campanhas
      .filter(function (cp) { return cp.clienteId === clienteId; })
      .map(function (cp) {
        return {
          nome: cp.nome, plataforma: cp.plataforma, objetivo: cp.objetivo, status: cp.status,
          registros: (cp.registros || []).map(function (r) {
            return {
              de: r.de, ate: r.ate, investimento: r.investimento, alcance: r.alcance,
              impressoes: r.impressoes, cliques: r.cliques, resultados: r.resultados, receita: r.receita
            };
          })
        };
      });

    var postagens = AH.state.postagens
      .filter(function (pt) { return pt.clienteId === clienteId; })
      .sort(function (a, b) { return String(a.data).localeCompare(String(b.data)); });
    var pipeline = postagens.filter(function (pt) { return pt.status !== 'publicada'; }).slice(0, 8);
    var publicadas = postagens.filter(function (pt) { return pt.status === 'publicada'; }).slice(-4).reverse();
    var postagensPortal = pipeline.concat(publicadas).map(function (pt) {
      return { titulo: pt.titulo, canal: pt.canal, formato: pt.formato, data: pt.data, status: pt.status, link: pt.linkPublicacao || '' };
    });

    var materiais = AH.state.materiais
      .filter(function (mt) { return mt.clienteId === clienteId; })
      .sort(function (a, b) { return String(b.enviadoEm).localeCompare(String(a.enviadoEm)); });
    var pendentes = materiais.filter(function (mt) { return mt.status !== 'aprovado'; });
    var aprovados = materiais.filter(function (mt) { return mt.status === 'aprovado'; }).slice(0, 3);
    var materiaisPortal = pendentes.concat(aprovados).map(function (mt) {
      var proj = AH.projetoPorId(mt.projetoId);
      return {
        titulo: mt.titulo, tipo: mt.tipo, status: mt.status, link: mt.link || '',
        enviadoEm: mt.enviadoEm, projeto: proj ? proj.titulo : ''
      };
    });

    var leadsCliente = AH.state.leads.filter(function (l) { return l.clienteId === clienteId; });
    var mmAtual = hoje.slice(0, 7);
    var leadsMes = leadsCliente.filter(function (l) { return String(l.data).slice(0, 7) === mmAtual; });
    var resumoMes = AH.resumoLeads(leadsMes);
    var resumoGeral = AH.resumoLeads(leadsCliente);
    var leadsPortal = (leadsCliente.length || null) && {
      mes: {
        total: resumoMes.total, novo: resumoMes.novo, contato: resumoMes.contato,
        negociacao: resumoMes.negociacao, convertido: resumoMes.convertido,
        perdido: resumoMes.perdido, valor: resumoMes.valor, taxa: resumoMes.taxa
      },
      geral: { total: resumoGeral.total, convertido: resumoGeral.convertido, valor: resumoGeral.valor }
    };

    var cobrancas = [];
    if (opcoes.incluirCobrancas) {
      cobrancas = AH.state.lancamentos
        .filter(function (l) { return l.tipo === 'receita' && l.status === 'pendente' && l.clienteId === clienteId; })
        .sort(function (a, b) { return String(a.data).localeCompare(String(b.data)); })
        .map(function (l) { return { descricao: l.descricao, valor: l.valor, data: l.data }; });
    }

    return {
      v: 1,
      geradoEm: hoje,
      geradoHora: (agora.getHours() < 10 ? '0' : '') + agora.getHours() + ':' + (agora.getMinutes() < 10 ? '0' : '') + agora.getMinutes(),
      agencia: {
        nome: cfg.nomeAgencia || 'Sua agência', slogan: cfg.slogan || '',
        whatsapp: cfg.whatsapp || '', instagram: cfg.instagram || '',
        site: cfg.site || '', email: cfg.email || '',
        pix: opcoes.incluirCobrancas ? (cfg.pix || '') : ''
      },
      cliente: { nome: c.nome, empresa: c.empresa || '' },
      projetos: projetos,
      eventos: eventos,
      campanhas: campanhas,
      postagens: postagensPortal,
      materiais: materiaisPortal,
      leads: leadsPortal || null,
      cobrancas: cobrancas
    };
  };

  function bytesParaB64url(bytes) {
    var bin = '';
    for (var i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function b64urlParaBytes(str) {
    var s = String(str).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  /* Codifica um objeto para o pedaço final do link (#/p?d=...).
     Quem ABRE o link é o cliente, e não dá para saber que navegador ele usa —
     então preferimos o modo sem compressão ('j'), que funciona em qualquer
     celular, inclusive iPhone antigo. Só quando o link ficaria grande demais
     usamos compressão ('d'), que exige navegador de 2023 para cima. */
  var LIMITE_SEM_COMPRESSAO = 8000; // caracteres — acima disso o link fica feio no WhatsApp

  AH.codificarPortal = function (obj) {
    var bytes;
    try {
      bytes = new TextEncoder().encode(JSON.stringify(obj));
    } catch (e) {
      return Promise.reject(e);
    }
    var semCompressao = 'j.' + bytesParaB64url(bytes);
    if (semCompressao.length <= LIMITE_SEM_COMPRESSAO || typeof CompressionStream === 'undefined') {
      return Promise.resolve(semCompressao);
    }
    try {
      var comprimido = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      return new Response(comprimido).arrayBuffer().then(function (buf) {
        return 'd.' + bytesParaB64url(new Uint8Array(buf));
      }).catch(function () { return semCompressao; });
    } catch (e) {
      return Promise.resolve(semCompressao);
    }
  };

  /* Decodifica o link no navegador do CLIENTE. Tudo aqui dentro pode estourar
     de forma síncrona (atob com link cortado, JSON quebrado, DecompressionStream
     inexistente); sem este try/catch a exceção escapava do .catch() de quem
     chamou e a tela ficava travada em "Carregando…" para sempre. */
  AH.decodificarPortal = function (payload) {
    try {
      var i = String(payload).indexOf('.');
      if (i < 0) return Promise.reject(new Error('Link incompleto.'));
      var modo = payload.slice(0, i);
      var bytes = b64urlParaBytes(payload.slice(i + 1));
      if (modo === 'j') {
        return Promise.resolve(JSON.parse(new TextDecoder().decode(bytes)));
      }
      if (typeof DecompressionStream === 'undefined') {
        return Promise.reject(new Error('NAVEGADOR_ANTIGO'));
      }
      var descomprimido = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return new Response(descomprimido).arrayBuffer().then(function (buf) {
        return JSON.parse(new TextDecoder().decode(buf));
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
})();
