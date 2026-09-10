const fs = require('fs');
let file = 'src/components/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const REGISTRATION_TREND_DATA = \{[\s\S]*?^  \}\n\};/m, "const REGISTRATION_TREND_DATA = { '7d': [], '30d': [], '3m': [] };");
// Wait, the regex might be tricky. Let's do it with sed or string match.
