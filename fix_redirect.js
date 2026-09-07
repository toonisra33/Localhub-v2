import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const redirectCode = `
  useEffect(() => {
    // Check for Google Auth redirect result
    checkAuthRedirectResult().catch(err => {
      console.error('Error checking auth redirect result:', err);
    });
  }, []);
`;

content = content.replace(
  "  useEffect(() => {\n    try { localStorage.setItem('locallink_contact_requests', JSON.stringify(contactRequests)); } catch {}\n  }, [contactRequests]);",
  redirectCode + "\n  useEffect(() => {\n    try { localStorage.setItem('locallink_contact_requests', JSON.stringify(contactRequests)); } catch {}\n  }, [contactRequests]);"
);

fs.writeFileSync('src/context/CommunityContext.tsx', content);
