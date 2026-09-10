const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix locallink_alerts
  content = content.replace(
    /const saved = localStorage\.getItem\('locallink_alerts'\);\s+return saved \? JSON\.parse\(saved\) : initialAlerts;/g,
    `const saved = localStorage.getItem('locallink_alerts');
      if (!saved) return initialAlerts;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : initialAlerts;`
  );

  // Fix locallink_verification_requests
  content = content.replace(
    /const saved = localStorage\.getItem\('locallink_verification_requests'\);\s+return saved \? JSON\.parse\(saved\) : \[\];/g,
    `const saved = localStorage.getItem('locallink_verification_requests');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];`
  );

  // Fix locallink_notifications
  content = content.replace(
    /const saved = localStorage\.getItem\('locallink_notifications'\);\s+return saved \? JSON\.parse\(saved\) : \[\];/g,
    `const saved = localStorage.getItem('locallink_notifications');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];`
  );

  // Fix locallink_contact_requests
  content = content.replace(
    /const saved = localStorage\.getItem\('locallink_contact_requests'\);\s+return saved \? JSON\.parse\(saved\) : \[\];/g,
    `const saved = localStorage.getItem('locallink_contact_requests');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];`
  );

  fs.writeFileSync(filePath, content);
}

patchFile('src/context/CommunityContext.tsx');

let mapContent = fs.readFileSync('src/components/MapSearchAutocomplete.tsx', 'utf8');
mapContent = mapContent.replace(
  /const saved = localStorage\.getItem\(RECENT_SEARCHES_KEY\);\s+return saved \? JSON\.parse\(saved\) : \[\];/g,
  `const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];`
);
fs.writeFileSync('src/components/MapSearchAutocomplete.tsx', mapContent);

let map2Content = fs.readFileSync('src/components/AroundMeMap.tsx', 'utf8');
map2Content = map2Content.replace(
  /const saved = localStorage\.getItem\(STORAGE_CUSTOM_PINS_KEY\);\s+return saved \? JSON\.parse\(saved\) : \[\];/g,
  `const saved = localStorage.getItem(STORAGE_CUSTOM_PINS_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];`
);
fs.writeFileSync('src/components/AroundMeMap.tsx', map2Content);

console.log('patched');
