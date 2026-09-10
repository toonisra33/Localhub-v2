const fs = require('fs');
let file = 'src/context/CommunityContext.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/notifications\.filter/g, '(notifications || []).filter');
fs.writeFileSync(file, content);
console.log('patched');
