# Incoming

Pasta de triagem para arquivos novos que ainda não foram classificados
(origem, cliente ou uso incerto). Nada sai daqui por suposição — só
depois de confirmação humana da origem.

Ao adicionar um arquivo aqui, registre uma linha em `../ASSET_INVENTORY.md`
com status `CLASSIFY` e uma nota do que se sabe e do que falta confirmar.

## Estado atual (2026-09-13)

**Vazia.** A auditoria inicial do repositório `agencia-hub` não encontrou
nenhum arquivo de mídia com origem ambígua — todos os arquivos reais
encontrados puderam ser associados com confiança a um cliente (via
`project-catalog.json`) ou à marca (via `app/manifest.json` e uso em
`index.html`/`site-scene.js`).

Locais **fora deste projeto** que podem conter assets adicionais da
Cavalcante, mas que não foram tocados por não terem associação clara
confirmada — verificar manualmente antes de trazer para cá:

- `~/Downloads/agencia-cavalcante-main.zip`
- `~/Downloads/Teleprompter_Agencia_Cavalcante.html`
- `~/Movies/CARROSSEIS-CAVALCANTE-PROMPTS.md`
- Screenshots recentes em `~/Desktop` (datas de agosto/setembro 2026,
  não confirmadas como sendo do portal ou de algum cliente específico)
