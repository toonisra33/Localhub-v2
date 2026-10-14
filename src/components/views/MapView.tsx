import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  AlertTriangle,
  Radio,
  ShoppingBag,
  Layers,
  Navigation,
  Search,
  Plus,
  Filter,
  Maximize2,
  ExternalLink,
  Users,
  Compass,
  Phone,
  CheckCircle2,
  X,
  RefreshCw,
  Eye,
  MessageSquare
} from 'lucide-react';
import L from 'leaflet';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';
import { THAI_PROVINCE_COORDINATES } from '../../data/thaiData';
import { AlertReport, Post, MarketItem } from '../../types';

export const MapView: React.FC = () => {
  const {
    location,
    alerts,
    posts,
    marketItems,
    openLocationModal,
    showToast,
    requestRealLocation,
    isLocatingGps,
    setActiveTab,
    openPostDetail
  } = useCommunity();
  const { broadcasts } = useBroadcast();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'alerts' | 'posts' | 'market'>('all');
  const [selectedRadius, setSelectedRadius] = useState<'1' | '5' | '10' | 'district' | 'province'>('5');
  const [mapTileType, setMapTileType] = useState<'osm' | 'satellite' | 'carto'>('osm');

  // Currently inspected real point
  const [activeInspection, setActiveInspection] = useState<{
    id: string;
    type: 'user' | 'alert' | 'post' | 'market';
    title: string;
    subtitle: string;
    desc: string;
    lat: number;
    lng: number;
    extra?: any;
  } | null>(null);

  // Helper to resolve coordinates
  const getItemCoords = (
    id: string,
    province?: string,
    explicitCoords?: { lat?: number; lng?: number }
  ): [number, number] => {
    if (explicitCoords?.lat && explicitCoords?.lng && !isNaN(explicitCoords.lat)) {
      return [explicitCoords.lat, explicitCoords.lng];
    }
    const prov = province || location.province || 'กรุงเทพมหานคร';
    const base = THAI_PROVINCE_COORDINATES[prov] || { lat: 13.7563, lng: 100.5018 };
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash << 5) - hash + id.charCodeAt(i);
    const offsetLat = (((hash % 100) - 50) / 1000);
    const offsetLng = ((((hash >> 3) % 100) - 50) / 1000);
    return [base.lat + offsetLat, base.lng + offsetLng];
  };

  const getRadiusInMeters = (): number => {
    switch (selectedRadius) {
      case '1': return 1000;
      case '5': return 5000;
      case '10': return 10000;
      case 'district': return 25000;
      case 'province': return 60000;
      default: return 5000;
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = location.lat && !isNaN(location.lat) ? location.lat : 13.7563;
    const initialLng = location.lng && !isNaN(location.lng) ? location.lng : 100.5018;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Tile layer setup
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    });
    tileLayer.addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when user switches style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    if (mapTileType === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapTileType === 'carto') {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }

    L.tileLayer(url, { maxZoom: 19 }).addTo(map);
  }, [mapTileType]);

  // Update Markers and User GPS pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const userLat = location.lat && !isNaN(location.lat) ? location.lat : 13.7563;
    const userLng = location.lng && !isNaN(location.lng) ? location.lng : 100.5018;

    // 1. User Real GPS Marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
            <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const userMarker = L.marker([userLat, userLng], { icon: userIcon });
    userMarker.on('click', () => {
      setActiveInspection({
        id: 'user-gps',
        type: 'user',
        title: '📍 ตำแหน่ง GPS ปัจจุบันของคุณ',
        subtitle: location.displayName || `จ.${location.province}`,
        desc: location.addressDetails || `พิกัดจริง: ${userLat.toFixed(5)}, ${userLng.toFixed(5)}`,
        lat: userLat,
        lng: userLng
      });
    });
    markersGroup.addLayer(userMarker);
    userMarkerRef.current = userMarker;

    // User Radius Circle
    const radiusMeters = getRadiusInMeters();
    const radiusCircle = L.circle([userLat, userLng], {
      radius: radiusMeters,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: '4, 4'
    });
    markersGroup.addLayer(radiusCircle);
    userCircleRef.current = radiusCircle;

    // 2. Real Emergency Alerts Pins
    if (activeFilter === 'all' || activeFilter === 'alerts') {
      alerts.forEach((alert) => {
        const [lat, lng] = getItemCoords(alert.id, alert.province, alert.coordinates);
        const isCritical = alert.severity === 'critical' || alert.severity === 'high';

        const alertIcon = L.divIcon({
          className: 'custom-alert-marker',
          html: `
            <div class="relative group cursor-pointer">
              <div class="w-8 h-8 rounded-2xl ${isCritical ? 'bg-red-600 animate-pulse' : 'bg-amber-600'} text-white shadow-xl border-2 border-white flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white text-[9px] font-black text-red-600 flex items-center justify-center shadow">!</div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([lat, lng], { icon: alertIcon });
        marker.on('click', () => {
          setActiveInspection({
            id: alert.id,
            type: 'alert',
            title: alert.title,
            subtitle: `🚨 รายงานเหตุ: ${alert.province} • ผู้รายงาน: ${alert.reporter}`,
            desc: alert.description,
            lat,
            lng,
            extra: alert
          });
        });
        markersGroup.addLayer(marker);
      });
    }

    // 3. Real Community Posts Pins
    if (activeFilter === 'all' || activeFilter === 'posts') {
      posts.forEach((post) => {
        const [lat, lng] = getItemCoords(post.id, post.location.province, post.coordinates);

        const postIcon = L.divIcon({
          className: 'custom-post-marker',
          html: `
            <div class="w-7 h-7 rounded-2xl bg-emerald-600 text-white shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([lat, lng], { icon: postIcon });
        marker.on('click', () => {
          setActiveInspection({
            id: post.id,
            type: 'post',
            title: post.title,
            subtitle: `💬 ฟีดชุมชน: โดย ${post.author} (${post.location.province})`,
            desc: post.content,
            lat,
            lng,
            extra: post
          });
        });
        markersGroup.addLayer(marker);
      });
    }

    // 4. Real Market Items Pins
    if (activeFilter === 'all' || activeFilter === 'market') {
      marketItems.forEach((item) => {
        const [lat, lng] = getItemCoords(item.id, item.province, item.coordinates);

        const marketIcon = L.divIcon({
          className: 'custom-market-marker',
          html: `
            <div class="w-7 h-7 rounded-2xl bg-amber-500 text-white shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([lat, lng], { icon: marketIcon });
        marker.on('click', () => {
          setActiveInspection({
            id: item.id,
            type: 'market',
            title: item.title,
            subtitle: `🛍️ ตลาดนัด: ราคา ฿${item.price.toLocaleString()} • ผู้ขาย: ${item.seller}`,
            desc: item.description,
            lat,
            lng,
            extra: item
          });
        });
        markersGroup.addLayer(marker);
      });
    }
  }, [location, alerts, posts, marketItems, activeFilter, selectedRadius]);

  // Pan map when location changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (location.lat && location.lng && !isNaN(location.lat)) {
      mapInstanceRef.current.flyTo([location.lat, location.lng], 14, { duration: 1.2 });
    }
  }, [location.lat, location.lng]);

  // Handle Search for Real Places (Geocoding via Nominatim)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    showToast(`🔍 กำลังค้นหาพิกัดจริงของ "${searchQuery}"...`, 'info');

    try {
      const q = encodeURIComponent(searchQuery.trim());
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&accept-language=th,en`);
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);
          const name = results[0].display_name;

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.5 });
          }

          setActiveInspection({
            id: 'search-result',
            type: 'user',
            title: searchQuery,
            subtitle: 'พิกัดจากการค้นหาจริงบนแผนที่โลก',
            desc: name,
            lat,
            lng
          });

          showToast(`📍 พบตำแหน่ง: ${searchQuery}`, 'success');
        } else {
          showToast('ไม่พบตำแหน่งที่ระบุ กรุณาลองใช้ชื่ออื่น', 'error');
        }
      }
    } catch {
      showToast('ไม่สามารถเชื่อมต่อระบบค้นหาพิกัดได้', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Fly directly to device GPS
  const handleFlyToGps = async () => {
    await requestRealLocation();
    if (location.lat && location.lng && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([location.lat, location.lng], 15, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-3 max-w-4xl mx-auto animate-fadeIn pb-14">
      {/* 1. Header Bar with Real GPS status */}
      <div className="bg-slate-950 text-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-800 shadow-lg flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shrink-0">
            <MapPin className="w-4 h-4 text-slate-950" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
              <span>แผนที่ดาวเทียม & พิกัดสดจริง</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-400/30">
                LIVE 100%
              </span>
            </span>
            <p className="text-[10px] text-slate-400 truncate hidden xs:block">
              {location.lat && location.lng ? `พิกัดจริง: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} • ${location.displayName || location.province}` : 'ตรวจจับตำแหน่ง GPS จริง'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleFlyToGps}
            disabled={isLocatingGps}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-sm active:scale-95"
            title="ค้นหาตำแหน่ง GPS ปัจจุบัน"
          >
            <Navigation className={`w-3.5 h-3.5 fill-white ${isLocatingGps ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">ตำแหน่ง GPS ฉัน</span>
          </button>

          <button
            onClick={openLocationModal}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shrink-0"
          >
            <span>เปลี่ยนพื้นที่</span>
          </button>
        </div>
      </div>

      {/* 2. Real Search & Geocoding Bar */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาพิกัดจริง เช่น เชียงใหม่, สยาม, ลาดยาว, Tokyo..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-xs"
        >
          {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          <span>ค้นหาพิกัด</span>
        </button>
      </form>

      {/* 3. Filter Chips: All, Alerts, Feed, Market */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ทั้งหมด ({alerts.length + posts.length + marketItems.length + 1})
        </button>

        <button
          onClick={() => setActiveFilter('alerts')}
          className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-1 ${
            activeFilter === 'alerts'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>🚨 รายงานเหตุฉุกเฉิน ({alerts.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('posts')}
          className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-1 ${
            activeFilter === 'posts'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>💬 ฟีดชุมชน ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('market')}
          className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-1 ${
            activeFilter === 'market'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🛍️ ตลาดนัด ({marketItems.length})</span>
        </button>
      </div>

      {/* 4. Real Interactive Leaflet Map Container */}
      <div className="relative w-full h-[460px] sm:h-[520px] rounded-3xl overflow-hidden border border-slate-300 shadow-xl bg-slate-100">
        {/* Leaflet DOM Anchor */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Right Floating Map Control Panel */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-2">
          {/* Zoom In */}
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-200"
            title="ซูมเข้า (+)"
          >
            <Plus className="w-5 h-5 font-bold" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-200"
            title="ซูมออก (-)"
          >
            <span className="text-xl font-black leading-none">−</span>
          </button>

          {/* GPS Recenter */}
          <button
            onClick={handleFlyToGps}
            className="w-10 h-10 bg-slate-900/90 hover:bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-700"
            title="ตำแหน่ง GPS จริงของฉัน"
          >
            <Navigation className={`w-4 h-4 fill-emerald-400 ${isLocatingGps ? 'animate-spin' : ''}`} />
          </button>

          {/* Tile Layer Switcher: Street / Satellite / Carto */}
          <button
            onClick={() => {
              const next = mapTileType === 'osm' ? 'satellite' : mapTileType === 'satellite' ? 'carto' : 'osm';
              setMapTileType(next);
              showToast(`สลับโหมดแผนที่: ${next === 'satellite' ? 'ภาพถ่ายดาวเทียม' : next === 'carto' ? 'คอนทราสต์ชัดเจน' : 'มาตรฐาน OpenStreetMap'}`, 'info');
            }}
            className="w-10 h-10 bg-slate-900/90 hover:bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-700"
            title="เปลี่ยนมุมมองแผนที่ (ดาวเทียม/ถนน)"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        {/* Selected Real Pin Detail Card Popup */}
        {activeInspection && (
          <div className="absolute top-4 left-4 right-16 sm:right-auto sm:max-w-sm z-30 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200 space-y-2 animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                activeInspection.type === 'alert'
                  ? 'bg-red-100 text-red-700'
                  : activeInspection.type === 'market'
                  ? 'bg-amber-100 text-amber-800'
                  : activeInspection.type === 'post'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {activeInspection.type === 'alert'
                  ? 'เหตุฉุกเฉินจริง'
                  : activeInspection.type === 'market'
                  ? 'สินค้าในตลาด'
                  : activeInspection.type === 'post'
                  ? 'โพสต์ในชุมชน'
                  : 'ตำแหน่ง GPS'}
              </span>
              <button
                onClick={() => setActiveInspection(null)}
                className="text-slate-400 hover:text-slate-700 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{activeInspection.title}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{activeInspection.subtitle}</p>
            </div>

            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
              {activeInspection.desc}
            </p>

            {/* Real Actions & Links */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {/* Direct Open in Google Maps Navigation */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${activeInspection.lat},${activeInspection.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs text-center"
              >
                <Navigation className="w-3 h-3 fill-white" />
                <span>นำทาง GPS</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>

              {/* Jump to Alert View if type is alert */}
              {activeInspection.type === 'alert' && (
                <button
                  onClick={() => {
                    setActiveTab('alerts');
                  }}
                  className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>ดูเหตุการณ์</span>
                </button>
              )}

              {/* Open Post detail if type is post */}
              {activeInspection.type === 'post' && (
                <button
                  onClick={() => {
                    openPostDetail(activeInspection.id);
                  }}
                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>อ่านโพสต์</span>
                </button>
              )}

              {/* Jump to Market if type is market */}
              {activeInspection.type === 'market' && (
                <button
                  onClick={() => {
                    setActiveTab('market');
                  }}
                  className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>ไปตลาด</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 5. Bottom Radius Selection Pill Bar */}
        <div className="absolute bottom-3 left-2 right-2 sm:bottom-4 sm:left-6 sm:right-6 z-20">
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1 sm:p-1.5 text-white shadow-2xl flex items-center justify-between text-xs gap-1">
            <button
              onClick={() => setSelectedRadius('1')}
              className={`flex-1 py-1.5 sm:py-2 text-center rounded-xl font-bold transition text-[10px] sm:text-xs ${
                selectedRadius === '1' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              1 กม.
            </button>
            <button
              onClick={() => setSelectedRadius('5')}
              className={`flex-1 py-1.5 sm:py-2 text-center rounded-xl font-bold transition text-[10px] sm:text-xs ${
                selectedRadius === '5' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              5 กม.
            </button>
            <button
              onClick={() => setSelectedRadius('10')}
              className={`flex-1 py-1.5 sm:py-2 text-center rounded-xl font-bold transition text-[10px] sm:text-xs ${
                selectedRadius === '10' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              10 กม.
            </button>
            <button
              onClick={() => setSelectedRadius('district')}
              className={`flex-1 py-1.5 sm:py-2 text-center rounded-xl font-bold transition text-[9px] sm:text-[11px] leading-tight truncate px-1 ${
                selectedRadius === 'district' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              ทั้งอำเภอ
            </button>
            <button
              onClick={() => setSelectedRadius('province')}
              className={`flex-1 py-1.5 sm:py-2 text-center rounded-xl font-bold transition text-[9px] sm:text-[11px] leading-tight truncate px-1 ${
                selectedRadius === 'province' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              ทั้งจังหวัด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
