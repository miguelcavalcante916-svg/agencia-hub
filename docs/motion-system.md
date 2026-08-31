# Sistema visual e de motion — AgenciaHub

## Princípio

O site e o AgênciaHub devem parecer parte da mesma marca, não cópias um do outro. O site usa movimento como narrativa: entrada de capítulos, profundidade, ondas, máscara, parallax e showcase. O painel usa movimento como orientação: troca de view, confirmação de ação, crescimento de métricas, hover, foco, drag-and-drop e abertura de modal.

## Paleta preservada

| Token | Valor | Uso |
|---|---|---|
| Marinho profundo | `#060C1C` | Fundo principal. |
| Marinho | `#0A1730` | Faixas, header e superfícies. |
| Navy da marca | `#16255F` | Cards elevados e destaque institucional. |
| Navy vivo | `#1E3480` | Bordas e estados ativos. |
| Azul principal | `#4361EE` | CTA, progresso, links e ação primária. |
| Azul vivo | `#5878FF` | Gráficos, foco visual e hover. |
| Azul claro | `#8EA6FF` | Texto de apoio com contraste. |
| Branco/grafite | `#FFFFFF` / `#08090E` | Hierarquia de texto e profundidade. |

Nenhuma cor de marca será substituída. Cores semânticas do app — verde, vermelho, amarelo, roxo, rosa e ciano — permanecem restritas aos estados de dados já existentes.

## Site institucional

O site manterá as seções, IDs e integrações atuais. A atualização será feita com CSS/JavaScript nativos: grid e scanline ambientais, spotlight que acompanha ponteiro, hero com tilt leve, headline escalonada, linhas de seção desenhadas, cards com profundidade, portfólio com entrada por cascata, protocolo com progressão no scroll, FAQ com expansão mais física, CTA final com brilho e cursor magnético sutil.

## AgênciaHub

O app manterá todos os módulos, hash routes, `localStorage`, PWA, modais, formulários, drag-and-drop, gráficos e portal. A camada compartilhada terá: transição de view com stagger, sidebar com indicador deslizante, cards com highlight, tiles de dashboard com entrada escalonada, barras e gráficos com crescimento, tabelas com hover/foco, kanban com estados de arraste e modais com backdrop/escala.

## Guardrails

O motion será implementado principalmente com `transform`, `opacity`, `filter` limitado e propriedades de composição. Todas as superfícies respeitarão `prefers-reduced-motion: reduce`. O site não dependerá de hover para conteúdo, e o app não esconderá ações essenciais por hover. A implantação continuará sem build e sem novas dependências.

## Referências de layout utilizadas

| Área | Padrão de referência | Aplicação no `agencia-hub` |
|---|---|---|
| Hero | [Editorial Collage Hero](https://21st.dev/@felipemenezes098/components/hero-04) | Composição assimétrica: narrativa e CTA à esquerda, mockup real do AgênciaHub como prova à direita. |
| Navegação | [Mini Navbar](https://21st.dev/@aghasisahakyan1/components/mini-navbar) | Header compacto e flutuante após o primeiro scroll, preservando logo, âncoras e CTA. |
| Serviços | [Interactive Accordion](https://21st.dev/@jatin-yadav05/components/interactive-accordion) | Índice numerado, cartões com foco e expansão visual sem esconder os quatro serviços reais. |
| Processo | [How It Works Timeline](https://21st.dev/@7ovr/components/how-it-works-2) | Linha de quatro marchas com sequência, offsets editoriais e versão linear no mobile. |
| Portfólio | [Project Showcase](https://21st.dev/@jatin-yadav05/components/project-showcase) | Primeiro trabalho com maior presença e demais entradas em composição compacta, mantendo o fallback do Instagram. |
| Fechamento | [Motion Footer](https://21st.dev/@easemize/components/motion-footer) | CTA tipográfico, faixa contínua e assinatura de marca sem importar GSAP ou aurora genérica. |
| Fundo | [Elegant Dark Pattern](https://21st.dev/@jatin-yadav05/components/elegant-dark-pattern) | Grid, scanline e profundidade reaproveitados em CSS nativo, com marinho e azul oficiais. |
