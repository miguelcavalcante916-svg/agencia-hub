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

check('Selected Work contém três cases reais', (html.match(/class="case-scene"/g) || []).length === 3);
check('Contagem total de projetos não aparece nos cases', !/Case\s+\d+\s*\/\s*\d+/i.test(html));
check('Cada case possui imagem, texto e destino', (html.match(/data-event="case_open"/g) || []).length === 3 && (html.match(/class="case-media"/g) || []).length === 3);

const hubModules = ['PROJETOS / EM PRODUÇÃO', 'APROVAÇÕES', 'MÍDIA', 'RESULTADOS'];
check('AgênciaHub apresenta os quatro módulos aprovados', hubModules.every(module => html.includes(module)) && (html.match(/class="hub-layer /g) || []).length === 4);
check('Interface do Hub está identificada como demonstrativa', html.includes('Interface demonstrativa baseada nos módulos reais do AgênciaHub.'));

const methodNames = [...html.matchAll(/class="knight-node"[^>]*data-name="([^"]+)"/g)].map(match => match[1]);
const expectedMethod = ['Diagnóstico', 'Direção', 'Produção', 'Distribuição', 'Acompanhamento', 'Resultado'];
check('Método tem cinco etapas operacionais e Resultado como consequência', JSON.stringify(methodNames) === JSON.stringify(expectedMethod), methodNames.join(', '));

const iconSvgs = [...html.matchAll(/<svg\s+class="icon[^"]*"[^>]*>/g)].map(match => match[0]);
check('Ícones usam SVG consistente', iconSvgs.length >= 10 && iconSvgs.every(svg => svg.includes('stroke-width="1.75"')));
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
check('Versões de cache da entrega estão sincronizadas', html.includes('site-studio.css?v=20260915-5') && html.includes('site.js?v=20260915-5') && html.includes('site-motion.js?v=20260915-5') && site.includes("site-scene.js?v=20260915-5"));
check('Numeração das cenas é calculada a partir das cenas habilitadas', site.includes("querySelectorAll('[data-scene]')") && site.includes("dataset.sceneEnabled !== 'false'"));
check('Fallback cobre mobile, save-data, WebGL ausente e hardware limitado', ['saveData', '!webgl', 'coarsePointer', 'innerWidth < 900', 'deviceMemory <= 2'].every(token => site.includes(token)));
check('Movimento reduzido preserva leitura sequencial', css.includes('@media (prefers-reduced-motion: reduce)') && css.includes('.case-scene { position: relative;') && motion.includes("root.classList.add('motion-fallback')"));
check('Loops de renderização são encerrados ou suspensos', scene.includes("addEventListener('pagehide'") && scene.includes('destroy()') && motion.includes('cancelAnimationFrame(debugFrame)') && site.includes('cancelAnimationFrame(cursorFrame)'));
check('Animação de DOM pertence ao GSAP e cena 3D pertence ao Three', motion.includes('gsap.registerPlugin(ScrollTrigger)') && scene.includes("import('./assets/vendor/three.module.min.js')"));

if (failures.length) {
  console.error(`\n${failures.length} verificação(ões) falharam.`);
  process.exitCode = 1;
} else {
  console.log(`\n${checks} verificações aprovadas.`);
}
