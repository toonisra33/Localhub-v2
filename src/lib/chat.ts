import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ChatRoom, Message, Friendship, UserProfileData } from '../types';

export const getOrCreateChatRoom = async (userId1: string, userId2: string, user1Details: any, user2Details: any): Promise<string> => {
  const roomId = [userId1, userId2].sort().join('_');
  const roomRef = doc(db, 'chats', roomId);
  
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) {
    await setDoc(roomRef, {
      id: roomId,
      participants: [userId1, userId2],
      participantDetails: {
        [userId1]: { name: user1Details.name, avatar: user1Details.avatar },
        [userId2]: { name: user2Details.name, avatar: user2Details.avatar }
      },
      lastMessage: '',
      lastMessageTime: Date.now(),
      updatedAt: Date.now()
    });
  }
  return roomId;
};

export const sendMessage = async (roomId: string, senderId: string, text: string) => {
  const messagesRef = collection(db, 'chats', roomId, 'messages');
  const timestamp = Date.now();
  
  await addDoc(messagesRef, {
    roomId,
    senderId,
    text,
    createdAt: timestamp,
    readBy: [senderId]
  });

  const roomRef = doc(db, 'chats', roomId);
  await updateDoc(roomRef, {
    lastMessage: text,
    lastMessageTime: timestamp,
    updatedAt: timestamp
  });
};

export const subscribeToChats = (userId: string, callback: (chats: ChatRoom[]) => void) => {
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => doc.data() as ChatRoom);
    callback(chats);
  });
};

export const subscribeToMessages = (roomId: string, callback: (messages: Message[]) => void) => {
  const q = query(collection(db, 'chats', roomId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    callback(messages);
  });
};

export const addFriend = async (userId1: string, userId2: string) => {
  const friendshipId = [userId1, userId2].sort().join('_');
  const friendshipRef = doc(db, 'friendships', friendshipId);
  await setDoc(friendshipRef, {
    id: friendshipId,
    users: [userId1, userId2],
    status: 'accepted',
    createdAt: Date.now()
  });
};

export const subscribeToFriends = (userId: string, callback: (friends: string[]) => void) => {
  const q = query(collection(db, 'friendships'), where('users', 'array-contains', userId), where('status', '==', 'accepted'));
  return onSnapshot(q, (snapshot) => {
    const friends = snapshot.docs.map(doc => {
      const data = doc.data() as Friendship;
      return data.users.find(u => u !== userId) as string;
    });
    callback(friends);
  });
};

export const getUserDetails = async (userId: string): Promise<UserProfileData | null> => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfileData;
  }
  return null;
};
