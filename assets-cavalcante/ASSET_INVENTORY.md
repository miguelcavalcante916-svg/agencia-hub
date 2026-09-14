# Inventário de assets — Agência Cavalcante

> **Consultar este arquivo ANTES de usar qualquer mídia no site.**
> Se algo não está listado aqui, **não existe**. Não procurar asset em outro lugar,
> não usar stock, não inventar.

**Estado em 14/09/2026: a biblioteca está vazia.** A estrutura foi criada nesta data;
nenhum arquivo real foi catalogado ainda.

Consequência: o site tem **0 `<img>` e 0 `<video>`** — é 100% SVG e CSS. Enquanto for
assim, nenhuma seção pode prometer mídia que não existe.

## Fluxo — não pular etapas

```
INCOMING → CLASSIFY → INVENTORY → CLIENT → OPTIMIZE → WEBSITE
```

Material novo entra sempre em `incoming/`. Só chega ao site depois de classificado,
registrado aqui, atribuído a um cliente (quando houver) e otimizado.

## Pastas

| Pasta | Conteúdo | Itens |
|---|---|---|
| `brand/` | logo, marca, identidade | 0 |
| `clients/` | material por cliente (cada um com `info.md`) | 0 |
| `logos-clientes/` | logos de clientes, com autorização de uso | 0 |
| `showreel/` | masters e derivados do showreel | 0 |
| `behind-the-scenes/` | bastidores, prova de produção | 0 |
| `portal/` | mídia do Portal do cliente | 0 |
| `metrics/` | `resultados-reais.md` — única fonte de números | 0 |
| `incoming/` | entrada, ainda não classificado | 0 |

## Inventário

*(vazio — preencher conforme o material real chegar)*

| Arquivo | Tipo | Cliente | Autorizado | Master | Derivados | Onde é usado |
|---|---|---|---|---|---|---|

## Regras

- **Preservar os masters originais.** Otimizar gera cópia, nunca substitui.
- Material de cliente só vai ao ar **com autorização**. Na dúvida, perguntar antes.
- `assets-cavalcante/` fica **fora do deploy** (`.vercelignore`): só derivados
  otimizados entram em pastas servidas.
- Formatos: foto → AVIF + WebP (fallback JPG) · vídeo → WebM + MP4 + **poster** ·
  ícone → SVG · 3D → GLB + Draco + KTX2.
