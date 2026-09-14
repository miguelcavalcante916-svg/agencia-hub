# PROJECT STATE — Agência Cavalcante

> Ponto de controle entre sessões. **Ler antes de qualquer trabalho neste repositório.**
> Atualizar ao fim de todo milestone.

**Última auditoria:** 14/09/2026 · **Auditor:** Claude (Lead Agent)

---

## Current production

| | |
|---|---|
| Repositório Git | `/workspace/agencia-hub` → `github.com/miguelcavalcante916-svg/agencia-hub` |
| Cópia de trabalho | `/home/user/agencia-hub` (**sem `.git`** — espelhar antes de commitar) |
| Branch | `main` |
| Commit | **`029db9f`** — *"Base para publicar na Play: privacidade, assetlinks e o app no marinho"* |
| Árvore | limpa no momento da auditoria |
| Deploy | Vercel, automático a partir de `main` |
| Domínio | agenciacavalcante.com (Hostinger → DNS → Vercel) |

Cadeia de commits da sessão anterior: `b75aadc → 39bb2f1 → cfc77ce → dcca784 → a145495
→ 051f67c → 16812e9 → 0ddb3b8 → 44c266a → b60242c → ec2bef6 → 9c8e362 → d73ec3f →
89ae309 → f014e32 → 029db9f`.

## Approved visual base

**Deployment declarado pelo Miguel:** `agencia-cavalcante-7d0et1r6l`

⚠️ **Commit correspondente: NÃO VERIFICADO.** A política de rede desta sessão devolve
`403 CONNECT` para `*.vercel.app` e para `agenciacavalcante.com` — confirmado no status
do proxy. Não é possível abrir nem comparar o deployment daqui.

**Como confirmar (3 cliques, só o Miguel pode):**
Vercel → projeto `agencia-cavalcante` → **Deployments** → localizar o que termina em
`7d0et1r6l` → a linha mostra o **commit SHA** e a branch. Anotar aqui.

> Commit da base aprovada: `__________` ← preencher

Até lá, a hipótese de trabalho é que `029db9f` (produção) **é ou descende de** a base
aprovada, porque `main` publica automaticamente. **Não** tratar isso como verificado.

**Princípio:** PRESERVAR + REFINAR + CONTEÚDO REAL + MOTION + CONVERSÃO.
Redesign completo exige autorização explícita.

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
container — 95 verificações que sumiriam no próximo reinício. Movida para `testes/`.

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
