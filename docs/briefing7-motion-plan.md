# Briefing 7 — plano de motion

## Diagnóstico

A home já possui um canvas WebGL fixo com partículas derivadas da logo, um loop de `requestAnimationFrame`, seções sticky e variáveis de progresso. O problema principal não é ausência de efeitos, mas a falta de uma coreografia global com poucos estados claros, transições contínuas e resposta à velocidade do scroll.

## Execução escolhida

A implementação será incremental sobre a arquitetura atual e não adicionará novas seções. O loop existente continuará como fallback nativo; quando a CDN carregar, GSAP/ScrollTrigger controlará as quatro sequências maiores com `scrub` e callbacks leves, evitando duplicação de renderização.

| Sequência | Âncora | Função narrativa |
|---|---|---|
| Arrival → Think/Create/Scale | `#arrival` + `#expertise` | Aproximar/reorientar o cavalo, deslocar a headline por máscara e fazer as três palavras assumirem o palco. |
| Horse → Showreel | `#showreel` | Preparar o slot real do showreel e controlar uma máscara/escala contínua; sem mídia real, manter a cena oculta em produção. |
| Work / Cases | `#work` | Ativar a mídia real quando existir, usando progressão e resposta de velocidade; sem cases, manter o capítulo oculto. |
| Portal / No Black Box | `#portal` | Desmontar e recompor layers da interface com perspective/translateZ, destacando Projetos, Aprovações, Mídia e Resultados. |

## Regras de performance

O canvas permanece fixo e não interativo. O DPR é adaptativo, partículas são reduzidas em hardware fraco e o render para quando a aba fica oculta. A mídia real deve ser lazy, pausável fora do viewport e nunca ter áudio automático. Em `prefers-reduced-motion`, o scrub, as grandes rotações e o WebGL ficam desativados.

## Regras de conteúdo

Nenhuma métrica, logo, case, depoimento ou showreel será inventado. Slots vazios são ocultados em produção e ficam documentados no código como `SHOWREEL_DESKTOP`, `SHOWREEL_MOBILE` e `SHOWREEL_POSTER`.
