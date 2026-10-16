import React, { useState } from 'react';
import {
  X,
  Shield,
  User,
  Mail,
  CheckCircle2,
  LogIn,
  LogOut,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useCommunity, ORIGINAL_ADMIN_EMAIL } from '../../context/CommunityContext';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    closeLoginModal,
    currentUser,
    isAdmin,
    loginWithGoogle,
    loginWithEmail,
    logoutFirebase,
    showToast
  } = useCommunity();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        closeLoginModal();
      }
    } catch {
      // error handled in loginWithGoogle
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      showToast('กรุณากรอกอีเมลของคุณ', 'error');
      return;
    }
    if (!passwordInput.trim()) {
      showToast('กรุณากรอกรหัสผ่านของคุณ', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const ok = loginWithEmail(emailInput.trim(), passwordInput.trim(), nameInput.trim() || undefined);
      if (ok) {
        closeLoginModal();
      }
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
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">เข้าสู่ระบบ LocalHub</h2>
              <p className="text-xs text-slate-300">ยืนยันตัวตนเพื่อเข้าสู่ระบบตามสิทธิ์การใช้งานปกติ</p>
            </div>
          </div>

          <button
            onClick={closeLoginModal}
            className="p-1.5 rounded-xl hover:bg-white/10 active:scale-90 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Current Status Card */}
          {currentUser && currentUser.email ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  เข้าสู่ระบบอยู่แล้ว
                </span>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black border border-red-200">
                    🛡️ ผู้ดูแลระบบ (Admin)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <img
                  src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{currentUser.displayName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={async () => {
                    await logoutFirebase();
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition shrink-0 active:scale-95 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออก</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">กำลังใช้งานในโหมดผู้เยี่ยมชม</p>
                <p className="text-[11px] text-slate-500">เข้าสู่ระบบเพื่อใช้งานสิทธิ์สร้างบรอดแคสต์และโพสต์</p>
              </div>
            </div>
          )}

          {/* Normal Standard Login Methods */}
          <div className="space-y-3 pt-1">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full p-3.5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-emerald-500 rounded-2xl font-bold transition flex items-center justify-between active:scale-[0.98] shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-base">
                  🌐
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">เข้าสู่ระบบด้วย Google Account</p>
                  <p className="text-[11px] text-slate-500">Google OAuth / Firebase Authentication</p>
                </div>
              </div>
              <LogIn className="w-4 h-4 text-emerald-600" />
            </button>

            {/* Email & Password Normal Sign In Form */}
            <form onSubmit={handleCustomEmailLogin} className="space-y-3 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700">หรือระบุอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบปกติ:</div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมล (Email) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="toonisra33@gmail.com หรืออีเมลของคุณ"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่าน (Password) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="กรอกรหัสผ่านของคุณ"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อที่แสดง (Display Name)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="เช่น อิศราวัฒน์ หรือ สมชาย"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </button>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                🛡️ <strong>ความปลอดภัย:</strong> สิทธิ์แอดมิน (Admin) สงวนไว้สำหรับ <strong>{ORIGINAL_ADMIN_EMAIL}</strong> พร้อมรหัสผ่านเท่านั้น ผู้ใช้งานทั่วไปจะเข้าสู่ระบบเป็นสมาชิกปกติ
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
