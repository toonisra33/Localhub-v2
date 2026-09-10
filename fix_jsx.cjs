const fs = require('fs');
const file = 'src/components/modals/IncidentReportModal.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("<span>ถ่ายภาพ / แนบรูปภาพเหตุการณ์</span>")) {
    // skip this line, then skip the next `</button>`
    if (lines[i+1].includes("</button>")) {
      lines.splice(i+2, 0, "            </>");
    }
  }
}

fs.writeFileSync(file, lines.join('\n'));
