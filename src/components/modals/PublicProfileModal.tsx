import React, { useState, useEffect } from 'react';
import { X, MessageCircle, UserPlus, Check } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { getUserDetails, sendFriendRequest, acceptFriendRequest, subscribeToFriendshipStatus } from '../../lib/chat';
import { UserProfileData } from '../../types';

interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onMessageClick?: (user: { id: string, name: string, avatar: string }) => void;
}

export function PublicProfileModal({ isOpen, onClose, userId, onMessageClick }: PublicProfileModalProps) {
  const { userProfile, isLoggedIn, showToast, posts } = useCommunity();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [friendStatus, setFriendStatus] = useState<{status: 'none' | 'pending' | 'accepted', requesterId?: string}>({status: 'none'});
  
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
          const postByUser = posts?.find(p => p.authorUid === userId);
          if (postByUser) {
            setProfile({
              id: userId,
              name: postByUser.author?.name || 'ผู้ใช้ชุมชน',
              avatar: postByUser.author?.avatar || 'https://ui-avatars.com/api/?name=U&background=random',
              bio: 'สมาชิกชุมชน (เข้าสู่ระบบก่อนการอัปเดตระบบโปรไฟล์)',
              address: 'พื้นที่ชุมชน',
              phone: '',
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
  
      }
    });
    
    if (isLoggedIn && userProfile?.id) {
      const unsub = subscribeToFriendshipStatus(userProfile.id, userId, (status) => {
        setFriendStatus(status);
      });
      return unsub;
    }
  }, [isOpen, userId, isLoggedIn, userProfile]);

  if (!isOpen) return null;

  const handleFriendAction = async () => {
    if (!isLoggedIn || !userProfile?.id) {
      showToast('กรุณาเข้าสู่ระบบเพื่อดำเนินการ', 'error');
      return;
    }
    if (friendStatus.status === 'none') {
      await sendFriendRequest(userProfile.id, userId);
      showToast('ส่งคำขอเป็นเพื่อนแล้ว', 'success');
    } else if (friendStatus.status === 'pending' && friendStatus.requesterId !== userProfile.id) {
      await acceptFriendRequest(userProfile.id, userId);
      showToast('คุณเป็นเพื่อนกันแล้ว', 'success');
    }
  };

  const handleMessage = () => {
    if (!isLoggedIn) {
      showToast('กรุณาเข้าสู่ระบบเพื่อส่งข้อความ', 'error');
      return;
    }
    if (onMessageClick && profile) {
      onMessageClick({ id: profile.id || userId, name: profile.name, avatar: profile.avatar });
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
              
              <div className="mt-4 grid grid-cols-1 gap-2 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {(() => {
                  const s = profile.privacySettings || { showEmail: false, showPhone: false, showBirthDate: false, showRelationshipStatus: true, showOccupation: true };
                  const hasVisibleData = (s.showPhone && profile.phone) || 
                                         (s.showEmail && profile.email) || 
                                         (s.showOccupation && profile.occupation) || 
                                         (s.showRelationshipStatus && profile.relationshipStatus) || 
                                         (s.showBirthDate && profile.birthDate);
                  
                  if (!hasVisibleData) {
                    return <div className="text-[12px] text-center text-slate-400 italic py-2">ไม่มีข้อมูลส่วนตัวที่เปิดเผย</div>;
                  }
                  
                  return (
                    <>
                      {s.showPhone && profile.phone && (
                        <div className="text-[12px] flex items-center gap-2"><span className="font-bold text-slate-700 w-16">เบอร์ติดต่อ:</span> <span className="text-slate-600">{profile.phone}</span></div>
                      )}
                      {s.showEmail && profile.email && (
                        <div className="text-[12px] flex items-center gap-2"><span className="font-bold text-slate-700 w-16">อีเมล:</span> <span className="text-slate-600">{profile.email}</span></div>
                      )}
                      {s.showOccupation && profile.occupation && (
                        <div className="text-[12px] flex items-center gap-2"><span className="font-bold text-slate-700 w-16">อาชีพ:</span> <span className="text-slate-600">{profile.occupation}</span></div>
                      )}
                      {s.showRelationshipStatus && profile.relationshipStatus && (
                        <div className="text-[12px] flex items-center gap-2"><span className="font-bold text-slate-700 w-16">สถานะ:</span> <span className="text-slate-600">{profile.relationshipStatus}</span></div>
                      )}
                      {s.showBirthDate && profile.birthDate && (
                        <div className="text-[12px] flex items-center gap-2"><span className="font-bold text-slate-700 w-16">วันเกิด:</span> <span className="text-slate-600">{new Date(profile.birthDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span></div>
                      )}
                    </>
                  );
                })()}
              </div>
              
              {userProfile?.id !== userId && (
                <div className="flex gap-3 mt-6 justify-center">
                  <button 
                    onClick={handleFriendAction}
                    disabled={friendStatus.status === 'accepted' || (friendStatus.status === 'pending' && friendStatus.requesterId === userProfile?.id)}
                    className={`flex-1 max-w-[140px] py-2.5 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-1.5 transition-colors ${
                      friendStatus.status === 'accepted' ? 'bg-slate-100 text-slate-500' 
                      : (friendStatus.status === 'pending' && friendStatus.requesterId === userProfile?.id) ? 'bg-amber-50 text-amber-600'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    {friendStatus.status === 'accepted' ? (
                      <><Check size={16} /> เป็นเพื่อนแล้ว</>
                    ) : friendStatus.status === 'pending' && friendStatus.requesterId === userProfile?.id ? (
                      <>รอการตอบรับ</>
                    ) : friendStatus.status === 'pending' && friendStatus.requesterId !== userProfile?.id ? (
                      <><Check size={16} /> ยอมรับคำขอ</>
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
