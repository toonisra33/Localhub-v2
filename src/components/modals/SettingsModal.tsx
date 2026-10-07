import React, { useState } from 'react';
import { X, Settings, Bell, Shield, Moon, Globe, Trash2, RefreshCw, Radio, UserPlus, LogIn, LogOut, UserCheck, ShieldCheck, FileText, ExternalLink, AlertTriangle, MessageCircle, Sparkles, Share2 } from 'lucide-react';
import { useBroadcast } from '../../context/BroadcastContext';
import { useCommunity } from '../../context/CommunityContext';
import { isAuthorizedAdminEmail } from '../../lib/firebase';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { PromoKitModal } from './PromoKitModal';
import { PWAInstallButton } from '../PWAInstallButton';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { role, setRole } = useBroadcast();
  const { isLoggedIn, userProfile, openAuthModal, logout, showToast, openContactAdminModal } = useCommunity();
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [emergencyAlertsOnly, setEmergencyAlertsOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState('5');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);

  const isAuthorizedAdmin = isLoggedIn && isAuthorizedAdminEmail(userProfile?.email);

  const handleResetDemoData = () => {
    localStorage.clear();
    showToast('รีเซ็ตข้อมูลระบบเรียบร้อย กำลังโหลดหน้าใหม่...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-sm">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">การตั้งค่าแอปพลิเคชัน</h2>
              <p className="text-[11.5px] font-medium text-slate-500">ปรับแต่งการแจ้งเตือนและการใช้งาน</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* User Account Section */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-[13.5px]">บัญชีผู้ใช้งาน (User Account)</h4>
                <p className="text-[11.5px] text-slate-500">
                  {isLoggedIn ? `เข้าสู่ระบบในชื่อ: ${userProfile?.name}` : 'ยังไม่ได้เข้าสู่ระบบ (โหมดผู้เยี่ยมชม)'}
                </p>
              </div>
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                isLoggedIn ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {isLoggedIn ? '✓ เข้าสู่ระบบแล้ว' : 'ผู้เยี่ยมชม'}
              </span>
            </div>

            {!isLoggedIn && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuthModal('register');
                  }}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[12px] font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <UserPlus size={14} />
                  ลงทะเบียนใหม่
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuthModal('login');
                  }}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-[12px] font-extrabold border border-slate-200 shadow-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <LogIn size={14} />
                  เข้าสู่ระบบ / สลับบัญชี
                </button>
              </div>
            )}
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full mt-1.5 py-2 text-rose-600 hover:bg-rose-100/50 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-1 bg-white border border-rose-100 shadow-sm"
              >
                <LogOut size={14} />
                ออกจากระบบ (Logout)
              </button>
            )}
          </div>

          {/* Role Toggle */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-[13.5px]">สิทธิ์การใช้งาน (Role)</h4>
                <p className="text-[11.5px] text-slate-500">
                  {!isLoggedIn 
                    ? 'กรุณาลงทะเบียน/เข้าระบบเพื่อใช้งาน'
                    : isAuthorizedAdmin 
                      ? 'สำหรับสลับโหมดจำลองการทำงาน' 
                      : 'ระดับสิทธิ์ผู้ใช้งานปัจจุบัน'}
                </p>
              </div>
              
              {isLoggedIn && (
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                  role === 'admin' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {role === 'admin' ? '👑 แอดมิน' : '👤 สมาชิก'}
                </span>
              )}
            </div>

            {!isLoggedIn ? (
              <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
                <p className="text-[12px] font-medium text-slate-600 mb-2">ลงทะเบียนหรือเข้าสู่ระบบเพื่อใช้งานเต็มรูปแบบ</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openAuthModal('login');
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11.5px] font-extrabold transition-colors inline-flex items-center gap-1.5"
                >
                  <LogIn size={14} />
                  เข้าสู่ระบบ / สลับบัญชี
                </button>
              </div>
            ) : !isAuthorizedAdmin ? (
              <div className="bg-white rounded-xl border border-emerald-100 p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="text-[12.5px] font-extrabold text-slate-800">สมาชิกทั่วไป (Resident)</p>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">ใช้งานฟีเจอร์สำหรับลูกบ้านในชุมชน</p>
                </div>
              </div>
            ) : (
              <div className="flex p-1 bg-white rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setRole('user');
                    showToast('สลับเป็นโหมด สมาชิกทั่วไป (User)');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                    role === 'user' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  สมาชิกทั่วไป
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('admin');
                    showToast('สลับเป็นโหมด ผู้ดูแลระบบ (Admin)');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
                    role === 'admin' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ผู้ดูแลระบบ (Admin)
                </button>
              </div>
            )}
          </div>

          {/* Notifications config */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-[13.5px]">การแจ้งเตือนเตือนภัย</h4>

            <div className="flex items-center justify-between">
              <span className="text-[13px] text-slate-700 font-medium">เปิดรับการแจ้งเตือนเสียง/ป๊อปอัป</span>
              <input
                type="checkbox"
                checked={allowNotifications}
                onChange={e => {
                  setAllowNotifications(e.target.checked);
                  showToast(e.target.checked ? 'เปิดการแจ้งเตือนแล้ว' : 'ปิดการแจ้งเตือนแล้ว', 'info');
                }}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[13px] text-slate-700 font-medium">รับเฉพาะเหตุการณ์ฉุกเฉินระดับสูง</span>
              <input
                type="checkbox"
                checked={emergencyAlertsOnly}
                onChange={e => {
                  setEmergencyAlertsOnly(e.target.checked);
                  showToast('บันทึกการตั้งค่าแล้ว');
                }}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Feed Radius */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-slate-900 text-[13.5px]">รัศมีเนื้อหาเริ่มต้น</h4>
              <span className="text-[12px] font-extrabold text-emerald-600">{radiusKm} กิโลเมตร</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={radiusKm}
              onChange={e => setRadiusKm(e.target.value)}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* App Installation Section */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-white text-[13.5px] flex items-center gap-1.5">
                <Radio size={16} className="text-emerald-400" />
                <span>ดาวน์โหลดแอปพลิเคชันอย่างเป็นทางการ</span>
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Google Play Store
              </span>
            </div>
            <p className="text-[11.5px] text-slate-300">
              การติดตั้ง application ต้องทำผ่านการดาวน์โหลดจาก Google Play Store เท่านั้น เพื่อความปลอดภัยและการใช้งานเต็มรูปแบบ
            </p>
            <div className="pt-1">
              <PWAInstallButton className="w-full justify-center py-2.5" />
            </div>
          </div>

          {/* Promo & Marketing Kit Section */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-slate-50 p-4 rounded-2xl border border-emerald-300/60 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-[13.5px] flex items-center gap-1.5">
                <Sparkles size={16} className="text-emerald-600" />
                <span>ชุดสื่อและภาพโปรโมทแอป (Promo Kit)</span>
              </h4>
              <span className="text-[10.5px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                3 แบบ
              </span>
            </div>
            <p className="text-[11.5px] text-slate-600">
              รวมภาพโปสเตอร์กราฟิก แคปชั่นแนะนำ และลิงก์สำหรับแชร์ชวนเพื่อนบ้านมาใช้งาน
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowPromoModal(true)}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[12px] font-extrabold shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <Share2 size={14} />
                <span>เปิดดูภาพและชุดสื่อโปรโมท</span>
              </button>
            </div>
          </div>

          {/* Privacy Policy & Legal */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <h4 className="font-extrabold text-slate-900 text-[13.5px] flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>ความปลอดภัยและนโยบาย</span>
            </h4>
            <p className="text-[11.5px] text-slate-500">
              ข้อกำหนดการคุ้มครองข้อมูลส่วนบุคคลและมาตรฐาน Google Play Store
            </p>
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-[12px] font-extrabold border border-slate-200 shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <FileText size={14} className="text-emerald-600" />
                <span>นโยบายความเป็นส่วนตัว</span>
              </button>
              <a
                href="/privacy.html"
                target={typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) ? "_self" : "_blank"}
                rel="noreferrer"
                className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-[12px] font-bold border border-slate-200 shadow-xs flex items-center justify-center gap-1 transition-all"
                title="เปิดในแท็บใหม่"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
            <h4 className="font-extrabold text-slate-900 text-[13.5px] flex items-center gap-1.5">
              <MessageCircle size={16} className="text-emerald-600" />
              <span>ช่วยเหลือและสนับสนุน</span>
            </h4>
            <p className="text-[11.5px] text-slate-500">
              พบปัญหาการใช้งานหรือมีข้อเสนอแนะ แจ้งให้ทีมงานทราบ
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openContactAdminModal('complaint');
                }}
                className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-[12px] font-extrabold border border-slate-200 shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <AlertTriangle size={14} className="text-amber-500" />
                <span>แจ้งปัญหาการใช้งาน</span>
              </button>
            </div>
          </div>

          {/* Reset Demo */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleResetDemoData}
              className="w-full py-2.5 rounded-2xl border border-rose-200 text-rose-600 bg-rose-50/50 hover:bg-rose-50 font-bold text-[12px] flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={14} />
              ล้างแคชและรีเซ็ตข้อมูลทดสอบ (Reset Demo Data)
            </button>
          </div>

        </div>

        {/* Privacy Policy Modal */}
        <PrivacyPolicyModal 
          isOpen={showPrivacyModal} 
          onClose={() => setShowPrivacyModal(false)} 
        />

        {/* Promo Kit Modal */}
        <PromoKitModal
          isOpen={showPromoModal}
          onClose={() => setShowPromoModal(false)}
        />

      </div>
    </div>
  );
}
