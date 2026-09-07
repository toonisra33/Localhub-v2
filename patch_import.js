import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

content = content.replace("query,", "query, where,");
fs.writeFileSync('src/context/CommunityContext.tsx', content);
