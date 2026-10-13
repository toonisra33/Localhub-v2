import React from 'react';
import {
  MessageSquare,
  Radio,
  ShoppingBag,
  AlertTriangle,
  Compass,
  User,
  CloudSun,
  Camera
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { Tab } from '../types';

interface MobileNavProps {
  onOpenInstantCamera?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenInstantCamera }) => {
  const { activeTab, setActiveTab } = useCommunity();

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'feed', label: 'ฟีด', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'broadcasts', label: 'บรอดแคสต์', icon: <Radio className="w-5 h-5" /> },
    { id: 'alerts', label: 'เตือนภัย', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'weather', label: 'พยากรณ์', icon: <CloudSun className="w-5 h-5" /> },
    { id: 'market', label: 'ตลาดนัด', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'profile', label: 'ฉัน', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.slice(0, 3).map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition ${
              isActive ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
            }`}
          >
            <span className={isActive ? 'text-blue-600 scale-110 transition-transform' : 'text-slate-500'}>
              {item.icon}
            </span>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* Center Quick Live Camera Shutter */}
      {onOpenInstantCamera && (
        <button
          onClick={onOpenInstantCamera}
          className="flex flex-col items-center justify-center -mt-4 p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full shadow-lg shadow-emerald-500/30 border-2 border-white active:scale-95 transition"
          title="เปิดกล้องถ่ายภาพสด"
        >
          <Camera className="w-5 h-5" />
        </button>
      )}

      {navItems.slice(3).map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition ${
              isActive ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
            }`}
          >
            <span className={isActive ? 'text-blue-600 scale-110 transition-transform' : 'text-slate-500'}>
              {item.icon}
            </span>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
