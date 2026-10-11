import React, { useState } from 'react';
import { X, AlertTriangle, Send, MapPin, Flame, CloudRain, Car, Zap, ShieldAlert } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { AlertReport } from '../../types';

interface ReportAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportAlertModal: React.FC<ReportAlertModalProps> = ({ isOpen, onClose }) => {
  const { addAlert, location, showToast } = useCommunity();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AlertReport['type']>('flood');
  const [severity, setSeverity] = useState<AlertReport['severity']>('medium');
  const [subdistrict, setSubdistrict] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('กรุณากรอกหัวข้อและรายละเอียดเหตุการณ์', 'error');
      return;
    }

    addAlert({
      title: title.trim(),
      description: description.trim(),
      type,
      severity,
      province: location.province,
      district: location.district || 'เมือง',
      subdistrict: subdistrict.trim() || 'ชุมชนทั่วไป',
      reporter: 'พลเมืองดี (รายงานสด)',
      reporterAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });

    setTitle('');
    setDescription('');
    setSubdistrict('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-rose-950 text-base leading-tight">แจ้งเหตุเตือนภัยด่วนในพื้นที่</h3>
              <p className="text-xs text-rose-700">รายงานอุบัติเหตุ น้ำท่วม ไฟไหม้ หรือภัยพิบัติ</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ประเภทเหตุการณ์</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AlertReport['type'])}
                className="w-full text-xs border border-slate-300 rounded-xl px-2.5 py-2 bg-white outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
              >
                <option value="flood">🌊 น้ำท่วมขัง / น้ำรอระบาย</option>
                <option value="accident">🚗 อุบัติเหตุการจราจร</option>
                <option value="fire">🔥 เพลิงไหม้ / ควันไฟ</option>
                <option value="power_cut">⚡ ไฟฟ้าดับ / เสาไฟล้ม</option>
                <option value="road_closed">🚧 ปิดถนน / ดินสไลด์</option>
                <option value="weather">🌪️ พายุ / ลมกรรโชกแรง</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ระดับความเร่งด่วน</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AlertReport['severity'])}
                className="w-full text-xs border border-slate-300 rounded-xl px-2.5 py-2 bg-white outline-hidden focus:ring-2 focus:ring-rose-500 font-medium"
              >
                <option value="medium">🟡 ปานกลาง (ควรระวัง)</option>
                <option value="high">🟠 สูง (กระทบการสัญจร)</option>
                <option value="critical">🔴 วิกฤต (อันตรายถึงชีวิต)</option>
                <option value="low">🟢 เล็กน้อย</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">หัวข้อเหตุการณ์ *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น น้ำท่วมขังเสมอทางเท้า ซอย 39..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">รายละเอียดและจุดสังเกต *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="พิกัดจุดเกิดเหตุ ระดับน้ำ ช่องทางการจราจรที่ผ่านได้/ไม่ได้..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-rose-500 leading-relaxed"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              จุดเกิดเหตุ / ตำบล / แขวง (ใน {location.province})
            </label>
            <input
              type="text"
              value={subdistrict}
              onChange={(e) => setSubdistrict(e.target.value)}
              placeholder="เช่น คลองตันเหนือ, หน้าโรงพยาบาล..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:ring-2 focus:ring-rose-500"
            />
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
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              ส่งรายงานทันที
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
