import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Info,
  Trash2,
  Copy,
  Check,
  X,
  MapPin,
  Calendar,
  User,
  Tag,
  Hash,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import { useCommunity, ORIGINAL_ADMIN_EMAIL } from '../context/CommunityContext';
import { Post, AlertReport } from '../types';

export interface PostActionMenuProps {
  post: {
    id: string;
    title: string;
    content?: string;
    author: string;
    authorRole?: string;
    category?: string;
    location?: {
      province: string;
      district?: string;
      subdistrict?: string;
      address?: string;
    };
    coordinates?: { lat: number; lng: number };
    createdAt: number;
    images?: string[];
  };
  className?: string;
  onDeleted?: (id: string) => void;
}

export const PostActionMenu: React.FC<PostActionMenuProps> = ({
  post,
  className = '',
  onDeleted
}) => {
  const { currentUser, isAdmin, deletePost, showToast } = useCommunity();
  const [isOpen, setIsOpen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Ownership check: matches display name, email, uid, default user author, or admin
  const isOwner = Boolean(
    isAdmin ||
    (currentUser && (
      (post.author && currentUser.displayName && (
        post.author.trim().toLowerCase() === currentUser.displayName.trim().toLowerCase() ||
        post.author.toLowerCase().includes(currentUser.displayName.trim().toLowerCase()) ||
        currentUser.displayName.toLowerCase().includes(post.author.trim().toLowerCase())
      )) ||
      (post.author && currentUser.email && (
        post.author.trim().toLowerCase() === currentUser.email.trim().toLowerCase() ||
        post.author.toLowerCase().includes(currentUser.email.trim().toLowerCase())
      )) ||
      (currentUser.uid && (
        (post as any).authorId === currentUser.uid ||
        post.author.includes(currentUser.uid)
      )) ||
      (currentUser.email && currentUser.email.toLowerCase().trim() === ORIGINAL_ADMIN_EMAIL.toLowerCase()) ||
      (currentUser.displayName && (post.author.includes('อิศราวัฒน์') || post.author.includes('toonisra')))
    )) ||
    post.author === 'คุณ (ผู้ใช้ปัจจุบัน)' ||
    post.author.startsWith('คุณ') ||
    post.author.includes('คุณ') ||
    post.author.includes('(คุณ)') ||
    post.author.includes('พลเมืองดี')
  );
  const canDelete = isOwner || isAdmin;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#post=${post.id}`);
      setCopied(true);
      showToast('คัดลอกลิงก์โพสต์เรียบร้อยแล้ว', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const ok = await deletePost(post.id);
      if (ok) {
        setShowDeleteConfirm(false);
        setIsOpen(false);
        if (onDeleted) onDeleted(post.id);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      {/* 3-dots trigger button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-90"
        title="ตัวเลือกโพสต์ (จุด 3 จุด)"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-white shadow-xl border border-slate-200/90 py-1.5 z-40 animate-fadeIn text-xs"
        >
          {/* 1. Show Post Info */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setShowInfoModal(true);
            }}
            className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium transition"
          >
            <Info className="w-4 h-4 text-blue-600" />
            <span>แสดงข้อมูลของโพสต์</span>
          </button>

          {/* 2. Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium transition"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4 text-slate-500" />
            )}
            <span>{copied ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์โพสต์'}</span>
          </button>

          {/* 3. Delete Post (Only if owner or admin) */}
          {canDelete && (
            <>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowDeleteConfirm(true);
                }}
                className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold transition"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>ลบโพสต์นี้ {isOwner ? '(ของฉัน)' : '(แอดมิน)'}</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Post Info Modal (แสดงข้อมูลของโพสต์)                                        */}
      {/* ========================================================================= */}
      {showInfoModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowInfoModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800"
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-xl">
                  <Info className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm">ข้อมูลและรายละเอียดของโพสต์</h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    หัวข้อโพสต์
                  </span>
                  <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {post.title}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                      <User className="w-3 h-3" /> ผู้โพสต์
                    </span>
                    <div className="font-bold text-slate-800 truncate mt-0.5">
                      {post.author}
                    </div>
                    {post.authorRole && (
                      <span className="text-[10px] text-slate-500">{post.authorRole}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                      <Calendar className="w-3 h-3" /> วันเวลาที่โพสต์
                    </span>
                    <div className="font-semibold text-slate-700 mt-0.5">
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                      <Tag className="w-3 h-3" /> หมวดหมู่
                    </span>
                    <div className="font-semibold text-slate-700 mt-0.5">
                      {post.category === 'alert'
                        ? '🚨 แจ้งเหตุด่วน'
                        : post.category === 'news'
                        ? '📰 ข่าวสาร'
                        : post.category === 'market'
                        ? '🛍️ ตลาด'
                        : post.category === 'help'
                        ? '🤝 ขอความช่วยเหลือ'
                        : '💬 ทั่วไป'}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                      <ImageIcon className="w-3 h-3" /> รูปภาพแนบ
                    </span>
                    <div className="font-semibold text-slate-700 mt-0.5">
                      {post.images && post.images.length > 0
                        ? `${post.images.length} รูปภาพ`
                        : 'ไม่มีรูปแนบ'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                    <MapPin className="w-3 h-3" /> พื้นที่และพิกัด
                  </span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {post.location
                      ? `${post.location.district ? `อ.${post.location.district}, ` : ''}จ.${post.location.province}`
                      : 'ไม่ระบุพิกัด'}
                    {post.coordinates && (
                      <span className="text-[10px] text-slate-500 block">
                        GPS: {post.coordinates.lat.toFixed(4)}, {post.coordinates.lng.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                    <Hash className="w-3 h-3" /> รหัสโพสต์ (ID)
                  </span>
                  <div className="font-mono text-[11px] text-slate-600 select-all mt-0.5">
                    {post.id}
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 flex items-center gap-1.5 transition active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowInfoModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition active:scale-95"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Delete Confirmation Modal (ยืนยันการลบโพสต์ที่ตัวเองเป็นเจ้าของ)          */}
      {/* ========================================================================= */}
      {showDeleteConfirm && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(false);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden text-slate-800 p-5 space-y-3.5 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                ยืนยันการลบโพสต์นี้?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                โพสต์ &ldquo;<span className="font-semibold text-slate-700">{post.title}</span>&rdquo; จะถูกลบออกจากระบบและไม่สามารถกู้คืนได้
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition active:scale-95"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition active:scale-95 shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <span>กำลังลบ...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบโพสต์ทันที</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
