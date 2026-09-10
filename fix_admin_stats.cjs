const fs = require('fs');
let file = 'src/components/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const statsCode = `
// Real-computed or empty fallbacks
const REGISTRATION_TREND_DATA = { '7d': [], '30d': [] };
const FEATURE_USAGE_DATA: any[] = [];
const USER_ROLES_DATA: any[] = [];
const INCIDENT_CATEGORIES_DATA: any[] = [];
const DISTRICT_DISTRIBUTION_DATA: any[] = [];
const AUDIT_LOGS: any[] = [];
`;

content = content.replace(/import \{ LocalHubLogo \} from '\.\/LocalHubLogo';/g, "import { LocalHubLogo } from './LocalHubLogo';\n" + statsCode);

fs.writeFileSync(file, content);
console.log('Fixed AdminDashboard stats');
