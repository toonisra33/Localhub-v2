import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

content = content.replace(
  "q = query(collection(db, 'contact_requests'), where('senderUid', '==', userProfile.id), orderBy('createdAt', 'desc'), limit(50));",
  "q = query(collection(db, 'contact_requests'), where('senderUid', '==', userProfile.id), limit(50));"
);

content = content.replace(
  "snapshot.forEach(doc => fetchedReqs.push(doc.data()));",
  "snapshot.forEach(doc => fetchedReqs.push(doc.data()));\n      if (userProfile.role !== 'admin') { fetchedReqs.sort((a,b) => b.createdAt - a.createdAt); }"
);

fs.writeFileSync('src/context/CommunityContext.tsx', content);
