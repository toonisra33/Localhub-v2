const fs = require('fs');
const path = 'src/components/AdminBroadcastModal.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { useBackButton }')) {
  content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { useBackButton } from '../hooks/useBackButton';");
}

if (!content.includes('useBackButton(isOpen')) {
  content = content.replace("const handleVerifyId = async (userId: string, isApproved: boolean) => {", "useBackButton(isOpen, () => setOpenAdminModal(false));\n\n  const handleVerifyId = async (userId: string, isApproved: boolean) => {");
}

fs.writeFileSync(path, content);
console.log('Done patching AdminBroadcastModal');
