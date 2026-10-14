import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Volume2,
  VolumeX,
  Play,
  Square,
  Radio,
  Sliders,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RadioTower,
  Bell,
  RefreshCw,
  FileText,
  Users,
  MapPin,
  ExternalLink,
  Flame,
  CloudLightning,
  Sparkles
} from 'lucide-react';
import { useBroadcast } from '../../context/BroadcastContext';
import { useCommunity } from '../../context/CommunityContext';
import { TestSoundType } from '../../types';
import {
  isVibrationSupported,
  getNotificationPermission,
  requestNotificationPermission
} from '../../utils/notificationService';

export const AdminDashboardView: React.FC = () => {
  const {
    isTestingLocalAdmin,
    isTestingAllDevices,
    testLocalDeviceSignal,
    stopLocalDeviceTest,
    testAllDevicesSignal,
    dismissTestSignal,
    activeTestSignal,
    broadcasts,
    setOpenAdminModal
  } = useBroadcast();

  const {
    isAdmin,
    setIsAdmin,
    currentUser,
    showToast,
    location,
    posts,
    alerts,
    setActiveTab,
    loginAsAdminOwner
  } = useCommunity();

  // Test sound settings
  const [localSoundType, setLocalSoundType] = useState<TestSoundType>('siren');
  const [localDurationSec, setLocalDurationSec] = useState<number>(5);

  const [allDevicesTitle, setAllDevicesTitle] = useState('🚨 [ทดสอบระบบ] สัญญาณแจ้งเตือนฉุกเฉินทุกอุปกรณ์');
  const [allDevicesMessage, setAllDevicesMessage] = useState(
    'ผู้ดูแลระบบ (Admin) กำลังทดสอบระบบส่งสัญญาณเตือนภัย เสียงไซเรน และการสั่นสะเทือนพร้อมกันทุกอุปกรณ์ที่ติดตั้ง LocalHub'
  );
  const [allDevicesSoundType, setAllDevicesSoundType] = useState<TestSoundType>('siren');

  // Diagnostics state
  const [hasVibration, setHasVibration] = useState(false);
  const [notifPermission, setNotifPermission] = useState<'granted' | 'denied' | 'default'>('default');

  useEffect(() => {
    setHasVibration(isVibrationSupported());
    setNotifPermission(getNotificationPermission());
  }, []);

  const handleRequestNotif = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      showToast('เปิดการแจ้งเตือนสำเร็จแล้ว!', 'success');
    } else {
      showToast('ยังไม่ได้รับสิทธิ์การแจ้งเตือน', 'info');
    }
  };

  const handleStopAllAlerts = () => {
    stopLocalDeviceTest();
    dismissTestSignal();
    showToast('⏹️ สั่งหยุดสัญญาณเตือนภัยทั้งหมดเรียบร้อยแล้ว', 'info');
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="p-5 sm:p-7 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-xl border-2 border-red-500/30 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-black">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>ADMIN CENTRAL CONSOLE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              🛡️ แดชบอร์ดแอดมิน & ศูนย์ทดสอบระบบสัญญาณ
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              ศูนย์กลางควบคุมการทดสอบสัญญาณเสียงเตือนภัย ไซเรนฉุกเฉิน และระบบสั่นสะเทือน (แยกอิสระออกจากการส่งข่าวบรอดแคสต์) พร้อมตรวจสอบสถานะระบบทั้งหมด
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                สถานะ: <strong>{isAdmin ? 'สิทธิ์ผู้ดูแลระบบ (Admin Mode)' : 'โหมดสมาชิก'}</strong>
              </span>
              <span>•</span>
              <span>บัญชี: <strong className="text-slate-200">{currentUser?.email || 'toonisra33@gmail.com'}</strong></span>
              <span>•</span>
              <span>พื้นที่ปัจจุบัน: <strong className="text-slate-200">{location?.province || 'กรุงเทพมหานคร'}</strong></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {(isTestingLocalAdmin || isTestingAllDevices) && (
              <button
                onClick={handleStopAllAlerts}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-black rounded-2xl transition shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 animate-bounce-subtle"
              >
                <VolumeX className="w-4 h-4 animate-spin" />
                <span>หยุดเสียงเตือนทันที!</span>
              </button>
            )}

            <button
              onClick={() => setOpenAdminModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white rounded-2xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
              title="เปิดหน้าต่างเขียนข้อความบรอดแคสต์ทางการ"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างบรอดแคสต์ข่าว</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Alert Warning if Sound is currently playing */}
      {(isTestingLocalAdmin || isTestingAllDevices) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/20 rounded-xl">
              <Volume2 className="w-5 h-5 animate-bounce" />
            </span>
            <div>
              <div className="font-black text-sm">
                {isTestingLocalAdmin
                  ? '🔊 กำลังทดสอบสัญญาณเสียง & ระบบสั่นเฉพาะเครื่องแอดมินนี้...'
                  : '📡 กำลังส่งสัญญาณฉุกเฉินและระบบสั่นไปยังทุกอุปกรณ์ (All Devices)...'}
              </div>
              <div className="text-xs text-red-100">
                {isTestingLocalAdmin
                  ? 'สัญญาณดังเฉพาะอุปกรณ์นี้ ไม่รบกวนประชาชน'
                  : 'กำลังกระจายสัญญาณผ่าน Cloud & Service Worker ไปยังเครื่องของประชาชน'}
              </div>
            </div>
          </div>
          <button
            onClick={handleStopAllAlerts}
            className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 active:scale-95 font-black text-xs rounded-xl shadow-md transition"
          >
            กดหยุดทันที
          </button>
        </div>
      )}

      {/* 3. Primary Section: Audio & Vibration Signal Testing Console */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-red-600 text-white rounded-xl shadow-md">
              <Activity className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base">
                ระบบทดสอบสัญญาณเตือนภัย & ระบบสั่นสะเทือน (Signal Test Console)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300">
                รวมระบบทดสอบสัญญาณเสียงไว้ที่นี่ที่เดียว ไม่ปะปนกับการส่งข่าวบรอดแคสต์
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-slate-300 font-bold hidden sm:inline">
            Web Audio Synth + Vibration API
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Grid of the 2 Test Modes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Mode 1: Local Admin Device Only */}
            <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    โหมด 1: ทดสอบเฉพาะเครื่องนี้ (Admin Only)
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                    ปลอดภัย 100%
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-base">
                  ทดสอบเสียงไซเรน & สั่นสะเทือนเฉพาะเครื่องแอดมิน
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  ใช้สำหรับตรวจสอบลำโพง ระดับเสียง และมอเตอร์สั่นของโทรศัพท์หรือคอมพิวเตอร์ของคุณ โดย<strong>ไม่มีการส่งสัญญาณออกไปยังเครื่องของประชาชนหรือฐานข้อมูล</strong>
                </p>

                {/* Controls for Mode 1 */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ประเภทเสียงสัญญาณทดสอบ
                    </label>
                    <select
                      value={localSoundType}
                      onChange={(e) => setLocalSoundType(e.target.value as TestSoundType)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 shadow-2xs"
                    >
                      <option value="siren">🚨 ไซเรนฉุกเฉินระดับสูงสุด (Urgent Siren 700-1100Hz)</option>
                      <option value="urgent">⚠️ เสียงเตือนภัยด่วนจังหวะถี่ (High Pulse Beep)</option>
                      <option value="high">📢 เสียงเตือน 2 ระดับความถี่ (Dual Tone Alert)</option>
                      <option value="announcement">✨ เสียงกริ่งประกาศทั่วไป (Chime Arpeggio)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ระยะเวลาทดสอบเสียง
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[3, 5, 8].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setLocalDurationSec(sec)}
                          className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                            localDurationSec === sec
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {sec} วินาที
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {isTestingLocalAdmin ? (
                  <button
                    onClick={() => {
                      stopLocalDeviceTest();
                      showToast('⏹️ หยุดการทดสอบเฉพาะเครื่องนี้แล้ว', 'info');
                    }}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition shadow-md"
                  >
                    <Square className="w-4 h-4" />
                    <span>หยุดทดสอบเฉพาะเครื่องนี้</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      testLocalDeviceSignal(localSoundType, localDurationSec);
                      showToast(`▶️ กำลังทดสอบเสียง ${localDurationSec} วินาที (เฉพาะเครื่องนี้)`, 'info');
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/30"
                  >
                    <Play className="w-4 h-4" />
                    <span>กดเริ่มทดสอบ (ดังเฉพาะเครื่องนี้ {localDurationSec} วินาที)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mode 2: All Devices Broadcast Test */}
            <div className="p-5 rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-red-50/60 to-rose-50/40 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black">
                    <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                    โหมด 2: ทดสอบทุกอุปกรณ์ (All Devices)
                  </span>
                  <span className="text-[11px] font-bold text-red-700 bg-white px-2 py-0.5 rounded-lg border border-red-200">
                    สัญญาณจริงทั่วระบบ
                  </span>
                </div>

                <h3 className="font-black text-slate-900 text-base">
                  ทดสอบส่งสัญญาณเตือนภัย & สั่นสะเทือนทุกเครื่อง
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  ส่งสัญญาณเตือนภัยฉุกเฉินไปยังทุกอุปกรณ์ที่เปิดหรือติดตั้ง LocalHub ผ่านคลาวด์ Firebase และ Service Worker เหมาะสำหรับทดสอบความพร้อมในกรณีเกิดภัยพิบัติ
                </p>

                {/* Controls for Mode 2 */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      หัวข้อข้อความแจ้งเตือนทดสอบ
                    </label>
                    <input
                      type="text"
                      value={allDevicesTitle}
                      onChange={(e) => setAllDevicesTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 shadow-2xs"
                      placeholder="เช่น 🚨 [ทดสอบระบบ] สัญญาณแจ้งเตือนฉุกเฉินทุกอุปกรณ์"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ประเภทเสียงเตือนที่ส่งออกไป
                    </label>
                    <select
                      value={allDevicesSoundType}
                      onChange={(e) => setAllDevicesSoundType(e.target.value as TestSoundType)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 shadow-2xs"
                    >
                      <option value="siren">🚨 ไซเรนฉุกเฉินระดับสูงสุด (Urgent Siren)</option>
                      <option value="urgent">⚠️ เสียงเตือนภัยด่วนจังหวะถี่ (High Pulse Beep)</option>
                      <option value="high">📢 เสียงเตือน 2 ระดับความถี่ (Dual Tone Alert)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    testAllDevicesSignal(allDevicesTitle, allDevicesMessage, allDevicesSoundType);
                    showToast('📡 ส่งสัญญาณเตือนภัย & สั่นสะเทือนไปยังทุกอุปกรณ์สำเร็จ!', 'success');
                  }}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition shadow-lg shadow-red-600/30"
                >
                  <RadioTower className="w-4 h-4 animate-pulse" />
                  <span>ส่งสัญญาณทดสอบทุกอุปกรณ์ (All Devices)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Diagnostics Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>การวินิจฉัยฮาร์ดแวร์และสิทธิ์ของอุปกรณ์นี้ (Device Diagnostics)</span>
              </div>
              <span className="text-[10px] text-slate-500">ตรวจสอบอัตโนมัติ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-slate-500 text-[10px] font-bold">ระบบเสียงเว็บ (Web Audio API)</div>
                  <div className="font-extrabold text-emerald-700 text-xs mt-0.5">พร้อมสร้างคลื่นเสียงสด</div>
                </div>
                <Volume2 className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-slate-500 text-[10px] font-bold">ระบบสั่นสะเทือน (Vibration API)</div>
                  <div className={`font-extrabold text-xs mt-0.5 ${hasVibration ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {hasVibration ? 'อุปกรณ์รองรับการสั่น' : 'ไม่รองรับการสั่น (พีซี/โน้ตบุ๊ก)'}
                  </div>
                </div>
                <Smartphone className={`w-5 h-5 ${hasVibration ? 'text-emerald-600' : 'text-amber-500'}`} />
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-slate-500 text-[10px] font-bold">สิทธิ์การแจ้งเตือน (Notifications)</div>
                  <div className={`font-extrabold text-xs mt-0.5 ${notifPermission === 'granted' ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {notifPermission === 'granted' ? 'อนุญาตแล้ว' : notifPermission === 'denied' ? 'ถูกบล็อก' : 'ยังไม่ได้เปิดสิทธิ์'}
                  </div>
                </div>
                {notifPermission !== 'granted' ? (
                  <button
                    onClick={handleRequestNotif}
                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg border border-indigo-200 transition"
                  >
                    เปิดสิทธิ์
                  </button>
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Secondary Section: System Overview & Quick Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Official Broadcasts Management */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <Radio className="w-5 h-5" />
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold border border-blue-200">
                {broadcasts.length} รายการ
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">การบรอดแคสต์ทางการ</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ส่งข้อความข่าวสาร ประกาศชุมชน หรือเตือนภัยไปยังประชาชนตามพื้นที่ โดยแยกอิสระจากระบบทดสอบเสียง
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => setOpenAdminModal(true)}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างบรอดแคสต์ใหม่</span>
            </button>
            <button
              onClick={() => setActiveTab('broadcasts')}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>ดูรายการบรอดแคสต์ทั้งหมด</span>
            </button>
          </div>
        </div>

        {/* Card 2: Emergency Reports Verification */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-extrabold border border-amber-200">
                {alerts.length} เหตุการณ์
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">รายงานเหตุฉุกเฉินจากประชาชน</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ตรวจสอบเหตุการณ์ น้ำท่วม อัคคีภัย อุบัติเหตุ หรือแจ้งเตือนภัยที่ลูกบ้านส่งเข้ามาในพื้นที่
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveTab('alerts')}
              className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>เข้าตรวจรายงานเหตุฉุกเฉิน</span>
            </button>
          </div>
        </div>

        {/* Card 3: Community Posts & Feed Supervision */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <Users className="w-5 h-5" />
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200">
                {posts.length} โพสต์
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">การดูแลฟีดชุมชน</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ดูแลความเรียบร้อยของโพสต์ทั่วไป ตลาดชุมชน และกิจกรรมต่างๆ ในชุมชน
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveTab('feed')}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Users className="w-4 h-4" />
              <span>ไปที่ฟีดชุมชน</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
