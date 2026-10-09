import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { AdminBroadcast, UserRole, BroadcastCategory, BroadcastSeverity } from '../types';
import { db, saveEntityToFirestore } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { soundManager } from '../lib/sounds';
import { AppNotifications } from '../lib/notifications';
import { safeStorage } from '../lib/safeStorage';

interface BroadcastContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeBroadcast: AdminBroadcast | null;
  isBroadcastVisible: boolean;
  deviceRemainingSeconds: number;
  sendBroadcast: (data: {
    title: string;
    message: string;
    category: BroadcastCategory;
    severity: BroadcastSeverity;
    targetArea?: string;
    mediaType?: 'image' | 'video';
    mediaUrl?: string;
    mediaFileName?: string;
    videoDurationSeconds?: number;
    contactNumber?: string;
    actionText?: string;
    actionUrl?: string;
    checkIn?: any;
  }) => Promise<void>;
  cancelBroadcast: () => void;
  resetDeviceTimerForDemo: () => void;
  openAdminModal: boolean;
  setOpenAdminModal: (open: boolean) => void;
}

const BROADCAST_STORAGE_KEY = 'locallink_admin_broadcast';
const DEVICE_VIEW_PREFIX = 'locallink_device_view_';
const USER_ROLE_KEY = 'locallink_user_role';

export const BROADCAST_DURATION_SECONDS = 15 * 60; // 15 minutes (900 seconds)

const BroadcastContext = createContext<BroadcastContextType | undefined>(undefined);

// Helper to get formatted YYYY-MM-DD
function getLocalDateStr(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function BroadcastProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const saved = safeStorage.getItem(USER_ROLE_KEY);
      return saved === 'admin' ? 'admin' : 'user';
    } catch {
      return 'user';
    }
  });

  const [activeBroadcast, setActiveBroadcast] = useState<AdminBroadcast | null>(null);
  const previousBroadcastIdRef = useRef<string | null>(null);

  // Subscribe to active broadcast from Firestore
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'broadcasts', 'active'), (snapshot) => {
      console.log('Broadcast snapshot:', snapshot.data()); if (snapshot.exists()) {
        const data = snapshot.data() as AdminBroadcast;
        // Valid if active and created within the last 24 hours (prevents old broadcasts from showing days later)
        const isRecent = (Date.now() - data.broadcastAt) < (24 * 60 * 60 * 1000);
        
        if (isRecent && data.isActive) {
          setActiveBroadcast(data);
          
          // If this is a newly received broadcast that we haven't seen yet, play the alert sound
          if (previousBroadcastIdRef.current !== data.id) {
             const storageKey = `${DEVICE_VIEW_PREFIX}${data.id}`;
             const hasSeenBefore = !!safeStorage.getItem(storageKey);
             
             if (!hasSeenBefore) {
               soundManager.playAlertSound();
               AppNotifications.send(`⚠️ แจ้งเตือนฉุกเฉิน: ${data.title}`, {
                 body: data.message,
                 requireInteraction: true,
               });
             }
             previousBroadcastIdRef.current = data.id;
          }
          return;
        }
      }
      setActiveBroadcast(null);
      previousBroadcastIdRef.current = null;
    }, (error) => {
      console.warn('Firestore subscription warning (broadcasts):', error);
    });
    
    return () => unsub();
  }, []);

  const [deviceRemainingSeconds, setDeviceRemainingSeconds] = useState<number>(0);
  const [isBroadcastVisible, setIsBroadcastVisible] = useState<boolean>(false);
  const [openAdminModal, setOpenAdminModal] = useState<boolean>(false);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      safeStorage.setItem(USER_ROLE_KEY, newRole);
    } catch {
      // ignore
    }
  };

    // Check and calculate device viewing timer for active broadcast
  const updateTimer = useCallback(() => {
    if (!activeBroadcast || !activeBroadcast.isActive) {
      setIsBroadcastVisible(false);
      setDeviceRemainingSeconds(0);
      return;
    }

    // Global 24 hour expiry
    const isRecent = (Date.now() - activeBroadcast.broadcastAt) < (24 * 60 * 60 * 1000);
    if (!isRecent) {
      setIsBroadcastVisible(false);
      setDeviceRemainingSeconds(0);
      return;
    }

    // Device-specific first viewed check
    const storageKey = `${DEVICE_VIEW_PREFIX}${activeBroadcast.id}`;
    let firstSeen = 0;
    try {
      const savedFirstSeen = safeStorage.getItem(storageKey);
      if (savedFirstSeen) {
        firstSeen = parseInt(savedFirstSeen, 10);
      } else {
        firstSeen = Date.now();
        safeStorage.setItem(storageKey, firstSeen.toString());
      }
    } catch {
      firstSeen = Date.now();
    }

    const elapsedSeconds = Math.floor((Date.now() - firstSeen) / 1000);
    const remaining = Math.max(0, BROADCAST_DURATION_SECONDS - elapsedSeconds);

    setDeviceRemainingSeconds(remaining);
    setIsBroadcastVisible(remaining > 0);
  }, [activeBroadcast]);

  // Periodic ticker to decrement countdown and enforce 15-min and midnight reset
  useEffect(() => {
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [updateTimer]);

  const sendBroadcast = async (data: { title: string; message: string; category: BroadcastCategory; severity: BroadcastSeverity; targetArea?: string; mediaType?: 'image' | 'video'; mediaUrl?: string; mediaFileName?: string; videoDurationSeconds?: number; contactNumber?: string; actionText?: string; actionUrl?: string; checkIn?: any; }) => {
    const now = Date.now();
    const todayStr = getLocalDateStr(new Date(now));
    // Firestore does not accept undefined values, so we filter them out
    const cleanData = Object.fromEntries(
      Object.entries({
        id: `bc_${now}`,
        title: data.title,
        message: data.message,
        category: data.category,
        severity: data.severity,
        targetArea: data.targetArea,
        broadcastAt: now,
        broadcastDateStr: todayStr,
        adminName: 'ศูนย์บัญชาการชุมชน (แอดมิน)',
        adminRole: 'ผู้ดูแลระบบส่วนกลาง',
        mediaType: data.mediaType,
        mediaUrl: data.mediaUrl,
        mediaFileName: data.mediaFileName,
        videoDurationSeconds: data.videoDurationSeconds,
        contactNumber: data.contactNumber,
        actionText: data.actionText,
        actionUrl: data.actionUrl,
        checkIn: data.checkIn,
        pinned: true,
        isActive: true,
      }).filter(([_, v]) => v !== undefined)
    ) as unknown as AdminBroadcast;

    // Store in Firestore
    try {
      await saveEntityToFirestore('broadcasts', 'active', cleanData);
      console.log('Successfully saved broadcast');
    } catch (e) {
      console.error('Failed to save broadcast', e);
      throw e; // rethrow to let the caller handle it
    }
  };

  const cancelBroadcast = () => {
    if (activeBroadcast) {
      const updated = { ...activeBroadcast, isActive: false };
      try {
        saveEntityToFirestore('broadcasts', 'active', updated);
      } catch (e) {
        console.error('Failed to cancel broadcast', e);
      }
    }
  };

  const resetDeviceTimerForDemo = () => {
    if (activeBroadcast) {
      const now = Date.now();
      try {
        safeStorage.setItem(`${DEVICE_VIEW_PREFIX}${activeBroadcast.id}`, now.toString());
      } catch {
        // ignore
      }
      setDeviceRemainingSeconds(BROADCAST_DURATION_SECONDS);
      setIsBroadcastVisible(true);
    }
  };

  return (
    <BroadcastContext.Provider
      value={{
        role,
        setRole,
        activeBroadcast,
        isBroadcastVisible,
        deviceRemainingSeconds,
        sendBroadcast,
        cancelBroadcast,
        resetDeviceTimerForDemo,
        openAdminModal,
        setOpenAdminModal,
      }}
    >
      {children}
    </BroadcastContext.Provider>
  );
}

export function useBroadcast() {
  const context = useContext(BroadcastContext);
  if (!context) {
    throw new Error('useBroadcast must be used within a BroadcastProvider');
  }
  return context;
}
