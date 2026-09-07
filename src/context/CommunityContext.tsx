import { soundManager } from "../lib/sounds";
import { AppNotifications } from "../lib/notifications";
import { subscribeToChats } from "../lib/chat";
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
  checkAuthRedirectResult,
  signOutAuth, 
  isAuthorizedAdminEmail,
  savePostToFirestore,
  togglePostLikeInFirestore,
  addCommentToFirestore,
  deletePostFromFirestore,
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
import { 
  doc, 
  getDoc, 
  setDoc, 
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
  requestRealLocation: () => Promise<boolean>;

  // Alerts State
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'time' | 'confirmations' | 'rejections' | 'status'>) => void;
  voteAlert: (alertId: string, voteType: 'up' | 'down') => void;

  // Posts State (Synced with Firestore)
  posts: Post[];
  addPost: (content: string, category: string, images?: string[], customLocation?: Location, checkIn?: CheckInLocation, videoUrl?: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
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
  register: (data: { name: string; phone: string; email?: string; password?: string; address: string; villageOrCondo?: string; avatar?: string; bio?: string }) => Promise<boolean>;
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
  openMediaViewer: (media: { url: string; type?: 'image' | 'video'; title?: string; subtitle?: string }) => void;
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
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [targetMapLocation, setTargetMapLocation] = useState<{ lat: number; lng: number; zoom?: number; placeName?: string } | null>(null);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);
  const [userSessions, setUserSessions] = useState<UserSessionLog[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    try {
      const saved = localStorage.getItem('locallink_verification_requests');
      return saved ? JSON.parse(saved) : [];
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
      const saved = localStorage.getItem('locallink_user_location');
      return saved ? JSON.parse(saved) : initialLocation;
    } catch {
      return initialLocation;
    }
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const saved = localStorage.getItem('locallink_alerts');
      return saved ? JSON.parse(saved) : initialAlerts;
    } catch {
      return initialAlerts;
    }
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<LocalEvent[]>([]);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('locallink_notifications');
      return saved ? JSON.parse(saved) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('locallink_is_logged_in');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [pendingAuthAction, setPendingAuthAction] = useState<(() => void) | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfileData>(() => {
    try {
      const saved = localStorage.getItem('locallink_profile');
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
  const [contactRequests, setContactRequests] = useState<AdminContactRequest[]>(() => {
    try {
      const saved = localStorage.getItem('locallink_contact_requests');
      return saved ? JSON.parse(saved) : initialContactRequests;
    } catch {
      return initialContactRequests;
    }
  });
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

  const openMediaViewer = (url: string, type: 'image' | 'video', title?: string, subtitle?: string) => {
    setActiveMedia({ url, type, title, subtitle });
  };
  const closeMediaViewer = () => setActiveMedia(null);

  const openLocationPermissionModal = () => setIsLocationPermissionModalOpen(true);
  const closeLocationPermissionModal = () => setIsLocationPermissionModalOpen(false);
  
  const requestRealLocation = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setIsLocatingGps(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation(prev => ({
              ...prev,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }));
            setLocationPermissionStatus('granted');
            setIsLocatingGps(false);
            closeLocationPermissionModal();
            resolve(true);
          },
          (error) => {
            console.error('GPS Error:', error);
            setLocationPermissionStatus('denied');
            setIsLocatingGps(false);
            resolve(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setLocationPermissionStatus('denied');
        setIsLocatingGps(false);
        resolve(false);
      }
    });
  };

  const addAlert = (alert: Omit<Alert, 'id' | 'time' | 'confirmations' | 'rejections' | 'status'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `alert_${Date.now()}`,
      time: 'เมื่อสักครู่',
      confirmations: 0,
      rejections: 0,
      status: 'unconfirmed'
    };
    setAlerts(prev => [newAlert, ...prev]);
    showToast('แจ้งเตือนเหตุการณ์เรียบร้อยแล้ว แอดมินจะทำการตรวจสอบต่อไป', 'success');
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

  const addPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments' | 'authorAvatar'>) => {
    const newPost: Post = {
      ...postData,
      id: `post_${Date.now()}`,
      createdAt: Date.now(),
      likes: 0,
      comments: 0
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const toggleLikePost = async (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const isLiked = p.isLikedByMe;
      return {
        ...p,
        likes: isLiked ? p.likes - 1 : p.likes + 1,
        isLikedByMe: !isLiked
      };
    }));
  };

  const addComment = async (postId: string, text: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, comments: p.comments + 1 };
    }));
  };

  const deletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
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
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

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
    
    if (auth.currentUser?.uid) {
      try {
        await syncUserProfileToFirestore(auth.currentUser.uid, data);
        showToast('💾 บันทึกและซิงค์ข้อมูลส่วนตัวลงฐานข้อมูลเรียบร้อยแล้ว', 'success');
        return;
      } catch (e) {
        console.error('Sync profile error:', e);
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
      const userCredential = await signInWithEmailAndPassword(auth, credentials.phoneOrEmail, credentials.password);
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
        localStorage.setItem('locallink_profile', JSON.stringify(profileData));
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
      const locStr = `ต.${location.subdistrict}, ${location.district}`;
      await signInWithGoogleAuth(locStr);
      // Since it redirects, code execution stops here
      return true;
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      showToast(err.message || 'การเข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', 'error');
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
      
      await sendEmailVerification(user);
      
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
      localStorage.setItem('locallink_is_logged_in', 'false');
      localStorage.removeItem('locallink_profile');
    } catch {}
    
    setIsLoggedIn(false);
    showToast('ออกจากระบบเรียบร้อยแล้ว เข้าสู่โหมดผู้เยี่ยมชม', 'info');
  };

  
  useEffect(() => {
    try { localStorage.setItem('locallink_contact_requests', JSON.stringify(contactRequests)); } catch {}
  }, [contactRequests]);

  useEffect(() => {
    try { localStorage.setItem('locallink_profile', JSON.stringify(userProfile)); } catch {}
  }, [userProfile]);

  useEffect(() => {
    try { localStorage.setItem('locallink_verification_requests', JSON.stringify(verificationRequests)); } catch {}
  }, [verificationRequests]);

  useEffect(() => {
    const unsubPosts = onSnapshot(
      query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100)),
      (snapshot) => {
        const fetchedPosts = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          let avatarUrl = data.author?.avatar || data.authorAvatar || 'https://ui-avatars.com/api/?name=U&background=random';
          if (avatarUrl.includes('images.unsplash.com')) {
            avatarUrl = 'https://ui-avatars.com/api/?name=U&background=random';
          }
          fetchedPosts.push(data);
        });
        setPosts(fetchedPosts);
      },
      (error) => console.warn('Firestore subscription warning (posts):', error)
    );

    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(100)),
      (snapshot) => {
        const fetchedProds = [];
        snapshot.forEach(doc => fetchedProds.push(doc.data()));
        setProducts(fetchedProds);
      },
      (error) => console.warn('Firestore subscription warning (products):', error)
    );

    const unsubEvents = onSnapshot(
      query(collection(db, 'events'), limit(50)),
      (snapshot) => {
        const fetchedEvents = [];
        snapshot.forEach(doc => fetchedEvents.push(doc.data()));
        setEvents(fetchedEvents);
      },
      (error) => console.warn('Firestore subscription warning (events):', error)
    );
    
    

    const sessionsQuery = query(collection(db, 'user_sessions'), limit(20));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const logs = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: data.userId || 'anonymous',
            userName: data.userName || 'สมาชิก',
            userEmail: data.userEmail || '',
            loginMethod: data.loginMethod || 'google',
            ipOrLocation: data.ipOrLocation || 'กรุงเทพมหานคร',
            createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
          };
        });
        setUserSessions(logs);
      }
    });

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
              role: data.role || 'user',
              isVerified: data.isVerified || false,
              reputationScore: data.reputationScore || 50
            }));
          } else {
            // New Google User - create document
            const newUserData = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'สมาชิก',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || 'https://ui-avatars.com/api/?name=U&background=random',
              role: 'user',
              isVerified: false,
              reputationScore: 50,
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
              role: 'user',
              isVerified: false,
              reputationScore: 50,
              isGoogleUser: true
            }));
          }
        } catch (e) {
          console.error("Failed to fetch user profile on auth state change", e);
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => {
      unsubPosts();
      unsubProducts();
      unsubEvents();
            unsubscribeSessions();
      unsubscribeAuth();
    };
  }, []);

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
        posts,
        addPost,
        toggleLikePost,
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
