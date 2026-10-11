// LocalHub Native System & Background Notification Service

export interface NotificationPayload {
  title: string;
  message: string;
  type?: 'broadcast' | 'alert' | 'comment' | 'market';
  severity?: 'urgent' | 'high' | 'normal' | 'special';
  link?: string;
  image?: string;
  targetArea?: string;
}

// BroadcastChannel for cross-tab and background listener
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('localhub-channel');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported:', e);
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Triggers a native system notification through the Service Worker.
 * When the app is installed as a PWA (WebAPK), Android will attribute the
 * notification directly to "LocalHub" with the app icon rather than "Chrome • domain".
 */
export async function sendSystemNotification(payload: NotificationPayload): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  // Auto request permission if default
  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await requestNotificationPermission();
  }

  if (permission !== 'granted') {
    console.log('Notification permission not granted:', permission);
    return false;
  }

  const { title, message, severity, link, image, targetArea } = payload;

  const isUrgent = severity === 'urgent';
  const isHigh = severity === 'high';

  const fullBody = targetArea
    ? `${message}\n📍 พื้นที่เป้าหมาย: ${targetArea}`
    : message;

  interface ExtendedNotificationOptions extends NotificationOptions {
    image?: string;
    vibrate?: number[];
    actions?: Array<{ action: string; title: string; icon?: string }>;
    [key: string]: unknown;
  }

  const notificationOptions: ExtendedNotificationOptions = {
    body: fullBody,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    image: image,
    vibrate: isUrgent
      ? [400, 150, 400, 150, 800]
      : isHigh
      ? [300, 100, 300, 100, 400]
      : [200, 100, 200],
    tag: `localhub-${Date.now()}`,
    renotify: true,
    requireInteraction: isUrgent || isHigh,
    actions: [
      { action: 'open', title: '📱 เปิดอ่านทันที' },
      { action: 'close', title: 'ปิด' }
    ],
    data: {
      url: link ? `/#${link}` : '/',
      timestamp: Date.now()
    }
  };

  // 1. Broadcast to other tabs/workers
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'NEW_BROADCAST',
        payload
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // 2. Try Service Worker Registration (Required for Android WebAPK native notification banner)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, notificationOptions);
        return true;
      }
    } catch (err) {
      console.warn('Service worker showNotification failed, trying fallback:', err);
    }
  }

  // 3. Fallback to standard window Notification
  try {
    const notif = new Notification(title, notificationOptions);
    notif.onclick = () => {
      window.focus();
      if (link) {
        window.location.hash = link;
      }
      notif.close();
    };
    return true;
  } catch (err) {
    console.warn('Fallback Notification constructor failed:', err);
  }

  return false;
}

export function initBackgroundSyncListener(onReceive: (payload: NotificationPayload) => void) {
  if (!broadcastChannel) return () => {};

  const handleMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === 'NEW_BROADCAST' && event.data.payload) {
      onReceive(event.data.payload);
    }
  };

  broadcastChannel.addEventListener('message', handleMessage);
  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleMessage);
    }
  };
}
