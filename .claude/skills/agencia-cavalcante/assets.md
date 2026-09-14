# Assets

## Biblioteca oficial

```
agencia-hub/assets-cavalcante/
├── ASSET_INVENTORY.md      ← consultar SEMPRE antes de usar mídia
├── brand/                  logo, marca, identidade
├── clients/[cliente]/      material por cliente + info.md
├── logos-clientes/
├── showreel/
├── behind-the-scenes/
├── portal/
├── metrics/                resultados-reais.md
└── incoming/               entrada de material novo
```

**Nunca ignorar essa biblioteca e sair procurando asset aleatório.**
Antes de usar mídia: ler `ASSET_INVENTORY.md`; havendo cliente, ler também
`clients/[cliente]/info.md`.

## Fluxo — não pular etapas

```
INCOMING → CLASSIFY → INVENTORY → CLIENT → OPTIMIZE → WEBSITE
```

Material novo entra em `incoming/`. Só chega ao site depois de classificado,
inventariado, atribuído e otimizado.

## Onde a biblioteca vive

`agencia-hub/assets-cavalcante/` — **versionada no Git**, que é a única coisa que
sobrevive ao container ser reciclado. Fora do deploy via `.vercelignore`.

> **Aviso para quando chegar vídeo:** Git guarda binário inteiro a cada versão. Fotos
> (poucos MB) tudo bem; **masters de vídeo, não** — o repositório incha e nunca
> desincha. Quando o primeiro master de vídeo chegar, decidir entre Git LFS ou manter os
> masters fora do Git (só derivados versionados), e registrar em `docs/DECISIONS.md`
> antes de commitar o primeiro arquivo grande.

## Estado real (auditado)

A pasta **não existia** no repositório até esta sessão; foi criada com a estrutura
acima e inventário vazio. **Todas as subpastas estão vazias.**

Consequência medida no site: **0 `<img>`, 0 `<video>`, 34 `<svg>`.** O site é 100%
vetor e CSS. É a maior distância entre ele e Aether/Alche/Seasats — que são inteiramente
movidos a mídia real. Nenhum motion resolve isso; só material verdadeiro resolve.

`assets-cavalcante/` fica **fora do deploy** (`.vercelignore`): masters não vão para a
web. Só derivados otimizados entram em pastas servidas.

## Otimização

| Uso | Formato |
|---|---|
| Foto | AVIF + WebP, fallback JPG |
| Vídeo | WebM (VP9/AV1) + MP4 (H.264) + **poster** obrigatório |
| Ícone/marca | SVG |
| 3D | GLB comprimido + Draco, texturas KTX2 |

Sempre: `loading="lazy"` fora da dobra, `width`/`height` explícitos (CLS),
`IntersectionObserver` para o que é pesado, DPR adaptativo.
**Preservar os masters originais** — otimizar gera cópia, nunca substitui.

## Showreel

Só quando houver material real suficiente. **Nunca stock fingindo ser trabalho
Cavalcante.** Preparar desktop, mobile, poster, WebM e MP4.

## Licença e direito de imagem

Material de cliente só vai ao ar com autorização. Na dúvida sobre direito de uso de uma
peça, **perguntar ao Miguel antes de publicar**, não depois.
