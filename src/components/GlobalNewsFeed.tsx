import React, { useState } from 'react';
import { 
  Globe,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import { Post } from '../types';
import { useCommunity } from '../context/CommunityContext';
import { CreatePostModal } from './modals/CreatePostModal';
import { PostDetailCommentsModal } from './modals/PostDetailCommentsModal';
import { PostCard } from './PostCard';
import { LocalHubLogo } from './LocalHubLogo';
import { NotificationCenterModal } from './modals/NotificationCenterModal';

// Mock data for trending global posts if needed
const mockGlobalPosts: Post[] = [
  {
    id: 'g-mock1',
    author: { name: 'ข่าวใหญ่ประเทศไทย', avatar: 'https://i.pravatar.cc/150?u=news1' },
    category: 'ข่าวสารชุมชน',
    content: '🚨 ประกาศด่วน! วันพรุ่งนี้จะมีพายุเข้าในหลายพื้นที่ทั่วประเทศ ขอให้ทุกท่านเตรียมรับมือและติดตามข่าวสารอย่างใกล้ชิด',
    time: '2 ชั่วโมงที่แล้ว',
    likes: 1240,
    comments: 312,
    createdAt: Date.now() - 7200000,
    location: { province: 'ทั่วประเทศ', district: '', subdistrict: '' }
  },
  {
    id: 'g-mock2',
    author: { name: 'สาระน่ารู้', avatar: 'https://i.pravatar.cc/150?u=news2' },
    category: 'ประกาศทั่วไป',
    content: '💡 5 วิธีประหยัดไฟในฤดูร้อนที่จะถึงนี้ ทำได้ง่ายๆ ที่บ้านคุณ...',
    time: '5 ชั่วโมงที่แล้ว',
    likes: 856,
    comments: 104,
    createdAt: Date.now() - 18000000,
    location: { province: 'ทั่วประเทศ', district: '', subdistrict: '' }
  }
];

export function GlobalNewsFeed() {
  const { posts, toggleLikePost, deletePost, userProfile, openContactAdminModal, unreadNotificationsCount } = useCommunity();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<Post | null>(null);

  // Combine real posts and mock global posts, then sort by engagement (likes + comments)
  const displayPosts = [
    ...posts,
    ...mockGlobalPosts
  ].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
  
  // Sync active modal post if open
  const activeModalPost = selectedPostForComments 
    ? displayPosts.find(p => p.id === selectedPostForComments.id) || selectedPostForComments
    : null;

  return (
    <div className="pb-28 pt-4 animate-in fade-in duration-300 bg-slate-50/60 min-h-screen">
      
      {/* Sticky Frosted Header */}
      <div className="bg-white/90 backdrop-blur-xl px-5 pt-7 pb-4 border-b border-slate-200/70 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-[17px] font-black text-slate-800 tracking-tight leading-none">ศูนย์รวมข่าวสาร</h2>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">ข่าวฮิตทั่วประเทศจาก LocalHub</p>
            </div>
          </div>
          
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
            <span className="bg-blue-50 text-blue-700 text-[11px] font-extrabold px-2.5 py-1 rounded-xl border border-blue-100 flex items-center gap-1 shadow-xs">
              <TrendingUp size={12} className="text-blue-600" />
              ฮิตตอนนี้
            </span>
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      <div className="p-4 space-y-3.5 max-w-md mx-auto">
        {displayPosts.map(post => (
          <PostCard 
            key={post.id} 
            post={post}
            isMyPost={post.author?.name === userProfile?.name}
            onLike={() => toggleLikePost(post.id)}
            onOpenComments={() => setSelectedPostForComments(post)}
            onDelete={() => deletePost(post.id)}
          />
        ))}
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
