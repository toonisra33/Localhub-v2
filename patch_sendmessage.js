import fs from 'fs';
let content = fs.readFileSync('src/lib/chat.ts', 'utf8');
content = content.replace(
  /export const sendMessage = async \(roomId: string, senderId: string, text: string\) => \{/,
  'export const sendMessage = async (roomId: string, senderId: string, text: string, imageUrl?: string) => {'
);
content = content.replace(
  /roomId,\n    senderId,\n    text,\n    createdAt: timestamp,\n    readBy: \[senderId\]/,
  'roomId,\n    senderId,\n    text,\n    imageUrl: imageUrl || null,\n    createdAt: timestamp,\n    readBy: [senderId]'
);
content = content.replace(
  /lastMessage: text,/,
  'lastMessage: text || (imageUrl ? "[ส่งรูปภาพ]" : ""), // fallback text if empty'
);
fs.writeFileSync('src/lib/chat.ts', content);
