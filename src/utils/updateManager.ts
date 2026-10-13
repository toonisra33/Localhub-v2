// LocalHub App Update & Cache Invalidation Manager
// Solves issues where installed Android Play Store apps / PWAs show old cached versions

export const APP_VERSION = '1.4.0';
export const BUILD_DATE = '2026-10-13';
export const BUILD_ID = 'localhub_build_20261013_v140_live';

let updateCallback: ((hasUpdate: boolean) => void) | null = null;
let updateWorker: ServiceWorker | null = null;

export function registerUpdateListener(callback: (hasUpdate: boolean) => void) {
  updateCallback = callback;
}

export function setWaitingWorker(worker: ServiceWorker) {
  updateWorker = worker;
  if (updateCallback) {
    updateCallback(true);
  }
}

/**
 * Check if a new version is available from the server or service worker
 */
export async function checkForAppUpdates(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return false;

    // Trigger check on server
    await reg.update();

    if (reg.waiting) {
      setWaitingWorker(reg.waiting);
      return true;
    }

    if (reg.installing) {
      reg.installing.addEventListener('statechange', (e) => {
        const sw = e.target as ServiceWorker;
        if (sw.state === 'installed' && navigator.serviceWorker.controller) {
          setWaitingWorker(sw);
        }
      });
    }

    return false;
  } catch (err) {
    console.warn('[updateManager] Error checking for updates:', err);
    return false;
  }
}

/**
 * Force purge all cached assets (CacheStorage, ServiceWorker) and hard reload
 * Works directly on Android Play Store (TWA / WebView / PWA / Chrome)
 */
export async function forcePurgeCacheAndReload(): Promise<void> {
  console.log('[updateManager] Purging all caches and reloading...');

  try {
    // 1. Tell service worker to purge its caches
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'FORCE_UPDATE_CACHE' });
    }

    // 2. Clear all client CacheStorage caches
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }

    // 3. Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));
    }
  } catch (err) {
    console.warn('[updateManager] Error during cache purge:', err);
  }

  // 4. Force hard reload with timestamp query to bust browser cache
  setTimeout(() => {
    const cleanUrl = window.location.origin + window.location.pathname + '?v=' + Date.now();
    window.location.replace(cleanUrl);
  }, 200);
}

/**
 * Apply waiting update and reload
 */
export function applyUpdate(): void {
  if (updateWorker) {
    updateWorker.postMessage({ type: 'SKIP_WAITING' });
  }
  forcePurgeCacheAndReload();
}
