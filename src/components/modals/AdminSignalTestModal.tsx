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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-red-600 rounded-xl shadow-md shadow-red-600/30 animate-pulse">
              <Activity className="w-5 h-5 text-white" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg leading-tight">
                  คอนโซลทดสอบสัญญาณแจ้งเตือน & แรงสั่นสะเทือน
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Play Store Ready
                </span>
              </div>
              <p className="text-xs text-slate-300">
                ระบบทดสอบสัญญาณเตือนภัยฉุกเฉินสำหรับผู้ดูแลระบบ (Admin Test Console)
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpenSignalTestModal(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Diagnostic Info Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-700">สถานะฮาร์ดแวร์ & สิทธิ์ของอุปกรณ์นี้:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold">
                Web Audio: พร้อมใช้งาน
              </span>
              <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-800 font-semibold">
                การสั่น: {isVibrationSupported() ? 'รองรับ' : 'ไม่รองรับบน PC'}
              </span>
              <span className="px-2 py-1 rounded-lg bg-purple-100 text-purple-800 font-semibold">
                แจ้งเตือน: {getNotificationPermission()}
              </span>
            </div>
          </div>

          {/* Section 1: Admin Local Test Only */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                โหมด 1: ทดสอบเฉพาะ Admin (เครื่องนี้เท่านั้น)
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                ระบบการสั่นและเสียงแจ้งเตือนจะดังเฉพาะเครื่องที่ admin กำลังทดสอบอยู่เท่านั้น
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                สัญญาณจะไม่ถูกส่งออกไปยังเครื่องของประชาชนหรืออุปกรณ์อื่นในเครือข่าย เพื่อให้แอดมินสามารถทดสอบความดังและจังหวะสั่นได้ปลอดภัย
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ประเภทเสียงสัญญาณทดสอบ
                </label>
                <select
                  value={localSoundType}
                  onChange={(e) => setLocalSoundType(e.target.value as TestSoundType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="siren">🚨 ไซเรนฉุกเฉินระดับสูงสุด (Urgent Siren 700-1100Hz)</option>
                  <option value="urgent">⚠️ เสียงเตือนภัยด่วนจังหวะถี่ (High Pulse Beep)</option>
                  <option value="high">📢 เสียงเตือน 2 ระดับความถี่ (Dual Tone Alert)</option>
                  <option value="announcement">✨ เสียงกริ่งประกาศทั่วไป (Chime Arpeggio)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ระยะเวลาทดสอบ
                </label>
                <select
                  value={localDurationSec}
                  onChange={(e) => setLocalDurationSec(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value={3}>3 วินาที (ทดสอบด่วน)</option>
                  <option value={5}>5 วินาที (ค่ามาตรฐาน)</option>
                  <option value={8}>8 วินาที (ทดสอบระบบต่อเนื่อง)</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl transition ${
                    isTestingLocalAdmin
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isTestingLocalAdmin ? (
                    <Volume2 className="w-5 h-5 animate-bounce" />
                  ) : (
                    <Smartphone className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {isTestingLocalAdmin
                      ? '🔊 กำลังส่งเสียงไซเรน & สั่นเฉพาะเครื่องนี้...'
                      : 'สถานะ: พร้อมทดสอบเฉพาะเครื่องนี้'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isTestingLocalAdmin
                      ? 'ไม่มีสัญญาณส่งต่อไปยังอุปกรณ์อื่น'
                      : 'กดปุ่มเพื่อทดสอบเสียงและความสั่นสะเทือน'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isTestingLocalAdmin ? (
                  <button
                    type="button"
                    onClick={stopLocalDeviceTest}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <Square className="w-3.5 h-3.5" />
                    หยุดการทดสอบทันที
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      testLocalDeviceSignal(localSoundType, localDurationSec);
                      showToast('เริ่มทดสอบเสียงและการสั่นเฉพาะเครื่องนี้แล้ว', 'info');
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5" />
                    เริ่มทดสอบ (เครื่องนี้เท่านั้น)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: All Devices Broadcast Test */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-red-300 bg-red-50/40 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-bold">
                <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                โหมด 2: ทดสอบการแจ้งเตือนทุกอุปกรณ์ (All Devices Broadcast)
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                การแจ้งเตือนและการสั่นจะแสดงผลกับทุกอุปกรณ์ที่ติดตั้งแอพพลิเคชั่น
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ส่งสัญญาณเตือนภัย เสียงไซเรน และการสั่นสะเทือนพร้อมกันทุกอุปกรณ์ที่ติดตั้งแอพพลิเคชั่น LocalHub ทันที
              </p>
            </div>

            <div className="space-y-3 bg-white p-3.5 rounded-xl border border-red-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  หัวข้อสัญญาณทดสอบทุกอุปกรณ์
                </label>
                <input
                  type="text"
                  value={allDevicesTitle}
                  onChange={(e) => setAllDevicesTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ข้อความคำอธิบายการทดสอบ
                </label>
                <textarea
                  value={allDevicesMessage}
                  onChange={(e) => setAllDevicesMessage(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-normal resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ประเภทเสียงไซเรนทุกเครื่อง
                </label>
                <select
                  value={allDevicesSoundType}
                  onChange={(e) => setAllDevicesSoundType(e.target.value as TestSoundType)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 font-medium"
                >
                  <option value="siren">🚨 ไซเรนฉุกเฉินระดับสูงสุด (Urgent Siren)</option>
                  <option value="urgent">⚠️ เสียงเตือนภัยด่วนจังหวะถี่ (High Pulse Beep)</option>
                  <option value="high">📢 เสียงเตือน 2 ระดับความถี่ (Dual Tone Alert)</option>
                </select>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  สัญญาณจะเด้งหน้าต่างเตือนภัยสีแดงพร้อมเสียงและแรงสั่นบนโทรศัพท์และอุปกรณ์ทุกเครื่องพร้อมกัน
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-1">
                {isTestingAllDevices && (
                  <button
                    type="button"
                    onClick={dismissTestSignal}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    ปิดสัญญาณเสียง
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    testAllDevicesSignal(allDevicesTitle, allDevicesMessage, allDevicesSoundType);
                    showToast('📡 ส่งสัญญาณเตือนและระบบสั่นไปยังทุกอุปกรณ์เรียบร้อยแล้ว!', 'success');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-red-600/30 transition flex items-center justify-center gap-2"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  ส่งสัญญาณทดสอบทุกอุปกรณ์ทันที
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setOpenSignalTestModal(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
