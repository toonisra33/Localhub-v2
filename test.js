import fs from 'fs';
const content = fs.readFileSync('src/components/modals/AuthModal.tsx', 'utf8');
const fileInput = content.match(/onClick=\{\(\) => fileInputRef.current\?\.click\(\)\}/g);
console.log(fileInput);
