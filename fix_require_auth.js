import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

content = content.replace(
  "      senderUid: userProfile.id, promptMessage?: string) => boolean;",
  "promptMessage?: string) => boolean;"
);

fs.writeFileSync('src/context/CommunityContext.tsx', content);
