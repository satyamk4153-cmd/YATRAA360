import { GeocodedLocation } from '../types';
import { STATIONS } from './travel-data';

interface CacheEntry {
  data: GeocodedLocation[];
  timestamp: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours cache for locations
const geocodingCache = new Map<string, CacheEntry>();

export class GeocodingService {
  /**
   * Search for locations matching query using OpenStreetMap Nominatim with local fallback & caching
   */
  public static async searchLocations(query: string): Promise<GeocodedLocation[]> {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const now = Date.now();
    const cached = geocodingCache.get(q);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    // Check station catalog first for fast response and accurate Indian transport hubs
    const localMatches: GeocodedLocation[] = [];
    const matchedStations = STATIONS.filter(s =>
      s.city.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase() === q
    );

    matchedStations.forEach(s => {
      // Don't add duplicate cities
      if (!localMatches.some(m => m.city.toLowerCase() === s.city.toLowerCase())) {
        localMatches.push({
          latitude: s.lat,
          longitude: s.lng,
          displayName: `${s.name}, ${s.city}, ${s.state}, India`,
          city: s.city,
          state: s.state,
          country: 'India'
        });
      }
    });

    try {
      // Query OpenStreetMap Nominatim
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=in&limit=6`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Yatra360-Travel-Engine/1.0 (contact: support@yatra360.app)'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const results = (await response.json()) as any[];
        const remoteMatches: GeocodedLocation[] = [];

        for (const item of results) {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const address = item.address || {};
          const city = address.city || address.town || address.village || address.state_district || address.county || item.display_name.split(',')[0];
          const state = address.state || address.region || '';
          const country = address.country || 'India';

          if (!isNaN(lat) && !isNaN(lng)) {
            remoteMatches.push({
              latitude: lat,
              longitude: lng,
              displayName: item.display_name,
              city,
              state,
              country
            });
          }
        }

        // Merge results: prioritize remote, fill with local
        const combined = [...remoteMatches];
        for (const loc of localMatches) {
          if (!combined.some(c => c.city.toLowerCase() === loc.city.toLowerCase())) {
            combined.push(loc);
          }
        }

        geocodingCache.set(q, { data: combined, timestamp: now });
        return combined;
      }
    } catch (err: any) {
      console.warn('Nominatim geocoding request failed or timed out:', err.message);
    }

    // Fallback to local station matches
    geocodingCache.set(q, { data: localMatches, timestamp: now });
    return localMatches;
  }

  /**
   * Resolve single best coordinates for city/station name
   */
  public static async resolveCoordinates(nameOrCity: string): Promise<[number, number] | null> {
    const results = await this.searchLocations(nameOrCity);
    if (results.length > 0) {
      return [results[0].latitude, results[0].longitude];
    }
    return null;
  }
}
