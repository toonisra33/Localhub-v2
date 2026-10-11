import React, { useState } from 'react';
import {
  Radio,
  AlertTriangle,
  Flame,
  CloudRain,
  Car,
  MapPin,
  Clock,
  Volume2,
  VolumeX,
  ExternalLink,
  Plus,
  RotateCcw,
  Shield,
  Eye,
  Heart,
  Smartphone,
  Activity,
  Play,
  Square,
  BellRing
} from 'lucide-react';
import { useBroadcast } from '../../context/BroadcastContext';
import { useCommunity } from '../../context/CommunityContext';
import { AdminBroadcast, BroadcastSeverity } from '../../types';

export const BroadcastListView: React.FC = () => {
  const {
    broadcasts,
    setOpenAdminModal,
    reBroadcastItem,
    playSoundAlert,
    isTestingLocalAdmin,
    isTestingAllDevices,
    testLocalDeviceSignal,
    stopLocalDeviceTest,
    testAllDevicesSignal,
    dismissTestSignal
  } = useBroadcast();
  const { isAdmin, location, showToast } = useCommunity();
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filtered = broadcasts.filter(b => {
    if (severityFilter === 'all') return true;
    return b.severity === severityFilter;
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold backdrop-blur-xs">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Official Broadcast Channel
          </div>
          <h2 className="text-xl font-bold">ช่องทางบรอดแคสต์ทางการและเตือนภัย</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            รับข้อมูลข่าวสาร คำเตือนภัยพิบัติ และประกาศสำคัญจากหน่วยงานท้องถิ่นและผู้ดูแลระบบแบบเรียลไทม์
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setOpenAdminModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            เปิดคอนโซลบรอดแคสต์
          </button>
        )}
      </div>

      {/* Admin Signal Test Control Bar (Visible when in Admin Mode) */}
      {isAdmin && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-100 text-red-600 rounded-lg">
                <Activity className="w-4 h-4 animate-pulse" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  ระบบทดสอบสัญญาณเตือนภัย & การสั่นสะเทือน (Admin Signal Test)
                </h3>
                <p className="text-[11px] text-slate-500">
                  ตรวจสอบความพร้อมของระบบเสียงไซเรนและการสั่น ทั้งแบบเครื่องนี้เท่านั้น หรือทุกอุปกรณ์พร้อมกัน
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(isTestingLocalAdmin || isTestingAllDevices) && (
                <button
                  onClick={() => {
                    stopLocalDeviceTest();
                    dismissTestSignal();
                    showToast('หยุดสัญญาณเตือนทั้งหมดแล้ว', 'info');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  หยุดสัญญาณเตือน
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
            {/* Mode 1 Button: Local Device Only */}
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-emerald-900">ทดสอบเฉพาะเครื่องนี้ (Admin Only)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  เสียงและระบบสั่นจะดังเฉพาะเครื่องที่ admin กำลังทดสอบเท่านั้น
                </p>
              </div>

              {isTestingLocalAdmin ? (
                <button
                  onClick={stopLocalDeviceTest}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 transition shadow-xs"
                >
                  <Square className="w-3.5 h-3.5" />
                  หยุด
                </button>
              ) : (
                <button
                  onClick={() => {
                    testLocalDeviceSignal('siren', 5);
                    showToast('กำลังทดสอบเสียงและการสั่นเฉพาะเครื่องนี้ (ไม่ส่งออกไปยังอุปกรณ์อื่น)', 'info');
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  ทดสอบเครื่องนี้
                </button>
              )}
            </div>

            {/* Mode 2 Button: All Devices Broadcast */}
            <div className="p-3 rounded-xl border border-red-200 bg-red-50/40 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-red-900">ทดสอบทุกอุปกรณ์ (All Devices)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  ส่งสัญญาณเตือนภัย เสียงไซเรน และการสั่นไปยังทุกเครื่องที่ติดตั้งแอพ
                </p>
              </div>

              <button
                onClick={() => {
                  testAllDevicesSignal();
                  showToast('📡 ส่งสัญญาณเตือนและระบบสั่นไปยังทุกอุปกรณ์แล้ว!', 'success');
                }}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition shadow-xs"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                ส่งทุกอุปกรณ์
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'ทั้งหมด' },
          { id: 'urgent', label: '🚨 ด่วนที่สุด' },
          { id: 'high', label: '⚠️ แจ้งเตือนสำคัญ' },
          { id: 'normal', label: '📢 ทั่วไป' },
          { id: 'special', label: '✨ พิเศษ' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSeverityFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              severityFilter === tab.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            ไม่มีข้อความบรอดแคสต์ในหมวดนี้
          </div>
        ) : (
          filtered.map(item => {
            const isUrgent = item.severity === 'urgent';
            const isHigh = item.severity === 'high';

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 bg-white shadow-xs hover:shadow-md ${
                  isUrgent
                    ? 'border-red-300 bg-red-50/20'
                    : isHigh
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                      isUrgent
                        ? 'bg-red-600 text-white'
                        : isHigh
                        ? 'bg-amber-600 text-white'
                        : item.severity === 'special'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {item.severity === 'urgent' && 'ด่วนที่สุด'}
                      {item.severity === 'high' && 'สำคัญมาก'}
                      {item.severity === 'special' && 'พิเศษ'}
                      {item.severity === 'normal' && 'ทั่วไป'}
                    </span>

                    <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      {item.targetArea || 'ทุกพื้นที่'}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.broadcastDateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => playSoundAlert(item.severity)}
                      title="ทดสอบเสียงสัญญาณ"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          reBroadcastItem(item);
                          showToast('บรอดแคสต์ซ้ำอีกครั้งแล้ว', 'success');
                        }}
                        title="ส่งซ้ำ (Re-broadcast)"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="hidden sm:inline">ส่งซ้ำ</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{item.title}</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {item.message}
                  </p>
                </div>

                {/* Media Image / Video if present */}
                {item.mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-80 bg-black">
                    {item.mediaType === 'video' ? (
                      <video
                        src={item.mediaUrl}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full max-h-80 object-contain bg-black"
                      />
                    ) : (
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Action Link & Sender */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-blue-600" />
                    ประกาศโดย: <strong className="text-slate-700">{item.adminName}</strong>
                  </span>

                  {item.actionUrl && (
                    <a
                      href={item.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                    >
                      {item.actionText || 'ข้อมูลเพิ่มเติม'}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
