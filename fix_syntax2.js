import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const replacement = `
    const unsubEvents = onSnapshot(
      query(collection(db, 'events'), limit(50)),
      (snapshot) => {
        const fetchedEvents = [];
        snapshot.forEach(doc => fetchedEvents.push(doc.data()));
        setEvents(fetchedEvents);
      },
      (error) => console.warn('Firestore subscription warning (events):', error)
    );

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
`;

content = content.replace(/const unsubEvents = onSnapshot\([\s\S]*?console\.warn\('Firestore subscription warning \(events\):', error\)\n    \);\n\s*useEffect\(\(\) => \{\n\s*if \(\!isLoggedIn[\s\S]*?Existing auth effect below\n\s*const unsubscribeAuth = onAuthStateChanged\(auth, async \(firebaseUser\) => \{/m, replacement);

const sessionsEffect = `
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
`;

content = content.replace(/  \}, \[\]\);\n\n  useEffect\(\(\) => \{\n    if \(\!isLoggedIn \|\| \!userProfile\?\.id\)/, "  }, []);\n\n" + sessionsEffect.trim() + "\n\n  useEffect(() => {\n    if (!isLoggedIn || !userProfile?.id)");

fs.writeFileSync('src/context/CommunityContext.tsx', content);
