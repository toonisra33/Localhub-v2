const fs = require('fs');
const file = 'src/components/modals/IncidentReportModal.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useRef } from 'react';");

content = content.replace(/const handleSimulatePhoto = \(\) => {[\s\S]*?};/, `
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Use URL.createObjectURL to display local file preview
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };
`);

content = content.replace(/<button\s+type="button"\s+onClick=\{handleSimulatePhoto\}[\s\S]*?<\/button>/, `
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,video/*" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={handleCameraClick}
                className="w-full py-3 border-2 border-dashed border-slate-200 hover:border-rose-300 rounded-2xl bg-slate-50 hover:bg-rose-50/40 text-slate-600 hover:text-rose-600 flex items-center justify-center gap-2 text-[13px] font-bold transition-all"
              >
                <Camera size={18} />
                <span>ถ่ายภาพ / แนบรูปภาพเหตุการณ์</span>
              </button>
`);

fs.writeFileSync(file, content);
