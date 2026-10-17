import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// In development, ensure any stale Service Workers from previous production builds are unregistered
if (import.meta.env.DEV && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
      }
    });
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      });
    }
  } catch (e) {
    console.warn('[SW Cleanup] dev cleanup skipped:', e);
  }
}

// Safely register Service Worker asynchronously in production without blocking React render (only when not in iframe)
if (import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator && window.self === window.top) {
  try {
    // Listen for service worker reload signal
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_PURGED_RELOAD') {
        window.location.reload();
      }
    });

    // Only register PWA service worker if supported
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        try {
          registerSW({
            immediate: false,
            onNeedRefresh() {
              console.log('[PWA] New version detected on server!');
              window.dispatchEvent(new CustomEvent('localhub_update_available'));
            },
            onOfflineReady() {
              console.log('[PWA] LocalHub is ready to work offline.');
            },
          });
        } catch (swErr) {
          console.warn('[PWA] registerSW skipped:', swErr);
        }
      })
      .catch((importErr) => {
        console.warn('[PWA] virtual:pwa-register import skipped:', importErr);
      });
  } catch (err) {
    console.warn('[PWA] Service worker setup skipped:', err);
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
