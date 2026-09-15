const fs = require('fs');
const path = 'src/components/modals/CheckInPickerModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `  const performReverseGeocode = async (targetLat: number, targetLng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(
        \`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${targetLat}&lon=\${targetLng}&addressdetails=1\`,
        {
          headers: {
            'Accept-Language': 'th,en;q=0.9'
          }
        }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const title = data.name || addr.amenity || addr.shop || addr.building || addr.road || addr.suburb || 'จุดที่เลือกบนแผนที่';
        const sub = addr.suburb || addr.neighbourhood || addr.village || subdistrict;
        const dist = addr.city || addr.town || addr.district || district;
        const prov = addr.state || addr.province || addr.country || province;
        
        if (title && title !== 'จุดที่เลือกบนแผนที่') {
          setPlaceName(title);
        }
        if (sub) setSubdistrict(sub);
        if (dist) setDistrict(dist);
        if (prov) setProvince(prov);
        if (data.display_name) setAddress(data.display_name);
      }
    } catch (e) {
      console.error('Reverse geocode error:', e);
    } finally {
      setIsReverseGeocoding(false);
    }
  };`;

const replacement = `  const performReverseGeocode = async (targetLat: number, targetLng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(\`https://maps.googleapis.com/maps/api/geocode/json?latlng=\${targetLat},\${targetLng}&key=\${apiKey}&language=th\`);
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
        
        const sub = getComp(['sublocality_level_2', 'sublocality_level_1', 'locality']);
        const dist = getComp(['administrative_area_level_2', 'locality']);
        const prov = getComp(['administrative_area_level_1']);
        
        let title = poi || neighborhood;
        if (!title) {
          title = firstResult.formatted_address.split(',')[0].split(' ')[0];
        }
        
        if (title && title !== 'จุดที่เลือกบนแผนที่') {
          setPlaceName(title);
        }
        if (sub) setSubdistrict(sub);
        if (dist) setDistrict(dist);
        if (prov) setProvince(prov);
        if (firstResult.formatted_address) setAddress(firstResult.formatted_address);
      }
    } catch (e) {
      console.error('Reverse geocode error:', e);
    } finally {
      setIsReverseGeocoding(false);
    }
  };`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
console.log('Done patching CheckInPickerModal for Google Maps Geocoding');
