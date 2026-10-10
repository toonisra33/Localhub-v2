import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

function renderApp() {
  const container = document.getElementById('root');
  if (container) {
    try {
      createRoot(container).render(
        <StrictMode>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </StrictMode>
      );
    } catch (err) {
      console.error('Failed to render React app:', err);
    }
  } else {
    // If root is not ready yet, retry when DOMContentLoaded fires
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderApp, { once: true });
    } else {
      setTimeout(renderApp, 50);
    }
  }
}

renderApp();



