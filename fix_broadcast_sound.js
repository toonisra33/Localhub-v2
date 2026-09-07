import fs from 'fs';
let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf8');

const replacement = `
          // If this is a newly received broadcast that we haven't seen yet, play the alert sound
          if (previousBroadcastIdRef.current !== data.id) {
             const storageKey = \`\${DEVICE_VIEW_PREFIX}\${data.id}\`;
             const hasSeenBefore = !!localStorage.getItem(storageKey);
             
             if (!hasSeenBefore) {
               soundManager.playAlertSound();
               AppNotifications.send(\`⚠️ แจ้งเตือนฉุกเฉิน: \${data.title}\`, {
                 body: data.message,
                 requireInteraction: true,
               });
             }
             previousBroadcastIdRef.current = data.id;
          }
`;

content = content.replace(
  /\/\/ If this is a newly received broadcast that we haven't seen yet, play the alert sound[\s\S]*?previousBroadcastIdRef\.current = data\.id;\n          }/m,
  replacement.trim()
);

fs.writeFileSync('src/context/BroadcastContext.tsx', content);
