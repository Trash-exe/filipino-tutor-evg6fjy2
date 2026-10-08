// Usap Tayo service worker: caches the app shell for offline launch. Never touches OpenAI requests.
const CACHE='usap-202610081303';
const ASSETS=["./","index.html","app.css","app.js","lessons.js","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-192.png","icon-maskable-512.png","apple-touch-icon.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('usap-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
// Network-first for everything same-origin (so updates show up on the next launch), cache fallback when offline.
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 const isPage=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');
 const cacheKey=isPage?'index.html':u.pathname.split('/').pop()||'index.html';
 e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(cacheKey,cp));}return res;})
  .catch(()=>caches.open(CACHE).then(c=>c.match(cacheKey)).then(m=>m||caches.match(r,{ignoreSearch:true}))));});
