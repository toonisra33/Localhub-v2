import { soundManager } from "../lib/sounds";
import { AppNotifications } from "../lib/notifications";
import { subscribeToChats } from "../lib/chat";
import { safeStorage } from "../lib/safeStorage";
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { 
  Alert, 
  Post, 
  Product, 
  Location, 
  AppNotification, 
  LocalEvent, 
  Tab,
  UserProfileData,
  AdminContactRequest,
  ContactRequestType,
  ContactRequestStatus,
  CheckInLocation,
  UserSessionLog,
  VerificationRequest
} from '../types';
import { 
  initialAlerts, 
  initialPosts, 
  initialProducts, 
  initialLocation, 
  initialNotifications, 
  initialContactRequests,
  mockEvents,
  availableLocations 
} from '../data';
import { 
  auth, 
  db, 
  signInWithGoogleAuth, 
  signInWithGoogleDirectRedirect,
  checkAuthRedirectResult, 
  signOutAuth, 
  isAuthorizedAdminEmail,
  savePostToFirestore,
  togglePostLikeInFirestore,
  togglePostPinInFirestore,
  addCommentToFirestore,
  createNotificationInFirestore,
  deletePostFromFirestore,
  deleteAlertFromFirestore,
  syncUserProfileToFirestore,
  logUserSession,
  testConnection,
  handleFirestoreError,
  saveEntityToFirestore,
  deleteEntityFromFirestore,
  OperationType
} from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { reverseGeocodeLocation } from '../lib/reverseGeocode';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  onSnapshot, 
  query, where,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface CommunityContextType {
  // Navigation & Location
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  location: Location;
  setLocation: (loc: Location) => void;
  availableLocations: Location[];
  isLocatingGps: boolean;
  locationPermissionStatus: 'prompt' | 'granted' | 'denied';
  isLocationPermissionModalOpen: boolean;
  openLocationPermissionModal: () => void;
  closeLocationPermissionModal: () => void;
  requestRealLocation: () => Promise<{success: boolean, lat?: number, lng?: number}>;

  // Alerts State
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'time' | 'confirmations' | 'rejections' | 'status'>) => Promise<void>;
  voteAlert: (alertId: string, voteType: 'up' | 'down') => void;
  deleteAlert: (alertId: string) => Promise<void>;

  // Posts State (Synced with Firestore)
  posts: Post[];
  addPost: (content: string, category: string, images?: string[], customLocation?: Location, checkIn?: CheckInLocation, videoUrl?: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  togglePinPost: (postId: string, isPinned: boolean) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;

  // User Sessions & Access Audit Logs
  userSessions: UserSessionLog[];

  // Map Navigation & Highlight
  targetMapLocation: { lat: number; lng: number; zoom?: number; placeName?: string } | null;
  setTargetMapLocation: (target: { lat: number; lng: number; zoom?: number; placeName?: string } | null) => void;
  jumpToMapLocation: (lat: number, lng: number, zoom?: number, placeName?: string) => void;

  // Products & Market State
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'seller' | 'distance'>) => void;

  // Events State
  events: LocalEvent[];
  toggleJoinEvent: (eventId: string) => void;

  // Notifications State
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;

  // User Profile & Authentication (Firestore Sync)
  isLoggedIn: boolean;
  userProfile: UserProfileData;
  updateUserProfile: (data: Partial<UserProfileData>) => Promise<void>;
  verifyUserAccount: () => void;
  verificationRequests: VerificationRequest[];
  submitVerificationRequest: (idCardNumber: string, imageUrl: string) => void;
  approveVerificationRequest: (requestId: string) => void;
  rejectVerificationRequest: (requestId: string) => void;
  login: (credentials: { phoneOrEmail: string; password?: string; name?: string; avatar?: string; address?: string }) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithGoogleRedirect: () => Promise<void>;
  loginAsAdmin: (targetEmail?: string) => Promise<boolean>;
  register: (data: { name: string; phone: string; email?: string; password?: string; address: string; villageOrCondo?: string; avatar?: string; bio?: string; occupation?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  viewingProfileId: string | null;
  openPublicProfile: (userId: string) => void;
  closePublicProfile: () => void;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  requireAuth: (actionCallback: () => void,
promptMessage?: string) => boolean;

  // Database status
  isFirestoreConnected: boolean;

  // Toast System
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Quick Action Modal Triggers
  activeModal: string | null;
  openModal: (modalName: string) => void;
  closeModal: () => void;

  // Global Fullscreen Media Viewer
  activeMedia: { url: string; type: 'image' | 'video'; title?: string; subtitle?: string } | null;
  openMediaViewer: (
    media: string | { url: string; type?: 'image' | 'video'; title?: string; subtitle?: string },
    type?: 'image' | 'video',
    title?: string,
    subtitle?: string
  ) => void;
  closeMediaViewer: () => void;

  // Contact Admin & PR Requests
  contactRequests: AdminContactRequest[];
  isContactAdminModalOpen: boolean;
  contactAdminInitialType: ContactRequestType | undefined;
  openContactAdminModal: (defaultType?: ContactRequestType) => void;
  closeContactAdminModal: () => void;
  submitContactRequest: (data: Omit<AdminContactRequest, 'id' | 'createdAt' | 'timeStr' | 'status'>) => void;
  updateContactRequestStatus: (id: string, status: ContactRequestStatus, adminNote?: string) => void;
  deleteContactRequest: (id: string) => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    try {
      const saved = sessionStorage.getItem('locallink_active_tab');
      return (saved as Tab) || 'home';
    } catch {
      return 'home';
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('locallink_active_tab', activeTab);
    } catch (e) {
      console.error('Failed to save active tab', e);
    }
  }, [activeTab]);

  const [targetMapLocation, setTargetMapLocation] = useState<{ lat: number; lng: number; zoom?: number; placeName?: string } | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);
  const [userSessions, setUserSessions] = useState<UserSessionLog[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    try {
      const saved = safeStorage.getItem('locallink_verification_requests');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const jumpToMapLocation = (lat: number, lng: number, zoom: number = 16, placeName?: string) => {
    setTargetMapLocation({ lat, lng, zoom, placeName });
    setActiveTab('map');
    if (placeName) {
      showToast(`📍 กำลังนำทางไปยัง ${placeName} บนแผนที่`);
    }
  };

  const [location, setLocation] = useState<Location>(() => {
    try {
      const saved = safeStorage.getItem('locallink_user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.province && parsed.province.trim() !== '' && parsed.district && parsed.district.trim() !== '') {
          return parsed;
        }
      }
      return initialLocation;
    } catch {
      return initialLocation;
    }
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const saved = safeStorage.getItem('locallink_alerts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialAlerts;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = safeStorage.getItem('locallink_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialPosts;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = safeStorage.getItem('locallink_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialProducts;
  });

  const [events, setEvents] = useState<LocalEvent[]>(() => {
    return mockEvents;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return initialNotifications;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const saved = safeStorage.getItem('locallink_is_logged_in');
      if (saved !== null) {
        const val = JSON.parse(saved);
        const profileSaved = safeStorage.getItem('locallink_profile');
        if (profileSaved) {
          const prof = JSON.parse(profileSaved);
          if (prof && prof.email && prof.name !== 'ผู้เยี่ยมชม') {
            return Boolean(val);
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfileData>(() => {
    try {
      const saved = safeStorage.getItem('locallink_profile');
      return saved ? JSON.parse(saved) : {
        id: 'user_default',
        name: 'ผู้เยี่ยมชม',
        phone: '',
        email: '',
        address: '',
        villageOrCondo: '',
        bio: '',
        avatar: 'https://ui-avatars.com/api/?name=U&background=random',
        isVerified: false,
        joinedDate: 'มกราคม 2024',
        reputationScore: 0
      };
    } catch {
      return {
        id: 'user_default',
        name: 'ผู้เยี่ยมชม',
        phone: '',
        email: '',
        address: '',
        villageOrCondo: '',
        bio: '',
        avatar: 'https://ui-avatars.com/api/?name=U&background=random',
        isVerified: false,
        joinedDate: 'มกราคม 2024',
        reputationScore: 0
      };
    }
  });

  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isLocationPermissionModalOpen, setIsLocationPermissionModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: 'image' | 'video'; title?: string; subtitle?: string } | null>(null);

  // Contact Admin & PR Requests State
  const [contactRequests, setContactRequests] = useState<AdminContactRequest[]>([]);
  const [isContactAdminModalOpen, setIsContactAdminModalOpen] = useState(false);
  const [contactAdminInitialType, setContactAdminInitialType] = useState<ContactRequestType | undefined>(undefined);

  const openContactAdminModal = (defaultType?: ContactRequestType) => {
    setContactAdminInitialType(defaultType);
    setIsContactAdminModalOpen(true);
  };

  const closeContactAdminModal = () => {
    setIsContactAdminModalOpen(false);
    setContactAdminInitialType(undefined);
  };

  
  
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const openModal = (modalId: string) => setActiveModal(modalId);
  const closeModal = () => setActiveModal(null);

  const openMediaViewer = (
    media: string | { url: string; type?: 'image' | 'video'; title?: string; subtitle?: string },
    type?: 'image' | 'video',
    title?: string,
    subtitle?: string
  ) => {
    if (!media) return;
    if (typeof media === 'string') {
      const isVideo = type === 'video' || /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(media) || media.startsWith('data:video');
      setActiveMedia({
        url: media,
        type: isVideo ? 'video' : 'image',
        title,
        subtitle
      });
    } else {
      const url = typeof media.url === 'string' ? media.url : ((media as any)?.src || '');
      const isVideo = media.type === 'video' || /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) || url.startsWith('data:video');
      setActiveMedia({ 
        url, 
        type: isVideo ? 'video' : 'image', 
        title: media.title, 
        subtitle: media.subtitle 
      });
    }
  };
  const closeMediaViewer = () => setActiveMedia(null);

  const openLocationPermissionModal = () => setIsLocationPermissionModalOpen(true);
  const closeLocationPermissionModal = () => setIsLocationPermissionModalOpen(false);
  
  const requestRealLocation = async (): Promise<{success: boolean, lat?: number, lng?: number}> => {
    return new Promise((resolve) => {
      setIsLocatingGps(true);
      if (!('geolocation' in navigator)) {
        setLocationPermissionStatus('denied');
        setIsLocatingGps(false);
        resolve({ success: false });
        return;
      }

      const handleGpsSuccess = async (position: GeolocationPosition) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          const geocoded = await reverseGeocodeLocation(lat, lng);
          const newLocation: Location = {
            latitude: lat,
            longitude: lng,
            subdistrict: geocoded?.subdistrict || 'ในเมือง',
            district: geocoded?.district || 'เมือง',
            province: geocoded?.province || 'กรุงเทพมหานคร',
            village: geocoded?.village || 'จุดตรวจพบ GPS',
            isGps: true
          };

          setLocation(newLocation);
          try {
            safeStorage.setItem('locallink_user_location', JSON.stringify(newLocation));
          } catch {}

          setLocationPermissionStatus('granted');
          setIsLocatingGps(false);
          closeLocationPermissionModal();
          showToast(`📍 ปักหมุดพิกัดจริง: ต.${newLocation.subdistrict} อ.${newLocation.district} จ.${newLocation.province}`, 'success');
          resolve({ success: true, lat, lng });
        } catch (err) {
          console.error('Reverse geocode processing error:', err);
          setLocation(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            isGps: true
          }));
          setLocationPermissionStatus('granted');
          setIsLocatingGps(false);
          closeLocationPermissionModal();
          resolve({ success: true, lat, lng });
        }
      };

      const handleGpsFailure = (error?: GeolocationPositionError) => {
        // Fallback: try low-accuracy network/wifi geolocation
        navigator.geolocation.getCurrentPosition(
          handleGpsSuccess,
          (err2) => {
            console.error('GPS and Network Location failed:', err2 || error);
            setLocationPermissionStatus('denied');
            setIsLocatingGps(false);
            showToast('ไม่สามารถระบุพิกัด GPS ได้ กรุณาเปิดบริการตำแหน่งบนอุปกรณ์ของคุณ', 'error');
            resolve({ success: false });
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
      };

      // Try high-accuracy GPS satellite first
      navigator.geolocation.getCurrentPosition(
        handleGpsSuccess,
        handleGpsFailure,
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    });
  };

  const addAlert = async (alert: Omit<Alert, 'id' | 'time' | 'confirmations' | 'rejections' | 'status'>) => {
    if (!isLoggedIn || !userProfile?.id) {
      showToast('กรุณาเข้าสู่ระบบก่อนแจ้งเหตุ', 'error');
      openAuthModal();
      return;
    }

    try {
      const { collection, addDoc } = await import('firebase/firestore');
      
      const alertData = {
        ...alert,
        time: 'เมื่อสักครู่',
        confirmations: 0,
        rejections: 0,
        status: 'unconfirmed',
        createdAt: Date.now(),
        reportedBy: userProfile.id,
      };
      
      const alertsRef = collection(db, 'alerts');
      const docRef = await addDoc(alertsRef, alertData);
      
      
      showToast('แจ้งเตือนเหตุการณ์เรียบร้อยแล้ว แอดมินจะทำการตรวจสอบต่อไป', 'success');
    } catch (error) {
      console.error('Error adding alert:', error);
      showToast('เกิดข้อผิดพลาดในการแจ้งเหตุ กรุณาลองใหม่อีกครั้ง', 'error');
    }
  };

  const voteAlert = (alertId: string, voteType: 'up' | 'down') => {
    setAlerts(prev => prev.map(a => {
      if (a.id !== alertId) return a;
      const isUp = voteType === 'up';
      return {
        ...a,
        confirmations: isUp ? a.confirmations + 1 : a.confirmations,
        rejections: !isUp ? a.rejections + 1 : a.rejections,
        userVoted: voteType
      };
    }));
  };

  const deleteAlert = async (alertId: string) => {
    try {
      await deleteAlertFromFirestore(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      showToast('ลบรายการแจ้งเหตุเรียบร้อยแล้ว', 'success');
    } catch (error) {
      console.error('Error deleting alert:', error);
      showToast('เกิดข้อผิดพลาดในการลบรายการแจ้งเหตุ', 'error');
    }
  };

  const addPost = async (content: string, category: string, images?: string[], customLocation?: Location, checkIn?: CheckInLocation, videoUrl?: string) => {
    const id = `post_${Date.now()}`;
    const newPost: Post = {
      id,
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar,
        isVerified: userProfile.isVerified,
        reputationScore: userProfile.reputationScore
      },
      time: 'เมื่อสักครู่',
      createdAt: Date.now(),
      content,
      category,
      images: images || [],
      videoUrl: videoUrl || null,
      location: customLocation || location || null,
      checkIn: checkIn || null,
      likes: 0,
      comments: 0
    };
    
    // Optimistic UI update
    setPosts(prev => [newPost, ...prev]);
    
    // Save to Firestore
    try {
      await savePostToFirestore({
        ...newPost,
        authorUid: auth.currentUser?.uid || userProfile.id || 'anonymous'
      });
      showToast('สร้างโพสต์เรียบร้อยแล้ว', 'success');
    } catch (error) {
      console.error('Error saving post:', error);
      showToast('เกิดข้อผิดพลาดในการบันทึกโพสต์', 'error');
    }
  };

  const toggleLikePost = async (postId: string) => {
    const userId = auth.currentUser?.uid || userProfile?.id || 'anonymous';
    if (userId === 'anonymous') {
      showToast('กรุณาเข้าสู่ระบบก่อนกดถูกใจ', 'error');
      openAuthModal();
      return;
    }

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const isLiked = p.isLikedByMe;
      return {
        ...p,
        likes: isLiked ? p.likes - 1 : p.likes + 1,
        isLikedByMe: !isLiked
      };
    }));

    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        await togglePostLikeInFirestore(postId, userId, post.isLikedByMe);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert state on error
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const isLiked = p.isLikedByMe;
        return {
          ...p,
          likes: isLiked ? p.likes - 1 : p.likes + 1,
          isLikedByMe: !isLiked
        };
      }));
    }
  };

  const togglePinPost = async (postId: string, isPinned: boolean) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, isPinned };
    }));
    try {
      await togglePostPinInFirestore(postId, isPinned);
      showToast(isPinned ? 'ปักหมุดโพสต์เรียบร้อยแล้ว' : 'ยกเลิกการปักหมุดโพสต์แล้ว', 'success');
    } catch (error) {
      console.error('Error toggling post pin:', error);
      showToast('เกิดข้อผิดพลาดในการปักหมุดโพสต์', 'error');
      // Revert on error
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        return { ...p, isPinned: !isPinned };
      }));
    }
  };

  const addComment = async (postId: string, text: string) => {
    const userId = auth.currentUser?.uid || userProfile?.id || 'anonymous';
    if (userId === 'anonymous') {
      showToast('กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น', 'error');
      openAuthModal();
      return;
    }

    const commentId = `cmt_${Date.now()}`;
    const newComment = {
      id: commentId,
      postId: postId,
      authorUid: userId,
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar,
        isVerified: userProfile.isVerified,
      },
      text: text,
      createdAt: Date.now()
    };

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, comments: p.comments + 1 };
    }));

    try {
      await addCommentToFirestore(postId, newComment as any);
      showToast('เพิ่มความคิดเห็นเรียบร้อยแล้ว', 'success');
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('เกิดข้อผิดพลาดในการเพิ่มความคิดเห็น', 'error');
      // Revert state
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        return { ...p, comments: p.comments - 1 };
      }));
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await deletePostFromFirestore(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      showToast('ลบโพสต์เรียบร้อยแล้ว', 'success');
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('เกิดข้อผิดพลาดในการลบโพสต์', 'error');
    }
  };

  const deleteContactRequest = async (id: string) => {
    setContactRequests(prev => prev.filter(req => req.id !== id));
  };

const submitContactRequest = async (data: Omit<AdminContactRequest, 'id' | 'createdAt' | 'timeStr' | 'status'>) => {
    const id = `req_${Date.now()}`;
    const newRequest: AdminContactRequest = {
      ...data,
      id,
      senderUid: userProfile.id,
      createdAt: Date.now(),
      timeStr: 'เมื่อสักครู่',
      status: 'pending'
    };
    
    // Optimistic UI update
    setContactRequests(prev => [newRequest, ...prev]);
    
    try {
      await saveEntityToFirestore('contact_requests', id, newRequest);
      
      const newNotification: AppNotification = {
        id: `n_contact_${Date.now()}`,
        title: '📨 ส่งเรื่องถึงแอดมินเรียบร้อยแล้ว',
        message: `แอดมินได้รับเรื่อง "${data.title}" แล้ว อยู่ระหว่างการตรวจสอบข้อมูลเพื่อดำเนินการ`,
        time: 'เมื่อสักครู่',
        read: false,
        type: 'broadcast'
      };
      setNotifications(prev => [newNotification, ...prev]);
      showToast('📨 ส่งข้อความถึงแอดมินเรียบร้อยแล้ว! แอดมินจะตรวจสอบและดำเนินการให้โดยเร็ว', 'success');
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการส่งเรื่อง', 'error');
    }
  };

  
  const updateContactRequestStatus = async (id: string, status: ContactRequestStatus, adminNote?: string) => {
    setContactRequests(prev => prev.map(req => {
      if (req.id !== id) return req;
      return {
        ...req,
        status,
        adminNote: adminNote !== undefined ? adminNote : req.adminNote
      };
    }));
    
    try {
      await saveEntityToFirestore('contact_requests', id, { status, adminNote, updatedAt: Date.now() });
    } catch (err) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'error');
    }
  };

  const addProduct = async (prodData: Omit<Product, 'id' | 'seller' | 'distance'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod_${Date.now()}`,
      seller: userProfile?.name,
      sellerPhone: userProfile.phone,
      distance: 0.1
    };
    
    // Optimistic UI update
    setProducts(prev => [newProd, ...prev]);
    showToast('🛍️ ลงขายสินค้าในตลาดชุมชนเรียบร้อยแล้ว');
    
    // Save to Firestore
    try {
      await saveEntityToFirestore('products', newProd.id, newProd);
    } catch (e) {
      console.warn('Failed to sync product to Firestore', e);
    }
  };

  // Events Actions (Firestore Sync)
  const toggleJoinEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    const isJoined = !event.isJoined;
    const count = isJoined ? event.joinedCount + 1 : Math.max(0, event.joinedCount - 1);
    
    const updatedEvent = { ...event, isJoined, joinedCount: count };
    
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      return updatedEvent;
    }));
    
    showToast(isJoined ? '🎉 คุณได้เข้าร่วมกิจกรรมนี้แล้ว' : 'ยกเลิกการเข้าร่วมกิจกรรมแล้ว', 'info');
    
    // Save to Firestore
    try {
      await saveEntityToFirestore('events', updatedEvent.id, updatedEvent);
    } catch(e) {
      console.warn('Failed to sync event to Firestore', e);
    }
  };

  // Notifications Actions
  const unreadNotificationsCount = (notifications || []).filter(n => !n.read).length;

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('ล้างการแจ้งเตือนทั้งหมดแล้ว', 'info');
  };

  // Profile Actions (Firestore sync)
  const updateUserProfile = async (data: Partial<UserProfileData>): Promise<void> => {
    setUserProfile(prev => ({ ...prev, ...data }));
    
    const targetUid = auth.currentUser?.uid || userProfile?.uid || userProfile?.id;
    if (targetUid && targetUid !== 'user_default') {
      try {
        await syncUserProfileToFirestore(targetUid, data);
        showToast('💾 บันทึกและซิงค์ข้อมูลส่วนตัวลงฐานข้อมูลเรียบร้อยแล้ว', 'success');
        return;
      } catch (e) {
        console.error('Sync profile error:', e);
        showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล (ขนาดอาจใหญ่เกินไป)', 'error');
        return;
      }
    }
    showToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
  };

  const verifyUserAccount = () => {
    setUserProfile(prev => ({
      ...prev,
      isVerified: true,
      verificationStatus: 'approved',
      reputationScore: Math.min(100, prev.reputationScore + 15)
    }));
    showToast('🎖️ ยืนยันตัวตนสำเร็จ บัญชีของคุณได้รับสถานะยืนยันแล้ว');
  };

  const submitVerificationRequest = (idCardNumber: string, imageUrl: string) => {
    const requestId = `req_${Date.now()}`;
    const newRequest: VerificationRequest = {
      id: requestId,
      userId: userProfile.uid || userProfile.id || 'unknown',
      userName: userProfile?.name,
      idCardNumber,
      imageUrl,
      status: 'pending',
      submittedAt: Date.now()
    };
    
    setVerificationRequests(prev => [newRequest, ...prev]);
    
    setUserProfile(prev => ({
      ...prev,
      verificationStatus: 'pending'
    }));
    
    showToast('ส่งคำขอยืนยันตัวตนเรียบร้อยแล้ว รอผู้ดูแลระบบอนุมัติ', 'success');
  };

  const approveVerificationRequest = (requestId: string) => {
    setVerificationRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));
    // In a real app, this would also update the specific user's profile in the DB.
    // For this demo, we assume the admin is testing and we just update local state
    // if the request belongs to the current user.
    const request = verificationRequests.find(req => req.id === requestId);
    if (request && (request.userId === userProfile.uid || request.userId === userProfile.id)) {
      verifyUserAccount();
    } else {
      showToast('อนุมัติคำขอยืนยันตัวตนแล้ว', 'success');
    }
  };

  const rejectVerificationRequest = (requestId: string) => {
    setVerificationRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
    const request = verificationRequests.find(req => req.id === requestId);
    if (request && (request.userId === userProfile.uid || request.userId === userProfile.id)) {
      setUserProfile(prev => ({
        ...prev,
        verificationStatus: 'rejected'
      }));
    }
    showToast('ปฏิเสธคำขอยืนยันตัวตนแล้ว', 'info');
  };

  // Authentication Actions
  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAuthAction(null);
  };

  const openPublicProfile = (userId: string) => setViewingProfileId(userId);
  const closePublicProfile = () => setViewingProfileId(null);

  const login = async (credentials: { phoneOrEmail: string; password?: string; name?: string; avatar?: string; address?: string }): Promise<boolean> => {
    if (!credentials.password) {
      showToast('กรุณากรอกรหัสผ่าน', 'error');
      return false;
    }
    
    try {
      let loginIdentifier = credentials.phoneOrEmail.trim();

      // If phone number is entered without @, find associated email from Firestore users
      if (!loginIdentifier.includes('@')) {
        const cleanPhone = loginIdentifier.replace(/[-\s]/g, '');
        try {
          const q = query(collection(db, 'users'), where('phone', '==', cleanPhone));
          const snap = await getDocs(q);
          if (!snap.empty) {
            loginIdentifier = snap.docs[0].data().email || `${cleanPhone}@locallink.app`;
          } else {
            loginIdentifier = `${cleanPhone}@locallink.app`;
          }
        } catch {
          loginIdentifier = `${cleanPhone}@locallink.app`;
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, loginIdentifier, credentials.password);
      const user = userCredential.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      let profileData = { ...userProfile };
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        profileData = {
          ...profileData,
          id: user.uid,
          uid: user.uid,
          name: data.displayName || user.displayName || 'สมาชิก',
          email: data.email || user.email || '',
          avatar: data.photoURL || user.photoURL || 'https://ui-avatars.com/api/?name=U&background=random',
          phone: data.phone || '',
          address: data.address || '',
          villageOrCondo: data.villageOrCondo || '',
          bio: data.bio || '',
          role: data.role || (isAuthorizedAdminEmail(user.email) ? 'admin' : 'user'),
          isVerified: false,
          reputationScore: data.reputationScore || 50,
          isGoogleUser: false
        };
      }
      
      setUserProfile(profileData);
      setIsLoggedIn(true);
      setIsAuthModalOpen(false);
      
      try {
        safeStorage.setItem('locallink_profile', JSON.stringify(profileData));
      } catch {}

      // Log access session to database
      await logUserSession(
        user.uid,
        profileData.name,
        user.email || '',
        'password',
        `ต.${location.subdistrict}, ${location.district}`
      );
      
      if (profileData.role === 'admin') {
        showToast(`👑 ยินดีต้อนรับผู้ดูแลระบบ (${user.email})! ได้รับสิทธิ์แอดมินและบันทึกเซสชันแล้ว`, 'success');
      } else {
        showToast(`👋 ยินดีต้อนรับกลับ, ${profileData.name}! เข้าสู่ระบบสำเร็จแล้ว`, 'success');
      }
      
      if (pendingAuthAction) {
        pendingAuthAction();
        setPendingAuthAction(null);
      }
      
      return true;
    } catch (err: any) {
      console.error('Firebase Login Error:', err);
      showToast('อีเมลหรือรหัสผ่านไม่ถูกต้อง (หากเพิ่งสมัครกรุณายืนยันอีเมลก่อน)', 'error');
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const locStr = `ต.${location.subdistrict || 'ลาดยาว'}, ${location.district || 'จตุจักร'}`;
      const result = await signInWithGoogleAuth(locStr);

      if ('isRedirecting' in result && result.isRedirecting) {
        showToast('กำลังนำคุณไปยังหน้าเลือกบัญชี Google...', 'info');
        return false;
      }

      if ('user' in result && result.user) {
        setIsLoggedIn(true);
        setIsAuthModalOpen(false);
        try {
          safeStorage.setItem('locallink_is_logged_in', JSON.stringify(true));
        } catch {}

        const isAdmin = isAuthorizedAdminEmail(result.user.email);
        const name = result.user.displayName || result.user.email?.split('@')[0] || 'สมาชิก';
        
        setUserProfile(prev => ({
          ...prev,
          id: result.user.uid,
          uid: result.user.uid,
          name: name,
          email: result.user.email || '',
          avatar: result.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          role: isAdmin ? 'admin' : 'user',
          isVerified: isAdmin ? true : false,
          reputationScore: isAdmin ? 100 : 50
        }));

        if (isAdmin) {
          showToast(`👑 ยินดีต้อนรับผู้ดูแลระบบ (${result.user.email})! ได้รับสิทธิ์แอดมินแล้ว`, 'success');
        } else {
          showToast(`👋 ยินดีต้อนรับ, ${name}! เข้าสู่ระบบสำเร็จแล้ว`, 'success');
        }
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        showToast(err.message || 'การเข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'error');
      }
      return false;
    }
  };

  const loginWithGoogleRedirect = async (): Promise<void> => {
    try {
      const locStr = `ต.${location.subdistrict || 'ลาดยาว'}, ${location.district || 'จตุจักร'}`;
      showToast('กำลังนำคุณไปยังหน้าเลือกบัญชี Google...', 'info');
      await signInWithGoogleDirectRedirect(locStr);
    } catch (err: any) {
      console.error('Google redirect failed:', err);
      showToast('ไม่สามารถเปิดหน้า Google ได้ กรุณาลองใหม่อีกครั้ง', 'error');
    }
  };

  const loginAsAdmin = async (targetEmail: string = 'toonisra33@gmail.com'): Promise<boolean> => {
    try {
      const email = targetEmail.trim();
      const name = 'คุณอิศรา (ผู้ดูแลระบบ)';
      const profileData: UserProfileData = {
        id: `admin_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        uid: `admin_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: name,
        email: email,
        phone: '081-234-5678',
        address: `ต.${location.subdistrict || 'ลาดยาว'} อ.${location.district || 'จตุจักร'} จ.${location.province || 'กรุงเทพมหานคร'}`,
        villageOrCondo: 'ศูนย์บัญชาการชุมชน LocalHub',
        bio: 'ผู้ดูแลระบบและพัฒนาชุมชน LocalHub ประจำพื้นที่',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=ffffff&bold=true`,
        role: 'admin',
        isVerified: true,
        reputationScore: 100,
        joinedDate: 'มกราคม 2024',
        isGoogleUser: true,
      };

      setUserProfile(profileData);
      setIsLoggedIn(true);
      safeStorage.setItem('locallink_profile', JSON.stringify(profileData));
      safeStorage.setItem('locallink_is_logged_in', JSON.stringify(true));
      
      try {
        if (db) {
          const userRef = doc(db, 'users', profileData.uid);
          await setDoc(userRef, {
            ...profileData,
            lastLoginAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
      } catch (e) {
        console.warn('Admin profile firestore sync warning:', e);
      }

      await logUserSession(
        profileData.uid,
        profileData.name,
        profileData.email,
        'google',
        `ต.${location.subdistrict || 'ลาดยาว'}, ${location.district || 'จตุจักร'}`
      );

      setIsAuthModalOpen(false);
      showToast(`👑 ยินดีต้อนรับผู้ดูแลระบบ (${email})! เข้าสู่ระบบสำเร็จแล้ว`, 'success');
      return true;
    } catch (err) {
      console.error('Admin quick login error:', err);
      showToast('เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'error');
      return false;
    }
  };

  const register = async (data: { name: string; phone: string; email?: string; password?: string; address: string; villageOrCondo?: string; avatar?: string; bio?: string; occupation?: string }): Promise<boolean> => {
    if (!data.email || !data.password) {
      showToast('กรุณากรอกอีเมลและรหัสผ่าน', 'error');
      return false;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: data.name.trim(),
        photoURL: data.avatar || 'https://ui-avatars.com/api/?name=U&background=random'
      });
      
      try { await sendEmailVerification(user); } catch (e) { console.warn('Email verification skipped', e); }
      
      const isAdmin = isAuthorizedAdminEmail(data.email);
      const assignedRole = isAdmin ? 'admin' : 'user';
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: data.name.trim(),
        photoURL: data.avatar || 'https://ui-avatars.com/api/?name=U&background=random',
        phone: data.phone.trim(),
        address: data.address.trim(),
        villageOrCondo: data.villageOrCondo?.trim() || location.village || 'ชุมชนท้องถิ่น',
        bio: data.bio?.trim() || `สมาชิกใหม่แห่งชุมชน ${location.district}`,
        occupation: data.occupation || 'ประชาชนทั่วไป',
        role: assignedRole,
        isVerified: false,
        reputationScore: isAdmin ? 100 : 50,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Log session to database
      await logUserSession(
        user.uid,
        data.name.trim(),
        user.email || '',
        'password',
        data.address.trim() || `ต.${location.subdistrict}, ${location.district}`
      );
      
      setUserProfile({
        id: user.uid,
        uid: user.uid,
        name: data.name.trim(),
        email: user.email || "",
        avatar: data.avatar || "https://ui-avatars.com/api/?name=U&background=random",
        phone: data.phone.trim(),
        address: data.address.trim(),
        villageOrCondo: data.villageOrCondo?.trim() || location.village || "ชุมชนท้องถิ่น",
        bio: data.bio?.trim() || `สมาชิกใหม่แห่งชุมชน ${location.district}`,
        occupation: data.occupation || 'ประชาชนทั่วไป',
        role: assignedRole,
        isVerified: false,
        isGoogleUser: false,
        reputationScore: isAdmin ? 100 : 50,
        joinedDate: new Date().toLocaleDateString("th-TH")
      });

      showToast(`สมัครสมาชิกสำเร็จ! บันทึกข้อมูลลงฐานข้อมูลและส่งลิงก์ยืนยันตัวตนไปยัง ${data.email} แล้ว`, 'success');
      
      if (pendingAuthAction) {
        pendingAuthAction();
        setPendingAuthAction(null);
      }
      setIsAuthModalOpen(false);
      
      return true;
    } catch (err: any) {
      console.error('Firebase Registration Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        showToast('อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบแทน', 'error');
      } else {
        showToast(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน', 'error');
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOutAuth();
    } catch (e) {
      console.error('Error signing out', e);
    }
    
    try {
      safeStorage.setItem('locallink_is_logged_in', 'false');
      safeStorage.removeItem('locallink_profile');
      try { sessionStorage.removeItem('locallink_active_tab'); } catch {}
    } catch {}
    
    setIsLoggedIn(false);
    setActiveTab('home');
    showToast('ออกจากระบบเรียบร้อยแล้ว เข้าสู่โหมดผู้เยี่ยมชม', 'info');
  };

  

  useEffect(() => {
    // Check for Google Auth redirect result
    checkAuthRedirectResult().then(authResult => {
      if (authResult && authResult.user) {
        setIsLoggedIn(true);
        try {
          safeStorage.setItem('locallink_is_logged_in', JSON.stringify(true));
        } catch {}

        const isAdmin = isAuthorizedAdminEmail(authResult.user.email);
        setUserProfile(prev => ({
          ...prev,
          id: authResult.user.uid,
          uid: authResult.user.uid,
          name: authResult.name,
          email: authResult.user.email || '',
          avatar: authResult.avatar,
          role: isAdmin ? 'admin' : (authResult.role as any || 'user'),
          isVerified: isAdmin ? true : false,
          reputationScore: isAdmin ? 100 : 50
        }));

        if (isAdmin) {
          showToast(`👑 ยินดีต้อนรับผู้ดูแลระบบ (${authResult.user.email})! ได้รับสิทธิ์แอดมินแล้ว`, 'success');
        } else {
          showToast(`👋 ยินดีต้อนรับคุณ ${authResult.name}! เข้าสู่ระบบด้วย Google สำเร็จแล้ว`, 'success');
        }
      }
    }).catch(err => {
      console.error('Error checking auth redirect result:', err);
    });
  }, []);

  useEffect(() => {
    try { safeStorage.setItem('locallink_contact_requests', JSON.stringify(contactRequests)); } catch {}
  }, [contactRequests]);

  useEffect(() => {
    try { safeStorage.setItem('locallink_profile', JSON.stringify(userProfile)); } catch {}
  }, [userProfile]);

  useEffect(() => {
    try { safeStorage.setItem('locallink_verification_requests', JSON.stringify(verificationRequests)); } catch {}
  }, [verificationRequests]);

  useEffect(() => {
    const unsubAlerts = onSnapshot(
      query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(100)),
      (snapshot) => {
        const fetchedAlerts: Alert[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          fetchedAlerts.push({
            id: docSnap.id,
            type: data.type || 'general',
            title: data.title || '',
            description: data.description || '',
            location: data.location || { district: '', province: '', subdistrict: '' },
            time: data.time || 'เมื่อสักครู่',
            status: data.status || 'unconfirmed',
            confirmations: data.confirmations || 0,
            rejections: data.rejections || 0,
            reportedBy: data.reportedBy,
            image: data.image
          } as Alert);
        });
        setAlerts(fetchedAlerts.length > 0 ? fetchedAlerts : initialAlerts);
      },
      (error) => {
        console.warn('Firestore subscription warning (alerts):', error);
        setAlerts(prev => prev.length > 0 ? prev : initialAlerts);
      }
    );

    const unsubPosts = onSnapshot(
      query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100)),
      (snapshot) => {
        const fetchedPosts: Post[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          let avatarUrl = data.author?.avatar || data.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.authorName || data.author?.name || 'U')}&background=random`;
          if (avatarUrl.includes('images.unsplash.com')) {
            avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.authorName || data.author?.name || 'U')}&background=random`;
          }
          fetchedPosts.push({
            id: docSnap.id,
            authorUid: data.authorUid || data.author?.id,
            author: data.author || {
              name: data.authorName || 'ไม่ระบุตัวตน',
              avatar: avatarUrl,
              isVerified: data.authorIsVerified || false,
              reputationScore: data.authorReputationScore || 0
            },
            time: data.createdAt?.toMillis ? new Date(data.createdAt.toMillis()).toLocaleString('th-TH') : (data.time || 'เมื่อสักครู่'),
            createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
            content: data.content || '',
            category: data.category || 'ทั่วไป',
            images: data.images || (data.image ? [data.image] : []),
            videoUrl: data.videoUrl || undefined,
            location: data.location || { district: '', province: '', subdistrict: '' },
            checkIn: data.checkIn || undefined,
            likes: data.likes || 0,
            comments: data.comments || 0,
            likedBy: data.likedBy || [],
            isPinned: data.isPinned || false,
          } as Post);
        });
        setPosts(fetchedPosts.length > 0 ? fetchedPosts : initialPosts);
      },
      (error) => {
        console.warn('Firestore subscription warning (posts):', error);
        setPosts(prev => prev.length > 0 ? prev : initialPosts);
      }
    );

    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(100)),
      (snapshot) => {
        const fetchedProds: Product[] = [];
        snapshot.forEach(doc => fetchedProds.push(doc.data() as Product));
        setProducts(fetchedProds.length > 0 ? fetchedProds : initialProducts);
      },
      (error) => {
        console.warn('Firestore subscription warning (products):', error);
        setProducts(prev => prev.length > 0 ? prev : initialProducts);
      }
    );

    const unsubEvents = onSnapshot(
      query(collection(db, 'events'), limit(50)),
      (snapshot) => {
        const fetchedEvents: LocalEvent[] = [];
        snapshot.forEach(doc => fetchedEvents.push(doc.data() as LocalEvent));
        setEvents(fetchedEvents.length > 0 ? fetchedEvents : mockEvents);
      },
      (error) => {
        console.warn('Firestore subscription warning (events):', error);
        setEvents(prev => prev.length > 0 ? prev : mockEvents);
      }
    );

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {

      if (firebaseUser) {
        setIsLoggedIn(true);
        setIsFirestoreConnected(true);
        // Fetch user profile from Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
if (userSnap.exists()) {
            const data = userSnap.data();
            const isAdmin = isAuthorizedAdminEmail(firebaseUser.email);
            setUserProfile(prev => ({
              ...prev,
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: data.displayName || firebaseUser.displayName || 'สมาชิก',
              email: data.email || firebaseUser.email || '',
              avatar: data.photoURL || firebaseUser.photoURL || 'https://ui-avatars.com/api/?name=U&background=random',
              phone: data.phone || '',
              address: data.address || '',
              villageOrCondo: data.villageOrCondo || '',
              bio: data.bio || '',
              role: isAdmin ? 'admin' : (data.role || 'user'),
              isVerified: isAdmin ? true : (data.isVerified || false),
              reputationScore: isAdmin ? 100 : (data.reputationScore || 50),
              occupation: data.occupation || '',
              birthDate: data.birthDate || '',
              relationshipStatus: data.relationshipStatus || '',
              emergencyContactName: data.emergencyContactName || '',
              emergencyContactPhone: data.emergencyContactPhone || ''
            }));
          } else {
            // New Google User - create document (only if Google, to prevent race condition with email registration)
            const isGoogleUser = firebaseUser.providerData.some(p => p.providerId === 'google.com');
            const isAdmin = isAuthorizedAdminEmail(firebaseUser.email);
            
            if (isGoogleUser) {
              const newUserData = {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || 'สมาชิก',
                email: firebaseUser.email || '',
                photoURL: firebaseUser.photoURL || 'https://ui-avatars.com/api/?name=U&background=random',
                role: isAdmin ? 'admin' : 'user',
                isVerified: isAdmin ? true : false,
                reputationScore: isAdmin ? 100 : 50,
                joinedDate: new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
              };
              await setDoc(userRef, newUserData);
              setUserProfile(prev => ({
                ...prev,
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                name: newUserData.displayName,
                email: newUserData.email,
                avatar: newUserData.photoURL,
                role: isAdmin ? 'admin' : 'user',
                isVerified: isAdmin ? true : false,
                reputationScore: isAdmin ? 100 : 50,
                isGoogleUser: true
              }));
            }
          }
        } catch (e) {
          console.error("Failed to fetch user profile on auth state change", e);
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => {
      unsubAlerts();
      unsubPosts();
      unsubProducts();
      unsubEvents();
                  unsubscribeAuth();
    };
  }, []);

useEffect(() => {
    if (!isLoggedIn || userProfile?.role !== 'admin') {
      setUserSessions([]);
      return;
    }
    const sessionsQuery = query(collection(db, 'user_sessions'), limit(100));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const logs = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
            const timestamp = data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.timestamp || Date.now());
            return {
              id: docSnap.id,
              userId: data.userId || 'anonymous',
              userName: data.userName || 'สมาชิก',
              userEmail: data.userEmail || '',
              loginMethod: data.loginMethod || 'google',
              ipOrLocation: data.ipOrLocation || 'กรุงเทพมหานคร',
              timestamp,
              timeStr: new Date(timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
              createdAt: timestamp
            };
        });
        logs.sort((a,b) => b.createdAt - a.createdAt);
        setUserSessions(logs);
      }
    }, (error) => {
      console.warn('Firestore subscription warning (sessions):', error);
    });
    return () => unsubscribeSessions();
  }, [isLoggedIn, userProfile?.role]);

  useEffect(() => {
    if (!isLoggedIn || !userProfile?.id) {
      setContactRequests([]);
      return;
    }
    
    let q;
    if (userProfile.role === 'admin') {
      q = query(collection(db, 'contact_requests'), orderBy('createdAt', 'desc'), limit(100));
    } else {
      q = query(collection(db, 'contact_requests'), where('senderUid', '==', userProfile.id), limit(50));
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedReqs = [];
      snapshot.forEach(doc => fetchedReqs.push(doc.data()));
      if (userProfile.role !== 'admin') { fetchedReqs.sort((a,b) => b.createdAt - a.createdAt); }
      setContactRequests(fetchedReqs);
    }, (error) => {
      console.warn('Firestore subscription warning (contact_requests):', error);
    });

    return () => unsub();
  }, [isLoggedIn, userProfile?.role, userProfile?.id]);
useEffect(() => {
    if (!isLoggedIn || !userProfile?.id) {
      setNotifications([]);
      return;
    }
    
    const q = query(collection(db, 'notifications'), where('recipientUid', '==', userProfile.id), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedNotifs = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        fetchedNotifs.push({
          id: doc.id,
          ...data,
          time: data.createdAt?.toMillis ? new Date(data.createdAt.toMillis()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : 'เมื่อสักครู่',
        });
      });
      
      // Play sound for new notifications that just arrived
      setNotifications(prev => {
        if (prev.length > 0 && fetchedNotifs.length > 0) {
          const newNotifs = fetchedNotifs.filter(n => !prev.find(p => p.id === n.id));
          if (newNotifs.some(n => !n.read)) {
            soundManager.playAlertSound();
            AppNotifications.send(`การแจ้งเตือนใหม่`, {
              body: newNotifs[0].message,
              requireInteraction: false,
            });
          }
        }
        return fetchedNotifs;
      });
      
    }, (error) => {
      console.warn('Firestore subscription warning (notifications):', error);
    });

    return () => unsub();
  }, [isLoggedIn, userProfile?.id]);

  const requireAuth = (actionCallback: () => void, promptMessage?: string): boolean => {
    if (isLoggedIn) {
      actionCallback();
      return true;
    }
    setPendingAuthAction(() => actionCallback);
    if (promptMessage) {
      showToast(promptMessage, 'info');
    }
    openAuthModal('register');
    return false;
  };

  return (
    <CommunityContext.Provider
      value={{
        activeTab,
        setActiveTab,
        location,
        setLocation,
        availableLocations,
        isLocatingGps,
        locationPermissionStatus,
        isLocationPermissionModalOpen,
        openLocationPermissionModal,
        closeLocationPermissionModal,
        requestRealLocation,
        alerts,
        addAlert,
        voteAlert,
        deleteAlert,
        posts,
        addPost,
        toggleLikePost,
        togglePinPost,
        addComment,
        deletePost,
        userSessions,
        targetMapLocation,
        setTargetMapLocation,
        jumpToMapLocation,
        products,
        addProduct,
        events,
        toggleJoinEvent,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        isLoggedIn,
        userProfile,
        updateUserProfile,
        verifyUserAccount,
        verificationRequests,
        submitVerificationRequest,
        approveVerificationRequest,
        rejectVerificationRequest,
        login,
        loginWithGoogle,
        loginWithGoogleRedirect,
        loginAsAdmin,
        register,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        viewingProfileId,
        openPublicProfile,
        closePublicProfile,
        requireAuth,
        isFirestoreConnected,
        toasts,
        showToast,
        removeToast,
        activeModal,
        openModal,
        closeModal,
        activeMedia,
        openMediaViewer,
        closeMediaViewer,
        contactRequests,
        isContactAdminModalOpen,
        contactAdminInitialType,
        openContactAdminModal,
        closeContactAdminModal,
        submitContactRequest,
        updateContactRequestStatus,
        deleteContactRequest
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
}
