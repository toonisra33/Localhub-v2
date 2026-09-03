import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  APIProvider, 
  Map, 
  Marker, 
  useMap 
} from '@vis.gl/react-google-maps';
import { 
  X, 
  Search, 
  MapPin, 
  Navigation, 
  Check, 
  Utensils, 
  Store, 
  Building2, 
  Landmark, 
  Globe, 
  Compass, 
  Sparkles, 
  Loader2, 
  Coffee,
  Trees,
  ShoppingBag,
  Info
} from 'lucide-react';
import { CheckInLocation, Location } from '../../types';
import { WORLDWIDE_AREAS_DATABASE, SearchAreaItem } from '../../data/thailandLocations';

interface CheckInPickerModalProps {
  initialCheckIn?: CheckInLocation | null;
  userLocation: Location;
  onSelectCheckIn: (checkIn: CheckInLocation) => void;
  onClose: () => void;
}

// Controller to smoothly pan and zoom map
function MapCameraSync({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center.lat, center.lng, zoom]);
  return null;
}

export function CheckInPickerModal({
  initialCheckIn,
  userLocation,
  onSelectCheckIn,
  onClose
}: CheckInPickerModalProps) {
  // Current coordinates
  const [lat, setLat] = useState<number>(() => {
    return initialCheckIn?.latitude || userLocation.latitude || 13.8305;
  });
  const [lng, setLng] = useState<number>(() => {
    return initialCheckIn?.longitude || userLocation.longitude || 100.5695;
  });
  const [zoom, setZoom] = useState<number>(16);

  // Form fields
  const [placeName, setPlaceName] = useState<string>(() => {
    return initialCheckIn?.placeName || (userLocation.village || `ย่าน ต.${userLocation.subdistrict || 'เสนานิคม'}`);
  });
  const [category, setCategory] = useState<string>(() => {
    return initialCheckIn?.category || 'restaurant';
  });
  const [subdistrict, setSubdistrict] = useState<string>(() => {
    return initialCheckIn?.subdistrict || userLocation.subdistrict || '';
  });
  const [district, setDistrict] = useState<string>(() => {
    return initialCheckIn?.district || userLocation.district || '';
  });
  const [province, setProvince] = useState<string>(() => {
    return initialCheckIn?.province || userLocation.province || '';
  });
  const [address, setAddress] = useState<string>(() => {
    return initialCheckIn?.address || '';
  });

  // Search state
  const [searchText, setSearchText] = useState<string>('');
  const [isSearchingGlobal, setIsSearchingGlobal] = useState<boolean>(false);
  const [globalResults, setGlobalResults] = useState<SearchAreaItem[]>([]);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);

  // Google Maps API Key
  const userEnvApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const fallbackKey = 'AIzaSyAbIv0M35oWeTTRnSw-o6Yz4DY6KxiTEQw';
  const apiKey = (userEnvApiKey && userEnvApiKey.trim().length > 10 && !userEnvApiKey.includes('MY_KEY')) 
    ? userEnvApiKey 
    : fallbackKey;

  const categories = [
    { id: 'restaurant', label: 'อาหาร/ของกิน', icon: Utensils, color: 'bg-amber-500 text-white' },
    { id: 'cafe', label: 'คาเฟ่/เครื่องดื่ม', icon: Coffee, color: 'bg-orange-500 text-white' },
    { id: 'shop', label: 'ร้านค้า/ตลาด', icon: ShoppingBag, color: 'bg-emerald-500 text-white' },
    { id: 'landmark', label: 'ท่องเที่ยว/พักผ่อน', icon: Trees, color: 'bg-teal-500 text-white' },
    { id: 'building', label: 'ที่พัก/ชุมชน', icon: Building2, color: 'bg-sky-500 text-white' },
    { id: 'general', label: 'เช็คอินทั่วไป', icon: MapPin, color: 'bg-indigo-500 text-white' },
  ];

  // Live Worldwide Geocoding search
  useEffect(() => {
    const q = searchText.trim();
    if (q.length < 2) {
      setGlobalResults([]);
      setIsSearchingGlobal(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingGlobal(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=6`,
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
              const itemLat = parseFloat(item.lat);
              const itemLng = parseFloat(item.lon);
              const displayName = item.display_name || item.name;
              const title = item.name || displayName.split(',')[0];
              const addr = item.address || {};
              const prov = addr.state || addr.province || addr.region || addr.country || '';
              const dist = addr.city || addr.town || addr.county || addr.district || '';
              const sub = addr.suburb || addr.neighbourhood || addr.village || '';

              return {
                id: `checkin_geo_${item.place_id || idx}`,
                name: title,
                type: 'landmark',
                subdistrict: sub,
                district: dist,
                province: prov,
                country: addr.country || '',
                lat: itemLat,
                lng: itemLng,
                zoomLevel: 16,
                description: displayName
              };
            });
            setGlobalResults(formatted);
          }
        }
      } catch (err) {
        console.error('Checkin geocoding error:', err);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Reverse Geocoding when user taps on map
  const performReverseGeocode = async (targetLat: number, targetLng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${targetLat}&lon=${targetLng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'th,en;q=0.9'
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const title = data.name || addr.amenity || addr.shop || addr.building || addr.road || addr.suburb || 'จุดที่เลือกบนแผนที่';
        const sub = addr.suburb || addr.neighbourhood || addr.village || subdistrict;
        const dist = addr.city || addr.town || addr.district || district;
        const prov = addr.state || addr.province || addr.country || province;
        
        if (title && title !== 'จุดที่เลือกบนแผนที่') {
          setPlaceName(title);
        }
        if (sub) setSubdistrict(sub);
        if (dist) setDistrict(dist);
        if (prov) setProvince(prov);
        if (data.display_name) setAddress(data.display_name);
      }
    } catch (e) {
      console.error('Reverse geocode error:', e);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Local database suggestions + Global results
  const searchSuggestions = useMemo(() => {
    const q = searchText.toLowerCase().trim();
    if (!q) {
      // Default recommended areas
      return WORLDWIDE_AREAS_DATABASE.slice(0, 5);
    }

    const localMatches = WORLDWIDE_AREAS_DATABASE.filter(item => {
      const mName = item.name.toLowerCase().includes(q);
      const mSub = item.subdistrict && item.subdistrict.toLowerCase().includes(q);
      const mDist = item.district && item.district.toLowerCase().includes(q);
      const mProv = item.province && item.province.toLowerCase().includes(q);
      const mCountry = item.country && item.country.toLowerCase().includes(q);
      const mKey = item.keywords && item.keywords.some(k => k.toLowerCase().includes(q));
      return mName || mSub || mDist || mProv || mCountry || mKey;
    });

    const combined = [...localMatches];
    for (const g of globalResults) {
      if (!combined.some(c => Math.abs(c.lat - g.lat) < 0.005 && Math.abs(c.lng - g.lng) < 0.005)) {
        combined.push(g);
      }
    }

    return combined.slice(0, 8);
  }, [searchText, globalResults]);

  // Handle selecting search suggestion
  const handleSelectSuggestion = (item: SearchAreaItem) => {
    setLat(item.lat);
    setLng(item.lng);
    setZoom(item.zoomLevel || 16);
    setPlaceName(item.name);
    if (item.subdistrict) setSubdistrict(item.subdistrict);
    if (item.district) setDistrict(item.district);
    if (item.province) setProvince(item.province);
    if (item.description) setAddress(item.description);
    setSearchText('');
  };

  // Handle map click
  const handleMapClick = (e: any) => {
    let clickLat: number | undefined;
    let clickLng: number | undefined;

    if (e.detail?.latLng) {
      clickLat = typeof e.detail.latLng.lat === 'function' ? e.detail.latLng.lat() : e.detail.latLng.lat;
      clickLng = typeof e.detail.latLng.lng === 'function' ? e.detail.latLng.lng() : e.detail.latLng.lng;
    } else if (e.latLng) {
      clickLat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
      clickLng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
    }

    if (typeof clickLat === 'number' && typeof clickLng === 'number') {
      setLat(clickLat);
      setLng(clickLng);
      performReverseGeocode(clickLat, clickLng);
    }
  };

  // Detect GPS Real Location with robust two-tier fallback
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      if (userLocation.latitude && userLocation.longitude) {
        setLat(userLocation.latitude);
        setLng(userLocation.longitude);
        setZoom(16);
        performReverseGeocode(userLocation.latitude, userLocation.longitude);
      }
      return;
    }

    setIsDetectingGps(true);

    const onLocationSuccess = (pos: GeolocationPosition) => {
      const gpsLat = pos.coords.latitude;
      const gpsLng = pos.coords.longitude;
      setLat(gpsLat);
      setLng(gpsLng);
      setZoom(17);
      setIsDetectingGps(false);
      performReverseGeocode(gpsLat, gpsLng);
    };

    const onLocationFailure = (err?: GeolocationPositionError) => {
      // Fallback 1: Try low-accuracy standard geolocation (network/wifi)
      navigator.geolocation.getCurrentPosition(
        onLocationSuccess,
        () => {
          // Fallback 2: Use user's active community location
          setIsDetectingGps(false);
          if (userLocation.latitude && userLocation.longitude) {
            setLat(userLocation.latitude);
            setLng(userLocation.longitude);
            setZoom(16);
            performReverseGeocode(userLocation.latitude, userLocation.longitude);
          }
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
      );
    };

    navigator.geolocation.getCurrentPosition(
      onLocationSuccess,
      onLocationFailure,
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
    );
  };

  // Submit confirmed check-in
  const handleConfirm = () => {
    if (!placeName.trim()) {
      alert('กรุณากรอกหรือเลือกชื่อสถานที่');
      return;
    }

    const checkIn: CheckInLocation = {
      placeName: placeName.trim(),
      latitude: lat,
      longitude: lng,
      category,
      subdistrict: subdistrict.trim() || undefined,
      district: district.trim() || undefined,
      province: province.trim() || undefined,
      address: address.trim() || undefined,
      isGps: true
    };

    onSelectCheckIn(checkIn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 text-slate-900">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <MapPin size={22} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                เช็คอินและปักหมุดจุดที่อยู่
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                ค้นหาสถานที่ หรือแตะบนแผนที่เพื่อปักหมุดพิกัดจริง
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
          
          {/* 1. Live Search Bar */}
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
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="ค้นหาร้านอาหาร, คาเฟ่, ตลาด, ย่าน, หรือเมืองทั่วโลก..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-100 focus:bg-white border border-slate-200 rounded-2xl text-[13px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-xs"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete suggestions dropdown if search is typed */}
          {searchText.trim().length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 max-h-48 overflow-y-auto divide-y divide-slate-100 space-y-1 shadow-sm">
              <div className="text-[10.5px] font-extrabold text-slate-400 px-2 py-1 flex items-center justify-between">
                <span>ผลการค้นหาสถานที่</span>
                {isSearchingGlobal && <span className="text-emerald-600">กำลังค้นหาทั่วโลก...</span>}
              </div>
              {searchSuggestions.length === 0 && !isSearchingGlobal ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  ไม่พบสถานที่ตรงกับคำค้นหา ลองแตะปักหมุดบนแผนที่ด้านล่างได้เลย
                </div>
              ) : (
                searchSuggestions.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSuggestion(item)}
                    className="p-2 rounded-xl hover:bg-emerald-50/80 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 group-hover:border-emerald-300 group-hover:text-emerald-600">
                        {item.flag ? <span className="text-xs">{item.flag}</span> : <MapPin size={14} />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[12.5px] font-extrabold text-slate-800 group-hover:text-emerald-800 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] font-medium text-slate-400 truncate">
                          {item.description || `${item.subdistrict ? `ต.${item.subdistrict} ` : ''}${item.district ? `อ.${item.district} ` : ''}${item.province || ''}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg shrink-0 ml-2">
                      เลือกหมุดนี้
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Quick GPS Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isDetectingGps}
              className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors active:scale-98 shadow-xs"
            >
              {isDetectingGps ? (
                <Loader2 size={15} className="animate-spin text-emerald-600" />
              ) : (
                <Navigation size={15} className="text-emerald-600 fill-emerald-600" />
              )}
              <span>{isDetectingGps ? 'กำลังค้นหา GPS...' : '📍 ใช้พิกัดปัจจุบันของฉัน (GPS)'}</span>
            </button>
          </div>

          {/* 2. Interactive Mini-Map Pinning Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-52 bg-slate-100 shadow-inner group">
            <APIProvider apiKey={apiKey}>
              <Map
                center={{ lat, lng }}
                zoom={zoom}
                onClick={handleMapClick}
                disableDefaultUI={true}
                gestureHandling={'greedy'}
                className="w-full h-full"
              >
                <MapCameraSync center={{ lat, lng }} zoom={zoom} />
                <Marker 
                  position={{ lat, lng }} 
                  title={placeName}
                />
              </Map>
            </APIProvider>

            {/* Tap on map hint */}
            <div className="absolute top-2 left-2 right-2 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center justify-between pointer-events-none shadow-md border border-white/10">
              <span className="flex items-center gap-1.5">
                <Compass size={13} className="text-emerald-400 animate-spin" />
                <span>แตะจุดใดก็ได้บนแผนที่เพื่อย้ายหมุด</span>
              </span>
              <span className="text-[9.5px] font-mono text-emerald-300">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            </div>

            {/* Reverse Geocoding indicator */}
            {isReverseGeocoding && (
              <div className="absolute bottom-2 left-2 right-2 bg-emerald-600/90 text-white text-[11px] font-bold px-3 py-1 rounded-xl flex items-center justify-center gap-1.5 shadow-md">
                <Loader2 size={13} className="animate-spin" />
                <span>กำลังระบุชื่อสถานที่จากพิกัด...</span>
              </div>
            )}
          </div>

          {/* 3. Place Category Selection */}
          <div>
            <label className="block text-[11.5px] font-extrabold text-slate-700 mb-1.5">
              ประเภทสถานที่เช็คอิน
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map(cat => {
                const isSelected = category === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-xl text-[11.5px] font-extrabold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={14} className={isSelected ? 'text-emerald-400' : 'text-slate-500'} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Place Details Input */}
          <div className="space-y-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-150">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-600 mb-1">
                ชื่อสถานที่เช็คอิน *
              </label>
              <input
                type="text"
                required
                value={placeName}
                onChange={e => setPlaceName(e.target.value)}
                placeholder="เช่น ร้านกาแฟ Slow Bar ซอย 3, ตลาดนัดเสนานิคม..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-500 mb-0.5">
                  ตำบล / แขวง
                </label>
                <input
                  type="text"
                  value={subdistrict}
                  onChange={e => setSubdistrict(e.target.value)}
                  placeholder="ตำบล/แขวง"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-bold text-slate-500 mb-0.5">
                  อำเภอ / เขต
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="อำเภอ/เขต"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-150 bg-white flex gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-[13.5px] hover:bg-slate-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13.5px] shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Check size={16} strokeWidth={3} />
            ยืนยันปักหมุดเช็คอิน
          </button>
        </div>

      </div>
    </div>
  );
}
