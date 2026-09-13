# Restored cinematic homepage

This branch restores the cinematic homepage from commit
`9a11c9e80018b3e573d0e8f9f8f74cdffde2d35a` and evolves that same visual
system with verified project content.

## Preserved foundation

- Scene based structure: Arrival, Think/Create/Scale, Work, No Black Box,
  Knight Move and Start a Project.
- Persistent horse canvas and the original scroll controlled choreography.
- Minimal navigation and the original dark, large type art direction.
- Showreel and Evidence chapters remain in the document and are published only
  when real media or verified metrics exist.

## Real content integrated

- CT Fire — Fire Summer.
- Parque José Julião Diniz — launch campaign.
- Black Suplementos — educational brand content.
- Full 14 item source catalogue in `project-catalog.json`.
- Verified client notes, source links and assets in `assets-cavalcante/`.

No performance metric is displayed because
`assets-cavalcante/metrics/resultados-reais.md` has no verified number yet.

## Motion and media

- GSAP, ScrollTrigger and Three.js are served locally from `assets/vendor/`.
- Runtime modes: `full`, `reduced` and `fallback`.
- Use `?motionDebug=1` to inspect the active scene, progress, velocity and mode.
- To enable the showreel, place the real files in `assets-cavalcante/showreel/`
  and register their relative paths in `showreel-config.json`.

This branch is for preview and must not replace production before visual
approval.
