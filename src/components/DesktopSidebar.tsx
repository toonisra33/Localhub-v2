import React from 'react';
import { 
  Home, 
  MapPin, 
  Globe, 
  Users, 
  Store, 
  BarChart3, 
  User, 
  AlertTriangle, 
  PlusCircle, 
  Megaphone, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  Compass,
  Bell,
  Sparkles
} from 'lucide-react';
import { Tab } from '../types';
import { useCommunity } from '../context/CommunityContext';
import { useBroadcast } from '../context/BroadcastContext';
import { LocalHubLogo } from './LocalHubLogo';
import { isAuthorizedAdminEmail } from '../lib/firebase';

interface DesktopSidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onOpenLocationPicker?: () => void;
  onOpenNotifications?: () => void;
}

export function DesktopSidebar({
  activeTab,
  setActiveTab,
  onOpenLocationPicker,
  onOpenNotifications
}: DesktopSidebarProps) {
  const { 
    location, 
    userProfile, 
    isLoggedIn, 
    openAuthModal, 
    logout, 
    unreadNotificationsCount,
    openContactAdminModal
  } = useCommunity();
  const { role, setOpenAdminModal } = useBroadcast();

  const isAdmin = isLoggedIn && role === 'admin' && isAuthorizedAdminEmail(userProfile?.email);

  const navItems = [
    { id: 'home', icon: Home, label: 'หน้าหลัก', desc: 'ภาพรวมและเรื่องด่วน' },
    { id: 'map', icon: MapPin, label: 'แผนที่รอบตัว', desc: 'เรดาร์สด & ปักหมุด' },
    { id: 'global_news', icon: Globe, label: 'ศูนย์รวมข่าวสาร', desc: 'ข่าวฮิตทั่วประเทศ' },
    { id: 'community', icon: Users, label: 'ฟีดชุมชน', desc: 'โพสต์ พูดคุย และเพื่อนบ้าน' },
    { id: 'market', icon: Store, label: 'ตลาดนัดชุมชน', desc: 'ซื้อขาย & อาหารใกล้บ้าน' },
    ...(isAdmin ? [{ id: 'admin_dashboard', icon: BarChart3, label: 'แดชบอร์ดแอดมิน', desc: 'ศูนย์ควบคุมสิทธิ์และข้อมูล' }] : []),
    { id: 'me', icon: User, label: 'ข้อมูลของฉัน', desc: 'โปรไฟล์ & บัญชีผู้ใช้' },
  ] as const;

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col bg-white border-r border-slate-200/80 h-screen sticky top-0 z-30 justify-between p-4 lg:p-5 shadow-xs overflow-y-auto select-none">
      
      {/* Top Section */}
      <div className="space-y-4">
        {/* Logo & App Brand */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <LocalHubLogo size="md" variant="dark" showSubtitle={true} />
          
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center relative transition-colors border border-slate-200/60"
              title="การแจ้งเตือน"
              aria-label="การแจ้งเตือน"
            >
              <Bell size={18} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Current Active Location Card (Clickable to change area) */}
        <div 
          onClick={onOpenLocationPicker}
          className="bg-slate-900 text-white p-3.5 rounded-2xl cursor-pointer hover:bg-slate-800 transition-all border border-slate-800 shadow-sm group"
          title="แตะเพื่อเปลี่ยนพื้นที่หรือค้นหาตำบล"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {location.isGps ? 'GPS จริง' : 'พื้นที่ปัจจุบัน'}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold group-hover:text-emerald-300 transition-colors">
              เปลี่ยนพื้นที่ ➔
            </span>
          </div>

          <p className="font-extrabold text-[15px] text-white leading-tight truncate group-hover:text-emerald-200 transition-colors">
            {location.district}, {location.province}
          </p>
          <p className="text-[11.5px] text-slate-400 truncate mt-0.5">
            ต.{location.subdistrict} • {location.village}
          </p>
        </div>

        {/* Primary Navigation Menu */}
        <nav aria-label="เมนูหลักเดสก์ท็อป" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAdminTab = item.id === 'admin_dashboard';

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-left transition-all group ${
                  isActive 
                    ? (isAdminTab 
                        ? 'bg-rose-50 text-rose-800 font-extrabold shadow-xs border border-rose-200/60' 
                        : 'bg-emerald-50 text-emerald-900 font-extrabold shadow-xs border border-emerald-200/60')
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${
                  isActive 
                    ? (isAdminTab ? 'bg-rose-600 text-white shadow-sm' : 'bg-emerald-600 text-white shadow-sm')
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                }`}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] tracking-tight truncate">
                      {item.label}
                    </span>
                    {isActive && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isAdminTab ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                    )}
                  </div>
                  <p className="text-[10.5px] font-medium text-slate-400 truncate hidden lg:block">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Quick Action & User Profile */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        
        {/* Quick Admin Broadcast Button (if Admin) */}
        {isAdmin && (
          <button
            onClick={() => setOpenAdminModal(true)}
            className="w-full py-2 px-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-[12px] font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <AlertTriangle size={14} />
            <span>ส่งสัญญาณบรอดแคสด่วน</span>
          </button>
        )}

        {/* Contact Admin Quick Link */}
        <button
          onClick={() => openContactAdminModal('pr_request')}
          className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 rounded-xl text-[12px] font-extrabold flex items-center justify-center gap-2 transition-colors"
        >
          <Megaphone size={14} className="text-indigo-600" />
          <span>ติดต่อแอดมิน / ประชาสัมพันธ์</span>
        </button>

        {/* User Mini Profile & Auth State */}
        {isLoggedIn ? (
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 flex items-center justify-between gap-2.5">
            <div 
              onClick={() => setActiveTab('me')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
            >
              <img 
                src={userProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || 'U')}&background=random`}
                alt={userProfile?.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-extrabold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                  {userProfile?.name}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold truncate">
                  {userProfile?.role === 'admin' ? '👑 ผู้ดูแลระบบ' : (userProfile?.isVerified ? '✓ สมาชิกยืนยันแล้ว' : 'สมาชิกทั่วไป')}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="ออกจากระบบ"
              className="w-8 h-8 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors border border-slate-200/60 shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[13px] font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <LogIn size={15} />
            <span>เข้าสู่ระบบ / ลงทะเบียน</span>
          </button>
        )}

      </div>
    </aside>
  );
}
