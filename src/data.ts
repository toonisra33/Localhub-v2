import { Alert, MorningBrief, Post, Product, LocalShop, LocalJob, LocalEvent, RealEstateItem, AppNotification, Location, AdminContactRequest } from './types';

export const defaultLocation: Location = {
  province: 'กรุงเทพมหานคร',
  district: 'จตุจักร',
  subdistrict: 'ลาดยาว',
  village: 'หมู่บ้านพหลโยธินวิลล่า',
  latitude: 13.8282,
  longitude: 100.5615,
  isGps: false
};

export const initialLocation: Location = defaultLocation;

export const availableLocations: Location[] = [
  { province: 'กรุงเทพมหานคร', district: 'จตุจักร', subdistrict: 'ลาดยาว', village: 'หมู่บ้านพหลโยธินวิลล่า', latitude: 13.8282, longitude: 100.5615 },
  { province: 'กรุงเทพมหานคร', district: 'จตุจักร', subdistrict: 'เสนานิคม', village: 'ชุมชนเสนานิคม 1', latitude: 13.8340, longitude: 100.5750 },
  { province: 'กรุงเทพมหานคร', district: 'จตุจักร', subdistrict: 'จันทรเกษม', village: 'หมู่บ้านรัชดาการ์เด้น', latitude: 13.8180, longitude: 100.5820 },
  { province: 'กรุงเทพมหานคร', district: 'บางเขน', subdistrict: 'อนุสาวรีย์', village: 'ชุมชนสะพานใหม่', latitude: 13.8740, longitude: 100.5970 },
  { province: 'นนทบุรี', district: 'เมืองนนทบุรี', subdistrict: 'บางเขน', village: 'หมู่บ้านประชานิเวศน์ 3', latitude: 13.8610, longitude: 100.5340 },
];

export const mockMorningBrief: MorningBrief = {
  weather: { temp: '31°C', condition: 'ท้องฟ้าแจ่มใส มีเมฆบางส่วน', pm25: '22 (คุณภาพอากาศดี)' },
  announcements: 2,
  roadClosures: 1,
  events: 3,
  newShops: 4,
  greeting: 'สวัสดีตอนเช้า ชาวชุมชนจตุจักร'
};

export const initialAlerts: Alert[] = [
  {
    id: 'alert_01',
    type: 'road',
    title: 'งานปรับปรุงผิวจราจรและวางท่อระบายน้ำ ซอยพหลโยธิน 34',
    description: 'มีเครื่องจักรหนักกำลังทำงาน ปิดการจราจร 1 ช่องทาง แนะนำหลีกเลี่ยงหรือใช้เส้นทางลัดออกซอยเสนานิคม 1 ครับ',
    location: {
      province: 'กรุงเทพมหานคร',
      district: 'จตุจักร',
      subdistrict: 'เสนานิคม',
      village: 'ซอยพหลโยธิน 34',
      distance: 0.6,
      latitude: 13.8320,
      longitude: 100.5740
    },
    time: '25 นาทีที่แล้ว',
    status: 'members',
    confirmations: 16,
    rejections: 0,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
    reportedBy: 'user_traffic_01'
  },
  {
    id: 'alert_02',
    type: 'power',
    title: 'กฟน. ปรับปรุงหม้อแปลงไฟฟ้าแรงสูง ซอยงามวงศ์วาน 54',
    description: 'การไฟฟ้านครหลวงเข้าดับกระแสไฟฟ้าชั่วคราวเพื่อความปลอดภัยในการเปลี่ยนหม้อแปลง คาดว่าจะจ่ายไฟได้ตามปกติเวลา 15:30 น.',
    location: {
      province: 'กรุงเทพมหานคร',
      district: 'จตุจักร',
      subdistrict: 'ลาดยาว',
      village: 'ซอยงามวงศ์วาน 54',
      distance: 1.2,
      latitude: 13.8450,
      longitude: 100.5620
    },
    time: '45 นาทีที่แล้ว',
    status: 'authority',
    confirmations: 32,
    rejections: 1,
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800',
    reportedBy: 'user_mea_agent'
  },
  {
    id: 'alert_03',
    type: 'flood',
    title: 'น้ำท่วมขังรอการระบาย บริเวณปากทางตลาดอมรพันธ์',
    description: 'หลังฝนตกหนัก มีน้ำท่วมขังผิวถนนระดับเสมอขอบทางเท้า เจ้าหน้าที่เทศกิจและสำนักงานเขตกำลังเร่งเดินเครื่องสูบน้ำ รถเล็กโปรดชะลอความเร็ว',
    location: {
      province: 'กรุงเทพมหานคร',
      district: 'จตุจักร',
      subdistrict: 'เสนานิคม',
      village: 'แยกเกษตร-อมรพันธ์',
      distance: 1.8,
      latitude: 13.8400,
      longitude: 100.5730
    },
    time: '1 ชั่วโมงที่แล้ว',
    status: 'members',
    confirmations: 24,
    rejections: 0,
    image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=800',
    reportedBy: 'user_resident_33'
  }
];

export const initialPosts: Post[] = [
  {
    id: 'post_01',
    author: {
      name: 'ป้าพร ข้าวแกงปักษ์ใต้',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      isVerified: true,
      reputationScore: 98
    },
    content: 'วันนี้ทางร้านทำแกงไตปลา คั่วกลิ้งหมูสับรสจัดจ้าน และแกงส้มยอดมะพร้าวสดใหม่ ใครแวะมาทานในหมู่บ้านพหลโยธินวิลล่า ยินดีต้อนรับเพื่อนบ้านทุกท่านนะคะ พร้อมน้ำพริกกะปิผักสดฟรีไม่อั้นค่ะ 🍲🌿',
    location: {
      province: 'กรุงเทพมหานคร',
      district: 'จตุจักร',
      subdistrict: 'ลาดยาว',
      village: 'หมู่บ้านพหลโยธินวิลล่า'
    },
    time: '15 นาทีที่แล้ว',
    createdAt: Date.now() - 15 * 60 * 1000,
    category: 'ร้านอร่อยชุมชน',
    likes: 38,
    comments: 9,
    images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'],
    isPinned: true
  },
  {
    id: 'post_02',
    author: {
      name: 'คุณกิตติศักดิ์ กรรมการชุมชน',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      isVerified: true,
      reputationScore: 125
    },
    content: '📢 ขอเชิญชวนลูกบ้านทุกหลังคาเรือนร่วมงาน "วันบิ๊กคลีนนิ่งเดย์และคัดแยกขยะรีไซเคิล" เสาร์นี้ เวลา 09:00 - 12:00 น. ณ ศาลาประชาคม มีจุดแลกไข่ไก่และแจกปุ๋ยหมักชีวภาพฟรีครับ ♻️🌱',
    location: {
      province: 'กรุงเทพมหานคร',
      district: 'จตุจักร',
      subdistrict: 'ลาดยาว',
      village: 'หมู่บ้านพหลโยธินวิลล่า'
    },
    time: '1 ชั่วโมงที่แล้ว',
    createdAt: Date.now() - 60 * 60 * 1000,
    category: 'ข่าวสารชุมชน',
    likes: 54,
    comments: 14,
    images: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800'],
    isPinned: false
  },
  {
    id: 'post_03',
    author: {
      name: 'น้องเมย์ ท้ายซอย 5',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      isVerified: false,
      reputationScore: 45
    },
    content: 'เจอน้องหมาพันธุ์ปอมสีขาวครีม สวมปลอกคอสีฟ้า วิ่งหลงอยู่บริเวณหน้าสวนหย่อมชุมชนเสนานิคม 1 ตอนนี้น้องปลอดภัยอยู่บ้านเมย์นะคะ เจ้าของติดต่อมารับได้เลยค่ะ 🐶❤️',
    location: {
      province: 'กรุงเทพมหานคร',
      district: 'จตุจักร',
      subdistrict: 'เสนานิคม',
      village: 'ชุมชนเสนานิคม 1'
    },
    time: '2 ชั่วโมงที่แล้ว',
    createdAt: Date.now() - 120 * 60 * 1000,
    category: 'ตามหาของ/สัตว์เลี้ยง',
    likes: 72,
    comments: 21,
    images: ['https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=800'],
    isPinned: false
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod_01',
    title: 'ผักสลัดไฮโดรโปนิกส์ปลอดสาร สวนข้างบ้าน',
    price: 45,
    seller: 'สวนป้าแป๋ว ซอย 8',
    sellerPhone: '089-111-2233',
    distance: 0.3,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
    category: 'อาหารและผักผลไม้',
    description: 'กรีนโอ๊ค เรดโอ๊ค คอส เก็บสดทุกเช้า สะอาด ปลอดภัย ปลูกด้วยน้ำแร่ธรรมชาติ',
    locationName: 'ซอยพหลโยธิน 34'
  },
  {
    id: 'prod_02',
    title: 'ชุดเครื่องมือช่างประจำบ้าน สภาพใหม่ 99%',
    price: 350,
    seller: 'ช่างเอก ลาดยาว',
    sellerPhone: '081-444-5566',
    distance: 0.8,
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=600',
    category: 'ของใช้ในบ้าน',
    description: 'มีสว่านไร้สาย ค้อน คีม ตลับเมตร ครบกล่อง ซื้อมาไม่ได้ใช้ ส่งต่อราคาเป็นกันเองครับ',
    locationName: 'หมู่บ้านพหลโยธินวิลล่า'
  },
  {
    id: 'prod_03',
    title: 'ต้นบอนสี ราชินีใบไม้ เพาะในกระถาง 6 นิ้ว',
    price: 120,
    seller: 'คุณเล็ก พหลวิลล่า',
    sellerPhone: '086-777-8899',
    distance: 0.5,
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600',
    category: 'ต้นไม้และสัตว์เลี้ยง',
    description: 'บอนสีฟอร์มกอสวย กัดสีเต็มใบ รากเดินดีมาก เลี้ยงง่าย พร้อมนำไปประดับโต๊ะทำงาน',
    locationName: 'ซอย 4'
  },
  {
    id: 'prod_04',
    title: 'ขนมเปี๊ยะไส้ถั่วไข่เค็ม อบควันเทียนสดใหม่',
    price: 80,
    seller: 'แม่มะลิ เบเกอรี่',
    sellerPhone: '082-333-7788',
    distance: 1.1,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600',
    category: 'อาหารและผักผลไม้',
    description: 'แป้งบางนุ่ม ไส้แน่น หวานน้อย ไข่เค็มเต็มฟอง กล่องละ 4 ชิ้น ทำวันต่อวัน',
    locationName: 'เสนานิคม 1'
  }
];

export const mockShops: LocalShop[] = [
  {
    id: 'shop_01',
    name: 'ครัวคุณยาย อาหารตามสั่งริมสวน',
    category: 'อาหารตามสั่ง',
    rating: 4.8,
    reviewsCount: 86,
    distance: 0.4,
    openHours: '09:00 - 19:30 น.',
    phone: '085-123-4567',
    address: 'ซอยเสนานิคม 1 แยก 4',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
    tags: ['กะเพราเนื้อโบราณ', 'ต้มยำกุ้ง', 'ไข่เจียวปู']
  },
  {
    id: 'shop_02',
    name: 'บ้านกาแฟโบราณ ลาดยาว',
    category: 'คาเฟ่และเครื่องดื่ม',
    rating: 4.7,
    reviewsCount: 112,
    distance: 0.7,
    openHours: '06:30 - 16:00 น.',
    phone: '081-987-6543',
    address: 'หมู่บ้านพหลโยธินวิลล่า ซอย 2',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600',
    tags: ['กาแฟดริป', 'ชาไทยโบราณ', 'ขนมปังปิ้งสังขยา']
  }
];

export const mockJobs: LocalJob[] = [
  {
    id: 'job_01',
    title: 'พนักงานบริการหน้าร้านและจัดเตรียมเครื่องดื่ม',
    company: 'บ้านกาแฟโบราณ ลาดยาว',
    salary: '14,000 - 16,000 บาท/เดือน',
    type: 'งานประจำ',
    location: 'ซอยพหลโยธิน 34',
    distance: 0.7,
    phone: '081-987-6543',
    description: 'ยินดีรับคนในพื้นที่ บุคลิกยิ้มแย้มแจ่มใส มีประกันสังคมและอาหารกลางวันฟรี'
  },
  {
    id: 'job_02',
    title: 'ช่างซ่อมบำรุงอาคารและระบบไฟฟ้าชุมชน',
    company: 'นิติบุคคลอาคารชุดพหลโยธิน',
    salary: '18,000 - 22,000 บาท/เดือน',
    type: 'งานประจำ',
    location: 'ลาดยาว จตุจักร',
    distance: 1.2,
    phone: '02-555-1234',
    description: 'ดูแลตรวจเช็คระบบไฟฟ้า ประปา ปั๊มน้ำในโครงการ มีประสบการณ์พิจารณาเป็นพิเศษ'
  }
];

export const mockEvents: LocalEvent[] = [
  {
    id: 'event_01',
    title: 'ตลาดนัดปันสุขและกิจกรรมคัดแยกขยะรีไซเคิล',
    date: 'เสาร์ที่ 12 ตุลาคม 2026',
    time: '08:30 - 13:00 น.',
    venue: 'ลานอเนกประสงค์ศาลาประชาคม',
    distance: 0.5,
    organizer: 'กลุ่มจิตอาสาหมู่บ้านพหลโยธินวิลล่า',
    description: 'นำขยะรีไซเคิลมาแลกไข่ไก่ สินค้าอุปโภคบริโภค พร้อมลานขายสินค้ามือสองของลูกบ้าน',
    joinedCount: 48,
    isJoined: false,
    image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'event_02',
    title: 'กิจกรรมวิ่งออกกำลังกายยามเช้าเพื่อสุขภาพ',
    date: 'อาทิตย์ที่ 20 ตุลาคม 2026',
    time: '06:00 - 08:00 น.',
    venue: 'สวนสุขภาพเสนานิคม',
    distance: 1.0,
    organizer: 'ชมรมคนรักสุขภาพจตุจักร',
    description: 'เดิน-วิ่ง 3.5 กม. ร่วมกับเพื่อนบ้านและครอบครัว มีน้ำดื่มและกล้วยหอมบริการฟรี',
    joinedCount: 82,
    isJoined: false,
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800'
  }
];

export const mockRealEstate: RealEstateItem[] = [
  {
    id: 're_01',
    title: 'ทาวน์โฮม 2 ชั้น 3 ห้องนอน 2 ห้องน้ำ รีโนเวทใหม่พร้อมอยู่',
    type: 'เช่า',
    price: '15,000 บาท/เดือน',
    location: 'หมู่บ้านพหลโยธินวิลล่า ซอย 5',
    distance: 0.4,
    phone: '089-555-6677',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800',
    details: 'ที่จอดรถ 2 คัน เครื่องปรับอากาศ 3 เครื่อง ใกล้สถานีรถไฟฟ้า BTS เสนานิคม เลี้ยงสัตว์ได้'
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif_01',
    title: 'ยินดีต้อนรับสู่ LocalHub ชุมชนของคุณ',
    message: 'คุณสามารถรายงานเหตุการณ์ ซื้อขายสินค้าในตลาด และพูดคุยกับเพื่อนบ้านในพื้นที่ได้ทันที',
    time: 'เมื่อสักครู่',
    read: false,
    type: 'community',
    createdAt: Date.now()
  }
];

export const initialContactRequests: AdminContactRequest[] = [
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
