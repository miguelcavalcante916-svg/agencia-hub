# Asset Inventory — Agência Cavalcante

Inventário central de todos os assets da biblioteca `assets-cavalcante/`.
Gerado a partir de uma auditoria real do repositório `agencia-hub`
(site em produção `agenciacavalcante.com`) em **2026-09-13**.

Fontes usadas para confirmar cada associação cliente/uso (nunca por
suposição):
- `project-catalog.json` (raiz do `agencia-hub`) — mapeia cada capa a um
  cliente, título, categoria e link do post.
- `app/manifest.json` — mapeia os ícones PWA.
- `grep` por caminhos de asset em `index.html`, `site-scene.js`,
  `legacy-home.html`, `cinematic-v0.html`, `app/index.html`,
  `portal/index.html`.

Status permitidos: `READY`, `REVIEW`, `CLASSIFY`, `MISSING`, `DO_NOT_USE`.

## Brand

| Asset | Cliente | Tipo | Caminho (nesta biblioteca) | Caminho original (produção) | Uso sugerido | Status |
|---|---|---|---|---|---|---|
| simbolo-cavalo.svg | Agência Cavalcante | Logo/Símbolo | `brand/simbolo-cavalo.svg` | `app/img/logo.svg` | Símbolo inline (nav, extrusão 3D), `currentColor` | READY |
| favicon.svg | Agência Cavalcante | Ícone | `brand/favicon.svg` | `favicon.svg` (raiz) | Favicon do navegador; já adapta cor claro/escuro via CSS | READY |
| icone-pwa.svg | Agência Cavalcante | Ícone app | `brand/icone-pwa.svg` | `app/img/icone.svg` | Ícone PWA "any" (fundo gradiente, cantos arredondados) | READY |
| icone-pwa-maskable.svg | Agência Cavalcante | Ícone app | `brand/icone-pwa-maskable.svg` | `app/img/icone-maskable.svg` | Ícone PWA "maskable" (área de segurança) | READY |
| icone-pwa-192.png | Agência Cavalcante | Ícone app | `brand/icone-pwa-192.png` | `app/img/icone-192.png` | `app/manifest.json` → ícone 192×192 | READY |
| icone-pwa-512.png | Agência Cavalcante | Ícone app | `brand/icone-pwa-512.png` | `app/img/icone-512.png` | `app/manifest.json` → ícone 512×512 | READY |
| icone-pwa-maskable-512.png | Agência Cavalcante | Ícone app | `brand/icone-pwa-maskable-512.png` | `app/img/icone-maskable-512.png` | `app/manifest.json` → ícone maskable 512×512 | READY |
| icone-ios-180.png | Agência Cavalcante | Ícone app | `brand/icone-ios-180.png` | `app/img/icone-ios-180.png` | `apple-touch-icon` (iOS) | READY |
| og-social-share.png | Agência Cavalcante | Imagem social | `brand/og-social-share.png` | `og.png` | `og:image` — preview ao compartilhar o link | READY |
| InstrumentSans-Regular.ttf | Agência Cavalcante | Fonte | `brand/fonts/InstrumentSans-Regular.ttf` | `assets/fonts/InstrumentSans-Regular.ttf` | Tipografia do site (self-hosted) | READY |
| InstrumentSans-Bold.ttf | Agência Cavalcante | Fonte | `brand/fonts/InstrumentSans-Bold.ttf` | `assets/fonts/InstrumentSans-Bold.ttf` | Tipografia do site (self-hosted) | READY |
| InstrumentSans-OFL.txt | Agência Cavalcante | Licença | `brand/fonts/InstrumentSans-OFL.txt` | `assets/fonts/InstrumentSans-OFL.txt` | Licença da fonte (Open Font License) | READY |
| logo-principal.svg (logotipo com nome escrito) | Agência Cavalcante | Logo | — | — | Não existe no repositório | MISSING |
| logo-branca.svg (arquivo separado) | Agência Cavalcante | Logo | — | — | Efeito já resolvido via CSS em `favicon.svg`; não existe como arquivo à parte | MISSING |
| brand-guide.pdf | Agência Cavalcante | Documento | — | — | Nenhum manual de marca encontrado | MISSING |

## CT Fire (`clients/ct-fire/`)

| Asset | Cliente | Tipo | Caminho | Uso sugerido | Status |
|---|---|---|---|---|---|
| ct-fire-summer.jpg | CT Fire | Foto (capa de post) | `clients/ct-fire/ct-fire-summer.jpg` | Capa/hero do case (`destaque: true`) | READY |
| ct-fire-danca.jpg | CT Fire | Foto (capa de post) | `clients/ct-fire/ct-fire-danca.jpg` | Galeria secundária | READY |
| ct-fire-cross-kids.jpg | CT Fire | Foto (capa de post) | `clients/ct-fire/ct-fire-cross-kids.jpg` | Galeria secundária | READY |
| ct-fire-step.jpg | CT Fire | Foto (capa de post) | `clients/ct-fire/ct-fire-step.jpg` | Galeria secundária | READY |
| ct-fire-mudar-de-nivel.jpg | CT Fire | Foto (capa de post) | `clients/ct-fire/ct-fire-mudar-de-nivel.jpg` | Galeria secundária | READY |
| ct-fire-permanencia.jpg | CT Fire | Foto (capa de post) | `clients/ct-fire/ct-fire-permanencia.jpg` | Galeria secundária | READY |
| ct-fire-continuar.jpg | CT Fire | Foto (capa de post) | `clients/ct-fire/ct-fire-continuar.jpg` | Galeria secundária | READY |
| ct-fire-quem-vive.jpg | CT Fire | Foto (capa de post) | `clients/ct-fire/ct-fire-quem-vive.jpg` | Galeria secundária | READY |
| ct-fire-evoluir.jpg | CT Fire | Foto (capa de post) | `clients/ct-fire/ct-fire-evoluir.jpg` | Galeria secundária | READY |
| logo.svg/png | CT Fire | Logo | — | Logo do cliente para `logos-clientes/` e marquee | MISSING |
| video-01.mp4 (e demais) | CT Fire | Vídeo | — | Vídeos originais só existem como posts no Instagram (ver `info.md`) | MISSING |
| bastidor-01.jpg/mp4 | CT Fire | Bastidor | — | Nenhum bastidor encontrado | MISSING |

## Black Suplementos (`clients/black-suplementos/`)

| Asset | Cliente | Tipo | Caminho | Uso sugerido | Status |
|---|---|---|---|---|---|
| black-suplemento-certo.jpg | Black Suplementos | Foto (capa de post) | `clients/black-suplementos/black-suplemento-certo.jpg` | Capa/hero do case (`destaque: true`) | READY |
| black-comenta-resultado.jpg | Black Suplementos | Foto (capa de post) | `clients/black-suplementos/black-comenta-resultado.jpg` | Galeria secundária | READY |
| black-comenta-objetivo.jpg | Black Suplementos | Foto (capa de post) | `clients/black-suplementos/black-comenta-objetivo.jpg` | Galeria secundária | READY |
| black-falta-energia.jpg | Black Suplementos | Foto (capa de post) | `clients/black-suplementos/black-falta-energia.jpg` | Galeria secundária | READY |
| logo.svg/png | Black Suplementos | Logo | — | Logo do cliente para `logos-clientes/` e marquee | MISSING |
| video-01.mp4 (e demais) | Black Suplementos | Vídeo | — | Vídeos originais só existem como posts no Instagram (ver `info.md`) | MISSING |
| bastidor-01.jpg/mp4 | Black Suplementos | Bastidor | — | Nenhum bastidor encontrado | MISSING |

## Parque José Julião Diniz (`clients/parque-jose-juliao-diniz/`)

| Asset | Cliente | Tipo | Caminho | Uso sugerido | Status |
|---|---|---|---|---|---|
| parque-jose-juliao-diniz-lancamento.jpg | Parque José Julião Diniz | Foto (capa de post) | `clients/parque-jose-juliao-diniz/parque-jose-juliao-diniz-lancamento.jpg` | Capa/hero do case (`destaque: true`) | READY |
| logo.svg/png | Parque José Julião Diniz | Logo | — | Logo do cliente para `logos-clientes/` e marquee | MISSING |
| video-01.mp4 | Parque José Julião Diniz | Vídeo | — | Vídeo original só existe como post no Instagram (ver `info.md`) | MISSING |
| bastidor-01.jpg/mp4 | Parque José Julião Diniz | Bastidor | — | Nenhum bastidor encontrado | MISSING |

## Logos dos clientes (`logos-clientes/`)

| Asset | Cliente | Tipo | Caminho | Uso sugerido | Status |
|---|---|---|---|---|---|
| — | CT Fire / Black Suplementos / Parque José Julião Diniz | Logo | — | Marquee / social proof | MISSING (nenhum logo de cliente encontrado) |

## Showreel (`showreel/`)

| Asset | Cliente | Tipo | Caminho | Uso sugerido | Status |
|---|---|---|---|---|---|
| — | — | Vídeo | — | Showreel geral da agência | MISSING (nenhum arquivo de vídeo no repositório) |

## Behind the Scenes (`behind-the-scenes/`)

| Asset | Cliente | Tipo | Caminho | Uso sugerido | Status |
|---|---|---|---|---|---|
| — | — | Foto/Vídeo | — | Bastidores gerais da agência | MISSING (nenhum bastidor no repositório) |

## Portal (`portal/`)

| Asset | Cliente | Tipo | Caminho | Uso sugerido | Status |
|---|---|---|---|---|---|
| — | — | Screenshot | — | Telas do AgênciaHub/Portal | MISSING (nenhum screenshot no repositório) |

## Incoming (`incoming/`)

| Asset | Cliente | Tipo | Caminho | Uso sugerido | Status |
|---|---|---|---|---|---|
| — | ? | — | — | — | Vazio — ver observações abaixo |

## Arquivos duplicados encontrados (não é erro, é intencional)

| Arquivo | Duplicata de | Motivo |
|---|---|---|
| `favicon.svg` (raiz do `agencia-hub`) | `app/img/favicon.svg` | Idênticos byte a byte (MD5 igual); mantidos em dois escopos do site (raiz do domínio e escopo `/app`) para o navegador resolver `/favicon.ico`-like em ambos os contextos. Nesta biblioteca só copiamos um (`brand/favicon.svg`), já que o conteúdo é idêntico. |

## Arquivos fora deste repositório, não auditados (precisam da sua confirmação)

Estes locais **não foram abertos nem movidos** porque não há confirmação
de que pertencem a este projeto ou a qual cliente/uso corresponderiam.
Se algum contiver assets reais da Cavalcante, adicione-os a `incoming/`
manualmente e eu registro aqui:

- `~/Downloads/agencia-cavalcante-main.zip`
- `~/Downloads/Teleprompter_Agencia_Cavalcante.html`
- `~/Movies/CARROSSEIS-CAVALCANTE-PROMPTS.md`
- Screenshots de `~/Desktop` datados de ago–set/2026 (podem ou não ser do
  portal/hub — não confirmado)
- O repositório irmão `~/agencia-cavalcante` (Next.js) está vazio de
  assets reais — contém só os ícones padrão do create-next-app
  (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`), que
  **não são assets de marca da Cavalcante** e foram deixados de fora
  desta biblioteca.

## Resumo numérico

- Assets reais copiados (READY): **26** (12 de marca + 14 de clientes)
- Clientes identificados com assets reais: **3** (CT Fire, Black
  Suplementos, Parque José Julião Diniz)
- Itens em `/incoming` (a classificar): **0**
- Itens `MISSING` relevantes: logo por cliente (3), vídeo local por
  cliente (3), bastidor por cliente (3), logo-principal/logo-branca/
  brand-guide (3), showreel geral, bastidores gerais e screenshots do
  portal (3 categorias inteiras vazias), métricas verificadas (todas)
