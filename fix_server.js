import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  /console.error\\("Gemini API Error:", error\\);/,
  'console.error("Gemini API Error:", error); fs.writeFileSync("gemini_error.log", error.toString() + "\\n" + error.stack);'
);
if (!content.includes('import fs from "fs"')) {
  content = content.replace(/import express/, 'import fs from "fs";\\nimport express');
}
fs.writeFileSync('server.ts', content);
