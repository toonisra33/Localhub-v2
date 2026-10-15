import React, { useState, useRef } from 'react';
import {
  MessageSquare,
  Heart,
  Share2,
  MapPin,
  CheckCircle,
  Plus,
  Search,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Users,
  UserPlus,
  UserCheck,
  UserMinus,
  Compass,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
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
  const {
    posts,
    location,
    likePost,
    openPostDetail,
    showToast,
    friends,
    addFriend,
    removeFriend,
    isFriend,
    currentUser
  } = useCommunity();

  // Scope filter: 'friends_or_local' (default per user prompt) | 'friends_only' | 'local_only' | 'all'
  const [feedScope, setFeedScope] = useState<'friends_or_local' | 'friends_only' | 'local_only' | 'all'>('friends_or_local');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Native input refs for direct 1-click device camera & file capture
  const directCameraInputRef = useRef<HTMLInputElement>(null);
  const directGalleryInputRef = useRef<HTMLInputElement>(null);

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

  // Filter posts by scope (friends or local GPS area), category, and search query
  const filteredPosts = posts.filter(post => {
    if (!post) return false;

    const authorIsFriend = isFriend(post.author);
    const isInLocalArea = post.location?.province?.trim() === location.province?.trim();

    // 1. Feed Scope Filter
    if (feedScope === 'friends_or_local') {
      if (!authorIsFriend && !isInLocalArea) return false;
    } else if (feedScope === 'friends_only') {
      if (!authorIsFriend) return false;
    } else if (feedScope === 'local_only') {
      if (!isInLocalArea) return false;
    }

    // 2. Category Filter
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;

    // 3. Search Query
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return matchesCategory;

    const postTitle = (post.title || '').toLowerCase();
    const postContent = (post.content || '').toLowerCase();
    const postAuthor = (post.author || '').toLowerCase();
    const matchesSearch =
      postTitle.includes(q) ||
      postContent.includes(q) ||
      postAuthor.includes(q) ||
      (Array.isArray(post.tags) && post.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(q)));
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'news', label: '📰 ข่าวสาร' },
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
    <div className="space-y-4 max-w-4xl mx-auto">
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

      {/* Live Accurate Weather Widget */}
      <WeatherWidget onOpenFullForecast={onOpenWeather} />

      {/* Friends Horizontal Bar */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">เพื่อนของฉัน ({friends.length})</div>
            <div className="text-[10px] text-slate-400">คนในแวดวงชุมชนที่คุณติดตาม</div>
          </div>
        </div>

        {/* Friends Avatars */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          {friends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => {
                setFeedScope('friends_only');
                setSearchQuery(friend.name);
                showToast(`กรองโพสต์เฉพาะของคุณ ${friend.name}`, 'info');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl cursor-pointer transition shrink-0 group active:scale-95"
              title={`ดูโพสต์ของ ${friend.name}`}
            >
              <img
                src={friend.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={friend.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-200 group-hover:border-blue-400"
              />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 whitespace-nowrap">
                {friend.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Scope Segment: Friends or Device Current Area */}
      <div className="bg-slate-900 text-white rounded-2xl p-1.5 shadow-md flex items-center justify-between gap-1 text-xs">
        <button
          onClick={() => {
            setFeedScope('friends_or_local');
            setSearchQuery('');
          }}
          className={`flex-1 py-2 text-center rounded-xl font-bold transition flex items-center justify-center gap-1 text-[11px] sm:text-xs ${
            feedScope === 'friends_or_local'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>เพื่อน & พื้นที่ของฉัน</span>
        </button>

        <button
          onClick={() => {
            setFeedScope('friends_only');
            setSearchQuery('');
          }}
          className={`flex-1 py-2 text-center rounded-xl font-bold transition flex items-center justify-center gap-1 text-[11px] sm:text-xs ${
            feedScope === 'friends_only'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>เพื่อนของฉัน ({friends.length})</span>
        </button>

        <button
          onClick={() => {
            setFeedScope('local_only');
            setSearchQuery('');
          }}
          className={`flex-1 py-2 text-center rounded-xl font-bold transition flex items-center justify-center gap-1 text-[11px] sm:text-xs truncate px-1 ${
            feedScope === 'local_only'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span className="truncate">พื้นที่ {location.province}</span>
        </button>

        <button
          onClick={() => {
            setFeedScope('all');
            setSearchQuery('');
          }}
          className={`px-3 py-2 text-center rounded-xl font-bold transition text-[11px] sm:text-xs ${
            feedScope === 'all'
              ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ทั้งหมด
        </button>
      </div>

      {/* Scope Status Indicator */}
      <div className="p-2.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-700 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-emerald-600 text-white shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </span>
          <span className="text-[11px] sm:text-xs">
            {feedScope === 'friends_or_local' && (
              <>
                กำลังแสดงโพสต์ของ <strong>เพื่อนที่คุณเพิ่มไว้</strong> และ <strong>คนในพื้นที่ {location.province}</strong> (จากพิกัด GPS อุปกรณ์ปัจจุบัน)
              </>
            )}
            {feedScope === 'friends_only' && (
              <>
                กำลังแสดงเฉพาะโพสต์ของ <strong>เพื่อนในรายชื่อของคุณ</strong> ({friends.length} คน)
              </>
            )}
            {feedScope === 'local_only' && (
              <>
                กำลังแสดงโพสต์ของผู้ใช้ใน <strong>จ.{location.province} {location.district ? `(${location.district})` : ''}</strong>
              </>
            )}
            {feedScope === 'all' && (
              <>
                กำลังแสดงโพสต์ของผู้ใช้ <strong>ทั่วทั้งระบบ</strong>
              </>
            )}
          </span>
        </div>
      </div>

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
            แชร์เรื่องราว ข่าวสาร หรือถามเพื่อนบ้านใน {location.province}...
          </button>
          <button
            onClick={onOpenCreatePost}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">สร้างโพสต์</span>
          </button>
        </div>

        {/* Action Buttons Row: Direct Camera & Media Upload */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
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
              <div className="text-[11px] sm:text-xs font-extrabold leading-tight">คลังรูปภาพ</div>
              <div className="text-[9px] text-blue-700 font-semibold leading-tight hidden sm:block">อัลบั้มในเครื่อง</div>
            </div>
          </button>
        </div>
      </div>

      {/* Filter Categories and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
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
            placeholder="ค้นหาโพสต์, ชื่อเพื่อน..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-3.5">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-semibold text-slate-700">ไม่พบโพสต์ที่ตรงกับเงื่อนไขในมุมมองนี้</p>
            <p className="text-xs text-slate-400">
              {feedScope === 'friends_only'
                ? 'เพื่อนของคุณยังไม่ได้สร้างโพสต์ หรือลองเพิ่มเพื่อนใหม่ในชุมชน'
                : 'ลองเปลี่ยนตัวกรอง หรือเป็นคนแรกที่สร้างโพสต์ในพื้นที่ของคุณ'}
            </p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const authorIsFriend = isFriend(post.author);
            const isInLocalArea = post.location?.province?.trim() === location.province?.trim();
            const isSelf = currentUser?.displayName === post.author;

            return (
              <div
                key={post.id}
                onClick={() => openPostDetail(post)}
                className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer space-y-3 group"
              >
                {/* Author & Header with Add/Remove Friend button */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={typeof post.author === 'string' ? post.author : (post.author as any)?.name || 'ผู้ใช้'}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-700 transition truncate">
                          {typeof post.author === 'string' ? post.author : (post.author as any)?.name || 'สมาชิกชุมชน'}
                        </span>
                        {post.isVerified && (
                          <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white shrink-0" />
                        )}

                        {/* Friend / Local Area Badges */}
                        {authorIsFriend && (
                          <span className="px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200 flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" />
                            เพื่อนของคุณ
                          </span>
                        )}

                        {isInLocalArea && !authorIsFriend && (
                          <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            คนในพื้นที่
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {post.location?.province || 'พื้นที่ชุมชน'} {post.location?.district ? `(${post.location.district})` : ''}
                        </span>
                        <span>•</span>
                        <span>{timeAgo(post.createdAt || Date.now())}</span>
                      </div>
                    </div>
                  </div>

                  {/* Add / Remove Friend Action Button on Post Header */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isSelf && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (authorIsFriend) {
                            removeFriend(post.author);
                          } else {
                            addFriend({
                              id: `f_${post.author}`,
                              name: post.author,
                              avatar: post.authorAvatar,
                              province: post.location?.province,
                              district: post.location?.district
                            });
                          }
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition active:scale-95 ${
                          authorIsFriend
                            ? 'bg-blue-50 text-blue-700 hover:bg-rose-50 hover:text-rose-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                        }`}
                        title={authorIsFriend ? 'คลิกเพื่อลบเพื่อน' : 'คลิกเพื่อเพิ่มเพื่อน'}
                      >
                        {authorIsFriend ? (
                          <>
                            <UserCheck className="w-3 h-3 text-blue-600" />
                            <span>เป็นเพื่อนแล้ว</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3 text-emerald-600" />
                            <span>+ เพิ่มเพื่อน</span>
                          </>
                        )}
                      </button>
                    )}

                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 hidden sm:inline-block">
                      {post.category === 'news' && 'ข่าวสาร'}
                      {post.category === 'help' && 'ช่วยเหลือ'}
                      {post.category === 'activity' && 'กิจกรรม'}
                      {post.category === 'general' && 'พูดคุย'}
                      {post.category === 'alert' && 'เตือนภัย'}
                    </span>
                  </div>
                </div>

                {/* Title & Content */}
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug group-hover:text-emerald-800 transition">
                    {post.title || 'ไม่มีหัวข้อ'}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {post.content || ''}
                  </p>
                </div>

                {/* Images */}
                {Array.isArray(post.images) && post.images.length > 0 && (
                  <div className={`grid gap-2 rounded-2xl overflow-hidden ${
                    post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                  }`}>
                    {post.images.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Post media"
                        className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ))}
                  </div>
                )}

                {/* Action Bar (Likes, Comments, Share) */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        likePost(post.id);
                      }}
                      className={`flex items-center gap-1.5 transition active:scale-90 font-bold ${
                        post.isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600' : ''}`} />
                      <span>{post.likes}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPostDetail(post);
                      }}
                      className="flex items-center gap-1.5 hover:text-blue-600 transition font-bold"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{Array.isArray(post.comments) ? post.comments.length : 0}</span>
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleShare(post, e)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition"
                    title="แชร์โพสต์"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
