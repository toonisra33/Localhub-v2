import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, ExternalLink } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, openPostDetail } = useCommunity();
  const { setOpenAdminModal } = useBroadcast();

  if (toasts.length === 0) return null;

  const handleToastClick = (toast: { id: string; link?: string }) => {
    if (!toast.link) return;

    if (toast.link.startsWith('post:')) {
      const postId = toast.link.replace('post:', '');
      openPostDetail(postId);
      removeToast(toast.id);
    } else if (toast.link.startsWith('broadcast:')) {
      setOpenAdminModal(true);
      removeToast(toast.id);
    }
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 pointer-events-none flex flex-col gap-2">
      {toasts.map((toast) => {
        const isClickable = Boolean(toast.link);

        return (
          <div
            key={toast.id}
            onClick={() => handleToastClick(toast)}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-fadeIn ${
              isClickable ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.99]' : ''
            } ${
              toast.type === 'success'
                ? 'bg-slate-900/95 text-white border-emerald-500/40'
                : toast.type === 'error'
                ? 'bg-red-950/95 text-white border-red-500/40'
                : 'bg-slate-900/95 text-white border-blue-500/40'
            }`}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium leading-snug truncate">
                  {toast.message}
                </p>
                {isClickable && (
                  <p className="text-[11px] text-blue-300 font-semibold flex items-center gap-1 mt-0.5">
                    แตะเพื่อเปิดดูทันที
                    <ExternalLink className="w-3 h-3" />
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
