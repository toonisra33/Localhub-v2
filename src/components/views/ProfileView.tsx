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
  Sliders,
  RefreshCw,
  Sparkles,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Settings,
  Edit3,
  Bookmark,
  Store,
  Share2,
  AlertTriangle,
  Play,
  Square,
  Image as ImageIcon,
  Plus,
  Send,
  Database,
  LogIn,
  Navigation
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';

interface ProfileViewProps {
  onOpenCreatePost?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenCreatePost }) => {
  const {
    location,
    openLocationModal,
    isAdmin,
    openContactAdminModal,
    showToast,
    currentUser,
    isFirebaseConnected,
    loginWithGoogle,
    logoutFirebase,
    openLoginModal,
    setActiveTab,
    posts,
    marketItems,
    alerts,
    requestRealLocation,
    isLocatingGps
  } = useCommunity();

  const {
    soundEnabled,
    setSoundEnabled,
    playSoundAlert,
    setOpenAdminModal,
    testLocalDeviceSignal,
    testAllDevicesSignal,
    stopLocalDeviceTest,
    isTestingLocalAdmin,
    setOpenSignalTestModal
  } = useBroadcast();

  const [postDraft, setPostDraft] = useState('');

  const displayName = currentUser?.displayName || 'อิศราวัฒน์ ปวินทกานต์';
  const photoURL = currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

  const handleCreatePersonalPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postDraft.trim()) {
      showToast('กรุณากรอกข้อความเพื่อแชร์ในฟีดส่วนตัว', 'info');
      return;
    }
    showToast('แชร์เรื่องราวในฟีดส่วนตัวของคุณเรียบร้อยแล้ว', 'success');
    setPostDraft('');
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto animate-fadeIn pb-16">
      {/* Top Header matching Screenshot 1 */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
            <span className="text-lg">🏠</span>
          </div>
          <span className="font-extrabold text-base text-slate-900 tracking-tight">
            Local<span className="text-emerald-500">Hub</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[10px] font-black border border-emerald-500/30">
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>{isAdmin ? 'แอดมิน' : 'สมาชิก'}</span>
          </span>
          <button
            onClick={() => showToast('เปิดการตั้งค่าระบบ', 'info')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="ตั้งค่า"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profile Card matching Screenshot 1 */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
        {/* User photo with green shield badge */}
        <div className="relative shrink-0">
          <img
            src={photoURL}
            alt="Profile"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
          />
          <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-lg shadow-sm">
            <Shield className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* User details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 truncate">
              {displayName}
            </h2>
            <button
              onClick={() => showToast('แก้ไขข้อมูลส่วนตัว', 'info')}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="แก้ไข"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Real Live GPS Coordinates - No static address */}
          <div className="mt-2.5 p-3 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-slate-50 rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="text-[11px] font-black text-emerald-950 flex items-center gap-1">
                  <span>พิกัด GPS จริงพื้นที่ปัจจุบัน (Live Location)</span>
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black shadow-2xs">
                GPS LIVE 100%
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-emerald-200/60 text-xs">
              <div className="min-w-0">
                <div className="font-mono font-black text-slate-900 tracking-tight text-xs flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600 shrink-0" />
                  <span className="truncate">
                    {location.lat && location.lng
                      ? `${location.lat.toFixed(5)}° N, ${location.lng.toFixed(5)}° E`
                      : 'รอเชื่อมต่อสัญญาณดาวเทียม'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {location.displayName || `พื้นที่ใช้งานจริง: ${location.province}`}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => requestRealLocation()}
                  disabled={isLocatingGps}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                  title="ตรวจจับพิกัด GPS จริง ณ ตำแหน่งปัจจุบัน"
                >
                  <RefreshCw className={`w-3 h-3 ${isLocatingGps ? 'animate-spin' : ''}`} />
                  <span>{isLocatingGps ? 'กำลังจับ GPS...' : 'จับพิกัด GPS'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-emerald-300 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                  title="เปิดดูตำแหน่งจริงบนแผนที่ดาวเทียม"
                >
                  <MapPin className="w-3 h-3" />
                  <span>ดูแผนที่</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 flex items-center gap-1">
              <span>🎗️</span>
              <span>คะแนนชุมชน: 0</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 text-[11px] font-bold border border-sky-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-sky-600" />
              <span>ยืนยันตัวตนแล้ว</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Management & Area Menu (5 Items, matching Screenshot 1) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>เมนูการจัดการและพื้นที่ของคุณ</span>
          </div>
          <span className="text-[11px] text-slate-400">5 รายการด่วน</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {/* Item 1: Contact Admin (badge 3) */}
          <button
            onClick={openContactAdminModal}
            className="relative p-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-xs group"
          >
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl mb-1 group-hover:scale-105 transition-transform">
              <Radio className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 truncate w-full">ติดต่อแอ...</span>
          </button>

          {/* Item 2: My Shop */}
          <button
            onClick={() => setActiveTab('market')}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-xs group"
          >
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl mb-1 group-hover:scale-105 transition-transform">
              <Store className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 truncate w-full">ร้านของฉัน</span>
          </button>

          {/* Item 3: Saved (badge 1) */}
          <button
            onClick={() => showToast('รายการบันทึกของคุณ', 'info')}
            className="relative p-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-xs group"
          >
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              1
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mb-1 group-hover:scale-105 transition-transform">
              <Bookmark className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 truncate w-full">บันทึก</span>
          </button>

          {/* Item 4: Map & Real GPS */}
          <button
            onClick={() => setActiveTab('map')}
            className="relative p-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-xs group"
          >
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              GPS
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mb-1 group-hover:scale-105 transition-transform">
              <Navigation className="w-4 h-4 fill-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 truncate w-full">แผนที่ GPS</span>
          </button>

          {/* Item 5: Events/Alerts (badge 3) */}
          <button
            onClick={() => setActiveTab('alerts')}
            className="relative p-2.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-xs group"
          >
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {alerts.length}
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl mb-1 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 truncate w-full">เหตุการณ์</span>
          </button>
        </div>
      </div>

      {/* Personal Feed Card (Matching Screenshot 1) */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">ฟีดส่วนตัวของฉัน</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {displayName} • พิกัด GPS สด: {location.lat && location.lng ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'เปิดใช้ GPS'}
              </p>
            </div>
          </div>

          <button
            onClick={() => (onOpenCreatePost ? onOpenCreatePost() : showToast('สร้างโพสต์ใหม่', 'info'))}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>โพสต์ใหม่</span>
          </button>
        </div>

        {/* Input area */}
        <form onSubmit={handleCreatePersonalPost} className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2.5">
          <img
            src={photoURL}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <input
            type="text"
            value={postDraft}
            onChange={(e) => setPostDraft(e.target.value)}
            placeholder="แชร์เรื่องราวหรืออัปเดตในฟีดส่วนตัวของคุณ..."
            className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none"
          />
          <button
            type="button"
            onClick={() => (onOpenCreatePost ? onOpenCreatePost() : null)}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition"
            title="แนบรูปภาพ"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </form>

        {/* Stats and Real Connected Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <button
            onClick={() => setActiveTab('feed')}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
          >
            โพสต์ {posts.length}
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
          >
            ร้านค้า {marketItems.length}
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition cursor-pointer"
          >
            เหตุด่วน {alerts.length}
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl border border-teal-200 transition cursor-pointer flex items-center gap-1"
          >
            <Navigation className="w-3 h-3 fill-teal-700" />
            <span>แผนที่สด</span>
          </button>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-200 flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-600" />
            <span>ฐานข้อมูลคลาวด์</span>
          </span>
        </div>
      </div>

      {/* Admin Dashboard Quick Access (Exclusively for Admin) */}
      {isAdmin && (
        <div className="p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-lg border-2 border-red-500/40 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-red-600 text-white rounded-xl shadow-md animate-pulse shrink-0">
                <Activity className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-extrabold text-sm text-white">ศูนย์ควบคุมและแดชบอร์ดแอดมิน (Admin Dashboard)</h3>
                <p className="text-[11px] text-red-200">ระบบทดสอบสัญญาณเสียง สถิติ และการจัดการระบบแบบรวมศูนย์</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('admin')}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>เข้าสู่แดชบอร์ดแอดมิน</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            ระบบทดสอบสัญญาณเสียงไซเรนฉุกเฉินและระบบสั่นสะเทือนถูกย้ายมารวมไว้ที่ <strong>แดชบอร์ดแอดมิน</strong> ที่เดียว โดยแยกอิสระออกจากการส่งข่าวบรอดแคสต์
          </p>
        </div>
      )}

      {/* Account & Google Login Settings */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3 text-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">บัญชีผู้ใช้งาน</span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black border border-red-200">
                  🛡️ แอดมิน (Admin)
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              {currentUser?.email ? (
                <span>อีเมล: <strong className="text-slate-800">{currentUser.email}</strong></span>
              ) : (
                <span>ยังไม่ได้เข้าสู่ระบบ (กำลังใช้งานในโหมดผู้เยี่ยมชม)</span>
              )}
            </p>
          </div>

          {currentUser && (
            <button
              onClick={logoutFirebase}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition shrink-0 active:scale-95"
            >
              ออกจากระบบ
            </button>
          )}
        </div>

        {/* Normal Login Action Section */}
        {!currentUser?.email ? (
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={openLoginModal}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-2xl font-bold transition flex items-center justify-center gap-2 shadow-xs text-xs sm:text-sm"
              title="เข้าสู่ระบบปกติด้วย Google หรืออีเมล"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบปกติ (Sign In with Google / Email)</span>
            </button>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>ล็อกอินด้วย: <strong className="text-slate-800">{currentUser.email}</strong></span>
            <button
              onClick={openLoginModal}
              className="text-emerald-700 hover:underline font-bold text-xs"
            >
              จัดการบัญชี / สลับผู้ใช้
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
