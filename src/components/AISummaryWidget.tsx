import React, { useState } from 'react';
import { Sparkles, RefreshCw, Bot } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';

export function AISummaryWidget() {
  const { posts, products, showToast } = useCommunity();
  const [summary, setSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Send top 5 posts and products to save tokens
      const recentPosts = posts.slice(0, 5).map(p => ({
        content: p.content, category: p.category, author: p.author.name
      }));
      const recentProducts = products.slice(0, 5).map(p => ({
        title: p.title, price: p.price, description: p.description
      }));
      
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts: recentPosts, products: recentProducts })
      });
      
      const data = await response.json();
      if (data.summary) {
        setSummary(data.summary);
      } else if (data.error) {
        showToast(data.error, 'error');
      }
    } catch (error) {
      showToast('ไม่สามารถสร้างสรุปรายวันได้', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-[24px] border border-violet-100 p-5 mb-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Bot size={80} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-violet-800">
            <Sparkles size={20} className="text-violet-600" />
            <h3 className="font-extrabold text-[16px]">สรุปสถานการณ์ชุมชนโดย AI</h3>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 bg-white/80 hover:bg-white text-violet-700 px-3 py-1.5 rounded-full text-[13px] font-bold shadow-sm transition-all border border-violet-200"
          >
            <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
            <span>{summary ? 'สรุปใหม่' : 'สร้างสรุปเลย'}</span>
          </button>
        </div>
        
        {isGenerating ? (
          <div className="py-8 flex flex-col items-center justify-center text-violet-600/70 gap-3">
            <Bot size={32} className="animate-bounce" />
            <p className="text-[14px] font-medium animate-pulse">กำลังวิเคราะห์ความเคลื่อนไหวในชุมชน...</p>
          </div>
        ) : summary ? (
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-[16px] border border-violet-100/50">
            <p className="text-[14.5px] leading-relaxed text-slate-800 whitespace-pre-line">
              {summary}
            </p>
          </div>
        ) : (
          <div className="bg-white/40 p-4 rounded-[16px] border border-violet-100/30">
            <p className="text-[14px] text-slate-600">กดปุ่มด้านบนเพื่อให้ AI ช่วยสรุปข่าวสารและสินค้าเด่นๆ ในชุมชนวันนี้ให้คุณอ่านแบบรวดเร็ว ⚡</p>
          </div>
        )}
      </div>
    </div>
  );
}
