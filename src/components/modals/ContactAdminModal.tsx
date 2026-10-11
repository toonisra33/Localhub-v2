import React, { useState } from 'react';
import { X, Send, MessageSquare, Radio, Shield, AlertCircle } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface ContactAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactAdminModal: React.FC<ContactAdminModalProps> = ({ isOpen, onClose }) => {
  const { showToast, location } = useCommunity();
  const [topic, setTopic] = useState<'request_broadcast' | 'report_issue' | 'feedback' | 'other'>('request_broadcast');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      showToast('กรุณากรอกรายละเอียดเรื่องที่ต้องการติดต่อ', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      showToast('ส่งคำร้องถึงเจ้าหน้าที่ผู้ดูแลระบบแล้ว เจ้าหน้าที่จะตรวจสอบข้อมูลโดยเร็ว', 'success');
      setName('');
      setPhone('');
      setDetails('');
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">ติดต่อศูนย์ประสานงาน / ขอประชาสัมพันธ์</h3>
              <p className="text-xs text-slate-500">สำหรับส่งเรื่องร้องทุกข์ หรือขอประกาศข่าวสารชุมชน</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภทเรื่อง</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as typeof topic)}
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="request_broadcast">📢 ขอส่งบรอดแคสต์ประชาสัมพันธ์ชุมชน</option>
              <option value="report_issue">⚠️ ร้องเรียนปัญหาไฟฟ้า/น้ำประปา/ถนนชำรุด</option>
              <option value="feedback">💬 ข้อเสนอแนะการพัฒนาชุมชน</option>
              <option value="other">📌 เรื่องอื่นๆ</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อผู้ติดต่อ</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="สมศรี ตัวแทนซอย 5"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรติดต่อกลับ</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08X-XXX-XXXX"
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดเรื่องที่ต้องการแจ้ง *</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="ระบุสถานที่ รายละเอียด และข้อมูลที่ต้องการให้เจ้าหน้าที่ดำเนินการ..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              required
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>คำขอบรอดแคสต์จะถูกตรวจสอบโดยแอดมินก่อนส่งกระจายเสียงไปยังสมาชิกในพื้นที่ {location.province}</span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'กำลังส่ง...' : 'ส่งเรื่องถึงแอดมิน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
