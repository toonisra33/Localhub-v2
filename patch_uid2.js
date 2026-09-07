import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const target = `    if (auth.currentUser?.uid) {
      try {
        await syncUserProfileToFirestore(auth.currentUser.uid, data);`;

const replacement = `    const targetUid = auth.currentUser?.uid || userProfile?.uid || userProfile?.id;
    if (targetUid && targetUid !== 'user_default') {
      try {
        await syncUserProfileToFirestore(targetUid, data);`;

content = content.replace(target, replacement);
fs.writeFileSync('src/context/CommunityContext.tsx', content);
