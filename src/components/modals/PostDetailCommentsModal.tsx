import React, { useState } from 'react';
import {
  X,
  Heart,
  MessageSquare,
  Share2,
  MapPin,
  CheckCircle,
  Send,
  Calendar,
  Tag,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { Post } from '../../types';

interface PostDetailCommentsModalProps {
  post: Post | null;
  onClose: () => void;
}

export const PostDetailCommentsModal: React.FC<PostDetailCommentsModalProps> = ({ post, onClose }) => {
  const { likePost, addComment, showToast, isFriend, addFriend, removeFriend, currentUser } = useCommunity();
  const [commentText, setCommentText] = useState('');

  if (!post) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('คัดลอกลิงก์โพสต์ลงคลิปบอร์ดแล้ว!', 'success');
    } else {
      showToast('แชร์ลิงก์โพสต์สำเร็จ', 'success');
    }
  };

  const timeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'เมื่อสักครู่';
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    return `${Math.floor(hours / 24)} วันที่แล้ว`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <img
              src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={typeof post.author === 'string' ? post.author : (post.author as any)?.name || 'ผู้ใช้'}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">
                  {typeof post.author === 'string' ? post.author : (post.author as any)?.name || 'สมาชิกชุมชน'}
                </span>
                {post.isVerified && <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />}
                {currentUser?.displayName !== post.author && (
                  <button
                    onClick={() => {
                      if (isFriend(post.author)) {
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
                    className={`ml-2 px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition active:scale-95 ${
                      isFriend(post.author)
                        ? 'bg-blue-50 text-blue-700 hover:bg-rose-50 hover:text-rose-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                    }`}
                  >
                    {isFriend(post.author) ? (
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
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {post.location?.province || 'พื้นที่ชุมชน'} {post.location?.district ? `• ${post.location.district}` : ''}
                <span className="mx-1">•</span>
                {timeAgo(post.createdAt || Date.now())}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 leading-snug">{post.title}</h2>

          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            {post.content}
          </p>

          {/* Video Attachment Player */}
          {post.videoUrl && (
            <div className="rounded-2xl overflow-hidden bg-black border border-slate-700 shadow-md">
              <video
                src={post.videoUrl}
                poster={post.videoThumbnail}
                controls
                autoPlay={false}
                playsInline
                preload="metadata"
                className="w-full max-h-96 object-contain bg-black"
              />
              <div className="p-2.5 bg-slate-900 text-slate-300 text-xs flex items-center justify-between border-t border-slate-800">
                <span className="font-semibold text-purple-300">
                  🎥 วิดีโอแนบในโพสต์ {post.mediaFileName ? `(${post.mediaFileName})` : ''}
                </span>
                {post.videoDuration && (
                  <span className="text-[11px] text-slate-400">
                    ความยาว: {post.videoDuration} วินาที
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className={`gap-2.5 ${post.images.length > 1 ? 'grid grid-cols-1 sm:grid-cols-2' : ''}`}>
              {post.images.map((img, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 max-h-80 shadow-2xs">
                  <img
                    src={img}
                    alt={`Post attachment ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {post.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                  <Tag className="w-3 h-3" />
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div className="py-2.5 border-y border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <button
                onClick={() => likePost(post.id)}
                className={`flex items-center gap-1.5 font-semibold transition ${
                  post.isLiked ? 'text-rose-600' : 'hover:text-rose-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600' : ''}`} />
                {post.likes ?? 0} ถูกใจ
              </button>

              <span className="flex items-center gap-1.5 font-semibold">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                {post.commentsCount ?? (post.comments?.length || 0)} ความคิดเห็น
              </span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-blue-600 font-medium transition"
            >
              <Share2 className="w-4 h-4" />
              แชร์โพสต์
            </button>
          </div>

          {/* Comments Section */}
          <div className="space-y-3 pt-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              ความคิดเห็น ({post.commentsCount ?? (post.comments?.length || 0)})
            </h3>

            {(!post.comments || post.comments.length === 0) ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นเลย!
              </p>
            ) : (
              <div className="space-y-2.5">
                {(post.comments || []).map((comment) => (
                  <div key={comment.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-slate-800">{comment.author}</span>
                        {comment.isOfficial && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-700 font-semibold">
                            เจ้าหน้าที่
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {timeAgo(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 pl-8 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSendComment} className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="เขียนความคิดเห็นของคุณ..."
            className="flex-1 text-xs sm:text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
