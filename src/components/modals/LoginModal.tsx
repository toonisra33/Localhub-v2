import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  CheckCircle2,
  LogOut,
  Loader2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import firebaseConfig from '../../../firebase-applet-config.json';

declare global {
  interface Window {
    google?: any;
  }
}

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    closeLoginModal,
    currentUser,
    isAdmin,
    loginWithGoogle,
    loginWithGoogleCredential,
    logoutFirebase
  } = useCommunity();

  const [isLoading, setIsLoading] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services (GSI) when modal opens
  useEffect(() => {
    if (!isLoginModalOpen) return;

    let isMounted = true;

    const initGSI = () => {
      try {
        if (typeof window !== 'undefined' && window.google?.accounts?.id && firebaseConfig.oAuthClientId) {
          window.google.accounts.id.initialize({
            client_id: firebaseConfig.oAuthClientId,
            callback: async (response: any) => {
              if (!isMounted) return;
              if (response?.credential) {
                setIsLoading(true);
                try {
                  const success = await loginWithGoogleCredential(response.credential);
                  if (success) {
                    closeLoginModal();
                  }
                } finally {
                  if (isMounted) setIsLoading(false);
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render official Google button into container if ref exists
          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'continue_with',
              shape: 'pill',
              logo_alignment: 'left',
            });
          }
        }
      } catch (err) {
        console.warn('Google Identity Services notice:', err);
      }
    };

    const timer = setTimeout(initGSI, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isLoginModalOpen, loginWithGoogleCredential, closeLoginModal]);

  if (!isLoginModalOpen) return null;

  // Real Google Sign-In Popup Handler: Opens Google Account Chooser
  const handleGoogleSignInClick = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        closeLoginModal();
      }
    } catch (err: any) {
      console.warn('Google Sign-In click error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeLoginModal();
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md flex items-center justify-center bg-blue-950 border border-blue-400/30 shrink-0">
              <img
                src="./icon.svg"
                alt="LocalHub Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-1.5">
                <span>เข้าสู่ระบบ LocalHub</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-300">เลือกบัญชี Google เพื่อใช้งานระบบจริง</p>
            </div>
          </div>

          <button
            onClick={closeLoginModal}
            aria-label="ปิดหน้าต่างเข้าสู่ระบบ"
            className="p-1.5 rounded-xl hover:bg-white/10 active:scale-90 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Active Account Status (If already logged in) */}
          {currentUser && currentUser.email ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  เข้าสู่ระบบอยู่แล้วในขณะนี้
                </span>
                {isAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black border border-red-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    ผู้ดูแลระบบ
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black border border-slate-200 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    สมาชิกชุมชน
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <img
                  src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt="avatar"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/40"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{currentUser.displayName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={async () => {
                    await logoutFirebase();
                    closeLoginModal();
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition shrink-0 active:scale-95 flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">เข้าใช้งานด้วยบัญชี Google ของคุณ</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  กดปุ่มด้านล่างเพื่อเลือกบัญชี Google บนอุปกรณ์ของคุณอย่างปลอดภัย
                </p>
              </div>
            </div>
          )}

          {/* OFFICIAL GOOGLE SIGN-IN BUTTON & SELECTION */}
          <div className="space-y-3 pt-1">
            {/* Official GSI Button Container (if supported) */}
            <div ref={googleBtnContainerRef} className="w-full min-h-[44px] flex items-center justify-center empty:hidden" />

            {/* Official Google Account Picker Button */}
            <button
              type="button"
              onClick={handleGoogleSignInClick}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border-2 border-slate-300 hover:border-blue-500 rounded-2xl font-bold transition flex items-center justify-center gap-3 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span className="text-xs sm:text-sm font-black text-slate-800">
                {isLoading ? 'กำลังเปิดหน้าต่าง Google...' : 'เข้าสู่ระบบด้วย Google'}
              </span>
            </button>

            <p className="text-[11px] text-center text-slate-500 leading-relaxed px-3">
              ระบบจะเปิดหน้าต่างของ Google ให้คุณเลือกบัญชีอีเมล (@gmail.com) บนอุปกรณ์ของคุณ เพื่อเข้าสู่ระบบอย่างเป็นทางการ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
