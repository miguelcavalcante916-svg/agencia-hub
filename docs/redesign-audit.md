# Auditoria do redesign — `agencia-hub`

**Repositório correto:** [`miguelcavalcante916-svg/agencia-hub`](https://github.com/miguelcavalcante916-svg/agencia-hub)

## Arquitetura confirmada

| Superfície | Caminho | Tecnologia | Contratos protegidos |
|---|---|---|---|
| Site institucional | `/index.html` | HTML, CSS e JavaScript monolíticos, sem build | IDs de seção, links de WhatsApp, carregamento de `portfolio.json`, FAQ, canvas 3D e navegação por âncoras. |
| AgênciaHub | `/app/` | HTML, CSS e JavaScript modular, PWA | Rotas hash, `localStorage`, views, modais, kanban, calendários, propostas, portal, filtros e service worker. |
| Portal do cliente | `/portal/` | HTML, CSS e JavaScript | Autenticação, leitura de snapshot e fluxos de aprovação. |
| APIs | `/api/` | Funções serverless | Login, senha e publicação do portal. |

## Identidade visual existente

O site e o app já compartilham a mesma base cromática e essa paleta será preservada. Os tokens centrais são `#060C1C`, `#0A1730`, `#16255F`, `#1E3480`, `#4361EE`, `#5878FF`, `#8EA6FF`, branco e grafite `#08090E`. O app acrescenta cores semânticas para estado, prioridade e gráficos; elas serão mantidas por função, sem virar cores de marca.

As fontes atuais são **Urbanist** para títulos e **Lexend** para corpo e interface. Diferentemente do repositório anterior, este projeto não usa serifas como linguagem principal. O redesenho deve respeitar essa assinatura e alcançar sofisticação por escala, ritmo, composição, profundidade e motion.

## Site atual

O site publicado contém hero com ondas 3D e mockup do painel, faixa de serviços, serviços principais, portfólio do Instagram, protocolo em quatro marchas, portal do cliente, planos sem preço fixo, FAQ, ficha local, CTA e rodapé. A versão já possui movimento, mas as animações estão concentradas em fundos e revelações uniformes; cards, capítulos e hierarquia podem ganhar uma linguagem mais autoral.

## AgênciaHub atual

O app é funcional e denso, com sidebar permanente no desktop e módulos de visão geral, IA, clientes, projetos, tarefas, calendário, conteúdo, aprovações, propostas, tráfego, leads, financeiro, portal, meu site, equipamentos e equipe. O dashboard está organizado e legível, mas visualmente separado do caráter cinematográfico do site. O redesenho deve unificar acabamento sem reduzir densidade nem alterar os fluxos.

## Direção para o repositório correto

| Área | Direção proposta |
|---|---|
| Site | Reorganizar o hero e capítulos com tipografia cinética Urbanist, transições de scroll, previews reativos, timeline do protocolo e portfólio imersivo, mantendo conteúdos e seções atuais. |
| AgênciaHub | Elevar shell, sidebar, topbar, cards, gráficos, modais, kanban e microinterações; o motion será mais curto e funcional do que no site para preservar produtividade. |
| Coerência | Compartilhar easing, raios, bordas, glows, profundidade, estados de hover/foco e padrões de entrada, sem copiar o mesmo layout entre marketing e gestão. |
| Acessibilidade | Manter contraste, foco visível, navegação por teclado e `prefers-reduced-motion`; movimento nunca será necessário para compreender ou executar uma ação. |
| Desempenho | Priorizar transform e opacity, limitar blur animado, não adicionar frameworks nem dependências e preservar o deploy sem build. |

## Referências selecionadas

Os princípios já pesquisados no 21st.dev continuam úteis, mas serão adaptados à arquitetura estática: hero editorial, navegação compacta, lista interativa, timeline vertical, showcase de projetos, textura escura e rodapé com revelação. Nenhum componente React será copiado; os padrões serão reimplementados em CSS e JavaScript nativos.

## Baseline visual local

A versão local do site carregou todas as seções, âncoras, CTAs, portfólio, portal e rodapé; a atmosfera de grid, ondas e gradientes continua usando a escala marinho/azul original. A versão local do app carregou as 17 rotas na navegação, indicadores, gráfico mensal, prazos, compromissos e atalhos sem alterar os dados demonstrativos. O shell permanece com sidebar desktop, topbar fixa e dashboard em duas colunas.

A captura do navegador conectado adiciona marcações visuais próprias aos elementos clicáveis; por isso, as próximas capturas de QA serão feitas em navegador headless local para medir apenas o layout do repositório.

## Capturas desktop v1

O site institucional está visualmente aprovado nesta primeira rodada: a paleta original permanece intacta, o hero tem contraste forte, o novo spotlight não encobre conteúdo e o painel mockup continua como âncora de produto.

O dashboard do AgênciaHub mantém sidebar, topbar, indicadores, gráfico, prazos, compromissos e atalhos, porém a área principal aparece desfocada na captura headless mesmo após a espera da entrada. A hipótese inicial é conflito entre a nova animação de entrada e a regra de `filter`; será medido o estilo computado antes de decidir o ajuste.
A captura CDP com espera real confirmou o dashboard nítido: sidebar, topbar, tiles, gráfico, prazos, compromissos e atalhos estão legíveis e a nova atmosfera funciona sem reduzir contraste. O blur da primeira e segunda capturas era um artefato temporal do comando CLI, pois os estilos computados já indicavam `opacity: 1`, `filter: blur(0px)` e nenhuma exceção no console.

## Capturas mobile v1

O site mobile está aprovado na primeira dobra: menu reduzido, botão `Falar`, selo do portal, headline, descrição, CTA, nota de resposta e painel mockup cabem em 390 px sem overflow horizontal. O fundo e o glow continuam dentro da paleta oficial.

O dashboard mobile também está aprovado: a sidebar é substituída pelo menu da topbar, os quatro indicadores empilham com áreas de toque amplas e o gráfico mantém escala e legibilidade. A rolagem vertical é natural e não há corte horizontal no primeiro viewport.

## Kanban de projetos

O módulo de projetos está aprovado no desktop: quatro colunas visíveis, cabeçalhos, somas, badges, responsáveis, prazos e ação de novo projeto mantêm boa hierarquia. No mobile, o kanban usa rolagem horizontal intencional; a primeira coluna permanece íntegra e a próxima aparece como pista de continuidade. Nenhum cartão ou ação foi redimensionado de forma ilegível.

## Smoke test de navegação

A rota `#/projetos` renderizou o kanban completo e a troca pelo item `Visão geral` retornou ao dashboard via hash, preservando indicadores, dados de agenda, atalhos e contadores. Não houve erro de montagem nem perda de estado durante a navegação.

## `prefers-reduced-motion`

As capturas reduzidas confirmam que o site mobile mantém logo, hero, headline, descrição, CTAs e painel visíveis imediatamente, sem depender de WebGL, spotlight ou entradas escalonadas. O dashboard móvel mantém menu, quatro indicadores e gráfico plenamente visíveis sem motion. O fallback de acessibilidade está funcionando nas duas superfícies.

## Capítulo intermediário e clientes

O protocolo do site mantém a metáfora de quatro marchas com linha horizontal, headline forte e cards equilibrados; sem movimento, a ordem continua clara e o CTA flutuante não encobre conteúdo essencial.

O módulo de clientes mantém busca, segmentos, tabela, contatos, status, projetos e ações por linha com contraste suficiente. A nova camada de cartões/tabelas não alterou a densidade funcional do painel.

## Redesign estrutural v2

A nova captura desktop confirma a troca real de composição: o hero deixou de ser centralizado e passou a usar headline editorial de grande escala à esquerda, espaço negativo intencional à direita e o painel do AgênciaHub ancorado como prova visual. A navegação continua limpa e as cores oficiais permanecem inalteradas.

No mobile, o layout retorna de forma controlada para uma composição central, mantendo headline, descrição, CTAs, nota e painel dentro da largura útil. A mudança não é apenas de motion: tipografia, grid, ritmo de seções e destaque de portfólio/protocolo também foram reconfigurados por breakpoint.

## 21st.dev layout v3

A mini-navbar flutuante está funcionando no desktop e a seção de serviços ganhou composição editorial com índice vertical e quatro cartões horizontais. No mobile, o capítulo mantém o ritmo e a navegação, mas a headline de serviços quebra em uma palavra por linha; isso é visualmente excessivo e será corrigido ampliando a largura útil do título no breakpoint estreito.

## Correção final do breakpoint

A headline de serviços agora quebra em três linhas naturais no mobile (`Tudo que sua / marca precisa, / com um time só.`), eliminando a coluna estreita artificial. No desktop, a mini-navbar flutuante permanece equilibrada, o painel mockup continua ancorado à direita e o índice vertical de serviços funciona como assinatura editorial.

## Coreografia de scroll

As capturas em `scrollY=0` e `scrollY=1200` confirmam o novo comportamento: o hero e o painel têm deslocamentos de profundidade diferentes, a mini-navbar assume o formato compacto ao rolar e o título/índice de serviços chegam em uma transição contínua. A composição permanece estável, sem deslocamento horizontal ou perda de contraste.

## Scroll no AgênciaHub

A captura em rolagem do dashboard mantém todos os cards, gráfico, agenda, prazos e atalhos alinhados. O deslocamento aplicado é curto e independente do `transform`, então melhora a sensação de profundidade sem deslocar o conteúdo de trabalho nem interferir em ações críticas.

## Refinamento cinematográfico das referências

A primeira dobra mantém a presença da marca com headline e painel em camadas. Durante a rolagem, o capítulo de serviços permanece legível enquanto a navegação contextualiza o ponto da jornada; o portfólio entra como novo capítulo editorial, com foco progressivo e prova real preservada.

## Campo 3D do hero

A cena 3D agora é visível no hero com esfera sombreada, três anéis orbitais, cubo com seis faces e rótulo técnico discreto. No desktop, ela ocupa o espaço narrativo à direita e permanece atrás do painel do AgênciaHub; no mobile, reduz opacidade e escala para não disputar com a headline. A cena responde ao ponteiro em dois eixos, acompanha o scroll por profundidade e fica estática no modo de movimento reduzido.

## Logo oficial como núcleo 3D

A logo oficial Cavalcante substituiu o planeta no campo 3D do hero. No desktop, o emblema aparece em relevo no centro dos anéis, com sombra de extrusão, brilho diagonal e contorno em losango; no mobile, mantém proporção e contraste sem cobrir a headline ou o CTA. O desenho utilizado é o mesmo SVG oficial do cabeçalho e do rodapé.
