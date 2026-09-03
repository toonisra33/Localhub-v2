import React from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useCommunity();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 pointer-events-none flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border text-[13px] font-bold backdrop-blur-xl animate-in slide-in-from-top duration-200 transition-all ${
            toast.type === 'success'
              ? 'bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-950/20'
              : toast.type === 'error'
              ? 'bg-rose-900/95 text-white border-rose-500/40 shadow-rose-950/20'
              : 'bg-slate-900/95 text-white border-slate-700/80 shadow-slate-950/20'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.type === 'success' ? (
              <CheckCircle size={17} className="text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle size={17} className="text-rose-400 shrink-0" />
            ) : (
              <Info size={17} className="text-sky-400 shrink-0" />
            )}
            <span className="truncate">{toast.message}</span>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
