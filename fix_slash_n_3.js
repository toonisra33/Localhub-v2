import fs from 'fs';
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

content = content.replace(/\\n\\nexport async function deletePostFromFirestore/g, "\n\nexport async function deletePostFromFirestore");

fs.writeFileSync('src/lib/firebase.ts', content);
