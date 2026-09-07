import fs from 'fs';
let content = fs.readFileSync('src/components/modals/PostDetailCommentsModal.tsx', 'utf8');

content = content.replace(
  /const unsubscribe = onSnapshot\(q, \(snapshot\) => \{([\s\S]*?)\}\);/,
  'const unsubscribe = onSnapshot(q, (snapshot) => {$1}, (error) => console.warn("Firestore comments error:", error));'
);

fs.writeFileSync('src/components/modals/PostDetailCommentsModal.tsx', content);
