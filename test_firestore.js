import fs from 'fs';
let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf8');

content = content.replace(
  "saveEntityToFirestore('broadcasts', 'active', newBroadcast);",
  "saveEntityToFirestore('broadcasts', 'active', newBroadcast).then(() => console.log('Successfully saved broadcast')).catch(e => console.error('Failed to save broadcast', e));"
);

fs.writeFileSync('src/context/BroadcastContext.tsx', content);
