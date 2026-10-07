import { RouteResponse } from '../types';

interface CachedRoute {
  data: RouteResponse;
  timestamp: number;
}

const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const routeCache = new Map<string, CachedRoute>();

export class RoutingService {
  /**
   * Fetches real road routing geometry from OSRM
   */
  public static async getRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    mode: string = 'driving'
  ): Promise<RouteResponse> {
    const cacheKey = `${originLat.toFixed(4)},${originLng.toFixed(4)}->${destLat.toFixed(4)},${destLng.toFixed(4)}:${mode}`;
    const now = Date.now();
    const cached = routeCache.get(cacheKey);

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      // OSRM expects coordinates in {longitude},{latitude} order
      const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=false`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Yatra360-Travel-Routing/1.0'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        throw new Error(`OSRM API responded with status ${response.status}`);
      }

      const json = (await response.json()) as any;

      if (!json.routes || json.routes.length === 0) {
        throw new Error('No route found between coordinates');
      }

      const route = json.routes[0];
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMinutes = Math.round(route.duration / 60);

      // OSRM GeoJSON geometry coordinates are [lng, lat].
      // Leaflet requires [lat, lng]. We convert every point!
      const rawCoords: [number, number][] = route.geometry.coordinates || [];
      const leafletGeometry: [number, number][] = rawCoords.map(([lng, lat]) => [lat, lng]);

      const routeData: RouteResponse = {
        success: true,
        distanceKm,
        durationMinutes,
        geometry: leafletGeometry,
        provider: 'OSRM',
        mode
      };

      routeCache.set(cacheKey, { data: routeData, timestamp: now });
      return routeData;
    } catch (err: any) {
      console.warn(`Routing error for [${originLat}, ${originLng}] -> [${destLat}, ${destLng}]:`, err.message);

      return {
        success: false,
        distanceKm: 0,
        durationMinutes: 0,
        geometry: [],
        provider: 'OSRM',
        mode,
        error: 'Route unavailable'
      };
    }
  }
}
