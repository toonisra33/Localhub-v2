import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  AdminBroadcast,
  BroadcastCategory,
  BroadcastSeverity,
  BroadcastTargetScope,
  BroadcastTargetLevel,
  SignalTestPayload,
  TestSoundType
} from '../types';
import {
  sendSystemNotification,
  playSynthesizedAlarm,
  stopSynthesizedAlarm,
  triggerDeviceVibration,
  stopDeviceVibration,
  broadcastTestSignalToAllDevices,
  initTestSignalListener
} from '../utils/notificationService';
import {
  db,
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  handleFirestoreError,
  OperationType,
  removeUndefinedFields
} from '../firebase';

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
  expiresInMinutes?: number;
}

export interface BroadcastUserState {
  viewedAt: number;        // Timestamp when user first opened/viewed this broadcast
  durationMinutes: number; // Duration of countdown (defaults to 15 minutes)
  linkClicked: boolean;    // When true, stops the 3-minute recurring audio alarm
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

  // Restored 15-minute countdown & 3-minute audio alert states
  broadcastUserState: BroadcastUserState | null;
  remainingCountdownSeconds: number;
  isBroadcastLinkClicked: boolean;
  markBroadcastLinkClicked: (id: string) => void;
  markBroadcastViewed: (id: string) => void;

  // Signal Testing System
  isSignalTestModalOpen: boolean;
  setOpenSignalTestModal: (open: boolean) => void;
  activeTestSignal: SignalTestPayload | null;
  isTestingLocalAdmin: boolean;
  isTestingAllDevices: boolean;
  testLocalDeviceSignal: (soundType?: TestSoundType, durationSec?: number) => void;
  stopLocalDeviceTest: () => void;
  testAllDevicesSignal: (title?: string, message?: string, soundType?: TestSoundType) => void;
  dismissTestSignal: () => void;
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
  const [isSignalTestModalOpen, setOpenSignalTestModal] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Signal Testing System States
  const [activeTestSignal, setActiveTestSignal] = useState<SignalTestPayload | null>(null);
  const [isTestingLocalAdmin, setIsTestingLocalAdmin] = useState<boolean>(false);
  const [isTestingAllDevices, setIsTestingAllDevices] = useState<boolean>(false);

  const localTestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSoundStopperRef = useRef<(() => void) | null>(null);

  const [userStates, setUserStates] = useState<Record<string, BroadcastUserState>>(() => {
    try {
      const stored = localStorage.getItem('localhub_broadcast_user_states');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse user states from storage:', e);
    }
    return {};
  });

  const [remainingCountdownSeconds, setRemainingCountdownSeconds] = useState<number>(0);
  const lastAlertMinuteRef = useRef<Record<string, number>>({});

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

  useEffect(() => {
    try {
      localStorage.setItem('localhub_broadcast_user_states', JSON.stringify(userStates));
    } catch (e) {
      console.warn(e);
    }
  }, [userStates]);

  // Audio tone generator for alert notification
  const playSoundAlert = useCallback((severity: BroadcastSeverity = 'urgent') => {
    if (!soundEnabled) return;
    try {
      const soundType: TestSoundType =
        severity === 'urgent' ? 'siren' : severity === 'high' ? 'high' : 'announcement';
      playSynthesizedAlarm(soundType, 3);
    } catch (err) {
      console.warn('Audio feedback failed:', err);
    }
  }, [soundEnabled]);

  // ==========================================
  // SIGNAL TEST 1: Admin Local Device Only Test
  // ==========================================
  const stopLocalDeviceTest = useCallback(() => {
    if (localTestTimerRef.current) {
      clearTimeout(localTestTimerRef.current);
      localTestTimerRef.current = null;
    }
    if (currentSoundStopperRef.current) {
      currentSoundStopperRef.current();
      currentSoundStopperRef.current = null;
    }
    stopSynthesizedAlarm();
    stopDeviceVibration();
    setIsTestingLocalAdmin(false);
  }, []);

  const testLocalDeviceSignal = useCallback(
    (soundType: TestSoundType = 'siren', durationSec: number = 5) => {
      // Ensure any running test is stopped
      stopLocalDeviceTest();

      setIsTestingLocalAdmin(true);

      // 1. Play audio synthesized on THIS device only
      const audioControl = playSynthesizedAlarm(soundType, durationSec);
      currentSoundStopperRef.current = audioControl.stop;

      // 2. Hardware vibration on THIS device only (No broadcast channel / No localStorage sync)
      triggerDeviceVibration([400, 150, 400, 150, 800]);

      // Auto-stop after duration
      localTestTimerRef.current = setTimeout(() => {
        setIsTestingLocalAdmin(false);
        stopDeviceVibration();
      }, durationSec * 1000);
    },
    [stopLocalDeviceTest]
  );

  // ==========================================
  // SIGNAL TEST 2: All Devices Broadcast Test
  // ==========================================
  const dismissTestSignal = useCallback(() => {
    stopSynthesizedAlarm();
    stopDeviceVibration();
    if (currentSoundStopperRef.current) {
      currentSoundStopperRef.current();
      currentSoundStopperRef.current = null;
    }
    setActiveTestSignal(null);
    setIsTestingAllDevices(false);
  }, []);

  const testAllDevicesSignal = useCallback(
    (
      title?: string,
      message?: string,
      soundType: TestSoundType = 'siren'
    ) => {
      const now = Date.now();
      const payload: SignalTestPayload = {
        id: `signal_test_${now}`,
        type: 'all_devices',
        title: title?.trim() || '🚨 [ทดสอบระบบ] สัญญาณแจ้งเตือนฉุกเฉินทุกอุปกรณ์',
        message:
          message?.trim() ||
          'ผู้ดูแลระบบ (Admin) กำลังทดสอบระบบส่งสัญญาณเตือนภัย เสียงไซเรน และการสั่นสะเทือนพร้อมกันทุกอุปกรณ์ที่ติดตั้งแอพพลิเคชั่น',
        severity: 'urgent',
        soundType,
        timestamp: now,
        initiatedBy: 'ผู้ดูแลระบบ (Admin LocalHub)',
        vibrationPattern: [500, 200, 500, 200, 1000],
        soundDurationSec: 6
      };

      setIsTestingAllDevices(true);
      setActiveTestSignal(payload);

      // 1. Broadcast to all devices via BroadcastChannel, StorageEvent, and Service Worker
      broadcastTestSignalToAllDevices(payload);

      // 2. Sync to Firebase Firestore cloud so all remote devices and phones receive the alert in real time
      const sanitizedSignal = removeUndefinedFields({
        ...payload,
        createdAt: new Date().toISOString()
      });
      setDoc(doc(db, 'signalBroadcasts', payload.id), sanitizedSignal).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `signalBroadcasts/${payload.id}`);
      });

      // 3. Play audio & vibration on this originating device
      const audioControl = playSynthesizedAlarm(payload.soundType, 6);
      currentSoundStopperRef.current = audioControl.stop;
      triggerDeviceVibration(payload.vibrationPattern);
    },
    []
  );

  // ==========================================
  // Multi-Device Test Signal Listener (Local + Firebase Cloud)
  // ==========================================
  useEffect(() => {
    const cleanupLocal = initTestSignalListener((incomingSignal) => {
      // Incoming signal from another local tab or PWA instance
      setActiveTestSignal(incomingSignal);
      const audioControl = playSynthesizedAlarm(incomingSignal.soundType || 'siren', 6);
      currentSoundStopperRef.current = audioControl.stop;
      triggerDeviceVibration(incomingSignal.vibrationPattern || [500, 200, 500, 200, 1000]);
    });

    // Real-Time Broadcasts Listener from Firebase Firestore
    const unsubBroadcasts = onSnapshot(
      collection(db, 'broadcasts'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudList: AdminBroadcast[] = [];
          snapshot.forEach((d) => {
            const raw = (d.data() || {}) as any;
            if (!raw || (!raw.title && !raw.message)) return; // skip empty or non-broadcast docs
            let broadcastAtMs = Date.now();
            if (typeof raw.broadcastAt === 'number') {
              broadcastAtMs = raw.broadcastAt;
            } else if (raw.updatedAt && typeof raw.updatedAt === 'object' && typeof raw.updatedAt.seconds === 'number') {
              broadcastAtMs = raw.updatedAt.seconds * 1000;
            }

            cloudList.push({
              id: d.id || raw.id || `bc_${Date.now()}`,
              title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : 'ประกาศจากชุมชน',
              message: typeof raw.message === 'string' ? raw.message : '',
              category: raw.category || 'news',
              severity: raw.severity || 'normal',
              targetScope: raw.targetScope || 'all',
              targetArea: typeof raw.targetArea === 'string' ? raw.targetArea : undefined,
              targetProvince: typeof raw.targetProvince === 'string' ? raw.targetProvince : undefined,
              targetDistrict: typeof raw.targetDistrict === 'string' ? raw.targetDistrict : undefined,
              mediaType: raw.mediaType,
              mediaUrl: typeof raw.mediaUrl === 'string' ? raw.mediaUrl : undefined,
              mediaFileName: typeof raw.mediaFileName === 'string' ? raw.mediaFileName : undefined,
              videoDurationSec: typeof raw.videoDurationSec === 'number' ? raw.videoDurationSec : undefined,
              broadcastAt: broadcastAtMs,
              broadcastDateStr: typeof raw.broadcastDateStr === 'string' ? raw.broadcastDateStr : 'เมื่อสักครู่',
              adminName: typeof raw.adminName === 'string' ? raw.adminName : 'ผู้ดูแลระบบ',
              adminRole: typeof raw.adminRole === 'string' ? raw.adminRole : 'ผู้ดูแลระบบ',
              isPinned: Boolean(raw.pinned ?? raw.isPinned),
              isArchived: Boolean(raw.isArchived),
              actionUrl: typeof raw.actionUrl === 'string' ? raw.actionUrl : undefined,
              actionText: typeof raw.actionText === 'string' ? raw.actionText : undefined,
              viewsCount: typeof raw.viewsCount === 'number' ? raw.viewsCount : 0,
              likesCount: typeof raw.likesCount === 'number' ? raw.likesCount : 0
            });
          });
          cloudList.sort((a, b) => b.broadcastAt - a.broadcastAt);
          setBroadcasts(cloudList);

          // Check if any fresh broadcast was added in the last 60 seconds
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const item = change.doc.data() as AdminBroadcast;
              if (item && item.broadcastAt && Date.now() - item.broadcastAt < 60000) {
                // Incoming real-time broadcast from cloud! Fire multi-device notification & sound
                sendSystemNotification({
                  title: `📢 บรอดแคสต์: ${item.title}`,
                  message: item.message,
                  type: 'broadcast',
                  severity: item.severity,
                  targetArea: item.targetArea,
                  link: `broadcast:${item.id}`,
                  image: item.mediaUrl
                }).catch(() => {});

                if (item.severity === 'urgent' || item.severity === 'high') {
                  playSoundAlert(item.severity);
                  triggerDeviceVibration([500, 200, 500, 200, 800]);
                }
              }
            }
          });
        } else {
          // If Firestore is empty, seed initial broadcasts to Firestore
          INITIAL_BROADCASTS.forEach((bc) => {
            setDoc(doc(db, 'broadcasts', bc.id), bc).catch(() => {});
          });
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'broadcasts');
      }
    );

    // Cloud Real-Time Listener via Firebase Firestore for siren test
    const unsubCloud = onSnapshot(
      collection(db, 'signalBroadcasts'),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data() as SignalTestPayload;
            // Fresh alert within 45s
            if (data && data.timestamp && Date.now() - data.timestamp < 45000) {
              setActiveTestSignal(prev => {
                if (prev?.id === data.id) return prev;
                const audioControl = playSynthesizedAlarm(data.soundType || 'siren', 6);
                currentSoundStopperRef.current = audioControl.stop;
                triggerDeviceVibration(data.vibrationPattern || [500, 200, 500, 200, 1000]);
                // Fire native system notification
                sendSystemNotification({
                  title: data.title,
                  message: data.message,
                  type: 'test_signal',
                  severity: data.severity,
                  vibratePattern: data.vibrationPattern || [500, 200, 500, 200, 1000]
                }).catch(() => {});
                return data;
              });
            }
          }
        });
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'signalBroadcasts');
      }
    );

    return () => {
      cleanupLocal();
      unsubCloud();
      unsubBroadcasts();
    };
  }, [playSoundAlert]);

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
      expiresInMinutes: data.expiresInMinutes !== undefined ? data.expiresInMinutes : 15,
      expiresAt: (data.expiresInMinutes !== undefined ? data.expiresInMinutes : 15) > 0 ? now + (data.expiresInMinutes !== undefined ? data.expiresInMinutes : 15) * 60 * 1000 : undefined,
      adminName: 'ศูนย์อำนวยการ LocalHub',
      adminRole: 'System Admin',
      isPinned: data.severity === 'urgent' || data.severity === 'high',
      viewsCount: 1,
      likesCount: 0,
    };

    setBroadcasts(prev => [newBc, ...prev]);

    // Save to Cloud Firestore in real time so all devices immediately receive it
    const sanitizedBc = removeUndefinedFields(newBc);
    setDoc(doc(db, 'broadcasts', newBc.id), sanitizedBc).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `broadcasts/${newBc.id}`);
    });

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

    // Sync rebroadcast to Firestore
    setDoc(doc(db, 'broadcasts', rebroadcasted.id), removeUndefinedFields(rebroadcasted)).catch(() => {});

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
    stopSynthesizedAlarm();
    stopDeviceVibration();
    setDismissedIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const deleteBroadcast = (id: string) => {
    setBroadcasts(prev => prev.filter(b => b.id !== id));
    deleteDoc(doc(db, 'broadcasts', id)).catch(() => {});
  };

  // Mark broadcast as viewed when displayed on device (starts 15-minute countdown)
  const markBroadcastViewed = useCallback((id: string) => {
    setUserStates(prev => {
      if (prev[id]) return prev;
      const targetBc = broadcasts.find(b => b.id === id);
      const duration = targetBc?.expiresInMinutes && targetBc.expiresInMinutes > 0 ? targetBc.expiresInMinutes : 15;
      const next = {
        ...prev,
        [id]: {
          viewedAt: Date.now(),
          durationMinutes: duration,
          linkClicked: false
        }
      };
      try {
        localStorage.setItem('localhub_broadcast_user_states', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  }, [broadcasts]);

  // Mark broadcast link clicked: PERMANENTLY stops audio alert for this broadcast
  const markBroadcastLinkClicked = useCallback((id: string) => {
    // 1. Immediately cut off any running siren or synthesized alarm
    stopSynthesizedAlarm();
    stopDeviceVibration();
    if (currentSoundStopperRef.current) {
      currentSoundStopperRef.current();
      currentSoundStopperRef.current = null;
    }

    // 2. Persist linkClicked flag so recurring 3-minute alarms will not trigger
    setUserStates(prev => {
      const current = prev[id] || {
        viewedAt: Date.now(),
        durationMinutes: 15,
        linkClicked: false
      };
      const next = {
        ...prev,
        [id]: {
          ...current,
          linkClicked: true
        }
      };
      try {
        localStorage.setItem('localhub_broadcast_user_states', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  }, []);

  // Find the top un-dismissed and un-expired broadcast
  // Expiration is counted per user device starting from viewedAt
  const currentTime = Date.now();
  const activeBroadcast =
    broadcasts.find((b) => {
      if (dismissedIds.includes(b.id)) return false;
      const uState = userStates[b.id];
      if (uState) {
        // If countdown started, check if user's 15 minutes expired
        const userExpireAt = uState.viewedAt + uState.durationMinutes * 60 * 1000;
        if (currentTime >= userExpireAt) return false;
      }
      return true;
    }) || null;

  const broadcastUserState = activeBroadcast ? userStates[activeBroadcast.id] || null : null;
  const isBroadcastLinkClicked = Boolean(broadcastUserState?.linkClicked);

  // 15-Minute Countdown & 3-Minute Recurring Alert Engine
  useEffect(() => {
    if (!activeBroadcast) {
      setRemainingCountdownSeconds(0);
      return;
    }

    const bcId = activeBroadcast.id;
    // Auto-initialize viewed state on device so countdown begins
    if (!userStates[bcId]) {
      const duration = activeBroadcast.expiresInMinutes && activeBroadcast.expiresInMinutes > 0
        ? activeBroadcast.expiresInMinutes
        : 15;
      setUserStates(prev => {
        if (prev[bcId]) return prev;
        const next = {
          ...prev,
          [bcId]: {
            viewedAt: Date.now(),
            durationMinutes: duration,
            linkClicked: false
          }
        };
        try {
          localStorage.setItem('localhub_broadcast_user_states', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    // Calculate remaining seconds & check 3-minute alert milestone
    const tick = () => {
      const now = Date.now();
      const st = userStates[bcId];
      if (!st) return;

      const elapsedSec = Math.floor((now - st.viewedAt) / 1000);
      const totalSec = st.durationMinutes * 60;
      const leftSec = Math.max(0, totalSec - elapsedSec);

      setRemainingCountdownSeconds(leftSec);

      // Auto dismiss when countdown completes
      if (leftSec <= 0) {
        dismissBroadcast(bcId);
        return;
      }

      // Rule: เสียงแจ้งเตือนทุก 3 นาที จนครบ 15 นาที
      // แต่เสียงแจ้งเตือนจะไม่ดังก็ต่อเมื่อผู้ใช้งานได้กดเข้าลิงค์
      if (!st.linkClicked && soundEnabled) {
        const elapsedMinutes = Math.floor(elapsedSec / 60);
        const lastMinute = lastAlertMinuteRef.current[bcId] ?? -1;

        // Alerts at 3 min, 6 min, 9 min, 12 min milestones
        if (elapsedMinutes > 0 && elapsedMinutes % 3 === 0 && elapsedMinutes !== lastMinute) {
          lastAlertMinuteRef.current[bcId] = elapsedMinutes;
          playSoundAlert(activeBroadcast.severity);
          triggerDeviceVibration([400, 200, 400, 200, 600]);
        }
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeBroadcast, userStates, soundEnabled, playSoundAlert]);

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
        isSignalTestModalOpen,
        setOpenSignalTestModal,
        setSoundEnabled,
        playSoundAlert,
        deleteBroadcast,
        broadcastUserState,
        remainingCountdownSeconds,
        isBroadcastLinkClicked,
        markBroadcastLinkClicked,
        markBroadcastViewed,
        activeTestSignal,
        isTestingLocalAdmin,
        isTestingAllDevices,
        testLocalDeviceSignal,
        stopLocalDeviceTest,
        testAllDevicesSignal,
        dismissTestSignal,
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
