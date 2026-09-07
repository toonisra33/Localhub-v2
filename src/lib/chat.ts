import { db } from './firebase';
import { deleteDoc } from 'firebase/firestore';
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
        [userId1]: { name: user1Details?.name, avatar: user1Details?.avatar },
        [userId2]: { name: user2Details?.name, avatar: user2Details?.avatar }
      },
      lastMessage: '',
      lastMessageTime: Date.now(),
      updatedAt: Date.now()
    });
  }
  return roomId;
};

export const sendMessage = async (roomId: string, senderId: string, text: string, imageUrl?: string) => {
  const messagesRef = collection(db, 'chats', roomId, 'messages');
  const timestamp = Date.now();
  
  await addDoc(messagesRef, {
    roomId,
    senderId,
    text,
    imageUrl: imageUrl || null,
    createdAt: timestamp,
    readBy: [senderId]
  });

  const roomRef = doc(db, 'chats', roomId);
  await updateDoc(roomRef, {
    lastMessage: text || (imageUrl ? "[ส่งรูปภาพ]" : ""), // fallback text if empty
    lastMessageTime: timestamp,
    lastMessageSenderId: senderId,
    updatedAt: timestamp
  });
};

export const subscribeToChats = (userId: string, callback: (chats: ChatRoom[]) => void) => {
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => doc.data() as ChatRoom);
    callback(chats);
  }, (error) => { console.warn("Firestore listener error in chat.ts:", error); });
};

export const subscribeToMessages = (roomId: string, callback: (messages: Message[]) => void) => {
  const q = query(collection(db, 'chats', roomId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    callback(messages);
  }, (error) => { console.warn("Firestore listener error in chat.ts:", error); });
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
  }, (error) => { console.warn("Firestore listener error in chat.ts:", error); });
};

export const getUserDetails = async (userId: string): Promise<UserProfileData | null> => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    return {
      ...data,
      name: data.name || data.displayName || 'สมาชิกชุมชน',
      avatar: data.avatar || data.photoURL || 'https://ui-avatars.com/api/?name=U&background=random',
      phone: data.phone || '',
      address: data.address || '',
      bio: data.bio || ''
    } as UserProfileData;
  }
  return null;
};

export const sendFriendRequest = async (senderId: string, receiverId: string) => {
  const friendshipId = [senderId, receiverId].sort().join('_');
  const friendshipRef = doc(db, 'friendships', friendshipId);
  await setDoc(friendshipRef, {
    id: friendshipId,
    users: [senderId, receiverId],
    status: 'pending',
    requesterId: senderId,
    createdAt: Date.now()
  });
};

export const acceptFriendRequest = async (userId1: string, userId2: string) => {
  const friendshipId = [userId1, userId2].sort().join('_');
  const friendshipRef = doc(db, 'friendships', friendshipId);
  await updateDoc(friendshipRef, {
    status: 'accepted',
    updatedAt: Date.now()
  });
};

export const rejectFriendRequest = async (userId1: string, userId2: string) => {
  const friendshipId = [userId1, userId2].sort().join('_');
  const friendshipRef = doc(db, 'friendships', friendshipId);
  const snap = await getDoc(friendshipRef);
  if (snap.exists()) {
    // Delete the friendship doc
    const { deleteDoc } = require('firebase/firestore');
    await deleteDoc(friendshipRef);
  }
};

export const subscribeToPendingRequests = (userId: string, callback: (requesterIds: string[]) => void) => {
  const q = query(collection(db, 'friendships'), where('users', 'array-contains', userId), where('status', '==', 'pending'));
  return onSnapshot(q, (snapshot) => {
    const requesters = snapshot.docs
      .map(doc => doc.data() as Friendship)
      .filter(f => f.requesterId !== userId) // Only requests sent to me
      .map(f => f.requesterId!);
    callback(requesters);
  }, (error) => { console.warn("Firestore listener error in chat.ts:", error); });
};

export const subscribeToFriendshipStatus = (userId1: string, userId2: string, callback: (status: { status: 'none' | 'pending' | 'accepted', requesterId?: string }) => void) => {
  const friendshipId = [userId1, userId2].sort().join('_');
  const friendshipRef = doc(db, 'friendships', friendshipId);
  return onSnapshot(friendshipRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data() as Friendship;
      callback({ status: data.status, requesterId: data.requesterId });
    } else {
      callback({ status: 'none' });
    }
  }, (error) => { console.warn("Firestore listener error in chat.ts:", error); });
};

export const subscribeToGroups = (callback: (groups: ChatRoom[]) => void) => {
  const q = query(collection(db, 'chats'), where('isGroup', '==', true), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map(doc => doc.data() as ChatRoom);
    callback(groups);
  }, (error) => { console.warn("Firestore listener error in chat.ts:", error); });
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
