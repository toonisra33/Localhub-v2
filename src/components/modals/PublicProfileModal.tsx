import React, { useState, useEffect } from 'react';
import { X, MessageCircle, UserPlus, Check } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { getUserDetails, addFriend, subscribeToFriends } from '../../lib/chat';
import { UserProfileData } from '../../types';

interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onMessageClick?: () => void;
}

export function PublicProfileModal({ isOpen, onClose, userId, onMessageClick }: PublicProfileModalProps) {
  const { userProfile, isLoggedIn, showToast } = useCommunity();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  
  useEffect(() => {
    if (!isOpen) return;
    
    getUserDetails(userId).then(data => {
      if (data) {
        setProfile(data);
      } else {
        
        if (userId === 'user_default_somchai') {
          setProfile({
            id: userId,
            name: 'สมชาย รักดี',
            avatar: 'https://i.pravatar.cc/150?u=somchai',
            bio: 'ชาวชุมชนพหลโยธิน สนใจงานจิตอาสาและอาหารการกิน',
            address: 'หมู่บ้านพหลโยธินวิลล่า ซอย 3',
            phone: '081-234-5678',
          } as any);
        } else if (userId === 'user_default_pasri') {
          setProfile({
            id: userId,
            name: 'ป้าศรี ของหวานโบราณ',
            avatar: 'https://i.pravatar.cc/150?u=pasri',
            bio: 'แม่ค้าขายขนมหวานเจ้าเก่าแก่ในชุมชน',
            address: 'ปากซอย',
            phone: '',
          } as any);
        } else if (userId === 'user_default_comm') {
          setProfile({
            id: userId,
            name: 'คณะกรรมการพัฒนาชุมชน',
            avatar: 'https://i.pravatar.cc/150?u=comm',
            bio: 'บัญชีทางการของคณะกรรมการ',
            address: 'ที่ทำการชุมชน',
            phone: '',
            isVerified: true
          } as any);
        } else {
          setProfile({
            id: userId,
            name: 'ผู้ใช้ชุมชน (ไม่มีข้อมูล)',
            avatar: 'https://via.placeholder.com/150',
            bio: 'ไม่พบข้อมูลโปรไฟล์ของผู้ใช้งานรายนี้ในระบบ (อาจเป็นโพสต์จากระบบดั้งเดิม)',
          } as any);
        }
  
      }
    });
    
    if (isLoggedIn && userProfile?.id) {
      const unsub = subscribeToFriends(userProfile.id, (friends) => {
        setIsFriend(friends.includes(userId));
      });
      return unsub;
    }
  }, [isOpen, userId, isLoggedIn, userProfile]);

  if (!isOpen) return null;

  const handleAddFriend = async () => {
    if (!isLoggedIn || !userProfile?.id) {
      showToast('กรุณาเข้าสู่ระบบเพื่อเพิ่มเพื่อน', 'error');
      return;
    }
    await addFriend(userProfile.id, userId);
    showToast('เพิ่มเพื่อนเรียบร้อยแล้ว', 'success');
  };

  const handleMessage = () => {
    if (!isLoggedIn) {
      showToast('กรุณาเข้าสู่ระบบเพื่อส่งข้อความ', 'error');
      return;
    }
    if (onMessageClick) {
      onMessageClick();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-[17px] font-extrabold text-slate-900">โปรไฟล์</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 text-center">
          {profile ? (
            <>
              <img src={profile.avatar || 'https://via.placeholder.com/150'} alt={profile.name} className="w-24 h-24 rounded-full mx-auto object-cover mb-4 ring-4 ring-emerald-50" />
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
                {profile.name}
                {profile.isVerified && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                    ยืนยันตัวตนแล้ว
                  </span>
                )}
              </h3>
              <p className="text-sm text-slate-500 mt-2 max-w-[250px] mx-auto">{profile.bio || 'ไม่มีคำอธิบาย'}</p>
              
              {userProfile?.id !== userId && (
                <div className="flex gap-3 mt-6 justify-center">
                  <button 
                    onClick={handleAddFriend}
                    disabled={isFriend}
                    className={`flex-1 max-w-[140px] py-2.5 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-1.5 transition-colors ${
                      isFriend ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {isFriend ? (
                      <><Check size={16} /> เป็นเพื่อนแล้ว</>
                    ) : (
                      <><UserPlus size={16} /> เพิ่มเพื่อน</>
                    )}
                  </button>
                  <button 
                    onClick={handleMessage}
                    className="flex-1 max-w-[140px] py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle size={16} /> ส่งข้อความ
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-10 text-slate-400 font-medium">กำลังโหลด...</div>
          )}
        </div>
      </div>
    </div>
  );
}
