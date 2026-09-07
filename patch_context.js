import fs from 'fs';
let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf8');

// Update interface
content = content.replace(
  '    actionText?: string;\n    actionUrl?: string;\n  }) => Promise<void>;',
  '    actionText?: string;\n    actionUrl?: string;\n    checkIn?: any;\n  }) => Promise<void>;'
);

// Update implementation
const oldImpl = `  const sendBroadcast = async (data: { title: string; message: string; category: BroadcastCategory; severity: BroadcastSeverity; targetArea?: string; mediaType?: 'image' | 'video'; mediaUrl?: string; mediaFileName?: string; videoDurationSeconds?: number; contactNumber?: string; actionText?: string; actionUrl?: string; }) => {`;
const newImpl = `  const sendBroadcast = async (data: { title: string; message: string; category: BroadcastCategory; severity: BroadcastSeverity; targetArea?: string; mediaType?: 'image' | 'video'; mediaUrl?: string; mediaFileName?: string; videoDurationSeconds?: number; contactNumber?: string; actionText?: string; actionUrl?: string; checkIn?: any; }) => {`;
content = content.replace(oldImpl, newImpl);

const oldSave = `        actionText: data.actionText,
        actionUrl: data.actionUrl,
        pinned: true,`;
const newSave = `        actionText: data.actionText,
        actionUrl: data.actionUrl,
        checkIn: data.checkIn,
        pinned: true,`;
content = content.replace(oldSave, newSave);

fs.writeFileSync('src/context/BroadcastContext.tsx', content);
