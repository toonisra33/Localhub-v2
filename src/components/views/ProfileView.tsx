import React, { useState } from 'react';
import {
  User,
  Shield,
  Volume2,
  VolumeX,
  MapPin,
  Bell,
  Heart,
  MessageSquare,
  Radio,
  HelpCircle,
  Smartphone,
  Download,
  CheckCircle2,
  AlertCircle,
  Activity,
  Sliders
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';

export const ProfileView: React.FC = () => {
  const {
    location,
    openLocationModal,
    isAdmin,
    setIsAdmin,
    openContactAdminModal,
    showToast
  } = useCommunity();

  const {
    soundEnabled,
    setSoundEnabled,
    playSoundAlert,
    setOpenAdminModal,
    testLocalDeviceSignal,
    testAllDevicesSignal,
    setOpenSignalTestModal
  } = useBroadcast();

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Profile Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
        <img
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-md"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 truncate">คุณ (ผู้ใช้งาน LocalHub)</h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {isAdmin ? '🛡️ ผู้ดูแลระบบ (Admin)' : '👤 สมาชิกชุมชน'}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            พื้นที่ปัจจุบัน: <strong className="text-slate-800">{location.province} {location.district ? `(${location.district})` : ''}</strong>
            <button
              onClick={openLocationModal}
              className="text-blue-600 hover:underline font-semibold ml-1"
            >
              แก้ไข
            </button>
          </p>
        </div>
      </div>

      {/* Play Store Native Application Status & Test Card */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-md space-y-3.5 border border-indigo-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">การแจ้งเตือนจากแอปโดยตรง (Play Store Edition)</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  ติดตั้งแล้วผ่าน Play Store
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                การแจ้งเตือนและระบบสั่นส่งตรงจากแอป <strong>"LocalHub"</strong> ไม่ผ่านบราวเซอร์ Chrome
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          แอปพลิเคชันกำลังทำงานในโหมด Native เมื่อมีบรอดแคสต์หรือสัญญาณฉุกเฉิน ระบบจะส่งการแจ้งเตือน สั่นสะเทือน และเล่นเสียงไซเรนเตือนภัยขึ้นบนหน้าจอมือถือของคุณทันทีแม้ไม่ได้เปิดแอป
        </p>

        {/* Direct Test Buttons inside Profile */}
        <div className="pt-1 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              testLocalDeviceSignal('siren', 5);
              showToast('▶️ ทดสอบเสียงและระบบสั่นเฉพาะเครื่องนี้ (ไม่ส่งออกไปยังอุปกรณ์อื่น)', 'info');
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Activity className="w-3.5 h-3.5" />
            ทดสอบเฉพาะเครื่องนี้ (Admin Only)
          </button>

          <button
            onClick={() => {
              testAllDevicesSignal();
              showToast('📡 ส่งสัญญาณเตือนและระบบสั่นไปยังทุกอุปกรณ์แล้ว!', 'success');
            }}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            ทดสอบทุกอุปกรณ์ (All Devices)
          </button>

          <button
            onClick={() => setOpenSignalTestModal(true)}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            เปิดคอนโซลตั้งค่า
          </button>
        </div>
      </div>

      {/* Settings list */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {/* Admin Switch */}
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">สิทธิ์ผู้ดูแลระบบ (Admin Mode)</h4>
              <p className="text-xs text-slate-500">เปิดเพื่อทดสอบระบบบรอดแคสต์ ส่งสัญญาณเตือนภัย และส่งซ้ำ</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => {
                setIsAdmin(e.target.checked);
                showToast(e.target.checked ? 'เปิดใช้งานโหมดผู้ดูแลระบบ' : 'ปิดโหมดผู้ดูแลระบบ', 'info');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Sound alerts toggle */}
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">เสียงสัญญาณเตือนภัยฉุกเฉิน</h4>
              <p className="text-xs text-slate-500">ส่งเสียงแจ้งเตือนเมื่อมีบรอดแคสต์ระดับด่วนที่สุดหรือภัยพิบัติ</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playSoundAlert('urgent')}
              className="px-2.5 py-1 text-xs border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 font-medium"
            >
              ทดสอบเสียง
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Contact admin button */}
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">ติดต่อศูนย์ประสานงาน</h4>
              <p className="text-xs text-slate-500">ยื่นเรื่องร้องทุกข์ หรือขอส่งบรอดแคสต์ประชาสัมพันธ์ชุมชน</p>
            </div>
          </div>

          <button
            onClick={openContactAdminModal}
            className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition"
          >
            ส่งคำร้อง
          </button>
        </div>

        {/* Admin Broadcast Console launcher */}
        {isAdmin && (
          <div className="p-4 sm:p-5 flex items-center justify-between bg-blue-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-2xl">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-blue-950">คอนโซลบรอดแคสต์ (Admin Console)</h4>
                <p className="text-xs text-blue-800">ส่งข้อความเตือนภัยและประกาศสู่สมาชิกในพื้นที่</p>
              </div>
            </div>

            <button
              onClick={() => setOpenAdminModal(true)}
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition"
            >
              เปิดคอนโซล
            </button>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="text-center text-xs text-slate-400 py-3">
        LocalHub v1.0.0 • แพลตฟอร์มข้อมูลและเตือนภัยชุมชนท้องถิ่น (Play Store Edition)
      </div>
    </div>
  );
};
