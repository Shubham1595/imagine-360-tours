/**
 * Utility for parsing and validating geographic coordinates and map URLs.
 * Strictly adheres to non-guessing rules: Never invents coordinates.
 */

export interface ParsedLocation {
  rawUrl: string | null;
  mapUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  isValidCoordinates: boolean;
  warning?: string;
}

/**
 * Validates latitude and longitude ranges.
 * Latitude: -90 to +90
 * Longitude: -180 to +180
 */
export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  const numLat = typeof lat === 'number' ? lat : parseFloat(String(lat));
  const numLng = typeof lng === 'number' ? lng : parseFloat(String(lng));

  if (isNaN(numLat) || isNaN(numLng)) return false;
  return numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180;
}

/**
 * Normalizes and extracts coordinates from location text or Google Maps URLs.
 * If coordinates cannot be reliably parsed (e.g. shortened links like goo.gl/maps),
 * the rawUrl is preserved and latitude/longitude remain null.
 */
export function parseLocationLink(input: string | null | undefined): ParsedLocation {
  if (!input || typeof input !== 'string') {
    return { rawUrl: null, mapUrl: null, latitude: null, longitude: null, isValidCoordinates: false };
  }

  const rawUrl = input.trim();
  if (!rawUrl) {
    return { rawUrl: null, mapUrl: null, latitude: null, longitude: null, isValidCoordinates: false };
  }

  // 1. Direct coordinate format: "18.5596, 73.7797" or "18.5596,73.7797"
  const directCoordRegex = /^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/;
  const directMatch = rawUrl.match(directCoordRegex);
  if (directMatch) {
    const lat = parseFloat(directMatch[1]);
    const lng = parseFloat(directMatch[3]);
    if (isValidCoordinate(lat, lng)) {
      return { rawUrl, mapUrl: rawUrl, latitude: lat, longitude: lng, isValidCoordinates: true };
    }
    return {
      rawUrl,
      mapUrl: rawUrl,
      latitude: null,
      longitude: null,
      isValidCoordinates: false,
      warning: `Coordinates out of valid range: lat ${lat} ([-90, 90]), lng ${lng} ([-180, 180])`,
    };
  }

  // 2. Google Maps URL pattern: /@(-?\d+\.\d+),(-?\d+\.\d+)
  const atMatch = rawUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidCoordinate(lat, lng)) {
      return { rawUrl, mapUrl: rawUrl, latitude: lat, longitude: lng, isValidCoordinates: true };
    }
    return { rawUrl, mapUrl: rawUrl, latitude: null, longitude: null, isValidCoordinates: false, warning: 'Coordinates out of bounds' };
  }

  // 3. Query params: q=LAT,LNG or query=LAT,LNG or ll=LAT,LNG or daddr=LAT,LNG
  const queryMatch = rawUrl.match(/(?:[?&](?:q|query|ll|daddr|destination)=)(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/i);
  if (queryMatch) {
    const lat = parseFloat(queryMatch[1]);
    const lng = parseFloat(queryMatch[2]);
    if (isValidCoordinate(lat, lng)) {
      return { rawUrl, mapUrl: rawUrl, latitude: lat, longitude: lng, isValidCoordinates: true };
    }
    return { rawUrl, mapUrl: rawUrl, latitude: null, longitude: null, isValidCoordinates: false, warning: 'Coordinates out of bounds' };
  }

  // 4. Place internal parameters: !3dLAT!4dLNG
  const placeDataMatch = rawUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (placeDataMatch) {
    const lat = parseFloat(placeDataMatch[1]);
    const lng = parseFloat(placeDataMatch[2]);
    if (isValidCoordinate(lat, lng)) {
      return { rawUrl, mapUrl: rawUrl, latitude: lat, longitude: lng, isValidCoordinates: true };
    }
    return { rawUrl, mapUrl: rawUrl, latitude: null, longitude: null, isValidCoordinates: false, warning: 'Coordinates out of bounds' };
  }

  // 5. geo:URI format: geo:LAT,LNG
  const geoMatch = rawUrl.match(/^geo:(-?\d+\.\d+),(-?\d+\.\d+)/i);
  if (geoMatch) {
    const lat = parseFloat(geoMatch[1]);
    const lng = parseFloat(geoMatch[2]);
    if (isValidCoordinate(lat, lng)) {
      return { rawUrl, mapUrl: rawUrl, latitude: lat, longitude: lng, isValidCoordinates: true };
    }
    return { rawUrl, mapUrl: rawUrl, latitude: null, longitude: null, isValidCoordinates: false, warning: 'Coordinates out of bounds' };
  }

  // Unparseable coordinates (e.g. goo.gl short URL or place query like /place/Pune)
  // Preserve original map URL as instructed, without inventing coordinates.
  return {
    rawUrl,
    mapUrl: rawUrl,
    latitude: null,
    longitude: null,
    isValidCoordinates: false,
  };
}

/**
 * Builds a standard, safe Google Maps link from coordinates or existing map URL.
 */
export function buildGoogleMapsUrl(lat: number | null | undefined, lng: number | null | undefined, existingUrl?: string | null): string | null {
  if (existingUrl && existingUrl.trim().length > 0) {
    return existingUrl.trim();
  }
  if (lat !== null && lat !== undefined && lng !== null && lng !== undefined && isValidCoordinate(lat, lng)) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  return null;
}

/**
 * Builds a Google Maps Directions link to destination coordinates.
 */
export function buildGoogleMapsDirectionsUrl(lat: number | null | undefined, lng: number | null | undefined, existingUrl?: string | null): string | null {
  if (lat !== null && lat !== undefined && lng !== null && lng !== undefined && isValidCoordinate(lat, lng)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
  if (existingUrl && existingUrl.trim().length > 0) {
    return existingUrl.trim();
  }
  return null;
}
