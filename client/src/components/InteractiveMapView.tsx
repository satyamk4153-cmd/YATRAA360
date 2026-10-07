import React, { useState, useEffect, useRef } from 'react';
import { useTripStore } from '../store/tripStore';
import { api } from '../services/api';
import { RouteResponse } from '../types';
import { DestinationSelector } from './DestinationSelector';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Train,
  Plane,
  Car,
  Clock,
  Gauge,
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

// Map Bounds Controller to fit around the complete road route geometry
function FitRouteBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      try {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } catch {
        // Ignore bounds error
      }
    }
  }, [points, map]);
  return null;
}

// Leaflet DivIcon generator
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        font-weight: 700;
        font-size: 11px;
        padding: 4px 8px;
        border-radius: 9999px;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -2px rgba(0,0,0,0.1);
        border: 2px solid white;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        transform: translate(-50%, -100%);
      ">
        <span>${label}</span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const originIcon = createCustomIcon('#4f46e5', '🏠 Origin');
const destIcon = createCustomIcon('#e11d48', '📍 Destination');
const hotelIcon = createCustomIcon('#7c3aed', '🏨 Stay');
const activityIcon = createCustomIcon('#059669', '✨ Activity');

interface MapMarkerPoint {
  id: string;
  name: string;
  coords: [number, number];
  category: 'Corridor' | 'Stay' | 'Activities';
  icon: L.DivIcon;
  description: string;
}

export const InteractiveMapView: React.FC = () => {
  const { currentTrip, searchOrigin, searchDestination, travelMode } = useTripStore();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Corridor' | 'Stay' | 'Activities'>('All');
  const [mapMode, setMapMode] = useState<'road' | 'transit'>('road');

  // Coordinates
  const [originCoords, setOriginCoords] = useState<[number, number]>([28.9806, 77.6978]); // Meerut
  const [destCoords, setDestCoords] = useState<[number, number]>([28.6139, 77.2090]); // New Delhi

  // Routing state
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);

  const originName = searchOrigin || currentTrip?.trip.origin || 'Meerut';
  const destName = searchDestination || currentTrip?.trip.destination || 'New Delhi';

  // Request token to avoid race conditions
  const routingTokenRef = useRef(0);

  // Geocode Origin & Destination when changed
  useEffect(() => {
    let isCancelled = false;

    const resolveCoords = async () => {
      try {
        const [origGeo, destGeo] = await Promise.all([
          api.geocodeLocation(originName),
          api.geocodeLocation(destName)
        ]);

        if (isCancelled) return;

        if (origGeo) {
          setOriginCoords([origGeo.latitude, origGeo.longitude]);
        }
        if (destGeo) {
          setDestCoords([destGeo.latitude, destGeo.longitude]);
        }
      } catch {
        // Keep fallback coordinates
      }
    };

    resolveCoords();
    return () => {
      isCancelled = true;
    };
  }, [originName, destName]);

  // Fetch real road route geometry from backend OSRM service
  useEffect(() => {
    const currentToken = ++routingTokenRef.current;
    setIsRoutingLoading(true);
    setRoutingError(null);

    api
      .getRoutes({
        originLat: originCoords[0],
        originLng: originCoords[1],
        destinationLat: destCoords[0],
        destinationLng: destCoords[1],
        mode: 'driving'
      })
      .then((res: RouteResponse) => {
        if (currentToken !== routingTokenRef.current) return;
        setRouteData(res);
        setIsRoutingLoading(false);
      })
      .catch((err: unknown) => {
        if (currentToken !== routingTokenRef.current) return;
        const msg = err instanceof Error ? err.message : 'Route unavailable';
        setRoutingError(msg);
        setRouteData(null);
        setIsRoutingLoading(false);
      });
  }, [originCoords, destCoords]);

  // Build marker points (NO RANDOM OR FABRICATED COORDINATES)
  const mapPoints: MapMarkerPoint[] = [
    {
      id: 'pt_origin',
      name: `${originName} (Origin)`,
      coords: originCoords,
      category: 'Corridor',
      icon: originIcon,
      description: 'Journey starting point / departure hub'
    },
    {
      id: 'pt_destination',
      name: `${destName} (Destination)`,
      coords: destCoords,
      category: 'Corridor',
      icon: destIcon,
      description: 'Target destination hub'
    }
  ];

  // Accommodations (only if real coordinates exist)
  if (currentTrip?.accommodations?.[0]) {
    const hotel = currentTrip.accommodations[0];
    if (typeof hotel.lat === 'number' && typeof hotel.lng === 'number') {
      mapPoints.push({
        id: 'pt_hotel',
        name: hotel.name,
        coords: [hotel.lat, hotel.lng],
        category: 'Stay',
        icon: hotelIcon,
        description: `${hotel.type} • Check-in: ${hotel.checkIn}`
      });
    }
  }

  // Itinerary Activities (only if real coordinates exist - NO random offsets)
  if (currentTrip?.itinerary) {
    currentTrip.itinerary.forEach((day) => {
      day.items.forEach((item, idx) => {
        if (typeof item.lat === 'number' && typeof item.lng === 'number') {
          mapPoints.push({
            id: `item_${day.dayNumber}_${idx}`,
            name: `Day ${day.dayNumber}: ${item.title}`,
            coords: [item.lat, item.lng],
            category: 'Activities',
            icon: activityIcon,
            description: `${item.startTime} - ${item.endTime} • ${item.location}`
          });
        }
      });
    });
  }

  const filteredPoints = mapPoints.filter((p) => {
    if (activeFilter === 'All') return true;
    return p.category === activeFilter;
  });

  // Decide points for map bounds: If real road route exists, use its full geometry!
  const hasRoadGeometry = !!(routeData?.geometry && routeData.geometry.length > 0);
  const boundsPoints: [number, number][] =
    mapMode === 'road' && hasRoadGeometry && routeData?.geometry
      ? (routeData.geometry as [number, number][])
      : [originCoords, destCoords];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              OSRM Engine
            </span>
            <span className="text-2xs text-slate-500">Real Highway &amp; Road Geometries</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Interactive Travel Route Map
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Live OpenStreetMap with real OSRM road coordinates. No straight-line polylines or fabricated activity locations.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {(['All', 'Corridor', 'Stay', 'Activities'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Destination Selector for Instant Map Update */}
      <DestinationSelector compact showDateAndMode={false} />

      {/* Map Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        {/* Route Status & Metrics Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-800">Route:</span>
            <span className="font-bold text-indigo-700">{originName}</span>
            <span>➔</span>
            <span className="font-bold text-rose-600">{destName}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg text-2xs font-semibold">
              <button
                type="button"
                onClick={() => setMapMode('road')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  mapMode === 'road'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Car className="w-3 h-3" />
                <span>Road (OSRM)</span>
              </button>
              <button
                type="button"
                onClick={() => setMapMode('transit')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  mapMode === 'transit'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {travelMode === 'Flight' ? <Plane className="w-3 h-3" /> : <Train className="w-3 h-3" />}
                <span>{travelMode} Transit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real Metrics Banner */}
        {mapMode === 'road' ? (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            {isRoutingLoading ? (
              <div className="flex items-center gap-2 text-indigo-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calculating real road route via OSRM...</span>
              </div>
            ) : routingError ? (
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="w-4 h-4" />
                <span>Route unavailable: {routingError}. Markers remain at verified coordinates.</span>
              </div>
            ) : routeData ? (
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-slate-700">
                  <Gauge className="w-4 h-4 text-indigo-600" />
                  <span>
                    Driving Distance: <strong>{routeData.distanceKm} km</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>
                    Estimated Driving Time: <strong>{routeData.durationFormatted}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-2xs text-slate-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Provider: {routeData.provider}</span>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              {travelMode === 'Flight' ? <Plane className="w-4 h-4 text-indigo-600" /> : <Train className="w-4 h-4 text-indigo-600" />}
              <span>
                <strong>{travelMode} Mode Active:</strong> Railway/Flight corridor connects {originName} and {destName} terminals. (Road geometry not applied to train/flight tracks).
              </span>
            </div>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
              Hub-to-Hub Corridor
            </span>
          </div>
        )}

        {/* Leaflet Map with Real Route */}
        <div className="w-full h-[480px] rounded-xl overflow-hidden border border-slate-200 relative">
          <MapContainer
            center={originCoords}
            zoom={8}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Auto fit map bounds around complete road geometry or terminals */}
            <FitRouteBounds points={boundsPoints} />

            {/* Render Real Road Route Geometry (OSRM) */}
            {mapMode === 'road' && hasRoadGeometry && routeData?.geometry && (
              <Polyline
                positions={routeData.geometry as [number, number][]}
                pathOptions={{
                  color: '#4f46e5',
                  weight: 5,
                  opacity: 0.85,
                  lineJoin: 'round'
                }}
              />
            )}

            {/* Markers */}
            {filteredPoints.map((pt) => (
              <Marker key={pt.id} position={pt.coords} icon={pt.icon}>
                <Popup>
                  <div className="p-1 space-y-1">
                    <h4 className="font-bold text-xs text-slate-900">{pt.name}</h4>
                    <p className="text-[11px] text-slate-600">{pt.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {pt.coords[0].toFixed(4)}° N, {pt.coords[1].toFixed(4)}° E
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Location Markers Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {filteredPoints.map((pt) => (
            <div
              key={pt.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5"
            >
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-indigo-600 shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-slate-800 truncate">{pt.name}</h4>
                <p className="text-slate-500 text-2xs truncate">{pt.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
