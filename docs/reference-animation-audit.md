
# Direção de animação das referências

## Nfinite Paper

A experiência usa narrativa técnica por capítulos, com sensação de produto premium e progressão de descoberta. O movimento deve revelar camadas e dados no momento da rolagem, conectar diagramas a conceitos e alternar momentos de grande impacto com blocos de leitura objetiva. A referência sugere usar a rolagem como câmera editorial: elementos podem permanecer ancorados enquanto textos, linhas e objetos avançam em ritmos diferentes.

## Aether1

A experiência trabalha com uma abertura quase cinematográfica, navegação compacta e capítulos curtos de produto. A linguagem combina muito espaço negativo, tipografia grande e mensagens de poucas palavras com objetos que parecem existir em um palco escuro. Para a Cavalcante, isso se traduz em frases curtas em primeiro plano, cena 3D como protagonista, transições de seção por escala/opacidade e indicadores de progresso discretos.

## Alche Studio

A referência trata o site como uma galeria imersiva: trabalhos entram com grande presença visual, cada projeto tem contexto mínimo e o percurso alterna entre obra, missão e visão. A direção aplicável à Cavalcante é transformar o portfólio em cena principal, reduzir ruído em torno das peças e usar transições com mudança de escala, recorte e estado ativo em vez de uma sequência de cards iguais.

## Seasats

A referência comunica tecnologia complexa com frases curtas, atributos isolados e uma progressão clara de narrativa. A experiência combina hero de impacto, blocos de prova e módulos de características que entram de forma coordenada. Para a Cavalcante, isso sugere apresentar processo, portal e serviços como sistemas vivos — com números de etapa, módulos e indicadores que respondem ao scroll, sempre ancorados em conteúdo real.

## Direção comum para a Cavalcante

A nova versão deve funcionar como uma experiência de estúdio global: a primeira dobra apresenta uma única ideia forte; a rolagem vira uma câmera; cada capítulo tem um objeto 3D e uma composição própria; a tipografia assume escala de cartaz; o portfólio é tratado como obra; os textos aparecem em doses curtas; e a navegação informa a posição do visitante sem interromper a narrativa. A marca Cavalcante permanece reconhecível por suas cores, logo, linguagem e prova real do AgênciaHub.

## QA da primeira composição internacional

A primeira dobra desktop agora tem presença de estúdio: headline em escala de cartaz, campo 3D à direita, rail lateral, mini-navbar e régua de progresso. Porém, a captura em `scrollY=3500` revelou um vazio excessivo no capítulo do protocolo: os nós 3D permanecem visíveis, mas o texto e as marchas aparecem abaixo do quadro ou não entram com a densidade esperada. Antes de publicar essa rodada, o protocolo deve voltar a apresentar conteúdo dentro do viewport e manter o 3D como suporte, não como substituto da narrativa.

## QA final — correção necessária

A primeira dobra continua forte e coerente com a direção internacional. Entretanto, a captura do protocolo em `scrollY=3500` ainda mostra apenas a textura, a numeração `04` e os nós 3D, sem o título ou as quatro marchas. Isso indica que a composição de palco está empurrando ou escondendo o conteúdo em uma posição real de rolagem. A solução deve preservar o efeito de capítulo preso, mas garantir que o conteúdo principal fique no centro do viewport durante a passagem.

## QA da direção internacional corrigida

A abertura desktop mantém a presença de estúdio com headline em escala de cartaz, campo 3D, rail lateral e régua de progresso. O protocolo foi corrigido para usar o palco alto como contêiner e o conteúdo sticky como câmera: em `scrollY=3500`, título, descrição, primeiro cartão e nós 3D aparecem no viewport. O mobile mantém headline, CTA, painel real e ambientação 3D sem overflow; a intensidade é reduzida apenas na escala, não na qualidade da composição.
