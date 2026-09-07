import fs from 'fs';
let content = fs.readFileSync('src/components/AdminBroadcastModal.tsx', 'utf8');

const importTarget = `import { BroadcastCategory, BroadcastSeverity, AdminContactRequest } from '../types';`;
const importReplacement = `import { BroadcastCategory, BroadcastSeverity, AdminContactRequest, CheckInLocation } from '../types';
import { CheckInPickerModal } from './modals/CheckInPickerModal';
import { MapPin, Compass, Edit3 } from 'lucide-react';`;

content = content.replace(importTarget, importReplacement);
fs.writeFileSync('src/components/AdminBroadcastModal.tsx', content);
