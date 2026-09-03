import React, { useState, useEffect } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { ContactRequestType, AdminContactRequest } from '../../types';
import { 
  X, 
  Send, 
  Megaphone, 
  Newspaper, 
  AlertTriangle, 
  MessageSquare, 
  HeartHandshake, 
  Phone, 
  Mail, 
  MapPin, 
  Image as ImageIcon, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  Trash2,
  Maximize2,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface ContactAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactAdminModal({ isOpen, onClose }: ContactAdminModalProps) {
  const { 
    userProfile, 
    location, 
    contactRequests, 
    contactAdminInitialType, 
    submitContactRequest, 
    deleteContactRequest,
    openMediaViewer,
    showToast 
  } = useCommunity();

  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  
  // Form State
  const [requestType, setRequestType] = useState<ContactRequestType>(contactAdminInitialType || 'pr_request');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [targetArea, setTargetArea] = useState(`${location.district} • ${location.subdistrict}`);
  const [preferredTime, setPreferredTime] = useState('ประกาศโดยเร็วที่สุด');
  const [senderName, setSenderName] = useState(userProfile.name || '');
  const [senderPhone, setSenderPhone] = useState(userProfile.phone || '');
  const [senderEmail, setSenderEmail] = useState(userProfile.email || '');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AdminContactRequest | null>(null);

  // Sync initial type when opened
  useEffect(() => {
    if (contactAdminInitialType) {
      setRequestType(contactAdminInitialType);
    }
  }, [contactAdminInitialType, isOpen]);

  // Update sender info if profile changes
  useEffect(() => {
    if (userProfile.name && !senderName) setSenderName(userProfile.name);
    if (userProfile.phone && !senderPhone) setSenderPhone(userProfile.phone);
    if (userProfile.email && !senderEmail) setSenderEmail(userProfile.email);
  }, [userProfile]);

  if (!isOpen) return null;

  const categories: { type: ContactRequestType; label: string; icon: any; color: string; desc: string }[] = [
    {
      type: 'pr_request',
      label: 'ขอลงข่าวประชาสัมพันธ์',
      icon: Megaphone,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'งานกิจกรรมชุมชน, ตลาดนัด, โปรโมชั่นร้านค้าท้องถิ่น, โครงการจิตอาสา'
    },
    {
      type: 'news_report',
      label: 'แจ้งข่าวสารด่วน',
      icon: Newspaper,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      desc: 'ข่าวเหตุการณ์ในพื้นที่, นัดหมายลูกบ้าน, งานบำเพ็ญกุศล, ประกาศทางการ'
    },
    {
      type: 'urgent_tip',
      label: 'แจ้งเบาะแส / จุดเสี่ยงภัย',
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      desc: 'ท่อระบายน้ำอุดตัน, กิ่งไม้พาดสายไฟ, จุดเสี่ยงอุบัติเหตุ, ถนนชำรุด'
    },
    {
      type: 'special_help',
      label: 'ขอความช่วยเหลือพิเศษ',
      icon: HeartHandshake,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      desc: 'ตามหาสัตว์เลี้ยง, ของหาย, ช่วยเหลือผู้สูงอายุ/ผู้ป่วยติดเตียง'
    },
    {
      type: 'complaint',
      label: 'ข้อร้องเรียน / ข้อเสนอแนะ',
      icon: MessageSquare,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      desc: 'เรื่องเสียงรบกวน, ขยะตกค้าง, ปัญหาสาธารณูปโภค, เสนอแนะพัฒนาชุมชน'
    }
  ];

  // Quick Preset Templates for Easy resident reporting
  const samplePresets: Record<ContactRequestType, { title: string; detail: string; mediaUrl: string }> = {
    pr_request: {
      title: 'ขอประชาสัมพันธ์งานตลาดนัดของดีชุมชนและสินค้าเกษตรปลอดภัย สัปดาห์นี้',
      detail: 'ขอความอนุเคราะห์แอดมินช่วยบรอดแคสต์เชิญชวนลูกบ้านร่วมอุดหนุนสินค้า ผลผลิตสดใหม่จากสวน และอาหารพื้นถิ่น ณ ลานอเนกประสงค์ ทุกวันเสาร์-อาทิตย์ เวลา 07:00 - 13:00 น.',
      mediaUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800'
    },
    news_report: {
      title: 'แจ้งการจัดกิจกรรมตรวจสุขภาพประจำปีฟรี สำหรับผู้สูงอายุในหมู่บ้าน',
      detail: 'ศูนย์บริการสาธารณสุขจะมาตั้งหน่วยตรวจคัดกรองเบาหวาน ความดัน และสุขภาพตา ณ ศาลาประชาคม ในวันพุธที่จะถึงนี้ เวลา 08:30 - 12:00 น. โปรดนำบัตรประชาชนมาด้วย',
      mediaUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800'
    },
    urgent_tip: {
      title: 'แจ้งเบาะแสจุดน้ำขังและฝาท่อระบายน้ำชำรุด บริเวณหน้าปากซอย',
      detail: 'พบฝาท่อระบายน้ำเหล็กยุบตัวและมีเศษใบไม้อุดตัน เกรงว่าจะมีอุบัติเหตุรถจักรยานยนต์ตกท่อช่วงค่ำหรือฝนตก ขอให้แอดมินช่วยประสานงานเจ้าหน้าที่ตรวจสอบด่วนครับ',
      mediaUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800'
    },
    special_help: {
      title: 'ขอช่วยบรอดแคสต์ตามหาแมวพันธุ์ไทย สีส้มขาว สวมปลอกคอสีเขียว',
      detail: 'น้องแมวชื่อ "ส้มจี๊ด" หายออกจากบ้านบริเวณซอย 3 เมื่อเช้านี้ เชื่อง ไม่ดุ หากใครพบเห็นโปรดติดต่อตามเบอร์โทรด้านล่าง มีสินน้ำใจให้ 1,500 บาท ขอบคุณมากค่ะ',
      mediaUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800'
    },
    complaint: {
      title: 'ขอเสนอแนะเรื่องการเก็บขยะตกค้างและเพิ่มรอบจัดเก็บในซอยย่อย',
      detail: 'ช่วงสุดสัปดาห์มีขยะสะสมบริเวณถังขยะรวมหน้าปากซอยย่อย ส่งกลิ่นรบกวน อยากเสนอแนะให้ทางฝ่ายรักษาความสะอาดช่วยเพิ่มรอบเก็บช่วงเย็นวันอาทิตย์ครับ',
      mediaUrl: ''
    }
  };

  const applyPreset = (type: ContactRequestType) => {
    const preset = samplePresets[type];
    if (preset) {
      setTitle(preset.title);
      setDetail(preset.detail);
      if (preset.mediaUrl) {
        setMediaUrl(preset.mediaUrl);
        setMediaType('image');
      }
      showToast('✨ ใส่ข้อมูลตัวอย่างพร้อมส่งแล้ว สามารถแก้ไขเพิ่มเติมได้ตามต้องการ');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !detail.trim()) {
      showToast('กรุณากรอกหัวข้อเรื่องและรายละเอียดให้ครบถ้วน', 'error');
      return;
    }

    if (!senderName.trim() || !senderPhone.trim()) {
      showToast('กรุณากรอกชื่อและเบอร์โทรศัพท์สำหรับติดต่อกลับ', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      submitContactRequest({
        type: requestType,
        title: title.trim(),
        detail: detail.trim(),
        targetArea: targetArea.trim() || `${location.district} • ${location.subdistrict}`,
        preferredTime: preferredTime.trim() || 'ประกาศโดยเร็วที่สุด',
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        senderEmail: senderEmail.trim() || undefined,
        senderAvatar: userProfile.avatar,
        mediaUrl: mediaUrl.trim() || undefined,
        mediaType: mediaUrl.trim() ? mediaType : undefined
      });

      setIsSubmitting(false);
      // Clear or switch to history
      setTitle('');
      setDetail('');
      setMediaUrl('');
      setActiveTab('history');
    }, 400);
  };

  const getStatusBadge = (status: AdminContactRequest['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'รอแอดมินตรวจสอบ',
          bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
          icon: Clock
        };
      case 'reviewed':
        return {
          label: 'รับเรื่องแล้ว / กำลังดำเนินการ',
          bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
          icon: Info
        };
      case 'approved_and_broadcast':
        return {
          label: 'อนุมัติและบรอดแคสต์แล้ว',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          icon: CheckCircle2
        };
      case 'resolved':
        return {
          label: 'ดำเนินการเรียบร้อย',
          bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
          icon: ShieldCheck
        };
      default:
        return {
          label: 'สถานะปกติ',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: Info
        };
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl max-h-[92vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-[16px] sm:text-[18px] tracking-tight text-white flex items-center gap-2">
                <span>ติดต่อแอดมิน / ขอประชาสัมพันธ์</span>
                <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  ศูนย์สื่อสารชุมชน
                </span>
              </h2>
              <p className="text-[11.5px] text-slate-300">
                ส่งข่าวสาร แจ้งเบาะแส หรือขอให้ทีมแอดมินช่วยบรอดแคสต์ข้อมูลถึงเพื่อนบ้าน
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-white/10"
            title="ปิด"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-slate-100/90 p-1.5 border-b border-slate-200">
          <button
            onClick={() => { setActiveTab('form'); setSelectedHistoryItem(null); }}
            className={`flex-1 py-2 rounded-xl text-[12.5px] font-extrabold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'form' 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send size={14} className={activeTab === 'form' ? 'text-indigo-600' : ''} />
            <span>กรอกแบบฟอร์มส่งเรื่อง</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl text-[12.5px] font-extrabold flex items-center justify-center gap-2 transition-all relative ${
              activeTab === 'history' 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={14} className={activeTab === 'history' ? 'text-indigo-600' : ''} />
            <span>ประวัติคำขอของฉัน</span>
            {contactRequests.length > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {contactRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category Picker */}
              <div>
                <label className="block text-[12.5px] font-extrabold text-slate-800 mb-2 flex items-center justify-between">
                  <span>1. เลือกประเภทการติดต่อ</span>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    แอดมินดูแลฟรี ไม่มีค่าใช้จ่าย
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = requestType === cat.type;
                    return (
                      <button
                        type="button"
                        key={cat.type}
                        onClick={() => setRequestType(cat.type)}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                          isSelected 
                            ? `${cat.color} ring-2 ring-indigo-500/40 shadow-sm font-bold` 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-extrabold leading-tight">{cat.label}</p>
                          <p className="text-[10.5px] text-slate-500 mt-0.5 line-clamp-1">{cat.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Preset Auto-fill Helper */}
              <div className="bg-indigo-50/70 border border-indigo-150 rounded-2xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-indigo-900 text-[12px] font-semibold">
                  <Sparkles size={16} className="text-indigo-600 shrink-0" />
                  <span>ต้องการตัวอย่างแบบร่างสำหรับหมวดนี้?</span>
                </div>
                <button
                  type="button"
                  onClick={() => applyPreset(requestType)}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold shrink-0 transition-colors shadow-xs"
                >
                  ใส่ตัวอย่างด่วน
                </button>
              </div>

              {/* Title & Detail */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[12.5px] font-extrabold text-slate-800 mb-1">
                    2. หัวข้อเรื่องที่ต้องการแจ้ง / ประชาสัมพันธ์ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="เช่น ขอประชาสัมพันธ์งานตลาดนัดชุมชน / แจ้งท่อระบายน้ำชำรุด"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13.5px] focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-extrabold text-slate-800 mb-1">
                    3. รายละเอียดข้อมูลข่าวสาร / ข้อความที่ต้องการให้สื่อสาร <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={detail}
                    onChange={e => setDetail(e.target.value)}
                    placeholder="ระบุรายละเอียด เช่น วัน เวลา สถานที่ วัตถุประสงค์ หรือขั้นตอนสำหรับลูกบ้านที่ต้องการเข้าร่วม/ติดต่อ..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13.5px] focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Area & Preferred Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    <span>พื้นที่เป้าหมาย / หมู่บ้าน</span>
                  </label>
                  <input
                    type="text"
                    value={targetArea}
                    onChange={e => setTargetArea(e.target.value)}
                    placeholder="เช่น ลาดยาว, เสนานิคม, ซอย 35"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12.5px] focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" />
                    <span>ช่วงเวลาที่ต้องการให้ประกาศ</span>
                  </label>
                  <input
                    type="text"
                    value={preferredTime}
                    onChange={e => setPreferredTime(e.target.value)}
                    placeholder="เช่น ประกาศด่วนทันที, เสาร์เช้า"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[12.5px] focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Media Attachment (Optional) */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-indigo-600" />
                    <span>แนบรูปภาพแบนเนอร์ หรือ ลิงก์รูปประกอบ (ถ้ามี)</span>
                  </label>
                  {mediaUrl && (
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={e => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/banner.jpg"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[12px] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800');
                      setMediaType('image');
                    }}
                    className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-[11px] font-bold shrink-0 transition-colors"
                  >
                    ใส่รูปตัวอย่าง
                  </button>
                </div>

                {/* Media Preview with Fullscreen Viewer */}
                {mediaUrl && (
                  <div 
                    onClick={() => openMediaViewer({
                      url: mediaUrl,
                      type: mediaType,
                      title: title || 'รูปภาพประกอบคำขอประชาสัมพันธ์',
                      subtitle: `ส่งโดย: ${senderName}`
                    })}
                    className="relative rounded-xl overflow-hidden max-h-36 bg-slate-900 border border-slate-300 group cursor-pointer"
                  >
                    <img 
                      src={mediaUrl} 
                      alt="Media attachment preview" 
                      className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1">
                        <Maximize2 size={12} />
                        <span>แตะเพื่อดูภาพเต็มจอ</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Person Information */}
              <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200 space-y-3">
                <p className="text-[12px] font-extrabold text-slate-800">4. ข้อมูลสำหรับแอดมินติดต่อกลับ</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">ชื่อ-นามสกุล / ผู้แจ้ง *</label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      placeholder="เช่น คุณสมชาย รักดี"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[12px] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">เบอร์โทรศัพท์ *</label>
                    <input
                      type="tel"
                      required
                      value={senderPhone}
                      onChange={e => setSenderPhone(e.target.value)}
                      placeholder="081-234-5678"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[12px] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">LINE ID หรือ อีเมล</label>
                    <input
                      type="text"
                      value={senderEmail}
                      onChange={e => setSenderEmail(e.target.value)}
                      placeholder="@line_id หรือ email"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[12px] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white rounded-2xl font-extrabold text-[14px] shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'กำลังส่งข้อมูลถึงแอดมิน...' : 'ส่งข้อความถึงทีมแอดมินทันที'}</span>
                </button>
                <p className="text-center text-[11px] text-slate-400 mt-2">
                  🔒 ข้อมูลจะถูกส่งตรงถึงศูนย์ประสานงานแอดมินเพื่อตรวจสอบความถูกต้องก่อนบรอดแคสต์
                </p>
              </div>

            </form>
          ) : (
            /* Tab 2: History & Tracking */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-[14px] text-slate-900">รายการคำขอที่คุณเคยส่ง</h3>
                  <p className="text-[11.5px] text-slate-500">ติดตามสถานะและการตอบกลับจากแอดมิน</p>
                </div>
                <button
                  onClick={() => setActiveTab('form')}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-[11.5px] font-extrabold transition-colors border border-indigo-200/60 flex items-center gap-1"
                >
                  <Send size={13} />
                  <span>ส่งเรื่องใหม่</span>
                </button>
              </div>

              {contactRequests.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <FileText size={24} />
                  </div>
                  <p className="font-extrabold text-[14px] text-slate-700">ยังไม่มีรายการส่งเรื่อง</p>
                  <p className="text-[12px] text-slate-500 mt-1 max-w-xs mx-auto">
                    หากมีข่าวสาร กิจกรรม หรือเรื่องที่ต้องการให้แอดมินช่วยประชาสัมพันธ์ สามารถกดส่งเรื่องได้ทันที
                  </p>
                  <button
                    onClick={() => setActiveTab('form')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[12px] font-bold shadow-md shadow-indigo-600/20"
                  >
                    ส่งเรื่องแรกเลย
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {contactRequests.map((req) => {
                    const badge = getStatusBadge(req.status);
                    const BadgeIcon = badge.icon;
                    return (
                      <div 
                        key={req.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                                <BadgeIcon size={12} />
                                <span>{badge.label}</span>
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">{req.timeStr}</span>
                            </div>
                            <h4 className="font-extrabold text-[14px] text-slate-900 leading-snug">{req.title}</h4>
                          </div>

                          <button
                            onClick={() => deleteContactRequest(req.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                            title="ลบคำขอ"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <p className="text-[12.5px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                          {req.detail}
                        </p>

                        {/* If Media attached */}
                        {req.mediaUrl && (
                          <div 
                            onClick={() => openMediaViewer({
                              url: req.mediaUrl!,
                              type: req.mediaType || 'image',
                              title: req.title,
                              subtitle: `ส่งเรื่องโดย: ${req.senderName}`
                            })}
                            className="relative rounded-xl overflow-hidden max-h-32 bg-slate-900 border border-slate-200 cursor-pointer group"
                          >
                            <img 
                              src={req.mediaUrl} 
                              alt={req.title} 
                              className="w-full h-32 object-cover group-hover:scale-105 transition-transform" 
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <span className="bg-black/75 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                แตะดูภาพเต็มจอ
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Admin Note if replied */}
                        {req.adminNote && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[12px] text-emerald-900">
                            <p className="font-extrabold text-emerald-800 flex items-center gap-1.5 mb-0.5">
                              <ShieldCheck size={14} />
                              <span>ข้อความตอบกลับจากแอดมิน:</span>
                            </p>
                            <p className="leading-relaxed">{req.adminNote}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>📍 พื้นที่: {req.targetArea || 'ชุมชนทั่วไป'}</span>
                          <span>📞 ผู้แจ้ง: {req.senderName} ({req.senderPhone})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quick Direct Hotline Contacts */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Phone size={15} className="text-emerald-400" />
                <span className="font-extrabold text-[13px] text-white">ช่องทางติดต่อด่วนสายตรงแอดมิน</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full">
                เปิดตลอด 24 ชม.
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] mt-2">
              <a 
                href="tel:025550199" 
                className="flex items-center justify-between bg-white/10 hover:bg-white/15 p-2 rounded-xl transition-colors text-slate-200"
              >
                <span>📞 ศูนย์วิทยุประสานงานชุมชน</span>
                <span className="font-bold text-emerald-400">02-555-0199</span>
              </a>
              <a 
                href="tel:199" 
                className="flex items-center justify-between bg-white/10 hover:bg-white/15 p-2 rounded-xl transition-colors text-slate-200"
              >
                <span>🚨 ดับเพลิง / กู้ภัยฉุกเฉิน</span>
                <span className="font-bold text-rose-400">199</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
