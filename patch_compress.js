import fs from 'fs';
let content = fs.readFileSync('src/lib/imageUtils.ts', 'utf8');

// Aggressively reduce image size to avoid Firestore 1MB limits
content = content.replace("const MAX_SIZE = 800;", "const MAX_SIZE = 400; // Aggressive compression for Firestore limits");
content = content.replace("const dataUrl = canvas.toDataURL('image/webp', 0.7);", "const dataUrl = canvas.toDataURL('image/webp', 0.5);");

fs.writeFileSync('src/lib/imageUtils.ts', content);
