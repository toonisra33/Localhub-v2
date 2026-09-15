const fs = require('fs');
const path = 'src/components/HomeFeed.tsx';
let content = fs.readFileSync(path, 'utf8');

const target1 = `const AlertCard: React.FC<AlertCardProps> = ({ 
  alert, 
  onVote, 
  onCameraClick,
  onDelete
}) => {
  const { openMediaViewer, userProfile } = useCommunity();`;

const replacement1 = `const AlertCard: React.FC<AlertCardProps> = ({ 
  alert, 
  onVote, 
  onCameraClick,
  onDelete
}) => {
  const { openMediaViewer, userProfile, location } = useCommunity();
  
  const displayDistance = React.useMemo(() => {
    if (location?.latitude && location?.longitude && alert.location?.latitude && alert.location?.longitude) {
      return calculateDistance(location.latitude, location.longitude, alert.location.latitude, alert.location.longitude);
    }
    return \`\${alert.location.distance || '0.5'} กม.\`;
  }, [location, alert.location]);`;

content = content.replace(target1, replacement1);

const target2 = `<span className="line-clamp-2">{alert.location.district} • ห่างจากคุณ {alert.location.distance || '0.5'} กม.</span>`;
const replacement2 = `<span className="line-clamp-2">{alert.location.district} • ห่างจากคุณ {displayDistance}</span>`;

content = content.replace(target2, replacement2);

fs.writeFileSync(path, content);
console.log('Done patching AlertCard');
