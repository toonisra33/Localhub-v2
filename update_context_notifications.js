import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const notifEffect = `
  useEffect(() => {
    if (!isLoggedIn || !userProfile?.id) {
      setNotifications([]);
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
      
      // Play sound for new notifications that just arrived
      setNotifications(prev => {
        if (prev.length > 0 && fetchedNotifs.length > 0) {
          const newNotifs = fetchedNotifs.filter(n => !prev.find(p => p.id === n.id));
          if (newNotifs.some(n => !n.read)) {
            soundManager.playAlertSound();
            AppNotifications.send(\`การแจ้งเตือนใหม่\`, {
              body: newNotifs[0].message,
              requireInteraction: false,
            });
          }
        }
        return fetchedNotifs;
      });
      
    }, (error) => {
      console.warn('Firestore subscription warning (notifications):', error);
    });

    return () => unsub();
  }, [isLoggedIn, userProfile?.id]);
`;

// Replace `useEffect(() => {\n    try { localStorage.setItem('locallink_notifications', JSON.stringify(notifications)); } catch {}\n  }, [notifications]);` or something similar, or just insert it before `const requireAuth`.
content = content.replace(/const requireAuth = /, notifEffect.trim() + "\\n\\n  const requireAuth = ");

fs.writeFileSync('src/context/CommunityContext.tsx', content);
