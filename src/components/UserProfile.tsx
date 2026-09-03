import React, { useState } from 'react';
import { 
  Settings, 
  FileText, 
  Store, 
  Bookmark, 
  MapPin, 
  AlertTriangle, 
  Shield, 
  ShieldCheck,
  Award, 
  Edit3,
  CheckCircle2,
  UserPlus,
  LogIn,
  LogOut,
  Megaphone,
  PlusCircle,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  Check,
  Database,
  Activity,
  Server,
  Video as VideoIcon
} from 'lucide-react';
import { useBroadcast } from '../context/BroadcastContext';
import { useCommunity } from '../context/CommunityContext';
import { SettingsModal } from './modals/SettingsModal';
import { EditProfileModal } from './modals/EditProfileModal';
import { IdVerificationModal } from './modals/IdVerificationModal';
import { LocationPickerModal } from './modals/LocationPickerModal';
import { CreatePostModal } from './modals/CreatePostModal';
import { PostDetailCommentsModal } from './modals/PostDetailCommentsModal';
import { AddProductModal } from './modals/AddProductModal';
import { ProductDetailModal } from './modals/ProductDetailModal';
import { PrivacyPolicyModal } from './modals/PrivacyPolicyModal';
import { LocalHubLogo } from './LocalHubLogo';
import { PostCard } from './PostCard';
import { SafeImage } from './SafeImage';
import { Post, Product, Alert } from '../types';
import { isAuthorizedAdminEmail } from '../lib/firebase';

type PersonalFeedTab = 'posts' | 'store' | 'saved' | 'alerts';

export function UserProfile() {
  const { 
    role, 
    setRole, 
    setOpenAdminModal, 
    activeBroadcast, 
    deviceRemainingSeconds 
  } = useBroadcast();

  const { 
    isLoggedIn,
    userProfile, 
    location, 
    posts, 
    products, 
    alerts, 
    contactRequests,
    userSessions,
    isFirestoreConnected,
    toggleLikePost,
    deletePost,
    setActiveTab, 
    openAuthModal,
    openContactAdminModal,
    logout,
    showToast 
  } = useCommunity();

  // Modals state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);

  // Personal Feed sub-tab state
  const [feedTab, setFeedTab] = useState<PersonalFeedTab>('posts');

  const isAuthorizedAdmin = isLoggedIn && isAuthorizedAdminEmail(userProfile?.email);
  const isRealAdmin = isAuthorizedAdmin && role === 'admin';

  // Filter user specific content
  const myPosts = posts.filter(p => p.author.name === userProfile.name);
  const myProducts = products.filter(p => p.seller === userProfile.name);
  // User's alerts (matching user's district or recent activity)
  const myAlerts = alerts.filter(a => a.userVoted !== undefined || a.location.subdistrict === location.subdistrict);
  // Saved posts/items (demonstrated with liked or bookmarked posts)
  const savedPosts = posts.filter(p => p.isLiked);

  // Sync active modal post if open
  const activeModalPost = selectedPostForComments 
    ? posts.find(p => p.id === selectedPostForComments.id) || selectedPostForComments
    : null;

  // 5 Top Action Buttons (Ordered strictly as requested: ติดต่อแอดมิน, ร้านของฉัน, บันทึก, พื้นที่ติดตาม, เหตุการณ์รายงาน)
  const topActionButtons = [
    {
      id: 'contact_admin',
      label: 'ติดต่อแอดมิน',
      sublabel: 'ขอประชาสัมพันธ์',
      icon: Megaphone,
      count: contactRequests.length,
      badgeColor: 'bg-indigo-100 text-indigo-800',
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      hoverBorder: 'hover:border-indigo-300',
      onClick: () => {
        openContactAdminModal('pr_request');
      }
    },
    {
      id: 'my_store',
      label: 'ร้านของฉัน',
      sublabel: 'สินค้าที่ลงขาย',
      icon: Store,
      count: myProducts.length,
      badgeColor: 'bg-amber-100 text-amber-800',
      iconColor: 'text-amber-600 bg-amber-50 border-amber-100',
      hoverBorder: 'hover:border-amber-300',
      onClick: () => {
        setFeedTab('store');
        showToast(`กำลังเปิดร้านค้าและสินค้าของคุณ (${myProducts.length} รายการ)`);
      }
    },
    {
      id: 'saved_items',
      label: 'บันทึก',
      sublabel: 'รายการที่เซฟไว้',
      icon: Bookmark,
      count: savedPosts.length,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      hoverBorder: 'hover:border-emerald-300',
      onClick: () => {
        setFeedTab('saved');
        showToast(`แสดงรายการที่คุณบันทึกและกดใจไว้ (${savedPosts.length} รายการ)`);
      }
    },
    {
      id: 'tracked_locations',
      label: 'พื้นที่ติดตาม',
      sublabel: `ต.${location.subdistrict}`,
      icon: MapPin,
      count: 1,
      badgeColor: 'bg-sky-100 text-sky-800',
      iconColor: 'text-sky-600 bg-sky-50 border-sky-100',
      hoverBorder: 'hover:border-sky-300',
      onClick: () => {
        setShowLocationModal(true);
      }
    },
    {
      id: 'incident_reports',
      label: 'เหตุการณ์รายงาน',
      sublabel: 'เหตุด่วนและแจ้งเตือน',
      icon: AlertTriangle,
      count: alerts.length,
      badgeColor: 'bg-rose-100 text-rose-800',
      iconColor: 'text-rose-600 bg-rose-50 border-rose-100',
      hoverBorder: 'hover:border-rose-300',
      onClick: () => {
        setFeedTab('alerts');
        showToast(`แสดงรายงานเหตุการณ์ในพื้นที่ (${alerts.length} เหตุการณ์)`);
      }
    }
  ];

  return (
    <div className="pb-28 pt-2 animate-in fade-in duration-300 bg-slate-50/60 min-h-screen">
      
      {/* Profile Header or Guest Welcome */}
      {!isLoggedIn ? (
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white px-4 pt-6 pb-6 shadow-lg rounded-b-[32px] border-b border-slate-800">
          <div className="flex justify-between items-center mb-3.5 pb-2.5 border-b border-slate-800/80">
            <LocalHubLogo size="sm" variant="light" showSubtitle={false} />
            <button 
              onClick={() => setShowSettingsModal(true)}
              title="ตั้งค่า"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Settings size={17} />
            </button>
          </div>

          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white mx-auto flex items-center justify-center shadow-md shadow-emerald-500/25 mb-2.5 border-2 border-white/20">
              <UserPlus size={24} />
            </div>
            <h2 className="text-[17px] font-extrabold tracking-tight text-white mb-1">
              เข้าสู่ระบบ / ลงทะเบียนสมาชิก
            </h2>
            <p className="text-[12px] text-slate-300 font-medium max-w-xs mx-auto mb-4 leading-relaxed">
              ร่วมเป็นส่วนหนึ่งของชุมชน {location.district} เพื่อโพสต์ข่าวสาร จัดการร้านค้าส่วนตัว และติดตามเหตุการณ์ในพื้นที่
            </p>

            <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
              <button
                onClick={() => openAuthModal('register')}
                className="py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-[12.5px] font-extrabold shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-emerald-400/30"
              >
                <UserPlus size={15} />
                ลงทะเบียนใหม่
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700 text-slate-100 rounded-xl text-[12.5px] font-extrabold border border-slate-700 shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <LogIn size={15} />
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/95 backdrop-blur-xl px-4 pt-5 pb-4.5 shadow-sm border-b border-slate-200/80 rounded-b-[32px]">
          <div className="flex justify-between items-center mb-3.5 pb-2.5 border-b border-slate-100">
            <LocalHubLogo size="sm" variant="dark" showSubtitle={false} />
            <div className="flex items-center gap-1.5">
              <span className={`text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-xs ${
                isRealAdmin 
                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {isRealAdmin ? '👑 แอดมิน' : '👤 สมาชิก'}
              </span>
              <button 
                onClick={() => setShowSettingsModal(true)}
                title="ตั้งค่า"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Settings size={17} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer shrink-0" onClick={() => setShowEditProfileModal(true)}>
              <img 
                src={userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                alt="Profile" 
                className="w-13 h-13 rounded-2xl object-cover ring-3 ring-slate-100 shadow-sm group-hover:scale-105 transition-transform" 
              />
              <div className={`absolute -bottom-1 -right-1 text-white p-1 rounded-lg border-2 border-white shadow-sm ${
                isRealAdmin ? 'bg-rose-600' : 'bg-emerald-600'
              }`}>
                <Shield size={10} strokeWidth={3} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-[15.5px] font-extrabold text-slate-900 tracking-tight truncate">
                  {isRealAdmin ? 'แอดมินศูนย์ควบคุมชุมชน' : userProfile.name}
                </h2>
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="text-slate-400 hover:text-emerald-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                  title="แก้ไขข้อมูลโปรไฟล์"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <p className="text-[11.5px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin size={12} className="text-emerald-600 shrink-0" />
                <span className="truncate">{userProfile.address || `ต.${location.subdistrict}, ${location.district}`}</span>
              </p>

              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold border border-emerald-100">
                  <Award size={12} className="text-amber-500" /> 
                  {isRealAdmin ? 'ผู้ดูแลระบบสูงสุด' : `คะแนนชุมชน: ${userProfile.reputationScore}`}
                </span>

                {userProfile.isVerified && (
                  <span className="inline-flex items-center gap-0.5 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-sky-100">
                    <CheckCircle2 size={10} className="text-sky-600" />
                    ยืนยันแล้ว
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Role switcher toggle if admin */}
          {isAuthorizedAdmin && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-500">โหมดสิทธิ์ใช้งาน:</span>
              <button
                onClick={() => {
                  if (role === 'admin') {
                    setRole('user');
                    showToast('สลับเข้าสู่มุมมองจำลองของลูกบ้าน (Resident View)', 'info');
                  } else {
                    setRole('admin');
                    showToast('สลับเข้าสู่โหมดผู้ดูแลระบบ', 'success');
                  }
                }}
                className={`px-2.5 py-0.5 rounded-xl font-extrabold border transition-all text-[10.5px] ${
                  role === 'admin' 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {role === 'admin' ? '👑 โหมดแอดมิน (คลิกดูมุมมองลูกบ้าน)' : '👤 สมาชิก (คลิกเปิดโหมดแอดมิน)'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TOP ACTION BUTTONS BAR (เรียงกันด้านบนฟีดจากซ้ายไปขวา: ติดต่อแอดมิน, ร้านของฉัน, บันทึก, พื้นที่ติดตาม, เหตุการณ์รายงาน) */}
      <div className="px-3.5 mt-3.5">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-[12px] font-extrabold text-slate-700 tracking-tight flex items-center gap-1.5">
            <Sparkles size={13} className="text-emerald-600" />
            เมนูการจัดการและพื้นที่ของคุณ
          </h3>
          <span className="text-[10.5px] font-semibold text-slate-400">5 รายการด่วน</span>
        </div>

        {/* Compact, clean 5-button grid with clear numbers and symbols without overlap */}
        <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs">
          {topActionButtons.map((btn) => {
            const Icon = btn.icon;
            const isCurrentlyActive = 
              (btn.id === 'my_store' && feedTab === 'store') ||
              (btn.id === 'saved_items' && feedTab === 'saved') ||
              (btn.id === 'incident_reports' && feedTab === 'alerts');

            return (
              <button
                key={btn.id}
                onClick={btn.onClick}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all active:scale-95 text-center relative group min-w-0 ${
                  isCurrentlyActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : `bg-slate-50/70 hover:bg-slate-100/80 text-slate-700 border border-slate-200/60 ${btn.hoverBorder}`
                }`}
              >
                {/* Badge Count if > 0 */}
                {btn.count > 0 && (
                  <span className={`absolute -top-1 -right-1 text-[9px] font-black min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center border shadow-xs z-10 ${
                    isCurrentlyActive ? 'bg-emerald-500 text-white border-white' : btn.badgeColor
                  }`}>
                    {btn.count}
                  </span>
                )}

                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 transition-colors shrink-0 ${
                  isCurrentlyActive 
                    ? 'bg-white/15 text-white' 
                    : btn.iconColor
                }`}>
                  <Icon size={16} strokeWidth={2.4} />
                </div>

                <span className={`text-[10px] font-extrabold leading-tight block w-full truncate text-center ${
                  isCurrentlyActive ? 'text-white' : 'text-slate-800'
                }`}>
                  {btn.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* USER'S PERSONAL FEED SECTION (หน้าฟีดส่วนตัวของ User) */}
      <div className="px-3.5 mt-4 max-w-md mx-auto space-y-3.5">
        
        {/* Feed Header and Sub-Tab Filter Pills */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText size={15} />
              </div>
              <div>
                <h3 className="text-[14px] font-black text-slate-900 tracking-tight leading-none">
                  ฟีดส่วนตัวของฉัน
                </h3>
                <p className="text-[10.5px] font-semibold text-slate-400 mt-0.5">
                  {userProfile.name} • ต.{location.subdistrict}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreatePostModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition-all active:scale-95"
            >
              <PlusCircle size={13} />
              <span>โพสต์ใหม่</span>
            </button>
          </div>

          {/* Quick Create Post Bar */}
          <div 
            onClick={() => setShowCreatePostModal(true)}
            className="flex gap-2 items-center bg-slate-50 hover:bg-slate-100 p-2 rounded-xl border border-slate-200/80 transition-all cursor-pointer group mb-3"
          >
            <img 
              src={userProfile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
              alt="Me" 
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/20 shrink-0" 
            />
            <div className="flex-1 text-slate-400 group-hover:text-slate-600 text-[11.5px] font-medium truncate">
              แชร์เรื่องราวหรืออัปเดตในฟีดส่วนตัวของคุณ...
            </div>
            <div className="w-6 h-6 rounded-md bg-white group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 flex items-center justify-center transition-colors border border-slate-200/60 shrink-0">
              <ImageIcon size={13} />
            </div>
          </div>

          {/* Feed Filter Sub-Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setFeedTab('posts')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10.5px] font-extrabold transition-all flex items-center justify-center gap-1 whitespace-nowrap min-w-0 ${
                feedTab === 'posts'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>โพสต์</span>
              <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${feedTab === 'posts' ? 'bg-slate-150 text-slate-700' : 'bg-slate-200/60 text-slate-500'}`}>
                {myPosts.length}
              </span>
            </button>

            <button
              onClick={() => setFeedTab('store')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10.5px] font-extrabold transition-all flex items-center justify-center gap-1 whitespace-nowrap min-w-0 ${
                feedTab === 'store'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>ร้านค้า</span>
              <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${feedTab === 'store' ? 'bg-slate-150 text-slate-700' : 'bg-slate-200/60 text-slate-500'}`}>
                {myProducts.length}
              </span>
            </button>

            <button
              onClick={() => setFeedTab('alerts')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10.5px] font-extrabold transition-all flex items-center justify-center gap-1 whitespace-nowrap min-w-0 ${
                feedTab === 'alerts'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>เหตุด่วน</span>
              <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${feedTab === 'alerts' ? 'bg-slate-150 text-slate-700' : 'bg-slate-200/60 text-slate-500'}`}>
                {myAlerts.length}
              </span>
            </button>

            <button
              onClick={() => setFeedTab('saved')}
              className={`flex-1 py-1.5 px-1.5 rounded-lg text-[10.5px] font-extrabold transition-all flex items-center justify-center gap-1 whitespace-nowrap min-w-0 ${
                feedTab === 'saved'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>บันทึก</span>
              <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${feedTab === 'saved' ? 'bg-slate-150 text-slate-700' : 'bg-slate-200/60 text-slate-500'}`}>
                {savedPosts.length}
              </span>
            </button>
          </div>
        </div>

        {/* FEED CONTENT STREAM */}

        {/* TAB 1: User's Posts Feed */}
        {feedTab === 'posts' && (
          <div className="space-y-3.5">
            {myPosts.length === 0 ? (
              <div className="bg-white p-8 rounded-[28px] text-center border border-slate-200/90 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                  <FileText size={26} />
                </div>
                <h4 className="text-[15px] font-extrabold text-slate-800 mb-1">ยังไม่มีโพสต์ในฟีดของคุณ</h4>
                <p className="text-[12px] text-slate-500 max-w-xs mx-auto mb-4 leading-relaxed">
                  เริ่มแชร์เรื่องราว ข่าวสาร หรือตามหาของในพื้นที่ ต.{location.subdistrict} กับเพื่อนบ้านกันเลย
                </p>
                <button
                  onClick={() => setShowCreatePostModal(true)}
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[12.5px] font-extrabold shadow-md shadow-emerald-600/20 inline-flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <PlusCircle size={15} />
                  สร้างโพสต์แรกของคุณ
                </button>
              </div>
            ) : (
              myPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  isMyPost={true}
                  onLike={() => toggleLikePost(post.id)}
                  onOpenComments={() => setSelectedPostForComments(post)}
                  onDelete={() => deletePost(post.id)}
                />
              ))
            )}
          </div>
        )}

        {/* TAB 2: User's Store / Products */}
        {feedTab === 'store' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[12.5px] font-extrabold text-slate-800">
                สินค้าที่ลงขาย ({myProducts.length} รายการ)
              </span>
              <button
                onClick={() => {
                  if (userProfile.isVerified) {
                    setShowAddProductModal(true);
                  } else {
                    showToast('กรุณายืนยันตัวตนก่อนลงขายสินค้า', 'error');
                  }
                }}
                className="text-[11.5px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <PlusCircle size={14} />
                ลงขายสินค้าใหม่
              </button>
            </div>

            {myProducts.length === 0 ? (
              <div className="bg-white p-8 rounded-[28px] text-center border border-slate-200/90 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
                  <Store size={26} />
                </div>
                <h4 className="text-[15px] font-extrabold text-slate-800 mb-1">ยังไม่มีสินค้าในร้านของคุณ</h4>
                <p className="text-[12px] text-slate-500 max-w-xs mx-auto mb-4 leading-relaxed">
                  นำของมือสอง ผลผลิตการเกษตร อาหาร หรือบริการในพื้นที่มาลงขายสร้างรายได้ได้ทันที
                </p>
                <button
                  onClick={() => {
                    if (userProfile.isVerified) {
                      setShowAddProductModal(true);
                    } else {
                      showToast('กรุณายืนยันตัวตนก่อนลงขายสินค้า', 'error');
                    }
                  }}
                  className="py-2.5 px-5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-[12.5px] font-extrabold shadow-md shadow-amber-600/20 inline-flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <PlusCircle size={15} />
                  ลงขายสินค้าชิ้นแรก
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {myProducts.map(product => (
                  <div 
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer"
                  >
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      <SafeImage
                        src={product.image}
                        alt={product.title}
                        category={product.category}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-extrabold text-slate-900 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md shadow-sm pointer-events-none z-10">
                        {product.category}
                      </span>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-[13px] text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                          {product.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 line-clamp-1">
                          {product.locationName}
                        </p>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="text-[13.5px] font-black text-emerald-700">
                          ฿{product.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          สินค้าของฉัน
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Incident Reports / Alerts */}
        {feedTab === 'alerts' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[12.5px] font-extrabold text-slate-800">
                เหตุการณ์และแจ้งเตือนในพื้นที่ ({alerts.length})
              </span>
              <button
                onClick={() => {
                  setActiveTab('home');
                  showToast('เปิดหน้าแรกเพื่อดูแผนที่เหตุการณ์');
                }}
                className="text-[11.5px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <span>ดูแผนที่เตือนภัย</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="bg-white p-8 rounded-[28px] text-center border border-slate-200/90 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
                  <AlertTriangle size={26} />
                </div>
                <h4 className="text-[15px] font-extrabold text-slate-800 mb-1">ไม่มีรายงานเหตุด่วน</h4>
                <p className="text-[12px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  พื้นที่ของคุณอยู่ในสภาวะปกติ ปลอดภัย ไม่มีเหตุฉุกเฉิน
                </p>
              </div>
            ) : (
              alerts.map(alert => (
                <div 
                  key={alert.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm hover:border-rose-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        alert.type === 'accident' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : alert.type === 'disaster'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {alert.type === 'accident' ? '🚨 อุบัติเหตุ' : alert.type === 'disaster' ? '🌊 ภัยธรรมชาติ' : '📢 แจ้งเตือน'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {alert.time}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <MapPin size={11} className="text-rose-500" />
                      ต.{alert.location.subdistrict}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-[13.5px] text-slate-900 mb-1 leading-snug">
                    {alert.title}
                  </h4>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>ยืนยันแล้ว {alert.confirmations} คน</span>
                    <span className="text-emerald-600 font-extrabold">
                      {alert.status === 'active' ? '● กำลังเกิดเหตุ' : '✓ คลี่คลายแล้ว'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: Saved / Bookmarks */}
        {feedTab === 'saved' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[12.5px] font-extrabold text-slate-800">
                โพสต์และประกาศที่บันทึกไว้ ({savedPosts.length})
              </span>
            </div>

            {savedPosts.length === 0 ? (
              <div className="bg-white p-8 rounded-[28px] text-center border border-slate-200/90 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                  <Bookmark size={26} />
                </div>
                <h4 className="text-[15px] font-extrabold text-slate-800 mb-1">ยังไม่มีรายการที่บันทึกไว้</h4>
                <p className="text-[12px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  กดหัวใจหรือบันทึกโพสต์ที่คุณสนใจในชุมชนเพื่อกลับมาอ่านได้ที่นี่ตลอดเวลา
                </p>
              </div>
            ) : (
              savedPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  isMyPost={post.author.name === userProfile.name}
                  onLike={() => toggleLikePost(post.id)}
                  onOpenComments={() => setSelectedPostForComments(post)}
                  onDelete={() => deletePost(post.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Verify Identity Banner */}
        <div className="mt-6">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[28px] p-5 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
               <Shield size={130} />
            </div>
            <h3 className="font-extrabold text-[15px] mb-1 relative z-10 flex items-center gap-2">
              <Shield size={18} />
              {userProfile.isVerified ? 'ยืนยันตัวตนในพื้นที่เรียบร้อยแล้ว' : 'ยืนยันตัวตนในพื้นที่'}
            </h3>
            <p className="text-[12px] font-medium text-emerald-50/90 mb-4 relative z-10 leading-relaxed max-w-[85%]">
              {userProfile.isVerified 
                ? 'คุณได้รับตราสัญลักษณ์สมาชิกที่ยืนยันแล้ว สามารถซื้อขายและรายงานเหตุด้วยความน่าเชื่อถือสูงสุด'
                : 'ยืนยันตัวตนด้วยบัตรประชาชนเพื่อรับป้าย "สมาชิกที่ยืนยันแล้ว" เพิ่มความน่าเชื่อถือ'}
            </p>
            <button 
              onClick={() => setShowVerificationModal(true)}
              className="bg-white text-emerald-800 text-[12.5px] font-extrabold px-5 py-2.5 rounded-2xl relative z-10 hover:bg-emerald-50 transition-all shadow-md active:scale-95"
            >
              {userProfile.isVerified ? 'ดูสถานะการยืนยันตัวตน' : 'เริ่มยืนยันตัวตน'}
            </button>
          </div>
        </div>

        {/* Logout Button */}
        {isLoggedIn && (
          <div className="pt-2">
            <button
              onClick={logout}
              className="w-full py-3 px-4 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200/90 hover:border-rose-200 rounded-2xl text-[13px] font-extrabold transition-all flex items-center justify-center gap-2 shadow-xs"
              title="ออกจากระบบ"
            >
              <LogOut size={16} />
              ออกจากระบบ
            </button>
          </div>
        )}

        {/* Legal & Privacy Policy Link */}
        <div className="pt-2 pb-1 text-center">
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="text-[11.5px] font-bold text-slate-400 hover:text-emerald-700 inline-flex items-center gap-1 transition-colors"
          >
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>นโยบายความเป็นส่วนตัว (Privacy Policy)</span>
          </button>
        </div>

      </div>

      {/* Modals */}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
      <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      {showEditProfileModal && <EditProfileModal onClose={() => setShowEditProfileModal(false)} />}
      {showVerificationModal && <IdVerificationModal onClose={() => setShowVerificationModal(false)} />}
      {showLocationModal && <LocationPickerModal onClose={() => setShowLocationModal(false)} />}
      {showCreatePostModal && <CreatePostModal onClose={() => setShowCreatePostModal(false)} />}
      {showAddProductModal && <AddProductModal onClose={() => setShowAddProductModal(false)} />}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {activeModalPost && (
        <PostDetailCommentsModal 
          post={activeModalPost} 
          onClose={() => setSelectedPostForComments(null)} 
        />
      )}

    </div>
  );
}
