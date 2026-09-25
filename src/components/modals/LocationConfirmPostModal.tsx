import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Check, 
  X, 
  Loader2, 
  Compass, 
  Search, 
  Edit3, 
  Sparkles,
  AlertTriangle,
  Send,
  Building2
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { Location } from '../../types';
import { WORLDWIDE_AREAS_DATABASE } from '../../data/thailandLocations';

interface LocationConfirmPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (confirmedLocation: Location) => void;
  postType?: 'feed' | 'incident';
}

export function LocationConfirmPostModal({
  isOpen,
  onClose,
  onConfirm,
  postType = 'feed'
}: LocationConfirmPostModalProps) {
  const { location, requestRealLocation, isLocatingGps, showToast } = useCommunity();
  
  const [currentLoc, setCurrentLoc] = useState<Location>(location);
  const [isEditingArea, setIsEditingArea] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customVillage, setCustomVillage] = useState(location.village || '');

  // Keep synced with context location when opening
  React.useEffect(() => {
    if (isOpen) {
      setCurrentLoc(location);
      setCustomVillage(location.village || '');
      setIsEditingArea(false);
      setSearchQuery('');
    }
  }, [isOpen, location]);

  if (!isOpen) return null;

  const filteredAreas = searchQuery.trim().length > 1
    ? WORLDWIDE_AREAS_DATABASE.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subdistrict && item.subdistrict.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.district && item.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.province && item.province.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : [];

  const handleUseGps = async () => {
    const result = await requestRealLocation();
    if (result.success && result.lat && result.lng) {
      showToast('🎯 อัปเดตพิกัด GPS จริงเรียบร้อยแล้ว', 'success');
      setCurrentLoc(prev => ({
        ...prev,
        latitude: result.lat,
        longitude: result.lng,
        isGps: true
      }));
    } else {
      showToast('ไม่สามารถดึงตำแหน่ง GPS ได้ กรุณาตรวจสอบการอนุญาตตำแหน่ง', 'error');
    }
  };

  const handleSelectArea = (item: typeof WORLDWIDE_AREAS_DATABASE[0]) => {
    setCurrentLoc({
      subdistrict: item.subdistrict || '',
      district: item.district || '',
      province: item.province || '',
      village: item.name,
      latitude: item.lat,
      longitude: item.lng,
      isGps: false
    });
    setCustomVillage(item.name);
    setIsEditingArea(false);
    setSearchQuery('');
  };

  const handleFinalConfirm = () => {
    const confirmed: Location = {
      ...currentLoc,
      village: customVillage.trim() || currentLoc.village || 'ชุมชน'
    };
    onConfirm(confirmed);
  };

  const isIncident = postType === 'incident';

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header Bar */}
        <div className={`p-5 text-white relative ${
          isIncident 
            ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900' 
            : 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
              isIncident 
                ? 'bg-rose-500/20 border border-rose-400/30 text-rose-400 shadow-rose-950/50' 
                : 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 shadow-emerald-950/50'
            }`}>
              {isIncident ? <AlertTriangle size={24} className="animate-bounce" /> : <MapPin size={24} className="animate-pulse" />}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10.5px] font-bold text-slate-200 mb-1">
                <span>📍 บังคับยืนยันพื้นที่ก่อนเผยแพร่</span>
              </div>
              <h3 className="text-[17px] font-extrabold text-white leading-tight">
                {isIncident ? 'ยืนยันจุดเกิดเหตุก่อนส่งแจ้งเตือน' : 'ยืนยันพื้นที่ชุมชนก่อนโพสต์'}
              </h3>
            </div>
          </div>

          <p className="text-[12px] text-slate-300 mt-2.5 leading-relaxed">
            {isIncident 
              ? 'ระบบต้องการให้ยืนยันตำแหน่งที่ถูกต้อง เพื่อแจ้งเตือนเพื่อนบ้านในรัศมีใกล้เคียงได้อย่างแม่นยำ'
              : 'โพสต์ของคุณจะถูกแสดงให้สมาชิกในพื้นที่นี้เห็น กรุณาตรวจสอบหรืออัปเดตพื้นที่ของคุณ'
            }
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50/70">
          
          {/* Current Selected Location Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold text-slate-500">
                ตำแหน่งที่จะใช้ระบุในโพสต์:
              </span>
              {currentLoc.isGps ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  GPS พิกัดจริง
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-extrabold">
                  เลือกพื้นที่
                </span>
              )}
            </div>

            <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-extrabold text-slate-900 leading-snug">
                  ต.{currentLoc.subdistrict} • อ.{currentLoc.district}
                </div>
                <div className="text-[12px] font-medium text-slate-600">
                  จ.{currentLoc.province}
                </div>
                {currentLoc.latitude && currentLoc.longitude && (
                  <div className="text-[10.5px] font-mono text-slate-400 mt-0.5">
                    ({currentLoc.latitude.toFixed(4)}, {currentLoc.longitude.toFixed(4)})
                  </div>
                )}
              </div>
            </div>

            {/* Optional Place/Village Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                ชื่อสถานที่ / หมู่บ้าน / ชุมชน (ถ้ามี)
              </label>
              <input 
                type="text"
                value={customVillage}
                onChange={e => setCustomVillage(e.target.value)}
                placeholder="เช่น หมู่บ้านสุขสันต์, หน้าร้านสะดวกซื้อ..."
                className="w-full px-3 py-2 text-[12.5px] bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>
          </div>

          {/* Quick Location Correction Tools */}
          <div className="space-y-2">
            <div className="text-[11.5px] font-bold text-slate-600">
              ต้องการแก้ไขหรือใช้พิกัดปัจจุบัน?
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* GPS Auto-detect Button */}
              <button
                type="button"
                onClick={handleUseGps}
                disabled={isLocatingGps}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-800 flex items-center justify-center gap-1.5 transition-all text-[12px] font-extrabold active:scale-95 disabled:opacity-50"
              >
                {isLocatingGps ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-emerald-700" />
                    <span>กำลังตรวจจับ...</span>
                  </>
                ) : (
                  <>
                    <Navigation size={14} className="text-emerald-600" />
                    <span>ดึงพิกัด GPS ตอนนี้</span>
                  </>
                )}
              </button>

              {/* Search Another Area Button */}
              <button
                type="button"
                onClick={() => setIsEditingArea(!isEditingArea)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 transition-all text-[12px] font-extrabold active:scale-95"
              >
                <Search size={14} className="text-slate-500" />
                <span>ค้นหาพื้นที่อื่น</span>
              </button>
            </div>
          </div>

          {/* Collapsible Area Search */}
          {isEditingArea && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5 animate-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="พิมพ์ชื่อตำบล อำเภอ หรือจังหวัด..."
                  className="w-full pl-9 pr-3 py-2 text-[12px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  autoFocus
                />
              </div>

              {filteredAreas.length > 0 && (
                <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {filteredAreas.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectArea(item)}
                      className="w-full py-2 px-2 text-left hover:bg-emerald-50 rounded-lg flex items-center justify-between text-[11.5px] transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-[10.5px] text-slate-500">
                          {item.subdistrict ? `ต.${item.subdistrict} ` : ''}
                          {item.district ? `อ.${item.district} ` : ''}
                          {item.province ? `จ.${item.province}` : ''}
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100/70 px-1.5 py-0.5 rounded">เลือก</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Action Buttons */}
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
            onClick={handleFinalConfirm}
            className={`w-2/3 py-3 px-4 rounded-2xl text-[13.5px] font-extrabold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 text-white ${
              isIncident 
                ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/30' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
            }`}
          >
            <Check size={16} />
            <span>ยืนยันพื้นที่และโพสต์</span>
          </button>
        </div>

      </div>
    </div>
  );
}
