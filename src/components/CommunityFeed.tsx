import React, { useState } from 'react';
import { 
  MapPin, 
  MessageCircle, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Sparkles, 
  Send,
  PlusCircle,
  Tag,
  Check,
  Trash2,
  Copy
} from 'lucide-react';
import { Post } from '../types';
import { useCommunity } from '../context/CommunityContext';
import { CreatePostModal } from './modals/CreatePostModal';
import { PostDetailCommentsModal } from './modals/PostDetailCommentsModal';
import { LocalHubLogo } from './LocalHubLogo';
import { Megaphone } from 'lucide-react';
import { PostCard } from './PostCard';
import { Info } from 'lucide-react';

import { NotificationCenterModal } from './modals/NotificationCenterModal';

export function CommunityFeed() {
  const { posts, toggleLikePost, deletePost, userProfile, showToast, openContactAdminModal, unreadNotificationsCount } = useCommunity();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');

  const categories = [
    'ทั้งหมด', 'แจ้งเหตุฉุกเฉิน', 'ซื้อ-ขาย/บริการ', 'ข่าวสารชุมชน', 'ตามหาของ/สัตว์เลี้ยง', 'ร้านอร่อยชุมชน', 'ประกาศทั่วไป', 'ขอความช่วยเหลือ'
  ];

  const displayPosts = posts;
  
  const filteredPosts = selectedCategory === 'ทั้งหมด'
    ? displayPosts
    : (displayPosts || []).filter(p => p.category === selectedCategory);

  // Sort posts: Pinned posts first, then by creation time (latest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Fallback to time sorting if both are pinned or neither are pinned
    const timeA = a.createdAt || 0;
    const timeB = b.createdAt || 0;
    return timeB - timeA;
  });

  // Sync active modal post if open
  const activeModalPost = selectedPostForComments 
    ? posts.find(p => p.id === selectedPostForComments.id) || selectedPostForComments
    : null;

  return (
    <div className="pb-48 pt-4 animate-in fade-in duration-300 bg-slate-50/60 min-h-screen">
      
      {/* Sticky Frosted Header */}
      <div className="bg-white/90 backdrop-blur-xl px-5 pt-7 pb-4 border-b border-slate-200/70 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <LocalHubLogo size="sm" variant="dark" showSubtitle={false} />
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNotificationsModal(true)}
              className="w-8 h-8 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center transition-all relative shadow-sm"
              aria-label="การแจ้งเตือน"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                            {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-bounce-short">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => openContactAdminModal('pr_request')}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-extrabold px-2.5 py-1 rounded-xl border border-indigo-200/80 flex items-center gap-1.5 transition-colors shadow-xs"
              title="ส่งเรื่องขอประชาสัมพันธ์หรือแจ้งข่าวถึงแอดมิน"
            >
              <Megaphone size={12} className="text-indigo-600" />
              <span>ขอประชาสัมพันธ์</span>
            </button>

            <span className="bg-emerald-50 text-emerald-700 text-[11px] font-extrabold px-2.5 py-1 rounded-xl border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ชุมชนสด
            </span>
          </div>
        </div>
        
        {/* Create Post Input Bar */}
        <div 
          onClick={() => setShowCreateModal(true)}
          className="flex gap-3 items-center bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <img 
            src={userProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.name || 'U')}&background=random`} 
            alt="Me" 
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0" 
          />
          <div className="flex-1 bg-slate-50 text-slate-400 group-hover:text-slate-600 px-3.5 py-2 rounded-xl text-[13px] font-medium border border-slate-100 transition-colors">
            มีอะไรเกิดขึ้นในพื้นที่? แชร์กับเพื่อนบ้าน...
          </div>
          <button 
            type="button"
            title="แนบรูปภาพ"
            className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-500 group-hover:text-emerald-600 flex items-center justify-center transition-colors shrink-0"
          >
            <ImageIcon size={18} />
          </button>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-3 -mx-5 px-5">
          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-slate-200/90 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Posts */}
      <div className="p-4 space-y-3.5 max-w-md mx-auto">
        {sortedPosts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-400 text-[13px]">
            ยังไม่มีโพสต์ในหมวดหมู่นี้ เป็นคนแรกที่โพสต์เรื่องราว!
          </div>
        ) : (
          sortedPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post}
              isMyPost={post.author?.name === userProfile?.name}
              onLike={() => toggleLikePost(post.id)}
              onOpenComments={() => setSelectedPostForComments(post)}
              onDelete={() => deletePost(post.id)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} />}
      {activeModalPost && (
        <PostDetailCommentsModal 
          post={activeModalPost} 
          onClose={() => setSelectedPostForComments(null)} 
        />
      )}
      {showNotificationsModal && <NotificationCenterModal onClose={() => setShowNotificationsModal(false)} />}

    </div>
  );
}
