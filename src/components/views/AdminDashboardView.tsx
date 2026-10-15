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
  X
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
    goBack
  } = useCommunity();

  // Active activity filter
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [activeSubTab, setActiveSubTab] = useState<'activity' | 'broadcasts' | 'moderation' | 'signal_test'>('activity');

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
        locationText: `${alt.district || ''} ${alt.province || ''}`,
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
          detail: `ประชาชนในพื้นที่ช่วยตรวจสอบแล้วว่าเหตุการณ์เกิดขึ้นจริง`,
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
          detail: `ประชาชนรายงานว่าไม่พบเหตุการณ์ตามที่แจ้ง กำลังเข้าสู่การตรวจสอบของแอดมิน`,
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
        locationText: `${p.location.district || ''} ${p.location.province || ''}`,
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

    // Sort descending by timestamp (latest activities first)
    list.sort((a, b) => b.timestamp - a.timestamp);
    return list;
  }, [alerts, posts, broadcasts, marketItems]);

  // Filtered Activity List
  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') return applicationActivities;
    if (activityFilter === 'alerts') return applicationActivities.filter((a) => a.type === 'alert');
    if (activityFilter === 'posts') return applicationActivities.filter((a) => a.type === 'post');
    if (activityFilter === 'broadcasts') return applicationActivities.filter((a) => a.type === 'broadcast');
    if (activityFilter === 'market') return applicationActivities.filter((a) => a.type === 'market');
    if (activityFilter === 'moderation')
      return applicationActivities.filter((a) => a.type === 'verify' || a.type === 'fake_flag');
    return applicationActivities;
  }, [applicationActivities, activityFilter]);

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

      {/* 3. Comprehensive Application Metrics Overview (รวมข้อมูลทั้งหมดของ application) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
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

      {/* 5. TAB 1: Real-time Application Movements Stream (ทุกๆการเคลื่อนไหวของ application) */}
      {activeSubTab === 'activity' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <span>บันทึกความเคลื่อนไหวสดของระบบ (Live Activity Audit Stream)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </h2>
              <p className="text-xs text-slate-500">
                ทุกๆ การโพสต์, การแจ้งเหตุ, การบรอดแคสต์, และการกดตรวจสอบของประชาชนจะบันทึกที่นี่
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
              {(
                [
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'alerts', label: '🚨 เหตุฉุกเฉิน' },
                  { id: 'posts', label: '💬 โพสต์ฟีด' },
                  { id: 'broadcasts', label: '📢 บรอดแคสต์' },
                  { id: 'market', label: '🛍️ ตลาด' },
                  { id: 'moderation', label: '🛡️ ยืนยัน/ข่าวปลอม' }
                ] as const
              ).map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setActivityFilter(chip.id)}
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

          {/* Activity Timeline List */}
          <div className="space-y-3">
            {filteredActivities.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <Activity className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">ไม่มีกิจกรรมในหมวดนี้</p>
              </div>
            ) : (
              filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${act.badgeColor}`}>
                        {act.badgeText}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(act.timestamp)}</span>
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
                  </div>
                </div>
              ))
            )}
          </div>
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
    </div>
  );
};
