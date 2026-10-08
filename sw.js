// Usap Tayo service worker: caches the app shell only. Never touches OpenAI requests.
const CACHE='usap-202610081229';
const ASSETS=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-192.png","icon-maskable-512.png","apple-touch-icon.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('usap-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
 const isPage=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');
 if(isPage){e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));}return res;}).catch(()=>caches.match('index.html',{ignoreSearch:true}).then(m=>m||caches.match('./'))));return;}
 e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>{const net=fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;}).catch(()=>m);return m||net;}));});
