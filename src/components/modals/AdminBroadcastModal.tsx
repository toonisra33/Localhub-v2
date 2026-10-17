import React, { useState } from 'react';
import {
  X,
  Radio,
  Send,
  AlertTriangle,
  Flame,
  CloudRain,
  Car,
  Sparkles,
  MapPin,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  RotateCcw,
  Trash2,
  CheckCircle2,
  FileText,
  Clock,
  Bookmark,
  Smartphone,
  BellRing,
  Play,
  Square,
  Activity,
  Sliders,
  Camera,
  FileVideo,
  Loader2
} from 'lucide-react';
import { useBroadcast, BroadcastInput } from '../../context/BroadcastContext';
import { useCommunity } from '../../context/CommunityContext';
import {
  BroadcastCategory,
  BroadcastSeverity,
  BroadcastTargetScope,
  BroadcastTargetLevel,
  AdminBroadcast,
  TestSoundType
} from '../../types';
import { THAI_PROVINCES, ALL_PROVINCES_LIST } from '../../data/thaiData';
import {
  isVibrationSupported,
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission
} from '../../utils/notificationService';
import { saveMediaFile, generateVideoThumbnail, formatBytes } from '../../utils/mediaStorage';

export const AdminBroadcastModal: React.FC = () => {
  const {
    isAdminModalOpen,
    setOpenAdminModal,
    sendBroadcast,
    saveBroadcastTemplate,
    reBroadcastItem,
    broadcasts,
    deleteBroadcast,
    playSoundAlert
  } = useBroadcast();

  const { showToast, addInAppNotification } = useCommunity();

  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<BroadcastCategory>('announcement');
  const [severity, setSeverity] = useState<BroadcastSeverity>('normal');
  const [targetScope, setTargetScope] = useState<BroadcastTargetScope>('all');
  const [targetLevel, setTargetLevel] = useState<BroadcastTargetLevel>('province');
  const [targetProvince, setTargetProvince] = useState('กรุงเทพมหานคร');
  const [targetDistrict, setTargetDistrict] = useState('');
  const [targetSubdistrict, setTargetSubdistrict] = useState('');
  const [customArea, setCustomArea] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaFileName, setMediaFileName] = useState('');
  const [mediaFileSize, setMediaFileSize] = useState(0);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [actionUrl, setActionUrl] = useState('');
  const [actionText, setActionText] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adminCameraInputRef = React.useRef<HTMLInputElement>(null);
  const adminGalleryInputRef = React.useRef<HTMLInputElement>(null);
  const adminVideoInputRef = React.useRef<HTMLInputElement>(null);

  if (!isAdminModalOpen) return null;

  // Find districts for chosen province
  const currentProvinceData = THAI_PROVINCES.find(p => p.name === targetProvince);
  const districtOptions = currentProvinceData ? currentProvinceData.districts : [];

  const handleAdminPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingMedia(true);
    try {
      const file = files[0];
      const saved = await saveMediaFile(file, file.name);
      setMediaUrl(saved.objectUrl);
      setMediaType('image');
      setMediaFileName(file.name);
      setMediaFileSize(file.size);
      showToast('แนบรูปภาพสำหรับการบรอดแคสต์เรียบร้อย!', 'success');
    } catch {
      showToast('ไม่สามารถอัปโหลดรูปภาพได้', 'error');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleAdminVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingMedia(true);
    try {
      const file = files[0];
      const thumb = await generateVideoThumbnail(file);
      const saved = await saveMediaFile(file, file.name, thumb);
      setMediaUrl(saved.objectUrl);
      setMediaType('video');
      setMediaFileName(file.name);
      setMediaFileSize(file.size);
      showToast(`แนบคลิปวิดีโอ (${formatBytes(file.size)}) เรียบร้อย!`, 'success');
    } catch {
      showToast('ไม่สามารถอัปโหลดวิดีโอได้', 'error');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('กรุณากรอกหัวข้อและข้อความบรอดแคสต์', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalTargetArea = 'ทุกพื้นที่ (ทั่วประเทศ)';
      if (targetScope === 'specific') {
        if (targetLevel === 'province') {
          finalTargetArea = `จ.${targetProvince} (ทุกอำเภอ)`;
        } else if (targetLevel === 'district' && targetDistrict) {
          finalTargetArea = `จ.${targetProvince} / เขต/อ.${targetDistrict}`;
        } else if (targetLevel === 'subdistrict' && targetSubdistrict) {
          finalTargetArea = `จ.${targetProvince} / อ.${targetDistrict || '-'} / ต.${targetSubdistrict}`;
        } else if (customArea) {
          finalTargetArea = customArea;
        } else {
          finalTargetArea = `จ.${targetProvince}`;
        }
      }

      const input: BroadcastInput = {
        title: title.trim(),
        message: message.trim(),
        category,
        severity,
        targetScope,
        targetLevel,
        targetProvince: targetScope === 'specific' ? targetProvince : undefined,
        targetDistrict: targetScope === 'specific' && targetDistrict ? targetDistrict : undefined,
        targetSubdistrict: targetScope === 'specific' && targetSubdistrict ? targetSubdistrict : undefined,
        targetArea: finalTargetArea,
        mediaUrl: mediaUrl.trim() || undefined,
        mediaType: mediaUrl.trim() ? mediaType : undefined,
        mediaFileName: mediaFileName || undefined,
        actionUrl: actionUrl.trim() || undefined,
        actionText: actionText.trim() || undefined,
        expiresInMinutes: expiresInMinutes > 0 ? expiresInMinutes : undefined,
      };

      const created = await sendBroadcast(input);

      // Also trigger in-app notification for all users
      addInAppNotification({
        title: `📢 บรอดแคสต์: ${created.title}`,
        message: created.message,
        type: 'broadcast',
        link: `broadcast:${created.id}`
      });

      showToast('ส่งข้อความบรอดแคสต์สำเร็จเรียบร้อยแล้ว!', 'success');
      setTitle('');
      setMessage('');
      setMediaUrl('');
      setActionUrl('');
      setActionText('');
      setOpenAdminModal(false);
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการส่งบรอดแคสต์', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!title.trim()) {
      showToast('กรุณากรอกหัวข้อบรอดแคสต์เพื่อบันทึกเทมเพลต', 'error');
      return;
    }
    saveBroadcastTemplate({
      title,
      message,
      category,
      severity,
      targetScope,
      targetLevel,
      targetProvince,
      targetDistrict,
      targetArea: targetScope === 'specific' ? `จ.${targetProvince}` : 'ทั่วประเทศ'
    });
    showToast('บันทึกเทมเพลตเรียบร้อยแล้ว', 'success');
  };

  if (!isAdminModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpenAdminModal(false);
        }
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-600 rounded-xl">
              <Radio className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="font-bold text-lg leading-tight">ศูนย์ควบคุมการบรอดแคสต์ (Admin Broadcast)</h2>
              <p className="text-xs text-slate-300">ส่งข้อมูลด่วน ข่าวสาร และเตือนภัยสู่ประชาชนตามพื้นที่เป้าหมาย</p>
            </div>
          </div>

          <button
            onClick={() => setOpenAdminModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-4 font-semibold text-sm border-b-2 transition ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            สร้างบรอดแคสต์ใหม่
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-4 font-semibold text-sm border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            ประวัติบรอดแคสต์
            <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
              {broadcasts.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'create' ? (
            <form onSubmit={handleSend} className="space-y-4">
              {/* Severity & Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">ระดับความสำคัญ (Severity)</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as BroadcastSeverity)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                  >
                    <option value="normal">📢 ประชาสัมพันธ์ทั่วไป (Normal)</option>
                    <option value="high">⚠️ สำคัญเร่งด่วน (High Alert)</option>
                    <option value="urgent">🚨 ด่วนที่สุด / ภัยพิบัติ (Urgent Emergency)</option>
                    <option value="special">✨ ข่าวพิเศษ / กิจกรรมใหญ่ (Special)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">หมวดหมู่เนื้อหา (Category)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BroadcastCategory)}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden font-medium"
                  >
                    <option value="announcement">📢 ประกาศหน่วยงานรัฐ / ชุมชน</option>
                    <option value="news">📰 ข่าวสารท้องถิ่น</option>
                    <option value="emergency">🔥 เหตุฉุกเฉิน / กู้ภัย</option>
                    <option value="weather">🌧️ สภาพอากาศ / PM2.5 / น้ำท่วม</option>
                    <option value="traffic">🚗 การจราจร / งานซ่อมทาง</option>
                    <option value="marketing">🛍️ เทศกาล / ตลาดนัดชุมชน</option>
                  </select>
                </div>
              </div>

              {/* Title & Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หัวข้อบรอดแคสต์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น แจ้งเตือนปิดซ่อมสะพานข้ามแยก, ระวังน้ำท่วมฉับพลัน..."
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ข้อความรายละเอียด <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="รายละเอียดคำเตือน วัน เวลา คำแนะนำในการปฏิบัติตัว และเบอร์ติดต่อฉุกเฉิน..."
                  className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden leading-relaxed"
                  required
                />
              </div>

              {/* Geographic Target Scope Setting */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    ขอบเขตพื้นที่เป้าหมาย (Target Scope)
                  </span>
                  <span className="text-[11px] text-blue-700">เฉพาะผู้ที่อยู่ในพื้นที่จะเห็นการแจ้งเตือน</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setTargetScope('all')}
                    className={`py-2 px-3 rounded-lg border text-center transition ${
                      targetScope === 'all'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🌏 ส่งทุกพื้นที่ (ทั่วประเทศ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetScope('specific')}
                    className={`py-2 px-3 rounded-lg border text-center transition ${
                      targetScope === 'specific'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    📍 ระบุพื้นที่เฉพาะ (จังหวัด/อำเภอ)
                  </button>
                </div>

                {targetScope === 'specific' && (
                  <div className="pt-2 border-t border-blue-100 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">เลือกจังหวัดเป้าหมาย</label>
                        <select
                          value={targetProvince}
                          onChange={(e) => {
                            setTargetProvince(e.target.value);
                            setTargetDistrict('');
                          }}
                          className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                        >
                          {ALL_PROVINCES_LIST.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          อำเภอ/เขต (เว้นว่างได้ = ทุกอำเภอ)
                        </label>
                        {districtOptions.length > 0 ? (
                          <select
                            value={targetDistrict}
                            onChange={(e) => setTargetDistrict(e.target.value)}
                            className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                          >
                            <option value="">-- ทุกอำเภอใน {targetProvince} --</option>
                            {districtOptions.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={targetDistrict}
                            onChange={(e) => setTargetDistrict(e.target.value)}
                            placeholder="พิมพ์ชื่ออำเภอหรือเขต..."
                            className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Broadcast Duration / Expiry Setting (กี่นาที) */}
              <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>ระยะเวลาของการบรอดแคสต์ (แสดงแบนเนอร์กี่นาที)</span>
                  </label>
                  <span className="text-[10px] text-amber-700 font-medium">เมื่อครบกำหนดแถบจะปลดอัตโนมัติ</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
                  {[
                    { val: 0, label: 'ตลอดไป' },
                    { val: 15, label: '15 นาที' },
                    { val: 30, label: '30 นาที' },
                    { val: 60, label: '1 ชั่วโมง' },
                    { val: 360, label: '6 ชั่วโมง' },
                    { val: 1440, label: '24 ชั่วโมง' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setExpiresInMinutes(opt.val)}
                      className={`py-1.5 px-2 rounded-xl text-center font-bold transition border cursor-pointer ${
                        expiresInMinutes === opt.val
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Attachment (Photo & Video Upload) */}
              <div className="p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                <input
                  ref={adminCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleAdminPhotoUpload}
                />
                <input
                  ref={adminGalleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAdminPhotoUpload}
                />
                <input
                  ref={adminVideoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  className="hidden"
                  onChange={handleAdminVideoUpload}
                />

                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span>สื่อประกอบประกาศ (รูปภาพ / วิดีโอ)</span>
                  </label>
                  <span className="text-[10px] text-indigo-700">เข้ากล้องตรงหรืออัปโหลดคลิป</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => adminCameraInputRef.current?.click()}
                    disabled={isUploadingMedia}
                    className="p-2 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-700 flex flex-col items-center justify-center transition active:scale-95 shadow-2xs"
                  >
                    <Camera className="w-4 h-4 mb-0.5" />
                    <span className="text-[11px] font-bold">ถ่ายภาพสด</span>
                    <span className="text-[9px] text-slate-500">กล้องตรง</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => adminGalleryInputRef.current?.click()}
                    disabled={isUploadingMedia}
                    className="p-2 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-700 flex flex-col items-center justify-center transition active:scale-95 shadow-2xs"
                  >
                    <ImageIcon className="w-4 h-4 mb-0.5" />
                    <span className="text-[11px] font-bold">คลังภาพ</span>
                    <span className="text-[9px] text-slate-500">แกลเลอรี</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => adminVideoInputRef.current?.click()}
                    disabled={isUploadingMedia}
                    className="p-2 bg-white hover:bg-purple-100 border border-purple-200 rounded-xl text-purple-700 flex flex-col items-center justify-center transition active:scale-95 shadow-2xs"
                  >
                    <FileVideo className="w-4 h-4 mb-0.5" />
                    <span className="text-[11px] font-bold">คลิปวิดีโอ</span>
                    <span className="text-[9px] text-slate-500">ไม่มีจำกัด</span>
                  </button>
                </div>

                {isUploadingMedia && (
                  <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-800 text-xs flex items-center gap-2 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>กำลังประมวลผลไฟล์สื่อ...</span>
                  </div>
                )}

                {/* Media Preview */}
                {mediaUrl && (
                  <div className="p-2.5 bg-white rounded-xl border border-indigo-200 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {mediaType === 'video' ? (
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-purple-400 shrink-0">
                          <FileVideo className="w-6 h-6" />
                        </div>
                      ) : (
                        <img
                          src={mediaUrl}
                          alt="Media preview"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">
                          {mediaFileName || (mediaType === 'video' ? 'วิดีโอแนบ' : 'รูปภาพแนบ')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {mediaType === 'video' ? 'วิดีโอ (เล่นได้ในบรอดแคสต์)' : 'รูปภาพ'}
                          {mediaFileSize > 0 ? ` • ${formatBytes(mediaFileSize)}` : ''}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMediaUrl('');
                        setMediaFileName('');
                        setMediaFileSize(0);
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="ลบสื่อนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Optional URL input fallback */}
                <div className="pt-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">หรือใส่ลิงก์รูปภาพ / วิดีโอ URL</label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => {
                      setMediaUrl(e.target.value);
                      if (e.target.value.match(/\.(mp4|webm|mov)$/i)) {
                        setMediaType('video');
                      } else {
                        setMediaType('image');
                      }
                    }}
                    placeholder="https://..."
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Action Button Link (Optional) */}
              <div className="text-xs">
                <label className="block font-semibold text-slate-700 mb-1">ลิงก์ปุ่มกดเพิ่มเติมในบรอดแคสต์ (Action URL - ถ้ามี)</label>
                <input
                  type="url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playSoundAlert(severity)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1 font-medium transition"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                    ทดสอบเสียงเตือน
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1 font-medium transition"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                    บันทึกเทมเพลต
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenAdminModal(false)}
                    className="text-xs px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition"
                  >
                    ยกเลิก
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-xs px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? 'กำลังส่ง...' : 'บรอดแคสต์ทันที'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {broadcasts.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  ยังไม่มีประวัติการบรอดแคสต์
                </div>
              ) : (
                broadcasts.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            item.severity === 'urgent'
                              ? 'bg-red-100 text-red-700'
                              : item.severity === 'high'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {(item.severity || 'normal').toUpperCase()}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.targetArea || 'ทุกพื้นที่'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {item.broadcastDateStr}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            reBroadcastItem(item);
                            showToast('ส่งข้อความบรอดแคสต์ซ้ำเรียบร้อยแล้ว!', 'success');
                          }}
                          title="ส่งซ้ำ (Re-broadcast)"
                          className="p-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 font-semibold transition"
                        >
                          <RotateCcw className="w-4 h-4" />
                          ส่งซ้ำ
                        </button>
                        <button
                          onClick={() => {
                            deleteBroadcast(item.id);
                            showToast('ลบประวัติบรอดแคสต์แล้ว', 'info');
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.message}</p>
                  </div>
                ))
              )}
            </div>
          
          )}
        </div>
      </div>
    </div>
  );
};
