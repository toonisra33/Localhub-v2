import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

// Remove the old unsubContactReqs from the big useEffect
content = content.replace(
  /const unsubContactReqs = onSnapshot\([\s\S]*?console\.warn\('Firestore subscription warning \(contact_requests\):', error\)\n    \);/,
  ""
);
content = content.replace(
  "unsubContactReqs();\n",
  ""
);

// Insert a new useEffect right after the big one
const newEffect = `
  useEffect(() => {
    if (!isLoggedIn || !userProfile?.id) {
      setContactRequests([]);
      return;
    }
    
    let q;
    if (userProfile.role === 'admin') {
      q = query(collection(db, 'contact_requests'), orderBy('createdAt', 'desc'), limit(100));
    } else {
      q = query(collection(db, 'contact_requests'), where('senderUid', '==', userProfile.id), orderBy('createdAt', 'desc'), limit(50));
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedReqs = [];
      snapshot.forEach(doc => fetchedReqs.push(doc.data()));
      setContactRequests(fetchedReqs);
    }, (error) => {
      console.warn('Firestore subscription warning (contact_requests):', error);
    });

    return () => unsub();
  }, [isLoggedIn, userProfile?.role, userProfile?.id]);
`;

const insertIndex = content.lastIndexOf('const requireAuth =');
if (insertIndex !== -1) {
  content = content.slice(0, insertIndex) + newEffect + content.slice(insertIndex);
  fs.writeFileSync('src/context/CommunityContext.tsx', content);
}
