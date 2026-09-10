const fs = require('fs');
let file = 'src/components/modals/RealEstateModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ mockRealEstate \} from '\.\.\/\.\.\/data';/g, '');
content = content.replace(/mockRealEstate\.filter/g, '([].filter as any)');
content = content.replace(/\? mockRealEstate/g, '? []');

fs.writeFileSync(file, content);
console.log('RealEstateModal patched');
