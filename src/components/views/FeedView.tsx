import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { Post } from '../../types';

interface FeedViewProps {
  onOpenCreatePost: () => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ onOpenCreatePost }) => {
  const { posts, location, likePost, openPostDetail, showToast } = useCommunity();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags && post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
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
    <div className="space-y-4">
      {/* Top Banner / Create Post bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
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
        </div>

        <button
          onClick={onOpenCreatePost}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">สร้างโพสต์</span>
        </button>
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
                    src={post.authorAvatar}
                    alt={post.author}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition">
                        {post.author}
                      </span>
                      {post.isVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
                      )}
                      {post.authorRole && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {post.authorRole}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {post.location.province} {post.location.district ? `(${post.location.district})` : ''}
                      </span>
                      <span>•</span>
                      <span>{timeAgo(post.createdAt)}</span>
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
                  {post.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Images preview */}
              {post.images && post.images.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-slate-100 max-h-64">
                  <img
                    src={post.images[0]}
                    alt="Post media"
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                  />
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 font-medium border border-slate-100">
                      #{tag}
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
                    <span>{post.likes}</span>
                  </button>

                  <span className="flex items-center gap-1.5 font-semibold hover:text-blue-600">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>{post.comments.length}</span>
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
    </div>
  );
};
