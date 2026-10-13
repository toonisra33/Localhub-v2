import React, { useState } from 'react';
import {
  Users,
  Activity,
  AlertTriangle,
  ShoppingBag,
  TrendingUp,
  Radio,
  Eye,
  Calendar,
  MapPin,
  Database,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useBroadcast } from '../../context/BroadcastContext';

export const DashboardView: React.FC = () => {
  const { location, setActiveTab, isAdmin, showToast } = useCommunity();
  const { setOpenAdminModal } = useBroadcast();

  const [dateFilter, setDateFilter] = useState<'7d' | '30d'>('7d');
  const [subTab, setSubTab] = useState<'stats' | 'cloud'>('stats');

  const chartData = [
    { date: '25 ส.ค.', active: 940, newUsers: 45 },
    { date: '26 ส.ค.', active: 1020, newUsers: 52 },
    { date: '27 ส.ค.', active: 980, newUsers: 38 },
    { date: '28 ส.ค.', active: 1150, newUsers: 64 },
    { date: '29 ส.ค.', active: 1220, newUsers: 72 },
    { date: '30 ส.ค.', active: 1320, newUsers: 84 },
    { date: '31 ส.ค.', active: 1280, newUsers: 78 }
  ];

  const featureUsage = [
    { name: 'เรดาร์รอบตัว (Around Me)', users: '3,420 คน', percent: 38, color: 'bg-emerald-500' },
    { name: 'ฟีดชุมชน (Community Feed)', users: '2,680 คน', percent: 29, color: 'bg-blue-500' },
    { name: 'เตือนภัยฉุกเฉิน (Alerts)', users: '1,890 คน', percent: 21, color: 'bg-rose-500' },
    { name: 'ตลาดนัดท้องถิ่น (Market)', users: '1,540 คน', percent: 17, color: 'bg-amber-500' },
    { name: 'ผู้ช่วย AI ชุมชน (AI Chat)', users: '1,210 คน', percent: 13, color: 'bg-purple-500' },
    { name: 'บรอดแคสต์แอดมิน (Broadcast)', users: '4,620 คน', percent: 51, color: 'bg-indigo-500' }
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn">
      {/* Top Header Card matching localhub-promo-9x16.png */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-400">งานฟีดและการแจ้งเตือน</span>
            <h2 className="text-lg sm:text-xl font-black text-white">
              ภาพรวมและการแจ้งเตือน
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isAdmin && (
              <button
                onClick={() => setOpenAdminModal(true)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>((•)) สร้างบรอดแคสต์ด่วน</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('feed')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/15 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>กลับมุมมองผู้ใช้ทั่วไป</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setDateFilter('7d')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              dateFilter === '7d' ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            7 วันล่าสุด
          </button>
          <button
            onClick={() => setDateFilter('30d')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              dateFilter === '30d' ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            30 วัน
          </button>
          <div className="px-3 py-1.5 bg-white/10 text-slate-300 rounded-xl font-medium shrink-0 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>พื้นที่: {location.displayName || location.province}</span>
          </div>
        </div>

        {/* Tab switch */}
        <div className="pt-2 border-t border-white/10 flex items-center gap-3">
          <button
            onClick={() => setSubTab('stats')}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
              subTab === 'stats' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ภาพรวมสถิติ</span>
          </button>
          <button
            onClick={() => setSubTab('cloud')}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
              subTab === 'cloud' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>ฐานข้อมูลคลาวด์</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards matching localhub-promo-9x16.png */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: ประชากรในระบบ */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Users className="w-4 h-4 text-blue-600" />
              ประชากรในระบบ
            </span>
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">4,892 คน</div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              ยืนยันตัวตนแล้ว 86.4%
            </p>
          </div>
        </div>

        {/* Card 2: ผู้ใช้งานต่อวัน (DAU) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <Activity className="w-4 h-4 text-emerald-600" />
              ผู้ใช้งานต่อวัน (DAU)
            </span>
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12.6%
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">1,280 คน/วัน</div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              เวลาเฉลี่ย 14 นาที/คน
            </p>
          </div>
        </div>

        {/* Card 3: เหตุการณ์แจ้งเตือน */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              เหตุการณ์แจ้งเตือน
            </span>
            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold">
              แก้แล้ว 94%
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">148 เหตุ</div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-rose-500" />
              ตอบสนองเฉลี่ย 18 นาที
            </p>
          </div>
        </div>

        {/* Card 4: เศรษฐกิจชุมชน */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              เศรษฐกิจชุมชน
            </span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full text-[10px] font-bold">
              86 ร้านค้า
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">338 สินค้า</div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <span>💬</span> 1.8k แชทติดต่อผู้ค้า
            </p>
          </div>
        </div>
      </div>

      {/* Growth Trend Section matching localhub-promo-9x16.png */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              แนวโน้มการเติบโตและการมีส่วนร่วม
            </h3>
            <p className="text-[11px] text-slate-500">
              จำนวนผู้ใช้งานประจำวัน (DAU) เทียบสมาชิกใหม่
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              ผู้ใช้ประจำวัน
            </span>
            <span className="flex items-center gap-1 text-blue-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              สมาชิกใหม่
            </span>
          </div>
        </div>

        {/* Interactive Bar Chart Representation */}
        <div className="pt-2">
          <div className="h-48 w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 flex items-end justify-between gap-2">
            {chartData.map((d, i) => {
              const heightPercent = Math.round((d.active / 1400) * 100);
              const newHeight = Math.round((d.newUsers / 100) * 40);
              const isHighlight = i === 5; // 30 ส.ค. highlighted as in screenshot

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {isHighlight && (
                    <div className="absolute -top-12 z-10 px-2 py-1 bg-slate-900 text-white rounded-xl text-[10px] font-bold shadow-lg whitespace-nowrap">
                      30 ส.ค.: {d.active} (ใหม่ +{d.newUsers})
                    </div>
                  )}

                  <div className="w-full max-w-[28px] flex items-end justify-center gap-1 h-36">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-3 rounded-t-md transition-all ${
                        isHighlight ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-emerald-400 group-hover:bg-emerald-500'
                      }`}
                    />
                    <div
                      style={{ height: `${newHeight}%` }}
                      className="w-2 rounded-t-md bg-blue-400 group-hover:bg-blue-500 transition-all"
                    />
                  </div>

                  <span className={`text-[10px] mt-1 font-semibold ${isHighlight ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                    {d.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature Usage Table matching localhub-promo-9x16.png */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
            อัตราการใช้งานแต่ละฟีเจอร์
          </h3>
          <p className="text-[11px] text-slate-500">
            อิงตามจำนวนผู้ใช้รายสัปดาห์
          </p>
        </div>

        <div className="space-y-3">
          {featureUsage.map((f) => (
            <div key={f.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>{f.name}</span>
                <span className="font-mono text-slate-600">
                  {f.users} ({f.percent}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${f.percent}%` }}
                  className={`h-full ${f.color} rounded-full transition-all duration-500`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
