import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  category?: string;
  fallbackType?: 'product' | 'shop' | 'food' | 'avatar' | 'general';
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

// Guaranteed offline embedded SVG data URIs that CANNOT fail under any circumstances
export function getSvgPlaceholder(category: string = '', title: string = 'สินค้าชุมชน'): string {
  const cat = category.toLowerCase();
  
  let iconSvg = '';
  let bgColor1 = '#059669';
  let bgColor2 = '#047857';
  let label = title || 'สินค้าชุมชน';

  if (cat.includes('อาหาร') || cat.includes('เครื่องดื่ม') || cat.includes('food')) {
    bgColor1 = '#d97706';
    bgColor2 = '#b45309';
    label = 'อาหาร / เครื่องดื่ม';
    iconSvg = `<path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  } else if (cat.includes('มือสอง') || cat.includes('second')) {
    bgColor1 = '#4f46e5';
    bgColor2 = '#4338ca';
    label = 'ของมือสองสภาพดี';
    iconSvg = `<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  } else if (cat.includes('เกษตร') || cat.includes('ต้นไม้') || cat.includes('ผัก')) {
    bgColor1 = '#16a34a';
    bgColor2 = '#15803d';
    label = 'ผลผลิตการเกษตร';
    iconSvg = `<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  } else if (cat.includes('ซ่อม') || cat.includes('บริการ') || cat.includes('ช่าง')) {
    bgColor1 = '#0284c7';
    bgColor2 = '#0369a1';
    label = 'บริการช่างและงานซ่อม';
    iconSvg = `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  } else if (cat.includes('อสังหา') || cat.includes('บ้าน') || cat.includes('คอนโด') || cat.includes('ที่พัก')) {
    bgColor1 = '#7c3aed';
    bgColor2 = '#6d28d9';
    label = 'อสังหาฯ และที่พัก';
    iconSvg = `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><polyline points="9 22 9 12 15 12 15 22" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  } else {
    iconSvg = `<rect x="2" y="3" width="20" height="14" rx="2" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="8" y1="21" x2="16" y2="21" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="17" x2="12" y2="21" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${bgColor2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" />
    <g transform="translate(176, 90) scale(2)">
      ${iconSvg}
    </g>
    <text x="200" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Prompt', 'Sukhumvit Set', sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">
      ${label}
    </text>
    <text x="200" y="222" font-family="-apple-system, BlinkMacSystemFont, 'Prompt', 'Sukhumvit Set', sans-serif" font-size="12" fill="rgba(255,255,255,0.8)" text-anchor="middle">
      LocalLink สินค้าและบริการในชุมชน
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Fallback high-speed curated image URLs by category
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'อาหาร/เครื่องดื่ม': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
  'ของมือสอง': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=600',
  'สินค้าเกษตร': 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600',
  'บริการซ่อม': 'https://images.unsplash.com/photo-1581092926289-e9162ab7a24f?auto=format&fit=crop&q=80&w=600',
  'อสังหาฯ/ที่พัก': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600',
  'เสื้อผ้า/แฟชั่น': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=600',
  'ทั่วไป': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'
};

export function getCategoryFallback(category?: string): string {
  if (!category) return CATEGORY_FALLBACK_IMAGES['ทั่วไป'];
  for (const key of Object.keys(CATEGORY_FALLBACK_IMAGES)) {
    if (category.includes(key) || key.includes(category)) {
      return CATEGORY_FALLBACK_IMAGES[key];
    }
  }
  return CATEGORY_FALLBACK_IMAGES['ทั่วไป'];
}

export function SafeImage({
  src,
  alt = 'รูปภาพ',
  category = '',
  fallbackType = 'product',
  className = '',
  onClick,
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src || getCategoryFallback(category));
  const [isError, setIsError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (src && src.trim()) {
      setCurrentSrc(src);
      setIsError(false);
      setIsLoaded(false);
    } else {
      setCurrentSrc(getCategoryFallback(category));
    }
  }, [src, category]);

  const handleError = () => {
    if (!isError) {
      // First attempt fallback to verified category CDN image
      setIsError(true);
      const catFallback = getCategoryFallback(category);
      if (currentSrc !== catFallback) {
        setCurrentSrc(catFallback);
      } else {
        // Guaranteed embedded SVG fallback
        setCurrentSrc(getSvgPlaceholder(category, alt));
      }
    } else {
      // Ultimate embedded SVG fallback that cannot fail
      setCurrentSrc(getSvgPlaceholder(category, alt));
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden bg-slate-100 ${className}`}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200/80 animate-pulse flex items-center justify-center pointer-events-none">
          <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      )}
      <img
        {...props}
        src={currentSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
