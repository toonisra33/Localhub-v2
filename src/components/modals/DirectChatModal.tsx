import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  Camera,
  Check,
  CheckCheck,
  Search,
  MessageSquare,
  Users,
  MapPin,
  Sparkles,
  ArrowLeft,
  Phone,
  Info,
  Smile,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { DirectChatContact } from '../../types';

export const DirectChatModal: React.FC = () => {
  const {
    isDirectChatOpen,
    closeDirectChat,
    directConversations,
    activeChatContact,
    openDirectChat,
    sendDirectMessage,
    friends,
    currentUser,
    showToast
  } = useCommunity();

  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewingListOnMobile, setIsViewingListOnMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (isDirectChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [directConversations, isDirectChatOpen, activeChatContact]);

  if (!isDirectChatOpen) return null;

  // Active conversation
  const activeConversation = directConversations.find(
    (c) =>
      c.participant.id === activeChatContact?.id ||
      c.participant.name.trim().toLowerCase() === activeChatContact?.name.trim().toLowerCase()
  );

  const messages = activeConversation?.messages || [];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;
    if (!activeChatContact) {
      showToast('กรุณาเลือกผู้ติดต่อเพื่อเริ่มการสนทนา', 'info');
      return;
    }

    sendDirectMessage(activeChatContact.id, messageText.trim());
    setMessageText('');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtered conversations by search
  const filteredConversations = directConversations.filter((c) =>
    c.participant.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const quickReplies = [
    'สวัสดีครับ ยินดีที่ได้คุยครับ 👋',
    'สอบถามข้อมูลเพิ่มเติมครับ 💬',
    'พิกัดตรงนี้ปลอดภัยแล้วครับ ✅',
    'ขอบคุณมากครับเพื่อนบ้าน 🙏'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[92vh] sm:h-[84vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        {/* Main Content Area: Split 2 columns (Contacts List & Chat Area) */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT COLUMN: Conversation List & Community Contacts (Hidden on small screens when in chat room) */}
          <div
            className={`w-full sm:w-80 md:w-88 border-r border-slate-200 flex flex-col bg-slate-50/70 shrink-0 ${
              activeChatContact && !isViewingListOnMobile ? 'hidden sm:flex' : 'flex'
            }`}
          >
            {/* Top Bar of Left Column */}
            <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-tight">แชทคุยตัวต่อตัว</h3>
                  <p className="text-[10px] text-slate-400 font-medium">1-on-1 Direct Messaging</p>
                </div>
              </div>

              {/* Close Button on Mobile List */}
              <button
                onClick={closeDirectChat}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition sm:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 bg-white border-b border-slate-200/80">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อเพื่อน หรือการสนทนา..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Quick Contacts Bar: Friends to Start Chatting */}
            {friends.length > 0 && (
              <div className="p-2.5 bg-emerald-50/60 border-b border-emerald-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 mb-1.5 px-1">
                  <span>เพื่อนในเครือข่าย</span>
                  <span className="text-[10px] text-emerald-600">{friends.length} คน</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                  {friends.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        openDirectChat({
                          id: f.id,
                          name: f.name,
                          avatar: f.avatar,
                          province: f.province,
                          district: f.district,
                          isOnline: true
                        });
                        setIsViewingListOnMobile(false);
                      }}
                      className="flex flex-col items-center shrink-0 w-14 group text-center cursor-pointer"
                      title={`แชทกับ ${f.name}`}
                    >
                      <div className="relative">
                        <img
                          src={f.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={f.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30 group-hover:ring-emerald-500 transition"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 truncate w-full mt-0.5 group-hover:text-emerald-700">
                        {f.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Users className="w-8 h-8 mx-auto stroke-1 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">ยังไม่มีการสนทนา</p>
                  <p className="text-[11px] text-slate-400">เลือกเพื่อนจากแถบด้านบนหรือกดแชทจากหน้าฟีดและร้านค้า</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeChatContact?.id === conv.participant.id;
                  const lastMsg = conv.messages[conv.messages.length - 1];

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        openDirectChat(conv.participant);
                        setIsViewingListOnMobile(false);
                      }}
                      className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition ${
                        isSelected
                          ? 'bg-emerald-100/70 border-l-4 border-emerald-600 text-slate-900'
                          : 'hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conv.participant.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={conv.participant.name}
                          className="w-11 h-11 rounded-2xl object-cover shadow-2xs"
                        />
                        {conv.participant.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {conv.participant.name}
                          </h4>
                          {lastMsg && (
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {formatTime(lastMsg.timestamp)}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {lastMsg ? lastMsg.content : 'เริ่มการสนทนาใหม่'}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-200/70 text-slate-600 font-semibold truncate">
                            {conv.participant.district ? `${conv.participant.district}, ` : ''}{conv.participant.province || 'กรุงเทพมหานคร'}
                          </span>
                        </div>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Active 1-on-1 Chat Room */}
          <div
            className={`flex-1 flex flex-col bg-slate-50/50 ${
              !activeChatContact && !isViewingListOnMobile ? 'hidden sm:flex items-center justify-center' : 'flex'
            }`}
          >
            {activeChatContact ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs z-10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Back to list button on mobile */}
                    <button
                      onClick={() => setIsViewingListOnMobile(true)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 sm:hidden transition"
                      title="กลับไปหน้ารายชื่อบทสนทนา"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="relative shrink-0">
                      <img
                        src={activeChatContact.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={activeChatContact.name}
                        className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-xs"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-sm text-slate-900 truncate">
                          {activeChatContact.name}
                        </h3>
                        <span className="px-2 py-0.2 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          {activeChatContact.role || 'คนในพื้นที่'}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>{activeChatContact.isOnline ? 'ออนไลน์อยู่ขณะนี้' : activeChatContact.lastSeen || 'ใช้งานเมื่อสักครู่'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-normal">{activeChatContact.district || activeChatContact.province || 'กรุงเทพมหานคร'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Top Right Action & Close Modal */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => showToast(`โทรติดต่อ ${activeChatContact.name} (ฟีเจอร์เสียงในพื้นที่)`, 'info')}
                      className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
                      title="โทรคุยด้วยเสียง"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={closeDirectChat}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      title="ปิดหน้าต่างแชท"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 bg-gradient-to-b from-slate-50/80 to-white">
                  {/* Privacy & Safety Note */}
                  <div className="max-w-md mx-auto p-2.5 bg-emerald-50/90 text-emerald-900 rounded-2xl border border-emerald-200 text-center text-[11px] flex items-center justify-center gap-1.5 shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>การสนทนาตัวต่อตัวแบบปลอดภัย (End-to-End Direct Chat) สำหรับสมาชิกชุมชน</span>
                  </div>

                  {messages.length === 0 ? (
                    <div className="p-10 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">
                        เริ่มส่งข้อความถึง {activeChatContact.name}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        พิมพ์ทักทาย สอบถามเรื่องราว ขอความช่วยเหลือ หรือส่งภาพถ่ายพิกัดในพื้นที่
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === (currentUser?.uid || 'me') || msg.senderName === 'คุณ' || msg.senderName.includes('ฉัน');

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <img
                              src={msg.senderAvatar || activeChatContact.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                              alt={msg.senderName}
                              className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                            />
                          )}

                          <div
                            className={`max-w-[75%] sm:max-w-md rounded-2xl p-3 shadow-2xs space-y-1.5 ${
                              isMe
                                ? 'bg-emerald-600 text-white rounded-br-xs'
                                : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/90'
                            }`}
                          >
                            {/* Photo attachment if any */}
                            {msg.attachmentUrl && (
                              <div className="rounded-xl overflow-hidden bg-black/10 border border-white/20 max-h-56">
                                <img
                                  src={msg.attachmentUrl}
                                  alt="attachment"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {/* Message text */}
                            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>

                            {/* Timestamp & Read checkmark */}
                            <div
                              className={`flex items-center justify-end gap-1 text-[10px] ${
                                isMe ? 'text-emerald-100' : 'text-slate-400'
                              }`}
                            >
                              <span>{formatTime(msg.timestamp)}</span>
                              {isMe && (
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Reply Pills */}
                <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {quickReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMessageText(reply);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded-full whitespace-nowrap transition border border-slate-200 active:scale-95 cursor-pointer"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar - ข้อความตัวต่อตัวเท่านั้น */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={`พิมพ์ข้อความถึง ${activeChatContact.name}...`}
                    className="flex-1 py-2.5 px-4 text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 transition"
                  />

                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className={`p-2.5 sm:p-3 rounded-2xl font-bold transition flex items-center justify-center shrink-0 ${
                      messageText.trim()
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 cursor-pointer'
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                    title="ส่งข้อความ"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-base text-slate-800">
                  ระบบการแชทคุยตัวต่อตัวในชุมชน
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  เลือกเพื่อนจากรายชื่อทางซ้ายมือ หรือกดปุ่ม "แชทตัวต่อตัว" จากหน้าฟีด หน้าร้านค้า หรือโปรไฟล์เพื่อเริ่มคุยได้ทันที
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
