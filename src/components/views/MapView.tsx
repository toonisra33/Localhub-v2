import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  Radio,
  ShoppingBag,
  Layers,
  Navigation,
  Compass,
  Info
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';

export const MapView: React.FC = () => {
  const { location, alerts, marketItems, openLocationModal, openPostDetail, requestRealLocation } = useCommunity();
  const { broadcasts } = useBroadcast();
  const [activeLayer, setActiveLayer] = useState<'all' | 'alerts' | 'broadcasts' | 'market'>('all');
  const [selectedPin, setSelectedPin] = useState<{
    id: string;
    title: string;
    type: 'alert' | 'broadcast' | 'market';
    desc: string;
  } | null>(null);

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">แผนที่เรดาร์ชุมชน: {location.province}</h3>
            <p className="text-xs text-slate-500">แสดงจุดเกิดเหตุ ประกาศเร่งด่วน และตลาดนัดใกล้คุณ</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'alerts', label: '⚠️ เหตุเตือนภัย' },
            { id: 'broadcasts', label: '📢 บรอดแคสต์' },
            { id: 'market', label: '🛍️ ตลาดนัด' },
          ].map(l => (
            <button
              key={l.id}
              onClick={() => setActiveLayer(l.id as typeof activeLayer)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeLayer === l.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={openLocationModal}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
          >
            เปลี่ยนพื้นที่
          </button>
          <button
            onClick={requestRealLocation}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition flex items-center gap-1.5 shadow-xs"
            title="ตรวจจับพิกัด GPS จริงของคุณ"
          >
            <Navigation className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span>พิกัด GPS จริง</span>
          </button>
        </div>
      </div>

      {/* Visual Simulated Interactive Canvas */}
      <div className="relative w-full h-[450px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-lg flex items-center justify-center">
        {/* Subtle Map Grid / Radar Graphics */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Concentric radar circles */}
        <div className="absolute w-[400px] h-[400px] rounded-full border border-blue-500/20 pointer-events-none animate-ping [animation-duration:6s]" />
        <div className="absolute w-[260px] h-[260px] rounded-full border border-blue-400/25 pointer-events-none" />
        <div className="absolute w-[120px] h-[120px] rounded-full border border-blue-300/30 pointer-events-none" />

        {/* Center User Position */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-blue-500 ring-4 ring-blue-400/30 animate-pulse shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
            📍
          </div>
          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-800/90 text-white text-[11px] font-medium border border-slate-600 shadow-md">
            ตำแหน่งของคุณ ({location.province})
          </div>
        </div>

        {/* Simulated Pins scattered around center */}
        {(activeLayer === 'all' || activeLayer === 'alerts') && alerts.slice(0, 3).map((a, idx) => {
          const offsets = [
            { top: '25%', left: '28%' },
            { top: '65%', left: '35%' },
            { top: '35%', left: '72%' }
          ];
          const pos = offsets[idx % offsets.length];

          return (
            <button
              key={a.id}
              style={{ top: pos.top, left: pos.left }}
              onClick={() => setSelectedPin({ id: a.id, title: a.title, type: 'alert', desc: a.description })}
              className="absolute z-20 group transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-rose-600 text-white shadow-lg hover:scale-125 transition-transform"
            >
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                {a.title}
              </span>
            </button>
          );
        })}

        {(activeLayer === 'all' || activeLayer === 'broadcasts') && broadcasts.slice(0, 2).map((b, idx) => {
          const offsets = [
            { top: '20%', left: '55%' },
            { top: '70%', left: '68%' }
          ];
          const pos = offsets[idx % offsets.length];

          return (
            <button
              key={b.id}
              style={{ top: pos.top, left: pos.left }}
              onClick={() => setSelectedPin({ id: b.id, title: b.title, type: 'broadcast', desc: b.message })}
              className="absolute z-20 group transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-amber-500 text-white shadow-lg hover:scale-125 transition-transform"
            >
              <Radio className="w-4 h-4" />
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                {b.title}
              </span>
            </button>
          );
        })}

        {(activeLayer === 'all' || activeLayer === 'market') && marketItems.slice(0, 3).map((m, idx) => {
          const offsets = [
            { top: '48%', left: '20%' },
            { top: '80%', left: '48%' },
            { top: '58%', left: '80%' }
          ];
          const pos = offsets[idx % offsets.length];

          return (
            <button
              key={m.id}
              style={{ top: pos.top, left: pos.left }}
              onClick={() => setSelectedPin({ id: m.id, title: m.title, type: 'market', desc: `ราคา ฿${m.price} โดย ${m.seller}` })}
              className="absolute z-20 group transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-emerald-600 text-white shadow-lg hover:scale-125 transition-transform"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                {m.title}
              </span>
            </button>
          );
        })}

        {/* Selected Pin Details Overlay Card */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200 space-y-2 animate-fadeIn text-slate-900">
            <div className="flex items-start justify-between gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                selectedPin.type === 'alert'
                  ? 'bg-rose-100 text-rose-700'
                  : selectedPin.type === 'broadcast'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {selectedPin.type === 'alert' && 'เหตุเตือนภัย'}
                {selectedPin.type === 'broadcast' && 'บรอดแคสต์'}
                {selectedPin.type === 'market' && 'ตลาดนัด'}
              </span>

              <button
                onClick={() => setSelectedPin(null)}
                className="text-xs text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <h4 className="font-bold text-sm leading-tight">{selectedPin.title}</h4>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{selectedPin.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
};
