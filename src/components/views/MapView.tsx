import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  Radio,
  ShoppingBag,
  Layers,
  Navigation,
  Compass,
  Search,
  Plus,
  Filter,
  Maximize2,
  Car,
  Globe
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';

export const MapView: React.FC = () => {
  const { location, alerts, marketItems, openLocationModal, showToast } = useCommunity();
  const { broadcasts } = useBroadcast();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'myPins' | 'alerts'>('all');
  const [selectedRadius, setSelectedRadius] = useState<'1' | '5' | '10' | 'district' | 'province'>('5');
  const [activePreset, setActivePreset] = useState<'local' | 'world' | 'bkk' | 'tokyo'>('local');

  const [selectedPin, setSelectedPin] = useState<{
    id: string;
    title: string;
    type: 'alert' | 'broadcast' | 'market';
    desc: string;
  } | null>(null);

  return (
    <div className="space-y-3 max-w-4xl mx-auto animate-fadeIn">
      {/* Top Header matching 05-around-me-map.png */}
      <div className="bg-slate-950 text-white rounded-3xl p-4 border border-slate-800 shadow-md flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold">
            <MapPin className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-extrabold text-base text-white tracking-tight">
            Local<span className="text-emerald-400">Hub</span>
          </span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
            ● LIVE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
            Google Maps สด
          </span>
          <button
            onClick={openLocationModal}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition"
          >
            <span>🗺️ แผนที่</span>
          </button>
        </div>
      </div>

      {/* Search & Action Bar matching 05-around-me-map.png */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาพื้นที่, ตำบล, ร้าน..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <button
          onClick={() => showToast('เปิดโหมดปักหมุดตำแหน่งในพื้นที่', 'info')}
          className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-1 transition shrink-0 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>+ ปักหมุด</span>
        </button>

        <button
          onClick={() => showToast('เปิดตัวกรองหมวดหมู่แผนที่', 'info')}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl transition shrink-0 shadow-xs"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Category Pills matching 05-around-me-map.png */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-full transition shrink-0 ${
            activeFilter === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          ทั้งหมด
        </button>

        <button
          onClick={() => setActiveFilter('myPins')}
          className={`px-3 py-1.5 rounded-full transition shrink-0 flex items-center gap-1 ${
            activeFilter === 'myPins'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>📍 หมุดของฉัน</span>
          <span className="px-1.5 py-0.2 bg-slate-100 rounded-full text-[10px]">0</span>
        </button>

        <button
          onClick={() => setActiveFilter('alerts')}
          className={`px-3 py-1.5 rounded-full transition shrink-0 flex items-center gap-1 ${
            activeFilter === 'alerts'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>🚨 เตือนภัย/ซ่อมบำรุง</span>
          <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold">
            {alerts.length}
          </span>
        </button>
      </div>

      {/* Preset View Pills matching 05-around-me-map.png */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold text-slate-600 scrollbar-none">
        <button
          onClick={() => setActivePreset('world')}
          className={`px-3 py-1 rounded-xl transition shrink-0 flex items-center gap-1 ${
            activePreset === 'world' ? 'bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <span>🌍 ภาพรวมโลก (World View)</span>
        </button>

        <button
          onClick={() => setActivePreset('bkk')}
          className={`px-3 py-1 rounded-xl transition shrink-0 flex items-center gap-1 ${
            activePreset === 'bkk' ? 'bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <span>🇹🇭 กรุงเทพฯ (พหลโยธิน)</span>
        </button>

        <button
          onClick={() => setActivePreset('tokyo')}
          className={`px-3 py-1 rounded-xl transition shrink-0 flex items-center gap-1 ${
            activePreset === 'tokyo' ? 'bg-slate-800 text-white' : 'bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <span>🇯🇵 โตเกียว</span>
        </button>
      </div>

      {/* Interactive Map Visual matching 05-around-me-map.png */}
      <div className="relative w-full h-[460px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-300 shadow-lg">
        {/* Map Grid / Streets Simulation */}
        <div className="absolute inset-0 bg-[#e8ece9]" />
        
        {/* Simulated Road Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="120" x2="800" y2="120" stroke="#fef08a" strokeWidth="6" />
          <line x1="0" y1="280" x2="800" y2="280" stroke="#fed7aa" strokeWidth="8" />
          <line x1="240" y1="0" x2="240" y2="500" stroke="#cbd5e1" strokeWidth="5" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="#fde047" strokeWidth="7" />
          <line x1="100" y1="500" x2="600" y2="50" stroke="#cbd5e1" strokeWidth="4" />
          <circle cx="500" cy="280" r="160" stroke="#60a5fa" strokeWidth="1" fill="#3b82f6" fillOpacity="0.08" strokeDasharray="4 4" />
        </svg>

        {/* Center Target Pin matching 05-around-me-map.png */}
        <div className="absolute top-[260px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-red-600 ring-4 ring-red-400/30 shadow-xl flex items-center justify-center text-white text-xs font-bold animate-bounce">
            📍
          </div>
          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold shadow-md">
            {location.displayName || location.province}
          </div>
        </div>

        {/* Map Floating Control Tools on Right */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={() => showToast('ซูมเข้า', 'info')}
            className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-md flex items-center justify-center font-bold text-lg"
          >
            +
          </button>
          <button
            onClick={() => showToast('นำทางด้วยยานพาหนะ', 'info')}
            className="w-10 h-10 bg-slate-900/90 hover:bg-slate-800 text-white rounded-2xl shadow-md flex items-center justify-center"
          >
            <Car className="w-4 h-4" />
          </button>
          <button
            onClick={() => showToast('ระบุพิกัด GPS ปัจจุบัน', 'info')}
            className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-md flex items-center justify-center"
          >
            <Navigation className="w-4 h-4" />
          </button>
          <button
            onClick={() => showToast('เปลี่ยนเลเยอร์ดาวเทียม', 'info')}
            className="w-10 h-10 bg-slate-900/90 hover:bg-slate-800 text-white rounded-2xl shadow-md flex items-center justify-center"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => showToast('ขยายเต็มจอ', 'info')}
            className="w-10 h-10 bg-white hover:bg-slate-100 text-slate-800 rounded-2xl shadow-md flex items-center justify-center border border-slate-200"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Radius Selector Bar matching 05-around-me-map.png */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-950/95 text-white rounded-2xl p-1.5 shadow-2xl border border-slate-700 flex items-center gap-1 backdrop-blur-md">
          <button
            onClick={() => setSelectedRadius('1')}
            className={`px-3 py-1.5 rounded-xl text-center text-xs font-bold transition flex flex-col items-center justify-center min-w-[50px] ${
              selectedRadius === '1' ? 'bg-emerald-600 text-white' : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <span className="text-sm font-black">1</span>
            <span className="text-[10px] text-slate-300">กม.</span>
          </button>

          <button
            onClick={() => setSelectedRadius('5')}
            className={`px-3 py-1.5 rounded-xl text-center text-xs font-bold transition flex flex-col items-center justify-center min-w-[50px] ${
              selectedRadius === '5' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <span className="text-sm font-black">5</span>
            <span className="text-[10px] text-emerald-100">กม.</span>
          </button>

          <button
            onClick={() => setSelectedRadius('10')}
            className={`px-3 py-1.5 rounded-xl text-center text-xs font-bold transition flex flex-col items-center justify-center min-w-[50px] ${
              selectedRadius === '10' ? 'bg-emerald-600 text-white' : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <span className="text-sm font-black">10</span>
            <span className="text-[10px] text-slate-300">กม.</span>
          </button>

          <button
            onClick={() => setSelectedRadius('district')}
            className={`px-2.5 py-1.5 rounded-xl text-center text-[10px] font-bold transition flex flex-col items-center justify-center min-w-[55px] ${
              selectedRadius === 'district' ? 'bg-emerald-600 text-white' : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <span>ทั้ง</span>
            <span>อำเภอ/เขต</span>
          </button>

          <button
            onClick={() => setSelectedRadius('province')}
            className={`px-2.5 py-1.5 rounded-xl text-center text-[10px] font-bold transition flex flex-col items-center justify-center min-w-[55px] ${
              selectedRadius === 'province' ? 'bg-emerald-600 text-white' : 'hover:bg-white/10 text-slate-300'
            }`}
          >
            <span>ทั้ง</span>
            <span>จังหวัด</span>
          </button>
        </div>
      </div>
    </div>
  );
};
