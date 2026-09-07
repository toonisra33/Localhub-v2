import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

// 1. Fix sendEmailVerification
content = content.replace(
  /await sendEmailVerification\(user\);/,
  `try { await sendEmailVerification(user); } catch (e) { console.warn('Email verification skipped', e); }`
);

// 2. Fix onAuthStateChanged race condition
const raceConditionFix = `
          } else {
            // New Google User - create document (only if Google, to prevent race condition with email registration)
            const isGoogleUser = firebaseUser.providerData.some(p => p.providerId === 'google.com');
            
            if (isGoogleUser) {
              const newUserData = {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || 'สมาชิก',
                email: firebaseUser.email || '',
                photoURL: firebaseUser.photoURL || 'https://ui-avatars.com/api/?name=U&background=random',
                role: 'user',
                isVerified: false,
                reputationScore: 50,
                joinedDate: new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
              };
              await setDoc(userRef, newUserData);
              setUserProfile(prev => ({
                ...prev,
                id: firebaseUser.uid,
                uid: firebaseUser.uid,
                name: newUserData.displayName,
                email: newUserData.email,
                avatar: newUserData.photoURL,
                role: 'user',
                isVerified: false,
                isGoogleUser: true
              }));
            }
          }
`;

content = content.replace(
  /} else \{\s*\/\/ New Google User - create document[\s\S]*?isVerified: false,\n\s*isGoogleUser: true\n\s*\}\)\);\n\s*\}/m,
  raceConditionFix.trim()
);

fs.writeFileSync('src/context/CommunityContext.tsx', content);
