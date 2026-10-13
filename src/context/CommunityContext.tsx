import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Tab,
  Location,
  Post,
  PostComment,
  InAppNotification,
  MarketItem,
  AlertReport
} from '../types';
import { sendSystemNotification } from '../utils/notificationService';
import { findNearestThaiProvince } from '../data/thaiData';
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
  FirebaseUser
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
  logoutFirebase: () => Promise<void>;

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
  requestRealLocation: () => void;

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

  // Contact Admin
  isContactAdminModalOpen: boolean;
  openContactAdminModal: () => void;
  closeContactAdminModal: () => void;

  // Role
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

export const ORIGINAL_ADMIN_EMAIL = 'toonisra33@gmail.com';

const DEFAULT_LOCATION: Location = {
  province: 'กรุงเทพมหานคร',
  district: 'วัฒนา',
  subdistrict: 'คลองเตยเหนือ',
  displayName: 'กรุงเทพมหานคร / เขตวัฒนา',
  lat: 13.7438,
  lng: 100.5603,
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

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<Tab>('feed');

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
      localStorage.removeItem('localhub_is_admin');
    } catch {}
    return false; // Default false: Only original admin email (toonisra33@gmail.com) gets admin privileges
  });

  // Firebase state
  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);

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
              status: raw.status || 'active'
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

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user && !user.isAnonymous) {
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        const isOriginalAdmin = Boolean(
          user.email && user.email.toLowerCase().trim() === ORIGINAL_ADMIN_EMAIL.toLowerCase()
        );
        setIsAdmin(isOriginalAdmin);
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        // Automatically sign in anonymously so user has a valid UID for Firestore
        signInAnonymously(auth).catch((e) => {
          console.warn('Anonymous auth note:', e);
        });
      }
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email?.toLowerCase().trim();
      const isOriginalAdmin = Boolean(userEmail && userEmail === ORIGINAL_ADMIN_EMAIL.toLowerCase());
      setIsAdmin(isOriginalAdmin);
      if (isOriginalAdmin) {
        showToast(`ยินดีต้อนรับผู้ดูแลระบบส่วนกลาง: ${result.user.email}`, 'success');
      } else {
        showToast(`เข้าสู่ระบบสำเร็จ: ${result.user.displayName || result.user.email}`, 'success');
      }
    } catch (err) {
      console.warn('Google sign-in error:', err);
      showToast('ไม่สามารถเข้าสู่ระบบ Google ได้ในขณะนี้', 'error');
    }
  };

  const logoutFirebase = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
    } catch (err) {
      console.warn('Logout error:', err);
    }
  };

  const safeSetIsAdmin = useCallback((val: boolean) => {
    if (val) {
      if (currentUser?.email && currentUser.email.toLowerCase().trim() === ORIGINAL_ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
      } else {
        console.warn('Access denied: Only original admin (toonisra33@gmail.com) can hold admin privileges.');
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [currentUser]);

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

  // Request browser location with reverse geocoding to Thai province
  const requestRealLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('เบราว์เซอร์ไม่รองรับการระบุพิกัด GPS โปรดเลือกจังหวัดด้วยตนเอง', 'error');
      setIsLocationPermissionModalOpen(false);
      setIsLocationModalOpen(true);
      return;
    }

    showToast('กำลังค้นหาตำแหน่ง GPS ของคุณ...', 'info');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = findNearestThaiProvince(latitude, longitude);

        const newLoc: Location = {
          province: nearest.province,
          district: nearest.district,
          subdistrict: '',
          lat: latitude,
          lng: longitude,
          displayName: `${nearest.province} (GPS: ${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
        };

        setLocation(newLoc);
        try {
          localStorage.setItem('localhub_location', JSON.stringify(newLoc));
        } catch {}

        showToast(`อัปเดตพิกัด GPS: ${nearest.province} (${nearest.district}) เรียบร้อยแล้ว`, 'success');
        setIsLocationPermissionModalOpen(false);
        setIsLocationModalOpen(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        showToast('ไม่สามารถดึงพิกัด GPS อัตโนมัติได้ โปรดเลือกจังหวัดของคุณ', 'info');
        setIsLocationPermissionModalOpen(false);
        setIsLocationModalOpen(true);
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 30000 }
    );
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
    setDoc(doc(db, 'posts', newPost.id), newPost).catch(err => {
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
    };
    setMarketItems(prev => [newItem, ...prev]);
    showToast('ลงประกาศสินค้าสำเร็จ!', 'success');

    // Sync to Firestore
    setDoc(doc(db, 'marketItems', newItem.id), newItem).catch(err => {
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
    };
    setAlerts(prev => [newAlert, ...prev]);
    showToast('รายงานเหตุการณ์ถูกส่งไปยังศูนย์ประสานงานแล้ว', 'success');

    // Sync to Firestore
    setDoc(doc(db, 'alerts', newAlert.id), newAlert).catch(err => {
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
        isContactAdminModalOpen,
        openContactAdminModal: () => setIsContactAdminModalOpen(true),
        closeContactAdminModal: () => setIsContactAdminModalOpen(false),
        isAdmin,
        setIsAdmin: safeSetIsAdmin,
        currentUser,
        isFirebaseConnected,
        loginWithGoogle,
        logoutFirebase,
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
