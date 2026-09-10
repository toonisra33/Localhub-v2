const fs = require('fs');
let file = 'src/components/CommunityFeed.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove import { mockPosts }
content = content.replace(/const mockPosts.*?\n.*?\n.*?\n.*?\n/g, ''); // Wait, let's just do it directly.

content = content.replace(/  \/\/ Show mock data alongside real posts so the feed looks populated for new users\n  const isMockData = true; \/\/ Always show for now as requested\n  const displayPosts = \[\n    \.\.\.posts,\n    \.\.\.mockPosts\.map\(p => \(\{\n      \.\.\.p,\n      content: p\.content \+ '\\n\\n\*\(\u0e19\u0e35\u0e48\u0e04\u0e37\u0e2d\u0e42\u0e1e\u0e2a\u0e15\u0e4c\u0e15\u0e31\u0e27\u0e2d\u0e22\u0e48\u0e32\u0e07\)\*'\n    \}\)\)\n  \];/g, '  const displayPosts = posts;');

fs.writeFileSync(file, content);
console.log('CommunityFeed patched');
