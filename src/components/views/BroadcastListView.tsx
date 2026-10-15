import React, { useState, useMemo } from 'react';
import {
  Radio,
  AlertTriangle,
  Flame,
  CloudRain,
  Car,
  MapPin,
  Clock,
  Volume2,
  ExternalLink,
  Plus,
  RotateCcw,
  Shield,
  Eye,
  Heart,
  MessageSquare,
  Sparkles,
  Share2,
  TrendingUp,
  ThumbsUp,
  Flag,
  CheckCircle2,
  Compass,
  Newspaper,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { useBroadcast } from '../../context/BroadcastContext';
import { useCommunity } from '../../context/CommunityContext';
import { AdminBroadcast, Post, AlertReport } from '../../types';

type NewsTabFilter = 'popular' | 'latest' | 'alerts' | 'announcements';

interface UnifiedFeedItem {
  id: string;
  itemType: 'broadcast' | 'post' | 'alert';
  title: string;
  summary: string;
  author: string;
  authorAvatar?: string;
  province: string;
  district?: string;
  createdAt: number;
  likes: number;
  commentsCount: number;
  popularityScore: number;
  severity?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  actionUrl?: string;
  actionText?: string;
  isLiked?: boolean;
  verifiedCount?: number;
  notFoundCount?: number;
  isFakeReport?: boolean;
  originalData: any;
}

export const BroadcastListView: React.FC = () => {
  const {
    broadcasts,
    setOpenAdminModal,
    reBroadcastItem,
    playSoundAlert
  } = useBroadcast();

  const {
    isAdmin,
    location,
    showToast,
    openLoginModal,
    posts,
    alerts,
    likePost,
    openPostDetail,
    confirmAlert,
    reportAlertNotFound,
    setActiveTab,
    goBack
  } = useCommunity();

  const [activeFilter, setActiveFilter] = useState<NewsTabFilter>('popular');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Unify and Normalize all News, Broadcasts, and User Incident Reports across the system
  const allUnifiedItems: UnifiedFeedItem[] = useMemo(() => {
    const list: UnifiedFeedItem[] = [];

    // A. Official Broadcasts
    broadcasts.forEach((b) => {
      const likes = b.likesCount || 0;
      const views = b.viewsCount || 0;
      // High interest boost for urgent broadcasts
      const urgencyBonus = b.severity === 'urgent' ? 30 : b.severity === 'high' ? 18 : 8;
      const popularityScore = (likes * 3) + Math.floor(views * 0.5) + urgencyBonus;

      list.push({
        id: `bc_${b.id}`,
        itemType: 'broadcast',
        title: b.title,
        summary: b.message,
        author: b.adminName || 'ผู้ดูแลระบบ (Admin)',
        authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        province: b.targetProvince || b.targetArea || 'ทุกพื้นที่',
        district: b.targetDistrict,
        createdAt: b.broadcastAt || Date.now(),
        likes,
        commentsCount: 0,
        popularityScore,
        severity: b.severity,
        mediaUrl: b.mediaUrl,
        mediaType: b.mediaType,
        actionUrl: b.actionUrl,
        actionText: b.actionText,
        originalData: b
      });
    });

    // B. User Community News & High-Interest Posts
    posts.forEach((p) => {
      const likes = p.likes || 0;
      const commentsCount = Array.isArray(p.comments) ? p.comments.length : 0;
      // Popularity score driven by user likes and comments
      const popularityScore = (likes * 3) + (commentsCount * 4) + (p.category === 'news' ? 10 : 4);

      list.push({
        id: `post_${p.id}`,
        itemType: 'post',
        title: p.title || 'ข่าวสารชุมชน',
        summary: p.content || '',
        author: typeof p.author === 'string' ? p.author : (p.author as any)?.name || 'ผู้ใช้',
        authorAvatar: p.authorAvatar,
        province: p.location?.province || 'ชุมชนทั่วไป',
        district: p.location?.district,
        createdAt: p.createdAt || Date.now(),
        likes,
        commentsCount,
        popularityScore,
        isLiked: p.isLiked,
        mediaUrl: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : undefined,
        originalData: p
      });
    });

    // C. User Citizen Emergency Incident Reports (ทั้งระบบ)
    alerts.forEach((a) => {
      const verified = a.verifiedCount || 1;
      const notFound = a.notFoundCount || 0;
      const severityBonus = a.severity === 'critical' ? 35 : a.severity === 'high' ? 22 : 10;
      const popularityScore = (verified * 4) + severityBonus - (notFound * 2);

      list.push({
        id: `alert_${a.id}`,
        itemType: 'alert',
        title: `🚨 ${a.title}`,
        summary: a.description || '',
        author: typeof a.reporter === 'string' ? a.reporter : 'พลเมืองดี (รายงานสด)',
        authorAvatar: a.reporterAvatar,
        province: a.province || 'พื้นที่ชุมชน',
        district: a.district,
        createdAt: a.createdAt || Date.now(),
        likes: verified,
        commentsCount: 0,
        popularityScore,
        severity: a.severity,
        verifiedCount: verified,
        notFoundCount: notFound,
        isFakeReport: a.isFakeReport,
        originalData: a
      });
    });

    return list;
  }, [broadcasts, posts, alerts]);

  // 2. Filter & Sort Items: "ดันข่าวสารที่มีคนให้สนใจสูง มียอดการแสดงความคิดเห็นกดถูกใจเป็นจำนวนมาก"
  const filteredAndSortedItems = useMemo(() => {
    let result = [...allUnifiedItems];

    // Filter by Tab
    if (activeFilter === 'alerts') {
      result = result.filter(item => item.itemType === 'alert');
    } else if (activeFilter === 'announcements') {
      result = result.filter(item => item.itemType === 'broadcast' || item.originalData.category === 'news');
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.province.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q)
      );
    }

    // Sort
    if (activeFilter === 'popular') {
      // PUSH / BOOST high interest items (likes + comments) to the top!
      result.sort((a, b) => b.popularityScore - a.popularityScore);
    } else {
      // Latest chronological order
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }, [allUnifiedItems, activeFilter, searchQuery]);

  // Top 3 Most Trending Items (ดันข่าวเด่นที่มีคนสนใจสูงสุด)
  const topTrendingItems = useMemo(() => {
    return [...allUnifiedItems]
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 3);
  }, [allUnifiedItems]);

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'เมื่อสักครู่';
    if (hours < 24) return `${hours} ชม. ที่แล้ว`;
    return `${Math.floor(hours / 24)} วันที่แล้ว`;
  };

  const handleShare = (item: UnifiedFeedItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#news=${item.id}`);
      showToast('คัดลอกลิงก์ข่าวสารเรียบร้อยแล้ว!', 'success');
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-14 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="p-5 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 text-white rounded-3xl shadow-xl border border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold backdrop-blur-xs border border-blue-400/30">
            <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
            <span>ศูนย์ข่าวสาร & รายงานเหตุด่วนทั่วระบบ (News Center)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            ศูนย์ข่าวสาร & รายงานเหตุการณ์ยอดนิยม
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            รวบรวมข่าวสาร ประกาศทางการ และการแจ้งเหตุของผู้ใช้งานทั้งระบบ พร้อมจัดอันดับดันข่าวสารที่มีคนให้ความสนใจ ยอดไลก์ และความเห็นสูงขึ้นหน้าแรก
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={goBack}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-white/20 active:scale-95"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 border border-white/20 active:scale-95"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>แผนที่เหตุ</span>
          </button>

          <button
            onClick={() => {
              if (!isAdmin) {
                openLoginModal();
                showToast('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถสร้างข้อความบรอดแคสต์ได้ กรุณาเข้าสู่ระบบด้วยบัญชีแอดมิน', 'info');
                return;
              }
              setOpenAdminModal(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>สร้างบรอดแคสต์</span>
          </button>
        </div>
      </div>

      {/* 2. TOP TRENDING HIGHLIGHTS CAROUSEL ("ดันข่าวสารที่มีคนให้สนใจสูง") */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-900">
            <Flame className="w-4 h-4 text-rose-600 fill-rose-600 animate-pulse" />
            <span>🔥 ข่าวเด่นที่มีคนสนใจสูงสุด (Trending Highlights)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">จัดอันดับตามยอดไลก์และความเห็น</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topTrendingItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.itemType === 'post') {
                  openPostDetail(item.originalData);
                } else if (item.itemType === 'alert') {
                  setActiveTab('alerts');
                }
              }}
              className="relative p-4 bg-gradient-to-b from-white to-slate-50 hover:to-blue-50/50 rounded-2xl border-2 border-slate-200/90 hover:border-blue-400 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-2.5 group"
            >
              {/* Rank Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 ${
                  index === 0
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : index === 1
                    ? 'bg-slate-200 text-slate-800'
                    : 'bg-orange-100 text-orange-900'
                }`}>
                  <Flame className="w-3 h-3 fill-current text-rose-600" />
                  <span>อันดับ {index + 1} ยอดนิยม</span>
                </span>

                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {item.province}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-2 group-hover:text-blue-700 transition leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                <div className="flex items-center gap-2.5 text-rose-600">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-600" />
                    <span>{item.likes}</span>
                  </span>
                  {item.commentsCount > 0 && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{item.commentsCount}</span>
                    </span>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 font-normal">
                  {timeAgo(item.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Search and Sort Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Sort/Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveFilter('popular')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeFilter === 'popular'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>🔥 ยอดนิยมสูงสุด (คนสนใจมาก)</span>
          </button>

          <button
            onClick={() => setActiveFilter('latest')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeFilter === 'latest'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>ข่าวล่าสุด</span>
          </button>

          <button
            onClick={() => setActiveFilter('alerts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeFilter === 'alerts'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
            <span>🚨 การแจ้งเหตุด่วน ({alerts.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('announcements')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeFilter === 'announcements'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>📢 ข่าวสาร & บรอดแคสต์</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาข่าว, เหตุการณ์, จังหวัด..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
          />
          <Newspaper className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* 4. Unified News & Alert List */}
      <div className="space-y-3.5">
        {filteredAndSortedItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-1">
            <Newspaper className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-semibold text-slate-700">ไม่พบข่าวสารในหมวดนี้</p>
          </div>
        ) : (
          filteredAndSortedItems.map((item) => {
            const isHighInterest = item.popularityScore >= 15;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.itemType === 'post') {
                    openPostDetail(item.originalData);
                  } else if (item.itemType === 'alert') {
                    setActiveTab('alerts');
                  }
                }}
                className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-3 bg-white shadow-xs hover:shadow-md cursor-pointer ${
                  item.itemType === 'alert'
                    ? 'hover:border-rose-300'
                    : item.itemType === 'broadcast'
                    ? 'border-indigo-100 hover:border-indigo-300'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Item Type Badge */}
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${
                      item.itemType === 'broadcast'
                        ? 'bg-blue-600 text-white'
                        : item.itemType === 'alert'
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {item.itemType === 'broadcast' && '📢 บรอดแคสต์ทางการ'}
                      {item.itemType === 'alert' && '🚨 รายงานเหตุด่วน'}
                      {item.itemType === 'post' && '📰 ข่าวสารชุมชน'}
                    </span>

                    {/* Boosted High Interest Fire Tag */}
                    {isHighInterest && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <Flame className="w-3 h-3 fill-rose-600 text-rose-600" />
                        <span>คนสนใจสูง ({item.likes} ไลก์{item.commentsCount > 0 ? ` • ${item.commentsCount} ความเห็น` : ''})</span>
                      </span>
                    )}

                    <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {item.province} {item.district ? `(${item.district})` : ''}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>

                  {/* Quick Action icon for sound / admin */}
                  <div className="flex items-center gap-1">
                    {item.itemType === 'broadcast' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSoundAlert((item.severity as any) || 'normal');
                        }}
                        title="ฟังเสียงสัญญาณเตือน"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}

                    {isAdmin && item.itemType === 'broadcast' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          reBroadcastItem(item.originalData);
                          showToast('บรอดแคสต์ซ้ำอีกครั้งแล้ว', 'success');
                        }}
                        title="ส่งซ้ำ (Re-broadcast)"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                {/* Media Image / Video if present */}
                {item.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-72 bg-black">
                    {item.mediaType === 'video' ? (
                      <video
                        src={item.mediaUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full max-h-72 object-contain bg-black"
                      />
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover max-h-72"
                      />
                    )}
                  </div>
                )}

                {/* Footer Toolbar: Likes, Comments, Verification, and Details */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                  <div className="flex items-center gap-4">
                    {/* Like button for posts */}
                    {item.itemType === 'post' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          likePost(item.originalData.id);
                        }}
                        className={`flex items-center gap-1 font-bold transition active:scale-90 ${
                          item.isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${item.isLiked ? 'fill-rose-600' : ''}`} />
                        <span>{item.likes} ถูกใจ</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 font-bold text-rose-600">
                        <Heart className="w-4 h-4 fill-rose-600" />
                        <span>{item.likes} ไลก์</span>
                      </span>
                    )}

                    {/* Comments Count for posts */}
                    {item.itemType === 'post' && (
                      <span className="flex items-center gap-1 font-bold text-blue-600">
                        <MessageSquare className="w-4 h-4" />
                        <span>{item.commentsCount} ความเห็น</span>
                      </span>
                    )}

                    {/* Verification count for alerts */}
                    {item.itemType === 'alert' && (
                      <span className="flex items-center gap-1 font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ยืนยันแล้ว {item.verifiedCount} คน</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      โดย: <strong className="text-slate-600">{item.author}</strong>
                    </span>

                    <button
                      onClick={(e) => handleShare(item, e)}
                      className="p-1 text-slate-400 hover:text-slate-700 transition"
                      title="แชร์"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
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
