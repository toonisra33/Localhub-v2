const fs = require('fs');
const file = 'src/components/modals/IncidentReportModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /import \{ X, AlertTriangle, Droplets, Zap, Construction, Car, ShieldAlert, Camera, MapPin, Sparkles, Navigation \} from 'lucide-react';/,
  "import { X, AlertTriangle, Droplets, Zap, Construction, Car, ShieldAlert, Camera, MapPin, Sparkles, Navigation, Image as ImageIcon } from 'lucide-react';"
);

content = content.replace(
  /const fileInputRef = useRef<HTMLInputElement>\(null\);\n\n  const handleFileChange = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{\n    const file = e\.target\.files\?\.\[0\];\n    if \(file\) \{\n      \/\/ Use URL\.createObjectURL to display local file preview\n      const localUrl = URL\.createObjectURL\(file\);\n      setImageUrl\(localUrl\);\n    \}\n  \};\n\n  const handleCameraClick = \(\) => \{\n    fileInputRef\.current\?\.click\(\);\n  \};/,
  `  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };`
);

const oldJsx = `<> <input 
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
            </>`;

const newJsx = `<>
              <input 
                type="file" 
                ref={cameraInputRef} 
                onChange={handleFileChange} 
                accept="image/*,video/*"
                capture="environment" 
                className="hidden" 
              />
              <input 
                type="file" 
                ref={galleryInputRef} 
                onChange={handleFileChange} 
                accept="image/*,video/*" 
                className="hidden" 
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="flex-1 py-3 border-2 border-dashed border-slate-200 hover:border-emerald-300 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 text-slate-600 hover:text-emerald-600 flex flex-col items-center justify-center gap-1.5 text-[12px] font-bold transition-all"
                >
                  <Camera size={20} />
                  <span>ถ่ายภาพตอนนี้</span>
                </button>
                <button
                  type="button"
                  onClick={handleGalleryClick}
                  className="flex-1 py-3 border-2 border-dashed border-slate-200 hover:border-rose-300 rounded-2xl bg-slate-50 hover:bg-rose-50/40 text-slate-600 hover:text-rose-600 flex flex-col items-center justify-center gap-1.5 text-[12px] font-bold transition-all"
                >
                  <ImageIcon size={20} />
                  <span>เลือกจากคลังภาพ</span>
                </button>
              </div>
            </>`;

content = content.replace(oldJsx, newJsx);
fs.writeFileSync(file, content);
