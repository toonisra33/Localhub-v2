import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  User,
  CheckCircle2,
  LogOut,
  Loader2,
  Sparkles,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Check
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
    loginWithEmail,
    registerWithEmail,
    logoutFirebase,
    showToast
  } = useCommunity();

  // Tab: 'login' | 'register'
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Form error & loading states
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (!isLoginModalOpen) {
      setErrorMessage('');
      setIsLoading(false);
    }
  }, [isLoginModalOpen]);

  // Live password validation criteria per user instructions:
  // "รหัสผ่านต้องประกอบไปด้วยตัวอักษรภาษาอังกฤษพิมพ์ใหญ่และพิมพ์เล็ก และตัวเลขอย่างน้อย 8 ตัว ยืนยันรหัสผ่าน 2 ครั้ง"
  const passwordCriteria = useMemo(() => {
    const hasMinLength = regPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(regPassword);
    const hasLowercase = /[a-z]/.test(regPassword);
    const hasNumber = /[0-9]/.test(regPassword);
    const passwordsMatch = regPassword.length > 0 && regPassword === regConfirmPassword;
    const isAllValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch;

    return {
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      passwordsMatch,
      isAllValid
    };
  }, [regPassword, regConfirmPassword]);

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
              text: activeMode === 'register' ? 'signup_with' : 'continue_with',
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
  }, [isLoginModalOpen, loginWithGoogleCredential, closeLoginModal, activeMode]);

  if (!isLoginModalOpen) return null;

  // Real Google Sign-In Popup Handler: Opens Google Account Chooser
  const handleGoogleSignInClick = async () => {
    setIsLoading(true);
    setErrorMessage('');
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

  // Email & Password Login Handler
  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const email = loginEmail.trim();
    const password = loginPassword;

    if (!email || !email.includes('@')) {
      setErrorMessage('กรุณาระบุที่อยู่อีเมลให้ถูกต้อง');
      return;
    }

    if (!password) {
      setErrorMessage('กรุณาระบุรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    try {
      const success = await loginWithEmail(email, password);
      if (success) {
        setLoginEmail('');
        setLoginPassword('');
        closeLoginModal();
      } else {
        setErrorMessage('อีเมลหรือรหัสผ่านไม่ถูกต้อง โปรดตรวจสอบอีกครั้ง');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  // Email & Password Register Handler
  const handleEmailRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const email = regEmail.trim();
    const name = regName.trim();
    const password = regPassword;
    const confirmPassword = regConfirmPassword;

    if (!email || !email.includes('@')) {
      setErrorMessage('กรุณาระบุที่อยู่อีเมลให้ถูกต้อง เช่น user@gmail.com');
      return;
    }

    if (!passwordCriteria.hasMinLength) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (!passwordCriteria.hasUppercase) {
      setErrorMessage('รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว');
      return;
    }

    if (!passwordCriteria.hasLowercase) {
      setErrorMessage('รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว');
      return;
    }

    if (!passwordCriteria.hasNumber) {
      setErrorMessage('รหัสผ่านต้องมีตัวเลข (0-9) อย่างน้อย 1 ตัว');
      return;
    }

    if (!passwordCriteria.passwordsMatch) {
      setErrorMessage('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน โปรดตรวจสอบอีกครั้ง');
      return;
    }

    setIsLoading(true);
    try {
      const success = await registerWithEmail(email, password, confirmPassword, name);
      if (success) {
        setRegEmail('');
        setRegName('');
        setRegPassword('');
        setRegConfirmPassword('');
        closeLoginModal();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ลงทะเบียนไม่สำเร็จ โปรดลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn"
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
                <span>{activeMode === 'login' ? 'เข้าสู่ระบบ LocalHub' : 'ลงทะเบียนบัญชีใหม่'}</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-300">
                {activeMode === 'login'
                  ? 'เข้าใช้งานด้วยอีเมล หรือบัญชี Google'
                  : 'สร้างบัญชีผู้ใช้งานเพื่อร่วมแบ่งปันในชุมชน'}
              </p>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
            <>
              {/* Tab Selector: [เข้าสู่ระบบ] / [ลงทะเบียนใหม่] */}
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('login');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeMode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>เข้าสู่ระบบ</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('register');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeMode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>ลงทะเบียนบัญชีใหม่</span>
                </button>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="flex-1 leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* MODE 1: LOGIN (เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน) */}
              {activeMode === 'login' && (
                <form onSubmit={handleEmailLoginSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      อีเมล (Email)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        รหัสผ่าน (Password)
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="กรอกรหัสผ่านของคุณ"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer transition"
                        title={showLoginPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button for Email Login */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-2xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังเข้าสู่ระบบ...</span>
                      </>
                    ) : (
                      <span>เข้าสู่ระบบด้วยอีเมล</span>
                    )}
                  </button>
                </form>
              )}

              {/* MODE 2: REGISTER (หน้าลงทะเบียนปกติ: อีเมล, ยืนยันรหัสผ่าน 2 ครั้ง, พิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข อย่างน้อย 8 ตัว) */}
              {activeMode === 'register' && (
                <form onSubmit={handleEmailRegisterSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      ชื่อ-นามสกุล หรือชื่อเรียกในชุมชน (Display Name)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="เช่น สมชาย ชุมชนสุขใจ"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      อีเมล (Email)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      รหัสผ่าน (Password)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="ตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข 8+ ตัว"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer transition"
                        title={showRegPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      ยืนยันรหัสผ่านอีกครั้ง (Confirm Password)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="พิมพ์รหัสผ่านเดิมซ้ำอีกครั้ง"
                        className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
                          regConfirmPassword && !passwordCriteria.passwordsMatch
                            ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                            : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer transition"
                        title={showRegConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* LIVE PASSWORD REQUIREMENTS CHECKLIST */}
                  <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>เงื่อนไขความปลอดภัยของรหัสผ่าน:</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
                      {/* Criteria 1: At least 8 characters */}
                      <div className={`flex items-center gap-1.5 font-medium ${
                        passwordCriteria.hasMinLength ? 'text-emerald-700 font-bold' : 'text-slate-500'
                      }`}>
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                          passwordCriteria.hasMinLength ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span>อย่างน้อย 8 ตัวอักษร</span>
                      </div>

                      {/* Criteria 2: Uppercase A-Z */}
                      <div className={`flex items-center gap-1.5 font-medium ${
                        passwordCriteria.hasUppercase ? 'text-emerald-700 font-bold' : 'text-slate-500'
                      }`}>
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                          passwordCriteria.hasUppercase ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span>ตัวอักษรพิมพ์ใหญ่ (A-Z)</span>
                      </div>

                      {/* Criteria 3: Lowercase a-z */}
                      <div className={`flex items-center gap-1.5 font-medium ${
                        passwordCriteria.hasLowercase ? 'text-emerald-700 font-bold' : 'text-slate-500'
                      }`}>
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                          passwordCriteria.hasLowercase ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span>ตัวอักษรพิมพ์เล็ก (a-z)</span>
                      </div>

                      {/* Criteria 4: Number 0-9 */}
                      <div className={`flex items-center gap-1.5 font-medium ${
                        passwordCriteria.hasNumber ? 'text-emerald-700 font-bold' : 'text-slate-500'
                      }`}>
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                          passwordCriteria.hasNumber ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                        }`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span>ตัวเลข (0-9) อย่างน้อย 1 ตัว</span>
                      </div>
                    </div>

                    {/* Criteria 5: Passwords match */}
                    <div className={`pt-1 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-medium ${
                      passwordCriteria.passwordsMatch ? 'text-emerald-700 font-bold' : 'text-slate-500'
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                        passwordCriteria.passwordsMatch ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                      <span>ยืนยันรหัสผ่านตรงกันทั้ง 2 ช่อง</span>
                    </div>
                  </div>

                  {/* Submit Button for Register */}
                  <button
                    type="submit"
                    disabled={isLoading || !passwordCriteria.isAllValid}
                    className={`w-full py-3 text-white font-black text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                      passwordCriteria.isAllValid
                        ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-emerald-600/20'
                        : 'bg-slate-400 cursor-not-allowed opacity-80'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>กำลังสร้างบัญชี...</span>
                      </>
                    ) : (
                      <span>ลงทะเบียนและเข้าสู่ระบบทันที</span>
                    )}
                  </button>
                </form>
              )}

              {/* DIVIDER: "หรือเข้าสู่ระบบด้วย Google" */}
              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  หรือ
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* OFFICIAL GOOGLE SIGN-IN BUTTON & SELECTION */}
              <div className="space-y-2.5">
                {/* Official GSI Button Container (if supported) */}
                <div ref={googleBtnContainerRef} className="w-full min-h-[44px] flex items-center justify-center empty:hidden" />

                {/* Official Google Account Picker Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignInClick}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 border-2 border-slate-300 hover:border-blue-500 rounded-2xl font-bold transition flex items-center justify-center gap-3 shadow-xs hover:shadow-md cursor-pointer active:scale-[0.99]"
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
                    {activeMode === 'register' ? 'ลงทะเบียนรวดเร็วด้วย Google' : 'เข้าสู่ระบบด้วย Google'}
                  </span>
                </button>
              </div>

              {/* Mode Switcher Footer */}
              <div className="pt-2 text-center text-xs text-slate-500">
                {activeMode === 'login' ? (
                  <p>
                    ยังไม่มีบัญชีผู้ใช้งาน?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode('register');
                        setErrorMessage('');
                      }}
                      className="font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                    >
                      ลงทะเบียนใหม่ที่นี่
                    </button>
                  </p>
                ) : (
                  <p>
                    มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode('login');
                        setErrorMessage('');
                      }}
                      className="font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                    >
                      เข้าสู่ระบบที่นี่
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
