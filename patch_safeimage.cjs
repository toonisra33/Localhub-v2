const fs = require('fs');
const path = 'src/components/SafeImage.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `  useEffect(() => {
    const checkImage = () => {
      if (imgRef.current?.complete) {
        if (imgRef.current.naturalWidth > 0) {
          setIsLoaded(true);
        }
      }
    };
    
    // Check immediately
    checkImage();
    
    // Check again after a tiny delay in case the browser hasn't updated naturalWidth yet
    const timeout = setTimeout(checkImage, 50);
    return () => clearTimeout(timeout);
  }, [currentSrc]);`;

const replacement = `  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const checkImage = () => {
      if (imgRef.current?.complete) {
        setIsLoaded(true);
      } else {
        // Fallback: forcefully show image after 2 seconds if events fail
        timeout = setTimeout(() => setIsLoaded(true), 2000);
      }
    };
    
    checkImage();
    return () => clearTimeout(timeout);
  }, [currentSrc]);`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
console.log('Done patching SafeImage');
