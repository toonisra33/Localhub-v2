import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { AdminBroadcast, UserRole, BroadcastCategory, BroadcastSeverity, CheckInLocation } from '../types';
import { db, saveEntityToFirestore } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { soundManager } from '../lib/sounds';
import { AppNotifications } from '../lib/notifications';
import { safeStorage } from '../lib/safeStorage';

interface BroadcastInput {
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
  checkIn?: CheckInLocation;
}

interface BroadcastContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeBroadcast: AdminBroadcast | null;
  isBroadcastVisible: boolean;
  deviceRemainingSeconds: number;
  sendBroadcast: (data: BroadcastInput) => Promise<void>;
  cancelBroadcast: () => void;
  resetDeviceTimerForDemo: () => void;
  openAdminModal: boolean;
  setOpenAdminModal: (open: boolean) => void;

  // Broadcast History (Max 10 recent broadcasts)
  broadcastHistory: AdminBroadcast[];
  deleteHistoryItem: (id: string) => Promise<void>;

  // Saved / Bookmarked Broadcasts (Templates for future reuse - NOT counted in the 10 history limit)
  savedBroadcasts: AdminBroadcast[];
  saveBroadcastTemplate: (broadcast: Partial<AdminBroadcast>, templateName?: string) => Promise<void>;
  removeSavedBroadcast: (id: string) => Promise<void>;
  moveHistoryToSaved: (historyItem: AdminBroadcast) => Promise<void>;

  // Re-broadcast execution
  reBroadcastItem: (broadcast: AdminBroadcast) => Promise<void>;
}

const DEVICE_VIEW_PREFIX = 'locallink_device_view_';
const USER_ROLE_KEY = 'locallink_user_role';
const BROADCAST_HISTORY_KEY = 'locallink_broadcast_history';
const BROADCAST_SAVED_KEY = 'locallink_broadcast_saved';

export const BROADCAST_DURATION_SECONDS = 15 * 60; // 15 minutes (900 seconds)
export const MAX_HISTORY_LIMIT = 10; // strictly 10 recent broadcasts

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

  // Broadcast History (up to 10 latest)
  const [broadcastHistory, setBroadcastHistory] = useState<AdminBroadcast[]>(() => {
    try {
      const saved = safeStorage.getItem(BROADCAST_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Saved Broadcasts (Saved templates - permanently kept, NOT counted in 10 limit)
  const [savedBroadcasts, setSavedBroadcasts] = useState<AdminBroadcast[]>(() => {
    try {
      const saved = safeStorage.getItem(BROADCAST_SAVED_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Subscribe to active broadcast from Firestore
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'broadcasts', 'active'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AdminBroadcast;
        const isRecent = (Date.now() - data.broadcastAt) < (24 * 60 * 60 * 1000);
        
        if (isRecent && data.isActive) {
          setActiveBroadcast(data);
          
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
      console.warn('Firestore subscription warning (broadcasts/active):', error);
    });
    
    return () => unsub();
  }, []);

  // Subscribe to Broadcast History from Firestore
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'broadcasts', 'history'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.items)) {
          setBroadcastHistory(data.items.slice(0, MAX_HISTORY_LIMIT));
          try {
            safeStorage.setItem(BROADCAST_HISTORY_KEY, JSON.stringify(data.items.slice(0, MAX_HISTORY_LIMIT)));
          } catch {}
        }
      }
    }, (error) => {
      console.warn('Firestore subscription warning (broadcasts/history):', error);
    });

    return () => unsub();
  }, []);

  // Subscribe to Saved Broadcast Templates from Firestore
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'broadcasts', 'saved_templates'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.items)) {
          setSavedBroadcasts(data.items);
          try {
            safeStorage.setItem(BROADCAST_SAVED_KEY, JSON.stringify(data.items));
          } catch {}
        }
      }
    }, (error) => {
      console.warn('Firestore subscription warning (broadcasts/saved_templates):', error);
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
    } catch {}
  };

  // Check and calculate device viewing timer for active broadcast
  const updateTimer = useCallback(() => {
    if (!activeBroadcast || !activeBroadcast.isActive) {
      setIsBroadcastVisible(false);
      setDeviceRemainingSeconds(0);
      return;
    }

    const isRecent = (Date.now() - activeBroadcast.broadcastAt) < (24 * 60 * 60 * 1000);
    if (!isRecent) {
      setIsBroadcastVisible(false);
      setDeviceRemainingSeconds(0);
      return;
    }

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

  // Periodic ticker
  useEffect(() => {
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [updateTimer]);

  // Helper to persist history
  const persistHistory = async (newHistory: AdminBroadcast[]) => {
    const trimmed = newHistory.slice(0, MAX_HISTORY_LIMIT);
    setBroadcastHistory(trimmed);
    try {
      safeStorage.setItem(BROADCAST_HISTORY_KEY, JSON.stringify(trimmed));
    } catch {}
    try {
      await saveEntityToFirestore('broadcasts', 'history', {
        items: trimmed,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('Failed to sync broadcast history to Firestore:', e);
    }
  };

  // Helper to persist saved templates
  const persistSavedTemplates = async (newTemplates: AdminBroadcast[]) => {
    setSavedBroadcasts(newTemplates);
    try {
      safeStorage.setItem(BROADCAST_SAVED_KEY, JSON.stringify(newTemplates));
    } catch {}
    try {
      await saveEntityToFirestore('broadcasts', 'saved_templates', {
        items: newTemplates,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('Failed to sync saved templates to Firestore:', e);
    }
  };

  // Send a new broadcast
  const sendBroadcast = async (data: BroadcastInput) => {
    const now = Date.now();
    const todayStr = getLocalDateStr(new Date(now));
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
        isSaved: false,
      }).filter(([_, v]) => v !== undefined)
    ) as unknown as AdminBroadcast;

    try {
      // 1. Activate in Firestore
      await saveEntityToFirestore('broadcasts', 'active', cleanData);
      
      // 2. Add to 10 broadcast history (Prepend and trim to max 10)
      const updatedHistory = [cleanData, ...broadcastHistory.filter(h => h.id !== cleanData.id)].slice(0, MAX_HISTORY_LIMIT);
      await persistHistory(updatedHistory);

      console.log('Successfully saved and broadcasted message');
    } catch (e) {
      console.error('Failed to send broadcast', e);
      throw e;
    }
  };

  // Delete a history item
  const deleteHistoryItem = async (id: string) => {
    const updated = broadcastHistory.filter(h => h.id !== id);
    await persistHistory(updated);
  };

  // Save a broadcast template (either from draft or custom input) - NOT counted in 10 history
  const saveBroadcastTemplate = async (broadcast: Partial<AdminBroadcast>, templateName?: string) => {
    const now = Date.now();
    const templateId = `tpl_${now}`;
    const cleanTemplate = Object.fromEntries(
      Object.entries({
        id: templateId,
        title: broadcast.title || 'บรอดแคสต์ต้นแบบ',
        message: broadcast.message || '',
        category: broadcast.category || 'announcement',
        severity: broadcast.severity || 'normal',
        targetArea: broadcast.targetArea,
        broadcastAt: now,
        broadcastDateStr: getLocalDateStr(new Date(now)),
        adminName: broadcast.adminName || 'ศูนย์บัญชาการชุมชน (แอดมิน)',
        adminRole: 'ผู้ดูแลระบบส่วนกลาง',
        mediaType: broadcast.mediaType,
        mediaUrl: broadcast.mediaUrl,
        mediaFileName: broadcast.mediaFileName,
        videoDurationSeconds: broadcast.videoDurationSeconds,
        contactNumber: broadcast.contactNumber,
        actionText: broadcast.actionText,
        actionUrl: broadcast.actionUrl,
        checkIn: broadcast.checkIn,
        pinned: true,
        isActive: false,
        isSaved: true,
        savedAt: now,
        templateName: templateName || broadcast.title,
      }).filter(([_, v]) => v !== undefined)
    ) as unknown as AdminBroadcast;

    const updated = [cleanTemplate, ...savedBroadcasts.filter(s => s.id !== cleanTemplate.id)];
    await persistSavedTemplates(updated);
  };

  // Remove from saved broadcasts
  const removeSavedBroadcast = async (id: string) => {
    const updated = savedBroadcasts.filter(s => s.id !== id);
    await persistSavedTemplates(updated);
  };

  // Move a history item to saved templates (Removes from 10 history to free up slot!)
  const moveHistoryToSaved = async (historyItem: AdminBroadcast) => {
    const now = Date.now();
    const savedItem: AdminBroadcast = {
      ...historyItem,
      id: `saved_${historyItem.id}`,
      isSaved: true,
      savedAt: now,
      templateName: historyItem.title,
    };

    // 1. Remove from history (so it is NOT counted in 10 limit!)
    const updatedHistory = broadcastHistory.filter(h => h.id !== historyItem.id);
    await persistHistory(updatedHistory);

    // 2. Add to saved broadcasts
    const updatedSaved = [savedItem, ...savedBroadcasts.filter(s => s.id !== savedItem.id)];
    await persistSavedTemplates(updatedSaved);
  };

  // Re-broadcast an item (works for both history items and saved templates)
  const reBroadcastItem = async (broadcast: AdminBroadcast) => {
    await sendBroadcast({
      title: broadcast.title,
      message: broadcast.message,
      category: broadcast.category,
      severity: broadcast.severity,
      targetArea: broadcast.targetArea,
      mediaType: broadcast.mediaType,
      mediaUrl: broadcast.mediaUrl,
      mediaFileName: broadcast.mediaFileName,
      videoDurationSeconds: broadcast.videoDurationSeconds,
      contactNumber: broadcast.contactNumber,
      actionText: broadcast.actionText,
      actionUrl: broadcast.actionUrl,
      checkIn: broadcast.checkIn,
    });
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
      } catch {}
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
        broadcastHistory,
        deleteHistoryItem,
        savedBroadcasts,
        saveBroadcastTemplate,
        removeSavedBroadcast,
        moveHistoryToSaved,
        reBroadcastItem,
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
