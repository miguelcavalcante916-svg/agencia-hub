
# Mapa atualizado de padrões do 21st.dev

A busca por `scroll storytelling 3d hero video reveal` revelou uma família de componentes diretamente alinhada ao briefing: **Video Scroll Hero**, **Scroll Morph Hero**, **Cinematic landing Hero**, **Hero Scroll Video Pin Reveal**, **Scroll media expansion hero**, **Container Scroll Animation**, **Horizon Hero Section**, **PrismaHero**, **3D Animation**, **Hero Scrub**, **Animated Shader Hero**, **Galaxy Interactive Hero Section**, **3D Hero Section Boxes**, **Animated Video on Scroll**, **Full Screen Scroll FX**, **Text Reveal**, **Zoom Parallax**, **Spatial Product Showcase**, **Hero Gallery Scroll Animation**, **Hero Shutter Text**, **CardStack**, **Motion Footer** e **3D Gallery Photography**.

## Decisão de adaptação

Para o hero Cavalcante, os padrões de Video Scroll Hero, Hero Scroll Video Pin Reveal, Scroll media expansion hero e Hero Scrub serão usados como referência para integrar showreel, poster frame, crop e progressão da mídia ao scroll, sem inventar um vídeo antes de o arquivo real ser fornecido.

Para a narrativa de página, Scroll Morph Hero, Container Scroll Animation, Full Screen Scroll FX, Text Reveal e Zoom Parallax orientarão entradas, saídas, máscaras, mudança de escala e tipografia cinética. O site continuará usando `IntersectionObserver`, `requestAnimationFrame` e CSS nativo quando suficiente, preservando o stack sem build.

Para o 3D e o campo da marca, 3D Animation, PrismaHero, Animated Shader Hero, Galaxy Interactive Hero Section e 3D Hero Section Boxes serão referências de profundidade, shader e objetos em camadas. A implementação da Cavalcante usará o símbolo oficial do cavalo e a paleta existente, não uma ilustração genérica.

Para cases e prova, Spatial Product Showcase, Hero Gallery Scroll Animation, 3D Gallery Photography e CardStack orientarão a apresentação de trabalhos como cenas e não como uma grade indiferenciada. Motion Footer será usado como referência para o fechamento editorial, com CTA real para WhatsApp.

A ordem de conversão será preservada: impacto, interesse, prova, confiança, entendimento, desejo e contato. O conteúdo enviado também exige placeholders explícitos para showreel, logos, métricas, cases e depoimentos quando esses materiais ainda não existem.

## Video Scroll Hero — estudo específico

O componente usa uma mídia inicialmente reduzida, em torno de 25% da escala, e faz a expansão progressiva até preencher o quadro enquanto o visitante rola. O vídeo permanece centralizado durante a transformação, criando uma primeira impressão cinematográfica. A página seguinte entra com uma seção sobreposta e conteúdo escalonado. Para a Cavalcante, a adaptação ideal é aplicar o mesmo princípio ao painel real/showreel: poster ou vídeo começa como elemento editorial integrado ao hero, cresce com o scroll e entrega o visitante ao capítulo de prova. O padrão pede mídia real fornecida pela agência; enquanto ela não existir, a estrutura deve permanecer preparada sem inventar um vídeo.

A página do componente informa dependência em Framer Motion, mas o projeto atual é sem build; portanto a adaptação deve preferir CSS transform, `requestAnimationFrame` e Intersection Observer, reduzindo risco de dependência e preservando performance.

## Taxonomia confirmada no 21st.dev

A busca do catálogo também confirma tags e famílias relevantes para este briefing: `Scroll Animation`, `Cinematic`, `Parallax`, `3D Hero`, `Scroll Trigger`, `Video Background`, `Typography`, `Text Animation`, `Shader Background`, `WebGL`, `Particle`, `3D Background`, `Hero Video Background`, `Agency`, `Gallery`, `Marquee`, `Editorial`, `Mockup`, `Showcase`, `Reveal`, `Morph`, `Pin`, `Clip Path`, `3D Gallery`, `3D Card`, `Horizontal Scroll`, `Progress Bar`, `Spotlight`, `Magnetic`, `Testimonials`, `Logo Cloud`, `Grid Background` e `Scroll Effect`.

Essa combinação reforça que a direção do site deve usar poucas cenas grandes, com mídia e tipografia no centro, em vez de aumentar a quantidade de cards. Os recursos serão aplicados somente quando resolverem um objetivo narrativo ou comercial do briefing.

## Scroll Morph Hero — estudo específico

O Scroll Morph Hero descreve uma transformação em três estados: uma composição inicialmente dispersa, uma convergência para uma forma circular e, depois, uma curva/forma guiada pela rolagem. Para a Cavalcante, esse padrão será traduzido em uma sequência própria: fragmentos de trabalho e sinais de produção convergindo para a marca oficial, seguido pelo crescimento do showreel/case e pela entrada no capítulo de prova. A referência é absorvida como lógica de transformação, não como cópia visual.

## Showcase espacial — busca específica

A busca por `spatial product showcase 3d gallery scroll` trouxe padrões especialmente úteis para cases: **Spatial Product Showcase**, **Container Scroll Animation**, **3D Parallax Unfurling Gallery**, **Animated Gallery**, **3D Gallery Photography**, **3D Image gallery**, **3D Carousel**, **Zoom Parallax**, **3d orbit gallery**, **Immersive Scroll Gallery**, **Project Showcase**, **Scroll media expansion hero**, **Portfolio Gallery**, **3D Coverflow Carousel**, **Kinetic Scroll Gallery**, **Infinite Drag + Scroll Gallery**, **Story scroll**, **Scroll Cards**, **Cinematic Product Scroll Section**, **3D Marquee**, **Arc Gallery Hero Component**, **ScrollTiltedGrid**, **Parallax Grid Scroll** e **Coverflow Carousel**.

Para a Cavalcante, a combinação mais adequada é a de `Spatial Product Showcase` com `Project Showcase`: uma peça real ocupa o foco; os demais trabalhos aparecem em uma lista/galeria espacial; ao passar ou rolar, a mídia muda e os dados do case entram por camadas. A estrutura de cada case deve reservar lugar para cliente, problema, estratégia, execução, resultado e métricas verificadas, sem fabricar números.
