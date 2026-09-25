import React, { useState } from 'react';
import { 
  MapPin, 
  MessageCircle, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Copy, 
  Trash2, 
  Check, 
  Compass, 
  Navigation, 
  Utensils, 
  Store, 
  Coffee, 
  Trees, 
  Building2, ShieldCheck, Pin
} from 'lucide-react';
import { Post } from '../types';
import { useCommunity } from '../context/CommunityContext';
import { useBroadcast } from '../context/BroadcastContext';
import { calculateDistance } from '../lib/distance';
import { isAuthorizedAdminEmail } from '../lib/firebase';
import { SafeImage } from './SafeImage';

export interface PostCardProps {
  key?: React.Key;
  post: Post;
  isMyPost?: boolean;
  onLike: () => void;
  onOpenComments: () => void;
  onDelete?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  isMyPost,
  onLike, 
  onOpenComments, 
  onDelete 
}) => {
  const { showToast, openMediaViewer, jumpToMapLocation, location, openPublicProfile, userProfile, isLoggedIn, togglePinPost } = useCommunity();
  const { role } = useBroadcast();
  
  const displayDistance = React.useMemo(() => {
    if (location?.latitude && location?.longitude && post.location?.latitude && post.location?.longitude) {
      return calculateDistance(location.latitude, location.longitude, post.location.latitude, post.location.longitude);
    }
    return post.location?.distance ? `${post.location.distance} กม.` : '';
  }, [location, post.location]);
  const [showMenu, setShowMenu] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const isRealAdmin = isLoggedIn && role === 'admin' && isAuthorizedAdminEmail(userProfile?.email);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    showToast('🔗 คัดลอกลิงก์โพสต์เรียบร้อยแล้ว');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyText = () => {
    navigator.clipboard?.writeText(post.content);
    showToast('คัดลอกข้อความโพสต์แล้ว');
    setShowMenu(false);
  };

  const handleViewOnMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.checkIn) {
      jumpToMapLocation(
        post.checkIn.latitude, 
        post.checkIn.longitude, 
        16, 
        post.checkIn.placeName
      );
    } else if (post.location.latitude && post.location.longitude) {
      jumpToMapLocation(
        post.location.latitude,
        post.location.longitude,
        15,
        `ต.${post.location.subdistrict}`
      );
    }
  };

  const getCheckInIcon = (cat?: string) => {
    switch (cat) {
      case 'restaurant': return { icon: Utensils, label: 'อาหาร/ของกิน', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'cafe': return { icon: Coffee, label: 'คาเฟ่/เครื่องดื่ม', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'shop': return { icon: Store, label: 'ร้านค้า/ตลาด', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'landmark': return { icon: Trees, label: 'ท่องเที่ยว/พักผ่อน', color: 'bg-teal-100 text-teal-800 border-teal-200' };
      case 'building': return { icon: Building2, ShieldCheck, label: 'ที่พัก/ชุมชน', color: 'bg-sky-100 text-sky-800 border-sky-200' };
      default: return { icon: MapPin, label: 'เช็คอินสถานที่', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    }
  };

  return (
    <div className={`bg-white rounded-[26px] p-5 border shadow-[0_4px_24px_-4px_rgba(0,0,0,0.03)] hover:shadow-md transition-all relative ${
      post.category === 'แจ้งเหตุฉุกเฉิน' ? 'border-rose-300 bg-rose-50/30' : 
      post.isPinned ? 'border-amber-300 bg-amber-50/30 shadow-[0_4px_24px_-4px_rgba(251,191,36,0.15)]' : 'border-slate-200/80'
    }`}>
      {post.isPinned && (
        <div className="absolute -top-3 -right-2 bg-gradient-to-br from-amber-400 to-amber-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md border border-amber-300/50 flex items-center gap-1 z-10 animate-fade-in">
          <Pin size={12} className="fill-amber-100" /> ปักหมุดประกาศ
        </div>
      )}
      {/* Author Header */}
      <div className="flex justify-between items-start mb-3">
        <div 
          className="flex gap-3 cursor-pointer hover:bg-slate-50 p-1.5 -ml-1.5 rounded-xl transition-colors"
          onClick={() => {
            let targetUid = post.authorUid;
            if (!targetUid) {
              if (post.author?.name === 'สมชาย รักดี') targetUid = 'user_default_somchai';
              else if (post.author?.name === 'ป้าศรี ของหวานโบราณ') targetUid = 'user_default_pasri';
              else if (post.author?.name === 'คณะกรรมการพัฒนาชุมชน') targetUid = 'user_default_comm';
            }
            
            if (targetUid) {
              openPublicProfile(targetUid);
            } else {
              showToast('ไม่สามารถดูโปรไฟล์นี้ได้ (ไม่มีข้อมูลผู้ใช้)', 'error');
            }
          }}
        >
          <img 
            src={post.author?.avatar || 'https://ui-avatars.com/api/?name=U&background=random'} 
            alt={post.author?.name} 
            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0" 
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-slate-900 text-[14px] leading-tight">{post.author?.name}</h3>
              {post.author?.isVerified && (
                <span title="ยืนยันตัวตนแล้ว">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                </span>
              )}
              {post.author?.reputationScore !== undefined && post.author.reputationScore > 50 && (
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 flex items-center gap-0.5" title="คะแนนความน่าเชื่อถือ">
                  ⭐ {post.author.reputationScore >= 100 ? '100%' : post.author.reputationScore}
                </span>
              )}
              {post.category && (
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {post.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mt-1">
              <span>{post.time}</span>
              <span>•</span>
              <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                <MapPin size={10} className="mr-0.5" />
                ต.{post.location.subdistrict} {displayDistance ? `(${displayDistance})` : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowMenu(prev => !prev)}
            title="เพิ่มเติม"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-xl transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 w-40 z-20 text-[12px] font-bold text-slate-700">
              {isRealAdmin && (
                <button
                  onClick={() => { setShowMenu(false); togglePinPost(post.id, !post.isPinned); }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-amber-600"
                >
                  <Pin size={13} className={post.isPinned ? "fill-amber-600" : ""} />
                  {post.isPinned ? 'ยกเลิกปักหมุด' : 'ปักหมุดประกาศ'}
                </button>
              )}
              <button
                onClick={handleCopyText}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
              >
                <Copy size={13} />
                คัดลอกข้อความ
              </button>
              {isMyPost && onDelete && (
                <button
                  onClick={() => { setShowMenu(false); onDelete(); }}
                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Trash2 size={13} />
                  ลบโพสต์นี้
                </button>
              )}
              {isRealAdmin && !isMyPost && onDelete && (
                <button
                  onClick={() => { setShowMenu(false); onDelete(); }}
                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                >
                  <Trash2 size={13} />
                  ลบโพสต์ (Admin)
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Check-In Location Badge Card (if post has check-in) */}
      {post.checkIn && (
        <div 
          onClick={handleViewOnMap}
          className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50 border border-emerald-200/80 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              {(() => {
                const Icon = getCheckInIcon(post.checkIn.category).icon;
                return <Icon size={15} />;
              })()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                  เช็คอินที่
                </span>
                <h4 className="text-[13px] font-extrabold text-slate-900 group-hover:text-emerald-900 truncate">
                  {post.checkIn.placeName}
                </h4>
              </div>
              <p className="text-[11px] font-medium text-slate-500 truncate">
                {post.checkIn.subdistrict ? `ต.${post.checkIn.subdistrict} ` : ''}
                {post.checkIn.district ? `อ.${post.checkIn.district} ` : ''}
                {post.checkIn.province || ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleViewOnMap}
            className="shrink-0 px-2.5 py-1 bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 rounded-xl text-[11px] font-extrabold flex items-center gap-1 shadow-xs transition-all active:scale-95"
          >
            <Compass size={12} className="animate-spin" />
            <span>ดูบนแผนที่</span>
          </button>
        </div>
      )}

      {/* Content */}
      <p className="text-[13.5px] font-normal text-slate-800 mb-3.5 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </p>

      {/* Video Attachment (if any) */}
      {post.videoUrl && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 relative group">
          <video 
            src={post.videoUrl} 
            controls 
            playsInline
            preload="metadata"
            className="w-full max-h-80 object-contain rounded-2xl bg-black"
          />
        </div>
      )}

      {/* Image Attachment (if any) */}
      {post.images && post.images.length > 0 ? (
        <div className={`mb-4 grid gap-1.5 rounded-2xl overflow-hidden border border-slate-150 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : post.images.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {post.images.map((img, idx) => {
            // Only show up to 4 images in the grid preview
            if (idx > 3) return null;
            const isLastVisible = idx === 3 && post.images!.length > 4;
            
            return (
              <div 
                key={idx}
                onClick={() => openMediaViewer({
                  url: img,
                  type: 'image',
                  title: `โพสต์โดย ${post.author?.name} (${idx + 1}/${post.images!.length})`,
                  subtitle: `ต.${post.location.subdistrict} • ${post.time}`
                })}
                className={`relative bg-slate-900 cursor-pointer group ${post.images!.length === 1 ? 'max-h-72' : 'aspect-square'}`}
              >
                <SafeImage 
                  src={img} 
                  alt={`ภาพประกอบโพสต์ ${idx + 1}`} 
                  category={post.category}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-300" 
                />
                
                {isLastVisible && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <span className="text-white text-xl font-extrabold">+{post.images!.length - 4}</span>
                  </div>
                )}
                
                {!isLastVisible && (
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 pointer-events-none">
                    <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20">
                      ดูรูปภาพ
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : post.image ? (
        <div 
          onClick={() => openMediaViewer({
            url: post.image!,
            type: 'image',
            title: `โพสต์โดย ${post.author?.name}`,
            subtitle: `ต.${post.location.subdistrict} • ${post.time}`
          })}
          className="mb-4 rounded-2xl overflow-hidden border border-slate-150 bg-slate-900 max-h-72 cursor-pointer relative group"
        >
          <SafeImage 
            src={post.image} 
            alt="ภาพประกอบโพสต์" 
            category={post.category}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300" 
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 pointer-events-none">
            <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20">
              แตะเพื่อดูภาพเต็มจอ
            </span>
          </div>
        </div>
      ) : null}

      {/* Stats Bar */}
      <div className="flex justify-between items-center text-[12px] font-bold text-slate-400 border-b border-slate-100 pb-2.5 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center">
            <Heart size={11} className="fill-rose-500 text-rose-500" />
          </div>
          <span className="text-slate-600">{post.likes} คนถูกใจ</span>
        </div>
        <span 
          onClick={onOpenComments}
          className="text-slate-500 hover:text-emerald-700 cursor-pointer transition-colors"
        >
          {post.comments} ความคิดเห็น
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-1 pt-0.5">
        <button 
          onClick={onLike}
          className={`flex-1 flex items-center justify-center gap-1.5 text-[12.5px] py-2 rounded-xl transition-colors font-bold active:scale-95 ${
            post.isLiked 
              ? 'text-rose-600 bg-rose-50 font-extrabold' 
              : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/70'
          }`}
        >
          <Heart size={16} className={post.isLiked ? 'fill-rose-600' : ''} />
          {post.isLiked ? 'ถูกใจแล้ว' : 'ถูกใจ'}
        </button>

        <button 
          onClick={onOpenComments}
          className="flex-1 flex items-center justify-center gap-1.5 text-[12.5px] text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/70 py-2 rounded-xl transition-colors font-bold active:scale-95"
        >
          <MessageCircle size={16} />
          คอมเมนต์
        </button>

        <button 
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1.5 text-[12.5px] text-slate-600 hover:text-blue-600 hover:bg-blue-50/70 py-2 rounded-xl transition-colors font-bold active:scale-95"
        >
          {isCopied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
          {isCopied ? 'คัดลอกแล้ว' : 'แชร์'}
        </button>
      </div>
    </div>
  );
}
