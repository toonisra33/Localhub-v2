import React, { useState, useMemo, useEffect } from 'react';
import { X, MapPin, Check, Compass, Navigation, Sparkles, Loader2, Home, Search, Building2, Globe } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { Location } from '../../types';
import { WORLDWIDE_AREAS_DATABASE, SearchAreaItem } from '../../data/thailandLocations';

interface LocationPickerModalProps {
  onClose: () => void;
}

export function LocationPickerModal({ onClose }: LocationPickerModalProps) {
  const { 
    location, 
    setLocation, 
    showToast,
    openLocationPermissionModal,
    isLocatingGps,
    isLoggedIn,
    userProfile
  } = useCommunity();

  const [searchAreaText, setSearchAreaText] = useState('');
  const [customSubdistrict, setCustomSubdistrict] = useState('');
  const [customDistrict, setCustomDistrict] = useState('');
  const [customProvince, setCustomProvince] = useState('');
  const [globalGeocodingResults, setGlobalGeocodingResults] = useState<SearchAreaItem[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  // Live Worldwide Geocoding search with debounce
  useEffect(() => {
    const q = searchAreaText.trim();
    if (q.length < 2) {
      setGlobalGeocodingResults([]);
      setIsSearchingGlobal(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingGlobal(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`,
          {
            headers: {
              'Accept-Language': 'th,en;q=0.9'
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const formatted: SearchAreaItem[] = data.map((item: any, idx: number) => {
              const lat = parseFloat(item.lat);
              const lon = parseFloat(item.lon);
              const displayName = item.display_name || item.name;
              const title = item.name || displayName.split(',')[0];
              const addr = item.address || {};
              const province = addr.state || addr.province || addr.region || addr.country || '';
              const district = addr.city || addr.town || addr.county || addr.district || '';
              const subdistrict = addr.suburb || addr.neighbourhood || addr.village || '';

              return {
                id: `global_loc_${item.place_id || idx}`,
                name: title,
                type: 'city',
                subdistrict: subdistrict,
                district: district,
                province: province,
                country: addr.country || '',
                lat: lat,
                lng: lon,
                zoomLevel: 14,
                description: displayName
              };
            });
            setGlobalGeocodingResults(formatted);
          }
        }
      } catch (err) {
        console.error('Worldwide Geocoding error:', err);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchAreaText]);

  // Combined matching area suggestions
  const matchedAreas = useMemo(() => {
    const q = searchAreaText.toLowerCase().trim();
    if (!q) return WORLDWIDE_AREAS_DATABASE.slice(0, 8);

    const localMatches = WORLDWIDE_AREAS_DATABASE.filter(area => {
      const matchName = area.name.toLowerCase().includes(q);
      const matchSub = area.subdistrict && area.subdistrict.toLowerCase().includes(q);
      const matchDist = area.district && area.district.toLowerCase().includes(q);
      const matchProv = area.province && area.province.toLowerCase().includes(q);
      const matchCountry = area.country && area.country.toLowerCase().includes(q);
      const matchKey = area.keywords && area.keywords.some(k => k.toLowerCase().includes(q));
      return matchName || matchSub || matchDist || matchProv || matchCountry || matchKey;
    });

    const combined = [...localMatches];
    for (const g of globalGeocodingResults) {
      if (!combined.some(c => Math.abs(c.lat - g.lat) < 0.01 && Math.abs(c.lng - g.lng) < 0.01)) {
        combined.push(g);
      }
    }

    return combined.slice(0, 10);
  }, [searchAreaText, globalGeocodingResults]);

  const handleSelectArea = (area: SearchAreaItem) => {
    const loc: Location = {
      subdistrict: area.subdistrict || area.name,
      district: area.district || 'เมือง',
      province: area.province || area.country || 'Global',
      village: area.name,
      latitude: area.lat,
      longitude: area.lng,
      isGps: false
    };
    setLocation(loc);
    showToast(`📍 สลับไปยังพื้นที่: ${area.name}`);
    onClose();
  };

  const handleSelect = (loc: Location) => {
    setLocation(loc);
    showToast(`📍 สลับไปยังพื้นที่: ต.${loc.subdistrict}, ${loc.district}`);
    onClose();
  };

  const handleRequestGps = () => {
    onClose();
    openLocationPermissionModal();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSubdistrict.trim() || !customDistrict.trim() || !customProvince.trim()) {
      showToast('กรุณากรอกข้อมูลพื้นที่ให้ครบถ้วน', 'error');
      return;
    }
    
    const loc: Location = {
      subdistrict: customSubdistrict.trim(),
      district: customDistrict.trim(),
      province: customProvince.trim(),
      village: 'ระบุเอง',
      isGps: false
    };
    
    setLocation(loc);
    showToast(`📍 สลับไปยังพื้นที่: ต.${loc.subdistrict}, ${loc.district}`);
    onClose();
  };

  // Helper to extract location from address string
  const handleUseProfileLocation = () => {
    if (!userProfile?.address) return;
    
    const loc: Location = {
      subdistrict: 'ตามที่อยู่โปรไฟล์',
      district: 'เขตของคุณ',
      province: 'ประเทศไทย',
      village: userProfile.villageOrCondo || 'ชุมชนของคุณ',
      isGps: false
    };
    
    setLocation(loc);
    showToast('📍 สลับไปยังตำแหน่งที่อยู่ตามโปรไฟล์แล้ว');
    onClose();
  };

  const currentAreaName = `${location.village ? location.village + ' ' : ''}ต.${location.subdistrict}, อ.${location.district}, จ.${location.province}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base leading-tight">
                เลือกหรือเปลี่ยนพื้นที่ใช้งาน
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                ใช้งานได้ทุกที่บนโลก (ทั่วโลกไม่มีการล็อคขอบเขต)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Active Location Card */}
        <div className="p-4 bg-emerald-50/50 border-b border-emerald-100/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <MapPin size={20} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                พื้นที่ปัจจุบันที่คุณเลือก
              </span>
              <h4 className="font-extrabold text-slate-800 text-sm mt-0.5 truncate max-w-[220px]">
                {location.subdistrict} ({location.district})
              </h4>
              <p className="text-[11px] text-slate-500 truncate max-w-[220px]">
                {currentAreaName}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Check size={13} strokeWidth={3} />
            ใช้งานอยู่
          </span>
        </div>

        {/* GPS Quick Action */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <button
            onClick={handleRequestGps}
            disabled={isLocatingGps}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-75"
          >
            {isLocatingGps ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Navigation size={18} />
            )}
            <span>ค้นหาพิกัด GPS จริง ณ ตำแหน่งที่คุณอยู่</span>
          </button>
          <p className="text-[11px] text-slate-400 text-center mt-1.5">
            ระบบจะอัปเดตและตรวจจับพิกัดแบบเรียลไทม์อัตโนมัติ
          </p>
        </div>

        {/* Saved User Address (If logged in) */}
        {isLoggedIn && userProfile?.address && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
            <button
              onClick={handleUseProfileLocation}
              className="w-full text-left p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center justify-between group shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-700">
                  <Home size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ที่อยู่โปรไฟล์ของคุณ</div>
                  <div className="text-xs font-bold text-slate-700 truncate">{userProfile.address}</div>
                </div>
              </div>
              <span className="text-xs text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform">
                สลับ →
              </span>
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="px-4 py-2 flex items-center gap-2 text-[11px] font-bold text-slate-400">
          <div className="flex-1 h-px bg-slate-200" />
          <span>ค้นหาพื้นที่ทั่วโลก (พิมพ์ชื่อเมือง / ประเทศ / ตำบล)</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Instant Area Autocomplete Search Box */}
        <div className="px-4 pb-1">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center">
              {isSearchingGlobal ? (
                <Loader2 size={16} className="animate-spin text-emerald-600" />
              ) : (
                <Search size={16} />
              )}
            </div>
            <input
              type="text"
              value={searchAreaText}
              onChange={e => setSearchAreaText(e.target.value)}
              placeholder="ค้นหาเมืองใดก็ได้บนโลก เช่น Tokyo, Paris, London, เสนานิคม, เชียงใหม่..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl text-slate-900 text-[13px] font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-xs"
            />
            {searchAreaText && (
              <button
                onClick={() => setSearchAreaText('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Live Matching Suggestions List */}
        <div className="px-4 py-2 max-h-52 overflow-y-auto space-y-1">
          {matchedAreas.map(area => (
            <div
              key={area.id}
              onClick={() => handleSelectArea(area)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 border border-transparent hover:border-emerald-200/60 cursor-pointer transition-all group bg-white shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                  {area.flag ? (
                    <span className="text-sm">{area.flag}</span>
                  ) : area.country && area.country !== 'Thailand' ? (
                    <Globe size={15} />
                  ) : (
                    <Building2 size={15} />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[12.5px] font-extrabold text-slate-800 group-hover:text-emerald-800 truncate">
                    {area.name}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400 truncate">
                    {area.description || `${area.subdistrict ? `ต.${area.subdistrict} ` : ''}${area.district ? `อ.${area.district} ` : ''}${area.province ? `จ.${area.province} ` : ''}${area.country || ''}`}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0 ml-2">
                เลือก
              </span>
            </div>
          ))}
        </div>

        {/* Divider for Custom Form */}
        <div className="px-4 py-1 flex items-center gap-2 text-[10.5px] font-bold text-slate-400">
          <div className="flex-1 h-px bg-slate-200" />
          <span>หรือกรอกระบุพิกัดเอง</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Custom Location Form */}
        <div className="p-4 pt-1 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1">
                ชื่อตำบล / แขวง / Sub-district
              </label>
              <input
                type="text"
                placeholder="เช่น เสนานิคม หรือ Shibuya"
                value={customSubdistrict}
                onChange={e => setCustomSubdistrict(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  อำเภอ / เขต / City
                </label>
                <input
                  type="text"
                  placeholder="เช่น จตุจักร หรือ Tokyo"
                  value={customDistrict}
                  onChange={e => setCustomDistrict(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  จังหวัด / ประเทศ / State
                </label>
                <input
                  type="text"
                  placeholder="เช่น กรุงเทพฯ หรือ Japan"
                  value={customProvince}
                  onChange={e => setCustomProvince(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-98"
            >
              ยืนยันการตั้งค่าพื้นที่
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
