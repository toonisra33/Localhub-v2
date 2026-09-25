import { compressImage } from '../../lib/imageUtils';
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { 
  X, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Send, 
  MapPin, 
  Tag, 
  Compass, 
  Navigation, 
  Utensils, 
  Store, 
  Coffee, 
  Trees, 
  Building2, 
  Trash2, 
  Edit3,
  Play
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { CheckInLocation, Location } from '../../types';
import { CheckInPickerModal } from './CheckInPickerModal';
import { LocationConfirmPostModal } from './LocationConfirmPostModal';

interface CreatePostModalProps {
  onClose: () => void;
  initialCheckIn?: CheckInLocation | null;
}

export function CreatePostModal({ onClose, initialCheckIn = null }: CreatePostModalProps) {
  const { location, addPost, showToast, userProfile, openMediaViewer } = useCommunity();
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('ข่าวสารชุมชน');
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAttaching, setIsAttaching] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);

  // Check-in state
  const [checkIn, setCheckIn] = useState<CheckInLocation | null>(initialCheckIn);
  const [showCheckInPicker, setShowCheckInPicker] = useState<boolean>(false);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);

  const categories = [
    'ข่าวสารชุมชน', 'ซื้อ-ขาย/บริการ', 'แจ้งเหตุฉุกเฉิน', 'ตามหาของ/สัตว์เลี้ยง', 'ร้านอร่อยชุมชน', 'ประกาศทั่วไป', 'ขอความช่วยเหลือ', 'พูดคุยแลกเปลี่ยน'
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 10 - images.length;
    if (remainingSlots <= 0) {
      showToast('สามารถอัปโหลดได้สูงสุด 10 รูป', 'error');
      return;
    }

    const filesArray = Array.from(files).slice(0, remainingSlots) as File[];
    setIsAttaching(true);

    const newImages: string[] = [];

    for (const file of filesArray) {
      if (!file.type.startsWith('image/')) {
        continue;
      }

      if (file.size > 8 * 1024 * 1024) {
        showToast(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 8 MB`, 'error');
        continue;
      }

      try {
        const compressedDataUrl = await compressImage(file);
        newImages.push(compressedDataUrl);
      } catch (err) {
        console.error('Error compressing image:', err);
      }
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      showToast(`📸 เพิ่มรูปภาพ ${newImages.length} รูปเรียบร้อยแล้ว`, 'success');
    }
    
    setIsAttaching(false);
    e.target.value = '';
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('กรุณาอัปโหลดไฟล์วิดีโอเท่านั้น', 'error');
      return;
    }

    if (file.size > 800 * 1024) {
      showToast(`เนื่องจากข้อจำกัดของระบบชั่วคราว ไฟล์วิดีโอต้องมีขนาดไม่เกิน 800 KB`, 'error');
      return;
    }

    setIsAttaching(true);
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    const fileUrl = URL.createObjectURL(file);
    videoElement.src = fileUrl;

    videoElement.onloadedmetadata = () => {
      URL.revokeObjectURL(fileUrl);
      const reader = new FileReader();
      reader.onload = (event) => {
        setVideoUrl(event.target?.result as string);
        showToast('🎥 แนบวิดีโอเรียบร้อยแล้ว', 'success');
        setIsAttaching(false);
      };
      reader.onerror = () => {
        showToast('เกิดข้อผิดพลาดในการอ่านไฟล์วิดีโอ', 'error');
        setIsAttaching(false);
      };
      reader.readAsDataURL(file);
    };

    videoElement.onerror = () => {
      URL.revokeObjectURL(fileUrl);
      showToast('ไฟล์วิดีโอไม่ถูกต้องหรือไม่รองรับ', 'error');
      setIsAttaching(false);
    };

    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('กรุณากรอกข้อความที่ต้องการแชร์', 'error');
      return;
    }
    
    // Check if GPS is ready, else pop the confirm modal anyway
    setShowLocationConfirm(true);
  };

  const handleFinalSubmit = (confirmedLoc: Location) => {
    const effectiveLoc = checkIn ? {
      ...confirmedLoc,
      latitude: checkIn.latitude,
      longitude: checkIn.longitude,
      subdistrict: checkIn.subdistrict || confirmedLoc.subdistrict,
      district: checkIn.district || confirmedLoc.district,
      province: checkIn.province || confirmedLoc.province,
      village: checkIn.placeName
    } : confirmedLoc;

    addPost(
      content.trim(), 
      category, 
      images.length > 0 ? images : undefined, 
      effectiveLoc,
      checkIn || undefined,
      videoUrl || undefined
    );
    setShowLocationConfirm(false);
    onClose();
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'restaurant': return { icon: Utensils, label: 'อาหาร/ของกิน', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'cafe': return { icon: Coffee, label: 'คาเฟ่/เครื่องดื่ม', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'shop': return { icon: Store, label: 'ร้านค้า/ตลาด', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'landmark': return { icon: Trees, label: 'ท่องเที่ยว/พักผ่อน', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'building': return { icon: Building2, label: 'ที่พัก/ชุมชน', color: 'bg-sky-100 text-sky-800 border-sky-200' };
      default: return { icon: MapPin, label: 'เช็คอินสถานที่', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src={userProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || 'U')}&background=random`}
                alt={userProfile?.name}
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/20"
              />
              <div>
                <h2 className="text-[16px] font-extrabold text-slate-900 leading-tight">สร้างโพสต์ใหม่</h2>
                <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500 font-medium">
                  <span className="text-slate-800 font-bold">{userProfile?.name}</span>
                  <span>•</span>
                  <span>{userProfile.badge || 'ลูกบ้าน'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
            
            {/* Category picker */}
            <div>
              <label className="block text-[11.5px] font-bold text-slate-600 mb-1.5">หมวดหมู่โพสต์</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11.5px] font-bold transition-all border ${
                      category === cat
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Check-In Location Bar / Pin Action */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11.5px] font-bold text-slate-600 flex items-center gap-1">
                  <MapPin size={13} className="text-emerald-600" />
                  <span>ตำแหน่งเช็คอิน / ปักหมุด</span>
                </label>
                {!checkIn && (
                  <button
                    type="button"
                    onClick={() => setShowCheckInPicker(true)}
                    className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg transition-colors"
                  >
                    <Compass size={12} />
                    <span>ค้นหาและปักหมุด</span>
                  </button>
                )}
              </div>

              {checkIn ? (
                /* Active Check-in Pin Banner */
                <div className="p-3 bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white border border-emerald-200 rounded-2xl shadow-xs relative group animate-in fade-in zoom-in-95">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <MapPin size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-[13px] font-extrabold text-slate-900 truncate">
                            📍 {checkIn.placeName}
                          </h4>
                          {checkIn.category && (() => {
                            const badge = getCategoryBadge(checkIn.category);
                            return (
                              <span className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md border ${badge.color}`}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {checkIn.subdistrict ? `ต.${checkIn.subdistrict} ` : ''}
                          {checkIn.district ? `อ.${checkIn.district} ` : ''}
                          {checkIn.province || ''}
                          <span className="text-[10px] text-slate-400 font-mono ml-1.5">
                            ({checkIn.latitude.toFixed(4)}, {checkIn.longitude.toFixed(4)})
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowCheckInPicker(true)}
                        className="p-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="แก้ไขหรือย้ายหมุด"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckIn(null)}
                        className="p-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="ยกเลิกเช็คอิน"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Check-in CTA Button */
                <button
                  type="button"
                  onClick={() => setShowCheckInPicker(true)}
                  className="w-full p-2.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-2xl flex items-center justify-between text-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-200 flex items-center justify-center transition-colors">
                      <MapPin size={14} />
                    </div>
                    <div className="text-left">
                      <div className="text-[12.5px] font-bold text-slate-700 group-hover:text-emerald-900">
                        📍 ปักหมุดเช็คอินสถานที่
                      </div>
                      <div className="text-[10.5px] text-slate-400">
                        ค้นหาร้านอาหาร, คาเฟ่, ตลาด, หรือปักหมุดพิกัด GPS จริง
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/70 group-hover:bg-emerald-200 px-2.5 py-1 rounded-xl transition-colors">
                    ค้นหา
                  </span>
                </button>
              )}
            </div>

            {/* Text Area */}
            <div>
              <textarea
                rows={4}
                required
                placeholder="มีเรื่องราว ข่าวสาร รีวิวร้านอร่อย หรือสิ่งที่ต้องการแชร์กับคนในละแวกบ้าน?..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[14px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Media Upload Buttons & Preview (Photos & Videos) */}
            <div className="space-y-3">
              <label className="block text-[11.5px] font-bold text-slate-600">แนบรูปภาพ หรือ วิดีโอ</label>

              {/* Video Preview if selected */}
              {videoUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-black aspect-video group">
                  <video 
                    src={videoUrl} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setVideoUrl(null)}
                    className="absolute top-2 right-2 bg-slate-950/80 text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors z-10"
                    title="ลบวิดีโอ"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Images Grid preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-900 group">
                      <img 
                        src={img} 
                        alt={`Post attachment ${idx}`}
                        onClick={() => openMediaViewer({
                          url: img,
                          type: 'image',
                          title: `รูปภาพที่แนบ ${idx + 1}/${images.length}`,
                          subtitle: `หมวดหมู่: ${category}`
                        })}
                        className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300" 
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-slate-950/80 text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors z-10"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons to attach Photo or Video */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}
                  disabled={isAttaching || images.length >= 10}
                  className="py-2.5 px-3 border border-dashed border-slate-300 hover:border-emerald-400 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-700 flex items-center justify-center gap-1.5 text-[12px] font-bold transition-all"
                >
                  <ImageIcon size={16} className={isAttaching ? 'animate-spin text-emerald-600' : 'text-emerald-600'} />
                  <span>{images.length > 0 ? `เพิ่มรูป (${images.length}/10)` : '📷 เพิ่มรูปภาพ'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isAttaching || !!videoUrl}
                  className={`py-2.5 px-3 border border-dashed rounded-2xl flex items-center justify-center gap-1.5 text-[12px] font-bold transition-all ${
                    videoUrl 
                      ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-700'
                  }`}
                >
                  <VideoIcon size={16} className="text-indigo-600" />
                  <span>{videoUrl ? 'แนบวิดีโอแล้ว' : '🎥 เพิ่มวิดีโอ'}</span>
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoUpload}
              accept="video/*"
              className="hidden"
            />

            {/* Submit */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-[13.5px] hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13.5px] shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Send size={16} />
                เผยแพร่ทันที
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* CheckInPickerModal Submodal */}
      {showCheckInPicker && (
        <CheckInPickerModal
          initialCheckIn={checkIn}
          userLocation={location}
          onSelectCheckIn={(newCheckIn) => {
            setCheckIn(newCheckIn);
          }}
          onClose={() => setShowCheckInPicker(false)}
        />
      )}

      {/* Location Confirm Modal before posting */}
      <LocationConfirmPostModal 
        isOpen={showLocationConfirm}
        onClose={() => setShowLocationConfirm(false)}
        onConfirm={handleFinalSubmit}
        postType="feed"
      />
    </>
  );
}

