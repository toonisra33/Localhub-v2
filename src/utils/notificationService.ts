// LocalHub Native System & Background Notification Service
import { SignalTestPayload, TestSoundType } from '../types';

export interface NotificationPayload {
  title: string;
  message: string;
  type?: 'broadcast' | 'alert' | 'comment' | 'market' | 'test_signal';
  severity?: 'urgent' | 'high' | 'normal' | 'special';
  link?: string;
  image?: string;
  targetArea?: string;
  vibratePattern?: number[];
}

// Dedicated BroadcastChannels for cross-tab and background listener
let broadcastChannel: BroadcastChannel | null = null;
let testSignalChannel: BroadcastChannel | null = null;

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('localhub-channel');
    testSignalChannel = new BroadcastChannel('localhub-test-signal-channel');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported:', e);
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function isVibrationSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
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
 * Triggers hardware vibration on mobile/tablet devices
 */
export function triggerDeviceVibration(pattern: number[] = [400, 150, 400, 150, 800]): boolean {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      return navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Device vibration failed:', e);
    }
  }
  return false;
}

/**
 * Stops ongoing hardware vibration
 */
export function stopDeviceVibration(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(0);
    } catch {
      // ignore
    }
  }
}

// Global active audio context reference for alarms
let activeAudioCtx: AudioContext | null = null;
let activeAudioInterval: ReturnType<typeof setInterval> | null = null;

/**
 * High-precision Web Audio API Synthesizer for Alert Signals & Sirens.
 * Returns a controller with a .stop() method.
 */
export function playSynthesizedAlarm(
  soundType: TestSoundType = 'siren',
  durationSec: number = 5
): { stop: () => void } {
  // Stop any previously playing alert
  stopSynthesizedAlarm();

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) {
      return { stop: () => {} };
    }

    const ctx = new AudioContextClass();
    activeAudioCtx = ctx;

    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(e => console.warn(e));
    }

    const startTime = ctx.currentTime;
    const endTime = startTime + durationSec;

    if (soundType === 'siren') {
      // Authentic emergency warble siren: sweeps between 700Hz and 1100Hz every 0.6s
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.3, startTime);

      // LFO for pitch modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(2.5, startTime); // 2.5 cycles per sec
      lfoGain.gain.setValueAtTime(250, startTime); // +/- 250 Hz

      osc.frequency.setValueAtTime(900, startTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(startTime);
      osc.start(startTime);

      lfo.stop(endTime);
      osc.stop(endTime);
      gain.gain.exponentialRampToValueAtTime(0.001, endTime);

    } else if (soundType === 'urgent') {
      // Rapid triple beep pulsed alarm
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.3, startTime);
      masterGain.connect(ctx.destination);

      let step = 0;
      const beepInterval = 0.25;
      const totalSteps = Math.floor(durationSec / beepInterval);

      for (let i = 0; i < totalSteps; i++) {
        const t = startTime + i * beepInterval;
        const freq = i % 2 === 0 ? 880 : 1174.66; // A5 and D6

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(t);
        osc.stop(t + 0.18);
      }
    } else if (soundType === 'high') {
      // Standard two-tone emergency alert (660Hz / 880Hz)
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.28, startTime);
      masterGain.connect(ctx.destination);

      const cycles = Math.floor(durationSec / 0.5);
      for (let i = 0; i < cycles; i++) {
        const t = startTime + i * 0.5;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(i % 2 === 0 ? 660 : 880, t);
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(t);
        osc.stop(t + 0.45);
      }
    } else {
      // announcement chime (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      const noteDuration = 0.25;
      notes.forEach((freq, idx) => {
        const t = startTime + idx * noteDuration;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    }

    const timerId = setTimeout(() => {
      stopSynthesizedAlarm();
    }, durationSec * 1000);

    return {
      stop: () => {
        clearTimeout(timerId);
        stopSynthesizedAlarm();
      }
    };
  } catch (err) {
    console.warn('Audio alarm playback failed:', err);
    return { stop: () => {} };
  }
}

/**
 * Stops any actively sounding alert synthesizer
 */
export function stopSynthesizedAlarm(): void {
  if (activeAudioInterval) {
    clearInterval(activeAudioInterval);
    activeAudioInterval = null;
  }
  if (activeAudioCtx) {
    try {
      activeAudioCtx.close().catch(() => {});
    } catch {
      // ignore
    }
    activeAudioCtx = null;
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
    return false;
  }

  const { title, message, severity, link, image, targetArea, vibratePattern } = payload;

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

  const defaultVibrate = isUrgent
    ? [400, 150, 400, 150, 800]
    : isHigh
    ? [300, 100, 300, 100, 400]
    : [200, 100, 200];

  const notificationOptions: ExtendedNotificationOptions = {
    body: fullBody,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    image: image,
    vibrate: vibratePattern || defaultVibrate,
    tag: `localhub-${Date.now()}`,
    renotify: true,
    requireInteraction: isUrgent || isHigh || payload.type === 'test_signal',
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

/**
 * Broadcasts a test signal to ALL connected devices/tabs/windows.
 * Uses BroadcastChannel, localStorage sync (for cross-window/PWA instances),
 * and ServiceWorker push.
 */
export function broadcastTestSignalToAllDevices(payload: SignalTestPayload): void {
  // 1. BroadcastChannel
  if (testSignalChannel) {
    try {
      testSignalChannel.postMessage({
        type: 'ALL_DEVICES_TEST_SIGNAL',
        payload
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // 2. Storage event for cross-browser-window and standalone PWA sync
  try {
    localStorage.setItem(
      'localhub_device_test_signal',
      JSON.stringify({ ...payload, _trigger: Date.now() })
    );
  } catch (e) {
    console.warn(e);
  }

  // 3. Post to Service Worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({
        type: 'BROADCAST_TEST_SIGNAL',
        payload
      });
    } catch (e) {
      console.warn(e);
    }
  }

  // 4. Send native system notification
  sendSystemNotification({
    title: payload.title,
    message: payload.message,
    type: 'test_signal',
    severity: payload.severity,
    vibratePattern: payload.vibrationPattern || [500, 200, 500, 200, 1000]
  }).catch(() => {});
}

/**
 * Sets up listeners for test signals incoming from other devices/windows
 */
export function initTestSignalListener(onSignal: (payload: SignalTestPayload) => void): () => void {
  // 1. Listen via BroadcastChannel
  const handleBcMessage = (event: MessageEvent) => {
    if (
      event.data &&
      event.data.type === 'ALL_DEVICES_TEST_SIGNAL' &&
      event.data.payload
    ) {
      onSignal(event.data.payload);
    }
  };

  if (testSignalChannel) {
    testSignalChannel.addEventListener('message', handleBcMessage);
  }

  // 2. Listen via Storage Event (Cross-window / PWA sync)
  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'localhub_device_test_signal' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed && parsed.id) {
          onSignal(parsed);
        }
      } catch (e) {
        console.warn(e);
      }
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    if (testSignalChannel) {
      testSignalChannel.removeEventListener('message', handleBcMessage);
    }
    window.removeEventListener('storage', handleStorage);
  };
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
