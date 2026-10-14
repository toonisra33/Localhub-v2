import React, { useState } from 'react';
import {
  AlertTriangle,
  Radio,
  Volume2,
  VolumeX,
  X,
  ChevronRight,
  ExternalLink,
  MapPin,
  Flame,
  CloudRain,
  Car,
  BellRing
} from 'lucide-react';
import { useBroadcast } from '../context/BroadcastContext';
import { useCommunity } from '../context/CommunityContext';
import { BroadcastSeverity, BroadcastCategory } from '../types';

export const AdminBroadcastBanner: React.FC = () => {
  const { activeBroadcast, dismissBroadcast, soundEnabled, setSoundEnabled, playSoundAlert, setOpenAdminModal } = useBroadcast();
  const { location, isAdmin } = useCommunity();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!activeBroadcast) return null;

  // Check if broadcast matches target scope
  const isTargetAreaMatch = (): boolean => {
    if (!activeBroadcast.targetScope || activeBroadcast.targetScope === 'all') return true;

    // If specific, check province & district
    const userProv = (location?.province || '').trim();
    const targetProv = (activeBroadcast.targetProvince || '').trim();
    if (targetProv && userProv) {
      const provMatch = userProv.includes(targetProv) || targetProv.includes(userProv);
      if (!provMatch) {
        // If user is admin, allow seeing anyway with badge indicator
        return isAdmin;
      }
    }

    const userDist = (location?.district || '').trim();
    const targetDist = (activeBroadcast.targetDistrict || '').trim();
    if (targetDist && userDist) {
      const distMatch = userDist.includes(targetDist) || targetDist.includes(userDist);
      if (!distMatch) {
        return isAdmin;
      }
    }

    return true;
  };

  const matchesArea = isTargetAreaMatch();
  if (!matchesArea) return null;

  const isUrgent = activeBroadcast.severity === 'urgent';
  const isHigh = activeBroadcast.severity === 'high';
  const isSpecial = activeBroadcast.severity === 'special';

  const getCategoryIcon = (cat: BroadcastCategory) => {
    switch (cat) {
      case 'emergency': return <Flame className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'weather': return <CloudRain className="w-5 h-5 text-amber-500" />;
      case 'traffic': return <Car className="w-5 h-5 text-orange-500" />;
      default: return <Radio className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityStyle = (sev: BroadcastSeverity) => {
    if (sev === 'urgent') {
      return 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-red-500/25 border-red-500';
    }
    if (sev === 'high') {
      return 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-amber-500/20 border-amber-500';
    }
    if (sev === 'special') {
      return 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-emerald-500/20 border-emerald-500';
    }
    return 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-blue-500/20 border-blue-500';
  };

  return (
    <div
      className={`relative z-40 transition-all duration-300 shadow-md ${
        isUrgent ? 'animate-emergency-pulse' : ''
      }`}
    >
      <div className={`px-2.5 py-2 sm:px-6 sm:py-3 border-b overflow-hidden w-full max-w-full ${getSeverityStyle(activeBroadcast.severity)}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 text-xs sm:text-sm w-full min-w-0">
          {/* Left badge & title */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 overflow-hidden">
            <span className="flex-shrink-0 flex items-center justify-center p-1 sm:p-1.5 bg-white/15 rounded-lg backdrop-blur-sm">
              {isUrgent ? (
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-bounce" />
              ) : (
                <BellRing className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </span>

            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden flex-1">
              <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
                {activeBroadcast.severity === 'urgent' && '🚨 ด่วน'}
                {activeBroadcast.severity === 'high' && '⚠️ เตือน'}
                {activeBroadcast.severity === 'special' && '✨ ข่าว'}
                {activeBroadcast.severity === 'normal' && '📢 ข่าว'}
              </span>

              {activeBroadcast.targetArea && (
                <span className="hidden sm:inline-flex shrink-0 items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-black/20 text-white/95 truncate max-w-[100px]">
                  <MapPin className="w-3 h-3 text-white/80" />
                  {activeBroadcast.targetArea}
                </span>
              )}

              <p className="font-semibold text-white truncate text-xs sm:text-sm min-w-0 flex-1">
                {activeBroadcast.title}
              </p>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-white/15 hover:bg-white/25 text-white font-medium flex items-center gap-0.5 sm:gap-1 transition shrink-0"
            >
              <span>{isExpanded ? 'ย่อ' : 'อ่านต่อ'}</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>

            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playSoundAlert(activeBroadcast.severity);
              }}
              title={soundEnabled ? 'ปิดเสียงแจ้งเตือน' : 'เปิดเสียงแจ้งเตือน'}
              className="p-1 sm:p-1.5 rounded-md hover:bg-white/20 text-white transition shrink-0"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70" />}
            </button>

            <button
              onClick={() => dismissBroadcast(activeBroadcast.id)}
              title="ปิดแถบแจ้งเตือนนี้"
              className="p-1 sm:p-1.5 rounded-md hover:bg-white/20 text-white transition shrink-0"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Details Accordion */}
        {isExpanded && (
          <div className="max-w-7xl mx-auto mt-2.5 pt-2.5 border-t border-white/20 text-xs sm:text-sm text-white/95 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
              <div className="space-y-1.5 max-w-3xl min-w-0 flex-1">
                <p className="leading-relaxed text-white/95 break-words">{activeBroadcast.message}</p>
                <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-white/75 pt-1 flex-wrap">
                  <span>ผู้ประกาศ: {activeBroadcast.adminName}</span>
                  <span>•</span>
                  <span>เวลา: {activeBroadcast.broadcastDateStr}</span>
                </div>
              </div>

              {activeBroadcast.mediaUrl && (
                <div className="flex-shrink-0">
                  {activeBroadcast.mediaType === 'video' ? (
                    <video
                      src={activeBroadcast.mediaUrl}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-48 max-h-28 object-contain rounded-lg border border-white/20 shadow bg-black"
                    />
                  ) : (
                    <img
                      src={activeBroadcast.mediaUrl}
                      alt="Broadcast attachment"
                      className="w-32 h-20 object-cover rounded-lg border border-white/20 shadow"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              {activeBroadcast.actionUrl && (
                <a
                  href={activeBroadcast.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition shadow"
                >
                  {activeBroadcast.actionText || 'ตรวจสอบข้อมูลเพิ่มเติม'}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {isAdmin && (
                <button
                  onClick={() => setOpenAdminModal(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium text-xs transition"
                >
                  จัดการข้อความบรอดแคสต์
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
