const fs = require('fs');
const file = 'src/context/CommunityContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = "useEffect(() => {\\n    const unsubPosts = onSnapshot(";
const replacement = "useEffect(() => {\\n    const unsubAlerts = onSnapshot(\\n      query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(100)),\\n      (snapshot) => {\\n        const fetchedAlerts: Alert[] = [];\\n        snapshot.forEach(docSnap => {\\n          const data = docSnap.data();\\n          fetchedAlerts.push({\\n            id: docSnap.id,\\n            type: data.type || 'general',\\n            title: data.title || '',\\n            description: data.description || '',\\n            location: data.location || {},\\n            time: data.time || 'เมื่อสักครู่',\\n            status: data.status || 'unconfirmed',\\n            confirmations: data.confirmations || 0,\\n            rejections: data.rejections || 0,\\n            reportedBy: data.reportedBy,\\n            image: data.image\\n          });\\n        });\\n        setAlerts(fetchedAlerts);\\n      },\\n      (error) => console.warn('Firestore subscription warning (alerts):', error)\\n    );\\n    const unsubPosts = onSnapshot(";

content = content.replace(targetStr, replacement);
fs.writeFileSync(file, content);
