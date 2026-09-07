import fs from 'fs';

// Fix chat.ts
let chatContent = fs.readFileSync('src/lib/chat.ts', 'utf8');
chatContent = chatContent.replace(/callback\(\{ status: data\.status, requesterId: data\.requesterId \}, \(error\) => \{ console\.warn\("Firestore listener error in chat\.ts:", error\); \}\);/g, 'callback({ status: data.status, requesterId: data.requesterId });');
chatContent = chatContent.replace(/  \}\);\n\};\n\nexport const subscribeToGroups/g, '  }, (error) => { console.warn("Firestore listener error in chat.ts:", error); });\n};\n\nexport const subscribeToGroups');
fs.writeFileSync('src/lib/chat.ts', chatContent);

// Fix PostDetailCommentsModal.tsx
let commentsContent = fs.readFileSync('src/components/modals/PostDetailCommentsModal.tsx', 'utf8');
commentsContent = commentsContent.replace(/        \}, \(error\) => console\.warn\("Firestore comments error:", error\)\);\n      \}\);\n      setComments\(fetchedComments\);\n    \}, \(error\) => \{\n      console\.warn\('Firestore subscription warning \(comments\):', error\);\n/g, '        });\n      });\n      setComments(fetchedComments);\n    }, (error) => { console.warn("Firestore comments error:", error); \n');
fs.writeFileSync('src/components/modals/PostDetailCommentsModal.tsx', commentsContent);
