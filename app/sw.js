/* AgênciaHub — service worker (app instalável + funcionamento offline)
   Estratégia: rede primeiro, cache como reserva — atualizações chegam na hora
   e o app continua abrindo sem internet. */

var CACHE = 'agenciahub-v7';

var ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/core/store.js',
  './js/core/ui.js',
  './js/views/dashboard.js',
  './js/views/clientes.js',
  './js/views/projetos.js',
  './js/views/tarefas.js',
  './js/views/calendario.js',
  './js/views/conteudo.js',
  './js/views/aprovacoes.js',
  './js/views/propostas.js',
  './js/views/leads.js',
  './js/views/financeiro.js',
  './js/views/equipamentos.js',
  './js/views/equipe.js',
  './js/views/trafego.js',
  './js/views/portal.js',
  './js/views/assistente.js',
  './js/views/meusite.js',
  './js/views/config.js',
  './js/app.js',
  './img/icone.svg',
  './img/icone-192.png',
  './img/icone-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(ARQUIVOS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (chaves) {
      return Promise.all(chaves.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(function (resp) {
      var copia = resp.clone();
      caches.open(CACHE).then(function (cache) { cache.put(req, copia); });
      return resp;
    }).catch(function () {
      return caches.match(req).then(function (emCache) {
        if (emCache) return emCache;
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
