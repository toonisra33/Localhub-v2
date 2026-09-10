import { Alert, MorningBrief, Post, Product, LocalShop, LocalJob, LocalEvent, RealEstateItem, AppNotification, Location } from './types';

export const initialLocation: Location = { province: '', district: '', subdistrict: '', isGps: false };

export const availableLocations: Location[] = [
  { province: 'กรุงเทพมหานคร', district: 'จตุจักร', subdistrict: 'ลาดยาว', village: 'หมู่บ้านพหลโยธินวิลล่า' },
  { province: 'กรุงเทพมหานคร', district: 'จตุจักร', subdistrict: 'เสนานิคม', village: 'ชุมชนเสนานิคม 1' },
  { province: 'กรุงเทพมหานคร', district: 'จตุจักร', subdistrict: 'จันทรเกษม', village: 'หมู่บ้านรัชดาการ์เด้น' },
  { province: 'กรุงเทพมหานคร', district: 'บางเขน', subdistrict: 'อนุสาวรีย์', village: 'ชุมชนสะพานใหม่' },
  { province: 'นนทบุรี', district: 'เมืองนนทบุรี', subdistrict: 'บางเขน', village: 'หมู่บ้านประชานิเวศน์ 3' },
];

export const mockMorningBrief: MorningBrief = { weather: { temp: "-", condition: "-", pm25: "-" }, announcements: 0, roadClosures: 0, events: 0, newShops: 0, greeting: "สวัสดีตอนเช้า" };

export const initialAlerts: Alert[] = [];

export const initialPosts: Post[] = [];

export const initialProducts: Product[] = [];

export const mockShops: LocalShop[] = [];

export const mockJobs: LocalJob[] = [];

export const mockEvents: LocalEvent[] = [];

export const mockRealEstate: RealEstateItem[] = [];

export const initialNotifications: AppNotification[] = [];

export const initialContactRequests: import('./types').AdminContactRequest[] = [
  {
    id: 'req_01',
    type: 'pr_request',
    title: 'ขอประชาสัมพันธ์งานตลาดนัดปันสุขและกิจกรรมคัดแยกขยะชุมชน เสาร์นี้',
    detail: 'กลุ่มจิตอาสาหมู่บ้านพหลโยธินวิลล่าขอความอนุเคราะห์แอดมินช่วยบรอดแคสต์เชิญชวนลูกบ้านนำขยะรีไซเคิลมาแลกไข่ไก่และสินค้าอุปโภคบริโภค พร้อมเปิดลานขายของมือสองเวลา 08:00 - 14:00 น.',
    senderName: 'คุณสมศักดิ์ จิตอาสาชุมชน',
    senderPhone: '081-345-6789',
    senderEmail: 'somsak.volunteer@example.com',
    targetArea: 'หมู่บ้านพหลโยธินวิลล่า และชุมชนใกล้เคียง',
    mediaUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    preferredTime: 'วันศุกร์ตอนเย็น หรือ เสาร์เช้า',
    createdAt: Date.now() - 3600000 * 2,
    timeStr: '2 ชั่วโมงที่แล้ว',
    status: 'pending'
  },
  {
    id: 'req_02',
    type: 'urgent_tip',
    title: 'แจ้งขุดลอกท่อระบายน้ำปากซอย 35 ทำให้น้ำเริ่มระบายช้าลงมาก',
    detail: 'พบเศษดินทรายและกิ่งไม้อุดตันบริเวณปากท่อระบายน้ำใหญ่ตรงข้ามร้านขายยา หากฝนตกรอบใหม่เกรงว่าจะท่วมสูงเร็ว รบกวนแอดมินช่วยประสานงานฝ่ายระบายน้ำเขตหรือแจ้งเตือนประชาชนครับ',
    senderName: 'วิชัย ช่างไฟฟ้าชุมชน',
    senderPhone: '089-987-6543',
    targetArea: 'ซอยพหลโยธิน 35',
    mediaUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    createdAt: Date.now() - 3600000 * 5,
    timeStr: '5 ชั่วโมงที่แล้ว',
    status: 'reviewed',
    adminNote: 'ประสานงานฝ่ายโยธาเขตจตุจักรเรียบร้อยแล้ว กำลังจัดรถดูดโคลนเข้าพื้นที่'
  },
  {
    id: 'req_03',
    type: 'special_help',
    title: 'ขอความอนุเคราะห์ประกาศตามหาแมวพันธุ์ไทยผสม สวมปลอกคอสีแดงกระดิ่งทอง',
    detail: 'น้องแมวสีส้มขาวชื่อ "เจ้าส้ม" หลุดออกจากบ้านบริเวณท้ายซอย 4 เมื่อช่วงบ่าย ใครพบเห็นรบกวนติดต่อเบอร์ 086-777-8899 มีสินน้ำใจตอบแทนให้ 2,000 บาท ขอบคุณแอดมินมากค่ะ',
    senderName: 'คุณนภา ท้ายซอย 4',
    senderPhone: '086-777-8899',
    targetArea: 'ซอยเสนานิคม 1 ซอย 4-6',
    mediaUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    createdAt: Date.now() - 3600000 * 12,
    timeStr: '12 ชั่วโมงที่แล้ว',
    status: 'approved_and_broadcast',
    adminNote: 'ออกประกาศบรอดแคสช่วยเหลือแล้ว'
  }
];

// Fallback compatibility
export const mockLocation = initialLocation;
export const mockAlerts = initialAlerts;
export const mockPosts = initialPosts;
export const mockProducts = initialProducts;

