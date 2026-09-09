export type Tab = 'home' | 'map' | 'community' | 'global_news' | 'market' | 'chats' | 'me' | 'admin_dashboard';

export type UserRole = 'admin' | 'user';

export type BroadcastCategory = 'news' | 'marketing' | 'announcement' | 'emergency' | 'weather' | 'traffic';
export type BroadcastSeverity = 'urgent' | 'high' | 'normal' | 'special';

export interface AdminBroadcast {
  id: string;
  title: string;
  message: string;
  category: BroadcastCategory;
  severity: BroadcastSeverity;
  targetArea?: string;
  broadcastAt: number; // Unix timestamp in ms
  broadcastDateStr: string; // YYYY-MM-DD for midnight reset comparison
  adminName: string;
  adminRole: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  mediaFileName?: string;
  videoDurationSeconds?: number;
  contactNumber?: string;
  actionText?: string;
  actionUrl?: string;
  pinned: boolean;
  isActive: boolean;
  checkIn?: CheckInLocation;
}

export interface Location {
  province: string;
  district: string;
  subdistrict: string;
  village?: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  isGps?: boolean;
  timestamp?: number;
}

export type VerificationStatus = 'unconfirmed' | 'members' | 'authority';

export interface Alert {
  id: string;
  type: 'flood' | 'power' | 'road' | 'accident' | 'general';
  title: string;
  description: string;
  location: Location;
  time: string;
  status: VerificationStatus;
  confirmations: number;
  rejections: number;
  userVoted?: 'up' | 'down';
  image?: string;
  reportedBy?: string;
}

export interface PostComment {
  id: string;
  author: {
    name: string;
    avatar: string;
    isVerified?: boolean;
    reputationScore?: number;
  };
  authorUid?: string;
  content: string;
  time: string;
  createdAt?: number;
}

export interface CheckInLocation {
  placeName: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  country?: string;
  latitude: number;
  longitude: number;
  category?: string; // e.g. 'restaurant' | 'cafe' | 'landmark' | 'shop' | 'travel' | 'event' | 'general'
  address?: string;
  isGps?: boolean;
}

export interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    isVerified?: boolean;
    reputationScore?: number;
  };
  authorUid?: string;
  content: string;
  location: Location;
  time: string;
  likes: number;
  comments: number;
  image?: string;
  images?: string[];
  videoUrl?: string;
  isLiked?: boolean;
  likedBy?: string[];
  category?: string;
  commentList?: PostComment[];
  checkIn?: CheckInLocation;
  createdAt?: number;
  updatedAt?: number;
  isPinned?: boolean;
}

export interface UserSessionLog {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  loginMethod: 'google' | 'password' | 'anonymous';
  ipOrLocation?: string;
  userAgent?: string;
  timestamp: number;
  timeStr: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  seller: string;
  sellerPhone?: string;
  distance: number;
  image: string;
  category: string;
  description?: string;
  locationName?: string;
}

export interface LocalShop {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  distance: number;
  openHours: string;
  phone: string;
  address: string;
  image: string;
  tags: string[];
}

export interface LocalJob {
  id: string;
  title: string;
  company: string;
  salary: string;
  type: 'งานประจำ' | 'งานพาร์ทไทม์' | 'รายวัน';
  location: string;
  distance: number;
  phone: string;
  description: string;
}

export interface LocalEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  distance: number;
  organizer: string;
  description: string;
  joinedCount: number;
  isJoined?: boolean;
  image: string;
}

export interface RealEstateItem {
  id: string;
  title: string;
  type: 'เช่า' | 'ขาย';
  price: string;
  location: string;
  distance: number;
  phone: string;
  image: string;
  details: string;
}

export interface AppNotification {
  id: string;
  recipientUid?: string;
  senderUid?: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'broadcast' | 'community' | 'market' | 'social';
  link?: string;
  createdAt?: any;
}

export interface UserPrivacySettings {
  showEmail?: boolean;
  showPhone?: boolean;
  showBirthDate?: boolean;
  showRelationshipStatus?: boolean;
  showOccupation?: boolean;
}

export interface UserProfileData {
  id?: string;
  uid?: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  villageOrCondo?: string;
  bio: string;
  avatar: string;
  occupation?: string; // อาชีพ / ความเชี่ยวชาญ
  emergencyContactName?: string; // ชื่อผู้ติดต่อฉุกเฉิน
  emergencyContactPhone?: string; // เบอร์ผู้ติดต่อฉุกเฉิน
  birthDate?: string; // วันเกิด
  relationshipStatus?: string; // สถานะความสัมพันธ์
  privacySettings?: UserPrivacySettings; // การตั้งค่าความเป็นส่วนตัว
  isVerified: boolean;
  verificationStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  joinedDate: string;
  reputationScore: number;
  role?: UserRole;
  isGoogleUser?: boolean;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  idCardNumber: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
}

export interface MorningBrief {
  weather: string;
  roadClosures: number;
  events: number;
  newShops: number;
  newJobs: number;
  announcements: number;
}

export type ContactRequestType = 'pr_request' | 'news_report' | 'urgent_tip' | 'complaint' | 'special_help';
export type ContactRequestStatus = 'pending' | 'reviewed' | 'approved_and_broadcast' | 'resolved';

export interface AdminContactRequest {
  id: string;
  type: ContactRequestType;
  title: string;
  detail: string;
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  senderUid?: string;
  senderAvatar?: string;
  targetArea?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  preferredTime?: string;
  createdAt: number;
  requesterId?: string;
  timeStr: string;
  status: ContactRequestStatus;
  adminNote?: string;
}


export interface Message {
  id: string;
  imageUrl?: string;
  roomId: string;
  senderId: string;
  text: string;
  createdAt: number;
  requesterId?: string;
  readBy: string[];
}

export interface ChatRoom {
  id: string;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  participants: string[];
  participantDetails: Record<string, { name: string; avatar: string }>;
  lastMessage: string;
  lastMessageTime: number;
  lastMessageSenderId?: string;
  updatedAt: number;
}

export interface Friendship {
  id: string;
  users: string[];
  status: 'pending' | 'accepted';
  createdAt: number;
  requesterId?: string;
}
