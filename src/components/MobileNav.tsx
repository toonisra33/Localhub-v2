import React from 'react';
import {
  Home,
  MapPin,
  Users,
  User,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { Tab } from '../types';

interface MobileNavProps {
  onOpenInstantCamera?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = () => {
  const { activeTab, setActiveTab, isAdmin } = useCommunity();

  // Navigation Items:
  // "นำปุ่มแจ้งเหตุ ตลาด ออกจากแถบนำทางด้านล่าง นำไปแสดงผลที่หน้าหลักทั้งหมด กลุ่มศูนย์ข่าวให้ขยับนำมาไว้ตรงกลางแถบ"
  // 1. หน้าหลัก (Home)
  // 2. รอบตัว (Map)
  // 3. ศูนย์ข่าว (Broadcasts / News Center) -> EXACT CENTER!
  // 4. ฟีด (Feed)
  // 5. ฉัน (Profile)
  // (+ แอดมิน if admin)
  const navItems: { id: Tab; label: string; icon: React.ReactNode; isCenter?: boolean }[] = [
    { id: 'home', label: 'หน้าหลัก', icon: <Home className="w-5 h-5" /> },
    { id: 'map', label: 'รอบตัว', icon: <MapPin className="w-5 h-5" /> },
    {
      id: 'broadcasts',
      label: 'ศูนย์ข่าว',
      icon: <Radio className="w-5 h-5" />,
      isCenter: true
    },
    { id: 'feed', label: 'ฟีด', icon: <Users className="w-5 h-5" /> },
    { id: 'profile', label: 'ฉัน', icon: <User className="w-5 h-5" /> },
    ...(isAdmin
      ? [{ id: 'admin' as Tab, label: 'แอดมิน', icon: <ShieldAlert className="w-5 h-5" /> }]
      : [])
  ];

  return (
    <nav
      aria-label="แถบนำทางด้านล่าง"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg"
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const isAdminTab = item.id === 'admin';
        const isCenter = Boolean(item.isCenter);

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 min-w-0 min-h-[44px] flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition relative group active:scale-95 ${
              isActive
                ? isCenter
                  ? 'text-blue-700 font-extrabold'
                  : isAdminTab
                  ? 'text-red-700 font-bold'
                  : 'text-emerald-700 font-bold'
                : 'text-slate-400 font-medium hover:text-slate-600'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all relative ${
                isCenter
                  ? isActive
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white scale-110 shadow-md shadow-blue-500/30 ring-2 ring-blue-300/60'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-200/80 shadow-2xs'
                  : isActive
                  ? isAdminTab
                    ? 'bg-red-100 text-red-700 scale-105 shadow-xs'
                    : 'bg-emerald-100 text-emerald-800 scale-105 shadow-xs'
                  : isAdminTab
                  ? 'text-red-500'
                  : 'text-slate-500'
              }`}
            >
              {item.icon}
              {isCenter && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <span
              className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full ${
                isActive
                  ? isCenter
                    ? 'text-blue-700 font-extrabold'
                    : isAdminTab
                    ? 'text-red-700 font-bold'
                    : 'text-emerald-700 font-bold'
                  : isCenter
                  ? 'text-blue-900 font-bold'
                  : 'text-slate-500 font-medium'
              }`}
            >
              {item.label}
            </span>
            {isActive && (
              <span
                className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                  isCenter ? 'bg-blue-600' : isAdminTab ? 'bg-red-600' : 'bg-emerald-600'
                }`}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
