# QA — como fechar uma tarefa

**"O build passou" não é QA.** Visual faz parte do QA.

## Ciclo obrigatório após toda mudança visual significativa

1. Servir local · 2. **abrir** · 3. **rolar** · 4. **interagir** ·
5. screenshot quando útil · 6. **comparar** com o estado anterior · 7. corrigir ·
8. só então considerar pronto.

```bash
cd /home/user/agencia-hub && python3 -m http.server 8765 &
# Playwright: p.chromium.launch(headless=True, executable_path='/opt/pw-browsers/chromium')
```

Muitos testes usam `file:///home/user/agencia-hub/index.html` direto e rodam de qualquer
diretório. Servidor só é necessário para o que depende de origem (SW, fetch, CSP).

## Suíte no repositório — `testes/`

| Arquivo | Cobre |
|---|---|
| `teste_site.py` | site: estrutura, motion, overflow, erros de JS (~30 checagens) |
| `teste_app.py` | painel: 17 telas, navegação, sidebar (~25) |
| `teste_portal_trabalhos.py` | portal + portfólio (9) |
| `teste_login.py` | login do portal (8) |
| `teste_trava.py` | trava do painel, inclusive servidor fora do ar (9) |
| `teste_csp.py` | violações de CSP — tem de dar **zero** |
| `teste_fontes_mobile.py` | Urbanist/Lexend em largura de celular |
| `wcag.py` | ferramenta: razão de contraste de qualquer par da paleta |

`testes/` fica fora do deploy (`.vercelignore`). Ampliar a suíte ao lado de cada
funcionalidade nova — regressão que ninguém mede volta sempre.

### Escrever teste que não seja instável

Nunca dormir um tempo fixo esperando animação: usar **`wait_for_function`** sobre a
condição real. Três testes já alternaram passa/falha por causa disso — bounding box
lido durante scroll suave, hover vazado do teste anterior, e o fade-out da luz de borda
contado como "linha estática".

## Barra mínima antes de dizer "pronto"

- [ ] Zero erro de JS no console
- [ ] Zero violação de CSP
- [ ] Sem estouro horizontal de **320 px a 1380 px**
- [ ] `prefers-reduced-motion: reduce`: nada invisível, nada travado, nada em `scaleX(0)`
- [ ] Navegação por teclado + `:focus-visible` visível
- [ ] Contraste conferido com `wcag.py` se alguma cor mudou
- [ ] Nenhum `PLACEHOLDER`/`TODO`/lorem no que vai ao ar
- [ ] Suíte inteira verde

## Performance

Vigiar **LCP, INP, CLS, FPS, CPU, GPU, memória**. Experiência cinematográfica não é
desculpa para site lento. Ferramentas: AVIF/WebP/WebM + MP4 + poster, lazy loading,
`import()` dinâmico, DPR adaptativo, GLB comprimido + Draco, KTX2, IntersectionObserver.

`width`/`height` explícitos em toda mídia — CLS é o defeito mais barato de evitar e o
mais caro de descobrir depois.

## Mobile

**Mobile não é desktop empilhado.** Adaptar a experiência, preservar a personalidade,
simplificar tecnicamente quando necessário. Efeito que depende de ponteiro fino fica sob
`@media (hover: hover) and (pointer: fine)`. Testar de verdade em 320, 390 e 430 px.

## Acessibilidade — obrigatório

`prefers-reduced-motion` · teclado · foco visível · `aria-*` · `alt` em toda imagem ·
contraste medido · HTML semântico. Hoje o site usa `aria-controls`, `aria-expanded`,
`aria-hidden` e `aria-label`, e tem `:focus-visible`. **Não há nenhuma `<img>`** — no
minuto em que a primeira entrar, `alt` é obrigatório.

## O que reportar ao Miguel

O que mudou · o que foi medido (número, não impressão) · o que ficou de fora e por quê ·
o link da branch/preview. Em **pt-BR**. Sem prometer o que não foi verificado — e nunca
afirmar ter visto a produção, que esta sessão não alcança.
