const fs = require('fs');
let content = fs.readFileSync('src/components/AdminBroadcastModal.tsx', 'utf8');

// remove 'required' attributes from form
content = content.replace(/required={enableLink}/g, '');
content = content.replace(/required\n/g, '\n');

// enhance handleSend with toast messages
content = content.replace(
  /if \(!title\.trim\(\) \|\| !message\.trim\(\)\) return;/g,
  `if (!title.trim()) { showToast('กรุณาระบุหัวข้อบรอดแคสต์', 'error'); return; }
    if (!message.trim()) { showToast('กรุณาระบุรายละเอียด', 'error'); return; }
    if (enableLink && !actionUrl.trim()) { showToast('กรุณาระบุลิงก์ปลายทาง (URL)', 'error'); return; }`
);

fs.writeFileSync('src/components/AdminBroadcastModal.tsx', content);
console.log('patched');
