import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const oldEffect = /useEffect\\(\\(\\) => \\{\\s*if \\(!isLoggedIn \\|\\| !userProfile\\?\\.id\\) \\{\\s*setNotifications\\(\\[\\]\\);\\s*return;\\s*\\}[\\s\\S]*?console\\.warn\\('Firestore subscription warning \\(notifications\\):', error\\);\\s*\\}\\);\\s*return \\(\\) => unsub\\(\\);\\s*\\}, \\[isLoggedIn, userProfile\\?\\.id\\]\\);/m;

const newEffect = `
  const isInitialNotifFetch = useRef(true);

  useEffect(() => {
    if (!isLoggedIn || !userProfile?.id) {
      setNotifications([]);
      isInitialNotifFetch.current = true;
      return;
    }
    
    const q = query(collection(db, 'notifications'), where('recipientUid', '==', userProfile.id), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedNotifs = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        fetchedNotifs.push({
          id: doc.id,
          ...data,
          time: data.createdAt?.toMillis ? new Date(data.createdAt.toMillis()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : 'เมื่อสักครู่',
        });
      });
      
      setNotifications(prev => {
        // If this is not the very first fetch for this user
        if (!isInitialNotifFetch.current) {
          const newNotifs = fetchedNotifs.filter(n => !prev.find(p => p.id === n.id));
          if (newNotifs.some(n => !n.read)) {
            soundManager.playAlertSound();
            AppNotifications.send(\`การแจ้งเตือนใหม่\`, {
              body: newNotifs.find(n => !n.read)?.message || 'คุณมีการแจ้งเตือนใหม่',
              requireInteraction: false,
            });
          }
        }
        
        isInitialNotifFetch.current = false;
        return fetchedNotifs;
      });
      
    }, (error) => {
      console.warn('Firestore subscription warning (notifications):', error);
    });

    return () => unsub();
  }, [isLoggedIn, userProfile?.id]);
`;

content = content.replace(oldEffect, newEffect.trim());

fs.writeFileSync('src/context/CommunityContext.tsx', content);
