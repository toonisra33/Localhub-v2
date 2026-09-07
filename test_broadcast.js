import fs from 'fs';
let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf8');
content = content.replace(
  "if (snapshot.exists()) {",
  "console.log('Broadcast snapshot:', snapshot.data()); if (snapshot.exists()) {"
);
fs.writeFileSync('src/context/BroadcastContext.tsx', content);
