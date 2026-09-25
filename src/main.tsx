import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { ErrorBoundary } from './components/ErrorBoundary';

// Register PWA service worker immediately
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check update every hour
    }
  },
});

// --- Firebase Password Reset Redirect Logic ---
const searchParams = new URLSearchParams(window.location.search);
const mode = searchParams.get('mode');
const oobCode = searchParams.get('oobCode');
const continueUrl = searchParams.get('continueUrl');

if (mode === 'resetPassword' && oobCode && continueUrl && continueUrl.includes('sponsor-atomy.web.app')) {
  window.location.href = `https://sponsor-atomy.web.app/?mode=resetPassword&oobCode=${oobCode}`;
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}

