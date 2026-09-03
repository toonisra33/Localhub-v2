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
  Sparkles,
  Volume2,
  ExternalLink,
  ShoppingBag,
  Newspaper,
  Megaphone,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
  Maximize2
} from 'lucide-react';

import { isAuthorizedAdminEmail } from '../lib/firebase';

export function AdminBroadcastBanner() {
  const { 
    activeBroadcast, 
    isBroadcastVisible, 
    deviceRemainingSeconds, 
    role, 
    setOpenAdminModal 
  } = useBroadcast();
  const { openMediaViewer, isLoggedIn, userProfile } = useCommunity();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const isLeaving = deviceRemainingSeconds <= 1;
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
    // Check by category first, then severity
    if (activeBroadcast.category === 'marketing' || activeBroadcast.severity === 'special') {
      return {
        wrapper: 'bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white shadow-2xl border-b-2 border-purple-500/60',
        badge: 'bg-purple-500/25 text-purple-200 border-purple-400/40',
        timerBadge: 'bg-black/50 text-amber-300 border-amber-400/40',
        progressBar: 'bg-gradient-to-r from-amber-400 to-purple-400',
        icon: ShoppingBag,
        iconColor: 'text-purple-300',
        categoryLabel: '🛍️ สินค้าและบริการ / การตลาด',
        actionButton: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md shadow-purple-900/40',
        borderAccent: 'border-purple-500/30'
      };
    }

    if (activeBroadcast.category === 'news') {
      return {
        wrapper: 'bg-gradient-to-r from-blue-950 via-slate-900 to-sky-950 text-white shadow-2xl border-b-2 border-blue-500/60',
        badge: 'bg-blue-500/25 text-blue-200 border-blue-400/40',
        timerBadge: 'bg-black/50 text-sky-200 border-sky-400/40',
        progressBar: 'bg-gradient-to-r from-sky-400 to-blue-400',
        icon: Newspaper,
        iconColor: 'text-sky-300',
        categoryLabel: '📰 ข่าวสารและสาระชุมชน',
        actionButton: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md shadow-blue-900/40',
        borderAccent: 'border-blue-500/30'
      };
    }

    if (activeBroadcast.severity === 'urgent' || activeBroadcast.category === 'emergency') {
      return {
        wrapper: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-2xl border-b-2 border-red-800',
        badge: 'bg-white/20 text-white border-white/30',
        timerBadge: 'bg-black/40 text-amber-200 border-amber-300/40',
        progressBar: 'bg-gradient-to-r from-yellow-300 to-amber-400',
        icon: AlertTriangle,
        iconColor: 'text-amber-300',
        categoryLabel: '🚨 บรอดแคสด่วนจากแอดมิน',
        actionButton: 'bg-white text-red-700 hover:bg-red-50 shadow-md',
        borderAccent: 'border-red-400/40'
      };
    }

    if (activeBroadcast.severity === 'high') {
      return {
        wrapper: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-2xl border-b-2 border-amber-800',
        badge: 'bg-white/20 text-white border-white/30',
        timerBadge: 'bg-black/40 text-white border-white/40',
        progressBar: 'bg-gradient-to-r from-yellow-300 to-orange-400',
        icon: AlertTriangle,
        iconColor: 'text-yellow-200',
        categoryLabel: '⚠️ แจ้งเตือนสำคัญ',
        actionButton: 'bg-white text-orange-700 hover:bg-orange-50 shadow-md',
        borderAccent: 'border-amber-400/40'
      };
    }

    // Default announcement
    return {
      wrapper: 'bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white shadow-2xl border-b-2 border-gray-950',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      timerBadge: 'bg-black/40 text-emerald-300 border-emerald-400/40',
      progressBar: 'bg-gradient-to-r from-emerald-400 to-teal-400',
      icon: Megaphone,
      iconColor: 'text-emerald-400',
      categoryLabel: '📢 ประชาสัมพันธ์ชุมชน',
      actionButton: 'bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold shadow-md',
      borderAccent: 'border-gray-700'
    };
  };

  const theme = getCategoryTheme();
  const CategoryIcon = theme.icon;
  const broadcastDate = new Date(activeBroadcast.broadcastAt);
  const timeString = broadcastDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-700 ease-in-out">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div 
          className={`transition-all duration-700 ease-in-out transform ${
            isLeaving 
              ? 'opacity-0 -translate-y-full max-h-0 pointer-events-none' 
              : 'opacity-100 translate-y-0 max-h-[850px] animate-in slide-in-from-top-full duration-500 shadow-[0_16px_40px_rgba(0,0,0,0.35)]'
          }`}
        >
          <div className={`${theme.wrapper} px-4 py-2.5 sm:px-5 transition-all relative overflow-hidden rounded-b-[28px] backdrop-blur-xl`}>
            
            {/* Subtle background ambient pulse for urgent or special marketing broadcasts */}
            {(activeBroadcast.severity === 'urgent' || activeBroadcast.category === 'marketing') && (
              <div 
                className="absolute -right-10 -top-10 w-28 h-28 bg-white/10 rounded-full animate-ping pointer-events-none opacity-30" 
                style={{ animationDuration: '3s' }} 
              />
            )}

            {/* Top bar with Badges & Live Status */}
            <div className="flex items-center justify-between gap-2 mb-1.5 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border ${theme.badge} backdrop-blur-md`}>
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  <Radio size={12} className="animate-pulse" />
                  {theme.categoryLabel}
                </span>

                {activeBroadcast.targetArea && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-white/90 bg-black/20 px-2 py-0.5 rounded-md">
                    <MapPin size={10} />
                    {activeBroadcast.targetArea}
                  </span>
                )}

                {/* Media Indicator Tag */}
                {activeBroadcast.mediaType && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {activeBroadcast.mediaType === 'video' ? <VideoIcon size={10} /> : <ImageIcon size={10} />}
                    {activeBroadcast.mediaType === 'video' ? 'วิดีโอ' : 'รูปภาพ'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Live Indicator Dot for Users (No countdown number) */}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/90 bg-white/15 px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  บรอดแคสสด
                </span>

                {/* Countdown Badge is visible ONLY to Admin for management */}
                {isRealAdmin && (
                  <div 
                    title="ตัวจับเวลาแอดมิน (ผู้ใช้ทั่วไปจะไม่เห็นเวลานี้)" 
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-extrabold border ${theme.timerBadge} shadow-inner cursor-help`}
                  >
                    <Clock size={11} className="text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>แอดมิน: {formattedTime}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex items-start justify-between gap-3 mt-0.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <CategoryIcon size={16} className={`${theme.iconColor} shrink-0 animate-bounce`} style={{ animationDuration: '2.5s' }} />
                  <h2 className="font-extrabold text-[14.5px] sm:text-[15.5px] leading-tight truncate text-white drop-shadow-sm">
                    {activeBroadcast.title}
                  </h2>
                </div>
                
                <p className={`text-[12.5px] text-white/95 mt-0.5 leading-relaxed ${isExpanded ? '' : 'line-clamp-1'}`}>
                  {activeBroadcast.message}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-center">
                {/* Quick Action Link Button in collapsed bar if provided */}
                {!isExpanded && activeBroadcast.actionUrl && (
                  <a
                    href={activeBroadcast.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`hidden xs:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${theme.actionButton}`}
                  >
                    <ExternalLink size={12} />
                    <span className="max-w-[100px] truncate">{activeBroadcast.actionText || 'เปิดดู'}</span>
                  </a>
                )}

                {isRealAdmin && (
                  <button
                    onClick={() => setOpenAdminModal(true)}
                    title="ตั้งค่าบรอดแคสแอดมิน"
                    className="p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-lg text-xs font-semibold border border-white/20 transition-colors flex items-center gap-1"
                  >
                    <Settings size={13} />
                    <span className="hidden sm:inline text-[11px]">จัดการ</span>
                  </button>
                )}

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-semibold transition-colors flex items-center"
                  aria-label="ขยายดูรายละเอียด"
                >
                  {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
              </div>
            </div>

            {/* Expanded Media & Details Section */}
            {isExpanded && (
              <div className={`mt-3 pt-3 border-t ${theme.borderAccent} text-[12px] space-y-3 animate-in fade-in duration-200`}>
                
                {/* Attached Media Player / Viewer */}
                {activeBroadcast.mediaType === 'image' && activeBroadcast.mediaUrl && (
                  <div 
                    onClick={() => openMediaViewer({
                      url: activeBroadcast.mediaUrl!,
                      type: 'image',
                      title: activeBroadcast.title,
                      subtitle: `บรอดแคสจาก: ${activeBroadcast.adminName}`
                    })}
                    className="rounded-2xl overflow-hidden border border-white/20 shadow-md max-h-56 bg-black/40 relative cursor-pointer group"
                  >
                    <img 
                      src={activeBroadcast.mediaUrl} 
                      alt={activeBroadcast.title} 
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[12px] font-bold flex items-center gap-1.5">
                        <Maximize2 size={14} className="text-emerald-400" />
                        <span>กดเพื่อดูภาพเต็มจอ</span>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-white flex items-center gap-1.5">
                      <ImageIcon size={12} className="text-purple-300" />
                      <span>ภาพประกอบข้อมูล (แตะเพื่อขยาย)</span>
                    </div>
                  </div>
                )}

                {activeBroadcast.mediaType === 'video' && activeBroadcast.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden border border-white/20 shadow-md bg-black relative">
                    <video 
                      src={activeBroadcast.mediaUrl} 
                      controls 
                      playsInline
                      className="w-full max-h-56 object-contain bg-black"
                    />
                    <div className="bg-black/80 px-3 py-1.5 text-[11px] text-white/90 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <VideoIcon size={13} className="text-sky-400" />
                        <span>วิดีโอแนะนำข้อมูล</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeBroadcast.videoDurationSeconds ? (
                          <span className="text-sky-300 font-bold">
                            ⏱️ {Math.floor(activeBroadcast.videoDurationSeconds / 60)}:{String(activeBroadcast.videoDurationSeconds % 60).padStart(2, '0')} น.
                          </span>
                        ) : null}
                        <button
                          onClick={() => openMediaViewer({
                            url: activeBroadcast.mediaUrl!,
                            type: 'video',
                            title: activeBroadcast.title,
                            subtitle: `วิดีโอบรอดแคสจาก: ${activeBroadcast.adminName}`
                          })}
                          className="px-2 py-0.5 rounded-lg bg-sky-500/30 hover:bg-sky-500/50 text-sky-200 text-[10.5px] font-extrabold flex items-center gap-1 transition-colors"
                        >
                          <Maximize2 size={11} />
                          <span>ดูเต็มจอ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meta Info Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/90 bg-black/30 p-2.5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white/70">ผู้ส่ง:</span>
                    <span>{activeBroadcast.adminName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white/70">เวลาส่ง:</span>
                    <span>{timeString} น. (รีเซ็ต 00:00 น.)</span>
                  </div>
                  {activeBroadcast.targetArea && (
                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      <span className="font-semibold text-white/70">พื้นที่เป้าหมาย:</span>
                      <span>{activeBroadcast.targetArea}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons (Link & Phone) */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  
                  {/* Optional Action Link: ONLY rendered if actionUrl is present */}
                  {activeBroadcast.actionUrl && (
                    <a
                      href={activeBroadcast.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-[13px] transition-all transform hover:scale-[1.02] active:scale-[0.98] ${theme.actionButton}`}
                    >
                      <ExternalLink size={15} />
                      <span>{activeBroadcast.actionText || 'ไปยังลิงก์ข้อมูล'}</span>
                    </a>
                  )}

                  {/* Emergency / Inquiries Contact Phone */}
                  {activeBroadcast.contactNumber && (
                    <a
                      href={`tel:${activeBroadcast.contactNumber}`}
                      className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl shadow-sm transition-colors text-[12px]"
                    >
                      <Phone size={14} />
                      โทร: {activeBroadcast.contactNumber}
                    </a>
                  )}
                  
                  <div className="text-[11px] text-white/75 italic ml-auto flex items-center gap-1">
                    <Volume2 size={12} />
                    ประกาศส่วนกลาง
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
