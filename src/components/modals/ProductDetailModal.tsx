import React, { useState } from 'react';
import { X, Phone, MessageSquare, MapPin, Tag, Share2, ShieldCheck, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCommunity } from '../../context/CommunityContext';
import { SafeImage } from '../SafeImage';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { showToast, openMediaViewer } = useCommunity();
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setIsCopied(true);
    showToast('🔗 คัดลอกลิงก์สินค้าแล้ว');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleContactChat = () => {
    showToast(`💬 กำลังเริ่มแชทกับผู้ขาย "${product.seller}"`);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-150 bg-white z-10 shrink-0">
          <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            {product.category}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              title="แชร์สินค้า"
            >
              {isCopied ? <Check size={15} className="text-emerald-600" /> : <Share2 size={15} />}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          
          <div 
            onClick={() => openMediaViewer({
              url: product.image,
              type: 'image',
              title: product.title,
              subtitle: `ราคา ฿${product.price.toLocaleString()} • ผู้ขาย: ${product.seller}`
            })}
            className="rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 shadow-sm cursor-pointer relative group"
          >
            <SafeImage
              src={product.image}
              alt={product.title}
              category={product.category}
              className="w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none z-10">
              <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20">
                แตะเพื่อดูภาพเต็มจอ
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <span className="text-[24px] font-black text-emerald-600 tracking-tight">
                ฿{product.price.toLocaleString()}
              </span>
              <span className="text-[12px] font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl">
                <MapPin size={12} className="text-emerald-600" />
                ห่างจากคุณ {product.distance} กม.
              </span>
            </div>

            <h2 className="font-extrabold text-slate-900 text-[18px] leading-snug">
              {product.title}
            </h2>
          </div>

          {/* Description */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 space-y-1.5">
            <h4 className="text-[12px] font-bold text-slate-500">รายละเอียดสินค้า</h4>
            <p className="text-[13.5px] text-slate-800 leading-relaxed font-normal">
              {product.description || 'สินค้าคุณภาพดี สภาพตรงตามรูปภาพ สนใจสอบถามหรือขอดูรูปเพิ่มเติมได้ครับ'}
            </p>
            {product.locationName && (
              <p className="text-[11.5px] text-slate-500 font-medium pt-1">
                📍 จุดนัดรับ/ส่งของ: <span className="font-bold text-slate-700">{product.locationName}</span>
              </p>
            )}
          </div>

          {/* Seller Card */}
          <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                {product.seller.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="font-extrabold text-[13.5px] text-slate-900">{product.seller}</h4>
                  <ShieldCheck size={14} className="text-emerald-600" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-700">สมาชิกชุมชนยืนยันตัวตนแล้ว</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-150 bg-white flex gap-2.5 shrink-0">
          <button
            onClick={handleContactChat}
            className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[13px] flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare size={16} />
            ส่งข้อความแชท
          </button>

          <a
            href={`tel:${product.sellerPhone || '0812345678'}`}
            onClick={() => showToast(`📞 กำลังโทรหาผู้ขาย: ${product.sellerPhone || '081-234-5678'}`)}
            className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 active:scale-95"
          >
            <Phone size={16} />
            โทรติดต่อผู้ขาย
          </a>
        </div>

      </div>
    </div>
  );
}
