import React, { useState, useRef } from 'react';
import { X, ShoppingBag, Camera, MapPin, Tag, Upload, Image as ImageIcon } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { SafeImage, getCategoryFallback } from '../SafeImage';

interface AddProductModalProps {
  onClose: () => void;
}

export function AddProductModal({ onClose }: AddProductModalProps) {
  const { addProduct, showToast, location, openMediaViewer } = useCommunity();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('ของมือสอง');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState(`ต.${location.subdistrict}`);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'ของมือสอง', 'อาหาร/เครื่องดื่ม', 'สินค้าเกษตร', 'บริการซ่อม', 'อสังหาฯ/ที่พัก', 'เสื้อผ้า/แฟชั่น'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
        showToast('📸 แนบรูปสินค้าสำเร็จ');
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      showToast('เกิดข้อผิดพลาดในการโหลดรูปภาพ', 'error');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePickCategoryPreset = () => {
    setIsUploading(true);
    setTimeout(() => {
      const presetUrl = getCategoryFallback(category);
      setImageUrl(presetUrl);
      setIsUploading(false);
      showToast('✨ เลือกรูปภาพตามหมวดหมู่สำเร็จ');
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      showToast('กรุณากรอกชื่อสินค้าและราคา', 'error');
      return;
    }

    const finalImage = imageUrl || getCategoryFallback(category);

    addProduct({
      title: title.trim(),
      price: parseFloat(price) || 0,
      category,
      description: description.trim(),
      locationName: locationName.trim(),
      image: finalImage
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">ลงขายสินค้าในย่าน</h2>
              <p className="text-[11.5px] font-medium text-slate-500">ซื้อขายง่าย ปลอดภัย นัดรับใกล้บ้าน</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Category */}
          <div>
            <label className="block text-[11.5px] font-bold text-slate-600 mb-1.5">หมวดหมู่</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11.5px] font-bold transition-all border ${
                    category === cat
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">ชื่อสินค้า/บริการ <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              placeholder="เช่น พัดลมตั้งโต๊ะ สภาพดีใช้งานปกติ"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">ราคา (บาท) <span className="text-rose-500">*</span></label>
            <input
              type="number"
              required
              min="0"
              placeholder="เช่น 250"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">รายละเอียดสินค้า</label>
            <textarea
              rows={3}
              placeholder="สภาพสินค้า ตำหนิ หรือสิ่งที่แถมให้..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Location / Meeting point */}
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">จุดนัดรับ / ส่งของ</label>
            <input
              type="text"
              placeholder="เช่น หน้าปากซอย 35, คอนโดใกล้ BTS"
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
            />
          </div>

          {/* Photo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[12px] font-bold text-slate-700">รูปถ่ายสินค้า</label>
              <span className="text-[11px] font-medium text-slate-400">รูปคมชัด แสดงผลได้ 100%</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-44 bg-slate-900 group">
                <SafeImage 
                  src={imageUrl} 
                  alt="Product preview" 
                  category={category}
                  onClick={() => openMediaViewer({
                    url: imageUrl,
                    type: 'image',
                    title: title || 'รูปถ่ายสินค้า',
                    subtitle: price ? `ราคา ฿${price}` : `หมวดหมู่: ${category}`
                  })}
                  className="w-full h-44 cursor-pointer group-hover:scale-105 transition-transform duration-300" 
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 bg-slate-950/80 text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors z-20 shadow-md"
                >
                  <X size={14} />
                </button>
                <div 
                  onClick={() => openMediaViewer({
                    url: imageUrl,
                    type: 'image',
                    title: title || 'รูปถ่ายสินค้า',
                    subtitle: price ? `ราคา ฿${price}` : `หมวดหมู่: ${category}`
                  })}
                  className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md text-white text-[10.5px] font-bold px-2.5 py-1 rounded-lg border border-white/20 cursor-pointer pointer-events-none z-20"
                >
                  แตะเพื่อดูรูปเต็มจอ
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-3.5 border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl bg-slate-50 hover:bg-emerald-50/30 text-slate-700 hover:text-emerald-700 flex items-center justify-center gap-2 text-[13px] font-bold transition-all shadow-sm"
                >
                  <Upload size={18} className="text-emerald-600" />
                  <span>{isUploading ? 'กำลังประมวลผลรูปภาพ...' : 'อัปโหลดภาพถ่ายจากอุปกรณ์ / ถ่ายรูป'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePickCategoryPreset}
                  disabled={isUploading}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ImageIcon size={14} />
                  <span>ใช้รูปภาพแนะนำสำหรับหมวด "{category}"</span>
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-[13.5px] hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13.5px] shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ShoppingBag size={16} />
              ลงขายสินค้า
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
