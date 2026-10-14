import React from 'react';
import {
  MapPin,
  Bell,
  Radio,
  Sparkles,
  AlertTriangle,
  Calendar,
  ShoppingBag,
  Camera,
  Navigation,
  ChevronDown,
  Volume2,
  Activity,
  Play,
  Square,
  UtensilsCrossed,
  HelpCircle,
  Megaphone,
  CloudSun,
  Store,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';

interface HomeViewProps {
  onOpenCreatePost: () => void;
  onOpenInstantCamera?: () => void;
  onOpenNotifications: () => void;
  onOpenReportAlert?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenCreatePost,
  onOpenInstantCamera,
  onOpenNotifications,
  onOpenReportAlert
}) => {
  const {
    location,
    openLocationModal,
    setActiveTab,
    unreadNotifCount,
    isAdmin,
    openContactAdminModal,
    showToast,
    currentUser,
    requestRealLocation
  } = useCommunity();

  const {
    testLocalDeviceSignal,
    testAllDevicesSignal,
    stopLocalDeviceTest,
    isTestingLocalAdmin,
    setOpenSignalTestModal
  } = useBroadcast();

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn pb-12">
      {/* Dark Navy Top Header (Matching Screenshot 3) */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <span className="text-xl">🏠</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Local<span className="text-emerald-400">Hub</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  ● LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">ศูนย์รวมชุมชน & บรอดแคสต์สด</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openContactAdminModal}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ติดต่อแอดมิน</span>
            </button>

            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="การแจ้งเตือน"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <img
              src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-emerald-400 shadow-sm cursor-pointer"
              onClick={() => setActiveTab('profile')}
            />
          </div>
        </div>

        {/* Location Banner with Big Real GPS Button (Matching Screenshot 3) */}
        <div className="mt-3.5 p-3 sm:p-3.5 bg-slate-900/90 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-2.5 shadow-inner min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-400 font-bold mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate">พื้นที่ปัจจุบัน</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-white text-xs sm:text-base tracking-tight truncate">
                {location.district ? `${location.district}, ${location.province}` : location.province}
              </h3>
              <button
                onClick={openLocationModal}
                className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-md text-[10px] sm:text-[11px] font-semibold flex items-center gap-0.5 transition shrink-0"
              >
                <span>เปลี่ยน</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
              ต.{location.subdistrict || 'ลาดยาว'} • หมู่บ้านพหลโยธินวิลล่า
            </p>
          </div>

          {/* Big Green Real GPS Button */}
          <button
            onClick={() => requestRealLocation()}
            className="px-3 py-2 sm:px-3.5 sm:py-2.5 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition shrink-0"
            title="ตรวจจับพิกัด GPS จริง ณ ตำแหน่งที่คุณอยู่"
          >
            <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" />
            <span>GPS จริง</span>
          </button>
        </div>
      </div>

      {/* Daily Summary Card (Matching Screenshot 3: สรุปประจำวันรอบตัวคุณ) */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg shadow-md shadow-amber-500/30">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  สรุปประจำวันรอบตัวคุณ
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  สดวันนี้
                </span>
              </div>
              <p className="text-xs text-slate-500">อัปเดตสถานการณ์ล่าสุดในพื้นที่</p>
            </div>
          </div>
        </div>

        {/* 2x2 Daily Digest Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => setActiveTab('weather')}
            className="p-3 bg-sky-50/70 hover:bg-sky-100/80 border border-sky-100 rounded-2xl flex items-center gap-2.5 text-left transition active:scale-98"
          >
            <div className="p-2 bg-sky-500 text-white rounded-xl shrink-0">
              <CloudSun className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">มีเมฆบางส่วน 31°C</div>
              <div className="text-[10px] text-slate-500">พยากรณ์ฝน 15% คุณภาพอากาศดี</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className="p-3 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-100 rounded-2xl flex items-center gap-2.5 text-left transition active:scale-98"
          >
            <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">ปิดถนน 1 จุด (ถ.พหลโยธิน)</div>
              <div className="text-[10px] text-slate-500">งานซ่อมท่อระบายน้ำ เลี่ยงชั่วโมงเร่งด่วน</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className="p-3 bg-purple-50/70 hover:bg-purple-100/80 border border-purple-100 rounded-2xl flex items-center gap-2.5 text-left transition active:scale-98"
          >
            <div className="p-2 bg-purple-500 text-white rounded-xl shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">กิจกรรม 3 งานจัดขึ้นสัปดาห์นี้</div>
              <div className="text-[10px] text-slate-500">ตลาดนัดวัดเสมียน และงานบริจาคเลือด</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className="p-3 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-100 rounded-2xl flex items-center gap-2.5 text-left transition active:scale-98"
          >
            <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">ร้านใหม่ 2 ร้านแถวพหลโยธิน</div>
              <div className="text-[10px] text-slate-500">ร้านกาแฟ & ร้านผลไม้สวนสด</div>
            </div>
          </button>
        </div>
      </div>

      {/* Services & Quick Actions (Matching Screenshot 3: บริการและเรื่องด่วน) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-slate-900 text-sm">บริการและเรื่องด่วน</h3>
          <span className="text-[11px] text-slate-400">แตะเพื่อเปิดบริการ</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-2.5">
          <button
            onClick={openContactAdminModal}
            className="p-2 sm:p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-xs"
          >
            <div className="p-1.5 sm:p-2 bg-indigo-600 text-white rounded-xl mb-1 sm:mb-1.5 shadow-sm">
              <Megaphone className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate w-full">ติดต่อแอดมิน</span>
          </button>

          <button
            onClick={() => (onOpenReportAlert ? onOpenReportAlert() : setActiveTab('alerts'))}
            className="p-2 sm:p-3 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-xs"
          >
            <div className="p-1.5 sm:p-2 bg-rose-600 text-white rounded-xl mb-1 sm:mb-1.5 shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate w-full">แจ้งเหตุ</span>
          </button>

          <button
            onClick={() => {
              showToast('เปิดรายชื่อร้านอาหารและเมนูยอดนิยมรอบตัว', 'info');
              setActiveTab('market');
            }}
            className="p-2 sm:p-3 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-xs"
          >
            <div className="p-1.5 sm:p-2 bg-amber-600 text-white rounded-xl mb-1 sm:mb-1.5 shadow-sm">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate w-full">กินอะไรดี</span>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className="p-2 sm:p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-xs"
          >
            <div className="p-1.5 sm:p-2 bg-emerald-600 text-white rounded-xl mb-1 sm:mb-1.5 shadow-sm">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate w-full">ตลาดนัด</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className="hidden sm:flex p-2 sm:p-3 bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-xl sm:rounded-2xl flex-col items-center justify-center text-center transition active:scale-95 shadow-xs"
          >
            <div className="p-1.5 sm:p-2 bg-teal-600 text-white rounded-xl mb-1 sm:mb-1.5 shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate w-full">รอบตัวฉัน</span>
          </button>
        </div>
      </div>

      {/* Admin Emergency Alert Console (For toonisra33@gmail.com only) */}
      {isAdmin && (
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 rounded-2xl sm:rounded-3xl text-white border-2 border-red-500/40 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold text-red-300 min-w-0 flex-1 truncate">
              <Activity className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
              <span className="truncate">ระบบทดสอบสัญญาณเตือนภัย (Admin Test)</span>
            </div>
            <button
              onClick={() => setOpenSignalTestModal(true)}
              className="text-[10px] sm:text-[11px] text-slate-300 hover:text-white underline shrink-0"
            >
              เปิดแผงตั้งค่า
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isTestingLocalAdmin ? (
              <button
                onClick={stopLocalDeviceTest}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-sm active:scale-95"
              >
                <Square className="w-3.5 h-3.5" />
                <span>หยุดเสียงเครื่องนี้</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  testLocalDeviceSignal('siren', 5);
                  showToast('▶️ ทดสอบเสียงและระบบสั่นเฉพาะเครื่องนี้ (Admin Only)', 'info');
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-sm active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                <span>ทดสอบเฉพาะเครื่องนี้</span>
              </button>
            )}

            <button
              onClick={() => {
                testAllDevicesSignal();
                showToast('📡 ส่งสัญญาณเตือนและระบบสั่นไปยังทุกอุปกรณ์แล้ว!', 'success');
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-sm active:scale-95"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span className="truncate">ทดสอบทุกอุปกรณ์ (All Devices)</span>
            </button>
          </div>
        </div>
      )}

      {/* Share / Post Box */}
      <div className="p-3.5 sm:p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-3">
        <img
          src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
        />
        <button
          onClick={onOpenCreatePost}
          className="flex-1 text-left px-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 rounded-2xl text-xs sm:text-sm text-slate-500 font-medium transition"
        >
          มีอะไรเกิดขึ้นในพื้นที่? แชร์กับเพื่อนบ้าน...
        </button>
        {onOpenInstantCamera && (
          <button
            onClick={onOpenInstantCamera}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-300 transition shrink-0 active:scale-95"
            title="เปิดกล้องถ่ายภาพสดทันที"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
