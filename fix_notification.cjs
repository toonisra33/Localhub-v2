const fs = require('fs');
const file = 'src/lib/chat.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /export const sendFriendRequest = async \(senderId: string, receiverId: string\) => \{\n  const friendshipId = \[senderId, receiverId\]\.sort\(\)\.join\('_'\);\n  const friendshipRef = doc\(db, 'friendships', friendshipId\);\n  await setDoc\(friendshipRef, \{\n    id: friendshipId,\n    users: \[senderId, receiverId\],\n    status: 'pending',\n    requesterId: senderId,\n    createdAt: Date\.now\(\)\n  \}\);/,
  `export const sendFriendRequest = async (senderId: string, receiverId: string) => {
  const friendshipId = [senderId, receiverId].sort().join('_');
  const friendshipRef = doc(db, 'friendships', friendshipId);
  await setDoc(friendshipRef, {
    id: friendshipId,
    users: [senderId, receiverId],
    status: 'pending',
    requesterId: senderId,
    createdAt: Date.now()
  });

  // Also create a notification for the receiver
  try {
    const notificationsRef = collection(db, 'notifications');
    const senderDoc = await getDoc(doc(db, 'users', senderId));
    const senderName = senderDoc.exists() ? (senderDoc.data().name || 'มีผู้ใช้') : 'มีผู้ใช้';
    
    await setDoc(doc(notificationsRef, \`friend_req_\${friendshipId}\`), {
      id: \`friend_req_\${friendshipId}\`,
      type: 'system',
      title: 'คำขอเป็นเพื่อน',
      message: \`\${senderName} ได้ส่งคำขอเป็นเพื่อนถึงคุณ\`,
      time: 'เมื่อสักครู่',
      read: false,
      createdAt: Date.now(),
      recipientUid: receiverId
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }`
);

fs.writeFileSync(file, content);
