import React from 'react';
import { X, Heart, Phone, ShieldAlert, Flame, Ambulance, Droplets, Zap, Users } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface EmergencyHelpModalProps {
  onClose: () => void;
}

export function EmergencyHelpModal({ onClose }: EmergencyHelpModalProps) {
  const { showToast } = useCommunity();

  const emergencyNumbers = [
    { title: 'เหตุด่วนเหตุร้าย (ตำรวจ)', number: '191', icon: ShieldAlert, color: 'bg-rose-50 text-rose-600 border-rose-200' },
    { title: 'กู้ชีพ-กู้ภัย / ศูนย์การแพทย์', number: '1669', icon: Ambulance, color: 'bg-red-50 text-red-600 border-red-200' },
    { title: 'ดับเพลิงและกู้ภัย', number: '199', icon: Flame, color: 'bg-orange-50 text-orange-600 border-orange-200' },
    { title: 'การไฟฟ้านครหลวง (แจ้งไฟดับ)', number: '1130', icon: Zap, color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { title: 'การประปานครหลวง (น้ำไม่ไหล)', number: '1125', icon: Droplets, color: 'bg-sky-50 text-sky-600 border-sky-200' },
    { title: 'ศูนย์รับเรื่องราวร้องทุกข์ กทม.', number: '1555', icon: Users, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  ];

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600 shadow-sm">
              <Heart size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">ช่วยเหลือ & สายด่วน</h2>
              <p className="text-[11.5px] font-medium text-slate-500">เบอร์ฉุกเฉินและขอความช่วยเหลือในย่าน</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 bg-slate-50/50">
          
          <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-4 text-white shadow-md">
            <h3 className="font-extrabold text-[15px] mb-1">ต้องการอาสาสมัครช่วยเหลือด่วน?</h3>
            <p className="text-[12px] text-rose-100 mb-3">
              คุณสามารถโพสต์ลงกระดานชุมชน หรือกดโทรสายด่วนหน่วยงานที่เกี่ยวข้องได้ทันที
            </p>
            <button
              onClick={() => {
                onClose();
                showToast('กำลังเปิดกระดานชุมชนเพื่อขอความช่วยเหลือ');
              }}
              className="bg-white text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-[12px] font-bold shadow-sm transition-all"
            >
              เขียนโพสต์ขอความช่วยเหลือ
            </button>
          </div>

          <h4 className="text-[13px] font-extrabold text-slate-800 px-1 pt-1">สายด่วนฉุกเฉิน 24 ชั่วโมง</h4>

          <div className="space-y-2.5">
            {emergencyNumbers.map((em, idx) => {
              const Icon = em.icon;
              return (
                <a
                  key={idx}
                  href={`tel:${em.number}`}
                  onClick={() => showToast(`📞 กำลังโทรออกไปยังสายด่วน ${em.number}`)}
                  className="bg-white rounded-2xl border border-slate-200 p-3.5 flex items-center justify-between shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${em.color} shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-[13.5px] leading-tight">
                        {em.title}
                      </h4>
                      <span className="text-[14px] font-extrabold text-rose-600">
                        {em.number}
                      </span>
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                    <Phone size={15} />
                  </div>
                </a>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
