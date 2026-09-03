import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AdminBroadcast, UserRole, BroadcastCategory, BroadcastSeverity } from '../types';

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
  }) => void;
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
      const saved = localStorage.getItem(USER_ROLE_KEY);
      return saved === 'admin' ? 'admin' : 'user';
    } catch {
      return 'user';
    }
  });

  const [activeBroadcast, setActiveBroadcast] = useState<AdminBroadcast | null>(() => {
    try {
      const todayStr = getLocalDateStr();
      const saved = localStorage.getItem(BROADCAST_STORAGE_KEY);
      if (saved) {
        const parsed: AdminBroadcast = JSON.parse(saved);
        if (parsed.broadcastDateStr === todayStr && parsed.isActive && !parsed.id.startsWith('bc_default_')) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [deviceRemainingSeconds, setDeviceRemainingSeconds] = useState<number>(0);
  const [isBroadcastVisible, setIsBroadcastVisible] = useState<boolean>(false);
  const [openAdminModal, setOpenAdminModal] = useState<boolean>(false);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(USER_ROLE_KEY, newRole);
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

    const todayStr = getLocalDateStr();
    // Midnight reset condition
    if (activeBroadcast.broadcastDateStr !== todayStr) {
      setActiveBroadcast(null);
      setIsBroadcastVisible(false);
      setDeviceRemainingSeconds(0);
      try {
        localStorage.removeItem(BROADCAST_STORAGE_KEY);
      } catch {
        // ignore
      }
      return;
    }

    // Device-specific first viewed check
    const storageKey = `${DEVICE_VIEW_PREFIX}${activeBroadcast.id}`;
    let firstSeen = 0;
    try {
      const savedFirstSeen = localStorage.getItem(storageKey);
      if (savedFirstSeen) {
        firstSeen = parseInt(savedFirstSeen, 10);
      } else {
        firstSeen = Date.now();
        localStorage.setItem(storageKey, firstSeen.toString());
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

  const sendBroadcast = (data: {
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
  }) => {
    const now = Date.now();
    const todayStr = getLocalDateStr(new Date(now));
    const newBroadcast: AdminBroadcast = {
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
      pinned: true,
      isActive: true,
    };

    // Store in localStorage
    try {
      localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(newBroadcast));
      // Reset device first seen timestamp for this device so it gets fresh 15 mins
      localStorage.setItem(`${DEVICE_VIEW_PREFIX}${newBroadcast.id}`, now.toString());
    } catch {
      // ignore
    }

    setActiveBroadcast(newBroadcast);
    setDeviceRemainingSeconds(BROADCAST_DURATION_SECONDS);
    setIsBroadcastVisible(true);
  };

  const cancelBroadcast = () => {
    if (activeBroadcast) {
      const updated = { ...activeBroadcast, isActive: false };
      try {
        localStorage.removeItem(BROADCAST_STORAGE_KEY);
      } catch {
        // ignore
      }
      setActiveBroadcast(null);
      setIsBroadcastVisible(false);
      setDeviceRemainingSeconds(0);
    }
  };

  const resetDeviceTimerForDemo = () => {
    if (activeBroadcast) {
      const now = Date.now();
      try {
        localStorage.setItem(`${DEVICE_VIEW_PREFIX}${activeBroadcast.id}`, now.toString());
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
