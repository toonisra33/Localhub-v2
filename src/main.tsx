import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { ErrorBoundary } from './components/ErrorBoundary';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

// Safely register PWA service worker after initial UI mounts
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    registerSW({
      immediate: true,
      onRegisteredSW(_swUrl, registration) {
        if (registration) {
          setInterval(() => {
            try { registration.update(); } catch {}
          }, 60 * 60 * 1000); // Check update every hour
        }
      },
      onRegisterError(err) {
        console.warn('PWA registration notice:', err);
      }
    });
  }
} catch (e) {
  console.warn('PWA registration skipped:', e);
}

