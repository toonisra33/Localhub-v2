import React from 'react';
import {
  MapPin,
  Bell,
  Radio,
  Plus,
  Shield,
  ChevronDown,
  Activity
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { useBroadcast } from '../context/BroadcastContext';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenCreatePost: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications, onOpenCreatePost }) => {
  const { location, openLocationModal, unreadNotifCount, isAdmin } = useCommunity();
  const { setOpenAdminModal, setOpenSignalTestModal } = useBroadcast();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Radio className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl">
                Local<span className="text-blue-600">Hub</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                ชุมชนท้องถิ่น
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              ข่าวสาร บรอดแคสเตือนภัย และตลาดนัดใกล้ตัวคุณ
            </p>
          </div>
        </div>

        {/* Center / Location Selector button */}
        <button
          onClick={openLocationModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="max-w-[120px] sm:max-w-[180px] truncate">
            {location.displayName || location.province}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Right action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isAdmin && (
            <button
              onClick={() => setOpenSignalTestModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-extrabold transition shadow-2xs animate-pulse"
              title="ทดสอบสัญญาณเตือนภัย & แรงสั่นสะเทือน"
            >
              <Activity className="w-3.5 h-3.5 text-red-600" />
              <span>⚡ ทดสอบสัญญาณ</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setOpenAdminModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition border border-indigo-200"
            >
              <Radio className="w-3.5 h-3.5" />
              บรอดแคสต์
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            title="การแจ้งเตือน"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Quick Post button */}
          <button
            onClick={onOpenCreatePost}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">โพสต์</span>
          </button>
        </div>
      </div>
    </header>
  );
};
