import React from 'react';
import {
  Home,
  Compass,
  Globe,
  Users,
  BarChart3,
  User,
  ShoppingBag,
  AlertTriangle,
  CloudSun,
  HelpCircle,
  Activity
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { useBroadcast } from '../context/BroadcastContext';
import { Tab } from '../types';

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, openContactAdminModal, isAdmin } = useCommunity();
  const { setOpenSignalTestModal } = useBroadcast();

  // Exactly matching the 6 primary tabs + secondary features
  const primaryNavItems: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'หน้าหลัก', icon: <Home className="w-5 h-5" /> },
    { id: 'map', label: 'รอบตัว', icon: <Compass className="w-5 h-5" />, badge: 'GPS' },
    { id: 'broadcasts', label: 'ศูนย์ข่าว', icon: <Globe className="w-5 h-5" />, badge: 'LIVE' },
    { id: 'feed', label: 'ฟีดชุมชน', icon: <Users className="w-5 h-5" /> },
    { id: 'dashboard', label: 'แดชบอร์ด', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'profile', label: 'ฉัน', icon: <User className="w-5 h-5" /> },
  ];

  const secondaryNavItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'market', label: 'ตลาดนัดชุมชน', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'alerts', label: 'รายงานเหตุฉุกเฉิน', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'weather', label: 'พยากรณ์อากาศสด', icon: <CloudSun className="w-4 h-4" /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-4 sticky top-20 self-start">
      {/* Primary Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-3 shadow-xs space-y-1">
        {primaryNavItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Secondary Quick Access Services */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-3 shadow-xs space-y-1">
        <span className="text-[11px] font-bold text-slate-400 px-3 py-1 block">
          บริการด่วนเพิ่มเติม
        </span>
        {secondaryNavItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isActive ? 'bg-slate-100 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contact Admin Banner */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <span>ต้องการประชาสัมพันธ์?</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          ติดต่อทีมแอดมินเพื่อขอกระจายเสียงบรอดแคสต์ฟรี
        </p>
        <button
          onClick={openContactAdminModal}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          ขอส่งบรอดแคสต์
        </button>
      </div>

      {/* Admin Siren Test Card (Only if Admin toonisra33@gmail.com) */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-3xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-red-900 font-extrabold text-xs">
            <Activity className="w-4 h-4 text-red-600 animate-pulse" />
            <span>ทดสอบสัญญาณเตือนภัย</span>
          </div>
          <button
            onClick={() => setOpenSignalTestModal(true)}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>เปิดแผงทดสอบสัญญาณ</span>
          </button>
        </div>
      )}
    </aside>
  );
};
