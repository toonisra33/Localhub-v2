const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(
  /match \/broadcasts\/\{broadcastId\} \{\s+allow read: if true;\s+allow write: if true; \/\/ Relaxed for demo purposes\s+\}/,
  'match /broadcasts/{broadcastId} {\n      allow read: if true;\n      allow write: if isAdmin();\n    }'
);
fs.writeFileSync('firestore.rules', rules);
console.log('Restored firestore.rules');
