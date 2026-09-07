import fs from 'fs';
let content = fs.readFileSync('src/components/CommunityFeed.tsx', 'utf8');

// Import
content = content.replace(
  "import { LocalHubLogo } from './LocalHubLogo';",
  "import { LocalHubLogo } from './LocalHubLogo';\nimport { AISummaryWidget } from './AISummaryWidget';"
);

// Add the widget before the posts mapping
const regex = /\{posts\.length === 0 \? \(/;
content = content.replace(regex, `<AISummaryWidget />\n\n          {posts.length === 0 ? (`);

fs.writeFileSync('src/components/CommunityFeed.tsx', content);
