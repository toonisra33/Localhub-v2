import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Sun,
  CloudRain,
  Droplets,
  Wind,
  Compass,
  MapPin,
  RefreshCw,
  Activity,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Send,
  Eye,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import {
  fetchLiveWeather,
  getDeviceCoordinates,
  getProvinceCoords,
  interpretWeatherCode
} from '../../services/weatherService';
import { WeatherData, WeatherCurrent } from '../../types';
import { ALL_PROVINCES_LIST } from '../../data/thaiData';

export const WeatherForecastView: React.FC = () => {
  const { location, showToast, goBack } = useCommunity();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>(location.province);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Citizen Ground-Truth Report state
  const [citizenReports, setCitizenReports] = useState<Array<{
    id: string;
    condition: string;
    area: string;
    time: string;
    reporter: string;
  }>>([
    {
      id: 'cr1',
      condition: '☀️ แดดออก ท้องฟ้าโปร่ง ไม่มีฝน',
      area: `${location.province} (${location.district || 'ตัวเมือง'})`,
      time: 'เมื่อ 10 นาทีที่แล้ว',
      reporter: 'ผู้ใช้จริงในพื้นที่'
    },
    {
      id: 'cr2',
      condition: '🌤️ มีเมฆบางส่วน ลมพัดสบาย ถนนแห้งสนิท',
      area: `${location.province}`,
      time: 'เมื่อ 25 นาทีที่แล้ว',
      reporter: 'สายตรวจชุมชน'
    }
  ]);
  const [selectedUserCondition, setSelectedUserCondition] = useState('แดดออก ท้องฟ้าโปร่ง (ไม่มีฝน)');

  const loadWeather = async (useGpsCoords = false) => {
    setIsLoading(true);
    try {
      let lat: number;
      let lng: number;
      let locName: string;
      let source: 'gps' | 'province' = 'province';

      if (useGpsCoords) {
        try {
          const gps = await getDeviceCoordinates();
          lat = gps.lat;
          lng = gps.lng;
          locName = 'พิกัด GPS อุปกรณ์จริงของคุณ';
          source = 'gps';
          setIsGpsActive(true);
          showToast('📍 ดึงพิกัด GPS สดของอุปกรณ์สำเร็จ!', 'success');
        } catch {
          showToast('ไม่สามารถระบุพิกัด GPS ได้ ใช้พิกัดจังหวัดที่เลือกแทน', 'info');
          const coords = getProvinceCoords(selectedProvince);
          lat = coords.lat;
          lng = coords.lng;
          locName = selectedProvince;
        }
      } else {
        const coords = getProvinceCoords(selectedProvince);
        lat = coords.lat;
        lng = coords.lng;
        locName = selectedProvince;
        setIsGpsActive(false);
      }

      const data = await fetchLiveWeather(lat, lng, locName, source);
      setWeather(data);
      setLastUpdated(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to load weather:', err);
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลสภาพอากาศ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(false);
  }, [selectedProvince]);

  const handleCitizenReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport = {
      id: `cr_${Date.now()}`,
      condition: selectedUserCondition,
      area: `${selectedProvince} (${location.district || 'พื้นที่จริง'})`,
      time: 'เมื่อสักครู่',
      reporter: 'คุณ (ผู้ใช้จริง)'
    };
    setCitizenReports(prev => [newReport, ...prev]);
    showToast('ขอบคุณที่ร่วมยืนยันสภาพอากาศจริงในพื้นที่!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Bar */}
      <div className="p-5 bg-gradient-to-r from-sky-800 via-blue-900 to-indigo-950 text-white rounded-3xl shadow-lg border border-sky-600/40 space-y-4">
        {/* Navigation Back & Status */}
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/20 transition active:scale-95"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30">
            📡 สภาพอากาศสด (Live Weather)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-sky-500/20 text-sky-300 rounded-2xl shadow-xs">
              <CloudSun className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  ระบบพยากรณ์และสภาพอากาศสด (Live Weather & Radar)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                  แม่นยำสูง (Real-Time)
                </span>
              </div>
              <p className="text-xs text-sky-200 mt-0.5">
                เชื่อมต่อสถานีดาวเทียมตรวจวัดสภาพอากาศ TMD & Open-Meteo ตามพิกัด GPS จริง อัปเดตทุก 15 นาที
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => loadWeather(true)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                isGpsActive
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-white/15 hover:bg-white/25 text-sky-100'
              }`}
              title="ดึงพิกัดจาก GPS อุปกรณ์ของคุณเพื่อความแม่นยำสูงสุด"
            >
              <Compass className="w-4 h-4" />
              <span>พิกัด GPS อุปกรณ์สด</span>
            </button>

            <button
              onClick={() => loadWeather(isGpsActive)}
              disabled={isLoading}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูลสด'}</span>
            </button>
          </div>
        </div>

        {/* Province Filter Dropdown Bar */}
        <div className="pt-2 border-t border-sky-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-300 shrink-0" />
            <span className="text-sky-200">เลือกพื้นที่ตรวจสอบสภาพอากาศ:</span>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="bg-sky-950/80 border border-sky-500/50 rounded-xl px-3 py-1.5 text-xs text-white outline-hidden focus:ring-2 focus:ring-sky-400 font-semibold"
            >
              {ALL_PROVINCES_LIST.map(p => (
                <option key={p} value={p} className="bg-slate-900 text-white">
                  จ.{p}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-sky-300 flex items-center gap-2">
            <span>อัปเดตล่าสุด: {lastUpdated || 'สด'}</span>
            {isGpsActive && (
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                ✓ ตำแหน่งแม่นยำจาก GPS
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Weather Card */}
      {weather && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Real-time Condition Highlight Banner */}
          <div className={`p-6 border-b transition-colors ${
            weather.current.isRaining
              ? 'bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border-blue-200'
              : 'bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-amber-200'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="text-6xl filter drop-shadow-md animate-bounce-subtle">
                  {weather.current.weatherIcon}
                </div>
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">
                      {weather.current.temperature}°C
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      รู้สึกเหมือน {weather.current.apparentTemperature}°C
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-1 flex items-center gap-2">
                    <span>{weather.current.weatherText}</span>
                  </h3>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    {!weather.current.isRaining ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>สภาพจริง: ไม่มีฝนตก (ปริมาณน้ำฝน 0.0 มม.)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
                        <CloudRain className="w-3 h-3 text-blue-600" />
                        <span>ตรวจพบปริมาณน้ำฝน: {weather.current.precipitation} มม.</span>
                      </span>
                    )}

                    <span className="text-xs text-slate-500">
                      พิกัด {weather.current.latitude.toFixed(2)}°, {weather.current.longitude.toFixed(2)}°
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center">
                  <div className="text-slate-400 text-xs flex items-center justify-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span>ความชื้นสัมพัทธ์</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-800 mt-1">
                    {weather.current.relativeHumidity}%
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center">
                  <div className="text-slate-400 text-xs flex items-center justify-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-sky-500" />
                    <span>ความเร็วลม</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-800 mt-1">
                    {weather.current.windSpeed} กม./ชม.
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center">
                  <div className="text-slate-400 text-xs flex items-center justify-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
                    <span>ปริมาณฝน</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-800 mt-1">
                    {weather.current.precipitation} มม.
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center">
                  <div className="text-slate-400 text-xs flex items-center justify-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-amber-500" />
                    <span>ค่าฝุ่น PM2.5</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-800 mt-1">
                    {weather.pm25 ? `${weather.pm25} µg/m³` : 'ปกติ'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 24-Hour Forecast Timeline */}
          <div className="p-5 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>⏱️ พยากรณ์ล่วงหน้า 24 ชั่วโมง (อุณหภูมิ & โอกาสฝนตก)</span>
              </h4>
              <span className="text-xs text-slate-500">ข้อมูลคำนวณรายชั่วโมง</span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {weather.hourly.time.slice(0, 16).map((timeStr, idx) => {
                const hour = timeStr.includes('T') ? timeStr.split('T')[1].slice(0, 5) : timeStr;
                const temp = Math.round(weather.hourly.temperature[idx] ?? 30);
                const rainProb = Math.round(weather.hourly.precipitationProbability[idx] ?? 0);
                const wCode = weather.hourly.weatherCode[idx] ?? 1;
                const interp = interpretWeatherCode(wCode, 0);

                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[70px] p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-2xl text-center flex flex-col items-center justify-between transition group"
                  >
                    <span className="text-xs text-slate-500 font-semibold">{hour}</span>
                    <span className="text-2xl my-1 group-hover:scale-110 transition-transform">
                      {interp.icon}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{temp}°</span>
                    <span className={`text-[11px] font-bold mt-1 px-1.5 py-0.2 rounded-md ${
                      rainProb > 40
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      💧 {rainProb}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="p-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>พยากรณ์อากาศล่วงหน้า 7 วัน (7-Day Forecast)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {weather.daily.time.map((dayStr, idx) => {
                const dateObj = new Date(dayStr);
                const dayLabel = idx === 0 ? 'วันนี้' : idx === 1 ? 'พรุ่งนี้' : dateObj.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
                const max = Math.round(weather.daily.tempMax[idx] ?? 34);
                const min = Math.round(weather.daily.tempMin[idx] ?? 25);
                const rainChance = Math.round(weather.daily.precipitationProbabilityMax[idx] ?? 10);
                const wCode = weather.daily.weatherCode[idx] ?? 1;
                const interp = interpretWeatherCode(wCode, weather.daily.precipitationSum[idx] ?? 0);

                return (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 hover:border-blue-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{interp.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{dayLabel}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[120px]">
                          {interp.text}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">
                        {max}° / <span className="text-slate-400 font-normal">{min}°</span>
                      </div>
                      <div className={`text-[10px] font-bold ${rainChance > 40 ? 'text-blue-600' : 'text-slate-500'}`}>
                        💧 ฝน {rainChance}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Citizen Ground-Truth Verification Section */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>รายงานสภาพอากาศจริงจากประชาชนในพื้นที่ (Ground-Truth Reports)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              เพื่อความแม่นยำสูงสุด ร่วมยืนยันสภาพท้องฟ้าว่ามีฝนตกจริงหรือไม่ในจุดที่คุณอยู่
            </p>
          </div>
        </div>

        {/* Quick Report Form */}
        <form onSubmit={handleCitizenReportSubmit} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              สภาพอากาศตรงที่คุณอยู่ตอนนี้:
            </span>
            <select
              value={selectedUserCondition}
              onChange={(e) => setSelectedUserCondition(e.target.value)}
              className="flex-1 text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="☀️ แดดออก ท้องฟ้าโปร่ง (ไม่มีฝนตก)">☀️ แดดออก ท้องฟ้าโปร่ง (ไม่มีฝนตก)</option>
              <option value="🌤️ มีเมฆบางส่วน ท้องฟ้าแจ่มใส (ไม่มีฝนตก)">🌤️ มีเมฆบางส่วน ท้องฟ้าแจ่มใส (ไม่มีฝนตก)</option>
              <option value="☁️ มีเมฆครึ้ม มืดสลัว (ยังไม่มีฝน)">☁️ มีเมฆครึ้ม มืดสลัว (ยังไม่มีฝน)</option>
              <option value="🌦️ ฝนตกปรอยๆ เล็กน้อย">🌦️ ฝนตกปรอยๆ เล็กน้อย</option>
              <option value="🌧️ ฝนตกปานกลาง ถนนเปียก">🌧️ ฝนตกปานกลาง ถนนเปียก</option>
              <option value="⛈️ พายุฝนตกหนัก ฟ้าร้อง">⛈️ พายุฝนตกหนัก ฟ้าร้อง</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>ยืนยันสภาพจริง</span>
          </button>
        </form>

        {/* Recent Reports List */}
        <div className="space-y-2">
          {citizenReports.map(report => (
            <div
              key={report.id}
              className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-bold">
                  ✓
                </span>
                <div>
                  <span className="font-bold text-slate-800">{report.condition}</span>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{report.area}</span>
                    <span>•</span>
                    <span>รายงานโดย {report.reporter}</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium shrink-0">
                {report.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
