import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const regex = /const sessionsQuery[\s\S]*?setUserSessions\(logs\);\n\s*\}\n\s*\}\);\n/m;
content = content.replace(regex, '');

const newEffect = `
  useEffect(() => {
    if (!isLoggedIn || userProfile?.role !== 'admin') {
      setUserSessions([]);
      return;
    }
    const sessionsQuery = query(collection(db, 'user_sessions'), limit(100));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const logs = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            userId: data.userId || 'anonymous',
            userName: data.userName || 'สมาชิก',
            userEmail: data.userEmail || '',
            loginMethod: data.loginMethod || 'google',
            ipOrLocation: data.ipOrLocation || 'กรุงเทพมหานคร',
            createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
          };
        });
        logs.sort((a,b) => b.createdAt - a.createdAt);
        setUserSessions(logs);
      }
    }, (error) => {
      console.warn('Firestore subscription warning (sessions):', error);
    });
    return () => unsubscribeSessions();
  }, [isLoggedIn, userProfile?.role]);

  // Existing auth effect below
`;

content = content.replace(/const unsubscribeAuth = onAuthStateChanged/, newEffect + '    const unsubscribeAuth = onAuthStateChanged');

// Also remove `unsubscribeSessions();` from the return block of the main useEffect since it's moved
content = content.replace(/unsubscribeSessions\(\);\n/g, '');

fs.writeFileSync('src/context/CommunityContext.tsx', content);
