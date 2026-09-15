# Final public polish QA

Data: 2026-09-15  
Branch: `codex/final-public-polish`

## Arquitetura entregue

1. Arrival
2. The System
3. Selected Work
4. No Black Box
5. Knight Move
6. Start a Project

`Showreel` e `Evidence` permanecem fora da homepage. A numeração é calculada em tempo de execução a partir das cenas habilitadas.

## Conteúdo e interface

- Selected Work contém três cases com imagens e destinos verificados no acervo existente.
- AgênciaHub apresenta Projects, Approvals, Media e Results e identifica a composição como interface demonstrativa.
- O método usa Diagnóstico, Direção, Produção, Distribuição e Acompanhamento; Resultado aparece como consequência final.
- Ícones usam uma família única de SVG inline com traço de `1.75`.

## Movimento e desempenho

- GSAP/ScrollTrigger controla DOM e scroll; Three.js controla apenas a cena global.
- Mobile, `save-data`, WebGL indisponível, hardware limitado e `prefers-reduced-motion` usam SVG e fluxo sequencial.
- Todos os loops possuem encerramento ou suspensão em `pagehide`, visibilidade ou ausência de cena ativa.
- Perfil local, Chrome, 1440 × 844, WebGL ativo: LCP 84 ms, CLS 0, INP 40 ms, 60 fps, p95 de frame 16,8 ms, heap JS usado 4,2 MB.
- JavaScript carregado no modo completo: 907.200 bytes decodificados. O módulo Three.js não é carregado no fallback.

## Verificações

- `node automation-tests/validate-final-polish.mjs`: 19/19 PASS.
- Sintaxe: `site.js`, `site-motion.js` e `site-scene.js` PASS.
- Console após rolagem completa: sem erros ou avisos.
- Overflow: 0 px em 320, 360, 375, 390, 430, 768 e 1440 px.
- Movimento reduzido: seis cenas em ordem, três fases e três cases visíveis, canvas desativado, seis nós do método ativos e overflow 0.
- Impeccable: nenhum alerta de contraste, texto funcional pequeno ou tipografia excessivamente comprimida. Os avisos restantes correspondem aos palcos recortados, às quatro camadas do Hub, à numeração pedida e à grade funcional do método.

## Ativos ainda não disponíveis

- showreel final;
- métricas comerciais aprovadas;
- logos de clientes com autorização de uso;
- capturas reais do AgênciaHub;
- bastidores de produção.

Esses ativos não foram simulados nem inventados nesta entrega.
