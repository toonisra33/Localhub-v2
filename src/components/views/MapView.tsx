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
  User,
  Film
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';

export const MapView: React.FC = () => {
  const { location, alerts, marketItems, openLocationModal, showToast, requestRealLocation } = useCommunity();
  const { broadcasts } = useBroadcast();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'myPins' | 'alerts'>('all');
  const [selectedRadius, setSelectedRadius] = useState<'1' | '5' | '10' | 'district' | 'province'>('5');
  const [activePreset, setActivePreset] = useState<'bkk' | 'world' | 'tokyo'>('bkk');

  const [selectedPin, setSelectedPin] = useState<{
    id: string;
    title: string;
    type: 'alert' | 'broadcast' | 'market' | 'landmark';
    desc: string;
  } | null>(null);

  return (
    <div className="space-y-3 max-w-4xl mx-auto animate-fadeIn pb-14">
      {/* Top Header Floating Bar (Matching Screenshot 2) */}
      <div className="bg-slate-950 text-white rounded-3xl p-3.5 sm:p-4 border border-slate-800 shadow-lg flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold">
            <MapPin className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-extrabold text-base text-white tracking-tight">
            Local<span className="text-emerald-400">Hub</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
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

      {/* Search & Action Bar (Matching Screenshot 2) */}
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
          <Plus className="w-4 h-4" />
          <span>ปักหมุด</span>
        </button>

        <button
          onClick={() => showToast('เปิดตัวกรองหมวดหมู่', 'info')}
          className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl transition shrink-0 shadow-xs"
          title="ตัวกรอง"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter Chips (Matching Screenshot 2) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
            activeFilter === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => setActiveFilter('myPins')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
            activeFilter === 'myPins'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          📌 หมุดของฉัน 0
        </button>
        <button
          onClick={() => setActiveFilter('alerts')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
            activeFilter === 'alerts'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🚨 เตือนภัย/ซ่อมบำรุง
        </button>
      </div>

      {/* Geographic Presets (Matching Screenshot 2) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => {
            setActivePreset('world');
            showToast('ปรับมุมมองภาพรวมโลก', 'info');
          }}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
            activePreset === 'world'
              ? 'bg-slate-800 text-white font-bold'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🌍 ภาพรวมโลก (World View)
        </button>
        <button
          onClick={() => {
            setActivePreset('bkk');
            showToast('ปรับมุมมองพหลโยธิน-จตุจักร กรุงเทพฯ', 'info');
          }}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
            activePreset === 'bkk'
              ? 'bg-slate-800 text-white font-bold'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🇹🇭 กรุงเทพฯ (พหลโยธิน)
        </button>
        <button
          onClick={() => {
            setActivePreset('tokyo');
            showToast('ปรับมุมมองโตเกียว (Tokyo, Japan)', 'info');
          }}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition ${
            activePreset === 'tokyo'
              ? 'bg-slate-800 text-white font-bold'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🇯🇵 โตเกียว
        </button>
      </div>

      {/* Interactive Map Visual (Matching Screenshot 2) */}
      <div className="relative w-full h-[460px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-300 shadow-xl bg-slate-100">
        {/* Map Canvas Background with Thai Street Grid */}
        <div
          className="absolute inset-0 bg-[#e5e3df]"
          style={{
            backgroundImage: `
              radial-gradient(#d4d0c8 1px, transparent 1px),
              linear-gradient(to right, #ffffff 1px, transparent 1px),
              linear-gradient(to bottom, #ffffff 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px, 80px 80px, 80px 80px'
          }}
        >
          {/* Main Road Lines (Phahon Yothin Avenue & Highway 14 & Vibhavadi) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            {/* Green park area */}
            <path d="M 0 300 Q 120 280 200 350 L 220 500 L 0 500 Z" fill="#c8e6c9" opacity="0.6" />
            <text x="50" y="420" fill="#2e7d32" fontSize="12" fontWeight="bold">สวนจตุจักร / สวนรถไฟ</text>

            {/* Highway 302 */}
            <path d="M 0 160 L 500 160" stroke="#fbc02d" strokeWidth="8" />
            <path d="M 0 160 L 500 160" stroke="#fff9c4" strokeWidth="4" />
            <text x="180" y="155" fill="#555" fontSize="10" fontWeight="bold">302 งามวงศ์วาน</text>

            {/* Phahon Yothin Road */}
            <path d="M 80 500 L 420 0" stroke="#fbc02d" strokeWidth="12" />
            <path d="M 80 500 L 420 0" stroke="#fff9c4" strokeWidth="6" />
            <text x="260" y="270" fill="#444" fontSize="11" fontWeight="bold" transform="rotate(-53, 260, 270)">
              ถนนพหลโยธิน
            </text>

            {/* Secondary Roads */}
            <path d="M 120 0 L 120 500" stroke="#ffffff" strokeWidth="6" />
            <path d="M 0 250 L 500 250" stroke="#ffffff" strokeWidth="6" />
            <path d="M 300 100 L 450 350" stroke="#ffffff" strokeWidth="5" />
          </svg>

          {/* Place labels */}
          <div className="absolute top-12 left-1/4 text-[11px] font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
            มหาวิทยาลัยเกษตรศาสตร์
          </div>
          <div className="absolute top-28 right-12 text-[10px] font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
            หมู่บ้านมงคลนิเวศน์
          </div>
          <div className="absolute bottom-28 left-16 text-[10px] font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
            ด่วน-แดนเนรมิต
          </div>
          <div className="absolute bottom-16 right-16 text-[10px] font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
            มหาวิทยาลัยราชภัฏจันทรเกษม
          </div>
        </div>

        {/* Interactive Map Pins (Matching Screenshot 2) */}
        {/* Cinema Pin (Major Cineplex Ratchayothin) */}
        <button
          onClick={() => setSelectedPin({
            id: 'p-cinema',
            title: 'เมเจอร์ ซีนีเพล็กซ์ รัชโยธิน',
            type: 'landmark',
            desc: 'ศูนย์การค้าและโรงภาพยนตร์ จุดนัดพบสำคัญของชาวจตุจักร-ลาดยาว'
          })}
          className="absolute top-[52%] left-[48%] -translate-x-1/2 -translate-y-1/2 z-20 group transform hover:scale-110 transition active:scale-95"
        >
          <div className="p-2 rounded-full bg-purple-600 text-white shadow-lg border-2 border-white flex items-center justify-center">
            <Film className="w-4 h-4" />
          </div>
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] whitespace-nowrap font-bold shadow-md">
            เมเจอร์ ซีนีเพล็กซ์ รัชโยธิน
          </span>
        </button>

        {/* Red Alert Pins (Roadwork / Emergency) */}
        <button
          onClick={() => setSelectedPin({
            id: 'p-alert-1',
            title: '⚠️ ซ่อมท่อระบายน้ำ ถ.พหลโยธิน',
            type: 'alert',
            desc: 'ปิดการจราจรช่องทางซ้ายสุด 1 ช่องทาง เลี่ยงชั่วโมงเร่งด่วน'
          })}
          className="absolute top-[54%] left-[62%] -translate-x-1/2 -translate-y-1/2 z-20 group transform hover:scale-110 transition active:scale-95 animate-bounce-subtle"
        >
          <div className="w-8 h-8 rounded-full bg-red-600 text-white shadow-xl border-2 border-white flex items-center justify-center">
            <MapPin className="w-5 h-5 fill-white text-red-600" />
          </div>
        </button>

        <button
          onClick={() => setSelectedPin({
            id: 'p-alert-2',
            title: '🚨 งานซ่อมผิวถนน ซอยพหลโยธิน 34',
            type: 'alert',
            desc: 'มีรถบรรทุกเครื่องจักรเข้าพื้นที่ ขับขี่ด้วยความระมัดระวัง'
          })}
          className="absolute top-[46%] left-[54%] -translate-x-1/2 -translate-y-1/2 z-20 group transform hover:scale-110 transition active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-red-600 text-white shadow-xl border-2 border-white flex items-center justify-center">
            <MapPin className="w-5 h-5 fill-white text-red-600" />
          </div>
        </button>

        {/* Right Floating Control Tools (Matching Screenshot 2) */}
        <div className="absolute top-24 right-4 z-30 flex flex-col items-center gap-2">
          {/* Zoom In Button */}
          <button
            onClick={() => showToast('ซูมเข้าแผนที่', 'info')}
            className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90"
            title="ซูมเข้า"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Traffic Layer Button */}
          <button
            onClick={() => showToast('เปิดเลเยอร์สภาพจราจรสด', 'info')}
            className="w-10 h-10 bg-slate-900/90 hover:bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-700"
            title="สภาพจราจร"
          >
            <Car className="w-4 h-4" />
          </button>

          {/* GPS Locate Button */}
          <button
            onClick={() => requestRealLocation()}
            className="w-10 h-10 bg-slate-900/90 hover:bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-700"
            title="ตำแหน่งของฉัน"
          >
            <Navigation className="w-4 h-4 fill-emerald-400" />
          </button>

          {/* Map Layer Switcher */}
          <button
            onClick={() => showToast('สลับมุมมองดาวเทียม/ภูมิประเทศ', 'info')}
            className="w-10 h-10 bg-slate-900/90 hover:bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-700"
            title="รูปแบบแผนที่"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => showToast('เปิดแผนที่เต็มจอ', 'info')}
            className="w-10 h-10 bg-slate-900/90 hover:bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-700"
            title="เต็มจอ"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* StreetView Yellow Pegman Figure */}
          <button
            onClick={() => showToast('เปิดสตรีทวิว (Street View)', 'info')}
            className="w-10 h-10 bg-white hover:bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-200"
            title="สตรีทวิว"
          >
            <span className="text-xl">🚶</span>
          </button>
        </div>

        {/* Selected Pin Overlay Card */}
        {selectedPin && (
          <div className="absolute top-4 left-4 right-16 sm:right-auto sm:max-w-sm z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200 space-y-1.5 animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                {selectedPin.type === 'alert' ? 'แจ้งเตือนเหตุ' : 'สถานที่สำคัญ'}
              </span>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <h4 className="font-extrabold text-sm text-slate-900">{selectedPin.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{selectedPin.desc}</p>
          </div>
        )}

        {/* Bottom Radius Selection Pill Bar (Matching Screenshot 2) */}
        <div className="absolute bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-30">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1.5 text-white shadow-2xl flex items-center justify-between text-xs">
            <button
              onClick={() => setSelectedRadius('1')}
              className={`flex-1 py-2 text-center rounded-xl font-bold transition ${
                selectedRadius === '1' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              1 กม.
            </button>
            <button
              onClick={() => setSelectedRadius('5')}
              className={`flex-1 py-2 text-center rounded-xl font-bold transition ${
                selectedRadius === '5' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              5 กม.
            </button>
            <button
              onClick={() => setSelectedRadius('10')}
              className={`flex-1 py-2 text-center rounded-xl font-bold transition ${
                selectedRadius === '10' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              10 กม.
            </button>
            <button
              onClick={() => setSelectedRadius('district')}
              className={`flex-1 py-2 text-center rounded-xl font-bold transition text-[11px] leading-tight ${
                selectedRadius === 'district' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              ทั้งอำเภอ/เขต
            </button>
            <button
              onClick={() => setSelectedRadius('province')}
              className={`flex-1 py-2 text-center rounded-xl font-bold transition text-[11px] leading-tight ${
                selectedRadius === 'province' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              ทั้งจังหวัด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
