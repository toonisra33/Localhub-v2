import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  MapPinned,
  ArrowLeft,
  LayoutGrid,
  Map as MapIcon,
  ListFilter,
  Phone,
  Clock,
  ChevronRight,
  Shield,
  Hospital
} from 'lucide-react';
import L from 'leaflet';
import { useCommunity } from '../../context/CommunityContext';
import { THAI_PROVINCE_COORDINATES } from '../../data/thaiData';
import { reverseGeocodeCoords } from '../../services/geolocationService';
import { Post, AlertReport, MarketItem } from '../../types';

interface MapViewProps {
  onOpenReportAlert?: (coords?: { lat?: number; lng?: number; address?: string }) => void;
}

export type MapViewMode = 'map_and_cards' | 'full_map' | 'list_feed';
export type MapCategoryFilter = 'all' | 'alerts' | 'posts' | 'market' | 'emergency';
export type MapSortOption = 'distance' | 'urgent' | 'latest';

export interface UnifiedMapCardItem {
  id: string;
  type: 'alert' | 'post' | 'market' | 'emergency';
  title: string;
  subtitle: string;
  desc: string;
  lat: number;
  lng: number;
  distanceKm: number;
  distanceStr: string;
  timeStr: string;
  imageUrl?: string;
  authorOrReporter: string;
  verifiedCount?: number;
  notFoundCount?: number;
  isFakeReport?: boolean;
  status?: string;
  severity?: string;
  price?: number;
  contactNumber?: string;
  originalData: any;
}

// Distance helper using Haversine formula
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} ม.`;
  }
  return `${km.toFixed(1)} กม.`;
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
    reportAlertNotFound,
    goBack
  } = useCommunity();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // View presentation mode
  const [viewMode, setViewMode] = useState<MapViewMode>('map_and_cards');
  const [activeFilter, setActiveFilter] = useState<MapCategoryFilter>('all');
  const [selectedRadius, setSelectedRadius] = useState<'1' | '3' | '5' | '10' | 'district' | 'province'>('5');
  const [sortBy, setSortBy] = useState<MapSortOption>('distance');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapTileType, setMapTileType] = useState<'carto' | 'osm' | 'satellite'>('carto');
  const [isPinningMode, setIsPinningMode] = useState<boolean>(false);

  // User-dropped incident pin
  const [pinnedIncident, setPinnedIncident] = useState<{
    lat: number;
    lng: number;
    address: string;
    isGeocoding?: boolean;
  } | null>(null);

  // Active inspected point
  const [activeInspection, setActiveInspection] = useState<{
    id: string;
    type: 'user' | 'alert' | 'post' | 'market' | 'emergency' | 'pin';
    title: string;
    subtitle: string;
    desc: string;
    lat: number;
    lng: number;
    extra?: any;
  } | null>(null);

  const userLat = location.lat && !isNaN(location.lat) ? location.lat : 13.7563;
  const userLng = location.lng && !isNaN(location.lng) ? location.lng : 100.5018;

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
    const offsetLat = ((hash % 100) - 50) / 1000;
    const offsetLng = (((hash >> 3) % 100) - 50) / 1000;
    return [base.lat + offsetLat, base.lng + offsetLng];
  };

  const getRadiusInMeters = (): number => {
    switch (selectedRadius) {
      case '1': return 1000;
      case '3': return 3000;
      case '5': return 5000;
      case '10': return 10000;
      case 'district': return 25000;
      case 'province': return 60000;
      default: return 5000;
    }
  };

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ชม. ที่แล้ว`;
    return `${Math.floor(hours / 24)} วันที่แล้ว`;
  };

  // Preset emergency services for current location
  const emergencyPoints = useMemo(() => {
    const prov = location.province || 'กรุงเทพมหานคร';
    const dist = location.district || 'เมือง';
    return [
      {
        id: 'emg_hospital',
        title: `โรงพยาบาลศูนย์ประจำพื้นที่ (${prov})`,
        subtitle: `ศูนย์การแพทย์ฉุกเฉินและอุบัติเหตุ 24 ชม. • ${dist}`,
        desc: 'เปิดบริการห้องฉุกเฉิน รถพยาบาลกู้ชีพฉุกเฉิน โทร. 1669',
        type: 'emergency' as const,
        lat: userLat + 0.008,
        lng: userLng - 0.006,
        contactNumber: '1669',
        authorOrReporter: 'ศูนย์บริการการแพทย์ฉุกเฉิน'
      },
      {
        id: 'emg_police',
        title: `สถานีตำรวจภูธร/นครบาล (${dist})`,
        subtitle: `จุดรับแจ้งเหตุด่วนเหตุร้ายและสายตรวจ • ${prov}`,
        desc: 'พร้อมรับแจ้งเหตุด่วนเหตุร้าย 24 ชม. โทร. 191',
        type: 'emergency' as const,
        lat: userLat - 0.007,
        lng: userLng + 0.009,
        contactNumber: '191',
        authorOrReporter: 'สำนักงานตำรวจแห่งชาติ'
      },
      {
        id: 'emg_fire',
        title: `สถานีดับเพลิงและกู้ภัย (${dist})`,
        subtitle: `หน่วยดับเพลิง บรรเทาสาธารณภัย สัตว์มีพิษเข้าบ้าน`,
        desc: 'รับแจ้งเหตุไฟไหม้ กู้ภัยทางน้ำ ช่วยเหลือน้ำท่วม โทร. 199',
        type: 'emergency' as const,
        lat: userLat + 0.012,
        lng: userLng + 0.011,
        contactNumber: '199',
        authorOrReporter: 'สถานีดับเพลิงและกู้ภัย'
      }
    ];
  }, [location.province, location.district, userLat, userLng]);

  // Aggregate all map items with real coordinates and distances
  const allCardItems = useMemo<UnifiedMapCardItem[]>(() => {
    const list: UnifiedMapCardItem[] = [];

    // 1. Alerts
    alerts.forEach((alert) => {
      const [lat, lng] = getItemCoords(alert.id, alert.province, alert.coordinates);
      const dist = calculateDistanceKm(userLat, userLng, lat, lng);
      list.push({
        id: alert.id,
        type: 'alert',
        title: alert.title,
        subtitle: `🚨 เหตุฉุกเฉิน: ${alert.district || alert.province}`,
        desc: alert.description,
        lat,
        lng,
        distanceKm: dist,
        distanceStr: formatDistance(dist),
        timeStr: timeAgo(alert.createdAt),
        authorOrReporter: alert.reporter,
        verifiedCount: alert.verifiedCount,
        notFoundCount: alert.notFoundCount,
        isFakeReport: alert.isFakeReport,
        status: alert.status,
        severity: alert.severity,
        originalData: alert
      });
    });

    // 2. Posts
    posts.forEach((post) => {
      const [lat, lng] = getItemCoords(post.id, post.location.province, post.coordinates);
      const dist = calculateDistanceKm(userLat, userLng, lat, lng);
      list.push({
        id: post.id,
        type: 'post',
        title: post.title,
        subtitle: `💬 ชุมชน: ${post.location.district || post.location.province}`,
        desc: post.content,
        lat,
        lng,
        distanceKm: dist,
        distanceStr: formatDistance(dist),
        timeStr: timeAgo(post.createdAt),
        imageUrl: post.images && post.images.length > 0 ? post.images[0] : undefined,
        authorOrReporter: post.author,
        originalData: post
      });
    });

    // 3. Market Items
    marketItems.forEach((item) => {
      const [lat, lng] = getItemCoords(item.id, item.province, item.coordinates);
      const dist = calculateDistanceKm(userLat, userLng, lat, lng);
      list.push({
        id: item.id,
        type: 'market',
        title: item.title,
        subtitle: `🛍️ ตลาดนัด: ${item.district || item.province} (฿${item.price.toLocaleString()})`,
        desc: item.description,
        lat,
        lng,
        distanceKm: dist,
        distanceStr: formatDistance(dist),
        timeStr: timeAgo(item.createdAt),
        imageUrl: item.images && item.images.length > 0 ? item.images[0] : undefined,
        authorOrReporter: item.seller,
        price: item.price,
        contactNumber: item.sellerContact,
        originalData: item
      });
    });

    // 4. Emergency Services
    emergencyPoints.forEach((emg) => {
      const dist = calculateDistanceKm(userLat, userLng, emg.lat, emg.lng);
      list.push({
        id: emg.id,
        type: 'emergency',
        title: emg.title,
        subtitle: emg.subtitle,
        desc: emg.desc,
        lat: emg.lat,
        lng: emg.lng,
        distanceKm: dist,
        distanceStr: formatDistance(dist),
        timeStr: 'เปิด 24 ชม.',
        authorOrReporter: emg.authorOrReporter,
        contactNumber: emg.contactNumber,
        originalData: emg
      });
    });

    return list;
  }, [alerts, posts, marketItems, emergencyPoints, userLat, userLng]);

  // Filtered and Sorted list for display
  const displayItems = useMemo(() => {
    let result = allCardItems.filter((item) => {
      // Category filter
      if (activeFilter === 'alerts' && item.type !== 'alert') return false;
      if (activeFilter === 'posts' && item.type !== 'post') return false;
      if (activeFilter === 'market' && item.type !== 'market') return false;
      if (activeFilter === 'emergency' && item.type !== 'emergency') return false;

      // Radius filter
      const maxKm =
        selectedRadius === '1'
          ? 1
          : selectedRadius === '3'
          ? 3
          : selectedRadius === '5'
          ? 5
          : selectedRadius === '10'
          ? 10
          : selectedRadius === 'district'
          ? 25
          : 65;
      if (item.distanceKm > maxKm) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.authorOrReporter.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'distance') {
      result.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'urgent') {
      result.sort((a, b) => {
        const getPriority = (x: UnifiedMapCardItem) =>
          x.type === 'alert' ? 100 : x.type === 'emergency' ? 80 : x.type === 'post' ? 40 : 20;
        return getPriority(b) - getPriority(a);
      });
    }

    return result;
  }, [allCardItems, activeFilter, selectedRadius, searchQuery, sortBy]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLat, userLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    const defaultTile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        subdomains: 'abcd'
      }
    );
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
        const placeName =
          geo.displayName ||
          `${geo.road ? geo.road + ', ' : ''}${geo.district ? 'อ.' + geo.district + ', ' : ''}จ.${geo.province}`;
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

  // 2. Tile layer switcher
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

  // 3. Render Markers on the Leaflet Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. User GPS Marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-10 h-10 rounded-full bg-blue-500/30 animate-ping"></div>
          <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
            <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const userMarker = L.marker([userLat, userLng], { icon: userIcon });
    userMarker.bindTooltip(`📍 ตำแหน่งของฉัน: ${location.displayName || location.province}`, {
      direction: 'top',
      className: 'gmap-label-tooltip',
      offset: [0, -12]
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
      fillOpacity: 0.07,
      weight: 1.5,
      dashArray: '4, 4'
    });
    markersGroup.addLayer(radiusCircle);

    // 2. Render Cards Markers on Map
    displayItems.forEach((item) => {
      let iconHtml = '';
      if (item.type === 'alert') {
        const isCritical = item.severity === 'critical' || item.severity === 'high';
        const isFake = item.isFakeReport || ((item.notFoundCount || 0) >= 3 && (item.notFoundCount || 0) > (item.verifiedCount || 0));
        iconHtml = `
          <div class="relative group cursor-pointer hover:scale-110 transition">
            <div class="w-9 h-9 rounded-2xl ${
              isFake ? 'bg-amber-600' : isCritical ? 'bg-red-600 animate-pulse' : 'bg-rose-600'
            } text-white shadow-xl border-2 border-white flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full ${isFake ? 'bg-amber-500' : 'bg-red-600'} text-white text-[9px] font-black flex items-center justify-center shadow border border-white">
              ${isFake ? '?' : '!'}
            </div>
          </div>
        `;
      } else if (item.type === 'post') {
        iconHtml = `
          <div class="w-8 h-8 rounded-2xl bg-emerald-600 text-white shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        `;
      } else if (item.type === 'market') {
        iconHtml = `
          <div class="w-8 h-8 rounded-2xl bg-amber-500 text-white shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
        `;
      } else {
        // Emergency
        iconHtml = `
          <div class="w-8 h-8 rounded-2xl bg-blue-600 text-white shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
        `;
      }

      const markerIcon = L.divIcon({
        className: `custom-marker-${item.type}`,
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([item.lat, item.lng], { icon: markerIcon });
      marker.bindTooltip(
        `${item.type === 'alert' ? '🚨' : item.type === 'post' ? '💬' : item.type === 'market' ? '🛍️' : '🏥'} ${item.title.slice(0, 22)}... (${item.distanceStr})`,
        {
          direction: 'top',
          className: 'gmap-label-tooltip',
          offset: [0, -12]
        }
      );

      marker.on('click', () => {
        handleSelectItem(item);
      });

      markersGroup.addLayer(marker);
    });

    // 3. User-Dropped Incident Pin
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
    }
  }, [displayItems, pinnedIncident, userLat, userLng, selectedRadius, location.displayName, location.province]);

  // Center/Fly to item and highlight its card
  const handleSelectItem = (item: UnifiedMapCardItem) => {
    setActiveInspection({
      id: item.id,
      type: item.type,
      title: item.title,
      subtitle: `${item.subtitle} • ห่าง ${item.distanceStr}`,
      desc: item.desc,
      lat: item.lat,
      lng: item.lng,
      extra: item.originalData
    });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.lat, item.lng], 16, { duration: 1 });
    }

    // Scroll to the card if in split view
    const el = cardRefs.current[item.id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Fly directly to device GPS
  const handleFlyToGps = async () => {
    await requestRealLocation();
    if (location.lat && location.lng && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([location.lat, location.lng], 15, { duration: 1.2 });
    }
  };

  // Handle Search for Real Places (Geocoding via Nominatim)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    showToast(`🔍 กำลังค้นหาพิกัดจริงของ "${searchQuery}"...`, 'info');

    try {
      const q = encodeURIComponent(searchQuery.trim());
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&accept-language=th,en`
      );
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
    <div className="space-y-3.5 max-w-5xl mx-auto animate-fadeIn pb-16">
      {/* 1. Header Bar with Real GPS status & Pinning Mode Action */}
      <div className="bg-slate-950 text-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-800 shadow-xl flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 truncate">
          <button
            onClick={goBack}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shrink-0 active:scale-95"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">ย้อนกลับ</span>
          </button>

          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shrink-0">
            <MapPin className="w-5 h-5 text-slate-950" />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5 truncate">
              <span>แผนที่แสดงข้อมูล & เหตุการณ์จริง</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-400/30 shrink-0">
                LIVE DATA
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              {location.lat && location.lng
                ? `📍 พิกัด GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} • ${
                    location.displayName || location.province
                  }`
                : 'ตรวจจับตำแหน่ง GPS จริงของคุณ'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Toggle Pinning Mode Button */}
          <button
            onClick={() => {
              setIsPinningMode(!isPinningMode);
              if (!isPinningMode) {
                showToast('📍 แตะหรือคลิกที่ใดก็ได้บนแผนที่เพื่อปักหมุดแจ้งเหตุฉุกเฉิน', 'info');
              }
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-sm active:scale-95 ${
              isPinningMode
                ? 'bg-rose-600 text-white ring-2 ring-rose-400 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="ปักหมุดแจ้งเหตุตามพื้นที่"
          >
            <MapPinned className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{isPinningMode ? 'กำลังปักหมุด...' : 'ปักหมุดแจ้งเหตุ'}</span>
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
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold"
          >
            เสร็จสิ้น
          </button>
        </div>
      )}

      {/* 2. Search & View Mode Switcher Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อสถานที่, เหตุการณ์, ร้านค้า, หรือคำค้น..."
            className="w-full pl-9 pr-20 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition"
          >
            {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <span>ค้นหา</span>}
          </button>
        </form>

        {/* View Layout Switcher ("ภาพที่ 2" Style: Map & Cards split, Full Map, or List Feed) */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-2xl shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('map_and_cards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'map_and_cards'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="แผนที่พร้อมการ์ดข้อมูลแสดงด้านล่าง"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-600" />
            <span>แผนที่ + ข้อมูล</span>
          </button>

          <button
            onClick={() => setViewMode('full_map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'full_map'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="แผนที่ขยายใหญ่พร้อมแถบการ์ดด้านล่าง"
          >
            <MapIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>แผนที่เต็มจอ</span>
          </button>

          <button
            onClick={() => setViewMode('list_feed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === 'list_feed'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="รายการข้อมูลตามระยะทาง"
          >
            <ListFilter className="w-3.5 h-3.5 text-purple-600" />
            <span>ฟีดข้อมูล ({displayItems.length})</span>
          </button>
        </div>
      </div>

      {/* 3. Category Filter Chips & Radius Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              ทั้งหมด ({allCardItems.length})
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
              <span>🚨 เหตุฉุกเฉิน ({alerts.length})</span>
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
              <span>🛍️ ตลาด ({marketItems.length})</span>
            </button>

            <button
              onClick={() => setActiveFilter('emergency')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-1 ${
                activeFilter === 'emergency'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>🏥 จุดกู้ภัย/ฉุกเฉิน ({emergencyPoints.length})</span>
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 shrink-0 text-slate-500 text-[11px]">
            <span className="hidden xs:inline">เรียงตาม:</span>
            <button
              onClick={() => setSortBy(sortBy === 'distance' ? 'urgent' : 'distance')}
              className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
            >
              {sortBy === 'distance' ? '📍 ใกล้ที่สุด' : '⚡ ความเร่งด่วน'}
            </button>
          </div>
        </div>

        {/* Radius Selector Pills */}
        <div className="bg-slate-900/90 text-white rounded-2xl p-1.5 flex items-center justify-between text-xs gap-1 shadow-md">
          <span className="text-[11px] font-bold text-slate-300 pl-2 shrink-0 hidden sm:inline">
            รัศมีรอบตัวคุณ:
          </span>
          <div className="flex items-center gap-1 flex-1">
            {(['1', '3', '5', '10', 'district', 'province'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRadius(r)}
                className={`flex-1 py-1 text-center rounded-xl font-bold transition text-[10px] sm:text-xs ${
                  selectedRadius === r
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {r === 'district' ? 'ทั้งอำเภอ' : r === 'province' ? 'ทั้งจังหวัด' : `${r} กม.`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Interactive Map Container (Hidden only if in full list_feed mode) */}
      {viewMode !== 'list_feed' && (
        <div
          className={`relative w-full rounded-3xl overflow-hidden border border-slate-300 shadow-xl bg-slate-100 ${
            viewMode === 'full_map' ? 'h-[520px] sm:h-[600px]' : 'h-[360px] sm:h-[420px]'
          } ${isPinningMode ? 'cursor-crosshair' : ''}`}
        >
          {/* Leaflet DOM Anchor */}
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Top Right Floating Map Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-2">
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-200"
              title="ซูมเข้า (+)"
            >
              <Plus className="w-4 h-4 font-bold" />
            </button>
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="w-9 h-9 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-200"
              title="ซูมออก (-)"
            >
              <span className="text-xl font-black leading-none">−</span>
            </button>
            <button
              onClick={handleFlyToGps}
              className="w-9 h-9 bg-slate-900/90 hover:bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-700"
              title="ตำแหน่ง GPS จริงของฉัน"
            >
              <Navigation className={`w-3.5 h-3.5 fill-emerald-400 ${isLocatingGps ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                const next =
                  mapTileType === 'carto' ? 'satellite' : mapTileType === 'satellite' ? 'osm' : 'carto';
                setMapTileType(next);
                showToast(
                  `สลับโหมดแผนที่: ${
                    next === 'satellite'
                      ? 'ภาพถ่ายดาวเทียม'
                      : next === 'osm'
                      ? 'OpenStreetMap'
                      : 'แผนที่มาตรฐาน Google-style'
                  }`,
                  'info'
                );
              }}
              className="w-9 h-9 bg-slate-900/90 hover:bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg transition active:scale-90 border border-slate-700"
              title="เปลี่ยนมุมมองแผนที่ (Google-style / ดาวเทียม / ถนน)"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          {/* Selected Pin Popup Card */}
          {activeInspection && (
            <div className="absolute top-4 left-4 right-16 sm:right-auto sm:max-w-sm z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-3xl shadow-2xl border border-slate-200 space-y-2 animate-fadeIn">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                    activeInspection.type === 'pin'
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : activeInspection.type === 'alert'
                      ? 'bg-red-100 text-red-700'
                      : activeInspection.type === 'market'
                      ? 'bg-amber-100 text-amber-800'
                      : activeInspection.type === 'post'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {activeInspection.type === 'pin'
                    ? '📍 จุดปักหมุดแจ้งเหตุตรงนี้'
                    : activeInspection.type === 'alert'
                    ? '🚨 เหตุฉุกเฉินจริง'
                    : activeInspection.type === 'market'
                    ? '🛍️ สินค้าตลาดนัด'
                    : activeInspection.type === 'post'
                    ? '💬 โพสต์ชุมชน'
                    : '🏥 จุดบริการฉุกเฉิน'}
                </span>
                <button
                  onClick={() => setActiveInspection(null)}
                  className="text-slate-400 hover:text-slate-700 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                  {activeInspection.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{activeInspection.subtitle}</p>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100 font-medium">
                {activeInspection.desc}
              </p>

              {/* Alert Actions */}
              {activeInspection.type === 'alert' && activeInspection.extra && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        confirmAlert(activeInspection.extra.id);
                        setActiveInspection((prev) =>
                          prev
                            ? {
                                ...prev,
                                extra: {
                                  ...prev.extra,
                                  verifiedCount: (prev.extra.verifiedCount || 0) + 1,
                                  userVerified: true,
                                  userReportedNotFound: false
                                }
                              }
                            : null
                        );
                      }}
                      className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 active:scale-95"
                    >
                      <ThumbsUp className="w-3 h-3 fill-white" />
                      <span>ยืนยันเหตุจริง ({activeInspection.extra.verifiedCount || 1})</span>
                    </button>
                    <button
                      onClick={() => {
                        reportAlertNotFound(activeInspection.extra.id);
                        setActiveInspection((prev) =>
                          prev
                            ? {
                                ...prev,
                                extra: {
                                  ...prev.extra,
                                  notFoundCount: (prev.extra.notFoundCount || 0) + 1,
                                  userReportedNotFound: true,
                                  userVerified: false
                                }
                              }
                            : null
                        );
                      }}
                      className="py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 border border-rose-200"
                    >
                      <Flag className="w-3 h-3" />
                      <span>ข่าวปลอม</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Pin drop report action */}
              {activeInspection.type === 'pin' && (
                <div className="pt-1">
                  <button
                    onClick={handleReportAtPinnedLocation}
                    className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>แจ้งเหตุด่วนตรงจุดนี้ทันที</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeInspection.lat},${activeInspection.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3 h-3 fill-white" />
                  <span>นำทาง Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {activeInspection.type === 'alert' && (
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="py-1.5 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>ศูนย์เตือนภัย</span>
                  </button>
                )}

                {activeInspection.type === 'post' && (
                  <button
                    onClick={() => openPostDetail(activeInspection.id)}
                    className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>อ่านโพสต์</span>
                  </button>
                )}

                {activeInspection.type === 'market' && (
                  <button
                    onClick={() => setActiveTab('market')}
                    className="py-1.5 px-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>ไปตลาด</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* In full_map view: Horizontal Swipeable Cards Drawer at bottom */}
          {viewMode === 'full_map' && displayItems.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-none">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pointer-events-auto snap-x snap-mandatory">
                {displayItems.slice(0, 10).map((item) => (
                  <div
                    key={`carousel_${item.id}`}
                    onClick={() => handleSelectItem(item)}
                    className={`snap-center shrink-0 w-72 bg-white/95 backdrop-blur-md border rounded-2xl p-3 shadow-xl transition cursor-pointer hover:border-emerald-500 active:scale-98 ${
                      activeInspection?.id === item.id ? 'border-emerald-500 ring-2 ring-emerald-400' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        {item.type === 'alert' ? '🚨 เหตุฉุกเฉิน' : item.type === 'post' ? '💬 ชุมชน' : item.type === 'market' ? '🛍️ ตลาด' : '🏥 กู้ภัย/ฉุกเฉิน'}
                        <span>·</span>
                        <span className="text-emerald-700 font-extrabold">{item.distanceStr}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{item.timeStr}</span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.subtitle}</p>

                    <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-600 font-medium truncate max-w-[140px]">
                        โดย: {item.authorOrReporter}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <span>ดูบนแผนที่</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Rich Data Cards Section ("แสดงข้อมูลแบบภาพที่ 2") */}
      <div className="space-y-3">
        {/* Section Header with Stats */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>ข้อมูลและเหตุการณ์ในพื้นที่</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                {displayItems.length} รายการ
              </span>
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">
              (รัศมี {selectedRadius === 'district' ? 'ทั้งอำเภอ' : selectedRadius === 'province' ? 'ทั้งจังหวัด' : `${selectedRadius} กม.`})
            </span>
          </div>

          <span className="text-[11px] text-slate-500 font-medium">
            แตะที่การ์ดเพื่อนำทางและดูบนแผนที่
          </span>
        </div>

        {/* Empty state */}
        {displayItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">ไม่พบข้อมูลในรัศมีที่เลือก</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              ลองขยายรัศมีการค้นหาเป็น 10 กม., ทั้งอำเภอ หรือทั้งจังหวัด เพื่อดูข้อมูลเพิ่มเติม
            </p>
            <button
              onClick={() => setSelectedRadius('district')}
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1 shadow-xs"
            >
              <span>ขยายดูทั้งอำเภอ</span>
            </button>
          </div>
        ) : (
          /* Cards Grid ("แสดงข้อมูลแบบภาพที่ 2") */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayItems.map((item) => {
              const isSelected = activeInspection?.id === item.id;
              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    cardRefs.current[item.id] = el;
                  }}
                  className={`bg-white rounded-3xl p-4 border transition-all duration-200 shadow-xs hover:shadow-md space-y-2.5 ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-400/50 bg-emerald-50/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header: Type Badge, Distance & Time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 ${
                          item.type === 'alert'
                            ? 'bg-rose-100 text-rose-700'
                            : item.type === 'post'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.type === 'market'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.type === 'alert' && <AlertTriangle className="w-3 h-3" />}
                        {item.type === 'post' && <MessageSquare className="w-3 h-3" />}
                        {item.type === 'market' && <ShoppingBag className="w-3 h-3" />}
                        {item.type === 'emergency' && <Hospital className="w-3 h-3" />}
                        <span>
                          {item.type === 'alert'
                            ? 'เหตุฉุกเฉิน'
                            : item.type === 'post'
                            ? 'โพสต์ชุมชน'
                            : item.type === 'market'
                            ? 'ตลาดนัด'
                            : 'บริการฉุกเฉิน'}
                        </span>
                      </span>

                      {/* Distance Badge */}
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-extrabold rounded-lg flex items-center gap-1 border border-slate-200">
                        <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{item.distanceStr}</span>
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.timeStr}</span>
                    </span>
                  </div>

                  {/* Body: Title, Subtitle, Description */}
                  <div className="flex gap-3 items-start">
                    {/* Optional Thumbnail Image */}
                    {item.imageUrl && (
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{item.subtitle}</span>
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Anti-fake or Verification badges for alerts */}
                  {item.type === 'alert' && (
                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      {item.isFakeReport || ((item.notFoundCount || 0) >= 3 && (item.notFoundCount || 0) > (item.verifiedCount || 0)) ? (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-lg font-bold flex items-center gap-1">
                          <Flag className="w-3 h-3 text-amber-600" />
                          <span>สงสัยเป็นข่าวปลอม (ไม่พบ {item.notFoundCount} คน)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg font-semibold flex items-center gap-1 border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>ยืนยันเหตุจริงแล้ว {item.verifiedCount || 1} คน</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer & Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">
                      {item.type === 'emergency' ? 'สายด่วน: ' : 'โดย: '}
                      <strong className="text-slate-800">{item.authorOrReporter}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Focus on Map */}
                      <button
                        onClick={() => handleSelectItem(item)}
                        className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                        title="ดูพิกัดบนแผนที่"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ดูบนแผนที่</span>
                      </button>

                      {/* Google Maps Direction */}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-blue-200"
                        title="เปิดแอปนำทาง Google Maps"
                      >
                        <Navigation className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                        <span>นำทาง</span>
                      </a>

                      {/* Emergency Call */}
                      {item.type === 'emergency' && item.contactNumber && (
                        <a
                          href={`tel:${item.contactNumber}`}
                          className="py-1.5 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>โทร {item.contactNumber}</span>
                        </a>
                      )}

                      {/* Context actions */}
                      {item.type === 'post' && (
                        <button
                          onClick={() => openPostDetail(item.id)}
                          className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-emerald-200"
                        >
                          <span>อ่านโพสต์</span>
                        </button>
                      )}

                      {item.type === 'market' && (
                        <button
                          onClick={() => setActiveTab('market')}
                          className="py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-amber-200"
                        >
                          <span>ดูสินค้า</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
