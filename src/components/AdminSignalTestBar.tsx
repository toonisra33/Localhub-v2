import React, { useState } from 'react';
import {
  Activity,
  Radio,
  Volume2,
  VolumeX,
  Smartphone,
  Play,
  Square,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useBroadcast } from '../context/BroadcastContext';
import { useCommunity } from '../context/CommunityContext';
import { TestSoundType } from '../types';
import { isVibrationSupported } from '../utils/notificationService';

export const AdminSignalTestBar: React.FC = () => {
  const {
    isTestingLocalAdmin,
    isTestingAllDevices,
    testLocalDeviceSignal,
    stopLocalDeviceTest,
    testAllDevicesSignal,
    dismissTestSignal,
    setOpenSignalTestModal
  } = useBroadcast();

  const { isAdmin, showToast } = useCommunity();
  const [selectedSound, setSelectedSound] = useState<TestSoundType>('siren');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!isAdmin) return null;

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-800 text-white shadow-lg z-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        {/* Header summary row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-red-600 text-white rounded-xl shadow-md shadow-red-600/40 animate-pulse">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                  ระบบทดสอบสัญญาณเตือนภัย & แรงสั่นสะเทือน (Admin Signal Test)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Play Store Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                ทดสอบเฉพาะเครื่องของแอดมิน (เสียง/สั่นดังเครื่องนี้เท่านั้น) หรือทดสอบกระจายสัญญาณพร้อมกันทุกอุปกรณ์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(isTestingLocalAdmin || isTestingAllDevices) && (
              <button
                onClick={() => {
                  stopLocalDeviceTest();
                  dismissTestSignal();
                  showToast('หยุดสัญญาณเตือนทั้งหมดแล้ว', 'info');
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm animate-pulse"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>หยุดเสียงทันที</span>
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition text-xs flex items-center gap-1"
              title={isExpanded ? 'ย่อแถบ' : 'ขยายแถบ'}
            >
              {isExpanded ? (
                <>
                  <span className="hidden sm:inline">ย่อ</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">เมนูด่วน</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Action Buttons and Controls */}
        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Mode 1: Local Device Only (6 cols) */}
            <div className="md:col-span-6 p-2.5 sm:p-3 rounded-2xl bg-white/10 border border-emerald-500/30 flex items-center justify-between gap-3 backdrop-blur-xs">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-bold text-emerald-300 truncate">
                    1. ทดสอบเฉพาะ Admin (เครื่องนี้เท่านั้น)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  {isTestingLocalAdmin
                    ? '🔊 กำลังส่งเสียงไซเรน & สั่นสะเทือนเฉพาะเครื่องนี้ (ไม่ส่งออก)'
                    : 'เสียงและระบบสั่นจะดังเฉพาะเครื่องที่ admin กำลังทดสอบเท่านั้น'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isTestingLocalAdmin ? (
                  <button
                    onClick={stopLocalDeviceTest}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-sm"
                  >
                    <Square className="w-3.5 h-3.5" />
                    หยุด
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      testLocalDeviceSignal(selectedSound, 5);
                      showToast('▶️ เริ่มทดสอบเสียงและการสั่นเฉพาะเครื่องนี้แล้ว (Admin Only)', 'info');
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5" />
                    ทดสอบเครื่องนี้
                  </button>
                )}
              </div>
            </div>

            {/* Mode 2: All Devices Broadcast (4 cols) */}
            <div className="md:col-span-4 p-2.5 sm:p-3 rounded-2xl bg-white/10 border border-red-500/40 flex items-center justify-between gap-3 backdrop-blur-xs">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-red-300 truncate">
                    2. ทดสอบทุกอุปกรณ์ (All Devices)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  ส่งเสียงไซเรนและการสั่นไปยังทุกเครื่องที่ติดตั้งแอพ
                </p>
              </div>

              <button
                onClick={() => {
                  testAllDevicesSignal();
                  showToast('📡 ส่งสัญญาณเตือนและระบบสั่นไปยังทุกอุปกรณ์แล้ว!', 'success');
                }}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-md shadow-red-600/30"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                ส่งทุกอุปกรณ์
              </button>
            </div>

            {/* Mode 3: Console Settings (2 cols) */}
            <div className="md:col-span-2 flex items-center justify-end">
              <button
                onClick={() => setOpenSignalTestModal(true)}
                className="w-full py-2 px-3 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-indigo-500/40"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>ตั้งค่าทดสอบ</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
