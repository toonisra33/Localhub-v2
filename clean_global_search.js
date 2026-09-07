import fs from 'fs';
let content = fs.readFileSync('src/components/HomeFeed.tsx', 'utf8');

// Replace all instances of `<div className="mb-4">\n          <GlobalSearch />\n        </div>`
content = content.split('<div className="mb-4">\n          <GlobalSearch />\n        </div>').join('');
// Insert exactly one before Location Selector
content = content.replace(
  `{/* Location Selector */}`,
  `<div className="mb-4"><GlobalSearch /></div>\n        {/* Location Selector */}`
);

fs.writeFileSync('src/components/HomeFeed.tsx', content);
