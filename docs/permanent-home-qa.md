# QA da home cinematográfica permanente

## Work e Portal — desktop

A cena Work usa tipografia monumental e planos espaciais, mantendo impacto mesmo com `portfolio.json` vazio. A ausência de cases reais é comunicada com transparência e o Instagram permanece como destino de trabalho publicado. A cena Portal cria um corte claro na narrativa e usa a interface real do AgênciaHub dentro de um dispositivo em perspectiva; headline, navegação e CTA mantêm contraste adequado durante a mudança dark–light.

Pontos aprovados: nenhuma prova inventada; mídia conceitual não apresentada como case; estrutura fullscreen; interface real do produto; cabeçalho adaptado ao fundo claro; CTA do portal preservado.

## Knight Move e encerramento — desktop

O método agora funciona como trajetória em L com seis estados e uma única composição espacial. O passo ativo muda durante o scroll e o texto operacional acompanha a linha, sem cards. O encerramento recompõe o símbolo oficial atrás da headline monumental e mantém um CTA único no centro da cena. A navegação permanece funcional, porém deve continuar visualmente secundária ao atravessar a headline do encerramento.

Pontos aprovados: método proprietário; progressão legível; símbolo oficial no fechamento; CTA central; continuidade entre cenas; ausência de rodapé visualmente genérico.

## Work e Portal — mobile

Work mantém tipografia protagonista, planos espaciais e a indicação honesta de ausência de cases reais, sem overflow horizontal. O Portal utiliza a interface verdadeira do AgênciaHub e preserva o CTA. A captura intermediária mostra que a headline é parcialmente encoberta pela entrada do dispositivo; o comportamento é coerente com uma transição de takeover, mas precisa garantir que a frase completa seja lida em um estado anterior da cena.

## Knight Move e encerramento — mobile

A trajetória em L permanece compreensível no mobile e o texto do passo ativo ocupa uma faixa separada no rodapé da cena. O CTA final recompõe a marca, mantém a headline legível e oferece uma única ação principal, seguido por um rodapé compacto com os destinos institucionais.

Pontos aprovados: etapa ativa identificável; nenhum card empilhado; CTA com área de toque adequada; símbolo em segundo plano; footer legível; ausência de overflow.

## Nota sobre capturas de movimento reduzido

As capturas `permanent-reduced-portal.png` e `permanent-reduced-method.png` foram descartadas: o utilitário de screenshot não aplicou a emulação de `prefers-reduced-motion` e registrou a página com a altura e a coreografia normais. A validação correta foi executada pelo smoke test CDP dedicado, que confirmou `threeReady: false`, canvas oculto, ausência de overflow, todas as cenas presentes e zero erros de runtime no viewport móvel reduzido.
