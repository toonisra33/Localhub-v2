const fs = require('fs');
const path = 'src/components/modals/CreatePostModal.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { useBackButton }')) {
  content = content.replace("import React, { useState, useRef, useEffect } from 'react';", "import React, { useState, useRef, useEffect } from 'react';\nimport { useBackButton } from '../../hooks/useBackButton';");
}

if (!content.includes('useBackButton(isCreatePostModalOpen')) {
  content = content.replace("const handleSubmit = async (e: React.FormEvent) => {", "useBackButton(isCreatePostModalOpen, closeCreatePostModal);\n\n  const handleSubmit = async (e: React.FormEvent) => {");
}

fs.writeFileSync(path, content);
console.log('Done patching CreatePostModal');
