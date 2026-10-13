// Version tag to force cache invalidation upon updates
const SW_VERSION = 'localhub-v1.4.0-20261013';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Invalidate all stale caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== SW_VERSION && !name.includes('google-fonts')) {
              console.log('[SW] Purging outdated cache:', name);
              return caches.delete(name);
            }
          })
        );
      })
    ])
  );
});

// Listen for messages from web pages (e.g. Broadcasts, Alerts, Test Signals, Force Update)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FORCE_UPDATE_CACHE') {
    caches.keys().then((names) => {
      return Promise.all(names.map((n) => caches.delete(n)));
    }).then(() => {
      self.skipWaiting();
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((c) => c.postMessage({ type: 'CACHE_PURGED_RELOAD' }));
      });
    });
    return;
  }
  if (event.data && event.data.type === 'BROADCAST_TEST_SIGNAL') {
    const payload = event.data.payload || {};
    const title = payload.title || '🚨 [ทดสอบระบบ] สัญญาณแจ้งเตือนฉุกเฉินทุกอุปกรณ์';
    const testOptions = {
      body: payload.message || 'ผู้ดูแลระบบกำลังทดสอบระบบเสียงไซเรนและการสั่นสะเทือนบนอุปกรณ์ทั้งหมด',
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: payload.vibrationPattern || [500, 200, 500, 200, 1000],
      tag: 'localhub-test-alert-' + (payload.id || Date.now()),
      renotify: true,
      requireInteraction: true,
      actions: [
        { action: 'open', title: '📱 เปิดดูการทดสอบ' },
        { action: 'close', title: 'ปิด' }
      ],
      data: { url: '/#broadcasts' }
    };

    event.waitUntil(self.registration.showNotification(title, testOptions));
    return;
  }

  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const defaultOptions = {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200, 100, 400],
      tag: (options && options.tag) || 'localhub-notification-' + Date.now(),
      renotify: true,
      requireInteraction: (options && options.requireInteraction) ?? true,
      actions: [
        { action: 'open', title: '📱 เปิดอ่าน' },
        { action: 'close', title: 'ปิด' }
      ],
      data: (options && options.data) || { url: '/' }
    };

    event.waitUntil(
      self.registration.showNotification(title, {
        ...defaultOptions,
        ...options,
        // Ensure icon & badge are present
        icon: (options && options.icon) || '/pwa-192x192.png',
        badge: (options && options.badge) || '/pwa-192x192.png',
      })
    );
  }
});

// Listen for Push events from push servers
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'LocalHub แจ้งเตือนใหม่', message: event.data.text() };
    }
  }

  const title = data.title || '🚨 LocalHub แจ้งเตือนเหตุการณ์ด่วน';
  const options = {
    body: data.message || data.body || 'มีข้อมูลข่าวสารหรือการแจ้งเตือนใหม่ในพื้นที่ของคุณ',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    image: data.image || data.mediaUrl,
    vibrate: [300, 100, 300, 100, 400],
    tag: data.id || 'broadcast-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    actions: [
      { action: 'open', title: '📱 เปิดอ่าน' },
      { action: 'close', title: 'ปิด' }
    ],
    data: {
      url: data.url || (data.link ? `/#${data.link}` : '/'),
      id: data.id
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle clicking on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app window is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // If app window is closed, open as standalone window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
