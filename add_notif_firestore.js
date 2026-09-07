import fs from 'fs';
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const notifFn = `
/**
 * Create a notification in Firestore
 */
export async function createNotificationInFirestore(
  recipientUid: string,
  senderUid: string,
  title: string,
  message: string,
  type: 'alert' | 'broadcast' | 'community' | 'market' | 'social',
  link?: string
): Promise<void> {
  // Don't notify yourself
  if (recipientUid === senderUid) return;
  
  const path = 'notifications';
  try {
    const notifRef = doc(collection(db, 'notifications'));
    await setDoc(notifRef, {
      id: notifRef.id,
      recipientUid,
      senderUid,
      title,
      message,
      read: false,
      type,
      link: link || null,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
`;

content = content.replace(/export async function deletePostFromFirestore/, notifFn.trim() + "\\n\\nexport async function deletePostFromFirestore");

fs.writeFileSync('src/lib/firebase.ts', content);
