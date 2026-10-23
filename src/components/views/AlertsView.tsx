import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  Flame,
  CloudRain,
  Car,
  Zap,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  ThumbsUp,
  AlertOctagon,
  Navigation,
  Compass,
  ExternalLink,
  ShieldCheck,
  Flag,
  ArrowLeft,
  Heart,
  MessageSquare,
  Share2,
  Clock,
  Globe,
  Search,
  Sparkles
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { AlertReport, Post } from '../../types';
import { WeatherWidget } from '../WeatherWidget';
import { PostImageGallery } from '../PostImageGallery';
import { PostActionMenu } from '../PostActionMenu';

interface AlertsViewProps {
  onOpenReportAlert: () => void;
  onOpenWeather?: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onOpenReportAlert, onOpenWeather }) => {
  const {
    alerts,
    location,
    showToast,
    confirmAlert,
    reportAlertNotFound,
    likeAlert,
    shareAlert,
    setActiveTab,
    goBack,
    openPostDetail
  } = useCommunity();

  // Mode: 'trending' (โพสต์ที่ได้รับความสนใจ) | 'latest' (โพสต์ใหม่)
  const [viewSortMode, setViewSortMode] = useState<'trending' | 'latest'>('trending');
  // Scope: 'all_platform' (รวบรวมเหตุการณ์ของทุกคนในแพลตฟอร์มทุกบัญชี) | 'local_only' (เฉพาะพื้นที่)
  const [scopeFilter, setScopeFilter] = useState<'all_platform' | 'local_only'>('all_platform');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate engagement score: (verifiedCount * 3) + (likes * 2) + (shares * 3) + (commentsCount * 2)
  const getEngagementScore = (a: AlertReport) => {
    const verified = a.verifiedCount || 0;
    const likes = a.likes || 0;
    const shares = a.shares || 0;
    const comments = a.commentsCount || 0;
    return (verified * 3) + (likes * 2) + (shares * 3) + (comments * 2);
  };

  const processedAlerts = useMemo(() => {
    // 1. Filter by platform scope
    let list = alerts.filter(a => {
      if (scopeFilter === 'local_only') {
        const isLocal = a.province?.trim() === location.province?.trim();
        if (!isLocal) return false;
      }
      return true;
    });

    // 2. Filter by incident category
    if (filterType !== 'all') {
      list = list.filter(a => a.type === filterType);
    }

    // 3. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(a => {
        const title = (a.title || '').toLowerCase();
        const desc = (a.description || '').toLowerCase();
        const loc = (a.locationName || `${a.subdistrict} ${a.district} ${a.province}`).toLowerCase();
        const reporter = (typeof a.reporter === 'string' ? a.reporter : '').toLowerCase();
        return title.includes(q) || desc.includes(q) || loc.includes(q) || reporter.includes(q);
      });
    }

    // 4. Sort by View Mode: Trending (ดันโพสต์ที่ได้รับความสนใจ) VS Latest (โพสต์ใหม่)
    const sorted = [...list];
    if (viewSortMode === 'trending') {
      sorted.sort((a, b) => {
        const scoreB = getEngagementScore(b);
        const scoreA = getEngagementScore(a);
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
    } else {
      // โพสต์ใหม่ เรียงจากล่าสุดไปเก่าสุด
      sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return sorted;
  }, [alerts, scopeFilter, filterType, searchQuery, viewSortMode, location.province]);

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'เมื่อสักครู่';
    if (hours < 24) return `${hours} ชม. ที่แล้ว`;
    return `${Math.floor(hours / 24)} วันที่แล้ว`;
  };

  const getAlertIcon = (type: AlertReport['type']) => {
    switch (type) {
      case 'flood': return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'weather': return <CloudRain className="w-5 h-5 text-sky-500" />;
      case 'accident': return <Car className="w-5 h-5 text-amber-500" />;
      case 'fire': return <Flame className="w-5 h-5 text-red-500" />;
      case 'power_cut': return <Zap className="w-5 h-5 text-yellow-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    }
  };

  const getSeverityBadge = (sev: AlertReport['severity']) => {
    switch (sev) {
      case 'critical':
        return <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-red-600 text-white animate-pulse">วิกฤต (Critical)</span>;
      case 'high':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-600 text-white">สูง (High)</span>;
      case 'medium':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white">ปานกลาง</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-500 text-white">เล็กน้อย</span>;
    }
  };

  const handleOpenAlertDiscussion = (alert: AlertReport) => {
    const pseudoPost: Post = {
      id: alert.id,
      title: alert.title,
      content: alert.description,
      author: typeof alert.reporter === 'string' ? alert.reporter : 'ประชาชนในพื้นที่',
      authorAvatar: alert.reporterAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      category: 'alert',
      location: {
        province: alert.province,
        district: alert.district,
        subdistrict: alert.subdistrict,
        address: alert.locationName
      },
      coordinates: alert.coordinates,
      createdAt: alert.createdAt,
      likes: alert.likes || 0,
      shares: alert.shares || 0,
      commentsCount: alert.commentsCount || 0,
      comments: [],
      images: alert.images
    };
    openPostDetail(pseudoPost);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* Live Accurate Weather Status in Alerts View */}
      <WeatherWidget compact onOpenFullForecast={onOpenWeather} />

      {/* Alert Center Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-950 via-red-900 to-rose-900 text-white rounded-3xl shadow-lg border border-red-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-800/80 text-rose-200 text-xs font-bold mb-1 border border-rose-700/50">
            <ShieldAlert className="w-3.5 h-3.5" />
            ศูนย์ข่าวและรายงานเหตุฉุกเฉิน (News & Incident Center)
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">ศูนย์ข่าวแจ้งเหตุฉุกเฉินและเตือนภัย</h2>
          <p className="text-xs text-rose-100 max-w-lg mt-0.5 leading-relaxed">
            รวบรวมเหตุการแจ้งเหตุของทุกคนในแพลตฟอร์มทุกบัญชี พร้อมระบบดันโพสต์ที่ได้รับความสนใจสูงจากชุมชน
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={goBack}
            className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-white/20 transition active:scale-95 cursor-pointer"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-white/20 transition active:scale-95 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>ดูแผนที่จริง</span>
          </button>

          <button
            onClick={onOpenReportAlert}
            className="px-4 py-2.5 bg-white text-rose-950 hover:bg-rose-50 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-rose-600" />
            <span>แจ้งเหตุด่วน</span>
          </button>
        </div>
      </div>

      {/* 🌟 2 PRIMARY TABS: โพสต์ที่ได้รับความสนใจ (TRENDING) VS โพสต์ใหม่ (LATEST) 🌟 */}
      <div className="p-1.5 bg-slate-200/90 rounded-2xl border border-slate-300 shadow-xs grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setViewSortMode('trending')}
          className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer ${
            viewSortMode === 'trending'
              ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Flame className={`w-4 h-4 ${viewSortMode === 'trending' ? 'text-amber-300 fill-amber-300 animate-pulse' : 'text-rose-500'}`} />
          <span>🔥 โพสต์ที่ได้รับความสนใจ</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
            viewSortMode === 'trending' ? 'bg-rose-700 text-white' : 'bg-rose-100 text-rose-800'
          }`}>
            ดันโพสต์ยอดนิยม
          </span>
        </button>

        <button
          type="button"
          onClick={() => setViewSortMode('latest')}
          className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer ${
            viewSortMode === 'latest'
              ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-700'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Clock className={`w-4 h-4 ${viewSortMode === 'latest' ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span>⏱️ โพสต์ใหม่</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
            viewSortMode === 'latest' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
          }`}>
            ตามเวลาจริง
          </span>
        </button>
      </div>

      {/* Platform Scope Filter: ทั่วประเทศ (ทุกคนในแพลตฟอร์ม) VS เฉพาะพื้นที่ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="text-xs font-bold text-slate-800">ขอบเขตข้อมูลเหตุการณ์:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setScopeFilter('all_platform')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                scopeFilter === 'all_platform'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌐 ทุกคนในแพลตฟอร์ม ({alerts.length})
            </button>
            <button
              onClick={() => setScopeFilter('local_only')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                scopeFilter === 'local_only'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📍 เฉพาะ {location.province}
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาจุดแจ้งเหตุ, น้ำท่วม, ถนน..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Anti-Fake News Info Banner */}
      <div className="p-3 bg-amber-500/10 border border-amber-300/60 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="leading-snug">
          <strong>ระบบร่วมตรวจสอบโดยชุมชน:</strong> คนในพื้นที่สามารถกดยืนยันเหตุจริง หรือกดรายงานไม่พบเหตุเพื่อคัดกรองข่าวปลอมได้ทันที
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'ทั้งหมด' },
          { id: 'weather', label: '🌤️ สภาพอากาศ' },
          { id: 'flood', label: '🌊 น้ำท่วม' },
          { id: 'accident', label: '🚗 อุบัติเหตุ' },
          { id: 'fire', label: '🔥 ไฟไหม้' },
          { id: 'power_cut', label: '⚡ ไฟฟ้าดับ' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterType(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              filterType === cat.id
                ? 'bg-rose-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3.5">
        {processedAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
            <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
            <h4 className="font-bold text-slate-700 text-sm">ไม่มีรายงานเหตุการณ์ในหมวดหมู่นี้</h4>
            <p className="text-xs text-slate-400">
              {scopeFilter === 'local_only'
                ? `ไม่พบเหตุการณ์ในพื้นที่ ${location.province} ลองสลับเป็นดูทุกคนในแพลตฟอร์ม`
                : 'ยังไม่มีรายงานเหตุฉุกเฉินที่ตรงกับเงื่อนไขการค้นหา'}
            </p>
          </div>
        ) : (
          processedAlerts.map(alert => {
            const notFound = alert.notFoundCount || 0;
            const isSuspectedFake = alert.isFakeReport || (notFound >= 3 && notFound > alert.verifiedCount);
            const isHighCredibility = alert.verifiedCount >= 3 && alert.verifiedCount > notFound * 2;
            const engagementScore = getEngagementScore(alert);
            const isTrending = viewSortMode === 'trending' || engagementScore >= 15;

            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 bg-white rounded-3xl border shadow-xs transition-all space-y-3 ${
                  isSuspectedFake
                    ? 'border-red-300 bg-red-50/20'
                    : isTrending
                    ? 'border-rose-300 hover:border-rose-400 hover:shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 shrink-0 shadow-2xs mt-0.5">
                      {getAlertIcon(alert.type)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getSeverityBadge(alert.severity)}

                        {/* Trending Boost Badge */}
                        {isTrending && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-600 fill-rose-600" />
                            <span>ได้รับความสนใจสูง ({engagementScore} ปฏิสัมพันธ์)</span>
                          </span>
                        )}

                        {viewSortMode === 'latest' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{timeAgo(alert.createdAt || Date.now())}</span>
                          </span>
                        )}

                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          {alert.province} {alert.district ? `• ${alert.district}` : ''} {alert.subdistrict ? `• ${alert.subdistrict}` : ''}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1 leading-snug">
                        {alert.title}
                      </h3>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap mt-0.5">
                        <span>ผู้แจ้ง: <strong className="text-slate-600">{typeof alert.reporter === 'string' ? alert.reporter : 'ประชาชนในพื้นที่'}</strong></span>
                        <span>•</span>
                        <span>{timeAgo(alert.createdAt || Date.now())}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold shrink-0 ${
                      alert.status === 'active'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {alert.status === 'active' ? '● กำลังเกิดเหตุ' : 'กำลังตรวจสอบ'}
                    </span>
                    <PostActionMenu
                      post={{
                        id: alert.id,
                        title: alert.title,
                        content: alert.description,
                        author: typeof alert.reporter === 'string' ? alert.reporter : 'ประชาชนในพื้นที่',
                        category: 'alert',
                        location: {
                          province: alert.province,
                          district: alert.district,
                          subdistrict: alert.subdistrict,
                          address: alert.locationName
                        },
                        coordinates: alert.coordinates,
                        createdAt: alert.createdAt,
                        images: alert.images
                      }}
                    />
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-1 sm:pl-11 whitespace-pre-line">
                  {alert.description}
                </p>

                {/* Evidence Photos (แสดงภาพหลักฐานตามจริง) */}
                {alert.images && alert.images.length > 0 && (
                  <div className="pl-1 sm:pl-11 pt-1">
                    <PostImageGallery images={alert.images} maxDisplay={4} />
                  </div>
                )}

                {/* Fake News Warning or Credibility Banner */}
                {isSuspectedFake ? (
                  <div className="p-2.5 bg-red-100/80 border border-red-300 rounded-2xl text-xs text-red-900 font-bold flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                    <span>⚠️ คำเตือนจากระบบ: มีประชาชน {notFound} คนรายงานว่าไม่พบเหตุจริง (ระวังข่าวปลอม)</span>
                  </div>
                ) : isHighCredibility ? (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✅ ข้อมูลน่าเชื่อถือ: ได้รับการยืนยันจากคนในพื้นที่แล้ว {alert.verifiedCount} คน</span>
                  </div>
                ) : null}

                {/* Engagement Bar: Likes, Comments, Shares */}
                <div className="pl-1 sm:pl-11 py-1 flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      likeAlert(alert.id);
                    }}
                    className={`flex items-center gap-1.5 font-bold transition active:scale-90 cursor-pointer ${
                      alert.isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                    }`}
                    title="กดไลค์ให้กำลังใจหรือรับทราบเหตุการณ์"
                  >
                    <Heart className={`w-4 h-4 ${alert.isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{alert.likes || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAlertDiscussion(alert);
                    }}
                    className="flex items-center gap-1.5 font-semibold text-slate-500 hover:text-blue-600 transition cursor-pointer"
                    title="ร่วมแสดงความคิดเห็นและสอบถามข้อมูลเพิ่มเติม"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{alert.commentsCount || 0} ความคิดเห็น</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      shareAlert(alert.id);
                    }}
                    className="flex items-center gap-1.5 font-semibold text-slate-500 hover:text-emerald-700 transition cursor-pointer"
                    title="แชร์แจ้งเตือนภัยนี้"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{alert.shares || 0} แชร์</span>
                  </button>
                </div>

                {/* Action Toolbar: Confirm real event, Report not found / fake, View on Map */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-slate-400 text-[11px]">
                    รายงานโดย: <strong className="text-slate-600">{typeof alert.reporter === 'string' ? alert.reporter : 'ประชาชนในพื้นที่'}</strong>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Confirm Button */}
                    <button
                      onClick={() => confirmAlert(alert.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                        alert.userVerified
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                      title="ยืนยันว่ามีเหตุการณ์เกิดขึ้นจริง"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${alert.userVerified ? 'fill-white' : ''}`} />
                      <span>{alert.userVerified ? 'ยืนยันเหตุแล้ว' : 'ยืนยันเหตุจริง'} ({alert.verifiedCount})</span>
                    </button>

                    {/* Report Not Found (Anti-fake news) Button */}
                    <button
                      onClick={() => reportAlertNotFound(alert.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                        alert.userReportedNotFound
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
                      }`}
                      title="รายงานว่าไม่พบเหตุการณ์จริง เพื่อป้องกันข่าวปลอม"
                    >
                      <Flag className={`w-3.5 h-3.5 ${alert.userReportedNotFound ? 'fill-white' : ''}`} />
                      <span>{alert.userReportedNotFound ? 'แจ้งไม่พบแล้ว' : 'ไม่พบเหตุ / ข่าวปลอม'} ({notFound})</span>
                    </button>

                    {/* View on In-App Map */}
                    <button
                      onClick={() => {
                        setActiveTab('map');
                        showToast(`เปิดแผนที่จุดเกิดเหตุ: ${alert.title}`, 'info');
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ดูบนแผนที่</span>
                    </button>

                    {/* Direct Google Maps Navigation Button (เด้งเข้า Google Maps ทันที) */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${alert.coordinates?.lat || 13.8282},${alert.coordinates?.lng || 100.5694}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const lat = alert.coordinates?.lat || 13.8282;
                        const lng = alert.coordinates?.lng || 100.5694;
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition cursor-pointer"
                      title="เปิด Google Maps นำทางไปยังจุดเกิดเหตุทันที"
                    >
                      <Navigation className="w-3.5 h-3.5 fill-white text-white" />
                      <span>นำทาง Google Maps</span>
                      <ExternalLink className="w-3 h-3 text-blue-200" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
