import fs from 'fs';
let content = fs.readFileSync('src/components/HomeFeed.tsx', 'utf8');

// First remove the incorrect one
content = content.replace(
  `        <div className="mb-4">
          <GlobalSearch />
        </div>
        </div>
        {/* Location Selector */}`,
  `        </div>
        {/* Location Selector */}`
);

// Insert properly before Location Selector
content = content.replace(
  `        {/* Location Selector */}`,
  `        <div className="mb-4">\n          <GlobalSearch />\n        </div>\n\n        {/* Location Selector */}`
);

fs.writeFileSync('src/components/HomeFeed.tsx', content);
