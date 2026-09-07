import fs from 'fs';
let content = fs.readFileSync('src/lib/chat.ts', 'utf8');

// Replace all onSnapshot(q, (snapshot) => { ... }); with onSnapshot(q, (snapshot) => { ... }, (error) => console.warn(error));
content = content.replace(/return onSnapshot\(q, \(snapshot\) => \{([\s\S]*?)\}\);/g, 'return onSnapshot(q, (snapshot) => {$1}, (error) => { console.warn("Firestore listener error:", error); });');

// also for doc
content = content.replace(/return onSnapshot\(friendshipRef, \(doc\) => \{([\s\S]*?)\}\);/g, 'return onSnapshot(friendshipRef, (doc) => {$1}, (error) => { console.warn("Firestore listener error:", error); });');

fs.writeFileSync('src/lib/chat.ts', content);
