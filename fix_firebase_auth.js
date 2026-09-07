import fs from 'fs';
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

content = content.replace(
  "await signInWithPopup(auth, googleProvider);",
  "await signInWithRedirect(auth, googleProvider);"
);

fs.writeFileSync('src/lib/firebase.ts', content);
