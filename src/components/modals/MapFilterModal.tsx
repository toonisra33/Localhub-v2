import React, { useState } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface MapFilterModalProps {
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export function MapFilterModal({ onClose, selectedCategory, onSelectCategory }: MapFilterModalProps) {
  const { showToast } = useCommunity();
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'incident', label: 'เหตุการณ์และเตือนภัย' },
    { id: 'food', label: 'ร้านอาหารและเครื่องดื่ม' },
    { id: 'shop', label: 'ร้านค้าและบริการ' },
    { id: 'service', label: 'หน่วยงานและสถานที่ราชการ' },
  ];

  const handleApply = () => {
    showToast('ปรับใช้ตัวกรองแผนที่เรียบร้อย');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-sm">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">ตัวกรองแผนที่</h2>
              <p className="text-[11.5px] font-medium text-slate-500">เลือกประเภทสถานที่และเงื่อนไขการแสดงผล</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters Body */}
        <div className="p-5 space-y-4">
          
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-2">หมวดหมู่จุดบนแผนที่</label>
            <div className="space-y-1.5">
              {categories.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between text-[13px] font-bold transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {isSelected && <Check size={16} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-slate-800">เฉพาะร้านที่เปิดทำการตอนนี้</span>
              <input
                type="checkbox"
                checked={onlyOpenNow}
                onChange={e => setOnlyOpenNow(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-slate-800">เฉพาะเหตุการณ์ที่ยืนยันแล้ว</span>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={e => setVerifiedOnly(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={handleApply}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-[13.5px] transition-all shadow-md active:scale-95"
          >
            ใช้ตัวกรอง
          </button>

        </div>

      </div>
    </div>
  );
}
