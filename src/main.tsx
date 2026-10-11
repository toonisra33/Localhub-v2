import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker immediately for background sync & native notifications
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('New content available, refreshing...');
  },
  onOfflineReady() {
    console.log('LocalHub is ready to work offline and receive background alerts.');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
