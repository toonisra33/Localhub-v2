import fs from 'fs';
let content = fs.readFileSync('src/components/HomeFeed.tsx', 'utf8');

if (!content.includes('import { GlobalSearch }')) {
  content = content.replace("import { LocalHubLogo } from './LocalHubLogo';", "import { LocalHubLogo } from './LocalHubLogo';\nimport { GlobalSearch } from './GlobalSearch';");
}

const target = `<LocalHubLogo size="sm" variant="light" showSubtitle={true} />`;
content = content.replace(target, `<LocalHubLogo size="sm" variant="light" showSubtitle={true} />\n          <div className="flex-1 px-4 hidden md:block">\n            <GlobalSearch />\n          </div>`);

const mobileTarget = `{/* Contact Admin & Request PR Button */}`;
content = content.replace(mobileTarget, `<div className="md:hidden w-full px-4">\n          <GlobalSearch />\n        </div>\n        {/* Contact Admin & Request PR Button */}`);

fs.writeFileSync('src/components/HomeFeed.tsx', content);
