const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';
const svgPath = path.resolve(__dirname, '../public/icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

function renderPng(width, height, outputPath) {
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${width}px;
    height: ${height}px;
    overflow: hidden;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
</head>
<body>
${svgContent}
</body>
</html>`;

  const tmpHtml = `/tmp/render_${width}x${height}.html`;
  fs.writeFileSync(tmpHtml, html);
  const cmd = `${CHROME} --headless --no-sandbox --disable-gpu --screenshot=${outputPath} --window-size=${width},${height} --default-background-color=00000000 file://${tmpHtml}`;
  try {
    execSync(cmd, { stdio: 'ignore' });
  } catch (err) {
    console.error('Render error:', err);
  }
  if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);
}

const pubDir = path.resolve(__dirname, '../public');
const distDir = path.resolve(__dirname, '../dist');

renderPng(512, 512, path.join(pubDir, 'pwa-512x512.png'));
renderPng(192, 192, path.join(pubDir, 'pwa-192x192.png'));
renderPng(180, 180, path.join(pubDir, 'apple-touch-icon.png'));
renderPng(512, 512, path.join(pubDir, 'pwa-maskable-512x512.png'));

renderPng(32, 32, '/tmp/favicon-32.png');
renderPng(16, 16, '/tmp/favicon-16.png');
try {
  execSync('convert /tmp/favicon-16.png /tmp/favicon-32.png ' + path.join(pubDir, 'favicon.ico'));
} catch (e) {
  fs.copyFileSync('/tmp/favicon-32.png', path.join(pubDir, 'favicon.ico'));
}

if (fs.existsSync(distDir)) {
  fs.copyFileSync(path.join(pubDir, 'icon.svg'), path.join(distDir, 'icon.svg'));
  fs.copyFileSync(path.join(pubDir, 'pwa-512x512.png'), path.join(distDir, 'pwa-512x512.png'));
  fs.copyFileSync(path.join(pubDir, 'pwa-192x192.png'), path.join(distDir, 'pwa-192x192.png'));
  fs.copyFileSync(path.join(pubDir, 'apple-touch-icon.png'), path.join(distDir, 'apple-touch-icon.png'));
  fs.copyFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), path.join(distDir, 'pwa-maskable-512x512.png'));
  fs.copyFileSync(path.join(pubDir, 'favicon.ico'), path.join(distDir, 'favicon.ico'));
}

console.log('App icons generated successfully.');
