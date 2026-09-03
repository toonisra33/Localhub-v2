import React from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Phone, 
  Star, 
  AlertTriangle, 
  Droplets, 
  Utensils, 
  Heart,
  ExternalLink,
  Trash2,
  Copy,
  Share2
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

export interface MapPoint {
  id: string;
  name: string;
  type: 'food' | 'incident' | 'shop' | 'service' | 'event' | 'custom';
  lat: number;
  lng: number;
  distance: string;
  category: string;
  rating?: number;
  status?: string;
  phone?: string;
  description?: string;
  address?: string;
  imageUrl?: string;
  isCustomPin?: boolean;
  createdAt?: number;
}

interface PlaceDetailModalProps {
  place: MapPoint;
  onClose: () => void;
  onDeletePin?: (id: string) => void;
}

export function PlaceDetailModal({ place, onClose, onDeletePin }: PlaceDetailModalProps) {
  const { showToast, openMediaViewer } = useCommunity();

  const handleNavigate = () => {
    showToast(`📍 กำลังเปิดเส้นทางนำทางไปยัง "${place.name}" บน Google Maps`);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
    window.open(mapsUrl, '_blank');
  };

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${place.lat}, ${place.lng}`);
    showToast(`📋 คัดลอกพิกัด ${place.lat.toFixed(5)}, ${place.lng.toFixed(5)} แล้ว`);
  };

  const handleShare = () => {
    const text = `📍 ${place.name} (${place.category})\nพิกัด: ${place.lat}, ${place.lng}\nดูบน Google Maps: https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
    if (navigator.share) {
      navigator.share({ title: place.name, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast('📋 คัดลอกข้อมูลสถานที่พร้อมแชร์แล้ว');
    }
  };

  return (
    <div className="fixed inset-0 z-[85] bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl border border-slate-200 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
              place.type === 'incident' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              place.type === 'food' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              place.type === 'event' ? 'bg-purple-50 text-purple-700 border-purple-200' :
              place.isCustomPin ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {place.category}
            </span>
            {place.isCustomPin && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                📌 หมุดที่ปักเอง
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              title="แชร์ข้อมูล"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <Share2 size={14} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 overflow-y-auto">
          {/* Optional Image */}
          {place.imageUrl && (
            <div 
              onClick={() => openMediaViewer({
                url: place.imageUrl!,
                type: 'image',
                title: place.name,
                subtitle: place.category
              })}
              className="rounded-2xl overflow-hidden max-h-48 bg-slate-900 border border-slate-200 relative group cursor-pointer"
            >
              <img src={place.imageUrl} alt={place.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-black/75 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  🔍 แตะดูภาพเต็ม
                </span>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-slate-900 text-[18px] leading-snug">
                {place.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <p className="text-[12px] font-bold text-emerald-700 flex items-center gap-1">
                  <MapPin size={13} />
                  ห่างจากคุณ {place.distance}
                </p>
                <button
                  onClick={handleCopyCoords}
                  className="text-[11px] font-mono text-slate-400 hover:text-slate-700 flex items-center gap-0.5 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200"
                >
                  <Copy size={10} />
                  {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                </button>
              </div>
            </div>

            {place.rating && (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-amber-700 font-extrabold text-[12.5px] shrink-0">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>{place.rating}</span>
              </div>
            )}
          </div>

          {place.description && (
            <p className="text-[13px] text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-150 leading-relaxed font-normal">
              {place.description}
            </p>
          )}

          {place.status && (
            <div className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
              <span className="text-slate-400">สถานะ:</span>
              <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200">
                {place.status}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2 flex-wrap">
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                onClick={() => showToast(`📞 กำลังโทรออก: ${place.phone}`)}
                className="flex-1 min-w-[120px] py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[13px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone size={15} />
                โทรสอบถาม
              </a>
            )}

            <button
              onClick={handleNavigate}
              className="flex-1 min-w-[150px] py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Navigation size={15} className="text-emerald-400" />
              <span>เปิด Google Maps</span>
              <ExternalLink size={12} className="text-slate-400" />
            </button>
          </div>

          {/* Custom Pin Deletion */}
          {place.isCustomPin && onDeletePin && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onDeletePin(place.id);
                  onClose();
                  showToast('🗑️ ลบหมุดออกจากแผนที่เรียบร้อยแล้ว');
                }}
                className="w-full py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} />
                <span>ลบหมุดนี้ออกจากแผนที่ของฉัน</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

