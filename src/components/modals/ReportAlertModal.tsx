import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertTriangle,
  Send,
  MapPin,
  Flame,
  CloudRain,
  Car,
  Zap,
  ShieldAlert,
  Navigation,
  Camera,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { AlertReport } from '../../types';
import { saveMediaFile } from '../../utils/mediaStorage';

interface ReportAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCoords?: { lat: number; lng: number };
  initialAddress?: string;
}

export const ReportAlertModal: React.FC<ReportAlertModalProps> = ({
  isOpen,
  onClose,
  initialCoords,
  initialAddress
}) => {
  const { addAlert, location, showToast } = useCommunity();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AlertReport['type']>('flood');
  const [severity, setSeverity] = useState<AlertReport['severity']>('medium');
  const [subdistrict, setSubdistrict] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Prefill when opened with pinned coordinates
  useEffect(() => {
    if (isOpen) {
      if (initialAddress) {
        setSubdistrict(initialAddress);
      }
    }
  }, [isOpen, initialAddress]);

  if (!isOpen) return null;

  const handleCaptureCamera = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingImage(true);
    try {
      const file = files[0];
      const saved = await saveMediaFile(file, `alert_${Date.now()}_${file.name}`);
      setImages((prev) => [...prev, saved.objectUrl]);
      showToast('📸 ถ่ายภาพเหตุการณ์เรียบร้อย!', 'success');
    } catch {
      showToast('ไม่สามารถบันทึกภาพถ่ายได้', 'error');
    } finally {
      setIsProcessingImage(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleSelectGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingImage(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const saved = await saveMediaFile(file, `alert_${Date.now()}_${file.name}`);
        newUrls.push(saved.objectUrl);
      }
      setImages((prev) => [...prev, ...newUrls]);
      showToast(`🖼️ แนบรูปภาพ ${newUrls.length} รูปเรียบร้อย!`, 'success');
    } catch {
      showToast('เกิดข้อผิดพลาดในการโหลดรูปภาพ', 'error');
    } finally {
      setIsProcessingImage(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('กรุณากรอกหัวข้อและรายละเอียดเหตุการณ์', 'error');
      return;
    }

    const coordsToUse =
      initialCoords || (location.lat && location.lng ? { lat: location.lat, lng: location.lng } : undefined);

    addAlert({
      title: title.trim(),
      description: description.trim(),
      type,
      severity,
      province: location.province,
      district: location.district || 'เมือง',
      subdistrict: subdistrict.trim() || 'ชุมชนทั่วไป',
      reporter: 'พลเมืองดี (รายงานสด)',
      reporterAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      coordinates: coordsToUse,
      locationName: initialAddress || subdistrict.trim() || undefined,
      images: images.length > 0 ? images : undefined
    });

    setTitle('');
    setDescription('');
    setSubdistrict('');
    setImages([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      {/* Hidden native camera and gallery inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCaptureCamera}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleSelectGallery}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-rose-950 text-base leading-tight">แจ้งเหตุเตือนภัยด่วนในพื้นที่</h3>
              <p className="text-xs text-rose-700">รายงานอุบัติเหตุ น้ำท่วม ไฟไหม้ หรือภัยพิบัติ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1">
          {/* Pinned Coordinates Info Badge */}
          {initialCoords ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2.5">
              <span className="p-1.5 bg-red-600 text-white rounded-lg shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="font-extrabold flex items-center gap-1.5">
                  <span>📍 ตำแหน่งปักหมุดบนแผนที่จริง</span>
                  <span className="px-1.5 py-0.2 bg-red-200 text-red-800 rounded font-bold text-[10px]">พิกัด GPS</span>
                </div>
                <div className="font-mono text-[11px] text-red-700 font-semibold mt-0.5">
                  Lat: {initialCoords.lat.toFixed(5)}, Lng: {initialCoords.lng.toFixed(5)}
                </div>
                {initialAddress && <p className="text-slate-600 text-[11px] mt-1 line-clamp-2">{initialAddress}</p>}
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ตำแหน่ง GPS ปัจจุบัน: {location.displayName || location.province}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภทเหตุการณ์</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AlertReport['type'])}
                className="w-full text-xs border border-slate-300 rounded-xl px-2.5 py-2 bg-white outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
              >
                <option value="flood">🌊 น้ำท่วมขัง / น้ำรอระบาย</option>
                <option value="accident">🚗 อุบัติเหตุการจราจร</option>
                <option value="fire">🔥 เพลิงไหม้ / ควันไฟ</option>
                <option value="power_cut">⚡ ไฟฟ้าดับ / เสาไฟล้ม</option>
                <option value="road_closed">🚧 ปิดถนน / ดินสไลด์</option>
                <option value="weather">🌪️ พายุ / ลมกรรโชกแรง</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ระดับความเร่งด่วน</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlertReport['severity'])}
                className="w-full text-xs border border-slate-300 rounded-xl px-2.5 py-2 bg-white outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
              >
                <option value="medium">🟡 ปานกลาง (ควรระวัง)</option>
                <option value="high">🟠 สูง (กระทบการสัญจร)</option>
                <option value="critical">🔴 วิกฤต (อันตรายถึงชีวิต)</option>
                <option value="low">🟢 เล็กน้อย</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">หัวข้อเหตุการณ์ *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น น้ำท่วมขังเสมอทางเท้า ซอย 39..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดและจุดสังเกต *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="พิกัดจุดเกิดเหตุ ระดับน้ำ ช่องทางการจราจรที่ผ่านได้/ไม่ได้..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-rose-500 leading-relaxed font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              จุดเกิดเหตุ / ตำบล / ถนน / สถานที่ใกล้เคียง (ใน {location.province})
            </label>
            <input
              type="text"
              value={subdistrict}
              onChange={(e) => setSubdistrict(e.target.value)}
              placeholder="เช่น ถนนสุขุมวิท ซอย 21 หน้าตึกเสริมมิตร..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
            />
          </div>

          {/* Camera Capture and Photo Upload Section (ตรงตามที่สั่ง: มีปุ่มกล้องและอัปโหลดรูปภาพ) */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">แนบรูปภาพจุดเกิดเหตุ / หลักฐาน</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-800 border-2 border-rose-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs"
                title="เปิดกล้องถ่ายภาพจุดเกิดเหตุสด"
              >
                <Camera className="w-4 h-4 text-rose-600" />
                <span>📷 ถ่ายรูปสด</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs"
                title="เลือกรูปภาพจากคลังภาพในเครื่อง"
              >
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>🖼️ อัปโหลดรูปภาพ</span>
              </button>
            </div>

            {/* Thumbnail Preview of Attached Images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={img} alt={`alert_attach_${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-red-600 transition"
                      title="ลบรูปนี้"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>ระบบตรวจสอบโดยชุมชน:</strong> คนในพื้นที่จะสามารถกด <strong>"ยืนยันเหตุจริง"</strong> หรือ{' '}
              <strong>"ไม่พบเหตุ / ข่าวปลอม"</strong> ได้ในหน้าฟีดชุมชนและแผนที่
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isProcessingImage}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ส่งรายงานทันที</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
