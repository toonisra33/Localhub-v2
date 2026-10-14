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
    loginAsAdminOwner,
    loginWithGoogle,
    loginWithEmail,
    logoutFirebase,
    showToast
  } = useCommunity();

  const [activeTab, setActiveTab] = useState<'quick' | 'email'>('quick');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [asAdminCheck, setAsAdminCheck] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleQuickAdmin = () => {
    setIsLoading(true);
    try {
      loginAsAdminOwner();
      closeLoginModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      closeLoginModal();
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
    setIsLoading(true);
    try {
      loginWithEmail(emailInput.trim(), nameInput.trim() || undefined, asAdminCheck);
      closeLoginModal();
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
              <p className="text-xs text-slate-300">ยืนยันตัวตนเพื่อเข้าถึงสิทธิ์บรอดแคสต์และโพสต์</p>
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

          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'quick' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              🚀 เข้าสู่ระบบด่วน
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ✉️ เข้าสู่ระบบด้วยอีเมล
            </button>
          </div>

          {activeTab === 'quick' ? (
            <div className="space-y-3 pt-1">
              {/* Option 1: Admin 1-Click Login */}
              <button
                onClick={handleQuickAdmin}
                disabled={isLoading}
                className="w-full p-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-bold shadow-md shadow-red-600/20 transition flex items-center justify-between group active:scale-[0.98] text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold">เข้าสู่ระบบ Admin ทันที</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">1-Click</span>
                    </div>
                    <p className="text-xs text-red-100 mt-0.5">{ORIGINAL_ADMIN_EMAIL}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 2: Google Sign In */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full p-3.5 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-300 rounded-2xl font-bold transition flex items-center justify-between active:scale-[0.98]"
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
                <LogIn className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomEmailLogin} className="space-y-3 pt-1">
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
                  ชื่อที่แสดง (Display Name)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="เช่น อิศราวัฒน์ (Admin) หรือ นายสมชาย"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden transition"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">เปิดสิทธิ์ผู้ดูแลระบบ (Admin Role)</p>
                  <p className="text-[11px] text-slate-500">เพื่อส่งบรอดแคสต์และทดสอบไซเรน</p>
                </div>
                <input
                  type="checkbox"
                  checked={asAdminCheck}
                  onChange={(e) => setAsAdminCheck(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>ยืนยันเข้าสู่ระบบ</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
