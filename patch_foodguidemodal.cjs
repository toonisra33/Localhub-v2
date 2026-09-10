const fs = require('fs');
let file = 'src/components/modals/FoodGuideModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ mockShops \} from '\.\.\/\.\.\/data';/g, '');
content = content.replace(/\.\.\.mockShops\.filter\(s => s\.category\.includes\('\u0e2d\u0e32\u0e2b\u0e32\u0e23'\) \|\| s\.category\.includes\('\u0e04\u0e32\u0e40\u0e1f\u0e48'\)\),/g, '');

fs.writeFileSync(file, content);
console.log('FoodGuideModal patched');
