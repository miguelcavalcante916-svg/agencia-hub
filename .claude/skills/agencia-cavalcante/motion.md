# Motion

**Princípio: SCROLL = TIMELINE.** Não "scroll = descer a página".
O site deve parecer vivo mesmo parado. Tudo sutil. Motion tem **peso, inércia,
aceleração, desaceleração e ritmo** — nunca é decoração.

## Escala fechada — nenhum valor fora desta lista

```css
--t-instante:  90ms;   /* pressão do dedo (:active) */
--t-rapido:   240ms;   /* hover, foco, seta */
--t-base:     380ms;   /* troca de estado: FAQ, menu, chevron */
--t-lento:    760ms;   /* revelação de bloco ao rolar */
--t-amb:      950ms;   /* régua que se desenha, linha que atravessa */

--e-sai:  cubic-bezier(.16, .84, .44, 1);   /* entradas longas */
--e-io:   cubic-bezier(.65, .05, .36, 1);   /* estado que sai E chega */
--e-snap: cubic-bezier(.2, .9, .3, 1.02);   /* ÚNICO overshoot: 2% */
--e-slot: cubic-bezier(.25, .46, .45, .94); /* easeOutQuad, hover/rótulo */
```

O arquivo já teve 19 tempos avulsos — é exatamente isso que faz um site parecer montado
por pedaços. **Se precisar de um tempo novo, o certo quase sempre é reusar um destes.**

**Regra: um gesto por elemento.** Nada faz duas coisas ao mesmo tempo.

## Arquitetura atual — CSS nativo, zero biblioteca

O motion roda em `animation-timeline: view()` (16 ocorrências) com `@supports` e a classe
`html.rolagem-fluida` adicionada por JS. 14 `@keyframes` nomeados. Custo: **0 KB**,
na thread do compositor.

### Armadilhas já pagas — não repetir

| Armadilha | Correção |
|---|---|
| `overflow: hidden` em `section.grade` | usar **`overflow: clip`** — `hidden` cria scroll container e `view()` passa a medir contra a seção |
| `transform: none` na regra fluida | usar as propriedades independentes **`translate` / `scale` / `rotate`**, deixando `transform` livre para o hover |
| `:active` declarado antes de `:hover` | **`:active` sempre depois** — mesma especificidade, hover vencia e o botão não dava feedback |
| réguas travadas em `scaleX(0)` sob reduced-motion | a regra de reduced-motion **não pode exigir** `.rolagem-fluida` (o JS não adiciona sob `reduce`) |
| opacidade uniforme no Protocolo preso | **animação vence declaração CSS** — desligar a animação de revelação em modo sticky |
| conic-gradient que não anima | exige `@property --giro { syntax: '<angle>' }` registrado |

### Os seis gestos em produção
Revelação de título palavra a palavra (máscara + 2° de rotação, cascata 62 ms) ·
holofote seguindo o ponteiro (1 listener, 1 variável CSS por frame) · luz percorrendo a
borda do cartão no hover · botão caça-níquel · marca-texto que se pinta · Protocolo
preso em `position: sticky` com régua de avanço.

## GSAP / ScrollTrigger — permitido, com condições

O Miguel pediu GSAP, ScrollTrigger, scrub, pin, mask, clip, parallax, depth e camera
choreography. **É possível**, e estas são as condições:

1. **Auto-hospedar, obrigatoriamente.** O CSP é `script-src 'self' 'unsafe-inline'`:
   CDN é bloqueado silenciosamente. Servir de `/vendor/gsap.min.js` vira `'self'` e
   funciona. Nunca adicionar CDN "só para testar".
2. **Não substituir o que já funciona.** `animation-timeline: view()` custa 0 KB e roda
   no compositor. GSAP entra onde o CSS genuinamente não chega:
   - coreografia de **timeline entre elementos diferentes**
   - **scrub** com easing próprio e velocidade não-linear
   - **pin** que precisa preservar layout (o `sticky` atual resolve o caso simples)
   - sequências que dependem de estado de JS
3. **Orçamento de peso.** GSAP core ≈ 70 KB min · ScrollTrigger ≈ 40 KB. Aceitável.
   O bundle de 1,83 MB da alche.studio **não** é aceitável — o site precisa do LCP.
4. **Carregar sob demanda**: `import()` dinâmico, só acima do breakpoint em que o efeito
   existe, e nunca sob `prefers-reduced-motion: reduce`.

**Framer Motion**: só microinteração, e só se algum dia houver React no projeto.
Hoje **não há build nem framework** — ver `architecture.md`. Não introduza um por causa
de animação.

### WebGL / three.js
Mesmas condições, mais duas: (a) **nunca** esconder conteúdo de crawler atrás de canvas
— ver SEO em `architecture.md`; (b) precisa de fallback estático e de gate por
capacidade do aparelho. Hoje **não há nenhum asset 3D** — não comece por aqui.

## O que NÃO fazer

- `fade-up` em tudo · `opacity + translateY` repetidos · animação de template
- efeito que atrapalha leitura, clique ou INP
- motion que depende de biblioteca para fazer o que uma linha de CSS faz

## Acessibilidade — obrigatório

`prefers-reduced-motion: reduce` redefine os cinco tokens para **1ms**, desligando o
sistema inteiro de uma vez, e neutraliza hover-transform, slot, marca-texto e luz de
borda. Toda animação nova **tem** de cair dentro desse mesmo mecanismo. Nunca deixar um
elemento invisível ou uma régua em `scaleX(0)` sob `reduce`.
