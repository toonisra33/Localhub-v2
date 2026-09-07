import fs from 'fs';
let content = fs.readFileSync('src/lib/chat.ts', 'utf8');

const newFunctions = `
export const subscribeToGroups = (callback: (groups: ChatRoom[]) => void) => {
  const q = query(collection(db, 'chats'), where('isGroup', '==', true), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map(doc => doc.data() as ChatRoom);
    callback(groups);
  });
};

export const initializeGroups = async () => {
  const defaultGroups = [
    { id: 'group_general', name: 'พูดคุยเรื่องทั่วไป', icon: 'https://ui-avatars.com/api/?name=พ&background=10b981&color=fff' },
    { id: 'group_market', name: 'ซื้อขาย-แลกเปลี่ยน', icon: 'https://ui-avatars.com/api/?name=ซ&background=f59e0b&color=fff' },
    { id: 'group_pets', name: 'คนรักสัตว์', icon: 'https://ui-avatars.com/api/?name=ส&background=ec4899&color=fff' }
  ];
  
  for (const group of defaultGroups) {
    const roomRef = doc(db, 'chats', group.id);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) {
      await setDoc(roomRef, {
        id: group.id,
        isGroup: true,
        groupName: group.name,
        groupAvatar: group.icon,
        participants: [],
        participantDetails: {},
        lastMessage: 'ยินดีต้อนรับสู่กลุ่ม!',
        lastMessageTime: Date.now(),
        updatedAt: Date.now()
      });
    }
  }
};
`;

content = content + newFunctions;
fs.writeFileSync('src/lib/chat.ts', content);
