import { Alert, MorningBrief, Post, Product, LocalShop, LocalJob, LocalEvent, RealEstateItem, AppNotification, Location } from './types';

export const initialLocation: Location = {
  province: 'กรุงเทพมหานคร',
  district: 'จตุจักร',
  subdistrict: 'ลาดยาว',
  village: 'หมู่บ้านพหลโยธินวิลล่า'
};

export const availableLocations: Location[] = [
  { province: 'กรุงเทพมหานคร', district: 'จตุจักร', subdistrict: 'ลาดยาว', village: 'หมู่บ้านพหลโยธินวิลล่า' },
  { province: 'กรุงเทพมหานคร', district: 'จตุจักร', subdistrict: 'เสนานิคม', village: 'ชุมชนเสนานิคม 1' },
  { province: 'กรุงเทพมหานคร', district: 'จตุจักร', subdistrict: 'จันทรเกษม', village: 'หมู่บ้านรัชดาการ์เด้น' },
  { province: 'กรุงเทพมหานคร', district: 'บางเขน', subdistrict: 'อนุสาวรีย์', village: 'ชุมชนสะพานใหม่' },
  { province: 'นนทบุรี', district: 'เมืองนนทบุรี', subdistrict: 'บางเขน', village: 'หมู่บ้านประชานิเวศน์ 3' },
];

export const mockMorningBrief: MorningBrief = {
  weather: 'มีเมฆบางส่วน โอกาสฝนตก 20%',
  roadClosures: 1,
  events: 3,
  newShops: 2,
  newJobs: 7,
  announcements: 4
};

export const initialAlerts: Alert[] = [
  {
    id: '1',
    type: 'flood',
    title: 'น้ำกำลังเพิ่มระดับ ในซอยพหลฯ 35',
    description: 'ซอยพหลโยธิน 35 น้ำเริ่มท่วมขังสูงประมาณ 15-20 ซม. รอระบาย รถเล็กควรระมัดระวัง',
    location: { ...initialLocation, distance: 0.5 },
    time: '10 นาทีที่แล้ว',
    status: 'members',
    confirmations: 38,
    rejections: 2,
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=600',
    reportedBy: 'สมศักดิ์ ชาวซอย 35'
  },
  {
    id: '2',
    type: 'road',
    title: 'ถนนปิดชั่วคราว ซ่อมผิวจราจร',
    description: 'มีการซ่อมแซมผิวจราจรหน้าปากซอยเสนานิคม โปรดหลีกเลี่ยงและใช้เส้นทางลัดทางซอย 32',
    location: { ...initialLocation, distance: 1.2 },
    time: '1 ชั่วโมงที่แล้ว',
    status: 'authority',
    confirmations: 120,
    rejections: 0,
    image: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&q=80&w=600',
    reportedBy: 'สำนักงานเขตจตุจักร'
  },
  {
    id: '3',
    type: 'power',
    title: 'ไฟฟ้าดับชั่วคราว โซนท้ายซอย',
    description: 'ไฟดับบริเวณโซนท้ายซอย กำลังประสานงานเจ้าหน้าที่ กฟน. เข้าตรวจสอบหม้อแปลง',
    location: { ...initialLocation, distance: 0.8 },
    time: '5 นาทีที่แล้ว',
    status: 'unconfirmed',
    confirmations: 5,
    rejections: 1,
    reportedBy: 'พี่เก่ง ร้านกาแฟ'
  }
];

export const initialPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'สมชาย รักดี',
      avatar: 'https://i.pravatar.cc/150?u=somchai'
    },
    authorUid: 'user_default_somchai',
    content: 'ใครเจอสุนัขสีขาว พันธุ์พุดเดิ้ล บริเวณตลาดบ้างครับ หายไปตั้งแต่เมื่อคืน น้องชื่อ "ปุยฝ้าย" มีปลอกคอสีแดง ติดต่อ 081-234-5678 มีสินน้ำใจให้ครับ 🙏',
    location: { province: 'กรุงเทพมหานคร', district: 'จตุจักร', subdistrict: 'ลาดยาว', distance: 0.2 },
    time: '2 ชั่วโมงที่แล้ว',
    likes: 45,
    comments: 2,
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600',
    isLiked: false,
    category: 'ตามหาของ/สัตว์เลี้ยง',
    checkIn: {
      placeName: 'ตลาดสดพัฒนา ลาดยาว',
      subdistrict: 'ลาดยาว',
      district: 'จตุจักร',
      province: 'กรุงเทพมหานคร',
      country: 'Thailand',
      latitude: 13.8402,
      longitude: 100.5750,
      category: 'shop',
      address: 'ซอยงามวงศ์วาน 54 แขวงลาดยาว เขตจตุจักร'
    },
    commentList: [
      {
        id: 'c1',
        author: { name: 'ป้าหน่อย ซอย 3', avatar: 'https://i.pravatar.cc/150?u=noi' },
        content: 'เหมือนเห็นวิ่งเล่นอยู่แถวหน้าเซเว่นปากซอยเมื่อเช้าตรู่ ลองไปดูนะคะ',
        time: '1 ชั่วโมงที่แล้ว'
      },
      {
        id: 'c2',
        author: {
      name: 'สมชาย รักดี',
      avatar: 'https://i.pravatar.cc/150?u=somchai'
    },
    authorUid: 'user_default_somchai',
        content: 'ขอบคุณมากครับป้าหน่อย กำลังรีบเดินไปดูครับ!',
        time: '45 นาทีที่แล้ว'
      }
    ]
  },
  {
    id: '2',
    author: {
      name: 'ป้าศรี ของหวานโบราณ',
      avatar: 'https://i.pravatar.cc/150?u=pasri'
    },
    authorUid: 'user_default_pasri',
    content: 'วันนี้ร้านป้าศรีทำบัวลอยไข่หวานหม้อใหญ่นะคะ มะพร้าวอ่อนกะทิสดหอมๆ แวะมาอุดหนุนกันได้ที่หน้าปากซอยค่ะ เริ่มขาย 16:00 น. ถ้วยละ 35 บาทเท่านั้นจ้า',
    location: { province: 'กรุงเทพมหานคร', district: 'จตุจักร', subdistrict: 'ลาดยาว', distance: 0.3 },
    time: '4 ชั่วโมงที่แล้ว',
    likes: 128,
    comments: 1,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600',
    isLiked: true,
    category: 'ร้านอร่อยชุมชน',
    checkIn: {
      placeName: 'ร้านขนมหวานป้าศรี สูตรโบราณ',
      subdistrict: 'ลาดยาว',
      district: 'จตุจักร',
      province: 'กรุงเทพมหานคร',
      country: 'Thailand',
      latitude: 13.8340,
      longitude: 100.5710,
      category: 'restaurant',
      address: 'หน้าซอยพหลโยธิน 34 แยก 11'
    },
    commentList: [
      {
        id: 'c3',
        author: { name: 'น้องจอย', avatar: 'https://i.pravatar.cc/150?u=joy' },
        content: 'จอง 3 ถ้วยนะคะป้าศรี เดี๋ยวเลิกงาน 5 โมงแวะไปรับค่ะ',
        time: '2 ชั่วโมงที่แล้ว'
      }
    ]
  },
  {
    id: '3',
    author: {
      name: 'คณะกรรมการพัฒนาชุมชน',
      avatar: 'https://i.pravatar.cc/150?u=committee'
    },
    content: 'ขอเชิญร่วมงานบุญและกิจกรรมตรวจสุขภาพฟรี โดยแพทย์อาสา ณ ลานอเนกประสงค์วัดเสนานิคม วันอาทิตย์นี้ 08:30 - 12:00 น. มีตรวจวัดความดัน ตรวจน้ำตาล และให้คำปรึกษาฟรีครับ',
    location: { province: 'กรุงเทพมหานคร', district: 'จตุจักร', subdistrict: 'เสนานิคม', distance: 2.5 },
    time: '6 ชั่วโมงที่แล้ว',
    likes: 340,
    comments: 0,
    image: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&q=80&w=600',
    isLiked: false,
    category: 'ข่าวสารชุมชน',
    checkIn: {
      placeName: 'วัดเสนานิคม & ลานกิจกรรมชุมชน',
      subdistrict: 'เสนานิคม',
      district: 'จตุจักร',
      province: 'กรุงเทพมหานคร',
      country: 'Thailand',
      latitude: 13.8290,
      longitude: 100.5840,
      category: 'event',
      address: 'ถนนเสนานิคม 1 แขวงเสนานิคม เขตจตุจักร'
    },
    commentList: []
  }
];

export const initialProducts: Product[] = [
  {
    id: '1',
    title: 'มะม่วงน้ำดอกไม้หวานฉ่ำจากสวน',
    price: 50,
    seller: 'ลุงชม สวนผลไม้',
    sellerPhone: '089-112-2334',
    distance: 2.3,
    category: 'สินค้าเกษตร',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=600',
    description: 'มะม่วงน้ำดอกไม้สุกธรรมชาติ ปลอดสารพิษ กิโลกรัมละ 50 บาท ส่งฟรีในเขตจตุจักรและเสนานิคม',
    locationName: 'ตลาดสดพัฒนาชุมชน'
  },
  {
    id: '2',
    title: 'จักรยานแม่บ้านมือสอง สภาพ 90%',
    price: 800,
    seller: 'น้องเมย์ ซอย 5',
    sellerPhone: '086-555-7890',
    distance: 0.8,
    category: 'ของมือสอง',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600',
    description: 'จักรยานมีตะกร้าหน้าพร้อมใช้งาน ยางเพิ่งเปลี่ยนใหม่ เบรกดี นัดรับได้ที่คอนโดรัชโยธิน',
    locationName: 'ซอยพหลโยธิน 35'
  },
  {
    id: '3',
    title: 'ข้าวกล่องกะเพราหมูกรอบไข่ดาว',
    price: 55,
    seller: 'ครัวเจ๊นก ตามสั่ง',
    sellerPhone: '081-999-4433',
    distance: 1.1,
    category: 'อาหาร/เครื่องดื่ม',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600',
    description: 'หมูกรอบทำเอง หนังกรอบฟู ผัดกะเพราโบราณรสจัดจ้าน สั่ง 3 กล่องขึ้นไปส่งฟรี',
    locationName: 'หน้าปากซอยเสนานิคม 1'
  },
  {
    id: '4',
    title: 'บริการช่างซ่อมท่อประปา ปั๊มน้ำ',
    price: 300,
    seller: 'ช่างดำ บริการ 24 ชม.',
    sellerPhone: '090-444-1212',
    distance: 3.5,
    category: 'บริการซ่อม',
    image: 'https://images.unsplash.com/photo-1581092926289-e9162ab7a24f?auto=format&fit=crop&q=80&w=600',
    description: 'รับซ่อมท่อรั่ว ซ่อมปั๊มน้ำ แก้ท่อตัน ติดตั้งสุขภัณฑ์ ประสบการณ์กว่า 15 ปี คิดตามหน้างานจริง',
    locationName: 'บริการถึงบ้านทุกหมู่บ้าน'
  },
  {
    id: '5',
    title: 'คอนโดให้เช่า ลาดพร้าว-พหลฯ ติด BTS',
    price: 8500,
    seller: 'คุณกิตติ เจ้าของปล่อยเอง',
    sellerPhone: '082-333-8899',
    distance: 1.8,
    category: 'อสังหาฯ/ที่พัก',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600',
    description: 'ห้อง 1 Bedroom ขนาด 30 ตร.ม. เฟอร์นิเจอร์และเครื่องใช้ไฟฟ้าครบ พร้อมเข้าอยู่ได้ทันที',
    locationName: 'BTS เสนานิคม'
  },
  {
    id: '6',
    title: 'เมล่อนญี่ปุ่น ปลูกระบบปิด หวานฉ่ำ 14 บริกซ์',
    price: 180,
    seller: 'ฟาร์มไฮโดรโปร ซอย 32',
    sellerPhone: '083-456-7890',
    distance: 1.4,
    category: 'สินค้าเกษตร',
    image: 'https://images.unsplash.com/photo-1571575179703-499aa697aca5?auto=format&fit=crop&q=80&w=600',
    description: 'ตัดสดจากโรงเรือน เนื้อเขียว หอมละมุน ปลอดสารเคมี 100% ลูกละประมาณ 1.5 - 1.8 กก.',
    locationName: 'ซอยพหลโยธิน 32'
  },
  {
    id: '7',
    title: 'กล้องฟิล์ม Retro Olympus Trip 35',
    price: 2400,
    seller: 'ต้นวินเทจ สะสมของเก่า',
    sellerPhone: '085-998-1122',
    distance: 0.9,
    category: 'ของมือสอง',
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=600',
    description: 'สภาพสะสม 95% ทำงานเต็มระบบ เลนส์ใส ไม่มีรา ฝ้า พร้อมสายคล้องหนังแท้',
    locationName: 'หน้ามหาลัยเกษตรศาสตร์'
  },
  {
    id: '8',
    title: 'ครัวซองต์เนยฝรั่งเศส อบสดใหม่ทุกเช้า',
    price: 65,
    seller: 'Bake & Bloom โฮมเมด',
    sellerPhone: '089-771-4455',
    distance: 0.6,
    category: 'อาหาร/เครื่องดื่ม',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600',
    description: 'ใช้เนย AOP แท้จากฝรั่งเศส หอมเนย กรอบนอกนุ่มใน สั่งล่วงหน้าหรือรับหน้าร้านได้เลยครับ',
    locationName: 'ซอยพหลโยธิน 35 แยก 2'
  }
];

export const mockShops: LocalShop[] = [
  {
    id: 's1',
    name: 'ก๋วยเตี๋ยวเรืออยุธยาสูตรโบราณ นายเอก',
    category: 'อาหาร/เครื่องดื่ม',
    rating: 4.8,
    reviewsCount: 142,
    distance: 0.4,
    openHours: '08:30 - 16:30 น. (ทุกวัน)',
    phone: '081-333-7766',
    address: 'ตรงข้ามปากซอยพหลโยธิน 35/1',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400',
    tags: ['น้ำตกเข้มข้น', 'กากหมูเจียว', 'ห้องแอร์']
  },
  {
    id: 's2',
    name: 'คาเฟ่บ้านสวน กาแฟดริป & เบเกอรี่โฮมเมด',
    category: 'คาเฟ่ & เบเกอรี่',
    rating: 4.9,
    reviewsCount: 98,
    distance: 0.9,
    openHours: '07:30 - 18:00 น. (ปิดวันจันทร์)',
    phone: '089-778-9900',
    address: 'ซอยเสนานิคม 1 แยก 12',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=400',
    tags: ['มีที่จอดรถ', 'Wi-Fi ฟรี', 'ต้นไม้ร่มรื่น']
  },
  {
    id: 's3',
    name: 'ร้านขายยา ชุมชนเภสัช',
    category: 'สุขภาพ & ยา',
    rating: 4.7,
    reviewsCount: 65,
    distance: 0.2,
    openHours: '08:00 - 22:00 น. (ทุกวัน)',
    phone: '02-555-1234',
    address: 'ติด 7-Eleven ปากซอย 35',
    image: 'https://images.unsplash.com/photo-1586015555751-63c27b0b2326?auto=format&fit=crop&q=80&w=400',
    tags: ['มีเภสัชกรตลอดเวลา', 'วัดความดันฟรี', 'รับบัตรเครดิต']
  },
  {
    id: 's4',
    name: 'คลินิกรักษาสัตว์เพื่อนคู่ใจ 24 ชม.',
    category: 'สัตว์เลี้ยง',
    rating: 4.9,
    reviewsCount: 210,
    distance: 1.5,
    openHours: 'เปิดตลอด 24 ชั่วโมง',
    phone: '02-999-5555',
    address: 'ถนนพหลโยธิน แขวงลาดยาว',
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400',
    tags: ['ฉุกเฉิน 24 ชม.', 'ผ่าตัด', 'อาบน้ำตัดขน']
  }
];

export const mockJobs: LocalJob[] = [
  {
    id: 'j1',
    title: 'พนักงานชงกาแฟ / บาริสต้า (Full-time)',
    company: 'ร้านกาแฟบ้านสวน ซอยเสนา',
    salary: '16,000 - 18,000 บาท/เดือน',
    type: 'งานประจำ',
    location: 'ซอยเสนานิคม 1',
    distance: 0.9,
    phone: '089-778-9900',
    description: 'ยินดีรับคนไม่มีประสบการณ์ มีการเทรนให้ ทำงาน 6 วัน/สัปดาห์ มีเบี้ยขยันและทิปรายวัน'
  },
  {
    id: 'j2',
    title: 'พนักงานจัดสต็อก & แคชเชียร์มินิมาร์ท',
    company: 'ร้านสะดวกซื้อชุมชนมาร์เก็ต',
    salary: '450 บาท/วัน (จ่ายรายสัปดาห์)',
    type: 'รายวัน',
    location: 'ปากซอยพหลฯ 35',
    distance: 0.3,
    phone: '081-555-4321',
    description: 'เข้ากะเช้า 07:00 - 15:00 น. หรือกะบ่าย 15:00 - 23:00 น. อาหารฟรี 1 มื้อ'
  },
  {
    id: 'j3',
    title: 'ผู้ช่วยกุ๊ก / เตรียมอาหารตามสั่ง',
    company: 'ครัวเจ๊นก ตามสั่ง',
    salary: '14,000 - 16,000 บาท/เดือน',
    type: 'งานประจำ',
    location: 'เสนานิคม',
    distance: 1.1,
    phone: '081-999-4433',
    description: 'ช่วยเตรียมวัตถุดิบ ล้างจาน ดูแลความสะอาดในครัว ทำงาน 09:00 - 19:00 น.'
  }
];

export const mockEvents: LocalEvent[] = [
  {
    id: 'e1',
    title: 'งานตลาดนัดคนเดินริมคลองชุมชน & ดนตรีในสวน',
    date: 'เสาร์ - อาทิตย์ นี้',
    time: '16:00 - 21:30 น.',
    venue: 'ลานริมน้ำ ชุมชนฝั่งตะวันตก',
    distance: 1.2,
    organizer: 'สโมสรคนรักชุมชน',
    description: 'พบกับร้านค้าของกินพื้นถิ่นกว่า 50 ร้าน สินค้าแฮนด์เมด และการแสดงดนตรีเปิดหมวกจากเยาวชนในย่าน',
    joinedCount: 185,
    isJoined: false,
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'e2',
    title: 'ตรวจสุขภาพประจำปีฟรี & ฉีดวัคซีนไข้หวัดใหญ่',
    date: 'วันอาทิตย์ที่ 6 กันยายน',
    time: '08:30 - 12:00 น.',
    venue: 'ศาลาประชาคมหมู่บ้าน A',
    distance: 0.5,
    organizer: 'ศูนย์บริการสาธารณสุข 17',
    description: 'บริการตรวจสุขภาพผู้สูงอายุ ตรวจเบาหวาน ความดันโลหิตสูง และรับยาฟรีสำหรับผู้มีสิทธิบัตรทอง',
    joinedCount: 94,
    isJoined: true,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600'
  }
];

export const mockRealEstate: RealEstateItem[] = [
  {
    id: 're1',
    title: 'ทาวน์โฮม 2 ชั้น 3 ห้องนอน 2 ห้องน้ำ รีโนเวทใหม่',
    type: 'เช่า',
    price: '15,000 บาท/เดือน',
    location: 'หมู่บ้านพหลโยธินวิลล่า',
    distance: 0.2,
    phone: '089-222-1144',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=500',
    details: 'จอดรถได้ 2 คัน มีแอร์ครบทุกห้อง ใกล้รถไฟฟ้าสายสีเขียว สัญญาขั้นต่ำ 1 ปี'
  },
  {
    id: 're2',
    title: 'ที่ดินเปล่า 100 ตร.ว. ทำเลสวย เหมาะสร้างบ้านหรือโฮมออฟฟิศ',
    type: 'ขาย',
    price: '6,500,000 บาท',
    location: 'ซอยเสนานิคม 1 แยก 8',
    distance: 1.4,
    phone: '081-888-9900',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=500',
    details: 'หน้ากว้าง 16 เมตร ลึก 25 เมตร ถมแล้ว น้ำไฟพร้อม เข้าออกได้ทั้งพหลโยธินและเกษตรนวมินทร์'
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: '🚨 การเตือนภัย: น้ำเริ่มท่วมขัง ซอยพหลฯ 35',
    message: 'มีสมาชิกในชุมชน 38 คนร่วมยืนยันสถานการณ์ โปรดวางแผนการเดินทาง',
    time: '15 นาทีที่แล้ว',
    read: false,
    type: 'alert'
  },
  {
    id: 'n2',
    title: '📢 แอดมินส่งประกาศด่วนในพื้นที่ของคุณ',
    message: 'ตรวจสอบแถบประกาศด้านบนเพื่อดูข้อมูลการตัดกระแสไฟฟ้าหรือข่าวสารล่าสุด',
    time: '1 ชั่วโมงที่แล้ว',
    read: false,
    type: 'broadcast'
  },
  {
    id: 'n3',
    title: '💬 ความคิดเห็นใหม่บนโพสต์ของคุณ',
    message: 'ป้าหน่อย ซอย 3 ได้แสดงความคิดเห็นบนโพสต์ตามหาสัตว์เลี้ยง',
    time: '2 ชั่วโมงที่แล้ว',
    read: true,
    type: 'community'
  }
];

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

