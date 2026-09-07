import React from 'react';
import { Sparkles, Cloud, AlertTriangle, Calendar, Store, Briefcase, Megaphone, ChevronRight } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { mockMorningBrief } from '../data';

export function AiMorningBrief() {
  const { showToast, location } = useCommunity();
  const [realWeather, setRealWeather] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (location?.latitude && location?.longitude) {
      const fetchWeather = async () => {
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code`);
          if (res.ok) {
            const data = await res.json();
            const temp = Math.round(data.current.temperature_2m);
            const code = data.current.weather_code;
            
            let desc = "มีเมฆบางส่วน";
            if (code === 0) desc = "ท้องฟ้าแจ่มใส";
            else if (code >= 1 && code <= 3) desc = "มีเมฆบางส่วนถึงครึ้ม";
            else if (code >= 45 && code <= 48) desc = "มีหมอก";
            else if (code >= 51 && code <= 67) desc = "มีฝนตก";
            else if (code >= 80 && code <= 82) desc = "มีฝนตกหนัก";
            else if (code >= 95) desc = "พายุฝนฟ้าคะนอง";

            setRealWeather(`${desc} อุณหภูมิ ${temp}°C`);
          }
        } catch (e) {
          console.error("Failed to fetch weather", e);
        }
      };
      fetchWeather();
    }
  }, [location?.latitude, location?.longitude]);

  const displayWeather = realWeather || mockMorningBrief.weather;

  return (
    <div className="mx-5 -mt-5 mb-6 relative z-20">
      <div className="bg-white rounded-3xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-amber-50 rounded-full blur-xl opacity-60"></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Sparkles size={14} />
              </div>
              <div>
                <h3 className="text-[14.5px] font-extrabold text-slate-900 tracking-tight">AI สรุปข่าวเช้าชุมชน</h3>
                <p className="text-[11px] font-medium text-slate-500">สรุปข้อมูลสำคัญในพื้นที่ของคุณวันนี้</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold rounded-lg border border-indigo-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              LIVE
            </span>
          </div>

          {/* Smart Summary Text */}
          <p className="text-[12.5px] text-slate-600 font-medium leading-relaxed mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
            สวัสดีตอนเช้าครับ 🌤️ วันนี้อากาศ <span className="font-bold text-sky-600">{displayWeather}</span> 
            มีประกาศจากแอดมิน <span className="font-bold text-rose-600">{mockMorningBrief.announcements} รายการ</span> 
            และมีการปิดถนน <span className="font-bold text-amber-600">{mockMorningBrief.roadClosures} จุด</span> ในพื้นที่ ควรเผื่อเวลาเดินทางนะครับ
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border border-slate-150 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5">
                <AlertTriangle size={14} />
              </div>
              <span className="text-[14px] font-black text-slate-800 leading-none mb-0.5">{mockMorningBrief.roadClosures}</span>
              <span className="text-[10px] font-bold text-slate-500">แจ้งเตือนภัย</span>
            </div>

            <div className="bg-white border border-slate-150 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
                <Calendar size={14} />
              </div>
              <span className="text-[14px] font-black text-slate-800 leading-none mb-0.5">{mockMorningBrief.events}</span>
              <span className="text-[10px] font-bold text-slate-500">กิจกรรมวันนี้</span>
            </div>

            <div className="bg-white border border-slate-150 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                <Store size={14} />
              </div>
              <span className="text-[14px] font-black text-slate-800 leading-none mb-0.5">{mockMorningBrief.newShops}</span>
              <span className="text-[10px] font-bold text-slate-500">ร้านค้าใหม่</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
