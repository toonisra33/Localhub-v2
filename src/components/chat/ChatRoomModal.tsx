import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { Message } from '../../types';
import { subscribeToMessages, sendMessage, getOrCreateChatRoom } from '../../lib/chat';

interface ChatRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string | null;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
}

export function ChatRoomModal({ isOpen, onClose, roomId: initialRoomId, otherUserId, otherUserName, otherUserAvatar }: ChatRoomModalProps) {
  const { userProfile } = useCommunity();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [roomId, setRoomId] = useState<string | null>(initialRoomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !userProfile?.id) return;

    const initChat = async () => {
      let rId = roomId;
      if (!rId) {
        rId = await getOrCreateChatRoom(userProfile.id!, otherUserId, userProfile, { name: otherUserName, avatar: otherUserAvatar });
        setRoomId(rId);
      }
      
      const unsub = subscribeToMessages(rId, (msgs) => {
        setMessages(msgs);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      });
      return unsub;
    };

    let unsub: any;
    initChat().then(u => unsub = u);

    return () => {
      if (unsub) unsub();
    };
  }, [isOpen, roomId, otherUserId, userProfile]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !roomId || !userProfile?.id) return;
    
    const text = inputText.trim();
    setInputText('');
    await sendMessage(roomId, userProfile.id, text);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="bg-white px-4 pt-safe-top pb-3 border-b border-slate-200 flex items-center gap-3 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500">
          <X size={20} />
        </button>
        <img src={otherUserAvatar || 'https://via.placeholder.com/150'} alt={otherUserName} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <h2 className="text-[15px] font-extrabold text-slate-900">{otherUserName}</h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            เริ่มสนทนากับ {otherUserName}
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === userProfile?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-[14px] ${
                  isMe ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 p-3 pb-safe">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
