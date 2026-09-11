const fs = require('fs');
const path = 'src/components/modals/LocationPickerModal.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { useBackButton }')) {
  content = content.replace("import React, { useState, useMemo, useEffect } from 'react';", "import React, { useState, useMemo, useEffect } from 'react';\nimport { useBackButton } from '../../hooks/useBackButton';");
}

if (!content.includes('useBackButton(true')) {
  content = content.replace("const handleSelectLocation = (loc: Location) => {", "useBackButton(true, onClose);\n\n  const handleSelectLocation = (loc: Location) => {");
}

fs.writeFileSync(path, content);
console.log('Done patching LocationPickerModal');
