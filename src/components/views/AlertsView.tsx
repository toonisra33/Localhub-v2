import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Flame,
  CloudRain,
  Car,
  Zap,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  ThumbsUp,
  AlertOctagon,
  Navigation,
  Compass,
  ExternalLink,
  ShieldCheck,
  Flag,
  ArrowLeft
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { AlertReport } from '../../types';
import { WeatherWidget } from '../WeatherWidget';

interface AlertsViewProps {
  onOpenReportAlert: () => void;
  onOpenWeather?: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onOpenReportAlert, onOpenWeather }) => {
  const { alerts, location, showToast, confirmAlert, reportAlertNotFound, setActiveTab, goBack } = useCommunity();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAlerts = alerts.filter(a => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  const getAlertIcon = (type: AlertReport['type']) => {
    switch (type) {
      case 'flood': return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'weather': return <CloudRain className="w-5 h-5 text-sky-500" />;
      case 'accident': return <Car className="w-5 h-5 text-amber-500" />;
      case 'fire': return <Flame className="w-5 h-5 text-red-500" />;
      case 'power_cut': return <Zap className="w-5 h-5 text-yellow-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    }
  };

  const getSeverityBadge = (sev: AlertReport['severity']) => {
    switch (sev) {
      case 'critical':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-600 text-white animate-pulse">วิกฤต (Critical)</span>;
      case 'high':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-600 text-white">สูง (High)</span>;
      case 'medium':
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white">ปานกลาง</span>;
      default:
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-500 text-white">เล็กน้อย</span>;
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Live Accurate Weather Status in Alerts View */}
      <WeatherWidget compact onOpenFullForecast={onOpenWeather} />

      {/* Alert Center Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-900 via-red-900 to-rose-950 text-white rounded-3xl shadow-lg border border-red-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-800/80 text-rose-200 text-xs font-bold mb-1 border border-rose-700/50">
            <ShieldAlert className="w-3.5 h-3.5" />
            Citizen Emergency Reports & Anti-Fake News
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">ศูนย์รายงานเหตุและเตือนภัยฉุกเฉิน</h2>
          <p className="text-xs text-rose-100 max-w-lg mt-0.5 leading-relaxed">
            รายงานสถานการณ์จริงจากประชาชนและกู้ภัยในพื้นที่ พร้อมระบบตรวจสอบและป้องกันข่าวปลอม
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={goBack}
            className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-white/20 transition active:scale-95"
            title="ย้อนกลับ"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-white/20 transition active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>ดูแผนที่จริง</span>
          </button>

          <button
            onClick={onOpenReportAlert}
            className="px-4 py-2.5 bg-white text-rose-950 hover:bg-rose-50 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>แจ้งเหตุด่วน</span>
          </button>
        </div>
      </div>

      {/* Anti-Fake News Info Banner */}
      <div className="p-3 bg-amber-500/10 border border-amber-300/60 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="leading-snug">
          <strong>ระบบร่วมตรวจสอบโดยชุมชน:</strong> คนในพื้นที่สามารถกดยืนยันเหตุจริง หรือกดรายงานไม่พบเหตุเพื่อคัดกรองข่าวปลอมได้ทันที
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'ทั้งหมด' },
          { id: 'weather', label: '🌤️ สภาพอากาศ' },
          { id: 'flood', label: '🌊 น้ำท่วม' },
          { id: 'accident', label: '🚗 อุบัติเหตุ' },
          { id: 'fire', label: '🔥 ไฟไหม้' },
          { id: 'power_cut', label: '⚡ ไฟฟ้าดับ' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterType(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterType === cat.id
                ? 'bg-rose-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
            ไม่มีรายงานเหตุการณ์ในหมวดนี้
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const notFound = alert.notFoundCount || 0;
            const isSuspectedFake = alert.isFakeReport || (notFound >= 3 && notFound > alert.verifiedCount);
            const isHighCredibility = alert.verifiedCount >= 3 && alert.verifiedCount > notFound * 2;

            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 bg-white rounded-3xl border shadow-xs transition-all space-y-3 ${
                  isSuspectedFake
                    ? 'border-red-300 bg-red-50/20'
                    : 'border-slate-200 hover:border-rose-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-2xl bg-slate-100 shrink-0">
                      {getAlertIcon(alert.type)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getSeverityBadge(alert.severity)}
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {alert.province} {alert.district ? `• ${alert.district}` : ''} {alert.subdistrict ? `• ${alert.subdistrict}` : ''}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1">
                        {alert.title}
                      </h3>
                    </div>
                  </div>

                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold shrink-0 ${
                    alert.status === 'active'
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {alert.status === 'active' ? '● กำลังเกิดเหตุ' : 'กำลังตรวจสอบ'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-1 sm:pl-11">
                  {alert.description}
                </p>

                {/* Fake News Warning or Credibility Banner */}
                {isSuspectedFake ? (
                  <div className="p-2.5 bg-red-100/80 border border-red-300 rounded-2xl text-xs text-red-900 font-bold flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                    <span>⚠️ คำเตือนจากระบบ: มีประชาชน {notFound} คนรายงานว่าไม่พบเหตุจริง (ระวังข่าวปลอม)</span>
                  </div>
                ) : isHighCredibility ? (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✅ ข้อมูลน่าเชื่อถือ: ได้รับการยืนยันจากคนในพื้นที่แล้ว {alert.verifiedCount} คน</span>
                  </div>
                ) : null}

                {/* Action Toolbar: Confirm real event, Report not found / fake, View on Map */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-slate-400 text-[11px]">
                    รายงานโดย: <strong className="text-slate-600">{typeof alert.reporter === 'string' ? alert.reporter : 'ประชาชนในพื้นที่'}</strong>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Confirm Button */}
                    <button
                      onClick={() => confirmAlert(alert.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 ${
                        alert.userVerified
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                      title="ยืนยันว่ามีเหตุการณ์เกิดขึ้นจริง"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${alert.userVerified ? 'fill-white' : ''}`} />
                      <span>{alert.userVerified ? 'ยืนยันเหตุแล้ว' : 'ยืนยันเหตุจริง'} ({alert.verifiedCount})</span>
                    </button>

                    {/* Report Not Found (Anti-fake news) Button */}
                    <button
                      onClick={() => reportAlertNotFound(alert.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 ${
                        alert.userReportedNotFound
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
                      }`}
                      title="รายงานว่าไม่พบเหตุการณ์จริง เพื่อป้องกันข่าวปลอม"
                    >
                      <Flag className={`w-3.5 h-3.5 ${alert.userReportedNotFound ? 'fill-white' : ''}`} />
                      <span>{alert.userReportedNotFound ? 'แจ้งไม่พบแล้ว' : 'ไม่พบเหตุ / ข่าวปลอม'} ({notFound})</span>
                    </button>

                    {/* View on In-App Map */}
                    <button
                      onClick={() => {
                        setActiveTab('map');
                        showToast(`เปิดแผนที่จุดเกิดเหตุ: ${alert.title}`, 'info');
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ดูบนแผนที่</span>
                    </button>

                    {/* Direct Google Maps Navigation Button (เด้งเข้า Google Maps ทันที) */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${alert.coordinates?.lat || 13.8282},${alert.coordinates?.lng || 100.5694}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const lat = alert.coordinates?.lat || 13.8282;
                        const lng = alert.coordinates?.lng || 100.5694;
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition cursor-pointer"
                      title="เปิด Google Maps นำทางไปยังจุดเกิดเหตุทันที"
                    >
                      <Navigation className="w-3.5 h-3.5 fill-white text-white" />
                      <span>นำทาง Google Maps</span>
                      <ExternalLink className="w-3 h-3 text-blue-200" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
