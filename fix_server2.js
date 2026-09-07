import fs from 'fs';
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace('import fs from "fs";\\nimport express', 'import fs from "fs";\\nimport express');
// wait, I will just rewrite it to be clean
content = content.replace(/import fs from "fs";\\\\nimport express from "express";/g, 'import fs from "fs";\\nimport express from "express";');
fs.writeFileSync('server.ts', content);
