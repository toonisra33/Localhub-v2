import React, { useState, useRef } from 'react';
import {
  X,
  Send,
  Megaphone,
  Radio,
  AlertTriangle,
  Heart,
  MessageSquare,
  Sparkles,
  FileText,
  CheckCircle2,
  Phone,
  Clock,
  Camera,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { saveMediaFile } from '../../utils/mediaStorage';

interface ContactAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ContactCategory = 'pr' | 'urgent_news' | 'hazard' | 'special_help' | 'complaint';

export const ContactAdminModal: React.FC<ContactAdminModalProps> = ({ isOpen, onClose }) => {
  const { showToast, location } = useCommunity();
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory>('pr');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const categories: {
    id: ContactCategory;
    title: string;
    sub: string;
    icon: React.ReactNode;
    color: string;
    sampleTitle: string;
    sampleDetails: string;
  }[] = [
    {
      id: 'pr',
      title: 'ขอลงข่าวประชาสัมพันธ์',
      sub: 'งานกิจกรรมชุมชน, ตลาดนัด, โปรโมชั่นร้านค้าท้องถิ่น...',
      icon: <Megaphone className="w-5 h-5 text-emerald-600" />,
      color: 'border-emerald-400 bg-emerald-50/40 text-emerald-900',
      sampleTitle: 'ประชาสัมพันธ์ตลาดนัดชุมชนวันหยุดสุดสัปดาห์นี้',
      sampleDetails:
        'ขอความอนุเคราะห์ประชาสัมพันธ์งานตลาดนัดของดีชุมชน ในวันเสาร์-อาทิตย์นี้ ตั้งแต่เวลา 07:00 - 15:00 น. มีร้านค้ากว่า 20 บูธครับ'
    },
    {
      id: 'urgent_news',
      title: 'แจ้งข่าวสารด่วน',
      sub: 'ข่าวเหตุการณ์ในพื้นที่, นัดหมายลูกบ้าน, งานบำเพ็ญกุศล...',
      icon: <Radio className="w-5 h-5 text-blue-600" />,
      color: 'border-blue-400 bg-blue-50/40 text-blue-900',
      sampleTitle: 'แจ้งกำหนดการประชุมลูกบ้านประจำเดือน',
      sampleDetails:
        'ขอเชิญลูกบ้านและสมาชิกชุมชนเข้าร่วมประชุมใหญ่ประจำเดือน เพื่อปรึกษาหารือเรื่องความปลอดภัยในหมู่บ้าน ณ ศาลาประชาคม'
    },
    {
      id: 'hazard',
      title: 'แจ้งเบาะแส / จุดเสี่ยงภัย',
      sub: 'ท่อระบายน้ำอุดตัน, กิ่งไม้พาดสายไฟ, จุดเสี่ยงอุบัติเหตุ, ถนน...',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      color: 'border-amber-400 bg-amber-50/40 text-amber-900',
      sampleTitle: 'พบกิ่งไม้ใหญ่พาดสายไฟฟ้าเสี่ยงหักโค่น',
      sampleDetails:
        'พบกิ่งไม้ใหญ่พาดทับสายไฟฟ้าบริเวณปากซอย เกรงว่าจะเกิดไฟฟ้าลัดวงจรหรือกิ่งไม้หักลงมาเมื่อมีลมพายุ ขอทีมงานช่วยประสานงานครับ'
    },
    {
      id: 'special_help',
      title: 'ขอความช่วยเหลือพิเศษ',
      sub: 'ตามหาสัตว์เลี้ยง, ของหาย, ช่วยเหลือผู้สูงอายุ/ผู้ป่วยติดเตียง',
      icon: <Heart className="w-5 h-5 text-rose-600" />,
      color: 'border-rose-400 bg-rose-50/40 text-rose-900',
      sampleTitle: 'ตามหาสุนัขหาย (พันธุ์โกลเด้น ปลอกคอสีแดง)',
      sampleDetails:
        'สุนัขพันธุ์โกลเด้นเพศผู้ ชื่อเบิ้ม หลุดออกจากบ้านเมื่อช่วงเย็นวานนี้ หากใครพบเห็นโปรดติดต่อกลับด่วน มีสินน้ำใจตอบแทนครับ'
    },
    {
      id: 'complaint',
      title: 'ข้อร้องเรียน / ข้อเสนอแนะ',
      sub: 'เรื่องเสียงรบกวน, ขยะตกค้าง, ปัญหาสาธารณูปโภค, เสนอแนะ...',
      icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
      color: 'border-purple-400 bg-purple-50/40 text-purple-900',
      sampleTitle: 'ร้องเรียนขยะตกค้างไม่ได้เก็บกว่า 3 วัน',
      sampleDetails:
        'ถังขยะส่วนกลางบริเวณท้ายซอยมีขยะล้นตกค้างมาหลายวัน ส่งกลิ่นรบกวน ขอช่วยเร่งรัดเจ้าหน้าที่ฝ่ายรักษาความสะอาดด้วยครับ'
    }
  ];

  const handleApplySample = () => {
    const current = categories.find((c) => c.id === selectedCategory);
    if (current) {
      setTitle(current.sampleTitle);
      setDetails(current.sampleDetails);
      showToast('ใส่ตัวอย่างแบบร่างด่วนเรียบร้อยแล้ว', 'info');
    }
  };

  const handleCaptureCamera = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingImage(true);
    try {
      const file = files[0];
      const saved = await saveMediaFile(file, `admin_contact_${Date.now()}_${file.name}`);
      setImages((prev) => [...prev, saved.objectUrl]);
      showToast('📸 ถ่ายภาพแนบหลักฐานเรียบร้อย!', 'success');
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
        const saved = await saveMediaFile(file, `admin_contact_${Date.now()}_${file.name}`);
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
    if (!title.trim() || !details.trim()) {
      showToast('กรุณากรอกหัวข้อและรายละเอียดเรื่องที่ต้องการแจ้ง', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      showToast('ส่งเรื่องและหลักฐานถึงทีมแอดมินเรียบร้อยแล้ว', 'success');
      setTitle('');
      setDetails('');
      setPhone('');
      setImages([]);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      {/* Hidden inputs for camera capture & gallery */}
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

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">ติดต่อผู้ดูแลระบบ (Admin)</h2>
              <p className="text-xs text-slate-300">แจ้งเรื่องราว ขอลงข่าว หรือส่งเรื่องด่วนให้แอดมินตรวจสอบ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 active:scale-90 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Category Chooser */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">เลือกประเภทเรื่องที่ต้องการติดต่อ</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-2.5 rounded-2xl border text-left transition flex items-start gap-2.5 ${
                    selectedCategory === cat.id
                      ? `${cat.color} ring-2 ring-emerald-500 shadow-xs font-bold`
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <span className="p-1 rounded-lg bg-white shadow-xs shrink-0 mt-0.5">{cat.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-tight truncate">{cat.title}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 leading-snug">{cat.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">หัวข้อเรื่องที่ต้องการแจ้ง *</label>
              <button
                type="button"
                onClick={handleApplySample}
                className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>ใส่ตัวอย่างข้อความ</span>
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุหัวข้อให้ชัดเจน เช่น ขอลงประกาศตลาดนัดชุมชน..."
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-2xl px-3.5 py-2.5 bg-white outline-none focus:border-emerald-500 font-medium"
              required
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดข้อความ *</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="ระบุวัน เวลา สถานที่ และข้อมูลสำคัญที่ต้องการให้แอดมินทราบ..."
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-2xl p-3 bg-white outline-none focus:border-emerald-500 leading-relaxed font-medium resize-none"
              required
            />
          </div>

          {/* Camera Capture and Photo Upload Section (ตรงตามที่สั่ง: มีปุ่มกล้องและอัปโหลดรูปภาพ) */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">แนบรูปภาพหรือหลักฐานประกอบ</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border-2 border-emerald-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs"
                title="เปิดกล้องถ่ายภาพหลักฐานสด"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>📷 ถ่ายรูปสด</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="p-2.5 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-800 border border-blue-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs"
                title="เลือกรูปภาพจากคลังภาพในเครื่อง"
              >
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>🖼️ อัปโหลดรูปภาพ</span>
              </button>
            </div>

            {/* Thumbnail Preview of Attached Images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={img} alt={`contact_attach_${idx}`} className="w-full h-full object-cover" />
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

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์สำหรับติดต่อกลับ (ถ้ามี)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="เช่น 081-234-5678"
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-2xl px-3.5 py-2.5 bg-white outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isProcessingImage}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังส่งเรื่อง...' : 'ส่งเรื่องถึงแอดมิน'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
