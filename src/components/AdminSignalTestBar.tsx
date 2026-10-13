import React, { useState } from 'react';
import {
  Activity,
  Radio,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  Smartphone
} from 'lucide-react';
import { useBroadcast } from '../context/BroadcastContext';
import { useCommunity } from '../context/CommunityContext';
import { TestSoundType } from '../types';

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

  const { isAdmin, setIsAdmin, showToast } = useCommunity();
  const [selectedSound, setSelectedSound] = useState<TestSoundType>('siren');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // If Admin is OFF, show an unmissable single-click activate banner so the user never misses it
  if (!isAdmin) {
    return (
      <div className="w-full bg-slate-900 border-b border-slate-700 text-white shadow-md z-30">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="p-1 bg-slate-800 rounded-lg text-slate-400">
              <Shield className="w-3.5 h-3.5" />
            </span>
            <span>สถานะปัจจุบัน: <strong>ผู้ใช้ทั่วไป (Citizen Mode)</strong> หากต้องการทดสอบสัญญาณเตือนภัย</span>
          </div>
          <button
            onClick={() => {
              setIsAdmin(true);
              showToast('เปิดโหมดผู้ดูแลระบบ (Admin Mode) แล้ว! พร้อมปุ่มทดสอบสัญญาณเตือนภัย', 'success');
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>เปิดโหมด Admin (เพื่อแสดงปุ่มทดสอบสัญญาณ)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside aria-label="แถบทดสอบสัญญาณเตือนภัยสำหรับผู้ดูแลระบบ" className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b-2 border-red-500 text-white shadow-xl z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        {/* Top Header Summary */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="p-2 bg-red-600 text-white rounded-xl shadow-lg shadow-red-600/50 animate-pulse">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-xs sm:text-sm tracking-tight text-white flex items-center gap-1.5">
                  ⚡ ระบบทดสอบสัญญาณเตือนภัย & ระบบสั่นสะเทือน (Admin Signal Test)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                  โหมด Admin: เปิดใช้งาน
                </span>
              </div>
              <p className="text-[11px] text-slate-300 hidden sm:block">
                เลือกทดสอบเฉพาะเครื่องนี้ (เสียงและสั่นดังเฉพาะแอดมิน) หรือทดสอบกระจายสัญญาณพร้อมกันทุกอุปกรณ์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(isTestingLocalAdmin || isTestingAllDevices) && (
              <button
                onClick={() => {
                  stopLocalDeviceTest();
                  dismissTestSignal();
                  showToast('⏹️ หยุดสัญญาณเตือนทั้งหมดแล้ว', 'info');
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-red-600/40 animate-pulse"
              >
                <VolumeX className="w-4 h-4" />
                <span>หยุดเสียงทันที</span>
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition text-xs font-semibold flex items-center gap-1"
              title={isExpanded ? 'ย่อแถบทดสอบ' : 'ขยายแถบทดสอบ'}
            >
              <span className="hidden sm:inline">{isExpanded ? 'ย่อแถบ' : 'แสดงปุ่มทดสอบ'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Primary Action Buttons (Visible when expanded) */}
        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
            {/* Button 1: Test Local Admin Device Only */}
            <div className="md:col-span-6 p-3 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-black text-emerald-300">
                    🟢 ปุ่ม 1: ทดสอบเฉพาะอุปกรณ์ Admin (เครื่องนี้เท่านั้น)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  {isTestingLocalAdmin
                    ? '🔊 กำลังส่งเสียงไซเรน & สั่นสะเทือนเฉพาะเครื่องนี้ (ไม่รบกวนผู้อื่น)'
                    : 'ทดสอบเสียงไซเรนและการสั่นบนเครื่องนี้ ปลอดภัย ไม่ส่งสัญญาณออกไปยังเครื่องของประชาชน'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isTestingLocalAdmin ? (
                  <button
                    onClick={() => {
                      stopLocalDeviceTest();
                      showToast('⏹️ หยุดทดสอบเฉพาะเครื่องนี้แล้ว', 'info');
                    }}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm w-full sm:w-auto justify-center"
                  >
                    <Square className="w-4 h-4" />
                    <span>หยุดทดสอบ</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      testLocalDeviceSignal(selectedSound, 5);
                      showToast('▶️ เริ่มทดสอบเสียงและการสั่นเฉพาะเครื่องนี้แล้ว (ไม่ส่งไปยังเครื่องอื่น)', 'info');
                    }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 transition shadow-lg shadow-emerald-600/30 w-full sm:w-auto justify-center"
                  >
                    <Play className="w-4 h-4" />
                    <span>ทดสอบเครื่องนี้ (Admin Only)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Button 2: Test All Devices Broadcast */}
            <div className="md:col-span-6 p-3 rounded-2xl bg-red-950/40 border-2 border-red-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
                  <span className="text-xs font-black text-red-300">
                    🔴 ปุ่ม 2: ทดสอบแจ้งเตือนทุกอุปกรณ์ (All Devices)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  ส่งสัญญาณเตือนภัยฉุกเฉิน เสียงไซเรน และการสั่นไปยังทุกเครื่องที่ติดตั้ง LocalHub
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    testAllDevicesSignal();
                    showToast('📡 ส่งสัญญาณเตือนภัย & สั่นสะเทือนไปยังทุกอุปกรณ์แล้ว!', 'success');
                  }}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 transition shadow-lg shadow-red-600/40 w-full sm:w-auto justify-center"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>ทดสอบทุกอุปกรณ์ (All Devices)</span>
                </button>

                <button
                  onClick={() => setOpenSignalTestModal(true)}
                  className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition"
                  title="เปิดคอนโซลตั้งค่าเสียงและระยะเวลาทดสอบ"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
