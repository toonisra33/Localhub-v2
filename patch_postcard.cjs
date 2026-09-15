const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { calculateDistance }')) {
  content = content.replace("import { useCommunity } from '../context/CommunityContext';", "import { useCommunity } from '../context/CommunityContext';\nimport { calculateDistance } from '../lib/distance';");
}

const target1 = `const { showToast, openMediaViewer, jumpToMapLocation, location, openPublicProfile, userProfile, isLoggedIn, role, togglePinPost } = useCommunity();`;
const replacement1 = `const { showToast, openMediaViewer, jumpToMapLocation, location, openPublicProfile, userProfile, isLoggedIn, role, togglePinPost } = useCommunity();
  
  const displayDistance = React.useMemo(() => {
    if (location?.latitude && location?.longitude && post.location?.latitude && post.location?.longitude) {
      return calculateDistance(location.latitude, location.longitude, post.location.latitude, post.location.longitude);
    }
    return post.location?.distance ? \`\${post.location.distance} กม.\` : '';
  }, [location, post.location]);`;

content = content.replace(target1, replacement1);

const target2 = `ต.{post.location.subdistrict} {post.location.distance ? \`(\${post.location.distance} กม.)\` : ''}`;
const replacement2 = `ต.{post.location.subdistrict} {displayDistance ? \`(\${displayDistance})\` : ''}`;

content = content.replace(target2, replacement2);

fs.writeFileSync(path, content);
console.log('Done patching PostCard');
