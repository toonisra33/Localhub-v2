import React from 'react';
import {
  AlertTriangle,
  Radio,
  Volume2,
  VolumeX,
  Smartphone,
  BellRing,
  X
} from 'lucide-react';
import { useBroadcast } from '../../context/BroadcastContext';

export const AllDevicesTestAlertModal: React.FC = () => {
  const { activeTestSignal, dismissTestSignal } = useBroadcast();

  if (!activeTestSignal) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        // Allow tapping outside to close
        if (e.target === e.currentTarget) {
          dismissTestSignal();
        }
      }}
    >
      {/* Container with strict mobile viewport containment */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-red-600 overflow-hidden max-h-[88vh] flex flex-col animate-bounce-subtle">
        {/* Urgent Top Header - Always visible & pinned */}
        <div className="shrink-0 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 bg-white/20 rounded-xl shrink-0 animate-pulse">
              <BellRing className="w-5 h-5 text-white" />
            </span>
            <div className="min-w-0">
              <span className="px-1.5 py-0.2 rounded-full bg-white text-red-700 text-[10px] font-black tracking-wide uppercase inline-block">
                TEST SIGNAL
              </span>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight truncate text-white">
                ทดสอบสัญญาณเตือนภัยทุกอุปกรณ์
              </h3>
            </div>
          </div>

          {/* Prominent, easy-to-tap close button */}
          <button
            onClick={dismissTestSignal}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 active:scale-90 text-white transition shrink-0 ml-2 shadow-xs"
            title="ปิดการแจ้งเตือน (กากบาท)"
            aria-label="ปิดการแจ้งเตือน"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-slate-800">
          {/* Audio & Waveform Visualization */}
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-center space-y-1.5">
            <div className="flex items-center gap-1.5 h-7">
              <span className="w-1.5 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="w-1.5 h-6 bg-red-600 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-4 bg-red-500 rounded-full animate-pulse delay-100"></span>
              <span className="w-1.5 h-7 bg-red-600 rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-5 bg-red-500 rounded-full animate-pulse delay-200"></span>
              <span className="w-1.5 h-6 bg-red-600 rounded-full animate-bounce delay-300"></span>
              <span className="w-1.5 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </div>
            <div className="text-xs font-bold text-red-700 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span>เสียงไซเรนและการสั่นสะเทือนกำลังทำงานพร้อมกัน</span>
            </div>
          </div>

          {/* Test Signal Details */}
          <div className="space-y-1">
            <h4 className="font-black text-slate-900 text-sm sm:text-base">
              {activeTestSignal.title || '🚨 [ทดสอบระบบ] สัญญาณแจ้งเตือนฉุกเฉินทุกอุปกรณ์'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeTestSignal.message || 'ผู้ดูแลระบบ (Admin) กำลังทดสอบระบบส่งสัญญาณเตือนภัย เสียงไซเรน และการสั่นสะเทือนพร้อมกันทุกอุปกรณ์ที่ติดตั้งแอพพลิเคชั่น'}
            </p>
          </div>

          {/* Diagnostics 3-column Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 mx-auto" />
              <div className="text-[10px] font-bold text-slate-700">เสียงไซเรน</div>
              <div className="text-[9px] text-emerald-600 font-semibold">กำลังส่งเสียง</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 mx-auto" />
              <div className="text-[10px] font-bold text-slate-700">การสั่นสะเทือน</div>
              <div className="text-[9px] text-emerald-600 font-semibold">สั่นตามจังหวะ</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-0.5">
              <Radio className="w-3.5 h-3.5 text-blue-600 mx-auto animate-pulse" />
              <div className="text-[10px] font-bold text-slate-700">ทุกอุปกรณ์</div>
              <div className="text-[9px] text-blue-600 font-semibold">ซิงค์เรียลไทม์</div>
            </div>
          </div>

          {/* Notice Note */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug text-[11px]">
              นี่คือการทดสอบระบบส่งสัญญาณฉุกเฉินระดับเครือข่าย เพื่อยืนยันว่าโทรศัพท์และอุปกรณ์ทุกเครื่องสามารถรับแจ้งเตือนได้ทันท่วงที
            </p>
          </div>
        </div>

        {/* Sticky Bottom Actions - Always visible on mobile */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={dismissTestSignal}
            className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition"
          >
            <VolumeX className="w-4 h-4" />
            <span>รับทราบและปิดสัญญาณเสียง (ปิดหน้านี้)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
