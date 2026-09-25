import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Users, 
  ShieldAlert, 
  ShoppingBag, 
  QrCode, 
  ArrowRight, 
  ExternalLink,
  MapPin,
  Flame,
  Radio,
  Heart
} from 'lucide-react';
import { LocalHubLogo } from '../LocalHubLogo';

interface PromoKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PromoStyle {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  themeColor: string;
  badgeColor: string;
  icon: React.ElementType;
  headline: string;
  subheadline: string;
  highlights: string[];
  caption: string;
  bgGradient: string;
  accentBg: string;
}

const PROMO_STYLES: PromoStyle[] = [
  {
    id: 'community',
    tag: 'แบบที่ 1: สังคมอบอุ่น & เพื่อนบ้านใกล้ตัว',
    title: 'Community Lifestyle & Neighbor Connection',
    subtitle: 'เน้นสร้างสัมพันธ์ที่ดีในชุมชน ช่วยเหลือเกื้อกูล อบอุ่นใกล้บ้าน',
    themeColor: 'emerald',
    badgeColor: 'bg-emerald-500 text-white',
    icon: Users,
    headline: 'เชื่อมต่อทุกความอบอุ่นในชุมชนของคุณ',
    subheadline: 'อยู่ใกล้กัน... ไม่เหงาอีกต่อไป พื้นที่แบ่งปันข่าวสารและมิตรภาพข้างบ้าน',
    highlights: [
      '🏘️ อัปเดตข่าวสารในหมู่บ้าน/คอนโดก่อนใคร',
      '🐾 ช่วยประกาศตามหาสัตว์เลี้ยง & ของหายแบบทันท่วงที',
      '💬 พูดคุย แนะนำร้านอร่อย หาเพื่อนวิ่งออกกำลังกาย',
      '🤝 จุดนัดพบคนคอเดียวกันในละแวกบ้าน'
    ],
    caption: `🏡 รู้จักเพื่อนบ้าน อัปเดตเรื่องรอบตัวก่อนใครที่ "LocalHub"!\n\nไม่ว่าจะเป็นข่าวสารในซอย ร้านเด็ดเพิ่งเปิด หรือช่วยตามหาน้องหมาน้องแมวหลงทาง ทุกเรื่องราวสำคัญของชุมชน รวมไว้ที่นี่ที่เดียว\n\n📲 ใช้งานฟรีได้แล้ววันนี้ทั้งเว็บและแอป:\n👉 https://ais-pre-34kgley63ok2t7hjzxjjmz-9181403676.asia-east1.run.app\n#LocalHub #ชุมชนน่าอยู่ #เพื่อนบ้าน #ข่าวสารชุมชน`,
    bgGradient: 'from-emerald-950 via-slate-900 to-teal-950',
    accentBg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
  },
  {
    id: 'safety',
    tag: 'แบบที่ 2: เรดาร์เตือนภัย & ความปลอดภัยเรียลไทม์',
    title: 'Smart Safety Radar & Emergency Broadcast',
    subtitle: 'เน้นความปลอดภัย รู้ทันเหตุด่วน น้ำท่วม ไฟไหม้ รถติด รอบรัศมี 5 กม.',
    themeColor: 'amber',
    badgeColor: 'bg-amber-500 text-slate-950',
    icon: ShieldAlert,
    headline: 'รู้ก่อน ปลอดภัยกว่า! เรดาร์เตือนภัยรอบตัวเรียลไทม์',
    subheadline: 'แจ้งเหตุด่วน เตือนภัยน้ำท่วม ทางลัดรถติด และขอความช่วยเหลือฉุกเฉินทันใจ',
    highlights: [
      '🚨 บรอดแคสต์เหตุฉุกเฉินและสภาพอากาศทันที',
      '🗺️ แผนที่พินเรดาร์รอบตัว รู้พิกัดเหตุด่วนจุดต่อจุด',
      '🆘 ปุ่ม SOS ส่งพิกัดขอความช่วยเหลือเพื่อนบ้านใกล้เคียง',
      '🔒 ระบบยืนยันตัวตนน่าเชื่อถือ ปลอดภัย มั่นใจได้'
    ],
    caption: `⚠️ ฝนตกหนัก น้ำท่วมซอยไหน รถติดตรงไหน ให้ "LocalHub" คอยเตือนคุณ!\n\nแผนที่เรดาร์แจ้งเตือนภัยเรียลไทม์รอบรัศมี 5 กม. พร้อมปุ่มขอความช่วยเหลือฉุกเฉิน (SOS) รู้ทันทุกสถานการณ์ เพื่อความปลอดภัยของทุกคนในครอบครัว\n\n📲 เข้าดูแผนที่ความปลอดภัยรอบตัวคุณตอนนี้:\n👉 https://ais-pre-34kgley63ok2t7hjzxjjmz-9181403676.asia-east1.run.app\n#เตือนภัย #ความปลอดภัย #แผนที่เรียลไทม์ #LocalHubAlert`,
    bgGradient: 'from-amber-950 via-slate-900 to-rose-950',
    accentBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300'
  },
  {
    id: 'market',
    tag: 'แบบที่ 3: ตลาดนัดชุมชน ซื้อง่ายขายคล่องใกล้บ้าน',
    title: 'Hyperlocal Marketplace & Food Guide',
    subtitle: 'เน้นเศรษฐกิจชุมชน ของอร่อยทำสด ของมือสองราคามิตรภาพ ส่งฟรีถึงรั้วบ้าน',
    themeColor: 'cyan',
    badgeColor: 'bg-cyan-500 text-slate-950',
    icon: ShoppingBag,
    headline: 'เปิดร้านฟรี ช้อปฟินติดรั้วบ้าน! ตลาดชุมชนใกล้คุณ',
    subheadline: 'อุดหนุนเพื่อนบ้าน อาหารโฮมเมด ขนมหวาน และของมือสอง นัดรับง่ายไม่ต้องง้อขนส่ง',
    highlights: [
      '🛍️ โพสต์ลงขายสินค้าฟรีใน 1 นาที ไม่คิดค่าธรรมเนียม',
      '🛵 นัดรับได้ถึงหน้าบ้าน ส่งฟรีรัศมีใกล้คุณ',
      '🍲 ลายแทงร้านลับของกินอร่อยที่คนพื้นที่แนะนำ',
      '💬 แชทคุยกับแม่ค้าพ่อค้าเพื่อนบ้านโดยตรง'
    ],
    caption: `🍰 อยากกินของอร่อยแถวบ้าน หรืออยากเคลียร์ของมือสองสภาพดี?\n\nพบกับ "ตลาดนัดชุมชน LocalHub" ซื้อง่าย ขายคล่อง ไม่เสียค่าธรรมเนียม นัดรับสะดวก อาหารทำสดใหม่พร้อมส่งถึงหน้ารั้วบ้านคุณ\n\n🛒 ช้อปของดีแถวบ้าน หรือเปิดร้านฟรีได้เลยวันนี้:\n👉 https://ais-pre-34kgley63ok2t7hjzxjjmz-9181403676.asia-east1.run.app\n#ตลาดนัดชุมชน #ของกินแถวบ้าน #ของมือสอง #ช้อปใกล้บ้าน #LocalHubMarket`,
    bgGradient: 'from-cyan-950 via-slate-900 to-indigo-950',
    accentBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
  }
];

export const PromoKitModal: React.FC<PromoKitModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('community');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentPromo = PROMO_STYLES.find(s => s.id === activeTab) || PROMO_STYLES[0];
  const appUrl = window.location.origin;

  const handleCopyCaption = () => {
    const textWithRealUrl = currentPromo.caption.replace(
      'https://ais-pre-34kgley63ok2t7hjzxjjmz-9181403676.asia-east1.run.app',
      appUrl
    );
    navigator.clipboard.writeText(textWithRealUrl);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 text-slate-100 w-full max-w-4xl max-h-[92vh] rounded-3xl border border-slate-700/70 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-black text-white tracking-tight">ชุดภาพและสื่อโปรโมท LocalHub</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  3 คอนเซปต์
                </span>
              </div>
              <p className="text-[12px] text-slate-400">
                เลือกแบบที่ตรงกับกลุ่มเป้าหมาย นำภาพและการ์ดข้อความไปโพสต์ลงโซเชียลได้ทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Style Selector Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {PROMO_STYLES.map((style) => {
            const Icon = style.icon;
            const isActive = activeTab === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setActiveTab(style.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-[12.5px] font-bold transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-slate-800 text-white border-slate-600 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                <span>{style.tag}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Main Visual Poster Mockup */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl">
            {/* Visual Background Poster Canvas */}
            <div className={`p-6 sm:p-8 bg-gradient-to-br ${currentPromo.bgGradient} relative min-h-[300px] flex flex-col justify-between`}>
              
              {/* Decorative Glow circles */}
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Poster Top Bar */}
              <div className="flex items-center justify-between z-10">
                <LocalHubLogo size="md" variant="dark" showSubtitle={true} />
                <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${currentPromo.badgeColor}`}>
                  {currentPromo.id === 'community' && 'COMMUNITY APP'}
                  {currentPromo.id === 'safety' && 'SAFETY FIRST'}
                  {currentPromo.id === 'market' && 'HYPERLOCAL MARKET'}
                </span>
              </div>

              {/* Poster Center Headline & Visual Showcase */}
              <div className="my-6 z-10 max-w-xl">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11.5px] font-black border mb-3 ${currentPromo.accentBg}`}>
                  <Radio size={13} className="animate-pulse" />
                  <span>แอปพลิเคชันเพื่อคนในชุมชนของคุณ</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                  {currentPromo.headline}
                </h1>
                <p className="mt-2 text-[14px] text-slate-300 font-medium leading-relaxed">
                  {currentPromo.subheadline}
                </p>
              </div>

              {/* Poster Highlights Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 z-10">
                {currentPromo.highlights.map((h, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[12.5px] font-bold text-slate-200"
                  >
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Poster Bottom Bar */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 z-10">
                <div className="flex items-center gap-2 text-[12px] text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold">พร้อมใช้งานแล้ววันนี้ ทุกแพลตฟอร์มทั้ง iOS / Android / Web</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">{appUrl}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Box: Copy Caption & Share Kit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Caption Copier (2 cols) */}
            <div className="md:col-span-2 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 size={16} className="text-emerald-400" />
                  <h4 className="text-[13.5px] font-black text-white">ข้อความแคปชั่นสำหรับโพสต์ (Caption)</h4>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[12px] font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  {copiedCaption ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCaption ? 'คัดลอกเรียบร้อยแล้ว!' : 'คัดลอกแคปชั่น'}</span>
                </button>
              </div>

              <textarea
                readOnly
                rows={5}
                value={currentPromo.caption.replace(
                  'https://ais-pre-34kgley63ok2t7hjzxjjmz-9181403676.asia-east1.run.app',
                  appUrl
                )}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-[12.5px] text-slate-300 font-mono leading-relaxed focus:outline-none focus:border-slate-700 resize-none"
              />
              <p className="text-[11px] text-slate-500">
                💡 นำแคปชั่นนี้ไปวางในกลุ่ม Facebook หมู่บ้าน, กลุ่มคอนโด, LINE OpenChat หรือไทม์ไลน์ส่วนตัวได้ทันที
              </p>
            </div>

            {/* Quick Share QR & Links (1 col) */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <QrCode size={16} className="text-teal-400" />
                  <h4 className="text-[13.5px] font-black text-white">ลิงก์และช่องทางเข้าใช้งาน</h4>
                </div>
                <p className="text-[12px] text-slate-400 leading-normal">
                  ผู้คนสามารถกดลิงก์เพื่อเข้าใช้งานหรือติดตั้งเป็นแอป (PWA) ลงมือถือได้ทันทีโดยไม่ต้องโหลดผ่านสโตร์
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'คัดลอกลิงก์สำเร็จ!' : 'คัดลอกลิงก์เว็บแอป'}</span>
                </button>

                <a
                  href={appUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>เปิดดูหน้าแอปในแท็บใหม่</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[12px] text-slate-400">
          <span>พร้อมผลักดันให้ชุมชนของคุณเชื่อมต่อกันอย่างอบอุ่นและปลอดภัย</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
