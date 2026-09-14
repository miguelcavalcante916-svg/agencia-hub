"""Smoke test do AgênciaHub via file:// — navega por todas as telas, exercita fluxos e captura erros."""
import json
from playwright.sync_api import sync_playwright

URL = 'file:///home/user/agencia-hub/app/index.html'
SHOTS = '/tmp/claude-0/-home-user-wifi-vaquejada/932f984e-a499-598d-a64a-4d1d7c73965a/scratchpad'

erros = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path='/opt/pw-browsers/chromium')
    page = browser.new_page(viewport={'width': 1360, 'height': 850})
    page.on('pageerror', lambda e: erros.append(f'PAGEERROR: {e}'))
    # Rodando de file:// nao existe servidor: a trava chama /api/agencia/entrar e o
    # navegador barra por CORS, e as fontes do Google nao carregam (sandbox offline).
    # Os dois sao ESPERADOS — a trava foi feita para abrir justamente nesse caso. Contar
    # esse ruido como falha esconderia erro de verdade no meio dele.
    RUIDO_FILE = ('/api/agencia/entrar', '/api/portal/', 'fonts.googleapis.com',
                  'fonts.gstatic.com', 'ERR_CONNECTION_RESET', 'ERR_FAILED',
                  'Failed to load resource')
    def _console(m):
        if m.type != 'error':
            return
        if any(t in m.text for t in RUIDO_FILE):
            return
        erros.append(f'CONSOLE-{m.type}: {m.text}')
    page.on('console', _console)

    page.goto(URL)
    page.wait_for_load_state('networkidle')

    # 1) Dashboard
    assert page.locator('.tile').count() >= 4, 'tiles do painel'
    assert page.locator('#grafico-receita svg').count() == 1, 'grafico presente'
    page.screenshot(path=f'{SHOTS}/01-dashboard.png', full_page=True)
    print('OK dashboard | tiles:', page.locator('.tile').count())

    # tooltip do gráfico
    page.hover('#grafico-receita .barra >> nth=3')
    page.wait_for_timeout(150)
    tip_visivel = page.locator('#grafico-receita .grafico-tooltip').is_visible()
    assert tip_visivel, 'tooltip do grafico aparece no hover'
    print('OK tooltip grafico:', tip_visivel)

    # 2) Clientes: navegar, criar um cliente novo
    page.click('a[href="#/clientes"]')
    page.wait_for_timeout(200)
    antes = page.locator('tbody tr').count()
    page.click('#btn-novo')
    page.fill('[name="nome"]', 'Cliente Teste Ltda')
    page.fill('[name="whatsapp"]', '(88) 90000-0000')
    page.click('.modal button[type="submit"]')
    page.wait_for_timeout(250)
    depois = page.locator('tbody tr').count()
    assert depois == antes + 1, f'cliente criado ({antes} -> {depois})'
    print('OK clientes | linhas:', depois)

    # busca
    page.fill('#busca-cli', 'Teste')
    page.wait_for_timeout(250)
    assert page.locator('tbody tr').count() == 1, 'busca filtra'
    page.fill('#busca-cli', '')
    page.wait_for_timeout(200)

    # 3) Projetos: kanban + drag and drop
    page.click('a[href="#/projetos"]')
    page.wait_for_timeout(250)
    cols = page.locator('.kanban-col').count()
    assert cols == 6, f'6 colunas ({cols})'
    origem = page.locator('.kanban-col[data-col="briefing"] .cartao').first
    titulo_card = origem.locator('.cartao-titulo').inner_text()
    destino = page.locator('.kanban-col[data-col="planejamento"] .kanban-cartoes')
    origem.drag_to(destino)
    page.wait_for_timeout(350)
    movido = page.locator('.kanban-col[data-col="planejamento"]').inner_text()
    assert titulo_card in movido, f'drag-and-drop moveu "{titulo_card}"'
    print('OK kanban | drag-and-drop moveu:', titulo_card)
    page.screenshot(path=f'{SHOTS}/02-projetos.png')

    # novo projeto
    page.click('#btn-novo')
    page.fill('[name="titulo"]', 'Projeto Teste — Reels')
    page.click('.modal button[type="submit"]')
    page.wait_for_timeout(250)
    assert 'Projeto Teste' in page.locator('.kanban').inner_text(), 'projeto criado'
    print('OK novo projeto')

    # 4) Tarefas: adicionar rápida + concluir
    page.click('a[href="#/tarefas"]')
    page.wait_for_timeout(200)
    page.fill('#form-rapido input', 'Tarefa de teste automatizado')
    page.press('#form-rapido input', 'Enter')
    page.wait_for_timeout(250)
    assert 'Tarefa de teste automatizado' in page.locator('#view').inner_text(), 'tarefa criada'
    linha = page.locator('.tarefa-linha', has_text='Tarefa de teste automatizado')
    linha.locator('.tarefa-check').click()
    page.wait_for_timeout(250)
    print('OK tarefas | criar + concluir')

    # 5) Calendário
    page.click('a[href="#/calendario"]')
    page.wait_for_timeout(250)
    assert page.locator('.cal-dia').count() >= 28, 'grade do mês'
    assert page.locator('.cal-evento').count() >= 1, 'eventos visíveis'
    page.screenshot(path=f'{SHOTS}/03-calendario.png')
    # abrir um dia e fechar
    page.locator('.cal-dia.hoje').click()
    page.wait_for_timeout(200)
    assert page.locator('.modal').count() == 1, 'modal do dia'
    page.keyboard.press('Escape')
    page.wait_for_timeout(150)
    print('OK calendario | dias:', page.locator('.cal-dia').count())

    # 6) Propostas: totais no editor
    page.click('a[href="#/propostas"]')
    page.wait_for_timeout(250)
    n_prop = page.locator('tbody tr').count()
    page.click('#btn-novo')
    page.fill('[name="titulo"]', 'Proposta de Teste')
    page.select_option('[name="clienteId"]', index=1)
    page.fill('.prop-item [data-desc]', 'Diária de filmagem')
    page.fill('.prop-item [data-qtd]', '2')
    page.fill('.prop-item [data-valor]', '1000')
    page.fill('#prop-desconto', '100')
    page.wait_for_timeout(150)
    total = page.locator('#prop-total').inner_text()
    assert '1.900' in total, f'total calculado ({total})'
    page.click('.modal button[type="submit"]')
    page.wait_for_timeout(250)
    assert page.locator('tbody tr').count() == n_prop + 1, 'proposta salva'
    print('OK propostas | total:', total)

    # 7) Financeiro
    page.click('a[href="#/financeiro"]')
    page.wait_for_timeout(250)
    assert page.locator('.tile').count() == 4, 'tiles financeiro'
    page.screenshot(path=f'{SHOTS}/04-financeiro.png')
    print('OK financeiro | linhas mes:', page.locator('tbody tr').count())

    # 8) Equipamentos: alternar status
    page.click('a[href="#/equipamentos"]')
    page.wait_for_timeout(250)
    primeiro_badge = page.locator('tbody tr').first.locator('[data-status]')
    antes_txt = primeiro_badge.inner_text()
    primeiro_badge.click()
    page.wait_for_timeout(250)
    # a lista pode reordenar; só confere que não quebrou
    assert page.locator('tbody tr').count() >= 10, 'equipamentos listados'
    print('OK equipamentos | status alternado de:', antes_txt)

    # 9) Equipe
    page.click('a[href="#/equipe"]')
    page.wait_for_timeout(250)
    assert page.locator('.pessoa-card').count() >= 4, 'cards da equipe'
    print('OK equipe | pessoas:', page.locator('.pessoa-card').count())

    # 10) Configurações: salvar nome e ver refletir na sidebar
    page.click('a[href="#/configuracoes"]')
    page.wait_for_timeout(250)
    page.fill('[name="nomeAgencia"]', 'Miguel Filmes & Marketing')
    page.fill('#form-cfg [name="whatsapp"]', '(88) 98888-7777')
    page.click('#form-cfg button[type="submit"]')
    page.wait_for_timeout(250)
    marca = page.locator('#brand-agencia').inner_text()
    assert marca == 'Miguel Filmes & Marketing', f'marca atualizada ({marca})'
    print('OK config | marca:', marca)

    # 11) Persistência: recarregar e conferir que tudo ficou salvo
    page.reload()
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(300)
    assert page.locator('#brand-agencia').inner_text() == 'Miguel Filmes & Marketing', 'persistiu config'
    page.click('a[href="#/clientes"]')
    page.wait_for_timeout(250)
    assert 'Cliente Teste' in page.locator('#view').inner_text(), 'persistiu cliente'
    print('OK persistencia apos reload')

    # 12) Mobile: menu hambúrguer
    page.set_viewport_size({'width': 390, 'height': 800})
    page.click('a[href="#/dashboard"]', force=True) if page.locator('a[href="#/dashboard"]').is_visible() else None
    page.goto(URL + '#/dashboard')
    page.wait_for_timeout(300)
    page.click('#btn-menu')
    page.wait_for_timeout(200)
    assert page.locator('#sidebar.aberta').count() == 1, 'sidebar mobile abre'
    page.click('a[href="#/tarefas"]')
    page.wait_for_timeout(250)
    assert page.locator('#sidebar.aberta').count() == 0, 'sidebar fecha ao navegar'
    page.screenshot(path=f'{SHOTS}/05-mobile.png', full_page=True)
    print('OK mobile')

    # 13) Tráfego pago
    page.set_viewport_size({'width': 1360, 'height': 850})
    page.goto(URL + '#/trafego')
    page.wait_for_timeout(350)
    assert page.locator('#grafico-trafego svg').count() == 1, 'grafico de trafego'
    assert page.locator('.tile').count() == 4, 'tiles de trafego'
    n_camp = page.locator('tbody tr').count()
    assert n_camp >= 3, f'campanhas demo ({n_camp})'
    # abrir desempenho e registrar um período novo
    page.locator('tbody tr').first.locator('[data-acao="registros"]').click()
    page.wait_for_timeout(250)
    assert page.locator('.modal .metrica').count() >= 6, 'metricas no modal'
    regs_antes = page.locator('.modal tbody tr').count()
    page.click('.modal button[type="submit"]')  # Registrar período
    page.wait_for_timeout(250)
    page.fill('.modal [name="investimento"]', '500')
    page.fill('.modal [name="resultados"]', '40')
    page.fill('.modal [name="impressoes"]', '20000')
    page.fill('.modal [name="cliques"]', '800')
    page.click('.modal button[type="submit"]')
    page.wait_for_timeout(350)
    regs_depois = page.locator('.modal tbody tr').count()
    assert regs_depois == regs_antes + 1, f'registro salvo ({regs_antes} -> {regs_depois})'
    page.keyboard.press('Escape')
    page.wait_for_timeout(200)
    # aba do Meta/Facebook filtra a campanha do Google
    page.locator('#seg-plat button[data-v="meta"]').click()
    page.wait_for_timeout(250)
    assert page.locator('tbody tr').count() == 2, 'filtro Meta'
    page.screenshot(path=f'{SHOTS}/10-trafego.png')
    print('OK trafego | campanhas:', n_camp, '| registros no modal:', regs_depois)

    # 14) Portal do cliente (lado da agência)
    page.goto(URL + '#/portal')
    page.wait_for_timeout(400)
    page.select_option('#portal-cliente', label='Supermercado Central')
    page.wait_for_timeout(400)
    prev = page.locator('#portal-preview').inner_text()
    assert 'Olá, Supermercado Central' in prev, 'previa com saudacao'
    assert 'Ofertas da semana' in prev, 'previa com anuncios'
    link_input = page.locator('#portal-link')
    v = ''
    for _ in range(30):
        v = link_input.input_value()
        if '#/p?d=' in v:
            break
        page.wait_for_timeout(150)
    assert '#/p?d=' in v, f'link gerado ({v[:60]}...)'
    print('OK portal admin | link com', len(v), 'caracteres')

    # 15) Portal público (o que o cliente vê ao abrir o link)
    # o app agora gera o link com o domínio de produção (agenciacavalcante.com);
    # aqui não há internet, então testamos o mesmo link apontando para o arquivo local
    v_local = v
    if v.startswith('http'):
        assert v.startswith('https://agenciacavalcante.com/app/'), 'dominio do link: ' + v[:60]
        v_local = URL + v[v.index('#'):]
    page.goto(v_local)
    page.wait_for_timeout(700)
    page.wait_for_selector('#portal-publico', timeout=6000)
    corpo = page.locator('#portal-publico').inner_text()
    assert 'Olá, Supermercado Central' in corpo, 'saudacao no portal publico'
    assert 'Ofertas da semana' in corpo, 'campanha no portal publico'
    assert 'Seus projetos' in corpo, 'secao projetos'
    assert 'Suas postagens' in corpo, 'secao postagens no portal'
    assert 'Materiais para você revisar' in corpo, 'secao aprovacoes no portal'
    assert 'Leads e conversões' in corpo, 'secao leads no portal'
    assert 'TAXA DE CONVERSÃO' in corpo.upper(), 'metricas de leads'
    botao_aprovar = page.locator('#portal-publico a.btn-verde').first
    href_ap = botao_aprovar.get_attribute('href')
    assert href_ap.startswith('https://wa.me/5588988887777?text='), f'botao aprovar via whatsapp ({href_ap[:52]})'
    assert not page.locator('#sidebar').is_visible(), 'painel oculto no portal'
    page.screenshot(path=f'{SHOTS}/09-portal.png', full_page=True)
    print('OK portal público (com postagens, aprovações e leads)')

    # 16) Conteúdo (postagens) — sair do portal recarrega no painel
    page.goto(URL + '#/conteudo')
    page.wait_for_timeout(900)
    assert page.locator('.tile').count() == 4, 'tiles de conteudo'
    n_posts = page.locator('tbody tr').count()
    assert n_posts >= 6, f'postagens demo ({n_posts})'
    linha_post = page.locator('tbody tr', has_text='Ofertas da semana').first
    etapa_antes = linha_post.locator('td').nth(4).inner_text()
    linha_post.locator('[data-acao="avancar"]').click()
    page.wait_for_timeout(300)
    linha_depois = page.locator('tbody tr', has_text='Ofertas da semana').first
    etapa_depois = linha_depois.locator('td').nth(4).inner_text()
    assert etapa_antes != etapa_depois, f'etapa avancou ({etapa_antes} -> {etapa_depois})'
    print('OK conteudo | postagens:', n_posts, '|', etapa_antes, '->', etapa_depois)

    # calendário mostra a postagem
    page.goto(URL + '#/calendario')
    page.wait_for_timeout(350)
    assert 'Carrossel — Receitas' in page.locator('.cal-grade').inner_text(), 'postagem no calendario'
    print('OK calendario mostra postagens')

    # 17) Leads
    page.goto(URL + '#/leads')
    page.wait_for_timeout(350)
    assert page.locator('.tile').count() == 4, 'tiles de leads'
    n_leads = page.locator('tbody tr').count()
    assert n_leads >= 10, f'leads demo ({n_leads})'
    linha_lead = page.locator('tbody tr', has_text='Severino Alves').first
    linha_lead.locator('[data-status]').select_option('negociacao')
    page.wait_for_timeout(300)
    assert 'Negociação' in page.locator('tbody tr', has_text='Severino Alves').first.inner_text(), 'funil atualizado'
    # novo lead convertido com valor
    page.click('#btn-novo-lead')
    page.fill('.modal [name="nome"]', 'Lead Teste Convertido')
    page.select_option('.modal [name="clienteId"]', label='Supermercado Central')
    page.select_option('.modal [name="status"]', 'convertido')
    page.fill('.modal [name="valor"]', '500')
    page.click('.modal button[type="submit"]')
    page.wait_for_timeout(300)
    assert 'Lead Teste Convertido' in page.locator('#view').inner_text(), 'lead criado'
    print('OK leads | total:', n_leads + 1)

    # 18) Aprovações
    page.goto(URL + '#/aprovacoes')
    page.wait_for_timeout(350)
    n_pend = page.locator('tbody tr').count()
    assert n_pend >= 3, f'materiais pendentes ({n_pend})'
    primeira = page.locator('tbody tr').first
    primeira.locator('[data-status]').select_option('aprovado')
    page.wait_for_timeout(300)
    assert page.locator('tbody tr').count() == n_pend - 1, 'material aprovado saiu dos pendentes'
    page.screenshot(path=f'{SHOTS}/17-aprovacoes.png')
    print('OK aprovacoes')

    # 19) Assistente Claude — sem chave mostra a ativação; com chave, chat responde (API interceptada)
    page.goto(URL + '#/assistente')
    page.wait_for_timeout(500)
    assert 'console.anthropic.com' in page.locator('#view').inner_text(), 'onboarding do assistente'
    # configura uma chave falsa e intercepta a API
    page.goto(URL + '#/configuracoes')
    page.wait_for_timeout(500)
    page.fill('#form-claude [name="claudeApiKey"]', 'sk-ant-teste-falso')
    page.click('#form-claude button[type="submit"]')
    page.wait_for_timeout(300)

    pedidos = []

    def responder_api(route):
        pedidos.append(json.loads(route.request.post_data))
        route.fulfill(status=200, content_type='application/json', body=json.dumps({
            'content': [{'type': 'text', 'text': 'O mês vai bem: R$ 4.150 recebidos e 7 projetos ativos.'}],
            'stop_reason': 'end_turn'
        }))
    page.route('https://api.anthropic.com/**', responder_api)

    page.goto(URL + '#/assistente')
    page.wait_for_timeout(500)
    assert page.locator('#chat-form').count() == 1, 'chat renderizado'
    page.fill('#chat-texto', 'Como está o mês?')
    page.click('#chat-form button[type="submit"]')
    page.wait_for_timeout(900)
    corpo_chat = page.locator('#chat-mensagens').inner_text()
    assert 'Como está o mês?' in corpo_chat, 'pergunta no chat'
    assert 'R$ 4.150 recebidos' in corpo_chat, 'resposta do Claude no chat'
    page.screenshot(path=f'{SHOTS}/20-assistente.png')
    page.unroute('https://api.anthropic.com/**')
    print('OK assistente (chat com API interceptada)')

    # 19b) o pedido sai configurado para velocidade: effort baixo e teto folgado
    assert pedidos, 'nenhum pedido capturado'
    req = pedidos[-1]
    assert req.get('output_config', {}).get('effort') == 'low', f"effort={req.get('output_config')}"
    assert req.get('max_tokens') == 8000, f"max_tokens={req.get('max_tokens')}"
    assert 'thinking' not in req, 'thinking deve ficar no padrão adaptativo do modelo'
    assert 'Máximo de 120 palavras' in req['system'], 'instrução de brevidade no system'
    assert 'Alexandria/RN' in req['system'], 'cidade no contexto do assistente'
    print('OK assistente | effort=low, max_tokens=8000, prompt curto')

    # 19c) resposta cortada no limite avisa o usuário
    def responder_cortado(route):
        route.fulfill(status=200, content_type='application/json', body=json.dumps({
            'content': [{'type': 'text', 'text': 'Começo da resposta'}],
            'stop_reason': 'max_tokens'
        }))
    page.route('https://api.anthropic.com/**', responder_cortado)
    page.fill('#chat-texto', 'Me explique tudo')
    page.click('#chat-form button[type="submit"]')
    page.wait_for_timeout(900)
    assert 'resposta cortada no limite' in page.locator('#chat-mensagens').inner_text(), 'aviso de corte'
    page.unroute('https://api.anthropic.com/**')

    # 19d) queda de rede vira mensagem em português, não erro cru
    page.route('https://api.anthropic.com/**', lambda r: r.abort('failed'))
    page.fill('#chat-texto', 'e agora?')
    page.click('#chat-form button[type="submit"]')
    page.wait_for_timeout(1200)
    assert 'Sem conexão com a internet' in page.locator('#chat-mensagens').inner_text(), 'erro de rede em português'
    page.unroute('https://api.anthropic.com/**')
    print('OK assistente | aviso de corte e erro de rede em português')

    # 20) Meu site — portfólio do Instagram
    page.goto(URL + '#/meusite')
    page.wait_for_timeout(500)
    page.fill('#form-portfolio [name="url"]', 'https://www.instagram.com/reel/ABC123xyz/?igsh=teste')
    page.fill('#form-portfolio [name="titulo"]', 'Reel de teste')
    page.click('#form-portfolio button[type="submit"]')
    page.wait_for_timeout(400)
    assert 'Reel de teste' in page.locator('#view').inner_text(), 'item adicionado'
    json_gerado = page.locator('#json-portfolio').input_value()
    assert 'https://www.instagram.com/reel/ABC123xyz/' in json_gerado, 'json contem o link limpo'
    assert '?igsh' not in json_gerado, 'json sem parametros de rastreio'
    # link inválido é recusado
    page.fill('#form-portfolio [name="url"]', 'https://youtube.com/watch?v=abc')
    page.click('#form-portfolio button[type="submit"]')
    page.wait_for_timeout(400)
    assert 'Cole um link de reel' in page.locator('#toast-root').inner_text(), 'valida link do instagram'
    print('OK meu site (portfólio)')

    browser.close()

if erros:
    print('\n--- ERROS DE CONSOLE/PÁGINA ---')
    for e in erros:
        print(e)
    raise SystemExit(1)
print('\nTODOS OS TESTES PASSARAM ✔')
