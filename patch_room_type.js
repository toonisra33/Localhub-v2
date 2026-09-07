import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(
  'export interface ChatRoom {\n  id: string;',
  'export interface ChatRoom {\n  id: string;\n  isGroup?: boolean;\n  groupName?: string;\n  groupAvatar?: string;'
);
fs.writeFileSync('src/types.ts', content);
