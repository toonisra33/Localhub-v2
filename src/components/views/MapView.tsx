import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  AlertTriangle,
  ShoppingBag,
  Layers,
  Navigation,
  Search,
  Plus,
  ExternalLink,
  CheckCircle2,
  X,
  RefreshCw,
  MessageSquare,
  ShieldAlert,
  ThumbsUp,
  Flag,
  Crosshair,
  MapPinned
} from 'lucide-react';
import L from 'leaflet';
import { useCommunity } from '../../context/CommunityContext';
import { THAI_PROVINCE_COORDINATES } from '../../data/thaiData';
import { reverseGeocodeCoords } from '../../services/geolocationService';

interface MapViewProps {
  onOpenReportAlert?: (coords?: { lat?: number; lng?: number; address?: string }) => void;
}

export const MapView: React.FC<MapViewProps> = ({ onOpenReportAlert }) => {
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
    openPostDetail,
    confirmAlert,
    reportAlertNotFound
  } = useCommunity();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pinnedMarkerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'alerts' | 'posts' | 'market'>('all');
  const [selectedRadius, setSelectedRadius] = useState<'1' | '5' | '10' | 'district' | 'province'>('5');
  const [mapTileType, setMapTileType] = useState<'carto' | 'osm' | 'satellite'>('carto');
  const [isPinningMode, setIsPinningMode] = useState<boolean>(false);

  // User-dropped incident pin
  const [pinnedIncident, setPinnedIncident] = useState<{
    lat: number;
    lng: number;
    address: string;
    isGeocoding?: boolean;
  } | null>(null);

  // Currently inspected real point (alert, post, market, user, pin)
  const [activeInspection, setActiveInspection] = useState<{
    id: string;
    type: 'user' | 'alert' | 'post' | 'market' | 'pin';
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

  // 1. Initialize Leaflet Map with Google Maps-like crisp Carto Voyager tiles
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

    // Default: CartoDB Voyager with crisp street names and Google Maps-style typography
    const defaultTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    });
    defaultTile.addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Handle Map Click to Pin Incident
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      setPinnedIncident({
        lat,
        lng,
        address: 'กำลังดึงข้อมูลชื่อสถานที่จากแผนที่...',
        isGeocoding: true
      });

      try {
        const geo = await reverseGeocodeCoords(lat, lng);
        const placeName = geo.displayName || `${geo.road ? geo.road + ', ' : ''}${geo.district ? 'อ.' + geo.district + ', ' : ''}จ.${geo.province}`;
        setPinnedIncident({
          lat,
          lng,
          address: placeName,
          isGeocoding: false
        });

        setActiveInspection({
          id: 'pinned-pin',
          type: 'pin',
          title: '📍 จุดปักหมุดแจ้งเหตุฉุกเฉิน',
          subtitle: placeName,
          desc: `พิกัด GPS จริง: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          lat,
          lng,
          extra: { address: placeName }
        });
      } catch {
        const fallback = `พิกัด GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setPinnedIncident({
          lat,
          lng,
          address: fallback,
          isGeocoding: false
        });
        setActiveInspection({
          id: 'pinned-pin',
          type: 'pin',
          title: '📍 จุดปักหมุดแจ้งเหตุฉุกเฉิน',
          subtitle: fallback,
          desc: `พิกัด GPS จริง: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          lat,
          lng,
          extra: { address: fallback }
        });
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Tile layer switcher (Carto Voyager / Satellite / OSM)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let subdomains = 'abcd';
    if (mapTileType === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = '';
    } else if (mapTileType === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
    }

    L.tileLayer(url, { maxZoom: 19, subdomains }).addTo(map);
  }, [mapTileType]);

  // 3. Render Markers: User GPS, Radius Circle, Alerts, Posts, Market, and Pinned Incident
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
          <div class="absolute w-9 h-9 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
            <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const userMarker = L.marker([userLat, userLng], { icon: userIcon });
    userMarker.bindTooltip(`📍 ตำแหน่งของฉัน: ${location.displayName || location.province}`, {
      direction: 'top',
      className: 'gmap-label-tooltip',
      offset: [0, -10]
    });
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

    // 2. Real Emergency Alerts Pins with Anti-fake News and Google Maps Typography
    if (activeFilter === 'all' || activeFilter === 'alerts') {
      alerts.forEach((alert) => {
        const [lat, lng] = getItemCoords(alert.id, alert.province, alert.coordinates);
        const isCritical = alert.severity === 'critical' || alert.severity === 'high';
        const notFound = alert.notFoundCount || 0;
        const isSuspectedFake = alert.isFakeReport || (notFound >= 3 && notFound > alert.verifiedCount);

        const alertIcon = L.divIcon({
          className: 'custom-alert-marker',
          html: `
            <div class="relative group cursor-pointer">
              <div class="w-9 h-9 rounded-2xl ${
                isSuspectedFake
                  ? 'bg-amber-600 opacity-80'
                  : isCritical
                  ? 'bg-red-600 animate-pulse'
                  : 'bg-rose-600'
              } text-white shadow-xl border-2 border-white flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full ${isSuspectedFake ? 'bg-amber-500' : 'bg-red-600'} text-white text-[9px] font-black flex items-center justify-center shadow border border-white">
                ${isSuspectedFake ? '?' : '!'}
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        const marker = L.marker([lat, lng], { icon: alertIcon });
        marker.bindTooltip(`🚨 ${alert.title.slice(0, 24)}... (ยืนยัน ${alert.verifiedCount})`, {
          direction: 'top',
          className: 'gmap-label-tooltip',
          offset: [0, -12]
        });
        marker.on('click', () => {
          setActiveInspection({
            id: alert.id,
            type: 'alert',
            title: alert.title,
            subtitle: `🚨 เหตุ: ${alert.province} • ผู้รายงาน: ${alert.reporter}`,
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
            <div class="w-8 h-8 rounded-2xl bg-emerald-600 text-white shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([lat, lng], { icon: postIcon });
        marker.bindTooltip(`💬 ${post.title.slice(0, 24)}`, {
          direction: 'top',
          className: 'gmap-label-tooltip',
          offset: [0, -10]
        });
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
            <div class="w-8 h-8 rounded-2xl bg-amber-500 text-white shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([lat, lng], { icon: marketIcon });
        marker.bindTooltip(`🛍️ ฿${item.price.toLocaleString()} • ${item.title.slice(0, 20)}`, {
          direction: 'top',
          className: 'gmap-label-tooltip',
          offset: [0, -10]
        });
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

    // 5. User-Dropped Incident Pin
    if (pinnedIncident) {
      const pinIcon = L.divIcon({
        className: 'custom-pinned-alert-marker',
        html: `
          <div class="relative flex items-center justify-center animate-bounce">
            <div class="w-10 h-10 rounded-full bg-red-600 text-white border-2 border-white shadow-2xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 36]
      });

      const pinMarker = L.marker([pinnedIncident.lat, pinnedIncident.lng], { icon: pinIcon });
      pinMarker.bindTooltip(`📍 จุดปักหมุดแจ้งเหตุ: ${pinnedIncident.address.slice(0, 30)}`, {
        direction: 'top',
        className: 'gmap-label-tooltip',
        offset: [0, -28],
        permanent: true
      });
      markersGroup.addLayer(pinMarker);
      pinnedMarkerRef.current = pinMarker;
    }
  }, [location, alerts, posts, marketItems, activeFilter, selectedRadius, pinnedIncident]);

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

  // Trigger report modal from pinned location
  const handleReportAtPinnedLocation = () => {
    if (!pinnedIncident) return;
    if (onOpenReportAlert) {
      onOpenReportAlert({
        lat: pinnedIncident.lat,
        lng: pinnedIncident.lng,
        address: pinnedIncident.address
      });
    } else {
      setActiveTab('alerts');
    }
  };

  return (
    <div className="space-y-3 max-w-4xl mx-auto animate-fadeIn pb-14">
      {/* 1. Header Bar with Real GPS status & Pinning Mode Action */}
      <div className="bg-slate-950 text-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-800 shadow-lg flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 truncate">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shrink-0">
            <MapPin className="w-5 h-5 text-slate-950" />
          </div>
          <div className="min-w-0">
            <span className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
              <span>แผนที่จริง & ระบบบอกตำแหน่ง</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-400/30">
                LIVE GPS
              </span>
            </span>
            <p className="text-[11px] text-slate-400 truncate hidden xs:block">
              {location.lat && location.lng ? `พิกัดจริง: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} • ${location.displayName || location.province}` : 'ตรวจจับตำแหน่ง GPS จริง'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Toggle Pinning Mode Button */}
          <button
            onClick={() => {
              setIsPinningMode(!isPinningMode);
              if (!isPinningMode) {
                showToast('📍 แตะหรือคลิกที่ใดก็ได้บนแผนที่เพื่อปักหมุดแจ้งเหตุ', 'info');
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-sm active:scale-95 ${
              isPinningMode
                ? 'bg-rose-600 text-white ring-2 ring-rose-400 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="ปักหมุดแจ้งเหตุตามพื้นที่"
          >
            <MapPinned className="w-3.5 h-3.5" />
            <span>{isPinningMode ? 'กำลังปักหมุด...' : 'ปักหมุดแจ้งเหตุ'}</span>
          </button>

          <button
            onClick={handleFlyToGps}
            disabled={isLocatingGps}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-sm active:scale-95"
            title="ค้นหาตำแหน่ง GPS ปัจจุบัน"
          >
            <Navigation className={`w-3.5 h-3.5 fill-white ${isLocatingGps ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">GPS ฉัน</span>
          </button>

          <button
            onClick={openLocationModal}
            className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shrink-0"
          >
            <span>เปลี่ยนพื้นที่</span>
          </button>
        </div>
      </div>

      {/* Pinning Mode Banner */}
      {isPinningMode && (
        <div className="p-3 bg-rose-600 text-white rounded-2xl flex items-center justify-between gap-2 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Crosshair className="w-4 h-4 animate-spin text-white" />
            <span>คลิกหรือแตะบนแผนที่ตรงจุดเกิดเหตุ เพื่อปักหมุดรายงานภัย</span>
          </div>
          <button
            onClick={() => setIsPinningMode(false)}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold"
          >
            เสร็จสิ้น
          </button>
        </div>
      )}

      {/* 2. Real Search & Geocoding Bar */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อสถานที่, ถนน, ตำบล, อำเภอ (ตัวอักษรแบบ Google Maps)..."
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
          className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-1.5 ${
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
      <div className={`relative w-full h-[470px] sm:h-[530px] rounded-3xl overflow-hidden border border-slate-300 shadow-xl bg-slate-100 ${isPinningMode ? 'cursor-crosshair' : ''}`}>
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

          {/* Tile Layer Switcher: Street / Satellite / OSM */}
          <button
            onClick={() => {
              const next = mapTileType === 'carto' ? 'satellite' : mapTileType === 'satellite' ? 'osm' : 'carto';
              setMapTileType(next);
              showToast(`สลับโหมดแผนที่: ${next === 'satellite' ? 'ภาพถ่ายดาวเทียม' : next === 'osm' ? 'OpenStreetMap' : 'แผนที่มาตรฐาน Google-style'}`, 'info');
            }}
            className="w-10 h-10 bg-slate-900/90 hover:bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-700"
            title="เปลี่ยนมุมมองแผนที่ (Google-style / ดาวเทียม / ถนน)"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
          </button>
        </div>

        {/* Selected Real Pin Detail Card Popup */}
        {activeInspection && (
          <div className="absolute top-4 left-4 right-16 sm:right-auto sm:max-w-sm z-30 bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-slate-200 space-y-2.5 animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                activeInspection.type === 'pin'
                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                  : activeInspection.type === 'alert'
                  ? 'bg-red-100 text-red-700'
                  : activeInspection.type === 'market'
                  ? 'bg-amber-100 text-amber-800'
                  : activeInspection.type === 'post'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {activeInspection.type === 'pin'
                  ? '📍 ปักหมุดแจ้งเหตุตรงนี้'
                  : activeInspection.type === 'alert'
                  ? '🚨 เหตุฉุกเฉินจริง'
                  : activeInspection.type === 'market'
                  ? '🛍️ สินค้าในตลาด'
                  : activeInspection.type === 'post'
                  ? '💬 โพสต์ชุมชน'
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
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{activeInspection.subtitle}</p>
            </div>

            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
              {activeInspection.desc}
            </p>

            {/* If Alert: Show Anti-fake news indicators and confirmation buttons */}
            {activeInspection.type === 'alert' && activeInspection.extra && (
              <div className="space-y-2 pt-1">
                {activeInspection.extra.isFakeReport || (activeInspection.extra.notFoundCount >= 3 && activeInspection.extra.notFoundCount > activeInspection.extra.verifiedCount) ? (
                  <div className="p-2 bg-red-100 text-red-800 text-[11px] rounded-xl font-bold flex items-center gap-1.5 border border-red-200">
                    <Flag className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span>⚠️ กำลังถูกตรวจสอบว่าอาจเป็นข่าวปลอม (ไม่พบ {activeInspection.extra.notFoundCount || 0} คน)</span>
                  </div>
                ) : (
                  <div className="p-1.5 bg-emerald-50 text-emerald-800 text-[11px] rounded-xl font-semibold flex items-center gap-1.5 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ยืนยันเหตุจริงแล้ว {activeInspection.extra.verifiedCount || 1} คน</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      confirmAlert(activeInspection.extra.id);
                      setActiveInspection(prev => prev ? {
                        ...prev,
                        extra: {
                          ...prev.extra,
                          verifiedCount: (prev.extra.verifiedCount || 0) + 1,
                          userVerified: true,
                          userReportedNotFound: false
                        }
                      } : null);
                    }}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 shadow-2xs"
                  >
                    <ThumbsUp className="w-3 h-3 fill-white" />
                    <span>ยืนยันเหตุจริง ({activeInspection.extra.verifiedCount})</span>
                  </button>

                  <button
                    onClick={() => {
                      reportAlertNotFound(activeInspection.extra.id);
                      setActiveInspection(prev => prev ? {
                        ...prev,
                        extra: {
                          ...prev.extra,
                          notFoundCount: (prev.extra.notFoundCount || 0) + 1,
                          userReportedNotFound: true,
                          userVerified: false
                        }
                      } : null);
                    }}
                    className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border border-rose-200 active:scale-95"
                  >
                    <Flag className="w-3 h-3" />
                    <span>ไม่พบเหตุ / ข่าวปลอม ({activeInspection.extra.notFoundCount || 0})</span>
                  </button>
                </div>
              </div>
            )}

            {/* If Pinned Incident: Action button to immediately open report modal */}
            {activeInspection.type === 'pin' && (
              <div className="pt-1 space-y-1.5">
                <button
                  onClick={handleReportAtPinnedLocation}
                  className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>แจ้งเหตุด่วนตรงจุดนี้ทันที</span>
                </button>
                <button
                  onClick={() => {
                    setPinnedIncident(null);
                    setActiveInspection(null);
                  }}
                  className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-semibold transition"
                >
                  ยกเลิกหมุด
                </button>
              </div>
            )}

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
                <span>นำทาง Google Maps</span>
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
                  <span>ศูนย์เตือนภัย</span>
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
