import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exists = file => fs.existsSync(path.join(root, file));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const html = read('index.html');
const baseJs = read('site.js');
const motionJs = read('motion-polish.js');
const motionCss = read('motion-polish.css');
const editorialCss = read('site-editorial.css');
const portfolio = JSON.parse(read('portfolio.json'));
const catalog = JSON.parse(read('project-catalog.json'));
const embeddedCatalog = JSON.parse(html.match(/<script type="application\/json" id="project-catalog">([\s\S]+?)<\/script>/)?.[1] || '[]');

assert(/class="hero-wordmark"[^>]*>CAVALCANTE</.test(html), 'The approved CAVALCANTE hero composition changed.');
assert(/id="hero-canvas"/.test(html) && /app\/img\/logo\.svg/.test(html), 'The official horse hero is missing.');
assert(/class="contact-knight"[^>]+app\/img\/logo\.svg/.test(html), 'The horse does not return in the final CTA.');

assert(catalog.itens.length === 14, 'The verified project catalog must contain 14 items.');
assert(embeddedCatalog.length === 14, 'The embedded fallback catalog must contain 14 items.');
assert(portfolio.itens.length === 14, 'The public portfolio index must contain 14 projects.');
const featured = catalog.itens.filter(item => item.destaque);
assert(featured.length === 3, 'The selected Work set must contain three projects.');
assert((html.match(/<article class="work-card"/g) || []).length === 3, 'The homepage must render three selected Work cards.');
for (const project of featured) {
  const publicItem = portfolio.itens.find(entry => entry.url === project.url);
  assert(publicItem, `Selected project is absent from the public portfolio: ${project.url}`);
  assert(exists(project.capa), `Missing real Work asset: ${project.capa}`);
}

assert(exists('assets/vendor/gsap.min.js'), 'Self-hosted GSAP is missing.');
assert(exists('assets/vendor/ScrollTrigger.min.js'), 'Self-hosted ScrollTrigger is missing.');
assert(exists('assets/icons/lucide/LICENSE'), 'Lucide license is missing.');
assert(/assets\/vendor\/gsap\.min\.js/.test(html) && /assets\/vendor\/ScrollTrigger\.min\.js/.test(html), 'The motion runtime is not wired into the homepage.');
assert(!/<script[^>]+src="https?:/i.test(html), 'External JavaScript is not allowed.');
assert(!/cdn\.jsdelivr|unpkg|cdnjs/i.test(html + motionJs + baseJs), 'A prohibited CDN remains.');

for (const token of ['--motion-fast', '--motion-standard', '--motion-slow', '--ease-out', '--ease-in-out']) {
  assert(motionCss.includes(token), `Missing motion token: ${token}`);
}
for (const token of ['--icon-xs', '--icon-sm', '--icon-md', '--icon-lg', '--icon-xl']) {
  assert(motionCss.includes(token), `Missing icon token: ${token}`);
}
assert(/stroke-width:\s*1\.75/.test(motionCss), 'The Lucide optical stroke is not centralized.');
assert(/prefers-reduced-motion:\s*reduce/.test(motionCss + editorialCss), 'Reduced-motion treatment is missing.');
assert(/\(hover:\s*hover\) and \(pointer:\s*fine\)/.test(motionCss), 'Hover motion is not gated to fine pointers.');
assert(!/transition:\s*all/i.test(motionCss), 'Transition all is not allowed.');
assert(!/scale\(0\)/i.test(motionCss + motionJs), 'Scale-zero entrances are not allowed.');

assert(/clipPath/.test(motionJs) && /scrub:/.test(motionJs) && /transformPerspective/.test(motionJs), 'Directed scroll motion is incomplete.');
assert(/CavalcanteVitals/.test(motionJs) && /motionDebug/.test(motionJs), 'Performance diagnostics are missing.');
assert(/capable3D/.test(baseJs) && /pointer:\s*fine/.test(baseJs), 'Mobile WebGL fallback is not enforced.');

assert(!/[↗↙→🔥🚀🎯🎥📈]/u.test(html + baseJs), 'Unicode or emoji interface icons remain.');
assert(!/(placeholder|mídia pendente|inserir aqui|em breve)/i.test(html + baseJs), 'Unfinished interface copy remains.');
assert([...html.matchAll(/<svg class="[^"]*\bicon\b[^"]*"[^>]*>/g)].every(match => /aria-hidden="true"/.test(match[0])), 'Decorative interface icons must be hidden from assistive technology.');
assert(/aria-label="Abrir menu"/.test(html) && /aria-label="Começar uma conversa/.test(html), 'Action labels are incomplete.');

for (const contract of ['canonical', 'og:title', 'og:description', 'application/ld+json']) {
  assert(html.includes(contract), `SEO contract is missing: ${contract}`);
}

console.log('Motion polish validation passed: approved composition, real Work, local motion, Lucide, mobile fallback, accessibility and SEO are intact.');
