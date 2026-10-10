import React, { useState } from 'react';
import { useBroadcast } from '../context/BroadcastContext';
import { useCommunity } from '../context/CommunityContext';
import { 
  Radio, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Phone, 
  Settings, 
  Volume2,
  ExternalLink,
  ShoppingBag,
  Newspaper,
  Megaphone,
  Image as ImageIcon,
  Video as VideoIcon,
  Maximize2
} from 'lucide-react';

import { isAuthorizedAdminEmail } from '../lib/firebase';
import { safeStorage } from '../lib/safeStorage';
import { openExternalLink } from '../utils/linkHandler';

export function AdminBroadcastBanner() {
  const { 
    activeBroadcast, 
    isBroadcastVisible, 
    deviceRemainingSeconds, 
    role, 
    setOpenAdminModal 
  } = useBroadcast();
  const { openMediaViewer, isLoggedIn, userProfile, jumpToMapLocation } = useCommunity();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(() => {
    if (!activeBroadcast) return false;
    const key = `locallink_broadcast_fullscreen_${activeBroadcast.id}`;
    return safeStorage.getItem(key) !== 'true';
  });

  const isLeaving = deviceRemainingSeconds <= 1;

  // Sync fullscreen state if broadcast changes
  React.useEffect(() => {
    if (activeBroadcast) {
      const key = `locallink_broadcast_fullscreen_${activeBroadcast.id}`;
      const isMinimized = safeStorage.getItem(key) === 'true';
      setIsFullScreen(!isMinimized);
      if (!isMinimized) {
        setIsExpanded(true);
      }
    }
  }, [activeBroadcast]);

  const handleMinimize = () => {
    if (!activeBroadcast) return;
    setIsFullScreen(false);
    setIsExpanded(false);
    const key = `locallink_broadcast_fullscreen_${activeBroadcast.id}`;
    safeStorage.setItem(key, 'true');
  };

  const isRealAdmin = isLoggedIn && role === 'admin' && isAuthorizedAdminEmail(userProfile?.email);

  // If no broadcast or expired on this device, do not render
  if (!isBroadcastVisible || !activeBroadcast) {
    return null;
  }

  // Format seconds to mm:ss (for admin inspection)
  const minutes = Math.floor(deviceRemainingSeconds / 60);
  const seconds = deviceRemainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const getCategoryTheme = () => {
    if (activeBroadcast.category === 'marketing' || activeBroadcast.severity === 'special') {
      return {
        wrapper: 'bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white shadow-2xl border border-purple-400/40',
        badge: 'bg-purple-500/30 text-purple-200 border-purple-400/50',
        timerBadge: 'bg-black/60 text-amber-300 border-amber-400/40',
        icon: ShoppingBag,
        iconColor: 'text-purple-300',
        categoryLabel: '🛍️ สินค้าและบริการ',
        actionButton: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md shadow-purple-900/40',
        borderAccent: 'border-purple-400/30'
      };
    }

    if (activeBroadcast.category === 'news') {
      return {
        wrapper: 'bg-gradient-to-r from-blue-950 via-slate-900 to-sky-950 text-white shadow-2xl border border-blue-400/40',
        badge: 'bg-blue-500/30 text-blue-200 border-blue-400/50',
        timerBadge: 'bg-black/60 text-sky-200 border-sky-400/40',
        icon: Newspaper,
        iconColor: 'text-sky-300',
        categoryLabel: '📰 ข่าวสารชุมชน',
        actionButton: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md shadow-blue-900/40',
        borderAccent: 'border-blue-400/30'
      };
    }

    if (activeBroadcast.severity === 'urgent' || activeBroadcast.category === 'emergency') {
      return {
        wrapper: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-2xl border border-red-300/40',
        badge: 'bg-white/25 text-white border-white/40',
        timerBadge: 'bg-black/50 text-amber-200 border-amber-300/40',
        icon: AlertTriangle,
        iconColor: 'text-amber-200',
        categoryLabel: '🚨 บรอดแคสด่วน',
        actionButton: 'bg-white text-red-700 hover:bg-red-50 shadow-md font-bold',
        borderAccent: 'border-red-300/30'
      };
    }

    if (activeBroadcast.severity === 'high') {
      return {
        wrapper: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-2xl border border-amber-300/40',
        badge: 'bg-white/25 text-white border-white/40',
        timerBadge: 'bg-black/50 text-white border-white/40',
        icon: AlertTriangle,
        iconColor: 'text-yellow-200',
        categoryLabel: '⚠️ แจ้งเตือนสำคัญ',
        actionButton: 'bg-white text-orange-700 hover:bg-orange-50 shadow-md font-bold',
        borderAccent: 'border-amber-300/30'
      };
    }

    // Default announcement
    return {
      wrapper: 'bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white shadow-2xl border border-gray-600/40',
      badge: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40',
      timerBadge: 'bg-black/60 text-emerald-300 border-emerald-400/40',
      icon: Megaphone,
      iconColor: 'text-emerald-400',
      categoryLabel: '📢 ประชาสัมพันธ์',
      actionButton: 'bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold shadow-md',
      borderAccent: 'border-gray-600/30'
    };
  };

  const theme = getCategoryTheme();
  const CategoryIcon = theme.icon;
  const broadcastDate = new Date(activeBroadcast.broadcastAt);
  const timeString = broadcastDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  // 1. FULLSCREEN / MODAL DIALOG MODE (Auto-opens on new broadcast, perfectly responsive & never overflows)
  if (isFullScreen) {
    return (
      <div 
        className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md pointer-events-auto flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300"
        onClick={handleMinimize}
      >
        <div 
          className={`pointer-events-auto transition-all w-full max-w-sm sm:max-w-md max-h-[85vh] sm:max-h-[82vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl ${theme.wrapper}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Fixed Card Header */}
          <div className="shrink-0 p-3.5 sm:p-4 border-b border-white/15 bg-black/15">
            {/* Top Badges Row */}
            <div className="flex items-center justify-between gap-1.5 mb-2 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold border ${theme.badge} whitespace-nowrap shrink-0 shadow-sm`}>
                  <Radio size={11} className="animate-pulse" />
                  <span>{theme.categoryLabel}</span>
                </span>

                {activeBroadcast.mediaType && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/90 bg-white/20 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    {activeBroadcast.mediaType === 'video' ? <VideoIcon size={10} /> : <ImageIcon size={10} />}
                    <span>{activeBroadcast.mediaType === 'video' ? 'วิดีโอ' : 'รูปภาพ'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-full border border-white/20 whitespace-nowrap shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>สด</span>
                </span>

                {isRealAdmin && (
                  <div 
                    title="ตัวจับเวลาแอดมิน" 
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${theme.timerBadge} shadow-inner whitespace-nowrap shrink-0 font-mono`}
                  >
                    <Clock size={10} className="text-amber-300" />
                    <span>แอดมิน: {formattedTime}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Title & Minimize Header Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-1.5 min-w-0 flex-1">
                <CategoryIcon size={17} className={`${theme.iconColor} shrink-0 mt-0.5`} />
                <h2 className="font-extrabold text-[14.5px] sm:text-[15.5px] leading-snug text-white line-clamp-2 drop-shadow-sm">
                  {activeBroadcast.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleMinimize}
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer shadow-sm ml-1"
                aria-label="ย่อประกาศ"
              >
                <span>ย่อลง</span>
                <ChevronUp size={14} />
              </button>
            </div>
          </div>

          {/* Scrollable Card Body (Media, Details, Info, Actions) */}
          <div className="overflow-y-auto overscroll-contain p-3.5 sm:p-4 space-y-3 flex-1">
            {/* Attached Image (Properly constrained, never pushes box off-screen) */}
            {activeBroadcast.mediaType === 'image' && activeBroadcast.mediaUrl && (
              <div 
                onClick={() => openMediaViewer({
                  url: activeBroadcast.mediaUrl!,
                  type: 'image',
                  title: activeBroadcast.title,
                  subtitle: `บรอดแคสจาก: ${activeBroadcast.adminName}`
                })}
                className="rounded-2xl overflow-hidden border border-white/20 shadow-md bg-black/60 relative cursor-pointer group flex items-center justify-center max-h-48 sm:max-h-56"
              >
                <img 
                  src={activeBroadcast.mediaUrl} 
                  alt={activeBroadcast.title} 
                  className="w-full h-44 sm:h-52 object-cover sm:object-contain transition-transform duration-300 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
                    <Maximize2 size={13} className="text-emerald-400" />
                    <span>กดดูภาพเต็มจอ</span>
                  </div>
                </div>
                <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] text-white flex items-center gap-1">
                  <ImageIcon size={11} className="text-purple-300" />
                  <span>แตะเพื่อขยายภาพ</span>
                </div>
              </div>
            )}

            {/* Attached Video */}
            {activeBroadcast.mediaType === 'video' && activeBroadcast.mediaUrl && (
              <div className="rounded-2xl overflow-hidden border border-white/20 shadow-md bg-black relative">
                <video 
                  src={activeBroadcast.mediaUrl} 
                  controls 
                  playsInline
                  className="w-full max-h-44 sm:max-h-52 object-contain bg-black"
                />
                <div className="bg-black/85 px-2.5 py-1 text-[10.5px] text-white/90 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <VideoIcon size={12} className="text-sky-400" />
                    <span>วิดีโอประกอบข้อมูล</span>
                  </div>
                  <button
                    onClick={() => openMediaViewer({
                      url: activeBroadcast.mediaUrl!,
                      type: 'video',
                      title: activeBroadcast.title,
                      subtitle: `วิดีโอบรอดแคสจาก: ${activeBroadcast.adminName}`
                    })}
                    className="px-2 py-0.5 rounded-lg bg-sky-500/30 hover:bg-sky-500/50 text-sky-200 text-[10px] font-extrabold flex items-center gap-1 transition-colors"
                  >
                    <Maximize2 size={11} />
                    <span>ดูเต็มจอ</span>
                  </button>
                </div>
              </div>
            )}

            {/* Broadcast Message Content */}
            <div className="bg-black/20 p-2.5 sm:p-3 rounded-2xl border border-white/10">
              <p className="text-[12.5px] sm:text-[13px] text-white/95 leading-relaxed whitespace-pre-wrap break-words">
                {activeBroadcast.message}
              </p>
            </div>

            {/* Metadata Info Box */}
            <div className="grid grid-cols-2 gap-1.5 text-white/90 bg-black/25 p-2.5 rounded-2xl border border-white/10 text-[11px]">
              <div className="flex items-center gap-1 truncate">
                <span className="font-semibold text-white/70">ผู้ส่ง:</span>
                <span className="truncate">{activeBroadcast.adminName}</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <span className="font-semibold text-white/70">เวลา:</span>
                <span>{timeString} น.</span>
              </div>
              {activeBroadcast.targetArea && (
                <div className="col-span-2 flex items-center gap-1 truncate pt-0.5 border-t border-white/10">
                  <MapPin size={11} className="text-white/70 shrink-0" />
                  <span className="font-semibold text-white/70">พื้นที่:</span>
                  <span className="truncate">{activeBroadcast.targetArea}</span>
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {activeBroadcast.actionUrl && (
                <button
                  type="button"
                  onClick={() => openExternalLink(activeBroadcast.actionUrl!)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-[12px] transition-all active:scale-95 shadow-sm ${theme.actionButton}`}
                >
                  <ExternalLink size={13} />
                  <span>{activeBroadcast.actionText || 'ไปยังลิงก์ข้อมูล'}</span>
                </button>
              )}

              {activeBroadcast.contactNumber && (
                <a
                  href={`tel:${activeBroadcast.contactNumber}`}
                  className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl shadow-sm transition-colors text-[11.5px]"
                >
                  <Phone size={13} />
                  <span>โทร: {activeBroadcast.contactNumber}</span>
                </a>
              )}

              {activeBroadcast.checkIn && (
                <button
                  type="button"
                  onClick={() => {
                    jumpToMapLocation(
                      activeBroadcast.checkIn!.latitude, 
                      activeBroadcast.checkIn!.longitude, 
                      17, 
                      activeBroadcast.checkIn!.placeName
                    );
                    handleMinimize();
                  }}
                  className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold px-3 py-2 rounded-xl shadow-sm transition-colors text-[11.5px]"
                >
                  <MapPin size={13} />
                  <span>ดูตำแหน่งบนแผนที่</span>
                </button>
              )}
            </div>
          </div>

          {/* Card Footer (Convenient bottom minimize bar) */}
          <div className="shrink-0 px-3.5 py-2.5 border-t border-white/15 bg-black/20 flex items-center justify-between">
            <div className="text-[10.5px] text-white/70 italic flex items-center gap-1">
              <Volume2 size={12} />
              <span>ประกาศส่วนกลาง (แสดง 15 นาที)</span>
            </div>

            <button
              type="button"
              onClick={handleMinimize}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-[11px] font-extrabold transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm"
            >
              <span>ย่อไปไว้แถบด้านบน</span>
              <ChevronUp size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. TOP BANNER MODE (Compact floating bar, non-intrusive, perfectly fitted to all screen sizes)
  return (
    <div className="fixed top-1.5 sm:top-2.5 left-2 right-2 z-[100] pointer-events-none flex justify-center">
      <div 
        className={`pointer-events-auto transition-all duration-300 w-full max-w-md sm:max-w-xl rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl ${theme.wrapper} ${
          isLeaving ? 'opacity-0 -translate-y-full max-h-0' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-1 px-3 pt-2 pb-0.5 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-extrabold uppercase border ${theme.badge} whitespace-nowrap shrink-0`}>
              <Radio size={10} className="animate-pulse" />
              <span>{theme.categoryLabel}</span>
            </span>

            {activeBroadcast.mediaType && (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-white/90 bg-white/15 px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0">
                {activeBroadcast.mediaType === 'video' ? <VideoIcon size={9} /> : <ImageIcon size={9} />}
                <span>{activeBroadcast.mediaType === 'video' ? 'วิดีโอ' : 'รูปภาพ'}</span>
              </span>
            )}

            {activeBroadcast.targetArea && (
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[9.5px] font-medium text-white/90 bg-black/25 px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0">
                <MapPin size={9} />
                <span className="max-w-[100px] truncate">{activeBroadcast.targetArea}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-white/90 bg-white/15 px-1.5 py-0.5 rounded-full border border-white/20 whitespace-nowrap shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>สด</span>
            </span>

            {isRealAdmin && (
              <div 
                title="ตัวจับเวลาแอดมิน" 
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-mono font-extrabold border ${theme.timerBadge} shadow-inner whitespace-nowrap shrink-0`}
              >
                <Clock size={9} className="text-amber-300" />
                <span>แอดมิน: {formattedTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content & Quick Actions Row */}
        <div className="flex items-center justify-between gap-2 px-3 pb-2 pt-0.5">
          <div 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="flex-1 min-w-0 cursor-pointer select-none"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <CategoryIcon size={14} className={`${theme.iconColor} shrink-0`} />
              <h3 className="font-extrabold text-[13px] sm:text-[14px] leading-tight truncate text-white drop-shadow-sm">
                {activeBroadcast.title}
              </h3>
            </div>
            <p className="text-[11px] sm:text-[11.5px] text-white/90 truncate leading-snug mt-0.5">
              {activeBroadcast.message}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Quick Action Button if present and collapsed */}
            {!isExpanded && activeBroadcast.actionUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openExternalLink(activeBroadcast.actionUrl!);
                }}
                className={`hidden xs:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-bold transition-all ${theme.actionButton}`}
              >
                <ExternalLink size={11} />
                <span className="max-w-[70px] truncate">{activeBroadcast.actionText || 'เปิด'}</span>
              </button>
            )}

            {isRealAdmin && (
              <button
                type="button"
                onClick={() => setOpenAdminModal(true)}
                title="ตั้งค่าบรอดแคสแอดมิน"
                className="p-1 bg-black/30 hover:bg-black/50 text-white rounded-lg text-xs font-semibold border border-white/20 transition-colors flex items-center shrink-0 cursor-pointer"
              >
                <Settings size={13} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold transition-all flex items-center shrink-0 cursor-pointer active:scale-95"
              aria-label={isExpanded ? 'ย่อลง' : 'ขยายดูรายละเอียด'}
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Collapsible Drawer (When expanded inside top banner) */}
        {isExpanded && (
          <div className="max-h-[55vh] overflow-y-auto overscroll-contain px-3 py-2.5 border-t border-white/15 space-y-2.5 bg-black/15 text-[11.5px] animate-in fade-in duration-200">
            {/* Image Preview */}
            {activeBroadcast.mediaType === 'image' && activeBroadcast.mediaUrl && (
              <div 
                onClick={() => openMediaViewer({
                  url: activeBroadcast.mediaUrl!,
                  type: 'image',
                  title: activeBroadcast.title,
                  subtitle: `บรอดแคสจาก: ${activeBroadcast.adminName}`
                })}
                className="rounded-xl overflow-hidden border border-white/20 shadow-sm bg-black/60 relative cursor-pointer flex items-center justify-center max-h-40"
              >
                <img 
                  src={activeBroadcast.mediaUrl} 
                  alt={activeBroadcast.title} 
                  className="w-full h-36 object-cover transition-transform duration-300"
                />
                <div className="absolute bottom-1.5 left-1.5 bg-black/80 px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1">
                  <ImageIcon size={10} className="text-purple-300" />
                  <span>แตะดูภาพเต็มจอ</span>
                </div>
              </div>
            )}

            {/* Video Preview */}
            {activeBroadcast.mediaType === 'video' && activeBroadcast.mediaUrl && (
              <div className="rounded-xl overflow-hidden border border-white/20 shadow-sm bg-black">
                <video 
                  src={activeBroadcast.mediaUrl} 
                  controls 
                  playsInline
                  className="w-full max-h-36 object-contain bg-black"
                />
              </div>
            )}

            {/* Full Message Text */}
            <div className="bg-black/25 p-2 rounded-xl border border-white/10 text-white/95 leading-relaxed whitespace-pre-wrap break-words text-[12px]">
              {activeBroadcast.message}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {activeBroadcast.actionUrl && (
                <button
                  type="button"
                  onClick={() => openExternalLink(activeBroadcast.actionUrl!)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-[11.5px] ${theme.actionButton}`}
                >
                  <ExternalLink size={12} />
                  <span>{activeBroadcast.actionText || 'ไปยังลิงก์'}</span>
                </button>
              )}

              {activeBroadcast.contactNumber && (
                <a
                  href={`tel:${activeBroadcast.contactNumber}`}
                  className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2.5 py-1.5 rounded-xl text-[11px]"
                >
                  <Phone size={12} />
                  <span>โทร: {activeBroadcast.contactNumber}</span>
                </a>
              )}

              {activeBroadcast.checkIn && (
                <button
                  type="button"
                  onClick={() => {
                    jumpToMapLocation(
                      activeBroadcast.checkIn!.latitude, 
                      activeBroadcast.checkIn!.longitude, 
                      17, 
                      activeBroadcast.checkIn!.placeName
                    );
                    setIsExpanded(false);
                  }}
                  className="inline-flex items-center gap-1 bg-sky-500 hover:bg-sky-600 text-white font-bold px-2.5 py-1.5 rounded-xl text-[11px]"
                >
                  <MapPin size={12} />
                  <span>ดูตำแหน่ง</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="ml-auto px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10.5px] font-bold"
              >
                ย่อลง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
