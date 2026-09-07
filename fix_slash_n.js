import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

content = content.replace(/addCommentToFirestore,\\n  createNotificationInFirestore,/g, "addCommentToFirestore,\n  createNotificationInFirestore,");

fs.writeFileSync('src/context/CommunityContext.tsx', content);
