import fs from 'fs';
let content = fs.readFileSync('src/components/modals/CheckInPickerModal.tsx', 'utf8');
content = content.replace('z-[90]', 'z-[120]');
fs.writeFileSync('src/components/modals/CheckInPickerModal.tsx', content);
