# Biblioteca de Assets — Agência Cavalcante

Esta pasta é a biblioteca central e padronizada de assets visuais da Agência
Cavalcante: identidade de marca, clientes, logos, showreel, bastidores,
portal e métricas reais. O objetivo é que **qualquer pessoa ou agente/IA**
consiga abrir [`ASSET_INVENTORY.md`](./ASSET_INVENTORY.md) e entender
imediatamente o que existe, de quem é, onde está, para que serve, o que está
pronto para uso e o que ainda falta — sem precisar adivinhar nada.

## Origem dos arquivos

Todos os arquivos reais aqui dentro são **cópias** dos arquivos de produção
do site (`assets/work/`, `app/img/`, `favicon.svg`, `og.png`,
`assets/fonts/`). Eles **não foram movidos** porque o site em produção
(`agenciacavalcante.com`) referencia os caminhos originais diretamente
(sem build), e mover quebraria o deploy. A fonte de verdade de cada arquivo
fica registrada em [`ASSET_INVENTORY.md`](./ASSET_INVENTORY.md), coluna
"Caminho original". Se o arquivo original mudar, esta cópia precisa ser
atualizada manualmente — esta pasta não é sincronizada automaticamente.

## Regra de ouro

**ORGANIZAÇÃO + RASTREABILIDADE + NÃO INVENTAR + PRESERVAR ORIGINAIS.**

- Nunca inserir logos, vídeos, métricas ou cases que não existam de fato.
- Nunca apagar ou sobrescrever um arquivo original.
- Nunca mover um arquivo de produção sem confirmar origem/destino e sem
  cópia de segurança (aqui, preferimos sempre copiar).
- Se não houver certeza sobre a qual cliente um arquivo pertence, ele vai
  para [`/incoming`](./incoming/) com status `CLASSIFY` no inventário —
  nunca é "adivinhado".
- Onde não houver dado real (métrica, logo, vídeo), o campo correspondente
  fica escrito literalmente como `Não informado.` — nunca um valor
  estimado ou de exemplo.

## Estrutura

```
assets-cavalcante/
├── brand/                  identidade visual (símbolo, ícones, fontes)
├── clients/                uma pasta por cliente real + info.md
│   └── _template/          modelo em branco para clientes novos
├── logos-clientes/         biblioteca rápida de logos para marquee/social proof
├── showreel/               candidatos a showreel (vídeos)
├── behind-the-scenes/      bastidores gerais (não vinculados a 1 cliente)
├── portal/                 screenshots reais do AgênciaHub/Portal
├── metrics/                métricas reais e verificadas
├── incoming/                arquivos ainda não classificados
├── ASSET_INVENTORY.md      inventário central de todos os assets
├── FEATURED_CASES.md       cases em destaque (site/portfólio)
└── README.md               este arquivo
```

## Nomenclatura

- lowercase, sem acentos, sem espaços, kebab-case.
- Certo: `black-suplementos`, `ct-fire`, `video-01.mp4`, `bastidor-01.jpg`.
- Errado: `Vídeo Final 2 NOVO.mp4`, `IMG_2345.JPG`, `cliente final final.svg`.
- Os arquivos originais desta agência já seguiam esse padrão e foram
  copiados sem renomear. Quando um arquivo futuro chegar fora do padrão,
  ele deve ser renomeado **na cópia** desta biblioteca (nunca no original
  de produção sem combinar antes) e a mudança registrada no inventário.

## Como adicionar um novo cliente

1. Copie `clients/_template/` para `clients/[slug-do-cliente]/`.
2. Preencha o `info.md` com dados reais (nunca invente resultado, se não
   houver dado escreva `Não informado.`).
3. Copie (não mova) os arquivos reais do cliente (logo, capa, vídeos,
   fotos, bastidores) para dentro da pasta, com nomes kebab-case.
4. Adicione uma linha por arquivo em `ASSET_INVENTORY.md`.
5. Se o cliente tiver logo próprio, adicione também uma cópia em
   `logos-clientes/` (evite duplicar sem necessidade — documente se
   duplicar).

## Como adicionar um vídeo

- Vídeo de cliente → `clients/[slug]/video-01.mp4`, `video-02.mp4`, ...
- Candidato a showreel geral da agência → `showreel/take-01.mp4`, ...
- Bastidor de um case específico → prioridade em
  `clients/[slug]/bastidor-01.mp4` (só cai em `/behind-the-scenes` se for
  bastidor genérico, sem cliente vinculado).
- Nunca misturar logos, prints, arquivos de projeto ou músicas dentro de
  `/showreel` — só takes candidatos de fato.

## Como adicionar métricas

- Só em [`metrics/resultados-reais.md`](./metrics/resultados-reais.md).
- Todo número precisa de fonte (print, painel, relatório) e data de
  verificação. Sem fonte = não entra.
- Se não houver dado comprovado para um campo, o valor é `Não informado.`
  — nunca uma estimativa.

## Como escolher featured cases

- Ver [`FEATURED_CASES.md`](./FEATURED_CASES.md).
- Nunca escolher automaticamente pelo tamanho do arquivo ou por achismo.
  O critério é: existe resultado real e/ou destaque editorial documentado
  (`"destaque": true` no `project-catalog.json` de origem, por exemplo).
- Sem informação suficiente, o case fica marcado `A DEFINIR`.

## Proibições explícitas desta biblioteca

- Proibido inventar logos, vídeos, métricas ou cases.
- Proibido apagar arquivos existentes (originais ou cópias).
- Proibido mover arquivos reais sem identificar claramente origem/destino
  (prefira sempre copiar).
- Proibido preencher métricas com valores estimados.
- Proibido "adivinhar" a qual cliente um arquivo pertence — dúvida vai
  para `/incoming` com status `CLASSIFY`.

## Uso de `/incoming`

`/incoming` recebe qualquer arquivo novo (upload do cliente, export de
edição, print de tela) que ainda não foi confirmado quanto a cliente,
campanha ou uso. Nada sai de lá até alguém confirmar a origem — nunca
mova algo de `/incoming` para `/clients/[slug]` por suposição.

## Estado atual (2026-09-13)

Esta biblioteca foi criada a partir de uma auditoria real do repositório
`agencia-hub` (o site em produção, `agenciacavalcante.com`). Resumo:

- 3 clientes identificados com assets reais: CT Fire, Black Suplementos,
  Parque José Julião Diniz — todos só com fotos de capa de posts, **sem
  logo próprio, sem vídeo local e sem bastidor** disponíveis no repositório.
- 1 símbolo de marca real (o cavalo), reaproveitado em variações técnicas
  (favicon, ícone PWA, ícone maskable) — **não existe** um logotipo com
  nome escrito nem uma "logo branca" separada nem um brand guide em PDF.
- **Nenhum vídeo** foi encontrado no repositório (os vídeos existem apenas
  como posts no Instagram, referenciados por link).
- **Nenhum screenshot** do portal/AgênciaHub foi encontrado.
- **Nenhuma métrica verificada** (visualizações, leads, investimento) foi
  encontrada no repositório — os dados de tráfego pago citados no README
  do projeto vivem dentro do app AgênciaHub, não em arquivo.

Ver detalhes completos, linha a linha, em `ASSET_INVENTORY.md`.
