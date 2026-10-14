import React, { useRef } from 'react';
import {
  MapPin,
  Bell,
  Radio,
  Plus,
  ChevronDown,
  Camera
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { saveMediaFile } from '../utils/mediaStorage';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenCreatePost: () => void;
  onOpenCreatePostWithMode?: (mode: 'camera' | 'gallery' | 'video' | 'standard', images?: string[]) => void;
  onOpenInstantCamera?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNotifications,
  onOpenCreatePost,
  onOpenCreatePostWithMode,
  onOpenInstantCamera
}) => {
  const { location, openLocationModal, unreadNotifCount, showToast, setActiveTab } = useCommunity();

  const navCameraInputRef = useRef<HTMLInputElement>(null);

  const handleNavCameraSnap = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const file = files[0];
      const saved = await saveMediaFile(file, file.name);
      showToast('📸 ถ่ายภาพสดจากกล้องเรียบร้อย!', 'success');
      if (onOpenCreatePostWithMode) {
        onOpenCreatePostWithMode('standard', [saved.objectUrl]);
      } else {
        onOpenCreatePost();
      }
    } catch {
      showToast('ไม่สามารถบันทึกภาพถ่ายได้', 'error');
    } finally {
      if (navCameraInputRef.current) navCameraInputRef.current.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Hidden camera input for navbar shutter */}
      <input
        ref={navCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleNavCameraSnap}
      />

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Logo and Brand */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer group"
          title="ไปที่หน้าหลัก"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0 group-hover:scale-105 transition-transform">
            <span className="text-base sm:text-lg">🏠</span>
          </div>

          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-xl">
                Local<span className="text-emerald-600">Hub</span>
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-bold border border-emerald-300">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              ศูนย์รวมชุมชน & บรอดแคสต์สด
            </p>
          </div>
        </div>

        {/* Center / Location Selector button */}
        <button
          onClick={openLocationModal}
          className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-full text-[11px] sm:text-xs font-semibold text-slate-700 transition shrink min-w-0"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="max-w-[70px] sm:max-w-[150px] truncate">
            {location.displayName || location.province}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </button>

        {/* Right action icons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Camera Snap Button */}
          <button
            onClick={() => {
              if (onOpenInstantCamera) {
                onOpenInstantCamera();
              } else {
                navCameraInputRef.current?.click();
              }
            }}
            className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border sm:border-2 border-emerald-300 rounded-xl text-xs font-extrabold transition shadow-xs active:scale-95 group shrink-0"
            title="กดเพื่อเปิดกล้องถ่ายภาพสดทันที"
          >
            <Camera className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">ถ่ายรูปสด</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 sm:p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition shrink-0"
            title="การแจ้งเตือน"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-sm">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Quick Post button */}
          <button
            onClick={onOpenCreatePost}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">โพสต์</span>
          </button>
        </div>
      </div>
    </header>
  );
};
