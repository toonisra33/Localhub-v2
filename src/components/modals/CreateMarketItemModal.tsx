import React, { useState, useRef } from 'react';
import { X, Plus, ShoppingBag, MapPin, Tag, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { MarketItem } from '../../types';
import { saveMediaFile } from '../../utils/mediaStorage';

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
  const [images, setImages] = useState<string[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCaptureCamera = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingImage(true);
    try {
      const file = files[0];
      const saved = await saveMediaFile(file, `market_${Date.now()}_${file.name}`);
      setImages((prev) => [...prev, saved.objectUrl]);
      showToast('📸 ถ่ายภาพสินค้าเรียบร้อย!', 'success');
    } catch {
      showToast('ไม่สามารถบันทึกภาพถ่ายได้', 'error');
    } finally {
      setIsProcessingImage(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleSelectGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsProcessingImage(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const saved = await saveMediaFile(file, `market_${Date.now()}_${file.name}`);
        newUrls.push(saved.objectUrl);
      }
      setImages((prev) => [...prev, ...newUrls]);
      showToast(`🖼️ แนบรูปภาพ ${newUrls.length} รูปเรียบร้อย!`, 'success');
    } catch {
      showToast('เกิดข้อผิดพลาดในการโหลดรูปภาพ', 'error');
    } finally {
      setIsProcessingImage(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) {
      showToast('กรุณากรอกชื่อสินค้าและราคา', 'error');
      return;
    }

    const shopCoords = location.lat && location.lng ? { lat: location.lat, lng: location.lng } : undefined;

    addMarketItem({
      title: title.trim(),
      description: description.trim(),
      price: Number(price) || 0,
      category,
      seller: 'คุณ (ร้านค้าที่ลงทะเบียน)',
      sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      sellerContact: sellerContact.trim() || '081-000-0000',
      images:
        images.length > 0
          ? images
          : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'],
      province: location.province,
      district: location.district || 'เมือง',
      coordinates: shopCoords,
      isAvailable: true
    });

    showToast('🛍️ ลงทะเบียนร้านค้าสำเร็จ! ตำแหน่งร้านจะปรากฏบนแผนที่รอบตัว', 'success');

    setTitle('');
    setDescription('');
    setPrice('');
    setImages([]);
    setSellerContact('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      {/* Hidden inputs for camera capture & gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCaptureCamera}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleSelectGallery}
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">ลงขายสินค้าในตลาดนัดชุมชน</h3>
              <p className="text-xs text-amber-800">ส่งต่อสินค้า ผลผลิต หรือของมือสองให้คนในพื้นที่</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่สินค้า</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MarketItem['category'])}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
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
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
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
                placeholder="เช่น 150"
                min="0"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรติดต่อ</label>
              <input
                type="text"
                value={sellerContact}
                onChange={(e) => setSellerContact(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดสินค้า</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="จุดเด่นสินค้า สภาพสินค้า พิกัดนัดรับ หรือบริการส่งฟรี..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-amber-500 leading-relaxed font-medium"
            />
          </div>

          {/* Camera Capture and Photo Upload Section (ตรงตามที่สั่ง: มีปุ่มกล้องและอัปโหลดรูปภาพ) */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">รูปภาพสินค้า</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="p-2.5 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border-2 border-amber-300 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs"
                title="เปิดกล้องถ่ายภาพสินค้าสด"
              >
                <Camera className="w-4 h-4 text-amber-600" />
                <span>📷 ถ่ายรูปสินค้าสด</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs"
                title="เลือกรูปภาพสินค้าจากคลังภาพในเครื่อง"
              >
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>🖼️ อัปโหลดรูปภาพ</span>
              </button>
            </div>

            {/* Thumbnail Preview of Attached Images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={img} alt={`market_attach_${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-red-600 transition"
                      title="ลบรูปนี้"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isProcessingImage}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>ลงขายสินค้า</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
