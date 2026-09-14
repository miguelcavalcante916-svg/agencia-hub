# PROJECT STATE — Agência Cavalcante

> Ponto de controle entre sessões. **Ler antes de qualquer trabalho neste repositório.**
> Atualizar ao fim de todo milestone.

**Última auditoria:** 14/09/2026 · **Auditor:** Claude (Lead Agent)

---

## Source of truth — definição normativa

```
SOURCE_OF_TRUTH_PATH  = /workspace/agencia-hub
GIT_REPOSITORY_PATH   = /workspace/agencia-hub          (contém .git + remote origin)
RUNTIME_WORKTREE_PATH = /home/user/agencia-hub          (SEM .git; onde se edita)
```

**Autoridade final:** `github.com/miguelcavalcante916-svg/agencia-hub`. É a única coisa
que sobrevive ao container ser reciclado. Os dois caminhos locais são efêmeros.

### Relação medida entre os dois caminhos

| Medição | Resultado |
|---|---|
| Mount / volume | **o mesmo** (`/dev/vda`, device id 65024) — não há mount separado |
| Inodes | **diferentes** (475147 × 15826946) |
| `.git` | só em `/workspace/agencia-hub` |
| Escrever num aparece no outro? | **NÃO** — testado empiricamente criando arquivo em `/home/user` e procurando em `/workspace` |
| Ligação | **cópia manual**, em nenhum sentido automático |

**São duas árvores independentes. Podem divergir, e divergiram** (10 arquivos no
momento desta auditoria).

### Por que a cópia existe
Os testes apontam para `file:///home/user/agencia-hub/...` por caminho absoluto, e o
`index.html` funciona de `file://`. O runtime é onde o navegador lê.

### Regra para TODAS as sessões futuras

1. **Editar** em `RUNTIME_WORKTREE_PATH`.
2. **Antes de commitar**, rodar `ferramentas/espelho.sh enviar`.
3. **Depois de `git pull`/`checkout`**, rodar `ferramentas/espelho.sh trazer`.
4. **Na dúvida**, rodar `ferramentas/espelho.sh conferir` — lista divergências sem
   escrever nada. Sai com código 1 se divergirem.

> **Pendente de decisão do Miguel:** consolidar os dois num só, trocando o runtime por
> um symlink para o repositório. Elimina a divergência de vez, mas exige apagar a cópia
> — passo destrutivo, não executado sem autorização. Ver `DECISIONS.md`.

## Current production

| | |
|---|---|
| Branch de trabalho | `claude/lead-agent-skill-e-docs` |
| Branch de produção | `main` — **publica sozinha na Vercel** |
| HEAD de produção | **`029db9f`** — *"Base para publicar na Play: privacidade, assetlinks e o app no marinho"* |
| Remote | `github.com/miguelcavalcante916-svg/agencia-hub` (público) |
| Projeto Vercel | `agencia-cavalcante` (segundo o README deste repo, linha 33) |
| Domínio | agenciacavalcante.com (Hostinger → DNS → Vercel) |
| Histórico | 52 commits, 18/08/2026 → 14/09/2026 |

## Approved visual base

**Deployment declarado pelo Miguel:** `agencia-cavalcante-7d0et1r6l`
**Status: 🔴 BLOCKED_BY_USER** — não foi possível provar o commit.

### Existem DOIS repositórios, não um

| | `agencia-hub` | `agencia-cavalcante` |
|---|---|---|
| Visibilidade | público | **privado** |
| Último push | 14/09/2026 | **07/06/2026** |
| HEAD | `029db9f` (main) | `bc31466` *"Pareamento final das URLs CT Fire"* |
| Pilha | HTML/CSS/JS puro, sem build | **Next.js 16 + React 19 + TS + Tailwind v4 + Framer Motion 12** |
| Paleta | azul `#4361EE` + marinho `#16255F` | **dourado `#c8a24a` + marinho `#0b1f3f`** |
| Mídia real | **0 imagens, 0 vídeos** | **14 fotos de clientes reais, 2,2 MB** |
| Segmentação | 0 menções | `niches-section.tsx` |
| Página Work | não tem | `/trabalhos` + `video-modal` + `works-grid` |
| Identidade cavalo | SVG solto | `chess-pattern`, `knight-motion-line`, `strategic-move-diagram` |

Clientes reais no `agencia-cavalcante`: **CT Fire** (9 fotos), **Black Suplementos**
(4), **Parque José Julião Diniz** (1).

### Por que isso trava a identificação

O nome do projeto Vercel na URL (`agencia-cavalcante`) é **idêntico ao nome do
repositório privado** — e a Vercel deriva o nome do projeto do repositório por padrão.
Mas o `README.md` do `agencia-hub`, linha 33, afirma que o projeto Vercel
`agencia-cavalcante` está ligado **a este repositório**.

Os dois não podem estar ligados ao mesmo projeto ao mesmo tempo. Ou o README está
desatualizado, ou o projeto foi religado em algum momento. **Em qualquer dos casos, o
deployment `7d0et1r6l` pode ter vindo de qualquer um dos dois** — e adivinhar seria
escolher entre duas identidades visuais incompatíveis.

### Teste de 5 segundos que resolve (só o Miguel pode)

Abrir a URL da base visual e responder **uma** pergunta:

> **O site é DOURADO + MARINHO com fotos de academia (CT Fire)?**
> - **SIM** → a base é o repositório **`agencia-cavalcante`** (Next.js). Todo o trabalho
>   de paleta/motion que documentei descreve o projeto errado.
> - **NÃO — é azul, sem fotos** → a base é o **`agencia-hub`**, e falta só descobrir qual
>   dos 51 commits de `main`.

Se for o `agencia-hub`: Vercel → projeto → *Deployments* → achar o que termina em
`7d0et1r6l` → a linha mostra o commit.

> Commit da base aprovada: `__________` ← preencher

### O que NÃO foi feito por causa deste bloqueio
Nenhuma alteração visual na homepage. Nenhuma mudança de paleta, motion, H1, pacotes,
FAQ ou seções. **STABILIZE FIRST.**

### Pista lateral do histórico do agencia-hub
O repositório **já teve** herói 3D em WebGL (`5826bea`) e a biblioteca Motion 13
auto-hospedada em `vendor/` (`9a562b3`). Ambos foram **removidos** em `d622d11`
(27/08, *"Site 136 KB mais leve"*). Se a base aprovada for uma dessas versões, o HEAD
atual não é refinamento dela — é uma simplificação deliberada dela.

## Asset state

| | |
|---|---|
| `assets-cavalcante/` | **criada nesta sessão** — estrutura completa, **todas as pastas vazias** |
| Mídia no site | **0 `<img>`, 0 `<video>`, 34 `<svg>`** |
| `portfolio.json` | `itens: []` — zero cases |
| `metrics/resultados-reais.md` | vazio — nenhuma métrica registrada |
| `og.png` | 428 KB (2400×1260) — pesado, candidato a otimização |

**Este é o maior gargalo do projeto.** Aether, Alche e Seasats são inteiramente movidos
a mídia real. Nenhum motion, nenhuma cor e nenhum copy compensam a ausência de material.
Enquanto não houver asset, o site continua honesto porém abstrato.

## Current architecture

Sem build, sem framework, **zero dependência npm** — inclusive nas serverless (só o
`crypto` do Node). Scripts clássicos em `window.AH`. Funciona de `file://` e de https.

```
index.html      108 KB · o site inteiro, CSS e JS inline · 9 seções
app/            596 KB · painel AgênciaHub · 17 telas + 3 core (store, trava, ui)
portal/          24 KB · porta do cliente
api/             36 KB · 5 funções: _portal-comum, portal/{entrar,publicar}, agencia/{entrar,senha}
testes/                 suíte Playwright — MOVIDA para cá nesta sessão
docs/                   este arquivo, ROADMAP.md, DECISIONS.md
assets-cavalcante/      biblioteca de masters (vazia)
proposta/               hero em Tailwind — fora do deploy (usa CDN, CSP bloqueia)
```

Seções do site: `inicio · servicos · portfolio · protocolo · portal-secao · pacotes ·
faq · ficha · contato`.

**Três acessos:** vitrine (pública) · `/portal/` (cliente, e-mail+senha) ·
`/app/` (agência, senha do painel). Auth real no servidor: scrypt + sal por usuário +
`timingSafeEqual` + token HMAC 30 dias + 5 tentativas/15 min.

**CSP:** `script-src 'self' 'unsafe-inline'` — nenhum script de terceiro. Google Fonts é
a única exceção (`style-src`/`font-src`).

## Motion architecture

CSS nativo, **zero biblioteca**. 16 usos de `animation-timeline: view()`, 14
`@keyframes`, `@supports` + classe `html.rolagem-fluida`. Custo 0 KB, roda no compositor.

Escala fechada: `90 / 240 / 380 / 760 / 950 ms` + 4 curvas. Um gesto por elemento.
`prefers-reduced-motion` redefine os cinco tokens para 1 ms e desliga o sistema inteiro.

Menções a GSAP/three/Lenis no código são **comentários** explicando por que não são
usados — não há biblioteca carregada.

## Known issues

**Conteúdo** (ordem de ataque recomendada 1 → 2 → 5 → 3 → 4):
1. H1 genérico — reprova no teste de 3 s; "Alexandria" não aparece no herói
2. Pacotes sem eixo — 3 caixas rígidas sob a promessa "sem pacote engessado"
3. Zero segmentação — supermercado/clínica/haras = **0 ocorrências**; vaquejada = 1
4. Serviços não são bento grid; a regra CSS `.servico p` existe **sem alvo no HTML**
5. FAQ com 10 perguntas e nenhuma sobre **prazo** ou **contrato** (0 ocorrências)

**Técnico:**
- Backend KV **não ligado** → os dois logins respondem `NAO_CONFIGURADO`
- Dados do painel em `localStorage` — **não sincronizam** entre aparelhos nem pessoas
- `.well-known/assetlinks.json` com SHA-256 **placeholder**
- `og.png` com 428 KB
- Sem mídia real em lugar nenhum

**Resolvido nesta sessão:** a suíte de testes vivia só no scratchpad efêmero do
container — 91 verificações (site 32, app 25, trava 9, portal 9, fontes 8, login 8,
mais o teste de CSP) que sumiriam no próximo reinício. Movida para
`testes/`, com `README.md` e as fixtures de fonte (`testes/fontes/`, 524 KB de woff2 do
npm — o sandbox não alcança o Google Fonts).

**Armadilha descoberta ao validar:** os testes que sobem servidor em porta fixa
(`teste_login` 8123, `teste_trava` 8144, `teste_csp`) **não podem rodar em paralelo** —
colidem com `Address already in use` e `goto` estourando, produzindo falha falsa. Uma
rodada concorrente marcou "1 falha" no `teste_site` que não existia: rodando limpo, ele
passa duas vezes seguidas. **Rodar um de cada vez.** Registrado em `testes/README.md`.

## Current priorities

1. Miguel confirmar o commit da base visual aprovada
2. Miguel ligar KV + `PORTAL_SEGREDO` + `PORTAL_CHAVE_ADMIN` na Vercel
3. Miguel enviar os primeiros assets reais para `assets-cavalcante/incoming/`
4. Claude: H1 e pacotes (maior ganho de conversão por esforço)

## Do not change

- **Paleta e as regras de contraste medidas** — `#4361EE` nunca como texto
- **Cartão mais escuro que o fundo** que clareia no hover — é assinatura, não defeito
- **Escala de movimento fechada** — 5 tempos, 4 curvas, nada fora disso
- **Trava do painel falha ABRINDO** — não converter para fail-closed
- **Portfólio vazio some do site e do menu** — comportamento correto
- **Pacotes sem valor em R$**
- **Sem seção de depoimentos** (decisão do Miguel)
- **Nome: Agência Cavalcante** (fechado)
- **Urbanist + Lexend** — não trocar por preferência estética
- **Zero script de terceiro**

## Pending user assets

| Item | Quem | Status |
|---|---|---|
| Commit da base visual aprovada | Miguel (Vercel) | ⬜ |
| KV + 2 variáveis de ambiente | Miguel (Vercel) | ⬜ |
| Fotos, vídeos, bastidores | Miguel | ⬜ |
| Cases reais para `portfolio.json` | Miguel | ⬜ |
| Métricas comprovadas + autorização | Miguel | ⬜ |
| SHA-256 do Play Console | Miguel | ⬜ |
| Laudos de nfinitepaper, aether1, seasats | Miguel (extensão Chrome) | ⬜ |

## Next milestones

Ver `ROADMAP.md`. Próximo bloco executável sem depender do Miguel:
**PHASE 1 — conversão** (H1, pacotes, FAQ, segmentação, bento dos serviços).
