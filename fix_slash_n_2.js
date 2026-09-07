import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

content = content.replace(/\]\);\\n\\n  const requireAuth/g, "]);\n\n  const requireAuth");

fs.writeFileSync('src/context/CommunityContext.tsx', content);
