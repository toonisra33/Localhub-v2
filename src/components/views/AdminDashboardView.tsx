import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Volume2,
  VolumeX,
  Play,
  Square,
  Radio,
  Sliders,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RadioTower,
  Bell,
  RefreshCw,
  FileText,
  Users,
  MapPin,
  ExternalLink,
  Flame,
  CloudLightning,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  ShoppingBag,
  Clock,
  Eye,
  ThumbsUp,
  Flag,
  Share2,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Database,
  Check,
  X,
  Search,
  Trash2,
  UserCheck,
  UserX,
  UserMinus,
  Calendar,
  ChevronDown,
  User,
  Home,
  Filter
} from 'lucide-react';
import { useBroadcast } from '../../context/BroadcastContext';
import { useCommunity, ORIGINAL_ADMIN_EMAIL } from '../../context/CommunityContext';
import { TestSoundType, AdminBroadcast, Post, AlertReport } from '../../types';
import {
  isVibrationSupported,
  getNotificationPermission,
  requestNotificationPermission
} from '../../utils/notificationService';

type ActivityFilter = 'all' | 'alerts' | 'posts' | 'broadcasts' | 'market' | 'moderation';

interface AppActivityItem {
  id: string;
  type: 'alert' | 'post' | 'broadcast' | 'market' | 'verify' | 'fake_flag' | 'signal_test';
  title: string;
  detail: string;
  actor: string;
  actorRole?: string;
  locationText: string;
  timestamp: number;
  badgeText: string;
  badgeColor: string;
  extraId?: string;
}

export const AdminDashboardView: React.FC = () => {
  const {
    isTestingLocalAdmin,
    isTestingAllDevices,
    testLocalDeviceSignal,
    stopLocalDeviceTest,
    testAllDevicesSignal,
    dismissTestSignal,
    activeTestSignal,
    broadcasts,
    setOpenAdminModal,
    reBroadcastItem
  } = useBroadcast();

  const {
    isAdmin,
    setIsAdmin,
    currentUser,
    showToast,
    location,
    posts,
    alerts,
    marketItems,
    friends,
    confirmAlert,
    reportAlertNotFound,
    setActiveTab,
    openPostDetail,
    goBack,
    registeredUsers,
    totalUsersCount,
    activeUsersCount,
    inactiveUsersCount,
    pendingDeletionUsersCount,
    confirmActiveStatus,
    deleteUserAccount
  } = useCommunity();

  // Active activity filter
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [activeSubTab, setActiveSubTab] = useState<'activity' | 'broadcasts' | 'moderation' | 'signal_test' | 'users'>('activity');

  // Activity pagination & Date/Time Search state (แสดงครั้งละ 10 หัวข้อ & ค้นหาตามวันเวลา)
  const [activitySearchDate, setActivitySearchDate] = useState<string>('');
  const [activitySearchTime, setActivitySearchTime] = useState<string>('');
  const [activityKeyword, setActivityKeyword] = useState<string>('');
  const [appliedDate, setAppliedDate] = useState<string>('');
  const [appliedTime, setAppliedTime] = useState<string>('');
  const [appliedKeyword, setAppliedKeyword] = useState<string>('');
  const [visibleActivityCount, setVisibleActivityCount] = useState<number>(10);

  // User Management filters
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState<'all' | 'active' | 'inactive' | 'admin'>('all');

  // Test sound settings
  const [localSoundType, setLocalSoundType] = useState<TestSoundType>('siren');
  const [localDurationSec, setLocalDurationSec] = useState<number>(5);

  const [allDevicesTitle, setAllDevicesTitle] = useState('🚨 [ประกาศฉุกเฉินแอดมิน] สัญญาณเตือนภัยทุกอุปกรณ์');
  const [allDevicesMessage, setAllDevicesMessage] = useState(
    'ผู้ดูแลระบบ (Admin) กำลังส่งสัญญาณเตือนภัยฉุกเฉินและระบบสั่นสะเทือนพร้อมกันทุกอุปกรณ์ที่ติดตั้ง LocalHub'
  );
  const [allDevicesSoundType, setAllDevicesSoundType] = useState<TestSoundType>('siren');

  // Diagnostics state
  const [hasVibration, setHasVibration] = useState(false);
  const [notifPermission, setNotifPermission] = useState<'granted' | 'denied' | 'default'>('default');

  useEffect(() => {
    setHasVibration(isVibrationSupported());
    setNotifPermission(getNotificationPermission());
  }, []);

  const handleRequestNotif = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted') {
      showToast('เปิดการแจ้งเตือนสำเร็จแล้ว!', 'success');
    } else {
      showToast('ยังไม่ได้รับสิทธิ์การแจ้งเตือน', 'info');
    }
  };

  const handleStopAllAlerts = () => {
    stopLocalDeviceTest();
    dismissTestSignal();
    showToast('⏹️ สั่งหยุดสัญญาณเตือนภัยทั้งหมดเรียบร้อยแล้ว', 'info');
  };

  // Helper for ISO Date string YYYY-MM-DD
  const toISODateString = (ts: number | Date) => {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Format full date & time in Thai (เช่น 16 ต.ค. 2569 เวลา 14:30 น.)
  const formatDateTimeThai = (ts: number) => {
    const d = new Date(ts);
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const day = d.getDate();
    const month = thaiMonths[d.getMonth()];
    const year = d.getFullYear() + 543;
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} เวลา ${hours}:${mins} น.`;
  };

  // Apply Date and Time search
  const handleApplyDateSearch = () => {
    setAppliedDate(activitySearchDate);
    setAppliedTime(activitySearchTime);
    setAppliedKeyword(activityKeyword);
    setVisibleActivityCount(10);
    if (activitySearchDate || activitySearchTime || activityKeyword) {
      showToast('🔍 ค้นหาบันทึกความเคลื่อนไหวตามเงื่อนไขสำเร็จ', 'info');
    }
  };

  // Reset Date and Time search
  const handleResetDateSearch = () => {
    setActivitySearchDate('');
    setActivitySearchTime('');
    setActivityKeyword('');
    setAppliedDate('');
    setAppliedTime('');
    setAppliedKeyword('');
    setVisibleActivityCount(10);
    showToast('🔄 ล้างตัวกรองการค้นหากลับสู่ค่าเริ่มต้นแล้ว', 'info');
  };

  // Compile Comprehensive Real-time Application Movements & Activity Stream
  const applicationActivities = useMemo<AppActivityItem[]>(() => {
    const list: AppActivityItem[] = [];

    // 1. Alert Reports
    alerts.forEach((alt) => {
      list.push({
        id: `act_alt_${alt.id}`,
        type: 'alert',
        title: `รายงานเหตุการณ์: ${alt.title}`,
        detail: alt.description,
        actor: alt.reporter,
        locationText: `${alt.district || ''} ${alt.province || ''}`.trim() || 'กรุงเทพมหานคร',
        timestamp: alt.createdAt,
        badgeText: '🚨 เหตุฉุกเฉิน',
        badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
        extraId: alt.id
      });

      if (alt.verifiedCount && alt.verifiedCount > 1) {
        list.push({
          id: `act_ver_${alt.id}`,
          type: 'verify',
          title: `พลเมืองยืนยันเหตุจริง (${alt.verifiedCount} คน): ${alt.title}`,
          detail: 'ประชาชนในพื้นที่ช่วยตรวจสอบแล้วว่าเหตุการณ์เกิดขึ้นจริง',
          actor: 'เครือข่ายลูกบ้าน LocalHub',
          locationText: alt.province,
          timestamp: alt.createdAt + 600000,
          badgeText: '✅ ยืนยันเหตุจริง',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          extraId: alt.id
        });
      }

      if (alt.notFoundCount && alt.notFoundCount > 0) {
        list.push({
          id: `act_fake_${alt.id}`,
          type: 'fake_flag',
          title: `แจ้งข้อสงสัยอาจเป็นข่าวปลอม (${alt.notFoundCount} คน): ${alt.title}`,
          detail: 'ประชาชนรายงานว่าไม่พบเหตุการณ์ตามที่แจ้ง กำลังเข้าสู่การตรวจสอบของแอดมิน',
          actor: 'ระบบตรวจจับข่าวปลอม',
          locationText: alt.province,
          timestamp: alt.createdAt + 1200000,
          badgeText: '⚠️ ตรวจสอบข่าวปลอม',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
          extraId: alt.id
        });
      }
    });

    // 2. Community Posts
    posts.forEach((p) => {
      list.push({
        id: `act_post_${p.id}`,
        type: 'post',
        title: `โพสต์ใหม่ในฟีดชุมชน: ${p.title}`,
        detail: p.content,
        actor: p.author,
        actorRole: p.authorRole,
        locationText: `${p.location.district || ''} ${p.location.province || ''}`.trim() || 'กรุงเทพมหานคร',
        timestamp: p.createdAt,
        badgeText: '💬 โพสต์ชุมชน',
        badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
        extraId: p.id
      });
    });

    // 3. Official Admin Broadcasts
    broadcasts.forEach((b) => {
      list.push({
        id: `act_bc_${b.id}`,
        type: 'broadcast',
        title: `การบรอดแคสต์ทางการ: ${b.title}`,
        detail: b.message,
        actor: b.adminName,
        actorRole: 'ผู้ดูแลระบบ',
        locationText: b.targetArea || 'ทุกพื้นที่',
        timestamp: b.broadcastAt,
        badgeText: '📢 บรอดแคสต์',
        badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        extraId: b.id
      });
    });

    // 4. Market Items
    marketItems.forEach((m) => {
      list.push({
        id: `act_mkt_${m.id}`,
        type: 'market',
        title: `ลงขายสินค้าตลาดนัด: ${m.title} (฿${m.price.toLocaleString()})`,
        detail: m.description,
        actor: m.seller,
        locationText: `${m.district} ${m.province}`,
        timestamp: m.createdAt,
        badgeText: '🛍️ ตลาดนัด',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        extraId: m.id
      });
    });

    // 5. User Account Lifecycles & Retention Logs (บันทึกกิจกรรมบัญชีผู้ใช้)
    registeredUsers.forEach((u) => {
      list.push({
        id: `act_usr_reg_${u.uid}`,
        type: 'verify',
        title: `ลงทะเบียนบัญชีผู้ใช้: ${u.displayName}`,
        detail: `ผู้ใช้งานสมัครสมาชิกในพื้นที่ ${u.province || 'ไม่ระบุ'} (${u.email})`,
        actor: u.displayName,
        actorRole: u.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก',
        locationText: `${u.district || ''} ${u.province || ''}`.trim() || 'ประเทศไทย',
        timestamp: u.createdAt,
        badgeText: u.role === 'admin' ? '🛡️ แอดมินใหม่' : '👤 สมาชิกใหม่',
        badgeColor: u.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-slate-100 text-slate-800 border-slate-200',
        extraId: u.uid
      });

      if (u.isInactiveWarning) {
        list.push({
          id: `act_usr_warn_${u.uid}`,
          type: 'verify',
          title: `ระบบแจ้งเตือนบัญชีไม่มีการเคลื่อนไหวนานเกิน 3 เดือน: ${u.displayName}`,
          detail: 'ตรวจพบไม่มีการเคลื่อนไหวเกิน 90 วัน ระบบแสดงการแจ้งเตือนที่หน้าฉัน และเริ่มนับถอยหลัง 30 วัน',
          actor: 'ระบบอัตโนมัติ (Retention Service)',
          actorRole: 'ระบบอัตโนมัติ',
          locationText: `${u.district || ''} ${u.province || ''}`.trim() || 'ประเทศไทย',
          timestamp: u.inactiveWarningAt || Date.now() - 86400000,
          badgeText: '⚠️ เตือน 3 เดือน',
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          extraId: u.uid
        });
      }

      if (u.isAutoDeleted) {
        list.push({
          id: `act_usr_del_${u.uid}`,
          type: 'verify',
          title: `ลบบัญชีอัตโนมัติครบ 30 วัน: ${u.displayName}`,
          detail: 'ไม่มีการกดยืนยันการใช้งานภายใน 30 วัน ระบบลบบัญชีออกจากระบบอย่างถาวรตามนโยบายความเป็นส่วนตัว',
          actor: 'ระบบจัดการบัญชีอัตโนมัติ',
          actorRole: 'ระบบอัตโนมัติ',
          locationText: `${u.district || ''} ${u.province || ''}`.trim() || 'ประเทศไทย',
          timestamp: (u.inactiveWarningAt || Date.now() - 30 * 86400000) + 30 * 86400000,
          badgeText: '🗑️ ลบอัตโนมัติ',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
          extraId: u.uid
        });
      }
    });

    // Sort descending by timestamp (latest activities first)
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list;
  }, [alerts, posts, broadcasts, marketItems, registeredUsers]);

  // Filtered Activity List (รวมหมวดหมู่ + ค้นหาตามวันเวลา + คำค้นหา)
  const filteredActivities = useMemo(() => {
    let list = applicationActivities;

    // 1. Category Filter
    if (activityFilter === 'alerts') list = list.filter((a) => a.type === 'alert');
    else if (activityFilter === 'posts') list = list.filter((a) => a.type === 'post');
    else if (activityFilter === 'broadcasts') list = list.filter((a) => a.type === 'broadcast');
    else if (activityFilter === 'market') list = list.filter((a) => a.type === 'market');
    else if (activityFilter === 'moderation')
      list = list.filter((a) => a.type === 'verify' || a.type === 'fake_flag');

    // 2. Date Filter (ค้นหาตามวัน)
    if (appliedDate) {
      list = list.filter((a) => toISODateString(a.timestamp) === appliedDate);
    }

    // 3. Time Filter (ค้นหาตามเวลา)
    if (appliedTime) {
      list = list.filter((a) => {
        const d = new Date(a.timestamp);
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${mins}`;
        const targetHour = appliedTime.split(':')[0];
        return hours === targetHour || timeStr.startsWith(appliedTime);
      });
    }

    // 4. Keyword Filter
    if (appliedKeyword.trim()) {
      const q = appliedKeyword.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.detail.toLowerCase().includes(q) ||
          a.actor.toLowerCase().includes(q) ||
          a.locationText.toLowerCase().includes(q)
      );
    }

    return list;
  }, [applicationActivities, activityFilter, appliedDate, appliedTime, appliedKeyword]);

  // Display only 10 items at a time initially, expanding by 10
  const displayedActivities = filteredActivities.slice(0, visibleActivityCount);

  // Time format
  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'เมื่อสักครู่';
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ชม. ที่แล้ว`;
    return `${Math.floor(hours / 24)} วันที่แล้ว`;
  };

  return (
    <div className="space-y-5 pb-16 animate-fadeIn max-w-5xl mx-auto">
      {/* 1. Header Admin Command Center Banner */}
      <div className="p-5 sm:p-7 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl shadow-xl border-2 border-red-500/40 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={goBack}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/20 transition active:scale-95"
                title="ย้อนกลับ"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ย้อนกลับ</span>
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/40 text-xs font-black">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>ADMIN ALL-IN-ONE CONSOLE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              🛡️ แดชบอร์ดแอดมิน & ศูนย์รวมข้อมูลทั้งแอปพลิเคชัน
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              รวมข้อมูลทั้งหมดของแอปพลิเคชันสำหรับ Admin: แสดงทุกการเคลื่อนไหวแบบเรียลไทม์ การควบคุมบรอดแคสต์ฉุกเฉิน
              การทดสอบเสียงไซเรนเตือนภัย และการตรวจสอบเหตุการณ์
            </p>

            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                สิทธิ์: <strong>ผู้ดูแลระบบสูงสุด (Super Admin)</strong>
              </span>
              <span>•</span>
              <span>บัญชี: <strong className="text-slate-200">{currentUser?.email || ORIGINAL_ADMIN_EMAIL}</strong></span>
              <span>•</span>
              <span>พื้นที่ควบคุม: <strong className="text-slate-200">{location?.province || 'ทั่วประเทศ'}</strong></span>
            </div>

            {/* Quick Mode & Navigation Switcher Bar (ปุ่มสลับแอดมินกับผู้ใช้งานทั่วไป และ หน้าฉัน) */}
            <div className="flex items-center gap-2 flex-wrap pt-2.5">
              {/* ปุ่มสลับเป็นผู้ใช้งานทั่วไป */}
              <button
                onClick={() => {
                  showToast('👤 สลับกลับสู่โหมดผู้ใช้งานทั่วไป (หน้าหลัก) เรียบร้อยแล้ว', 'info');
                  setActiveTab('home');
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 border border-emerald-400/40"
                title="กดเพื่อสลับไปยังมุมมองผู้ใช้งานทั่วไป (หน้าหลัก)"
              >
                <User className="w-4 h-4" />
                <span>สลับเป็นผู้ใช้งานทั่วไป</span>
              </button>

              {/* ปุ่มสลับสิทธิ์แอดมิน */}
              <button
                onClick={() => {
                  const nextState = !isAdmin;
                  setIsAdmin(nextState);
                  if (nextState) {
                    showToast('🛡️ สิทธิ์แอดมิน: เปิดใช้งานอยู่', 'success');
                  } else {
                    showToast('👤 สลับเป็นผู้ใช้งานทั่วไป: ปิดสิทธิ์แอดมินแล้ว', 'info');
                    setActiveTab('home');
                  }
                }}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
                title="สลับสิทธิ์การทำงานระหว่าง แอดมิน กับ สมาชิกทั่วไป"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>สลับสิทธิ์แอดมิน ({isAdmin ? 'ON' : 'OFF'})</span>
              </button>

              {/* ปุ่มไปหน้าฉัน (โปรไฟล์) */}
              <button
                onClick={() => setActiveTab('profile')}
                className="px-3.5 py-2 bg-blue-600/80 hover:bg-blue-600 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/30 border border-blue-400/40"
                title="ไปยังหน้าฉัน (โปรไฟล์ส่วนตัว)"
              >
                <User className="w-4 h-4" />
                <span>หน้าฉัน (โปรไฟล์)</span>
              </button>

              {/* ปุ่มกลับหน้าหลัก */}
              <button
                onClick={() => setActiveTab('home')}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
                title="กลับหน้าหลัก"
              >
                <Home className="w-4 h-4" />
                <span>หน้าหลัก</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {(isTestingLocalAdmin || isTestingAllDevices) && (
              <button
                onClick={handleStopAllAlerts}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-black rounded-2xl transition shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 animate-bounce-subtle"
              >
                <VolumeX className="w-4 h-4 animate-spin" />
                <span>หยุดเสียงเตือนทันที!</span>
              </button>
            )}

            <button
              onClick={() => setOpenAdminModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white rounded-2xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
              title="เปิดหน้าต่างเขียนข้อความบรอดแคสต์ทางการ"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างบรอดแคสต์ใหม่</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Warning Bar if Siren Audio is playing */}
      {(isTestingLocalAdmin || isTestingAllDevices) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/20 rounded-xl">
              <Volume2 className="w-5 h-5 animate-bounce" />
            </span>
            <div>
              <div className="font-black text-sm">
                {isTestingLocalAdmin
                  ? '🔊 กำลังทดสอบสัญญาณเสียง & ระบบสั่นเฉพาะเครื่องแอดมินนี้...'
                  : '📡 กำลังส่งสัญญาณฉุกเฉินและระบบสั่นไปยังทุกอุปกรณ์ (All Devices)...'}
              </div>
              <div className="text-xs text-red-100">
                {isTestingLocalAdmin
                  ? 'สัญญาณดังเฉพาะอุปกรณ์นี้ ไม่รบกวนประชาชน'
                  : 'กำลังกระจายสัญญาณผ่าน Cloud & Service Worker ไปยังเครื่องของประชาชน'}
              </div>
            </div>
          </div>
          <button
            onClick={handleStopAllAlerts}
            className="px-4 py-2 bg-white text-red-700 hover:bg-red-50 active:scale-95 font-black text-xs rounded-xl shadow-md transition"
          >
            กดหยุดทันที
          </button>
        </div>
      )}

      {/* 3. Comprehensive Application Metrics Overview (รวมข้อมูลทั้งหมดของ application พร้อมจำนวนบัญชีผู้ใช้งานทั้งหมด) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* จำนวนบัญชีผู้ใช้งานทั้งหมด (Total User Accounts) */}
        <div
          onClick={() => setActiveSubTab('users')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1 cursor-pointer hover:border-blue-400 hover:shadow-md transition group"
          title="คลิกเพื่อดูและจัดการบัญชีผู้ใช้งานทั้งหมด"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold group-hover:text-blue-600 transition">บัญชีผู้ใช้ทั้งหมด</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
            <span>{totalUsersCount}</span>
            <span className="text-xs font-normal text-slate-400">บัญชี</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
            <span className="text-emerald-600 font-bold">🟢 {activeUsersCount}</span>
            {inactiveUsersCount > 0 ? (
              <span className="text-amber-700 font-bold bg-amber-100 px-1 py-0.2 rounded-md">
                ⚠️ ไม่เคลื่อนไหว {inactiveUsersCount}
              </span>
            ) : (
              <span className="text-slate-400">เคลื่อนไหวปกติ</span>
            )}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">เหตุการณ์ฉุกเฉิน</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{alerts.length}</div>
          <p className="text-[10px] text-slate-500">รายงานจากประชาชน</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">บรอดแคสต์ทั้งหมด</span>
            <Radio className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{broadcasts.length}</div>
          <p className="text-[10px] text-slate-500">ประกาศทางการ</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">โพสต์ในฟีด</span>
            <MessageSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{posts.length}</div>
          <p className="text-[10px] text-slate-500">เรื่องราวชุมชน</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">สินค้าในตลาด</span>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{marketItems.length}</div>
          <p className="text-[10px] text-slate-500">ร้านค้า & ตลาดชุมชน</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">ความเคลื่อนไหว</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{applicationActivities.length}</div>
          <p className="text-[10px] text-slate-500">เหตุการณ์ในระบบ</p>
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs in Admin Dashboard */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl text-xs font-bold overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>บัญชีผู้ใช้ ({totalUsersCount})</span>
          {inactiveUsersCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[9px] rounded-full font-black animate-pulse">
              {inactiveUsersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('activity')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'activity' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>ทุกการเคลื่อนไหว ({applicationActivities.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('broadcasts')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'broadcasts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Radio className="w-4 h-4 text-indigo-600" />
          <span>ศูนย์บรอดแคสต์ ({broadcasts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('moderation')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'moderation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>ตรวจสอบเหตุ & ข่าวปลอม</span>
        </button>

        <button
          onClick={() => setActiveSubTab('signal_test')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'signal_test' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Volume2 className="w-4 h-4 text-amber-600" />
          <span>ทดสอบเสียง & ไซเรน</span>
        </button>
      </div>

      {/* 5. TAB 1: Real-time Application Movements Stream (บันทึกความเคลื่อนไหวของระบบ: แสดงครั้งละ 10 หัวข้อ + ดูเพิ่มเติม + ค้นหาตามวันเวลา) */}
      {activeSubTab === 'activity' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <span>บันทึกความเคลื่อนไหวสดของระบบ (Live Activity Audit Stream)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </h2>
              <p className="text-xs text-slate-500">
                แสดงครั้งละ 10 หัวข้อ พร้อมปุ่มดูเพิ่มเติม และแถบค้นหาดึงข้อมูลตามวันและเวลา
              </p>
            </div>

            {/* Filter Category Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full scrollbar-none text-xs">
              {(
                [
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'alerts', label: '🚨 เหตุฉุกเฉิน' },
                  { id: 'posts', label: '💬 โพสต์ฟีด' },
                  { id: 'broadcasts', label: '📢 บรอดแคสต์' },
                  { id: 'market', label: '🛍️ ตลาด' },
                  { id: 'moderation', label: '🛡️ ยืนยัน/ตรวจสอบ' }
                ] as const
              ).map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => {
                    setActivityFilter(chip.id);
                    setVisibleActivityCount(10);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
                    activityFilter === chip.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Search Bar (แถบค้นหาตามวัน เวลา ได้ด้วย เมื่อกดค้นหาตามวันเวลาระบบจะดึงข้อมูลของวันนั้นตามที่ระบุออกมา) */}
          <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>แถบค้นหาตามวันและเวลา (Date & Time Search Filter)</span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1 text-[11px] flex-wrap">
                <button
                  onClick={() => {
                    const todayStr = toISODateString(Date.now());
                    setActivitySearchDate(todayStr);
                    setAppliedDate(todayStr);
                    setVisibleActivityCount(10);
                    showToast(`📅 ดึงข้อมูลความเคลื่อนไหวประจำวันนี้ (${todayStr})`, 'info');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                    appliedDate === toISODateString(Date.now())
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  วันนี้
                </button>
                <button
                  onClick={() => {
                    const yesterdayStr = toISODateString(Date.now() - 86400000);
                    setActivitySearchDate(yesterdayStr);
                    setAppliedDate(yesterdayStr);
                    setVisibleActivityCount(10);
                    showToast(`📅 ดึงข้อมูลความเคลื่อนไหวเมื่อวานนี้ (${yesterdayStr})`, 'info');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                    appliedDate === toISODateString(Date.now() - 86400000)
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  เมื่อวาน
                </button>
                {(appliedDate || appliedTime || appliedKeyword) && (
                  <button
                    onClick={handleResetDateSearch}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold border border-rose-200 transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>ล้างการค้นหา</span>
                  </button>
                )}
              </div>
            </div>

            {/* Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  เลือกวันที่ (Day / Date):
                </label>
                <input
                  type="date"
                  value={activitySearchDate}
                  onChange={(e) => setActivitySearchDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  ระบุเวลา (Time - ตัวเลือก):
                </label>
                <input
                  type="time"
                  value={activitySearchTime}
                  onChange={(e) => setActivitySearchTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  คำค้นหาเนื้อหา / บุคคล:
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อเรื่อง ผู้รายงาน..."
                    value={activityKeyword}
                    onChange={(e) => setActivityKeyword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  onClick={handleApplyDateSearch}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>ค้นหาข้อมูล</span>
                </button>
              </div>
            </div>

            {/* Feedback notification of filtered date */}
            {(appliedDate || appliedTime || appliedKeyword) && (
              <div className="p-2.5 bg-blue-100/70 border border-blue-200 rounded-xl flex items-center justify-between gap-2 text-xs text-blue-900 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold">🔎 ผลการค้นหาข้อมูล:</span>
                  {appliedDate && (
                    <span className="bg-white px-2 py-0.5 rounded-md font-bold text-blue-700 shadow-2xs">
                      วันที่: {appliedDate}
                    </span>
                  )}
                  {appliedTime && (
                    <span className="bg-white px-2 py-0.5 rounded-md font-bold text-blue-700 shadow-2xs">
                      เวลา: {appliedTime} น.
                    </span>
                  )}
                  {appliedKeyword && (
                    <span className="bg-white px-2 py-0.5 rounded-md font-bold text-blue-700 shadow-2xs">
                      คำค้น: "{appliedKeyword}"
                    </span>
                  )}
                  <span className="text-slate-600">
                    ดึงข้อมูลของวันนั้นออกมาได้ <strong>{filteredActivities.length}</strong> หัวข้อ
                  </span>
                </div>

                <button
                  onClick={handleResetDateSearch}
                  className="text-[11px] font-bold text-blue-800 hover:underline flex items-center gap-0.5"
                >
                  <X className="w-3 h-3" />
                  <span>ล้างการค้นหา</span>
                </button>
              </div>
            )}
          </div>

          {/* Activity Timeline List (แสดงครั้งละ 10 หัวข้อ) */}
          <div className="space-y-3">
            {displayedActivities.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Activity className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">
                  ไม่พบความเคลื่อนไหวในวัน/เวลา หรือเงื่อนไขที่ระบุ
                </p>
                <p className="text-[11px] text-slate-400">
                  ลองเลือกวันที่อื่น หรือกดปุ่ม "ล้างการค้นหา" เพื่อแสดงทุกรายการ
                </p>
                <button
                  onClick={handleResetDateSearch}
                  className="mt-2 px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition border border-blue-200"
                >
                  แสดงความเคลื่อนไหวทั้งหมด
                </button>
              </div>
            ) : (
              displayedActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${act.badgeColor}`}>
                        {act.badgeText}
                      </span>
                      <span className="text-[11px] text-slate-600 font-semibold flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        <span>{formatDateTimeThai(act.timestamp)}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({formatTime(act.timestamp)})
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold truncate">
                        โดย: <strong>{act.actor}</strong>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">{act.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{act.detail}</p>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{act.locationText}</span>
                      </span>
                    </div>
                  </div>

                  {/* Context Action */}
                  <div className="shrink-0 pt-1">
                    {act.type === 'alert' && (
                      <button
                        onClick={() => setActiveTab('alerts')}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition border border-rose-200"
                      >
                        ดูในศูนย์เตือนภัย
                      </button>
                    )}

                    {act.type === 'post' && act.extraId && (
                      <button
                        onClick={() => openPostDetail(act.extraId!)}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition border border-blue-200"
                      >
                        อ่านโพสต์
                      </button>
                    )}

                    {act.type === 'broadcast' && (
                      <button
                        onClick={() => setActiveTab('broadcasts')}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition border border-indigo-200"
                      >
                        ดูบรอดแคสต์
                      </button>
                    )}

                    {act.type === 'market' && (
                      <button
                        onClick={() => setActiveTab('market')}
                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl transition border border-amber-200"
                      >
                        ดูสินค้า
                      </button>
                    )}

                    {act.type === 'verify' && (
                      <button
                        onClick={() => setActiveSubTab('users')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition border border-slate-200"
                      >
                        ดูบัญชีผู้ใช้
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More Button (แสดงเพียงครั้งละ 10 หัวข้อ และมีปุ่มดูเพิ่มเติมด้านล่าง ระบบจะแสดงอีก 10 หัวข้อลงไปเรื่อยๆ) */}
          {visibleActivityCount < filteredActivities.length && (
            <div className="pt-4 pb-2 text-center border-t border-slate-100 space-y-2">
              <button
                onClick={() => setVisibleActivityCount((prev) => prev + 10)}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition flex items-center justify-center gap-2 mx-auto active:scale-95 group"
              >
                <span>ดูเพิ่มเติม (+10 หัวข้อ)</span>
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>
              <p className="text-[11px] text-slate-500">
                กำลังแสดง <strong>{displayedActivities.length}</strong> จากทั้งหมด <strong>{filteredActivities.length}</strong> หัวข้อ (กดเพื่อแสดงเพิ่มครั้งละ 10 หัวข้อลงไปเรื่อยๆ)
              </p>
            </div>
          )}

          {/* All topics loaded message */}
          {visibleActivityCount >= filteredActivities.length && filteredActivities.length > 0 && (
            <div className="text-center pt-3 pb-1 text-xs text-slate-400 font-medium border-t border-slate-100">
              ✓ แสดงครบทั้งหมด {filteredActivities.length} หัวข้อความเคลื่อนไหวแล้ว
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 2: Official Admin Broadcasts Center (ศูนย์ควบคุมการบรอดแคสต์) */}
      {activeSubTab === 'broadcasts' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-black text-sm sm:text-base text-slate-900">
                รายการบรอดแคสต์ทางการของแอดมิน ({broadcasts.length} รายการ)
              </h2>
              <p className="text-xs text-slate-500">
                ส่งประกาศสำคัญ เตือนภัยฉุกเฉิน และข่าวสารไปยังประชาชนในพื้นที่แบบ Push Notification
              </p>
            </div>

            <button
              onClick={() => setOpenAdminModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างบรอดแคสต์ใหม่</span>
            </button>
          </div>

          <div className="space-y-3">
            {broadcasts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Radio className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">ยังไม่มีประวัติการส่งบรอดแคสต์</p>
                <button
                  onClick={() => setOpenAdminModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  เริ่มส่งบรอดแคสต์แรก
                </button>
              </div>
            ) : (
              broadcasts.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs space-y-2.5 transition"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        b.severity === 'urgent'
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : b.severity === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {b.severity === 'urgent' ? '🚨 ด่วนที่สุด' : b.severity === 'high' ? '⚠️ เตือนภัย' : '📢 ทั่วไป'}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(b.broadcastAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{b.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{b.message}</p>
                  </div>

                  {b.mediaUrl && (
                    <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={b.mediaUrl} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.viewsCount || 0} วิว</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.likesCount || 0} ถูกใจ</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          reBroadcastItem(b);
                          showToast(`ส่งบรอดแคสต์ "${b.title}" ซ้ำเรียบร้อยแล้ว`, 'success');
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>บรอดแคสต์ซ้ำ</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 7. TAB 3: Incident & Fake News Moderation (การตรวจสอบเหตุ & ข่าวปลอม) */}
      {activeSubTab === 'moderation' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="font-black text-sm sm:text-base text-slate-900">
              ระบบตรวจสอบรายงานเหตุฉุกเฉิน & ป้องกันข่าวปลอม
            </h2>
            <p className="text-xs text-slate-500">
              ควบคุมดูแลรายงานที่ประชาชนส่งเข้ามา ยืนยันเหตุจริง หรือทำเครื่องหมายเป็นข่าวปลอมเพื่อปกป้องสังคม
            </p>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs space-y-3 transition"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
                      {alert.type}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{alert.province} ({alert.district})</span>
                  </div>

                  <span className="text-[11px] text-slate-400">{formatTime(alert.createdAt)}</span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{alert.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {alert.description}
                  </p>
                </div>

                {/* Verification Stats & Admin Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ยืนยันแล้ว: {alert.verifiedCount || 1} คน</span>
                    </span>
                    <span className="text-rose-700 font-bold flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5 text-rose-600" />
                      <span>แจ้งไม่พบเหตุ: {alert.notFoundCount || 0} คน</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        confirmAlert(alert.id);
                        showToast(`แอดมินยืนยันเหตุจริง: ${alert.title}`, 'success');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>ยืนยันเหตุจริง</span>
                    </button>

                    <button
                      onClick={() => {
                        reportAlertNotFound(alert.id);
                        showToast(`ระบุข้อสงสัยข่าวปลอม: ${alert.title}`, 'info');
                      }}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition border border-rose-200 flex items-center gap-1"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>ระบุข่าวปลอม</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB 4: Siren Sound & Vibration Testing Console */}
      {activeSubTab === 'signal_test' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-red-600 text-white rounded-xl shadow-md">
                <Activity className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h2 className="font-extrabold text-sm sm:text-base">
                  ระบบทดสอบสัญญาณเตือนภัย & ระบบสั่นสะเทือน (Signal Test Console)
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  รวมระบบทดสอบสัญญาณเสียงไว้ที่นี่ที่เดียว ไม่ปะปนกับการส่งข่าวบรอดแคสต์
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/10 text-slate-300 font-bold hidden sm:inline">
              Web Audio Synth + Vibration API
            </span>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Mode 1: Local Admin Device Only */}
              <div className="p-5 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      โหมด 1: ทดสอบเฉพาะเครื่องนี้ (Admin Only)
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                      ปลอดภัย 100%
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-base">
                    ทดสอบเสียงไซเรน & สั่นสะเทือนเฉพาะเครื่องแอดมิน
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    ใช้สำหรับตรวจสอบลำโพง ระดับเสียง และมอเตอร์สั่นของโทรศัพท์หรือคอมพิวเตอร์ของคุณ โดย<strong>ไม่มีการส่งสัญญาณออกไปยังเครื่องของประชาชน</strong>
                  </p>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ประเภทเสียงสัญญาณทดสอบ
                      </label>
                      <select
                        value={localSoundType}
                        onChange={(e) => setLocalSoundType(e.target.value as TestSoundType)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 shadow-2xs"
                      >
                        <option value="siren">🚨 ไซเรนฉุกเฉินระดับสูงสุด (Urgent Siren 700-1100Hz)</option>
                        <option value="urgent">⚠️ เสียงเตือนภัยด่วนจังหวะถี่ (High Pulse Beep)</option>
                        <option value="high">📢 เสียงเตือน 2 ระดับความถี่ (Dual Tone Alert)</option>
                        <option value="announcement">✨ เสียงกริ่งประกาศทั่วไป (Chime Arpeggio)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ระยะเวลาทดสอบเสียง
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[3, 5, 8].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => setLocalDurationSec(sec)}
                            className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                              localDurationSec === sec
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {sec} วินาที
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {isTestingLocalAdmin ? (
                    <button
                      onClick={() => {
                        stopLocalDeviceTest();
                        showToast('⏹️ หยุดการทดสอบเฉพาะเครื่องนี้แล้ว', 'info');
                      }}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition shadow-md"
                    >
                      <Square className="w-4 h-4" />
                      <span>หยุดทดสอบเฉพาะเครื่องนี้</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        testLocalDeviceSignal(localSoundType, localDurationSec);
                        showToast(`▶️ กำลังทดสอบเสียง ${localDurationSec} วินาที (เฉพาะเครื่องนี้)`, 'info');
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/30"
                    >
                      <Play className="w-4 h-4" />
                      <span>กดเริ่มทดสอบ (ดังเฉพาะเครื่องนี้ {localDurationSec} วินาที)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Mode 2: All Devices Broadcast Test */}
              <div className="p-5 rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-red-50/60 to-rose-50/40 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black">
                      <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                      โหมด 2: ทดสอบทุกอุปกรณ์ (All Devices)
                    </span>
                    <span className="text-[11px] font-bold text-red-700 bg-white px-2 py-0.5 rounded-lg border border-red-200">
                      สัญญาณจริงทั่วระบบ
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-base">
                    ทดสอบส่งสัญญาณเตือนภัย & สั่นสะเทือนทุกเครื่อง
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    ส่งสัญญาณเตือนภัยฉุกเฉินไปยังทุกอุปกรณ์ที่เปิดหรือติดตั้ง LocalHub ผ่านคลาวด์และ Service Worker เหมาะสำหรับทดสอบความพร้อมในกรณีเกิดภัยพิบัติ
                  </p>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        หัวข้อข้อความแจ้งเตือนทดสอบ
                      </label>
                      <input
                        type="text"
                        value={allDevicesTitle}
                        onChange={(e) => setAllDevicesTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 shadow-2xs"
                        placeholder="เช่น 🚨 [ประกาศฉุกเฉินแอดมิน] สัญญาณเตือนภัยทุกอุปกรณ์"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ประเภทเสียงเตือนที่ส่งออกไป
                      </label>
                      <select
                        value={allDevicesSoundType}
                        onChange={(e) => setAllDevicesSoundType(e.target.value as TestSoundType)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 shadow-2xs"
                      >
                        <option value="siren">🚨 ไซเรนฉุกเฉินระดับสูงสุด (Urgent Siren)</option>
                        <option value="urgent">⚠️ เสียงเตือนภัยด่วนจังหวะถี่ (High Pulse Beep)</option>
                        <option value="high">📢 เสียงเตือน 2 ระดับความถี่ (Dual Tone Alert)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      testAllDevicesSignal(allDevicesTitle, allDevicesMessage, allDevicesSoundType);
                      showToast('📡 ส่งสัญญาณเตือนภัย & สั่นสะเทือนไปยังทุกอุปกรณ์สำเร็จ!', 'success');
                    }}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition shadow-lg shadow-red-600/30"
                  >
                    <RadioTower className="w-4 h-4 animate-pulse" />
                    <span>ส่งสัญญาณทดสอบทุกอุปกรณ์ (All Devices)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Diagnostics Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs sm:text-sm">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>การวินิจฉัยฮาร์ดแวร์และสิทธิ์ของอุปกรณ์นี้ (Device Diagnostics)</span>
                </div>
                <span className="text-[10px] text-slate-500">ตรวจสอบอัตโนมัติ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-[10px] font-bold">ระบบเสียงเว็บ (Web Audio API)</div>
                    <div className="font-extrabold text-emerald-700 text-xs mt-0.5">พร้อมสร้างคลื่นเสียงสด</div>
                  </div>
                  <Volume2 className="w-5 h-5 text-emerald-600" />
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-[10px] font-bold">ระบบสั่นสะเทือน (Vibration API)</div>
                    <div className={`font-extrabold text-xs mt-0.5 ${hasVibration ? 'text-emerald-700' : 'text-amber-600'}`}>
                      {hasVibration ? 'อุปกรณ์รองรับการสั่น' : 'ไม่รองรับการสั่น (พีซี/โน้ตบุ๊ก)'}
                    </div>
                  </div>
                  <Smartphone className={`w-5 h-5 ${hasVibration ? 'text-emerald-600' : 'text-amber-500'}`} />
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-[10px] font-bold">สิทธิ์การแจ้งเตือน (Notifications)</div>
                    <div className={`font-extrabold text-xs mt-0.5 ${notifPermission === 'granted' ? 'text-emerald-700' : 'text-amber-600'}`}>
                      {notifPermission === 'granted' ? 'อนุญาตแล้ว' : notifPermission === 'denied' ? 'ถูกบล็อก' : 'ยังไม่ได้เปิดสิทธิ์'}
                    </div>
                  </div>
                  {notifPermission !== 'granted' ? (
                    <button
                      onClick={handleRequestNotif}
                      className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg border border-indigo-200 transition"
                    >
                      เปิดสิทธิ์
                    </button>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 5: User Accounts Management & Inactivity Lifecycle (จำนวนบัญชีผู้ใช้งานทั้งหมด & ไม่เคลื่อนไหวเกิน 3 เดือน) */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
          {/* Header & Policy Explainer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>ศูนย์จัดการบัญชีผู้ใช้งานทั้งหมด & สถานะการเคลื่อนไหว</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                รวมจำนวนบัญชีผู้ใช้งานทั้งหมด ตรวจสอบบัญชีที่ไม่มีการเคลื่อนไหวเกิน 3 เดือน และติดตามการลบอัตโนมัติ 30 วัน
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-black rounded-xl border border-blue-200">
                รวมทั้งหมด {totalUsersCount} บัญชี
              </span>
            </div>
          </div>

          {/* Retention & Auto-deletion Policy Banner */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs sm:text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>กฎการบริหารจัดการบัญชีอัตโนมัติ (Automated Inactive Account Policy)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-amber-800">
              <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100 space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  1. ไม่เคลื่อนไหวเกิน 3 เดือน (90 วัน)
                </span>
                <p className="text-slate-600 leading-relaxed">
                  ระบบตรวจจับอัตโนมัติและแสดงป้ายเตือนสีส้มเด่นชัดที่ <strong>"หน้าฉัน"</strong> ของผู้ใช้ทันที
                </p>
              </div>

              <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100 space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  2. ให้เวลายืนยันตัวตน 30 วัน
                </span>
                <p className="text-slate-600 leading-relaxed">
                  ผู้ใช้สามารถกดยืนยันว่า <strong>"ยังมีการใช้งาน (รักษาสถานะ)"</strong> เพื่อรีเซ็ตสถานะกลับเป็นปกติ
                </p>
              </div>

              <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100 space-y-1">
                <span className="font-bold text-rose-900 flex items-center gap-1">
                  3. ลบอัตโนมัติหากไม่ยืนยันใน 30 วัน
                </span>
                <p className="text-slate-600 leading-relaxed">
                  หากไม่มีการกดยืนยันภายใน 30 วัน บัญชีจะถูก <strong>ลบออกจากระบบโดยอัตโนมัติ</strong> เพื่อความปลอดภัย
                </p>
              </div>
            </div>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-[11px] font-bold text-slate-500">บัญชีทั้งหมด</div>
              <div className="text-2xl font-black text-slate-900">{totalUsersCount}</div>
              <p className="text-[10px] text-slate-400">ผู้ใช้งานในระบบ</p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-1">
              <div className="text-[11px] font-bold text-emerald-700">ใช้งานต่อเนื่อง (Active)</div>
              <div className="text-2xl font-black text-emerald-800">{activeUsersCount}</div>
              <p className="text-[10px] text-emerald-600">เคลื่อนไหวภายใน 90 วัน</p>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-1">
              <div className="text-[11px] font-bold text-amber-700">ไม่เคลื่อนไหวเกิน 3 เดือน</div>
              <div className="text-2xl font-black text-amber-800">{inactiveUsersCount}</div>
              <p className="text-[10px] text-amber-600">รอการยืนยันตัวตน</p>
            </div>

            <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200/80 space-y-1">
              <div className="text-[11px] font-bold text-rose-700">ใกล้หมดเวลา 30 วัน (≤ 7 วัน)</div>
              <div className="text-2xl font-black text-rose-800">{pendingDeletionUsersCount}</div>
              <p className="text-[10px] text-rose-600">จะถูกลบเร็วๆ นี้</p>
            </div>
          </div>

          {/* Search Bar & Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อ, อีเมล, จังหวัด, หรืออำเภอ..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
              {userSearchQuery && (
                <button
                  onClick={() => setUserSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
              {(
                [
                  { id: 'all', label: `ทั้งหมด (${totalUsersCount})` },
                  { id: 'active', label: `🟢 ใช้งานปกติ (${activeUsersCount})` },
                  { id: 'inactive', label: `⚠️ ไม่เคลื่อนไหว (${inactiveUsersCount})` },
                  { id: 'admin', label: '👑 แอดมิน' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setUserFilterStatus(tab.id)}
                  className={`px-3 py-2 rounded-xl font-bold transition shrink-0 ${
                    userFilterStatus === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {registeredUsers
              .filter((u) => !u.isAutoDeleted)
              .filter((u) => {
                if (userFilterStatus === 'active') return !u.isInactiveWarning;
                if (userFilterStatus === 'inactive') return u.isInactiveWarning;
                if (userFilterStatus === 'admin') return u.role === 'admin' || u.isAdmin;
                return true;
              })
              .filter((u) => {
                if (!userSearchQuery.trim()) return true;
                const q = userSearchQuery.toLowerCase().trim();
                return (
                  u.displayName.toLowerCase().includes(q) ||
                  u.email.toLowerCase().includes(q) ||
                  (u.province && u.province.toLowerCase().includes(q)) ||
                  (u.district && u.district.toLowerCase().includes(q))
                );
              }).length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-3xl">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">ไม่พบบัญชีผู้ใช้งานที่ตรงกับเงื่อนไข</p>
                <p className="text-[11px] text-slate-400">ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ</p>
              </div>
            ) : (
              registeredUsers
                .filter((u) => !u.isAutoDeleted)
                .filter((u) => {
                  if (userFilterStatus === 'active') return !u.isInactiveWarning;
                  if (userFilterStatus === 'inactive') return u.isInactiveWarning;
                  if (userFilterStatus === 'admin') return u.role === 'admin' || u.isAdmin;
                  return true;
                })
                .filter((u) => {
                  if (!userSearchQuery.trim()) return true;
                  const q = userSearchQuery.toLowerCase().trim();
                  return (
                    u.displayName.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    (u.province && u.province.toLowerCase().includes(q)) ||
                    (u.district && u.district.toLowerCase().includes(q))
                  );
                })
                .map((user) => {
                  const daysSinceActive = Math.floor((Date.now() - user.lastActiveAt) / (24 * 60 * 60 * 1000));
                  const isCurrentAccount = currentUser?.uid === user.uid || (currentUser?.email && currentUser.email.toLowerCase() === user.email.toLowerCase());

                  return (
                    <div
                      key={user.uid}
                      className={`p-4 rounded-2xl border transition space-y-3 ${
                        user.isInactiveWarning
                          ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                            alt={user.displayName}
                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                                {user.displayName}
                              </h3>
                              {user.role === 'admin' || user.isAdmin ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black border border-red-200">
                                  👑 แอดมิน
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                                  สมาชิก
                                </span>
                              )}
                              {isCurrentAccount && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                                  คุณ (บัญชีปัจจุบัน)
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              {user.province && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{user.district ? `${user.district}, ` : ''}{user.province}</span>
                                </span>
                              )}
                              <span>•</span>
                              <span>สมัคร: {new Date(user.createdAt).toLocaleDateString('th-TH')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badges & Days */}
                        <div className="flex flex-col sm:items-end gap-1 shrink-0 w-full sm:w-auto">
                          {user.isInactiveWarning ? (
                            <div className="space-y-1 sm:text-right">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-extrabold text-[11px] border border-amber-300">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                <span>⚠️ ไม่เคลื่อนไหวเกิน 3 เดือน ({daysSinceActive} วัน)</span>
                              </span>
                              <div className="text-[11px] font-bold text-rose-600 flex items-center sm:justify-end gap-1">
                                <Clock className="w-3 h-3 text-rose-500" />
                                <span>เหลืออีก <strong>{user.warningDaysRemaining ?? 30} วัน</strong> ก่อนลบอัตโนมัติ</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 sm:text-right">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-[11px] border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>🟢 ใช้งานต่อเนื่อง (Active)</span>
                              </span>
                              <div className="text-[10px] text-slate-400">
                                เคลื่อนไหวล่าสุด: {daysSinceActive === 0 ? 'วันนี้' : `${daysSinceActive} วันที่แล้ว`}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Bar for Admin */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="text-[11px] text-slate-400">
                          UID: <span className="font-mono text-[10px] text-slate-500">{user.uid}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {user.isInactiveWarning && (
                            <button
                              onClick={() => {
                                confirmActiveStatus(user.uid);
                                showToast(`✅ ยืนยันสถานะการใช้งานของ ${user.displayName} สำเร็จ (รีเซ็ตเป็นปกติแล้ว)`, 'success');
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                              title="กดยืนยันว่าบัญชียังมีการใช้งาน เพื่อยกเลิกคำเตือนและรีเซ็ตเวลา"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>กดยืนยันสถานะแทนผู้ใช้</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี "${user.displayName}" (${user.email})? การดำเนินการนี้ไม่สามารถยกเลิกได้`)) {
                                deleteUserAccount(user.uid);
                                showToast(`🗑️ ลบบัญชี ${user.displayName} เรียบร้อยแล้ว`, 'info');
                              }
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                            title="ลบบัญชีผู้ใช้งานนี้ออกจากระบบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ลบบัญชี</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
