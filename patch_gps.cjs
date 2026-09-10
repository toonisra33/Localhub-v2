const fs = require('fs');

// Patch Context
let file1 = 'src/context/CommunityContext.tsx';
let content1 = fs.readFileSync(file1, 'utf8');

// Update Interface
content1 = content1.replace(
  /requestRealLocation: \(\) => Promise<boolean>;/,
  'requestRealLocation: () => Promise<{success: boolean, lat?: number, lng?: number}>;'
);

// Update implementation
content1 = content1.replace(
  /const requestRealLocation = async \(\): Promise<boolean> => {/,
  'const requestRealLocation = async (): Promise<{success: boolean, lat?: number, lng?: number}> => {'
);
content1 = content1.replace(
  /resolve\(true\);/g,
  'resolve({success: true, lat: position.coords.latitude, lng: position.coords.longitude});'
);
content1 = content1.replace(
  /resolve\(false\);/g,
  'resolve({success: false});'
);

fs.writeFileSync(file1, content1);

// Patch Map
let file2 = 'src/components/AroundMeMap.tsx';
let content2 = fs.readFileSync(file2, 'utf8');

content2 = content2.replace(
  /const success = await requestRealLocation\(\);\s+if \(success && location\.latitude && location\.longitude\) {/g,
  `const result = await requestRealLocation();
    if (result.success && result.lat && result.lng) {`
);

content2 = content2.replace(
  /setMapCenter\(\{ lat: location\.latitude, lng: location\.longitude \}\);/g,
  `setMapCenter({ lat: result.lat, lng: result.lng });`
);

fs.writeFileSync(file2, content2);
console.log('patched');
