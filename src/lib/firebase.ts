import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  addDoc,
  updateDoc,
  deleteDoc,
  collection, 
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfileData, Post, PostComment, UserSessionLog } from '../types';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

function getFirestoreInstance() {
  const databaseId = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)") 
    ? firebaseConfig.firestoreDatabaseId 
    : undefined;
  try {
    return databaseId 
      ? initializeFirestore(app, { experimentalForceLongPolling: true }, databaseId) 
      : initializeFirestore(app, { experimentalForceLongPolling: true });
  } catch {
    return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  }
}
export const db = getFirestoreInstance();

//


export function isRunningInIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export function getGoogleAuthProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  return provider;
}

// Configured Root Admins (Initial bootstrap emails)
export const ROOT_ADMIN_EMAILS = [
  'toonisra33@gmail.com',
  'israwat.lovebf@gmail.com',
  'admin@locallink.app',
  'admin@localhub.app'
];

/**
 * Standard Operation Types for Firestore Error Handling (as specified in Firebase Skill)
 */
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Robust standardized Firestore error handler with offline tolerance
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  // Only log if it's a critical permission or configuration issue, not routine offline status
  if (!errMsg.includes('offline') && !errMsg.includes('unavailable') && !errMsg.includes('Failed to get document')) {
    console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  }
  return errInfo;
}

/**
 * Test Connection to Firestore server with offline fallback
 */
export async function testConnection(): Promise<boolean> {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    return true;
  } catch (error) {
    // Firestore operates reliably in offline cache mode
    return false;
  }
}

/**
 * Checks if an email is authorized as an Admin
 */
export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ROOT_ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === email.toLowerCase().trim());
}

/**
 * Log user session & access history to Firestore (/user_sessions)
 */
export async function logUserSession(
  userId: string,
  userName: string,
  userEmail: string,
  loginMethod: 'google' | 'password' | 'anonymous',
  ipOrLocation?: string
): Promise<void> {
  const path = 'user_sessions';
  try {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sessionRef = doc(db, path, sessionId);
    await setDoc(sessionRef, {
      id: sessionId,
      userId,
      userName: userName || 'สมาชิกชุมชน',
      userEmail: userEmail || '',
      loginMethod,
      ipOrLocation: ipOrLocation || navigator.language || 'Thailand',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Check redirect result after returning from Google Login
 */
export async function checkAuthRedirectResult(): Promise<{ user: any; role: string; name: string; avatar: string } | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;
      const isAdmin = isAuthorizedAdminEmail(user.email);
      const role = isAdmin ? 'admin' : 'user';
      const locationString = typeof window !== 'undefined' ? sessionStorage.getItem('locallink_pending_loc') || 'กรุงเทพมหานคร' : 'กรุงเทพมหานคร';

      // Sync or update user in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'สมาชิกชุมชน',
        photoURL: user.photoURL || 'https://ui-avatars.com/api/?name=U&background=random',
        role: role,
        isVerified: true,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          ...userData,
          createdAt: serverTimestamp(),
          phone: user.phoneNumber || '',
          address: locationString,
          villageOrCondo: 'ชุมชนในพื้นที่',
          bio: 'สมาชิกชุมชนผู้ใช้งานผ่าน Google Account',
          reputationScore: isAdmin ? 100 : 80,
        });
      } else {
        const existingData = userSnap.data();
        const finalRole = isAdmin ? 'admin' : (existingData.role || 'user');
        await setDoc(userRef, {
          ...userData,
          role: finalRole,
        }, { merge: true });
      }

      await logUserSession(
        user.uid,
        user.displayName || user.email || 'สมาชิก Google',
        user.email || '',
        'google',
        locationString
      );

      const name = user.displayName || user.email?.split('@')[0] || 'สมาชิก Google';
      const avatar = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

      return { user, role, name, avatar };
    }
    return null;
  } catch (error: any) {
    if (error && error.message && error.message.includes("Database is closing")) {
      console.warn("Firebase Auth: Ignored 'Database is closing' error during getRedirectResult.");
      return null;
    }
    console.error('Redirect auth error:', error);
    return null;
  }
}

/**
 * Send password reset email via Firebase Auth
 */
export async function resetUserPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Direct Google Redirect Auth (guarantees account chooser opens even if popups are blocked)
 */
export async function signInWithGoogleDirectRedirect(locationString?: string): Promise<void> {
  if (isRunningInIframe()) {
    // In iframe environments, signInWithRedirect causes a blank screen due to X-Frame-Options
    await signInWithGoogleAuth(locationString);
    return;
  }
  if (typeof window !== 'undefined' && locationString) {
    try {
      sessionStorage.setItem('locallink_pending_loc', locationString);
    } catch {}
  }
  const provider = getGoogleAuthProvider();
  await signInWithRedirect(auth, provider);
}

/**
 * Sign in with Google Auth (always forces account selection dialog)
 */
export async function signInWithGoogleAuth(locationString?: string): Promise<{ user: any; role: string } | { isRedirecting: boolean }> {
  try {
    if (typeof window !== 'undefined' && locationString) {
      try {
        sessionStorage.setItem('locallink_pending_loc', locationString);
      } catch {}
    }
    
    const provider = getGoogleAuthProvider();

    // Strategy 1: Try signInWithPopup first
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const isAdmin = isAuthorizedAdminEmail(user.email);
      const role = isAdmin ? 'admin' : 'user';

      // Save user record to Firestore immediately
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'สมาชิกชุมชน',
          photoURL: user.photoURL || 'https://ui-avatars.com/api/?name=U&background=random',
          role: isAdmin ? 'admin' : (userSnap.exists() ? (userSnap.data().role || 'user') : 'user'),
          isVerified: isAdmin ? true : (userSnap.exists() ? (userSnap.data().isVerified || false) : false),
          reputationScore: isAdmin ? 100 : (userSnap.exists() ? (userSnap.data().reputationScore || 50) : 50),
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            ...userData,
            createdAt: serverTimestamp(),
            phone: user.phoneNumber || '',
            address: locationString || 'ชุมชนในพื้นที่',
            villageOrCondo: 'ชุมชนในพื้นที่',
            bio: 'สมาชิกชุมชนผู้ใช้งานผ่าน Google Account',
          });
        } else {
          await setDoc(userRef, userData, { merge: true });
        }

        await logUserSession(
          user.uid,
          user.displayName || user.email || 'สมาชิก Google',
          user.email || '',
          'google',
          locationString || 'ประเทศไทย'
        );
      } catch (dbErr) {
        console.warn('Firestore user profile sync warning:', dbErr);
      }

      return { user, role };
    } catch (popupErr: any) {
      console.warn('Popup login attempt failed, evaluating fallback...', popupErr);
      // If user simply closed the popup, do not redirect
      if (popupErr.code === 'auth/popup-closed-by-user') {
        throw popupErr;
      }

      // Do not use signInWithRedirect because on mobile/standalone it bounces users out into external browser
      const friendlyErr = new Error('เบราว์เซอร์บล็อกหน้าต่าง Google กรุณาอนุญาตป๊อปอัป หรือเข้าสู่ระบบด้วยอีเมล/รหัสผ่าน');
      (friendlyErr as any).code = 'auth/popup-blocked';
      throw friendlyErr;
    }
  } catch (error) {
    console.error('Google Auth Error:', error);
    throw error;
  }
}

/**
 * Sync / Save user personal profile to Firestore
 */
export async function syncUserProfileToFirestore(userId: string, profileData: Partial<UserProfileData>): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    
    const dataToUpdate: any = { ...profileData, updatedAt: serverTimestamp() };
    if (profileData.name !== undefined) dataToUpdate.displayName = profileData.name;
    if (profileData.avatar !== undefined) dataToUpdate.photoURL = profileData.avatar;
    
    // Remove undefined values
    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key] === undefined) {
        delete dataToUpdate[key];
      }
    });

    await setDoc(userRef, dataToUpdate, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

/**
 * Save / Create Post in Firestore
 */
const cleanData = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(cleanData);
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  // Let Firestore Timestamp, FieldValue, etc. pass through
  if (obj?.constructor?.name === 'FieldValue' || obj?.constructor?.name === 'Timestamp' || obj?._methodName) return obj;
  
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = cleanData(obj[key]);
    }
  }
  return cleaned;
};

export async function savePostToFirestore(post: Post): Promise<void> {
  const path = `posts/${post.id}`;
  try {
    const postRef = doc(db, 'posts', post.id);
    const dataToSave = cleanData({
      id: post.id,
      authorUid: post.authorUid || auth.currentUser?.uid || 'anonymous',
      author: {
        name: post.author?.name || 'ไม่ระบุตัวตน',
        avatar: post.author?.avatar || '',
        isVerified: post.author?.isVerified || false,
        reputationScore: post.author?.reputationScore || 0
      },
      authorName: post.author?.name || 'ไม่ระบุตัวตน', // For backward compatibility
      authorAvatar: post.author?.avatar || '', // For backward compatibility
      content: post.content,
      category: post.category || 'ทั่วไป',
      images: post.images || (post.image ? [post.image] : []),
      videoUrl: post.videoUrl || null,
      location: post.location || null,
      checkIn: post.checkIn || null,
      likes: post.likes || 0,
      comments: post.comments || 0,
      likedBy: post.likedBy || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    await setDoc(postRef, dataToSave);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

/**
 * Toggle Like on Post in Firestore
 */
export async function togglePostLikeInFirestore(postId: string, userId: string, isCurrentlyLiked: boolean): Promise<void> {
  const path = `posts/${postId}`;
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment(isCurrentlyLiked ? -1 : 1),
      likedBy: isCurrentlyLiked ? arrayRemove(userId) : arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function togglePostPinInFirestore(postId: string, isPinned: boolean): Promise<void> {
  const path = `posts/${postId}`;
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      isPinned: isPinned,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
}

/**
 * Add comment to post in Firestore
 */
export async function addCommentToFirestore(postId: string, comment: PostComment): Promise<void> {
  const path = `posts/${postId}/comments/${comment.id}`;
  try {
    const commentRef = doc(db, 'posts', postId, 'comments', comment.id);
    const dataToSave = cleanData({
      id: comment.id,
      postId: postId,
      authorUid: comment.authorUid || auth.currentUser?.uid || 'user_comment',
      author: {
        name: comment.author?.name || 'ไม่ระบุตัวตน',
        avatar: comment.author?.avatar || '',
        isVerified: comment.author?.isVerified || false,
        reputationScore: comment.author?.reputationScore || 0
      },
      authorName: comment.author?.name || 'ไม่ระบุตัวตน', // backward compatibility
      authorAvatar: comment.author?.avatar || '', // backward compatibility
      content: comment.content,
      createdAt: serverTimestamp()
    });
    
    await setDoc(commentRef, dataToSave);

    // Increment comment count on parent post
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Delete Post from Firestore
 */
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
    const dataToSave = cleanData({
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
    
    await setDoc(notifRef, dataToSave);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteAlertFromFirestore(alertId: string): Promise<void> {
  const path = `alerts/${alertId}`;
  try {
    const alertRef = doc(db, 'alerts', alertId);
    await deleteDoc(alertRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

export async function deletePostFromFirestore(postId: string): Promise<void> {
  const path = `posts/${postId}`;
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Generic Save/Update Entity to Firestore
 */
export async function saveEntityToFirestore(collectionName: string, id: string, data: any): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    const docRef = doc(db, collectionName, id);
    const dataToSave = cleanData({ ...data, updatedAt: serverTimestamp() });
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Generic Delete Entity from Firestore
 */
export async function deleteEntityFromFirestore(collectionName: string, id: string): Promise<void> {
  const path = `${collectionName}/${id}`;
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Sign out of Firebase Auth
 */
export async function signOutAuth() {
  return signOut(auth);
}
