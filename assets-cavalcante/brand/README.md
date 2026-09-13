# Brand — Agência Cavalcante

Todos os arquivos aqui são **cópias** dos arquivos reais de produção
(originais em `app/img/`, `favicon.svg` na raiz do repo, e `og.png`).
Não renomeie/edite o original de produção a partir daqui — edite lá e
recopie.

## O que existe de fato

A marca da Agência Cavalcante tem **um único símbolo** (o cavalo, mesmo
path SVG em todas as variações abaixo) — não existe um logotipo com nome
escrito por extenso, nem uma versão "branca" como arquivo separado.

| Arquivo aqui | Origem real | Papel |
|---|---|---|
| `simbolo-cavalo.svg` | `app/img/logo.svg` | Símbolo do cavalo, `fill="currentColor"` — herda a cor do elemento pai; usado inline no site (nav, extrusão 3D). |
| `favicon.svg` | `favicon.svg` (raiz) | Mesmo símbolo, mas com cor fixa embutida via CSS: `#0a1421` no claro, `#ffffff` no escuro (`prefers-color-scheme`). Faz o papel de "logo principal adaptável". |
| `icone-pwa.svg` | `app/img/icone.svg` | Ícone de app (PWA), símbolo branco sobre fundo em gradiente azul, cantos arredondados. |
| `icone-pwa-maskable.svg` | `app/img/icone-maskable.svg` | Versão "maskable" do ícone (símbolo menor, sem cantos, para respeitar a área de segurança de ícones adaptativos). |
| `icone-pwa-192.png`, `icone-pwa-512.png`, `icone-pwa-maskable-512.png`, `icone-ios-180.png` | `app/img/icone-*.png` | Rasterizações do ícone acima, usadas em `app/manifest.json` e nas tags de `apple-touch-icon`. |
| `og-social-share.png` | `og.png` | Imagem exibida ao compartilhar o link do site (WhatsApp, redes sociais). **Não é um logo** — é uma imagem de compartilhamento social. |
| `fonts/InstrumentSans-Regular.ttf`, `fonts/InstrumentSans-Bold.ttf`, `fonts/InstrumentSans-OFL.txt` | `assets/fonts/` | Tipografia self-hosted usada no site (parte da identidade visual). |

## O que está faltando (não inventar, apenas confirmar)

- **`logo-principal.svg`** (logotipo com nome escrito) — não existe no
  repositório. Se a agência tiver uma versão assim, precisa ser fornecida.
- **`logo-branca.svg`** como arquivo separado — não existe; o efeito de
  "logo branca" já é resolvido dentro de `favicon.svg` via CSS
  (`prefers-color-scheme: dark`), e `simbolo-cavalo.svg` herda a cor via
  `currentColor`.
- **`brand-guide.pdf`** — não existe nenhum manual de marca no
  repositório.

Ver status `MISSING` para esses itens em `../ASSET_INVENTORY.md`.
