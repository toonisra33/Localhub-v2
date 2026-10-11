import React, { useState } from 'react';
import { Smartphone, Download, X, BellRing, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallGuideModal } from './PWAInstallGuideModal';

export const PWAInstallBanner: React.FC = () => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // If already running standalone as an installed app on device, don't show
  if (isInstalled || isDismissed) {
    return <PWAInstallGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />;
  }

  const handleAction = async () => {
    if (isInstallable) {
      await install();
    } else {
      setIsGuideOpen(true);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-3 py-2 sm:px-6 sm:py-2.5 border-b border-blue-800/80 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
              <Smartphone className="w-4 h-4 animate-pulse" />
            </span>
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-white truncate">
                ติดตั้งแอป LocalHub ลงมือถือ
              </span>
              <span className="hidden md:inline text-blue-200">
                — รับการแจ้งเตือนจากแอปโดยตรง (ไม่ผ่าน Chrome) และแจ้งเตือนหน้าจอแม้ไม่ได้เปิดแอป
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAction}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ติดตั้งแอป</span>
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              title="ปิดแถบนี้"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <PWAInstallGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
};
