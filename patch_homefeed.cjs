const fs = require('fs');
const path = 'src/components/HomeFeed.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `  React.useEffect(() => {
    const handleOpenNotif = () => setShowNotificationsModal(true);
    window.addEventListener('open-notifications', handleOpenNotif);
    return () => window.removeEventListener('open-notifications', handleOpenNotif);
  }, []);`;

const replacement = `  React.useEffect(() => {
    const handleOpenNotif = () => setShowNotificationsModal(true);
    window.addEventListener('open-notifications', handleOpenNotif);
    
    // Check location on app start
    if (typeof window !== 'undefined' && !sessionStorage.getItem('location_verified_this_session')) {
      sessionStorage.setItem('location_verified_this_session', 'true');
      setShowLocationModal(true);
    }
    
    return () => window.removeEventListener('open-notifications', handleOpenNotif);
  }, []);`;

content = content.replace(target, replacement);

fs.writeFileSync(path, content);
console.log('Done patching HomeFeed');
