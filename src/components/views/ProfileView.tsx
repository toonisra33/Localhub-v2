import React, { useState } from 'react';
import {
  User,
  Shield,
  Volume2,
  VolumeX,
  MapPin,
  Bell,
  Heart,
  MessageSquare,
  Radio,
  HelpCircle,
  Smartphone,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallGuideModal } from '../pwa/PWAInstallGuideModal';
import { sendSystemNotification, requestNotificationPermission } from '../../utils/notificationService';

export const ProfileView: React.FC = () => {
  const {
    location,
    openLocationModal,
    isAdmin,
    setIsAdmin,
    openContactAdminModal,
    showToast
  } = useCommunity();

  const { soundEnabled, setSoundEnabled, playSoundAlert, setOpenAdminModal } = useBroadcast();
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleTestNotification = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      const sent = await sendSystemNotification({
        title: '📢 บรอดแคสต์ทดสอบ: ระบบแจ้งเตือน LocalHub',
        message: 'ระบบทำงานเบื้องหลังสำเร็จ! เมื่อคุณติดตั้งแอป LocalHub ลงเครื่อง การแจ้งเตือนจะแสดงจากแอป LocalHub โดยตรง ไม่ผ่าน Chrome',
        severity: 'urgent',
        targetArea: `${location.province} / ทุกพื้นที่`,
        link: 'broadcasts'
      });
      if (sent) {
        showToast('ส่งการแจ้งเตือนไปยังหน้าจอมือถือของคุณแล้ว!', 'success');
      } else {
        showToast('ไม่สามารถส่งการแจ้งเตือนได้ โปรดอนุญาตในการตั้งค่าระบบ', 'error');
      }
    } else {
      showToast('กรุณากดอนุญาตการแจ้งเตือนในเบราว์เซอร์', 'error');
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setIsGuideOpen(true);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Profile Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
        <img
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-md"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 truncate">คุณ (ผู้ใช้งาน LocalHub)</h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {isAdmin ? '🛡️ ผู้ดูแลระบบ (Admin)' : '👤 สมาชิกชุมชน'}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            พื้นที่ปัจจุบัน: <strong className="text-slate-800">{location.province} {location.district ? `(${location.district})` : ''}</strong>
            <button
              onClick={openLocationModal}
              className="text-blue-600 hover:underline font-semibold ml-1"
            >
              แก้ไข
            </button>
          </p>
        </div>
      </div>

      {/* PWA Direct Installation Status Card */}
      <div className="p-5 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-md space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-500/20 text-blue-300 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-sm">การแจ้งเตือนผ่านหน้าจอมือถือโดยตรง</h3>
              <p className="text-xs text-blue-200">ให้การแจ้งเตือนระบุชื่อแอป <strong>"LocalHub"</strong> ไม่ใช่ Chrome</p>
            </div>
          </div>

          {isInstalled ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ติดตั้งเป็นแอปแล้ว
            </span>
          ) : (
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              ติดตั้งแอป
            </button>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {isInstalled
            ? 'แอปพลิเคชันกำลังทำงานในโหมด Standalone แอปติดตั้งเรียบร้อยแล้ว การแจ้งเตือนจะส่งตรงจากแอป LocalHub สู่หน้าจอมือถือของคุณ'
            : 'เมื่อติดตั้งแอป LocalHub ลงในหน้าจอหลัก (Add to Home screen) ระบบ Android จะสร้างแอปขึ้นมาโดยตรง ทำให้การแจ้งเตือนแสดงชื่อแอป LocalHub แทนที่คำว่า Chrome และทำงานเบื้องหลังได้ตลอดเวลา'}
        </p>

        <div className="pt-1 flex items-center gap-2 flex-wrap">
          <button
            onClick={handleTestNotification}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Bell className="w-3.5 h-3.5 text-amber-300" />
            ทดสอบส่งแจ้งเตือนเข้าจอมือถือ
          </button>

          {!isInstalled && (
            <button
              onClick={() => setIsGuideOpen(true)}
              className="px-3 py-1.5 bg-transparent hover:bg-white/10 text-blue-200 rounded-xl text-xs font-medium transition"
            >
              ดูวิธีตั้งค่าให้แจ้งเตือนจากแอปโดยตรง
            </button>
          )}
        </div>
      </div>

      {/* Settings list */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {/* Admin Switch */}
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">สิทธิ์ผู้ดูแลระบบ (Admin Mode)</h4>
              <p className="text-xs text-slate-500">เปิดเพื่อทดสอบระบบบรอดแคสต์ ส่งสัญญาณเตือนภัย และส่งซ้ำ</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => {
                setIsAdmin(e.target.checked);
                showToast(e.target.checked ? 'เปิดใช้งานโหมดผู้ดูแลระบบ' : 'ปิดโหมดผู้ดูแลระบบ', 'info');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Sound alerts toggle */}
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">เสียงสัญญาณเตือนภัยฉุกเฉิน</h4>
              <p className="text-xs text-slate-500">ส่งเสียงแจ้งเตือนเมื่อมีบรอดแคสต์ระดับด่วนที่สุดหรือภัยพิบัติ</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playSoundAlert('urgent')}
              className="px-2.5 py-1 text-xs border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 font-medium"
            >
              ทดสอบเสียง
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Contact admin button */}
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">ติดต่อศูนย์ประสานงาน</h4>
              <p className="text-xs text-slate-500">ยื่นเรื่องร้องทุกข์ หรือขอส่งบรอดแคสต์ประชาสัมพันธ์ชุมชน</p>
            </div>
          </div>

          <button
            onClick={openContactAdminModal}
            className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition"
          >
            ส่งคำร้อง
          </button>
        </div>

        {/* Admin Broadcast Console launcher */}
        {isAdmin && (
          <div className="p-4 sm:p-5 flex items-center justify-between bg-blue-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-2xl">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-blue-950">คอนโซลบรอดแคสต์ (Admin Console)</h4>
                <p className="text-xs text-blue-800">ส่งข้อความเตือนภัยและประกาศสู่สมาชิกในพื้นที่</p>
              </div>
            </div>

            <button
              onClick={() => setOpenAdminModal(true)}
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition"
            >
              เปิดคอนโซล
            </button>
          </div>
        )}
      </div>

      {/* Guide Modal */}
      <PWAInstallGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Info footer */}
      <div className="text-center text-xs text-slate-400 py-3">
        LocalHub v1.0.0 • แพลตฟอร์มข้อมูลและเตือนภัยชุมชนท้องถิ่น (PWA Standalone Support)
      </div>
    </div>
  );
};
