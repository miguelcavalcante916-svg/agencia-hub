/* AgênciaHub — service worker (app instalável + funcionamento offline)
   Estratégia: rede primeiro, cache como reserva — atualizações chegam na hora
   e o app continua abrindo sem internet. */

var CACHE = 'agenciahub-v14';

var ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/core/trava.js',
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
  './img/favicon.svg',
  './img/icone-192.png',
  './img/icone-512.png',
  './img/icone-maskable-512.png',
  './img/icone-ios-180.png'
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

/* Guarda no cache apenas respostas boas: um 404/500 salvo viraria "arquivo"
   e o app abriria quebrado até o próximo deploy. */
function guardar(req, resp) {
  if (!resp || !resp.ok || resp.type === 'opaque') return;
  var copia = resp.clone();
  caches.open(CACHE).then(function (cache) { return cache.put(req, copia); })
    .catch(function () { /* armazenamento cheio: seguimos sem cachear */ });
}

/* Sinal fraco costuma ser pior que sinal nenhum: o fetch fica pendurado e o
   app trava em tela branca. Damos 3,5s à rede antes de servir o cache. */
function comLimite(promessa, ms) {
  return new Promise(function (ok, falha) {
    var pendente = true;
    var t = setTimeout(function () { if (pendente) { pendente = false; falha(new Error('tempo esgotado')); } }, ms);
    promessa.then(function (r) { if (pendente) { pendente = false; clearTimeout(t); ok(r); } },
                  function (e) { if (pendente) { pendente = false; clearTimeout(t); falha(e); } });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  var caminho = new URL(req.url).pathname;
  var eArquivo = /\.(css|js|png|svg|json)$/.test(caminho) && !/manifest\.json$/.test(caminho);

  /* CSS, JS e imagens: cache primeiro (é seguro — a versão do cache muda a cada
     publicação, então atualização nova chega pelo install). Fica instantâneo. */
  if (eArquivo) {
    e.respondWith(
      caches.match(req).then(function (emCache) {
        if (emCache) return emCache;
        return fetch(req).then(function (resp) { guardar(req, resp); return resp; });
      })
    );
    return;
  }

  /* Página e manifesto: rede primeiro, com limite de tempo, caindo no cache. */
  e.respondWith(
    comLimite(fetch(req), 3500).then(function (resp) {
      guardar(req, resp);
      return resp;
    }).catch(function () {
      return caches.match(req).then(function (emCache) {
        if (emCache) return emCache;
        if (req.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
