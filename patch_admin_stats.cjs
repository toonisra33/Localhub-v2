const fs = require('fs');
let file = 'src/components/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Just wipe out the static array values so it reflects a real system without mock data
content = content.replace(/const REGISTRATION_TREND_DATA = \{[\s\S]*?\};\n/g, '');
content = content.replace(/const FEATURE_USAGE_DATA = \[[\s\S]*?\];\n/g, '');
content = content.replace(/const USER_ROLES_DATA = \[[\s\S]*?\];\n/g, '');
content = content.replace(/const INCIDENT_CATEGORIES_DATA = \[[\s\S]*?\];\n/g, '');
content = content.replace(/const DISTRICT_DISTRIBUTION_DATA = \[[\s\S]*?\];\n/g, '');
content = content.replace(/const AUDIT_LOGS = \[[\s\S]*?\];\n/g, '');

fs.writeFileSync(file, content);
console.log('AdminDashboard stats removed');
