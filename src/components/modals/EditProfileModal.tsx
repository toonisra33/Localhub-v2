import React, { useState, useRef } from 'react';
import { X, User, Phone, MapPin, FileText, Camera, Check, Upload } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface EditProfileModalProps {
  onClose: () => void;
}

export function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { userProfile, updateUserProfile, showToast } = useCommunity();
  const [name, setName] = useState(userProfile.name);
  const [phone, setPhone] = useState(userProfile.phone);
  const [address, setAddress] = useState(userProfile.address);
  const [bio, setBio] = useState(userProfile.bio);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('ขนาดไฟล์ภาพต้องไม่เกิน 5 MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatar(result);
        showToast('📸 อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      bio: bio.trim(),
      avatar
    });
    showToast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3.5 border-b border-slate-150 bg-white z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900 leading-tight">แก้ไขข้อมูลส่วนตัว</h2>
              <p className="text-[11.5px] font-medium text-slate-500">อัปเดตข้อมูลเพื่อให้เพื่อนบ้านติดต่อได้สะดวก</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Avatar selection & upload */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <label className="block text-[12px] font-bold text-slate-700 mb-2">รูปโปรไฟล์ของคุณ</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={avatar}
                  alt="Selected avatar"
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-transform active:scale-95"
                  title="อัปโหลดรูปภาพใหม่"
                >
                  <Camera size={12} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-[11.5px] font-extrabold border border-slate-300 shadow-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <Upload size={13} className="text-emerald-600" />
                  <span>อัปโหลดรูปถ่ายของคุณ</span>
                </button>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">ชื่อ-นามสกุล / ชื่อในชุมชน</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">ที่อยู่ / บ้านเลขที่ ในชุมชน</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1">คำแนะนำตัวเองสั้นๆ</label>
            <textarea
              rows={2}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[13.5px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-[13.5px] hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13.5px] shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Check size={16} />
              บันทึกข้อมูล
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
