const fs = require('fs');
const path = 'src/context/CommunityContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `  const requestRealLocation = async (): Promise<{success: boolean, lat?: number, lng?: number}> => {
    return new Promise((resolve) => {
      setIsLocatingGps(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation(prev => ({
              ...prev,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }));
            setLocationPermissionStatus('granted');
            setIsLocatingGps(false);
            closeLocationPermissionModal();
            resolve({success: true, lat: position.coords.latitude, lng: position.coords.longitude});
          },`;

const replacement = `  const requestRealLocation = async (): Promise<{success: boolean, lat?: number, lng?: number}> => {
    return new Promise((resolve) => {
      setIsLocatingGps(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            let finalLocationUpdates: any = { latitude: lat, longitude: lng };
            
            try {
               const userEnvApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
               const fallbackKey = 'AIzaSyAbIv0M35oWeTTRnSw-o6Yz4DY6KxiTEQw';
               const apiKey = (userEnvApiKey && userEnvApiKey.trim().length > 10 && !userEnvApiKey.includes('MY_KEY')) ? userEnvApiKey : fallbackKey;
               
               const response = await fetch(\`https://maps.googleapis.com/maps/api/geocode/json?latlng=\${lat},\${lng}&key=\${apiKey}&language=th\`);
               const data = await response.json();
               
               if (data.results && data.results.length > 0) {
                 const firstResult = data.results[0];
                 const components = firstResult.address_components;
                 
                 const getComp = (types: string[]) => {
                   const comp = components.find((c: any) => c.types.some((t: string) => types.includes(t)));
                   return comp ? comp.long_name : '';
                 };
                 
                 const poi = getComp(['point_of_interest', 'establishment', 'premise', 'route']);
                 const neighborhood = getComp(['neighborhood', 'sublocality_level_2', 'sublocality_level_1']);
                 
                 const subdistrict = getComp(['sublocality_level_2', 'sublocality_level_1', 'locality']);
                 const district = getComp(['administrative_area_level_2', 'locality']);
                 const province = getComp(['administrative_area_level_1']);
                 
                 // If there's a plus code or formatted address we can use as fallback for village/placeName
                 let village = poi || neighborhood;
                 if (!village) {
                   const parts = firstResult.formatted_address.split(' ');
                   village = parts[0];
                 }
                 
                 finalLocationUpdates = {
                   ...finalLocationUpdates,
                   subdistrict: subdistrict || '',
                   district: district || '',
                   province: province || '',
                   village: village || '',
                   isGps: true
                 };
               }
            } catch (err) {
               console.error('Google Maps Geocoding failed:', err);
            }

            setLocation(prev => ({
              ...prev,
              ...finalLocationUpdates,
              isGps: true
            }));
            setLocationPermissionStatus('granted');
            setIsLocatingGps(false);
            closeLocationPermissionModal();
            resolve({success: true, lat, lng});
          },`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
console.log('Done patching CommunityContext for requestRealLocation');
