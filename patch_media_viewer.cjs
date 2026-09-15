const fs = require('fs');
const path = 'src/context/CommunityContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `  const openMediaViewer = (url: string, type: 'image' | 'video', title?: string, subtitle?: string) => {
    setActiveMedia({ url, type, title, subtitle });
  };`;

const replacement = `  const openMediaViewer = (media: { url: string; type?: 'image' | 'video'; title?: string; subtitle?: string }) => {
    setActiveMedia({ 
      url: media.url, 
      type: media.type || 'image', 
      title: media.title, 
      subtitle: media.subtitle 
    });
  };`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
console.log('Done patching CommunityContext for openMediaViewer');
