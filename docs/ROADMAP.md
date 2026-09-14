# ROADMAP — Agência Cavalcante

Fases ajustadas ao estado real auditado em 14/09/2026. A ordem respeita uma regra:
**o que não depende do Miguel vem primeiro.**

Legenda: ⬜ não começou · 🟨 em andamento · ✅ concluído · 🔒 bloqueado por terceiro

---

## PHASE 0 — Estabilizar ✅

Tornar o projeto sobrevivível entre sessões.

- ✅ Skill `agencia-cavalcante` versionada no repositório
- ✅ Suíte de testes resgatada do scratchpad efêmero para `testes/`
- ✅ `docs/PROJECT_STATE.md`, `ROADMAP.md`, `DECISIONS.md`
- ✅ Estrutura `assets-cavalcante/` com inventário honesto
- ✅ `docs/`, `testes/`, `assets-cavalcante/` fora do deploy
- ✅ Contraste da paleta confirmado por medição

## PHASE 1 — Conversão 🟨 ← **próximo bloco executável**

O maior ganho por esforço, e **não depende de nenhum asset**. Ordem: 1 → 2 → 5 → 3 → 4.

1. ⬜ **H1** que diga o quê, para quem e onde — hoje reprova no teste de 3 segundos
2. ⬜ **Pacotes**: trocar preço por **regime** (mensal × projeto fechado); duas opções
   em vez de três rígidas; alinhar com a promessa "sem pacote engessado"
3. ⬜ **FAQ**: responder as duas objeções duras — **prazo** e **contrato** (0 menções hoje)
4. ⬜ **Segmentação**: supermercado, clínica, haras, vaquejada — 0–1 menções hoje
5. ⬜ **Serviços em bento grid**, com a descrição que a regra órfã `.servico p` já espera
   (`index.html:434`, zero alvo no HTML)

**Entregue em branch + preview. Só vai a produção com aprovação visual do Miguel.**

## PHASE 2 — Backend vivo 🔒

Bloqueado: só o Miguel tem acesso ao painel da Vercel.

- 🔒 Storage → KV + `PORTAL_SEGREDO` + `PORTAL_CHAVE_ADMIN` + redeploy
- ⬜ Testar os dois logins ponta a ponta contra o KV real
- ⬜ Migrar os dados da agência de `localStorage` para o KV
  *(resolve de uma vez: multi-aparelho, colaboradores e a viabilidade de loja)*

## PHASE 3 — Assets reais 🔒

Bloqueado: nenhum material existe. **É o gargalo número 1 do projeto.**

- 🔒 Miguel envia material para `assets-cavalcante/incoming/`
- ⬜ Executar `CLASSIFY → INVENTORY → CLIENT → OPTIMIZE`
- ⬜ Derivados: AVIF/WebP, WebM+MP4+poster, `width`/`height` explícitos
- ⬜ Primeira mídia real no site (hoje: 0 `<img>`, 0 `<video>`)
- ⬜ Otimizar `og.png` (428 KB)

> Aether, Alche e Seasats são inteiramente movidos a mídia. Sem esta fase, nenhuma
> quantidade de motion aproxima o site desses benchmarks.

## PHASE 4 — Work / cases 🔒

Depende da PHASE 3.

- ⬜ 3–5 featured cases com mídia grande e comportamento cinematográfico
- ⬜ **Não** grid genérico, **não** cards, **não** masonry tradicional
- ⬜ Página `/work` própria para o acervo
- ⬜ Preencher `portfolio.json` (hoje `itens: []`)

## PHASE 5 — Motion cinematográfico ⬜

Só faz sentido depois que houver mídia para coreografar.

- ⬜ Avaliar GSAP auto-hospedado em `/vendor/` (ver `DECISIONS.md`)
- ⬜ Scrub, pin e timeline entre elementos onde o CSS não alcança
- ⬜ Idle motion, light drift, grain, parallax de ponteiro — **sutis**
- ⬜ Transições de página
- ⬜ Cada efeito com caminho de `reduced-motion` e orçamento de INP

## PHASE 6 — Evidence ⬜

- ⬜ Registrar métricas reais + autorização em `metrics/resultados-reais.md`
- ⬜ Bloco de números no nível de apresentação da nfinitepaper
- ⬜ **Prova, não promessa** — nada entra sem fonte verificável

## PHASE 7 — Portal como produto ⬜

- ⬜ Tratar o AgênciaHub como diferencial de venda: *marketing sem caixa-preta*
- ⬜ Mostrar interface **real** (projetos, aprovações, mídia, resultados), não mockup
- ⬜ Onboarding do primeiro cliente real

## PHASE 8 — Performance e mobile ⬜

- ⬜ Medir LCP, INP, CLS, FPS, CPU, GPU, memória com mídia já no site
- ⬜ Mobile como experiência adaptada, não desktop empilhado
- ⬜ Lazy loading, `import()` dinâmico, DPR adaptativo

## PHASE 9 — QA e release ⬜

- ⬜ Suíte completa verde + zero violação de CSP + 320–1380 px sem estouro
- ⬜ Teclado, foco, `alt`, contraste, `reduced-motion`
- ⬜ Preview aprovado pelo Miguel → merge em `main` → produção

---

## Fora de fase — quando o Miguel decidir

- Lojas: Play viável via TWA (US$ 25); Apple provavelmente reprova por Guideline 4.2.
  **Recomendação atual: não publicar** enquanto os dados não sincronizarem (PHASE 2).
- `.well-known/assetlinks.json` espera o SHA-256 do Play Console.
- Laudos técnicos de nfinitepaper, aether1 e seasats (o de alche.studio já foi feito).
