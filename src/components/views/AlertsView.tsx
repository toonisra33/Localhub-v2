import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Flame,
  CloudRain,
  Car,
  Zap,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { AlertReport } from '../../types';

import { WeatherWidget } from '../WeatherWidget';

interface AlertsViewProps {
  onOpenReportAlert: () => void;
  onOpenWeather?: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onOpenReportAlert, onOpenWeather }) => {
  const { alerts, location, showToast } = useCommunity();
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
    <div className="space-y-4">
      {/* Live Accurate Weather Status in Alerts View */}
      <WeatherWidget compact onOpenFullForecast={onOpenWeather} />

      {/* Alert Center Header */}
      <div className="p-5 bg-gradient-to-r from-rose-900 via-red-900 to-rose-950 text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-800/80 text-rose-200 text-xs font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Citizen Emergency Reports
          </span>
          <h2 className="text-xl font-bold">ศูนย์รายงานเหตุและเตือนภัยฉุกเฉิน</h2>
          <p className="text-xs text-rose-100 max-w-lg mt-0.5">
            รายงานสถานการณ์สดจากประชาชนและกู้ภัยในพื้นที่ {location.province}
          </p>
        </div>

        <button
          onClick={onOpenReportAlert}
          className="px-4 py-2.5 bg-white text-rose-900 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          แจ้งเหตุเตือนภัยด่วน
        </button>
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
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filterType === cat.id
                ? 'bg-rose-800 text-white'
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
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            ไม่มีรายงานเหตุการณ์ในหมวดนี้
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-slate-100 shrink-0">
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
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-1">
                      {alert.title}
                    </h3>
                  </div>
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  alert.status === 'active'
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>
                  {alert.status === 'active' ? '● กำลังเกิดเหตุ' : 'กำลังตรวจสอบ'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11">
                {alert.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 pl-11">
                <span>รายงานโดย: <strong className="text-slate-600">{typeof alert.reporter === 'string' ? alert.reporter : 'ประชาชนในพื้นที่'}</strong></span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ยืนยันแล้ว {alert.verifiedCount} คน
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
