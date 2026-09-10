const fs = require('fs');
const file = 'src/components/modals/IncidentReportModal.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

let newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("setImageUrl(samplePhotos[type]);") && !lines[i].includes("if")) {
    skip = true;
  }
  
  if (!skip) {
    newLines.push(lines[i]);
  }
  
  if (skip && lines[i].includes("}, 600);")) {
    // Skip the next line '  };'
    i++;
    skip = false;
  }
}

fs.writeFileSync(file, newLines.join('\n'));
