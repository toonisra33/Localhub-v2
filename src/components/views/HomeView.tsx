import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Bell,
  AlertTriangle,
  Calendar,
  ShoppingBag,
  Camera,
  Navigation,
  ChevronDown,
  UtensilsCrossed,
  Megaphone,
  CloudSun,
  Store,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Briefcase,
  Plus,
  Flame,
  CloudRain,
  Car,
  Zap,
  ThumbsUp,
  Flag,
  AlertOctagon,
  ExternalLink,
  Heart,
  Share2
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { JobsModal } from '../modals/JobsModal';
import { PostImageGallery } from '../PostImageGallery';
import { PostActionMenu } from '../PostActionMenu';
import { Post, AlertReport } from '../../types';

interface HomeViewProps {
  onOpenCreatePost: () => void;
  onOpenInstantCamera?: () => void;
  onOpenNotifications: () => void;
  onOpenReportAlert?: () => void;
}

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
    return `${Math.max(50, Math.round(km * 1000))} ม.`;
  }
  return `${km.toFixed(1)} กม.`;
}

interface UnifiedIncident {
  id: string;
  sourceType: 'post' | 'alert';
  title: string;
  content: string;
  category?: string;
  type?: AlertReport['type'];
  severity?: 'low' | 'medium' | 'high' | 'critical';
  province: string;
  district?: string;
  subdistrict?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: number;
  reporter: string;
  reporterAvatar?: string;
  reporterRole?: string;
  images?: string[];
  verifiedCount: number;
  notFoundCount: number;
  userVerified?: boolean;
  userReportedNotFound?: boolean;
  isFakeReport?: boolean;
  distanceKm?: number;
  distanceStr?: string;
  originalPost?: Post;
  originalAlert?: AlertReport;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenCreatePost,
  onOpenInstantCamera,
  onOpenNotifications,
  onOpenReportAlert
}) => {
  const {
    location,
    openLocationModal,
    setActiveTab,
    unreadNotifCount,
    openContactAdminModal,
    showToast,
    currentUser,
    requestRealLocation,
    isLocatingGps,
    posts,
    marketItems,
    alerts,
    confirmAlert,
    reportAlertNotFound,
    openPostDetail,
    likeMarketItem
  } = useCommunity();

  const [isJobsModalOpen, setIsJobsModalOpen] = useState(false);

  // 1. Gather & Filter ALL Incident Posts (เฉพาะแจ้งเหตุเท่านั้น) by user device GPS
  const allGpsIncidents = useMemo<UnifiedIncident[]>(() => {
    const rawList: UnifiedIncident[] = [];

    // A. Posts with category === 'alert'
    posts
      .filter((p) => p && p.category === 'alert')
      .forEach((p) => {
        rawList.push({
          id: p.id,
          sourceType: 'post',
          title: p.title,
          content: p.content,
          category: 'alert',
          type: 'accident',
          severity: 'high',
          province: p.location.province,
          district: p.location.district,
          subdistrict: p.location.subdistrict,
          address: p.location.address,
          coordinates: p.coordinates,
          createdAt: p.createdAt,
          reporter: p.author,
          reporterAvatar: p.authorAvatar,
          reporterRole: p.authorRole,
          images: p.images,
          verifiedCount: Math.max(1, p.likes || 1),
          notFoundCount: 0,
          originalPost: p
        });
      });

    // B. Alerts from alerts repository
    alerts.forEach((a) => {
      if (!rawList.some((item) => item.id === a.id)) {
        rawList.push({
          id: a.id,
          sourceType: 'alert',
          title: a.title,
          content: a.description,
          type: a.type,
          severity: a.severity,
          province: a.province,
          district: a.district,
          subdistrict: a.subdistrict,
          address: a.locationName,
          coordinates: a.coordinates,
          createdAt: a.createdAt,
          reporter: typeof a.reporter === 'string' ? a.reporter : 'ประชาชนในพื้นที่',
          reporterAvatar: a.reporterAvatar,
          images: a.images,
          verifiedCount: a.verifiedCount || 1,
          notFoundCount: a.notFoundCount || 0,
          userVerified: a.userVerified,
          userReportedNotFound: a.userReportedNotFound,
          isFakeReport: a.isFakeReport,
          originalAlert: a
        });
      }
    });

    const userLat = location.lat;
    const userLng = location.lng;
    const userProvince = (location.province || '').trim().toLowerCase();
    const userDistrict = (location.district || '').trim().toLowerCase();

    // Calculate distance and filter according to GPS area
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

    // Filter strictly by GPS area (within 40km or matching province/district)
    const filtered = listWithDistance.filter((item) => {
      if (item.distanceKm !== undefined) {
        if (item.distanceKm <= 40) return true;
      }

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

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'เมื่อสักครู่';
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ชม. ที่แล้ว`;
    return `${Math.floor(hours / 24)} วันที่แล้ว`;
  };

  const getAlertIcon = (type?: AlertReport['type']) => {
    switch (type) {
      case 'flood':
        return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'weather':
        return <CloudRain className="w-4 h-4 text-sky-500" />;
      case 'accident':
        return <Car className="w-4 h-4 text-amber-500" />;
      case 'fire':
        return <Flame className="w-4 h-4 text-red-500" />;
      case 'power_cut':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    }
  };

  const getSeverityBadge = (sev?: 'low' | 'medium' | 'high' | 'critical') => {
    switch (sev) {
      case 'critical':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-600 text-white animate-pulse">วิกฤต (Critical)</span>;
      case 'high':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-600 text-white">สูง (High)</span>;
      case 'medium':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white">ปานกลาง</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-500 text-white">เฝ้าระวัง</span>;
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn pb-16">
      {/* 1. Dark Navy Top Header */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-emerald-900/40 shrink-0 flex items-center justify-center">
              <img
                src="/icon.svg"
                alt="LocalHub"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/apple-touch-icon.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Local<span className="text-emerald-400">Hub</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  ● LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">ศูนย์รวมชุมชน & บรอดแคสต์สด</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openContactAdminModal}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ติดต่อแอดมิน</span>
            </button>

            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="การแจ้งเตือน"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <img
              src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border border-emerald-400 shadow-sm cursor-pointer"
              onClick={() => setActiveTab('profile')}
            />
          </div>
        </div>

        {/* Location Banner with Real GPS Button */}
        <div className="mt-3.5 p-3 sm:p-3.5 bg-slate-900/90 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-2.5 shadow-inner min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-400 font-bold mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate">พื้นที่ปัจจุบันตาม GPS</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-white text-xs sm:text-base tracking-tight truncate">
                {location.district ? `${location.district}, ${location.province}` : location.province}
              </h3>
              <button
                onClick={openLocationModal}
                className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-md text-[10px] sm:text-[11px] font-semibold flex items-center gap-0.5 transition shrink-0"
              >
                <span>เปลี่ยน</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
              {location.lat && location.lng
                ? `📍 พิกัด GPS จริง: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} • ${location.displayName || `จ.${location.province}`}`
                : `${location.district ? `อ.${location.district} • ` : ''}จ.${location.province}`}
            </p>
          </div>

          <button
            onClick={() => requestRealLocation()}
            disabled={isLocatingGps}
            className={`px-3 py-2 sm:px-3.5 sm:py-2.5 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-95 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition shrink-0 ${
              isLocatingGps ? 'opacity-85 cursor-wait' : ''
            }`}
            title="ตรวจจับพิกัด GPS จริง ณ ตำแหน่งอุปกรณ์ของคุณ"
          >
            {isLocatingGps ? (
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin shrink-0" />
            ) : (
              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white shrink-0" />
            )}
            <span>{isLocatingGps ? 'กำลังระบุ GPS...' : 'GPS จริง'}</span>
          </button>
        </div>
      </div>

      {/* 2. Daily Summary Card */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg shadow-md shadow-amber-500/30">
              ☀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  สรุปประจำวันรอบตัวคุณ
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  สดวันนี้
                </span>
              </div>
              <p className="text-xs text-slate-500">อัปเดตสถานการณ์ล่าสุดในพื้นที่</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => setActiveTab('weather')}
            className="p-3 bg-sky-50/70 hover:bg-sky-100/80 border border-sky-100 rounded-2xl flex items-center gap-2.5 text-left transition active:scale-98"
          >
            <div className="p-2 bg-sky-500 text-white rounded-xl shrink-0">
              <CloudSun className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">พยากรณ์อากาศสดประจำวัน</div>
              <div className="text-[10px] text-slate-500 truncate">เรดาร์เมฆฝน & สภาพอากาศตามพิกัดจริง</div>
            </div>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('incident-posts-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-3 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-100 rounded-2xl flex items-center gap-2.5 text-left transition active:scale-98"
          >
            <div className="p-2 bg-rose-500 text-white rounded-xl shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                🚨 แจ้งเหตุในพื้นที่ ({allGpsIncidents.length} เหตุการณ์)
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {allGpsIncidents.length > 0 ? allGpsIncidents[0].title : 'ไม่มีเหตุการณ์วิกฤติตรวจพบในขณะนี้'}
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className="p-3 bg-purple-50/70 hover:bg-purple-100/80 border border-purple-100 rounded-2xl flex items-center gap-2.5 text-left transition active:scale-98"
          >
            <div className="p-2 bg-purple-500 text-white rounded-xl shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {posts.length > 0 ? `ฟีดชุมชน (${posts.length} โพสต์สด)` : 'ฟีดข่าวสารชุมชน'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {posts.length > 0 ? posts[0].title : 'พูดคุยแลกเปลี่ยนเรื่องราวกับเพื่อนบ้าน'}
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('market')}
            className="p-3 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-100 rounded-2xl flex items-center gap-2.5 text-left transition active:scale-98"
          >
            <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">
                {marketItems.length > 0 ? `ตลาดชุมชน (${marketItems.length} รายการ)` : 'ตลาดนัดชุมชน'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {marketItems.length > 0 ? marketItems[0].title : 'ซื้อขายสินค้าและของกินในท้องถิ่น'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Services & Quick Actions (นำปุ่มแจ้งเหตุ และตลาด มาแสดงผลที่หน้าหลักอย่างโดดเด่น) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-slate-900 text-sm">บริการและเรื่องด่วนหน้าหลัก</h3>
          <span className="text-[11px] text-slate-400">แตะเพื่อเปิดบริการ</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2.5">
          {/* 1. แจ้งเหตุฉุกเฉิน (นำปุ่มแจ้งเหตุมาไว้หน้าหลัก) */}
          <button
            onClick={() => (onOpenReportAlert ? onOpenReportAlert() : setActiveTab('alerts'))}
            className="p-2 sm:p-3 bg-gradient-to-b from-rose-50 to-red-100/80 hover:from-rose-100 hover:to-red-200 border-2 border-rose-300 rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-sm group"
          >
            <div className="p-2 bg-rose-600 text-white rounded-xl mb-1 sm:mb-1.5 shadow-md shadow-rose-600/30 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-rose-950 truncate w-full">แจ้งเหตุด่วน</span>
          </button>

          {/* 2. ตลาดนัดชุมชน (นำปุ่มตลาดมาไว้หน้าหลัก แตะเข้าดูตลาดชุมชนได้ทันที) */}
          <button
            onClick={() => setActiveTab('market')}
            className="p-2 sm:p-3 bg-gradient-to-b from-emerald-50 to-teal-100/80 hover:from-emerald-100 hover:to-teal-200 border-2 border-emerald-300 rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-sm group"
          >
            <div className="p-2 bg-emerald-600 text-white rounded-xl mb-1 sm:mb-1.5 shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-emerald-950 truncate w-full">ตลาดนัดชุมชน</span>
          </button>

          {/* 3. ติดต่อแอดมิน */}
          <button
            onClick={openContactAdminModal}
            className="p-1.5 sm:p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-xs"
          >
            <div className="p-1.5 sm:p-2 bg-indigo-600 text-white rounded-xl mb-1 sm:mb-1.5 shadow-sm">
              <Megaphone className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate w-full">ติดต่อแอดมิน</span>
          </button>

          {/* 4. กินอะไรดี */}
          <button
            onClick={() => {
              setActiveTab('market');
              showToast('เปิดร้านอาหารและของกินยอดนิยมในตลาดชุมชน', 'info');
            }}
            className="p-1.5 sm:p-3 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-xs"
          >
            <div className="p-1.5 sm:p-2 bg-amber-600 text-white rounded-xl mb-1 sm:mb-1.5 shadow-sm">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate w-full">กินอะไรดี</span>
          </button>

          {/* 5. หางาน */}
          <button
            onClick={() => setIsJobsModalOpen(true)}
            className="p-1.5 sm:p-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-xs"
          >
            <div className="p-1.5 sm:p-2 bg-blue-600 text-white rounded-xl mb-1 sm:mb-1.5 shadow-sm">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-900 truncate w-full">หางาน</span>
          </button>

          {/* 6. รอบตัวฉัน */}
          <button
            onClick={() => setActiveTab('map')}
            className="p-1.5 sm:p-3 bg-teal-50 hover:bg-teal-100 border border-teal-100 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center transition active:scale-95 shadow-xs"
          >
            <div className="p-1.5 sm:p-2 bg-teal-600 text-white rounded-xl mb-1 sm:mb-1.5 shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 truncate w-full">รอบตัวฉัน</span>
          </button>
        </div>
      </div>

      {/* 4. Quick Share / Post Box */}
      <div className="p-3.5 sm:p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-3">
        <img
          src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
        />
        <button
          onClick={onOpenCreatePost}
          className="flex-1 text-left px-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 rounded-2xl text-xs sm:text-sm text-slate-500 font-medium transition"
        >
          มีอะไรเกิดขึ้นในพื้นที่? แชร์กับเพื่อนบ้าน...
        </button>
        {onOpenInstantCamera && (
          <button
            onClick={onOpenInstantCamera}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-300 transition shrink-0 active:scale-95"
            title="เปิดกล้องถ่ายภาพสดทันที"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. โพสต์แจ้งเหตุให้รวมอยู่ในหน้าหลักทั้งหมด (เฉพาะแจ้งเหตุเท่านั้น ตาม GPS) */}
      {/* ========================================================================= */}
      <section
        id="incident-posts-section"
        aria-label="โพสต์แจ้งเหตุฉุกเฉินในพื้นที่ทั้งหมด"
        className="space-y-3 pt-2"
      >
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-950 via-red-950 to-slate-950 text-white rounded-3xl shadow-xl border border-rose-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black tracking-wide shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                เฉพาะแจ้งเหตุเท่านั้น (GPS AREA)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-rose-200 text-[10px] font-bold">
                {allGpsIncidents.length} เหตุการณ์สด
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              โพสต์แจ้งเหตุฉุกเฉินในพื้นที่รอบตัวคุณ
            </h2>
            <p className="text-xs text-rose-200/80 mt-0.5 leading-relaxed">
              รวมโพสต์รายงานเหตุ อุบัติเหตุ และภัยพิบัติตามพิกัด GPS อุปกรณ์ของคุณ พร้อมระบบร่วมยืนยันข้อมูล
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => (onOpenReportAlert ? onOpenReportAlert() : setActiveTab('alerts'))}
              className="px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-950 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-black/30 transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-rose-600" />
              <span>+ แจ้งเหตุด่วน</span>
            </button>
          </div>
        </div>

        {/* Anti-Fake News Reassurance */}
        <div className="p-3 bg-amber-500/10 border border-amber-300/60 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="leading-snug">
            <strong>ระบบร่วมตรวจสอบโดยประชาชน:</strong> ทุกโพสต์แจ้งเหตุสามารถกดยืนยันเหตุจริง หรือแจ้งไม่พบเหตุเพื่อคัดกรองข่าวปลอมได้ทันที
          </p>
        </div>

        {/* List of All Incident Posts on Home Page */}
        <div className="space-y-3">
          {allGpsIncidents.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2 text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                ไม่มีรายงานเหตุด่วนในรัศมีพิกัด GPS ของอุปกรณ์คุณ
              </h3>
              <p className="text-xs text-slate-500">
                พื้นที่ {location.district ? `อ.${location.district}, ` : ''}จ.{location.province} ปลอดภัยในขณะนี้
              </p>
              {onOpenReportAlert && (
                <button
                  onClick={onOpenReportAlert}
                  className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>แจ้งเหตุใหม่เป็นคนแรก</span>
                </button>
              )}
            </div>
          ) : (
            allGpsIncidents.map((incident) => {
              const notFound = incident.notFoundCount || 0;
              const isSuspectedFake = incident.isFakeReport || (notFound >= 3 && notFound > incident.verifiedCount);
              const isHighCredibility = incident.verifiedCount >= 3 && incident.verifiedCount > notFound * 2;

              return (
                <article
                  key={incident.id}
                  className={`p-4 sm:p-5 bg-white rounded-3xl border shadow-xs transition-all space-y-3 ${
                    isSuspectedFake
                      ? 'border-red-300 bg-red-50/20'
                      : 'border-slate-200/90 hover:border-rose-300'
                  }`}
                >
                  {/* Top Badge & Distance */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="p-2.5 rounded-2xl bg-rose-50 border border-rose-100 shrink-0">
                        {getAlertIcon(incident.type)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getSeverityBadge(incident.severity)}

                          {incident.distanceStr ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300/80">
                              <MapPin className="w-3 h-3 text-amber-600" />
                              ห่างจากอุปกรณ์คุณ {incident.distanceStr}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {incident.district ? `อ.${incident.district}, ` : ''}จ.{incident.province}
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400">
                            • {timeAgo(incident.createdAt)}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1 leading-snug">
                          {incident.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                        🚨 แจ้งเหตุด่วน
                      </span>
                      <PostActionMenu
                        post={{
                          id: incident.id,
                          title: incident.title,
                          content: incident.content,
                          author: incident.reporter,
                          authorRole: incident.reporterRole,
                          category: incident.category || 'alert',
                          location: {
                            province: incident.province,
                            district: incident.district,
                            subdistrict: incident.subdistrict,
                            address: incident.address
                          },
                          coordinates: incident.coordinates,
                          createdAt: incident.createdAt,
                          images: incident.images
                        }}
                      />
                    </div>
                  </div>

                  {/* Content / Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line pl-1 sm:pl-11">
                    {incident.content}
                  </p>

                  {/* Incident Images: Full display, max 4, view more button */}
                  {incident.images && incident.images.length > 0 && (
                    <div className="pl-1 sm:pl-11 pt-1">
                      <PostImageGallery images={incident.images} maxDisplay={4} />
                    </div>
                  )}

                  {/* Fake News Warning or Credibility Banner */}
                  {isSuspectedFake ? (
                    <div className="p-2.5 bg-red-100/90 border border-red-300 rounded-2xl text-xs text-red-900 font-bold flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                      <span>⚠️ คำเตือนจากระบบ: มีประชาชน {notFound} คนรายงานว่าไม่พบเหตุจริง (โปรดระวังข่าวปลอม)</span>
                    </div>
                  ) : isHighCredibility ? (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>✅ ข้อมูลน่าเชื่อถือ: ได้รับการยืนยันจากคนในพื้นที่แล้ว {incident.verifiedCount} คน</span>
                    </div>
                  ) : null}

                  {/* Action Toolbar: Confirm, Not found, Map, Google Maps */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <img
                        src={incident.reporterAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={incident.reporter}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>รายงานโดย: <strong className="text-slate-700">{incident.reporter}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Confirm Button */}
                      <button
                        onClick={() => confirmAlert(incident.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 ${
                          incident.userVerified
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                        title="ยืนยันว่ามีเหตุการณ์เกิดขึ้นจริง"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${incident.userVerified ? 'fill-white' : ''}`} />
                        <span>{incident.userVerified ? 'ยืนยันเหตุแล้ว' : 'ยืนยันเหตุจริง'} ({incident.verifiedCount})</span>
                      </button>

                      {/* Anti-Fake news button */}
                      <button
                        onClick={() => reportAlertNotFound(incident.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 ${
                          incident.userReportedNotFound
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
                        }`}
                        title="รายงานว่าไม่พบเหตุการณ์จริง"
                      >
                        <Flag className={`w-3.5 h-3.5 ${incident.userReportedNotFound ? 'fill-white' : ''}`} />
                        <span>{incident.userReportedNotFound ? 'แจ้งไม่พบแล้ว' : 'ไม่พบเหตุ'} ({notFound})</span>
                      </button>

                      {/* View on In-App Map */}
                      <button
                        onClick={() => {
                          setActiveTab('map');
                          showToast(`เปิดแผนที่จุดเกิดเหตุ: ${incident.title}`, 'info');
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1 transition active:scale-95"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ดูบนแผนที่</span>
                      </button>

                      {/* Google Maps Direct Navigation */}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${incident.coordinates?.lat || 13.7525},${incident.coordinates?.lng || 100.4990}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          const lat = incident.coordinates?.lat || 13.7525;
                          const lng = incident.coordinates?.lng || 100.4990;
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm transition"
                        title="เปิด Google Maps นำทางไปยังจุดแจ้งเหตุ"
                      >
                        <Navigation className="w-3.5 h-3.5 fill-white text-white" />
                        <span>นำทาง</span>
                        <ExternalLink className="w-3 h-3 text-blue-200" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* Local Community Jobs Modal */}
      <JobsModal isOpen={isJobsModalOpen} onClose={() => setIsJobsModalOpen(false)} />
    </div>
  );
};
