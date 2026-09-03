import React, { useState, useRef } from 'react';
import { 
  X, 
  UserPlus, 
  LogIn, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Home, 
  Check, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Shield,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';
import { isAuthorizedAdminEmail, ROOT_ADMIN_EMAILS } from '../../lib/firebase';
import { LocalHubLogo } from '../LocalHubLogo';
import { useThaiAddress } from '../../hooks/useThaiAddress';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

export function AuthModal() {
  const { 
    isAuthModalOpen, 
    authModalMode, 
    closeAuthModal, 
    openAuthModal, 
    login, 
    loginWithGoogle,
    register, 
    location,
    showToast 
  } = useCommunity();
  const { setRole } = useBroadcast();
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { provinces, getAmphoes, getTambons, getZipcode } = useThaiAddress();

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  
  // Address selection state
  const [regAddressDetail, setRegAddressDetail] = useState('');
  const [regProvince, setRegProvince] = useState(location?.province || '');
  const [regDistrict, setRegDistrict] = useState(location?.district || '');
  const [regSubdistrict, setRegSubdistrict] = useState(location?.subdistrict || '');
  const [regZipcode, setRegZipcode] = useState('');

  const [regVillage, setRegVillage] = useState(location.village || 'หมู่บ้านพหลโยธิน');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isCustomUploaded, setIsCustomUploaded] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Login Form State
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password validation rules
  const hasMinLength = regPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(regPassword);
  const hasLowercase = /[a-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(regPassword);

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  const passedCriteriaCount = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;

  // Sync mode with context
  React.useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode]);

  const amphoes = regProvince ? getAmphoes(regProvince) : [];
  const tambons = regProvince && regDistrict ? getTambons(regProvince, regDistrict) : [];

  React.useEffect(() => {
    if (regProvince && regDistrict && regSubdistrict) {
      const zip = getZipcode(regProvince, regDistrict, regSubdistrict);
      if (zip) setRegZipcode(zip);
    }
  }, [regProvince, regDistrict, regSubdistrict, getZipcode]);

  if (!isAuthModalOpen) return null;

  // Handle custom photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('ขนาดไฟล์ภาพต้องไม่เกิน 5 MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedAvatar(result);
        setIsCustomUploaded(true);
        showToast('📸 อัปโหลดรูปโปรไฟล์ของคุณเรียบร้อยแล้ว', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      showToast('กรุณากรอกชื่อ-นามสกุล หรือชื่อเรียกในชุมชน', 'error');
      return;
    }
    if (!regPhone.trim()) {
      showToast('กรุณากรอกเบอร์โทรศัพท์สำหรับติดต่อ', 'error');
      return;
    }
    if (!regEmail.trim()) {
      showToast('กรุณากรอกอีเมล', 'error');
      return;
    }
    if (!regProvince || !regDistrict || !regSubdistrict || !regZipcode) {
      showToast('กรุณาระบุที่อยู่ (จังหวัด, อำเภอ, ตำบล, รหัสไปรษณีย์) ให้ครบถ้วน', 'error');
      return;
    }

    // Strict Password Validation
    if (!isPasswordValid) {
      const missingRequirements: string[] = [];
      if (!hasMinLength) missingRequirements.push('อย่างน้อย 8 ตัวอักษร');
      if (!hasUppercase) missingRequirements.push('ตัวพิมพ์ใหญ่ (A-Z)');
      if (!hasLowercase) missingRequirements.push('ตัวพิมพ์เล็ก (a-z)');
      if (!hasNumber) missingRequirements.push('ตัวเลข (0-9)');
      if (!hasSpecialChar) missingRequirements.push('สัญลักษณ์พิเศษ (!@#$...)');

      showToast(`รหัสผ่านต้องมี: ${missingRequirements.join(', ')}`, 'error');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      showToast('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน', 'error');
      return;
    }

    if (!acceptTerms) {
      showToast('กรุณายอมรับเงื่อนไขการใช้งานของชุมชน', 'error');
      return;
    }

    const fullAddress = `${regAddressDetail ? regAddressDetail + ' ' : ''}ต.${regSubdistrict} อ.${regDistrict} จ.${regProvince} ${regZipcode}`.trim();

    setIsSubmitting(true);
    await register({
      name: regName,
      phone: regPhone,
      email: regEmail,
      password: regPassword,
      address: fullAddress,
      villageOrCondo: regVillage,
      avatar: selectedAvatar
    });
    setIsSubmitting(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhoneOrEmail.trim()) {
      showToast('กรุณากรอกเบอร์โทรศัพท์หรืออีเมล', 'error');
      return;
    }

    const isAdminLogin = isAuthorizedAdminEmail(loginPhoneOrEmail);
    if (isAdminLogin) {
      setRole('admin');
    } else {
      setRole('user');
    }

    setIsSubmitting(true);
    await login({
      phoneOrEmail: loginPhoneOrEmail,
      password: loginPassword,
      name: isAdminLogin ? 'แอดมินศูนย์ควบคุมชุมชน' : undefined
    });
    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        // Automatically sync role
        const currentUserRole = localStorage.getItem('locallink_user_role');
        if (currentUserRole === 'admin') {
          setRole('admin');
        } else {
          setRole('user');
        }
      }
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] bg-slate-950/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
              mode === 'register' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-900 text-white'
            }`}>
              {mode === 'register' ? <UserPlus size={20} /> : <LogIn size={20} />}
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">
                {mode === 'register' ? 'ลงทะเบียนสมาชิกใหม่' : 'เข้าสู่ระบบ LocalLink'}
              </h2>
              <p className="text-[11.5px] font-medium text-slate-500">
                {mode === 'register' ? 'สร้างบัญชีเพื่อร่วมพูดคุย ซื้อขาย และแจ้งเหตุ' : 'เข้าถึงข้อมูลและสิทธิประโยชน์ในชุมชนของคุณ'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 shrink-0">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-2 px-3 rounded-xl text-[12.5px] font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus size={15} />
              ลงทะเบียนใหม่
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 px-3 rounded-xl text-[12.5px] font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn size={15} />
              เข้าสู่ระบบ
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {mode === 'register' ? (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Custom Image Upload Section */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <label className="block text-[12px] font-bold text-slate-800 mb-2.5">
                  รูปโปรไฟล์ของคุณ <span className="text-emerald-600 font-semibold">(อัปโหลดภาพจริงจากเครื่องได้)</span>
                </label>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />

                <div className="flex items-center gap-3.5">
                  {/* Current Selected / Uploaded Avatar */}
                  <div className="relative shrink-0">
                    <img 
                      src={selectedAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                      alt="Avatar preview" 
                      className="w-16 h-16 rounded-2xl object-cover ring-3 ring-emerald-500/30 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-transform active:scale-95"
                      title="เปลี่ยนรูปภาพ"
                    >
                      <Camera size={12} />
                    </button>
                  </div>

                  {/* Upload Actions & Presets */}
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-[12px] font-extrabold border border-slate-300 shadow-sm flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Upload size={14} className="text-emerald-600" />
                      <span>อัปโหลดรูปถ่ายของคุณ</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  ชื่อ - นามสกุล หรือ ชื่อเรียกในชุมชน <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="เช่น สมพร รักสงบ หรือ น้าแดง ซอย 2"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[13px] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  เบอร์โทรศัพท์มือถือ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[13px] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">ใช้สำหรับการยืนยันตัวตนและการติดต่อแจ้งเหตุในพื้นที่</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  อีเมล <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="เช่น youremail@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[13px] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Address / Community */}
              <div className="space-y-3">
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  ที่อยู่และพื้นที่ของคุณ <span className="text-rose-500">*</span>
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Province */}
                  <div>
                    <select
                      value={regProvince}
                      onChange={e => {
                        setRegProvince(e.target.value);
                        setRegDistrict('');
                        setRegSubdistrict('');
                        setRegZipcode('');
                      }}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[13px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    >
                      <option value="">เลือกจังหวัด</option>
                      {provinces.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* District / Amphoe */}
                  <div>
                    <select
                      value={regDistrict}
                      onChange={e => {
                        setRegDistrict(e.target.value);
                        setRegSubdistrict('');
                        setRegZipcode('');
                      }}
                      required
                      disabled={!regProvince}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[13px] disabled:opacity-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    >
                      <option value="">เลือกอำเภอ/เขต</option>
                      {amphoes.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sub-district / Tambon */}
                  <div>
                    <select
                      value={regSubdistrict}
                      onChange={e => setRegSubdistrict(e.target.value)}
                      required
                      disabled={!regDistrict}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[13px] disabled:opacity-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    >
                      <option value="">เลือกตำบล/แขวง</option>
                      {tambons.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Zipcode */}
                  <div>
                    <input
                      type="text"
                      value={regZipcode}
                      readOnly
                      placeholder="รหัสไปรษณีย์"
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-[13px] font-medium"
                    />
                  </div>
                </div>

                {/* Detailed Address */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={16} />
                  </div>
                  <input
                    type="text"
                    value={regAddressDetail}
                    onChange={e => setRegAddressDetail(e.target.value)}
                    placeholder="รายละเอียด (บ้านเลขที่, ซอย, ถนน) - ไม่บังคับ"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[13px] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Password with Strong Requirements */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[12px] font-bold text-slate-800">
                    กำหนดรหัสผ่าน <span className="text-rose-500">*</span>
                  </label>
                  {regPassword.length > 0 && (
                    <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                      isPasswordValid 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : passedCriteriaCount >= 3 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isPasswordValid ? '✓ รหัสผ่านปลอดภัย' : `ความสมบูรณ์ ${passedCriteriaCount}/5`}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="เช่น Pass1234@"
                    className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-slate-900 text-[13px] placeholder-slate-400 focus:outline-none focus:ring-2 font-medium transition-all ${
                      regPassword.length === 0
                        ? 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                        : isPasswordValid
                        ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                        : 'border-amber-400 focus:ring-amber-500/20 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Checklist */}
                <div className="pt-1.5 space-y-1 bg-white p-2.5 rounded-xl border border-slate-200/70">
                  <p className="text-[11px] font-extrabold text-slate-600 mb-1 flex items-center gap-1">
                    <ShieldCheck size={13} className={isPasswordValid ? 'text-emerald-600' : 'text-slate-400'} />
                    เงื่อนไขความปลอดภัยของรหัสผ่าน:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasMinLength ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                        {hasMinLength ? <Check size={9} strokeWidth={3} /> : <span className="w-1 h-1 bg-slate-400 rounded-full" />}
                      </div>
                      <span>อย่างน้อย 8 ตัวอักษร</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasUppercase ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                        {hasUppercase ? <Check size={9} strokeWidth={3} /> : <span className="w-1 h-1 bg-slate-400 rounded-full" />}
                      </div>
                      <span>ตัวพิมพ์ใหญ่ (A-Z)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasLowercase ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                        {hasLowercase ? <Check size={9} strokeWidth={3} /> : <span className="w-1 h-1 bg-slate-400 rounded-full" />}
                      </div>
                      <span>ตัวพิมพ์เล็ก (a-z)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasNumber ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                        {hasNumber ? <Check size={9} strokeWidth={3} /> : <span className="w-1 h-1 bg-slate-400 rounded-full" />}
                      </div>
                      <span>ตัวเลข (0-9)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 col-span-2 ${hasSpecialChar ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasSpecialChar ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                        {hasSpecialChar ? <Check size={9} strokeWidth={3} /> : <span className="w-1 h-1 bg-slate-400 rounded-full" />}
                      </div>
                      <span>สัญลักษณ์พิเศษ (!, @, #, $, %, ^, &, *, ฯลฯ)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[13px] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 font-medium transition-all ${
                      regConfirmPassword.length > 0 && regConfirmPassword !== regPassword
                        ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                        : regConfirmPassword.length > 0 && regConfirmPassword === regPassword
                        ? 'border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500'
                        : 'focus:ring-emerald-500/20 focus:border-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {regConfirmPassword.length > 0 && regConfirmPassword !== regPassword && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">รหัสผ่านไม่ตรงกัน</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <label htmlFor="terms" className="text-[11.5px] text-slate-600 leading-tight">
                  ฉันยินยอมปฏิบัติตามกฎระเบียบของชุมชน และยอมรับ{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPrivacyModal(true);
                    }}
                    className="text-emerald-600 font-extrabold hover:underline"
                  >
                    นโยบายความเป็นส่วนตัว (Privacy Policy)
                  </button>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isPasswordValid || isSubmitting}
                className={`w-full py-3.5 px-4 rounded-2xl text-[14px] font-extrabold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  isPasswordValid && !isSubmitting
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <UserPlus size={18} />
                {isSubmitting ? 'กำลังดำเนินการ...' : 'สมัครสมาชิกและเริ่มต้นใช้งาน'}
              </button>
            </form>
          ) : (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Phone or Email */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  เบอร์โทรศัพท์มือถือ หรือ อีเมล <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginPhoneOrEmail}
                    onChange={e => setLoginPhoneOrEmail(e.target.value)}
                    placeholder="เช่น 081-234-5678 หรือ somchai@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[13px] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[12px] font-bold text-slate-700">
                    รหัสผ่าน
                  </label>
                  <button 
                    type="button" 
                    onClick={() => showToast('ระบบได้ส่งรหัส OTP กู้คืนไปยังเบอร์โทรศัพท์ของคุณแล้ว', 'info')}
                    className="text-[11px] font-extrabold text-emerald-600 hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านของคุณ"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[13px] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 px-4 rounded-2xl text-[14px] font-extrabold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  isSubmitting ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <LogIn size={18} />
                {isSubmitting ? 'กำลังดำเนินการ...' : 'เข้าสู่ระบบด้วยเบอร์โทร / อีเมล'}
              </button>

              {/* Google Sign-in Official Firebase Auth */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningInGoogle}
                className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300/90 rounded-2xl text-[14px] font-extrabold shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                {isSigningInGoogle ? 'กำลังเชื่อมต่อ Firebase...' : 'เข้าสู่ระบบด้วย Google Account'}
              </button>
            </form>
          )}

          {/* Security Notice Footer */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Shield size={13} className="text-emerald-600" />
              ข้อมูลของคุณได้รับการปกป้องด้วยระบบความปลอดภัยของ LocalLink
            </p>
          </div>

        </div>

        {/* Privacy Policy Modal */}
        <PrivacyPolicyModal 
          isOpen={showPrivacyModal} 
          onClose={() => setShowPrivacyModal(false)} 
        />

      </div>
    </div>
  );
}

