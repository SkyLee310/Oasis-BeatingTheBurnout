import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// ─── Retiring the service worker ──────────────────────────────────────────────
// The installable PWA was cut with the rest of the offline story, but a worker
// already registered on somebody's phone outlives the file that installed it —
// it would keep serving the old build forever. So the last thing this app does
// about offline is turn it off, once, on the way in.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then(rs => Promise.all(rs.map(r => r.unregister())))
    .then(() => caches?.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))))
    .catch(() => {
      // Nothing was registered, or the browser will not say. Either is fine.
    })
}
