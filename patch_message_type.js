import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(
  'export interface Message {\n  id: string;',
  'export interface Message {\n  id: string;\n  imageUrl?: string;'
);
fs.writeFileSync('src/types.ts', content);
