import React, { useState, useRef } from 'react';
import { X, AlertTriangle, Droplets, Zap, Construction, Car, ShieldAlert, Camera, MapPin, Sparkles, Navigation, Image as ImageIcon } from 'lucide-react';
import { MapPinModal } from './MapPinModal';
import { useCommunity } from '../../context/CommunityContext';
import { Alert } from '../../types';

interface IncidentReportModalProps {
  onClose: () => void;
}

export function IncidentReportModal({ onClose }: IncidentReportModalProps) {
  const { location, addAlert, showToast, openLocationPermissionModal, openMediaViewer } = useCommunity();
  const [type, setType] = useState<Alert['type']>('flood');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [distance, setDistance] = useState('0.3');
  const [imageUrl, setImageUrl] = useState('');
  const [showMapPin, setShowMapPin] = useState(false);
  const [pinnedLocation, setPinnedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const incidentTypes = [
    { id: 'flood', label: 'น้ำท่วม/ขัง', icon: Droplets, color: 'text-sky-500 bg-sky-50 border-sky-200' },
    { id: 'power', label: 'ไฟดับ/หม้อแปลง', icon: Zap, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { id: 'road', label: 'ปิดถนน/ก่อสร้าง', icon: Construction, color: 'text-orange-500 bg-orange-50 border-orange-200' },
    { id: 'accident', label: 'อุบัติเหตุ', icon: Car, color: 'text-rose-500 bg-rose-50 border-rose-200' },
    { id: 'general', label: 'เหตุทั่วไป', icon: ShieldAlert, color: 'text-purple-500 bg-purple-50 border-purple-200' },
  ] as const;

  
    const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('กรุณากรอกหัวข้อเหตุการณ์', 'error');
      return;
    }

    await addAlert({
      type,
      title: title.trim(),
      description: description.trim() || 'ไม่มีคำอธิบายเพิ่มเติม',
      location: {
        ...location,
        distance: parseFloat(distance) || 0.5
      },
      image: imageUrl || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-150 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">แจ้งเหตุ / เตือนภัยด่วน</h2>
              <p className="text-[11.5px] font-medium text-slate-500">รายงานเพื่อให้เพื่อนบ้านในพื้นที่รับทราบทันที</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Incident Type Selector */}
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-2">ประเภทเหตุการณ์</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {incidentTypes.map(item => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setType(item.id)}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-[1.02]'
                        : `${item.color} hover:opacity-90`
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-[11px] font-bold leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1.5">หัวข้อเหตุการณ์ <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              placeholder="เช่น น้ำท่วมขัง ซอยพหลฯ 35 สูง 20 ซม."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1.5">รายละเอียดเพิ่มเติม</label>
            <textarea
              rows={3}
              placeholder="ระบุจุดสังเกต ระดับความรุนแรง หรือเส้นทางเลี่ยง..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 focus:bg-white transition-all resize-none"
            />
          </div>

          
          {/* Location details */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
                <MapPin size={14} className="text-emerald-600" />
                <span>ต.{location.subdistrict} • {location.district}</span>
              </div>
              <div className="flex items-center gap-1">
                {pinnedLocation ? (
                  <span className="text-[10.5px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full border border-rose-300/40">
                    📍 ปักหมุดแล้ว
                  </span>
                ) : location.isGps ? (
                  <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/40">
                    🎯 พิกัด GPS จริง
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openLocationPermissionModal()}
                    className="text-[10.5px] font-bold text-emerald-700 bg-white hover:bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 transition-all"
                  >
                    <Navigation size={10} />
                    <span>ใช้พิกัดจริง</span>
                  </button>
                )}
              </div>
            </div>
            
            <button 
              type="button"
              onClick={() => setShowMapPin(true)}
              className="w-full py-2.5 bg-white border border-slate-200 hover:border-emerald-300 rounded-xl text-slate-700 font-bold text-[12px] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <MapPin size={16} className={pinnedLocation ? "text-rose-500" : "text-emerald-500"} />
              {pinnedLocation ? 'แก้ไขจุดเกิดเหตุบนแผนที่' : 'ปักหมุดจุดเกิดเหตุบนแผนที่'}
            </button>
          </div>

          {/* Camera / Photo Attachment */}
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1.5">ภาพถ่ายประกอบ</label>
            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-40 bg-slate-900 group">
                <img 
                  src={imageUrl} 
                  alt="Incident preview" 
                  onClick={() => openMediaViewer({
                    url: imageUrl,
                    type: 'image',
                    title: title || 'ภาพถ่ายเหตุการณ์',
                    subtitle: `ประเภท: ${incidentTypes.find(t => t.id === type)?.label}`
                  })}
                  className="w-full h-40 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300" 
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-slate-950/80 text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors z-10"
                >
                  <X size={14} />
                </button>
                <div 
                  onClick={() => openMediaViewer({
                    url: imageUrl,
                    type: 'image',
                    title: title || 'ภาพถ่ายเหตุการณ์',
                    subtitle: `ประเภท: ${incidentTypes.find(t => t.id === type)?.label}`
                  })}
                  className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md text-white text-[10.5px] font-bold px-2.5 py-1 rounded-lg border border-white/20 cursor-pointer pointer-events-none"
                >
                  แตะเพื่อดูรูปเต็มจอ
                </div>
              </div>
            ) : (
              
              <>
              <input 
                type="file" 
                ref={cameraInputRef} 
                onChange={handleFileChange} 
                accept="image/*,video/*"
                capture="environment" 
                className="hidden" 
              />
              <input 
                type="file" 
                ref={galleryInputRef} 
                onChange={handleFileChange} 
                accept="image/*,video/*" 
                className="hidden" 
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="flex-1 py-3 border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 text-slate-600 hover:text-emerald-600 flex flex-col items-center justify-center gap-1.5 text-[12px] font-bold transition-all"
                >
                  <Camera size={20} />
                  <span>ถ่ายภาพตอนนี้</span>
                </button>
                <button
                  type="button"
                  onClick={handleGalleryClick}
                  className="flex-1 py-3 border-2 border-dashed border-slate-200 hover:border-rose-300 rounded-2xl bg-slate-50 hover:bg-rose-50/40 text-slate-600 hover:text-rose-600 flex flex-col items-center justify-center gap-1.5 text-[12px] font-bold transition-all"
                >
                  <ImageIcon size={20} />
                  <span>เลือกจากคลังภาพ</span>
                </button>
              </div>
            </>

            )}
          </div>

          {/* Submit Buttons */}
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
              className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[13.5px] shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <AlertTriangle size={16} />
              ส่งรายงานทันที
            </button>
          </div>
        </form>

            </div>
      {showMapPin && (
        <MapPinModal 
          initialLocation={location}
          onConfirm={(lat, lng) => {
            setPinnedLocation({ lat, lng });
            setShowMapPin(false);
          }}
          onClose={() => setShowMapPin(false)}
        />
      )}
    </div>
  );
}
