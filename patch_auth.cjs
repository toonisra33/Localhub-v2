const fs = require('fs');
const path = 'src/components/modals/AuthModal.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { useBackButton }')) {
  content = content.replace("import React, { useState, useRef } from 'react';", "import React, { useState, useRef } from 'react';\nimport { useBackButton } from '../../hooks/useBackButton';");
}

if (!content.includes('useBackButton(isAuthModalOpen')) {
  content = content.replace("const handleGoogleSignIn = async () => {", "useBackButton(isAuthModalOpen, closeAuthModal);\n\n  const handleGoogleSignIn = async () => {");
}

fs.writeFileSync(path, content);
console.log('Done patching AuthModal');
