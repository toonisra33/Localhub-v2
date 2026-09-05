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
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
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
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
export const db = initializeFirestore(app, { 
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)") ? firebaseConfig.firestoreDatabaseId : undefined);
//


export const googleProvider = new GoogleAuthProvider();

// Configured Root Admins (Initial bootstrap emails)
export const ROOT_ADMIN_EMAILS = [
  'toonisra33@gmail.com',
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
export async function checkAuthRedirectResult() {
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
    }
  } catch (error: any) {
    if (error && error.message && error.message.includes("Database is closing")) {
      console.warn("Firebase Auth: Ignored 'Database is closing' error during getRedirectResult. This is a common harmless warning in Android WebViews.");
      return;
    }
    console.error('Redirect auth error:', error);
  }
}

/**
 * Sign in with Google Auth (uses Redirect for mobile compatibility)
 */
export async function signInWithGoogleAuth(locationString?: string) {
  try {
    if (typeof window !== 'undefined' && locationString) {
      sessionStorage.setItem('locallink_pending_loc', locationString);
    }
    
    // Check if we are running inside an iframe (like AI Studio preview)
    const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

    if (isInsideIframe) {
      // Use popup for AI Studio iframe to avoid 403 Forbidden errors
      const result = await signInWithPopup(auth, googleProvider);
      return { user: result.user, role: 'user' };
    } else {
      // Use redirect for normal web and Android apps (TWA) to prevent external browser bounce
      await signInWithRedirect(auth, googleProvider);
      // Code below will not execute immediately because the page redirects
      return { user: auth.currentUser, role: 'user' }; 
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
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
    await setDoc(userRef, {
      ...profileData,
      displayName: profileData?.name,
      photoURL: profileData.avatar,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Save / Create Post in Firestore
 */
export async function savePostToFirestore(post: Post): Promise<void> {
  const path = `posts/${post.id}`;
  try {
    const postRef = doc(db, 'posts', post.id);
    await setDoc(postRef, {
      id: post.id,
      authorUid: post.authorUid || auth.currentUser?.uid || 'anonymous',
      authorName: post.author?.name || 'ไม่ระบุตัวตน',
      authorAvatar: post.author?.avatar || '',
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
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
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

/**
 * Add comment to post in Firestore
 */
export async function addCommentToFirestore(postId: string, comment: PostComment): Promise<void> {
  const path = `posts/${postId}/comments/${comment.id}`;
  try {
    const commentRef = doc(db, 'posts', postId, 'comments', comment.id);
    await setDoc(commentRef, {
      id: comment.id,
      postId: postId,
      authorUid: comment.authorUid || auth.currentUser?.uid || 'user_comment',
      authorName: comment.author?.name || 'ไม่ระบุตัวตน',
      authorAvatar: comment.author?.avatar || '',
      content: comment.content,
      createdAt: serverTimestamp()
    });

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
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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
