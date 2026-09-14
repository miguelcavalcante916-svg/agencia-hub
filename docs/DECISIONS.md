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
**POR QUÊ** Viviam no scratchpad efêmero. 91 verificações — site, app, portal, login,
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

## 2026-09-14 · Fixtures de fonte versionadas junto com a suíte

**DECISÃO** `testes/fontes/` guarda 524 KB de woff2 do npm (`@fontsource-variable/
urbanist` e `lexend`), versionados, fora do deploy. Somado: `testes/README.md` com a
regra de execução sequencial.
**POR QUÊ** Ao validar o resgate da suíte, `teste_fontes_mobile` quebrou com
`FileNotFoundError` — eu tinha movido os `.py` e deixado as fixtures no scratchpad. Um
teste que não roda é pior que nenhum: dá falsa sensação de cobertura. O sandbox não
alcança o Google Fonts, então baixar em tempo de execução não é opção.
**ALTERNATIVAS** Baixar do npm a cada execução (a rede libera npm, mas deixa o teste
lento e dependente de rede) · apagar o teste (perde a verificação de tipografia mobile).
**IMPACTO** +524 KB no repositório; a suíte passa a ser autocontida.
**REVERSÍVEL?** Sim.

## 2026-09-14 · Testes com servidor em porta fixa rodam em série, nunca em paralelo

**DECISÃO** Regra documentada em `testes/README.md`: um teste de cada vez.
**POR QUÊ** Duas rodadas simultâneas produziram uma **falha falsa** no `teste_site` e
`OSError: Address already in use` no `teste_trava`. Rodando limpo e sozinho, `teste_site`
passa duas vezes seguidas. Falha falsa é pior que falha: custa tempo perseguindo um bug
que não existe, e ensina a ignorar o vermelho.
**ALTERNATIVAS** Porta dinâmica por execução (correção melhor, mas mexe em 3 arquivos de
teste — fica para quando a suíte for tocada de novo).
**IMPACTO** QA confiável.
**REVERSÍVEL?** Sim.

## 2026-09-14 · Source of truth definida: o repositório Git, não a cópia de trabalho

**DECISÃO**
```
SOURCE_OF_TRUTH_PATH  = /workspace/agencia-hub
GIT_REPOSITORY_PATH   = /workspace/agencia-hub
RUNTIME_WORKTREE_PATH = /home/user/agencia-hub
```
Autoridade final: `github.com/miguelcavalcante916-svg/agencia-hub`.
Criada `ferramentas/espelho.sh` com `conferir` / `enviar` / `trazer`.
**POR QUÊ** Medido: mesmo volume (`/dev/vda`), **inodes diferentes**, sem mount
compartilhado, e escrita num caminho **não** aparece no outro (testado empiricamente).
São duas árvores independentes ligadas só por cópia manual — e já estavam divergindo em
10 arquivos. Só o repositório tem `.git` e remote, ou seja, só ele sobrevive ao container.
**ALTERNATIVAS** Eleger o runtime como fonte (não tem `.git`, morre com o container) ·
symlink do runtime para o repositório (elimina a divergência de vez, **mas exige apagar
a cópia — passo destrutivo**, não executado; aguarda autorização) · `git worktree`
(continuaria sendo dois diretórios).
**IMPACTO** Divergência deixa de ser invisível: `espelho.sh conferir` sai com código 1 e
lista os arquivos.
**REVERSÍVEL?** Sim — nada foi apagado.

## 2026-09-14 · Base visual: BLOCKED_BY_USER, porque existem dois repositórios

**DECISÃO** Não identificar o commit da base visual por dedução. Marcar
**BLOCKED_BY_USER** e não tocar em nada visual até o Miguel confirmar.
**POR QUÊ** O deployment é `agencia-cavalcante-7d0et1r6l`. Existe um **segundo
repositório**, `miguelcavalcante916-svg/agencia-cavalcante` (privado, último push
07/06/2026): Next.js 16 + React 19 + Tailwind v4 + Framer Motion, paleta **dourado
`#c8a24a` + marinho `#0b1f3f`**, **14 fotos de clientes reais** (CT Fire, Black
Suplementos, Parque José Julião Diniz), seção de nichos, página `/trabalhos`,
`chess-pattern`, `knight-motion-line`, `strategic-move-diagram`.

O nome do projeto na URL da Vercel é **idêntico ao nome desse repositório** — e a Vercel
deriva o nome do projeto do repositório por padrão. Mas o `README.md` do `agencia-hub`
(linha 33) afirma que o projeto Vercel `agencia-cavalcante` está ligado a **este**
repositório. Os dois não podem estar ligados ao mesmo projeto ao mesmo tempo.

Escolher errado significaria trabalhar sobre a identidade visual errada: azul sem mídia
× dourado com 14 fotos reais. Não é detalhe recuperável.
**ALTERNATIVAS** Assumir o `agencia-hub` porque é onde estamos trabalhando (risco de
descartar a base aprovada) · assumir o Next.js porque o nome bate (risco de jogar fora
todo o trabalho de agosto e setembro).
**IMPACTO** Nenhuma alteração visual até a confirmação. O teste que resolve leva 5
segundos: abrir a URL e ver se é dourado com fotos ou azul sem fotos.
**REVERSÍVEL?** O bloqueio, sim. A escolha errada, muito caro.

## 2026-09-14 · Duas instabilidades de teste corrigidas no arnês, não no produto

**DECISÃO** (a) Os três servidores de teste passam de `TCPServer` para
`ThreadingTCPServer` + `daemon_threads`. (b) Em `teste_site`, dois `wait_for_timeout`
fixos viram `wait_for_function` sobre a condição real.
**POR QUÊ** Cada uma foi medida antes de ser tocada:
- `teste_login` passava 6 de 8 e morria: o Chromium abandona a conexão no meio da
  resposta ao navegar, o servidor single-thread não sobrevive ao `BrokenPipeError`, e o
  contexto seguinte estoura em `Page.goto`. Agora **8/8**.
- `sequência das marchas: [4,4,4,4]`: sob carga, o `requestAnimationFrame` do palco
  passa dos 320 ms fixos e a leitura pegava o estado anterior. A lógica do produto
  (`index.html:1816-1838`) foi lida e está correta. Agora espera o **driver**
  (`--avanco`) alcançar a rolagem e só então lê o **resultado** (`data-ativa`) —
  a asserção segue honesta. **3/3 estável.**
- `pressão no CTA: matrix(1,0,0,1,0,-1)`: instrumentei 5 tentativas — `:active=True`,
  alvo `A.btn btn-azul` e `anim=0` em **todas**; só o `transform` ainda não tinha andado
  em uma delas. A transição dura 90 ms mas **começa** depois dos 160 ms fixos sob carga.
  Agora espera as transições do botão assentarem antes de ler.
**ALTERNATIVAS** Aumentar os tempos fixos (empurra o problema) · remover as checagens
(perde cobertura real) · mexer no CSS do produto (**seria consertar o termômetro**).
**IMPACTO** Nenhuma mudança de comportamento do produto. Zero linha de `index.html`
tocada.
**REVERSÍVEL?** Sim.
