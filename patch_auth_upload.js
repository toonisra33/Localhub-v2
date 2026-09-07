import fs from 'fs';

function patchFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');
  
  // 1. Add e.target.value = '' inside handleFileUpload
  const uploadRegex = /reader\.readAsDataURL\(file\);\s*\};/g;
  content = content.replace(uploadRegex, "reader.readAsDataURL(file);\n    e.target.value = '';\n  };");
  
  // 2. Add e.preventDefault() to click handlers
  content = content.replace(/onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\}/g, "onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}");

  fs.writeFileSync(filename, content);
}

patchFile('src/components/modals/AuthModal.tsx');
patchFile('src/components/modals/EditProfileModal.tsx');
