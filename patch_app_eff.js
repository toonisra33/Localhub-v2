import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
  const [directChatUser, setDirectChatUser] = useState<{id: string, name: string, avatar: string} | null>(null);

  useEffect(() => {
    AppNotifications.requestPermission();
  }, []);
`;

content = content.replace(
  "  const [directChatUser, setDirectChatUser] = useState<{id: string, name: string, avatar: string} | null>(null);",
  replacement
);

fs.writeFileSync('src/App.tsx', content);
