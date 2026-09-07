import fs from 'fs';
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const newAuthCode = `export async function signInWithGoogleAuth(locationString?: string) {
  try {
    if (typeof window !== 'undefined' && locationString) {
      sessionStorage.setItem('locallink_pending_loc', locationString);
    }
    
    // Check execution environment
    const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
    const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);

    if (isStandalone || isInsideIframe) {
      // For installed PWAs, we MUST use Popup. 
      // Using Redirect in a PWA kicks the user out of the app into a normal browser tab.
      const result = await signInWithPopup(auth, googleProvider);
      return { user: result.user, role: 'user' }; 
    } else {
      // For normal mobile browsers, Redirect is safer against popup blockers.
      await signInWithRedirect(auth, googleProvider);
      return { user: auth.currentUser, role: 'user' }; 
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'users');
    throw error;
  }
}`;

content = content.replace(
  /export async function signInWithGoogleAuth[\s\S]*?throw error;\n  }\n}/,
  newAuthCode
);

fs.writeFileSync('src/lib/firebase.ts', content);
