# Suíte de testes — Agência Cavalcante

Playwright sobre Chromium. Fica **fora do deploy** (`.vercelignore`).

```bash
cd /home/user/agencia-hub/testes
python3 teste_site.py        # site: estrutura, motion, overflow 320–1380, erros de JS
python3 teste_app.py         # painel: 17 telas, navegação, sidebar
python3 teste_portal_trabalhos.py
python3 teste_login.py       # sobe http.server em 127.0.0.1:8123 e finge /api/portal/entrar
python3 teste_trava.py       # porta 8144; inclui o caso "servidor fora do ar"
python3 teste_csp.py         # tem de dar ZERO violação
python3 teste_fontes_mobile.py   # precisa de ./fontes (woff2 embutidos em base64)
python3 wcag.py              # ferramenta: contraste de qualquer par da paleta
```

## Regras

- **Rodar um de cada vez.** `teste_login`, `teste_trava` e `teste_csp` sobem servidor
  em porta fixa; dois em paralelo colidem (`Address already in use`, `goto` estourando)
  e produzem falha falsa. Já aconteceu.
- Nada de `sleep` fixo esperando animação — usar `wait_for_function` sobre a condição
  real. Três testes já alternaram passa/falha por causa disso.
- Chromium: `p.chromium.launch(headless=True, executable_path='/opt/pw-browsers/chromium')`.
- Os testes apontam para `/home/user/agencia-hub` por caminho absoluto e rodam de
  qualquer diretório.
- `fontes/` são fixtures do npm (`@fontsource-variable/*`), 524 KB. Necessárias porque o
  sandbox não alcança o Google Fonts.
- Erros de console tipo `net::ERR_FAILED` em requisição de fonte são esperados offline —
  não confundir com falha real.
