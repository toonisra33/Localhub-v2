import fs from 'fs';
let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf8');

const regex = /const sendBroadcast = \(data: \{\s*title: string;\s*message: string;\s*category: BroadcastCategory;\s*severity: BroadcastSeverity;\s*targetArea\?: string;\s*mediaType\?: 'image' \| 'video';\s*mediaUrl\?: string;\s*mediaFileName\?: string;\s*videoDurationSeconds\?: number;\s*contactNumber\?: string;\s*actionText\?: string;\s*actionUrl\?: string;\s*\}\) => \{/g;

content = content.replace(regex, "const sendBroadcast = async (data: { title: string; message: string; category: BroadcastCategory; severity: BroadcastSeverity; targetArea?: string; mediaType?: 'image' | 'video'; mediaUrl?: string; mediaFileName?: string; videoDurationSeconds?: number; contactNumber?: string; actionText?: string; actionUrl?: string; }) => {");

content = content.replace(
  "saveEntityToFirestore('broadcasts', 'active', newBroadcast);",
  "await saveEntityToFirestore('broadcasts', 'active', newBroadcast);"
);

content = content.replace(
  "saveEntityToFirestore('broadcasts', newBroadcast.id, newBroadcast);",
  "await saveEntityToFirestore('broadcasts', newBroadcast.id, newBroadcast);"
);

fs.writeFileSync('src/context/BroadcastContext.tsx', content);
