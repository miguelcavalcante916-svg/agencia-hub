# DECISION LOG — Agência Cavalcante

Decisões arquiteturais e de direção. Uma entrada por decisão que custaria caro
redescobrir. Formato fixo: **DATA · DECISÃO · POR QUÊ · ALTERNATIVAS · IMPACTO ·
REVERSÍVEL?**

---

## 2026-09-14 · Skill permanente no repositório, não só no home do container

**DECISÃO** `agencia-cavalcante` vive em `agencia-hub/.claude/skills/`, versionada no
Git, e é espelhada para `/root/.claude/skills/` para uso imediato.
**POR QUÊ** Este ambiente é um container efêmero: `/root` é reciclado, o repositório
não. Skill em `/root` sumiria na próxima sessão — exatamente o problema que ela existe
para resolver.
**ALTERNATIVAS** Só em `/root` (some) · só em `.claude/` sem espelho (não carregaria
nesta sessão) · plugin marketplace (complexidade sem ganho).
**IMPACTO** Qualquer sessão futura que abra o repositório carrega o contexto sozinha.
**REVERSÍVEL?** Sim — apagar a pasta.

## 2026-09-14 · Suíte de testes movida do scratchpad para `testes/`

**DECISÃO** Os 8 arquivos Playwright passam a viver em `agencia-hub/testes/`, fora do
deploy via `.vercelignore`.
**POR QUÊ** Viviam no scratchpad efêmero. ~95 verificações — site, app, portal, login,
trava, CSP, fontes — sumiriam no próximo reinício do container. Regressão que ninguém
mede volta sempre.
**ALTERNATIVAS** Deixar no scratchpad (perda garantida) · reescrever a cada sessão
(desperdício) · repositório separado (fragmenta).
**IMPACTO** QA reproduzível entre sessões e entre máquinas.
**REVERSÍVEL?** Sim.

## 2026-09-14 · Biblioteca `assets-cavalcante/` criada vazia e honesta

**DECISÃO** Criar a estrutura descrita pelo Miguel (`brand/ clients/ logos-clientes/
showreel/ behind-the-scenes/ portal/ metrics/ incoming/` + `ASSET_INVENTORY.md`) com
inventário explicitamente vazio, fora do deploy.
**POR QUÊ** A pasta não existia no disco. Registrar na skill um caminho inexistente como
se fosse real levaria sessões futuras a alucinar assets.
**ALTERNATIVAS** Não criar e só documentar (o fluxo não teria onde acontecer) ·
criar com exemplos fictícios (**viola a regra de conteúdo**).
**IMPACTO** O fluxo `INCOMING → CLASSIFY → INVENTORY → CLIENT → OPTIMIZE → WEBSITE`
passa a ter endereço físico. Masters ficam fora da web.
**REVERSÍVEL?** Sim.

## 2026-09-14 · GSAP permitido, mas só auto-hospedado e só onde o CSS não chega

**DECISÃO** GSAP/ScrollTrigger pode entrar, servido de `/vendor/` no próprio domínio,
carregado sob demanda, nunca sob `prefers-reduced-motion`. Não substitui o motion
CSS-nativo existente.
**POR QUÊ** O CSP é `script-src 'self' 'unsafe-inline'` — CDN é bloqueado **em silêncio**
(já custou um embed do Instagram que teria quebrado em produção). Auto-hospedar torna o
arquivo `'self'` e legítimo. Mas `animation-timeline: view()` custa 0 KB e roda no
compositor: trocar por GSAP o que já funciona é perda pura de LCP.
**ALTERNATIVAS** Afrouxar o CSP para aceitar CDN (**rejeitado** — abre o site inteiro) ·
proibir GSAP (limita pin/scrub/timeline entre elementos) · adotar bundler (muda a pilha).
**IMPACTO** Caminho aberto para scrub, pin e coreografia de timeline sem furar a
segurança. Orçamento: ~110 KB core+ScrollTrigger; o bundle de 1,83 MB da alche.studio
não é aceitável aqui.
**REVERSÍVEL?** Sim.

## 2026-09-14 · Regras de contraste confirmadas por medição, não por memória

**DECISÃO** Registrar como definitivo: `#4361EE` **nunca** como texto (2,25–3,96:1 nos
seis chãos); `#8EA6FF` é o azul de texto (4,87–8,57:1); `#5878FF` serve como texto só
sobre `900`, `800` e os dois grafites.
**POR QUÊ** O Miguel pediu confirmação técnica antes de registrar. Calculado com a
fórmula WCAG 2.1 sobre a paleta real do `index.html` — `testes/wcag.py`.
**ALTERNATIVAS** Aceitar as razões dos comentários do CSS sem recalcular.
**IMPACTO** A regra deixa de ser convenção e passa a ser fato verificável. `#5878FF`
ganhou um uso preciso em vez de proibição genérica.
**REVERSÍVEL?** A medição, não. O uso, sim.

## 2026-09-14 · Trabalho em branch, nunca direto em `main`

**DECISÃO** Mudança estrutural vai para branch própria; `main` só recebe com aprovação
visual do Miguel.
**POR QUÊ** `main` publica sozinho na Vercel. Commit em `main` é publicação em produção —
e publicar é um dos itens da lista "perguntar antes".
**ALTERNATIVAS** Commitar em `main` e reverter se der errado (o público já teria visto).
**IMPACTO** Fluxo `branch → preview → QA → aprovação → produção`.
**REVERSÍVEL?** Sim.

---

## Decisões herdadas (sessões anteriores, registradas aqui para não se perderem)

| Data | Decisão | Motivo curto |
|---|---|---|
| 2026-09 | `overflow: clip` em vez de `hidden` nas seções | `hidden` cria scroll container e quebra `animation-timeline: view()` |
| 2026-09 | Entradas via `translate`/`scale`, não `transform` | deixa `transform` livre para o hover; animação vence declaração |
| 2026-09 | `:active` declarado **depois** de `:hover` | mesma especificidade — hover vencia e o CTA não dava feedback |
| 2026-09 | Trava do painel **falha abrindo** | ficar trancado fora do próprio sistema é pior que o risco coberto |
| 2026-09 | Cartões do Instagram próprios, sem `embed.js` | CSP bloquearia em silêncio; de quebra remove um rastreador |
| 2026-09 | `vercel.json` só com headers, sem rotas | `cleanUrls` + redirect `/app` causaria loop infinito e quebraria SW/manifest |
| 2026-09 | Portfólio vazio some do site **e do menu** | portfólio vazio visível é pior que ausente |
| 2026-09 | Escala de movimento fechada em 5 tempos | havia 19 tempos avulsos — é o que faz um site parecer montado por pedaços |
| 2026-09 | Ponto azul percorrendo quadrado **removido** | não comunicava "cavalo"; o caminho medido era quadrado, não L |
| 2026-09 | Sem seção de depoimentos | decisão do Miguel |
| 2026-09 | Pacotes sem valor em R$ | cada cliente recebe orçamento próprio |
