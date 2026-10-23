import React, { useState, useRef } from 'react';
import {
  MessageSquare,
  Heart,
  Share2,
  MapPin,
  CheckCircle,
  Plus,
  Search,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Users,
  UserPlus,
  UserCheck,
  Compass,
  AlertTriangle,
  CloudRain,
  Flame,
  Car,
  Zap,
  ShieldAlert,
  ShieldCheck,
  ThumbsUp,
  Flag,
  AlertOctagon,
  ExternalLink,
  Navigation,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { WeatherWidget } from '../WeatherWidget';
import { Post, AlertReport } from '../../types';
import { PostImageGallery } from '../PostImageGallery';
import { PostActionMenu } from '../PostActionMenu';
import { saveMediaFile } from '../../utils/mediaStorage';

interface FeedViewProps {
  onOpenCreatePost: () => void;
  onOpenCreatePostWithMode?: (mode: 'camera' | 'gallery' | 'video' | 'standard', images?: string[]) => void;
  onOpenWeather?: () => void;
  onOpenInstantCamera?: () => void;
  onOpenReportAlert?: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  onOpenCreatePost,
  onOpenCreatePostWithMode,
  onOpenWeather,
  onOpenInstantCamera,
  onOpenReportAlert
}) => {
  const {
    posts,
    alerts,
    confirmAlert,
    reportAlertNotFound,
    location,
    likePost,
    openPostDetail,
    showToast,
    friends,
    addFriend,
    removeFriend,
    isFriend,
    currentUser,
    setActiveTab
  } = useCommunity();

  // Scope filter: 'friends_or_local' (default per user prompt) | 'friends_only' | 'local_only' | 'all'
  const [feedScope, setFeedScope] = useState<'friends_or_local' | 'friends_only' | 'local_only' | 'all'>('friends_or_local');
  // Separate Community Feed vs. Incident/Emergency Alerts per user requirement
  const [mainFeedTab, setMainFeedTab] = useState<'community' | 'alerts'>('community');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [alertSortMode, setAlertSortMode] = useState<'trending' | 'latest'>('trending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  // Native input refs for direct 1-click device camera & file capture
  const directCameraInputRef = useRef<HTMLInputElement>(null);
  const directGalleryInputRef = useRef<HTMLInputElement>(null);

  const handleDirectCameraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const file = files[0];
      const saved = await saveMediaFile(file, file.name);
      showToast('📸 ถ่ายภาพสดจากกล้องเรียบร้อย พร้อมโพสต์!', 'success');
      if (onOpenCreatePostWithMode) {
        onOpenCreatePostWithMode('standard', [saved.objectUrl]);
      } else {
        onOpenCreatePost();
      }
    } catch {
      showToast('ไม่สามารถบันทึกภาพถ่ายได้', 'error');
    } finally {
      if (directCameraInputRef.current) directCameraInputRef.current.value = '';
    }
  };

  const handleDirectGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const saved = await saveMediaFile(files[i], files[i].name);
        urls.push(saved.objectUrl);
      }
      showToast(`🖼️ เลือกรูปภาพ ${urls.length} รูปเรียบร้อย!`, 'success');
      if (onOpenCreatePostWithMode) {
        onOpenCreatePostWithMode('standard', urls);
      } else {
        onOpenCreatePost();
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการโหลดรูปภาพ', 'error');
    } finally {
      if (directGalleryInputRef.current) directGalleryInputRef.current.value = '';
    }
  };

  // Filter alerts by scope and search query for community verification, sorted by engagement or recency
  const filteredAlerts = alerts.filter(alert => {
    if (!alert) return false;
    const isInLocalArea = alert.province?.trim() === location.province?.trim();
    if (feedScope === 'local_only' && !isInLocalArea) return false;

    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return true;

    const title = (alert.title || '').toLowerCase();
    const desc = (alert.description || '').toLowerCase();
    const reporter = (typeof alert.reporter === 'string' ? alert.reporter : '').toLowerCase();
    const sub = (alert.subdistrict || '').toLowerCase();
    return title.includes(q) || desc.includes(q) || reporter.includes(q) || sub.includes(q);
  }).sort((a, b) => {
    if (alertSortMode === 'trending') {
      const scoreB = ((b.verifiedCount || 0) * 3) + ((b.likes || 0) * 2) + ((b.shares || 0) * 3) + ((b.commentsCount || 0) * 2);
      const scoreA = ((a.verifiedCount || 0) * 3) + ((a.likes || 0) * 2) + ((a.shares || 0) * 3) + ((a.commentsCount || 0) * 2);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  // Map of nearby / adjacent provinces in Thailand
  const NEARBY_PROVINCES: Record<string, string[]> = {
    'กรุงเทพมหานคร': ['นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร', 'นครปฐม', 'ฉะเชิงเทรา'],
    'นนทบุรี': ['กรุงเทพมหานคร', 'ปทุมธานี', 'นครปฐม', 'พระนครศรีอยุธยา'],
    'ปทุมธานี': ['กรุงเทพมหานคร', 'นนทบุรี', 'พระนครศรีอยุธยา', 'สระบุรี', 'นครนายก'],
    'สมุทรปราการ': ['กรุงเทพมหานคร', 'ฉะเชิงเทรา', 'สมุทรสาคร'],
    'สมุทรสาคร': ['กรุงเทพมหานคร', 'สมุทรปราการ', 'สมุทรสงคราม', 'นครปฐม'],
    'นครปฐม': ['กรุงเทพมหานคร', 'นนทบุรี', 'สุพรรณบุรี', 'สมุทรสาคร', 'ราชบุรี'],
    'เชียงใหม่': ['เชียงราย', 'ลำพูน', 'ลำปาง', 'แม่ฮ่องสอน'],
    'เชียงราย': ['เชียงใหม่', 'พะเยา', 'ลำปาง'],
    'ชลบุรี': ['ระยอง', 'ฉะเชิงเทรา', 'จันทบุรี'],
    'ขอนแก่น': ['มหาสารคาม', 'กาฬสินธุ์', 'อุดรธานี', 'ชัยภูมิ', 'นครราชสีมา'],
    'นครราชสีมา': ['ขอนแก่น', 'ชัยภูมิ', 'บุรีรัมย์', 'สระบุรี', 'ลพบุรี', 'ปราจีนบุรี'],
    'สงขลา': ['พัทลุง', 'ยะลา', 'ปัตตานี', 'สตูล', 'นครศรีธรรมราช'],
    'ภูเก็ต': ['พังงา', 'กระบี่']
  };

  // Filter posts by scope (friends, friends of friends, and users in same/nearby area), category, and search query
  const filteredPosts = posts.filter(post => {
    if (!post) return false;

    const authorIsFriend = isFriend(post.author);
    const isFriendOfFriend = Boolean(
      (post.comments && post.comments.some(c => isFriend(c.author))) ||
      (post.sharedFrom && isFriend(post.sharedFrom.originalAuthor)) ||
      (Array.isArray(post.sharedBy) && post.sharedBy.some(s => isFriend(s)))
    );

    const postProvince = (post.location?.province || '').trim();
    const userProvince = (location.province || '').trim();
    const isSameProvince = Boolean(postProvince && userProvince && postProvince === userProvince);
    const isNearbyProvince = Boolean(
      userProvince &&
      NEARBY_PROVINCES[userProvince] &&
      NEARBY_PROVINCES[userProvince].includes(postProvince)
    );
    const isInLocalAreaOrNearby = isSameProvince || isNearbyProvince;
    const isSelf = currentUser?.displayName === post.author;

    // 1. Feed Scope Filter
    if (feedScope === 'friends_or_local') {
      // ปรากฏโพสต์ของเพื่อน, เพื่อนของเพื่อน, และผู้ใช้งานที่อยู่ในพื้นที่เดียวกันหรือใกล้เคียงกัน
      if (!authorIsFriend && !isFriendOfFriend && !isInLocalAreaOrNearby && !isSelf) return false;
    } else if (feedScope === 'friends_only') {
      if (!authorIsFriend && !isFriendOfFriend && !isSelf) return false;
    } else if (feedScope === 'local_only') {
      if (!isInLocalAreaOrNearby && !isSelf) return false;
    }

    // 2. Category Filter (Pure community feed categories, alert is separated)
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;

    // 3. Search Query
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return matchesCategory;

    const postTitle = (post.title || '').toLowerCase();
    const postContent = (post.content || '').toLowerCase();
    const postAuthor = (post.author || '').toLowerCase();
    const matchesSearch =
      postTitle.includes(q) ||
      postContent.includes(q) ||
      postAuthor.includes(q) ||
      (Array.isArray(post.tags) && post.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(q)));
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'news', label: '📰 ข่าวสาร' },
    { id: 'general', label: '💬 พูดคุย' },
    { id: 'help', label: '🤝 ช่วยเหลือ/ของหาย' },
    { id: 'activity', label: '🎉 กิจกรรม' },
  ];

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'เมื่อสักครู่';
    if (hours < 24) return `${hours} ชม. ที่แล้ว`;
    return `${Math.floor(hours / 24)} วันที่แล้ว`;
  };

  const handleShare = (post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#post=${post.id}`);
      showToast('คัดลอกลิงก์โพสต์เรียบร้อยแล้ว!', 'success');
    }
  };

  const getAlertIcon = (type: AlertReport['type']) => {
    switch (type) {
      case 'flood':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'weather':
        return <CloudRain className="w-5 h-5 text-sky-500" />;
      case 'accident':
        return <Car className="w-5 h-5 text-amber-500" />;
      case 'fire':
        return <Flame className="w-5 h-5 text-red-500" />;
      case 'power_cut':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
    }
  };

  const getSeverityBadge = (sev: AlertReport['severity']) => {
    switch (sev) {
      case 'critical':
        return <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-red-600 text-white animate-pulse">วิกฤต (Critical)</span>;
      case 'high':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-600 text-white">รุนแรงสูง</span>;
      case 'medium':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white">ปานกลาง</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-500 text-white">เล็กน้อย</span>;
    }
  };

  // Render a Single Emergency Verification Card with the 2 Mandatory Buttons
  const renderEmergencyVerificationCard = (alert: AlertReport) => {
    const notFound = alert.notFoundCount || 0;
    const verified = alert.verifiedCount || 1;
    const totalVotes = verified + notFound;
    const verifiedPercent = Math.round((verified / (totalVotes || 1)) * 100);
    const notFoundPercent = 100 - verifiedPercent;

    const isSuspectedFake = Boolean(alert.isFakeReport || (notFound >= 3 && notFound > verified));
    const isHighCredibility = verified >= 3 && verified > notFound * 2;

    return (
      <div
        key={alert.id}
        className={`p-4 sm:p-5 bg-white rounded-3xl border-2 transition-all space-y-3.5 shadow-sm hover:shadow-md ${
          isSuspectedFake
            ? 'border-red-300 bg-red-50/20'
            : isHighCredibility
            ? 'border-emerald-300 bg-emerald-50/10'
            : 'border-rose-200 hover:border-rose-400'
        }`}
      >
        {/* Header of Alert */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600 shrink-0 shadow-2xs">
              {getAlertIcon(alert.type)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-extrabold tracking-wide uppercase flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  เหตุฉุกเฉิน
                </span>
                {getSeverityBadge(alert.severity)}
                {isSuspectedFake && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3 text-red-600" />
                    ระวังข่าวปลอม
                  </span>
                )}
                {isHighCredibility && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ยืนยันแล้วโดยชุมชน
                  </span>
                )}
              </div>

              <h4 className="font-black text-sm sm:text-base text-slate-900 mt-1 leading-snug">
                {alert.title}
              </h4>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap mt-0.5">
                <span className="flex items-center gap-1 text-slate-700 font-semibold">
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  {alert.locationName || `${alert.subdistrict ? alert.subdistrict + ', ' : ''}${alert.district || ''} จ.${alert.province}`}
                </span>
                <span>•</span>
                <span>{timeAgo(alert.createdAt || Date.now())}</span>
                <span>•</span>
                <span>ผู้แจ้ง: <strong className="text-slate-700">{typeof alert.reporter === 'string' ? alert.reporter : 'พลเมืองดี'}</strong></span>
              </div>
            </div>
          </div>
          <PostActionMenu
            post={{
              id: alert.id,
              title: alert.title,
              content: alert.description,
              author: typeof alert.reporter === 'string' ? alert.reporter : 'พลเมืองดี',
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

        {/* Incident Description */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
          {alert.description}
        </p>

        {/* Attached Photos (If any) */}
        {alert.images && alert.images.length > 0 && (
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <Camera className="w-3 h-3 text-rose-500" />
              <span>ภาพถ่ายหลักฐานจุดเกิดเหตุ ({alert.images.length} รูป):</span>
            </div>
            <PostImageGallery
              images={alert.images}
              maxDisplay={4}
            />
          </div>
        )}

        {/* Community Verification Bar & Stats */}
        <div className="p-3 bg-slate-100/80 rounded-2xl border border-slate-200/90 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>การตรวจสอบโดยชุมชนรอบตัวคุณ:</span>
            </span>
            <span className="text-[11px] text-slate-600">
              โหวตทั้งหมด {totalVotes} เสียง
            </span>
          </div>

          {/* Visual Ratio Bar */}
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${verifiedPercent}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`ยืนยันเหตุจริง ${verified} คน (${verifiedPercent}%)`}
            />
            <div
              style={{ width: `${notFoundPercent}%` }}
              className="bg-rose-500 h-full transition-all duration-500"
              title={`แจ้งไม่พบ ${notFound} คน (${notFoundPercent}%)`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-emerald-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              ยืนยันมีเหตุจริง: <strong>{verified} คน</strong> ({verifiedPercent}%)
            </span>
            <span className="text-rose-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
              คนในละแวกนี้แจ้งไม่พบ: <strong>{notFound} คน</strong> ({notFoundPercent}%)
            </span>
          </div>

          {/* System Warning / Notice */}
          {isSuspectedFake ? (
            <div className="p-2 bg-red-100 border border-red-300 rounded-xl text-[11px] text-red-900 font-bold flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
              <span>คำเตือน: คนในชุมชน {notFound} คนแจ้งว่าไม่พบเหตุการณ์จริง โปรดตรวจสอบก่อนแชร์</span>
            </div>
          ) : isHighCredibility ? (
            <div className="p-2 bg-emerald-100/70 border border-emerald-300 rounded-xl text-[11px] text-emerald-900 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>ได้รับการยืนยันเหตุการณ์จริงจากคนในพื้นที่เรียบร้อยแล้ว มีความน่าเชื่อถือสูง</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 italic">
              * คนในพื้นที่สามารถร่วมกดปุ่มด้านล่างเพื่อยืนยันหรือแจ้งไม่พบเหตุได้ทันที
            </div>
          )}
        </div>

        {/* THE 2 MANDATORY BUTTONS: ยืนยัน (มีเหตุการณ์จริง) VS ไม่พบ (ไม่มีเหตุการณ์) */}
        <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Button 1: ยืนยันเหตุการณ์จริง */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              confirmAlert(alert.id);
            }}
            className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition active:scale-95 shadow-xs ${
              alert.userVerified
                ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-300'
            }`}
            title="คนในพื้นที่กดยืนยันว่ามีเหตุการณ์เกิดขึ้นจริง"
          >
            <div className={`p-1.5 rounded-xl ${alert.userVerified ? 'bg-white/20' : 'bg-emerald-200 text-emerald-800'}`}>
              <ThumbsUp className={`w-4 h-4 ${alert.userVerified ? 'fill-white' : ''}`} />
            </div>
            <div className="text-left leading-tight">
              <div className="font-extrabold text-xs sm:text-sm">
                {alert.userVerified ? '✅ คุณยืนยันเหตุจริงแล้ว' : 'ยืนยัน (มีเหตุการณ์จริง)'}
              </div>
              <div className={`text-[10px] font-semibold ${alert.userVerified ? 'text-emerald-100' : 'text-emerald-700'}`}>
                คนในพื้นที่กดยืนยันแล้ว ({verified} คน)
              </div>
            </div>
          </button>

          {/* Button 2: ไม่พบ (ไม่มีเหตุการณ์) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              reportAlertNotFound(alert.id);
            }}
            className={`p-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition active:scale-95 shadow-xs ${
              alert.userReportedNotFound
                ? 'bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-400'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-2 border-rose-300'
            }`}
            title="คนที่อยู่ในชุมชนละแวกนั้นกดได้ว่าไม่พบถ้าหากไม่มีเหตุการณ์เกิดขึ้น"
          >
            <div className={`p-1.5 rounded-xl ${alert.userReportedNotFound ? 'bg-white/20' : 'bg-rose-200 text-rose-800'}`}>
              <Flag className={`w-4 h-4 ${alert.userReportedNotFound ? 'fill-white' : ''}`} />
            </div>
            <div className="text-left leading-tight">
              <div className="font-extrabold text-xs sm:text-sm">
                {alert.userReportedNotFound ? '🚩 คุณแจ้งไม่พบเหตุแล้ว' : 'ไม่พบ (ไม่มีเหตุการณ์)'}
              </div>
              <div className={`text-[10px] font-semibold ${alert.userReportedNotFound ? 'text-rose-100' : 'text-rose-700'}`}>
                คนในละแวกกดไม่พบ ({notFound} คน)
              </div>
            </div>
          </button>
        </div>

        {/* Map Pinning Status & Direct Google Maps Navigation Button */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold min-w-0">
            <span className="p-1 rounded-md bg-red-100 text-red-600 shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <span className="truncate text-[11px] sm:text-xs">
              พิกัดปักหมุด: <strong>{alert.locationName || `${alert.district || alert.province}`}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Direct Google Maps Navigation Button: เด้งเข้า Google Maps ทันที */}
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
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm shadow-blue-500/25 transition cursor-pointer"
              title="เปิด Google Maps เพื่อนำทางไปยังจุดแจ้งเหตุทันที"
            >
              <Navigation className="w-3.5 h-3.5 fill-white text-white" />
              <span>นำทาง Google Maps</span>
              <ExternalLink className="w-3 h-3 text-blue-200" />
            </a>

            {/* View Pinned Location on In-App Map */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('map');
                showToast(`เปิดแผนที่จุดเกิดเหตุ: ${alert.title}`, 'info');
              }}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="ดูจุดปักหมุดบนแผนที่รอบตัว"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>ดูบนแผนที่</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* Hidden native inputs for 1-click capture from Feed */}
      <input
        ref={directCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleDirectCameraChange}
      />
      <input
        ref={directGalleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleDirectGalleryChange}
      />

      {/* Lightbox Modal for Photo Preview */}
      {selectedPhotoPreview && (
        <div
          onClick={() => setSelectedPhotoPreview(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-black rounded-2xl overflow-hidden">
            <button
              onClick={() => setSelectedPhotoPreview(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedPhotoPreview} alt="Full preview" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}

      {/* Live Accurate Weather Widget */}
      <WeatherWidget onOpenFullForecast={onOpenWeather} />

      {/* 🌟 PRIMARY SEGMENT TABS: แยกชัดเจนระหว่าง "ฟีดชุมชน" กับ "โพสต์แจ้งเหตุด่วน" 🌟 */}
      <div className="p-1.5 bg-slate-200/90 rounded-2xl border border-slate-300 shadow-xs grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setMainFeedTab('community');
            setSelectedCategory('all');
          }}
          className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer ${
            mainFeedTab === 'community'
              ? 'bg-white text-slate-900 shadow-md ring-2 ring-emerald-500'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>💬 ฟีดโพสต์ชุมชน</span>
          <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            {filteredPosts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMainFeedTab('alerts')}
          className={`py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer ${
            mainFeedTab === 'alerts'
              ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
              : 'text-rose-700 bg-rose-50/80 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>🚨 โพสต์แจ้งเหตุด่วน</span>
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
            mainFeedTab === 'alerts' ? 'bg-rose-700 text-white' : 'bg-rose-200 text-rose-800'
          }`}>
            {filteredAlerts.length}
          </span>
          {filteredAlerts.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: 💬 ฟีดชุมชน (COMMUNITY FEED POSTS - ไม่แจ้งเตือนบนแผนที่ว่ารกตา)  */}
      {/* ========================================================================= */}
      {mainFeedTab === 'community' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Friends Horizontal Bar */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">เพื่อนของฉัน ({friends.length})</div>
                <div className="text-[10px] text-slate-400">คนในแวดวงชุมชนที่คุณติดตาม</div>
              </div>
            </div>

            {/* Friends Avatars */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => {
                    setFeedScope('friends_only');
                    setSearchQuery(friend.name);
                    showToast(`กรองโพสต์เฉพาะของคุณ ${friend.name}`, 'info');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer transition shrink-0 group active:scale-95"
                  title={`ดูโพสต์ของ ${friend.name}`}
                >
                  <img
                    src={friend.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={friend.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-200 group-hover:border-blue-400"
                  />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 whitespace-nowrap">
                    {friend.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Scope Segment: Friends or Device Current Area */}
          <div className="bg-slate-900 text-white rounded-2xl p-1 sm:p-1.5 shadow-md flex items-center justify-between gap-1 text-xs overflow-x-auto scrollbar-none">
            <button
              onClick={() => {
                setFeedScope('friends_or_local');
                setSearchQuery('');
              }}
              className={`flex-1 min-w-[120px] sm:min-w-0 py-1.5 sm:py-2 px-2 text-center rounded-xl font-bold transition flex items-center justify-center gap-1 text-[10px] sm:text-xs shrink-0 sm:shrink ${
                feedScope === 'friends_or_local'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
              <span>เพื่อน & พื้นที่ของฉัน</span>
            </button>

            <button
              onClick={() => {
                setFeedScope('friends_only');
                setSearchQuery('');
              }}
              className={`flex-1 min-w-[95px] sm:min-w-0 py-1.5 sm:py-2 px-2 text-center rounded-xl font-bold transition flex items-center justify-center gap-1 text-[10px] sm:text-xs shrink-0 sm:shrink ${
                feedScope === 'friends_only'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>เพื่อน ({friends.length})</span>
            </button>

            <button
              onClick={() => {
                setFeedScope('local_only');
                setSearchQuery('');
              }}
              className={`flex-1 min-w-[105px] sm:min-w-0 py-1.5 sm:py-2 px-2 text-center rounded-xl font-bold transition flex items-center justify-center gap-1 text-[10px] sm:text-xs truncate shrink-0 sm:shrink ${
                feedScope === 'local_only'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              <span className="truncate">พื้นที่ {location.province}</span>
            </button>

            <button
              onClick={() => {
                setFeedScope('all');
                setSearchQuery('');
              }}
              className={`py-1.5 sm:py-2 px-2.5 sm:px-3 text-center rounded-xl font-bold transition text-[10px] sm:text-xs shrink-0 ${
                feedScope === 'all'
                  ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ทั้งหมด
            </button>
          </div>

          {/* Clean Community Notice Bar */}
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-600 text-white shrink-0">
                <MessageSquare className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] sm:text-xs">
                💬 <strong>ฟีดชุมชน:</strong> สำหรับแชร์เรื่องราว ข่าวสาร และคุยกับเพื่อนบ้าน <em>(โพสต์ทั่วไปจะไม่ขึ้นบนแผนที่รอบตัวเพื่อไม่ให้รกตา)</em>
              </span>
            </div>
            {onOpenReportAlert && (
              <button
                type="button"
                onClick={() => setMainFeedTab('alerts')}
                className="text-[11px] font-bold text-rose-700 hover:text-rose-900 hover:underline shrink-0 hidden sm:inline"
              >
                ดูแจ้งเหตุด่วน →
              </button>
            )}
          </div>

          {/* Create Post Bar with Direct Camera Shutter & Media Upload */}
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt="User avatar"
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <button
                onClick={onOpenCreatePost}
                className="flex-1 text-left px-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 rounded-xl text-xs sm:text-sm text-slate-500 font-medium transition cursor-pointer"
              >
                แชร์เรื่องราว ข่าวสาร หรือถามเพื่อนบ้านใน {location.province}...
              </button>
              <button
                onClick={onOpenCreatePost}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">สร้างโพสต์</span>
              </button>
            </div>

            {/* Action Buttons Row: Direct Camera & Media Upload */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (onOpenInstantCamera) {
                    onOpenInstantCamera();
                  } else {
                    directCameraInputRef.current?.click();
                  }
                }}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition active:scale-95 shadow-xs group cursor-pointer"
                title="เปิดกล้องถ่ายภาพสดทันที"
              >
                <div className="p-1.5 rounded-full bg-emerald-600 text-white group-hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] sm:text-xs font-extrabold leading-tight">ถ่ายรูปสด</div>
                  <div className="text-[9px] text-emerald-700 font-semibold leading-tight hidden sm:block">เข้ากล้องตรง</div>
                </div>
              </button>

              <button
                onClick={() => directGalleryInputRef.current?.click()}
                className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-2xs group cursor-pointer"
                title="เลือกรูปภาพจากคลังภาพในเครื่อง"
              >
                <div className="p-1.5 rounded-full bg-blue-600 text-white group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] sm:text-xs font-extrabold leading-tight">คลังรูปภาพ</div>
                  <div className="text-[9px] text-blue-700 font-semibold leading-tight hidden sm:block">อัลบั้มในเครื่อง</div>
                </div>
              </button>
            </div>
          </div>

          {/* Filter Categories and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาโพสต์, ชื่อเพื่อน..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Feed Posts Section */}
          <div className="space-y-3.5 pt-1">
            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-sm font-semibold text-slate-700">ไม่พบโพสต์ที่ตรงกับเงื่อนไขในมุมมองนี้</p>
                <p className="text-xs text-slate-400">
                  {feedScope === 'friends_only'
                    ? 'เพื่อนของคุณยังไม่ได้สร้างโพสต์ หรือลองเพิ่มเพื่อนใหม่ในชุมชน'
                    : 'ลองเปลี่ยนตัวกรอง หรือเป็นคนแรกที่สร้างโพสต์ในพื้นที่ของคุณ'}
                </p>
              </div>
            ) : (
              filteredPosts.map(post => {
                const authorIsFriend = isFriend(post.author);
                const isFriendOfFriend = Boolean(
                  !authorIsFriend && (
                    (post.comments && post.comments.some(c => isFriend(c.author))) ||
                    (post.sharedFrom && isFriend(post.sharedFrom.originalAuthor)) ||
                    (Array.isArray(post.sharedBy) && post.sharedBy.some(s => isFriend(s)))
                  )
                );
                const postProvince = (post.location?.province || '').trim();
                const userProvince = (location.province || '').trim();
                const isSameProvince = Boolean(postProvince && userProvince && postProvince === userProvince);
                const isNearbyProvince = Boolean(
                  userProvince &&
                  NEARBY_PROVINCES[userProvince] &&
                  NEARBY_PROVINCES[userProvince].includes(postProvince)
                );
                const isSelf = currentUser?.displayName === post.author;

                return (
                  <div
                    key={post.id}
                    onClick={() => openPostDetail(post)}
                    className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer space-y-3 group"
                  >
                    {/* Author & Header with Add/Remove Friend button */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={typeof post.author === 'string' ? post.author : (post.author as any)?.name || 'ผู้ใช้'}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition truncate">
                              {typeof post.author === 'string' ? post.author : (post.author as any)?.name || 'สมาชิกชุมชน'}
                            </span>
                            {post.isVerified && (
                              <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white shrink-0" />
                            )}

                            {/* Friend / Local Area / Friend of Friend Badges */}
                            {authorIsFriend && (
                              <span className="px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200 flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" />
                                เพื่อนของคุณ
                              </span>
                            )}

                            {isFriendOfFriend && !authorIsFriend && (
                              <span className="px-2 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200 flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" />
                                เพื่อนของเพื่อน
                              </span>
                            )}

                            {isSameProvince && !authorIsFriend && !isFriendOfFriend && (
                              <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5" />
                                คนในพื้นที่
                              </span>
                            )}

                            {isNearbyProvince && !isSameProvince && !authorIsFriend && !isFriendOfFriend && (
                              <span className="px-2 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-200 flex items-center gap-1">
                                <Compass className="w-2.5 h-2.5" />
                                พื้นที่ใกล้เคียง
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {post.location?.province || 'พื้นที่ชุมชน'} {post.location?.district ? `(${post.location.district})` : ''}
                            </span>
                            <span>•</span>
                            <span>{timeAgo(post.createdAt || Date.now())}</span>
                          </div>
                        </div>
                      </div>

                      {/* Add / Remove Friend Action Button on Post Header */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isSelf && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (authorIsFriend) {
                                removeFriend(post.author);
                              } else {
                                addFriend({
                                  id: `f_${post.author}`,
                                  name: post.author,
                                  avatar: post.authorAvatar,
                                  province: post.location?.province,
                                  district: post.location?.district
                                });
                              }
                            }}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer ${
                              authorIsFriend
                                ? 'bg-blue-50 text-blue-700 hover:bg-rose-50 hover:text-rose-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                            }`}
                            title={authorIsFriend ? 'เลิกติดตาม' : 'เพิ่มเป็นเพื่อนเพื่อเห็นโพสต์เสมอ'}
                          >
                            {authorIsFriend ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                <span>เป็นเพื่อนแล้ว</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span>+ เพิ่มเพื่อน</span>
                              </>
                            )}
                          </button>
                        )}
                        <PostActionMenu post={post} />
                      </div>
                    </div>

                    {/* Post Title & Content */}
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-emerald-800 transition leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4">
                        {post.content}
                      </p>
                    </div>

                    {/* Media Attachments */}
                    {post.images && post.images.length > 0 && (
                      <div className="pt-1">
                        <PostImageGallery
                          images={post.images}
                          maxDisplay={4}
                        />
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {post.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-semibold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Post Action Footer: Likes, Comments, Shares */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            likePost(post.id);
                          }}
                          className={`flex items-center gap-1.5 font-bold transition active:scale-90 cursor-pointer ${
                            post.isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                          <span>{post.likes || 0}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPostDetail(post);
                          }}
                          className="flex items-center gap-1.5 font-semibold text-slate-500 hover:text-blue-600 transition cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments?.length || post.commentsCount || 0}</span>
                        </button>
                      </div>

                      <button
                        onClick={(e) => handleShare(post, e)}
                        className="flex items-center gap-1 font-semibold text-slate-500 hover:text-emerald-700 transition cursor-pointer"
                        title="แชร์โพสต์"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="hidden xs:inline">แชร์</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: 🚨 โพสต์แจ้งเหตุด่วน (EMERGENCY INCIDENT REPORTS - ปักหมุดบนแผนที่)  */}
      {/* ========================================================================= */}
      {mainFeedTab === 'alerts' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Header Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-950 via-red-900 to-rose-900 text-white rounded-3xl shadow-lg border border-rose-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-rose-500/30 text-rose-300 rounded-xl border border-rose-400/30">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <h3 className="font-black text-base sm:text-lg text-white tracking-tight">
                  โพสต์แจ้งเหตุด่วนและภัยพิบัติ (ปักหมุดบนแผนที่จริง)
                </h3>
              </div>
              <p className="text-xs text-rose-200 mt-1 leading-relaxed">
                รายงานสถานการณ์ฉุกเฉิน น้ำท่วม อุบัติเหตุ ไฟไหม้ ทุกเหตุการณ์จะ<strong>ปักหมุดบนแผนที่รอบตัว</strong> พร้อมปุ่มนำทาง Google Maps เด้งเข้าแอปทันที
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('map');
                  showToast('เปิดแผนที่รอบตัวแสดงจุดแจ้งเหตุและร้านค้า', 'info');
                }}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/20 transition active:scale-95 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>ดูแผนที่รอบตัว</span>
              </button>

              {onOpenReportAlert && (
                <button
                  type="button"
                  onClick={onOpenReportAlert}
                  className="px-4 py-2.5 bg-white text-rose-950 hover:bg-rose-50 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-rose-600" />
                  <span>+ แจ้งเหตุด่วนใหม่</span>
                </button>
              )}
            </div>
          </div>

          {/* Anti-Fake News & Community Verification Bar */}
          <div className="p-3 bg-amber-500/10 border border-amber-300/70 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="leading-snug">
              <strong>ระบบร่วมตรวจสอบโดยชุมชน:</strong> คนในพื้นที่สามารถกดปุ่ม <em>"ยืนยันมีเหตุจริง"</em> หรือ <em>"ไม่พบเหตุการณ์"</em> เพื่อช่วยคัดกรองข่าวปลอมได้ทันที
            </p>
          </div>

          {/* Sub-tabs: โพสต์ที่ได้รับความสนใจ vs โพสต์ใหม่ */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setAlertSortMode('trending')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                alertSortMode === 'trending'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>🔥 ได้รับความสนใจ (ยอดนิยม)</span>
            </button>
            <button
              type="button"
              onClick={() => setAlertSortMode('latest')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                alertSortMode === 'latest'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>⏱️ โพสต์ใหม่ (ล่าสุด)</span>
            </button>
          </div>

          {/* Search Bar for Alerts */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาจุดแจ้งเหตุ, น้ำท่วม, อุบัติเหตุ, สถานที่..."
              className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-rose-500 shadow-2xs"
            />
          </div>

          {/* Emergency Cards List */}
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <ShieldCheck className="w-12 h-12 mx-auto text-emerald-500 stroke-1" />
              <h4 className="text-base font-bold text-slate-800">ไม่มีรายงานเหตุฉุกเฉินในพื้นที่ขณะนี้</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                สถานการณ์ในพื้นที่ {location.province} ปลอดภัยและเป็นปกติ หากพบเหตุผิดปกติสามารถกดปุ่มแจ้งเหตุด่วนเพื่อปักหมุดบนแผนที่ได้ทันที
              </p>
              {onOpenReportAlert && (
                <button
                  type="button"
                  onClick={onOpenReportAlert}
                  className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>แจ้งเหตุด่วนพร้อมปักหมุด</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredAlerts.map(alert => renderEmergencyVerificationCard(alert))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
