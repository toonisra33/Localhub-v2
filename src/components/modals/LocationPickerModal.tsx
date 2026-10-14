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

interface GlobalPlace {
  id: string;
  name: string;
  sub: string;
  flag: string;
  province: string;
  district: string;
  subdistrict: string;
  lat: number;
  lng: number;
}

const POPULAR_GLOBAL_PLACES: GlobalPlace[] = [
  {
    id: 'tokyo',
    name: 'โตเกียว (Tokyo, Japan)',
    sub: 'มหานครโตเกียว ประเทศญี่ปุ่น',
    flag: '🇯🇵',
    province: 'โตเกียว',
    district: 'ชินจูกุ',
    subdistrict: 'ชิบูย่า',
    lat: 35.6762,
    lng: 139.6503
  },
  {
    id: 'shibuya',
    name: 'ห้าแยกชิบูย่า (Shibuya Crossing)',
    sub: 'ย่านการค้าและแลนด์มาร์กชื่อดัง กรุงโตเกียว',
    flag: '🇯🇵',
    province: 'โตเกียว',
    district: 'ชิบูย่า',
    subdistrict: 'โดเก็นซากะ',
    lat: 35.6595,
    lng: 139.7005
  },
  {
    id: 'ladyaw',
    name: 'ลาดยาว (จตุจักร, กรุงเทพฯ)',
    sub: 'หมู่บ้านพหลโยธินวิลล่า ต.ลาดยาว, อ.จตุจักร, จ.กรุงเทพมหานคร',
    flag: '🇹🇭',
    province: 'กรุงเทพมหานคร',
    district: 'จตุจักร',
    subdistrict: 'ลาดยาว',
    lat: 13.8282,
    lng: 100.5694
  },
  {
    id: 'chiangmai',
    name: 'เมืองเชียงใหม่ (Chiang Mai)',
    sub: 'คูเมืองเชียงใหม่, ต.ศรีภูมิ, อ.เมืองเชียงใหม่',
    flag: '🇹🇭',
    province: 'เชียงใหม่',
    district: 'เมืองเชียงใหม่',
    subdistrict: 'ศรีภูมิ',
    lat: 18.7883,
    lng: 98.9853
  },
  {
    id: 'pattaya',
    name: 'เมืองพัทยา (บางละมุง, ชลบุรี)',
    sub: 'หาดพัทยา, ต.หนองปรือ, อ.บางละมุง, จ.ชลบุรี',
    flag: '🇹🇭',
    province: 'ชลบุรี',
    district: 'บางละมุง',
    subdistrict: 'หนองปรือ',
    lat: 12.9276,
    lng: 100.8771
  },
  {
    id: 'hatyai',
    name: 'หาดใหญ่ (สงขลา)',
    sub: 'ย่านการค้าสาย 1-3, อ.หาดใหญ่, จ.สงขลา',
    flag: '🇹🇭',
    province: 'สงขลา',
    district: 'หาดใหญ่',
    subdistrict: 'หาดใหญ่',
    lat: 7.0084,
    lng: 100.4767
  },
  {
    id: 'phuket',
    name: 'เมืองภูเก็ต (Phuket)',
    sub: 'ย่านเมืองเก่าภูเก็ต, อ.เมืองภูเก็ต, จ.ภูเก็ต',
    flag: '🇹🇭',
    province: 'ภูเก็ต',
    district: 'เมืองภูเก็ต',
    subdistrict: 'ตลาดใหญ่',
    lat: 7.8804,
    lng: 98.3923
  },
  {
    id: 'khonkaen',
    name: 'เมืองขอนแก่น (Khon Kaen)',
    sub: 'บึงแก่นนคร, อ.เมืองขอนแก่น, จ.ขอนแก่น',
    flag: '🇹🇭',
    province: 'ขอนแก่น',
    district: 'เมืองขอนแก่น',
    subdistrict: 'ในเมือง',
    lat: 16.4419,
    lng: 102.8359
  }
];

export const LocationPickerModal: React.FC = () => {
  const { isLocationModalOpen, closeLocationModal, location, setLocation, requestRealLocation, showToast } = useCommunity();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isLocationModalOpen) return null;

  const filteredPlaces = POPULAR_GLOBAL_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sub.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectPlace = (place: GlobalPlace) => {
    const newLoc: Location = {
      province: place.province,
      district: place.district,
      subdistrict: place.subdistrict,
      displayName: `${place.district ? `${place.district}, ` : ''}${place.province}`,
      lat: place.lat,
      lng: place.lng
    };
    setLocation(newLoc);
    showToast(`เปลี่ยนพื้นที่เป็น ${place.name} เรียบร้อยแล้ว`, 'success');
    closeLocationModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLocationModal();
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header (Matching Screenshot 5) */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                เลือกหรือเปลี่ยนพื้นที่ใช้งาน
              </h3>
              <p className="text-[11px] text-slate-400">
                ใช้งานได้ทุกที่บนโลก (ทั่วโลกไม่มีการล็อคขอบเขต)
              </p>
            </div>
          </div>
          <button
            onClick={closeLocationModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl transition"
            title="ปิดหน้าต่าง (กากบาท)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Card: พื้นที่ปัจจุบันที่คุณเลือก (Matching Screenshot 5) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3 min-w-0">
              <span className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wide">
                  พื้นที่ปัจจุบันที่คุณเลือก
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm truncate mt-0.5">
                  {location.subdistrict ? `${location.subdistrict} (${location.district || location.province})` : location.displayName}
                </h4>
                <p className="text-[11px] text-slate-500 leading-tight truncate mt-0.5">
                  หมู่บ้านพหลโยธินวิลล่า ต.{location.subdistrict || 'ลาดยาว'}, อ.{location.district || 'จตุจักร'}, จ.{location.province}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-black shrink-0">
              ✓ ใช้งานอยู่
            </span>
          </div>

          {/* Big Green Real GPS Button (Matching Screenshot 5) */}
          <button
            onClick={() => requestRealLocation()}
            className="w-full p-4 bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 active:scale-98 text-white rounded-2xl shadow-lg shadow-emerald-700/25 transition text-left flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2.5 bg-white/20 rounded-xl shrink-0 text-white group-hover:scale-110 transition-transform">
                <Navigation className="w-5 h-5 fill-white" />
              </span>
              <div className="min-w-0">
                <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                  ค้นหาพิกัด GPS จริง ณ ตำแหน่งที่คุณอยู่
                </h4>
                <p className="text-[11px] text-emerald-100 leading-tight mt-0.5">
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
