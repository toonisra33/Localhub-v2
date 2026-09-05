import React, { useState, useEffect } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { ChatRoom, UserProfileData } from '../../types';
import { subscribeToChats, subscribeToFriends, getUserDetails } from '../../lib/chat';
import { MessageCircle, Users, Bot, Sparkles, X } from 'lucide-react';
import { ChatRoomModal } from './ChatRoomModal';
import { PublicProfileModal } from '../modals/PublicProfileModal';

interface ChatViewProps {
  onOpenAiChat?: () => void;
  onClose?: () => void;
}

export function ChatView({ onOpenAiChat, onClose }: ChatViewProps) {
  const { isLoggedIn, userProfile } = useCommunity();
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [friendsDetails, setFriendsDetails] = useState<Record<string, UserProfileData>>({});
  
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<{ id: string, name: string, avatar: string } | null>(null);
  
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !userProfile?.id) return;
    
    const unsubChats = subscribeToChats(userProfile.id, (newChats) => {
      setChats(newChats);
    });

    const unsubFriends = subscribeToFriends(userProfile.id, (fIds) => {
      setFriendIds(fIds);
      // Fetch details for new friends
      fIds.forEach(id => {
        getUserDetails(id).then(details => {
          if (details) {
            setFriendsDetails(prev => ({ ...prev, [id]: details }));
          }
        });
      });
    });

    return () => {
      unsubChats();
      unsubFriends();
    };
  }, [isLoggedIn, userProfile?.id]);

  if (!isLoggedIn) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-screen bg-slate-50">
        <MessageCircle size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-extrabold text-slate-800 mb-2">เข้าสู่ระบบเพื่อใช้งานแชท</h2>
        <p className="text-slate-500 text-sm">คุณต้องเข้าสู่ระบบเพื่อส่งข้อความและเพิ่มเพื่อนในชุมชน</p>
      </div>
    );
  }

  const handleOpenChat = (roomId: string, otherUserId: string, otherUserDetail: any) => {
    setSelectedChatRoom(roomId);
    setSelectedChatUser({ id: otherUserId, name: otherUserDetail?.name, avatar: otherUserDetail?.avatar });
  };

  return (
    <div className={`flex flex-col bg-slate-50 ${onClose ? 'h-full overflow-hidden' : 'min-h-screen pb-24'}`}>
      {/* Header */}
      <div className="bg-white px-4 pt-safe-top pb-3 shadow-sm sticky top-0 z-20 shrink-0">
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-[22px] font-extrabold text-slate-900">ข้อความ & เพื่อน</h1>
          {onClose && (
            <button onClick={onClose} className="p-2 -mr-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl mt-4">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'chats' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageCircle size={16} />
            แชท
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'friends' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users size={16} />
            เพื่อน ({friendIds.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 ${onClose ? 'overflow-y-auto flex-1' : ''}`}>
        {activeTab === 'chats' && (
          <div className="space-y-3">
            {/* AI Assistant Chat Row */}
            {onOpenAiChat && (
              <div 
                onClick={onOpenAiChat}
                className="bg-gradient-to-r from-slate-900 to-indigo-950 p-3.5 rounded-2xl shadow-md flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer border border-slate-700/50"
              >
                <div className="w-12 h-12 rounded-full shrink-0 bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg border-2 border-slate-800 relative">
                  <Bot size={24} className="text-white" />
                  <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
                    <Sparkles size={10} className="text-emerald-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-extrabold text-white text-sm truncate flex items-center gap-1.5">
                      AI ประจำชุมชน
                    </h3>
                  </div>
                  <p className="text-slate-300 text-xs truncate">พร้อมช่วยเหลือและให้ข้อมูลเสมอ</p>
                </div>
              </div>
            )}

            {chats.length === 0 ? (
              <div className="text-center py-10">
                <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={24} className="text-emerald-500" />
                </div>
                <p className="text-slate-500 font-medium text-sm">ยังไม่มีข้อความ</p>
                <p className="text-slate-400 text-xs mt-1">เริ่มคุยกับเพื่อนหรือคนในชุมชนได้เลย</p>
              </div>
            ) : (
              chats.map(chat => {
                const otherUserId = chat.participants.find(id => id !== userProfile.id) || chat.participants[0];
                const otherUserDetail = chat.participantDetails[otherUserId] || { name: 'ผู้ใช้', avatar: '' };
                const timeStr = new Date(chat.lastMessageTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div 
                    key={chat.id} 
                    onClick={() => handleOpenChat(chat.id, otherUserId, otherUserDetail)}
                    className="bg-white p-3.5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <img src={otherUserDetail?.avatar || 'https://via.placeholder.com/150'} alt={otherUserDetail?.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h3 className="font-extrabold text-slate-900 text-sm truncate">{otherUserDetail?.name}</h3>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">{timeStr}</span>
                      </div>
                      <p className="text-slate-500 text-xs truncate">{chat.lastMessage || 'เริ่มการสนทนา...'}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-3">
            {friendIds.length === 0 ? (
              <div className="text-center py-10">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={24} className="text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium text-sm">คุณยังไม่มีเพื่อน</p>
                <p className="text-slate-400 text-xs mt-1">ไปที่ฟีดชุมชนแล้วกดเพิ่มเพื่อนเพื่อติดต่อกัน</p>
              </div>
            ) : (
              friendIds.map(id => {
                const detail = friendsDetails[id];
                if (!detail) return null;
                return (
                  <div 
                    key={id} 
                    className="bg-white p-3 rounded-2xl border border-slate-150 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewProfileId(id)}>
                      <img src={detail?.avatar || 'https://via.placeholder.com/150'} alt={detail?.name} className="w-11 h-11 rounded-full object-cover" />
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{detail?.name}</h3>
                        <p className="text-slate-500 text-xs truncate max-w-[150px]">{detail.bio || 'เพื่อนของคุณ'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleOpenChat('', id, detail)}
                      className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {selectedChatUser && (
        <ChatRoomModal 
          isOpen={true} 
          onClose={() => setSelectedChatUser(null)}
          roomId={selectedChatRoom}
          otherUserId={selectedChatUser.id}
          otherUserName={selectedChatUser.name}
          otherUserAvatar={selectedChatUser.avatar}
        />
      )}

      {viewProfileId && (
        <PublicProfileModal
          isOpen={true}
          onClose={() => setViewProfileId(null)}
          userId={viewProfileId}
          onMessageClick={() => {
            const detail = friendsDetails[viewProfileId] || { name: 'User', avatar: '' };
            setViewProfileId(null);
            setTimeout(() => handleOpenChat('', viewProfileId, detail), 300);
          }}
        />
      )}
    </div>
  );
}
