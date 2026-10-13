import React, { useState, useRef } from 'react';
import {
  MessageSquare,
  Heart,
  Share2,
  MapPin,
  CheckCircle,
  Plus,
  Filter,
  Search,
  Sparkles,
  Tag,
  Radio,
  Clock,
  Activity,
  Play,
  Square,
  VolumeX,
  Sliders,
  FileVideo,
  CloudSun,
  Camera,
  Image as ImageIcon,
  Shield
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';
import { WeatherWidget } from '../WeatherWidget';
import { Post } from '../../types';
import { saveMediaFile } from '../../utils/mediaStorage';

interface FeedViewProps {
  onOpenCreatePost: () => void;
  onOpenCreatePostWithMode?: (mode: 'camera' | 'gallery' | 'video' | 'standard', images?: string[]) => void;
  onOpenWeather?: () => void;
  onOpenInstantCamera?: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  onOpenCreatePost,
  onOpenCreatePostWithMode,
  onOpenWeather,
  onOpenInstantCamera
}) => {
  const { posts, location, likePost, openPostDetail, showToast } = useCommunity();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Native input refs for direct 1-click device camera & file capture
  const directCameraInputRef = useRef<HTMLInputElement>(null);
  const directGalleryInputRef = useRef<HTMLInputElement>(null);
  const directVideoInputRef = useRef<HTMLInputElement>(null);

  const handleDirectCameraChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const file = files[0];
      const saved = await saveMediaFile(file, file.name);
      showToast('📸 ถ่ายภาพสดจากกล้องเรียบร้อย พร้อมโพสต์!', 'success');
      if (onOpenCreatePostWithMode) {
        onOpenCreatePostWithMode('standard', [saved.objectUrl]);
      } else {
        onOpenCreatePost();
      }
    } catch {
      showToast('ไม่สามารถบันทึกภาพถ่ายได้', 'error');
    } finally {
      if (directCameraInputRef.current) directCameraInputRef.current.value = '';
    }
  };

  const handleDirectGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const saved = await saveMediaFile(files[i], files[i].name);
        urls.push(saved.objectUrl);
      }
      showToast(`🖼️ เลือกรูปภาพ ${urls.length} รูปเรียบร้อย!`, 'success');
      if (onOpenCreatePostWithMode) {
        onOpenCreatePostWithMode('standard', urls);
      } else {
        onOpenCreatePost();
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการโหลดรูปภาพ', 'error');
    } finally {
      if (directGalleryInputRef.current) directGalleryInputRef.current.value = '';
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!post) return false;
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return matchesCategory;

    const postTitle = (post.title || '').toLowerCase();
    const postContent = (post.content || '').toLowerCase();
    const matchesSearch =
      postTitle.includes(q) ||
      postContent.includes(q) ||
      (Array.isArray(post.tags) && post.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(q)));
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'alert', label: '🚨 แจ้งเหตุด่วน' },
    { id: 'market', label: '🛍️ ซื้อ-ขาย/บริการ' },
    { id: 'news', label: '📰 ข่าวสารชุมชน' },
    { id: 'help', label: '🤝 ช่วยเหลือ/ของหาย' },
    { id: 'activity', label: '🎉 กิจกรรม' },
    { id: 'general', label: '💬 พูดคุย' },
  ];

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'เมื่อสักครู่';
    if (hours < 24) return `${hours} ชม. ที่แล้ว`;
    return `${Math.floor(hours / 24)} วันที่แล้ว`;
  };

  const handleShare = (post: Post, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#post=${post.id}`);
      showToast('คัดลอกลิงก์โพสต์เรียบร้อยแล้ว!', 'success');
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden native inputs for 1-click capture from Feed */}
      <input
        ref={directCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleDirectCameraChange}
      />
      <input
        ref={directGalleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleDirectGalleryChange}
      />
      <input
        ref={directVideoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={handleDirectCameraChange}
      />

      {/* Live Accurate Weather Widget */}
      <WeatherWidget onOpenFullForecast={onOpenWeather} />



      {/* Top Banner / Create Post bar with Direct Camera Shutter */}
      <div className="p-4 bg-white rounded-2xl border-2 border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
            alt="User avatar"
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <button
            onClick={onOpenCreatePost}
            className="flex-1 text-left px-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 rounded-xl text-xs sm:text-sm text-slate-500 font-medium transition"
          >
            มีอะไรเกิดขึ้นในพื้นที่? แชร์กับเพื่อนบ้าน...
          </button>
          <button
            onClick={onOpenCreatePost}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">สร้างโพสต์</span>
          </button>
        </div>

        {/* Action Buttons Row: Direct Camera & Media Upload */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
          {/* Button 1: Direct Native Camera Snap */}
          <button
            onClick={() => {
              if (onOpenInstantCamera) {
                onOpenInstantCamera();
              } else {
                directCameraInputRef.current?.click();
              }
            }}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition active:scale-95 shadow-xs group"
            title="เปิดกล้องถ่ายภาพสดทันที"
          >
            <div className="p-1.5 rounded-full bg-emerald-600 text-white group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[11px] sm:text-xs font-extrabold leading-tight">ถ่ายรูปสด</div>
              <div className="text-[9px] text-emerald-700 font-semibold leading-tight hidden sm:block">เข้ากล้องตรง</div>
            </div>
          </button>

          {/* Button 2: Gallery */}
          <button
            onClick={() => directGalleryInputRef.current?.click()}
            className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-2xs group"
            title="เลือกรูปภาพจากคลังภาพในเครื่อง"
          >
            <div className="p-1.5 rounded-full bg-blue-600 text-white group-hover:scale-110 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[11px] sm:text-xs font-bold leading-tight">แกลเลอรี</div>
              <div className="text-[9px] text-blue-600 font-semibold leading-tight hidden sm:block">เลือกรูป</div>
            </div>
          </button>

          {/* Button 3: Video */}
          <button
            onClick={() => {
              if (onOpenCreatePostWithMode) {
                onOpenCreatePostWithMode('video');
              } else {
                onOpenCreatePost();
              }
            }}
            className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-2xs group"
            title="อัปโหลดหรือบันทึกวิดีโอคลิป"
          >
            <div className="p-1.5 rounded-full bg-purple-600 text-white group-hover:scale-110 transition-transform">
              <FileVideo className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[11px] sm:text-xs font-bold leading-tight">วิดีโอคลิป</div>
              <div className="text-[9px] text-purple-600 font-semibold leading-tight hidden sm:block">คลิปสั้น</div>
            </div>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Categories pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาโพสต์..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-3.5">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-semibold text-slate-700">ไม่พบโพสต์ที่ตรงกับเงื่อนไข</p>
            <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหา หรือเป็นคนแรกที่สร้างโพสต์ในหมวดนี้</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div
              key={post.id}
              onClick={() => openPostDetail(post)}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-3 group"
            >
              {/* Author & Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={typeof post.author === 'string' ? post.author : (post.author as any)?.name || 'ผู้ใช้'}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition">
                        {typeof post.author === 'string' ? post.author : (post.author as any)?.name || 'สมาชิกชุมชน'}
                      </span>
                      {post.isVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                      )}
                      {post.authorRole && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {typeof post.authorRole === 'string' ? post.authorRole : 'ผู้ใช้'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {post.location?.province || 'พื้นที่ชุมชน'} {post.location?.district ? `(${post.location.district})` : ''}
                      </span>
                      <span>•</span>
                      <span>{timeAgo(post.createdAt || Date.now())}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                  {post.category === 'news' && 'ข่าวสาร'}
                  {post.category === 'help' && 'ช่วยเหลือ'}
                  {post.category === 'activity' && 'กิจกรรม'}
                  {post.category === 'general' && 'พูดคุย'}
                  {post.category === 'alert' && 'เตือนภัย'}
                </span>
              </div>

              {/* Title & Content */}
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug group-hover:text-blue-700 transition">
                  {post.title || 'ไม่มีหัวข้อ'}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {post.content || ''}
                </p>
              </div>

              {/* Video preview / player */}
              {post.videoUrl && (
                <div
                  className="rounded-2xl overflow-hidden bg-black border border-slate-200 relative group/video max-h-72"
                  onClick={(e) => e.stopPropagation()}
                >
                  <video
                    src={post.videoUrl}
                    poster={post.videoThumbnail}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-h-72 object-contain bg-black"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 pointer-events-none">
                    <FileVideo className="w-3 h-3 text-purple-400" />
                    <span>วิดีโอคลิป {post.videoDuration ? `• ${post.videoDuration} วิ` : ''}</span>
                  </div>
                </div>
              )}

              {/* Images preview */}
              {Array.isArray(post.images) && post.images.length > 0 && !post.videoUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-100 max-h-64 relative">
                  <img
                    src={post.images[0]}
                    alt="Post media"
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                  />
                  {post.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                      +{post.images.length - 1} รูป
                    </span>
                  )}
                </div>
              )}

              {/* Tags */}
              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {post.tags.filter(Boolean).map(tag => (
                    <span key={String(tag)} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 font-medium border border-slate-100">
                      #{String(tag)}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      likePost(post.id);
                    }}
                    className={`flex items-center gap-1.5 font-semibold transition ${
                      post.isLiked ? 'text-rose-600' : 'hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span>{post.likes ?? 0}</span>
                  </button>

                  <span className="flex items-center gap-1.5 font-semibold hover:text-blue-600">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>{post.commentsCount ?? (Array.isArray(post.comments) ? post.comments.length : 0)}</span>
                  </span>
                </div>

                <button
                  onClick={(e) => handleShare(post, e)}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">แชร์</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Direct Camera Shutter Button (Always accessible on Mobile) */}
      <button
        onClick={onOpenCreatePost}
        className="lg:hidden fixed bottom-20 right-4 z-40 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white shadow-2xl shadow-emerald-500/40 flex items-center gap-2 border-2 border-white hover:scale-105 active:scale-95 transition"
        title="เปิดกล้องถ่ายภาพและสร้างโพสต์ทันที"
      >
        <div className="p-1 rounded-full bg-white/20">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <span className="text-xs font-black tracking-wide">ถ่ายรูปโพสต์</span>
      </button>
    </div>
  );
};
