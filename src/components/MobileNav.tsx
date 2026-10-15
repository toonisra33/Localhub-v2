import React from 'react';
import {
  Home,
  MapPin,
  Users,
  Store,
  User,
  ShieldAlert,
  Newspaper
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { Tab } from '../types';

interface MobileNavProps {
  onOpenInstantCamera?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = () => {
  const { activeTab, setActiveTab, isAdmin } = useCommunity();

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'หน้าหลัก', icon: <Home className="w-5 h-5" /> },
    { id: 'map', label: 'รอบตัว', icon: <MapPin className="w-5 h-5" /> },
    { id: 'feed', label: 'ฟีด', icon: <Users className="w-5 h-5" /> },
    { id: 'broadcasts', label: 'ศูนย์ข่าว', icon: <Newspaper className="w-5 h-5" /> },
    { id: 'market', label: 'ตลาด', icon: <Store className="w-5 h-5" /> },
    ...(isAdmin
      ? [{ id: 'admin' as Tab, label: 'แอดมิน', icon: <ShieldAlert className="w-5 h-5" /> }]
      : []),
    { id: 'profile', label: 'ฉัน', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-1 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition relative group ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium hover:text-slate-600'
            }`}
          >
            <div
              className={`p-1.5 rounded-2xl transition-all ${
                isActive
                  ? item.id === 'admin'
                    ? 'bg-red-100 text-red-700 scale-105 shadow-xs'
                    : 'bg-emerald-100 text-emerald-800 scale-105 shadow-xs'
                  : item.id === 'admin'
                  ? 'text-red-500'
                  : 'text-slate-500'
              }`}
            >
              {item.icon}
            </div>
            <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? (item.id === 'admin' ? 'text-red-700 font-bold' : 'text-emerald-700 font-bold') : 'text-slate-500 font-medium'}`}>
              {item.label}
            </span>
            {isActive && (
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${item.id === 'admin' ? 'bg-red-600' : 'bg-emerald-600'}`}></span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
