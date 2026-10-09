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

// Safely handle PWA service worker: Do NOT register inside iframes or dev environments to prevent preview locks
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const isIframe = window.self !== window.top;
    if (isIframe) {
      // In an iframe (AI Studio preview), unregister any service workers to keep live updates working
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      }).catch(() => {});
    } else {
      registerSW({
        immediate: false,
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
  }
} catch (e) {
  console.warn('PWA registration skipped:', e);
}

