// Configure the cache
const name = 'Timer86-v2'
const wait = 1000
const files = [
  'cache.js',
  'manifest.json',
  'normalize.css',
  'index.css',
  'index.html',
  'index.js',
  'alarm.mp3',
  'icon_24.png',
  'icon_196_maskable.png'
]

// Handle installing the service worker
self.addEventListener('install', event => {
  console.log('Installing service worker')
  event.waitUntil(caches.open(name).then(cache => cache.addAll(files)))
})

// Handle fetches from the network, falling back to the cache
self.addEventListener('fetch', event => {

  // Set a timeout for the request to keep from hanging a long time
  const controller = new AbortController()
  setTimeout(() => controller.abort(), wait)

  event.respondWith(fetch(event.request, { signal: controller.signal })
    .then(response => {
      console.log('Fetching from network:', event.request.url)
      return response
    })
    .catch(error => {
      console.warn('Falling back to fetching from cache:', event.request.url)
      return caches.match(event.request)
    })
  )
})
