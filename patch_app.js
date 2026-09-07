import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('AppNotifications')) {
  content = content.replace("import { ToastContainer } from './components/modals/ToastContainer';", "import { ToastContainer } from './components/modals/ToastContainer';\nimport { AppNotifications } from './lib/notifications';");
}

content = content.replace(
  "  useEffect(() => {\n    if (isLoggedIn) {",
  "  useEffect(() => {\n    AppNotifications.requestPermission();\n    if (isLoggedIn) {"
);

fs.writeFileSync('src/App.tsx', content);
