import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker with automatic update listener
export const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New version detected on server!');
    // Dispatch event to show in-app update banner
    window.dispatchEvent(new CustomEvent('localhub_update_available'));
  },
  onOfflineReady() {
    console.log('[PWA] LocalHub is ready to work offline and receive background alerts.');
  },
});

// Listen for service worker reload signal
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_PURGED_RELOAD') {
      window.location.reload();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
