import React, { useState } from 'react';
import {
  X,
  MapPin,
  Search,
  Navigation,
  Globe,
  Check,
  ArrowRight,
  Home
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { Location } from '../../types';

import { ALL_PROVINCES_LIST, THAI_PROVINCES, THAI_PROVINCE_COORDINATES, findNearestThaiProvince } from '../../data/thaiData';

interface PlaceItem {
  id: string;
  name: string;
  sub: string;
  flag: string;
  lat: number;
  lng: number;
  province: string;
  district: string;
  subdistrict: string;
}

const POPULAR_PLACES: PlaceItem[] = [
  { id: 'bkk-latyao', name: 'ลาดยาว, จตุจักร', sub: 'กรุงเทพมหานคร, ประเทศไทย', flag: '🇹🇭', lat: 13.8282, lng: 100.5647, province: 'กรุงเทพมหานคร', district: 'จตุจักร', subdistrict: 'ลาดยาว' },
  { id: 'bkk-siam', name: 'สยาม, ปทุมวัน', sub: 'กรุงเทพมหานคร, ประเทศไทย', flag: '🇹🇭', lat: 13.7462, lng: 100.5347, province: 'กรุงเทพมหานคร', district: 'ปทุมวัน', subdistrict: 'ปทุมวัน' },
  { id: 'bkk-sukhumvit', name: 'สุขุมวิท, วัฒนา', sub: 'กรุงเทพมหานคร, ประเทศไทย', flag: '🇹🇭', lat: 13.7380, lng: 100.5604, province: 'กรุงเทพมหานคร', district: 'วัฒนา', subdistrict: 'คลองเตยเหนือ' },
  { id: 'cnx-nimman', name: 'นิมมานฯ, เมืองเชียงใหม่', sub: 'เชียงใหม่, ประเทศไทย', flag: '🇹🇭', lat: 18.7961, lng: 98.9675, province: 'เชียงใหม่', district: 'เมืองเชียงใหม่', subdistrict: 'สุเทพ' },
  { id: 'hkt-patong', name: 'ป่าตอง, กะทู้', sub: 'ภูเก็ต, ประเทศไทย', flag: '🇹🇭', lat: 7.8967, lng: 98.2974, province: 'ภูเก็ต', district: 'กะทู้', subdistrict: 'ป่าตอง' },
  { id: 'chon-pattaya', name: 'พัทยา, บางละมุง', sub: 'ชลบุรี, ประเทศไทย', flag: '🇹🇭', lat: 12.9276, lng: 100.8771, province: 'ชลบุรี', district: 'บางละมุง', subdistrict: 'หนองปรือ' },
  { id: 'kkn-muang', name: 'ในเมือง, เมืองขอนแก่น', sub: 'ขอนแก่น, ประเทศไทย', flag: '🇹🇭', lat: 16.4419, lng: 102.8360, province: 'ขอนแก่น', district: 'เมืองขอนแก่น', subdistrict: 'ในเมือง' },
  { id: 'tokyo', name: 'Shibuya, Tokyo', sub: 'ประเทศญี่ปุ่น (Japan)', flag: '🇯🇵', lat: 35.6580, lng: 139.7016, province: 'Tokyo', district: 'Shibuya', subdistrict: 'Shibuya' },
  { id: 'singapore', name: 'Marina Bay', sub: 'ประเทศสิงคโปร์ (Singapore)', flag: '🇸🇬', lat: 1.2863, lng: 103.8540, province: 'Singapore', district: 'Central', subdistrict: 'Downtown Core' },
  { id: 'london', name: 'Central London', sub: 'สหราชอาณาจักร (United Kingdom)', flag: '🇬🇧', lat: 51.5074, lng: -0.1278, province: 'London', district: 'Westminster', subdistrict: 'Soho' },
  { id: 'newyork', name: 'Manhattan, New York', sub: 'สหรัฐอเมริกา (USA)', flag: '🇺🇸', lat: 40.7128, lng: -74.0060, province: 'New York', district: 'Manhattan', subdistrict: 'Manhattan' },
  { id: 'paris', name: 'Paris', sub: 'ประเทศฝรั่งเศส (France)', flag: '🇫🇷', lat: 48.8566, lng: 2.3522, province: 'Paris', district: 'Paris', subdistrict: 'Centre' },
];

export const LocationPickerModal: React.FC = () => {
  const { isLocationModalOpen, closeLocationModal, location, setLocation, requestRealLocation, showToast } = useCommunity();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  if (!isLocationModalOpen) return null;

  const filteredPlaces = POPULAR_PLACES.filter((place) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      place.name.toLowerCase().includes(q) ||
      place.sub.toLowerCase().includes(q) ||
      place.province.toLowerCase().includes(q)
    );
  });

  const handleSelectPlace = (place: PlaceItem) => {
    const newLoc: Location = {
      province: place.province,
      district: place.district,
      subdistrict: place.subdistrict,
      displayName: place.name,
      lat: place.lat,
      lng: place.lng
    };

    setLocation(newLoc);
    try {
      localStorage.setItem('localhub_location', JSON.stringify(newLoc));
    } catch {}
    showToast(`เปลี่ยนพื้นที่ใช้งานเป็น ${place.name} เรียบร้อยแล้ว`, 'success');
    closeLocationModal();
  };

  const handleSelectProvince = (provName: string) => {
    const coords = THAI_PROVINCE_COORDINATES[provName] || { lat: 13.7563, lng: 100.5018, district: 'เมือง' };
    const provInfo = THAI_PROVINCES.find(p => p.name === provName);
    const defaultDistrict = coords.district || (provInfo?.districts && provInfo.districts[0]) || '';

    const newLoc: Location = {
      province: provName,
      district: defaultDistrict,
      subdistrict: '',
      displayName: defaultDistrict ? `${defaultDistrict}, ${provName}` : provName,
      lat: coords.lat,
      lng: coords.lng
    };

    setLocation(newLoc);
    try {
      localStorage.setItem('localhub_location', JSON.stringify(newLoc));
    } catch {}
    showToast(`เปลี่ยนพื้นที่ใช้งานเป็น ${provName} (${defaultDistrict}) เรียบร้อยแล้ว`, 'success');
    closeLocationModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLocationModal();
      }}
    >
      <div className="relative w-[calc(100vw-1.5rem)] max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header (Matching Screenshot 5) */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <span className="p-1.5 sm:p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight truncate">
                เลือกหรือเปลี่ยนพื้นที่ใช้งาน
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                ใช้งานได้ทุกที่ (ไม่มีการล็อคขอบเขต)
              </p>
            </div>
          </div>
          <button
            onClick={closeLocationModal}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 rounded-xl transition shrink-0 ml-1.5"
            title="ปิดหน้าต่าง (กากบาท)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-5 flex-1 overflow-y-auto space-y-3.5">
          {/* Card: พื้นที่ปัจจุบันที่คุณเลือก (Matching Screenshot 5) */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 flex items-start justify-between gap-2.5 shadow-xs">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <span className="p-1.5 sm:p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-800 tracking-wide block">
                  พื้นที่ปัจจุบันที่คุณเลือก
                </span>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate mt-0.5">
                  {location.subdistrict ? `${location.subdistrict} (${location.district || location.province})` : location.displayName}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight truncate mt-0.5">
                  หมู่บ้านพหลโยธินวิลล่า ต.{location.subdistrict || 'ลาดยาว'}, อ.{location.district || 'จตุจักร'}, จ.{location.province}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[9px] sm:text-[10px] font-black shrink-0">
              ✓ ใช้งานอยู่
            </span>
          </div>

          {/* Big Green Real GPS Button (Matching Screenshot 5) */}
          <button
            onClick={() => requestRealLocation()}
            className="w-full p-3 sm:p-3.5 bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 active:scale-98 text-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg shadow-emerald-700/25 transition text-left flex items-center justify-between gap-2.5 group"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="p-2 sm:p-2.5 bg-white/20 rounded-xl shrink-0 text-white group-hover:scale-110 transition-transform">
                <Navigation className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-xs sm:text-sm leading-tight truncate">
                  ค้นหาพิกัด GPS จริง ณ ตำแหน่งที่คุณอยู่
                </h4>
                <p className="text-[10px] sm:text-[11px] text-emerald-100 leading-tight mt-0.5 truncate">
                  ระบบจะอัปเดตและตรวจจับพิกัดแบบเรียลไทม์อัตโนมัติ
                </p>
              </div>
            </div>
          </button>

          {/* Profile Address Quick Switch Card (Matching Screenshot 5) */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-2 bg-sky-50 text-sky-600 rounded-xl shrink-0">
                <Home className="w-4 h-4" />
              </span>
              <div className="min-w-0 text-xs">
                <span className="text-[10px] text-slate-400 block">ที่อยู่โปรไฟล์ของคุณ</span>
                <span className="font-bold text-slate-800 truncate block">
                  พื้นที่{location.province}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                showToast(`สลับไปยังพื้นที่ ${location.province} เรียบร้อย`, 'info');
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
            >
              <span>สลับ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Input for World and Local Cities */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              ค้นหาพื้นที่ทั่วโลก (พิมพ์ชื่อเมือง / ประเทศ / ตำบล)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาเมืองใดก็ได้บนโลก เช่น Tokyo, Paris, ลาดยาว..."
                className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white shadow-xs"
              />
            </div>
          </div>

          {/* List of Global and Local Cities (Matching Screenshot 5) */}
          <div className="space-y-2">
            {filteredPlaces.map((place) => (
              <div
                key={place.id}
                className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 transition shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">{place.flag}</span>
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs text-slate-900 leading-tight truncate">
                      {place.name}
                    </h5>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {place.sub}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectPlace(place)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition shrink-0 active:scale-95"
                >
                  เลือก
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
