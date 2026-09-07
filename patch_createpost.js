import fs from 'fs';
let content = fs.readFileSync('src/components/modals/CreatePostModal.tsx', 'utf8');

const importRegex = /import React, \{ useState \} from 'react';/;
content = content.replace(importRegex, "import React, { useState } from 'react';\nimport { Loader2 } from 'lucide-react';");

const stateRegex = /const \[isAttaching, setIsAttaching\] = useState\(false\);/;
const stateAddition = `const [isAttaching, setIsAttaching] = useState(false);\n  const [isGeneratingAi, setIsGeneratingAi] = useState(false);`;
content = content.replace(stateRegex, stateAddition);

const funcAddition = `
  const handleAiAssist = async () => {
    if (!content.trim()) {
      showToast('กรุณาพิมพ์หัวข้อหรือคำสั้นๆ ก่อนให้ AI ช่วยเขียน', 'info');
      return;
    }
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: content, type: 'post' })
      });
      const data = await response.json();
      if (data.caption) {
        setContent(data.caption);
        showToast('✨ AI ช่วยเขียนข้อความให้แล้ว!', 'success');
      } else if (data.error) {
        showToast(data.error, 'error');
      }
    } catch (error) {
      showToast('ไม่สามารถเชื่อมต่อ AI ได้', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };
`;

const insertAfterRegex = /const fileInputRef = React\.useRef<HTMLInputElement>\(null\);/;
content = content.replace(insertAfterRegex, "const fileInputRef = React.useRef<HTMLInputElement>(null);\n" + funcAddition);

// Add the AI button in the UI
// Look for `<div className="flex items-center gap-1">` where the image/video buttons are.
const buttonsRegex = /<div className="flex items-center gap-1">[\s\S]*?<button[\s\S]*?onClick=\{[( \w=>)]*\}[\s\S]*?className="p-2 sm:p-2.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">[\s\S]*?<\/button>[\s\S]*?<\/div>/;

// Wait, I will just find `<div className="flex items-center gap-1">`
content = content.replace(/<div className="flex items-center gap-1">/, `<div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={isGeneratingAi || !content.trim()}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold transition-all \${
                  content.trim() && !isGeneratingAi
                    ? 'bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 hover:shadow-md'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }\`}
              >
                {isGeneratingAi ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span className="hidden sm:inline">{isGeneratingAi ? 'กำลังคิด...' : 'AI ช่วยเขียน'}</span>
              </button>
`);

fs.writeFileSync('src/components/modals/CreatePostModal.tsx', content);
