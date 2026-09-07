import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

content = content.replace(
  "if (auth.currentUser?.uid) {",
  "const targetUid = auth.currentUser?.uid || prev.uid || prev.id;\n      if (targetUid) {\n        try {\n          await syncUserProfileToFirestore(targetUid, data);"
);

// Wait, the previous state might not be available like that if it's outside setUserProfile
