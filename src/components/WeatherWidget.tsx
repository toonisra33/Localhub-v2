import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  MapPin,
  RefreshCw,
  Compass,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { fetchLiveWeather, getDeviceCoordinates, getProvinceCoords } from '../services/weatherService';
import { WeatherData } from '../types';

interface WeatherWidgetProps {
  onOpenFullForecast?: () => void;
  compact?: boolean;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ onOpenFullForecast, compact = false }) => {
  const { location, showToast } = useCommunity();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useGps, setUseGps] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadWeather = async (forceGps = false) => {
    setIsLoading(true);
    try {
      let lat: number;
      let lng: number;
      let locName: string;
      let source: 'gps' | 'province' = 'province';

      if (forceGps) {
        try {
          const gps = await getDeviceCoordinates();
          lat = gps.lat;
          lng = gps.lng;
          locName = 'พิกัด GPS อุปกรณ์ของคุณ';
          source = 'gps';
          setUseGps(true);
          showToast('📍 ดึงพิกัด GPS สดสำเร็จ!', 'success');
        } catch {
          showToast('ไม่สามารถดึง GPS ได้ ใช้พิกัดจังหวัดแทน', 'info');
          const coords = getProvinceCoords(location.province);
          lat = coords.lat;
          lng = coords.lng;
          locName = location.province;
        }
      } else {
        const coords = getProvinceCoords(location.province);
        lat = coords.lat;
        lng = coords.lng;
        locName = location.province;
      }

      const data = await fetchLiveWeather(lat, lng, locName, source);
      setWeather(data);
      setLastRefreshed(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Weather load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(false);
  }, [location.province]);

  if (!weather) {
    return (
      <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-500 animate-pulse">
        <div className="flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-amber-500 animate-spin" />
          <span>กำลังตรวจสอบสภาพอากาศสดตามพิกัดจริง...</span>
        </div>
      </div>
    );
  }

  const { current } = weather;

  if (compact) {
    return (
      <div className="p-3 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 rounded-2xl flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{current.weatherIcon}</span>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <span>{current.temperature}°C</span>
              <span>•</span>
              <span className={current.isRaining ? 'text-blue-700' : 'text-emerald-700'}>
                {current.weatherText}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-slate-400" />
              <span>{current.locationName}</span>
              <span>•</span>
              <span>ฝน: {current.precipitation} มม.</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenFullForecast}
          className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-blue-100 transition"
        >
          <span>พยากรณ์</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-950 text-white rounded-3xl shadow-md border border-sky-700/50 space-y-3 relative overflow-hidden">
      {/* Background Weather glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-sky-500/20 text-sky-300 rounded-xl">
            <Compass className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold tracking-tight text-white">
                สภาพอากาศ & พยากรณ์สด (Live Weather)
              </h3>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" />
                ข้อมูลดาวเทียมสด
              </span>
            </div>
            <p className="text-[11px] text-sky-200 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-300" />
              <span>{current.locationName} ({location.province})</span>
              <span>•</span>
              <span>อัปเดต {current.updatedAt} น.</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => loadWeather(true)}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-sky-200 rounded-xl text-[11px] font-medium transition flex items-center gap-1"
            title="ตรวจจับพิกัด GPS อุปกรณ์จริงของคุณ"
          >
            <span>📍 GPS สด</span>
          </button>

          <button
            onClick={() => loadWeather(false)}
            disabled={isLoading}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-sky-200 rounded-xl transition"
            title="รีเฟรชข้อมูลสภาพอากาศ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Condition Card */}
      <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="text-4xl filter drop-shadow-sm animate-pulse-slow">
            {current.weatherIcon}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {current.temperature}°
              </span>
              <span className="text-xs text-sky-200">
                รู้สึกเหมือน {current.apparentTemperature}°C
              </span>
            </div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5 mt-0.5">
              <span>{current.weatherText}</span>
              {current.isRaining ? (
                <span className="px-1.5 py-0.2 bg-blue-500/40 text-blue-200 rounded text-[10px]">
                  มีฝน ({current.precipitation} มม.)
                </span>
              ) : (
                <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 rounded text-[10px]">
                  ไม่มีฝนตก (0.0 มม.)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Micro stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs w-full sm:w-auto">
          <div className="p-2 bg-black/20 rounded-xl">
            <div className="text-[10px] text-sky-300 flex items-center justify-center gap-0.5">
              <Droplets className="w-3 h-3" />
              <span>ความชื้น</span>
            </div>
            <div className="font-bold text-white mt-0.5">{current.relativeHumidity}%</div>
          </div>

          <div className="p-2 bg-black/20 rounded-xl">
            <div className="text-[10px] text-sky-300 flex items-center justify-center gap-0.5">
              <Wind className="w-3 h-3" />
              <span>ความเร็วลม</span>
            </div>
            <div className="font-bold text-white mt-0.5">{current.windSpeed} กม./ชม.</div>
          </div>

          <div className="p-2 bg-black/20 rounded-xl">
            <div className="text-[10px] text-sky-300 flex items-center justify-center gap-0.5">
              <Activity className="w-3 h-3" />
              <span>PM2.5</span>
            </div>
            <div className="font-bold text-white mt-0.5">
              {weather.pm25 ? `${weather.pm25} µg` : 'ปกติ'}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly forecast preview strip */}
      <div className="space-y-1.5 pt-1 relative z-10">
        <div className="flex items-center justify-between text-[11px] text-sky-200 font-medium">
          <span>พยากรณ์โอกาสฝนตกรายชั่วโมง</span>
          {onOpenFullForecast && (
            <button
              onClick={onOpenFullForecast}
              className="text-sky-300 hover:text-white hover:underline flex items-center gap-0.5"
            >
              <span>ดูพยากรณ์เต็ม 7 วัน</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {weather.hourly.time.slice(0, 8).map((timeStr, idx) => {
            const hourLabel = timeStr.includes('T') ? timeStr.split('T')[1].slice(0, 5) : timeStr;
            const temp = Math.round(weather.hourly.temperature[idx] ?? 30);
            const rainProb = Math.round(weather.hourly.precipitationProbability[idx] ?? 0);

            return (
              <div
                key={idx}
                className="flex-1 min-w-[58px] p-2 bg-white/10 rounded-xl text-center flex flex-col items-center justify-between"
              >
                <span className="text-[10px] text-sky-200">{hourLabel}</span>
                <span className="text-xs font-bold text-white my-0.5">{temp}°</span>
                <span className={`text-[10px] font-semibold ${rainProb > 40 ? 'text-sky-300' : 'text-slate-300'}`}>
                  💧 {rainProb}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
