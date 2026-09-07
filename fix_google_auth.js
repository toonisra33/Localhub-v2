import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const replacement = `
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
          } else {
            // New Google User - create document
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
              reputationScore: 50,
              isGoogleUser: true
            }));
          }
`;

content = content.replace(/          if \(userSnap\.exists\(\)\) \{\s+const data = userSnap\.data\(\);\s+setUserProfile\(prev => \(\{\s+\.\.\.prev,\s+id: firebaseUser\.uid,\s+uid: firebaseUser\.uid,\s+name: data\.displayName \|\| firebaseUser\.displayName \|\| 'สมาชิก',\s+email: data\.email \|\| firebaseUser\.email \|\| '',\s+avatar: data\.photoURL \|\| firebaseUser\.photoURL \|\| 'https:\/\/ui-avatars\.com\/api\/\?name=U&background=random',\s+phone: data\.phone \|\| '',\s+address: data\.address \|\| '',\s+villageOrCondo: data\.villageOrCondo \|\| '',\s+bio: data\.bio \|\| '',\s+role: data\.role \|\| 'user',\s+isVerified: data\.isVerified \|\| false,\s+reputationScore: data\.reputationScore \|\| 50\s+\}\)\);\s+\}/g, replacement.trim());

fs.writeFileSync('src/context/CommunityContext.tsx', content);
