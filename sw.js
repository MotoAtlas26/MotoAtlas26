/**
 * MotoAtlas26 Service Worker
 * Cache-first para assets estáticos, Network-first para navegación
 * Versión: incrementar al cambiar archivos cacheados
 */
const CACHE_NAME = 'motoatlas-v4';

// Usar rutas relativas al scope del SW para funcionar en GitHub Pages subpath (/MotoAtlas26/)
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './favicon.svg',
  './800MT-X.webp',
  './KTM-1290-S-Adv-S.webp'
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { credentials: 'same-origin' })));
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static, network-first for navigation
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar same-origin
  if (url.origin !== location.origin) return;
  
  // Navegación (HTML) -> Network-first con fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear la respuesta de navegación exitosa
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Offline: servir index.html desde cache (SPA)
          return caches.match('./index.html');
        })
    );
    return;
  }
  
  // Assets estáticos (JS, CSS, imágenes, manifest, iconos) -> Cache-first
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.destination === 'manifest' ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Para imágenes: verificar que la respuesta cacheada sea realmente una imagen
          if (request.destination === 'image') {
            const contentType = cachedResponse.headers.get('content-type');
            if (contentType && contentType.startsWith('image/')) {
              return cachedResponse;
            }
            // Si no es imagen, borrar del cache y caer al fetch
            caches.open(CACHE_NAME).then(cache => cache.delete(request));
          } else {
            return cachedResponse;
          }
        }
        return fetch(request).then((networkResponse) => {
          // Para imágenes: solo cachear si es realmente una imagen
          if (request.destination === 'image') {
            const contentType = networkResponse.headers.get('content-type');
            if (networkResponse.ok && contentType && contentType.startsWith('image/')) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
              return networkResponse;
            }
            // Si no es imagen válida, no cachear y devolver error
            return new Response('', { status: 404, statusText: 'Not an image' });
          }
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }
  
  // Otros: network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Mensaje para skipWaiting desde la app
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});