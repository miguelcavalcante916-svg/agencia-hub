# Comparação dos briefings

Os briefings 4 e 5 são idênticos. O briefing 6 não pede uma nova arquitetura: ele redefine a fase como refinamento de conteúdo, motion, continuidade, profundidade e acabamento sobre a home permanente existente.

## Mudanças que passam a ser obrigatórias

| Tema | Regra final |
|---|---|
| Arquitetura | Preservar a home atual e não adicionar novas seções. |
| Produção | Nunca expor `pendente`, `placeholder`, `aguardando conteúdo`, `cases entram aqui` ou instruções internas. Se faltar mídia real, ocultar o componente. |
| Cenas | Corrigir a numeração para uma sequência coerente; a cena do método deve comunicar Pensar/Criar/Escalar sem saltos confusos. |
| Hero | A headline atual é preservada; o cavalo deve ganhar movimento controlado, câmera, profundidade e função narrativa. |
| Showreel | O componente deve estar pronto para `SHOWREEL_DESKTOP`, `SHOWREEL_MOBILE` e `SHOWREEL_POSTER`, mas ficar oculto em produção enquanto o vídeo real não existir. |
| Work | Preparar três cases fullscreen, mas ocultar cases incompletos e não inventar conteúdo. |
| Evidence | Mostrar apenas números reais; ocultar a cena enquanto não houver dados verificáveis. |
| Portal | Usar interface real ou retrato seguro dela, em layers, como produto tecnológico. |
| Motion | Preferir transformação, máscara, escala, profundidade, câmera, scrub, inércia e continuidade; evitar uma sequência de fades iguais. |
| Mobile | Criar adaptação específica, com menos partículas, menor DPR, menos blur e scroll cinematográfico preservado. |
| Deploy | Trabalhar em branch/preview e só promover depois de QA completo. |

## Decisões para esta rodada

1. Remover da home pública a linguagem de visual study/showreel temporário; a cena reel será ocultada até existir vídeo real.
2. Manter `cinematic-v0.html` e `legacy-home.html` apenas como artefatos de rollback/preview, fora da navegação e sem indexação.
3. Corrigir os labels da narrativa para que o percurso seja legível em ordem, sem `Scene 01 → Scene 03`.
4. Não criar métricas, logos, cases ou depoimentos; os blocos condicionais continuarão invisíveis sem fonte real.
5. Concentrar o restante da implementação em continuidade entre o cavalo, o método e o Portal, além de polish de transições e responsividade.
