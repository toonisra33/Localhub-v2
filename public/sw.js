// LocalHub Push & Notification Service Worker
// Handles immediate background & foreground notifications and vibration alerts for broadcasts

const SW_VERSION = 'localhub-broadcast-sw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('[SW] LocalHub Broadcast Service Worker activated:', SW_VERSION);
    })
  );
});

// Handle push events (for Web Push Protocol)
self.addEventListener('push', (event) => {
  let payload = {
    title: '📢 บรอดแคสต์แจ้งเตือนด่วนจากแอดมิน',
    message: 'มีประกาศสำคัญจากศูนย์บัญชาการชุมชน LocalHub',
    category: 'emergency',
    id: 'push_' + Date.now()
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (e) {
      payload.message = event.data.text() || payload.message;
    }
  }

  const title = payload.title || '📢 บรอดแคสต์แจ้งเตือนด่วน';
  const options = {
    body: payload.message || 'แตะเพื่อเปิดอ่านรายละเอียดข้อความ',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [500, 150, 500, 150, 800],
    tag: 'broadcast-' + (payload.id || 'active'),
    renotify: true,
    requireInteraction: true,
    silent: false,
    timestamp: Date.now(),
    data: {
      url: '/',
      broadcastId: payload.id,
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: '📱 เปิดอ่านทันที' },
      { action: 'close', title: 'ปิด' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle inter-process message to trigger native mobile system notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_BROADCAST_NOTIFICATION') {
    const { title, options } = event.data;
    const notificationOptions = {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [500, 150, 500, 150, 800],
      renotify: true,
      requireInteraction: true,
      silent: false,
      timestamp: Date.now(),
      ...options
    };

    event.waitUntil(
      self.registration.showNotification(title, notificationOptions)
    );
  }
});

// Handle clicking on the notification on mobile lock screen, heads-up, or notification drawer
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  const broadcastId = event.notification.data ? event.notification.data.broadcastId : null;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If the app is open in any window/tab, focus it and tell it to show the broadcast
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'FOCUS_BROADCAST',
            broadcastId: broadcastId
          });
          return client.focus();
        }
      }

      // If no window is currently open, open a new window to the app
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
