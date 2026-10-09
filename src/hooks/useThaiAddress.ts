import { useState, useEffect, useMemo, useCallback } from 'react';
import { safeStorage } from '../lib/safeStorage';

export interface ThaiAddress {
  district: string; // Tambon / Sub-district
  amphoe: string; // District
  province: string;
  zipcode: number;
}

// Complete 77 provinces fallback data with standard districts & zipcodes
const FALLBACK_THAI_ADDRESSES: ThaiAddress[] = [
  // กรุงเทพมหานคร
  { province: 'กรุงเทพมหานคร', amphoe: 'พระนคร', district: 'พระบรมมหาราชวัง', zipcode: 10200 },
  { province: 'กรุงเทพมหานคร', amphoe: 'พระนคร', district: 'วังบูรพาภิรมย์', zipcode: 10200 },
  { province: 'กรุงเทพมหานคร', amphoe: 'ดุสิต', district: 'ดุสิต', zipcode: 10300 },
  { province: 'กรุงเทพมหานคร', amphoe: 'ดุสิต', district: 'วชิรพยาบาล', zipcode: 10300 },
  { province: 'กรุงเทพมหานคร', amphoe: 'ปทุมวัน', district: 'ปทุมวัน', zipcode: 10330 },
  { province: 'กรุงเทพมหานคร', amphoe: 'ปทุมวัน', district: 'ลุมพินี', zipcode: 10330 },
  { province: 'กรุงเทพมหานคร', amphoe: 'บางรัก', district: 'สีลม', zipcode: 10500 },
  { province: 'กรุงเทพมหานคร', amphoe: 'บางรัก', district: 'สุริยวงศ์', zipcode: 10500 },
  { province: 'กรุงเทพมหานคร', amphoe: 'จตุจักร', district: 'จตุจักร', zipcode: 10900 },
  { province: 'กรุงเทพมหานคร', amphoe: 'จตุจักร', district: 'ลาดยาว', zipcode: 10900 },
  { province: 'กรุงเทพมหานคร', amphoe: 'จตุจักร', district: 'เสนานิคม', zipcode: 10900 },
  { province: 'กรุงเทพมหานคร', amphoe: 'บางกะปิ', district: 'คลองจั่น', zipcode: 10240 },
  { province: 'กรุงเทพมหานคร', amphoe: 'บางกะปิ', district: 'หัวหมาก', zipcode: 10240 },
  { province: 'กรุงเทพมหานคร', amphoe: 'บางนา', district: 'บางนาเหนือ', zipcode: 10260 },
  { province: 'กรุงเทพมหานคร', amphoe: 'บางนา', district: 'บางนาใต้', zipcode: 10260 },
  { province: 'กรุงเทพมหานคร', amphoe: 'คลองเตย', district: 'คลองเตย', zipcode: 10110 },
  { province: 'กรุงเทพมหานคร', amphoe: 'วัฒนา', district: 'คลองเตยเหนือ', zipcode: 10110 },
  { province: 'กรุงเทพมหานคร', amphoe: 'ธนบุรี', district: 'วัดกัลยาณ์', zipcode: 10600 },
  { province: 'กรุงเทพมหานคร', amphoe: 'ภาษีเจริญ', district: 'บางหว้า', zipcode: 10160 },
  { province: 'กรุงเทพมหานคร', amphoe: 'มีนบุรี', district: 'มีนบุรี', zipcode: 10510 },
  { province: 'กรุงเทพมหานคร', amphoe: 'ลาดกระบัง', district: 'ลาดกระบัง', zipcode: 10520 },

  // ปริมณฑล & กลาง
  { province: 'นนทบุรี', amphoe: 'เมืองนนทบุรี', district: 'สวนใหญ่', zipcode: 11000 },
  { province: 'นนทบุรี', amphoe: 'ปากเกร็ด', district: 'ปากเกร็ด', zipcode: 11120 },
  { province: 'นนทบุรี', amphoe: 'บางบัวทอง', district: 'โสนลอย', zipcode: 11110 },
  { province: 'ปทุมธานี', amphoe: 'เมืองปทุมธานี', district: 'บางปรอก', zipcode: 12000 },
  { province: 'ปทุมธานี', amphoe: 'คลองหลวง', district: 'คลองหนึ่ง', zipcode: 12120 },
  { province: 'ปทุมธานี', amphoe: 'ธัญบุรี', district: 'รังสิต', zipcode: 12110 },
  { province: 'สมุทรปราการ', amphoe: 'เมืองสมุทรปราการ', district: 'ปากน้ำ', zipcode: 10270 },
  { province: 'สมุทรปราการ', amphoe: 'บางพลี', district: 'บางพลีใหญ่', zipcode: 10540 },
  { province: 'สมุทรปราการ', amphoe: 'พระประแดง', district: 'ตลาด', zipcode: 10130 },
  { province: 'สมุทรสาคร', amphoe: 'เมืองสมุทรสาคร', district: 'มหาชัย', zipcode: 74000 },
  { province: 'สมุทรสงคราม', amphoe: 'เมืองสมุทรสงคราม', district: 'แม่กลอง', zipcode: 75000 },
  { province: 'นครปฐม', amphoe: 'เมืองนครปฐม', district: 'พระปฐมเจดีย์', zipcode: 73000 },
  { province: 'พระนครศรีอยุธยา', amphoe: 'พระนครศรีอยุธยา', district: 'ประตูชัย', zipcode: 13000 },
  { province: 'สระบุรี', amphoe: 'เมืองสระบุรี', district: 'ปากเพรียว', zipcode: 18000 },
  { province: 'ลพบุรี', amphoe: 'เมืองลพบุรี', district: 'ทะเลชุบศร', zipcode: 15000 },
  { province: 'สิงห์บุรี', amphoe: 'เมืองสิงห์บุรี', district: 'บางพุทรา', zipcode: 16000 },
  { province: 'ชัยนาท', amphoe: 'เมืองชัยนาท', district: 'ในเมือง', zipcode: 17000 },
  { province: 'อ่างทอง', amphoe: 'เมืองอ่างทอง', district: 'ตลาดหลวง', zipcode: 14000 },
  { province: 'สุพรรณบุรี', amphoe: 'เมืองสุพรรณบุรี', district: 'ท่าพี่เลี้ยง', zipcode: 72000 },
  { province: 'นครนายก', amphoe: 'เมืองนครนายก', district: 'นครนายก', zipcode: 26000 },

  // เหนือ
  { province: 'เชียงใหม่', amphoe: 'เมืองเชียงใหม่', district: 'สุเทพ', zipcode: 50200 },
  { province: 'เชียงใหม่', amphoe: 'เมืองเชียงใหม่', district: 'ศรีภูมิ', zipcode: 50200 },
  { province: 'เชียงใหม่', amphoe: 'หางดง', district: 'หางดง', zipcode: 50230 },
  { province: 'เชียงใหม่', amphoe: 'สันทราย', district: 'สันทรายหลวง', zipcode: 50210 },
  { province: 'เชียงใหม่', amphoe: 'แม่ริม', district: 'ริมใต้', zipcode: 50180 },
  { province: 'เชียงราย', amphoe: 'เมืองเชียงราย', district: 'เวียง', zipcode: 57000 },
  { province: 'ลำปาง', amphoe: 'เมืองลำปาง', district: 'เวียงเหนือ', zipcode: 52000 },
  { province: 'ลำพูน', amphoe: 'เมืองลำพูน', district: 'ในเมือง', zipcode: 51000 },
  { province: 'แม่ฮ่องสอน', amphoe: 'เมืองแม่ฮ่องสอน', district: 'จองคำ', zipcode: 58000 },
  { province: 'น่าน', amphoe: 'เมืองน่าน', district: 'ในเมือง', zipcode: 55000 },
  { province: 'พะเยา', amphoe: 'เมืองพะเยา', district: 'เวียง', zipcode: 56000 },
  { province: 'แพร่', amphoe: 'เมืองแพร่', district: 'ในเมือง', zipcode: 54000 },
  { province: 'อุตรดิตถ์', amphoe: 'เมืองอุตรดิตถ์', district: 'ท่าอิฐ', zipcode: 53000 },
  { province: 'ตาก', amphoe: 'เมืองตาก', district: 'ระแหง', zipcode: 63000 },
  { province: 'ตาก', amphoe: 'แม่สอด', district: 'แม่สอด', zipcode: 63110 },
  { province: 'สุโขทัย', amphoe: 'เมืองสุโขทัย', district: 'ธานี', zipcode: 64000 },
  { province: 'พิษณุโลก', amphoe: 'เมืองพิษณุโลก', district: 'ในเมือง', zipcode: 65000 },
  { province: 'พิจิตร', amphoe: 'เมืองพิจิตร', district: 'ในเมือง', zipcode: 66000 },
  { province: 'กำแพงเพชร', amphoe: 'เมืองกำแพงเพชร', district: 'ในเมือง', zipcode: 62000 },
  { province: 'นครสวรรค์', amphoe: 'เมืองนครสวรรค์', district: 'ปากน้ำโพ', zipcode: 60000 },
  { province: 'อุทัยธานี', amphoe: 'เมืองอุทัยธานี', district: 'อุทัยใหม่', zipcode: 61000 },
  { province: 'เพชรบูรณ์', amphoe: 'เมืองเพชรบูรณ์', district: 'ในเมือง', zipcode: 67000 },

  // ตะวันออกเฉียงเหนือ (อีสาน)
  { province: 'ขอนแก่น', amphoe: 'เมืองขอนแก่น', district: 'ในเมือง', zipcode: 40000 },
  { province: 'ขอนแก่น', amphoe: 'บ้านไผ่', district: 'ในเมือง', zipcode: 40110 },
  { province: 'นครราชสีมา', amphoe: 'เมืองนครราชสีมา', district: 'ในเมือง', zipcode: 30000 },
  { province: 'นครราชสีมา', amphoe: 'ปากช่อง', district: 'ปากช่อง', zipcode: 30130 },
  { province: 'อุบลราชธานี', amphoe: 'เมืองอุบลราชธานี', district: 'ในเมือง', zipcode: 34000 },
  { province: 'อุดรธานี', amphoe: 'เมืองอุดรธานี', district: 'หมากแข้ง', zipcode: 41000 },
  { province: 'บุรีรัมย์', amphoe: 'เมืองบุรีรัมย์', district: 'ในเมือง', zipcode: 31000 },
  { province: 'สุรินทร์', amphoe: 'เมืองสุรินทร์', district: 'ในเมือง', zipcode: 32000 },
  { province: 'ศรีสะเกษ', amphoe: 'เมืองศรีสะเกษ', district: 'เมืองใต้', zipcode: 33000 },
  { province: 'ร้อยเอ็ด', amphoe: 'เมืองร้อยเอ็ด', district: 'ในเมือง', zipcode: 45000 },
  { province: 'มหาสารคาม', amphoe: 'เมืองมหาสารคาม', district: 'ตลาด', zipcode: 44000 },
  { province: 'ชัยภูมิ', amphoe: 'เมืองชัยภูมิ', district: 'ในเมือง', zipcode: 36000 },
  { province: 'กาฬสินธุ์', amphoe: 'เมืองกาฬสินธุ์', district: 'กาฬสินธุ์', zipcode: 46000 },
  { province: 'สกลนคร', amphoe: 'เมืองสกลนคร', district: 'ธาตุเชิงชุม', zipcode: 47000 },
  { province: 'นครพนม', amphoe: 'เมืองนครพนม', district: 'ในเมือง', zipcode: 48000 },
  { province: 'เลย', amphoe: 'เมืองเลย', district: 'กุดป่อง', zipcode: 42000 },
  { province: 'หนองคาย', amphoe: 'เมืองหนองคาย', district: 'ในเมือง', zipcode: 43000 },
  { province: 'หนองบัวลำภู', amphoe: 'เมืองหนองบัวลำภู', district: 'ลำภู', zipcode: 39000 },
  { province: 'บึงกาฬ', amphoe: 'เมืองบึงกาฬ', district: 'บึงกาฬ', zipcode: 38000 },
  { province: 'ยโสธร', amphoe: 'เมืองยโสธร', district: 'ในเมือง', zipcode: 35000 },
  { province: 'มุกดาหาร', amphoe: 'เมืองมุกดาหาร', district: 'มุกดาหาร', zipcode: 49000 },
  { province: 'อำนาจเจริญ', amphoe: 'เมืองอำนาจเจริญ', district: 'บุ่ง', zipcode: 37000 },

  // ตะวันออก
  { province: 'ชลบุรี', amphoe: 'เมืองชลบุรี', district: 'บางปลาสร้อย', zipcode: 20000 },
  { province: 'ชลบุรี', amphoe: 'บางละมุง', district: 'พัทยา', zipcode: 20150 },
  { province: 'ชลบุรี', amphoe: 'ศรีราชา', district: 'ศรีราชา', zipcode: 20110 },
  { province: 'ระยอง', amphoe: 'เมืองระยอง', district: 'ท่าประดู่', zipcode: 21000 },
  { province: 'ระยอง', amphoe: 'บ้านฉาง', district: 'บ้านฉาง', zipcode: 21130 },
  { province: 'จันทบุรี', amphoe: 'เมืองจันทบุรี', district: 'วัดใหม่', zipcode: 22000 },
  { province: 'ตราด', amphoe: 'เมืองตราด', district: 'บางพระ', zipcode: 23000 },
  { province: 'ฉะเชิงเทรา', amphoe: 'เมืองฉะเชิงเทรา', district: 'หน้าเมือง', zipcode: 24000 },
  { province: 'ปราจีนบุรี', amphoe: 'เมืองปราจีนบุรี', district: 'หน้าเมือง', zipcode: 25000 },
  { province: 'สระแก้ว', amphoe: 'เมืองสระแก้ว', district: 'สระแก้ว', zipcode: 27000 },

  // ตะวันตก
  { province: 'กาญจนบุรี', amphoe: 'เมืองกาญจนบุรี', district: 'บ้านเหนือ', zipcode: 71000 },
  { province: 'ราชบุรี', amphoe: 'เมืองราชบุรี', district: 'หน้าเมือง', zipcode: 70000 },
  { province: 'เพชรบุรี', amphoe: 'เมืองเพชรบุรี', district: 'คลองกระแชง', zipcode: 76000 },
  { province: 'เพชรบุรี', amphoe: 'ชะอำ', district: 'ชะอำ', zipcode: 76120 },
  { province: 'ประจวบคีรีขันธ์', amphoe: 'เมืองประจวบคีรีขันธ์', district: 'เกาะหลัก', zipcode: 77000 },
  { province: 'ประจวบคีรีขันธ์', amphoe: 'หัวหิน', district: 'หัวหิน', zipcode: 77110 },

  // ใต้
  { province: 'ภูเก็ต', amphoe: 'เมืองภูเก็ต', district: 'ตลาดใหญ่', zipcode: 83000 },
  { province: 'ภูเก็ต', amphoe: 'กะทู้', district: 'ป่าตอง', zipcode: 83150 },
  { province: 'ภูเก็ต', amphoe: 'ถลาง', district: 'เทพกระษัตรี', zipcode: 83110 },
  { province: 'สุราษฎร์ธานี', amphoe: 'เมืองสุราษฎร์ธานี', district: 'ตลาด', zipcode: 84000 },
  { province: 'สุราษฎร์ธานี', amphoe: 'เกาะสมุย', district: 'อ่างทอง', zipcode: 84140 },
  { province: 'นครศรีธรรมราช', amphoe: 'เมืองนครศรีธรรมราช', district: 'ในเมือง', zipcode: 80000 },
  { province: 'สงขลา', amphoe: 'เมืองสงขลา', district: 'บ่อยาง', zipcode: 90000 },
  { province: 'สงขลา', amphoe: 'หาดใหญ่', district: 'หาดใหญ่', zipcode: 90110 },
  { province: 'กระบี่', amphoe: 'เมืองกระบี่', district: 'ปากน้ำ', zipcode: 81000 },
  { province: 'พังงา', amphoe: 'เมืองพังงา', district: 'ท้ายช้าง', zipcode: 82000 },
  { province: 'ระนอง', amphoe: 'เมืองระนอง', district: 'เขานิเวศน์', zipcode: 85000 },
  { province: 'ชุมพร', amphoe: 'เมืองชุมพร', district: 'ท่าตะเภา', zipcode: 86000 },
  { province: 'ตรัง', amphoe: 'เมืองตรัง', district: 'ทับเที่ยง', zipcode: 92000 },
  { province: 'พัทลุง', amphoe: 'เมืองพัทลุง', district: 'คูหาสวรรค์', zipcode: 93000 },
  { province: 'สตูล', amphoe: 'เมืองสตูล', district: 'พิมาน', zipcode: 91000 },
  { province: 'ปัตตานี', amphoe: 'เมืองปัตตานี', district: 'สะบารัง', zipcode: 94000 },
  { province: 'ยะลา', amphoe: 'เมืองยะลา', district: 'สะเตง', zipcode: 95000 },
  { province: 'นราธิวาส', amphoe: 'เมืองนราธิวาส', district: 'บางนาค', zipcode: 96000 }
];

const ALL_77_PROVINCES = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร',
  'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท',
  'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง',
  'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม',
  'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส',
  'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
  'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา',
  'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์',
  'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน',
  'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง',
  'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย',
  'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
  'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี',
  'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย',
  'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์',
  'อุทัยธานี', 'อุบลราชธานี'
];

export function useThaiAddress() {
  const [data, setData] = useState<ThaiAddress[]>(FALLBACK_THAI_ADDRESSES);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      // Check safeStorage cache first
      try {
        const cached = safeStorage.getItem('localhub_thai_address_data');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0 && isMounted) {
            setData(parsed);
            return;
          }
        }
      } catch {
        // Ignore cache error
      }

      try {
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const response = await fetch(
          'https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json',
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          if (Array.isArray(json) && json.length > 0 && isMounted) {
            setData(json);
            try {
              safeStorage.setItem('localhub_thai_address_data', JSON.stringify(json));
            } catch {
              // Ignore cache storage quota limit
            }
          }
        }
      } catch {
        // Fallback data is already initialized gracefully, no need to throw
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const provinces = useMemo(() => {
    const unique = new Set<string>([...ALL_77_PROVINCES, ...data.map(item => item.province)]);
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'th'));
  }, [data]);

  const getAmphoes = useCallback((province: string) => {
    if (!province) return [];
    const filtered = data.filter(item => item.province === province);
    const unique = new Set<string>(filtered.map(item => item.amphoe));
    if (unique.size === 0) {
      return ['เมือง', 'อำเภอเมือง'];
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'th'));
  }, [data]);

  const getTambons = useCallback((province: string, amphoe: string) => {
    if (!province || !amphoe) return [];
    const filtered = data.filter(item => item.province === province && item.amphoe === amphoe);
    const unique = new Set<string>(filtered.map(item => item.district));
    if (unique.size === 0) {
      return ['ในเมือง', 'ตำบลเมือง'];
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'th'));
  }, [data]);

  const getZipcode = useCallback((province: string, amphoe: string, tambon: string) => {
    if (!province) return '';
    const match = data.find(item => 
      item.province === province && 
      (!amphoe || item.amphoe === amphoe) && 
      (!tambon || item.district === tambon)
    );
    return match ? match.zipcode.toString() : '';
  }, [data]);

  return {
    isLoading,
    provinces,
    getAmphoes,
    getTambons,
    getZipcode
  };
}
