import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  CheckCircle2,
  LogIn,
  LogOut,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Plus,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useCommunity, ORIGINAL_ADMIN_EMAIL } from '../../context/CommunityContext';

interface GoogleAccountPreset {
  email: string;
  displayName: string;
  photoURL: string;
  roleDescription: string;
  isAdminAccount: boolean;
}

const GOOGLE_PRESET_ACCOUNTS: GoogleAccountPreset[] = [
  {
    email: ORIGINAL_ADMIN_EMAIL,
    displayName: 'อิศราวัฒน์ ปวินทกานต์',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    roleDescription: '🛡️ ผู้ดูแลระบบ (Admin) — ต้องยืนยันรหัสผ่าน',
    isAdminAccount: true,
  },
  {
    email: 'somchai.bkk@gmail.com',
    displayName: 'สมชาย ประเสริฐสุข',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    roleDescription: '👤 สมาชิกชุมชนทั่วไป (Member)',
    isAdminAccount: false,
  },
  {
    email: 'ploy.sukhumvit@gmail.com',
    displayName: 'พลอย ศรีสุข',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    roleDescription: '👤 สมาชิกชุมชนทั่วไป (Member)',
    isAdminAccount: false,
  }
];

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    closeLoginModal,
    currentUser,
    isAdmin,
    isEligibleAdmin,
    loginWithGoogle,
    loginWithGoogleAccount,
    loginWithEmail,
    logoutFirebase,
    showToast
  } = useCommunity();

  const [activeTab, setActiveTab] = useState<'google' | 'email'>('google');

  // Google Account Chooser State
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<GoogleAccountPreset | null>(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showCustomGoogleForm, setShowCustomGoogleForm] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleAdminPass, setCustomGoogleAdminPass] = useState('');

  // Email tab state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  // Handle Preset Google Account Selection
  const handleSelectPresetAccount = (acc: GoogleAccountPreset) => {
    if (acc.isAdminAccount) {
      setSelectedGoogleAccount(acc);
      setAdminPasswordInput('');
      return;
    }

    // Regular accounts sign in immediately
    setIsLoading(true);
    try {
      const ok = loginWithGoogleAccount({
        email: acc.email,
        displayName: acc.displayName,
        photoURL: acc.photoURL
      });
      if (ok) {
        closeLoginModal();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm Admin Login with Password
  const handleConfirmAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasswordInput.trim()) {
      showToast('กรุณากรอกรหัสผ่านผู้ดูแลระบบสำหรับ toonisra33@gmail.com', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const ok = loginWithGoogleAccount(
        {
          email: ORIGINAL_ADMIN_EMAIL,
          displayName: 'อิศราวัฒน์ ปวินทกานต์ (Admin)',
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
        },
        adminPasswordInput.trim()
      );
      if (ok) {
        closeLoginModal();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Custom Google Account Input
  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = customGoogleEmail.trim().toLowerCase();
    if (!email) {
      showToast('กรุณากรอกอีเมล Google (@gmail.com)', 'error');
      return;
    }
    if (!email.includes('@')) {
      showToast('รูปแบบอีเมลไม่ถูกต้อง', 'error');
      return;
    }

    const isOwner = email === ORIGINAL_ADMIN_EMAIL.toLowerCase();
    if (isOwner && !customGoogleAdminPass.trim()) {
      showToast('กรุณาระบุรหัสผ่านผู้ดูแลระบบสำหรับ toonisra33@gmail.com', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const ok = loginWithGoogleAccount(
        {
          email,
          displayName: customGoogleName.trim() || undefined
        },
        isOwner ? customGoogleAdminPass.trim() : undefined
      );
      if (ok) {
        closeLoginModal();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Browser Native Google OAuth Popup
  const handleBrowserOAuthPopup = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        closeLoginModal();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Email & Password Login
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
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with App Logo */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-blue-950 border border-blue-400/30 shrink-0">
              <img
                src="./icon.svg"
                alt="LocalHub Logo"
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg leading-tight">เข้าสู่ระบบ LocalHub</h2>
              <p className="text-xs text-slate-300">เลือกบัญชี Google เพื่อใช้งานระบบจริง</p>
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
                  กำลังเข้าสู่ระบบในชื่อ
                </span>
                {isEligibleAdmin && isAdmin ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black border border-red-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    แอดมิน (Admin)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black border border-slate-200 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    สมาชิกทั่วไป (User)
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
                    closeLoginModal();
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition shrink-0 active:scale-95 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">กำลังใช้งานในโหมดผู้เยี่ยมชม (Guest)</p>
                <p className="text-[11px] text-slate-500">เข้าสู่ระบบเพื่อใช้งานโพสต์ บรอดแคสต์ และตลาดชุมชน</p>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab('google');
                setSelectedGoogleAccount(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'google' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>เข้าสู่ระบบด้วย Google</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('email');
                setSelectedGoogleAccount(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>อีเมลและรหัสผ่าน</span>
            </button>
          </div>

          {/* TAB 1: GOOGLE ACCOUNT CHOOSER (แก้ปัญหาหน้าขาว 100%) */}
          {activeTab === 'google' && (
            <div className="space-y-3 pt-1">
              {/* If an Admin account is selected, prompt for password */}
              {selectedGoogleAccount?.isAdminAccount ? (
                <form
                  onSubmit={handleConfirmAdminLogin}
                  className="p-4 bg-slate-50 border-2 border-red-200 rounded-3xl space-y-3 animate-fadeIn"
                >
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                    <img
                      src={selectedGoogleAccount.photoURL}
                      alt={selectedGoogleAccount.displayName}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-red-500"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-slate-900">{selectedGoogleAccount.displayName}</p>
                      <p className="text-xs text-slate-500 font-medium">{selectedGoogleAccount.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedGoogleAccount(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      เปลี่ยน
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      🔐 ยืนยันรหัสผ่านผู้ดูแลระบบ (Admin Password) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      สิทธิ์แอดมินสำหรับ {ORIGINAL_ADMIN_EMAIL} จำเป็นต้องตรวจสอบรหัสผ่าน เพื่อความปลอดภัยสูงสุด
                    </p>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        autoFocus
                        value={adminPasswordInput}
                        onChange={(e) => setAdminPasswordInput(e.target.value)}
                        placeholder="กรอกรหัสผ่านแอดมิน (เช่น admin1234)"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-red-300 focus:border-red-500 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500 outline-hidden transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedGoogleAccount(null)}
                      className="w-1/3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-2/3 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>ยืนยันเข้าสู่ระบบแอดมิน</span>
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* Google Account List */}
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-800 px-1 flex items-center justify-between">
                      <span>เลือกบัญชี Google ของคุณ:</span>
                      <span className="text-[11px] text-emerald-600 font-semibold">แตะเพื่อเข้าสู่ระบบ</span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {GOOGLE_PRESET_ACCOUNTS.map((acc) => (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => handleSelectPresetAccount(acc)}
                          className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between text-left active:scale-[0.99] cursor-pointer ${
                            acc.isAdminAccount
                              ? 'bg-red-50/40 hover:bg-red-50 border-red-200/80 hover:border-red-300'
                              : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={acc.photoURL}
                              alt={acc.displayName}
                              className={`w-10 h-10 rounded-full object-cover shrink-0 ${
                                acc.isAdminAccount ? 'ring-2 ring-red-500' : 'ring-1.5 ring-slate-200'
                              }`}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                                {acc.displayName}
                                {acc.isAdminAccount && (
                                  <span className="px-1.5 py-0.2 bg-red-600 text-white text-[9px] font-black rounded-full">
                                    ADMIN
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">{acc.email}</p>
                              <p className="text-[10px] text-slate-400 font-medium truncate pt-0.5">
                                {acc.roleDescription}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </button>
                      ))}

                      {/* Use Another Google Account Toggle */}
                      {!showCustomGoogleForm ? (
                        <button
                          type="button"
                          onClick={() => setShowCustomGoogleForm(true)}
                          className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-2xl text-xs font-bold text-slate-700 transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-slate-500" />
                          <span>ใช้บัญชี Google (@gmail.com) อื่นของคุณ</span>
                        </button>
                      ) : (
                        <form
                          onSubmit={handleCustomGoogleSubmit}
                          className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2.5 animate-fadeIn"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                            <span>ระบุอีเมล Google ของคุณ</span>
                            <button
                              type="button"
                              onClick={() => setShowCustomGoogleForm(false)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <input
                              type="email"
                              value={customGoogleEmail}
                              onChange={(e) => setCustomGoogleEmail(e.target.value)}
                              placeholder="เช่น yourname@gmail.com"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                              required
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={customGoogleName}
                              onChange={(e) => setCustomGoogleName(e.target.value)}
                              placeholder="ชื่อของคุณ (เช่น สมชาย หรือ พลอย)"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                            />
                          </div>

                          {customGoogleEmail.trim().toLowerCase() === ORIGINAL_ADMIN_EMAIL.toLowerCase() && (
                            <div>
                              <input
                                type="password"
                                value={customGoogleAdminPass}
                                onChange={(e) => setCustomGoogleAdminPass(e.target.value)}
                                placeholder="รหัสผ่าน Admin เพื่อยืนยันตัวตน"
                                className="w-full px-3 py-2 bg-white border border-red-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500 outline-hidden"
                                required
                              />
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>เข้าสู่ระบบด้วยอีเมลนี้</span>
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Browser Popup Option */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleBrowserOAuthPopup}
                      disabled={isLoading}
                      className="w-full py-2 px-3 text-slate-500 hover:text-slate-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition rounded-xl hover:bg-slate-50 cursor-pointer"
                      title="กดเพื่อลองเปิดหน้าต่างป๊อปอัป Google ของเบราว์เซอร์"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>หรือลองเปิดหน้าต่างป๊อปอัป Google ของเบราว์เซอร์</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL & PASSWORD LOGIN */}
          {activeTab === 'email' && (
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
                    placeholder="อีเมลของคุณ เช่น user@example.com"
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
                    placeholder="เช่น สมชาย หรือ พลอย"
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
            </form>
          )}

          {/* Security & Access Protection Notice */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">ระบบแยกสิทธิ์ความปลอดภัยสูงสุด:</p>
              <p className="text-[11px] text-amber-800">
                สิทธิ์แอดมิน (Admin) จะแสดงเฉพาะผู้ที่ลงชื่อเข้าใช้ด้วย <strong>{ORIGINAL_ADMIN_EMAIL}</strong> และยืนยันรหัสผ่านถูกต้องเท่านั้น อีเมลอื่นๆ ทั้งหมดจะเข้าสู่ระบบเป็น <strong>สมาชิกทั่วไป</strong> และไม่สามารถมองเห็นหรือเข้าถึงระบบของแอดมินได้โดยเด็ดขาด
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
