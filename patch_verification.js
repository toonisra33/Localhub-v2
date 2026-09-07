import fs from 'fs';
let content = fs.readFileSync('src/components/modals/IdVerificationModal.tsx', 'utf8');

if (!content.includes('import { compressImage }')) {
  content = content.replace(/import React/, "import { compressImage } from '../../lib/imageUtils';\nimport React");
}

const targetFunctionRegex = /const handleImageUpload = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?setImagePreview\(url\);\n    \}\n  \};/g;

const newFunction = `const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น', 'error');
        return;
      }
      try {
        const base64 = await compressImage(file);
        setImagePreview(base64);
      } catch (err) {
        showToast('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ', 'error');
      }
    }
    e.target.value = '';
  };`;

content = content.replace(targetFunctionRegex, newFunction);
fs.writeFileSync('src/components/modals/IdVerificationModal.tsx', content);
