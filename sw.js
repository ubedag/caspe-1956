// Sirve primero desde la caché: así la app funciona sin conexión
const C='caspe-v3';
const CORE=['./','index.html','lib/leaflet.js','lib/leaflet.css','detecciones.js','manifest.json','icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE))); self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(caches.open(C).then(c=>c.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request).then(res=>{ if(res.ok) c.put(e.request,res.clone()); return res; }))));
});
