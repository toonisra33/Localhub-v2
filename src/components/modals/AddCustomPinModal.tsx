import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Tag, 
  FileText, 
  Phone, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  AlertTriangle,
  Utensils,
  Store,
  Calendar,
  Compass
} from 'lucide-react';
import { MapPoint } from './PlaceDetailModal';

interface AddCustomPinModalProps {
  initialLat: number;
  initialLng: number;
  onSavePin: (pin: Omit<MapPoint, 'id' | 'distance'>) => void;
  onClose: () => void;
}

export function AddCustomPinModal({
  initialLat,
  initialLng,
  onSavePin,
  onClose
}: AddCustomPinModalProps) {
  const [name, setName] = useState('');
  const [categoryType, setCategoryType] = useState<'custom' | 'food' | 'incident' | 'shop' | 'event'>('custom');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('');
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);

  const categories = [
    { 
      type: 'custom', 
      label: 'จุดสังเกต / หมุดส่วนตัว', 
      icon: <Compass size={14} />, 
      color: 'bg-indigo-500 text-white',
      border: 'border-indigo-200'
    },
    { 
      type: 'food', 
      label: 'ร้านอาหาร / คาเฟ่', 
      icon: <Utensils size={14} />, 
      color: 'bg-amber-500 text-white',
      border: 'border-amber-200'
    },
    { 
      type: 'incident', 
      label: 'จุดเตือนภัย / ซ่อมถนน', 
      icon: <AlertTriangle size={14} />, 
      color: 'bg-rose-500 text-white',
      border: 'border-rose-200'
    },
    { 
      type: 'shop', 
      label: 'ร้านค้า / อู่ซ่อม / บริการ', 
      icon: <Store size={14} />, 
      color: 'bg-emerald-500 text-white',
      border: 'border-emerald-200'
    },
    { 
      type: 'event', 
      label: 'กิจกรรม / จุดนัดพบ', 
      icon: <Calendar size={14} />, 
      color: 'bg-purple-500 text-white',
      border: 'border-purple-200'
    },
  ];

  const presets = [
    {
      name: 'จุดตรวจและหลุมถนนชำรุด',
      type: 'incident' as const,
      category: 'ปิดถนน/งานก่อสร้าง',
      desc: 'พบผิวถนนชำรุดและมีน้ำขัง เลนซ้ายโปรดชะลอความเร็ว',
      status: 'รอซ่อมแซม'
    },
    {
      name: 'ร้านกาแฟคั่วสดชุมชน Slow Bar',
      type: 'food' as const,
      category: 'ร้านอาหารและเครื่องดื่ม',
      desc: 'เมล็ดกาแฟไทยคุณภาพดี เมนูซิกเนเจอร์ Dirty และ มัทฉะลาเต้ เปิด 08:00 - 17:00 น.',
      phone: '089-555-4321',
      status: 'เปิดให้บริการ'
    },
    {
      name: 'จุดรวมพลและรับบริจาคชุมชน',
      type: 'event' as const,
      category: 'จุดนัดพบชุมชน',
      desc: 'ศูนย์ประสานงานช่วยเหลือลูกบ้าน รับน้ำดื่มและสิ่งของจำเป็น',
      status: 'เปิดตลอด 24 ชม.'
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setName(p.name);
    setCategoryType(p.type);
    setCustomCategory(p.category);
    setDescription(p.desc);
    setStatus(p.status || '');
    if (p.phone) setPhone(p.phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let displayCategory = customCategory.trim();
    if (!displayCategory) {
      if (categoryType === 'food') displayCategory = 'ร้านอาหาร';
      else if (categoryType === 'incident') displayCategory = 'แจ้งเตือนภัย/ซ่อมบำรุง';
      else if (categoryType === 'shop') displayCategory = 'ร้านค้า/บริการ';
      else if (categoryType === 'event') displayCategory = 'กิจกรรม/นัดพบ';
      else displayCategory = 'จุดสังเกตชุมชน';
    }

    onSavePin({
      name: name.trim(),
      type: categoryType === 'event' ? 'incident' : categoryType,
      category: displayCategory,
      lat,
      lng,
      description: description.trim() || undefined,
      phone: phone.trim() || undefined,
      status: status.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      isCustomPin: true,
      createdAt: Date.now()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] leading-snug">ปักหมุดสถานที่ใหม่บน Google Map</h3>
              <p className="text-[11px] text-slate-400">
                พิกัด: {lat.toFixed(5)}, {lng.toFixed(5)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-slate-800 text-[13px]">
          
          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
              ⚡ ใส่ตัวอย่างด่วน
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-slate-700 text-[11.5px] font-bold whitespace-nowrap transition-all"
                >
                  + {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Place Name */}
          <div>
            <label className="block text-[12px] font-extrabold text-slate-700 mb-1">
              ชื่อสถานที่ / ชื่อจุดปักหมุด <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="เช่น ร้านกาแฟป้าแจ่ม, จุดซ่อมท่อระบายน้ำ, ป้อมยามหน้าหมู่บ้าน"
                className="w-full pl-3.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[12px] font-extrabold text-slate-700 mb-1.5">
              หมวดหมู่สถานที่
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map(c => {
                const isSelected = categoryType === c.type;
                return (
                  <button
                    key={c.type}
                    type="button"
                    onClick={() => setCategoryType(c.type as any)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/20 font-extrabold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-semibold'
                    }`}
                  >
                    <span className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-white border border-slate-200'}`}>
                      {c.icon}
                    </span>
                    <span className="text-[11.5px] truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Category Tag & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-extrabold text-slate-700 mb-1">
                ป้ายกำกับย่อย (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="เช่น คาเฟ่, ซ่อมบำรุง, ของกิน"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[12.5px] font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-extrabold text-slate-700 mb-1">
                สถานะ (ไม่บังคับ)
              </label>
              <input
                type="text"
                value={status}
                onChange={e => setStatus(e.target.value)}
                placeholder="เช่น เปิด 24 ชม., กำลังซ่อม"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[12.5px] font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-extrabold text-slate-700 mb-1">
              รายละเอียด / จุดสังเกต
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="บอกข้อมูลเพิ่มเติม เช่น อยู่ตรงข้ามเซเว่น, มีที่จอดรถ, เลี่ยงเส้นทางช่วงเย็น..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[12.5px] font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>

          {/* Phone & Photo URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                <Phone size={12} className="text-slate-400" />
                เบอร์โทรติดต่อ (ถ้ามี)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="08X-XXX-XXXX"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[12.5px] font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-extrabold text-slate-700 mb-1 flex items-center gap-1">
                <ImageIcon size={12} className="text-slate-400" />
                ลิงก์รูปภาพ (URL)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[12.5px] font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Coordinates Info */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-[11.5px] text-emerald-900">
            <span className="flex items-center gap-1 font-bold">
              <MapPin size={13} className="text-emerald-600" />
              พิกัดที่เลือกบนแผนที่:
            </span>
            <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </span>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[13px] transition-colors"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-[2] py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-[13px] flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Check size={16} />
              บันทึกปักหมุดลงแผนที่
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
