import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Check, 
  X, 
  Loader2, 
  AlertCircle, 
  Compass, 
  CheckCircle2,
  Lock,
  Globe2
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LocationPermissionModal({ isOpen, onClose, onSuccess }: LocationPermissionModalProps) {
  const { 
    requestRealLocation, 
    isLocatingGps, 
    locationPermissionStatus, 
    location,
    showToast 
  } = useCommunity();

  const [hasConsented, setHasConsented] = useState(true);

  if (!isOpen) return null;

  const handleAllowClick = async () => {
    if (!hasConsented) {
      showToast('กรุณากดยินยอมเพื่อให้แอปพลิเคชันเข้าถึงตำแหน่งของคุณ', 'info');
      return;
    }

    const success = await requestRealLocation();
    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Visual Header Banner */}
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white overflow-hidden">
          {/* Background Decorative Rings */}
          <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-emerald-500/10 border border-emerald-500/20 blur-xl pointer-events-none" />
          <div className="absolute right-8 top-8 w-24 h-24 rounded-full bg-teal-500/10 pointer-events-none animate-pulse" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>

          {/* Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-3.5 shadow-lg shadow-emerald-900/40">
            <Navigation size={28} className="animate-bounce" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold mb-1.5">
            <ShieldCheck size={12} />
            <span>คำขออนุญาตตามสิทธิ์ความเป็นส่วนตัว</span>
          </div>

          <h2 className="text-[20px] font-extrabold tracking-tight text-white leading-snug">
            ขออนุญาตเข้าถึงพิกัดพื้นที่จริง
          </h2>
          <p className="text-slate-300 text-[12.5px] mt-1 leading-relaxed">
            LocalHub ต้องการเข้าถึงตำแหน่งพิกัด GPS จริงของท่าน เพื่อแจ้งเตือนภัยและแสดงข้อมูลชุมชนรอบตัวได้แม่นยำที่สุด
          </p>
        </div>

        {/* Permission Benefits & Terms Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50/50">
          
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-[13px] font-extrabold text-slate-900 flex items-center gap-1.5">
              <Globe2 size={15} className="text-emerald-600" />
              ประโยชน์ที่คุณจะได้รับเมื่อเปิดพิกัดจริง:
            </h3>

            <div className="space-y-2 text-[12px] text-slate-600">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  ✓
                </div>
                <span><strong>เตือนภัยฉุกเฉินเฉพาะจุด:</strong> รับสัญญาณบรอดแคสเมื่อมีเหตุน้ำท่วม ไฟดับ หรือปิดถนนในรัศมีใกล้คุณ</span>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  ✓
                </div>
                <span><strong>เรดาร์แผนที่รอบตัว:</strong> ค้นหาร้านค้า อาหาร ตลาด และจุดแจ้งเหตุใกล้ระยะเดินถึง</span>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  ✓
                </div>
                <span><strong>แจ้งเหตุด่วนได้ทันที:</strong> พิกัดจะถูกระบุอัตโนมัติเมื่อแจ้งเหตุ ไม่ต้องเสียเวลาค้นหา</span>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="flex items-start gap-2.5 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70 text-[11.5px] text-emerald-900">
            <Lock size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>รักษาความปลอดภัยสูงสุด:</strong> พิกัด GPS ของคุณจะถูกประมวลผลบนอุปกรณ์เพื่อเทียบระยะทางชุมชนเท่านั้น และไม่มีการส่งต่อข้อมูลส่วนบุคคลไปยังบุคคลภายนอก
            </p>
          </div>

          {/* User Consent Checkbox */}
          <label className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={e => setHasConsented(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
            />
            <span className="text-[12px] font-medium text-slate-700 select-none">
              ฉันยินยอมให้ <strong>LocalHub</strong> เข้าถึงตำแหน่งพื้นที่จริง (Geolocation) ของอุปกรณ์ เพื่อการใช้งานฟังก์ชันระบุพิกัดชุมชน
            </span>
          </label>

          {/* Status Feedback if Denied */}
          {locationPermissionStatus === 'denied' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11.5px] flex items-start gap-2">
              <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>เบราว์เซอร์ปฏิเสธการเข้าถึง:</strong> กรุณากดไอคอนแม่กุญแจ 🔒 ที่แถบ URL ด้านบนเพื่ออนุญาตให้เข้าถึง Location แล้วกดยินยอมใหม่อีกครั้ง
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-[13px] font-bold transition-all active:scale-95 text-center"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleAllowClick}
            disabled={!hasConsented || isLocatingGps}
            className={`w-2/3 py-3 px-4 rounded-2xl text-[13.5px] font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
              !hasConsented || isLocatingGps
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25 cursor-pointer'
            }`}
          >
            {isLocatingGps ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>กำลังระบุพิกัดจริง...</span>
              </>
            ) : (
              <>
                <Navigation size={16} />
                <span>ยินยอมและระบุพิกัดจริง</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
