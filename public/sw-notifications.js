// LocalHub Background Notification & Service Worker Handler
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for messages from web pages (e.g. Broadcasts, Alerts)
self.addEventListener('message', (event) => {
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
