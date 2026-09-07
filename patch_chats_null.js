import fs from 'fs';
let content = fs.readFileSync('firestore.rules', 'utf8');

const targetStr = `allow read: if isAuthenticated() && (resource.data.isGroup == true || request.auth.uid in resource.data.participants || isAdmin());`;
const replaceStr = `allow read: if isAuthenticated() && (resource == null || resource.data.isGroup == true || request.auth.uid in resource.data.participants || isAdmin());`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('firestore.rules', content);
