# Comparação prévia × produção

Em 1 de setembro de 2026, a prévia `https://4173-iq97asir5yiziddxyy3wn-fe77bc22.us1.manus.computer/` e o domínio `https://agenciacavalcante.com/` retornaram o mesmo título e a mesma estrutura textual: Arrival, Think/Create/Scale, Portal, Knight Move e Start a Project. As duas páginas exibiram 11.718 px abaixo do viewport no navegador conectado. O screenshot automático não foi disponibilizado em nenhuma das duas navegações, portanto a comparação visual precisa ser feita por captura local/HTML e pela inspeção de assets/scripts.

A prévia e a produção usam o mesmo conteúdo extraído, mas podem divergir no carregamento de CSS, GSAP, ScrollTrigger, Three.js ou na versão servida pelo processo local. A próxima etapa deve comparar hashes/versões dos arquivos e testar a produção sem a instrumentação do navegador.

## Paridade técnica confirmada

A produção e a cópia local da `main` servem as mesmas referências: `cinematic-production.css?v=1`, GSAP 3.12.5, ScrollTrigger 3.12.5, `cinematic-production.js?v=1` e `cinematic-scroll.js?v=1`. O HTML público contém o canvas `global-webgl`, os marcadores de `ScrollTrigger`, `prefers-reduced-motion` e os slots de mídia da produção. A ausência do marcador textual `SHOWREEL_DESKTOP` no HTML público é esperada porque ele é uma constante interna do JavaScript, não um elemento de interface.

## Correção permanente de cache

O commit `637c152` alterou as URLs de produção para `cinematic-production.css?v=9a11c9e`, `cinematic-production.js?v=9a11c9e` e `cinematic-scroll.js?v=9a11c9e`, forçando navegadores a descartar versões antigas. O Vercel confirmou o deployment `dpl_teHx2mfGyDZaJuqL7S3nmTXXTnWs` como `READY` e `target: production`. Os três assets responderam HTTP 200 no domínio oficial, e a captura pública `production-cache-busted-arrival.png` reproduz a mesma composição cinematográfica da prévia.
