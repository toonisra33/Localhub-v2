import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const effectCode = `
  useEffect(() => {
    try { localStorage.setItem('locallink_contact_requests', JSON.stringify(contactRequests)); } catch {}
  }, [contactRequests]);

  useEffect(() => {
    try { localStorage.setItem('locallink_profile', JSON.stringify(userProfile)); } catch {}
  }, [userProfile]);

  useEffect(() => {
    try { localStorage.setItem('locallink_verification_requests', JSON.stringify(verificationRequests)); } catch {}
  }, [verificationRequests]);

  useEffect(() => {
    const unsubPosts = onSnapshot(
      query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100)),
      (snapshot) => {
        const fetchedPosts = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          let avatarUrl = data.author?.avatar || data.authorAvatar || 'https://ui-avatars.com/api/?name=U&background=random';
          if (avatarUrl.includes('images.unsplash.com')) {
            avatarUrl = 'https://ui-avatars.com/api/?name=U&background=random';
          }
          fetchedPosts.push(data);
        });
        setPosts(fetchedPosts);
      },
      (error) => console.warn('Firestore subscription warning (posts):', error)
    );

    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(100)),
      (snapshot) => {
        const fetchedProds = [];
        snapshot.forEach(doc => fetchedProds.push(doc.data()));
        setProducts(fetchedProds);
      },
      (error) => console.warn('Firestore subscription warning (products):', error)
    );

    const unsubEvents = onSnapshot(
      query(collection(db, 'events'), limit(50)),
      (snapshot) => {
        const fetchedEvents = [];
        snapshot.forEach(doc => fetchedEvents.push(doc.data()));
        setEvents(fetchedEvents);
      },
      (error) => console.warn('Firestore subscription warning (events):', error)
    );
    
    const unsubContactReqs = onSnapshot(
      query(collection(db, 'contact_requests'), orderBy('createdAt', 'desc'), limit(100)),
      (snapshot) => {
        const fetchedReqs = [];
        snapshot.forEach(doc => fetchedReqs.push(doc.data()));
        setContactRequests(fetchedReqs);
      },
      (error) => console.warn('Firestore subscription warning (contact_requests):', error)
    );

    const sessionsQuery = query(collection(db, 'user_sessions'), limit(20));
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
        setUserSessions(logs);
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        setIsFirestoreConnected(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => {
      unsubPosts();
      unsubProducts();
      unsubEvents();
      unsubContactReqs();
      unsubscribeSessions();
      unsubscribeAuth();
    };
  }, []);
`;

const insertIndex = content.lastIndexOf('const requireAuth =');
if (insertIndex !== -1) {
  content = content.slice(0, insertIndex) + effectCode + content.slice(insertIndex);
  fs.writeFileSync('src/context/CommunityContext.tsx', content);
}
