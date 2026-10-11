import React from 'react';
import {
  MessageSquare,
  Radio,
  ShoppingBag,
  AlertTriangle,
  Compass,
  User,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { Tab } from '../types';

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, openContactAdminModal, isAdmin } = useCommunity();

  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'feed', label: 'ฟีดชุมชน', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'broadcasts', label: 'บรอดแคสต์ทางการ', icon: <Radio className="w-5 h-5" />, badge: 'LIVE' },
    { id: 'market', label: 'ตลาดนัดชุมชน', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'alerts', label: 'รายงานเหตุฉุกเฉิน', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'map', label: 'แผนที่เรดาร์', icon: <Compass className="w-5 h-5" /> },
    { id: 'profile', label: 'บัญชี & สิทธิ์', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-6 sticky top-20 self-start">
      <div className="bg-white rounded-3xl border border-slate-200/90 p-3 shadow-xs space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
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

      {/* Community Help card */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-4.5 space-y-3">
        <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
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
