import React, { useState, useEffect } from 'react';
import { Bell, Volume2, CheckCircle2, X } from 'lucide-react';
import { AppNotifications } from '../lib/notifications';
import { soundManager } from '../lib/sounds';
import { safeStorage } from '../lib/safeStorage';

export function NotificationPermissionBanner() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('granted');
  const [isDismissed, setIsDismissed] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    // Check initial permission status
    const status = AppNotifications.getPermissionStatus();
    setPermission(status);

    const dismissedKey = 'locallink_notif_banner_dismissed';
    setIsDismissed(safeStorage.getItem(dismissedKey) === 'true');

    // Register service worker immediately on mount
    AppNotifications.registerServiceWorker();
  }, []);

  const handleEnable = async () => {
    setIsTesting(true);
    soundManager.unlockAudio();

    const granted = await AppNotifications.requestPermission();
    if (granted) {
      setPermission('granted');
    }
    setIsTesting(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    safeStorage.setItem('locallink_notif_banner_dismissed', 'true');
  };

  // If already granted, dismissed, or unsupported, don't show prompt
  if (permission === 'granted' || permission === 'unsupported' || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-40 max-w-sm pointer-events-auto animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 text-white flex items-center justify-center shrink-0 shadow-md">
          <Bell size={18} className="animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-extrabold text-white leading-tight flex items-center gap-1.5">
            <span>เปิดรับสัญญาณเตือนบรอดแคสต์</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          </h4>
          <p className="text-[11px] text-slate-300 leading-snug mt-1">
            เพื่อให้เสียงสัญญาณดังทันทีและมีข้อความเด้งขึ้นหน้าจอมือถือเมื่อมีประกาศฉุกเฉินจากแอดมิน
          </p>

          <div className="flex items-center gap-2 mt-2.5 pt-1">
            <button
              type="button"
              onClick={handleEnable}
              disabled={isTesting}
              className="py-1.5 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-[11px] font-extrabold shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Volume2 size={13} />
              <span>{isTesting ? 'กำลังเปิดใช้งาน...' : 'เปิดรับการแจ้งเตือน'}</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-[11px] text-slate-400 hover:text-slate-200 py-1.5 px-2 font-medium"
            >
              ไว้ภายหลัง
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-lg"
          aria-label="ปิดการแจ้งเตือน"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
