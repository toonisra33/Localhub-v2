import React, { useState } from 'react';
import { X, Navigation, Phone, Star, MapPin, Clock, Utensils, Search, ExternalLink } from 'lucide-react';
import { mockShops } from '../../data';
import { useCommunity } from '../../context/CommunityContext';
import { SafeImage } from '../SafeImage';

interface FoodGuideModalProps {
  onClose: () => void;
}

export function FoodGuideModal({ onClose }: FoodGuideModalProps) {
  const { showToast, openMediaViewer } = useCommunity();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('ทั้งหมด');

  const foodPlaces = [
    ...mockShops.filter(s => s.category.includes('อาหาร') || s.category.includes('คาเฟ่')),
    {
      id: 'f3',
      name: 'ส้มตำแซ่บปากซอย 35 ไก่ย่างเขาสวนกวาง',
      category: 'อาหารอีสาน',
      rating: 4.9,
      reviewsCount: 180,
      distance: 0.3,
      openHours: '11:00 - 21:00 น. (ทุกวัน)',
      phone: '085-123-9988',
      address: 'ตรงข้ามโลตัสเอ็กซ์เพรส ซอย 35',
      image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&q=80&w=400',
      tags: ['ส้มตำปูปลาร้า', 'ไก่ย่างหนังกรอบ', 'มีโต๊ะนั่ง']
    },
    {
      id: 'f4',
      name: 'ข้าวมันไก่ตอนตอนซอยเสนา สูตรสิงคโปร์',
      category: 'อาหารจานด่วน',
      rating: 4.7,
      reviewsCount: 115,
      distance: 0.7,
      openHours: '06:30 - 14:00 น. (หยุดวันพุธ)',
      phone: '082-444-5511',
      address: 'ปากซอยเสนานิคม 1 แยก 4',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
      tags: ['ไก่ฉ่ำนุ่ม', 'น้ำจิ้มเต้าเจี้ยวเด็ด', 'น้ำซุปมะนาวดอง']
    }
  ];

  const tags = ['ทั้งหมด', 'ก๋วยเตี๋ยว', 'กาแฟ/ของหวาน', 'ส้มตำ/อีสาน', 'อาหารจานด่วน'];

  const filteredPlaces = foodPlaces.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedTag === 'ทั้งหมด') return matchSearch;
    if (selectedTag === 'ก๋วยเตี๋ยว') return matchSearch && p.name.includes('ก๋วยเตี๋ยว');
    if (selectedTag === 'กาแฟ/ของหวาน') return matchSearch && (p.category.includes('คาเฟ่') || p.name.includes('กาแฟ'));
    if (selectedTag === 'ส้มตำ/อีสาน') return matchSearch && p.category.includes('อีสาน');
    if (selectedTag === 'อาหารจานด่วน') return matchSearch && p.category.includes('ด่วน');
    return matchSearch;
  });

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
              <Utensils size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">กินอะไรดี รอบตัวคุณ</h2>
              <p className="text-[11.5px] font-medium text-slate-500">ร้านเด็ด เมนูยอดนิยม ใกล้บ้านคุณ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-2.5 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาร้านอร่อย เมนูเด็ด..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
            {tags.map((t, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1 rounded-full text-[11.5px] font-bold whitespace-nowrap transition-all border ${
                  selectedTag === t
                    ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {filteredPlaces.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-[13px]">
              ไม่พบร้านอาหารที่ตรงกับคำค้นหา
            </div>
          ) : (
            filteredPlaces.map(place => (
              <div
                key={place.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
              >
                <div className="flex gap-3">
                  <div 
                    onClick={() => openMediaViewer({
                      url: place.image,
                      type: 'image',
                      title: place.name,
                      subtitle: `${place.category} • ให้บริการ: ${place.openHours}`
                    })}
                    className="relative w-20 h-20 rounded-xl overflow-hidden ring-1 ring-slate-150 shrink-0 cursor-pointer group"
                  >
                    <SafeImage
                      src={place.image}
                      alt={place.name}
                      category={place.category}
                      className="w-full h-full group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                      <span className="text-white text-[9px] font-bold">ขยาย</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 truncate">
                        {place.category}
                      </span>
                      <div className="flex items-center gap-1 text-[11.5px] font-extrabold text-amber-500">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span>{place.rating}</span>
                        <span className="text-slate-400 font-normal">({place.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-[13.5px] leading-tight truncate mb-1">
                      {place.name}
                    </h3>

                    <div className="flex items-center gap-1 text-[11.5px] text-slate-500 font-medium truncate mb-1">
                      <Clock size={11} className="text-slate-400 shrink-0" />
                      <span className="truncate">{place.openHours}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-600 font-bold">
                      <MapPin size={11} className="text-emerald-600 shrink-0" />
                      <span>ห่างออกไป {place.distance} กม.</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {place.tags.map((tg, i) => (
                    <span key={i} className="text-[10.5px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      #{tg}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1 border-t border-slate-100">
                  <a
                    href={`tel:${place.phone}`}
                    onClick={() => showToast(`📞 กำลังโทรออกไปยัง ${place.name}`)}
                    className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-[12px] flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                  >
                    <Phone size={13} />
                    โทรสั่งอาหาร ({place.phone})
                  </a>

                  <button
                    onClick={() => showToast(`📍 กำลังเปิดแผนที่นำทางไปยัง ${place.name}`)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-[12px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <Navigation size={13} />
                    นำทาง
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
