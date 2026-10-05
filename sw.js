/* BANDUP service worker — network first (updates show on next open), cache fallback (offline).
   Shell + content JSON are precached; audio is cached on first play (full 200 response, served for range requests too).
   Gemini and Apps Script responses are never cached. */
const CACHE = 'bandup-v2.6';
const SHELL = ['./', 'index.html', 'app.js', 'srs.js', 'gem.js', 'rec.js', 'backup.js', 'app.css', 'manifest.webmanifest', 'vendor/ts-fsrs.mjs', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/favicon-32.png', 'icons/apple-touch-icon.png'];
const CONTENT = ['hackers', 'vocab', 'irregular', 'grammar', 'reading', 'listening', 'dictation', 'shadow', 'speaking', 'writing', 'links', 'rubric'].flatMap(f => [`content/${f}.json`, `content/_sample/${f}.json`]);
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all([...SHELL, ...CONTENT].map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || /generativelanguage\.googleapis\.com|script\.google(usercontent)?\.com/.test(r.url)) return;
  if (u.origin === self.location.origin && /\/audio\//.test(u.pathname)) {   // audio: cache first, store the full file once
    e.respondWith(caches.open(CACHE).then(async c => { const hit = await c.match(u.pathname); if (hit) return hit; const res = await fetch(u.pathname); if (res.ok && res.status === 200) c.put(u.pathname, res.clone()); return res; }).catch(() => fetch(r)));
    return;
  }
  e.respondWith(fetch(r).then(res => {
    if (res.ok && res.status === 200 && (u.origin === self.location.origin || /cdn\.jsdelivr\.net/.test(r.url))) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
