// Teselas: primero desde la caché (se guardan con "Descargar todo").
// Página y datos: primero desde internet si hay, para recibir actualizaciones; si no, desde la caché.
const TILES='caspe-v3';            // misma caché que usa el botón "Descargar todo": no se borra al actualizar
const CORE='caspe-core-v5';
const FILES=['./','index.html','lib/leaflet.js','lib/leaflet.css','detecciones.js','manifest.json','icon.png','tiles.json'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CORE).then(c=>c.addAll(FILES))); self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==TILES&&k!==CORE).map(k=>caches.delete(k))))
  // la foto de 1956 se ha mejorado y ahora está en tiles/hist56: borra la versión antigua guardada
  .then(()=>caches.open(TILES)).then(c=>c.keys().then(rs=>Promise.all(rs.filter(r=>r.url.includes('/tiles/hist/')).map(r=>c.delete(r)))))
  .then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.pathname.includes('/tiles/')){
    e.respondWith(caches.match(req,{ignoreSearch:true}).then(r=>r||fetch(req).then(res=>{ if(res.ok){const cp=res.clone(); caches.open(TILES).then(c=>c.put(req,cp));} return res; })));
  } else {
    e.respondWith(fetch(req).then(res=>{ if(res.ok){const cp=res.clone(); caches.open(CORE).then(c=>c.put(req,cp));} return res; })
      .catch(()=>caches.open(CORE).then(c=>c.match(req,{ignoreSearch:true}).then(r=>r||c.match('index.html'))).then(r=>r||caches.match(req,{ignoreSearch:true}))));
  }
});
