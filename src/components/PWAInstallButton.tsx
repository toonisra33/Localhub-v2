import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share2, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the install prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all ${className}`}
        aria-label="ติดตั้งแอปบนมือถือ"
      >
        <Download size={14} className="stroke-[2.5]" />
        <span>ติดตั้งแอป</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-900 active:scale-95 text-slate-200 text-xs font-medium border border-slate-700 shadow-sm transition-all ${className}`}
          aria-label="ติดตั้งบน iOS"
        >
          <Smartphone size={13} className="text-emerald-400" />
          <span>ติดตั้งบน iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                aria-label="ปิด"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Smartphone size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">ติดตั้ง LocalHub บน iPhone/iPad</h3>
                  <p className="text-xs text-slate-500">เพื่อเปิดใช้งานแบบเต็มหน้าจอเหมือนแอปแท้</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</div>
                  <p>แตะปุ่ม <strong>แชร์ (Share)</strong> <Share2 size={13} className="inline mx-1 text-sky-600" /> ที่แถบเครื่องมือของ Safari ด้านล่าง</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</div>
                  <p>เลื่อนลงแล้วแตะเลือก <strong>"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</strong> <PlusSquare size={13} className="inline mx-1 text-slate-800" /></p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</div>
                  <p>แตะ <strong>"เพิ่ม" (Add)</strong> มุมขวาบนเพื่อเสร็จสิ้น</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
