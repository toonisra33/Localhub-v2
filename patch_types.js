import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(
  '  isActive: boolean;\n}',
  '  isActive: boolean;\n  checkIn?: CheckInLocation;\n}'
);
fs.writeFileSync('src/types.ts', content);
