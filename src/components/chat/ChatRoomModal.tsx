import React, { useState, useEffect, useRef } from 'react';
import { compressImage } from '../../lib/imageUtils';
import { X, Send, Bot, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { Message } from '../../types';
import { subscribeToMessages, sendMessage, getOrCreateChatRoom } from '../../lib/chat';
import { soundManager } from '../../lib/sounds';

interface ChatRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string | null;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
}

export function ChatRoomModal({ isOpen, onClose, roomId: initialRoomId, otherUserId, otherUserName, otherUserAvatar }: ChatRoomModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [roomId, setRoomId] = useState<string | null>(initialRoomId);
  const { userProfile, showToast } = useCommunity();
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Track previous message count to detect new messages
  const prevMessageCountRef = useRef(0);

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
        
        // Play sound if new message arrived and it's not from us
        if (msgs.length > prevMessageCountRef.current && prevMessageCountRef.current > 0) {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.senderId !== userProfile.id) {
            soundManager.playChatSound();
          }
        }
        prevMessageCountRef.current = msgs.length;
        
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId || !userProfile?.id) return;
    if (!file.type.startsWith('image/')) {
      showToast?.('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
      return;
    }
    try {
      setIsUploading(true);
      const compressedUrl = await compressImage(file);
      await sendMessage(roomId, userProfile.id, '', compressedUrl);
    } catch (err) {
      console.error(err);
      showToast?.('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !roomId || !userProfile?.id) return;
    
    const text = inputText.trim();
    setInputText('');
    await sendMessage(roomId, userProfile.id, text);
  };

  const handleAskAi = async () => {
    if (!roomId || !userProfile?.id) return;
    
    let promptText = inputText.trim();
    if (!promptText) {
      // If no input, AI will just introduce itself to the chat
      promptText = 'สวัสดี AI ขอข้อมูลแนะนำสำหรับพื้นที่นี้หน่อย';
    } else {
      // Send the user's message first
      await sendMessage(roomId, userProfile.id, inputText);
      setInputText('');
    }

    setIsAiThinking(true);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    // Simulate AI delay and response
    setTimeout(async () => {
      let response = 'ขออภัยค่ะ ฉันยังไม่มีข้อมูลเกี่ยวกับเรื่องนี้ในขณะนี้';
      
      if (promptText.includes('ตลาด')) {
        response = 'วันนี้มีตลาดนัดที่ลานหน้าวัดพระศรีมหาธาตุค่ะ เริ่มตั้งร้านเวลา 15:00 น. และมีตลาดสดบางเขนที่เปิดตลอดวันค่ะ';
      } else if (promptText.includes('น้ำท่วม')) {
        response = 'จากรายงานล่าสุด มีน้ำรอระบายที่ซอยพหลโยธิน 35 ระดับน้ำสูงประมาณ 10 ซม. รถเล็กยังพอผ่านได้ค่ะ';
      } else if (promptText.includes('ร้านอาหาร') || promptText.includes('กินอะไรดี')) {
        response = 'มีร้านอาหารแนะนำ 2 ร้านค่ะ:\n1. ร้านผัดไทยกุ้งสด ห่างไป 800 เมตร\n2. คาเฟ่แมว เหมียวๆ ห่างไป 1.2 กม.';
      } else if (promptText.includes('สวัสดี AI')) {
        response = 'สวัสดีค่ะ! ฉันคือผู้ช่วย AI ประจำชุมชน 🌟 ยินดีที่ได้รู้จักทั้งสองท่านนะคะ มีอะไรให้ฉันช่วยค้นหาข้อมูลในพื้นที่ บอกมาได้เลยค่ะ';
      }
      
      await sendMessage(roomId, 'ai-assistant', response);
      setIsAiThinking(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="bg-white px-4 pt-safe-top pb-3 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
          <img src={otherUserAvatar || 'https://via.placeholder.com/150'} alt={otherUserName} className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h2 className="text-[15px] font-extrabold text-slate-900">{otherUserName}</h2>
          </div>
        </div>
        <button 
          onClick={handleAskAi}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-100"
        >
          <Bot size={14} />
          ดึง AI เข้าร่วม
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            เริ่มสนทนากับ {otherUserName} หรือดึง AI เข้ามาช่วยให้ข้อมูล
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === userProfile?.id;
            const isAi = msg.senderId === 'ai-assistant';
            
            if (isAi) {
              return (
                <div key={msg.id} className="flex justify-start my-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 mr-2 self-end shadow-sm">
                    <Bot size={15} />
                  </div>
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-bl-sm shadow-md border border-slate-800">
                    <div className="flex items-center gap-1.5 mb-1 opacity-80">
                      <Sparkles size={12} className="text-emerald-400" />
                      <span className="text-[11px] font-bold text-emerald-400">AI Assistant</span>
                    </div>
                    <div className="leading-relaxed">
                      {msg.text.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-[14px] ${
                  isMe ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                }`}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="chat" className="rounded-xl max-w-full mb-2 object-cover" />
                  )}
                  {msg.text && <div>{msg.text}</div>}
                </div>
              </div>
            );
          })
        )}
        
        {isAiThinking && (
          <div className="flex justify-start my-4">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 mr-2 self-end shadow-sm">
              <Bot size={15} />
            </div>
            <div className="max-w-[75%] rounded-2xl px-5 py-3 text-[14px] bg-slate-900 text-emerald-400 rounded-bl-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-medium animate-pulse">กำลังคิด...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 p-3 pb-safe">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 disabled:opacity-50 shrink-0"
          >
            {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="พิมพ์ข้อความ หรือให้ AI ช่วยตอบ..."
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
