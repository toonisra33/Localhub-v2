import React, { useState } from 'react';
import {
  X,
  Briefcase,
  Search,
  MapPin,
  Clock,
  Phone,
  Building,
  CheckCircle2,
  Plus,
  DollarSign,
  Filter,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

export interface CommunityJob {
  id: string;
  title: string;
  company: string;
  type: 'fulltime' | 'parttime' | 'daily' | 'freelance';
  typeLabel: string;
  salary: string;
  location: string;
  description: string;
  requirements: string[];
  contactName: string;
  contactPhone: string;
  createdAt: number;
  tags: string[];
}

const INITIAL_JOBS: CommunityJob[] = [
  {
    id: 'job_1',
    title: 'พนักงานบริการลูกค้า & บาริสต้า (ร้านกาแฟสด)',
    company: 'Cafe De Local (สาขาวัฒนา)',
    type: 'fulltime',
    typeLabel: 'งานประจำ',
    salary: '฿18,000 - ฿22,000 / เดือน',
    location: 'สุขุมวิท 23, วัฒนา, กรุงเทพฯ',
    description: 'ชงเครื่องดื่มกาแฟและชา ต้อนรับลูกค้า ดูแลความสะอาดหน้าร้าน ไม่จำเป็นต้องมีประสบการณ์ มีการสอนงานให้',
    requirements: ['อายุ 18-35 ปี', 'อัธยาศัยดี ยิ้มแย้ม', 'ตรงต่อเวลา'],
    contactName: 'คุณกานต์ (ผู้จัดการร้าน)',
    contactPhone: '081-234-5678',
    createdAt: Date.now() - 3600000 * 5,
    tags: ['กาแฟ', 'บริการ', 'มีประกันสังคม', 'อาหารฟรี']
  },
  {
    id: 'job_2',
    title: 'ช่างซ่อมบำรุงไฟฟ้า & แอร์ประจำหมู่บ้าน/คอนโด',
    company: 'นิติบุคคลชุมชนสุขุมวิท',
    type: 'daily',
    typeLabel: 'งานรายวัน / ฟรีแลนซ์',
    salary: '฿650 - ฿900 / วัน',
    location: 'อโศก - คลองเตยเหนือ, กรุงเทพฯ',
    description: 'ตรวจเช็คระบบไฟฟ้า หลอดไฟ ปั๊มน้ำ และล้างแอร์ตามบ้านลูกบ้านในชุมชน จ่ายเงินสดรายวัน',
    requirements: ['มีความรู้ช่างไฟฟ้าพื้นฐาน', 'มีเครื่องมือพื้นฐานส่วนตัว'],
    contactName: 'คุณสมศักดิ์ (หัวหน้าช่าง)',
    contactPhone: '089-876-5432',
    createdAt: Date.now() - 3600000 * 12,
    tags: ['ช่างไฟฟ้า', 'จ่ายสดรายวัน', 'เลือกวันทำได้']
  },
  {
    id: 'job_3',
    title: 'พนักงานจัดเรียงสินค้า & แคชเชียร์มินิมาร์ท',
    company: 'มินิมาร์ท ชุมชนร่มเย็น',
    type: 'parttime',
    typeLabel: 'พาร์ทไทม์',
    salary: '฿60 / ชั่วโมง (เฉลี่ย ฿13,500/ด.)',
    location: 'เอกมัย, วัฒนา, กรุงเทพฯ',
    description: 'คิดเงินหน้าร้าน จัดเติมสินค้าบนเชลฟ์ กะบ่าย 13:00 - 21:00 น. เหมาะสำหรับนักศึกษาหรือผู้หารายได้เสริม',
    requirements: ['ซื่อสัตย์', 'ใช้คอมพิวเตอร์และเครื่อง POS ได้'],
    contactName: 'ป้านฤมล',
    contactPhone: '082-345-6789',
    createdAt: Date.now() - 3600000 * 24,
    tags: ['พาร์ทไทม์', 'นักศึกษาทำได้', 'เบี้ยขยัน']
  },
  {
    id: 'job_4',
    title: 'ไรเดอร์ส่งของ & อาหารด่วนเฉพาะในชุมชน',
    company: 'LocalHub Express Delivery',
    type: 'freelance',
    typeLabel: 'ฟรีแลนซ์ / อิสระ',
    salary: '฿700 - ฿1,200 / วัน',
    location: 'วิ่งงานในรัศมี 5 กม. จากที่พัก',
    description: 'รับส่งอาหารและพัสดุจากร้านค้าในตลาดชุมชนส่งถึงหน้าบ้านเพื่อนบ้าน รายได้ดี ไม่ต้องเดินทางไกล',
    requirements: ['มีรถจักรยานยนต์และใบขับขี่', 'มีสมาร์ทโฟน'],
    contactName: 'ทีมจัดส่ง LocalHub',
    contactPhone: '02-123-4567',
    createdAt: Date.now() - 3600000 * 30,
    tags: ['ไรเดอร์', 'งานอิสระ', 'รายวัน']
  },
  {
    id: 'job_5',
    title: 'ผู้ช่วยแม่ครัว & ล้างจานร้านอาหารตามสั่ง',
    company: 'ครัวป้าพร รสเด็ด',
    type: 'daily',
    typeLabel: 'งานรายวัน',
    salary: '฿500 / วัน (มีอาหารฟรี 2 มื้อ)',
    location: 'ซอยสุขุมวิท 31, กรุงเทพฯ',
    description: 'ช่วยเตรียมวัตถุดิบ หั่นผักเนื้อ ล้างจาน เวลาทำงาน 08:30 - 16:30 น. เลิกงานเร็ว',
    requirements: ['ขยัน สะอาด อดทน'],
    contactName: 'ป้าพร',
    contactPhone: '086-789-0123',
    createdAt: Date.now() - 3600000 * 48,
    tags: ['ร้านอาหาร', 'อาหารฟรี', 'จ่ายรายวัน']
  }
];

interface JobsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobsModal: React.FC<JobsModalProps> = ({ isOpen, onClose }) => {
  const { location, showToast, currentUser } = useCommunity();
  const [jobsList, setJobsList] = useState<CommunityJob[]>(INITIAL_JOBS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isPostingJob, setIsPostingJob] = useState(false);

  // New Job Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newType, setNewType] = useState<'fulltime' | 'parttime' | 'daily' | 'freelance'>('fulltime');
  const [newSalary, setNewSalary] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPhone, setNewPhone] = useState('');

  if (!isOpen) return null;

  const filteredJobs = jobsList.filter((j) => {
    const matchesType = selectedType === 'all' || j.type === selectedType;
    if (!matchesType) return false;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q) ||
      j.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim() || !newSalary.trim()) {
      showToast('กรุณากรอกตำแหน่งงาน ร้านค้า และอัตราค่าจ้างให้ครบถ้วน', 'error');
      return;
    }

    const typeLabels = {
      fulltime: 'งานประจำ',
      parttime: 'พาร์ทไทม์',
      daily: 'งานรายวัน',
      freelance: 'ฟรีแลนซ์'
    };

    const newJob: CommunityJob = {
      id: `job_${Date.now()}`,
      title: newTitle.trim(),
      company: newCompany.trim(),
      type: newType,
      typeLabel: typeLabels[newType],
      salary: newSalary.trim(),
      location: `${location.district || ''} ${location.province}`,
      description: newDesc.trim() || 'ติดต่อสอบถามรายละเอียดงานเพิ่มเติมจากผู้ว่าจ้างโดยตรง',
      requirements: ['ติดต่อผู้ว่าจ้างเพื่อสอบถามคุณสมบัติ'],
      contactName: currentUser?.displayName || 'ผู้ประกอบการในชุมชน',
      contactPhone: newPhone.trim() || '08x-xxx-xxxx',
      createdAt: Date.now(),
      tags: ['งานในชุมชน', location.province]
    };

    setJobsList([newJob, ...jobsList]);
    setIsPostingJob(false);
    setNewTitle('');
    setNewCompany('');
    setNewSalary('');
    setNewDesc('');
    setNewPhone('');
    showToast('🎉 ลงประกาศรับสมัครงานในชุมชนเรียบร้อยแล้ว!', 'success');
  };

  const handleApplyCall = (job: CommunityJob) => {
    showToast(`📞 ติดต่อคุณ ${job.contactName} เบอร์โทร ${job.contactPhone}`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white text-xl">
              <Briefcase className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-tight">ศูนย์หางาน & รับสมัครงานชุมชน</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  {location.province}
                </span>
              </div>
              <p className="text-[11px] text-blue-100">
                โอกาสงานใกล้บ้าน ช่างฝีมือ พนักงานร้านค้า และงานพาร์ทไทม์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPostingJob(!isPostingJob)}
              className="px-3 py-1.5 bg-white text-blue-900 hover:bg-blue-50 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isPostingJob ? 'ดูงานทั้งหมด' : 'ลงประกาศงาน'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-xl text-white transition active:scale-95"
              title="ปิด"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Post Job Form (Modal View) */}
        {isPostingJob ? (
          <form onSubmit={handleCreateJob} className="p-5 overflow-y-auto space-y-4 flex-1">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-2 text-xs text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>ลงประกาศรับสมัครงานฟรี เพื่อค้นหาบุคลากรและเพื่อนบ้านที่อาศัยอยู่ในพื้นที่ {location.province}</span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ตำแหน่งงานที่เปิดรับ *</label>
              <input
                type="text"
                placeholder="เช่น พนักงานชงกาแฟ, ช่างซ่อมแอร์, พนักงานส่งของ"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ชื่อร้าน / บริษัท / นิติบุคคล *</label>
                <input
                  type="text"
                  placeholder="เช่น ร้านกาแฟ คลองเตย, คอนโดสุขุมวิท"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">รูปแบบการจ้าง *</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                >
                  <option value="fulltime">งานประจำ (Full-time)</option>
                  <option value="parttime">พาร์ทไทม์ (Part-time)</option>
                  <option value="daily">งานรายวัน (Daily)</option>
                  <option value="freelance">ฟรีแลนซ์ / รับจ้างอิสระ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">ค่าจ้าง / เงินเดือน *</label>
                <input
                  type="text"
                  placeholder="เช่น ฿18,000 / ด. หรือ ฿600 / วัน"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">เบอร์โทรศัพท์ติดต่อ *</label>
                <input
                  type="tel"
                  placeholder="เช่น 081-234-5678"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">รายละเอียดงาน & คุณสมบัติ</label>
              <textarea
                rows={3}
                placeholder="ระบุวันเวลาทำงาน หน้าที่ความรับผิดชอบ และคุณสมบัติที่ต้องการ..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPostingJob(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/30"
              >
                ยืนยันลงประกาศรับสมัคร
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search and Filters */}
            <div className="p-3 sm:p-4 border-b border-slate-100 space-y-2 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาตามตำแหน่งงาน ร้านค้า ทักษะ หรือคีย์เวิร์ด..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'fulltime', label: '💼 งานประจำ' },
                  { id: 'parttime', label: '⏰ พาร์ทไทม์' },
                  { id: 'daily', label: '💵 รายวัน' },
                  { id: 'freelance', label: '🛵 ฟรีแลนซ์' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                      selectedType === type.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Listings List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Briefcase className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-sm text-slate-600">ไม่พบตำแหน่งงานที่ตรงกับการค้นหา</p>
                  <p className="text-xs">ลองค้นหาด้วยคำอื่น หรือกดปุ่ม "ลงประกาศงาน" เพื่อเปิดรับสมัครคนในพื้นที่</p>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                            {job.typeLabel}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {job.salary}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{job.title}</h4>
                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.company}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleApplyCall(job)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95 shrink-0"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>สมัครงาน</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{job.description}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex-wrap gap-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{job.location}</span>
                      </span>

                      <div className="flex items-center gap-1 flex-wrap">
                        {job.tags.map((t, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
