# Validação da direção Studio — 12/09/2026

Home redesenhada com `site-studio.css`, galeria horizontal nativa para os três destaques, capas na proporção original e cena cromada com ambiente de estúdio. Os estilos anteriores não são carregados pela home.

## Verificações

- JavaScript: `node --check` nos três scripts.
- HTML: IDs únicos, âncoras e recursos locais válidos; link de pular navegação primeiro; títulos dos trabalhos preservados na árvore acessível.
- Navegador: composição em 1280×720, 390×844 e 320×740; sem overflow horizontal após ajuste do título em 320px.
- Menu móvel: abre, foco inicial no primeiro link e fecha ao navegar.
- Galeria: avanço pelo botão; filtro CT Fire produz nove projetos e oculta os controles dos destaques.
- Modal: projeto Fire Summer, link correto do Instagram e fechamento por Escape.
- Serviços: alternância de seção aberta; título se reposiciona abaixo do cabeçalho quando necessário.
- Método: seleção de Produção atualiza contador para 03/05 e legenda; canvas pronto.
- Carregamento direto final: cena pronta, somente `site-studio.css` carregado, sem avisos/erros no console.

## Amostra de regularidade de animação

Medições locais de quatro segundos, `requestAnimationFrame`, navegador integrado, 1280×720, após carregamento da cena:

| Cenário | Quadros | Mediana | Percentil 95 | Intervalos > 33,4 ms |
| --- | ---: | ---: | ---: | ---: |
| Abertura | 401 | 10,0 ms | 10,8 ms | 0 |
| Rolagem programada pela abertura | 400 | 10,0 ms | 10,2 ms | 0 |

Essas amostras medem a cadência local de callbacks de animação. Não medem o tempo interno da GPU, não são Lighthouse e não garantem a mesma cadência em outros aparelhos. O helper temporário foi removido e não faz parte da publicação.
