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
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-[17px]';
  const subTextSize = size === 'sm' ? 'text-[9.5px]' : size === 'lg' ? 'text-[12px]' : 'text-[10px]';
  const isLight = variant === 'light';

  return (
    <div className="flex items-center gap-2.5 select-none" id="localhub-brand-logo">
      {/* App Icon from public folder */}
      <div 
        className={`relative flex items-center justify-center overflow-hidden rounded-2xl shadow-lg transition-transform hover:scale-105 ${
          size === 'sm' ? 'w-8 h-8 rounded-xl' : size === 'lg' ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10 rounded-[14px]'
        } shadow-emerald-500/25 ring-2 ring-white/20`}
      >
        <img 
          src="/icon-192.png?v=2"
          alt="LocalHub" 
          className="w-full h-full object-cover"
        />
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
