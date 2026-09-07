import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

content = content.replace(
  "const newRequest: AdminContactRequest = {\\n      ...data,\\n      id,\\n      createdAt: Date.now(),",
  "const newRequest: AdminContactRequest = {\\n      ...data,\\n      id,\\n      senderUid: userProfile.id,\\n      createdAt: Date.now(),"
);

fs.writeFileSync('src/context/CommunityContext.tsx', content);
