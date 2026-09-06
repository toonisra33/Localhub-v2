import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  query,
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
  requireAuth: (actionCallback: () => void, promptMessage?: string) => boolean;

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

  const submitContactRequest = (data: Omit<AdminContactRequest, 'id' | 'createdAt' | 'timeStr' | 'status'>) => {
    const newRequest: AdminContactRequest = {
      ...data,
      id: `req_${Date.now()}`,
      createdAt: Date.now(),
      timeStr: 'เมื่อสักครู่',
      status: 'pending'
    };

    setContactRequests(prev => [newRequest, ...prev]);

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
  };

  const updateContactRequestStatus = (id: string, status: ContactRequestStatus, adminNote?: string) => {
    setContactRequests(prev => prev.map(req => {
      if (req.id !== id) return req;
      return {
        ...req,
        status,
        adminNote: adminNote !== undefined ? adminNote : req.adminNote
      };
    }));
    showToast('อัปเดตสถานะเรื่องติดต่อเรียบร้อยแล้ว', 'info');
  };

  const deleteContactRequest = (id: string) => {
    setContactRequests(prev => prev.filter(req => req.id !== id));
    showToast('ลบรายการคำขอติดต่อเรียบร้อยแล้ว', 'info');
  };

  const openMediaViewer = (media: { url: string; type?: 'image' | 'video'; title?: string; subtitle?: string }) => {
    setActiveMedia({
      url: media.url,
      type: media.type || (media.url.includes('.mp4') || media.url.includes('.webm') ? 'video' : 'image'),
      title: media.title,
      subtitle: media.subtitle
    });
  };

  const closeMediaViewer = () => {
    setActiveMedia(null);
  };

  const openLocationPermissionModal = () => setIsLocationPermissionModalOpen(true);
  const closeLocationPermissionModal = () => setIsLocationPermissionModalOpen(false);

  // Real GPS Location Request handler
  const requestRealLocation = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      showToast('อุปกรณ์หรือเบราว์เซอร์ของคุณไม่รองรับการตรวจจับพิกัด GPS', 'info');
      setLocationPermissionStatus('denied');
      return false;
    }

    setIsLocatingGps(true);

    return new Promise((resolve) => {
      const handleLocationSuccess = async (position: GeolocationPosition) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 25);

        setLocationPermissionStatus('granted');
        setIsLocatingGps(false);

        let matchedDistrict = 'จตุจักร';
        let matchedSubdistrict = 'ลาดยาว';
        let matchedProvince = 'กรุงเทพมหานคร';
        let matchedVillage = `พิกัด GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
            signal: controller.signal,
            headers: { 
              'Accept-Language': 'th,en' 
            }
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              matchedProvince = addr.province || addr.state || addr.city || 'ระบุไม่ได้';
              matchedDistrict = addr.city_district || addr.district || addr.suburb || addr.town || addr.county || 'ระบุไม่ได้';
              matchedSubdistrict = addr.subdistrict || addr.neighbourhood || addr.quarter || addr.village || 'ระบุไม่ได้';
              matchedVillage = addr.road || addr.residential || `ใกล้เคียง (${accuracy} ม.)`;
            } else {
              matchedProvince = 'พิกัด GPS';
              matchedDistrict = lat.toFixed(4);
              matchedSubdistrict = lng.toFixed(4);
            }
          } else {
             matchedProvince = 'พิกัด GPS';
             matchedDistrict = lat.toFixed(4);
             matchedSubdistrict = lng.toFixed(4);
          }
        } catch {
           matchedProvince = 'พิกัด GPS';
           matchedDistrict = lat.toFixed(4);
           matchedSubdistrict = lng.toFixed(4);
        }

        const realLoc: Location = {
          province: matchedProvince,
          district: matchedDistrict,
          subdistrict: matchedSubdistrict,
          village: matchedVillage,
          distance: 0,
          latitude: lat,
          longitude: lng,
          accuracy: accuracy,
          isGps: true,
          timestamp: Date.now()
        };

        setLocation(realLoc);
        showToast(`🎯 ระบุพิกัด GPS จริงสำเร็จ: ${matchedDistrict}, ${matchedProvince} (ความแม่นยำ ±${accuracy}ม.)`, 'success');
        resolve(true);
      };

      const handleFirstAttemptFail = () => {
        navigator.geolocation.getCurrentPosition(
          handleLocationSuccess,
          (error) => {
            setIsLocatingGps(false);
            let errMsg = 'ไม่สามารถระบุพิกัดตำแหน่งจริงได้ กำลังใช้ตำแหน่งชุมชนที่บันทึกไว้';
            if (error && error.code === error.PERMISSION_DENIED) {
              setLocationPermissionStatus('denied');
              errMsg = 'คุณได้ปฏิเสธการขอเข้าถึงตำแหน่ง (Location Permission Denied)';
            }
            showToast(errMsg, 'info');
            resolve(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 6000,
            maximumAge: 60000
          }
        );
      };

      navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleFirstAttemptFail,
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 30000
        }
      );
    });
  };

  // 1. Initial Connection Test & Real-time Firestore Listeners
  useEffect(() => {
    testConnection().then(connected => {
      setIsFirestoreConnected(connected);
    });

    

    // Subscribe to User Sessions Log in real-time
    const sessionsQuery = query(collection(db, 'user_sessions'), limit(20));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const logs: UserSessionLog[] = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: data.userId || 'anonymous',
            userName: data.userName || 'สมาชิก',
            userEmail: data.userEmail || '',
            loginMethod: data.loginMethod || 'google',
            ipOrLocation: data.ipOrLocation || 'กรุงเทพมหานคร',
            userAgent: data.userAgent || 'Web Browser',
            timestamp: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now(),
            timeStr: data.createdAt?.seconds 
              ? new Date(data.createdAt.seconds * 1000).toLocaleString('th-TH')
              : 'เมื่อสักครู่'
          };
        });
        setUserSessions(logs);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'user_sessions');
    });

    return () => {

      unsubscribeSessions();
    };
  }, []);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    // Check if coming back from Google Redirect Login
    checkAuthRedirectResult().then((isSuccess) => {
      // If we successfully returned and processed a redirect, ensure the auth modal is closed
      if (isSuccess) {
         sessionStorage.removeItem('locallink_pending_loc');
         setIsAuthModalOpen(false);
      }
    });

    // Subscriptions to Firestore collections
    const unsubPosts = onSnapshot(
      query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100)),
      (snapshot) => {
        const fetchedPosts: Post[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          // Filter out dummy avatars
          let avatarUrl = data.author?.avatar || data.authorAvatar || 'https://ui-avatars.com/api/?name=U&background=random';
          if (avatarUrl.includes('images.unsplash.com')) {
            avatarUrl = 'https://ui-avatars.com/api/?name=U&background=random';
          }
          let authorName = data.author?.name || data.authorName || 'สมาชิกชุมชน';
          
          fetchedPosts.push({
            ...data,
            id: docSnap.id,
            author: {
              name: authorName,
              avatar: avatarUrl
            },
            authorUid: data.authorUid || data.author?.uid,
            isLiked: auth.currentUser?.uid ? (data.likedBy || []).includes(auth.currentUser.uid) : false,
            time: data.createdAt?.seconds 
              ? new Date(data.createdAt.seconds * 1000).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
              : data.time || 'เมื่อสักครู่',
          } as Post);
        });
        setPosts(fetchedPosts);
      },
      (error) => console.warn('Firestore subscription warning (posts):', error)
    );

    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(100)),
      (snapshot) => {
        const fetchedProds: Product[] = [];
        snapshot.forEach(doc => fetchedProds.push(doc.data() as Product));
        setProducts(fetchedProds);
      },
      (error) => console.warn('Firestore subscription warning (products):', error)
    );

    const unsubEvents = onSnapshot(
      query(collection(db, 'events'), limit(50)),
      (snapshot) => {
        const fetchedEvents: LocalEvent[] = [];
        snapshot.forEach(doc => fetchedEvents.push(doc.data() as LocalEvent));
        setEvents(fetchedEvents);
      },
      (error) => console.warn('Firestore subscription warning (events):', error)
    );

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        // Force modal closed if it was left open (e.g. returning from popup)
        setIsAuthModalOpen(false);
        const isAdmin = isAuthorizedAdminEmail(firebaseUser.email);
        const role = isAdmin ? 'admin' : 'user';

        // Listen or fetch profile from Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserProfile(prev => ({
              ...prev,
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: data.displayName || firebaseUser.displayName || prev.name,
              email: firebaseUser.email || prev.email,
              avatar: data.photoURL || firebaseUser.photoURL || prev.avatar,
              phone: data.phone || prev.phone,
              address: data.address || prev.address,
              villageOrCondo: data.villageOrCondo || prev.villageOrCondo,
              bio: data.bio || prev.bio,
              isVerified: false,
              role: (data.role || role) as 'admin' | 'user',
              isGoogleUser: true
            }));
          } else {
            const newName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || userProfile?.name || 'User';
            const newAvatar = firebaseUser.photoURL || userProfile?.avatar || 'https://ui-avatars.com/api/?name=U&background=random';
            
            // Create the document if it doesn't exist
            try {
              await setDoc(userRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: newName,
                name: newName,
                photoURL: newAvatar,
                avatar: newAvatar,
                role: role,
                isVerified: false,
                isGoogleUser: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              console.warn("Could not create user document in onAuthStateChanged", err);
            }

            setUserProfile(prev => ({
              ...prev,
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: newName,
              email: firebaseUser.email || prev.email,
              avatar: newAvatar,
              isVerified: false,
              role: role as 'admin' | 'user',
              isGoogleUser: true
            }));
          }
        } catch (e: any) {
          if (e && e.message && e.message.includes('offline')) {
            console.warn('Firebase: Operating in offline mode. Using local user data.');
          } else {
            console.error('Error fetching Firestore user profile:', e);
          }
          // Fallback if offline
          setUserProfile(prev => ({
            ...prev,
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || prev.name,
            email: firebaseUser.email || prev.email,
            avatar: firebaseUser.photoURL || prev.avatar,
            isVerified: false,
            role: role as 'admin' | 'user',
            isGoogleUser: true
          }));
        }
      } else {
        // User is signed out
        setIsLoggedIn(false);
        setUserProfile({
          id: 'user_default',
          name: 'ผู้เยี่ยมชม',
          phone: '',
          email: '',
          address: '',
          villageOrCondo: '',
          bio: '',
          avatar: 'https://ui-avatars.com/api/?name=U&background=random',
          isVerified: false,
          joinedDate: '',
          reputationScore: 0,
          role: 'user',
          isGoogleUser: false
        });
        try { localStorage.setItem('locallink_is_logged_in', 'false'); } catch {}
      }
    });

    return () => {
      unsubscribe();
      unsubPosts();
      unsubProducts();
      unsubEvents();
    };
  }, []);

  // Persistence helpers for localStorage caching
  useEffect(() => {
    try { localStorage.setItem('locallink_is_logged_in', JSON.stringify(isLoggedIn)); } catch {}
  }, [isLoggedIn]);

  useEffect(() => {
    try { localStorage.setItem('locallink_alerts', JSON.stringify(alerts)); } catch {}
  }, [alerts]);

  // Disable local storage for posts, products, events as we use Firestore now
  // useEffect(() => {
  //   try { localStorage.setItem('locallink_posts', JSON.stringify(posts)); } catch {}
  // }, [posts]);

  // useEffect(() => {
  //   try { localStorage.setItem('locallink_products', JSON.stringify(products)); } catch {}
  // }, [products]);

  // useEffect(() => {
  //   try { localStorage.setItem('locallink_events', JSON.stringify(events)); } catch {}
  // }, [events]);

  useEffect(() => {
    try { localStorage.setItem('locallink_notifications', JSON.stringify(notifications)); } catch {}
  }, [notifications]);

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
    try { localStorage.setItem('locallink_user_location', JSON.stringify(location)); } catch {}
  }, [location]);


  // Auto-request GPS or Prompt after login
  useEffect(() => {
    if (isLoggedIn) {
      const checkAndPromptGPS = async () => {
        if (navigator.permissions) {
          try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            if (result.state === 'granted') {
              // Silently update location if already granted
              requestRealLocation();
            } else if (result.state === 'prompt') {
              // Prompt once per session if not granted
              const hasPrompted = localStorage.getItem('locallink_gps_prompt_shown');
              if (!hasPrompted) {
                localStorage.setItem('locallink_gps_prompt_shown', 'true');
                openLocationPermissionModal();
              }
            }
          } catch (e) {
            console.warn("Permissions API error", e);
          }
        }
      };
      checkAndPromptGPS();
    }
  }, [isLoggedIn]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const openModal = (modalName: string) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  // Alerts Actions
  const addAlert = (alertData: Omit<Alert, 'id' | 'time' | 'confirmations' | 'rejections' | 'status'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: `alert_${Date.now()}`,
      time: 'เมื่อสักครู่',
      status: 'unconfirmed',
      confirmations: 1,
      rejections: 0,
      userVoted: 'up',
      reportedBy: userProfile?.name
    };
    setAlerts(prev => [newAlert, ...prev]);
    showToast('📢 รายงานเหตุการณ์เรียบร้อยแล้ว');
  };

  const voteAlert = (alertId: string, voteType: 'up' | 'down') => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id !== alertId) return alert;

      let newConfirmations = alert.confirmations;
      let newRejections = alert.rejections;
      let newVoted: 'up' | 'down' | undefined = voteType;

      if (alert.userVoted === voteType) {
        newVoted = undefined;
        if (voteType === 'up') newConfirmations = Math.max(0, newConfirmations - 1);
        if (voteType === 'down') newRejections = Math.max(0, newRejections - 1);
        showToast('ยกเลิกการยืนยันแล้ว', 'info');
      } else {
        if (alert.userVoted === 'up') newConfirmations = Math.max(0, newConfirmations - 1);
        if (alert.userVoted === 'down') newRejections = Math.max(0, newRejections - 1);

        if (voteType === 'up') {
          newConfirmations += 1;
          showToast('✅ คุณได้ร่วมยืนยันเหตุการณ์นี้แล้ว');
        } else {
          newRejections += 1;
          showToast('คุณได้รายงานว่าไม่พบเหตุการณ์นี้', 'info');
        }
      }

      let newStatus = alert.status;
      if (newConfirmations >= 5 && alert.status === 'unconfirmed') {
        newStatus = 'members';
      }

      return {
        ...alert,
        confirmations: newConfirmations,
        rejections: newRejections,
        userVoted: newVoted,
        status: newStatus
      };
    }));
  };

  // Posts Actions (Firestore Persistence Enabled)
  const addPost = async (
    content: string, 
    category: string = 'ทั่วไป', 
    images?: string[], 
    customLocation?: Location,
    checkIn?: CheckInLocation,
    videoUrl?: string
  ): Promise<void> => {
    const postId = `post_${Date.now()}`;
    const newPost: Post = {
      id: postId,
      author: {
        name: userProfile?.name,
        avatar: userProfile.avatar
      },
      authorUid: auth.currentUser?.uid || userProfile.id,
      content,
      category,
      images,
      videoUrl,
      location: customLocation ? { ...customLocation, distance: 0.1 } : { ...location, distance: 0.1 },
      checkIn: checkIn ? { ...checkIn } : undefined,
      time: 'เมื่อสักครู่',
      likes: 0,
      comments: 0,
      isLiked: false,
      likedBy: [],
      commentList: [],
      createdAt: Date.now()
    };

    // Optimistic UI update
    setPosts(prev => [newPost, ...prev]);

    // Save to Firestore
    try {
      await savePostToFirestore(newPost);
      showToast(checkIn ? `📍 เช็คอินที่ ${checkIn.placeName} และบันทึกลงฐานข้อมูลแล้ว` : '✨ แชร์เรื่องราวและบันทึกลงระบบฐานข้อมูลแล้ว');
    } catch (e) {
      console.warn('Saved locally, Firestore sync will retry:', e);
      showToast('✨ แชร์เรื่องราวเรียบร้อยแล้ว');
    }
  };

  const toggleLikePost = async (postId: string): Promise<void> => {
    const currentUid = auth.currentUser?.uid || userProfile.id;
    let isNowLiked = false;

    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      const isLiked = !post.isLiked;
      isNowLiked = isLiked;
      const currentLikedBy = post.likedBy || [];
      const updatedLikedBy = isLiked
        ? (currentLikedBy.includes(currentUid) ? currentLikedBy : [...currentLikedBy, currentUid])
        : currentLikedBy.filter(id => id !== currentUid);

      return {
        ...post,
        isLiked,
        likedBy: updatedLikedBy,
        likes: isLiked ? post.likes + 1 : Math.max(0, post.likes - 1)
      };
    }));

    // Update in Firestore
    try {
      await togglePostLikeInFirestore(postId, currentUid, !isNowLiked);
    } catch (e) {
      console.error('Firestore Like Error:', e);
    }
  };

  const addComment = async (postId: string, content: string): Promise<void> => {
    if (!content.trim()) return;
    const commentId = `c_${Date.now()}`;
    const newComment = {
      id: commentId,
      author: {
        name: userProfile?.name,
        avatar: userProfile.avatar
      },
      authorUid: auth.currentUser?.uid || userProfile.id,
      content,
      time: 'เมื่อสักครู่',
      createdAt: Date.now()
    };

    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      const existingComments = post.commentList || [];
      return {
        ...post,
        comments: post.comments + 1,
        commentList: [...existingComments, newComment]
      };
    }));

    // Save to Firestore
    try {
      await addCommentToFirestore(postId, newComment);
      showToast('💬 ส่งความคิดเห็นและบันทึกลงฐานข้อมูลแล้ว');
    } catch (e) {
      console.error('Firestore Comment Error:', e);
      showToast('💬 ส่งความคิดเห็นแล้ว');
    }
  };

  const deletePost = async (postId: string): Promise<void> => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    try {
      await deletePostFromFirestore(postId);
      showToast('ลบโพสต์ออกจากฐานข้อมูลเรียบร้อยแล้ว', 'info');
    } catch (e) {
      console.error('Firestore Delete Error:', e);
      showToast('ลบโพสต์เรียบร้อยแล้ว', 'info');
    }
  };

  // Products Actions
  // Add Product (Firestore Sync)
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
        localStorage.setItem('locallink_user_role', profileData.role || 'user');
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

  const register = async (data: { name: string; phone: string; email?: string; password?: string; address: string; villageOrCondo?: string; avatar?: string; bio?: string }): Promise<boolean> => {
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
      localStorage.setItem('locallink_user_role', 'user');
      localStorage.setItem('locallink_is_logged_in', 'false');
      localStorage.removeItem('locallink_profile');
    } catch {}
    
    setIsLoggedIn(false);
    showToast('ออกจากระบบเรียบร้อยแล้ว เข้าสู่โหมดผู้เยี่ยมชม', 'info');
  };

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
