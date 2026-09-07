import fs from 'fs';

function patchFile(filename) {
  if (!fs.existsSync(filename)) return;
  let content = fs.readFileSync(filename, 'utf8');
  
  // Add e.target.value = ''
  const uploadRegex = /reader\.readAsDataURL\(file\);\s*\};/g;
  content = content.replace(uploadRegex, "reader.readAsDataURL(file);\n    e.target.value = '';\n  };");
  
  // Add e.preventDefault()
  content = content.replace(/onClick=\{\(\) => fileInputRef\.current\?\.click\(\)\}/g, "onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}");

  fs.writeFileSync(filename, content);
}

patchFile('src/components/modals/AddProductModal.tsx');
patchFile('src/components/modals/CreatePostModal.tsx');
