import React, { useState, useEffect } from 'react';
import { Eye, ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';

interface PostImageGalleryProps {
  images?: string[];
  maxDisplay?: number;
  className?: string;
  onImageClick?: (url: string, index: number, allImages: string[]) => void;
}

export const PostImageGallery: React.FC<PostImageGalleryProps> = ({
  images = [],
  maxDisplay = 4,
  className = '',
  onImageClick
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const validImages = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
  if (validImages.length === 0) return null;

  const visibleImages = validImages.slice(0, maxDisplay);
  const totalCount = validImages.length;
  const hasMore = totalCount > maxDisplay;
  const extraCount = totalCount - maxDisplay;

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % totalCount);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + totalCount) % totalCount);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, totalCount]);

  const handleOpenPhoto = (index: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex(index);
    setLightboxOpen(true);
    if (onImageClick) {
      onImageClick(validImages[index], index, validImages);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % totalCount);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + totalCount) % totalCount);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* 1 Image: Full Display without cropping (เต็มภาพ) */}
      {visibleImages.length === 1 && (
        <div
          onClick={(e) => handleOpenPhoto(0, e)}
          className="relative w-full rounded-2xl overflow-hidden bg-slate-900/5 border border-slate-200/80 cursor-pointer group flex items-center justify-center max-h-[460px]"
        >
          <img
            src={visibleImages[0]}
            alt="Media 1"
            className="w-full max-h-[460px] object-contain group-hover:scale-[1.01] transition-transform duration-200"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <span className="p-2.5 bg-black/60 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5 text-xs font-bold">
              <Eye className="w-4 h-4 drop-shadow" />
              <span>ดูเต็มภาพ</span>
            </span>
          </div>
        </div>
      )}

      {/* 2 Images: 2 Column Grid (เต็มภาพ ไม่ตัดขอบ) */}
      {visibleImages.length === 2 && (
        <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
          {visibleImages.map((img, idx) => (
            <div
              key={idx}
              onClick={(e) => handleOpenPhoto(idx, e)}
              className="relative h-48 sm:h-60 rounded-xl overflow-hidden bg-slate-900/5 border border-slate-200/80 cursor-pointer group flex items-center justify-center"
            >
              <img
                src={img}
                alt={`Media ${idx + 1}`}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <span className="p-2 bg-black/60 rounded-full shadow-md backdrop-blur-xs">
                  <Eye className="w-4 h-4 drop-shadow" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3 Images: 3 Column Grid (เต็มภาพ) */}
      {visibleImages.length === 3 && (
        <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
          {visibleImages.map((img, idx) => (
            <div
              key={idx}
              onClick={(e) => handleOpenPhoto(idx, e)}
              className="relative h-40 sm:h-52 rounded-xl overflow-hidden bg-slate-900/5 border border-slate-200/80 cursor-pointer group flex items-center justify-center"
            >
              <img
                src={img}
                alt={`Media ${idx + 1}`}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <span className="p-2 bg-black/60 rounded-full shadow-md backdrop-blur-xs">
                  <Eye className="w-4 h-4 drop-shadow" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4 Images or More: Max 4 Displayed with +N overlay on 4th item if > 4 */}
      {visibleImages.length === 4 && (
        <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
          {visibleImages.map((img, idx) => {
            const isFourthAndHasMore = idx === 3 && hasMore;
            return (
              <div
                key={idx}
                onClick={(e) => handleOpenPhoto(idx, e)}
                className="relative h-44 sm:h-56 rounded-xl overflow-hidden bg-slate-900/5 border border-slate-200/80 cursor-pointer group flex items-center justify-center"
              >
                <img
                  src={img}
                  alt={`Media ${idx + 1}`}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />

                {isFourthAndHasMore ? (
                  <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-colors hover:bg-slate-950/85">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow">
                      +{extraCount + 1}
                    </span>
                    <span className="text-xs font-bold text-white mt-1 px-3 py-1 bg-white/25 rounded-full shadow-xs flex items-center gap-1 border border-white/20">
                      <ImageIcon className="w-3.5 h-3.5" />
                      กดดูเพิ่มเติม
                    </span>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <span className="p-2 bg-black/60 rounded-full shadow-md backdrop-blur-xs">
                      <Eye className="w-4 h-4 drop-shadow" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Explicit "กดดูเพิ่มเติม" Action Bar if there are more than 4 images */}
      {hasMore && (
        <button
          type="button"
          onClick={(e) => handleOpenPhoto(3, e)}
          className="w-full mt-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer shadow-2xs"
        >
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          <span>กดดูรูปภาพเพิ่มเติมทั้งหมด ({totalCount} รูป)</span>
        </button>
      )}

      {/* Lightbox / Full Photo Viewer Modal (เต็มภาพ & สามารถเลื่อนดูได้ทุกภาพ) */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm flex flex-col items-center justify-between p-3 sm:p-5 animate-fadeIn select-none"
        >
          {/* Top Bar */}
          <div className="w-full max-w-4xl flex items-center justify-between text-white pb-2 px-2 z-10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold bg-white/20 px-3 py-1 rounded-full border border-white/20">
                รูปภาพที่ {currentIndex + 1} จากทั้งหมด {totalCount} รูป
              </span>
              <span className="text-[11px] text-white/70 hidden sm:inline">
                (กดลูกศร ซ้าย-ขวา หรือ Esc เพื่อปิด)
              </span>
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/20 hover:bg-rose-600 text-white transition cursor-pointer active:scale-95 shadow-md"
              title="ปิดหน้าต่างรูปภาพ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Full Image View (เต็มภาพ object-contain) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl flex-1 flex items-center justify-center overflow-hidden my-auto"
          >
            <img
              src={validImages[currentIndex]}
              alt={`Photo preview ${currentIndex + 1}`}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-all"
            />

            {/* Prev Button */}
            {totalCount > 1 && (
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer shadow-lg active:scale-95 border border-white/10"
                title="ภาพก่อนหน้า"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Button */}
            {totalCount > 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer shadow-lg active:scale-95 border border-white/10"
                title="ภาพถัดไป"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {totalCount > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 mt-2 max-w-full overflow-x-auto py-2 px-3 bg-black/50 rounded-2xl backdrop-blur-md shrink-0 border border-white/10"
            >
              {validImages.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition shrink-0 bg-slate-900 ${
                    idx === currentIndex
                      ? 'border-emerald-500 scale-105 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  title={`ดูภาพที่ ${idx + 1}`}
                >
                  <img src={thumb} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
