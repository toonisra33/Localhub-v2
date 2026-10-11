import React from 'react';
import {
  X,
  Smartphone,
  Download,
  Bell,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { sendSystemNotification, requestNotificationPermission } from '../../utils/notificationService';
import { useCommunity } from '../../context/CommunityContext';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install, isInstalled, isIOS, isAndroid } = usePWAInstall();
  const { showToast } = useCommunity();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        showToast('ติดตั้งแอป LocalHub สำเร็จแล้ว!', 'success');
        onClose();
      }
    } else {
      showToast('โปรดทำตามขั้นตอนในคำแนะนำด้านล่าง', 'info');
    }
  };

  const handleTestNotification = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      const sent = await sendSystemNotification({
        title: '📢 บรอดแคสต์ทดสอบ: ระบบแจ้งเตือน LocalHub',
        message: 'ระบบทำงานเบื้องหลังสำเร็จ! เมื่อคุณติดตั้งแอป LocalHub ลงเครื่อง การแจ้งเตือนจะแสดงจากแอป LocalHub โดยตรง ไม่ผ่าน Chrome',
        severity: 'urgent',
        targetArea: 'จังหวัดปทุมธานี / ทุกพื้นที่',
        link: 'broadcasts'
      });
      if (sent) {
        showToast('ส่งการแจ้งเตือนไปยังหน้าจอมือถือของคุณแล้ว!', 'success');
      } else {
        showToast('ไม่สามารถส่งการแจ้งเตือนได้ โปรดอนุญาตในการตั้งค่าระบบ', 'error');
      }
    } else {
      showToast('กรุณากด "อนุญาต (Allow)" ในเบราว์เซอร์เพื่อเปิดรับการแจ้งเตือน', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">ติดตั้ง LocalHub ลงมือถือ</h3>
              <p className="text-xs text-blue-100">เปลี่ยนการแจ้งเตือนให้เป็นชื่อแอปโดยตรง และทำงานเบื้องหลัง</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-800">
          {/* Why install card */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
            <h4 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              ทำไมถึงต้องติดตั้งแอป (Install App)?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              ในระบบปฏิบัติการ Android หากเปิดผ่านหน้าเว็บทั่วไป การแจ้งเตือนจะระบุหัวข้อเป็น <strong>"Chrome • domain"</strong> ตามระบบความปลอดภัยของเบราว์เซอร์
            </p>
            <p className="text-xs text-blue-800 font-semibold leading-relaxed">
              ✨ แต่เมื่อคุณกด <strong>"ติดตั้งแอป" (Add to Home screen)</strong> ระบบจะแปลงเป็นแอป Android โดยตรง (WebAPK) — ทำให้การแจ้งเตือนแสดงชื่อแอป <strong>"LocalHub"</strong> พร้อมไอคอนของแอปโดยตรง และแจ้งเตือนหน้าจอได้แม้ไม่ได้เปิดแอป!
            </p>
          </div>

          {/* Quick Install Action Button */}
          {isInstallable ? (
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition"
            >
              <Download className="w-5 h-5" />
              กดเพื่อติดตั้งแอป LocalHub ทันที
            </button>
          ) : (
            <div className="space-y-3">
              <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                วิธีติดตั้งผ่านเบราว์เซอร์ Google Chrome บนมือถือ:
              </h5>

              <div className="space-y-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div className="text-xs text-slate-700">
                    <strong className="text-slate-900">แตะปุ่มจุด 3 จุด (⋮)</strong> ที่มุมขวาบนของหน้าจอ Google Chrome
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="text-xs text-slate-700">
                    เลือกเมนู <strong className="text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">"ติดตั้งแอป" (Install app)</strong> หรือ <strong className="text-slate-800">"เพิ่มลงในหน้าจอหลัก" (Add to Home screen)</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="text-xs text-slate-700">
                    กดยืนยัน <strong>"ติดตั้ง" (Install)</strong> รอสักครู่ไอคอนแอป <strong className="text-blue-600">LocalHub</strong> จะปรากฏบนหน้าจอมือถือของคุณทันที
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test System Notification Button */}
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={handleTestNotification}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              ทดสอบส่งการแจ้งเตือนไปยังหน้าจอมือถือเดี๋ยวนี้
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            เข้าใจแล้ว / ปิดหน้านี้
          </button>
        </div>
      </div>
    </div>
  );
};
