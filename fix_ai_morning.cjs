const fs = require('fs');
let file = 'src/components/AiMorningBrief.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the fallback object string with a simpler default text string, or just clean it up.
content = content.replace(/const displayWeather = realWeather \|\| \{[\s\S]*?\}\.weather;/g, 'const displayWeather = realWeather || "กำลังอัปเดตข้อมูล";');
content = content.replace(/\{ weather: \{ temp: "-", condition: "-", pm25: "-" \}, announcements: 0, roadClosures: 0, events: 0, newShops: 0, greeting: "สวัสดีตอนเช้า" \}\.announcements/g, '0');
content = content.replace(/\{ weather: \{ temp: "-", condition: "-", pm25: "-" \}, announcements: 0, roadClosures: 0, events: 0, newShops: 0, greeting: "สวัสดีตอนเช้า" \}\.roadClosures/g, '0');
content = content.replace(/\{ weather: \{ temp: "-", condition: "-", pm25: "-" \}, announcements: 0, roadClosures: 0, events: 0, newShops: 0, greeting: "สวัสดีตอนเช้า" \}\.events/g, '0');
content = content.replace(/\{ weather: \{ temp: "-", condition: "-", pm25: "-" \}, announcements: 0, roadClosures: 0, events: 0, newShops: 0, greeting: "สวัสดีตอนเช้า" \}\.newShops/g, '0');

fs.writeFileSync(file, content);
console.log('Fixed AiMorningBrief rendering object issue');
