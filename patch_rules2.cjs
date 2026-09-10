const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(
  /request\.auth\.token\.email == 'toonisra33@gmail\.com' \|\|/,
  "request.auth.token.email == 'toonisra33@gmail.com' ||\n        request.auth.token.email == 'israwat.lovebf@gmail.com' ||"
);
fs.writeFileSync('firestore.rules', rules);
console.log('Patched firestore.rules with israwat.lovebf@gmail.com');
