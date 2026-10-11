export type Tab = 'feed' | 'broadcasts' | 'market' | 'alerts' | 'map' | 'weather' | 'profile';

export type BroadcastCategory = 'news' | 'marketing' | 'announcement' | 'emergency' | 'weather' | 'traffic';
export type BroadcastSeverity = 'urgent' | 'high' | 'normal' | 'special';
export type BroadcastTargetScope = 'all' | 'specific';
export type BroadcastTargetLevel = 'province' | 'district' | 'subdistrict' | 'custom';

export interface AdminBroadcast {
  id: string;
  title: string;
  message: string;
  category: BroadcastCategory;
  severity: BroadcastSeverity;
  targetScope?: BroadcastTargetScope;
  targetLevel?: BroadcastTargetLevel;
  targetProvince?: string;
  targetDistrict?: string;
  targetSubdistrict?: string;
  targetArea?: string; // friendly summary e.g. "เชียงใหม่ (ทุกอำเภอ)" or "ทั่วประเทศ"
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  mediaFileName?: string;
  videoDurationSec?: number;
  broadcastAt: number;
  broadcastDateStr: string;
  adminName: string;
  adminRole?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  actionUrl?: string;
  actionText?: string;
  viewsCount?: number;
  likesCount?: number;
}

export interface PostComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: number;
  likes: number;
  isOfficial?: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole?: string;
  authorAvatar: string;
  isVerified?: boolean;
  category: 'general' | 'news' | 'market' | 'help' | 'alert' | 'activity';
  location: {
    province: string;
    district?: string;
    subdistrict?: string;
    address?: string;
  };
  createdAt: number;
  likes: number;
  isLiked?: boolean;
  comments: PostComment[];
  shares: number;
  images?: string[];
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: number;
  mediaFileName?: string;
  mediaFileSize?: number;
  mediaType?: 'image' | 'video' | 'mixed';
  tags?: string[];
  price?: number;
  contactNumber?: string;
  pinned?: boolean;
}

export interface WeatherCurrent {
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  precipitation: number;
  rain: number;
  weatherCode: number;
  weatherText: string;
  weatherIcon: string;
  isRaining: boolean;
  rainIntensity: 'none' | 'light' | 'moderate' | 'heavy';
  windSpeed: number;
  isDay: boolean;
  updatedAt: string;
  locationName: string;
  source: 'gps' | 'province' | 'manual';
  latitude: number;
  longitude: number;
}

export interface WeatherHourly {
  time: string[];
  temperature: number[];
  precipitationProbability: number[];
  precipitation: number[];
  weatherCode: number[];
}

export interface WeatherDaily {
  time: string[];
  weatherCode: number[];
  tempMax: number[];
  tempMin: number[];
  precipitationSum: number[];
  precipitationProbabilityMax: number[];
}

export interface WeatherData {
  current: WeatherCurrent;
  hourly: WeatherHourly;
  daily: WeatherDaily;
  pm25?: number;
  aqiStatus?: string;
}

export interface Location {
  province: string;
  district: string;
  subdistrict: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  displayName?: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'broadcast' | 'alert' | 'comment' | 'like' | 'market' | 'system';
  isRead: boolean;
  createdAt: number;
  link?: string; // e.g. "post:123" or "broadcast:456"
  severity?: BroadcastSeverity;
}

export interface MarketItem {
  id: string;
  title: string;
  description: string;
  price: number;
  seller: string;
  sellerAvatar: string;
  sellerContact: string;
  images: string[];
  province: string;
  district: string;
  category: 'food' | 'produce' | 'craft' | 'secondhand' | 'service';
  condition?: 'new' | 'used';
  createdAt: number;
  isAvailable: boolean;
  likes: number;
  isLiked?: boolean;
}

export interface AlertReport {
  id: string;
  title: string;
  description: string;
  type: 'accident' | 'flood' | 'fire' | 'power_cut' | 'road_closed' | 'weather';
  severity: 'low' | 'medium' | 'high' | 'critical';
  province: string;
  district: string;
  subdistrict: string;
  reporter: string;
  reporterAvatar?: string;
  createdAt: number;
  verifiedCount: number;
  status: 'active' | 'resolved' | 'investigating';
  coordinates?: { lat: number; lng: number };
}

export type TestSoundType = 'siren' | 'urgent' | 'high' | 'announcement';

export interface SignalTestPayload {
  id: string;
  type: 'admin_local' | 'all_devices';
  title: string;
  message: string;
  severity: BroadcastSeverity;
  soundType: TestSoundType;
  timestamp: number;
  initiatedBy: string;
  vibrationPattern?: number[];
  soundDurationSec?: number;
}

