# Arquitetura

## Source of truth — normativo

```
SOURCE_OF_TRUTH_PATH  = /workspace/agencia-hub
GIT_REPOSITORY_PATH   = /workspace/agencia-hub      (tem .git + remote origin)
RUNTIME_WORKTREE_PATH = /home/user/agencia-hub      (SEM .git; onde se edita)
```

Autoridade final: `github.com/miguelcavalcante916-svg/agencia-hub`. É o único que
sobrevive ao container ser reciclado.

**Os dois caminhos locais são árvores INDEPENDENTES.** Medido: mesmo volume
(`/dev/vda`), inodes diferentes, sem mount compartilhado, e escrever num **não** aparece
no outro. A única ligação é cópia manual — e eles já divergiram.

| | `/home/user/agencia-hub` | `/workspace/agencia-hub` |
|---|---|---|
| Papel | runtime worktree — edite aqui | repositório — commite aqui |
| `.git` | não | **sim** |
| Por que existe | os testes apontam para `file:///home/user/agencia-hub/...` | é o que tem remote |

### Fluxo obrigatório

```bash
ferramentas/espelho.sh conferir   # lista divergências, não escreve (exit 1 se divergir)
ferramentas/espelho.sh enviar     # runtime -> git   (antes de commitar)
ferramentas/espelho.sh trazer     # git -> runtime   (depois de pull/checkout)
```

**Sempre `conferir` ao começar.** Nunca commitar sem `enviar` antes.

> Pendência: consolidar os dois num symlink elimina a divergência de vez, mas é passo
> destrutivo — só com autorização do Miguel.

### Um terceiro diretório, que NÃO é este projeto
`/home/user/agencia-cavalcante` — clone do repositório **privado**
`miguelcavalcante916-svg/agencia-cavalcante`: Next.js 16 + React 19 + Tailwind v4 +
Framer Motion, paleta **dourado `#c8a24a` + marinho `#0b1f3f`**, **14 fotos de clientes
reais**. Último push 07/06/2026. **Só leitura, não trabalhar nele** sem pedido explícito.
Pode ser a base visual aprovada — ver `docs/PROJECT_STATE.md` → *Approved visual base*.

## Pilha — sem build, sem framework

HTML/CSS/JS clássicos. Scripts no namespace `window.AH`. Dados do painel em
`localStorage['agenciahub:dados:v1']`. Funciona de `file://` e de https.
**Zero dependência npm**, inclusive nas funções serverless (só o `crypto` do Node).

Não introduzir bundler, framework ou npm sem decisão registrada em `docs/DECISIONS.md`.

## Mapa de arquivos

```
index.html          o site inteiro num arquivo (~108 KB)
app/                painel AgênciaHub — 17 telas em app/js/views/ + 3 core
portal/             porta de entrada do cliente (e-mail + senha)
api/                5 funções serverless, zero dependência
  _portal-comum.js    scrypt + HMAC + Vercel KV via fetch + rate limit
  portal/entrar.js  portal/publicar.js  agencia/entrar.js  agencia/senha.js
portfolio.json      itens: []  → seção some do site e do menu quando vazio
privacidade.html · robots.txt · sitemap.xml · og.png · favicon.svg
.well-known/assetlinks.json   (TWA, SHA-256 ainda placeholder)
vercel.json         só headers — nenhuma regra de rota
```

## Os três acessos

| Porta | Endereço | Quem | Autenticação |
|---|---|---|---|
| Vitrine | `agenciacavalcante.com` | público | aberta |
| Portal do cliente | `/portal/` | clientes | e-mail + senha (servidor) |
| Painel da agência | `/app/` | Miguel | senha do painel (servidor) |

Servidor: **scrypt** (N=16384, r=8, p=1, keylen=32) com sal por usuário,
`timingSafeEqual`, token **HMAC-SHA256** de 30 dias, bloqueio de 5 tentativas / 15 min.
E-mail desconhecido e senha errada devolvem a **mesma** mensagem.

**Regra de ouro da trava do painel (`app/js/core/trava.js`): na dúvida, ela ABRE.**
Servidor fora do ar, KV não configurado, sem internet, senha nunca definida → entra com
aviso na tela. Ficar trancado para fora do próprio sistema é pior que o risco coberto.
**Não "consertar" isso para fail-closed.**

Pendência do Miguel: ligar Storage → KV na Vercel + as variáveis `PORTAL_SEGREDO` e
`PORTAL_CHAVE_ADMIN`, e redeploy. Sem isso os dois logins respondem `NAO_CONFIGURADO`.

**Limite conhecido**: os dados da agência vivem no `localStorage` do aparelho — não
sincronizam entre dispositivos nem entre pessoas. É o que bloqueia colaboradores e o que
torna a publicação em loja pouco defensável hoje. Movê-los para o KV é o passo que
resolve as três coisas.

## CSP e segurança

```
default-src 'self'; base-uri 'self'; object-src 'none'; frame-src 'none';
frame-ancestors 'none'; form-action 'self';
script-src 'self' 'unsafe-inline';
style-src  'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src   'self' https://fonts.gstatic.com;
img-src    'self' data: blob: https:;
connect-src 'self' https://api.anthropic.com;
manifest-src 'self'; worker-src 'self'; upgrade-insecure-requests
```

Mais: `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`,
`COOP`, `HSTS`. `/app/` e `/portal/` com `noindex`; `/api/` com `no-store`.

**Consequências práticas:**
- Nenhum script de CDN funciona. Falha **silenciosa** — nada no visual denuncia.
  (Já custou um embed do Instagram que teria quebrado em produção.)
- Para usar uma biblioteca: **auto-hospedar** e servir do próprio domínio.
- Antes de qualquer analytics, CDN, widget ou terceiro: verificar CSP, privacidade,
  necessidade e impacto — nessa ordem. Preferir não adicionar.

**A chave da API Anthropic nunca entra em arquivo do repositório.** Ela vive apenas no
`localStorage` do navegador do Miguel.

## SEO — não sacrificar pelo visual

Já implementado: `<title>` e `meta description` com Alexandria/RN · `canonical` ·
OpenGraph completo (2400×1260) · `twitter:card` · JSON-LD · `sitemap.xml` · `robots.txt` ·
`lang="pt-BR"` · um único `<h1>`.

Preservar sempre. **WebGL ou canvas nunca pode esconder a informação do crawler** — o
conteúdo tem de existir em HTML semântico.

## Git — fluxo obrigatório

```
branch  →  preview  →  QA  →  aprovação do Miguel  →  produção
```

- `git status` antes de qualquer mudança estrutural.
- **Nunca sobrescrever trabalho não commitado.**
- Mudança estrutural importante ganha **branch própria**.
- **Nunca publicar em produção enquanto o Miguel estiver avaliando visualmente.**
  `main` publica sozinho na Vercel — por isso trabalho em andamento vai para branch.
- Nenhuma operação destrutiva sem necessidade real.

Rodapé obrigatório do commit:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Q8sdXQkyQLvm9bW6PLhaHa
```

Nunca escrever identificador de modelo em mensagem de commit, PR, comentário de código
ou qualquer artefato versionado além dessas duas linhas.

## Limite de rede deste ambiente

A política de rede libera **github.com, npm, PyPI e api.anthropic.com** e bloqueia o
resto com `403 CONNECT`. **`agenciacavalcante.com` e as previews da Vercel são
inalcançáveis** daqui — verificado.

Para inspeção visual: servir local (`python3 -m http.server`) e usar Playwright com
`executable_path='/opt/pw-browsers/chromium'`. Para ver o que está **no ar**, depender do
Miguel (extensão do Chrome ou screenshot). Nunca afirmar ter visto a produção.
