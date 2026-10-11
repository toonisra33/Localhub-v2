import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Heart,
  Phone,
  MapPin,
  Tag,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { MarketItem } from '../../types';

interface MarketViewProps {
  onOpenCreateItem: () => void;
}

export const MarketView: React.FC<MarketViewProps> = ({ onOpenCreateItem }) => {
  const { marketItems, likeMarketItem, location, showToast } = useCommunity();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = marketItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'produce', label: '🥦 ผักผลไม้เกษตร' },
    { id: 'food', label: '🍱 อาหารปรุงสุก' },
    { id: 'craft', label: '🧵 งานคราฟต์' },
    { id: 'secondhand', label: '📦 มือสอง' },
  ];

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-semibold mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            Local Marketplace
          </span>
          <h2 className="text-xl font-bold">ตลาดนัดชุมชน & ผลผลิตท้องถิ่น</h2>
          <p className="text-xs text-emerald-100 max-w-lg mt-0.5">
            อุดหนุนผลผลิตเกษตรอินทรีย์ สินค้าทำมือ และของใช้เพื่อนบ้านใน {location.province}
          </p>
        </div>

        <button
          onClick={onOpenCreateItem}
          className="px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          ลงขายสินค้าฟรี
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            ยังไม่มีสินค้าในหมวดหมู่นี้
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white rounded-lg text-xs font-bold">
                  ฿{item.price.toLocaleString()}
                </div>
                <button
                  onClick={() => likeMarketItem(item.id)}
                  className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-xs transition ${
                    item.isLiked ? 'bg-rose-500 text-white' : 'bg-white/80 hover:bg-white text-slate-700'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${item.isLiked ? 'fill-white' : ''}`} />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={item.sellerAvatar}
                      alt={item.seller}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-slate-600 truncate max-w-[100px]">{item.seller}</span>
                  </div>

                  <a
                    href={`tel:${item.sellerContact}`}
                    onClick={(e) => {
                      if (!item.sellerContact) {
                        e.preventDefault();
                        showToast('ผู้ขายไม่ได้ระบุเบอร์ติดต่อ', 'info');
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold transition"
                  >
                    <Phone className="w-3 h-3" />
                    ติดต่อ
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
