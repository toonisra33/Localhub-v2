import React, { useState } from 'react';
import {
  Shield,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Heart,
  Settings,
  Edit3,
  Activity,
  Radio,
  Sliders,
  Volume2,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  Bookmark,
  Share2,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { useCommunity, ORIGINAL_ADMIN_EMAIL } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';
import { APP_VERSION, BUILD_DATE, forcePurgeCacheAndReload } from '../../utils/updateManager';

export const ProfileView: React.FC = () => {
  const {
    location,
    openLocationModal,
    isAdmin,
    openContactAdminModal,
    showToast,
    currentUser,
    loginWithGoogle,
    logoutFirebase
  } = useCommunity();

  const {
    testLocalDeviceSignal,
    testAllDevicesSignal,
    setOpenSignalTestModal,
    setOpenAdminModal
  } = useBroadcast();

  const [viewMode, setViewMode] = useState<'admin' | 'citizen'>('admin');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isPurgingCache, setIsPurgingCache] = useState(false);

  const effectiveIsAdmin = isAdmin && viewMode === 'admin';

  return (
    <div className="space-y-4 max-w-2xl mx-auto animate-fadeIn">
      {/* Top Header matching 06-admin-profile.png */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-xs">
            <MapPin className="w-4 h-4 text-slate-950" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base text-slate-900 tracking-tight">
              Local<span className="text-emerald-500">Hub</span>
            </span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black border border-emerald-300">
              ● LIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs">
              <span>👑</span>
              <span>แอดมิน</span>
            </span>
          )}

          <button
            onClick={() => setShowSettingsModal(!showSettingsModal)}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition"
            title="ตั้งค่า"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Profile Info Card matching 06-admin-profile.png */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-start gap-3.5">
          {/* Avatar with shield badge */}
          <div className="relative shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
              alt="แอดมินศูนย์ควบคุมชุมชน"
              className="w-18 h-18 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-red-600 text-white rounded-full shadow-md border-2 border-white">
              <Shield className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
                แอดมินศูนย์ควบคุมชุมชน
              </h2>
              <button
                onClick={() => showToast('เปิดแบบฟอร์มแก้ไขข้อมูลโปรไฟล์', 'info')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition"
              >
                <Edit3 className="w-3 h-3" />
                <span>แก้ไขโปรไฟล์</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>24 ม.11 ต.แนงมุด อ.กาบเชิง จ.สุรินทร์</span>
            </p>

            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                <span>🎗</span>
                <span>ผู้ดูแลระบบสูงสุด</span>
              </span>
            </div>
          </div>
        </div>

        {/* Mode Toggle Button matching 06-admin-profile.png */}
        {isAdmin && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-600">
              โหมดสิทธิ์ใช้งาน:
            </span>

            <button
              onClick={() => {
                const next = viewMode === 'admin' ? 'citizen' : 'admin';
                setViewMode(next);
                showToast(next === 'admin' ? 'สลับเป็นมุมมองแอดมิน' : 'สลับเป็นมุมมองลูกบ้าน (Citizen Mode)', 'info');
              }}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              <span>👑</span>
              <span>{viewMode === 'admin' ? 'โหมดแอดมิน (คลิกดูมุมมองลูกบ้าน)' : 'โหมดลูกบ้าน (คลิกกลับแอดมิน)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Biographical Quote Box matching 06-admin-profile.png */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/40 rounded-3xl p-5 border border-slate-200 shadow-xs relative">
        <div className="text-2xl text-slate-300 font-serif absolute top-3 left-4 select-none">“</div>
        <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed pt-2">
          "สวัสดีครับทุกท่านที่กำลังเข้ามาชมหน้านี้ ผมชื่อทูน อิศราวัฒน์ เป็นผู้พัฒนา application นี้ และเป็นแอดมินที่ดูแลระบบทั้งหมดของ Localhub แนวคิดง่ายๆที่ทำให้ผมอยากพัฒนาแอปนี้ขึ้นมาก็คือ ผมอยากเห็นสังคมที่ดีขึ้น ข้อมูลข่าวสารต้องได้รับการอัพเดตรวดเร็ว และต้องผ่านการคัดกรองรับรองจากคนในพื้นที่ พร้อมกับได้รับการช่วยเหลืออย่างทันท่วงทีในทุกสถานการณ์ ผมในฐานะผู้พัฒนา app หวังเป็นอย่างยิ่งว่าคุณจะได้รับประสบการณ์ที่ดีจากการใช้ application นี้และมาร่วมสร้างสังคมที่ดีไปด้วยกันครับ สามารถร่วมสนับสนุนผมเพื่อสร้างสังคมที่ดีขึ้นได้ครับ"
        </p>
      </div>

      {/* Information Cards matching 06-admin-profile.png */}
      <div className="space-y-2">
        {/* Email */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3 text-xs text-slate-700 font-medium">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <span className="font-mono text-slate-800">israwat.lovebf@gmail.com</span>
        </div>

        {/* Phone */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3 text-xs text-slate-700 font-medium">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <span className="font-mono text-slate-800">0930652881</span>
        </div>

        {/* Birth Date */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3 text-xs text-slate-700 font-medium">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <span>เกิด: 15 พ.ค. 2533</span>
        </div>

        {/* Status: Single */}
        <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200/90 shadow-xs flex items-center gap-3 text-xs text-rose-900 font-medium">
          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
          <span className="font-bold">สถานะ: โสด</span>
        </div>

        {/* Emergency Contact */}
        <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200/90 shadow-xs flex items-center gap-3 text-xs text-rose-950 font-medium">
          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <span className="font-bold">ฉุกเฉิน:</span> อิศราวัฒน์ ปวินทกานต์ <span className="font-mono text-slate-600">0930652881</span>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Quick Actions matching 06-admin-profile.png */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          onClick={openContactAdminModal}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shrink-0 transition shadow-xs"
        >
          ติดต่อแอดมิน
        </button>
        <button
          onClick={() => showToast('เปิดร้านค้าของฉัน', 'info')}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shrink-0 transition shadow-xs"
        >
          ร้านของฉัน
        </button>
        <button
          onClick={() => showToast('เปิดรายการบันทึกไว้', 'info')}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shrink-0 transition shadow-xs"
        >
          บันทึก
        </button>
        <button
          onClick={openLocationModal}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shrink-0 transition shadow-xs"
        >
          พื้นที่ติดตาม
        </button>
        <button
          onClick={() => showToast('เปิดประวัติเหตุการณ์', 'info')}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 shrink-0 transition shadow-xs"
        >
          เหตุการณ์...
        </button>
      </div>

      {/* Admin Siren & Broadcast Actions (Exclusive to verified Admin) */}
      {effectiveIsAdmin && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 border border-indigo-800 shadow-md space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-red-600 rounded-xl text-white animate-pulse">
                <Activity className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">
                  ระบบส่งสัญญาณและบรอดแคสต์ (Admin Siren & Broadcast)
                </h4>
                <p className="text-[11px] text-slate-300">
                  สิทธิ์ผู้ดูแลระบบสูงสุด ({ORIGINAL_ADMIN_EMAIL})
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => {
                testLocalDeviceSignal('siren', 5);
                showToast('▶️ ทดสอบเสียงและระบบสั่นเฉพาะเครื่องนี้ (Admin Only)', 'info');
              }}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>ทดสอบเครื่องนี้</span>
            </button>

            <button
              onClick={() => {
                testAllDevicesSignal();
                showToast('📡 ส่งสัญญาณเตือนและระบบสั่นไปยังทุกอุปกรณ์แล้ว!', 'success');
              }}
              className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>ทดสอบทุกอุปกรณ์</span>
            </button>

            <button
              onClick={() => setOpenAdminModal(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>เปิดคอนโซล</span>
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal / Dropdown */}
      {showSettingsModal && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-3 animate-fadeIn">
          <h4 className="text-sm font-bold text-slate-900">การตั้งค่าระบบและบัญชี</h4>
          
          <div className="space-y-2">
            {currentUser ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">ลงชื่อเข้าใช้: {currentUser.email}</span>
                <button
                  onClick={logoutFirebase}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">เข้าสู่ระบบด้วย Google</span>
                <button
                  onClick={loginWithGoogle}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                >
                  เข้าสู่ระบบ
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600">เวอร์ชันแอป: v{APP_VERSION} ({BUILD_DATE})</span>
              <button
                disabled={isPurgingCache}
                onClick={async () => {
                  setIsPurgingCache(true);
                  await forcePurgeCacheAndReload();
                }}
                className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>ล้างแคช</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer */}
      <div className="text-center text-xs text-slate-400 py-3">
        LocalHub v{APP_VERSION} • SMART COMMUNITY PLATFORM
      </div>
    </div>
  );
};
