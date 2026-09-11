const fs = require('fs');
const path = 'firestore.rules';
let content = fs.readFileSync(path, 'utf8');

const target = `    match /alerts/{alertId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAdmin();
    }`;

const replacement = `    match /alerts/{alertId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAdmin() || (isAuthenticated() && resource.data.reportedBy == request.auth.uid);
    }`;

content = content.replace(target, replacement);

fs.writeFileSync(path, content);
console.log('Done patching firestore.rules');
