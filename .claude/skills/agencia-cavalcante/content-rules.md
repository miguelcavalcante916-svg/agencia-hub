# Regras de conteúdo — absolutas

Estas regras não têm exceção, nem "só de exemplo", nem "provisório até chegar o real".

## NUNCA inventar

clientes · resultados · métricas · depoimentos · campanhas · números · prêmios ·
parceiros · **preços**.

- Dado que não existe: **não mostrar**.
- Asset que não existe: **não fingir que existe**.
- Estrutura que pede prova social sem prova disponível: **projetar o estado vazio
  honesto**, não preencher com ficção.

## Nunca exibir em produção

`PLACEHOLDER` · `MÍDIA PENDENTE` · `INSERIR AQUI` · `AGUARDANDO CONTEÚDO` · `TODO` ·
`TEMP` · lorem ipsum · instrução interna de qualquer tipo.

Se o bloco não tem conteúdo real, ou ele sai do ar ou vira um estado vazio que faz
sentido para o visitante. Exemplo já aprovado: o portfólio com `itens: []` some do site
**e do menu**, e no lugar entra um convite honesto ao Instagram.

## Preços

Cada cliente recebe orçamento próprio. **A seção de pacotes não mostra valores em R$.**
Ela descreve escopo e regime (mensal × projeto fechado), nunca número.

## Tópicos fechados — não reabrir sem o Miguel pedir

- **Depoimentos**: decidido que não haverá seção de depoimentos.
- **Nome**: é **Agência Cavalcante**. Não sugerir alternativa.

## Evidence — prova, não promessa

Fonte única: `assets-cavalcante/metrics/resultados-reais.md`.
Métrica comprovada, use. Métrica inexistente, não inventar e não estimar.
Referência de apresentação de números: **nfinitepaper.com** — mas o número tem de ser
verdadeiro antes de ser bonito.

## Conversão — o objetivo final

O visitante precisa, nesta ordem:
1. sentir impacto · 2. entender a Cavalcante · 3. ver trabalho real ·
4. perceber competência · 5. ganhar confiança · 6. **iniciar contato**.

Design experimental não pode prejudicar o negócio. O **CTA principal permanece claro**.
**WhatsApp (5584999492725) é canal importante** — não enterrar.

## Dados fixos da agência

| | |
|---|---|
| Nome | Agência Cavalcante |
| Cidade | **Alexandria/RN** (Alto Oeste potiguar) — diferencial, não vergonha |
| WhatsApp | 5584999492725 |
| Instagram | @cavalcante.media |
| Domínio | agenciacavalcante.com (Hostinger → DNS → Vercel) |
| Idioma | **pt-BR em tudo**: site, app, documentação e respostas ao Miguel |

Serviços: estratégia · marketing · produção audiovisual · social media · tráfego pago ·
branding · design · motion · campanhas · sites · tecnologia · performance.

## Pendências de conteúdo já diagnosticadas

Ordem recomendada de ataque: **1 → 2 → 5 → 3 → 4**.
O H1 e os pacotes sozinhos mexem mais em conversão que todo o motion do site.

1. **H1 genérico** — *"Sua marca merece mais que apenas aparecer"* reprova no teste de
   3 segundos: não diz o quê, para quem, nem onde. "Alexandria" não aparece em lugar
   nenhum que o olho leia no herói.
2. **Pacotes sem eixo** — "Essencial / Profissional / Premium", duas caixas dizendo
   "Sob medida", e um subtítulo prometendo "sem pacote engessado" acima de três caixas
   rígidas. Proposta: trocar preço por **regime**, duas opções em vez de três.
3. **Zero segmentação** — "supermercado", "clínica", "haras" aparecem **0 vezes**;
   "vaquejada" aparece 1. Sem segmento, o visitante não se reconhece.
4. **Serviços não são bento grid** — quatro cartões idênticos com um slogan cada. A
   regra CSS `.servico p` existe **sem alvo no HTML**.
5. **FAQ com 10 perguntas** e nenhuma responde as duas objeções mais duras:
   "prazo" e "contrato" aparecem **0 vezes**.

## Work / cases

Tratar o Work como parte central da experiência. **Não** usar grid genérico, cards nem
masonry tradicional como padrão. Featured cases com mídia grande e comportamento
cinematográfico. Preferência: **3–5 cases fortes**; o resto numa página Work própria.

Estado atual: `portfolio.json` tem `itens: []` — **zero cases**. Enquanto for assim, a
escada de credibilidade já implementada (0 / 1–2 / 3+ itens) mantém a seção honesta.
