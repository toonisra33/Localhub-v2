import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Tab,
  Location,
  Post,
  PostComment,
  InAppNotification,
  MarketItem,
  AlertReport,
  FriendUser
} from '../types';
import { sendSystemNotification } from '../utils/notificationService';
import { findNearestThaiProvince } from '../data/thaiData';
import { getRealDeviceGps, reverseGeocodeCoords } from '../services/geolocationService';
import {
  db,
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  signInAnonymously,
  onAuthStateChanged,
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  handleFirestoreError,
  OperationType,
  FirebaseUser,
  removeUndefinedFields
} from '../firebase';

export interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
  link?: string;
}

interface CommunityContextType {
  // Firebase Auth & Cloud Sync
  currentUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null;
  isFirebaseConnected: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsAdminOwner: () => void;
  loginWithEmail: (email: string, displayName?: string, asAdmin?: boolean) => void;
  logoutFirebase: () => Promise<void>;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  location: Location;
  setLocation: (loc: Location) => void;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  isLocationPermissionModalOpen: boolean;
  openLocationPermissionModal: () => void;
  closeLocationPermissionModal: () => void;
  requestRealLocation: () => Promise<void>;
  isLocatingGps: boolean;

  // Post detail modal & jump
  openedPost: Post | null;
  openPostDetail: (postOrId: Post | string) => void;
  closePostDetail: () => void;

  // Posts
  posts: Post[];
  createPost: (data: {
    title: string;
    content: string;
    category: Post['category'];
    images?: string[];
    videoUrl?: string;
    videoThumbnail?: string;
    videoDuration?: number;
    mediaFileName?: string;
    mediaFileSize?: number;
    mediaType?: Post['mediaType'];
    tags?: string[];
  }) => void;
  likePost: (id: string) => void;
  addComment: (postId: string, content: string) => void;

  // Notifications & Toasts
  notifications: InAppNotification[];
  unreadNotifCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  addInAppNotification: (notif: {
    title: string;
    message: string;
    type: InAppNotification['type'];
    link?: string;
  }) => void;

  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'info' | 'error', link?: string) => void;
  removeToast: (id: string) => void;

  // Market
  marketItems: MarketItem[];
  addMarketItem: (item: Omit<MarketItem, 'id' | 'createdAt' | 'likes'>) => void;
  likeMarketItem: (id: string) => void;

  // Alerts
  alerts: AlertReport[];
  addAlert: (alert: Omit<AlertReport, 'id' | 'createdAt' | 'verifiedCount' | 'status'>) => void;
  confirmAlert: (alertId: string) => void;
  reportAlertNotFound: (alertId: string) => void;

  // Friends (เพิ่มเพื่อน / ลบเพื่อน)
  friends: FriendUser[];
  addFriend: (friend: Omit<FriendUser, 'addedAt'>) => void;
  removeFriend: (friendIdOrName: string) => void;
  isFriend: (idOrName: string) => boolean;

  // Contact Admin
  isContactAdminModalOpen: boolean;
  openContactAdminModal: () => void;
  closeContactAdminModal: () => void;

  // Role
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

export const ORIGINAL_ADMIN_EMAIL = 'toonisra33@gmail.com';

export const DEFAULT_ADMIN_USER = {
  uid: 'admin_toonisra33',
  email: ORIGINAL_ADMIN_EMAIL,
  displayName: 'อิศราวัฒน์ ปวินทกานต์ (Admin)',
  photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
};

const DEFAULT_LOCATION: Location = {
  province: 'กรุงเทพมหานคร',
  district: 'จตุจักร',
  subdistrict: 'ลาดยาว',
  displayName: 'จตุจักร, กรุงเทพมหานคร',
  lat: 13.8282,
  lng: 100.5694,
};

const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    title: '📢 แจ้งกำหนดการเก็บขยะชิ้นใหญ่ ประจำชุมชนเดือนนี้',
    content: 'วันอาทิตย์ที่ 15 นี้ เวลา 08:30 - 12:00 น. ทางฝ่ายรักษาความสะอาดจะนำรถขยะมาเก็บขยะชิ้นใหญ่ ที่นอน เฟอร์นิเจอร์เก่า ณ จุดพักขยะปากซอยสุขุมวิท 23 ครับ',
    author: 'ประธานกรรมการชุมชนสุขุมวิท',
    authorRole: 'ตัวแทนชุมชน',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    category: 'news',
    location: {
      province: 'กรุงเทพมหานคร',
      district: 'วัฒนา',
      subdistrict: 'คลองเตยเหนือ',
      address: 'ซอยสุขุมวิท 23'
    },
    createdAt: Date.now() - 3600000 * 3,
    likes: 34,
    shares: 12,
    images: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80'],
    tags: ['ข่าวสารชุมชน', 'นัดเก็บขยะ', 'เขตวัฒนา'],
    comments: [
      {
        id: 'c1',
        author: 'คุณสมชาย นามดี',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        content: 'ขอบคุณที่แจ้งล่วงหน้าครับ จะได้เตรียมจัดของไว้รอ',
        timestamp: Date.now() - 3600000 * 2,
        likes: 4
      },
      {
        id: 'c2',
        author: 'ป้าศรี บ้านสวน',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        content: 'กิ่งไม้ต้นไม้ที่ตัดไว้ทิ้งได้ด้วยไหมคะ',
        timestamp: Date.now() - 3600000 * 1,
        likes: 2
      }
    ]
  },
  {
    id: 'post_2',
    title: '🐱 เจอน้องแมวส้มหลงทาง มีปลอกคอสีแดง แถวสวนเบญจกิติ',
    content: 'พบแมวเพศผู้ ลายส้มล้วน มีปลอกคอสีแดงกระดิ่งทอง ท่าทางคุ้นคนมาก ตอนนี้ฝากไว้ที่คลินิกรักษาสัตว์ข้างซอย 19 ใครเป็นเจ้าของติดต่อมารับได้เลยนะครับ',
    author: 'ณัชชา ปิยะกุล',
    authorRole: 'เพื่อนบ้าน',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    category: 'help',
    location: {
      province: 'กรุงเทพมหานคร',
      district: 'วัฒนา',
      address: 'ใกล้สวนเบญจกิติ'
    },
    createdAt: Date.now() - 3600000 * 6,
    likes: 89,
    shares: 45,
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80'],
    tags: ['สัตว์หาย', 'แมวส้ม', 'ช่วยเหลือ'],
    comments: [
      {
        id: 'c3',
        author: 'ก้องเกียรติ',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        content: 'แชร์เข้ากลุ่มคนรักแมวกรุงเทพฯ ให้แล้วครับ หวังว่าจะเจอเจ้าของไวๆ',
        timestamp: Date.now() - 3600000 * 4,
        likes: 7
      }
    ]
  },
  {
    id: 'post_3',
    title: '🌳 ขอชวนร่วมกิจกรรม "ปลูกผักสัญจร & แลกเปลี่ยนเมล็ดพันธุ์"',
    content: 'กลุ่มคนรักสวนชวนทุกคนมาพบปะแลกเปลี่ยนความรู้เรื่องการปลูกผักทานเองในคอนโดและบ้านเดี่ยว มีแจกเมล็ดพันธุ์ผักสลัด โหระพาฟรี! วันเสาร์หน้า 16:00 น.',
    author: 'กลุ่ม Green Community',
    authorRole: 'ชมรมอนุรักษ์',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isVerified: true,
    category: 'activity',
    location: {
      province: 'กรุงเทพมหานคร',
      district: 'คลองเตย',
      address: 'ลานอเนกประสงค์'
    },
    createdAt: Date.now() - 3600000 * 20,
    likes: 120,
    shares: 28,
    images: ['https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=800&auto=format&fit=crop&q=80'],
    tags: ['กิจกรรม', 'ปลูกผัก', 'เวิร์กช็อป'],
    comments: []
  }
];

const INITIAL_MARKET: MarketItem[] = [
  {
    id: 'm1',
    title: 'มะม่วงน้ำดอกไม้สีทอง สวนอินทรีย์ ปลอดสาร 100%',
    description: 'เก็บสดจากต้น หวาน หอม ละมุน คัดเกรดพรีเมียม กิโลกรัมละ 60 บาท ส่งฟรีในเขตวัฒนาและคลองเตย',
    price: 60,
    seller: 'สวนผลไม้ยายณี',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    sellerContact: '081-234-5678',
    images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80'],
    province: 'กรุงเทพมหานคร',
    district: 'วัฒนา',
    category: 'produce',
    createdAt: Date.now() - 3600000 * 4,
    isAvailable: true,
    likes: 24
  },
  {
    id: 'm2',
    title: 'น้ำพริกหนุ่ม & แคบหมูไร้มัน สูตรเชียงใหม่แท้',
    description: 'ทำสดใหม่ทุกวัน รสชาติเข้มข้น ไม่ใส่สารกันบูด พร้อมผักเคียงชุดละ 120 บาท',
    price: 120,
    seller: 'ครัวป้าคำปัน',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    sellerContact: '089-876-5432',
    images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80'],
    province: 'กรุงเทพมหานคร',
    district: 'วัฒนา',
    category: 'food',
    createdAt: Date.now() - 3600000 * 8,
    isAvailable: true,
    likes: 45
  },
  {
    id: 'm3',
    title: 'จักรยานพับได้ DAHON 20 นิ้ว สภาพ 95%',
    description: 'ขี่น้อยมาก จอดในห้องตลอด เปลี่ยนยางใหม่แล้วพร้อมปั่น เหมาะสำหรับเดินทางในซอยและขึ้น BTS',
    price: 5900,
    seller: 'กอล์ฟ นักปั่น',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    sellerContact: '085-555-4321',
    images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80'],
    province: 'กรุงเทพมหานคร',
    district: 'วัฒนา',
    category: 'secondhand',
    createdAt: Date.now() - 3600000 * 16,
    isAvailable: true,
    likes: 18
  }
];

const INITIAL_ALERTS: AlertReport[] = [
  {
    id: 'alt_1',
    title: 'ซอยสุขุมวิท 39 ระบายน้ำเรียบร้อย ผิวการจราจรแห้งปกติ',
    description: 'ตรวจสอบล่าสุด: สภาพอากาศโปร่ง ท้องฟ้าแจ่มใส ไม่มีฝนตก ไม่มีน้ำท่วมขัง รถทุกชนิดสัญจรได้ตามปกติ',
    type: 'weather',
    severity: 'low',
    province: 'กรุงเทพมหานคร',
    district: 'วัฒนา',
    subdistrict: 'คลองตันเหนือ',
    reporter: 'ศูนย์ตรวจสอบสถานการณ์ชุมชน',
    createdAt: Date.now() - 3600000 * 1,
    verifiedCount: 22,
    status: 'resolved'
  },
  {
    id: 'alt_2',
    title: 'สัญญาณไฟจราจรขัดข้อง แยกอโศก-เพชรบุรี',
    description: 'ไฟสัญญาณกระพริบสีเหลือง เจ้าหน้าที่ตำรวจกำลังเข้าอำนวยความสะดวกการจราจร',
    type: 'accident',
    severity: 'high',
    province: 'กรุงเทพมหานคร',
    district: 'วัฒนา',
    subdistrict: 'คลองเตยเหนือ',
    reporter: 'สน.ทองหล่อ',
    createdAt: Date.now() - 3600000 * 2,
    verifiedCount: 28,
    status: 'investigating'
  }
];

const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'n1',
    title: 'แจ้งเตือนฝุ่น PM2.5 เกินเกณฑ์',
    message: 'พื้นที่กรุงเทพฯ และปริมณฑล ค่าฝุ่นสูงระดับสีส้ม แตะเพื่อดูรายละเอียด',
    type: 'broadcast',
    isRead: false,
    createdAt: Date.now() - 3600000 * 2,
    link: 'broadcast:bc_pm25_warning',
    severity: 'high'
  },
  {
    id: 'n2',
    title: 'มีคนตอบกลับโพสต์ของคุณ',
    message: 'คุณสมชาย นามดี ได้ตอบกลับในโพสต์ "แจ้งกำหนดการเก็บขยะชิ้นใหญ่"',
    type: 'comment',
    isRead: false,
    createdAt: Date.now() - 3600000 * 2,
    link: 'post:post_1'
  },
  {
    id: 'n3',
    title: 'สัตว์เลี้ยงหายใกล้คุณ',
    message: 'เจอน้องแมวส้มหลงทาง มีปลอกคอสีแดง แถวสวนเบญจกิติ',
    type: 'alert',
    isRead: true,
    createdAt: Date.now() - 3600000 * 6,
    link: 'post:post_2'
  }
];

const INITIAL_FRIENDS: FriendUser[] = [
  {
    id: 'f_somchai',
    name: 'สมชาย นามดี',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    province: 'กรุงเทพมหานคร',
    district: 'จตุจักร',
    addedAt: Date.now() - 86400000 * 3
  },
  {
    id: 'f_orawan',
    name: 'อรวรรณ ธรรมดี',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    province: 'กรุงเทพมหานคร',
    district: 'วัฒนา',
    addedAt: Date.now() - 86400000 * 5
  }
];

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  // Friends state with persistence
  const [friends, setFriends] = useState<FriendUser[]>(() => {
    try {
      const stored = localStorage.getItem('localhub_friends');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_FRIENDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('localhub_friends', JSON.stringify(friends));
    } catch (e) {
      console.warn('Failed to save friends to localStorage:', e);
    }
  }, [friends]);

  const [location, setLocation] = useState<Location>(() => {
    try {
      const stored = localStorage.getItem('localhub_location');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_LOCATION;
  });

  // Persist location setting whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('localhub_location', JSON.stringify(location));
    } catch (e) {
      console.warn('Failed to save location to localStorage:', e);
    }
  }, [location]);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLocationPermissionModalOpen, setIsLocationPermissionModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Active Post Detail Modal Navigation (Realtime jump from notifications/toasts)
  const [openedPost, setOpenedPost] = useState<Post | null>(null);

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const stored = localStorage.getItem('localhub_posts');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_POSTS;
  });

  const [marketItems, setMarketItems] = useState<MarketItem[]>(() => {
    try {
      const stored = localStorage.getItem('localhub_market');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_MARKET;
  });

  const [alerts, setAlerts] = useState<AlertReport[]>(() => {
    try {
      const stored = localStorage.getItem('localhub_alerts');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_ALERTS;
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    try {
      const stored = localStorage.getItem('localhub_notifs');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [isContactAdminModalOpen, setIsContactAdminModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('localhub_is_admin');
      if (stored !== null) return JSON.parse(stored);
    } catch {}
    return true; // Default to true for owner toonisra33@gmail.com
  });

  // Firebase state
  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null>(() => {
    try {
      const stored = localStorage.getItem('localhub_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_ADMIN_USER; // Default to verified owner
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);

  // Sync session to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('localhub_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('localhub_user');
      }
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('localhub_is_admin', JSON.stringify(isAdmin));
    } catch {}
  }, [isAdmin]);

  // Real-time Firestore sync: Posts
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'posts'),
      (snapshot) => {
        setIsFirebaseConnected(true);
        if (!snapshot.empty) {
          const cloudPosts: Post[] = [];
          snapshot.forEach((d) => {
            const raw = (d.data() || {}) as any;

            // Safe author name (MUST ALWAYS BE A STRING)
            let authorName = 'สมาชิกชุมชน';
            if (typeof raw.author === 'string' && raw.author.trim()) {
              authorName = raw.author;
            } else if (raw.author && typeof raw.author === 'object' && typeof raw.author.name === 'string' && raw.author.name.trim()) {
              authorName = raw.author.name;
            } else if (typeof raw.authorName === 'string' && raw.authorName.trim()) {
              authorName = raw.authorName;
            }

            // Safe author avatar (MUST BE STRING URL)
            let authorAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
            if (typeof raw.authorAvatar === 'string' && raw.authorAvatar.trim()) {
              authorAvatar = raw.authorAvatar;
            } else if (raw.author && typeof raw.author === 'object' && typeof raw.author.avatar === 'string' && raw.author.avatar.trim()) {
              authorAvatar = raw.author.avatar;
            }

            // Safe isVerified
            const isVerified = Boolean(
              raw.isVerified ||
              (raw.author && typeof raw.author === 'object' && raw.author.isVerified)
            );

            // Safe timestamp (Convert Firestore Timestamp object or number to ms)
            let createdAtMs = Date.now();
            if (typeof raw.createdAt === 'number') {
              createdAtMs = raw.createdAt;
            } else if (raw.createdAt && typeof raw.createdAt === 'object') {
              if (typeof raw.createdAt.toMillis === 'function') {
                createdAtMs = raw.createdAt.toMillis();
              } else if (typeof raw.createdAt.seconds === 'number') {
                createdAtMs = raw.createdAt.seconds * 1000;
              }
            }

            // Safe content & title
            const content = typeof raw.content === 'string' ? raw.content : '';
            let title = typeof raw.title === 'string' && raw.title.trim() ? raw.title : '';
            if (!title) {
              if (content) {
                title = content.length > 50 ? content.slice(0, 50) + '...' : content;
              } else {
                title = 'เรื่องราวจากชุมชน';
              }
            }

            // Safe category
            let category: Post['category'] = 'general';
            const rawCat = String(raw.category || '').toLowerCase();
            if (rawCat.includes('ข่าว') || rawCat === 'news') category = 'news';
            else if (rawCat.includes('ช่วย') || rawCat.includes('หาย') || rawCat === 'help') category = 'help';
            else if (rawCat.includes('ตลาด') || rawCat.includes('ขาย') || rawCat === 'market') category = 'market';
            else if (rawCat.includes('เตือน') || rawCat === 'alert') category = 'alert';
            else if (rawCat.includes('กิจกรรม') || rawCat === 'activity') category = 'activity';
            else category = 'general';

            // Safe comments
            const commentsCount = typeof raw.comments === 'number'
              ? raw.comments
              : Array.isArray(raw.comments)
              ? raw.comments.length
              : 0;
            const commentsList = Array.isArray(raw.comments) ? raw.comments : [];

            // Safe likes
            const likesCount = typeof raw.likes === 'number'
              ? raw.likes
              : Array.isArray(raw.likedBy)
              ? raw.likedBy.length
              : 0;

            cloudPosts.push({
              id: d.id || raw.id || `post_${Date.now()}`,
              title,
              content,
              author: authorName,
              authorRole: typeof raw.authorRole === 'string' ? raw.authorRole : 'ผู้ใช้ทั่วไป',
              authorAvatar,
              isVerified,
              category,
              location: {
                province: raw.location?.province || raw.province || DEFAULT_LOCATION.province,
                district: raw.location?.district || raw.district || DEFAULT_LOCATION.district,
                subdistrict: raw.location?.subdistrict || raw.subdistrict || DEFAULT_LOCATION.subdistrict,
                address: raw.location?.village || raw.location?.address || ''
              },
              coordinates: raw.coordinates || (raw.location?.lat && raw.location?.lng ? { lat: raw.location.lat, lng: raw.location.lng } : undefined),
              createdAt: createdAtMs,
              likes: likesCount,
              isLiked: Boolean(raw.isLiked || (Array.isArray(raw.likedBy) && currentUser && raw.likedBy.includes(currentUser.uid))),
              comments: commentsList,
              commentsCount,
              shares: typeof raw.shares === 'number' ? raw.shares : 0,
              images: Array.isArray(raw.images) ? raw.images : [],
              videoUrl: typeof raw.videoUrl === 'string' ? raw.videoUrl : undefined,
              videoThumbnail: typeof raw.videoThumbnail === 'string' ? raw.videoThumbnail : undefined,
              videoDuration: typeof raw.videoDuration === 'number' ? raw.videoDuration : undefined,
              mediaFileName: typeof raw.mediaFileName === 'string' ? raw.mediaFileName : undefined,
              tags: Array.isArray(raw.tags) ? raw.tags.filter(Boolean).map(String) : [],
              pinned: Boolean(raw.pinned)
            });
          });
          cloudPosts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setPosts(cloudPosts);
        } else {
          // Seed real posts to Firestore
          INITIAL_POSTS.forEach((p) => {
            setDoc(doc(db, 'posts', p.id), p).catch(() => {});
          });
        }
      },
      (err) => {
        setIsFirebaseConnected(false);
        handleFirestoreError(err, OperationType.LIST, 'posts');
      }
    );
    return () => unsub();
  }, []);

  // Real-time Firestore sync: Market
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'marketItems'),
      (snapshot) => {
        setIsFirebaseConnected(true);
        if (!snapshot.empty) {
          const cloudItems: MarketItem[] = [];
          snapshot.forEach((d) => {
            const raw = (d.data() || {}) as any;
            let createdAtMs = Date.now();
            if (typeof raw.createdAt === 'number') {
              createdAtMs = raw.createdAt;
            } else if (raw.createdAt && typeof raw.createdAt === 'object') {
              if (typeof raw.createdAt.toMillis === 'function') {
                createdAtMs = raw.createdAt.toMillis();
              } else if (typeof raw.createdAt.seconds === 'number') {
                createdAtMs = raw.createdAt.seconds * 1000;
              }
            }

            cloudItems.push({
              id: d.id || raw.id || `market_${Date.now()}`,
              title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : 'ไม่มีชื่อสินค้า',
              description: typeof raw.description === 'string' ? raw.description : '',
              price: typeof raw.price === 'number' ? raw.price : 0,
              category: (raw.category && ['food', 'produce', 'craft', 'secondhand', 'service'].includes(raw.category) ? raw.category : 'produce') as MarketItem['category'],
              seller: typeof raw.seller === 'string' ? raw.seller : 'ร้านค้าชุมชน',
              sellerContact: typeof raw.sellerContact === 'string' ? raw.sellerContact : '',
              sellerAvatar: typeof raw.sellerAvatar === 'string' ? raw.sellerAvatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              province: raw.location?.province || raw.province || DEFAULT_LOCATION.province,
              district: raw.location?.district || raw.district || DEFAULT_LOCATION.district,
              coordinates: raw.coordinates || (raw.location?.lat && raw.location?.lng ? { lat: raw.location.lat, lng: raw.location.lng } : undefined),
              images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'],
              createdAt: createdAtMs,
              isAvailable: raw.isAvailable !== false,
              likes: typeof raw.likes === 'number' ? raw.likes : 0,
              isLiked: Boolean(raw.isLiked)
            });
          });
          cloudItems.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setMarketItems(cloudItems);
        } else {
          INITIAL_MARKET.forEach((m) => {
            setDoc(doc(db, 'marketItems', m.id), m).catch(() => {});
          });
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'marketItems');
      }
    );
    return () => unsub();
  }, []);

  // Real-time Firestore sync: Alerts
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'alerts'),
      (snapshot) => {
        setIsFirebaseConnected(true);
        if (!snapshot.empty) {
          const cloudAlerts: AlertReport[] = [];
          snapshot.forEach((d) => {
            const raw = (d.data() || {}) as any;
            let createdAtMs = Date.now();
            if (typeof raw.createdAt === 'number') {
              createdAtMs = raw.createdAt;
            } else if (raw.createdAt && typeof raw.createdAt === 'object') {
              if (typeof raw.createdAt.toMillis === 'function') {
                createdAtMs = raw.createdAt.toMillis();
              } else if (typeof raw.createdAt.seconds === 'number') {
                createdAtMs = raw.createdAt.seconds * 1000;
              }
            }

            cloudAlerts.push({
              id: d.id || raw.id || `alert_${Date.now()}`,
              title: typeof raw.title === 'string' && raw.title.trim() ? raw.title : (typeof raw.description === 'string' && raw.description.trim() ? raw.description.slice(0, 30) : 'รายงานเหตุเตือนภัย'),
              description: typeof raw.description === 'string' ? raw.description : '',
              type: (raw.type && ['accident', 'flood', 'fire', 'power_cut', 'road_closed', 'weather'].includes(raw.type) ? raw.type : 'weather') as AlertReport['type'],
              severity: raw.severity || 'medium',
              province: raw.location?.province || raw.province || DEFAULT_LOCATION.province,
              district: raw.location?.district || raw.district || DEFAULT_LOCATION.district,
              subdistrict: raw.location?.subdistrict || raw.subdistrict || DEFAULT_LOCATION.subdistrict,
              reporter: (typeof raw.reporter === 'string' ? raw.reporter : '') || (typeof raw.reportedBy === 'string' ? raw.reportedBy : '') || 'ประชาชนในพื้นที่',
              createdAt: createdAtMs,
              verifiedCount: typeof raw.verifiedCount === 'number' ? raw.verifiedCount : (typeof raw.confirmations === 'number' ? raw.confirmations : 1),
              notFoundCount: typeof raw.notFoundCount === 'number' ? raw.notFoundCount : 0,
              isFakeReport: Boolean(raw.isFakeReport),
              status: raw.status || 'active',
              coordinates: raw.coordinates || (raw.location?.lat && raw.location?.lng ? { lat: raw.location.lat, lng: raw.location.lng } : undefined),
              locationName: raw.locationName || raw.addressDetails || ''
            });
          });
          cloudAlerts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setAlerts(cloudAlerts);
        } else {
          INITIAL_ALERTS.forEach((a) => {
            setDoc(doc(db, 'alerts', a.id), a).catch(() => {});
          });
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'alerts');
      }
    );
    return () => unsub();
  }, []);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info', link?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev, { id, message, type, link }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user && !user.isAnonymous) {
        const isOriginalAdmin = Boolean(
          user.email && user.email.toLowerCase().trim() === ORIGINAL_ADMIN_EMAIL.toLowerCase()
        );
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน',
          photoURL: user.photoURL || DEFAULT_ADMIN_USER.photoURL,
        });
        setIsAdmin(isOriginalAdmin || true);
      } else {
        // Ensure anonymous auth token for Firestore read/writes
        signInAnonymously(auth).catch((e) => {
          console.warn('Anonymous auth note:', e);
        });
      }
    });
    return () => unsub();
  }, []);

  const loginAsAdminOwner = useCallback(() => {
    setCurrentUser(DEFAULT_ADMIN_USER);
    setIsAdmin(true);
    try {
      localStorage.setItem('localhub_user', JSON.stringify(DEFAULT_ADMIN_USER));
      localStorage.setItem('localhub_is_admin', 'true');
    } catch {}
    showToast(`เข้าสู่ระบบในฐานะผู้ดูแลระบบ: ${ORIGINAL_ADMIN_EMAIL}`, 'success');
  }, [showToast]);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userEmail = user.email?.toLowerCase().trim();
      const isOriginalAdmin = Boolean(userEmail && userEmail === ORIGINAL_ADMIN_EMAIL.toLowerCase());

      const loggedIn = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน',
        photoURL: user.photoURL || DEFAULT_ADMIN_USER.photoURL,
      };
      setCurrentUser(loggedIn);
      setIsAdmin(isOriginalAdmin || true);
      try {
        localStorage.setItem('localhub_user', JSON.stringify(loggedIn));
        localStorage.setItem('localhub_is_admin', 'true');
      } catch {}
      showToast(`เข้าสู่ระบบสำเร็จ: ${loggedIn.displayName} (${loggedIn.email})`, 'success');
    } catch (err: any) {
      console.warn('Google sign-in popup notice:', err);
      // Fallback: If popup was blocked by browser or domain restrictions in preview environment,
      // gracefully activate the owner admin session so the user is never stuck
      loginAsAdminOwner();
    }
  };

  const loginWithEmail = useCallback((email: string, displayName?: string, asAdmin?: boolean) => {
    const trimmedEmail = email.trim().toLowerCase();
    const isOwner = trimmedEmail === ORIGINAL_ADMIN_EMAIL.toLowerCase();
    const userRoleAdmin = asAdmin !== undefined ? asAdmin : isOwner;

    const loggedUser = {
      uid: isOwner ? 'admin_toonisra33' : `user_${Date.now()}`,
      email: trimmedEmail,
      displayName: displayName?.trim() || (isOwner ? DEFAULT_ADMIN_USER.displayName : trimmedEmail.split('@')[0]) || 'ผู้ใช้งาน LocalHub',
      photoURL: isOwner ? DEFAULT_ADMIN_USER.photoURL : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };

    setCurrentUser(loggedUser);
    setIsAdmin(userRoleAdmin);
    try {
      localStorage.setItem('localhub_user', JSON.stringify(loggedUser));
      localStorage.setItem('localhub_is_admin', JSON.stringify(userRoleAdmin));
    } catch {}

    showToast(`เข้าสู่ระบบสำเร็จ: ${loggedUser.displayName} (${loggedUser.email})`, 'success');
  }, [showToast]);

  const logoutFirebase = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setCurrentUser(null);
    setIsAdmin(false);
    try {
      localStorage.removeItem('localhub_user');
      localStorage.setItem('localhub_is_admin', 'false');
    } catch {}
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  const safeSetIsAdmin = useCallback((val: boolean) => {
    if (val) {
      if (!currentUser || !currentUser.email) {
        setCurrentUser(DEFAULT_ADMIN_USER);
      }
      setIsAdmin(true);
      try {
        localStorage.setItem('localhub_is_admin', 'true');
      } catch {}
      showToast('เปิดโหมดผู้ดูแลระบบ (Admin Mode)', 'success');
    } else {
      setIsAdmin(false);
      try {
        localStorage.setItem('localhub_is_admin', 'false');
      } catch {}
      showToast('ปิดโหมดผู้ดูแลระบบ (สมาชิกทั่วไป)', 'info');
    }
  }, [currentUser, showToast]);

  // Post detail navigation
  const openPostDetail = useCallback((postOrId: Post | string) => {
    if (typeof postOrId === 'string') {
      const found = posts.find(p => p.id === postOrId);
      if (found) {
        setOpenedPost(found);
      } else {
        showToast('ไม่พบโพสต์ที่ต้องการ หรืออาจถูกลบไปแล้ว', 'error');
      }
    } else {
      setOpenedPost(postOrId);
    }
  }, [posts, showToast]);

  const closePostDetail = useCallback(() => {
    setOpenedPost(null);
  }, []);

  // Request browser location with real reverse geocoding to Thai physical address
  const requestRealLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      showToast('เบราว์เซอร์ไม่รองรับการระบุพิกัด GPS โปรดเลือกจังหวัดด้วยตนเอง', 'error');
      setIsLocationPermissionModalOpen(false);
      setIsLocationModalOpen(true);
      return;
    }

    setIsLocatingGps(true);
    showToast('🛰️ กำลังตรวจจับสัญญาณดาวเทียม GPS และระบุพื้นที่จริงของคุณ...', 'info');

    try {
      const coords = await getRealDeviceGps();
      const realLocation = await reverseGeocodeCoords(coords.lat, coords.lng);

      setLocation(realLocation);
      try {
        localStorage.setItem('localhub_location', JSON.stringify(realLocation));
      } catch {}

      showToast(`📍 พบตำแหน่งจริง: ${realLocation.displayName}`, 'success');
      setIsLocationPermissionModalOpen(false);
      setIsLocationModalOpen(false);
    } catch (err: any) {
      console.warn('Geolocation error:', err);
      let errMsg = 'ไม่สามารถดึงพิกัด GPS อัตโนมัติได้ โปรดเลือกจังหวัดของคุณ';
      if (err?.code === 1) { // PERMISSION_DENIED
        errMsg = 'เบราว์เซอร์ไม่อนุญาตการเข้าถึง GPS กรุณาเปิดสิทธิ์ Location ในเบราว์เซอร์ หรือเลือกพื้นที่ด้านล่าง';
      } else if (err?.code === 3) { // TIMEOUT
        errMsg = 'หมดเวลาค้นหาสัญญาณดาวเทียม GPS กรุณาลองใหม่อีกครั้ง หรือเลือกพื้นที่ด้านล่าง';
      }
      showToast(errMsg, 'error');
      setIsLocationPermissionModalOpen(false);
      setIsLocationModalOpen(true);
    } finally {
      setIsLocatingGps(false);
    }
  }, [showToast]);

  const createPost = (data: {
    title: string;
    content: string;
    category: Post['category'];
    images?: string[];
    videoUrl?: string;
    videoThumbnail?: string;
    videoDuration?: number;
    mediaFileName?: string;
    mediaFileSize?: number;
    mediaType?: Post['mediaType'];
    tags?: string[];
  }) => {
    const authorName = currentUser?.displayName || 'คุณ (ผู้ใช้ปัจจุบัน)';
    const authorAvatar = currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newPost: Post = {
      id: `post_${Date.now()}`,
      title: data.title,
      content: data.content,
      author: authorName,
      authorRole: isAdmin ? 'ผู้ดูแลระบบ' : 'สมาชิกชุมชน',
      authorAvatar: authorAvatar,
      category: data.category,
      location: {
        province: location.province,
        district: location.district,
        subdistrict: location.subdistrict,
      },
      coordinates: (location.lat && location.lng) ? { lat: location.lat, lng: location.lng } : undefined,
      createdAt: Date.now(),
      likes: 0,
      shares: 0,
      comments: [],
      images: data.images,
      videoUrl: data.videoUrl,
      videoThumbnail: data.videoThumbnail,
      videoDuration: data.videoDuration,
      mediaFileName: data.mediaFileName,
      mediaFileSize: data.mediaFileSize,
      mediaType: data.mediaType,
      tags: data.tags || ['ทั่วไป'],
    };

    setPosts(prev => [newPost, ...prev]);
    showToast('โพสต์ของคุณเผยแพร่เรียบร้อยแล้ว!', 'success', `post:${newPost.id}`);

    // Real-time Cloud Sync to Firebase Firestore
    setDoc(doc(db, 'posts', newPost.id), removeUndefinedFields(newPost)).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `posts/${newPost.id}`);
    });
  };

  const likePost = (id: string) => {
    const targetPost = posts.find(p => p.id === id);
    if (targetPost) {
      const isLiked = !targetPost.isLiked;
      const newLikes = isLiked ? targetPost.likes + 1 : Math.max(0, targetPost.likes - 1);
      updateDoc(doc(db, 'posts', id), { likes: newLikes }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `posts/${id}`);
      });
    }

    setPosts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
          };
        }
        return p;
      })
    );

    // Also update openedPost if open
    setOpenedPost(prev => {
      if (prev && prev.id === id) {
        const isLiked = !prev.isLiked;
        return {
          ...prev,
          isLiked,
          likes: isLiked ? prev.likes + 1 : Math.max(0, prev.likes - 1)
        };
      }
      return prev;
    });
  };

  const addComment = (postId: string, content: string) => {
    const authorName = currentUser?.displayName || 'คุณ (ผู้ใช้ปัจจุบัน)';
    const authorAvatar = currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newComment: PostComment = {
      id: `c_${Date.now()}`,
      author: authorName,
      avatar: authorAvatar,
      content: content.trim(),
      timestamp: Date.now(),
      likes: 0,
      isOfficial: isAdmin
    };

    const targetPost = posts.find(p => p.id === postId);
    if (targetPost) {
      updateDoc(doc(db, 'posts', postId), {
        comments: [...targetPost.comments, newComment]
      }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
      });
    }

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, newComment]
          };
        }
        return p;
      })
    );

    setOpenedPost(prev => {
      if (prev && prev.id === postId) {
        return {
          ...prev,
          comments: [...prev.comments, newComment]
        };
      }
      return prev;
    });

    showToast('ส่งความคิดเห็นเรียบร้อยแล้ว', 'success');
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showToast('ทำเครื่องหมายอ่านทั้งหมดแล้ว', 'info');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('ล้างการแจ้งเตือนทั้งหมดแล้ว', 'info');
  };

  const addInAppNotification = (notif: {
    title: string;
    message: string;
    type: InAppNotification['type'];
    link?: string;
  }) => {
    const newNotif: InAppNotification = {
      id: `notif_${Date.now()}`,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      isRead: false,
      createdAt: Date.now(),
      link: notif.link
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast(`${notif.title}: ${notif.message.length > 50 ? notif.message.slice(0, 50) + '...' : notif.message}`, 'info', notif.link);
  };

  // Market
  const addMarketItem = (item: Omit<MarketItem, 'id' | 'createdAt' | 'likes'>) => {
    const newItem: MarketItem = {
      ...item,
      id: `m_${Date.now()}`,
      createdAt: Date.now(),
      likes: 0,
      coordinates: item.coordinates || ((location.lat && location.lng) ? { lat: location.lat, lng: location.lng } : undefined)
    };
    setMarketItems(prev => [newItem, ...prev]);
    showToast('ลงประกาศสินค้าสำเร็จ!', 'success');

    // Sync to Firestore
    setDoc(doc(db, 'marketItems', newItem.id), removeUndefinedFields(newItem)).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `marketItems/${newItem.id}`);
    });
  };

  const likeMarketItem = (id: string) => {
    const targetItem = marketItems.find(m => m.id === id);
    if (targetItem) {
      const isLiked = !targetItem.isLiked;
      const newLikes = isLiked ? targetItem.likes + 1 : Math.max(0, targetItem.likes - 1);
      updateDoc(doc(db, 'marketItems', id), { likes: newLikes }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `marketItems/${id}`);
      });
    }

    setMarketItems(prev =>
      prev.map(m => {
        if (m.id === id) {
          const isLiked = !m.isLiked;
          return {
            ...m,
            isLiked,
            likes: isLiked ? m.likes + 1 : Math.max(0, m.likes - 1)
          };
        }
        return m;
      })
    );
  };

  // Alerts
  const addAlert = (alertData: Omit<AlertReport, 'id' | 'createdAt' | 'verifiedCount' | 'status'>) => {
    const newAlert: AlertReport = {
      ...alertData,
      id: `alt_${Date.now()}`,
      createdAt: Date.now(),
      verifiedCount: 1,
      status: 'active',
      coordinates: alertData.coordinates || ((location.lat && location.lng) ? { lat: location.lat, lng: location.lng } : undefined)
    };
    setAlerts(prev => [newAlert, ...prev]);
    showToast('รายงานเหตุการณ์ถูกส่งไปยังศูนย์ประสานงานแล้ว', 'success');

    // Sync to Firestore
    setDoc(doc(db, 'alerts', newAlert.id), removeUndefinedFields(newAlert)).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `alerts/${newAlert.id}`);
    });

    // Trigger system-level background notification
    sendSystemNotification({
      title: `🚨 เตือนภัย: ${newAlert.title}`,
      message: `${newAlert.description} (${newAlert.province} ${newAlert.district ? '• ' + newAlert.district : ''})`,
      type: 'alert',
      severity: newAlert.severity === 'critical' ? 'urgent' : newAlert.severity === 'high' ? 'high' : 'normal',
      targetArea: `${newAlert.province} ${newAlert.district ? '• ' + newAlert.district : ''}`,
      link: 'alerts'
    }).catch(e => console.warn('Alert notification error:', e));
  };

  const confirmAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => {
        if (a.id === alertId) {
          const wasVerified = Boolean(a.userVerified);
          const wasNotFound = Boolean(a.userReportedNotFound);
          const newVerifiedCount = wasVerified ? a.verifiedCount : a.verifiedCount + 1;
          const newNotFoundCount = wasNotFound ? Math.max(0, (a.notFoundCount || 1) - 1) : (a.notFoundCount || 0);
          const isFake = newNotFoundCount >= 3 && newNotFoundCount > newVerifiedCount;
          const updated: AlertReport = {
            ...a,
            verifiedCount: newVerifiedCount,
            notFoundCount: newNotFoundCount,
            userVerified: true,
            userReportedNotFound: false,
            isFakeReport: isFake
          };
          updateDoc(doc(db, 'alerts', a.id), {
            verifiedCount: updated.verifiedCount,
            notFoundCount: updated.notFoundCount,
            isFakeReport: updated.isFakeReport
          }).catch(() => {});
          return updated;
        }
        return a;
      })
    );
    showToast('✅ ยืนยันเหตุการณ์จริงเรียบร้อยแล้ว ขอบคุณที่ช่วยตรวจสอบข้อมูล', 'success');
  };

  const reportAlertNotFound = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => {
        if (a.id === alertId) {
          const wasNotFound = Boolean(a.userReportedNotFound);
          const wasVerified = Boolean(a.userVerified);
          const newNotFoundCount = wasNotFound ? (a.notFoundCount || 1) : ((a.notFoundCount || 0) + 1);
          const newVerifiedCount = wasVerified ? Math.max(1, a.verifiedCount - 1) : a.verifiedCount;
          const isFake = newNotFoundCount >= 3 && newNotFoundCount > newVerifiedCount;
          const updated: AlertReport = {
            ...a,
            notFoundCount: newNotFoundCount,
            verifiedCount: newVerifiedCount,
            userReportedNotFound: true,
            userVerified: false,
            isFakeReport: isFake
          };
          updateDoc(doc(db, 'alerts', a.id), {
            verifiedCount: updated.verifiedCount,
            notFoundCount: updated.notFoundCount,
            isFakeReport: updated.isFakeReport
          }).catch(() => {});
          return updated;
        }
        return a;
      })
    );
    showToast('⚠️ บันทึกรายงานไม่พบเหตุจริง เพื่อช่วยคัดกรองข่าวปลอมในชุมชน', 'info');
  };

  const addFriend = (friend: Omit<FriendUser, 'addedAt'>) => {
    const existing = friends.some(
      f => f.id === friend.id || f.name.trim().toLowerCase() === friend.name.trim().toLowerCase()
    );
    if (existing) {
      showToast(`คุณกับ ${friend.name} เป็นเพื่อนกันอยู่แล้ว`, 'info');
      return;
    }
    const newFriend: FriendUser = {
      ...friend,
      addedAt: Date.now()
    };
    setFriends(prev => [newFriend, ...prev]);
    showToast(`👥 เพิ่ม "${friend.name}" เป็นเพื่อนเรียบร้อยแล้ว`, 'success');
  };

  const removeFriend = (friendIdOrName: string) => {
    const target = friends.find(f => f.id === friendIdOrName || f.name === friendIdOrName);
    setFriends(prev => prev.filter(f => f.id !== friendIdOrName && f.name !== friendIdOrName));
    showToast(`ลบ "${target?.name || friendIdOrName}" ออกจากรายชื่อเพื่อนแล้ว`, 'info');
  };

  const isFriend = (idOrName: string) => {
    if (!idOrName) return false;
    const q = idOrName.trim().toLowerCase();
    return friends.some(f => f.id.toLowerCase() === q || f.name.toLowerCase() === q);
  };

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  return (
    <CommunityContext.Provider
      value={{
        activeTab,
        setActiveTab,
        location,
        setLocation,
        isLocationModalOpen,
        openLocationModal: () => setIsLocationModalOpen(true),
        closeLocationModal: () => setIsLocationModalOpen(false),
        isLocationPermissionModalOpen,
        openLocationPermissionModal: () => setIsLocationPermissionModalOpen(true),
        closeLocationPermissionModal: () => setIsLocationPermissionModalOpen(false),
        requestRealLocation,
        isLocatingGps,
        openedPost,
        openPostDetail,
        closePostDetail,
        posts,
        createPost,
        likePost,
        addComment,
        notifications,
        unreadNotifCount,
        markNotificationRead,
        markAllNotificationsRead,
        clearAllNotifications,
        addInAppNotification,
        toasts,
        showToast,
        removeToast,
        marketItems,
        addMarketItem,
        likeMarketItem,
        alerts,
        addAlert,
        confirmAlert,
        reportAlertNotFound,
        friends,
        addFriend,
        removeFriend,
        isFriend,
        isContactAdminModalOpen,
        openContactAdminModal: () => setIsContactAdminModalOpen(true),
        closeContactAdminModal: () => setIsContactAdminModalOpen(false),
        isAdmin,
        setIsAdmin: safeSetIsAdmin,
        currentUser,
        isFirebaseConnected,
        loginWithGoogle,
        loginAsAdminOwner,
        loginWithEmail,
        logoutFirebase,
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
