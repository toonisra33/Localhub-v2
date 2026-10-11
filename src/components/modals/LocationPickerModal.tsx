import React, { useState } from 'react';
import { X, MapPin, Search, Navigation, Check } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { THAI_PROVINCES, ALL_PROVINCES_LIST } from '../../data/thaiData';

export const LocationPickerModal: React.FC = () => {
  const { isLocationModalOpen, closeLocationModal, location, setLocation, openLocationPermissionModal, showToast } = useCommunity();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(location.province);
  const [selectedDistrict, setSelectedDistrict] = useState(location.district || '');

  if (!isLocationModalOpen) return null;

  const filteredProvinces = ALL_PROVINCES_LIST.filter(p => p.includes(searchTerm));

  // Find districts for chosen province
  const currentProvinceData = THAI_PROVINCES.find(p => p.name === selectedProvince);
  const districts = currentProvinceData ? currentProvinceData.districts : ['เมือง', 'อำเภอทั่วไป'];

  const handleSave = () => {
    setLocation({
      province: selectedProvince,
      district: selectedDistrict || (districts[0] || ''),
      subdistrict: '',
      displayName: selectedDistrict ? `${selectedProvince} / อ.${selectedDistrict}` : selectedProvince
    });
    showToast(`เปลี่ยนพื้นที่เป็น ${selectedProvince} เรียบร้อยแล้ว`, 'success');
    closeLocationModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">เลือกพื้นที่ของคุณ</h3>
              <p className="text-xs text-slate-500">รับข่าวสารและบรอดแคสต์ตรงตามพื้นที่ที่คุณอยู่</p>
            </div>
          </div>
          <button onClick={closeLocationModal} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Quick Action */}
        <div className="p-4 border-b border-slate-100 bg-blue-50/50">
          <button
            onClick={() => {
              closeLocationModal();
              openLocationPermissionModal();
            }}
            className="w-full py-2.5 px-3 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl text-blue-600 text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs"
          >
            <Navigation className="w-4 h-4 fill-blue-600" />
            ใช้ตำแหน่งปัจจุบันอัตโนมัติ (ตรวจจับด้วย GPS)
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Province search */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ค้นหาจังหวัด</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="พิมพ์ชื่อจังหวัด เช่น เชียงใหม่, ชลบุรี..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-2 max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
              {filteredProvinces.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setSelectedProvince(p);
                    setSelectedDistrict('');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition ${
                    selectedProvince === p
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{p}</span>
                  {selectedProvince === p && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* District selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              อำเภอ/เขต ใน {selectedProvince}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- ทั้งหมดในจังหวัด --</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={closeLocationModal}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
          >
            ยืนยันพื้นที่
          </button>
        </div>
      </div>
    </div>
  );
};
