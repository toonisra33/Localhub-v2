import React, { useState } from 'react';
import { X, Heart, MessageCircle, Share2, Send, MapPin, MoreHorizontal, Check } from 'lucide-react';
import { Post } from '../../types';
import { useCommunity } from '../../context/CommunityContext';

interface PostDetailCommentsModalProps {
  post: Post;
  onClose: () => void;
}

export function PostDetailCommentsModal({ post, onClose }: PostDetailCommentsModalProps) {
  const { toggleLikePost, addComment, deletePost, showToast, userProfile, openMediaViewer } = useCommunity();
  const [commentInput, setCommentInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const comments = post.commentList || [];

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(post.id, commentInput.trim());
    setCommentInput('');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    showToast('🔗 คัดลอกลิงก์โพสต์เรียบร้อยแล้ว');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-extrabold text-slate-900 leading-tight">ความคิดเห็น ({post.comments})</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Post & Comments Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          
          {/* Post Snippet */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
              />
              <div>
                <h3 className="font-extrabold text-slate-900 text-[14px] leading-tight">{post.author.name}</h3>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mt-0.5">
                  <span>{post.time}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">ต.{post.location.subdistrict}</span>
                </div>
              </div>
            </div>

            <p className="text-[13.5px] text-slate-800 leading-relaxed font-normal">
              {post.content}
            </p>

            {post.images && post.images.length > 0 ? (
              <div className={`grid gap-1.5 rounded-xl overflow-hidden border border-slate-200 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : post.images.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                {post.images.map((img, idx) => {
                  if (idx > 3) return null;
                  const isLastVisible = idx === 3 && post.images!.length > 4;
                  
                  return (
                    <div 
                      key={idx}
                      onClick={() => openMediaViewer({
                        url: img,
                        type: 'image',
                        title: `โพสต์โดย ${post.author.name} (${idx + 1}/${post.images!.length})`,
                        subtitle: `ต.${post.location.subdistrict} • ${post.time}`
                      })}
                      className={`relative bg-slate-900 cursor-pointer group ${post.images!.length === 1 ? 'max-h-52' : 'aspect-square'}`}
                    >
                      <img src={img} alt={`Post media ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      
                      {isLastVisible && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white text-xl font-extrabold">+{post.images!.length - 4}</span>
                        </div>
                      )}
                      
                      {!isLastVisible && (
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
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
                  title: `โพสต์โดย ${post.author.name}`,
                  subtitle: `ต.${post.location.subdistrict} • ${post.time}`
                })}
                className="rounded-xl overflow-hidden max-h-52 bg-slate-900 border border-slate-200 cursor-pointer relative group"
              >
                <img src={post.image} alt="Post media" className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20">
                    แตะเพื่อดูภาพเต็มจอ
                  </span>
                </div>
              </div>
            ) : null}

            {/* Micro Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[12px] font-bold text-slate-600">
              <button
                onClick={() => toggleLikePost(post.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                  post.isLiked ? 'text-rose-600 bg-rose-50' : 'hover:bg-slate-200/60'
                }`}
              >
                <Heart size={15} className={post.isLiked ? 'fill-rose-600' : ''} />
                <span>{post.likes} คนถูกใจ</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-200/60 text-slate-600 transition-colors"
              >
                {isCopied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                <span>{isCopied ? 'คัดลอกแล้ว' : 'แชร์'}</span>
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            <h4 className="text-[12.5px] font-extrabold text-slate-700 px-1">ความคิดเห็นทั้งหมด</h4>

            {comments.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-[12.5px]">
                ยังไม่มีความคิดเห็น เป็นคนแรกที่เริ่มการสนทนา!
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="flex gap-2.5 bg-white p-3 rounded-2xl border border-slate-150 shadow-sm">
                  <img
                    src={c.author.avatar}
                    alt={c.author.name}
                    className="w-8 h-8 rounded-xl object-cover shrink-0 ring-1 ring-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1 mb-0.5">
                      <span className="font-extrabold text-[12.5px] text-slate-900 truncate">
                        {c.author.name}
                      </span>
                      <span className="text-[10.5px] font-semibold text-slate-400 shrink-0">
                        {c.time}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-700 leading-snug font-normal">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendComment} className="p-3 border-t border-slate-150 bg-white flex items-center gap-2 shrink-0">
          <img
            src={userProfile.avatar}
            alt="Me"
            className="w-8 h-8 rounded-xl object-cover ring-1 ring-emerald-500/30 shrink-0"
          />
          <input
            type="text"
            placeholder="เขียนความคิดเห็นของคุณ..."
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-slate-100 rounded-xl text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white border border-slate-200 transition-all"
          />
          <button
            type="submit"
            disabled={!commentInput.trim()}
            className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-sm"
          >
            <Send size={15} />
          </button>
        </form>

      </div>
    </div>
  );
}
