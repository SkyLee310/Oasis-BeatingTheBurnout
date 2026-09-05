// ─── Service worker ───────────────────────────────────────────────────────────
// The point of this file is one promise the app makes on screen: your week is on
// your phone, so the number is there on the bus whether or not the data is.
//
// Deliberately small. Navigations go to the network first and fall back to the
// cached shell, so an update always lands; hashed build assets are cache-first,
// because their URL changes whenever their content does. Nothing is ever sent
// anywhere — there is no fetch to a server in this app at all.

const CACHE = 'oasis-v1'

// Relative so the Figma Make subpath deploy resolves the same as a root deploy.
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      // One bad URL must not fail the whole install, so each is added alone.
      .then(cache => Promise.allSettled(SHELL.map(url => cache.add(url))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return
  if (new URL(request.url).origin !== self.location.origin) return

  // A navigation: newest shell if the network is there, cached shell if not.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const copy = res.clone()
          caches.open(CACHE).then(c => c.put('./index.html', copy))
          return res
        })
        .catch(() => caches.match('./index.html').then(hit => hit || caches.match('./'))),
    )
    return
  }

  // Everything else: serve from cache, and fill the cache on the way past.
  event.respondWith(
    caches.match(request).then(hit => hit || fetch(request).then(res => {
      if (res.ok && res.type === 'basic') {
        const copy = res.clone()
        caches.open(CACHE).then(c => c.put(request, copy))
      }
      return res
    })),
  )
})
