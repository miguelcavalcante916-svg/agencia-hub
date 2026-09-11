# 🎬 Agência Cavalcante — Site + AgênciaHub

**No ar em [agenciacavalcante.com](https://agenciacavalcante.com)** — site e sistema no mesmo projeto, hospedados de graça na Vercel.

| Endereço | O que é |
|---|---|
| [agenciacavalcante.com](https://agenciacavalcante.com) | **Site da agência** — cavaleiro 3D, projetos reais, serviços, método e WhatsApp |
| [agenciacavalcante.com/app/](https://agenciacavalcante.com/app/) | **AgênciaHub** — sistema de gestão (instala no celular como aplicativo) |

| Arquivo | Para que serve |
|---|---|
| `index.html` | Página pública gerada por `scripts/build-home.py`; sem build na Vercel |
| `site.css`, `site-editorial.css` | Componentes básicos e direção visual editorial responsiva |
| `site.js`, `site-motion.js`, `site-scene.js` | Portfólio acessível, transições de rolagem e cenas opcionais |
| `project-catalog.json`, `assets/work/` | Descrições e capas verificadas dos trabalhos |
| `app/` | O sistema: `js/views/` tem uma tela por arquivo |
| `portfolio.json` | Os reels que aparecem no site — gere no app, em **Meu site** |
| `robots.txt`, `sitemap.xml` | Indexação no Google (o `/app/` fica fora das buscas) |
| `og.png` | A imagem que aparece ao compartilhar o link no WhatsApp |

## 🚀 Como atualizar o site

**Todo commit neste repositório republica o site sozinho, em segundos.** Não precisa mexer na Vercel.

Para mudar os textos, edite o gerador conforme a tabela abaixo e publique o HTML gerado junto com a mudança.

| O que mudar | Onde |
|---|---|
| Texto, títulos, perguntas do FAQ | `scripts/build-home.py`; execute `python3 scripts/build-home.py` e publique também o `index.html` gerado |
| WhatsApp | `scripts/build-home.py` e `site.js`, procure por `5584999492725` |
| Reels do portfólio | `portfolio.json` (gere a lista no app, em **Meu site**) |
| Logo | `app/img/logo.svg` — usada diretamente na navegação e na extrusão 3D |

### Como está configurado

- **Vercel**: projeto `agencia-cavalcante`, ligado a este repositório, branch `main`, sem build (framework *Other*).
- **DNS (Hostinger)**: registro `A` do `@` → `76.76.21.21` e `CNAME` do `www` → `cname.vercel-dns.com`. O `www` redireciona para o domínio principal (redirect 308).
- **HTTPS**: automático pela Vercel, renovado sozinho.

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
3. Apague o conteúdo antigo do `portfolio.json`, cole o novo e salve (*Commit changes*) — a Vercel republica o site em ~1 minuto com links para os trabalhos. Os projetos do catálogo usam capas locais; novos links aparecem com uma capa tipográfica até receberem imagem e descrição em `project-catalog.json`.

## 📱 Instalar o app no celular

Com o endereço `https://agenciacavalcante.com/app/` aberto no navegador:

- **Android (Chrome):** menu ⋮ → **Adicionar à tela inicial**;
- **iPhone (Safari):** Compartilhar → **Adicionar à Tela de Início**;
- **Computador (Chrome/Edge):** ícone de instalação na barra de endereço.

Vira um aplicativo com ícone próprio e funciona offline. Os dados ficam no aparelho — use o backup (Configurações) para levar de um aparelho a outro.

## 👥 Portal do cliente

Gere um link exclusivo por cliente em **Portal do cliente** e envie no WhatsApp: ele vê projetos com barra de progresso, materiais para aprovar (com botões de WhatsApp), postagens, anúncios, leads e cobranças — só dele. O link é um retrato do momento: atualizou os dados, gere e envie um novo (perfeito como relatório semanal).

## ✏️ Personalizar o site

Edite `scripts/build-home.py` para os textos e execute `python3 scripts/build-home.py`. O resultado é `index.html`, servido diretamente pela Vercel. Edite `site-editorial.css` para a direção visual e `site.css` para os componentes básicos. Mantenha as descrições factuais e os links reais dos trabalhos.

A edição editorial apresenta o símbolo da marca em metal 3D, tipografia em grande escala, três projetos em composições alternadas e um arquivo filtrável com os 14 trabalhos. A navegação usa rolagem nativa; as transições são opcionais e respeitam redução de movimento. Os filmes abrem pelo link real no Instagram.

## 🛠️ Tecnologia

HTML + CSS + JavaScript puros — sem build na hospedagem. A página pública carrega Three.js 0.169.0 de `assets/vendor/`, com licença MIT incluída, somente para o cavaleiro 3D. Fontes locais Instrument Sans (OFL). O site mantém conteúdo e links acessíveis sem JavaScript ou WebGL; respeita redução de movimento e economia de dados. Dados do app em `localStorage`. PWA com service worker (funciona offline). O assistente usa a API da Anthropic direto do navegador.

## ⚠️ Regra de conteúdo do site

O site apresenta **trabalhos reais, com links e capas provenientes do acervo da agência**. Não publica números de resultado, preços fixos ou depoimentos sem comprovação. Isso é proposital: prometer resultado que não aconteceu queima a
confiança no primeiro cliente que perguntar de onde veio o dado.

Quando houver um case fechado com números de verdade (investimento, conversas geradas, custo por
conversa), é só pedir que a seção de resultados volta — com gráfico e tudo.
