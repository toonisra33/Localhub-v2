// Safe storage wrapper that never throws, even in cross-origin iframes,
// Safari Private Mode, or browsers with "Block third-party cookies" enabled.

class SafeStorage {
  private memStorage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Access denied or blocked in iframe
    }
    return this.memStorage.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Access denied or blocked in iframe
    }
    this.memStorage.set(key, value);
  }

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.removeItem(key);
      }
    } catch {}
    this.memStorage.delete(key);
  }

  clear(): void {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.clear();
      }
    } catch {}
    this.memStorage.clear();
  }
}

export const safeStorage = new SafeStorage();
