# Storyboard radical da nova home Cavalcante

**Autor:** Manus AI
**Modo:** Redesign · Overhaul visual com preservação funcional

## Design Read

```yaml
artifact: experiência institucional cinematográfica para agência criativa
audience: empresários e gestores que precisam de estratégia, audiovisual e performance
visual-language: estúdio criativo internacional, tecnológico, editorial e espacial
mode: overhaul
visual-variance: 10/10
motion-intensity: 9/10
information-density: 3/10
asset-dependence: 10/10
brand-fidelity: 10/10
```

A reconstrução deixa de tratar a página como uma sequência de seções e passa a tratá-la como **uma câmera atravessando nove cenas**. A Aether orienta o objeto protagonista, o silêncio visual e a iluminação; a Alche orienta os cases fullscreen e as transições contínuas; a Nfinite orienta a visualização de processo, dados e matéria; a Seasats orienta a clareza de verbos, mídia real e frases curtas.[1] [2] [3] [4]

## Decisão de sistema visual

| Dimensão | Decisão |
|---|---|
| **Conceito proprietário** | **The Next Move**: o movimento em L do cavalo representa estratégia, antecipação, direção e precisão. |
| **Paleta** | Preservar o azul-marinho, preto mineral, branco e azul de destaque já usados pela Cavalcante. Introduzir uma cena clara apenas como mudança narrativa, sem nova cor de marca. |
| **Tipografia** | Manter Urbanist/Lexend inicialmente para preservar carregamento e identidade; usar escalas de `clamp(64px, 10vw, 190px)` em desktop e composições específicas no mobile. |
| **Forma** | Predomínio de tela cheia, planos, máscaras e mídia. Reduzir fortemente bordas arredondadas, grids de cards e superfícies SaaS. |
| **Motion** | Scroll scrub, câmera, máscara, clip-path, deslocamento de planos, mudança de foco, inércia e continuidade. Fade-up será exceção, não linguagem principal. |
| **3D** | Cavalo oficial extrudado em WebGL quando suportado; fallback em wireframe/canvas/SVG para dispositivos fracos e movimento reduzido. |
| **Conversão** | CTA principal permanece sempre identificável, mas integrado à cena. WhatsApp continua sendo o destino comercial. |

## Contratos preservados

O redesign preservará os destinos de WhatsApp, Portal do Cliente, Instagram, `portfolio.json`, metadados, dados estruturados, acessibilidade, âncoras públicas e os fluxos do app. Os nomes visuais podem mudar para `WORK`, `EXPERTISE`, `ABOUT` e `START A PROJECT`, mas os IDs e destinos existentes serão mantidos como contratos técnicos.

## Storyboard — nove cenas

| Cena | O que aparece | O que se move | O que acontece no scroll | Mídia | Função comercial |
|---|---|---|---|---|---|
| **01 — Arrival / The Next Move** | Tela quase escura, microtipografia Cavalcante e cavalo 3D emergindo por luz. A primeira parte da headline aparece atrás do objeto. | Luz percorre o cavalo; partículas formam contornos; câmera respira poucos graus com o mouse. | A headline `SUA MARCA NÃO PRECISA DE MAIS CONTEÚDO` é revelada em planos; o objeto sai da sombra sem rotação decorativa infinita. | Cavalo 3D derivado da logo oficial. | Comunicar marca, movimento e competência nos primeiros três segundos. |
| **02 — Impossible to Ignore** | O cavalo cruza a composição em um movimento em L; a segunda frase entra à frente do objeto. | Tipografia atravessa planos de profundidade; grade de coordenadas marca o deslocamento. | A câmera se aproxima e muda de eixo; `PRECISA SER IMPOSSÍVEL DE IGNORAR` substitui a primeira mensagem por máscara. | 3D, partículas e tipografia. | Fixar a promessa e preparar o CTA principal. |
| **03 — Pensar / Criar / Escalar** | Uma única cena pinned apresenta três estados, nunca três cards. | O cavalo muda de pose/posição; roteiros e linhas entram em Pensar; frames e timeline em Criar; sinais e métricas em Escalar. | O scroll controla três atos dentro do mesmo viewport; o fundo muda de luz e velocidade. | Frames reais de produção quando fornecidos; abstrações de interface e linhas enquanto não houver mídia. | Explicar a proposta de valor de forma memorável e simples. |
| **04 — Horse to Showreel** | Um recorte aparece no corpo/sombra do cavalo e revela movimento audiovisual. | O recorte cresce; a tipografia se afasta; o cavalo se dissolve em máscara. | A janela de vídeo expande progressivamente até `100vw × 100vh`. | Showreel real de 15–30 s; poster otimizado. | Provar capacidade audiovisual antes de qualquer explicação longa. |
| **05 — Work / Cases** | Três cases reais em takeover fullscreen, um por vez. Cliente e objetivo entram primeiro; execução e resultado depois. | O próximo case cobre, desloca ou recorta o anterior; cursor muda para `VER`; vídeo reage ao hover no desktop. | Cada case permanece pinned e avança por estados; métricas aparecem apenas quando existirem dados reais. | Vídeo/imagem real do `portfolio.json` e materiais fornecidos. | Transformar trabalho em prova, gerar confiança e levar ao contato. |
| **06 — Evidence** | Cena clara e silenciosa com números reais, logos e uma frase curta. Elementos sem dado ficam ocultos. | Números contam apenas ao entrar; logos surgem e desaparecem em composição, sem logo wall em cards. | A mudança dark → light funciona como corte de filme e pausa de credibilidade. | Logos reais, métricas reais e depoimento real quando disponíveis. | Consolidar autoridade sem inventar resultados. |
| **07 — Portal / No Black Box** | Fundo retorna ao escuro; o Portal surge como produto digital desmontado em camadas, não como notebook. | Projetos, Aprovações, Mídia e Resultados ocupam planos de profundidade; um telefone entra lateralmente. | A interface muda de estado conforme o scroll e depois se recompõe em um produto completo. | UI real do Portal e do AgênciaHub. | Demonstrar estrutura, transparência, tecnologia e acompanhamento. |
| **08 — Method / Knight Move** | Grade de coordenadas e seis pontos: Diagnóstico, Estratégia, Produção, Distribuição, Otimização e Resultado. | O cavalo percorre um caminho em L; a linha conecta etapas; o texto aparece no ponto ativo. | A câmera segue o trajeto, sem seis cards estáticos. | Símbolo oficial, linha, microtipografia e pequenos frames de processo. | Reduzir risco percebido e explicar como o trabalho avança. |
| **09 — Start a Project** | O cavalo recompõe a marca; a tipografia final ocupa a tela: `SUA PRÓXIMA CAMPANHA PODE COMEÇAR AQUI.` | Camadas convergem para o símbolo; o CTA responde ao ponteiro e o cursor vira `↗`. | O último movimento desacelera e termina em uma tela quase estática, pronta para decisão. | Logo oficial e detalhe de um case/showreel. | Levar ao WhatsApp com origem identificada e mensagem preenchida. |

## Cinco interações assinatura obrigatórias

| Interação | Comportamento |
|---|---|
| **Cavalo-câmera** | O mesmo objeto atravessa as cenas 01–04 e muda por luz, foco, posição e escala. |
| **Knight Move Grid** | O movimento em L conecta Pensar, Criar, Escalar e reaparece no método. |
| **Horse-to-reel** | O cavalo/recorte se transforma em showreel fullscreen. |
| **Case takeover** | Projetos substituem uns aos outros sem tela vazia, usando máscara, stacking ou FLIP. |
| **Portal exploded view** | A interface real se desmonta em layers e se recompõe durante o scroll. |

## Experiência mobile específica

No mobile, o cavalo usará menor número de polígonos/partículas e poderá alternar para wireframe ou SVG animado. A headline será revelada em dois estados; o showreel continuará fullscreen; cases usarão takeover vertical ou swipe; a cena Pensar/Criar/Escalar continuará pinned, mas com distâncias menores. A navegação será reduzida a marca, menu e CTA. Parallax, blur e DPR serão limitados de acordo com capacidade, sem eliminar a personalidade.

## Estratégia técnica

A primeira implementação deve ser uma **v0 navegável das quatro primeiras cenas**, ainda com poster/placeholder honesto para o showreel. O cavalo será construído com Three.js apenas como melhoria progressiva, carregada após o conteúdo essencial e pausada fora do viewport. A animação principal usará um único loop de renderização, CSS variables e observers. GSAP/ScrollTrigger ou Lenis só serão adicionados se reduzirem complexidade real da coreografia; não serão usados como decoração.

## Assets necessários antes de produção

| Asset | Estado | Regra de publicação |
|---|---|---|
| **Showreel 15–30 s** | Pendente | O placeholder é permitido apenas na branch de preview; produção deve ocultar a cena ou receber o vídeo real. |
| **3 cases prioritários** | Parcialmente disponíveis no portfólio | Precisam de cliente, objetivo, execução, mídia e resultado verificável. |
| **Logos de clientes** | Pendente | A cena Evidence fica oculta se nenhum logo real for fornecido. |
| **Métricas** | Pendente | Campos sem dado real não aparecem em produção. |
| **Depoimentos** | Pendente | Nenhum depoimento será inventado. |
| **UI do portal** | Disponível no projeto | Pode ser usada imediatamente como mídia real. |
| **Logo Cavalcante** | Disponível | Fonte do cavalo 3D e do fallback. |

## Critério de aprovação da v0

A v0 será aprovada somente se, ao remover todos os textos explicativos, as quatro primeiras cenas ainda parecerem Cavalcante e comunicarem movimento, produção e tecnologia. O teste de reprovação é simples: se a página voltar a parecer `header + hero + cards`, a arquitetura deve ser refeita antes de continuar.

## References

[1]: https://aether1.ai/ "Aether 1 Earbuds"
[2]: https://alche.studio/ "Alche Studio"
[3]: https://nfinitepaper.com/#technology "Nfinite Ultra-High Barrier Paper"
[4]: https://www.seasats.com/ "Seasats — Ocean Autonomy That Works"
[5]: https://21st.dev/@isaiahbjork/components/video-scroll-hero "Video Scroll Hero — 21st.dev"
[6]: https://21st.dev/@prashantsom75/components/scroll-morph-hero "Scroll Morph Hero — 21st.dev"
