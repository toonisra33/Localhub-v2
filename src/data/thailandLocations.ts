export interface SearchAreaItem {
  id: string;
  name: string;
  type: 'subdistrict' | 'district' | 'province' | 'city' | 'country' | 'neighborhood' | 'landmark' | 'transit';
  subdistrict?: string;
  district?: string;
  province?: string;
  country?: string;
  flag?: string;
  lat: number;
  lng: number;
  zoomLevel?: number;
  keywords?: string[];
  description?: string;
}

export const WORLDWIDE_AREAS_DATABASE: SearchAreaItem[] = [
  // --- มหานคร & แลนด์มาร์กสำคัญทั่วโลก (Worldwide Major Cities & Landmarks) ---
  {
    id: 'world_tokyo',
    name: 'โตเกียว (Tokyo, Japan)',
    type: 'city',
    province: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    lat: 35.6762,
    lng: 139.6503,
    zoomLevel: 13,
    keywords: ['tokyo', 'japan', 'โตเกียว', 'ญี่ปุ่น', 'shinjuku', 'shibuya', 'ชิบูย่า', 'ชินจูกุ'],
    description: 'มหานครโตเกียว ประเทศญี่ปุ่น'
  },
  {
    id: 'world_shibuya',
    name: 'ห้าแยกชิบูย่า (Shibuya Crossing, Tokyo)',
    type: 'landmark',
    province: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    lat: 35.6595,
    lng: 139.7005,
    zoomLevel: 17,
    keywords: ['shibuya', 'ชิบูย่า', 'tokyo', 'japan'],
    description: 'ห้าแยกชิบูย่า แลนด์มาร์กชื่อดัง กรุงโตเกียว ญี่ปุ่น'
  },
  {
    id: 'world_paris',
    name: 'ปารีส (Paris, France)',
    type: 'city',
    province: 'Île-de-France',
    country: 'France',
    flag: '🇫🇷',
    lat: 48.8566,
    lng: 2.3522,
    zoomLevel: 13,
    keywords: ['paris', 'france', 'ปารีส', 'ฝรั่งเศส', 'eiffel', 'ไอเฟล'],
    description: 'เมืองหลวงและศูนย์กลางศิลปวัฒนธรรม ประเทศฝรั่งเศส'
  },
  {
    id: 'world_eiffel',
    name: 'หอไอเฟล (Eiffel Tower, Paris)',
    type: 'landmark',
    province: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    lat: 48.8584,
    lng: 2.2945,
    zoomLevel: 17,
    keywords: ['eiffel', 'ไอเฟล', 'paris', 'france'],
    description: 'หอไอเฟล แลนด์มาร์กระดับโลก กรุงปารีส ฝรั่งเศส'
  },
  {
    id: 'world_london',
    name: 'ลอนดอน (London, United Kingdom)',
    type: 'city',
    province: 'Greater London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    lat: 51.5074,
    lng: -0.1278,
    zoomLevel: 13,
    keywords: ['london', 'uk', 'england', 'ลอนดอน', 'อังกฤษ', 'big ben', 'บิ๊กเบน'],
    description: 'เมืองหลวงแห่งสหราชอาณาจักร'
  },
  {
    id: 'world_new_york',
    name: 'นิวยอร์ก (New York City, USA)',
    type: 'city',
    province: 'New York',
    country: 'United States',
    flag: '🇺🇸',
    lat: 40.7128,
    lng: -74.0060,
    zoomLevel: 13,
    keywords: ['new york', 'nyc', 'usa', 'นิวยอร์ก', 'สหรัฐอเมริกา', 'times square', 'manhattan'],
    description: 'มหานครนิวยอร์ก สหรัฐอเมริกา'
  },
  {
    id: 'world_times_square',
    name: 'ไทม์สแควร์ (Times Square, Manhattan, NYC)',
    type: 'landmark',
    province: 'New York',
    country: 'United States',
    flag: '🇺🇸',
    lat: 40.7580,
    lng: -73.9855,
    zoomLevel: 17,
    keywords: ['times square', 'ไทม์สแควร์', 'manhattan', 'nyc', 'new york'],
    description: 'ศูนย์กลางแสงสีเสียงระดับโลก ย่านแมนฮัตตัน นิวยอร์ก'
  },
  {
    id: 'world_singapore',
    name: 'สิงคโปร์ (Singapore)',
    type: 'city',
    country: 'Singapore',
    flag: '🇸🇬',
    lat: 1.3521,
    lng: 103.8198,
    zoomLevel: 13,
    keywords: ['singapore', 'สิงคโปร์', 'marina bay', 'changi'],
    description: 'สาธารณรัฐสิงคโปร์ ศูนย์กลางการค้าและการเงินอาเซียน'
  },
  {
    id: 'world_marina_bay',
    name: 'มารีนาเบย์แซนด์ส (Marina Bay Sands, Singapore)',
    type: 'landmark',
    country: 'Singapore',
    flag: '🇸🇬',
    lat: 1.2838,
    lng: 103.8591,
    zoomLevel: 17,
    keywords: ['marina bay', 'มารีนาเบย์', 'singapore', 'สิงคโปร์'],
    description: 'มารีนาเบย์แซนด์ส แลนด์มาร์กอ่าวมารีนา ประเทศสิงคโปร์'
  },
  {
    id: 'world_seoul',
    name: 'โซล (Seoul, South Korea)',
    type: 'city',
    country: 'South Korea',
    flag: '🇰🇷',
    lat: 37.5665,
    lng: 126.9780,
    zoomLevel: 13,
    keywords: ['seoul', 'korea', 'โซล', 'เกาหลีใต้', 'myeongdong', 'gangnam', 'กังนัม'],
    description: 'กรุงโซล ประเทศเกาหลีใต้'
  },
  {
    id: 'world_dubai',
    name: 'ดูไบ (Dubai, UAE)',
    type: 'city',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    lat: 25.2048,
    lng: 55.2708,
    zoomLevel: 13,
    keywords: ['dubai', 'uae', 'ดูไบ', 'burj khalifa', 'เบิร์จคาลิฟา'],
    description: 'เมืองดูไบ สหรัฐอาหรับเอมิเรตส์'
  },
  {
    id: 'world_burj_khalifa',
    name: 'เบิร์จเคาะลีฟะฮ์ (Burj Khalifa, Dubai)',
    type: 'landmark',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    lat: 25.1972,
    lng: 55.2744,
    zoomLevel: 17,
    keywords: ['burj khalifa', 'เบิร์จคาลิฟา', 'dubai', 'ดูไบ'],
    description: 'ตึกที่สูงที่สุดในโลก นครดูไบ'
  },
  {
    id: 'world_sydney',
    name: 'ซิดนีย์ (Sydney, Australia)',
    type: 'city',
    province: 'New South Wales',
    country: 'Australia',
    flag: '🇦🇺',
    lat: -33.8688,
    lng: 151.2093,
    zoomLevel: 13,
    keywords: ['sydney', 'australia', 'ซิดนีย์', 'ออสเตรเลีย', 'opera house'],
    description: 'มหานครซิดนีย์ ประเทศออสเตรเลีย'
  },
  {
    id: 'world_opera_house',
    name: 'ซิดนีย์โอเปราเฮาส์ (Sydney Opera House)',
    type: 'landmark',
    country: 'Australia',
    flag: '🇦🇺',
    lat: -33.8568,
    lng: 151.2153,
    zoomLevel: 17,
    keywords: ['opera house', 'โอเปราเฮาส์', 'sydney', 'australia'],
    description: 'มรดกโลกทางสถาปัตยกรรม นครซิดนีย์ ออสเตรเลีย'
  },
  {
    id: 'world_berlin',
    name: 'เบอร์ลิน (Berlin, Germany)',
    type: 'city',
    country: 'Germany',
    flag: '🇩🇪',
    lat: 52.5200,
    lng: 13.4050,
    zoomLevel: 13,
    keywords: ['berlin', 'germany', 'เบอร์ลิน', 'เยอรมนี'],
    description: 'เมืองหลวงแห่งสหพันธ์สาธารณรัฐเยอรมนี'
  },
  {
    id: 'world_rome',
    name: 'โรม - โคลอสเซียม (Rome, Italy)',
    type: 'landmark',
    country: 'Italy',
    flag: '🇮🇹',
    lat: 41.8902,
    lng: 12.4922,
    zoomLevel: 15,
    keywords: ['rome', 'italy', 'โรม', 'อิตาลี', 'colosseum', 'โคลอสเซียม'],
    description: 'กรุงโรม นครประวัติศาสตร์ ประเทศอิตาลี'
  },
  {
    id: 'world_hong_kong',
    name: 'ฮ่องกง (Hong Kong, Victoria Harbour)',
    type: 'city',
    country: 'Hong Kong',
    flag: '🇭🇰',
    lat: 22.3193,
    lng: 114.1694,
    zoomLevel: 13,
    keywords: ['hong kong', 'hk', 'ฮ่องกง', 'kowloon', 'victoria peak'],
    description: 'เขตบริหารพิเศษฮ่องกง'
  },
  {
    id: 'world_taipei',
    name: 'ไทเป (Taipei 101, Taiwan)',
    type: 'city',
    country: 'Taiwan',
    flag: '🇹🇼',
    lat: 25.0330,
    lng: 121.5654,
    zoomLevel: 14,
    keywords: ['taipei', 'taiwan', 'ไทเป', 'ไต้หวัน', 'taipei 101'],
    description: 'กรุงไทเป ประเทศไต้หวัน'
  },

  // --- ประเทศไทย (Thailand Major Districts & Cities) ---
  {
    id: 'area_lat_yao',
    name: 'ตำบลลาดยาว (ม.เกษตรศาสตร์ / พหลโยธิน)',
    type: 'subdistrict',
    subdistrict: 'ลาดยาว',
    district: 'จตุจักร',
    province: 'กรุงเทพมหานคร',
    country: 'Thailand',
    flag: '🇹🇭',
    lat: 13.8423,
    lng: 100.5750,
    zoomLevel: 15,
    keywords: ['ลาดยาว', 'เกษตร', 'งามวงศ์วาน', 'วิภาวดี', 'พหลโยธิน'],
    description: 'แขวงลาดยาว เขตจตุจักร กรุงเทพมหานคร'
  },
  {
    id: 'area_sena_nikhom',
    name: 'ตำบลเสนานิคม (เสนานิคม 1 / วังหิน)',
    type: 'subdistrict',
    subdistrict: 'เสนานิคม',
    district: 'จตุจักร',
    province: 'กรุงเทพมหานคร',
    country: 'Thailand',
    flag: '🇹🇭',
    lat: 13.8324,
    lng: 100.5752,
    zoomLevel: 16,
    keywords: ['เสนา', 'เสนานิคม', 'ซอยเสนา', 'พหลโยธิน 32', 'วังหิน', 'โชคชัย 4'],
    description: 'แขวงเสนานิคม เขตจตุจักร กรุงเทพมหานคร'
  },
  {
    id: 'area_chan_kasem',
    name: 'ตำบลจันทรเกษม (รัชดาภิเษก / ศาลอาญา)',
    type: 'subdistrict',
    subdistrict: 'จันทรเกษม',
    district: 'จตุจักร',
    province: 'กรุงเทพมหานคร',
    country: 'Thailand',
    flag: '🇹🇭',
    lat: 13.8210,
    lng: 100.5820,
    zoomLevel: 15,
    keywords: ['จันทรเกษม', 'รัชดา', 'ศาลอาญา', 'ม.ราชภัฏจันทรเกษม'],
    description: 'แขวงจันทรเกษม เขตจตุจักร กรุงเทพมหานคร'
  },
  {
    id: 'area_chom_phon',
    name: 'ตำบลจอมพล (ห้าแยกลาดพร้าว / เซ็นทรัลลาดพร้าว)',
    type: 'subdistrict',
    subdistrict: 'จอมพล',
    district: 'จตุจักร',
    province: 'กรุงเทพมหานคร',
    country: 'Thailand',
    flag: '🇹🇭',
    lat: 13.8164,
    lng: 100.5612,
    zoomLevel: 15,
    keywords: ['จอมพล', 'ห้าแยกลาดพร้าว', 'เซ็นทรัลลาดพร้าว', 'ยูเนี่ยนมอลล์', 'พหลโยธิน'],
    description: 'แขวงจอมพล เขตจตุจักร กรุงเทพมหานคร'
  },
  {
    id: 'area_chatuchak',
    name: 'ตำบลจตุจักร (สวนจตุจักร / ตลาดนัดจตุจักร)',
    type: 'subdistrict',
    subdistrict: 'จตุจักร',
    district: 'จตุจักร',
    province: 'กรุงเทพมหานคร',
    country: 'Thailand',
    flag: '🇹🇭',
    lat: 13.8032,
    lng: 100.5539,
    zoomLevel: 15,
    keywords: ['จตุจักร', 'สวนจตุจักร', 'ตลาดนัดจตุจักร', 'หมอชิต', 'bts หมอชิต'],
    description: 'แขวงจตุจักร เขตจตุจักร กรุงเทพมหานคร'
  },
  {
    id: 'area_krung_thep_aphiwat',
    name: 'สถานีกลางกรุงเทพอภิวัฒน์ (บางซื่อแกรนด์สเตชัน)',
    type: 'transit',
    district: 'จตุจักร',
    province: 'กรุงเทพมหานคร',
    country: 'Thailand',
    flag: '🇹🇭',
    lat: 13.8038,
    lng: 100.5398,
    zoomLevel: 16,
    keywords: ['สถานีกลางบางซื่อ', 'กรุงเทพอภิวัฒน์', 'รถไฟ', 'srt', 'mrt บางซื่อ'],
    description: 'ศูนย์กลางคมนาคมระบบราง เขตจตุจักร'
  },
  {
    id: 'area_ari',
    name: 'ย่านอารีย์ - สะพานควาย (เขตพญาไท)',
    type: 'neighborhood',
    subdistrict: 'สามเสนใน',
    district: 'พญาไท',
    province: 'กรุงเทพมหานคร',
    country: 'Thailand',
    flag: '🇹🇭',
    lat: 13.7801,
    lng: 100.5442,
    zoomLevel: 16,
    keywords: ['อารีย์', 'ari', 'สะพานควาย', 'พญาไท', 'คาเฟ่อารีย์', 'bts อารีย์'],
    description: 'ย่านคาเฟ่และชุมชนสร้างสรรค์ เขตพญาไท'
  },
  {
    id: 'area_siam',
    name: 'ย่านสยามสแควร์ - ปทุมวัน (สยามพารากอน / จุฬาฯ)',
    type: 'landmark',
    subdistrict: 'ปทุมวัน',
    district: 'ปทุมวัน',
    province: 'กรุงเทพมหานคร',
    country: 'Thailand',
    flag: '🇹🇭',
    lat: 13.7462,
    lng: 100.5348,
    zoomLevel: 16,
    keywords: ['สยาม', 'siam', 'พารากอน', 'จุฬา', 'ปทุมวัน', 'mbk', 'bts สยาม'],
    description: 'ศูนย์กลางธุรกิจ แฟชั่น และการศึกษา เขตปทุมวัน'
  },
  {
    id: 'area_chiang_mai_nimman',
    name: 'นิมมานเหมินท์ - ม.เชียงใหม่ (อำเภอเมืองเชียงใหม่)',
    type: 'neighborhood',
    district: 'เมืองเชียงใหม่',
    province: 'เชียงใหม่',
    country: 'Thailand',
    flag: '🇹🇭',
    lat: 18.7961,
    lng: 98.9686,
    zoomLevel: 15,
    keywords: ['นิมมาน', 'เชียงใหม่', 'nimman', 'มช', 'สุเทพ', 'ห้วยแก้ว'],
    description: 'ย่านท่องเที่ยวและไลฟ์สไตล์ จ.เชียงใหม่'
  },
  {
    id: 'area_phuket_old_town',
    name: 'ย่านเมืองเก่าภูเก็ต (อำเภอเมืองภูเก็ต)',
    type: 'neighborhood',
    district: 'เมืองภูเก็ต',
    province: 'ภูเก็ต',
    country: 'Thailand',
    flag: '🇹🇭',
    lat: 7.8841,
    lng: 98.3904,
    zoomLevel: 15,
    keywords: ['ภูเก็ต', 'เมืองเก่า', 'phuket old town', 'ถลาง', 'ป่าตอง'],
    description: 'ย่านประวัติศาสตร์สถาปัตยกรรมชิโนโปรตุกีส จ.ภูเก็ต'
  },
  {
    id: 'area_pattaya_beach',
    name: 'เมืองพัทยา - หาดจอมเทียน (ชลบุรี)',
    type: 'neighborhood',
    district: 'บางละมุง',
    province: 'ชลบุรี',
    country: 'Thailand',
    flag: '🇹🇭',
    lat: 12.9276,
    lng: 100.8771,
    zoomLevel: 14,
    keywords: ['พัทยา', 'pattaya', 'หาดจอมเทียน', 'แหลมบาลีฮาย', 'ชลบุรี'],
    description: 'เมืองท่องเที่ยวชายทะเลระดับโลก จ.ชลบุรี'
  }
];

export const THAILAND_AREAS_DATABASE = WORLDWIDE_AREAS_DATABASE;
