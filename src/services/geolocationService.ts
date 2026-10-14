import { Location } from '../types';
import { findNearestThaiProvince } from '../data/thaiData';

export interface GpsResult {
  location: Location;
  isRealGps: boolean;
  accuracyMeters?: number;
}

/**
 * Clean Thai administrative prefix for neat display
 */
function cleanPrefix(val: string | undefined, prefixRegex: RegExp): string {
  if (!val) return '';
  return val.replace(prefixRegex, '').trim();
}

/**
 * Reverse Geocode latitude/longitude into a real physical Thai/World address
 */
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<Location> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=th,en`,
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
      const addr = data.address || {};

      // Province / State
      let province = addr.province || addr.state || addr.city || addr.region || '';
      province = cleanPrefix(province, /^(จังหวัด|จ\.)\s*/);
      if (!province && addr.country) {
        province = addr.country;
      }

      // District / County
      let district = addr.county || addr.district || addr.suburb || addr.city_district || '';
      district = cleanPrefix(district, /^(อำเภอ|อ\.|เขต)\s*/);

      // Subdistrict / Tambon / Khwaeng
      let subdistrict = addr.quarter || addr.subdistrict || addr.neighbourhood || addr.village || '';
      subdistrict = cleanPrefix(subdistrict, /^(ตำบล|ต\.|แขวง)\s*/);

      const road = addr.road || addr.street || '';
      const postalCode = addr.postcode || '';

      // Build clean Thai Display Name
      let displayName = '';
      if (subdistrict && district && province) {
        displayName = `ต.${subdistrict}, อ.${district}, จ.${province}`;
      } else if (district && province) {
        displayName = `อ.${district}, จ.${province}`;
      } else if (province) {
        displayName = `จ.${province}`;
      } else {
        displayName = data.display_name?.split(',')[0] || `พิกัด GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }

      return {
        province: province || 'กรุงเทพมหานคร',
        district: district || 'จตุจักร',
        subdistrict: subdistrict || '',
        postalCode,
        lat,
        lng,
        displayName,
        road,
        addressDetails: data.display_name || displayName
      };
    }
  } catch (err) {
    console.warn('[geolocationService] Nominatim reverse geocode notice:', err);
  }

  // Fallback to offline nearest calculation if network failed
  const nearest = findNearestThaiProvince(lat, lng);
  return {
    province: nearest.province,
    district: nearest.district,
    subdistrict: '',
    lat,
    lng,
    displayName: `${nearest.province} (พิกัด GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    addressDetails: `จ.${nearest.province} อ.${nearest.district}`
  };
}

/**
 * Get device GPS coordinates using browser Geolocation API with automatic fallback
 */
export async function getRealDeviceGps(): Promise<{ lat: number; lng: number; accuracy?: number }> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('เบราว์เซอร์ไม่รองรับการตรวจจับพิกัด GPS');
  }

  return new Promise((resolve, reject) => {
    // Attempt 1: High accuracy (GPS satellite)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
      },
      (err) => {
        console.warn('[geolocationService] High accuracy GPS failed, trying fallback...', err);
        // Attempt 2: Standard accuracy (Cell tower/Wi-Fi)
        navigator.geolocation.getCurrentPosition(
          (posFallback) => {
            resolve({
              lat: posFallback.coords.latitude,
              lng: posFallback.coords.longitude,
              accuracy: posFallback.coords.accuracy
            });
          },
          (errFallback) => {
            reject(errFallback);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
}
