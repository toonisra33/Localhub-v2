import React, { useState } from 'react';
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
  Sliders,
  ChevronDown,
  Volume2,
  Activity,
  Play,
  Square,
  Shield,
  MessageSquare,
  Search,
  ExternalLink,
  CloudSun
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';

interface HomeViewProps {
  onOpenCreatePost: () => void;
  onOpenInstantCamera?: () => void;
  onOpenNotifications: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenCreatePost,
  onOpenInstantCamera,
  onOpenNotifications
}) => {
  const {
    location,
    openLocationModal,
    setActiveTab,
    posts,
    marketItems,
    alerts,
    unreadNotifCount,
    isAdmin,
    openContactAdminModal,
    showToast,
    currentUser
  } = useCommunity();

  const {
    broadcasts,
    setOpenAdminModal,
    testLocalDeviceSignal,
    testAllDevicesSignal,
    stopLocalDeviceTest,
    isTestingLocalAdmin,
    isTestingAllDevices,
    setOpenSignalTestModal
  } = useBroadcast();

  const [searchQuery, setSearchQuery] = useState('');

  // Current formatted time e.g. "09:02 น."
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn">
      {/* Top Device & Network Status Simulation Bar matching 01-home-ai-summary.png */}
      <div className="bg-slate-950 text-slate-300 text-[11px] px-4 py-1.5 rounded-2xl flex items-center justify-between border border-slate-800 shadow-sm font-medium">
        <span className="font-bold text-white tracking-wide">{timeStr}</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>อุปกรณ์ 1 เครื่อง</span>
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <span>📶 36%</span>
        </div>
      </div>

      {/* Main Dark Header Card matching 01-home-ai-summary.png */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-800 space-y-4">
        {/* Top Logo & Direct Action Buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/30">
              <MapPin className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-white">
                  Local<span className="text-emerald-400">Hub</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30">
                  ● LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                ศูนย์รวมชุมชน & บรอดแคสสด
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Contact Admin purple pill button */}
            <button
              onClick={openContactAdminModal}
              className="px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-500 active:scale-95 text-white rounded-full text-xs font-bold transition flex items-center gap-1 shadow-sm border border-indigo-400/30"
            >
              <span>📢</span>
              <span>ติดต่อแอดมิน</span>
            </button>

            {/* Broadcast red pill button */}
            <button
              onClick={() => {
                if (isAdmin) {
                  setOpenAdminModal(true);
                } else {
                  setActiveTab('broadcasts');
                }
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-full text-xs font-bold transition flex items-center gap-1 shadow-sm shadow-red-600/30"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>บรอดแคส</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full text-slate-300 hover:text-white transition"
              title="การแจ้งเตือน"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* User Avatar */}
            <button
              onClick={() => setActiveTab('profile')}
              className="relative active:scale-95 transition"
              title="ดูโปรไฟล์ของฉัน"
            >
              <img
                src={currentUser?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-400 shadow-sm"
              />
            </button>
          </div>
        </div>

        {/* Search Bar matching 01-home-ai-summary.png */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเพื่อน, โพสต์, หรือสินค้า..."
            className="w-full pl-4 pr-10 py-3 bg-white/10 border border-white/15 focus:border-emerald-400 focus:bg-white/15 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* GPS Location Box with Green Button matching 01-home-ai-summary.png */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                ● พิกัด GPS จริง
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                GPS Active
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {location.displayName || `${location.province}, ${location.district}`}
              </h2>
              <button
                onClick={openLocationModal}
                className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] rounded-lg transition shrink-0 flex items-center gap-0.5"
              >
                เปลี่ยน <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>ต.{location.subdistrict || 'บ้านคลองอ่างแตก'} • ใกล้เคียง (100 ม.)</span>
            </p>
          </div>

          <button
            onClick={() => {
              openLocationModal();
              showToast('เปิดตัวเลือกพิกัด GPS ตำแหน่งปัจจุบัน', 'info');
            }}
            className="w-12 h-12 bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-2xl text-white flex flex-col items-center justify-center gap-0.5 shrink-0 shadow-lg shadow-emerald-600/30 transition font-bold"
          >
            <Navigation className="w-5 h-5 text-white" />
            <span className="text-[9px] font-black leading-none">GPS จริง</span>
          </button>
        </div>

        {/* Quick Horizontal Bar: Control Center / Broadcasts / Dashboard */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/15 active:scale-95 text-white rounded-xl flex items-center gap-1.5 transition shrink-0 border border-white/10"
          >
            <span>📊</span>
            <span>ศูนย์ควบคุม... ประชากร 4,892 คน</span>
          </button>

          <button
            onClick={() => {
              if (isAdmin) setOpenAdminModal(true);
              else setActiveTab('broadcasts');
            }}
            className="px-3.5 py-2 bg-red-600/90 hover:bg-red-600 active:scale-95 text-white rounded-xl flex items-center gap-1.5 transition shrink-0 shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>((•)) บรอดแคส</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-3.5 py-2 bg-indigo-600/80 hover:bg-indigo-600 active:scale-95 text-white rounded-xl flex items-center gap-1.5 transition shrink-0 shadow-sm border border-indigo-400/30"
          >
            <span>📊</span>
            <span>ดูแดชบอร์ด</span>
          </button>
        </div>
      </div>

      {/* AI Community Summary Card matching 01-home-ai-summary.png */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  AI สรุปสถานการณ์ชุมชน
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                  ● LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                อัปเดตข้อมูลสำคัญในพื้นที่ของคุณ
              </p>
            </div>
          </div>
        </div>

        {/* AI Greeting Box */}
        <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-slate-50 border border-indigo-100 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed shadow-xs">
          สวัสดีตอนเช้าครับ 🌤 แถว<strong className="text-indigo-900">{location.displayName || location.province}</strong> อากาศตอนนี้ มีเมฆบางส่วนถึงครึ้ม อุณหภูมิ 30°C มีประกาศจากแอดมิน <span className="font-bold text-red-600">{broadcasts.length} รายการ</span> และมีการแจ้งเหตุ <span className="font-bold text-amber-600">{alerts.length} จุด</span> ในพื้นที่ ควรเผื่อเวลาเดินทางนะครับ
        </div>

        {/* 3 Metric Counter Boxes matching 01-home-ai-summary.png */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <button
            onClick={() => setActiveTab('alerts')}
            className="p-3 bg-rose-50 hover:bg-rose-100/80 active:scale-95 border border-rose-200 rounded-2xl text-center transition flex flex-col items-center justify-center"
          >
            <span className="text-xl sm:text-2xl font-black text-rose-700">
              {alerts.length || 1}
            </span>
            <span className="text-[11px] font-bold text-rose-900 mt-0.5 flex items-center gap-1">
              <span>🚨</span> เหตุการณ์ด่วน
            </span>
          </button>

          <button
            onClick={() => setActiveTab('broadcasts')}
            className="p-3 bg-blue-50 hover:bg-blue-100/80 active:scale-95 border border-blue-200 rounded-2xl text-center transition flex flex-col items-center justify-center"
          >
            <span className="text-xl sm:text-2xl font-black text-blue-700">
              {broadcasts.length || 3}
            </span>
            <span className="text-[11px] font-bold text-blue-900 mt-0.5 flex items-center gap-1">
              <span>📅</span> กิจกรรม/ประกาศ
            </span>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className="p-3 bg-emerald-50 hover:bg-emerald-100/80 active:scale-95 border border-emerald-200 rounded-2xl text-center transition flex flex-col items-center justify-center"
          >
            <span className="text-xl sm:text-2xl font-black text-emerald-700">
              {marketItems.length || 2}
            </span>
            <span className="text-[11px] font-bold text-emerald-900 mt-0.5 flex items-center gap-1">
              <span>🏪</span> ร้านค้า/ตลาด
            </span>
          </button>
        </div>
      </div>

      {/* Services and Emergency Section (บริการและเรื่องด่วน) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            บริการและเรื่องด่วน
          </h3>
          <span className="text-[11px] text-slate-400">แตะเพื่อเปิดบริการ</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* Service 1: Instant Live Camera (User-requested feature) */}
          <button
            onClick={onOpenInstantCamera}
            className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 hover:bg-emerald-100/70 border border-emerald-200/90 rounded-2xl text-left transition active:scale-95 group shadow-xs"
          >
            <div className="p-2 bg-emerald-600 text-white rounded-xl w-fit shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs font-extrabold text-slate-900">กล้องถ่ายรูปสด</h4>
              <p className="text-[10px] text-slate-500">ถ่ายภาพ/วิดีโอแชร์ทันที</p>
            </div>
          </button>

          {/* Service 2: Report Alert */}
          <button
            onClick={() => setActiveTab('alerts')}
            className="p-3.5 bg-gradient-to-br from-rose-50 to-orange-50 hover:bg-rose-100/70 border border-rose-200/90 rounded-2xl text-left transition active:scale-95 group shadow-xs"
          >
            <div className="p-2 bg-rose-600 text-white rounded-xl w-fit shadow-md shadow-rose-600/30 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs font-extrabold text-slate-900">แจ้งเหตุด่วน</h4>
              <p className="text-[10px] text-slate-500">อุบัติเหตุ ภัยพิบัติ ซ่อมบำรุง</p>
            </div>
          </button>

          {/* Service 3: Around Me Radar */}
          <button
            onClick={() => setActiveTab('map')}
            className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 hover:bg-blue-100/70 border border-blue-200/90 rounded-2xl text-left transition active:scale-95 group shadow-xs"
          >
            <div className="p-2 bg-blue-600 text-white rounded-xl w-fit shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs font-extrabold text-slate-900">เรดาร์รอบตัว</h4>
              <p className="text-[10px] text-slate-500">แผนที่และระยะ 1-10 กม.</p>
            </div>
          </button>

          {/* Service 4: Community Market */}
          <button
            onClick={() => setActiveTab('market')}
            className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50 hover:bg-amber-100/70 border border-amber-200/90 rounded-2xl text-left transition active:scale-95 group shadow-xs"
          >
            <div className="p-2 bg-amber-600 text-white rounded-xl w-fit shadow-md shadow-amber-600/30 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs font-extrabold text-slate-900">ตลาดนัดชุมชน</h4>
              <p className="text-[10px] text-slate-500">ซื้อ-ขาย อาหาร ผลผลิต</p>
            </div>
          </button>

          {/* Service 5: Official Broadcasts */}
          <button
            onClick={() => setActiveTab('broadcasts')}
            className="p-3.5 bg-gradient-to-br from-indigo-50 to-purple-50 hover:bg-indigo-100/70 border border-indigo-200/90 rounded-2xl text-left transition active:scale-95 group shadow-xs"
          >
            <div className="p-2 bg-indigo-600 text-white rounded-xl w-fit shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs font-extrabold text-slate-900">ศูนย์บรอดแคสต์</h4>
              <p className="text-[10px] text-slate-500">ประกาศทางการฉุกเฉิน</p>
            </div>
          </button>

          {/* Service 6: Weather Forecast */}
          <button
            onClick={() => setActiveTab('weather')}
            className="p-3.5 bg-gradient-to-br from-sky-50 to-blue-50 hover:bg-sky-100/70 border border-sky-200/90 rounded-2xl text-left transition active:scale-95 group shadow-xs"
          >
            <div className="p-2 bg-sky-600 text-white rounded-xl w-fit shadow-md shadow-sky-600/30 group-hover:scale-105 transition-transform">
              <CloudSun className="w-5 h-5" />
            </div>
            <div className="mt-2.5">
              <h4 className="text-xs font-extrabold text-slate-900">พยากรณ์อากาศสด</h4>
              <p className="text-[10px] text-slate-500">เรดาร์ฝนและอุณหภูมิ</p>
            </div>
          </button>
        </div>

        {/* Admin Signal Test Actions inside Services (Visible exclusively when toonisra33@gmail.com is Admin) */}
        {isAdmin && (
          <div className="mt-3 p-3.5 bg-gradient-to-r from-red-950 to-slate-900 rounded-2xl text-white border border-red-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-red-400">
                <Activity className="w-4 h-4 animate-pulse" />
                ระบบทดสอบสัญญาณเตือนภัย (Admin Console)
              </span>
              <button
                onClick={() => setOpenSignalTestModal(true)}
                className="text-[11px] text-slate-300 hover:text-white underline"
              >
                ตั้งค่า
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isTestingLocalAdmin ? (
                <button
                  onClick={stopLocalDeviceTest}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
                >
                  <Square className="w-3.5 h-3.5" />
                  หยุดเสียงเครื่องนี้
                </button>
              ) : (
                <button
                  onClick={() => {
                    testLocalDeviceSignal('siren', 5);
                    showToast('▶️ ทดสอบเสียงและระบบสั่นเฉพาะเครื่องนี้ (Admin Only)', 'info');
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  ทดสอบเฉพาะเครื่องนี้
                </button>
              )}

              <button
                onClick={() => {
                  testAllDevicesSignal();
                  showToast('📡 ส่งสัญญาณเตือนและระบบสั่นไปยังทุกอุปกรณ์แล้ว!', 'success');
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                ทดสอบทุกอุปกรณ์ (All Devices)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fast Share / Post Entry Box */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-3">
        <img
          src={currentUser?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
          alt="User"
          className="w-10 h-10 rounded-full object-cover border border-slate-200"
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
