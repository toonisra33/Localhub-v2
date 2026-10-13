import React from 'react';
import {
  Home,
  Compass,
  Globe,
  Users,
  BarChart3,
  User,
  Camera
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { Tab } from '../types';

interface MobileNavProps {
  onOpenInstantCamera?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenInstantCamera }) => {
  const { activeTab, setActiveTab } = useCommunity();

  // Exactly matching the 6 tabs from user's screenshots
  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'หน้าหลัก', icon: <Home className="w-5 h-5" /> },
    { id: 'map', label: 'รอบตัว', icon: <Compass className="w-5 h-5" /> },
    { id: 'broadcasts', label: 'ศูนย์ข่าว', icon: <Globe className="w-5 h-5" /> },
    { id: 'feed', label: 'ฟีดชุมชน', icon: <Users className="w-5 h-5" /> },
    { id: 'dashboard', label: 'แดชบอร์ด', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'profile', label: 'ฉัน', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition ${
              isActive ? 'text-emerald-600 font-extrabold' : 'text-slate-500 font-medium'
            }`}
          >
            <span className={isActive ? 'text-emerald-600 scale-110 transition-transform' : 'text-slate-500'}>
              {item.icon}
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5 animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
