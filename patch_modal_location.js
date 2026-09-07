import fs from 'fs';
let content = fs.readFileSync('src/components/AdminBroadcastModal.tsx', 'utf8');

const targetStr = `  const { 
    contactRequests, 
    updateContactRequestStatus, 
    openMediaViewer, 
    showToast,
    isLoggedIn,
    userProfile
  } = useCommunity();`;

const replaceStr = `  const { 
    contactRequests, 
    updateContactRequestStatus, 
    openMediaViewer, 
    showToast,
    isLoggedIn,
    userProfile,
    location
  } = useCommunity();`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/components/AdminBroadcastModal.tsx', content);
