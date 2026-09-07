import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

content = content.replace(
  "id,",
  "id,\n      senderUid: userProfile.id,"
);

fs.writeFileSync('src/context/CommunityContext.tsx', content);
