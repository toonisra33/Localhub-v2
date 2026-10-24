import React, { useState, useMemo, useRef } from 'react';
import {
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  LogIn,
  LogOut,
  Sparkles,
  ChevronRight,
  Settings,
  Edit3,
  Bookmark,
  Share2,
  Image as ImageIcon,
  Users,
  UserMinus,
  ArrowLeft,
  X,
  MessageSquare,
  Heart,
  Clock,
  MapPin,
  ExternalLink,
  Flame,
  Radio,
  Download,
  Eye,
  SlidersHorizontal,
  LayoutDashboard,
  Phone,
  Building,
  Home,
  Camera,
  Globe,
  Lock,
  Mail,
  Loader2
} from 'lucide-react';
import { useCommunity, ORIGINAL_ADMIN_EMAIL } from '../../context/CommunityContext';
import { Post, AlertReport } from '../../types';
import { PostImageGallery } from '../PostImageGallery';
import { PostActionMenu } from '../PostActionMenu';
import { EditProfileModal } from '../modals/EditProfileModal';
import { compressImageFile } from '../../utils/mediaStorage';

interface ProfileViewProps {
  onOpenCreatePost?: () => void;
}

export type ProfileActiveTab = 'posts' | 'alerts' | 'friends' | 'album';

export const ProfileView: React.FC<ProfileViewProps> = ({ onOpenCreatePost }) => {
  const {
    currentUser,
    isAdmin,
    setIsAdmin,
    logoutFirebase,
    openLoginModal,
    setActiveTab,
    posts,
    alerts,
    marketItems,
    friends,
    removeFriend,
    openPostDetail,
    showToast,
    goBack,
    createPost,
    updateUserProfile,
    isCurrentAccountInactiveWarning,
    currentAccountDaysRemaining,
    confirmActiveStatus,
    openDirectChat,
    totalUnreadChatCount
  } = useCommunity();

  // Profile Sub-tab: 'posts' | 'alerts' | 'friends' | 'album'
  const [activeTabSub, setActiveTabSub] = useState<ProfileActiveTab>('posts');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [quickPostText, setQuickPostText] = useState('');
  const [quickPostImages, setQuickPostImages] = useState<string[]>([]);
  const [isProcessingQuickImage, setIsProcessingQuickImage] = useState(false);
  const quickCameraInputRef = useRef<HTMLInputElement>(null);
  const quickGalleryInputRef = useRef<HTMLInputElement>(null);

  const [friendSearchQuery, setFriendSearchQuery] = useState('');
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [userBio, setUserBio] = useState('ยินดีที่ได้รู้จักทุกคนในชุมชน LocalHub ร่วมสร้างพื้นที่น่าอยู่และปลอดภัยไปด้วยกันครับ 🏡✨');

  // Check if current user is authorized as the system administrator (ONLY toonisra33@gmail.com)
  const isEligibleAdmin = Boolean(
    currentUser?.email && currentUser.email.toLowerCase().trim() === ORIGINAL_ADMIN_EMAIL.toLowerCase()
  );

  // 1. Filter User's Own Posts & Shared Posts (ข้อมูลเฉพาะบุคคลของเจ้าของบัญชีเท่านั้น ยกเว้นจะมีการแชร์โพสต์คนอื่นจึงจะมาแสดงในหน้านี้ ไม่รวมการกดไลค์หรือ comment)
  const myPosts = useMemo(() => {
    if (!currentUser) return [];
    const currentName = (currentUser.displayName || '').trim().toLowerCase();
    const currentEmail = (currentUser.email || '').trim().toLowerCase();
    const currentUid = currentUser.uid;
    const isOwnerAdmin = Boolean(
      currentEmail === ORIGINAL_ADMIN_EMAIL.toLowerCase() ||
      currentName.includes('อิศราวัฒน์')
    );

    return posts.filter((p) => {
      const author = (p.author || '').trim().toLowerCase();
      const authorId = (p as any).authorId;
      const authorEmail = ((p as any).authorEmail || '').trim().toLowerCase();

      // ก. ตรวจสอบว่าตนเองเป็นผู้สร้างโพสต์นี้ (โพสต์ของเจ้าของบัญชีเท่านั้น)
      const isOriginalAuthor = Boolean(
        (authorId && currentUid && authorId === currentUid) ||
        (currentEmail && authorEmail && authorEmail === currentEmail) ||
        (currentName && author === currentName) ||
        (isOwnerAdmin && (author.includes('อิศราวัฒน์') || author.includes('toonisra') || authorId === 'admin_toonisra33'))
      );

      // ข. ยกเว้นจะมีการแชร์โพสต์คนอื่น จึงจะมาปรากฏในหน้าฉัน (โพสต์ที่แชร์โดยตนเอง)
      const isSharedByMe = Boolean(
        p.sharedFrom && (
          isOriginalAuthor ||
          ((p as any).sharedByUid && (p as any).sharedByUid === currentUid) ||
          ((p.sharedFrom as any).sharedBy && (p.sharedFrom as any).sharedBy.trim().toLowerCase() === currentName) ||
          (Array.isArray(p.sharedBy) && p.sharedBy.some(s => s.trim().toLowerCase() === currentName))
        )
      );

      // แสดงเฉพาะโพสต์ที่เป็นของตนเอง หรือโพสต์ที่ตนเองแชร์เท่านั้น (ไม่รวมการกดไลค์หรือ comment)
      return isOriginalAuthor || isSharedByMe;
    });
  }, [posts, currentUser]);

  // 2. Filter User's Own Incident Reports (เฉพาะเหตุการณ์ที่เจ้าของบัญชีเป็นผู้รายงานเท่านั้น)
  const myAlerts = useMemo(() => {
    if (!currentUser) return [];
    const currentName = (currentUser.displayName || '').trim().toLowerCase();
    const currentEmail = (currentUser.email || '').trim().toLowerCase();
    const currentUid = currentUser.uid;
    const isOwnerAdmin = Boolean(
      currentEmail === ORIGINAL_ADMIN_EMAIL.toLowerCase() ||
      currentName.includes('อิศราวัฒน์')
    );

    return alerts.filter((a) => {
      const reporter = (a.reporter || '').trim().toLowerCase();
      const reporterId = (a as any).reporterId;
      const reporterEmail = ((a as any).reporterEmail || '').trim().toLowerCase();

      return Boolean(
        (reporterId && currentUid && reporterId === currentUid) ||
        (currentEmail && reporterEmail && reporterEmail === currentEmail) ||
        (currentName && reporter === currentName) ||
        (isOwnerAdmin && (reporter.includes('อิศราวัฒน์') || reporter.includes('toonisra')))
      );
    });
  }, [alerts, currentUser]);

  // 3. Collect User's Own Photo Album across Posts, Alerts, and Market
  const myAlbumImages = useMemo(() => {
    if (!currentUser) return [];
    const images: { url: string; title: string; source: 'post' | 'alert' | 'market'; timestamp: number }[] = [];

    // From user posts
    myPosts.forEach((p) => {
      if (Array.isArray(p.images)) {
        p.images.forEach((img) => {
          if (img) images.push({ url: img, title: p.title, source: 'post', timestamp: p.createdAt });
        });
      }
    });

    // From user market items
    marketItems.forEach((m) => {
      if (m.seller === currentUser.displayName && Array.isArray(m.images)) {
        m.images.forEach((img) => {
          if (img) images.push({ url: img, title: m.title, source: 'market', timestamp: m.createdAt });
        });
      }
    });

    // Provide default fallback memories if user hasn't uploaded many yet
    if (images.length === 0) {
      images.push(
        {
          url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
          title: 'กิจกรรมทำความสะอาดชุมชน',
          source: 'post',
          timestamp: Date.now() - 86400000 * 2
        },
        {
          url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
          title: 'ช่วยเหลือน้องแมวหลงทางในหมู่บ้าน',
          source: 'post',
          timestamp: Date.now() - 86400000 * 5
        },
        {
          url: 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=800&auto=format&fit=crop&q=80',
          title: 'แปลงผักสวนครัวอินทรีย์เพื่อนบ้าน',
          source: 'post',
          timestamp: Date.now() - 86400000 * 8
        }
      );
    }

    return images;
  }, [myPosts, marketItems, currentUser]);

  // 4. Filter Friends
  const filteredFriends = useMemo(() => {
    if (!friendSearchQuery.trim()) return friends;
    const q = friendSearchQuery.toLowerCase().trim();
    return friends.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.province && f.province.toLowerCase().includes(q)) ||
        (f.district && f.district.toLowerCase().includes(q))
    );
  }, [friends, friendSearchQuery]);

  const handleQuickCameraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingQuickImage(true);
    try {
      const file = files[0];
      const compressed = await compressImageFile(file, 960, 960, 0.72);
      if (compressed) {
        setQuickPostImages(prev => [...prev, compressed]);
        showToast('📸 ถ่ายภาพสดเรียบร้อย แนบในโพสต์แล้ว!', 'success');
      }
    } catch {
      showToast('ไม่สามารถบันทึกภาพถ่ายได้', 'error');
    } finally {
      setIsProcessingQuickImage(false);
      if (quickCameraInputRef.current) quickCameraInputRef.current.value = '';
    }
  };

  const handleQuickGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingQuickImage(true);
    try {
      const newImgs: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImageFile(files[i], 960, 960, 0.72);
        if (compressed) newImgs.push(compressed);
      }
      if (newImgs.length > 0) {
        setQuickPostImages(prev => [...prev, ...newImgs]);
        showToast(`🖼️ แนบรูปภาพ ${newImgs.length} รูปเรียบร้อย!`, 'success');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการโหลดรูปภาพ', 'error');
    } finally {
      setIsProcessingQuickImage(false);
      if (quickGalleryInputRef.current) quickGalleryInputRef.current.value = '';
    }
  };

  const handleQuickCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPostText.trim() && quickPostImages.length === 0) {
      showToast('กรุณากรอกข้อความหรือแนบรูปภาพเพื่อแชร์เรื่องราว', 'info');
      return;
    }
    createPost({
      title: quickPostText.trim() ? quickPostText.slice(0, 40) : 'ภาพถ่ายเรื่องราวในชุมชน',
      content: quickPostText.trim() || 'แชร์ภาพถ่ายเรื่องราว',
      category: 'general',
      images: quickPostImages.length > 0 ? quickPostImages : undefined
    });
    setQuickPostText('');
    setQuickPostImages([]);
    showToast('สร้างโพสต์ของคุณเรียบร้อยแล้ว!', 'success');
  };

  const handleToggleAdminRole = () => {
    if (!isEligibleAdmin) return;
    const nextState = !isAdmin;
    setIsAdmin(nextState);
    if (nextState) {
      showToast('🛡️ เปิดสิทธิ์แอดมิน: แท็บ "แดชบอร์ด" ปรากฏที่แถบนำทางด้านล่างแล้ว', 'success');
    } else {
      showToast('👤 เปลี่ยนเป็นโหมดผู้ใช้งานทั่วไป: ซ่อนแท็บแดชบอร์ดแล้ว', 'info');
    }
  };

  // =========================================================================
  // GUEST PROFILE VIEW (เมื่อยังไม่ได้เข้าสู่ระบบ)
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn pb-16">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 p-2">
          <button
            onClick={goBack}
            className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 border border-slate-200"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>
          <span className="text-xs font-bold text-slate-500">โปรไฟล์ผู้เยี่ยมชม (Guest Profile)</span>
        </div>

        {/* Guest Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-slate-400">
              <User className="w-12 h-12" />
            </div>
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-slate-800 text-white text-[10px] font-bold rounded-full border border-white">
              GUEST
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">ผู้เยี่ยมชม (Guest)</h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              คุณกำลังเข้าใช้งานในโหมดผู้เยี่ยมชมทั่วไป เข้าสู่ระบบเพื่อเริ่มสร้างโพสต์ ติดตามประวัติการแจ้งเหตุ
              บันทึกอัลบั้มภาพ และเชื่อมต่อกับเพื่อนในชุมชน
            </p>
          </div>

          {/* Action Button to Open Login Modal */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={openLoginModal}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-2xl text-sm transition shadow-md flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ / ลงทะเบียน</span>
            </button>

            <button
              onClick={() => setActiveTab('home')}
              className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>

        {/* Guest Informational Feature Showcase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <MessageSquare className="w-4 h-4" />
              </span>
              <span>โพสต์และแชร์เรื่องราวในพื้นที่</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              เข้าสู่ระบบเพื่อเขียนโพสต์ สอบถามข้อมูล ประกาศของหาย หรือพูดคุยกับเพื่อนบ้านในเขตของคุณ
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
              <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span>รายงานเหตุการณ์ & ความปลอดภัย</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              แจ้งเหตุฉุกเฉิน อุบัติเหตุ น้ำท่วม เพื่อเตือนภัยทุกคนในระบบ และติดตามสถานะการช่วยเหลือแบบเรียลไทม์
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-4 h-4" />
              </span>
              <span>เครือข่ายเพื่อนในชุมชน</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              เพิ่มเพื่อน ลบเพื่อน และดูฟีดเฉพาะเพื่อนหรือคนในพิกัดที่คุณอาศัยอยู่
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
              <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                <ImageIcon className="w-4 h-4" />
              </span>
              <span>อัลบั้มภาพส่วนตัว</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              รวบรวมภาพถ่ายทุกภาพที่คุณแนบในโพสต์ รายงานเหตุ หรือสินค้าตลาด ไว้ในอัลบั้มที่เดียว
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LOGGED-IN USER PROFILE VIEW (ข้อมูลส่วนตัว + โพสต์ + การแจ้งเหตุ + เพื่อน + อัลบั้ม)
  // =========================================================================
  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn pb-16">
      {/* ⚠️ การแจ้งเตือนบัญชีไม่มีการเคลื่อนไหวเกิน 3 เดือน + ปุ่มยืนยันการใช้งาน (หากไม่ยืนยันใน 30 วันจะถูกลบอัตโนมัติ) */}
      {isCurrentAccountInactiveWarning && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white rounded-3xl shadow-xl border-2 border-amber-300 animate-fadeIn space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-white/20 text-white rounded-2xl shrink-0 backdrop-blur-xs">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-rose-700 text-[10px] font-black uppercase shadow-xs">
                  ⚠️ แจ้งเตือนสถานะบัญชี
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-black/30 text-amber-100 text-[10px] font-bold">
                  ไม่มีการเคลื่อนไหวเกิน 3 เดือน
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black mt-1 leading-snug">
                บัญชีของคุณไม่มีการเคลื่อนไหวเกิน 3 เดือน (90 วัน)
              </h2>
              <p className="text-xs sm:text-sm text-amber-50 mt-1 leading-relaxed">
                ระบบตรวจพบว่าบัญชีนี้ไม่มีการเคลื่อนไหวเป็นเวลาเกิน 90 วัน เพื่อความปลอดภัยและการบริหารจัดการ กรุณากดยืนยันว่าคุณยังใช้งานบัญชีนี้อยู่
              </p>
            </div>
          </div>

          {/* Countdown & Mandatory Confirmation Action */}
          <div className="p-3.5 bg-black/25 rounded-2xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-extrabold text-amber-200 flex items-center gap-1.5 text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-amber-300" />
                <span>⏳ เหลือเวลากดยืนยันอีก: <strong className="text-white text-sm sm:text-base underline">{currentAccountDaysRemaining} วัน</strong></span>
              </div>
              <p className="text-[11px] text-amber-100/90 leading-tight">
                * หากไม่มีการกดยืนยันภายใน 30 วัน บัญชีนี้จะถูกลบออกจากระบบโดยอัตโนมัติ
              </p>
            </div>

            {/* The Confirmation Button */}
            <button
              onClick={() => confirmActiveStatus()}
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-emerald-50 active:scale-95 text-emerald-800 rounded-xl font-black text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>ยืนยันว่ายังมีการใช้งาน (รักษาสถานะ)</span>
            </button>
          </div>
        </div>
      )}

      {/* Real Account Status Bar: แสดงเฉพาะ Admin หรือ บัญชีที่ได้รับการแจ้งเตือนเหลือเวลา 30 วัน */}
      {(isAdmin || isCurrentAccountInactiveWarning) && (
        <div className="p-3 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between text-xs text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isCurrentAccountInactiveWarning ? 'bg-amber-500 animate-bounce' : 'bg-emerald-500 animate-pulse'} shrink-0`} />
            <span className="text-xs">
              สถานะการใช้งานบัญชี: <strong className={isCurrentAccountInactiveWarning ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                {isCurrentAccountInactiveWarning
                  ? `⚠️ แจ้งเตือนไม่เคลื่อนไหวเกิน 3 เดือน (เหลือเวลา ${currentAccountDaysRemaining} วัน)`
                  : '🟢 บัญชีปกติ (Active - มีการเข้าใช้งานและเคลื่อนไหวสม่ำเสมอ)'}
              </strong>
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
            ระบบความปลอดภัย LocalHub
          </div>
        </div>
      )}

      {/* 1. Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.displayName || 'Avatar'}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl object-cover ring-4 ring-emerald-500/20 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-sm" title="ยืนยันตัวตนแล้ว">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {currentUser.displayName || 'อิศราวัฒน์ ปวินทกานต์'}
                </h1>
                {isAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black border border-red-200 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-600" />
                    <span>แอดมิน (Admin)</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    สมาชิกชุมชน
                  </span>
                )}
                {currentUser.isProfilePrivate ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>โปรไฟล์ส่วนตัว</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-600" />
                    <span>โปรไฟล์สาธารณะ</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500">{currentUser.email}</p>

              {/* Bio / About: แสดงแบบเต็ม ไม่ตัดบรรทัด อนุญาตไม่เกิน 250 ตัวอักษร */}
              <div className="pt-1.5">
                {isEditingBio ? (
                  <div className="space-y-1.5 pt-1 max-w-md">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span>แก้ไขข้อความแนะนำตัว:</span>
                      <span className={userBio.length > 230 ? 'text-rose-500 font-bold' : 'text-slate-400'}>
                        {userBio.length}/250 ตัวอักษร
                      </span>
                    </div>
                    <textarea
                      maxLength={250}
                      rows={3}
                      value={userBio}
                      onChange={(e) => setUserBio(e.target.value)}
                      placeholder="เขียนข้อความแนะนำตัวของคุณ (ไม่เกิน 250 ตัวอักษร)..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none bg-white"
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setIsEditingBio(false)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition"
                      >
                        ยกเลิก
                      </button>
                      <button
                        onClick={() => {
                          updateUserProfile({ bio: userBio });
                          setIsEditingBio(false);
                          showToast('บันทึกข้อความแนะนำตัวเรียบร้อยแล้ว', 'success');
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-xs"
                      >
                        บันทึก Bio
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 max-w-xl">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span>ข้อความแนะนำตัว (Bio)</span>
                      <button
                        onClick={() => {
                          setUserBio(currentUser.bio || userBio);
                          setIsEditingBio(true);
                        }}
                        className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer font-bold"
                        title="แก้ไขข้อความแนะนำตัว"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>แก้ไข</span>
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap break-words leading-relaxed text-slate-800 font-normal">
                      {currentUser.bio || userBio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: ⚙️ ปุ่มฟันเฟืองข้อมูลส่วนตัว, 💬 Direct Chat & Logout */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
            <button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 border border-slate-200 cursor-pointer shadow-2xs"
              title="ตั้งค่าและเพิ่มเติม/แก้ไขข้อมูลส่วนตัว (ชื่อ นามสกุล อีเมล ที่อยู่ เบอร์โทร ฯลฯ)"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span>แก้ไขข้อมูลส่วนตัว</span>
            </button>

            <button
              onClick={() => openDirectChat()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
              title="เปิดกล่องข้อความสนทนาตัวต่อตัว (1-on-1 Direct Chat)"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>แชทคุยตัวต่อตัว</span>
              {totalUnreadChatCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-emerald-800 text-[10px] font-black animate-pulse">
                  {totalUnreadChatCount}
                </span>
              )}
            </button>

            <button
              onClick={logoutFirebase}
              className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 border border-slate-200"
              title="ออกจากระบบ เพื่อเปลี่ยนเป็นโหมดผู้เยี่ยมชม"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>

        {/* Stat Counters: โพสต์, การแจ้งเหตุ, เพื่อน, อัลบั้ม */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
          <button
            onClick={() => setActiveTabSub('posts')}
            className={`p-2.5 rounded-2xl transition ${
              activeTabSub === 'posts' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <div className="font-black text-base sm:text-lg">{myPosts.length}</div>
            <div className="text-[11px] font-bold">โพสต์ของฉัน</div>
          </button>

          <button
            onClick={() => setActiveTabSub('alerts')}
            className={`p-2.5 rounded-2xl transition ${
              activeTabSub === 'alerts' ? 'bg-rose-50 text-rose-900 border border-rose-200' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <div className="font-black text-base sm:text-lg text-rose-600">{myAlerts.length}</div>
            <div className="text-[11px] font-bold">การแจ้งเหตุ</div>
          </button>

          <button
            onClick={() => setActiveTabSub('friends')}
            className={`p-2.5 rounded-2xl transition ${
              activeTabSub === 'friends' ? 'bg-blue-50 text-blue-900 border border-blue-200' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <div className="font-black text-base sm:text-lg text-blue-600">{friends.length}</div>
            <div className="text-[11px] font-bold">เพื่อนของฉัน</div>
          </button>

          <button
            onClick={() => setActiveTabSub('album')}
            className={`p-2.5 rounded-2xl transition ${
              activeTabSub === 'album' ? 'bg-purple-50 text-purple-900 border border-purple-200' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <div className="font-black text-base sm:text-lg text-purple-600">{myAlbumImages.length}</div>
            <div className="text-[11px] font-bold">อัลบั้มรูปภาพ</div>
          </button>
        </div>
      </div>

      {/* 2. ข้อมูลส่วนตัวของฉันทั้งหมด (แสดงทั้งหมดตามคำสั่ง พร้อมปุ่มเปิด/ปิด สถานะสาธารณะหรือส่วนตัว) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-2xl">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                ข้อมูลส่วนตัวของเจ้าของบัญชี
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser.isProfilePrivate
                  ? '🔒 สถานะ: ข้อมูลส่วนตัว (ซ่อนข้อมูลจากสมาชิกคนอื่น มีเพียงคุณที่เห็น)'
                  : '🌐 สถานะ: ข้อมูลสาธารณะ (เปิดเผยข้อมูลส่วนตัวให้เพื่อนบ้านในพื้นที่มองเห็น)'}
              </p>
            </div>
          </div>

          {/* Privacy Toggle: ส่วนตัว หรือ สาธารณะ */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const nextState = !currentUser.isProfilePrivate;
                updateUserProfile({ isProfilePrivate: nextState });
                showToast(
                  nextState
                    ? '🔒 เปลี่ยนสถานะเป็น: บัญชีส่วนตัว (ซ่อนข้อมูลจากสาธารณะเรียบร้อย)'
                    : '🌐 เปลี่ยนสถานะเป็น: บัญชีสาธารณะ (เปิดเผยข้อมูลต่อสมาชิกในชุมชนเรียบร้อย)',
                  'info'
                );
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer border ${
                currentUser.isProfilePrivate
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
              }`}
              title="คลิกเพื่อสลับระหว่างเปิดเผยสาธารณะ หรือซ่อนเป็นข้อมูลส่วนตัว"
            >
              {currentUser.isProfilePrivate ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>โหมด: ซ่อนเป็นส่วนตัว (Private)</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-emerald-700" />
                  <span>โหมด: เปิดเผยสาธารณะ (Public)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsEditProfileModalOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-200 cursor-pointer"
              title="แก้ไขข้อมูลส่วนตัว"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>แก้ไข</span>
            </button>
          </div>
        </div>

        {/* ข้อมูลส่วนตัวทั้งหมด (แสดงครบทุกฟิลด์) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>ชื่อ - นามสกุล</span>
            </div>
            <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
              {currentUser.firstName || currentUser.lastName
                ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
                : currentUser.displayName}
            </div>
            {currentUser.displayName && (
              <div className="text-[10px] text-slate-500">ชื่อที่แสดง: {currentUser.displayName}</div>
            )}
          </div>

          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>อีเมลประจำบัญชี</span>
            </div>
            <div className="font-semibold text-slate-800 truncate text-xs sm:text-sm">
              {currentUser.email || '-'}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <Phone className="w-3 h-3 text-blue-500" />
              <span>เบอร์โทรศัพท์</span>
            </div>
            <div className="font-semibold text-slate-800 text-xs sm:text-sm">
              {currentUser.phone || 'ยังไม่ได้ระบุ'}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <Phone className="w-3 h-3 text-rose-500" />
              <span>เบอร์โทรติดต่อฉุกเฉิน</span>
            </div>
            <div className="font-semibold text-rose-700 text-xs sm:text-sm">
              {currentUser.emergencyContact || 'ยังไม่ได้ระบุ'}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <Building className="w-3 h-3 text-amber-500" />
              <span>อาชีพ / ความเชี่ยวชาญ</span>
            </div>
            <div className="font-semibold text-slate-800 text-xs sm:text-sm">
              {currentUser.occupation || 'ยังไม่ได้ระบุ'}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1 sm:col-span-2 md:col-span-1">
            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-500" />
              <span>ที่อยู่ / ตำบล / อำเภอ / จังหวัด</span>
            </div>
            <div className="font-semibold text-slate-800 text-xs sm:text-sm leading-snug">
              {[currentUser.address, currentUser.subdistrict, currentUser.district, currentUser.province, currentUser.postalCode].filter(Boolean).join(' ') || 'ยังไม่ได้ระบุ'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Admin Role Switcher (แสดงเฉพาะ Admin เท่านั้น) */}
      {isEligibleAdmin && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-md border-2 border-red-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-600/30 text-red-400 rounded-xl border border-red-500/40">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
              </span>
              <h2 className="font-bold text-sm text-white">ปุ่มสลับสิทธิ์การใช้งาน (Admin Role Switcher)</h2>
              <span className="px-2 py-0.2 bg-red-600 text-white text-[9px] font-black rounded-full">
                ADMIN ONLY
              </span>
            </div>
            <p className="text-xs text-slate-300">
              สลับระหว่าง <strong>ผู้ใช้งานทั่วไป</strong> กับ <strong>แอดมิน</strong> เมื่อเปิดแอดมิน แดชบอร์ดจะปรากฏที่แถบด้านล่าง
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white/10 rounded-2xl shrink-0 self-end sm:self-center">
            <button
              onClick={handleToggleAdminRole}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                !isAdmin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>ผู้ใช้งานทั่วไป</span>
            </button>

            <button
              onClick={handleToggleAdminRole}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isAdmin ? 'bg-red-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>แอดมิน (เปิดแดชบอร์ด)</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Segmented Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-2xl text-xs font-bold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTabSub('posts')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTabSub === 'posts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>ฟีดของฉัน ({myPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTabSub('alerts')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTabSub === 'alerts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>การแจ้งเหตุ ({myAlerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTabSub('friends')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTabSub === 'friends' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>เพื่อน ({friends.length})</span>
        </button>

        <button
          onClick={() => setActiveTabSub('album')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeTabSub === 'album' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
          <span>อัลบั้ม ({myAlbumImages.length})</span>
        </button>
      </div>

      {/* Hidden inputs for Quick Post Camera & Gallery */}
      <input
        ref={quickCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleQuickCameraUpload}
      />
      <input
        ref={quickGalleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleQuickGalleryUpload}
      />

      {/* 5. Tab 1: ข้อมูลเฉพาะบุคคลของเจ้าของบัญชี (โพสต์ส่วนตัว + โพสต์ที่แชร์เท่านั้น) */}
      {activeTabSub === 'posts' && (
        <div className="space-y-3">
          {/* Personal Scope Indicator Banner */}
          <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <p className="font-extrabold text-xs text-emerald-950">
                  หน้าฟีดของฉัน (ข้อมูลเฉพาะบุคคลของ {currentUser.displayName || 'คุณ'})
                </p>
                <p className="text-[11px] text-emerald-800 leading-tight">
                  รวบรวมเฉพาะโพสต์ ภาพถ่าย และการแจ้งเหตุที่คุณสร้าง รวมถึงโพสต์ของคนอื่นที่คุณเลือกแชร์เท่านั้น (ไม่รวมโพสต์เพื่อนหรือการกดไลค์/คอมเมนต์)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white text-emerald-800 border border-emerald-300 shadow-2xs shrink-0 hidden sm:inline">
              🔒 เฉพาะเจ้าของบัญชี
            </span>
          </div>

          {/* Quick Post Box with Camera Shutter & Gallery Upload Buttons */}
          <form onSubmit={handleQuickCreatePost} className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <img
                src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt="user"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-xs font-bold text-slate-700">เขียนเรื่องราวใหม่ในโปรไฟล์ของคุณ</span>
            </div>

            <textarea
              value={quickPostText}
              onChange={(e) => setQuickPostText(e.target.value)}
              placeholder="คุณกำลังคิดอะไรอยู่? แชร์เรื่องราว ข่าวสาร หรือกิจกรรมในชุมชน..."
              rows={2}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition resize-none"
            />

            {/* Attached Thumbnails Preview */}
            {quickPostImages.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="text-[11px] font-bold text-slate-600">รูปภาพที่แนบ ({quickPostImages.length} รูป):</div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {quickPostImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 group">
                      <img src={img} alt={`Attached ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setQuickPostImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-rose-600 text-white rounded-full transition cursor-pointer"
                        title="ลบรูปนี้"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Row: Camera, Gallery & Post Button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {/* ปุ่มเข้ากล้องถ่ายรูป (ปุ่มข้าวกล้อง) */}
                <button
                  type="button"
                  disabled={isProcessingQuickImage}
                  onClick={() => quickCameraInputRef.current?.click()}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  title="เปิดกล้องถ่ายภาพสดทันที"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ถ่ายรูปสด (เข้ากล้อง)</span>
                </button>

                {/* ปุ่มอัปโหลดรูปภาพจากแกลเลอรี */}
                <button
                  type="button"
                  disabled={isProcessingQuickImage}
                  onClick={() => quickGalleryInputRef.current?.click()}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  title="เลือกรูปภาพจากคลังภาพในเครื่อง"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>แกลเลอรี</span>
                </button>

                {isProcessingQuickImage && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                    <span>กำลังประมวลผลภาพ...</span>
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessingQuickImage || (!quickPostText.trim() && quickPostImages.length === 0)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer ${
                  quickPostText.trim() || quickPostImages.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>โพสต์เลย</span>
              </button>
            </div>
          </form>

          {/* Posts List */}
          {myPosts.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-2 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">ยังไม่มีโพสต์ของคุณ</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                เริ่มสร้างโพสต์แรกของคุณเพื่อแบ่งปันเรื่องราวและข่าวสารกับคนในพื้นที่
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.authorAvatar || currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={post.author}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">{post.author}</h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(post.createdAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                        {post.category === 'news' ? 'ข่าวสาร' : post.category === 'help' ? 'ช่วยเหลือ' : 'ทั่วไป'}
                      </span>
                      {/* ปุ่มจุด 3 จุดสำหรับแสดงข้อมูลและลบโพสต์ในหน้าฉัน */}
                      <PostActionMenu post={post} />
                    </div>
                  </div>

                  <div>
                    {post.sharedFrom ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                          <Share2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>🔁 คุณแชร์โพสต์นี้: {post.content}</span>
                        </div>
                        {/* Original Post Embedded Container */}
                        <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <img
                              src={post.sharedFrom.originalAuthorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                              alt={post.sharedFrom.originalAuthor}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="font-bold text-xs text-slate-800">{post.sharedFrom.originalAuthor}</span>
                          </div>
                          <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">{post.sharedFrom.originalTitle}</h5>
                          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{post.sharedFrom.originalContent}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h5 className="font-extrabold text-sm text-slate-900 leading-snug">{post.title}</h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      </>
                    )}
                  </div>

                  {/* Images if any */}
                  {Array.isArray(post.images) && post.images.length > 0 && (
                    <div className="pt-2">
                      <PostImageGallery
                        images={post.images}
                        maxDisplay={4}
                        onImageClick={(img) => setPreviewImageModal(img)}
                      />
                    </div>
                  )}

                  {/* Post Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-slate-600 font-semibold">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>{post.likes}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 font-semibold">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                        <span>{post.comments ? post.comments.length : 0}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => openPostDetail(post.id)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition"
                    >
                      เปิดอ่านโพสต์
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: การแจ้งเหตุของผู้ใช้งานคนนี้ (My Incidents) */}
      {activeTabSub === 'alerts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 px-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">
              ประวัติการแจ้งเหตุด่วนและภัยพิบัติที่คุณเป็นเจ้าของ
            </h3>
            <button
              onClick={() => setActiveTab('alerts')}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>แจ้งเหตุใหม่</span>
            </button>
          </div>

          {myAlerts.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-2 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">ยังไม่มีประวัติการแจ้งเหตุของคุณ</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                เมื่อคุณแจ้งเหตุน้ำท่วม อุบัติเหตุ หรือภัยพิบัติในพื้นที่ รายการเหตุการณ์จะแสดงที่นี่
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-700 text-[10px] font-black uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{alert.type}</span>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.createdAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                      {/* ปุ่มจุด 3 จุดแสดงข้อมูลและลบการแจ้งเหตุในหน้าฉัน */}
                      <PostActionMenu
                        post={{
                          id: alert.id,
                          title: alert.title,
                          content: alert.description,
                          author: typeof alert.reporter === 'string' ? alert.reporter : 'คุณ',
                          category: 'alert',
                          createdAt: alert.createdAt
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{alert.title}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{alert.district || alert.province}</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {alert.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ยืนยันเหตุจริงแล้ว {alert.verifiedCount || 1} คน</span>
                    </span>

                    <button
                      onClick={() => setActiveTab('alerts')}
                      className="px-3 py-1 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition"
                    >
                      ดูในศูนย์เตือนภัย
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: เพื่อนของผู้ใช้งาน (My Friends) */}
      {activeTabSub === 'friends' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">
              รายชื่อเพื่อนในเครือข่ายชุมชน ({friends.length} คน)
            </h3>

            <input
              type="text"
              value={friendSearchQuery}
              onChange={(e) => setFriendSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อเพื่อน หรือจังหวัด..."
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          {filteredFriends.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-2 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">ไม่พบรายชื่อเพื่อน</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                ไปที่หน้าฟีดชุมชนเพื่อกดเพิ่มเพื่อนจากโพสต์ของคนในพื้นที่ได้ตลอดเวลา
              </p>
              <button
                onClick={() => setActiveTab('feed')}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                ไปที่ฟีดชุมชน
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={friend.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={friend.name}
                      className="w-11 h-11 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{friend.name}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{friend.district ? `${friend.district}, ` : ''}{friend.province || 'กรุงเทพมหานคร'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons on Friend: 💬 Direct Chat & Remove */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        openDirectChat({
                          id: friend.id,
                          name: friend.name,
                          avatar: friend.avatar,
                          province: friend.province,
                          district: friend.district,
                          isOnline: true
                        });
                      }}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95 border border-emerald-200 cursor-pointer"
                      title={`แชทคุยตัวต่อตัวกับ ${friend.name}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>แชท</span>
                    </button>

                    <button
                      onClick={() => {
                        removeFriend(friend.id);
                        showToast(`ลบ ${friend.name} ออกจากเพื่อนแล้ว`, 'info');
                      }}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition shrink-0 active:scale-95"
                      title="ลบเพื่อน"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. Tab 4: อัลบั้มรูปภาพของผู้ใช้งาน (My Album) */}
      {activeTabSub === 'album' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 px-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">
              คลังภาพและอัลบั้มที่คุณบันทึกไว้ในระบบ ({myAlbumImages.length} รูป)
            </h3>
            <span className="text-[11px] text-slate-400">แตะที่รูปเพื่อดูขนาดเต็ม</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {myAlbumImages.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setPreviewImageModal(item.url)}
                className="group relative h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-end text-white">
                  <p className="text-[11px] font-bold line-clamp-1">{item.title}</p>
                  <span className="text-[9px] text-slate-300 uppercase">{item.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setPreviewImageModal(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageModal}
              alt="preview"
              className="w-full max-h-[82vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* Modal แก้ไขและเพิ่มเติมข้อมูลส่วนตัวของเจ้าของบัญชี */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />
    </div>
  );
};
