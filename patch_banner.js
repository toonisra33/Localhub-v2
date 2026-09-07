import fs from 'fs';
let content = fs.readFileSync('src/components/AdminBroadcastBanner.tsx', 'utf8');

// We want to add initial full screen mode.
// We can use a localStorage key to track if it has been "minimized" for this specific broadcast.
// We'll replace the state block:

const oldState = `  const [isExpanded, setIsExpanded] = useState(false);
  const isLeaving = deviceRemainingSeconds <= 1;`;

const newState = `  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(() => {
    if (!activeBroadcast) return false;
    const key = \`locallink_broadcast_fullscreen_\${activeBroadcast.id}\`;
    return localStorage.getItem(key) !== 'true';
  });

  const isLeaving = deviceRemainingSeconds <= 1;

  // Sync fullscreen state if broadcast changes
  React.useEffect(() => {
    if (activeBroadcast) {
      const key = \`locallink_broadcast_fullscreen_\${activeBroadcast.id}\`;
      const isMinimized = localStorage.getItem(key) === 'true';
      setIsFullScreen(!isMinimized);
      if (!isMinimized) {
        setIsExpanded(true); // Auto expand when in full screen
      }
    }
  }, [activeBroadcast]);

  const handleMinimize = () => {
    if (!activeBroadcast) return;
    setIsFullScreen(false);
    setIsExpanded(false);
    const key = \`locallink_broadcast_fullscreen_\${activeBroadcast.id}\`;
    localStorage.setItem(key, 'true');
  };`;

content = content.replace(oldState, newState);

const oldWrapper = `    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-700 ease-in-out">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div 
          className={\`transition-all duration-700 ease-in-out transform \${
            isLeaving 
              ? 'opacity-0 -translate-y-full max-h-0 pointer-events-none' 
              : 'opacity-100 translate-y-0 max-h-[850px] animate-in slide-in-from-top-full duration-500 shadow-[0_16px_40px_rgba(0,0,0,0.35)]'
          }\`}
        >
          <div className={\`\${theme.wrapper} px-4 py-2.5 sm:px-5 transition-all relative overflow-hidden rounded-b-[28px] backdrop-blur-xl\`}>`;

const newWrapper = `    <div className={\`fixed z-[100] transition-all duration-700 ease-in-out \${isFullScreen ? 'inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-auto flex items-center justify-center p-4' : 'top-0 left-0 right-0 pointer-events-none'}\`}>
      <div className={\`pointer-events-auto transition-all duration-700 w-full \${isFullScreen ? 'max-w-lg' : 'max-w-md mx-auto'}\`}>
        <div 
          className={\`transition-all duration-700 ease-in-out transform \${
            isLeaving 
              ? (isFullScreen ? 'opacity-0 scale-95' : 'opacity-0 -translate-y-full max-h-0')
              : 'opacity-100 translate-y-0 scale-100 animate-in fade-in duration-500 shadow-[0_16px_40px_rgba(0,0,0,0.35)]'
          }\`}
        >
          <div className={\`\${theme.wrapper} \${isFullScreen ? 'px-5 py-5 sm:px-6 rounded-[32px]' : 'px-4 py-2.5 sm:px-5 rounded-b-[28px]'} transition-all relative overflow-hidden backdrop-blur-xl\`}>`;

content = content.replace(oldWrapper, newWrapper);

const oldExpandBtn = `                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-semibold transition-colors flex items-center"
                  aria-label="ขยายดูรายละเอียด"
                >
                  {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>`;

const newExpandBtn = `                {isFullScreen ? (
                  <button
                    onClick={handleMinimize}
                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    aria-label="ย่อประกาศ"
                  >
                    <span>รับทราบ ย่อลง</span>
                    <ChevronUp size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg text-xs font-semibold transition-colors flex items-center"
                    aria-label="ขยายดูรายละเอียด"
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                )}`;

content = content.replace(oldExpandBtn, newExpandBtn);

const oldTitle = `            <div className="mt-2 text-[14px] font-bold leading-snug">`;
const newTitle = `            <div className={\`mt-2 \${isFullScreen ? 'text-[18px] sm:text-[20px] mb-3' : 'text-[14px]'} font-bold leading-snug\`}>`;

content = content.replace(oldTitle, newTitle);

const oldDesc = `            <p className="mt-1 text-[13px] text-white/90 leading-relaxed line-clamp-2">
              {activeBroadcast.message}
            </p>`;
const newDesc = `            <p className={\`mt-1 \${isFullScreen ? 'text-[15px] sm:text-[16px] mb-4' : 'text-[13px]'} text-white/90 leading-relaxed \${!isExpanded && !isFullScreen ? 'line-clamp-2' : ''}\`}>
              {activeBroadcast.message}
            </p>`;

content = content.replace(oldDesc, newDesc);

// Need to make sure the Expanded Media matches up
const oldExpanded = `            {/* Expanded Media & Details Section */}
            {isExpanded && (`;

const newExpanded = `            {/* Expanded Media & Details Section */}
            {(isExpanded || isFullScreen) && (`;

content = content.replace(oldExpanded, newExpanded);

fs.writeFileSync('src/components/AdminBroadcastBanner.tsx', content);
