import React from 'react';
import { Sparkles, Cloud, AlertTriangle, Calendar, Store, Briefcase, Megaphone, ChevronRight } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';


export function AiMorningBrief() {
  const { showToast, location, alerts, products, events } = useCommunity();
  const [realWeather, setRealWeather] = React.useState<string | null>(null);
  
  const [greeting, setGreeting] = React.useState("สวัสดีครับ ☀️");
  const [timeOfDayText, setTimeOfDayText] = React.useState("วันนี้");
  const [locName, setLocName] = React.useState("พื้นที่ของคุณ");
  const [rainAlert, setRainAlert] = React.useState<string | null>(null);

  React.useEffect(() => {
    const updateTimeContext = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting("สวัสดีตอนเช้าครับ 🌤️");
        setTimeOfDayText("เช้านี้");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("สวัสดีตอนบ่ายครับ ☀️");
        setTimeOfDayText("บ่ายนี้");
      } else if (hour >= 17 && hour < 20) {
        setGreeting("สวัสดีตอนเย็นครับ 🌅");
        setTimeOfDayText("เย็นนี้");
      } else {
        setGreeting("สวัสดีตอนค่ำครับ 🌙");
        setTimeOfDayText("คืนนี้");
      }
    };

    updateTimeContext();
    
    // Set location name from available context
    const currentLoc = location?.district || location?.subdistrict || 'พื้นที่ของคุณ';
    setLocName(currentLoc);

    const fetchWeather = async () => {
      if (!location?.latitude || !location?.longitude) return;
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code&hourly=weather_code,precipitation_probability&timezone=auto`);
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

          // Predict heavy rain in the next 6 hours
          if (data.hourly && data.hourly.weather_code) {
             const currentHourIndex = new Date().getHours();
             // Limit to length just in case
             const safeIndex = Math.min(currentHourIndex, data.hourly.weather_code.length - 6);
             const next6HoursCodes = data.hourly.weather_code.slice(safeIndex, safeIndex + 6);
             
             // Open-Meteo codes for heavy rain or storms: 65, 67, 80, 81, 82, 95, 96, 99
             const hasHeavyRain = next6HoursCodes.some((c: number) => [65, 67, 80, 81, 82, 95, 96, 99].includes(c));
             
             if (hasHeavyRain) {
               // Get time of day for the text
               const h = new Date().getHours();
               let tod = "วันนี้";
               if (h >= 5 && h < 12) tod = "เช้านี้";
               else if (h >= 12 && h < 17) tod = "บ่ายนี้";
               else if (h >= 17 && h < 20) tod = "เย็นนี้";
               else tod = "คืนนี้";

               setRainAlert(`⚠️ ${tod}แถว${currentLoc}อาจจะมีฝนตกหนักในบางพื้นที่ ขอให้เดินทางด้วยความระมัดระวังนะครับ`);
             } else {
               setRainAlert(null);
             }
          }
        }
      } catch (e) {
        // Fallback to mock data silently if the fetch fails due to CORS or network issues
      }
    };

    fetchWeather();
    
    // Auto-update every 3 hours (3 * 60 * 60 * 1000 = 10,800,000)
    const interval = setInterval(() => {
      updateTimeContext();
      fetchWeather();
    }, 10800000);

    return () => clearInterval(interval);
  }, [location?.latitude, location?.longitude, location?.district, location?.subdistrict]);

  const displayWeather = realWeather || "กำลังอัปเดตข้อมูล";

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
                <h3 className="text-[14.5px] font-extrabold text-slate-900 tracking-tight">AI สรุปสถานการณ์ชุมชน</h3>
                <p className="text-[11px] font-medium text-slate-500">อัปเดตข้อมูลสำคัญในพื้นที่ของคุณ</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold rounded-lg border border-indigo-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              LIVE
            </span>
          </div>

          {/* Smart Summary Text */}
          <div className="text-[12.5px] text-slate-600 font-medium leading-relaxed mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-2.5">
            <p>
              {greeting} <span className="font-bold text-indigo-600">แถว{locName}</span> อากาศตอนนี้ <span className="font-bold text-sky-600">{displayWeather}</span> 
              {' '}มีรายงานเหตุการณ์ในพื้นที่ <span className="font-bold text-rose-600">{(alerts || []).length} เรื่อง</span> 
              {' '}และมีกิจกรรมชุมชน <span className="font-bold text-amber-600">{(events || []).length} งาน</span> ติดตามข่าวสารได้ตลอดวันครับ
            </p>
            {rainAlert && (
              <div className="flex items-start gap-2 bg-rose-50/80 p-2.5 rounded-xl border border-rose-100/60">
                <Cloud size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-rose-700 font-bold text-[12px] leading-tight">
                  {rainAlert}
                </p>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border border-slate-150 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5">
                <AlertTriangle size={14} />
              </div>
              <span className="text-[14px] font-black text-slate-800 leading-none mb-0.5">{(alerts || []).length}</span>
              <span className="text-[10px] font-bold text-slate-500">แจ้งเตือนภัย</span>
            </div>
            <div className="bg-white border border-slate-150 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5">
                <Calendar size={14} />
              </div>
              <span className="text-[14px] font-black text-slate-800 leading-none mb-0.5">{(events || []).length}</span>
              <span className="text-[10px] font-bold text-slate-500">กิจกรรมชุมชน</span>
            </div>
            <div className="bg-white border border-slate-150 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                <Store size={14} />
              </div>
              <span className="text-[14px] font-black text-slate-800 leading-none mb-0.5">{(products || []).length}</span>
              <span className="text-[10px] font-bold text-slate-500">สินค้าในตลาด</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
