const fs = require('fs');
const file = 'src/components/modals/IncidentReportModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const handleSubmit = \(e: React\.FormEvent\) => \{\n    e\.preventDefault\(\);\n    if \(!title\.trim\(\)\) \{\n      showToast\('กรุณากรอกหัวข้อเหตุการณ์', 'error'\);\n      return;\n    \}\n    addAlert\(\{/g,
  `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('กรุณากรอกหัวข้อเหตุการณ์', 'error');
      return;
    }
    await addAlert({`
);

fs.writeFileSync(file, content);
