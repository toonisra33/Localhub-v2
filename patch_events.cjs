const fs = require('fs');
const path = 'src/components/modals/CommunityEventsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('isSubmittingRef')) {
  content = content.replace("const [isSubmitting, setIsSubmitting] = useState(false);", "const [isSubmitting, setIsSubmitting] = useState(false);\n  const isSubmittingRef = useRef(false);");
  content = content.replace("import React, { useState, useRef } from 'react';", "import React, { useState, useRef } from 'react';");
}

const target = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;`;

const replacement = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;
    isSubmittingRef.current = true;`;

const target2 = `    setIsSubmitting(false);
    onClose();
  };`;

const replacement2 = `    setIsSubmitting(false);
    isSubmittingRef.current = false;
    onClose();
  };`;

content = content.replace(target, replacement);
content = content.replace(target2, replacement2);

fs.writeFileSync(path, content);
console.log('Done patching CommunityEventsModal');
