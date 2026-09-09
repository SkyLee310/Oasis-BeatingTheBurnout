import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { OasisProvider } from './state/store'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OasisProvider>
      <App />
    </OasisProvider>
  </React.StrictMode>,
)

// ─── Offline ──────────────────────────────────────────────────────────────────
// Production only: a service worker in dev would serve stale modules over Vite's
// HMR and cost more time than it saves. The scope is derived from BASE_URL so a
// subpath deploy registers correctly.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(() => {
        // No offline support then. Everything still works online, so stay quiet.
      })
  })
}
