import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(join(root, file), 'utf8');
const html = read('index.html');
const css = read('site-studio.css');
const site = read('site.js');
const motion = read('site-motion.js');
const scene = read('site-scene.js');
const vercel = read('vercel.json');
const portfolio = JSON.parse(read('portfolio.json'));
const catalog = JSON.parse(read('project-catalog.json'));
const failures = [];
let checks = 0;

const check = (name, condition, detail = '') => {
  checks += 1;
  if (condition) console.log(`PASS  ${name}`);
  else {
    failures.push(name);
    console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
check('IDs são únicos', new Set(ids).size === ids.length);

const sceneNames = [...html.matchAll(/<section[^>]*\sdata-scene(?:\s|>)[^>]*data-scene-name="([^"]+)"/g)]
  .map(match => match[1]);
const expectedScenes = ['Arrival', 'The System', 'Selected Work', 'No Black Box', 'Knight Move', 'Start a Project'];
check('Arquitetura final tem exatamente seis cenas na ordem aprovada', JSON.stringify(sceneNames) === JSON.stringify(expectedScenes), sceneNames.join(', '));
check('Showreel e Evidence permanecem fora da homepage', !/<section[^>]*(showreel|evidence)/i.test(html));

check('Selected Work foi reduzido a um único bloco compacto', html.includes('class="chapter work work-compact"') && !html.includes('class="case-scene"') && !html.includes('work-cinematic'));
check('Contagem total de projetos não aparece no portfólio', !/Case\s+\d+\s*\/\s*\d+/i.test(html));

const requestedReels = [
  'DdCgLFluUbA', 'DdAR3iRgvDV', 'DWu0kjvkY1R', 'Da2pXXzx5hG', 'Da-9h9yxm82',
  'DMYjxcSy0cV', 'DMvrYfDyf1L', 'DNTxKleS8n8', 'DNyoXkIwjlI', 'DOEvPspge6g',
  'DOwWDo3AQNS', 'DPR5IItASbE', 'DPrKwssDcjn', 'DP8j7TVDQwk', 'DdBtpXNt2K0'
];
const portfolioUrls = portfolio.itens.map(item => item.url);
const catalogGroups = new Set(catalog.itens.map(item => item.grupo));
check('Arquivo compacto de clientes está presente no Selected Work', html.includes('class="client-gallery"') && html.includes('data-archive-tabs') && html.includes('data-archive-track'));
check('Portfólio contém os 29 trabalhos publicados', portfolio.itens.length === 29 && catalog.itens.length === 29);
check('Os 15 novos Reels estão no portfólio', requestedReels.every(code => portfolioUrls.some(url => url.includes(code))));
check('Cada cliente possui seu próprio grupo de filtro', catalogGroups.size === 8);
check('Cartões abrem os Reels diretamente, sem player frágil incorporado', !/<iframe/i.test(html) && !site.includes("createElement('iframe')") && site.includes("target = '_blank'") && site.includes('Assistir no Instagram'));
check('CSP bloqueia conteúdo incorporado de terceiros', vercel.includes("frame-src 'none'"));
check('Selected Work usa apenas uma entrada curta de movimento', motion.includes("trigger: '.work-compact'") && !motion.includes("trigger: '.work-cinematic'"));

const hubModules = ['PROJETOS / EM PRODUÇÃO', 'APROVAÇÕES', 'MÍDIA', 'RESULTADOS'];
check('AgênciaHub apresenta os quatro módulos aprovados', hubModules.every(module => html.includes(module)) && (html.match(/class="hub-layer /g) || []).length === 4);
check('Interface do Hub está identificada como demonstrativa', html.includes('Interface demonstrativa baseada nos módulos reais do AgênciaHub.'));

const methodNames = [...html.matchAll(/class="knight-node"[^>]*data-name="([^"]+)"/g)].map(match => match[1]);
const expectedMethod = ['Diagnóstico', 'Direção', 'Produção', 'Distribuição', 'Acompanhamento', 'Resultado'];
check('Método tem cinco etapas operacionais e Resultado como consequência', JSON.stringify(methodNames) === JSON.stringify(expectedMethod), methodNames.join(', '));

const iconSvgs = [...html.matchAll(/<svg\s+class="icon[^"]*"[^>]*>/g)].map(match => match[0]);
check('Ícones usam SVG consistente', iconSvgs.length >= 9 && iconSvgs.every(svg => svg.includes('stroke-width="1.75"')));
check('Não há setas Unicode no conteúdo', !/[→↗↑↓]/u.test(html));

const localRefs = [...html.matchAll(/\s(?:src|href)="([^"]+)"/g)]
  .map(match => match[1])
  .filter(value => !/^(?:https?:|#|data:|mailto:|tel:)/.test(value))
  .map(value => value.split(/[?#]/)[0]);
const missingRefs = [...new Set(localRefs)].filter(value => {
  const target = join(root, value);
  if (!existsSync(target)) return true;
  return statSync(target).isDirectory() && !existsSync(join(target, 'index.html'));
});
check('Todos os arquivos locais referenciados existem', missingRefs.length === 0, missingRefs.join(', '));

const scriptSources = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
check('Scripts da homepage são locais e autocontidos', scriptSources.length === 4 && scriptSources.every(source => !/^https?:/.test(source)));
check('Versões de cache da entrega estão sincronizadas', html.includes('site-studio.css?v=20260915-7') && html.includes('site.js?v=20260915-7') && html.includes('site-motion.js?v=20260915-7') && site.includes("site-scene.js?v=20260915-7"));
check('Numeração das cenas é calculada a partir das cenas habilitadas', site.includes("querySelectorAll('[data-scene]')") && site.includes("dataset.sceneEnabled !== 'false'"));
check('Fallback cobre mobile, save-data, WebGL ausente e hardware limitado', ['saveData', '!webgl', 'coarsePointer', 'innerWidth < 900', 'deviceMemory <= 2'].every(token => site.includes(token)));
check('Movimento reduzido preserva leitura sequencial', css.includes('@media (prefers-reduced-motion: reduce)') && css.includes('.work-compact') && motion.includes("root.classList.add('motion-fallback')"));
check('Loops de renderização são encerrados ou suspensos', scene.includes("addEventListener('pagehide'") && scene.includes('destroy()') && scene.includes('cancelAnimationFrame(frame)') && motion.includes('cancelAnimationFrame(debugFrame)'));
check('Animação de DOM pertence ao GSAP e cena 3D pertence ao Three', motion.includes('gsap.registerPlugin(ScrollTrigger)') && scene.includes("import('./assets/vendor/three.module.min.js')"));

if (failures.length) {
  console.error(`\n${failures.length} verificação(ões) falharam.`);
  process.exitCode = 1;
} else {
  console.log(`\n${checks} verificações aprovadas.`);
}
