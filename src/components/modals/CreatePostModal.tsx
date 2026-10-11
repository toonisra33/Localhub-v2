import React, { useState } from 'react';
import { X, Send, Image as ImageIcon, MapPin, Tag } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { Post } from '../../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { createPost, location, showToast } = useCommunity();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Post['category']>('general');
  const [imageUrl, setImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('กรุณากรอกหัวข้อและเนื้อหาโพสต์', 'error');
      return;
    }

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    createPost({
      title: title.trim(),
      content: content.trim(),
      category,
      images: imageUrl.trim() ? [imageUrl.trim()] : undefined,
      tags: tags.length > 0 ? tags : undefined
    });

    setTitle('');
    setContent('');
    setImageUrl('');
    setTagInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800 text-base">สร้างโพสต์ใหม่ในชุมชน</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>โพสต์ในพื้นที่: <strong className="text-slate-800">{location.province} {location.district ? `(${location.district})` : ''}</strong></span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่โพสต์</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Post['category'])}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="general">💬 พูดคุยทั่วไปในชุมชน</option>
              <option value="news">📰 ข่าวสาร / ประกาศ</option>
              <option value="help">🤝 ขอความช่วยเหลือ / ของหาย</option>
              <option value="activity">🎉 กิจกรรม / รวมกลุ่ม</option>
              <option value="alert">⚠️ เตือนภัยในพื้นที่</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">หัวข้อโพสต์ *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น หาช่างแอร์แถวซอย 23, กิจกรรมวิ่งเพื่อสุขภาพ..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">เนื้อหา *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="เล่ารายละเอียด สิ่งที่ต้องการ หรือข้อมูลที่เป็นประโยชน์ต่อเพื่อนบ้าน..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ลิงก์รูปภาพประกอบ (URL)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">แท็ก (คั่นด้วยจุลภาค ,)</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="เช่น ข่าวชุมชน, ของหาย, แนะนำร้านค้า"
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              โพสต์เลย
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
