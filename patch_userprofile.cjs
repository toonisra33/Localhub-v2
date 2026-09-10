const fs = require('fs');
let file = 'src/components/UserProfile.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const MOCK_NEARBY_USERS = \[[\s\S]*?\];/g, '');
content = content.replace(/const nearbyUsers = MOCK_NEARBY_USERS\.filter\(u => u\.distance <= friendSearchRadius\);/g, 'const nearbyUsers: any[] = [];');

fs.writeFileSync(file, content);
console.log('UserProfile patched');
