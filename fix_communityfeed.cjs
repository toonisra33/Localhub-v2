const fs = require('fs');
let file = 'src/components/CommunityFeed.tsx';
let content = fs.readFileSync(file, 'utf8');

// The file currently has a floating array elements due to bad regex before.
// We need to clean up everything from 'category: '\u0e41\u0e08\u0e49\u0e07\u0e40\u0e2b\u0e15\u0e38...' down to '];'
content = content.replace(/    category: '[\s\S]*?\];/g, '');

fs.writeFileSync(file, content);
console.log('Fixed floating array in CommunityFeed');
