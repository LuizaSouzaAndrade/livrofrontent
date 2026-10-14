const CACHE_NAME = "meus-livros-v1";
const ARQUIVOS = ["./", "index.html", "style.css", "config.js", "app.js", "manifest.json", "icon.svg"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
});

self.addEventListener("fetch", (evento) => {
  if (evento.request.method !== "GET") return;
  // Só intercepta arquivos do próprio site; chamadas à API vão direto para a rede
  if (new URL(evento.request.url).origin !== self.location.origin) return;
  evento.respondWith(fetch(evento.request).catch(() => caches.match(evento.request)));
});
