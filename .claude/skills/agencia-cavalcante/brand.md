# Marca — cor, tipografia, contraste

Tudo abaixo foi **medido na implementação real** (`index.html`, `app/css/styles.css`)
com a fórmula WCAG 2.1. Não são valores de memória. Não invente azuis novos.

## Paleta oficial

Toda a escala nasce do **`#16255F`**, o azul-marinho extraído da logo.

### Chãos

| Token | Hex | Uso |
|---|---|---|
| `--marinho-900` | `#060C1C` | chão da página |
| `--marinho-800` | `#0A1730` | faixa de seção |
| `--marinho-700` | `#16255F` | o navy da logo — blocos de destaque |
| `--marinho-600` | `#1E3480` | borda viva |

### Cartões — a inversão deliberada

| Token | Hex | Uso |
|---|---|---|
| `--grafite-900` | `#08090E` | cartão em repouso |
| `--grafite-800` | `#101219` | cartão no hover |

O cartão é **mais escuro que o fundo**: ele cava no marinho em vez de flutuar sobre ele,
e **clareia** no hover. Isso é assinatura do projeto — não "corrigir" para o padrão.

### Tintas e azuis

| Token | Valor |
|---|---|
| `--tinta` | `#ffffff` |
| `--tinta-2` | `rgba(255,255,255,.72)` |
| `--tinta-3` | `rgba(255,255,255,.60)` |
| `--azul` | `#4361EE` |
| `--azul-vivo` | `#5878FF` |
| `--azul-claro` | `#8EA6FF` |
| `--borda` | `rgba(255,255,255,.10)` |

## Contraste medido — tabela definitiva

Razões WCAG 2.1 de cada tinta sobre cada chão:

| | 900 `#060C1C` | 800 `#0A1730` | 700 `#16255F` | 600 `#1E3480` | graf-900 `#08090E` | graf-800 `#101219` |
|---|---|---|---|---|---|---|
| **branco** | 19,50 AAA | 17,82 AAA | 14,34 AAA | 11,30 AAA | 19,89 AAA | 18,71 AAA |
| **`#4361EE`** | 3,88 ✗ | 3,55 ✗ | 2,86 ✗ | 2,25 ✗ | 3,96 ✗ | 3,73 ✗ |
| **`#5878FF`** | 5,15 AA | 4,71 AA | 3,79 ✗ | 2,98 ✗ | 5,25 AA | 4,94 AA |
| **`#8EA6FF`** | 8,40 AAA | 7,68 AAA | 6,18 AA | 4,87 AA | 8,57 AAA | 8,06 AAA |

Derivados: `--tinta-2` = **10,14:1** · `--tinta-3` = **7,26:1** (ambos sobre `#060C1C`).
Branco **sobre** o preenchimento `#4361EE` = **5,02:1** · sobre `#16255F` = **14,34:1**.

## Regras de cor — confirmadas, não opinião

1. **`#4361EE` nunca é texto.** Reprova AA em todos os seis chãos (2,25–3,96:1) e
   reprova até o mínimo de 3:1 de texto grande nos dois marinhos claros. É **só
   preenchimento** — botão, barra, chip. Branco em cima dele passa (5,02:1).
2. **`#8EA6FF` é o azul de texto.** Único que passa AA em toda a escala. Em texto
   pequeno sobre `--marinho-600`, 4,87:1 é margem curta — prefira os chãos escuros.
3. **`#5878FF` é caso intermediário**: serve como texto sobre `900`, `800` e os dois
   grafites (4,71–5,25:1); **não** sobre `700` nem `600`. Na dúvida, use `#8EA6FF`.
4. **Títulos são branco puro.** 19,5:1 é assinatura, não exagero.
5. **Nenhum azul novo sem medir.** Ao propor uma cor, calcule a razão contra os seis
   chãos antes de escrever no CSS, e registre em `docs/DECISIONS.md`.

## Tipografia

| Papel | Fonte | Pesos |
|---|---|---|
| Títulos (`--fonte-titulo`) | **Urbanist** | 700, 800 |
| Corpo | **Lexend** | 400, 500, 600, 700 |

Carregamento (site, app, portal, privacidade — as quatro páginas):
`<link media="print" onload="this.media='all'">` + `display=swap` + fallback `<noscript>`,
com pilha completa `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial`.

Google Fonts é a **única exceção de terceiros** no CSP
(`style-src … fonts.googleapis.com; font-src 'self' fonts.gstatic.com`).

**Não trocar fonte por preferência estética.** Antes de qualquer troca: justifique o
porquê, verifique o custo de carregamento e registre em `docs/DECISIONS.md`. Há um
comentário no CSS indicando como migrar para Founders Grotesk (Klim, licença paga) — é
uma porta aberta, não uma pendência.

## Logo e cavalo

O cavalo é assinatura visual sofisticada: **estratégia, movimento, precisão, direção,
próxima jogada**. Conceitos disponíveis: *Knight Move*, *Next Move*, *Move Different* —
sem obrigação de uso literal.

Já foi tentado e **rejeitado pelo Miguel**: um ponto azul percorrendo o contorno de um
quadrado como se fosse o movimento em L (não comunicava nada, e o caminho medido era um
quadrado, não um L). Não repetir essa solução.
