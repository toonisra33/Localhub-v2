import fs from 'fs';
let content = fs.readFileSync('firestore.rules', 'utf8');

const targetStr = `allow create: if isAuthenticated() && (request.auth.uid in request.resource.data.participants);`;
const replaceStr = `allow create: if isAuthenticated() && (request.resource.data.isGroup == true || request.auth.uid in request.resource.data.participants);`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('firestore.rules', content);
