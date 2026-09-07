import fs from 'fs';
let content = fs.readFileSync('src/lib/chat.ts', 'utf8');

// Replace all console.warn("Firestore listener error:", error); with console.warn("Firestore listener error in X:", error);
content = content.replace(/console\.warn\("Firestore listener error:", error\);/g, 'console.warn("Firestore listener error in chat.ts:", error);');

fs.writeFileSync('src/lib/chat.ts', content);
