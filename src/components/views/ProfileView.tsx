import React, { useState } from 'react';
import {
  User,
  Shield,
  Volume2,
  VolumeX,
  MapPin,
  Bell,
  Heart,
  MessageSquare,
  Radio,
  HelpCircle,
  Smartphone,
  Download,
  CheckCircle2,
  AlertCircle,
  Activity,
  Sliders,
  RefreshCw,
  Sparkles,
  RotateCcw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';
import { APP_VERSION, BUILD_DATE, forcePurgeCacheAndReload, checkForAppUpdates } from '../../utils/updateManager';

export const ProfileView: React.FC = () => {
  const {
    location,
    openLocationModal,
    isAdmin,
    setIsAdmin,
    openContactAdminModal,
    showToast,
    currentUser,
    isFirebaseConnected,
    loginWithGoogle,
    logoutFirebase
  } = useCommunity();

  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isPurgingCache, setIsPurgingCache] = useState(false);
  const [showTroubleshootGuide, setShowTroubleshootGuide] = useState(false);

  const {
    soundEnabled,
    setSoundEnabled,
    playSoundAlert,
    setOpenAdminModal,
    testLocalDeviceSignal,
    testAllDevicesSignal,
    setOpenSignalTestModal
  } = useBroadcast();

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Profile Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
        <img
          src={currentUser?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-md"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 truncate">
              {currentUser?.displayName || 'คุณ (ผู้ใช้งาน LocalHub)'}
            </h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {isAdmin ? '🛡️ ผู้ดูแลระบบ (Admin)' : '👤 สมาชิกชุมชน'}
            </span>
          </div>

          {currentUser?.email && (
            <p className="text-xs text-slate-500 mt-0.5 truncate font-mono">
              {currentUser.email}
            </p>
          )}

          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            พื้นที่ปัจจุบัน: <strong className="text-slate-800">{location.province} {location.district ? `(${location.district})` : ''}</strong>
            <button
              onClick={openLocationModal}
              className="text-blue-600 hover:underline font-semibold ml-1"
            >
              แก้ไข
            </button>
          </p>
        </div>
      </div>

      {/* Firebase Cloud & Authentication Card */}
      <div className="p-5 bg-gradient-to-br from-amber-950 via-slate-900 to-orange-950 text-white rounded-3xl shadow-md border-2 border-amber-500/50 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-md text-xl">
              🔥
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  ระบบฐานข้อมูลคลาวด์ Firebase & Google Auth
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${
                  isFirebaseConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                }`}>
                  {isFirebaseConnected ? '● Cloud Firestore เชื่อมต่อแล้ว' : '○ กำลังเชื่อมต่อ'}
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                เชื่อมต่อ Firestore Database: <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[11px]">localhub-69fbe</code>
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          ข้อมูลโพสต์, ตลาดนัดชุมชน, การรายงานภัยพิบัติ และสัญญาณเตือนภัยไซเรน multi-device ทั้งหมดจะถูกซิงก์แบบ Real-time ข้ามทุกอุปกรณ์และมือถือผ่าน Google Cloud Firestore
        </p>

        <div className="pt-1 flex items-center gap-2 flex-wrap">
          {currentUser ? (
            <button
              onClick={logoutFirebase}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              <span>ออกจากระบบ ({currentUser.email})</span>
            </button>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-2 shadow-md"
            >
              <span>🔑 เข้าสู่ระบบด้วย Google (Google Sign-In)</span>
            </button>
          )}

          <div className="text-[11px] text-amber-200/80 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin สิทธิ์พิเศษ: toonisra33@gmail.com</span>
          </div>
        </div>
      </div>

      {/* App Version & Force Update Card */}
      <div className="p-5 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-md space-y-4 border-2 border-blue-500/60 animate-fadeIn">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  เวอร์ชันแอป & ระบบอัปเดต (Version & Cache)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[11px] font-black border border-emerald-400/40">
                  v{APP_VERSION}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Build: {BUILD_DATE} • รองรับกล้องสด, วิดีโอคลิป และพยากรณ์อากาศสด
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons for Update */}
        <div className="p-3.5 bg-white/10 rounded-2xl border border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">หากเพิ่ง Push ขึ้น GitHub หรือพบบราวเซอร์จำแคชเดิม:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Button 1: Force Purge Cache & Reload */}
            <button
              onClick={async () => {
                setIsPurgingCache(true);
                showToast('🔄 กำลังล้างแคชและบังคับดึงโค้ดล่าสุดจากเซิร์ฟเวอร์...', 'info');
                await forcePurgeCacheAndReload();
              }}
              disabled={isPurgingCache}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isPurgingCache ? 'animate-spin' : ''}`} />
              <span>{isPurgingCache ? 'กำลังโหลดเวอร์ชันใหม่...' : '🔄 บังคับอัปเดต & ล้างแคชทันที'}</span>
            </button>

            {/* Button 2: Check for Updates */}
            <button
              onClick={async () => {
                setIsCheckingUpdate(true);
                const hasNew = await checkForAppUpdates();
                setIsCheckingUpdate(false);
                if (hasNew) {
                  showToast('🎉 ตรวจพบเวอร์ชันใหม่! กำลังเตรียมรีโหลด...', 'success');
                } else {
                  showToast('✓ คุณกำลังใช้งานเวอร์ชันล่าสุดแล้ว (v' + APP_VERSION + ')', 'success');
                }
              }}
              disabled={isCheckingUpdate}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <RotateCcw className={`w-4 h-4 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
              <span>{isCheckingUpdate ? 'กำลังตรวจสอบ...' : '🔍 ตรวจสอบเวอร์ชันใหม่'}</span>
            </button>

            {/* Button 3: Download Complete Source Code ZIP */}
            <a
              href="./localhub-latest-source.zip"
              download="localhub-latest-source.zip"
              className="col-span-1 sm:col-span-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md text-center"
            >
              <Download className="w-4 h-4" />
              <span>📦 ดาวน์โหลดไฟล์ซอร์สโค้ดโปรเจกต์ฉบับเต็มล่าสุด (ZIP) เพื่ออัปโหลดขึ้น GitHub ทันที</span>
            </a>
          </div>
        </div>

        {/* Collapsible GitHub & Play Store Deployment Troubleshooting Guide */}
        <div className="border-t border-white/10 pt-2">
          <button
            onClick={() => setShowTroubleshootGuide(!showTroubleshootGuide)}
            className="w-full text-left text-xs font-bold text-sky-300 hover:text-white flex items-center justify-between py-1 transition"
          >
            <span>📖 คำแนะนำ: หาก Push ขึ้น GitHub แล้วแต่ในแอพยังไม่อัปเดต</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTroubleshootGuide ? 'rotate-180' : ''}`} />
          </button>

          {showTroubleshootGuide && (
            <div className="mt-2.5 p-3.5 bg-black/40 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-2.5 animate-fadeIn leading-relaxed">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>สาเหตุที่พบบ่อยและวิธีแก้ไข:</span>
              </div>
              <ul className="list-disc list-inside space-y-2 text-slate-300">
                <li className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30 text-amber-200">
                  <strong className="text-white block mb-1">⚠️ ทำไมลิงก์ GitHub กับ Firebase ถึงคนละตัว และส่งผลอะไรไหม?</strong>
                  <span className="block text-slate-300 mb-1.5">
                    <strong>ส่งผล 100% เต็มครับ!</strong> นี่คือสาเหตุสำคัญที่แอปในมือถือไม่เปลี่ยน:
                  </span>
                  <div className="space-y-1 text-[11px] font-mono bg-black/50 p-2 rounded-lg border border-white/10 mb-1.5">
                    <div className="text-emerald-400">🔥 Firebase: https://localhub-69fbe.web.app (แอปจริงบนมือถือวิ่งมาเปิดที่นี่)</div>
                    <div className="text-sky-300">🐙 GitHub: https://[username].github.io/ (GitHub Actions ส่งโค้ดไปที่นี่)</div>
                  </div>
                  <span className="block text-slate-300 text-[11px]">
                    เมื่อ GitHub Actions รันผ่านสีเขียว มันนำโค้ดไปวางไว้ที่ <strong>GitHub Pages</strong> แต่แอปในมือถือของคุณเปิดดูที่ <strong>Firebase Hosting</strong> โค้ดบนมือถือจึงยังเป็นเวอร์ชันเก่าตลอดเวลา!
                  </span>
                </li>
                <li>
                  <strong className="text-white">วิธีแก้ที่ 1 (แนะนำ): Deploy ตรงเข้า Firebase Hosting</strong>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    รันคำสั่ง <code className="px-1.5 py-0.5 bg-white/10 rounded text-emerald-400 font-mono">npm run build && npm run deploy:firebase</code> เพื่อส่งโค้ดตรงเข้า Firebase ทันที
                  </div>
                </li>
                <li>
                  <strong className="text-white">วิธีแก้ที่ 2: บังคับล้างแคชในตัวแอป</strong>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    กดปุ่ม <span className="text-emerald-400 font-bold">"บังคับอัปเดต & ล้างแคชทันที"</span> ด้านบน เพื่อล้าง Service Worker ในเครื่องให้ดึงหน้าเว็บล่าสุด
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Play Store Native Application Status & Test Card */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-md space-y-3.5 border border-indigo-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">การแจ้งเตือนจากแอปโดยตรง (Play Store Edition)</h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  ติดตั้งแล้วผ่าน Play Store
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                การแจ้งเตือนและระบบสั่นส่งตรงจากแอป <strong>"LocalHub"</strong> ไม่ผ่านบราวเซอร์ Chrome
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          แอปพลิเคชันกำลังทำงานในโหมด Native เมื่อมีบรอดแคสต์หรือสัญญาณฉุกเฉิน ระบบจะส่งการแจ้งเตือน สั่นสะเทือน และเล่นเสียงไซเรนเตือนภัยขึ้นบนหน้าจอมือถือของคุณทันทีแม้ไม่ได้เปิดแอป
        </p>

        {/* Direct Test Buttons inside Profile */}
        <div className="pt-1 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              testLocalDeviceSignal('siren', 5);
              showToast('▶️ ทดสอบเสียงและระบบสั่นเฉพาะเครื่องนี้ (ไม่ส่งออกไปยังอุปกรณ์อื่น)', 'info');
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Activity className="w-3.5 h-3.5" />
            ทดสอบเฉพาะเครื่องนี้ (Admin Only)
          </button>

          <button
            onClick={() => {
              testAllDevicesSignal();
              showToast('📡 ส่งสัญญาณเตือนและระบบสั่นไปยังทุกอุปกรณ์แล้ว!', 'success');
            }}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            ทดสอบทุกอุปกรณ์ (All Devices)
          </button>

          <button
            onClick={() => setOpenSignalTestModal(true)}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            เปิดคอนโซลตั้งค่า
          </button>
        </div>
      </div>

      {/* Settings list */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {/* Admin Switch */}
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">สิทธิ์ผู้ดูแลระบบ (Admin Mode)</h4>
              <p className="text-xs text-slate-500">เปิดเพื่อทดสอบระบบบรอดแคสต์ ส่งสัญญาณเตือนภัย และส่งซ้ำ</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => {
                setIsAdmin(e.target.checked);
                showToast(e.target.checked ? 'เปิดใช้งานโหมดผู้ดูแลระบบ' : 'ปิดโหมดผู้ดูแลระบบ', 'info');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Sound alerts toggle */}
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">เสียงสัญญาณเตือนภัยฉุกเฉิน</h4>
              <p className="text-xs text-slate-500">ส่งเสียงแจ้งเตือนเมื่อมีบรอดแคสต์ระดับด่วนที่สุดหรือภัยพิบัติ</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playSoundAlert('urgent')}
              className="px-2.5 py-1 text-xs border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 font-medium"
            >
              ทดสอบเสียง
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Contact admin button */}
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">ติดต่อศูนย์ประสานงาน</h4>
              <p className="text-xs text-slate-500">ยื่นเรื่องร้องทุกข์ หรือขอส่งบรอดแคสต์ประชาสัมพันธ์ชุมชน</p>
            </div>
          </div>

          <button
            onClick={openContactAdminModal}
            className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition"
          >
            ส่งคำร้อง
          </button>
        </div>

        {/* Admin Broadcast Console launcher */}
        {isAdmin && (
          <div className="p-4 sm:p-5 flex items-center justify-between bg-blue-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-2xl">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-blue-950">คอนโซลบรอดแคสต์ (Admin Console)</h4>
                <p className="text-xs text-blue-800">ส่งข้อความเตือนภัยและประกาศสู่สมาชิกในพื้นที่</p>
              </div>
            </div>

            <button
              onClick={() => setOpenAdminModal(true)}
              className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition"
            >
              เปิดคอนโซล
            </button>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="text-center text-xs text-slate-400 py-3">
        LocalHub v{APP_VERSION} (Build {BUILD_DATE}) • แพลตฟอร์มข้อมูลและเตือนภัยชุมชนท้องถิ่น (Play Store Edition)
      </div>
    </div>
  );
};
