import fs from 'fs';
let content = fs.readFileSync('firestore.rules', 'utf8');

const targetStrRead = `allow read: if isAuthenticated() && (request.auth.uid in get(/databases/$(database)/documents/chats/$(roomId)).data.participants || isAdmin());`;
const replaceStrRead = `allow read: if isAuthenticated() && (get(/databases/$(database)/documents/chats/$(roomId)).data.isGroup == true || request.auth.uid in get(/databases/$(database)/documents/chats/$(roomId)).data.participants || isAdmin());`;

const targetStrCreate = `allow create: if isAuthenticated() && (request.auth.uid in get(/databases/$(database)/documents/chats/$(roomId)).data.participants) && request.resource.data.senderId == request.auth.uid;`;
const replaceStrCreate = `allow create: if isAuthenticated() && (get(/databases/$(database)/documents/chats/$(roomId)).data.isGroup == true || request.auth.uid in get(/databases/$(database)/documents/chats/$(roomId)).data.participants) && request.resource.data.senderId == request.auth.uid;`;

content = content.replace(targetStrRead, replaceStrRead);
content = content.replace(targetStrCreate, replaceStrCreate);

fs.writeFileSync('firestore.rules', content);
