self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
// Gift URLs and API responses are deliberately never cached.
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate')e.respondWith(fetch(e.request).catch(()=>new Response('<meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:system-ui;text-align:center;padding:30vh 24px">KUSUDAMA<br><br>インターネットにつないで、もう一度開いてください。</body>',{headers:{'Content-Type':'text/html;charset=utf-8'}})))});
