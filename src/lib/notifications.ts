/**
 * AppNotifications & Mobile System Notification Engine
 * Handles Native Push & Service Worker Notifications across Android, iOS PWA, and Desktop
 * Ensures notifications pop up like SMS / Emergency Alert on mobile devices
 */

import { soundManager } from './sounds';

export interface BroadcastNotificationData {
  id: string;
  title: string;
  message: string;
  category?: string;
  severity?: string;
  targetArea?: string;
}

export class AppNotifications {
  private static swRegistration: ServiceWorkerRegistration | null = null;
  private static isSwRegistered: boolean = false;

  /**
   * Register the root service worker (/sw.js) for handling background & lockscreen notifications
   */
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.swRegistration = registration;
      this.isSwRegistered = true;
      console.log('✅ LocalHub Notification Service Worker registered successfully:', registration.scope);

      // Listen for message from service worker when user clicks notification
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'FOCUS_BROADCAST') {
          window.focus();
        }
      });

      return registration;
    } catch (error) {
      console.warn('Service worker registration failed:', error);
      return null;
    }
  }

  /**
   * Check if the device has granted notification permissions
   */
  static hasPermission(): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    return Notification.permission === 'granted';
  }

  /**
   * Get the current permission status ('default' | 'granted' | 'denied')
   */
  static getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Prompt user for notification permission (Must be triggered by user gesture)
   */
  static async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    
    // Unlock audio context at the same time
    soundManager.unlockAudio();

    if (Notification.permission === 'granted') {
      await this.registerServiceWorker();
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.registerServiceWorker();
        // Play gentle chime and trigger sample notification to confirm
        this.sendTestNotification();
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Notification permission request error:', e);
      return false;
    }
  }

  /**
   * Send a high-priority Broadcast Notification to the mobile device
   * Pops up on the user's phone screen like a mobile message / emergency cell broadcast
   */
  static async sendBroadcastNotification(data: BroadcastNotificationData): Promise<void> {
    const title = data.category === 'emergency' 
      ? `🚨 แจ้งเตือนฉุกเฉิน: ${data.title}`
      : `📢 บรอดแคสต์จากแอดมิน: ${data.title}`;

    const bodyText = data.targetArea 
      ? `${data.message}\n📍 พื้นที่เป้าหมาย: ${data.targetArea}`
      : data.message;

    const notificationOptions: any = {
      body: bodyText,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [500, 150, 500, 150, 800],
      tag: `broadcast-alert-${data.id}`,
      renotify: true,
      requireInteraction: true,
      silent: false, // Forces phone to ring native alert sound
      timestamp: Date.now(),
      data: {
        url: '/',
        broadcastId: data.id,
        timestamp: Date.now()
      },
      actions: [
        { action: 'open', title: '📱 เปิดอ่านทันที' },
        { action: 'close', title: 'ปิด' }
      ]
    };

    // 1. Mobile Phone Vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([500, 150, 500, 150, 800]);
      } catch {}
    }

    // 2. If notifications not supported or denied, skip native popup
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      // Strategy A: Use ServiceWorker showNotification (REQUIRED for Android Mobile & PWA)
      if ('serviceWorker' in navigator) {
        try {
          let reg = this.swRegistration;
          if (!reg) {
            reg = await navigator.serviceWorker.getRegistration('/');
          }
          if (!reg) {
            reg = await navigator.serviceWorker.ready;
          }

          if (reg && 'showNotification' in reg) {
            await reg.showNotification(title, notificationOptions);
            return;
          }
        } catch (swErr) {
          console.warn('SW showNotification fallback:', swErr);
        }
      }

      // Strategy B: Fallback to window Notification (for desktop browsers)
      const notification = new Notification(title, notificationOptions);
      notification.onclick = function () {
        window.focus();
        this.close();
      };
    } catch (e) {
      console.error('Failed to trigger native notification popup:', e);
    }
  }

  /**
   * Generic notification sender
   */
  static async send(title: string, options?: NotificationOptions): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      if ('serviceWorker' in navigator) {
        const reg = this.swRegistration || (await navigator.serviceWorker.getRegistration('/'));
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            ...options
          });
          return;
        }
      }

      const notif = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });
      notif.onclick = function () {
        window.focus();
        this.close();
      };
    } catch (e) {
      console.error('Failed to send notification', e);
    }
  }

  /**
   * Test the notification & sound system immediately
   */
  static async sendTestNotification(): Promise<void> {
    soundManager.unlockAudio();
    soundManager.playBroadcastAlertSound('urgent');

    await this.sendBroadcastNotification({
      id: 'test_' + Date.now(),
      title: 'ทดสอบสัญญาณแจ้งเตือนและบรอดแคสต์',
      message: 'ระบบแจ้งเตือนและเสียงสัญญาณทำงานสมบูรณ์! เมื่อแอดมินส่งบรอดแคสต์จะเด้งขึ้นหน้าจอของคุณทันที',
      category: 'announcement',
      severity: 'normal',
      targetArea: 'ทุกอุปกรณ์ที่เปิดรับการแจ้งเตือน'
    });
  }
}
