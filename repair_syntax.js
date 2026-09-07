import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

content = content.replace(/return \(\) =>   \}, \[isLoggedIn, userProfile\?\.role\]\);/g, "return () => unsubscribeSessions();\n  }, [isLoggedIn, userProfile?.role]);");

fs.writeFileSync('src/context/CommunityContext.tsx', content);
