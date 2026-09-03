import React from 'react';
import { X, Calendar, MapPin, Users, Clock, CheckCircle2, Share2 } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface CommunityEventsModalProps {
  onClose: () => void;
}

export function CommunityEventsModal({ onClose }: CommunityEventsModalProps) {
  const { events, toggleJoinEvent, showToast, openMediaViewer } = useCommunity();

  const handleShareEvent = (title: string) => {
    navigator.clipboard?.writeText(window.location.href);
    showToast(`🔗 คัดลอกลิงก์กิจกรรม "${title}" เรียบร้อยแล้ว`);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-sm">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">กิจกรรม & งานบุญ</h2>
              <p className="text-[11.5px] font-medium text-slate-500">กิจกรรมและงานประเพณีในชุมชน</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Events List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {events.map(ev => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <div 
                onClick={() => openMediaViewer({
                  url: ev.image,
                  type: 'image',
                  title: ev.title,
                  subtitle: `วันที่ ${ev.date} (${ev.time}) • ${ev.venue}`
                })}
                className="relative h-36 bg-slate-100 overflow-hidden cursor-pointer group"
              >
                <img
                  src={ev.image}
                  alt={ev.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full border border-white/20">
                    แตะเพื่อดูภาพเต็มจอ
                  </span>
                </div>
                <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-white text-[10.5px] font-extrabold px-2.5 py-1 rounded-full border border-white/20">
                  {ev.date}
                </div>
              </div>

              <div className="p-4 flex flex-col gap-2">
                <h3 className="font-extrabold text-slate-900 text-[15px] leading-tight">
                  {ev.title}
                </h3>

                <p className="text-[12.5px] text-slate-600 font-normal leading-relaxed">
                  {ev.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11.5px] text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <Clock size={13} className="text-purple-600 shrink-0" />
                    <span className="truncate">{ev.time}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <MapPin size={13} className="text-emerald-600 shrink-0" />
                    <span className="truncate">{ev.venue}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[12px] font-bold">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Users size={13} className="text-purple-600" />
                    เข้าร่วมแล้ว {ev.joinedCount} คน
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleShareEvent(ev.title)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                      title="แชร์กิจกรรม"
                    >
                      <Share2 size={15} />
                    </button>

                    <button
                      onClick={() => toggleJoinEvent(ev.id)}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                        ev.isJoined
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {ev.isJoined ? (
                        <>
                          <CheckCircle2 size={14} />
                          เข้าร่วมแล้ว
                        </>
                      ) : (
                        'กดเข้าร่วม'
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
