import fs from 'fs';
let content = fs.readFileSync('src/components/chat/ChatRoomModal.tsx', 'utf8');

// Combine the useCommunity calls if needed
content = content.replace("  const { userProfile } = useCommunity();\n", "");
content = content.replace("  const { showToast } = useCommunity();", "  const { userProfile, showToast } = useCommunity();");

fs.writeFileSync('src/components/chat/ChatRoomModal.tsx', content);
