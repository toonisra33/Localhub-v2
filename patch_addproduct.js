import fs from 'fs';
let content = fs.readFileSync('src/components/modals/AddProductModal.tsx', 'utf8');

const importRegex = /import React, \{ useState, useRef \} from 'react';/;
content = content.replace(importRegex, "import React, { useState, useRef } from 'react';\nimport { Loader2, Sparkles } from 'lucide-react';");

const stateRegex = /const \[isUploading, setIsUploading\] = useState\(false\);/;
const stateAddition = `const [isUploading, setIsUploading] = useState(false);\n  const [isGeneratingAi, setIsGeneratingAi] = useState(false);`;
content = content.replace(stateRegex, stateAddition);

const funcAddition = `
  const handleAiAssist = async () => {
    const keywords = title || description;
    if (!keywords.trim()) {
      showToast('กรุณาพิมพ์ชื่อสินค้าหรือรายละเอียดสั้นๆ ก่อนให้ AI ช่วยเขียน', 'info');
      return;
    }
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords, type: 'product' })
      });
      const data = await response.json();
      if (data.caption) {
        setDescription(data.caption);
        showToast('✨ AI ช่วยเขียนข้อความโฆษณาให้แล้ว!', 'success');
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

const insertAfterRegex = /const fileInputRef = useRef<HTMLInputElement>\(null\);/;
content = content.replace(insertAfterRegex, "const fileInputRef = useRef<HTMLInputElement>(null);\n" + funcAddition);

// Find the description textarea container and add the AI button next to the label
const labelRegex = /<label className="block text-sm font-bold text-slate-700 mb-1.5">\s*รายละเอียดสินค้า\s*<\/label>/;
content = content.replace(labelRegex, `<div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-bold text-slate-700">รายละเอียดสินค้า</label>
              <button
                type="button"
                onClick={handleAiAssist}
                disabled={isGeneratingAi || (!title.trim() && !description.trim())}
                className={\`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold transition-all \${
                  (title.trim() || description.trim()) && !isGeneratingAi
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-teal-700 hover:shadow-md'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }\`}
              >
                {isGeneratingAi ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>{isGeneratingAi ? 'กำลังคิด...' : 'AI ช่วยเขียนให้'}</span>
              </button>
            </div>`);

fs.writeFileSync('src/components/modals/AddProductModal.tsx', content);
