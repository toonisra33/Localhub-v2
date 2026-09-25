import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share2, PlusSquare, MoreVertical, CheckCircle2, AlertCircle } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the install prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow when prompt event is ready
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

  // Android / Other browsers when not running standalone
  return (
    <>
      <button
        onClick={() => setShowAndroidGuide(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all ${className}`}
        aria-label="ติดตั้งเป็นแอปเต็มจอ"
        title="วิธีเปิดเป็นแอปเต็มหน้าจอ 100%"
      >
        <Smartphone size={13} className="text-emerald-100" />
        <span>ติดตั้งแอปเต็มจอ</span>
      </button>

      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="ปิด"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <Smartphone size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">วิธีเปิดแอปเต็มจอ ไร้แถบ Browser</h3>
                <p className="text-xs text-slate-500">สำหรับมือถือ Android / Chrome</p>
              </div>
            </div>

            <div className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11.5px] text-amber-900 flex items-start gap-2">
              <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>ทำไมถึงมีแถบ URL ด้านบน?</strong> หากเคยแตะ "เพิ่มลงในหน้าจอหลัก" แบบปุ่มลัดธรรมดา จะเปิดผ่านเบราว์เซอร์ Chrome ให้ทำตามวิธีด้านล่างเพื่อติดตั้งเป็นแอปแท้ (WebAPK) ครับ
              </span>
            </div>

            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">1</div>
                <p>
                  <strong>ลบไอคอนทางลัดเดิม</strong> ของ LocalHub ออกจากหน้าจอมือถือของคุณก่อน (แตะค้างแล้วลบออก)
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">2</div>
                <p>
                  แตะที่ปุ่ม <strong>จุด 3 จุด (⋮)</strong> <MoreVertical size={13} className="inline mx-0.5 text-slate-800" /> ที่มุมขวาบนของแถบ Chrome
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">3</div>
                <p>
                  เลือกเมนู <strong>"ติดตั้งแอป" (Install app)</strong> หรือ <strong>"ติดตั้ง LocalHub"</strong> (⚠️ ให้เลือกคำว่า <em>"ติดตั้งแอป"</em> ไม่ใช่แค่ <em>"เพิ่มไปยังหน้าจอหลัก"</em>)
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">4</div>
                <p className="flex items-center gap-1">
                  <span>กด <strong>"ติดตั้ง"</strong> แล้วรอสักครู่ ไอคอนแอปแท้จะปรากฏ เปิดแล้วจะ<strong>เต็มจอ 100%</strong> ไม่มีแถบ URL ทันที</span>
                </p>
              </div>
            </div>

            <div className="mt-4 pt-1">
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>เข้าใจแล้ว จะลองทำตามขั้นตอน</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
