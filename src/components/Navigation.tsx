import React from 'react';
import { Home, MapPin, Users, Store, User, BarChart3, MessageCircle, Globe } from 'lucide-react';
import { Tab } from '../types';
import { useBroadcast } from '../context/BroadcastContext';
import { useCommunity } from '../context/CommunityContext';
import { isAuthorizedAdminEmail } from '../lib/firebase';

interface NavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const { role } = useBroadcast();
  const { isLoggedIn, userProfile } = useCommunity();
  const isAdmin = isLoggedIn && role === 'admin' && isAuthorizedAdminEmail(userProfile?.email);

  const navItems = [
    { id: 'home', icon: Home, label: 'หน้าหลัก' },
    { id: 'map', icon: MapPin, label: 'รอบตัว' },
    { id: 'global_news', icon: Globe, label: 'ศูนย์ข่าว' },
    { id: 'community', icon: Users, label: 'ฟีดชุมชน' },
    ...(isAdmin ? [{ id: 'admin_dashboard', icon: BarChart3, label: 'แดชบอร์ด' }] : []),
    { id: 'me', icon: User, label: 'ฉัน' },
  ] as const;

  return (
    <nav aria-label="แถบเมนูหลัก" className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none md:hidden">
      <div className="max-w-md mx-auto px-3 pb-safe pointer-events-auto">
        <div className="mb-2 bg-white/90 backdrop-blur-2xl border border-slate-200/80 rounded-[28px] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)] px-2 py-1.5 flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAdminTab = item.id === 'admin_dashboard';
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? (isAdminTab ? 'text-rose-700 font-extrabold scale-105' : 'text-emerald-700 font-extrabold scale-105')
                    : 'text-slate-500 hover:text-slate-800 font-semibold'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? (isAdminTab ? 'bg-rose-500/15 text-rose-600 shadow-sm' : 'bg-emerald-500/15 text-emerald-600 shadow-sm')
                    : 'bg-transparent text-slate-400 hover:text-slate-600'
                }`}>
                  <Icon size={19} strokeWidth={isActive ? 2.6 : 1.9} />
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                  isActive 
                    ? (isAdminTab ? 'text-rose-800 font-bold' : 'text-emerald-800 font-bold') 
                    : 'text-slate-400 font-medium'
                }`}>
                  {item.label}
                </span>

                {/* Micro active dot indicator */}
                {isActive && (
                  <span className={`absolute -bottom-0.5 w-1 h-1 rounded-full ${isAdminTab ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
