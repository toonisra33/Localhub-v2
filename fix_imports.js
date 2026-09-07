import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

content = content.replace(/import \{\s*doc,\s*getDoc,\s*setDoc,\s*collection,/m, "import { \n  doc, \n  getDoc, \n  setDoc, \n  updateDoc, \n  deleteDoc,\n  collection,");

fs.writeFileSync('src/context/CommunityContext.tsx', content);
