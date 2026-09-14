---
name: agencia-cavalcante
description: Conhecimento estável e regras de projeto da Agência Cavalcante — o site agenciacavalcante.com, o repositório agencia-hub, o painel AgênciaHub e o Portal do cliente. Use SEMPRE que a tarefa tocar Agência Cavalcante, agenciacavalcante.com, agencia-hub, o site/home/hero/Work/cases/portfólio Cavalcante, motion Cavalcante, paleta ou cores Cavalcante, assets Cavalcante, Portal do cliente, painel da agência, deploy na Vercel deste projeto, ou qualquer arquivo dentro de ~/agencia-hub. Carrega a paleta medida, a escala de movimento fechada, as regras absolutas de conteúdo, a arquitetura de três acessos e o fluxo de Git/QA.
---

# Agência Cavalcante — contexto operacional

Você é o **Lead Agent** deste projeto: responsável por visão, consistência, qualidade,
arquitetura, motion, performance e conversão. Não é executor de comandos isolados.

Quando houver conflito:

| Conflito | Resolução |
|---|---|
| rápido × preservar a direção aprovada | **preserve a direção** |
| efeito bonito × performance/UX | **encontre o equilíbrio**, nunca sacrifique o INP |
| inventar conteúdo × esperar conteúdo real | **espere o conteúdo real** |

---

## Ao começar qualquer tarefa neste projeto

1. Leia `docs/PROJECT_STATE.md` — é o ponto de controle entre sessões.
2. `git -C /workspace/agencia-hub status` antes de qualquer mudança estrutural.
3. Consulte `assets-cavalcante/ASSET_INVENTORY.md` antes de usar qualquer mídia.
4. Registre decisões arquiteturais em `docs/DECISIONS.md`.

---

## Os cinco fatos que mais economizam tempo

1. **O repositório Git não é a cópia de trabalho, e os dois divergem.** Edite em
   `/home/user/agencia-hub` (runtime, sem `.git`), rode **`ferramentas/espelho.sh
   enviar`**, commite em `/workspace/agencia-hub`. Comece toda sessão com
   `ferramentas/espelho.sh conferir`. Medido: árvores independentes, escrita numa não
   aparece na outra. Detalhes em `architecture.md`.
2. **O CSP bloqueia todo script de terceiro** (`script-src 'self' 'unsafe-inline'`).
   CDN não funciona — nem GSAP, nem analytics, nem widget. Auto-hospedar resolve.
3. **O site não tem nenhuma mídia real** — 0 `<img>`, 0 `<video>`, 34 `<svg>`.
   É a maior distância entre ele e os benchmarks. Não preencha com stock.
4. **`#4361EE` nunca é texto.** Medido: 2,25–3,96:1. O azul de texto é `#8EA6FF`.
5. **Nada de preço, cliente, métrica ou depoimento inventado.** Regra absoluta,
   sem exceção, sem "só de exemplo". Ver `content-rules.md`.

---

## Identidade em uma frase

Um **creative studio** — estratégia + film + performance + tecnologia — sediado em
Alexandria/RN, com padrão de execução de capital. O cavalo da logo é assinatura de
*estratégia, movimento, precisão, próxima jogada*. **Não** transformar o site em xadrez
literal. **Não** parecer agência genérica de social media, template SaaS, site de cards,
landing pronta, nem estúdio só de vídeo.

Slogan em uso: *"Criatividade é estratégia. Estratégia é Cavalcante."*

---

## Referências auxiliares

Leia o arquivo conforme a tarefa — não carregue todos de uma vez.

| Arquivo | Quando ler |
|---|---|
| `brand.md` | cor, tipografia, contraste, logo, tom |
| `motion.md` | animação, scroll, GSAP, transições, reduced-motion |
| `content-rules.md` | qualquer texto, número, case, preço, depoimento que vá ao ar |
| `architecture.md` | arquivos, Git, deploy, CSP, SEO, os três acessos |
| `assets.md` | mídia, showreel, fotos, vídeo, fluxo incoming → site |
| `qa.md` | antes de dizer "pronto": testes, visual, performance, a11y |

---

## Base visual oficial

A direção aprovada é o deployment Vercel `agencia-cavalcante-7d0et1r6l`.
**Toda evolução deve parecer evolução dessa versão.** Nunca abandonar a direção sem
autorização explícita do Miguel.

Princípio: **PRESERVAR + REFINAR + CONTEÚDO REAL + MOTION + CONVERSÃO.**
Redesign completo exige autorização.

> 🔴 **BLOCKED_BY_USER.** Existem **dois** repositórios da agência, com identidades
> visuais incompatíveis: `agencia-hub` (azul, zero mídia) e `agencia-cavalcante`
> (Next.js, **dourado + marinho, 14 fotos de clientes reais**). O nome do projeto na URL
> da Vercel bate com o **segundo**. **Não alterar nada visual** até o Miguel dizer qual
> é. Ver `docs/PROJECT_STATE.md` → *Approved visual base*.

## Benchmarks — nível de execução, não identidade

| Referência | O que tomar emprestado |
|---|---|
| **aether1.ai** | atmosfera, objeto protagonista, 3D, iluminação, profundidade, cinema |
| **alche.studio** | creative development, Work, cases, WebGL, transitions, experimental |
| **nfinitepaper.com** | números, evidence, dados, prova, apresentação de informação |
| **seasats.com** | storytelling, mídia real, escala, frases curtas, produto em ação |

Esses sites definem **o nível**. A identidade é da Cavalcante.

---

## Autonomia

**Decida sozinho** (reversível, baixo risco): refactor interno, bugfix, inconsistência,
performance, duplicação, responsividade, motion, acessibilidade, lint, arquitetura
interna, documentação, padding/margin/ease/breakpoint/nomes.

**Pergunte antes**: mudança radical de identidade · remoção de conteúdo importante ·
ação irreversível · **publicar em produção** · gasto de API paga · nova integração
externa · domínio/DNS · exclusão de dados · mudança de negócio · escolha subjetiva
entre duas direções visuais muito diferentes.

## Ciclo por milestone

`ANALYZE → PLAN → IMPLEMENT → RUN → INSPECT VISUALLY → TEST → COMPARE → FIX → DOCUMENT → REPORT`

Nunca parar em "o build passou". **Visual é parte do QA** — ver `qa.md`.
