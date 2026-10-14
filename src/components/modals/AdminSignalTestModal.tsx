import React, { useState } from 'react';
import {
  X,
  Activity,
  Radio,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Send,
  BellRing,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { useBroadcast } from '../../context/BroadcastContext';
import { useCommunity } from '../../context/CommunityContext';
import { TestSoundType } from '../../types';
import {
  isVibrationSupported,
  getNotificationPermission,
  requestNotificationPermission
} from '../../utils/notificationService';

export const AdminSignalTestModal: React.FC = () => {
  const {
    isSignalTestModalOpen,
    setOpenSignalTestModal,
    isTestingLocalAdmin,
    isTestingAllDevices,
    testLocalDeviceSignal,
    stopLocalDeviceTest,
    testAllDevicesSignal,
    dismissTestSignal
  } = useBroadcast();

  const { showToast } = useCommunity();

  const [localSoundType, setLocalSoundType] = useState<TestSoundType>('siren');
  const [localDurationSec, setLocalDurationSec] = useState<number>(5);
  const [allDevicesTitle, setAllDevicesTitle] = useState('🚨 [ทดสอบระบบ] สัญญาณแจ้งเตือนฉุกเฉินทุกอุปกรณ์');
  const [allDevicesMessage, setAllDevicesMessage] = useState(
    'ผู้ดูแลระบบ (Admin) กำลังทดสอบสัญญาณเตือนภัย เสียงไซเรน และการสั่นสะเทือนพร้อมกันทุกอุปกรณ์ที่ติดตั้ง LocalHub'
  );
  const [allDevicesSoundType, setAllDevicesSoundType] = useState<TestSoundType>('siren');

  if (!isSignalTestModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpenSignalTestModal(false);
      }}
    >
      <div className="relative w-[calc(100vw-1.5rem)] max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <span className="p-1.5 sm:p-2 bg-red-600 rounded-xl shadow-md shadow-red-600/30 animate-pulse shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-extrabold text-xs sm:text-sm leading-tight truncate">
                  ทดสอบสัญญาณแจ้งเตือนฉุกเฉิน
                </h2>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                  Admin
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                ทดสอบเสียงไซเรน & แรงสั่นสะเทือน
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpenSignalTestModal(false)}
            className="p-1.5 sm:p-2 rounded-xl bg-white/20 hover:bg-white/30 active:scale-90 text-white transition shrink-0 ml-1.5 shadow-xs"
            title="ปิดหน้าต่าง (กากบาท)"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
          {/* Diagnostic Info Banner */}
          <div className="p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-700 text-xs truncate">สถานะฮาร์ดแวร์ & สิทธิ์อุปกรณ์:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-semibold">
                Web Audio: พร้อม
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-[10px] sm:text-[11px] font-semibold">
                สั่น: {isVibrationSupported() ? 'รองรับ' : 'ไม่รองรับ'}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 text-[10px] sm:text-[11px] font-semibold">
                แจ้งเตือน: {getNotificationPermission()}
              </span>
            </div>
          </div>

          {/* Section 1: Admin Local Test Only */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>โหมด 1: ทดสอบเฉพาะ Admin (เครื่องนี้เท่านั้น)</span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 break-words leading-snug">
                ระบบการสั่นและเสียงจะดังเฉพาะเครื่องที่ admin กำลังทดสอบเท่านั้น
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed break-words">
                สัญญาณจะไม่ส่งไปยังเครื่องของประชาชน ปลอดภัยสำหรับการทดสอบระดับเสียงและจังหวะสั่น
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-1">
                  ประเภทเสียงทดสอบ
                </label>
                <select
                  value={localSoundType}
                  onChange={(e) => setLocalSoundType(e.target.value as TestSoundType)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium truncate"
                >
                  <option value="siren">🚨 ไซเรนฉุกเฉิน (Urgent Siren)</option>
                  <option value="urgent">⚠️ เสียงเตือนภัยด่วน (High Pulse)</option>
                  <option value="high">📢 เตือน 2 ความถี่ (Dual Tone)</option>
                  <option value="announcement">✨ เสียงกริ่งประกาศ (Chime)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-1">
                  ระยะเวลาทดสอบ
                </label>
                <select
                  value={localDurationSec}
                  onChange={(e) => setLocalDurationSec(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value={3}>3 วินาที (ด่วน)</option>
                  <option value={5}>5 วินาที (มาตรฐาน)</option>
                  <option value={8}>8 วินาที (ต่อเนื่อง)</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                <div
                  className={`p-2 rounded-xl shrink-0 transition ${
                    isTestingLocalAdmin
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isTestingLocalAdmin ? (
                    <Volume2 className="w-4 h-4 animate-bounce" />
                  ) : (
                    <Smartphone className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {isTestingLocalAdmin
                      ? '🔊 กำลังส่งเสียงไซเรน & สั่น...'
                      : 'สถานะ: พร้อมทดสอบเฉพาะเครื่องนี้'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {isTestingLocalAdmin
                      ? 'ไม่มีสัญญาณส่งต่อไปยังอุปกรณ์อื่น'
                      : 'กดปุ่มเพื่อทดสอบเสียงและความสั่น'}
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-auto shrink-0">
                {isTestingLocalAdmin ? (
                  <button
                    type="button"
                    onClick={stopLocalDeviceTest}
                    className="w-full sm:w-auto px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>หยุดการทดสอบทันที</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      testLocalDeviceSignal(localSoundType, localDurationSec);
                      showToast('เริ่มทดสอบเสียงและการสั่นเฉพาะเครื่องนี้แล้ว', 'info');
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>เริ่มทดสอบ (เครื่องนี้เท่านั้น)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: All Devices Broadcast Test */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-red-300 bg-red-50/40 space-y-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] sm:text-[11px] font-bold">
                <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse shrink-0" />
                <span>โหมด 2: ทดสอบการแจ้งเตือนทุกอุปกรณ์ (All Devices)</span>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 break-words leading-snug">
                การแจ้งเตือนและการสั่นจะแสดงผลกับทุกอุปกรณ์พร้อมกัน
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed break-words">
                ส่งสัญญาณเตือนภัย เสียงไซเรน และการสั่นสะเทือนไปยังทุกอุปกรณ์ที่ติดตั้ง LocalHub
              </p>
            </div>

            <div className="space-y-2.5 bg-white p-3 rounded-xl border border-red-200">
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-1">
                  หัวข้อสัญญาณทดสอบทุกอุปกรณ์
                </label>
                <input
                  type="text"
                  value={allDevicesTitle}
                  onChange={(e) => setAllDevicesTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-1">
                  ข้อความคำอธิบายการทดสอบ
                </label>
                <textarea
                  value={allDevicesMessage}
                  onChange={(e) => setAllDevicesMessage(e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 font-normal resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-1">
                  ประเภทเสียงไซเรนทุกเครื่อง
                </label>
                <select
                  value={allDevicesSoundType}
                  onChange={(e) => setAllDevicesSoundType(e.target.value as TestSoundType)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 font-medium truncate"
                >
                  <option value="siren">🚨 ไซเรนฉุกเฉิน (Urgent Siren)</option>
                  <option value="urgent">⚠️ เสียงเตือนภัยด่วน (High Pulse)</option>
                  <option value="high">📢 เตือน 2 ความถี่ (Dual Tone)</option>
                </select>
              </div>

              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-1.5 text-[10px] sm:text-[11px] text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span className="break-words">
                  สัญญาณจะเด้งหน้าต่างเตือนภัยสีแดงพร้อมเสียงและแรงสั่นบนอุปกรณ์ทุกเครื่องพร้อมกัน
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-1">
                {isTestingAllDevices && (
                  <button
                    type="button"
                    onClick={dismissTestSignal}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>ปิดเสียงทดสอบ</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    testAllDevicesSignal(allDevicesTitle, allDevicesMessage, allDevicesSoundType);
                    showToast('📡 ส่งสัญญาณเตือนและระบบสั่นไปยังทุกอุปกรณ์เรียบร้อยแล้ว!', 'success');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-red-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
                  <span className="truncate">ส่งสัญญาณทดสอบทุกอุปกรณ์ทันที</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={() => setOpenSignalTestModal(false)}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>ปิดหน้าต่างทดสอบ (✕)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
