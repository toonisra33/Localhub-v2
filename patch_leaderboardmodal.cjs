const fs = require('fs');
let file = 'src/components/modals/LeaderboardModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const mockLeaderboard = \[[\s\S]*?\];/g, 'const mockLeaderboard: any[] = [];');

fs.writeFileSync(file, content);
console.log('LeaderboardModal patched');
