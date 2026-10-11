import React from 'react';
import { MapPin, Navigation, ShieldCheck, X } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

export const LocationPermissionModal: React.FC = () => {
  const { isLocationPermissionModalOpen, closeLocationPermissionModal, requestRealLocation } = useCommunity();

  if (!isLocationPermissionModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 text-center space-y-4">
        <button
          onClick={closeLocationPermissionModal}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
          <Navigation className="w-7 h-7 fill-blue-600" />
        </div>

        <div>
          <h3 className="font-bold text-slate-900 text-lg">เปิดใช้งานตำแหน่งของคุณ</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            LocalHub ใช้ตำแหน่งพิกัดของคุณเพื่อส่งการแจ้งเตือนภัยพิบัติ บรอดแคสต์เหตุฉุกเฉิน และข่าวสารของชุมชนในรัศมีรอบตัวคุณอย่างแม่นยำ
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-left flex items-start gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>ข้อมูลพิกัดจะถูกประมวลผลบนอุปกรณ์ของคุณ และไม่ถูกนำไปเผยแพร่หรือขายให้กับบุคคลที่สาม</span>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={requestRealLocation}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            อนุญาตให้เข้าถึงตำแหน่ง
          </button>
          <button
            onClick={closeLocationPermissionModal}
            className="w-full py-2 px-4 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
          >
            เลือกพื้นที่ด้วยตนเองแทน
          </button>
        </div>
      </div>
    </div>
  );
};
