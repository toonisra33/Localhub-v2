import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, Store, MessageCircle, X } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';
import { Post, Product, UserProfileData } from '../types';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { posts, marketProducts, openPublicProfile, setActiveTab } = useCommunity();
  // Assume we fetch users or we have them locally. In a real app we'd query Firestore.
  // We'll mock users or just search from authors of posts and products for now, or just simulate.
  
  const [results, setResults] = useState<{
    users: any[];
    posts: Post[];
    products: Product[];
  }>({ users: [], posts: [], products: [] });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], posts: [], products: [] });
      return;
    }

    const q = query.toLowerCase();

    // Mock search users from post authors
    const uniqueUsers = new Map();
    posts.forEach(p => {
      if (p.author.name.toLowerCase().includes(q)) {
        uniqueUsers.set(p.authorUid || p.author.name, {
          id: p.authorUid,
          name: p.author.name,
          avatar: p.author.avatar,
        });
      }
    });

    const matchedPosts = posts.filter(p => 
      p.content.toLowerCase().includes(q) || 
      (p.category && p.category.toLowerCase().includes(q))
    ).slice(0, 5);

    const matchedProducts = marketProducts.filter(p => 
      p.title.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    ).slice(0, 5);

    setResults({
      users: Array.from(uniqueUsers.values()).slice(0, 5),
      posts: matchedPosts,
      products: matchedProducts
    });
  }, [query, posts, marketProducts]);

  return (
    <div className="relative z-50 w-full mb-3" ref={containerRef}>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-400">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="ค้นหาเพื่อน, โพสต์, หรือสินค้า..."
          className="w-full bg-white/10 backdrop-blur-md border border-slate-700/50 text-white placeholder-slate-400 rounded-full py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-[14px]"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-h-[70vh] overflow-y-auto z-50">
          {results.users.length === 0 && results.posts.length === 0 && results.products.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-sm">
              ไม่พบผลลัพธ์ที่ตรงกับ "{query}"
            </div>
          )}

          {results.users.length > 0 && (
            <div className="p-2 border-b border-slate-100">
              <h3 className="px-3 py-1.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={12} /> เพื่อน / สมาชิก
              </h3>
              {results.users.map(u => (
                <div 
                  key={u.id}
                  onClick={() => { openPublicProfile(u.id); setIsOpen(false); }}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=random`} className="w-8 h-8 rounded-full object-cover bg-slate-100" />
                  <div className="text-[14px] font-bold text-slate-700">{u.name}</div>
                </div>
              ))}
            </div>
          )}

          {results.posts.length > 0 && (
            <div className="p-2 border-b border-slate-100">
              <h3 className="px-3 py-1.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle size={12} /> โพสต์ในชุมชน
              </h3>
              {results.posts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => { setActiveTab('community'); setIsOpen(false); }}
                  className="p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img src={p.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.author?.name || 'U')}&background=random`} className="w-5 h-5 rounded-full object-cover bg-slate-100" />
                    <span className="text-[12px] font-bold text-slate-600">{p.author.name}</span>
                    {p.category && (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">{p.category}</span>
                    )}
                  </div>
                  <p className="text-[13px] text-slate-800 line-clamp-2">{p.content}</p>
                </div>
              ))}
            </div>
          )}

          {results.products.length > 0 && (
            <div className="p-2">
              <h3 className="px-3 py-1.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Store size={12} /> ร้านค้าและสินค้า
              </h3>
              {results.products.map(p => (
                <div 
                  key={p.id}
                  onClick={() => { setActiveTab('market'); setIsOpen(false); }}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-slate-800 truncate">{p.title}</h4>
                    <div className="text-[12px] text-emerald-600 font-bold">฿{p.price}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
