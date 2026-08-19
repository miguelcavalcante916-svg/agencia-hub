# 🎬 Agência Cavalcante — Site + AgênciaHub

Tudo da agência em um único projeto, pronto para publicar na Vercel com seu domínio:

| Pasta | O que é | Endereço depois de publicado |
|---|---|---|
| `/` (raiz) | **Site da agência** — eclipse azul, textura de TV, portfólio do Instagram, pacotes e WhatsApp | `https://seudominio.com.br/` |
| `/app` | **AgênciaHub** — sistema de gestão completo (PWA instalável no celular) | `https://seudominio.com.br/app/` |
| `portfolio.json` | Lista de reels/posts que aparecem no portfólio do site (gerada no app, em **Meu site**) | — |

## 🚀 Publicar na Vercel (com o seu domínio)

1. Entre em [vercel.com](https://vercel.com) com a conta do GitHub e clique em **Add New → Project**;
2. Importe o repositório `agencia-hub`;
3. Em *Framework Preset* deixe **Other** — não precisa de build. Clique em **Deploy**;
4. Depois do deploy, vá em **Settings → Domains** e adicione o seu domínio (a Vercel mostra o registro DNS para apontar);
5. No app (`/app` → Configurações), preencha **Endereço público do app** com `https://seudominio.com.br/app/` — é ele que gera os links do portal do cliente.

A partir daí, **todo commit no GitHub republica o site sozinho**.

## ✨ Módulos do AgênciaHub

| Módulo | O que faz |
|---|---|
| **Visão geral** | Indicadores do mês com números animados, gráfico de receita, prazos e agenda |
| **Assistente IA** | Converse com o Claude dentro do painel — ele responde usando os dados reais da agência (configure a chave em Configurações) |
| **Clientes** | CRM com leads/ativos e link direto para WhatsApp e Instagram |
| **Projetos** | Kanban com arrastar e soltar: Briefing → Planejamento → Produção → Edição → Revisão → Entregue |
| **Tarefas** | Prazos, prioridades, responsáveis e filtro de atrasadas |
| **Calendário** | Gravações, entregas, reuniões — postagens de conteúdo entram sozinhas |
| **Conteúdo** | Pipeline de postagens por cliente e canal: ideia → produção → aprovação → agendada → publicada |
| **Aprovações** | Materiais criativos com link — o cliente aprova ou pede ajuste pelo WhatsApp direto do portal |
| **Propostas** | Orçamentos com total automático e impressão em PDF |
| **Tráfego pago** | Abas Meta/Google/TikTok espelhando o Gerenciador: investimento, alcance, resultados, CTR, CPC, ROAS |
| **Leads** | Funil por cliente ligado às campanhas, com taxa de conversão e valor gerado |
| **Financeiro** | Receitas, despesas e contas a receber por mês |
| **Portal do cliente** | Link exclusivo por cliente: projetos com progresso, aprovações em 1 toque, postagens, anúncios, leads e cobranças |
| **Meu site** | Controle do portfólio do site: cole links do Instagram, gere o `portfolio.json` e publique |
| **Configurações** | Dados da agência, chave do assistente Claude, backup e restauração |

## 🤖 Assistente Claude

1. Crie uma chave em [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys);
2. No app: **Configurações → Assistente Claude**, cole a chave e salve;
3. Abra o menu **Assistente IA** e converse: "como está o mês?", "escreva uma legenda para...", "o que está atrasado?".

> A chave fica salva **somente no navegador em que foi colada** e as conversas são cobradas direto na sua conta Anthropic. Não coloque a chave em nenhum arquivo do repositório.

## 📸 Portfólio do site (integração site ⇄ app)

1. No app, abra **Meu site** e cole os links dos seus reels/posts (⋯ → Copiar link no Instagram — o post precisa ser público);
2. Clique em **Copiar JSON** e depois em **Abrir no GitHub para colar**;
3. Apague o conteúdo antigo do `portfolio.json`, cole o novo e salve (*Commit changes*) — a Vercel republica o site em ~1 minuto com as prévias incorporadas do Instagram.

## 📱 Instalar o app no celular

Com o endereço `https://seudominio.com.br/app/` aberto no navegador:

- **Android (Chrome):** menu ⋮ → **Adicionar à tela inicial**;
- **iPhone (Safari):** Compartilhar → **Adicionar à Tela de Início**;
- **Computador (Chrome/Edge):** ícone de instalação na barra de endereço.

Vira um aplicativo com ícone próprio e funciona offline. Os dados ficam no aparelho — use o backup (Configurações) para levar de um aparelho a outro.

## 👥 Portal do cliente

Gere um link exclusivo por cliente em **Portal do cliente** e envie no WhatsApp: ele vê projetos com barra de progresso, materiais para aprovar (com botões de WhatsApp), postagens, anúncios, leads e cobranças — só dele. O link é um retrato do momento: atualizou os dados, gere e envie um novo (perfeito como relatório semanal).

## ✏️ Personalizar o site

Abra `index.html` (raiz) e procure por **“EDITE”**: número do WhatsApp, nome, Instagram, números de resultado e preços dos pacotes.

## 🛠️ Tecnologia

HTML + CSS + JavaScript puros — sem build, sem dependências, sem mensalidade. Dados do app em `localStorage`. PWA com service worker (funciona offline). O assistente usa a API da Anthropic direto do navegador.
