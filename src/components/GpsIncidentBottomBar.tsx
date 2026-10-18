import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  MapPin,
  ShieldAlert,
  Navigation,
  ChevronRight,
  ChevronLeft,
  Plus,
  Eye,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { Post, AlertReport } from '../types';

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.max(50, Math.round(km * 1000))} ม.`;
  }
  return `${km.toFixed(1)} กม.`;
}

export interface UnifiedIncidentItem {
  id: string;
  sourceType: 'post' | 'alert';
  title: string;
  description: string;
  province: string;
  district?: string;
  subdistrict?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: number;
  reporter: string;
  reporterAvatar?: string;
  images?: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: string;
  distanceKm?: number;
  distanceStr?: string;
  originalPost?: Post;
  originalAlert?: AlertReport;
}

interface GpsIncidentBottomBarProps {
  onOpenReportAlert?: () => void;
}

export const GpsIncidentBottomBar: React.FC<GpsIncidentBottomBarProps> = ({
  onOpenReportAlert
}) => {
  const {
    location,
    posts,
    alerts,
    setActiveTab,
    openPostDetail,
    requestRealLocation,
    isLocatingGps
  } = useCommunity();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // 1. Filter ONLY Incident Posts (เฉพาะแจ้งเหตุเท่านั้น) & Match by user device GPS
  const gpsIncidents = useMemo<UnifiedIncidentItem[]>(() => {
    const rawList: UnifiedIncidentItem[] = [];

    // A. Posts with category === 'alert' (โพสต์แจ้งเหตุ)
    posts
      .filter((p) => p && p.category === 'alert')
      .forEach((p) => {
        rawList.push({
          id: p.id,
          sourceType: 'post',
          title: p.title,
          description: p.content,
          province: p.location.province,
          district: p.location.district,
          subdistrict: p.location.subdistrict,
          address: p.location.address,
          coordinates: p.coordinates,
          createdAt: p.createdAt,
          reporter: p.author,
          reporterAvatar: p.authorAvatar,
          images: p.images,
          originalPost: p
        });
      });

    // B. Alerts from alerts repository (ศูนย์แจ้งเหตุด่วน)
    alerts.forEach((a) => {
      // avoid duplicate if same ID
      if (!rawList.some((item) => item.id === a.id)) {
        rawList.push({
          id: a.id,
          sourceType: 'alert',
          title: a.title,
          description: a.description,
          province: a.province,
          district: a.district,
          subdistrict: a.subdistrict,
          address: a.locationName,
          coordinates: a.coordinates,
          createdAt: a.createdAt,
          reporter: a.reporter,
          reporterAvatar: a.reporterAvatar,
          images: a.images,
          severity: a.severity,
          status: a.status,
          originalAlert: a
        });
      }
    });

    const userLat = location.lat;
    const userLng = location.lng;
    const userProvince = (location.province || '').trim().toLowerCase();
    const userDistrict = (location.district || '').trim().toLowerCase();

    // Calculate distance & filter according to device GPS
    const listWithDistance = rawList.map((item) => {
      let distKm: number | undefined;
      let distStr: string | undefined;

      if (userLat && userLng && item.coordinates?.lat && item.coordinates?.lng) {
        distKm = calculateDistanceKm(userLat, userLng, item.coordinates.lat, item.coordinates.lng);
        distStr = formatDistance(distKm);
      }

      return {
        ...item,
        distanceKm: distKm,
        distanceStr: distStr
      };
    });

    // Filter strictly by GPS area:
    // If device GPS is available, show incidents within 35km radius OR matching same province/district
    const filtered = listWithDistance.filter((item) => {
      if (item.distanceKm !== undefined) {
        // Within 35km of user's device GPS
        if (item.distanceKm <= 35) return true;
      }

      // Province/District matching
      const itemProvince = (item.province || '').trim().toLowerCase();
      const itemDistrict = (item.district || '').trim().toLowerCase();

      if (userProvince && itemProvince.includes(userProvince)) return true;
      if (userDistrict && itemDistrict && itemDistrict.includes(userDistrict)) return true;

      return false;
    });

    // Sort by nearest GPS distance first, then latest
    return filtered.sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== undefined) return -1;
      if (b.distanceKm !== undefined) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [posts, alerts, location]);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= gpsIncidents.length) {
      setCurrentIndex(0);
    }
  }, [gpsIncidents.length, currentIndex]);

  const currentIncident = gpsIncidents[currentIndex];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gpsIncidents.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % gpsIncidents.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gpsIncidents.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + gpsIncidents.length) % gpsIncidents.length);
    }
  };

  const handleViewIncidentDetail = (item: UnifiedIncidentItem) => {
    if (item.originalPost) {
      openPostDetail(item.originalPost);
    } else {
      setActiveTab('alerts');
    }
  };

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'เมื่อสักครู่';
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ชม. ที่แล้ว`;
    return `${Math.floor(hours / 24)} วันที่แล้ว`;
  };

  return (
    <div
      aria-label="แถบแจ้งเหตุตาม GPS อุปกรณ์ของผู้ใช้"
      className="w-full transition-all duration-300"
    >
      {/* ========================================================================= */}
      {/* CASE A: Active Incident Found in user's device GPS area                    */}
      {/* ========================================================================= */}
      {gpsIncidents.length > 0 && currentIncident ? (
        <div className="bg-gradient-to-r from-rose-950 via-red-950 to-slate-950 text-white rounded-2xl sm:rounded-3xl shadow-xl border border-rose-500/50 p-2.5 sm:p-3.5 space-y-2 backdrop-blur-md">
          {/* Header Row: GPS Badge + "เฉพาะแจ้งเหตุเท่านั้น" + Prev/Next pagination */}
          <div className="flex items-center justify-between gap-2 border-b border-rose-800/60 pb-1.5 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="p-1 sm:p-1.5 bg-rose-600 text-white rounded-lg animate-pulse shrink-0 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </span>
              <span className="font-extrabold text-rose-300 text-[11px] sm:text-xs tracking-tight truncate">
                🚨 โพสต์แจ้งเหตุตามพิกัด GPS อุปกรณ์
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/30 text-rose-200 text-[10px] font-bold border border-rose-400/30 shrink-0">
                เฉพาะแจ้งเหตุเท่านั้น
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Pagination counter */}
              <span className="text-[10px] sm:text-xs font-bold text-rose-200/90 px-1.5 py-0.5 bg-black/40 rounded-md">
                {currentIndex + 1}/{gpsIncidents.length} เหตุการณ์
              </span>

              {gpsIncidents.length > 1 && (
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={handlePrev}
                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
                    title="เหตุการณ์ก่อนหน้า"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
                    title="เหตุการณ์ถัดไป"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Minimize / Expand Toggle */}
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition"
                title={isMinimized ? 'ขยายแถบแจ้งเหตุ' : 'ย่อแถบแจ้งเหตุ'}
              >
                {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isMinimized && (
            <div className="flex items-start justify-between gap-3 pt-0.5">
              {/* Left thumbnail if images exist */}
              {currentIncident.images && currentIncident.images.length > 0 && (
                <div
                  onClick={() => handleViewIncidentDetail(currentIncident)}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-900 border border-rose-400/40 shrink-0 cursor-pointer group flex items-center justify-center shadow-md"
                >
                  <img
                    src={currentIncident.images[0]}
                    alt="Incident thumb"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                  {currentIncident.images.length > 1 && (
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 text-white text-[9px] font-bold rounded-sm">
                      +{currentIncident.images.length - 1} รูป
                    </span>
                  )}
                </div>
              )}

              {/* Middle Incident Info */}
              <div
                onClick={() => handleViewIncidentDetail(currentIncident)}
                className="min-w-0 flex-1 cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-amber-300 font-bold mb-0.5 flex-wrap">
                  {currentIncident.distanceStr ? (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      ห่างจากอุปกรณ์คุณ {currentIncident.distanceStr}
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-300">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      {currentIncident.district ? `อ.${currentIncident.district}, ` : ''}จ.{currentIncident.province}
                    </span>
                  )}
                  <span className="text-slate-400">• {timeAgo(currentIncident.createdAt)}</span>
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-200 transition line-clamp-1 leading-snug">
                  {currentIncident.title}
                </h4>

                <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1 mt-0.5">
                  {currentIncident.description}
                </p>
              </div>

              {/* Right Action Buttons */}
              <div className="flex flex-col gap-1.5 shrink-0 self-center">
                <button
                  onClick={() => handleViewIncidentDetail(currentIncident)}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-md shadow-rose-900/40"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ดูโพสต์เต็ม</span>
                  <span className="sm:hidden">ดูโพสต์</span>
                </button>

                {currentIncident.coordinates?.lat && currentIncident.coordinates?.lng && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const lat = currentIncident.coordinates!.lat;
                      const lng = currentIncident.coordinates!.lng;
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                    }}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:scale-95 text-sky-200 rounded-xl text-[10px] font-semibold transition flex items-center justify-center gap-1"
                    title="นำทาง Google Maps ไปยังจุดแจ้งเหตุ"
                  >
                    <Navigation className="w-3 h-3 text-sky-400" />
                    <span>นำทาง</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Minimized slim preview row */}
          {isMinimized && (
            <div
              onClick={() => handleViewIncidentDetail(currentIncident)}
              className="flex items-center justify-between gap-2 text-xs cursor-pointer group py-0.5"
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping shrink-0" />
                <span className="font-bold text-white text-xs truncate group-hover:text-rose-200">
                  {currentIncident.title}
                </span>
                {currentIncident.distanceStr && (
                  <span className="text-[10px] text-amber-300 shrink-0">
                    ({currentIncident.distanceStr})
                  </span>
                )}
              </div>
              <span className="text-[10px] text-rose-300 underline shrink-0 font-semibold">
                แตะดูรายละเอียด
              </span>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* CASE B: No Incident in Current Device GPS Radius - Reassurance & Status   */
        /* ========================================================================= */
        <div className="bg-slate-900/95 text-white rounded-2xl sm:rounded-3xl border border-slate-700/80 p-2.5 sm:p-3 shadow-lg flex items-center justify-between gap-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-300 truncate">
                  พิกัด GPS อุปกรณ์ของคุณปลอดภัย
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-white/10 text-slate-300 text-[10px] shrink-0 font-medium">
                  เฉพาะแจ้งเหตุ
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                {location.lat && location.lng
                  ? `📍 พิกัด ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} (${location.district ? `อ.${location.district}, ` : ''}จ.${location.province}): ไม่พบเหตุฉุกเฉินในรัศมี`
                  : `พื้นที่ ${location.province} (${location.district || 'ทุกอำเภอ'}): ไม่พบเหตุการณ์ในขณะนี้`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Real GPS Refresh Button */}
            <button
              onClick={() => requestRealLocation()}
              disabled={isLocatingGps}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition active:scale-95"
              title="ตรวจจับพิกัด GPS สดจากอุปกรณ์อีกครั้ง"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLocatingGps ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">{isLocatingGps ? 'ค้นหา GPS...' : 'เช็ก GPS'}</span>
            </button>

            {/* Quick Report Alert Button */}
            {onOpenReportAlert && (
              <button
                onClick={onOpenReportAlert}
                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1 transition active:scale-95 shadow-md shadow-rose-900/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>แจ้งเหตุด่วน</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
