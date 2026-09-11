const fs = require('fs');
const path = 'src/components/modals/IncidentReportModal.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('isSubmittingRef')) {
  content = content.replace("const [isSubmitting, setIsSubmitting] = useState(false);", "const [isSubmitting, setIsSubmitting] = useState(false);\n  const isSubmittingRef = useRef(false);");
  content = content.replace("import React, { useState, useRef, useEffect } from 'react';", "import React, { useState, useRef, useEffect } from 'react';"); // Already has useRef? Let's check.
}

const target = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!title.trim()) {
      showToast('กรุณากรอกหัวข้อเหตุการณ์', 'error');
      return;
    }

    setIsSubmitting(true);`;

const replacement = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;
    if (!title.trim()) {
      showToast('กรุณากรอกหัวข้อเหตุการณ์', 'error');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);`;

content = content.replace(target, replacement);

const target2 = `    setIsSubmitting(false);
    onClose();
  };`;

const replacement2 = `    setIsSubmitting(false);
    isSubmittingRef.current = false;
    onClose();
  };`;

content = content.replace(target2, replacement2);

fs.writeFileSync(path, content);
console.log('Done patching IncidentReportModal');
