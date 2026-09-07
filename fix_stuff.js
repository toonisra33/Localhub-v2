import fs from 'fs';

// Fix ChatRoomModal.tsx
let chatContent = fs.readFileSync('src/components/chat/ChatRoomModal.tsx', 'utf8');
chatContent = chatContent.replace("  const { userProfile, showToast } = useCommunity();", "");
chatContent = chatContent.replace(
  "  const [isAiThinking, setIsAiThinking] = useState(false);",
  "  const { userProfile, showToast } = useCommunity();\n  const [isAiThinking, setIsAiThinking] = useState(false);"
);
fs.writeFileSync('src/components/chat/ChatRoomModal.tsx', chatContent);

// Fix AddProductModal.tsx
let prodContent = fs.readFileSync('src/components/modals/AddProductModal.tsx', 'utf8');
prodContent = prodContent.replace("setImage(compressedDataUrl);", "setImageUrl(compressedDataUrl);");
fs.writeFileSync('src/components/modals/AddProductModal.tsx', prodContent);

