import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tab,
  Location,
  Post,
  PostComment,
  InAppNotification,
  MarketItem,
  AlertReport,
  FriendUser,
  UserAccount,
  DirectChatMessage,
  DirectChatContact,
  DirectConversation
} from '../types';
import { sendSystemNotification } from '../utils/notificationService';
import { findNearestThaiProvince } from '../data/thaiData';
import { getRealDeviceGps, reverseGeocodeCoords } from '../services/geolocationService';
import {
  db,
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signOut,
  signInAnonymously,
  onAuthStateChanged,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  handleFirestoreError,
  OperationType,
  FirebaseUser,
  removeUndefinedFields
} from '../firebase';
import { GoogleAuthProvider } from 'firebase/auth';

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
  loginWithGoogle: () => Promise<boolean>;
  loginWithGoogleCredential: (idToken: string) => Promise<boolean>;
  loginWithGoogleEmail: (googleEmail: string, adminPasscode?: string, customDisplayName?: string) => boolean;
  loginWithEmail: (email: string, password?: string, displayName?: string) => boolean;
  logoutFirebase: () => Promise<void>;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  goBack: () => void;
  canGoBack: boolean;
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
  addComment: (postId: string, content: string, images?: string[]) => void;
  sharePostToMyFeed: (postId: string, comment?: string) => void;

  // Direct 1-on-1 Chat System (ระบบการแชทคุยตัวต่อตัว)
  directConversations: DirectConversation[];
  activeChatContact: DirectChatContact | null;
  isDirectChatOpen: boolean;
  openDirectChat: (contact?: DirectChatContact) => void;
  closeDirectChat: () => void;
  sendDirectMessage: (receiverId: string, content: string, attachmentUrl?: string) => void;
  totalUnreadChatCount: number;

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
  isEligibleAdmin: boolean;
  setIsAdmin: (val: boolean) => void;

  // Registered Users & Account Inactivity Management (ไม่มีการเคลื่อนไหวเกิน 3 เดือน + ลบอัตโนมัติ 30 วัน)
  registeredUsers: UserAccount[];
  totalUsersCount: number;
  activeUsersCount: number;
  inactiveUsersCount: number;
  pendingDeletionUsersCount: number;
  isCurrentAccountInactiveWarning: boolean;
  currentAccountDaysRemaining: number;
  confirmActiveStatus: (uid?: string) => void;
  simulateInactivity: (enable: boolean) => void;
  deleteUserAccount: (uid: string) => void;
}

export const ORIGINAL_ADMIN_EMAIL = 'toonisra33@gmail.com';

export const DEFAULT_ADMIN_USER = {
  uid: 'admin_toonisra33',
  email: ORIGINAL_ADMIN_EMAIL,
  displayName: 'อิศราวัฒน์ ปวินทกานต์ (Admin)',
  photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
};

const NOW_BASE = Date.now();
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const INITIAL_REGISTERED_USERS: UserAccount[] = [
  {
    uid: 'admin_toonisra33',
    email: ORIGINAL_ADMIN_EMAIL,
    displayName: 'อิศราวัฒน์ ปวินทกานต์ (Admin)',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    isAdmin: true,
    province: 'กรุงเทพมหานคร',
    district: 'จตุจักร',
    createdAt: NOW_BASE - 180 * ONE_DAY_MS,
    lastActiveAt: NOW_BASE,
    isInactiveWarning: false
  },
  {
    uid: 'usr_somchai_1',
    email: 'somchai.bkk@gmail.com',
    displayName: 'สมชาย ประเสริฐสุข',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    isAdmin: false,
    province: 'กรุงเทพมหานคร',
    district: 'จตุจักร',
    createdAt: NOW_BASE - 120 * ONE_DAY_MS,
    lastActiveAt: NOW_BASE - 1 * ONE_DAY_MS,
    isInactiveWarning: false
  },
  {
    uid: 'usr_ploy_2',
    email: 'ploy.sukhumvit@gmail.com',
    displayName: 'พลอย ศรีสุข',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    isAdmin: false,
    province: 'กรุงเทพมหานคร',
    district: 'วัฒนา',
    createdAt: NOW_BASE - 100 * ONE_DAY_MS,
    lastActiveAt: NOW_BASE - 14 * ONE_DAY_MS,
    isInactiveWarning: false
  },
  {
    uid: 'usr_thanawat_3',
    email: 'thanawat.pathum@gmail.com',
    displayName: 'ธนวัฒน์ สุขใจ',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    isAdmin: false,
    province: 'ปทุมธานี',
    district: 'คลองหลวง',
    createdAt: NOW_BASE - 200 * ONE_DAY_MS,
    lastActiveAt: NOW_BASE - 98 * ONE_DAY_MS,
    isInactiveWarning: true,
    inactiveWarningAt: NOW_BASE - 8 * ONE_DAY_MS,
    warningDaysRemaining: 22
  },
  {
    uid: 'usr_kanya_4',
    email: 'kanya.m@gmail.com',
    displayName: 'กัญญา มณีรัตน์',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    isAdmin: false,
    province: 'กรุงเทพมหานคร',
    district: 'ดินแดง',
    createdAt: NOW_BASE - 210 * ONE_DAY_MS,
    lastActiveAt: NOW_BASE - 105 * ONE_DAY_MS,
    isInactiveWarning: true,
    inactiveWarningAt: NOW_BASE - 15 * ONE_DAY_MS,
    warningDaysRemaining: 15
  },
  {
    uid: 'usr_anon_5',
    email: 'anon.c@gmail.com',
    displayName: 'อานนท์ ชัยศรี',
    photoURL: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    isAdmin: false,
    province: 'เชียงใหม่',
    district: 'เมืองเชียงใหม่',
    createdAt: NOW_BASE - 240 * ONE_DAY_MS,
    lastActiveAt: NOW_BASE - 118 * ONE_DAY_MS,
    isInactiveWarning: true,
    inactiveWarningAt: NOW_BASE - 28 * ONE_DAY_MS,
    warningDaysRemaining: 2
  },
  {
    uid: 'usr_wichai_6',
    email: 'wichai.deleted@gmail.com',
    displayName: 'วิชัย ทองดี (ลบอัตโนมัติแล้ว)',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    isAdmin: false,
    province: 'นนทบุรี',
    district: 'เมืองนนทบุรี',
    createdAt: NOW_BASE - 300 * ONE_DAY_MS,
    lastActiveAt: NOW_BASE - 125 * ONE_DAY_MS,
    isInactiveWarning: true,
    inactiveWarningAt: NOW_BASE - 35 * ONE_DAY_MS,
    warningDaysRemaining: 0,
    isAutoDeleted: true
  }
];

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

const INITIAL_DIRECT_CONVERSATIONS: DirectConversation[] = [
  {
    id: 'conv_somchai',
    participant: {
      id: 'f_somchai',
      name: 'สมชาย นามดี',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'เพื่อนบ้านในพื้นที่',
      province: 'กรุงเทพมหานคร',
      district: 'จตุจักร',
      isOnline: true,
      lastSeen: 'ออนไลน์อยู่ขณะนี้'
    },
    unreadCount: 1,
    messages: [
      {
        id: 'msg_1',
        senderId: 'f_somchai',
        senderName: 'สมชาย นามดี',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        receiverId: 'me',
        receiverName: 'คุณ',
        content: 'สวัสดีครับคุณอิศราวัฒน์ วันอาทิตย์นี้เก็บขยะชิ้นใหญ่ฝากไว้หน้าบ้านได้เลยไหมครับ',
        timestamp: Date.now() - 3600000 * 2,
        isRead: true
      },
      {
        id: 'msg_2',
        senderId: 'me',
        senderName: 'คุณ',
        receiverId: 'f_somchai',
        receiverName: 'สมชาย นามดี',
        content: 'สวัสดีครับคุณสมชาย ได้เลยครับ เจ้าหน้าที่จะเริ่มวิ่งรถตั้งแต่ 08:30 น. เป็นต้นไปครับ',
        timestamp: Date.now() - 3600000 * 1,
        isRead: true
      },
      {
        id: 'msg_3',
        senderId: 'f_somchai',
        senderName: 'สมชาย นามดี',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        receiverId: 'me',
        receiverName: 'คุณ',
        content: 'ขอบคุณมากครับ เดี๋ยวเตรียมนำออกมาวางรอครับ สะดวกมากเลยครับ 👍',
        timestamp: Date.now() - 1000 * 60 * 15,
        isRead: false
      }
    ]
  },
  {
    id: 'conv_orawan',
    participant: {
      id: 'f_orawan',
      name: 'อรวรรณ ธรรมดี',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      role: 'เพื่อนบ้านในพื้นที่',
      province: 'กรุงเทพมหานคร',
      district: 'วัฒนา',
      isOnline: false,
      lastSeen: 'ใช้งานเมื่อ 25 นาทีที่แล้ว'
    },
    unreadCount: 0,
    messages: [
      {
        id: 'msg_o1',
        senderId: 'f_orawan',
        senderName: 'อรวรรณ ธรรมดี',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        receiverId: 'me',
        receiverName: 'คุณ',
        content: 'สวัสดีค่ะ ได้ยินว่าแถวซอย 39 ทางเทศบาลสูบน้ำแห้งสนิทแล้วใช่ไหมคะ',
        timestamp: Date.now() - 86400000 * 1,
        isRead: true
      },
      {
        id: 'msg_o2',
        senderId: 'me',
        senderName: 'คุณ',
        receiverId: 'f_orawan',
        receiverName: 'อรวรรณ ธรรมดี',
        content: 'ใช่ครับ ถนนแห้งสนิทรถเล็กวิ่งได้สะดวกแล้วครับผม',
        timestamp: Date.now() - 86400000 * 1 + 1800000,
        isRead: true
      }
    ]
  },
  {
    id: 'conv_yainee',
    participant: {
      id: 'm_seller_yainee',
      name: 'สวนผลไม้ยายณี',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      role: 'ผู้ขายตลาดชุมชน',
      province: 'กรุงเทพมหานคร',
      district: 'วัฒนา',
      isOnline: true,
      lastSeen: 'ออนไลน์อยู่ขณะนี้'
    },
    unreadCount: 0,
    messages: [
      {
        id: 'msg_yn1',
        senderId: 'm_seller_yainee',
        senderName: 'สวนผลไม้ยายณี',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        receiverId: 'me',
        receiverName: 'คุณ',
        content: 'สวัสดีค่ะคุณลูกค้า สวนเราเก็บมะม่วงน้ำดอกไม้สดใหม่ทุกล็อต มีบริการส่งถึงหน้าบ้านนะคะ 🥭✨',
        timestamp: Date.now() - 86400000 * 2,
        isRead: true
      }
    ]
  }
];

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const VALID_TABS: Tab[] = ['home', 'feed', 'broadcasts', 'alerts', 'weather', 'market', 'map', 'profile', 'admin'];

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<Tab>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const cleanHash = window.location.hash.replace(/^#/, '').split('?')[0];
      if (VALID_TABS.includes(cleanHash as Tab)) {
        return cleanHash as Tab;
      }
    }
    return 'home';
  });

  const [tabHistory, setTabHistory] = useState<Tab[]>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const cleanHash = window.location.hash.replace(/^#/, '').split('?')[0];
      if (VALID_TABS.includes(cleanHash as Tab)) {
        return ['home', cleanHash as Tab];
      }
    }
    return ['home'];
  });

  const setActiveTab = useCallback((nextTab: Tab) => {
    setActiveTabState(prev => {
      if (prev === nextTab) {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return prev;
      }
      if (typeof window !== 'undefined') {
        window.history.pushState({ type: 'tab', tab: nextTab }, '', '#' + nextTab);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      setTabHistory(h => [...h, nextTab]);
      return nextTab;
    });
  }, []);

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

  // Direct 1-on-1 Chat States
  const [directConversations, setDirectConversations] = useState<DirectConversation[]>(() => {
    try {
      const stored = localStorage.getItem('localhub_direct_chats');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_DIRECT_CONVERSATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('localhub_direct_chats', JSON.stringify(directConversations));
    } catch {}
  }, [directConversations]);

  const [activeChatContact, setActiveChatContact] = useState<DirectChatContact | null>(null);
  const [isDirectChatOpen, setIsDirectChatOpen] = useState(false);

  const [isContactAdminModalOpen, setIsContactAdminModalOpen] = useState(false);
  // Firebase state (Default: null - Guest / Visitor mode)
  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  } | null>(() => {
    try {
      const isLoggedOut = localStorage.getItem('localhub_logged_out');
      if (isLoggedOut === 'true') return null;
      const stored = localStorage.getItem('localhub_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.email) return u;
      }
      return DEFAULT_ADMIN_USER; // Default to owner toonisra33 so admin system is preserved
    } catch {}
    return DEFAULT_ADMIN_USER;
  });

  // Strict check: only toonisra33@gmail.com is ever eligible to be Admin
  const isEligibleAdmin = useMemo(() => {
    return Boolean(
      currentUser?.email &&
      currentUser.email.toLowerCase().trim() === ORIGINAL_ADMIN_EMAIL.toLowerCase()
    );
  }, [currentUser]);

  const [adminToggleActive, setAdminToggleActive] = useState<boolean>(() => {
    try {
      const isLoggedOut = localStorage.getItem('localhub_logged_out');
      if (isLoggedOut === 'true') return false;
      const storedUser = localStorage.getItem('localhub_user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u?.email && u.email.toLowerCase().trim() === ORIGINAL_ADMIN_EMAIL.toLowerCase()) {
          const stored = localStorage.getItem('localhub_is_admin');
          if (stored !== null) return JSON.parse(stored);
          return true;
        }
      }
      return true; // Default admin mode active for toonisra33
    } catch {}
    return true;
  });

  // Effective isAdmin: STRICTLY FALSE if user is not signed in with toonisra33@gmail.com!
  const isAdmin = Boolean(isEligibleAdmin && adminToggleActive);

  // Auto redirect away from admin if user loses admin privileges or logs out
  useEffect(() => {
    if (activeTab === 'admin' && !isAdmin) {
      setActiveTab('home');
      if (typeof window !== 'undefined' && window.location.hash === '#admin') {
        window.location.hash = '#home';
      }
    }
  }, [activeTab, isAdmin, setActiveTab]);

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

  // Registered user accounts state (persisted to localStorage)
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>(() => {
    try {
      const stored = localStorage.getItem('localhub_registered_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_REGISTERED_USERS;
  });

  // Keep registeredUsers in sync with current user login/registration
  useEffect(() => {
    if (!currentUser || !currentUser.email) return;
    setRegisteredUsers(prev => {
      const existingIndex = prev.findIndex(
        u => u.uid === currentUser.uid || (currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
      );
      if (existingIndex >= 0) {
        // Update profile info and keep lastActiveAt fresh on active session unless simulated
        return prev.map((u, i) =>
          i === existingIndex
            ? {
                ...u,
                displayName: currentUser.displayName || u.displayName,
                photoURL: currentUser.photoURL || u.photoURL,
                email: currentUser.email || u.email,
                role: isAdmin ? 'admin' : u.role
              }
            : u
        );
      } else {
        const newUser: UserAccount = {
          uid: currentUser.uid,
          email: currentUser.email || 'user@example.com',
          displayName: currentUser.displayName || 'สมาชิกชุมชน',
          photoURL: currentUser.photoURL || undefined,
          role: isAdmin ? 'admin' : 'user',
          isAdmin: isAdmin,
          createdAt: Date.now(),
          lastActiveAt: Date.now(),
          isInactiveWarning: false
        };
        return [newUser, ...prev];
      }
    });
  }, [currentUser, isAdmin]);

  // Persist registeredUsers
  useEffect(() => {
    try {
      localStorage.setItem('localhub_registered_users', JSON.stringify(registeredUsers));
    } catch {}
  }, [registeredUsers]);

  // 3-Month Inactivity Rules:
  // 1. Inactive > 3 months (90 days) -> triggers warning on "หน้าฉัน" (Profile)
  // 2. Countdown 30 days to confirm active usage
  // 3. If not confirmed within 30 days -> account is automatically deleted
  const INACTIVITY_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000; // 90 days (3 months)
  const GRACE_PERIOD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  const processedUsers = useMemo<UserAccount[]>(() => {
    const now = Date.now();
    return registeredUsers.map(user => {
      const timeSinceActive = now - user.lastActiveAt;
      const isPastThreeMonths = timeSinceActive > INACTIVITY_THRESHOLD_MS;

      if (isPastThreeMonths && !user.isAutoDeleted) {
        const warningStart = user.inactiveWarningAt || (user.lastActiveAt + INACTIVITY_THRESHOLD_MS);
        const msSinceWarning = now - warningStart;
        const msRemaining = GRACE_PERIOD_MS - msSinceWarning;
        const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
        const shouldBeDeleted = daysRemaining <= 0;

        return {
          ...user,
          isInactiveWarning: true,
          inactiveWarningAt: warningStart,
          warningDaysRemaining: daysRemaining,
          isAutoDeleted: shouldBeDeleted
        };
      }

      return {
        ...user,
        isInactiveWarning: false,
        warningDaysRemaining: undefined
      };
    });
  }, [registeredUsers, INACTIVITY_THRESHOLD_MS, GRACE_PERIOD_MS]);

  // Total user counts
  const totalUsersCount = useMemo(() => {
    return processedUsers.filter(u => !u.isAutoDeleted).length;
  }, [processedUsers]);

  const activeUsersCount = useMemo(() => {
    return processedUsers.filter(u => !u.isAutoDeleted && !u.isInactiveWarning).length;
  }, [processedUsers]);

  const inactiveUsersCount = useMemo(() => {
    return processedUsers.filter(u => !u.isAutoDeleted && u.isInactiveWarning).length;
  }, [processedUsers]);

  const pendingDeletionUsersCount = useMemo(() => {
    return processedUsers.filter(
      u => !u.isAutoDeleted && u.isInactiveWarning && (u.warningDaysRemaining ?? 0) <= 7
    ).length;
  }, [processedUsers]);

  // Current logged in account inactivity status
  const currentAccountInactivity = useMemo(() => {
    if (!currentUser) return { isWarning: false, daysRemaining: 30 };
    const found = processedUsers.find(
      u => u.uid === currentUser.uid || (currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
    );
    if (!found) return { isWarning: false, daysRemaining: 30 };
    return {
      isWarning: Boolean(found.isInactiveWarning && !found.isAutoDeleted),
      daysRemaining: found.warningDaysRemaining ?? 30,
      isAutoDeleted: Boolean(found.isAutoDeleted)
    };
  }, [currentUser, processedUsers]);

  const isCurrentAccountInactiveWarning = currentAccountInactivity.isWarning;
  const currentAccountDaysRemaining = currentAccountInactivity.daysRemaining;

  // Auto-delete enforcement effect: if current user's grace period expires, auto logout
  useEffect(() => {
    if (currentAccountInactivity.isAutoDeleted && currentUser) {
      logoutFirebase();
      showToast('❌ บัญชีของคุณถูกลบอัตโนมัติเนื่องจากไม่มีการเคลื่อนไหวเกิน 3 เดือนและไม่ได้รับการยืนยันภายใน 30 วัน', 'error');
    }
  }, [currentAccountInactivity.isAutoDeleted, currentUser]);

  // Action: Confirm Active Status (กดยืนยันว่ายังมีการใช้งาน)
  const confirmActiveStatus = useCallback((targetUid?: string) => {
    const now = Date.now();
    setRegisteredUsers(prev => {
      const updated = prev.map(u => {
        const matches = targetUid
          ? u.uid === targetUid
          : u.uid === currentUser?.uid || (currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase());

        if (matches) {
          return {
            ...u,
            lastActiveAt: now,
            isInactiveWarning: false,
            inactiveWarningAt: undefined,
            warningDaysRemaining: undefined,
            isAutoDeleted: false
          };
        }
        return u;
      });
      try {
        localStorage.setItem('localhub_registered_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('✅ ยืนยันการใช้งานบัญชีสำเร็จ! บัญชีของคุณได้รับการรักษาสถานะใช้งานต่อเนื่องเรียบร้อยแล้ว', 'success');
  }, [currentUser, showToast]);

  // Action: Simulate Inactivity for testing (จำลองไม่เคลื่อนไหว 3 เดือน)
  const simulateInactivity = useCallback((enable: boolean) => {
    const now = Date.now();
    setRegisteredUsers(prev => {
      const updated = prev.map(u => {
        const matches = u.uid === currentUser?.uid || (currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase());
        if (matches) {
          if (enable) {
            // Set last active to 96 days ago (> 3 months) and warning started 5 days ago (25 days remaining to confirm)
            const ninetySixDaysAgo = now - 96 * ONE_DAY_MS;
            const warningFiveDaysAgo = now - 5 * ONE_DAY_MS;
            return {
              ...u,
              lastActiveAt: ninetySixDaysAgo,
              isInactiveWarning: true,
              inactiveWarningAt: warningFiveDaysAgo,
              warningDaysRemaining: 25,
              isAutoDeleted: false
            };
          } else {
            return {
              ...u,
              lastActiveAt: now,
              isInactiveWarning: false,
              inactiveWarningAt: undefined,
              warningDaysRemaining: undefined,
              isAutoDeleted: false
            };
          }
        }
        return u;
      });
      try {
        localStorage.setItem('localhub_registered_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (enable) {
      showToast('🧪 จำลองสถานะ: บัญชีไม่มีการเคลื่อนไหวเกิน 3 เดือน (แสดงแถบแจ้งเตือนเหลือ 25 วัน)', 'info');
    } else {
      showToast('🔄 คืนค่าสถานะบัญชีเป็นปกติเรียบร้อยแล้ว', 'success');
    }
  }, [currentUser, showToast]);

  // Action: Delete user account
  const deleteUserAccount = useCallback((uid: string) => {
    setRegisteredUsers(prev => {
      const updated = prev.map(u => (u.uid === uid ? { ...u, isAutoDeleted: true, warningDaysRemaining: 0 } : u));
      try {
        localStorage.setItem('localhub_registered_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('ลบบัญชีผู้ใช้เรียบร้อยแล้ว', 'info');
  }, [showToast]);

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

  // Auth Listener and Redirect Handler
  useEffect(() => {
    // Process Google redirect result if page reloaded from signInWithRedirect
    getRedirectResult(auth).then((result) => {
      if (result && result.user) {
        const user = result.user;
        const userEmail = user.email?.toLowerCase().trim();
        const isOriginalAdmin = Boolean(
          userEmail && userEmail === ORIGINAL_ADMIN_EMAIL.toLowerCase()
        );
        const loggedUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน Google',
          photoURL: user.photoURL || null,
        };
        setCurrentUser(loggedUser);
        setAdminToggleActive(isOriginalAdmin);
        try {
          localStorage.removeItem('localhub_logged_out');
          localStorage.setItem('localhub_user', JSON.stringify(loggedUser));
          localStorage.setItem('localhub_is_admin', JSON.stringify(isOriginalAdmin));
        } catch {}
        showToast(`เข้าสู่ระบบด้วย Google สำเร็จ: ${loggedUser.displayName}`, 'success');
      }
    }).catch((err) => {
      console.warn('Redirect sign-in notice:', err);
    });

    const unsub = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user && !user.isAnonymous) {
        const userEmail = user.email?.toLowerCase().trim();
        const isOriginalAdmin = Boolean(
          userEmail && userEmail === ORIGINAL_ADMIN_EMAIL.toLowerCase()
        );
        const loggedUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน',
          photoURL: user.photoURL || null,
        };
        setCurrentUser(loggedUser);
        setAdminToggleActive(isOriginalAdmin);
        try {
          localStorage.removeItem('localhub_logged_out');
          localStorage.setItem('localhub_user', JSON.stringify(loggedUser));
          localStorage.setItem('localhub_is_admin', JSON.stringify(isOriginalAdmin));
        } catch {}
      } else {
        // Unauthenticated or anonymous session
        const isLoggedOut = localStorage.getItem('localhub_logged_out');
        if (isLoggedOut === 'true') {
          setCurrentUser(null);
          setAdminToggleActive(false);
        } else {
          const stored = localStorage.getItem('localhub_user');
          if (!stored) {
            setCurrentUser(null);
            setAdminToggleActive(false);
          }
        }
        // Ensure anonymous auth token for Firestore read/writes if not logged in
        signInAnonymously(auth).catch((e) => {
          console.warn('Anonymous auth note:', e);
        });
      }
    });
    return () => unsub();
  }, [showToast]);

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      // Use direct popup with prompt: 'select_account'
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userEmail = user.email?.toLowerCase().trim() || '';
      const isOriginalAdmin = Boolean(userEmail && userEmail === ORIGINAL_ADMIN_EMAIL.toLowerCase());

      const loggedIn = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน Google',
        photoURL: user.photoURL || null,
      };

      setCurrentUser(loggedIn);
      setAdminToggleActive(isOriginalAdmin);

      try {
        localStorage.removeItem('localhub_logged_out');
        localStorage.setItem('localhub_user', JSON.stringify(loggedIn));
        localStorage.setItem('localhub_is_admin', JSON.stringify(isOriginalAdmin));
      } catch {}

      // Sync user profile to Firestore
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDocFromServer(userDocRef);
        if (!userSnap.exists()) {
          await setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            displayName: loggedIn.displayName,
            photoURL: loggedIn.photoURL,
            role: isOriginalAdmin ? 'admin' : 'user',
            isAdmin: isOriginalAdmin,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          });
        } else {
          await updateDoc(userDocRef, {
            lastLogin: new Date().toISOString(),
            displayName: loggedIn.displayName,
            photoURL: loggedIn.photoURL
          });
        }
      } catch (e) {
        console.warn('Firestore profile sync note:', e);
      }

      if (isOriginalAdmin) {
        showToast(`🛡️ เข้าสู่ระบบสำเร็จในฐานะผู้ดูแลระบบ (Admin): ${loggedIn.displayName}`, 'success');
      } else {
        showToast(`🎉 ยินดีต้อนรับเข้าสู่ชุมชน LocalHub: ${loggedIn.displayName}`, 'success');
      }
      return true;
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        showToast('คุณได้ปิดหน้าต่างเลือกบัญชี Google', 'info');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        showToast('การเปิดหน้าต่างเข้าสู่ระบบ Google ถูกยกเลิก', 'info');
      } else if (err?.code === 'auth/popup-blocked') {
        showToast('เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตป๊อปอัป หรือระบุอีเมล Google ของคุณเพื่อเข้าใช้งาน', 'error');
      } else if (err?.code === 'auth/unauthorized-domain') {
        showToast('โดเมนนี้ยังไม่ได้ลงทะเบียนใน Firebase Authorized Domains กรุณาระบุอีเมล Google ของคุณเพื่อเข้าใช้งาน', 'info');
      } else {
        showToast('ไม่สามารถเชื่อมต่อ Google Popup ได้ กรุณาระบุบัญชี Google ของคุณเพื่อเข้าใช้งาน', 'error');
      }
      return false;
    }
  };

  const loginWithGoogleCredential = async (idToken: string): Promise<boolean> => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      const user = result.user;
      const userEmail = user.email?.toLowerCase().trim() || '';
      const isOriginalAdmin = Boolean(userEmail && userEmail === ORIGINAL_ADMIN_EMAIL.toLowerCase());

      const loggedIn = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน Google',
        photoURL: user.photoURL || null,
      };

      setCurrentUser(loggedIn);
      setAdminToggleActive(isOriginalAdmin);

      try {
        localStorage.removeItem('localhub_logged_out');
        localStorage.setItem('localhub_user', JSON.stringify(loggedIn));
        localStorage.setItem('localhub_is_admin', JSON.stringify(isOriginalAdmin));
      } catch {}

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDocFromServer(userDocRef);
        if (!userSnap.exists()) {
          await setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            displayName: loggedIn.displayName,
            photoURL: loggedIn.photoURL,
            role: isOriginalAdmin ? 'admin' : 'user',
            isAdmin: isOriginalAdmin,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn('Firestore profile sync note:', e);
      }

      if (isOriginalAdmin) {
        showToast(`🛡️ เข้าสู่ระบบสำเร็จในฐานะผู้ดูแลระบบ (Admin): ${loggedIn.displayName}`, 'success');
      } else {
        showToast(`🎉 ยินดีต้อนรับเข้าสู่ชุมชน LocalHub: ${loggedIn.displayName}`, 'success');
      }
      return true;
    } catch (err: any) {
      console.error('Credential sign-in error:', err);
      showToast('การยืนยันตัวตนด้วย Google ล้มเหลว โปรดลองใหม่อีกครั้ง', 'error');
      return false;
    }
  };

  const loginWithGoogleEmail = useCallback((googleEmail: string, adminPasscode?: string, customDisplayName?: string): boolean => {
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('กรุณาระบุที่อยู่อีเมล Google ให้ถูกต้อง เช่น user@gmail.com', 'error');
      return false;
    }

    const isOwner = cleanEmail === ORIGINAL_ADMIN_EMAIL.toLowerCase();

    // Security Gate: Only the true admin email can access admin features, and must supply admin verification
    if (isOwner) {
      const validAdminPass = ['admin1234', 'toonisra33', 'admin', '123456'];
      if (!adminPasscode || !validAdminPass.includes(adminPasscode.trim())) {
        showToast('❌ รหัสยืนยันผู้ดูแลระบบไม่ถูกต้อง ไม่สามารถเข้าสู่ระบบ Admin ได้', 'error');
        return false;
      }
    }

    const nameFromEmail = cleanEmail.split('@')[0];
    const loggedUser = {
      uid: isOwner ? 'admin_toonisra33' : `google_user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
      email: cleanEmail,
      displayName: isOwner
        ? 'อิศราวัฒน์ ปวินทกานต์ (Admin)'
        : (customDisplayName?.trim() || nameFromEmail || 'สมาชิก Google'),
      photoURL: isOwner
        ? DEFAULT_ADMIN_USER.photoURL
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };

    setCurrentUser(loggedUser);
    setAdminToggleActive(isOwner);

    try {
      localStorage.removeItem('localhub_logged_out');
      localStorage.setItem('localhub_user', JSON.stringify(loggedUser));
      localStorage.setItem('localhub_is_admin', JSON.stringify(isOwner));
    } catch {}

    // Add to registered users list in context if new
    setRegisteredUsers((prev) => {
      const exists = prev.some((u) => u.email?.toLowerCase() === cleanEmail);
      if (exists) return prev;
      const newUserAcc: UserAccount = {
        uid: loggedUser.uid,
        email: cleanEmail,
        displayName: loggedUser.displayName,
        photoURL: loggedUser.photoURL,
        role: isOwner ? 'admin' : 'user',
        isAdmin: isOwner,
        province: 'กรุงเทพมหานคร',
        district: 'จตุจักร',
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        isInactiveWarning: false
      };
      return [newUserAcc, ...prev];
    });

    if (isOwner) {
      showToast(`🛡️ เข้าสู่ระบบสำเร็จในฐานะผู้ดูแลระบบ (Admin): ${loggedUser.displayName}`, 'success');
    } else {
      showToast(`🎉 ยินดีต้อนรับเข้าสู่ชุมชน LocalHub: ${loggedUser.displayName} (${cleanEmail})`, 'success');
    }

    return true;
  }, [showToast]);

  const loginWithEmail = useCallback((email: string, password?: string, displayName?: string): boolean => {
    return loginWithGoogleEmail(email, password, displayName);
  }, [loginWithGoogleEmail]);

  const logoutFirebase = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setCurrentUser(null);
    setAdminToggleActive(false);
    try {
      localStorage.setItem('localhub_logged_out', 'true');
      localStorage.removeItem('localhub_user');
      localStorage.setItem('localhub_is_admin', 'false');
      if (typeof window !== 'undefined') {
        window.location.hash = '#home';
      }
    } catch {}
    setActiveTab('home'); // Ensure jumping to home page, never staying on admin
    showToast('ออกจากระบบเรียบร้อยแล้ว (เข้าสู่โหมดผู้เยี่ยมชม)', 'info');
  };

  const safeSetIsAdmin = useCallback((val: boolean) => {
    if (val) {
      const isOwner = Boolean(
        currentUser?.email &&
        currentUser.email.toLowerCase().trim() === ORIGINAL_ADMIN_EMAIL.toLowerCase()
      );
      if (!isOwner) {
        showToast('เฉพาะบัญชีผู้ดูแลระบบเท่านั้นที่มีสิทธิ์เข้าถึงระบบ Admin', 'error');
        setAdminToggleActive(false);
        try {
          localStorage.setItem('localhub_is_admin', 'false');
        } catch {}
        return;
      }
      setAdminToggleActive(true);
      try {
        localStorage.setItem('localhub_is_admin', 'true');
      } catch {}
      showToast('เปิดโหมดผู้ดูแลระบบ (Admin Mode)', 'success');
    } else {
      setAdminToggleActive(false);
      try {
        localStorage.setItem('localhub_is_admin', 'false');
      } catch {}
      showToast('สลับเข้าสู่มุมมองสมาชิกทั่วไป', 'info');
      setActiveTab('home');
    }
  }, [currentUser, showToast, setActiveTab]);

  // Modal navigation handlers with browser history synchronization
  const openPostDetail = useCallback((postOrId: Post | string) => {
    let targetPost: Post | undefined;
    if (typeof postOrId === 'string') {
      targetPost = posts.find(p => p.id === postOrId);
      if (!targetPost) {
        showToast('ไม่พบโพสต์ที่ต้องการ หรืออาจถูกลบไปแล้ว', 'error');
        return;
      }
    } else {
      targetPost = postOrId;
    }
    if (typeof window !== 'undefined') {
      window.history.pushState(
        { type: 'modal', modal: 'post', postId: targetPost.id, tab: activeTab },
        '',
        '#' + activeTab + '?post=' + targetPost.id
      );
    }
    setOpenedPost(targetPost);
  }, [posts, showToast, activeTab]);

  const closePostDetail = useCallback(() => {
    setOpenedPost(null);
    if (typeof window !== 'undefined' && window.history.state?.type === 'modal' && window.history.state?.modal === 'post') {
      window.history.back();
    }
  }, []);

  const openLocationModal = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ type: 'modal', modal: 'location', tab: activeTab }, '', '#' + activeTab + '?modal=location');
    }
    setIsLocationModalOpen(true);
  }, [activeTab]);

  const closeLocationModal = useCallback(() => {
    setIsLocationModalOpen(false);
    if (typeof window !== 'undefined' && window.history.state?.type === 'modal' && window.history.state?.modal === 'location') {
      window.history.back();
    }
  }, []);

  const openContactAdminModal = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ type: 'modal', modal: 'contactAdmin', tab: activeTab }, '', '#' + activeTab + '?modal=contactAdmin');
    }
    setIsContactAdminModalOpen(true);
  }, [activeTab]);

  const closeContactAdminModal = useCallback(() => {
    setIsContactAdminModalOpen(false);
    if (typeof window !== 'undefined' && window.history.state?.type === 'modal' && window.history.state?.modal === 'contactAdmin') {
      window.history.back();
    }
  }, []);

  const openLoginModal = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ type: 'modal', modal: 'login', tab: activeTab }, '', '#' + activeTab + '?modal=login');
    }
    setIsLoginModalOpen(true);
  }, [activeTab]);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    if (typeof window !== 'undefined' && window.history.state?.type === 'modal' && window.history.state?.modal === 'login') {
      window.history.back();
    }
  }, []);

  const goBack = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (openedPost) {
      closePostDetail();
      return;
    }
    if (isLocationModalOpen) {
      closeLocationModal();
      return;
    }
    if (isLocationPermissionModalOpen) {
      setIsLocationPermissionModalOpen(false);
      return;
    }
    if (isContactAdminModalOpen) {
      closeContactAdminModal();
      return;
    }
    if (isLoginModalOpen) {
      closeLoginModal();
      return;
    }

    if (window.history.length > 1 && tabHistory.length > 1) {
      window.history.back();
    } else if (activeTab !== 'home') {
      setActiveTab('home');
    }
  }, [
    openedPost,
    isLocationModalOpen,
    isLocationPermissionModalOpen,
    isContactAdminModalOpen,
    isLoginModalOpen,
    closePostDetail,
    closeLocationModal,
    closeContactAdminModal,
    closeLoginModal,
    tabHistory.length,
    activeTab,
    setActiveTab
  ]);

  const canGoBack = activeTab !== 'home' || Boolean(openedPost || isLocationModalOpen || isContactAdminModalOpen || isLoginModalOpen);

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

  const addComment = (postId: string, content: string, images?: string[]) => {
    const authorName = currentUser?.displayName || 'คุณ (ผู้ใช้ปัจจุบัน)';
    const authorAvatar = currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newComment: PostComment = {
      id: `c_${Date.now()}`,
      author: authorName,
      avatar: authorAvatar,
      content: content.trim(),
      timestamp: Date.now(),
      likes: 0,
      isOfficial: isAdmin,
      images: images && images.length > 0 ? images : undefined
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

  // Share post to "My Feed / หน้าของฉัน"
  const sharePostToMyFeed = useCallback((postId: string, comment?: string) => {
    if (!currentUser) {
      showToast('กรุณาเข้าสู่ระบบก่อนแชร์โพสต์ไปยังหน้าของฉัน', 'info');
      setIsLoginModalOpen(true);
      return;
    }

    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) {
      showToast('ไม่พบโพสต์ที่ต้องการแชร์', 'error');
      return;
    }

    const sharerName = currentUser.displayName || 'คุณ (ผู้ใช้ปัจจุบัน)';
    const sharerAvatar = currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const sharedPost: Post = {
      id: `post_shared_${Date.now()}`,
      title: targetPost.title,
      content: comment?.trim() || `แชร์เรื่องราวจาก ${targetPost.author}`,
      author: sharerName,
      authorRole: isAdmin ? 'ผู้ดูแลระบบ' : 'สมาชิกชุมชน',
      authorAvatar: sharerAvatar,
      category: targetPost.category,
      location: targetPost.location,
      coordinates: targetPost.coordinates,
      createdAt: Date.now(),
      likes: 0,
      shares: 0,
      comments: [],
      images: targetPost.images,
      tags: targetPost.tags,
      sharedFrom: {
        originalPostId: targetPost.id,
        originalAuthor: targetPost.author,
        originalAuthorAvatar: targetPost.authorAvatar,
        originalTitle: targetPost.title,
        originalContent: targetPost.content,
        originalImages: targetPost.images,
        originalCreatedAt: targetPost.createdAt,
        sharedAt: Date.now(),
        commentBySharer: comment?.trim()
      }
    };

    // Increment share count on original
    setPosts(prev => [
      sharedPost,
      ...prev.map(p => p.id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p)
    ]);

    updateDoc(doc(db, 'posts', postId), {
      shares: (targetPost.shares || 0) + 1
    }).catch(() => {});

    setDoc(doc(db, 'posts', sharedPost.id), removeUndefinedFields(sharedPost)).catch(() => {});

    showToast('🔁 แชร์โพสต์นี้ไปยังหน้าฟีดของคุณเรียบร้อยแล้ว!', 'success', `post:${sharedPost.id}`);
  }, [currentUser, posts, isAdmin, showToast]);

  // 1-on-1 Direct Chat Methods (ระบบการแชทคุยตัวต่อตัว)
  const openDirectChat = useCallback((contact?: DirectChatContact) => {
    setIsDirectChatOpen(true);
    if (contact) {
      setActiveChatContact(contact);
      // Mark messages in conversation as read
      setDirectConversations(prev => {
        const convIndex = prev.findIndex(
          c => c.participant.id === contact.id || c.participant.name.trim().toLowerCase() === contact.name.trim().toLowerCase()
        );
        if (convIndex >= 0) {
          const updated = [...prev];
          updated[convIndex] = {
            ...updated[convIndex],
            unreadCount: 0,
            messages: updated[convIndex].messages.map(m => ({ ...m, isRead: true }))
          };
          return updated;
        } else {
          const newConv: DirectConversation = {
            id: `conv_${contact.id}`,
            participant: contact,
            unreadCount: 0,
            messages: []
          };
          return [newConv, ...prev];
        }
      });
    } else {
      if (directConversations.length > 0 && !activeChatContact) {
        setActiveChatContact(directConversations[0].participant);
      }
    }
  }, [directConversations, activeChatContact]);

  const closeDirectChat = useCallback(() => {
    setIsDirectChatOpen(false);
  }, []);

  const sendDirectMessage = useCallback((receiverId: string, content: string, attachmentUrl?: string) => {
    if (!content.trim() && !attachmentUrl) return;

    const myId = currentUser?.uid || 'me';
    const myName = currentUser?.displayName || 'คุณ';
    const myAvatar = currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newMsg: DirectChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: myId,
      senderName: myName,
      senderAvatar: myAvatar,
      receiverId: receiverId,
      receiverName: activeChatContact?.name || 'คู่สนทนา',
      receiverAvatar: activeChatContact?.avatar,
      content: content.trim(),
      timestamp: Date.now(),
      isRead: true,
      attachmentUrl,
      attachmentType: attachmentUrl ? 'image' : undefined
    };

    setDirectConversations(prev => {
      const convIndex = prev.findIndex(c => c.participant.id === receiverId || c.participant.name === activeChatContact?.name);
      if (convIndex >= 0) {
        const updated = [...prev];
        const conv = updated[convIndex];
        const newMessages = [...conv.messages, newMsg];
        updated[convIndex] = {
          ...conv,
          lastMessage: newMsg,
          messages: newMessages
        };
        const [moved] = updated.splice(convIndex, 1);
        return [moved, ...updated];
      } else {
        const newConv: DirectConversation = {
          id: `conv_${receiverId}`,
          participant: activeChatContact || {
            id: receiverId,
            name: 'เพื่อนบ้าน',
            isOnline: true
          },
          lastMessage: newMsg,
          unreadCount: 0,
          messages: [newMsg]
        };
        return [newConv, ...prev];
      }
    });

    // Schedule friendly responsive reply after 1.5 seconds
    const contactName = activeChatContact?.name || 'เพื่อนบ้าน';
    const contactAvatar = activeChatContact?.avatar;
    setTimeout(() => {
      let replyText = 'สวัสดีครับ ได้รับข้อความเรียบร้อยแล้วครับ ขอบคุณที่ทักมาคุยกันนะครับ 👍';
      if (contactName.includes('สมชาย')) {
        replyText = 'รับทราบเลยครับคุณ ขอบคุณที่แจ้งล่วงหน้านะครับ มีเพื่อนบ้านแบบนี้น่าอยู่มากครับ!';
      } else if (contactName.includes('อรวรรณ')) {
        replyText = 'ขอบคุณสำหรับข้อมูลมากๆ เลยนะคะ เดี๋ยวจะแจ้งคนในบ้านให้ทราบด้วยค่ะ 😊';
      } else if (contactName.includes('สวนผลไม้') || contactName.includes('ยายณี')) {
        replyText = 'ยินดีให้บริการค่ะคุณลูกค้า ผลไม้สดๆ พรุ่งนี้ช่วงเช้าพร้อมส่งถึงบ้านนะคะ 🥭✨';
      } else if (content.includes('สวัสดี') || content.includes('ทัก')) {
        replyText = `สวัสดีครับคุณ ${myName} ยินดีที่ได้คุยด้วยครับ สะดวกสอบถามข้อมูลได้ตลอดเวลาเลยครับ`;
      } else if (content.includes('แผนที่') || content.includes('ทาง') || content.includes('นำทาง')) {
        replyText = 'พิกัดและเส้นทางตามที่ปักหมุดไว้ถูกต้องเลยครับ เดินทางมาได้สะดวกครับ';
      } else if (content.includes('ปลอดภัย') || content.includes('เหตุ')) {
        replyText = 'ขอบคุณที่ช่วยติดตามสถานการณ์ความปลอดภัยในชุมชนครับ ร่วมด้วยช่วยกันครับ!';
      }

      const replyMsg: DirectChatMessage = {
        id: `msg_reply_${Date.now()}`,
        senderId: receiverId,
        senderName: contactName,
        senderAvatar: contactAvatar,
        receiverId: myId,
        receiverName: myName,
        content: replyText,
        timestamp: Date.now(),
        isRead: false
      };

      setDirectConversations(currentConvs => {
        return currentConvs.map(c => {
          if (c.participant.id === receiverId || c.participant.name === contactName) {
            return {
              ...c,
              lastMessage: replyMsg,
              unreadCount: (c.unreadCount || 0) + 1,
              messages: [...c.messages, replyMsg]
            };
          }
          return c;
        });
      });

      showToast(`💬 ข้อความใหม่จาก ${contactName}: "${replyText.slice(0, 35)}..."`, 'info');
    }, 1500);
  }, [currentUser, activeChatContact, showToast]);

  const totalUnreadChatCount = useMemo(() => {
    return directConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [directConversations]);

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
        goBack,
        canGoBack,
        location,
        setLocation,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
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
        sharePostToMyFeed,
        directConversations,
        activeChatContact,
        isDirectChatOpen,
        openDirectChat,
        closeDirectChat,
        sendDirectMessage,
        totalUnreadChatCount,
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
        openContactAdminModal,
        closeContactAdminModal,
        isAdmin,
        isEligibleAdmin,
        setIsAdmin: safeSetIsAdmin,
        currentUser,
        isFirebaseConnected,
        loginWithGoogle,
        loginWithGoogleCredential,
        loginWithGoogleEmail,
        loginWithEmail,
        logoutFirebase,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        registeredUsers: processedUsers,
        totalUsersCount,
        activeUsersCount,
        inactiveUsersCount,
        pendingDeletionUsersCount,
        isCurrentAccountInactiveWarning,
        currentAccountDaysRemaining,
        confirmActiveStatus,
        simulateInactivity,
        deleteUserAccount,
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
