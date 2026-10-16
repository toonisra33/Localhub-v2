import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle2, Volume2, ShieldCheck, Play, Sparkles } from 'lucide-react';
import {
  isNotificationSupported,
  requestNotificationPermission,
  sendSystemNotification,
  playSynthesizedAlarm,
  triggerDeviceVibration
} from '../utils/notificationService';

export const NotificationActivationBanner: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && isNotificationSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnableNotification = async () => {
    setIsRequesting(true);
    try {
      const perm = await requestNotificationPermission();
      setPermission(perm);

      if (perm === 'granted') {
        // Play alert audio chime
        playSynthesizedAlarm('announcement', 3);
        triggerDeviceVibration([200, 100, 200]);

        // Send confirmation real system notification
        await sendSystemNotification({
          title: '🚨 LocalHub: ระบบแจ้งเตือนพร้อมทำงานจริง!',
          message: 'คุณจะได้รับการแจ้งเตือนภัยฉุกเฉิน บรอดแคสต์ และข่าวสารชุมชนแบบเรียลไทม์ทันที',
          type: 'broadcast',
          severity: 'high'
        });
      }
    } catch (err) {
      console.warn('Notification permission error:', err);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTestNotification = async () => {
    playSynthesizedAlarm('urgent', 3);
    triggerDeviceVibration([400, 150, 400]);

    await sendSystemNotification({
      title: '🚨 [ทดสอบระบบจริง] สัญญาณแจ้งเตือน LocalHub',
      message: 'การแจ้งเตือนนี้ส่งผ่าน Service Worker & Web Notification API ไปยังหน้าจออุปกรณ์ของคุณเรียบร้อยแล้ว',
      type: 'test_signal',
      severity: 'urgent'
    });
  };

  if (isDismissed) return null;

  // If permission is already granted, render a status bar or test trigger
  if (permission === 'granted') {
    return (
      <div className="bg-emerald-900/90 text-white px-4 py-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-emerald-700 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-emerald-500 text-white rounded-xl shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>ระบบแจ้งเตือนฉุกเฉิน & บรอดแคสต์เปิดใช้งานแล้ว (เรียลไทม์ทุกอุปกรณ์)</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 text-[10px] rounded-md border border-emerald-500/40 font-bold">เฉพาะ Admin</span>
            </div>
            <p className="text-[11px] text-emerald-200">
              สถานะพร้อมกระจายสัญญาณเตือนภัยฉุกเฉินและข้อความบรอดแคสต์ไปยังผู้ใช้งานทุกคน
            </p>
          </div>
        </div>

        <button
          onClick={handleTestNotification}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs shrink-0 cursor-pointer"
          title="ทดสอบยิงการแจ้งเตือนจริงมาที่หน้าจอ"
        >
          <BellRing className="w-3.5 h-3.5 animate-bounce" />
          <span>ทดสอบยิงแจ้งเตือนจริง</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-700 text-white px-4 py-3.5 rounded-2xl shadow-md border border-red-700 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-white/20 rounded-xl backdrop-blur-xs animate-pulse shrink-0">
            <Bell className="w-5 h-5 text-yellow-300" />
          </span>
          <div>
            <div className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              <span>เปิดรับการแจ้งเตือนฉุกเฉิน & บรอดแคสต์เรียลไทม์</span>
              <span className="px-1.5 py-0.2 bg-yellow-400 text-slate-950 text-[10px] font-extrabold rounded-md shadow-xs">
                เฉพาะ Admin
              </span>
            </div>
            <p className="text-[11px] text-white/90">
              กดอนุญาตเพื่อให้แอดมินสามารถยิงสัญญาณเตือนภัย เสียงไซเรน และข่าวสารด่วนขึ้นหน้าจอได้จริง
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleEnableNotification}
            disabled={isRequesting}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-yellow-500/30 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <BellRing className="w-4 h-4 text-slate-950" />
            <span>{isRequesting ? 'กำลังขอสิทธิ์...' : 'เปิดรับการแจ้งเตือนทันที'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
