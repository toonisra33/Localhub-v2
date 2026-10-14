import React from 'react';
import {
  Home,
  MapPin,
  Users,
  Store,
  User
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { Tab } from '../types';

interface MobileNavProps {
  onOpenInstantCamera?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = () => {
  const { activeTab, setActiveTab } = useCommunity();

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'หน้าหลัก', icon: <Home className="w-5 h-5" /> },
    { id: 'map', label: 'รอบตัว', icon: <MapPin className="w-5 h-5" /> },
    { id: 'feed', label: 'ฟีดชุมชน', icon: <Users className="w-5 h-5" /> },
    { id: 'market', label: 'ตลาด', icon: <Store className="w-5 h-5" /> },
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
                  ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {item.icon}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
