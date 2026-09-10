const fs = require('fs');
let file = 'src/components/AiMorningBrief.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ mockMorningBrief \} from '\.\.\/data';/g, '');
content = content.replace(/mockMorningBrief/g, '{ weather: { temp: "-", condition: "-", pm25: "-" }, announcements: 0, roadClosures: 0, events: 0, newShops: 0, greeting: "สวัสดีตอนเช้า" }');

fs.writeFileSync(file, content);
console.log('AiMorningBrief patched');
