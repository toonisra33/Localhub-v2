const fs = require('fs');
let file = 'src/context/CommunityContext.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const \[alerts, setAlerts\] = useState<Alert\[\]>\(\(\) => \{[\s\S]*?\}\);/g, 'const [alerts, setAlerts] = useState<Alert[]>([]);');
content = content.replace(/const \[notifications, setNotifications\] = useState<AppNotification\[\]>\(\(\) => \{[\s\S]*?\}\);/g, 'const [notifications, setNotifications] = useState<AppNotification[]>([]);');
content = content.replace(/const \[contactRequests, setContactRequests\] = useState<AdminContactRequest\[\]>\(\(\) => \{[\s\S]*?\}\);/g, 'const [contactRequests, setContactRequests] = useState<AdminContactRequest[]>([]);');

fs.writeFileSync(file, content);
console.log('CommunityContext.tsx cleaned from localStorage fallbacks for arrays');
