import React, { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';

interface AiChatProps {
  onClose: () => void;
}

export function AiChat({ onClose }: AiChatProps) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'สวัสดีค่ะ ฉันคือผู้ช่วยอัจฉริยะชุมชน มีอะไรให้ฉันช่วยค้นหาหรือตอบคำถามในพื้นที่ของคุณไหมคะ? เช่น "วันนี้มีตลาดนัดไหม" หรือ "น้ำท่วมตรงไหนบ้าง"' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    
    setTimeout(() => {
      let response = 'ขออภัยค่ะ ฉันยังไม่มีข้อมูลเกี่ยวกับเรื่องนี้ในขณะนี้';
      
      if (userMsg.includes('ตลาด')) {
        response = 'วันนี้มีตลาดนัดที่ลานหน้าวัดพระศรีมหาธาตุค่ะ เริ่มตั้งร้านเวลา 15:00 น. และมีตลาดสดบางเขนที่เปิดตลอดวันค่ะ';
      } else if (userMsg.includes('น้ำท่วม')) {
        response = 'จากรายงานล่าสุด มีน้ำรอระบายที่ซอยพหลโยธิน 35 ระดับน้ำสูงประมาณ 10 ซม. รถเล็กยังพอผ่านได้ค่ะ ส่วนจุดอื่นๆ ในรัศมี 5 กม. สถานการณ์ปกติ';
      } else if (userMsg.includes('ร้านอาหาร') || userMsg.includes('กินอะไรดี')) {
        response = 'มีร้านอาหารเปิดใหม่ใกล้คุณ 2 ร้านค่ะ: \n1. ร้านผัดไทยกุ้งสด ห่างไป 800 เมตร\n2. คาเฟ่แมว เหมียวๆ ห่างไป 1.2 กม.\nต้องการให้ฉันบอกเส้นทางไหมคะ?';
      } else if (userMsg.includes('กิจกรรม') || userMsg.includes('เด็ก')) {
        response = 'วันเสาร์นี้มีกิจกรรม "ศิลปะสำหรับเด็ก" ที่ศูนย์เยาวชนจตุจักร เวลา 10:00 - 12:00 น. เข้าร่วมฟรีค่ะ';
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-end justify-center animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full max-w-md h-[88vh] sm:h-[620px] sm:rounded-t-[36px] flex flex-col shadow-2xl rounded-t-[36px] overflow-hidden slide-in-from-bottom-full border-t border-white/20">
        
        {/* Header with Dark Obsidian Modern Aesthetic */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-slate-800 to-indigo-900 rounded-2xl flex items-center justify-center text-white relative shadow-md border border-slate-700">
              <Bot size={22} className="text-emerald-400" />
              <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-slate-900">
                <Sparkles size={10} className="text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-white text-[15.5px] tracking-tight">ถามชุมชน (AI Assistant)</h3>
              <p className="text-[11.5px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                รู้ลึก รู้จริง ทุกเรื่องในย่านนี้
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            title="ปิด"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 mr-2 self-end shadow-sm">
                  <Bot size={15} />
                </div>
              )}
              <div className={`max-w-[78%] px-4 py-3 text-[13.5px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-[22px] rounded-br-sm font-medium' 
                  : 'bg-white border border-slate-200/80 text-slate-800 rounded-[22px] rounded-bl-sm font-medium shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)]'
              }`}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200/80 pb-safe">
          <div className="flex gap-2 mb-3 overflow-x-auto hide-scrollbar -mx-4 px-4">
            {['วันนี้มีตลาดนัดไหม?', 'ร้านอาหารใกล้ฉัน', 'ถนนเส้นไหนน้ำท่วม?'].map((suggestion, i) => (
              <button 
                key={i}
                onClick={() => setInput(suggestion)}
                className="whitespace-nowrap text-[11.5px] font-bold bg-slate-100/90 text-slate-700 px-3.5 py-1.5 rounded-full border border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all shrink-0 active:scale-95"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="flex gap-2 bg-slate-100/90 rounded-2xl p-1.5 border border-slate-200/80 focus-within:border-slate-900 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 transition-all shadow-inner">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="พิมพ์คำถามของคุณที่นี่..."
              className="flex-1 bg-transparent px-3 py-2 text-[13.5px] font-medium outline-none text-slate-900 placeholder:text-slate-400"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              title="ส่งข้อความ"
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-400 text-white rounded-xl transition-all flex items-center justify-center w-10 h-10 shrink-0 shadow-md active:scale-95"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
