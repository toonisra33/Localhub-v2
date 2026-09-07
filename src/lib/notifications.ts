export class AppNotifications {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (e) {
      return false;
    }
  }

  static send(title: string, options?: NotificationOptions) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    
    try {
      if (true) { // Always notify for emergencies
        const notification = new Notification(title, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          ...options
        });
        
        notification.onclick = function () {
          window.focus();
          this.close();
        };
      }
    } catch (e) {
      console.error('Failed to send notification', e);
    }
  }
}
