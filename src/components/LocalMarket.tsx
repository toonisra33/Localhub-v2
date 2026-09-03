import React, { useState } from 'react';
import { 
  Store, 
  Tag, 
  MapPin, 
  Phone, 
  PlusCircle, 
  Search, 
  Star, 
  ShieldCheck, 
  ShoppingBag,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { useCommunity } from '../context/CommunityContext';
import { AddProductModal } from './modals/AddProductModal';
import { ProductDetailModal } from './modals/ProductDetailModal';
import { FoodGuideModal } from './modals/FoodGuideModal';
import { LocalHubLogo } from './LocalHubLogo';
import { SafeImage } from './SafeImage';

export function LocalMarket() {
  const { products, showToast, userProfile } = useCommunity();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showFoodGuideModal, setShowFoodGuideModal] = useState(false);

  const categories = [
    'ทั้งหมด', 'อาหาร/เครื่องดื่ม', 'ของมือสอง', 'สินค้าเกษตร', 'บริการซ่อม', 'อสังหาฯ/ที่พัก'
  ];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedCategory === 'ทั้งหมด') return matchSearch;
    return matchSearch && p.category === selectedCategory;
  });

  return (
    <div className="pb-28 pt-4 animate-in fade-in duration-300 bg-slate-50/60 min-h-screen">
      
      {/* Sticky Header */}
      <div className="bg-white/90 backdrop-blur-xl px-5 pt-7 pb-4 border-b border-slate-200/70 sticky top-0 z-30 shadow-sm">
        <div className="flex justify-between items-center mb-3.5">
          <LocalHubLogo size="sm" variant="dark" showSubtitle={false} />
          
          <button 
            onClick={() => {
              if (userProfile.isVerified) {
                setShowAddProductModal(true);
              } else {
                showToast('กรุณายืนยันตัวตนก่อนลงขายสินค้า', 'error');
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-[12px] font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <PlusCircle size={14} />
            <span>ลงขาย</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาสินค้า อาหาร หรือบริการในชุมชน..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-5 px-5">
          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto">
        
        {/* Banner for Food Directory */}
        <div 
          onClick={() => setShowFoodGuideModal(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-[24px] p-4 text-white shadow-lg shadow-orange-500/15 flex items-center justify-between cursor-pointer group hover:scale-[1.01] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
              🍜
            </div>
            <div>
              <h3 className="font-extrabold text-[15px] leading-tight">รวมร้านเด็ด เมนูอร่อยรอบตัว</h3>
              <p className="text-[12px] text-amber-100 mt-0.5">ค้นหาร้านอาหาร ร้านกาแฟ และบริการใกล้คุณ</p>
            </div>
          </div>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-extrabold text-[15px] text-slate-900">สินค้าและของใช้ในพื้นที่ ({filteredProducts.length})</h2>
            <span className="text-[11.5px] font-semibold text-slate-400">นัดรับในชุมชนได้ทันที</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-slate-200 text-slate-400 text-[13px]">
              ไม่พบสินค้าในหมวดหมู่นี้
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group cursor-pointer"
                >
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <SafeImage
                      src={product.image}
                      alt={product.title}
                      category={product.category}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-extrabold text-slate-900 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md shadow-sm pointer-events-none z-10">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-[13.5px] leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {product.title}
                      </h3>
                      
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-[15px] font-black text-emerald-600">
                          ฿{product.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-400 pt-2 border-t border-slate-100 mt-2">
                      <span className="flex items-center gap-0.5 truncate text-slate-600">
                        <MapPin size={10} className="text-emerald-600 shrink-0" />
                        {product.distance} กม.
                      </span>
                      <span className="truncate">{product.seller}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      {showAddProductModal && <AddProductModal onClose={() => setShowAddProductModal(false)} />}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
      {showFoodGuideModal && <FoodGuideModal onClose={() => setShowFoodGuideModal(false)} />}

    </div>
  );
}
