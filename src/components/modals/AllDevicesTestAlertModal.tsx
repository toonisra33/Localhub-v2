import React from 'react';
import {
  AlertTriangle,
  Radio,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  BellRing,
  Activity,
  X
} from 'lucide-react';
import { useBroadcast } from '../../context/BroadcastContext';

export const AllDevicesTestAlertModal: React.FC = () => {
  const { activeTestSignal, dismissTestSignal } = useBroadcast();

  if (!activeTestSignal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fadeIn">
      {/* Outer Glow container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-red-600 overflow-hidden animate-bounce-subtle">
        {/* Urgent Strobe Top Bar */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/20 rounded-2xl animate-pulse">
              <BellRing className="w-6 h-6 text-white" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white text-red-700 text-[11px] font-black tracking-wide uppercase">
                  สัญญาณทดสอบระบบ (TEST SIGNAL)
                </span>
              </div>
              <h3 className="font-extrabold text-lg leading-tight mt-0.5">
                ทดสอบสัญญาณเตือนภัยทุกอุปกรณ์
              </h3>
            </div>
          </div>

          <button
            onClick={dismissTestSignal}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            title="ปิดการแจ้งเตือน"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Audio & Waveform Visualization */}
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-center space-y-2">
            <div className="flex items-center gap-1.5 h-8">
              <span className="w-1.5 h-4 bg-red-500 rounded-full animate-pulse"></span>
              <span className="w-1.5 h-7 bg-red-600 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-5 bg-red-500 rounded-full animate-pulse delay-100"></span>
              <span className="w-1.5 h-8 bg-red-600 rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-6 bg-red-500 rounded-full animate-pulse delay-200"></span>
              <span className="w-1.5 h-7 bg-red-600 rounded-full animate-bounce delay-300"></span>
              <span className="w-1.5 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </div>
            <div className="text-xs font-bold text-red-700 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 animate-pulse" />
              เสียงไซเรนและการสั่นสะเทือนกำลังทำงานพร้อมกันทุกเครื่อง
            </div>
          </div>

          {/* Test Signal Details */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-base">
              {activeTestSignal.title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {activeTestSignal.message}
            </p>
          </div>

          {/* Real-time Diagnostics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <Volume2 className="w-4 h-4 text-emerald-600 mx-auto" />
              <div className="text-[11px] font-bold text-slate-700">เสียงไซเรน</div>
              <div className="text-[10px] text-emerald-600 font-medium">กำลังส่งเสียง</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <Smartphone className="w-4 h-4 text-emerald-600 mx-auto" />
              <div className="text-[11px] font-bold text-slate-700">การสั่นสะเทือน</div>
              <div className="text-[10px] text-emerald-600 font-medium">สั่นตามจังหวะ</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <Radio className="w-4 h-4 text-blue-600 mx-auto animate-pulse" />
              <div className="text-[11px] font-bold text-slate-700">ทุกอุปกรณ์</div>
              <div className="text-[10px] text-blue-600 font-medium">ซิงค์แบบเรียลไทม์</div>
            </div>
          </div>

          {/* Device & Admin Context Note */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              นี่คือการทดสอบระบบส่งสัญญาณฉุกเฉินระดับเครือข่าย เพื่อยืนยันว่าโทรศัพท์และอุปกรณ์ทุกเครื่องที่ติดตั้งแอพพลิเคชั่นสามารถรับแจ้งเตือนได้ทันท่วงที
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={dismissTestSignal}
              className="w-full py-3 px-5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition"
            >
              <VolumeX className="w-4 h-4" />
              รับทราบและปิดสัญญาณเสียง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
