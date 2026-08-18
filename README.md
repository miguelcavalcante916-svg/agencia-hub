# 🎬 AgênciaHub

Sistema de gestão completo para **agências de marketing e produtoras audiovisuais**.
Clientes, projetos, gravações, propostas, financeiro e equipamentos — tudo em um só lugar.

Funciona **100% no navegador**: sem instalação, sem servidor, sem mensalidade e até sem internet.
Os dados ficam salvos no próprio navegador (localStorage). É um **PWA**: dá para instalar
no celular e no computador como aplicativo, com ícone próprio.

O repositório também inclui o **site de apresentação da agência** em `site/`
(estilo makershub.app.br, em azul-marinho/branco/preto), com botão de WhatsApp,
pacotes, FAQ e uma vitrine do sistema e do portal do cliente.

## ✨ Módulos

| Módulo | O que faz |
|---|---|
| **Visão geral** | Indicadores do mês, gráfico de receita dos últimos 6 meses, prazos e próximos compromissos |
| **Clientes** | CRM simples: leads, clientes ativos, contatos com link direto para WhatsApp e Instagram |
| **Projetos** | Kanban com arrastar e soltar: Briefing → Planejamento → Produção → Edição → Revisão → Entregue |
| **Tarefas** | Lista rápida com prazos, prioridades, responsáveis e filtros (hoje, semana, atrasadas) |
| **Calendário** | Agenda mensal de gravações, entregas, reuniões — as postagens de conteúdo entram automaticamente |
| **Conteúdo** | Pipeline de postagens por cliente: ideia → produção → aprovação → agendada → publicada, por canal (Instagram, TikTok...) |
| **Aprovações** | Materiais criativos (cortes, artes, roteiros) com link — o cliente aprova ou pede ajuste pelo WhatsApp direto do portal |
| **Propostas** | Orçamentos com itens, desconto e total automático — imprima ou salve em PDF para enviar no WhatsApp |
| **Tráfego pago** | Abas por plataforma (Meta/Facebook, Google, TikTok): espelhe os números do Gerenciador de Anúncios — investimento, alcance, cliques, resultados, custo por resultado, CTR e ROAS |
| **Leads** | Funil de leads por cliente (novo → contato → negociação → convertido), ligado às campanhas, com taxa de conversão e valor gerado |
| **Financeiro** | Receitas e despesas por mês, contas a receber, resultado do mês |
| **Portal do cliente** | Link exclusivo por cliente para enviar no WhatsApp: andamento dos projetos, materiais para aprovar (com resposta por WhatsApp em 1 toque), postagens, agenda, resultados dos anúncios, leads/conversões e cobranças — sem acessar o seu painel |
| **Equipamentos** | Controle de câmeras, lentes, drones, áudio e iluminação (disponível / em uso / manutenção) |
| **Equipe** | Pessoas fixas e freelas, com carga de trabalho de cada uma |
| **Configurações** | Dados da agência (saem nas propostas), backup e restauração |

## 🚀 Como usar

### Opção 1 — Abrir direto (mais simples)

1. Baixe este repositório: botão verde **Code → Download ZIP** (ou `git clone`).
2. Extraia e dê **dois cliques em `index.html`**.
3. Pronto — o app abre com dados de demonstração para você explorar.

### Opção 2 — Publicar na internet (GitHub Pages)

1. No repositório, vá em **Settings → Pages**.
2. Em *Source*, escolha **Deploy from a branch**, branch **`main`**, pasta **`/ (root)`** e salve.
3. Em ~1 minuto o app estará no ar em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
   > Atenção: no plano gratuito do GitHub, o Pages exige repositório **público**.

### Primeiros passos dentro do app

1. Vá em **Configurações** e preencha os dados da sua agência (nome, WhatsApp, PIX...) — eles saem no cabeçalho das propostas.
2. Ainda em Configurações, quando quiser começar de verdade, use **Apagar todos os dados** para limpar a demonstração.
3. Cadastre seus clientes, crie os projetos e arraste os cartões conforme o trabalho avança.

## 📱 Instalar como aplicativo (celular e computador)

Com o app publicado no GitHub Pages, abra o endereço no navegador e:

- **Android (Chrome):** menu ⋮ → **Adicionar à tela inicial** (ou aceite o aviso "Instalar app").
- **iPhone (Safari):** botão Compartilhar → **Adicionar à Tela de Início**.
- **Computador (Chrome/Edge):** ícone de instalação na barra de endereço → **Instalar**.

O AgênciaHub vira um aplicativo com ícone próprio, tela cheia e **funciona offline**
(as alterações sincronizam com o site quando a internet volta — os dados são locais de cada aparelho;
use o backup de Configurações para levar dados de um aparelho a outro).

## 🌐 Site da agência (`site/`)

A pasta `site/` tem a página de apresentação da agência — pronta para divulgar no
link da bio do Instagram: `https://SEU-USUARIO.github.io/NOME-DO-REPO/site/`.

Para personalizar, abra `site/index.html` e procure por **“EDITE”**: nome da agência,
número do WhatsApp, Instagram, números de resultado e preços dos pacotes.

## 👥 Portal do cliente — como funciona

1. Publique o app na internet (GitHub Pages, veja acima) e informe o endereço em **Configurações → Endereço público do app**.
2. Vá em **Portal do cliente**, escolha o cliente e clique em **Copiar link do portal**.
3. Envie o link no WhatsApp do cliente. Ele abre uma página limpa, com a marca da sua agência, mostrando **apenas os dados dele**: andamento dos projetos (com barra de progresso), próximos compromissos, resultados de tráfego pago e pagamentos em aberto (opcional).

> **Importante:** o link carrega um *retrato* dos dados no momento em que foi gerado — os dados do cliente viajam dentro do próprio link, nada fica em servidor. Atualizou o kanban ou registrou novos números de anúncio? Gere um novo link e envie de novo (perfeito como relatório semanal). Compartilhe cada link somente com o respectivo cliente.

## 📣 Tráfego pago — como funciona

O módulo **Tráfego pago** é o espelho do Gerenciador de Anúncios: crie a campanha (Meta, Google ou TikTok), e a cada semana ou mês registre o período com investimento, alcance, impressões, cliques, resultados e receita. O app calcula CTR, CPC, custo por resultado e ROAS, mostra o gráfico de investimento dos últimos 6 meses e leva tudo para o portal do cliente.

> Esta versão funciona sem servidor, então os números são digitados por você (2 minutos por semana com o Gerenciador aberto do lado). Uma integração automática com a API do Meta exigiria um servidor com login — dá para evoluir depois.

## 💾 Seus dados

- Tudo é salvo **somente no navegador que você está usando** (nada vai para a internet).
- Trocou de computador ou vai limpar o navegador? **Exporte o backup** em *Configurações → Backup* e importe no outro aparelho.
- Recomendação: exporte um backup por semana e guarde no seu Drive.

## 🛠️ Tecnologia

- HTML + CSS + JavaScript puros (sem frameworks, sem build, sem dependências).
- Persistência via `localStorage`.
- Interface escura, responsiva (funciona no celular) e em português.

### Estrutura

```
index.html          → página única do app
css/styles.css      → tema e componentes visuais
js/core/store.js    → dados, persistência e utilitários
js/core/ui.js       → modais, toasts, ícones e badges
js/views/*.js       → uma tela por arquivo
js/app.js           → rotas e inicialização
```

## 📄 Licença

Uso livre pela agência. Personalize à vontade.
