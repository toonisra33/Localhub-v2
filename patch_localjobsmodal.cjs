const fs = require('fs');
let file = 'src/components/modals/LocalJobsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ mockJobs \} from '\.\.\/\.\.\/data';/g, '');
content = content.replace(/mockJobs/g, '([])');

fs.writeFileSync(file, content);
console.log('LocalJobsModal patched');
