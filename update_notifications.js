import fs from 'fs';
let content = fs.readFileSync('src/lib/notifications.ts', 'utf8');
content = content.replace(
  "if (document.hidden || !document.hasFocus()) {",
  "if (true) { // Always notify for emergencies"
);
fs.writeFileSync('src/lib/notifications.ts', content);
