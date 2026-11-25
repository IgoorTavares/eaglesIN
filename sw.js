/* ==========================================================
   Service worker — cache do app shell (offline-first).
   Ao mudar qualquer arquivo, aumente CACHE_VERSION para
   forçar a atualização no celular.
   ========================================================== */
const CACHE_VERSION = 'nuvem-v59';
const SHELL = [
  // O jogo (entrada do app desde a G2)
  './jogo/',
  './jogo/index.html',
  ...['jogo.css', 'jogo.js', 'nucleo.js', 'telas.js', 'fase.js', 'fases.js', 'mundos.js', 'salvar.js', 'cenas.js', 'cenas2.js', 'personagens.js', 'missao.js', 'inicio.js'].map((f) => `./jogo/${f}`),
  ...['neutro', 'alegre', 'bravo', 'bufando', 'cansado', 'debochado', 'decepcionado', 'escutando', 'impaciente', 'pensando', 'raivoso', 'surpreso']
    .map((p) => `./jogo/sprites/pavio-${p}.webp`),
  './',
  './index.html',
  './style.css',
  './app.js',
  './content.js',
  './content-pop.js',
  './js/recorder.js',
  './js/eleven.js',
  './js/vozgemini.js',
  './js/mascot.js',
  './js/curriculum.js',
  './js/learn.js',
  './js/onboarding.js',
  './js/auth.js',
  './icons/mascot/happy.png',
  './icons/mascot/storm.png',
  './js/emotion.js',
  './js/memory.js',
  './js/pavio.js',
  './js/pavio3d.js', // o Three.js e o modelo 3D entram no cache na primeira vez que o 3D é usado
  ...['neutro', 'alegre', 'debochado', 'surpreso', 'pensando', 'impaciente', 'bravo', 'bufando', 'raivoso', 'decepcionado', 'comemorando']
    .map((f) => `./icons/pavio/${f}.jpg`),
  './fonts/inter.woff2',
  './fonts/nunito-sans.woff2',
  './manifest.json',
  './js/store.js',
  './js/voice.js',
  './js/prompts.js',
  './js/falas-pavio.js',
  './js/curso/index.js',
  './js/curso/ajuda.js',
  './js/curso/A1-U1.js',
  './js/curso/A1-U2.js',
  './js/curso/A1-U3.js',
  './js/curso/A1-U4.js',
  './js/curso/A1-U5.js',
  './js/curso/A1-U6.js',
  './js/curso/A1-final.js',
  './js/curso/A2-U1.js',
  './js/curso/A2-U2.js',
  './js/curso/A2-U3.js',
  './js/curso/A2-U4.js',
  './js/curso/A2-U5.js',
  './js/curso/A2-U6.js',
  './js/curso/A2-final.js',
  './js/curso/B1-U1.js',
  './js/curso/B1-U2.js',
  './js/curso/B1-U3.js',
  './js/curso/B1-U4.js',
  './js/curso/B1-U5.js',
  './js/curso/B1-U6.js',
  './js/curso/B1-final.js',
  './js/curso/B2-U1.js',
  './js/curso/B2-U2.js',
  './js/curso/B2-U3.js',
  './js/curso/B2-U4.js',
  './js/curso/B2-U5.js',
  './js/curso/B2-U6.js',
  './js/curso/B2-final.js',
  './js/curso/C1-U1.js',
  './js/curso/C1-U2.js',
  './js/curso/C1-U3.js',
  './js/curso/C1-U4.js',
  './js/curso/C1-U5.js',
  './js/curso/C1-U6.js',
  './js/curso/C1-final.js',
  './js/curso/C2-U1.js',
  './js/curso/C2-U2.js',
  './js/curso/C2-U3.js',
  './js/curso/C2-U4.js',
  './js/curso/C2-U5.js',
  './js/curso/C2-U6.js',
  './js/curso/C2-final.js',
  './js/ai.js',
  './js/pronunciation.js',
  './js/srs.js',
  './js/exercises.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/pavio-marca.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' = busca no servidor, ignorando a cópia velha do navegador
  // (o GitHub Pages deixa arquivos guardados por 10 min).
  e.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      // as falas do Gemini já geradas (voz-gemini-*) ficam: assim não gastam cota de novo
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION && !k.startsWith('voz-')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Nunca cachear a API do Gemini nem nada de outro domínio.
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // A chave local nunca entra no cache.
  if (url.pathname.endsWith('config.local.js')) return;
  // Stale-while-revalidate: responde do cache e atualiza em segundo plano.
  e.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(e.request, { ignoreSearch: true });
      // no-cache: confere com o servidor (barato, responde 304 se não mudou).
      const network = fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
        .then((res) => { if (res.ok) cache.put(e.request, res.clone()); return res; })
        .catch(() => cached);
      return cached || network;
    })
  );
});

// Clique na notificação de lembrete abre/foca o app.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) if ('focus' in c) return c.focus();
      return self.clients.openWindow('./jogo/');
    })
  );
});
