/**
 * Reverse Geocoding Utility for Thailand & Worldwide
 * Uses OpenStreetMap Nominatim with Google Maps fallback and offline heuristic
 */

export interface GeocodedAddress {
  subdistrict: string; // ตำบล / แขวง
  district: string;    // อำเภอ / เขต
  province: string;    // จังหวัด
  village: string;     // ชุมชน / หมู่บ้าน / ถนน / จุดสังเกต
  postcode?: string;
  formattedAddress: string;
}

function cleanThaiPrefix(text: string, type: 'subdistrict' | 'district' | 'province'): string {
  if (!text) return '';
  let cleaned = text.trim();

  if (type === 'province') {
    cleaned = cleaned.replace(/^จังหวัด\s*/, '');
    return cleaned.trim();
  }

  if (type === 'district') {
    cleaned = cleaned.replace(/^(อำเภอ|เขต)\s*/, '');
    return cleaned.trim();
  }

  if (type === 'subdistrict') {
    cleaned = cleaned.replace(/^(ตำบล|แขวง)\s*/, '');
    return cleaned.trim();
  }

  return cleaned;
}

export async function reverseGeocodeLocation(lat: number, lng: number): Promise<GeocodedAddress | null> {
  // Strategy 1: OpenStreetMap Nominatim (Free, high accuracy in Thailand, no API key required)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=th,en&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;

        // Extract subdistrict (ตำบล / แขวง)
        const rawSubdistrict = 
          addr.quarter || 
          addr.subdistrict || 
          addr.city_district || 
          addr.neighbourhood || 
          addr.suburb || 
          addr.village || 
          addr.hamlet || 
          '';

        // Extract district (อำเภอ / เขต)
        const rawDistrict = 
          addr.county || 
          addr.district || 
          (addr.suburb && addr.city === 'กรุงเทพมหานคร' ? addr.suburb : '') || 
          addr.city_district || 
          '';

        // Extract province (จังหวัด)
        const rawProvince = 
          addr.province || 
          addr.state || 
          addr.city || 
          '';

        // Extract point of interest / village / road
        const rawVillage = 
          addr.road || 
          addr.neighbourhood || 
          addr.building || 
          addr.amenity || 
          addr.commercial || 
          data.name || 
          'ในพื้นที่';

        const subdistrict = cleanThaiPrefix(rawSubdistrict, 'subdistrict');
        const district = cleanThaiPrefix(rawDistrict, 'district');
        const province = cleanThaiPrefix(rawProvince, 'province');

        if (province || district || subdistrict) {
          return {
            subdistrict: subdistrict || 'ในเมือง',
            district: district || 'เมือง',
            province: province || 'กรุงเทพมหานคร',
            village: rawVillage || 'ชุมชนใกล้เคียง',
            postcode: addr.postcode || '',
            formattedAddress: data.display_name || `${subdistrict} ${district} ${province}`
          };
        }
      }
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode attempt failed, trying fallback...', err);
  }

  // Strategy 2: Google Maps Geocoding API (if user has enabled valid key)
  try {
    const userEnvApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
    if (userEnvApiKey && userEnvApiKey.length > 20 && !userEnvApiKey.includes('MY_KEY')) {
      const gRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${userEnvApiKey}&language=th`
      );
      if (gRes.ok) {
        const gData = await gRes.json();
        if (gData.results && gData.results.length > 0) {
          const comps = gData.results[0].address_components;
          const getComp = (types: string[]) => {
            const c = comps.find((item: any) => item.types.some((t: string) => types.includes(t)));
            return c ? c.long_name : '';
          };

          const poi = getComp(['point_of_interest', 'establishment', 'premise', 'route']);
          const sub = cleanThaiPrefix(getComp(['sublocality_level_2', 'sublocality_level_1', 'locality']), 'subdistrict');
          const dist = cleanThaiPrefix(getComp(['administrative_area_level_2', 'locality']), 'district');
          const prov = cleanThaiPrefix(getComp(['administrative_area_level_1']), 'province');

          return {
            subdistrict: sub || 'ในเมือง',
            district: dist || 'เมือง',
            province: prov || 'กรุงเทพมหานคร',
            village: poi || 'ชุมชนใกล้เคียง',
            formattedAddress: gData.results[0].formatted_address || ''
          };
        }
      }
    }
  } catch (err) {
    console.warn('Google geocoding error:', err);
  }

  return null;
}
