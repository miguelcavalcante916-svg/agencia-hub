import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const html = read('index.html');
const productionCss = read('cinematic-production.css');
const productionJs = read('cinematic-production.js');
const scrollJs = read('cinematic-scroll.js');
const portfolio = JSON.parse(read('portfolio.json'));
const catalog = JSON.parse(read('project-catalog.json'));
const showreel = JSON.parse(read('showreel-config.json'));

assert(exists('assets-cavalcante/ASSET_INVENTORY.md'), 'Asset inventory is missing.');
assert(exists('assets-cavalcante/FEATURED_CASES.md'), 'Featured case audit is missing.');
assert(catalog.itens.length === 14, 'The real project catalogue must contain 14 audited items.');
assert(portfolio.itens.length === 3, 'The cinematic Work selection must contain three featured items.');
assert((html.match(/class="work-plane work-case/g) || []).length === 3, 'Work must render three project scenes.');

for (const item of portfolio.itens) {
  assert(item.url.startsWith('https://www.instagram.com/'), `Invalid source URL for ${item.cliente}.`);
  assert(exists(item.capa), `Missing real cover: ${item.capa}`);
  assert(catalog.itens.some(entry => entry.url === item.url), `Featured item is absent from project-catalog.json: ${item.url}`);
}

for (const key of ['desktop', 'mobile', 'poster']) {
  if (showreel[key]) assert(exists(showreel[key]), `Configured showreel asset does not exist: ${showreel[key]}`);
}

const scriptSources = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]);
assert(scriptSources.every(source => !/^https?:/i.test(source)), 'JavaScript libraries must be self-hosted.');
assert(!/cdn\.jsdelivr|unpkg|cdnjs/i.test(html + productionJs + scrollJs), 'A prohibited script CDN remains in the homepage.');
assert(exists('assets/vendor/gsap.min.js'), 'Self-hosted GSAP is missing.');
assert(exists('assets/vendor/ScrollTrigger.min.js'), 'Self-hosted ScrollTrigger is missing.');
assert(exists('assets/vendor/three.module.min.js'), 'Conditional Three.js module is missing.');

assert(/<section class="chapter reel"[^>]+hidden/.test(html), 'Showreel must stay hidden until real media is configured.');
assert(/<section class="chapter evidence"[^>]+hidden/.test(html), 'Evidence must stay hidden until verified metrics exist.');
assert(!/(placeholder|mídia pendente|inserir aqui|em breve)/i.test(html) && !html.includes('>TODO<'), 'Unfinished copy is exposed in the homepage.');
assert(!/[🚀🔥🎯📈🎥]/u.test(html), 'Emoji interface icons are not allowed.');

const iconTags = [...html.matchAll(/<svg class="[^"]*\bicon\b[^"]*"[^>]*>/g)].map(match => match[0]);
assert(iconTags.length >= 10, 'The functional Lucide icon system was not found.');
assert(iconTags.every(tag => /aria-hidden="true"/.test(tag)), 'Decorative SVG icons must be hidden from assistive technology.');
assert(/--icon-xs:\s*14px/.test(html) && /--icon-lg:\s*24px/.test(html), 'Icon size tokens are incomplete.');
assert(/prefers-reduced-motion:\s*reduce/.test(html + productionCss), 'Reduced-motion handling is missing.');
assert(/motionDebug/.test(scrollJs) && /CavalcanteVitals/.test(productionJs), 'Motion diagnostics are incomplete.');

for (const required of ['canonical', 'og:title', 'og:description', 'application/ld+json']) {
  assert(html.includes(required), `SEO contract is missing: ${required}`);
}

console.log('Cinematic validation passed: real work, local motion libraries, icons, a11y and SEO contracts are intact.');
