const fs = require('fs');
const path = 'src/components/chat/ChatRoomModal.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { useBackButton }')) {
  content = content.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { useBackButton } from '../../hooks/useBackButton';");
}

if (!content.includes('useBackButton(isOpen')) {
  content = content.replace("const handleSendMessage = async (e: React.FormEvent) => {", "useBackButton(isOpen, onClose);\n\n  const handleSendMessage = async (e: React.FormEvent) => {");
}

fs.writeFileSync(path, content);
console.log('Done patching ChatRoomModal');
