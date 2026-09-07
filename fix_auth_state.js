import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const newAuthCode = `
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        setIsFirestoreConnected(true);
        // Fetch user profile from Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserProfile(prev => ({
              ...prev,
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              name: data.displayName || firebaseUser.displayName || 'สมาชิก',
              email: data.email || firebaseUser.email || '',
              avatar: data.photoURL || firebaseUser.photoURL || 'https://ui-avatars.com/api/?name=U&background=random',
              phone: data.phone || '',
              address: data.address || '',
              villageOrCondo: data.villageOrCondo || '',
              bio: data.bio || '',
              role: data.role || 'user',
              isVerified: data.isVerified || false,
              reputationScore: data.reputationScore || 50
            }));
          }
        } catch (e) {
          console.error("Failed to fetch user profile on auth state change", e);
        }
      } else {
        setIsLoggedIn(false);
      }
    });
`;

content = content.replace(
  /const unsubscribeAuth = onAuthStateChanged[\s\S]*?setIsLoggedIn\(false\);\s*\}\s*\}\);/,
  newAuthCode.trim()
);

fs.writeFileSync('src/context/CommunityContext.tsx', content);
