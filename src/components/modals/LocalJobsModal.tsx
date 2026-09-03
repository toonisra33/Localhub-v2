import React, { useState } from 'react';
import { X, Briefcase, MapPin, Phone, Banknote, Clock, CheckCircle2 } from 'lucide-react';
import { mockJobs } from '../../data';
import { useCommunity } from '../../context/CommunityContext';

interface LocalJobsModalProps {
  onClose: () => void;
}

export function LocalJobsModal({ onClose }: LocalJobsModalProps) {
  const { showToast } = useCommunity();
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  const handleApply = (jobId: string, company: string) => {
    if (appliedJobs.includes(jobId)) {
      showToast('คุณได้ส่งใบสมัครงานนี้ไปแล้ว');
      return;
    }
    setAppliedJobs(prev => [...prev, jobId]);
    showToast(`✅ ส่งข้อมูลสมัครงานไปยัง "${company}" เรียบร้อยแล้ว`);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">หางานใกล้บ้าน</h2>
              <p className="text-[11.5px] font-medium text-slate-500">รับสมัครงาน ร้านค้าและธุรกิจในย่าน</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Job List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 bg-slate-50/50">
          {mockJobs.map(job => {
            const isApplied = appliedJobs.includes(job.id);
            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-2.5"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10.5px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 mb-1 inline-block">
                      {job.type}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-[14.5px] leading-tight">
                      {job.title}
                    </h3>
                    <p className="text-[12px] font-bold text-slate-500 mt-0.5">{job.company}</p>
                  </div>

                  <span className="text-[13px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl shrink-0 border border-emerald-100">
                    {job.salary}
                  </span>
                </div>

                <p className="text-[12.5px] text-slate-600 font-normal leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {job.description}
                </p>

                <div className="flex items-center justify-between text-[11.5px] text-slate-500 font-medium pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-600" />
                    <span>{job.location} ({job.distance} กม.)</span>
                  </div>
                  <span className="text-slate-400">โทร: {job.phone}</span>
                </div>

                <div className="flex gap-2 pt-1 border-t border-slate-100">
                  <a
                    href={`tel:${job.phone}`}
                    onClick={() => showToast(`📞 ติดต่อฝ่ายบุคคล: ${job.phone}`)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[12px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone size={13} />
                    โทรสอบถาม
                  </a>

                  <button
                    onClick={() => handleApply(job.id, job.company)}
                    className={`flex-1 py-2 font-bold rounded-xl text-[12px] flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                      isApplied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 size={14} />
                        สมัครแล้ว
                      </>
                    ) : (
                      'สมัครงานทันที'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
