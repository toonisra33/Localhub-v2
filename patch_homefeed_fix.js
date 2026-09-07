import fs from 'fs';
let content = fs.readFileSync('src/components/HomeFeed.tsx', 'utf8');

content = content.replace(
  `<LocalHubLogo size="sm" variant="light" showSubtitle={true} />
          <div className="flex-1 px-4 hidden md:block">
            <GlobalSearch />
          </div>`,
  `<LocalHubLogo size="sm" variant="light" showSubtitle={true} />`
);

content = content.replace(
  `<div className="md:hidden w-full px-4">
          <GlobalSearch />
        </div>
        {/* Contact Admin & Request PR Button */}`,
  `{/* Contact Admin & Request PR Button */}`
);

// Insert GlobalSearch below the brand bar
const topBrandBarTarget = /<div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-800\/70">[\s\S]*?<\/div>/;

content = content.replace(topBrandBarTarget, (match) => {
  return match + `\n        <div className="mb-4">\n          <GlobalSearch />\n        </div>`;
});

fs.writeFileSync('src/components/HomeFeed.tsx', content);
