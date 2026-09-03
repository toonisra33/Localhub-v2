import React, { useState, useRef } from 'react';
import { useBroadcast } from '../context/BroadcastContext';
import { useCommunity } from '../context/CommunityContext';
import { BroadcastCategory, BroadcastSeverity, AdminContactRequest } from '../types';
import { 
  Radio, 
  X, 
  Send, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  RotateCcw, 
  Trash2, 
  CheckCircle2, 
  Flame, 
  CloudRain, 
  Megaphone, 
  Car,
  Lock,
  ShoppingBag,
  Newspaper,
  Image as ImageIcon,
  Video as VideoIcon,
  Link as LinkIcon,
  ExternalLink,
  Upload,
  Sparkles,
  AlertCircle,
  Play,
  Inbox,
  User,
  Phone,
  Check,
  Maximize2
} from 'lucide-react';

import { isAuthorizedAdminEmail } from '../lib/firebase';

export function AdminBroadcastModal() {
  const { 
    openAdminModal, 
    setOpenAdminModal, 
    role, 
    activeBroadcast, 
    sendBroadcast, 
    cancelBroadcast,
    resetDeviceTimerForDemo,
    deviceRemainingSeconds
  } = useBroadcast();

  const { 
    contactRequests, 
    updateContactRequestStatus, 
    openMediaViewer, 
    showToast,
    isLoggedIn,
    userProfile
  } = useCommunity();

  const isRealAdmin = isLoggedIn && role === 'admin' && isAuthorizedAdminEmail(userProfile?.email);

  const [adminTab, setAdminTab] = useState<'create' | 'requests'>('create');

  // Template presets for realistic quick testing across all categories (Marketing, News, Emergency)
  const presets = [
    {
      title: '🛍️ โปรโมชั่นพิเศษ! มะม่วงน้ำดอกไม้หวานฉ่ำ ส่งตรงจากสวนชุมชน ลด 25%',
      message: 'กลุ่มเกษตรกรวิสาหกิจชุมชนเปิดจำหน่ายผลผลิตประจำฤดูกาล คัดเกรดพรีเมียม สด สะอาด พร้อมบริการจัดส่งฟรีในเขตตำบลและหมู่บ้านใกล้เคียง สั่งซื้อได้ผ่านลิงก์ด้านล่าง',
      category: 'marketing' as BroadcastCategory,
      severity: 'special' as BroadcastSeverity,
      targetArea: 'ทุกหมู่บ้านในตำบลและละแวกใกล้เคียง',
      contactNumber: '089-123-4567',
      mediaType: 'image' as const,
      mediaUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800',
      mediaFileName: 'mango_promotion.jpg',
      actionText: 'สั่งซื้อผ่าน LINE Official / ดูเมนู',
      actionUrl: 'https://lin.ee/localmarket-example',
    },
    {
      title: '📰 สาระน่ารู้: รัฐบาลเปิดลงทะเบียนเงินอุดหนุนพัฒนาทักษะอาชีพชุมชน ประจำปี 2569',
      message: 'เปิดรับสมัครฝึกอบรมอาชีพฟรีพร้อมเบี้ยเลี้ยงวันละ 300 บาท หลักสูตรช่างซ่อมไฟฟ้า, เกษตรแม่นยำ และการตลาดออนไลน์ ณ ศูนย์การเรียนรู้ชุมชน เริ่มลงทะเบียนถึงวันที่ 15 ของเดือนนี้',
      category: 'news' as BroadcastCategory,
      severity: 'normal' as BroadcastSeverity,
      targetArea: 'ประชาชนทุกคนในพื้นที่',
      contactNumber: '02-555-9876',
      mediaType: 'image' as const,
      mediaUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&q=80&w=800',
      mediaFileName: 'community_skills_news.jpg',
      actionText: 'อ่านรายละเอียดและลงทะเบียนออนไลน์',
      actionUrl: 'https://community-portal.gov.example/register',
    },
    {
      title: '🎥 วิดีโอไฮไลท์: บรรยากาศเปิดตลาดนัดคนเดินริมน้ำชุมชน ทุกวันเสาร์-อาทิตย์',
      message: 'ชมคลิปบรรยากาศร้านค้าของกินพื้นถิ่น ดนตรีในสวน และกิจกรรมสำหรับครอบครัว ขอเชิญชวนพี่น้องในชุมชนมาร่วมอุดหนุนร้านค้าท้องถิ่น สร้างรายได้หมุนเวียนในบ้านเรา',
      category: 'marketing' as BroadcastCategory,
      severity: 'normal' as BroadcastSeverity,
      targetArea: 'ลานริมน้ำ ชุมชนฝั่งตะวันตก',
      contactNumber: '081-999-8877',
      mediaType: 'video' as const,
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      mediaFileName: 'walking_street_tour.mp4',
      videoDurationSeconds: 15,
      actionText: 'ดูแผนที่ตั้งร้านค้าและที่จอดรถ',
      actionUrl: 'https://maps.google.com/?q=local+walking+street',
    },
    {
      title: '🚨 แจ้งเตือนน้ำท่วมขังฉับพลันและน้ำหนุนสูง',
      message: 'มีน้ำท่วมขังสูง 30-50 ซม. ในซอยหลัก โปรดเคลื่อนย้ายยานพาหนะและหลีกเลี่ยงการสัญจร',
      category: 'emergency' as BroadcastCategory,
      severity: 'urgent' as BroadcastSeverity,
      targetArea: 'ซอยพหลโยธิน 35 และพื้นที่ใกล้เคียง',
      contactNumber: '199 หรือ 02-555-0199',
      mediaType: 'image' as const,
      mediaUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800',
      mediaFileName: 'flood_alert.jpg',
      actionText: '',
      actionUrl: '',
    },
    {
      title: '⚡ แจ้งเหตุดับกระแสไฟฟ้าฉุกเฉินเพื่อซ่อมแซมหม้อแปลง',
      message: 'การไฟฟ้านครหลวงเข้าตัดกระแสไฟฟ้าเพื่อซ่อมแซมหม้อแปลงระเบิด คาดว่าจะจ่ายไฟได้ใน 2 ชั่วโมง',
      category: 'announcement' as BroadcastCategory,
      severity: 'high' as BroadcastSeverity,
      targetArea: 'หมู่บ้าน A และ ชุมชนลาดยาว',
      contactNumber: '1129 (กฟน.)',
      mediaType: undefined,
      mediaUrl: '',
      mediaFileName: '',
      actionText: '',
      actionUrl: '',
    },
  ];

  const [title, setTitle] = useState(presets[0].title);
  const [message, setMessage] = useState(presets[0].message);
  const [category, setCategory] = useState<BroadcastCategory>(presets[0].category);
  const [severity, setSeverity] = useState<BroadcastSeverity>(presets[0].severity);
  const [targetArea, setTargetArea] = useState(presets[0].targetArea);
  const [contactNumber, setContactNumber] = useState(presets[0].contactNumber);

  // Media attachments state
  const [selectedMediaType, setSelectedMediaType] = useState<'none' | 'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState<string>(presets[0].mediaUrl || '');
  const [mediaFileName, setMediaFileName] = useState<string>(presets[0].mediaFileName || '');
  const [videoDuration, setVideoDuration] = useState<number>(presets[0].videoDurationSeconds || 0);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Link attachment state (Optional)
  const [enableLink, setEnableLink] = useState<boolean>(true);
  const [actionText, setActionText] = useState<string>(presets[0].actionText || '');
  const [actionUrl, setActionUrl] = useState<string>(presets[0].actionUrl || '');

  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!openAdminModal || !isRealAdmin) return null;

  const handleConvertRequestToBroadcast = (req: AdminContactRequest) => {
    setTitle(req.title);
    setMessage(req.detail);
    if (req.type === 'pr_request') {
      setCategory('marketing');
      setSeverity('special');
    } else if (req.type === 'urgent_tip') {
      setCategory('emergency');
      setSeverity('urgent');
    } else {
      setCategory('news');
      setSeverity('normal');
    }
    setTargetArea(req.targetArea || 'ชุมชนทั่วไป');
    setContactNumber(req.senderPhone || '');
    if (req.mediaUrl) {
      setSelectedMediaType(req.mediaType || 'image');
      setMediaUrl(req.mediaUrl);
      setMediaFileName('resident_media_attachment');
      setVideoDuration(0);
    } else {
      setSelectedMediaType('none');
      setMediaUrl('');
      setMediaFileName('');
      setVideoDuration(0);
    }
    updateContactRequestStatus(req.id, 'approved_and_broadcast', 'แอดมินนำข้อมูลไปจัดทำบรอดแคสต์แจ้งเตือนลูกบ้านเรียบร้อยแล้ว');
    setAdminTab('create');
    showToast('✨ นำข้อมูลจากลูกบ้านมาใส่ในฟอร์มบรอดแคสต์แล้ว พร้อมตรวจสอบและกดส่ง');
  };

  const handleApplyPreset = (p: typeof presets[0]) => {
    setTitle(p.title);
    setMessage(p.message);
    setCategory(p.category);
    setSeverity(p.severity);
    setTargetArea(p.targetArea);
    setContactNumber(p.contactNumber || '');
    
    if (p.mediaType) {
      setSelectedMediaType(p.mediaType);
      setMediaUrl(p.mediaUrl || '');
      setMediaFileName(p.mediaFileName || '');
      setVideoDuration(p.videoDurationSeconds || 0);
    } else {
      setSelectedMediaType('none');
      setMediaUrl('');
      setMediaFileName('');
      setVideoDuration(0);
    }

    if (p.actionUrl) {
      setEnableLink(true);
      setActionText(p.actionText || '');
      setActionUrl(p.actionUrl || '');
    } else {
      setEnableLink(false);
      setActionText('');
      setActionUrl('');
    }
    setMediaError(null);
  };

  // Handle local media file upload (image or video <= 10 mins)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setMediaError('กรุณาเลือกไฟล์รูปภาพ (.jpg, .png, .webp) หรือวิดีโอ (.mp4, .webm)');
      return;
    }

    if (isVideo) {
      // Check video duration limit (<= 10 minutes = 600s)
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      const fileUrl = URL.createObjectURL(file);
      videoElement.src = fileUrl;

      videoElement.onloadedmetadata = () => {
        URL.revokeObjectURL(fileUrl);
        const duration = Math.round(videoElement.duration);
        if (duration > 600) {
          setMediaError(`❌ วิดีโอมีความยาว ${Math.floor(duration / 60)} นาที ${duration % 60} วินาที ซึ่งเกินกำหนด (จำกัดไม่เกิน 10 นาที)`);
          return;
        }
        
        // Valid video
        const reader = new FileReader();
        reader.onload = (loadEv) => {
          setSelectedMediaType('video');
          setMediaUrl(loadEv.target?.result as string);
          setMediaFileName(file.name);
          setVideoDuration(duration);
        };
        reader.readAsDataURL(file);
      };

      videoElement.onerror = () => {
        setMediaError('ไม่สามารถอ่านข้อมูลวิดีโอได้ โปรดลองใช้ไฟล์อื่น');
      };
    } else if (isImage) {
      const reader = new FileReader();
      reader.onload = (loadEv) => {
        setSelectedMediaType('image');
        setMediaUrl(loadEv.target?.result as string);
        setMediaFileName(file.name);
        setVideoDuration(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    if (selectedMediaType === 'video' && videoDuration > 600) {
      setMediaError('ความยาววิดีโอต้องไม่เกิน 10 นาที');
      return;
    }

    sendBroadcast({
      title: title.trim(),
      message: message.trim(),
      category,
      severity,
      targetArea: targetArea.trim() || undefined,
      contactNumber: contactNumber.trim() || undefined,
      mediaType: selectedMediaType === 'none' ? undefined : selectedMediaType,
      mediaUrl: selectedMediaType !== 'none' && mediaUrl ? mediaUrl : undefined,
      mediaFileName: selectedMediaType !== 'none' && mediaFileName ? mediaFileName : undefined,
      videoDurationSeconds: selectedMediaType === 'video' ? videoDuration : undefined,
      actionText: (enableLink && actionUrl.trim()) ? (actionText.trim() || 'ไปยังลิงก์ข้อมูล') : undefined,
      actionUrl: (enableLink && actionUrl.trim()) ? actionUrl.trim() : undefined,
    });

    setStatusFeedback('ส่งบรอดแคสสำเร็จ! ข้อความจะล็อกบนหน้าจอด้านบนสุดทุกเครื่อง 15 นาที');
    setTimeout(() => {
      setStatusFeedback(null);
      setOpenAdminModal(false);
    }, 1500);
  };

  const handleCancel = () => {
    cancelBroadcast();
    setStatusFeedback('ยกเลิกบรอดแคสเรียบร้อยแล้ว');
    setTimeout(() => {
      setStatusFeedback(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-gray-950/75 backdrop-blur-sm z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl h-[92vh] sm:h-auto sm:max-h-[88vh] sm:rounded-3xl flex flex-col shadow-2xl rounded-t-[32px] overflow-hidden border border-gray-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 text-white border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-md">
              <Radio size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[16px]">ศูนย์ควบคุมบรอดแคส</h3>
                <span className="bg-red-500/30 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/40">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-[12px] text-gray-400 font-medium">ส่งข่าวสาร สาระ สินค้า/บริการ หรือแจ้งเตือนด่วนล็อกบนจอ 15 นาที</p>
            </div>
          </div>
          <button 
            onClick={() => setOpenAdminModal(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50">
          
          {/* Permission warning if role is not admin */}
          {role !== 'admin' ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
              <Lock size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-[14px]">คุณอยู่ในโหมดผู้ใช้งานทั่วไป</h4>
                <p className="text-[12px] text-amber-700 mt-1">
                  เฉพาะบัญชีที่มีสิทธิ์เป็นแอดมินเท่านั้นที่สามารถส่งบรอดแคสได้ คุณสามารถสลับเป็นโหมดแอดมินได้ในหน้าโปรไฟล์
                </p>
              </div>
            </div>
          ) : null}

          {/* Active Broadcast Status Panel (If any) */}
          {activeBroadcast && (
            <div className="bg-white border-2 border-red-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  กำลังบรอดแคสอยู่บนระบบ
                </span>
                <span className="text-[12px] font-bold text-gray-600 flex items-center gap-1">
                  <Clock size={14} className="text-amber-500" />
                  เหลือเวลาบนเครื่องนี้: {Math.floor(deviceRemainingSeconds / 60)}:{String(deviceRemainingSeconds % 60).padStart(2, '0')} น.
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                  หมวด: {activeBroadcast.category}
                </span>
                {activeBroadcast.mediaType && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                    แนบ{activeBroadcast.mediaType === 'video' ? 'วิดีโอ' : 'รูปภาพ'}
                  </span>
                )}
                {activeBroadcast.actionUrl && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                    มีปุ่มลิงก์
                  </span>
                )}
              </div>

              <h4 className="font-bold text-gray-900 text-[14px] truncate">{activeBroadcast.title}</h4>
              <p className="text-[12px] text-gray-600 mt-0.5 line-clamp-2">{activeBroadcast.message}</p>
              
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={resetDeviceTimerForDemo}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw size={13} />
                  รีเซ็ตเวลา 15 นาที (ทดสอบ)
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-red-50 hover:bg-red-100 text-red-600 py-1.5 px-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-red-200"
                >
                  <Trash2 size={13} />
                  ยกเลิกบรอดแคส
                </button>
              </div>
            </div>
          )}

          {/* Feedback message */}
          {statusFeedback && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl flex items-center gap-2 text-[13px] font-bold animate-in fade-in">
              <CheckCircle2 size={18} className="text-emerald-600" />
              {statusFeedback}
            </div>
          )}

          {/* Sub Tabs: Create vs Resident Requests */}
          <div className="flex items-center bg-gray-200/80 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setAdminTab('create')}
              className={`flex-1 py-2 rounded-xl text-[12.5px] font-extrabold flex items-center justify-center gap-2 transition-all ${
                adminTab === 'create'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Radio size={14} className={adminTab === 'create' ? 'text-red-600' : ''} />
              <span>สร้างบรอดแคสต์ใหม่</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('requests')}
              className={`flex-1 py-2 rounded-xl text-[12.5px] font-extrabold flex items-center justify-center gap-2 transition-all relative ${
                adminTab === 'requests'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Inbox size={14} className={adminTab === 'requests' ? 'text-indigo-600' : ''} />
              <span>ข้อความจากลูกบ้าน</span>
              {contactRequests.length > 0 && (
                <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {contactRequests.length}
                </span>
              )}
            </button>
          </div>

          {adminTab === 'requests' ? (
            /* Resident PR Requests Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-[14px] text-gray-900">คำขอประชาสัมพันธ์และแจ้งข่าว</h4>
                  <p className="text-[11.5px] text-gray-500">ลูกบ้านส่งเรื่องขอให้แอดมินช่วยกระจายข่าวสาร</p>
                </div>
                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-xl">
                  ทั้งหมด {contactRequests.length} รายการ
                </span>
              </div>

              {contactRequests.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                  <Inbox size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="font-bold text-gray-600 text-[13px]">ยังไม่มีคำขอจากลูกบ้านในขณะนี้</p>
                  <p className="text-[11.5px] text-gray-400 mt-0.5">เมื่อลูกบ้านกดปุ่มติดต่อแอดมิน รายการจะแสดงที่นี่</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contactRequests.map((req) => (
                    <div 
                      key={req.id} 
                      className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3 hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {req.type === 'pr_request' ? '📢 ขอประชาสัมพันธ์' :
                               req.type === 'news_report' ? '📰 แจ้งข่าวด่วน' :
                               req.type === 'urgent_tip' ? '🚨 แจ้งจุดเสี่ยง' :
                               req.type === 'special_help' ? '🤝 ขอความช่วยเหลือ' : '💬 ข้อเสนอแนะ'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              req.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              req.status === 'approved_and_broadcast' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {req.status === 'pending' ? '🟡 รอตรวจสอบ' :
                               req.status === 'approved_and_broadcast' ? '🟢 ออกบรอดแคสต์แล้ว' : '🔵 รับเรื่องแล้ว'}
                            </span>
                            <span className="text-[10px] text-gray-400">{req.timeStr}</span>
                          </div>

                          <h5 className="font-extrabold text-[13.5px] text-gray-900 leading-snug">{req.title}</h5>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-[12.5px] text-gray-700 leading-relaxed">
                        {req.detail}
                      </div>

                      {/* Media if attached */}
                      {req.mediaUrl && (
                        <div 
                          onClick={() => openMediaViewer({
                            url: req.mediaUrl!,
                            type: req.mediaType || 'image',
                            title: req.title,
                            subtitle: `ส่งโดย: ${req.senderName}`
                          })}
                          className="relative rounded-xl overflow-hidden max-h-32 bg-gray-900 border border-gray-200 cursor-pointer group"
                        >
                          <img src={req.mediaUrl} alt={req.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="bg-black/75 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                              <Maximize2 size={11} /> แตะดูภาพเต็มจอ
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Sender Info & Area */}
                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100 flex-wrap gap-2">
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-gray-400" />
                          <strong>{req.senderName}</strong>
                        </span>
                        <a href={`tel:${req.senderPhone}`} className="flex items-center gap-1 text-emerald-600 font-bold hover:underline">
                          <Phone size={12} />
                          <span>{req.senderPhone}</span>
                        </a>
                        <span>📍 {req.targetArea || 'ชุมชนทั่วไป'}</span>
                      </div>

                      {/* Action to 1-Click Convert to Broadcast */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => handleConvertRequestToBroadcast(req)}
                          className="flex-1 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-[12px] font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-red-500/20 transition-all"
                        >
                          <Radio size={13} className="animate-pulse" />
                          <span>⚡ นำไปออกบรอดแคสต์ทันที</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            updateContactRequestStatus(req.id, 'reviewed', 'แอดมินรับเรื่องเรียบร้อยแล้ว');
                            showToast('บันทึกสถานะรับเรื่องแล้ว');
                          }}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[11px] font-bold transition-colors"
                        >
                          รับเรื่อง
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Form to create a new broadcast */
            <form onSubmit={handleSend} className="space-y-4">
            
            {/* Quick Presets across Marketing, News, Emergency */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-bold text-gray-700">
                  📋 เลือกตัวอย่างหัวข้อ (Presets)
                </label>
                <span className="text-[11px] text-gray-400">ข่าว • การตลาด • เหตุการณ์</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="p-2.5 text-left bg-white border border-gray-200 rounded-xl hover:border-gray-900 hover:shadow-sm transition-all text-xs group"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        p.category === 'marketing' ? 'bg-purple-100 text-purple-700' :
                        p.category === 'news' ? 'bg-blue-100 text-blue-700' :
                        p.category === 'emergency' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {p.category === 'marketing' ? '🛍️ การตลาด' :
                         p.category === 'news' ? '📰 ข่าวสาร' :
                         p.category === 'emergency' ? '🚨 ฉุกเฉิน' : '📢 ทั่วไป'}
                      </span>
                      {p.mediaType && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          {p.mediaType === 'video' ? '🎥 มีวิดีโอ' : '🖼️ มีภาพ'}
                        </span>
                      )}
                      {p.actionUrl && (
                        <span className="text-[10px] text-emerald-600 font-medium ml-auto">
                          🔗 มีปุ่มลิงก์
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-gray-900 line-clamp-1 group-hover:text-red-600">
                      {p.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-2">
                หมวดหมู่การบรอดแคส (Category)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: 'marketing', label: 'สินค้า/บริการ', icon: ShoppingBag, color: 'text-purple-600' },
                  { id: 'news', label: 'ข่าว/สาระดีๆ', icon: Newspaper, color: 'text-blue-600' },
                  { id: 'announcement', label: 'ประชาสัมพันธ์', icon: Megaphone, color: 'text-emerald-600' },
                  { id: 'emergency', label: 'เตือนภัยด่วน', icon: ShieldAlert, color: 'text-red-600' },
                  { id: 'weather', label: 'สภาพอากาศ', icon: CloudRain, color: 'text-sky-600' },
                  { id: 'traffic', label: 'การจราจร', icon: Car, color: 'text-amber-600' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = category === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id as BroadcastCategory)}
                      className={`p-2 rounded-xl text-center border text-[11px] font-bold flex flex-col items-center gap-1.5 transition-all ${
                        isSelected 
                          ? 'bg-gray-900 text-white border-gray-900 shadow-sm' 
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={16} className={isSelected ? 'text-white' : item.color} />
                      <span className="leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity / Highlight Level */}
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-2">
                ระดับการเน้นความสำคัญ (Visual Style)
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSeverity('special')}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
                    severity === 'special'
                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50'
                  }`}
                >
                  <Sparkles size={13} />
                  พิเศษ / แนะนำ
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('urgent')}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
                    severity === 'urgent'
                      ? 'bg-red-600 text-white border-red-700 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-red-50'
                  }`}
                >
                  <Flame size={13} />
                  ด่วนมาก
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('high')}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
                    severity === 'high'
                      ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-orange-50'
                  }`}
                >
                  <AlertTriangle size={13} />
                  สำคัญ
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('normal')}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
                    severity === 'normal'
                      ? 'bg-gray-900 text-white border-black shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Megaphone size={13} />
                  มาตรฐาน
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-1">
                หัวข้อบรอดแคส <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น 🛍️ แนะนำสินค้า OTOP ใหม่ หรือ 📰 ข่าวสารโครงการชุมชน..."
                className="w-full bg-white border border-gray-300 rounded-2xl px-4 py-2.5 text-[14px] font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
              />
            </div>

            {/* Message Details */}
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-1">
                เนื้อหา / รายละเอียด <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="ระบุข้อความนำเสนอ รายละเอียดสินค้า สาระประโยชน์ หรือคำแนะนำ..."
                className="w-full bg-white border border-gray-300 rounded-2xl p-3.5 text-[13px] font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all resize-none"
              />
            </div>

            {/* Media Attachment Section (Image or Video <= 10 mins) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                  <ImageIcon size={15} className="text-purple-600" />
                  <span>การแนบไฟล์มีเดีย (รูปภาพ / วิดีโอไม่เกิน 10 นาที)</span>
                </div>
                <span className="text-[11px] text-gray-400">เลือกประเภทสื่อ</span>
              </div>

              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMediaType('none');
                    setMediaUrl('');
                    setMediaFileName('');
                    setVideoDuration(0);
                    setMediaError(null);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                    selectedMediaType === 'none'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ไม่มีสื่อแนบ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMediaType('image');
                    if (!mediaUrl || selectedMediaType === 'video') {
                      setMediaUrl('https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800');
                      setMediaFileName('sample_image.jpg');
                    }
                    setVideoDuration(0);
                    setMediaError(null);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    selectedMediaType === 'image'
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ImageIcon size={13} />
                  แนบรูปภาพ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMediaType('video');
                    if (!mediaUrl || selectedMediaType === 'image') {
                      setMediaUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
                      setMediaFileName('sample_video.mp4');
                      setVideoDuration(15);
                    }
                    setMediaError(null);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    selectedMediaType === 'video'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <VideoIcon size={13} />
                  แนบวิดีโอ (≤10 น.)
                </button>
              </div>

              {/* Media Error */}
              {mediaError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs flex items-center gap-1.5 font-medium">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{mediaError}</span>
                </div>
              )}

              {/* If Image Selected */}
              {selectedMediaType === 'image' && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => {
                        setMediaUrl(e.target.value);
                        setMediaFileName('URL Image');
                      }}
                      placeholder="ใส่ URL รูปภาพ หรือกดปุ่มอัปโหลดไฟล์..."
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-500"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Upload size={13} />
                      อัปโหลด
                    </button>
                  </div>

                  {mediaUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 max-h-36 bg-gray-900 flex items-center justify-center">
                      <img 
                        src={mediaUrl} 
                        alt="Preview" 
                        className="w-full h-36 object-cover" 
                        onError={() => setMediaError('ไม่สามารถโหลดภาพจาก URL นี้ได้')}
                      />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ImageIcon size={10} />
                        ภาพตัวอย่าง
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* If Video Selected */}
              {selectedMediaType === 'video' && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => {
                        setMediaUrl(e.target.value);
                        setMediaFileName('URL Video');
                        setVideoDuration(15);
                      }}
                      placeholder="ใส่ URL วิดีโอ (.mp4, .webm) หรืออัปโหลดไฟล์..."
                      className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Upload size={13} />
                      อัปโหลด
                    </button>
                  </div>

                  <div className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock size={12} className="text-blue-500" />
                    <span>ระยะเวลาวิดีโอต้องไม่เกิน <strong>10 นาที (600 วินาที)</strong></span>
                  </div>

                  {mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-black">
                      <video 
                        src={mediaUrl} 
                        controls 
                        className="w-full max-h-40 object-contain bg-black"
                        onLoadedMetadata={(e) => {
                          const dur = Math.round(e.currentTarget.duration);
                          setVideoDuration(dur);
                          if (dur > 600) {
                            setMediaError(`❌ วิดีโอยาวเกิน 10 นาที (${Math.floor(dur/60)}:${String(dur%60).padStart(2,'0')} น.)`);
                          } else {
                            setMediaError(null);
                          }
                        }}
                      />
                      <div className="bg-gray-900 px-3 py-1.5 text-[11px] text-gray-300 flex items-center justify-between border-t border-gray-800">
                        <span className="flex items-center gap-1 text-blue-400">
                          <Play size={11} />
                          {mediaFileName || 'วิดีโอที่เลือก'}
                        </span>
                        {videoDuration > 0 && (
                          <span className={videoDuration > 600 ? 'text-red-400 font-bold' : 'text-emerald-400 font-medium'}>
                            ความยาว: {Math.floor(videoDuration / 60)}:{String(videoDuration % 60).padStart(2, '0')} น.
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Optional Action Link Section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableLink}
                    onChange={(e) => setEnableLink(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                    <LinkIcon size={14} className="text-emerald-600" />
                    แนบปุ่มลิงก์ภายนอก / เว็บไซต์ (Optional)
                  </span>
                </label>
                <span className="text-[11px] text-gray-400">
                  {enableLink ? 'เปิดใช้งาน' : 'ไม่แนบลิงก์'}
                </span>
              </div>

              {enableLink ? (
                <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      ข้อความบนปุ่มกด (Button Label)
                    </label>
                    <input
                      type="text"
                      value={actionText}
                      onChange={(e) => setActionText(e.target.value)}
                      placeholder="เช่น สั่งซื้อทาง LINE, ดูเมนูสินค้า, อ่านรายละเอียดฉบับเต็ม..."
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      ลิงก์ URL ปลายทาง (Target URL) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required={enableLink}
                      value={actionUrl}
                      onChange={(e) => setActionUrl(e.target.value)}
                      placeholder="เช่น https://lin.ee/xyz หรือ https://facebook.com/..."
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-emerald-500"
                    />
                  </div>
                  
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span>ระบบจะแสดงปุ่มเปิดลิงก์บนแถบบรอดแคส ให้ผู้ใช้งานกดไปยังหน้าเว็บหรือ LINE ได้ทันที</span>
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-lg">
                  💡 ไม่ได้แนบลิงก์ — ระบบจะไม่แสดงปุ่มกดลิงก์ใดๆ บนแถบประกาศ
                </p>
              )}
            </div>

            {/* Target Area & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">
                  พื้นที่เป้าหมาย / กลุ่มเป้าหมาย (Optional)
                </label>
                <input
                  type="text"
                  value={targetArea}
                  onChange={(e) => setTargetArea(e.target.value)}
                  placeholder="เช่น ทุกหมู่บ้าน, ชุมชนริมน้ำ..."
                  className="w-full bg-white border border-gray-300 rounded-2xl px-3.5 py-2 text-[13px] font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">
                  เบอร์โทรติดต่อสอบถาม (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="เช่น 089-xxx-xxxx หรือ 199"
                  className="w-full bg-white border border-gray-300 rounded-2xl px-3.5 py-2 text-[13px] font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>
            </div>

            {/* Broadcast System Rules Notice */}
            <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-2xl text-[12px] text-slate-700 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-slate-900">
                <Clock size={14} className="text-red-500" />
                เงื่อนไขและข้อกำหนดการบรอดแคส:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                <li>ล็อกอยู่บนสุดของหน้าจอทุกเครื่องเป็นเวลา <strong>3 นาที</strong> เมื่อเลื่อนหรือไถหน้าจอ</li>
                <li>สามารถแนบภาพ หรือวิดีโอ (ความยาวไม่เกิน 10 นาที) และแนบปุ่มลิงก์ได้</li>
                <li>ระบบจะ<strong>รีเซ็ตตัวเองอัตโนมัติเวลา 00:00 น.</strong> ของทุกวัน</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={role !== 'admin' || (selectedMediaType === 'video' && videoDuration > 600)}
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 disabled:opacity-50 text-white py-3.5 px-5 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition-all"
              >
                <Send size={18} />
                ส่งบรอดแคสสู่ทุกอุปกรณ์ทันที (Broadcast Now)
              </button>
            </div>
          </form>
          )}

        </div>
      </div>
    </div>
  );
}
