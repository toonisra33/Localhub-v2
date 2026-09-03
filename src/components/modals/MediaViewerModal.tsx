import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2, Share2, Play, Pause, Volume2, VolumeX } from 'lucide-react';

export interface MediaViewerData {
  url: string;
  type: 'image' | 'video';
  title?: string;
  subtitle?: string;
}

interface MediaViewerModalProps {
  media: MediaViewerData | null;
  onClose: () => void;
}

export function MediaViewerModal({ media, onClose }: MediaViewerModalProps) {
  const [scale, setScale] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Reset state whenever media changes
    setScale(1);
    setIsPlaying(true);
  }, [media]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!media) return null;

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.3, 0.7));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  const handleDownload = async () => {
    try {
      const a = document.createElement('a');
      a.href = media.url;
      a.download = media.title || 'media-locallink';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(media.url, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none overflow-hidden"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div 
        className="w-full max-w-4xl flex items-center justify-between text-white py-2 z-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col min-w-0 pr-4">
          <h3 className="font-extrabold text-[15px] sm:text-[17px] text-white truncate drop-shadow-md">
            {media.title || (media.type === 'video' ? 'วิดีโอ (โหมดเต็มหน้าจอ)' : 'รูปภาพ (โหมดเต็มหน้าจอ)')}
          </h3>
          {media.subtitle && (
            <p className="text-[12px] text-slate-300 truncate">{media.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {media.type === 'image' && (
            <div className="hidden sm:flex items-center bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/15">
              <button
                onClick={handleZoomIn}
                title="ขยายรูป"
                className="w-9 h-9 flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={handleZoomOut}
                title="ย่อรูป"
                className="w-9 h-9 flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
              >
                <ZoomOut size={18} />
              </button>
              <button
                onClick={handleResetZoom}
                title="รีเซ็ตขนาด"
                className="w-9 h-9 flex items-center justify-center text-slate-200 hover:text-white hover:bg-white/15 rounded-xl transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          )}

          <button
            onClick={handleDownload}
            title="เปิดรูปภาพ/วิดีโอในแท็บใหม่"
            className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center border border-white/15 transition-all active:scale-95"
          >
            <Download size={18} />
          </button>

          <button
            onClick={onClose}
            title="ปิด (Esc)"
            className="w-10 h-10 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-950/40 transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Media Center Stage */}
      <div 
        className="w-full flex-1 flex items-center justify-center relative overflow-hidden py-4"
        onClick={onClose}
      >
        {media.type === 'image' ? (
          <div 
            className="transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
            style={{ transform: `scale(${scale})` }}
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={media.url} 
              alt={media.title || 'Full view'} 
              className="max-w-[95vw] sm:max-w-[85vw] max-h-[75vh] object-contain rounded-2xl shadow-2xl ring-1 ring-white/10"
              style={{ cursor: scale > 1 ? 'grab' : 'zoom-in' }}
              onClick={() => setScale(prev => prev === 1 ? 1.6 : 1)}
            />
          </div>
        ) : (
          <div 
            className="max-w-[95vw] sm:max-w-[85vw] max-h-[75vh] w-full max-w-3xl flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <video 
              src={media.url} 
              controls 
              autoPlay 
              playsInline
              className="w-full max-h-[75vh] rounded-2xl shadow-2xl bg-black ring-1 ring-white/15 object-contain"
            />
          </div>
        )}
      </div>

      {/* Bottom Floating Hint */}
      <div 
        className="text-center py-2 z-10"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-[12px] text-slate-400 font-medium bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 inline-flex items-center gap-2 shadow-lg">
          <Maximize2 size={13} className="text-emerald-400" />
          <span>แตะที่รูปเพื่อย่อ/ขยาย หรือกดปุ่ม ✕ เพื่อปิด</span>
        </p>
      </div>
    </div>
  );
}
