import React, { useState } from 'react';
import { X, Plus, ShoppingBag, MapPin, Tag } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { MarketItem } from '../../types';

interface CreateMarketItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateMarketItemModal: React.FC<CreateMarketItemModalProps> = ({ isOpen, onClose }) => {
  const { addMarketItem, location, showToast } = useCommunity();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<MarketItem['category']>('produce');
  const [sellerContact, setSellerContact] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      showToast('กรุณากรอกชื่อสินค้าและราคา', 'error');
      return;
    }

    addMarketItem({
      title: title.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      category,
      seller: 'คุณ (ผู้ขายในพื้นที่)',
      sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      sellerContact: sellerContact.trim() || '081-000-0000',
      images: imageUrl.trim()
        ? [imageUrl.trim()]
        : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'],
      province: location.province,
      district: location.district || 'เมือง',
      isAvailable: true,
    });

    setTitle('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setSellerContact('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-800 text-base">ลงขายสินค้าในตลาดนัดชุมชน</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่สินค้า</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MarketItem['category'])}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="produce">🥦 ผักผลไม้ / ผลผลิตเกษตรอินทรีย์</option>
              <option value="food">🍱 อาหารปรุงสุก / เบเกอรี่ / ของกินเล่น</option>
              <option value="craft">🧵 งานฝีมือ / สินค้าทำมือ / ของแต่งบ้าน</option>
              <option value="secondhand">📦 สินค้ามือสองสภาพดี</option>
              <option value="service">🛠️ บริการ / ซ่อมแซม / รับจ้างทั่วไป</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อสินค้า *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ผักสลัดไฮโดรโปนิกส์ สดตัดเช้า, ขนมเปี๊ยะอบควันเทียน..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ราคา (บาท) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="เช่น 50"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทร / Line ID</label>
              <input
                type="text"
                value={sellerContact}
                onChange={(e) => setSellerContact(e.target.value)}
                placeholder="08X-XXX-XXXX"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดสินค้า</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="วิธีส่ง นัดรับหน้าหมู่บ้าน หรือจัดส่งพัสดุ..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ลิงก์รูปภาพสินค้า (URL)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-emerald-500"
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              ลงขายสินค้า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
