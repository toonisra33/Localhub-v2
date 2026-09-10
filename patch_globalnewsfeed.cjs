const fs = require('fs');
let file = 'src/components/GlobalNewsFeed.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\/\/ Mock data for trending global posts if needed[\s\S]*?\];/g, '');
content = content.replace(/\.\.\.mockGlobalPosts/g, '');

fs.writeFileSync(file, content);
console.log('GlobalNewsFeed patched');
