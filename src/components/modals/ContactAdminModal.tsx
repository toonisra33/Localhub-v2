import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

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
      sampleDetails: 'ขอความอนุเคราะห์ประชาสัมพันธ์งานตลาดนัดของดีชุมชน ในวันเสาร์-อาทิตย์นี้ ตั้งแต่เวลา 07:00 - 15:00 น. มีร้านค้ากว่า 20 บูธครับ'
    },
    {
      id: 'urgent_news',
      title: 'แจ้งข่าวสารด่วน',
      sub: 'ข่าวเหตุการณ์ในพื้นที่, นัดหมายลูกบ้าน, งานบำเพ็ญกุศล...',
      icon: <Radio className="w-5 h-5 text-blue-600" />,
      color: 'border-blue-400 bg-blue-50/40 text-blue-900',
      sampleTitle: 'แจ้งกำหนดการประชุมลูกบ้านประจำเดือน',
      sampleDetails: 'ขอเชิญลูกบ้านและสมาชิกชุมชนเข้าร่วมประชุมใหญ่ประจำเดือน เพื่อปรึกษาหารือเรื่องความปลอดภัยในหมู่บ้าน ณ ศาลาประชาคม'
    },
    {
      id: 'hazard',
      title: 'แจ้งเบาะแส / จุดเสี่ยงภัย',
      sub: 'ท่อระบายน้ำอุดตัน, กิ่งไม้พาดสายไฟ, จุดเสี่ยงอุบัติเหตุ, ถนน...',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      color: 'border-amber-400 bg-amber-50/40 text-amber-900',
      sampleTitle: 'พบกิ่งไม้ใหญ่พาดสายไฟฟ้าเสี่ยงหักโค่น',
      sampleDetails: 'พบกิ่งไม้ใหญ่พาดทับสายไฟฟ้าบริเวณปากซอย เกรงว่าจะเกิดไฟฟ้าลัดวงจรหรือกิ่งไม้หักลงมาเมื่อมีลมพายุ ขอทีมงานช่วยประสานงานครับ'
    },
    {
      id: 'special_help',
      title: 'ขอความช่วยเหลือพิเศษ',
      sub: 'ตามหาสัตว์เลี้ยง, ของหาย, ช่วยเหลือผู้สูงอายุ/ผู้ป่วยติดเตียง',
      icon: <Heart className="w-5 h-5 text-rose-600" />,
      color: 'border-rose-400 bg-rose-50/40 text-rose-900',
      sampleTitle: 'ตามหาสุนัขหาย (พันธุ์โกลเด้น ปลอกคอสีแดง)',
      sampleDetails: 'สุนัขพันธุ์โกลเด้นเพศผู้ ชื่อเบิ้ม หลุดออกจากบ้านเมื่อช่วงเย็นวานนี้ หากใครพบเห็นโปรดติดต่อกลับด่วน มีสินน้ำใจตอบแทนครับ'
    },
    {
      id: 'complaint',
      title: 'ข้อร้องเรียน / ข้อเสนอแนะ',
      sub: 'เรื่องเสียงรบกวน, ขยะตกค้าง, ปัญหาสาธารณูปโภค, เสนอแนะ...',
      icon: <MessageSquare className="w-5 h-5 text-purple-600" />,
      color: 'border-purple-400 bg-purple-50/40 text-purple-900',
      sampleTitle: 'ร้องเรียนขยะตกค้างไม่ได้เก็บกว่า 3 วัน',
      sampleDetails: 'ถังขยะส่วนกลางบริเวณท้ายซอยมีขยะล้นตกค้างมาหลายวัน ส่งกลิ่นรบกวน ขอช่วยเร่งรัดเจ้าหน้าที่ฝ่ายรักษาความสะอาดด้วยครับ'
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !details.trim()) {
      showToast('กรุณากรอกหัวข้อและรายละเอียดเรื่องที่ต้องการแจ้ง', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      showToast('ส่งเรื่องถึงทีมแอดมินเรียบร้อยแล้ว แอดมินจะตรวจสอบและแจ้งกลับ', 'success');
      setTitle('');
      setDetails('');
      setPhone('');
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header (Matching Screenshot 4) */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30 text-white shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight">
                  ติดต่อแอดมิน / ขอประชาสัมพันธ์
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                ส่งข่าวสาร แจ้งเบาะแส หรือขอให้ทีมแอดมินช่วยบรอดแคสต์ข้อมูลถึงเพื่อนบ้าน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-bold">
              ศูนย์สื่อสารชุมชน
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-90"
              title="ปิดหน้าต่าง (กากบาท)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Row (Matching Screenshot 4) */}
        <div className="p-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'form' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-indigo-600" />
            <span>กรอกแบบฟอร์มส่งเรื่อง</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>ประวัติคำขอของฉัน</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px]">3</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'form' ? (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Section 1: Choose Contact Category */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-900">
                  1. เลือกประเภทการติดต่อ
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  แอดมินดูแลฟรี ไม่มีค่าใช้จ่าย
                </span>
              </div>

              <div className="space-y-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition flex items-center gap-3 active:scale-99 ${
                        isSelected
                          ? `${cat.color} border-2 shadow-xs`
                          : 'bg-white border-slate-200/90 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="p-2 bg-white rounded-xl shadow-xs shrink-0">
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs leading-tight text-slate-900">
                          {cat.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {cat.sub}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Draft Sample Button (Matching Screenshot 4) */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-semibold text-slate-700 truncate">
                  ต้องการตัวอย่างแบบร่างสำหรับหมวดนี้?
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplySample}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shrink-0 active:scale-95 shadow-xs"
              >
                ใส่ตัวอย่างด่วน
              </button>
            </div>

            {/* Section 2: Title and Details */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  2. หัวข้อเรื่องที่ต้องการแจ้ง / ประชาสัมพันธ์ *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ประชาสัมพันธ์งานตลาดนัด, แจ้งกิ่งไม้พาดสายไฟ..."
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  รายละเอียดข้อมูล *
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  placeholder="ระบุวัน เวลา สถานที่ และรายละเอียดเพื่อให้ทีมแอดมินดำเนินการได้รวดเร็ว..."
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl outline-none focus:border-indigo-500 shadow-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">
                  เบอร์โทรติดต่อกลับ (ไม่บังคับ)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งเรื่องให้แอดมินตรวจสอบทันที'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* History Tab */
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">ขอประชาสัมพันธ์ตลาดนัดชุมชน</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  อนุมัติแล้ว
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">เผยแพร่ผ่านช่องบรอดแคสต์ชุมชนเรียบร้อยแล้ว</p>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                <Clock className="w-3 h-3" />
                <span>เมื่อวานนี้ 14:20 น.</span>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">แจ้งท่อระบายน้ำอุดตัน ปากซอย 5</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  กำลังประสานงาน
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">ส่งเรื่องต่อไปยังฝ่ายรักษาความสะอาดเขตแล้ว</p>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                <Clock className="w-3 h-3" />
                <span>3 วันที่แล้ว</span>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">ขอความช่วยเหลือตามหาน้องแมวสีส้ม</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  ปิดเรื่องแล้ว
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">เจ้าของพบสุนัข/แมวเรียบร้อยแล้ว</p>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                <Clock className="w-3 h-3" />
                <span>สัปดาห์ที่แล้ว</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
