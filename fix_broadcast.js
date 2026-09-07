import fs from 'fs';
let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf8');

const replacement = `
    // Firestore does not accept undefined values, so we filter them out
    const cleanData = Object.fromEntries(
      Object.entries({
        id: \`bc_\${now}\`,
        title: data.title,
        message: data.message,
        category: data.category,
        severity: data.severity,
        targetArea: data.targetArea,
        broadcastAt: now,
        broadcastDateStr: todayStr,
        adminName: 'ศูนย์บัญชาการชุมชน (แอดมิน)',
        adminRole: 'ผู้ดูแลระบบส่วนกลาง',
        mediaType: data.mediaType,
        mediaUrl: data.mediaUrl,
        mediaFileName: data.mediaFileName,
        videoDurationSeconds: data.videoDurationSeconds,
        contactNumber: data.contactNumber,
        actionText: data.actionText,
        actionUrl: data.actionUrl,
        pinned: true,
        isActive: true,
      }).filter(([_, v]) => v !== undefined)
    ) as unknown as AdminBroadcast;

    // Store in Firestore
    try {
      saveEntityToFirestore('broadcasts', 'active', cleanData)
`;

content = content.replace(
  /const newBroadcast: AdminBroadcast = {[\s\S]*?\/\/ Store in Firestore\n    try {\n      saveEntityToFirestore\('broadcasts', 'active', newBroadcast\)/m,
  replacement.trim()
);

fs.writeFileSync('src/context/BroadcastContext.tsx', content);
