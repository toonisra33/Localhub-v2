import React from 'react';
import {
  Home,
  MapPin,
  Users,
  Store,
  User,
  Camera,
  Radio
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { Tab } from '../types';

interface MobileNavProps {
  onOpenInstantCamera?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenInstantCamera }) => {
  const { activeTab, setActiveTab } = useCommunity();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1 flex items-center justify-around shadow-lg">
      {/* Tab 1: Home */}
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition relative group ${
          activeTab === 'home' ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium hover:text-slate-600'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'home' ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-xs' : 'text-slate-500'}`}>
          <Home className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">หน้าหลัก</span>
        {activeTab === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5"></span>}
      </button>

      {/* Tab 2: Feed */}
      <button
        onClick={() => setActiveTab('feed')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition relative group ${
          activeTab === 'feed' ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium hover:text-slate-600'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'feed' ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-xs' : 'text-slate-500'}`}>
          <Users className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">ฟีด</span>
        {activeTab === 'feed' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5"></span>}
      </button>

      {/* Center Shutter: Live Camera Snap */}
      <button
        onClick={onOpenInstantCamera}
        className="flex flex-col items-center justify-center -mt-5 relative group"
        title="เปิดกล้องถ่ายภาพสดทันที"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 border-4 border-white active:scale-95 transition-transform group-hover:scale-105">
          <Camera className="w-5 h-5" />
        </div>
        <span className="text-[9px] font-extrabold text-emerald-800 mt-0.5">กล้องสด</span>
      </button>

      {/* Tab 4: Broadcasts */}
      <button
        onClick={() => setActiveTab('broadcasts')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition relative group ${
          activeTab === 'broadcasts' ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium hover:text-slate-600'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'broadcasts' ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-xs' : 'text-slate-500'}`}>
          <Radio className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">บรอดแคสต์</span>
        {activeTab === 'broadcasts' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5"></span>}
      </button>

      {/* Tab 5: Profile */}
      <button
        onClick={() => setActiveTab('profile')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition relative group ${
          activeTab === 'profile' ? 'text-emerald-700 font-bold' : 'text-slate-400 font-medium hover:text-slate-600'
        }`}
      >
        <div className={`p-1 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-emerald-100 text-emerald-800 scale-105 shadow-xs' : 'text-slate-500'}`}>
          <User className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">ฉัน</span>
        {activeTab === 'profile' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5"></span>}
      </button>
    </nav>
  );
};
