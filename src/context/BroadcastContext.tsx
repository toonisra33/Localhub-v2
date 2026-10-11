import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AdminBroadcast,
  BroadcastCategory,
  BroadcastSeverity,
  BroadcastTargetScope,
  BroadcastTargetLevel
} from '../types';
import { sendSystemNotification, initBackgroundSyncListener } from '../utils/notificationService';

export interface BroadcastInput {
  title: string;
  message: string;
  category: BroadcastCategory;
  severity: BroadcastSeverity;
  targetScope?: BroadcastTargetScope;
  targetLevel?: BroadcastTargetLevel;
  targetProvince?: string;
  targetDistrict?: string;
  targetSubdistrict?: string;
  targetArea?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  mediaFileName?: string;
  videoDurationSec?: number;
  actionUrl?: string;
  actionText?: string;
}

interface BroadcastContextType {
  broadcasts: AdminBroadcast[];
  activeBroadcast: AdminBroadcast | null;
  dismissedIds: string[];
  isAdminModalOpen: boolean;
  soundEnabled: boolean;
  sendBroadcast: (data: BroadcastInput) => Promise<AdminBroadcast>;
  saveBroadcastTemplate: (data: BroadcastInput) => void;
  reBroadcastItem: (broadcast: AdminBroadcast) => void;
  dismissBroadcast: (id: string) => void;
  setOpenAdminModal: (open: boolean) => void;
  setSoundEnabled: (val: boolean) => void;
  playSoundAlert: (severity?: BroadcastSeverity) => void;
  deleteBroadcast: (id: string) => void;
}

const INITIAL_BROADCASTS: AdminBroadcast[] = [
  {
    id: 'bc_pm25_warning',
    title: '⚠️ แจ้งเตือนด่วน: ค่าฝุ่น PM2.5 เกินเกณฑ์มาตรฐานระดับสีส้ม',
    message: 'กรมควบคุมมลพิษรายงานค่าเฉลี่ย PM2.5 ในพื้นที่กรุงเทพฯ และปริมณฑล เกิน 65 µg/m³ ขอให้ประชาชนกลุ่มเสี่ยงสวมหน้ากาก N95 และหลีกเลี่ยงกิจกรรมกลางแจ้ง',
    category: 'weather',
    severity: 'high',
    targetScope: 'specific',
    targetLevel: 'province',
    targetProvince: 'กรุงเทพมหานคร',
    targetArea: 'กรุงเทพมหานคร และปริมณฑล',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1542314831-c6a4d2757271?w=800&auto=format&fit=crop&q=80',
    broadcastAt: Date.now() - 3600000 * 2,
    broadcastDateStr: 'วันนี้ 09:30 น.',
    adminName: 'ศูนย์อำนวยการความปลอดภัยสิ่งแวดล้อม',
    adminRole: 'Super Admin',
    isPinned: true,
    actionText: 'ดูสถานีวัดคุณภาพอากาศ',
    actionUrl: 'https://air4thai.pcd.go.th',
    viewsCount: 1420,
    likesCount: 88,
  },
  {
    id: 'bc_road_closure',
    title: '🚧 ปิดการจราจรชั่วคราว ซ่อมท่อประปาหลัก ถ.สุขุมวิท ซอย 21',
    message: 'การประปานครหลวงจำเป็นต้องปิดช่องทางจราจรซ้ายสุด 1 ช่องทาง เพื่อซ่อมท่อส่งน้ำประปา คาดว่าจะแล้วเสร็จเวลา 17:00 น. โปรดใช้เส้นทางเลี่ยง',
    category: 'traffic',
    severity: 'normal',
    targetScope: 'specific',
    targetLevel: 'district',
    targetProvince: 'กรุงเทพมหานคร',
    targetDistrict: 'วัฒนา',
    targetArea: 'กรุงเทพมหานคร / เขตวัฒนา',
    broadcastAt: Date.now() - 3600000 * 5,
    broadcastDateStr: 'วันนี้ 07:00 น.',
    adminName: 'สำนักงานเขตวัฒนา & กทม.',
    adminRole: 'Staff',
    viewsCount: 860,
    likesCount: 42,
  },
  {
    id: 'bc_farmers_fair',
    title: '🎉 ขอเชิญร่วมงานมหกรรม "ตลาดนัดผลผลิตชุมชน & Green Market 2026"',
    message: 'พบกับสินค้าเกษตรอินทรีย์ ผักสดปลอดสาร อาหารพื้นบ้าน และงานคราฟต์จากวิสาหกิจชุมชนกว่า 100 บูธ วันเสาร์-อาทิตย์นี้ ณ สวนหลวง ร.9',
    category: 'marketing',
    severity: 'special',
    targetScope: 'all',
    targetArea: 'ทุกพื้นที่ / ชุมชนใกล้เคียง',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&auto=format&fit=crop&q=80',
    broadcastAt: Date.now() - 3600000 * 18,
    broadcastDateStr: 'เมื่อวาน 14:00 น.',
    adminName: 'ฝ่ายประชาสัมพันธ์วิสาหกิจชุมชน',
    adminRole: 'Admin',
    viewsCount: 2340,
    likesCount: 195,
  }
];

const BroadcastContext = createContext<BroadcastContextType | undefined>(undefined);

export const BroadcastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>(() => {
    try {
      const stored = localStorage.getItem('localhub_broadcasts');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse broadcasts from storage:', e);
    }
    return INITIAL_BROADCASTS;
  });

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('localhub_dismissed_broadcasts');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  });

  const [isAdminModalOpen, setOpenAdminModal] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Save broadcasts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('localhub_broadcasts', JSON.stringify(broadcasts));
    } catch (e) {
      console.warn(e);
    }
  }, [broadcasts]);

  useEffect(() => {
    try {
      localStorage.setItem('localhub_dismissed_broadcasts', JSON.stringify(dismissedIds));
    } catch (e) {
      console.warn(e);
    }
  }, [dismissedIds]);

  // Audio tone generator for alert notification
  const playSoundAlert = useCallback((severity: BroadcastSeverity = 'urgent') => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const playBeep = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = severity === 'urgent' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      if (severity === 'urgent') {
        playBeep(880, 0, 0.2);
        playBeep(1100, 0.25, 0.2);
        playBeep(880, 0.5, 0.3);
      } else if (severity === 'high') {
        playBeep(660, 0, 0.25);
        playBeep(880, 0.28, 0.35);
      } else {
        playBeep(523.25, 0, 0.2);
        playBeep(659.25, 0.2, 0.3);
      }
    } catch (err) {
      console.warn('Audio feedback failed:', err);
    }
  }, [soundEnabled]);

  const sendBroadcast = async (data: BroadcastInput): Promise<AdminBroadcast> => {
    const now = Date.now();
    const date = new Date(now);
    const dateStr = `วันนี้ ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} น.`;

    // Determine friendly area string
    let areaDisplay = 'ทุกพื้นที่ (ทั่วประเทศ)';
    if (data.targetScope === 'specific') {
      if (data.targetProvince) {
        areaDisplay = `จ.${data.targetProvince}`;
        if (data.targetDistrict) areaDisplay += ` / อ.${data.targetDistrict}`;
        if (data.targetSubdistrict) areaDisplay += ` / ต.${data.targetSubdistrict}`;
      } else if (data.targetArea) {
        areaDisplay = data.targetArea;
      }
    }

    const newBc: AdminBroadcast = {
      id: `bc_${now}`,
      title: data.title.trim(),
      message: data.message.trim(),
      category: data.category,
      severity: data.severity,
      targetScope: data.targetScope || 'all',
      targetLevel: data.targetLevel || 'province',
      targetProvince: data.targetProvince,
      targetDistrict: data.targetDistrict,
      targetSubdistrict: data.targetSubdistrict,
      targetArea: data.targetArea || areaDisplay,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl,
      mediaFileName: data.mediaFileName,
      videoDurationSec: data.videoDurationSec,
      actionUrl: data.actionUrl,
      actionText: data.actionText,
      broadcastAt: now,
      broadcastDateStr: dateStr,
      adminName: 'ศูนย์อำนวยการ LocalHub',
      adminRole: 'System Admin',
      isPinned: data.severity === 'urgent' || data.severity === 'high',
      viewsCount: 1,
      likesCount: 0,
    };

    setBroadcasts(prev => [newBc, ...prev]);

    // Send native system background notification (Android WebAPK native banner)
    sendSystemNotification({
      title: `📢 บรอดแคสต์: ${newBc.title}`,
      message: newBc.message,
      type: 'broadcast',
      severity: newBc.severity,
      targetArea: newBc.targetArea,
      link: `broadcast:${newBc.id}`,
      image: newBc.mediaUrl
    }).catch(e => console.warn('Background notification error:', e));

    // Play tone if urgent/high
    if (data.severity === 'urgent' || data.severity === 'high') {
      playSoundAlert(data.severity);
    }

    return newBc;
  };

  const saveBroadcastTemplate = (data: BroadcastInput) => {
    try {
      const templates = JSON.parse(localStorage.getItem('localhub_bc_templates') || '[]');
      templates.push({
        ...data,
        savedAt: Date.now(),
        templateName: data.title || 'เทมเพลตไม่มีชื่อ'
      });
      localStorage.setItem('localhub_bc_templates', JSON.stringify(templates));
    } catch (e) {
      console.warn('Failed to save template:', e);
    }
  };

  const reBroadcastItem = (broadcast: AdminBroadcast) => {
    const now = Date.now();
    const date = new Date(now);
    const dateStr = `ส่งซ้ำ วันนี้ ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} น.`;

    const rebroadcasted: AdminBroadcast = {
      ...broadcast,
      id: `bc_${now}`,
      broadcastAt: now,
      broadcastDateStr: dateStr,
      viewsCount: 1,
    };

    setBroadcasts(prev => [rebroadcasted, ...prev]);
    // remove from dismissed
    setDismissedIds(prev => prev.filter(id => id !== broadcast.id));

    // Send native system background notification for re-broadcast
    sendSystemNotification({
      title: `📢 [ส่งซ้ำ] ${rebroadcasted.title}`,
      message: rebroadcasted.message,
      type: 'broadcast',
      severity: rebroadcasted.severity,
      targetArea: rebroadcasted.targetArea,
      link: `broadcast:${rebroadcasted.id}`,
      image: rebroadcasted.mediaUrl
    }).catch(e => console.warn('Background notification error:', e));

    if (broadcast.severity === 'urgent' || broadcast.severity === 'high') {
      playSoundAlert(broadcast.severity);
    }
  };

  const dismissBroadcast = (id: string) => {
    setDismissedIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const deleteBroadcast = (id: string) => {
    setBroadcasts(prev => prev.filter(b => b.id !== id));
  };

  // Find the top un-dismissed broadcast
  const activeBroadcast = broadcasts.find(b => !dismissedIds.includes(b.id)) || null;

  return (
    <BroadcastContext.Provider
      value={{
        broadcasts,
        activeBroadcast,
        dismissedIds,
        isAdminModalOpen,
        soundEnabled,
        sendBroadcast,
        saveBroadcastTemplate,
        reBroadcastItem,
        dismissBroadcast,
        setOpenAdminModal,
        setSoundEnabled,
        playSoundAlert,
        deleteBroadcast,
      }}
    >
      {children}
    </BroadcastContext.Provider>
  );
};

export const useBroadcast = () => {
  const context = useContext(BroadcastContext);
  if (!context) {
    throw new Error('useBroadcast must be used within a BroadcastProvider');
  }
  return context;
};
