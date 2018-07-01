var cacheName='v1';
var cacheFiles=[
  './',
   'index.html',
  'css/currency-Converter.js',
  'image/amy.png',
    'scripts/currency-Converter.js',
       ]
self.addEventListener('install', function(e){
  console.log("[ServiceWorker] Installed")
e.waitUntil(

caches.open(cacheName).then(function(cache){
  console.log("[ServiceWorker] Caching cacheFiles");
  return cache.addAll(cacheFiles);  
})

  )

})

self.addEventListener('active', function(e){
  console.log("[ServiceWorker] Activated")
  e.waitUntil(
    caches.key().then(function(cacheNames){
      return Promise.all(cacheNames.nap(function(thisCacheNames){
        if (thisCacheName !== cacheName) {
          console.log("[ServiceWorker] Removing Cached Files");
          return caches.delete(thisCacheName);
        }


      }))

    })
    )
})

self.addEventListener('fetch', function(e){
  console.log("[ServiceWorker] Fetching", e.request.url);

  e.respondWith(
caches.match(e.request).then(function(response){
if (response){
  console.log("[ServiceWorker] Found in cache", e.request.url);
  return response;
}
var requestClone = e.request.clone();
fetch(requestClone).then(function(response){

if (!response) {
  console.log("[ServiceWorker] No response from fetch");
  return response;
}
var responseClone = response.clone();
caches.open(cacheName).then(function(cache){
  cache.put(e.request, responseClone);
  return response;
});

})
//.catch(function)
})
    )
})
