import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  APIProvider, 
  Map, 
  Marker, 
  useMap
} from '@vis.gl/react-google-maps';
import { 
  Layers, 
  Filter, 
  Search, 
  MapPin, 
  Compass, 
  Navigation, 
  Plus, 
  Crosshair, 
  Star, 
  AlertTriangle, 
  Utensils, 
  Store, 
  Calendar, 
  Car, 
  Check, 
  X,
  ExternalLink,
  Key,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { MapFilterModal } from './modals/MapFilterModal';
import { PlaceDetailModal, MapPoint } from './modals/PlaceDetailModal';
import { AddCustomPinModal } from './modals/AddCustomPinModal';
import { LocalHubLogo } from './LocalHubLogo';
import { MapSearchAutocomplete, AutocompleteResult } from './MapSearchAutocomplete';

// Helper function to calculate geodesic distance in km/meters
function calculateDistanceStr(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  if (d < 1) {
    return `${Math.round(d * 1000)} ม.`;
  }
  return `${d.toFixed(1)} กม.`;
}

// Controller component inside Map to handle programmatic camera movement & traffic layer
function GoogleMapController({ 
  center, 
  zoom, 
  showTraffic 
}: { 
  center: { lat: number; lng: number }; 
  zoom: number;
  showTraffic: boolean;
}) {
  const map = useMap();
  const [trafficLayer, setTrafficLayer] = useState<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map) return;
    map.panTo(center);
  }, [map, center.lat, center.lng]);

  useEffect(() => {
    if (!map) return;
    map.setZoom(zoom);
  }, [map, zoom]);

  useEffect(() => {
    if (!map) return;
    try {
      if (showTraffic) {
        if (!trafficLayer && window.google?.maps?.TrafficLayer) {
          const layer = new google.maps.TrafficLayer();
          layer.setMap(map);
          setTrafficLayer(layer);
        } else if (trafficLayer) {
          trafficLayer.setMap(map);
        }
      } else {
        if (trafficLayer) {
          trafficLayer.setMap(null);
        }
      }
    } catch {
      // ignore traffic layer errors if not available
    }
  }, [map, showTraffic]);

  return null;
}

const STORAGE_CUSTOM_PINS_KEY = 'localhub_custom_map_pins';

const INITIAL_REAL_PLACES: MapPoint[] = [
  {
    id: 'p1',
    name: '🚧 ซ่อมผิวจราจรและท่อระบายน้ำ ซ.พหลโยธิน 32',
    type: 'incident',
    lat: 13.8324,
    lng: 100.5752,
    distance: '500 ม.',
    category: 'ปิดถนน/งานก่อสร้าง',
    status: 'กำลังดำเนินการ (เสร็จสิ้น 17:00 น.)',
    description: 'ปิดการจราจรเลนซ้าย ซอยพหลโยธิน 32 ช่วงเสนานิคม โปรดใช้ทางเลี่ยง'
  },
  {
    id: 'p2',
    name: '🍜 ก๋วยเตี๋ยวเรือป้าสมศรี สูตรอยุธยาแท้',
    type: 'food',
    lat: 13.8295,
    lng: 100.5698,
    distance: '1.2 กม.',
    category: 'ร้านอาหาร',
    rating: 4.8,
    phone: '081-999-8877',
    description: 'ก๋วยเตี๋ยวเรือน้ำตกเข้มข้น แคปหมูกรอบ กากหมูเจียวสดใหม่ทุกวัน เปิด 09:00 - 16:30 น.'
  },
  {
    id: 'p3',
    name: '🎪 งานประเพณีและตลาดนัดวัดเสมียนนารี',
    type: 'event',
    lat: 13.8398,
    lng: 100.5521,
    distance: '2.1 กม.',
    category: 'งานวัดและประเพณี',
    status: 'วันนี้ - 22:00 น.',
    description: 'มีร้านค้าชุมชน ชิงช้าสวรรค์ ดนตรีสด และของกินพื้นบ้านกว่า 50 ร้าน'
  },
  {
    id: 'p4',
    name: '🔧 ร้านช่างเอก ซ่อมมอเตอร์ไซค์ & ปะยางด่วน 24 ชม.',
    type: 'shop',
    lat: 13.8262,
    lng: 100.5724,
    distance: '750 ม.',
    category: 'ร้านค้าและบริการ',
    rating: 4.9,
    phone: '089-112-2334',
    description: 'รับซ่อมมอเตอร์ไซค์ทุกยี่ห้อ เปลี่ยนถ่ายน้ำมันเครื่อง ปะยางนอกสถานที่'
  },
  {
    id: 'p5',
    name: '☕ Slow Bar Coffee & Community Space อารีย์',
    type: 'food',
    lat: 13.7801,
    lng: 100.5442,
    distance: '3.4 กม.',
    category: 'ร้านอาหาร/คาเฟ่',
    rating: 4.9,
    phone: '082-345-6789',
    description: 'กาแฟ Specialty คั่วสด มีเมล็ด Single Origin บรรยากาศเงียบสงบ เหมาะสำหรับนั่งทำงาน'
  },
  {
    id: 'p6',
    name: '🌳 สวนจตุจักร & ตลาดนัดสุดสัปดาห์',
    type: 'event',
    lat: 13.8032,
    lng: 100.5539,
    distance: '1.8 กม.',
    category: 'สถานที่พักผ่อน/ตลาดนัด',
    status: 'เปิด 05:00 - 21:00 น.',
    description: 'พื้นที่สีเขียวใจกลางเมือง ออกกำลังกาย วิ่ง ปั่นจักรยาน และจับจ่ายซื้อของ'
  }
];

export function AroundMeMap() {
  const { 
    showToast, 
    openLocationPermissionModal, 
    location, 
    isLocatingGps,
    requestRealLocation,
    posts,
    targetMapLocation,
    setTargetMapLocation
  } = useCommunity();

  const userEnvApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  // Fallback direct key provided for development / testing
  const fallbackKey = 'AIzaSyAbIv0M35oWeTTRnSw-o6Yz4DY6KxiTEQw';
  const rawApiKey = (userEnvApiKey && userEnvApiKey.trim().length > 10 && !userEnvApiKey.includes('MY_KEY')) 
    ? userEnvApiKey 
    : fallbackKey;
  const hasValidApiKey = Boolean(rawApiKey && rawApiKey.trim().length > 10);

  // Center coordinate state (default: Bangkok / User location)
  const defaultCenter = useMemo(() => ({
    lat: location.latitude || 13.8305,
    lng: location.longitude || 100.5695
  }), [location.latitude, location.longitude]);

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(defaultCenter);
  const [mapZoom, setMapZoom] = useState<number>(14);
  const [mapTypeId, setMapTypeId] = useState<google.maps.MapTypeId | 'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [googleMapsError, setGoogleMapsError] = useState<boolean>(false);

  // Filter and Search states
  const [radius, setRadius] = useState<string>('5km');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showLayersModal, setShowLayersModal] = useState<boolean>(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  // Pinning & Selection states
  const [selectedPlace, setSelectedPlace] = useState<MapPoint | null>(null);
  const [isPinningMode, setIsPinningMode] = useState<boolean>(false);
  const [pendingPinCoords, setPendingPinCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showAddPinModal, setShowAddPinModal] = useState<boolean>(false);

  // Custom Pinned places stored in localStorage
  const [customPins, setCustomPins] = useState<MapPoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_PINS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync custom pins to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CUSTOM_PINS_KEY, JSON.stringify(customPins));
    } catch (e) {
      console.error('Failed to save pins to localStorage', e);
    }
  }, [customPins]);

  // Jump to target map location when requested from outside (e.g. from a post check-in click)
  useEffect(() => {
    if (targetMapLocation) {
      setMapCenter({ lat: targetMapLocation.lat, lng: targetMapLocation.lng });
      if (targetMapLocation.zoom) {
        setMapZoom(targetMapLocation.zoom);
      }
      if (targetMapLocation.label) {
        showToast(`📍 ปักหมุด: ${targetMapLocation.label}`);
      }
    }
  }, [targetMapLocation, showToast]);

  // Convert check-in posts into map pins
  const checkInMapPoints: MapPoint[] = useMemo(() => {
    return posts
      .filter(p => p.checkIn && p.checkIn.latitude && p.checkIn.longitude)
      .map(p => ({
        id: `post_checkin_${p.id}`,
        name: `📍 ${p.checkIn!.placeName}`,
        type: (p.checkIn!.category as any) || 'custom',
        lat: p.checkIn!.latitude,
        lng: p.checkIn!.longitude,
        distance: calculateDistanceStr(location.latitude || mapCenter.lat, location.longitude || mapCenter.lng, p.checkIn!.latitude, p.checkIn!.longitude),
        category: p.checkIn!.category === 'restaurant' ? 'ร้านอาหาร/คาเฟ่' : p.checkIn!.category === 'shop' ? 'ร้านค้า/ตลาด' : 'โพสต์เช็คอินชุมชน',
        rating: 5.0,
        description: `💬 โพสต์โดย ${p.author.name}: "${p.content.slice(0, 90)}${p.content.length > 90 ? '...' : ''}"`,
        image: p.images?.[0] || p.image,
        isCustomPin: true
      }));
  }, [posts, location.latitude, location.longitude, mapCenter.lat, mapCenter.lng]);

  // Combine default places with custom pins and check-in posts, updating real-time geodesic distance
  const allMapPoints = useMemo(() => {
    const combined = [...INITIAL_REAL_PLACES, ...customPins, ...checkInMapPoints];
    const userLat = location.latitude || mapCenter.lat;
    const userLng = location.longitude || mapCenter.lng;

    return combined.map(pt => ({
      ...pt,
      distance: calculateDistanceStr(userLat, userLng, pt.lat, pt.lng)
    }));
  }, [customPins, checkInMapPoints, location.latitude, location.longitude, mapCenter.lat, mapCenter.lng]);

  const categories = [
    { id: 'all', label: 'ทั้งหมด', icon: '🌐' },
    { id: 'custom', label: '📌 หมุดของฉัน', count: customPins.length, color: 'bg-indigo-500' },
    { id: 'incident', label: '🚨 เตือนภัย/ซ่อมบำรุง', color: 'bg-rose-500' },
    { id: 'food', label: '🍜 ร้านอาหาร/คาเฟ่', color: 'bg-amber-500' },
    { id: 'event', label: '🎪 กิจกรรม/งานวัด', color: 'bg-purple-500' },
    { id: 'shop', label: '🛒 ร้านค้า/บริการ', color: 'bg-emerald-500' },
  ];

  const radiuses = [
    { id: '1km', label: '1 กม.' },
    { id: '5km', label: '5 กม.' },
    { id: '10km', label: '10 กม.' },
    { id: 'district', label: 'ทั้งอำเภอ/เขต' },
    { id: 'province', label: 'ทั้งจังหวัด' },
  ];

  const landmarkPresets = [
    { name: '🌍 ภาพรวมโลก (World View)', lat: 20.0, lng: 0.0, zoom: 2 },
    { name: '🇹🇭 กรุงเทพฯ (พหลโยธิน)', lat: 13.8305, lng: 100.5695, zoom: 15 },
    { name: '🇯🇵 โตเกียว (Tokyo)', lat: 35.6762, lng: 139.6503, zoom: 13 },
    { name: '🇫🇷 ปารีส (Paris)', lat: 48.8566, lng: 2.3522, zoom: 13 },
    { name: '🇺🇸 นิวยอร์ก (New York)', lat: 40.7128, lng: -74.0060, zoom: 13 },
    { name: '🇬🇧 ลอนดอน (London)', lat: 51.5074, lng: -0.1278, zoom: 13 },
    { name: '🇸🇬 สิงคโปร์ (Singapore)', lat: 1.3521, lng: 103.8198, zoom: 13 },
    { name: '🇦🇺 ซิดนีย์ (Sydney)', lat: -33.8688, lng: 151.2093, zoom: 13 },
    { name: '🇦🇪 ดูไบ (Dubai)', lat: 25.2048, lng: 55.2708, zoom: 13 },
    { name: '📍 เชียงใหม่ (นิมมาน)', lat: 18.7961, lng: 98.9686, zoom: 15 },
    { name: '📍 ภูเก็ต (เมืองเก่า)', lat: 7.8841, lng: 98.3904, zoom: 15 },
  ];

  // Filter map points
  const filteredPoints = useMemo(() => {
    return allMapPoints.filter(point => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        point.name.toLowerCase().includes(q) ||
        point.category.toLowerCase().includes(q) ||
        (point.description && point.description.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (activeCategory === 'all') return true;
      if (activeCategory === 'custom') return point.isCustomPin === true;
      if (activeCategory === 'event') return point.type === 'event' || point.category.includes('งาน') || point.category.includes('กิจกรรม');
      return point.type === activeCategory;
    });
  }, [allMapPoints, searchQuery, activeCategory]);

  // Handle map click on Google Map
  const handleGoogleMapClick = (e: any) => {
    if (e.detail?.latLng) {
      const clickedLat = e.detail.latLng.lat;
      const clickedLng = e.detail.latLng.lng;
      setPendingPinCoords({ lat: clickedLat, lng: clickedLng });
      setShowAddPinModal(true);
      setIsPinningMode(false);
      showToast(`📍 เลือกพิกัด: ${clickedLat.toFixed(4)}, ${clickedLng.toFixed(4)}`);
    }
  };

  // Add new pin
  const handleSaveNewPin = (newPinData: Omit<MapPoint, 'id' | 'distance'>) => {
    const newPin: MapPoint = {
      ...newPinData,
      id: `custom_pin_${Date.now()}`,
      distance: calculateDistanceStr(
        location.latitude || mapCenter.lat, 
        location.longitude || mapCenter.lng, 
        newPinData.lat, 
        newPinData.lng
      )
    };

    setCustomPins(prev => [newPin, ...prev]);
    setSelectedPlace(newPin);
    setMapCenter({ lat: newPin.lat, lng: newPin.lng });
    showToast(`✅ ปักหมุด "${newPin.name}" ลงในแผนที่เรียบร้อยแล้ว!`);
  };

  // Delete pin
  const handleDeletePin = (pinId: string) => {
    setCustomPins(prev => prev.filter(p => p.id !== pinId));
    if (selectedPlace?.id === pinId) {
      setSelectedPlace(null);
    }
  };

  // Jump to landmark
  const handleJumpToLandmark = (preset: typeof landmarkPresets[0]) => {
    setMapCenter({ lat: preset.lat, lng: preset.lng });
    setMapZoom(preset.zoom || 15);
    showToast(`🗺️ เลื่อนแผนที่ไปยัง: ${preset.name}`);
  };

  // Locate user GPS
  const handleGpsCenter = async () => {
    const success = await requestRealLocation();
    if (success && location.latitude && location.longitude) {
      setMapCenter({ lat: location.latitude, lng: location.longitude });
      setMapZoom(16);
      showToast('🎯 ปักหมุดที่พิกัด GPS ปัจจุบันของคุณแล้ว');
    } else {
      openLocationPermissionModal();
    }
  };

  // Handle selection from Google Maps-style autocomplete suggestions
  const handleSelectAutocompleteResult = (result: AutocompleteResult) => {
    setMapCenter({ lat: result.lat, lng: result.lng });
    setMapZoom(result.zoomLevel || 16);

    if (result.rawPlace) {
      setSelectedPlace(result.rawPlace);
      showToast(`📍 พบ "${result.title}"`);
    } else if (result.rawArea) {
      showToast(`🗺️ เลื่อนแผนที่ไปยัง: ${result.title}`);
    } else {
      showToast(`🗺️ นำทางไปยัง: ${result.title}`);
    }
  };

  // Start pinning at center
  const handleStartPinningAtCenter = () => {
    setPendingPinCoords({ lat: mapCenter.lat, lng: mapCenter.lng });
    setShowAddPinModal(true);
  };

  // Calculate SVG Marker Icons for Google Maps Classic Marker
  const getMarkerIcon = useCallback((pt: MapPoint, isSelected: boolean) => {
    let fillColor = '#10b981';
    let strokeColor = '#047857';

    if (pt.type === 'incident') {
      fillColor = '#f43f5e';
      strokeColor = '#be123c';
    } else if (pt.type === 'food') {
      fillColor = '#f59e0b';
      strokeColor = '#b45309';
    } else if (pt.type === 'event') {
      fillColor = '#a855f7';
      strokeColor = '#7e22ce';
    } else if (pt.type === 'shop') {
      fillColor = '#06b6d4';
      strokeColor = '#0e7490';
    } else if (pt.isCustomPin) {
      fillColor = '#6366f1';
      strokeColor = '#4338ca';
    }

    if (typeof window !== 'undefined' && window.google?.maps) {
      return {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: fillColor,
        fillOpacity: 1,
        strokeColor: strokeColor,
        strokeWeight: 2,
        scale: isSelected ? 1.6 : 1.2,
        anchor: new window.google.maps.Point(12, 22)
      };
    }
    return undefined;
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col pb-16 bg-slate-900 relative select-none">
      
      {/* Top Search & Filter Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 pt-7 pb-3 px-3.5 z-20 pointer-events-none">
        <div className="pointer-events-auto space-y-2">
          
          {/* Brand header pill */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700/70 shadow-lg">
            <LocalHubLogo size="sm" variant="dark" showSubtitle={false} />
            
            <div className="flex items-center gap-1.5">
              {hasValidApiKey && !googleMapsError ? (
                <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Google Maps สด
                </span>
              ) : (
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="text-[10.5px] font-extrabold text-amber-300 bg-amber-950/80 hover:bg-amber-900/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1 transition-colors"
                >
                  <Key size={11} />
                  <span>ใส่ Maps API Key</span>
                </button>
              )}
              
              <button
                onClick={() => setShowLayersModal(true)}
                title="เปลี่ยนมุมมองแผนที่"
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-[11px] font-extrabold flex items-center gap-1 transition-all"
              >
                <Layers size={13} />
                <span className="capitalize">
                  {mapTypeId === 'hybrid' ? 'ดาวเทียม+ถนน' : mapTypeId === 'satellite' ? 'ดาวเทียม' : mapTypeId === 'terrain' ? 'ภูมิประเทศ' : 'แผนที่'}
                </span>
              </button>
            </div>
          </div>

          {/* Search Box + Actions */}
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <MapSearchAutocomplete
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                allMapPoints={allMapPoints}
                userLat={location.latitude || mapCenter.lat}
                userLng={location.longitude || mapCenter.lng}
                onSelectResult={handleSelectAutocompleteResult}
                onClear={() => setSearchQuery('')}
                placeholder="ค้นหาพื้นที่, ตำบล, ร้านอาหาร, จุดเตือนภัย..."
              />
            </div>

            {/* Pin Location Button */}
            <button 
              onClick={() => {
                setIsPinningMode(!isPinningMode);
                showToast(isPinningMode ? 'ปิดโหมดปักหมุด' : '📍 แตะที่ใดก็ได้บนแผนที่ หรือกดปุ่มปักหมุดเพื่อเพิ่มสถานที่');
              }}
              title="ปักหมุดสถานที่ใหม่"
              className={`px-3 py-2.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-lg border transition-all active:scale-95 text-[12px] font-extrabold shrink-0 ${
                isPinningMode
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/30 animate-pulse'
                  : 'bg-slate-900/90 text-white hover:bg-slate-800 border-slate-700 backdrop-blur-xl'
              }`}
            >
              <Plus size={16} className={isPinningMode ? 'rotate-45 transition-transform' : ''} />
              <span>{isPinningMode ? 'แตะบนแผนที่' : 'ปักหมุด'}</span>
            </button>

            {/* Filter Modal Button */}
            <button 
              onClick={() => setShowFilterModal(true)}
              title="ตัวกรอง"
              className="w-11 h-11 bg-white/95 backdrop-blur-xl rounded-2xl flex items-center justify-center text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all shrink-0"
            >
              <Filter size={17} />
            </button>
          </div>

          {/* Categories Horizontal Scrolling Pills */}
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
            {categories.map(cat => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-[11.5px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-md border ${
                    isSelected 
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30' 
                      : 'bg-slate-900/85 backdrop-blur-md border-slate-700 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat.color && <span className={`w-2 h-2 rounded-full ${cat.color}`} />}
                  <span>{cat.label}</span>
                  {cat.count !== undefined && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                      {cat.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Landmark Presets Pills */}
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
            {landmarkPresets.map((lm, idx) => (
              <button
                key={idx}
                onClick={() => handleJumpToLandmark(lm)}
                className="px-2.5 py-0.5 rounded-lg bg-slate-900/75 hover:bg-slate-800 text-[10.5px] font-semibold text-slate-300 border border-slate-700/60 whitespace-nowrap backdrop-blur-sm transition-all"
              >
                {lm.name}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Pinning Mode Active Banner */}
      {isPinningMode && (
        <div className="absolute top-44 left-1/2 -translate-x-1/2 z-30 bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-2 text-[12px] font-extrabold animate-bounce">
          <MapPin size={16} />
          <span>แตะจุดใดก็ได้บนแผนที่เพื่อปักหมุด หรือ</span>
          <button 
            onClick={handleStartPinningAtCenter}
            className="bg-white text-emerald-900 px-2 py-0.5 rounded-lg hover:bg-emerald-50 active:scale-95"
          >
            ปักตรงนี้
          </button>
          <button onClick={() => setIsPinningMode(false)} className="p-0.5 hover:bg-emerald-700 rounded-full">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Map Container */}
      <div className="w-full h-full relative overflow-hidden bg-slate-950">
        
        {hasValidApiKey && !googleMapsError ? (
          /* Google Maps Platform Live Rendering (Without invalid Map ID to prevent ApiProjectMapError) */
          <APIProvider 
            apiKey={rawApiKey}
            onLoad={() => setGoogleMapsError(false)}
            onError={() => setGoogleMapsError(true)}
          >
            <Map
              defaultCenter={defaultCenter}
              defaultZoom={mapZoom}
              mapTypeId={mapTypeId}
              gestureHandling="greedy"
              disableDefaultUI={false}
              onClick={handleGoogleMapClick}
              className="w-full h-full"
              style={{ width: '100%', height: '100%' }}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
              {/* Dynamic Camera & Traffic Sync Controller */}
              <GoogleMapController 
                center={mapCenter} 
                zoom={mapZoom} 
                showTraffic={showTraffic} 
              />

              {/* User GPS Location Marker */}
              {location.latitude && location.longitude && (
                <Marker
                  position={{ lat: location.latitude, lng: location.longitude }}
                  title="พิกัดของคุณ (GPS)"
                  zIndex={100}
                />
              )}

              {/* Interactive Points on Google Maps */}
              {filteredPoints.map((pt) => {
                const isSelected = selectedPlace?.id === pt.id;
                return (
                  <Marker
                    key={pt.id}
                    position={{ lat: pt.lat, lng: pt.lng }}
                    onClick={() => setSelectedPlace(pt)}
                    title={pt.name}
                    zIndex={isSelected ? 50 : 10}
                    icon={getMarkerIcon(pt, isSelected)}
                  />
                );
              })}
            </Map>
          </APIProvider>
        ) : (
          /* High-Performance Interactive Map View (Active in Dev/Preview without key or when key is loading) */
          <div 
            onClick={(e) => {
              if (isPinningMode) {
                const rect = e.currentTarget.getBoundingClientRect();
                const xRatio = (e.clientX - rect.left) / rect.width;
                const yRatio = (e.clientY - rect.top) / rect.height;
                // Calculate lat/lng based on bounding box
                const newLng = mapCenter.lng + (xRatio - 0.5) * (0.08 * (16 / mapZoom));
                const newLat = mapCenter.lat - (yRatio - 0.5) * (0.06 * (16 / mapZoom));
                setPendingPinCoords({ lat: newLat, lng: newLng });
                setShowAddPinModal(true);
                setIsPinningMode(false);
              }
            }}
            className="w-full h-full relative cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden bg-slate-900"
          >
            {/* Vector Grid Background simulating interactive map tile layer */}
            <div 
              className="absolute inset-0 opacity-40" 
              style={{
                backgroundImage: `
                  radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 65%),
                  linear-gradient(to right, #1e293b 1px, transparent 1px),
                  linear-gradient(to bottom, #1e293b 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 48px 48px, 48px 48px'
              }}
            />

            {/* Map Roads & Rivers Vector Graphics simulation */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
              <path d="M-100 250 Q 300 180, 600 400 T 1200 350" fill="none" stroke="#334155" strokeWidth="18" />
              <path d="M150 -50 Q 250 300, 350 700" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeOpacity="0.4" />
              <path d="M-50 480 Q 400 520, 900 300" fill="none" stroke="#475569" strokeWidth="10" />
              <path d="M200 100 L 700 600" fill="none" stroke="#334155" strokeWidth="6" strokeDasharray="6,6" />
            </svg>

            {/* Simulated Live Traffic overlay when toggled */}
            {showTraffic && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <path d="M-100 250 Q 300 180, 600 400" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="8,4" className="animate-pulse" />
                <path d="M600 400 T 1200 350" fill="none" stroke="#eab308" strokeWidth="4" />
                <path d="M-50 480 Q 400 520, 900 300" fill="none" stroke="#22c55e" strokeWidth="4" />
              </svg>
            )}

            {/* Interactive Pins on vector map */}
            <div className="absolute inset-0 pointer-events-auto">
              {filteredPoints.map((pt, idx) => {
                const isSelected = selectedPlace?.id === pt.id;
                // Project lat/lng offset relative to map center
                const dLng = pt.lng - mapCenter.lng;
                const dLat = pt.lat - mapCenter.lat;
                const zoomFactor = (mapZoom / 14) * 5500;
                const posX = 50 + (dLng * zoomFactor);
                const posY = 50 - (dLat * zoomFactor);

                // Skip if way out of view
                if (posX < -20 || posX > 120 || posY < -20 || posY > 120) return null;

                let pinBg = 'bg-emerald-500 text-white border-emerald-300';
                let iconEmoji = '📌';
                if (pt.type === 'incident') {
                  pinBg = 'bg-rose-500 text-white border-rose-300 shadow-rose-500/50';
                  iconEmoji = '🚨';
                } else if (pt.type === 'food') {
                  pinBg = 'bg-amber-500 text-white border-amber-300 shadow-amber-500/50';
                  iconEmoji = '🍜';
                } else if (pt.type === 'event') {
                  pinBg = 'bg-purple-500 text-white border-purple-300 shadow-purple-500/50';
                  iconEmoji = '🎪';
                } else if (pt.type === 'shop') {
                  pinBg = 'bg-cyan-500 text-white border-cyan-300 shadow-cyan-500/50';
                  iconEmoji = '🛒';
                } else if (pt.isCustomPin) {
                  pinBg = 'bg-indigo-500 text-white border-indigo-300 shadow-indigo-500/50';
                  iconEmoji = '📍';
                }

                return (
                  <div
                    key={pt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlace(pt);
                    }}
                    style={{ left: `${posX}%`, top: `${posY}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 transition-transform active:scale-90"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border-2 shadow-xl flex items-center justify-center text-[14px] transition-all group-hover:scale-125 ${pinBg} ${
                        isSelected ? 'scale-125 ring-4 ring-white shadow-2xl z-20' : ''
                      }`}>
                        {iconEmoji}
                      </div>
                      <div className="mt-1 px-2 py-0.5 bg-slate-950/90 text-white text-[10px] font-extrabold rounded-md shadow-md border border-slate-700 whitespace-nowrap max-w-[120px] truncate group-hover:max-w-none group-hover:scale-105 transition-all">
                        {pt.name}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* User Center / GPS Pin */}
              <div 
                style={{ left: '50%', top: '50%' }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 animate-ping absolute" />
                <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                  📍
                </div>
                <span className="mt-1 bg-emerald-950/90 text-emerald-300 text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-emerald-600/50">
                  จุดศูนย์กลางแผนที่
                </span>
              </div>
            </div>

            {/* Quick zoom buttons on interactive canvas */}
            <div className="absolute top-44 right-4 flex flex-col gap-1.5 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMapZoom(z => Math.min(z + 1, 19));
                }}
                className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 shadow-md"
              >
                <ZoomIn size={15} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMapZoom(z => Math.max(z - 1, 8));
                }}
                className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 shadow-md"
              >
                <ZoomOut size={15} />
              </button>
            </div>

          </div>
        )}

        {/* Center Crosshair Marker when in Pinning Mode */}
        {isPinningMode && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex flex-col items-center">
            <div className="w-10 h-10 border-2 border-emerald-400 border-dashed rounded-full flex items-center justify-center animate-pulse">
              <Crosshair size={22} className="text-emerald-400" />
            </div>
            <span className="mt-1 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700 shadow-lg">
              เลื่อนแผนที่ให้อยู่ตรงกลางจุดที่ต้องการ
            </span>
          </div>
        )}

        {/* Radius Selector Floating Dock at Bottom */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl p-1 rounded-2xl shadow-2xl border border-slate-700/80 flex gap-1 z-10">
          {radiuses.map(rad => (
            <button
              key={rad.id}
              onClick={() => {
                setRadius(rad.id);
                showToast(`🗺️ กรองรัศมีรอบตัว: ${rad.label}`);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-all active:scale-95 ${
                radius === rad.id 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {rad.label}
            </button>
          ))}
        </div>

        {/* Floating Action Quick Controls (Right Side) */}
        <div className="absolute bottom-36 right-4 flex flex-col gap-2 z-10">
          
          {/* Quick Pin at center */}
          <button 
            onClick={handleStartPinningAtCenter}
            title="ปักหมุดสถานที่ ณ ตำแหน่งนี้"
            className="w-11 h-11 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-xl flex items-center justify-center border border-emerald-400 transition-all active:scale-95 group relative"
          >
            <Plus size={20} />
            <span className="absolute right-full mr-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              ปักหมุดสถานที่
            </span>
          </button>

          {/* Traffic Toggle */}
          <button 
            onClick={() => {
              setShowTraffic(!showTraffic);
              showToast(showTraffic ? 'ปิดชั้นข้อมูลการจราจร' : '🚦 เปิดแสดงสภาพการจราจรสด');
            }}
            title="สภาพการจราจร"
            className={`w-11 h-11 rounded-2xl shadow-xl flex items-center justify-center border transition-all active:scale-95 ${
              showTraffic
                ? 'bg-amber-500 text-white border-amber-300 ring-2 ring-amber-400/30'
                : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800 border-slate-700 backdrop-blur-xl'
            }`}
          >
            <Car size={18} />
          </button>

          {/* GPS Location Centering */}
          <button 
            onClick={handleGpsCenter}
            title="ระบุตำแหน่ง GPS ปัจจุบัน"
            className={`w-11 h-11 backdrop-blur-xl rounded-2xl shadow-xl flex items-center justify-center border transition-all active:scale-95 ${
              location.isGps
                ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-500/30'
                : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800 border-slate-700'
            }`}
          >
            <Navigation size={18} className={isLocatingGps ? 'animate-spin' : (location.isGps ? 'text-white' : 'text-emerald-400')} />
          </button>

          {/* Layers Switcher */}
          <button 
            onClick={() => setShowLayersModal(true)}
            title="เปลี่ยนมุมมองแผนที่"
            className="w-11 h-11 bg-slate-900/90 hover:bg-slate-800 text-slate-200 backdrop-blur-xl rounded-2xl shadow-xl flex items-center justify-center border border-slate-700 transition-all active:scale-95"
          >
            <Layers size={18} />
          </button>
        </div>

      </div>

      {/* Layers & Map Types Switcher Modal */}
      {showLayersModal && (
        <div className="fixed inset-0 z-[80] bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] overflow-hidden border border-slate-700 shadow-2xl p-5 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-extrabold text-[15px] flex items-center gap-2">
                <Layers size={16} className="text-emerald-400" />
                <span>ประเภทมุมมองแผนที่</span>
              </h4>
              <button onClick={() => setShowLayersModal(false)} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'roadmap', label: 'แผนที่มาตรฐาน', desc: 'ถนนและชื่อสถานที่ชัดเจน', icon: '🗺️' },
                { id: 'satellite', label: 'ภาพถ่ายดาวเทียม', desc: 'ภาพถ่ายจากอวกาศจริง', icon: '🛰️' },
                { id: 'hybrid', label: 'ดาวเทียม + ถนน', desc: 'ภาพถ่ายพร้อมป้ายชื่อทาง', icon: '🌐' },
                { id: 'terrain', label: 'ภูมิประเทศ', desc: 'แสดงความสูงต่ำและระดับดิน', icon: '⛰️' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMapTypeId(m.id as any);
                    setShowLayersModal(false);
                    showToast(`เปลี่ยนมุมมองแผนที่เป็น: ${m.label}`);
                  }}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                    mapTypeId === m.id
                      ? 'bg-emerald-600/20 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700'
                  }`}
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="font-extrabold text-[12.5px] text-white">{m.label}</span>
                  <span className="text-[10px] text-slate-400 leading-tight">{m.desc}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car size={16} className={showTraffic ? 'text-amber-400' : 'text-slate-500'} />
                <span className="text-[12px] font-bold">แสดงสภาพการจราจรสด (Traffic)</span>
              </div>
              <button
                onClick={() => setShowTraffic(!showTraffic)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${showTraffic ? 'bg-amber-500' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${showTraffic ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Maps API Key Help Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[85] bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden border border-slate-700 shadow-2xl p-5 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Key size={18} />
                <h4 className="font-extrabold text-[15px] text-white">Google Maps API Key</h4>
              </div>
              <button onClick={() => setShowApiKeyModal(false)} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-[12.5px] text-slate-300 leading-relaxed">
              <p>
                ระบบแสดงแผนที่แบบตอบสนองพร้อมทำงานได้ทันที! หากต้องการเปิดใช้ <strong>Google Maps สด</strong> แบบเต็มรูปแบบ:
              </p>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-[12px]">
                <div className="font-mono text-emerald-400 font-bold">
                  VITE_GOOGLE_MAPS_API_KEY
                </div>
                <p className="text-slate-400">
                  1. ไปที่เมนู <strong>Settings</strong> ของแอปพลิเคชัน<br />
                  2. กำหนดค่าตัวแปร <code className="text-amber-300">VITE_GOOGLE_MAPS_API_KEY</code> ด้วย API Key จาก Google Cloud Console
                </p>
              </div>
              <p className="text-[11.5px] text-slate-400">
                💡 ระหว่างนี้ คุณสามารถปักหมุด ค้นหาสถานที่ กรองหมวดหมู่ และนำทางผ่าน Google Maps ได้อย่างสมบูรณ์แบบ
              </p>
            </div>

            <button
              onClick={() => setShowApiKeyModal(false)}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13px] transition-colors"
            >
              เข้าใจแล้ว
            </button>
          </div>
        </div>
      )}

      {/* Filter Modals */}
      {showFilterModal && (
        <MapFilterModal 
          selectedCategory={activeCategory}
          onSelectCategory={(c) => { setActiveCategory(c); setShowFilterModal(false); }}
          onClose={() => setShowFilterModal(false)}
        />
      )}

      {selectedPlace && (
        <PlaceDetailModal 
          place={selectedPlace} 
          onClose={() => setSelectedPlace(null)} 
          onDeletePin={handleDeletePin}
        />
      )}

      {showAddPinModal && (
        <AddCustomPinModal
          initialLat={pendingPinCoords?.lat || mapCenter.lat}
          initialLng={pendingPinCoords?.lng || mapCenter.lng}
          onSavePin={handleSaveNewPin}
          onClose={() => {
            setShowAddPinModal(false);
            setPendingPinCoords(null);
          }}
        />
      )}

    </div>
  );
}
