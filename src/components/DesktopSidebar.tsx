import React from 'react';
import {
  Home,
  MapPin,
  Users,
  Store,
  User,
  Radio,
  AlertTriangle,
  CloudSun,
  Megaphone,
  ShieldAlert
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { Tab } from '../types';

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, openContactAdminModal, isAdmin, currentUser, openLoginModal } = useCommunity();

  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'หน้าหลัก', icon: <Home className="w-5 h-5" /> },
    { id: 'map', label: 'รอบตัว / แผนที่', icon: <MapPin className="w-5 h-5" />, badge: 'LIVE' },
    { id: 'feed', label: 'ฟีดชุมชน', icon: <Users className="w-5 h-5" /> },
    { id: 'market', label: 'ตลาดนัดชุมชน', icon: <Store className="w-5 h-5" /> },
    { id: 'profile', label: 'บัญชีของฉัน', icon: <User className="w-5 h-5" /> },
    { id: 'broadcasts', label: 'ศูนย์ข่าว & บรอดแคสต์', icon: <Radio className="w-5 h-5" />, badge: 'HOT' },
    { id: 'weather', label: 'พยากรณ์อากาศสด', icon: <CloudSun className="w-5 h-5" /> },
    { id: 'alerts', label: 'รายงานเหตุฉุกเฉิน', icon: <AlertTriangle className="w-5 h-5" /> },
    ...(isAdmin
      ? [{ id: 'admin' as Tab, label: 'แดชบอร์ดแอดมิน', icon: <ShieldAlert className="w-5 h-5 text-red-500" />, badge: 'ADMIN' }]
      : [])
  ];

  return (
    <aside className="hidden md:flex flex-col md:w-20 lg:w-64 shrink-0 md:space-y-3 lg:space-y-5 sticky top-20 self-start transition-all duration-200">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-2 lg:p-3 shadow-xs space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isAdminItem = item.id === 'admin';

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-center lg:justify-between px-2.5 lg:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all relative group ${
                isActive
                  ? isAdminItem
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : isAdminItem
                  ? 'text-red-700 hover:text-red-900 hover:bg-red-50 border border-red-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
              title={item.label}
            >
              <div className="flex items-center gap-3">
                <span className={`shrink-0 ${isActive ? 'text-white' : isAdminItem ? 'text-red-600' : 'text-slate-500'}`}>
                  {item.icon}
                </span>
                <span className="hidden lg:inline truncate">{item.label}</span>
              </div>

              {item.badge && (
                <>
                  {/* Desktop Full Badge */}
                  <span
                    className={`hidden lg:inline text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isAdminItem
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                  {/* Tablet Dot Indicator */}
                  <span
                    className={`lg:hidden absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                      isActive ? 'bg-white' : isAdminItem ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                  />
                </>
              )}

              {/* Tablet Floating Tooltip on Hover */}
              <div className="lg:hidden absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Account Widget (Compact on tablet, full on desktop) */}
      <div
        onClick={openLoginModal}
        className="p-2 lg:p-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-center lg:justify-between cursor-pointer transition shadow-xs group relative"
        title="จัดการบัญชี / เข้าสู่ระบบ"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover ring-1.5 ring-slate-200 group-hover:ring-emerald-500 shrink-0"
          />
          <div className="min-w-0 hidden lg:block">
            <p className="text-xs font-bold text-slate-800 truncate">
              {currentUser?.displayName || 'ผู้เยี่ยมชม'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {currentUser?.email ? (isAdmin ? '🛡️ ผู้ดูแลระบบ' : '👤 สมาชิก') : 'แตะเพื่อเข้าสู่ระบบ'}
            </p>
          </div>
        </div>
        <span className="hidden lg:inline text-[10px] text-emerald-700 font-bold bg-emerald-50 group-hover:bg-emerald-100 px-2 py-0.5 rounded-lg shrink-0">
          {currentUser?.email ? 'จัดการ' : 'ล็อกอิน'}
        </span>

        {/* Tablet Tooltip */}
        <div className="lg:hidden absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-lg">
          {currentUser?.displayName || 'เข้าสู่ระบบ'}
        </div>
      </div>

      {/* Contact Admin / Community Notice Card (Hidden on tablet, shown on desktop) */}
      <div className="hidden lg:block bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
          <Megaphone className="w-4 h-4 text-indigo-600" />
          <span>ต้องการประชาสัมพันธ์?</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          มีกิจกรรม งานบุญ หรือข่าวสารชุมชน ติดต่อทีมแอดมินเพื่อขอกระจายเสียงบรอดแคสต์ฟรี
        </p>
        <button
          onClick={openContactAdminModal}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          ขอส่งบรอดแคสต์
        </button>
      </div>
    </aside>
  );
};
