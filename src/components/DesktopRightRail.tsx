import React from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  Store, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  HeartHandshake,
  Download,
  Info
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { Tab } from '../types';
import { SafeImage } from './SafeImage';
import { PWAInstallButton } from './PWAInstallButton';

interface DesktopRightRailProps {
  onSelectTab: (tab: Tab) => void;
  onOpenPromoKit: () => void;
}

export function DesktopRightRail({ onSelectTab, onOpenPromoKit }: DesktopRightRailProps) {
  const { products, alerts, location } = useCommunity();

  const emergencyNumbers = [
    { name: 'เหตุด่วนเหตุร้าย (ตำรวจ)', number: '191', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { name: 'เจ็บป่วยฉุกเฉิน (กู้ชีพ 24 ชม.)', number: '1669', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'ดับเพลิงและกู้ภัย', number: '199', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'ศูนย์ดำรงธรรม (ร้องทุกข์)', number: '1567', color: 'bg-blue-50 text-blue-700 border-blue-200' }
  ];

  const recentProducts = (products || []).slice(0, 3);
  const activeAlertsCount = (alerts || []).length;

  return (
    <aside className="hidden xl:flex xl:w-80 2xl:w-88 shrink-0 flex-col bg-white/70 backdrop-blur-md border-l border-slate-200/80 h-screen sticky top-0 z-20 p-5 overflow-y-auto space-y-6 select-none">
      
      {/* Community Safety Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4.5 rounded-3xl shadow-sm border border-slate-700/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            สถานะความปลอดภัย
          </span>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-bold border border-slate-700">
            รัศมี 5 กม.
          </span>
        </div>

        <h3 className="font-extrabold text-[15px] text-white leading-snug">
          {location.subdistrict ? `ชุมชน ต.${location.subdistrict}` : 'พื้นที่ของคุณ'}
        </h3>
        <p className="text-[11.5px] text-slate-400 mt-1">
          {activeAlertsCount === 0 
            ? '✅ เหตุการณ์ปกติ ไม่มีรายงานภัยพิบัติเร่งด่วน'
            : `⚠️ มีการแจ้งเตือนในพื้นที่ ${activeAlertsCount} รายการ`}
        </p>

        <div className="mt-3.5 pt-3 border-t border-slate-700/80 flex items-center justify-between">
          <button 
            onClick={() => onSelectTab('map')}
            className="text-[11.5px] font-extrabold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 transition-colors"
          >
            <span>เปิดเรดาร์แผนที่สด</span>
            <ArrowRight size={13} />
          </button>
          <PWAInstallButton />
        </div>
      </div>

      {/* Emergency Hotlines Speed Dial */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-extrabold text-[13.5px] text-slate-900 flex items-center gap-1.5">
            <PhoneCall size={15} className="text-rose-600" />
            <span>เบอร์โทรฉุกเฉินด่วน</span>
          </h4>
          <span className="text-[10.5px] font-bold text-slate-400">โทรฟรี 24 ชม.</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {emergencyNumbers.map((item, idx) => (
            <a
              key={idx}
              href={`tel:${item.number}`}
              className={`p-2.5 rounded-2xl border ${item.color} flex flex-col justify-between hover:scale-[1.02] active:scale-95 transition-all shadow-xs`}
            >
              <span className="text-[10px] font-bold opacity-80 leading-tight line-clamp-1">{item.name}</span>
              <span className="text-[17px] font-black tracking-tight mt-1">{item.number}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Market Preview Highlights */}
      {recentProducts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-extrabold text-[13.5px] text-slate-900 flex items-center gap-1.5">
              <Store size={15} className="text-emerald-600" />
              <span>ตลาดนัดน่าสนใจใกล้บ้าน</span>
            </h4>
            <button 
              onClick={() => onSelectTab('market')}
              className="text-[11px] font-extrabold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              ดูทั้งหมด
            </button>
          </div>

          <div className="space-y-2">
            {recentProducts.map(p => (
              <div
                key={p.id}
                onClick={() => onSelectTab('market')}
                className="flex items-center gap-2.5 p-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <SafeImage
                    src={p.image}
                    alt={p.title}
                    category={p.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-[12.5px] text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                    {p.title}
                  </p>
                  <p className="text-[12px] font-black text-emerald-600 mt-0.5">
                    ฿{p.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Promo Kit Shortcut */}
      <div 
        onClick={onOpenPromoKit}
        className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer hover:border-emerald-300 hover:shadow-xs transition-all group"
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
          <Sparkles size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-extrabold text-emerald-950 truncate">
            สื่อโปรโมทชุมชน LocalHub
          </p>
          <p className="text-[10.5px] font-semibold text-emerald-700 truncate">
            ภาพและแคปชันสำหรับแชร์ลง LINE/Facebook
          </p>
        </div>
      </div>

    </aside>
  );
}
