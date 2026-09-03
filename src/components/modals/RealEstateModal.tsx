import React, { useState } from 'react';
import { X, Home, MapPin, Phone, Building, Tag } from 'lucide-react';
import { mockRealEstate } from '../../data';
import { useCommunity } from '../../context/CommunityContext';

interface RealEstateModalProps {
  onClose: () => void;
}

export function RealEstateModal({ onClose }: RealEstateModalProps) {
  const { showToast } = useCommunity();
  const [filterType, setFilterType] = useState<'all' | 'เช่า' | 'ขาย'>('all');

  const filteredItems = filterType === 'all'
    ? mockRealEstate
    : mockRealEstate.filter(item => item.type === filterType);

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shadow-sm">
              <Home size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">บ้าน & ที่ดินในย่าน</h2>
              <p className="text-[11.5px] font-medium text-slate-500">ซื้อ-ขาย เช่าบ้าน คอนโด ที่ดินใกล้คุณ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex gap-2 shrink-0">
          {(['all', 'เช่า', 'ขาย'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all border ${
                filterType === t
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t === 'all' ? 'ทั้งหมด' : `สำหรับ${t}`}
            </button>
          ))}
        </div>

        {/* Real Estate List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative h-40 bg-slate-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-2.5 left-2.5 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm ${
                  item.type === 'เช่า' ? 'bg-teal-600' : 'bg-rose-600'
                }`}>
                  สำหรับ{item.type}
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-slate-950/85 backdrop-blur-md text-white text-[14px] font-extrabold px-3 py-1 rounded-xl">
                  {item.price}
                </div>
              </div>

              <div className="p-4 flex flex-col gap-2">
                <h3 className="font-extrabold text-slate-900 text-[14.5px] leading-tight">
                  {item.title}
                </h3>

                <p className="text-[12.5px] text-slate-600 font-normal leading-relaxed">
                  {item.details}
                </p>

                <div className="flex items-center justify-between text-[11.5px] text-slate-500 font-medium pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-600" />
                    <span>{item.location} ({item.distance} กม.)</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <a
                    href={`tel:${item.phone}`}
                    onClick={() => showToast(`📞 ติดต่อเจ้าของ/นายหน้า: ${item.phone}`)}
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-[12.5px] flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Phone size={14} />
                    โทรติดต่อ ({item.phone})
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
