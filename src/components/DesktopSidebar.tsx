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
    { id: 'broadcasts', label: 'บรอดแคสต์ทางการ', icon: <Radio className="w-5 h-5" /> },
    { id: 'weather', label: 'พยากรณ์อากาศสด', icon: <CloudSun className="w-5 h-5" /> },
    { id: 'alerts', label: 'รายงานเหตุฉุกเฉิน', icon: <AlertTriangle className="w-5 h-5" /> },
    ...(isAdmin
      ? [{ id: 'admin' as Tab, label: 'แดชบอร์ดแอดมิน', icon: <ShieldAlert className="w-5 h-5 text-red-500" />, badge: 'ADMIN' }]
      : [])
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-5 sticky top-20 self-start">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-3 shadow-xs space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isAdminItem = item.id === 'admin';

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? isAdminItem
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : isAdminItem
                  ? 'text-red-700 hover:text-red-900 hover:bg-red-50 border border-red-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : isAdminItem ? 'text-red-600' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isAdminItem
                      ? 'bg-red-100 text-red-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Account Widget */}
      <div
        onClick={openLoginModal}
        className="p-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between cursor-pointer transition shadow-xs group"
        title="จัดการบัญชี / เข้าสู่ระบบ"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover ring-1.5 ring-slate-200 group-hover:ring-emerald-500 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">
              {currentUser?.displayName || 'ผู้เยี่ยมชม'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {currentUser?.email ? (isAdmin ? '🛡️ ผู้ดูแลระบบ' : '👤 สมาชิก') : 'แตะเพื่อเข้าสู่ระบบ'}
            </p>
          </div>
        </div>
        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 group-hover:bg-emerald-100 px-2 py-0.5 rounded-lg shrink-0">
          {currentUser?.email ? 'จัดการ' : 'ล็อกอิน'}
        </span>
      </div>

      {/* Contact Admin / Community Notice Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-4 space-y-2.5">
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
