import React, { useState } from 'react';
import { X, ShieldCheck, ExternalLink, Copy, Check, Lock, MapPin, Eye, Trash2, Mail } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  const { showToast } = useCommunity();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = window.location.origin;
  const policyUrl = `${currentOrigin}/privacy.html`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(policyUrl);
    setCopied(true);
    showToast('คัดลอกลิงก์นโยบายความเป็นส่วนตัวแล้ว', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[95] bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-[16.5px] font-extrabold text-slate-900 leading-tight">นโยบายความเป็นส่วนตัว</h2>
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md">Play Store</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">Privacy Policy for LocalHub App</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Public URL Action Bar */}
        <div className="bg-slate-900 text-white p-3.5 mx-4 mt-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300">🔗 ลิงก์สาธารณะสำหรับส่ง Google Play Console:</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <input 
              type="text" 
              readOnly 
              value={policyUrl} 
              className="bg-transparent text-[11px] text-emerald-400 font-mono flex-1 outline-none truncate"
            />
            <button
              onClick={handleCopyUrl}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10.5px] font-extrabold flex items-center gap-1 transition-all shrink-0"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
            </button>
            <a
              href="/privacy.html"
              target="_blank"
              rel="noreferrer"
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
              title="เปิดหน้าเว็บเต็ม"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Scrollable Policy Content */}
        <div className="p-4.5 overflow-y-auto space-y-4 flex-1 text-[12.5px] text-slate-600 leading-relaxed">
          
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
            <p className="text-emerald-900 font-semibold text-[12px]">
              LocalHub ให้ความสำคัญสูงสุดต่อการรักษาความปลอดภัยของข้อมูลส่วนบุคคลของคุณตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) และข้อกำหนดของ Google Play Store
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-slate-900 text-[13px] flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-600" />
              1. ข้อมูลตำแหน่ง (Location Data)
            </h3>
            <p className="text-slate-500 text-[11.5px]">
              แอพจะเข้าถึงตำแหน่ง GPS ของคุณเมื่อได้รับอนุญาต (ACCESS_FINE_LOCATION) เพื่อคำนวณระยะห่างของโพสต์ ข่าวสาร และเหตุด่วนใกล้ตัวคุณ โดยไม่มีการนำตำแหน่งไปแชร์ต่อหรือใช้เพื่อการโฆษณาเชิงพาณิชย์
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-slate-900 text-[13px] flex items-center gap-1.5">
              <Lock size={14} className="text-emerald-600" />
              2. บัญชีผู้ใช้และความปลอดภัย
            </h3>
            <p className="text-slate-500 text-[11.5px]">
              ข้อมูลการเข้าสู่ระบบผ่าน Google Sign-In หรือ Email จะถูกจัดเก็บบน Google Firebase Cloud Firestore ด้วยการเข้ารหัสมาตรฐานระดับสากล (TLS/SSL)
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-slate-900 text-[13px] flex items-center gap-1.5">
              <Eye size={14} className="text-emerald-600" />
              3. รูปภาพและเนื้อหาที่ผู้ใช้สร้าง (User Content)
            </h3>
            <p className="text-slate-500 text-[11.5px]">
              รูปถ่ายที่อัปโหลดในโพสต์หรือร้านค้าจะปรากฏต่อเพื่อนบ้านในชุมชนเท่านั้น คุณสามารถแก้ไขหรือลบโพสต์ได้ตลอดเวลา
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-slate-900 text-[13px] flex items-center gap-1.5">
              <Trash2 size={14} className="text-emerald-600" />
              4. สิทธิ์ในการขอลบข้อมูล (Data Deletion)
            </h3>
            <p className="text-slate-500 text-[11.5px]">
              ผู้ใช้งานสามารถแจ้งขอลบบัญชีและข้อมูลทั้งหมดได้โดยตรงผ่านอีเมลผู้พัฒนา 
              <span className="font-bold text-slate-800"> toonisra33@gmail.com</span> หรือกดปุ่ม "ติดต่อแอดมิน" ทางเราจะดำเนินการลบให้ภายใน 7 วันทำการ
            </p>
          </div>

          {/* Developer Contact Box */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-[11.5px] space-y-1">
            <div className="flex items-center gap-1.5 text-slate-800 font-extrabold">
              <Mail size={13} className="text-emerald-600" />
              <span>ข้อมูลติดต่อผู้พัฒนา (Developer Contact)</span>
            </div>
            <p className="text-slate-500">LocalHub Team (คุณอิศราวัฒน์ ปวินทกานต์)</p>
            <p className="text-slate-500">Email: toonisra33@gmail.com</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
          <a
            href="/privacy.html"
            target="_blank"
            rel="noreferrer"
            className="text-[12px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <ExternalLink size={13} />
            เปิดหน้าเว็บเต็ม
          </a>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[12px] font-extrabold transition-all"
          >
            รับทราบและปิด
          </button>
        </div>

      </div>
    </div>
  );
}
