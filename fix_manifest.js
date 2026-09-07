import fs from 'fs';
let content = fs.readFileSync('vite.config.ts', 'utf8');

content = content.replace(
  /theme_color: '#ffffff',/,
  "theme_color: '#111827',"
);

content = content.replace(
  /background_color: '#ffffff',/,
  "background_color: '#111827',"
);

fs.writeFileSync('vite.config.ts', content);
