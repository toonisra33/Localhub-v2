import React, { useState } from 'react';
import { ExternalLink, X, CheckCircle2, ShieldCheck } from 'lucide-react';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.toon.localhub&pcampaignid=web_share';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [showPlayStoreModal, setShowPlayStoreModal] = useState(false);

  const handleOpenPlayStore = () => {
    // Try opening via standard Play Store link
    window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <button
        onClick={() => setShowPlayStoreModal(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-950/20 active:scale-95 transition-all ${className}`}
        aria-label="ดาวน์โหลดผ่าน Google Play Store"
        title="ดาวน์โหลดแอป LocalHub บน Google Play Store"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 0 1-.61-.914c-.16-.423-.16-.921 0-1.424V4.152c0-.503 0-1.001.16-1.424.12-.34.33-.66.449-.914zm11.234 11.238l2.428 2.428-11.83 6.83 9.402-9.258zm2.428-2.428l-2.428 2.428-9.402-9.258 11.83 6.83zm1.053 1.054l2.84 1.64c1.11.64 1.11 1.68 0 2.32l-2.84 1.64-2.11-2.11 2.11-2.49z"/>
        </svg>
        <span>Play Store</span>
      </button>

      {showPlayStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-5 shadow-2xl border border-slate-200 relative text-left">
            <button
              onClick={() => setShowPlayStoreModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="ปิด"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a2.38 2.38 0 0 1-.61-.914c-.16-.423-.16-.921 0-1.424V4.152c0-.503 0-1.001.16-1.424.12-.34.33-.66.449-.914zm11.234 11.238l2.428 2.428-11.83 6.83 9.402-9.258zm2.428-2.428l-2.428 2.428-9.402-9.258 11.83 6.83zm1.053 1.054l2.84 1.64c1.11.64 1.11 1.68 0 2.32l-2.84 1.64-2.11-2.11 2.11-2.49z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-[15px] leading-tight">
                  ดาวน์โหลด LocalHub
                </h3>
                <p className="text-[12px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                  <ShieldCheck size={13} />
                  ผ่าน Google Play Store เท่านั้น
                </p>
              </div>
            </div>

            <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-[12px] text-slate-700 mb-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>การติดตั้ง application ต้องทำผ่านการดาวน์โหลดจาก <strong>Google Play Store เท่านั้น</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>เปิดใช้งานได้เต็มหน้าจอ รองรับแจ้งเตือน และมีความปลอดภัยสูงสุด</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleOpenPlayStore}
                className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-black text-white text-[13px] font-extrabold transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
              >
                <span>เปิดดูใน Google Play</span>
                <ExternalLink size={14} />
              </button>
              
              <button
                onClick={() => setShowPlayStoreModal(false)}
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-[12px] font-bold transition text-center"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
