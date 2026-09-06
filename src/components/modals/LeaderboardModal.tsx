import React, { useState } from 'react';
import { X, Award, ShieldCheck, Star, MapPin, TrendingUp, Search } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface LeaderboardModalProps {
  onClose: () => void;
}

const mockLeaderboard = [
  { id: 'u1', name: 'กิตติศักดิ์ พิทักษ์ถิ่น', role: 'อาสาสมัครกู้ภัย', score: 92, avatar: 'https://ui-avatars.com/api/?name=K&background=random', isVerified: true, isTop: true, rank: 1, badges: ['ช่วยชีวิต', 'รายงานเร็ว'] },
  { id: 'u2', name: 'นพพร การช่าง', role: 'ช่างไฟชุมชน', score: 88, avatar: 'https://ui-avatars.com/api/?name=N&background=random', isVerified: true, isTop: true, rank: 2, badges: ['ซ่อมฟรี', 'ช่างใจดี'] },
  { id: 'u3', name: 'ป้าศรี ของหวานโบราณ', role: 'ร้านค้าท้องถิ่น', score: 85, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', isVerified: true, isTop: true, rank: 3, badges: ['อาหารสะอาด', 'ราคาถูก'] },
  { id: 'u4', name: 'สุชาติ มอเตอร์ไซค์วิน', role: 'วินมอเตอร์ไซค์', score: 78, avatar: 'https://ui-avatars.com/api/?name=S&background=random', isVerified: true, isTop: false, rank: 4, badges: ['ส่งของไว'] },
  { id: 'u5', name: 'ครูแอน ติวเตอร์', role: 'ครูอาสา', score: 75, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', isVerified: true, isTop: false, rank: 5, badges: ['สอนฟรี'] },
];

export function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const { showToast } = useCommunity();
  const [activeTab, setActiveTab] = useState<'month' | 'all-time'>('month');

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-5 pt-6 pb-5 relative shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-sm">
                <Award size={24} />
              </div>
              <div className="text-white">
                <h2 className="text-[18px] font-black leading-tight flex items-center gap-1.5">
                  กระดานคนดีศรีชุมชน
                </h2>
                <p className="text-[12px] font-medium text-white/80 mt-0.5">
                  จัดอันดับอาสาสมัครและผู้ที่มีส่วนร่วมสูงสุด
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-white flex items-center justify-center transition-colors backdrop-blur-md"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 flex gap-1 bg-black/10 p-1 rounded-xl backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('month')}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${activeTab === 'month' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
            >
              ประจำเดือนนี้
            </button>
            <button 
              onClick={() => setActiveTab('all-time')}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${activeTab === 'all-time' ? 'bg-white text-orange-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
            >
              คะแนนสะสมทั้งหมด
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-4">
            <h4 className="text-[13px] font-extrabold text-slate-800 mb-1 flex items-center gap-1.5">
              <TrendingUp size={16} className="text-amber-500" />
              ทำไมถึงต้องสะสมคะแนนชุมชน?
            </h4>
            <p className="text-[11.5px] text-slate-500 leading-relaxed">
              คะแนนได้จากการช่วยรายงานเหตุ แจ้งเตือนภัย หรือให้ความช่วยเหลือเพื่อนบ้าน <strong className="text-emerald-600">คะแนนนี้สามารถใช้แลกส่วนลดกับร้านค้าในชุมชนที่เข้าร่วมโครงการได้</strong>
            </p>
          </div>

          {mockLeaderboard.map((user) => (
            <div 
              key={user.id} 
              className={`relative bg-white rounded-2xl border p-3 flex items-center gap-3 transition-all ${
                user.rank === 1 ? 'border-amber-300 shadow-[0_2px_12px_rgba(245,158,11,0.15)]' : 
                user.rank === 2 ? 'border-slate-300 shadow-sm' : 
                user.rank === 3 ? 'border-orange-200 shadow-sm' : 
                'border-slate-100 hover:border-slate-200'
              }`}
            >
              {/* Rank Badge */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 ${
                user.rank === 1 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md' :
                user.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md' :
                user.rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-md' :
                'bg-slate-100 text-slate-500'
              }`}>
                {user.rank}
              </div>

              <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-2xl object-cover shadow-sm shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <h4 className="text-[14px] font-extrabold text-slate-900 truncate">{user.name}</h4>
                  {user.isVerified && <ShieldCheck size={14} className="text-emerald-500 shrink-0" />}
                </div>
                <p className="text-[11px] font-medium text-slate-500 mb-1">{user.role}</p>
                
                <div className="flex gap-1">
                  {user.badges.map((badge, idx) => (
                    <span key={idx} className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                  <Star size={12} className="text-amber-500 fill-amber-500" />
                  <span className="text-[13px] font-black text-amber-700">{user.score}</span>
                </div>
              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
