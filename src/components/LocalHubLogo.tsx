import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'auto';
  showSubtitle?: boolean;
}

export const LocalHubLogo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'light',
  showSubtitle = true 
}) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 38 : 30;
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-[17px]';
  const subTextSize = size === 'sm' ? 'text-[9.5px]' : size === 'lg' ? 'text-[12px]' : 'text-[10px]';

  const isLight = variant === 'light';

  return (
    <div className="flex items-center gap-2.5 select-none" id="localhub-brand-logo">
      {/* Modern High-End App Icon */}
      <div 
        className={`relative flex items-center justify-center rounded-2xl shadow-lg transition-transform hover:scale-105 ${
          size === 'sm' ? 'w-8 h-8 rounded-xl' : size === 'lg' ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10 rounded-[14px]'
        } bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-emerald-500/25 ring-2 ring-white/20`}
      >
        <svg 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Signal wave arches */}
          <path 
            d="M5 11C8.8 7.5 14 5.5 20 6.5" 
            stroke="rgba(255,255,255,0.7)" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
          />
          <path 
            d="M8 15C11 12 15 11 19 12" 
            stroke="rgba(255,255,255,0.9)" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
          />
          {/* Central Location Pin + Home Hub Shape */}
          <path 
            d="M16 8C12.134 8 9 11.134 9 15C9 19.8 14.8 25.2 15.5 25.8C15.8 26.1 16.2 26.1 16.5 25.8C17.2 25.2 23 19.8 23 15C23 11.134 19.866 8 16 8Z" 
            fill="white" 
          />
          {/* Inner Home Roof Icon */}
          <path 
            d="M16 12L12.5 15.2H14.2V18.2H17.8V15.2H19.5L16 12Z" 
            fill="#059669" 
          />
          {/* Active Live Dot Pulse */}
          <circle cx="24" cy="9" r="2.5" fill="#F43F5E" />
          <circle cx="24" cy="9" r="4.5" stroke="#F43F5E" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>

      {/* App Name & Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight ${textSize} ${isLight ? 'text-white' : 'text-slate-900'}`}>
            Local<span className="text-emerald-400">Hub</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-[9px] font-black text-emerald-300 tracking-wider uppercase">
            LIVE
          </span>
        </div>
        {showSubtitle && (
          <span className={`font-medium tracking-tight mt-1 ${subTextSize} ${isLight ? 'text-emerald-100/80' : 'text-slate-500'}`}>
            ศูนย์รวมชุมชน & บรอดแคสสด
          </span>
        )}
      </div>
    </div>
  );
};
