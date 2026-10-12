import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X, CheckCircle2, ArrowUpCircle } from 'lucide-react';
import { APP_VERSION, BUILD_DATE, forcePurgeCacheAndReload, checkForAppUpdates } from '../utils/updateManager';

export const AppUpdateBanner: React.FC = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // 1. Listen for Service Worker update available event
    const handleUpdate = () => {
      setHasUpdate(true);
      setIsDismissed(false);
    };

    window.addEventListener('localhub_update_available', handleUpdate);

    // 2. Check for updates on startup and on tab visibility change (e.g. user returns to app)
    const runCheck = async () => {
      const available = await checkForAppUpdates();
      if (available) {
        setHasUpdate(true);
      }
    };

    runCheck();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        runCheck();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('localhub_update_available', handleUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    await forcePurgeCacheAndReload();
  };

  if (!hasUpdate || isDismissed) return null;

  return (
    <aside
      aria-label="การอัปเดตแอป"
      className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg p-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl shadow-2xl border-2 border-blue-400 flex items-center justify-between gap-3 animate-bounce-subtle backdrop-blur-md"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="p-2 bg-blue-500 text-white rounded-xl shadow-xs animate-spin-slow shrink-0">
          <Sparkles className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <div className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
            <span>ตรวจพบเวอร์ชันใหม่ล่าสุด (v{APP_VERSION})</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/30 text-emerald-300 text-[10px] font-bold">
              ใหม่
            </span>
          </div>
          <p className="text-[11px] text-blue-200 truncate">
            มีฟีเจอร์กล้องสด, วิดีโอคลิป และพยากรณ์อากาศสดตามพิกัดจริง
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleApplyUpdate}
          disabled={isUpdating}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1 shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>{isUpdating ? 'กำลังอัปเดต...' : 'อัปเดตทันที'}</span>
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          title="ปิดการแจ้งเตือนนี้"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
