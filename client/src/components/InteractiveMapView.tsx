import React, { useState, useEffect } from 'react';
import { useTripStore } from '../store/tripStore';
import { api } from '../services/api';
import { Station } from '../types';
import { DestinationSelector } from './DestinationSelector';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Train,
  Building2,
  Home,
  Layers,
  Compass,
  Maximize2
} from 'lucide-react';

// Custom Map Bounds Controller component to auto-fit markers
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      try {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } catch (_) {}
    }
  }, [points, map]);
  return null;
}

// Custom Leaflet DivIcon generator for reliable, beautiful vector pins
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

const originIcon = createCustomIcon('#2563eb', '🏠 Origin');
const destIcon = createCustomIcon('#dc2626', '📍 Destination');
const transitIcon = createCustomIcon('#0284c7', '🚆 Transit');
const hotelIcon = createCustomIcon('#7c3aed', '🏨 Stay');
const activityIcon = createCustomIcon('#059669', '✨ Activity');

export const InteractiveMapView: React.FC = () => {
  const { currentTrip, searchOrigin, searchDestination } = useTripStore();
  const [stationLocations, setStationLocations] = useState<Station[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Corridor' | 'Stay' | 'Activities'>('All');

  useEffect(() => {
    // Pre-load station coordinates
    api.searchStations('').then((stations) => {
      setStationLocations(stations);
    });
  }, []);

  const getStationCoord = (nameOrCity: string): [number, number] => {
    const q = (nameOrCity || '').toLowerCase();
    const found = stationLocations.find(
      (s) => s.city.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
    if (found) return [found.lat, found.lng];

    // Fallbacks for known cities
    if (q.includes('meerut')) return [28.9806, 77.6978];
    if (q.includes('delhi')) return [28.6429, 77.2195];
    if (q.includes('jaipur')) return [26.9196, 75.7878];
    if (q.includes('chandigarh')) return [30.7022, 76.8228];
    if (q.includes('varanasi')) return [25.3283, 82.9868];
    if (q.includes('mumbai')) return [18.9696, 72.8193];
    if (q.includes('manali')) return [32.2432, 77.1892];
    if (q.includes('moradabad')) return [28.8386, 78.7733];
    return [28.6139, 77.2090]; // Default New Delhi
  };

  const origin = searchOrigin || currentTrip?.trip.origin || 'Meerut';
  const destination = searchDestination || currentTrip?.trip.destination || 'New Delhi';

  const originCoords = getStationCoord(origin);
  const destCoords = getStationCoord(destination);

  // Collect map points
  interface MapMarkerPoint {
    id: string;
    name: string;
    coords: [number, number];
    category: 'Corridor' | 'Stay' | 'Activities';
    icon: L.DivIcon;
    description: string;
  }

  const mapPoints: MapMarkerPoint[] = [
    {
      id: 'pt_origin',
      name: `${origin} (Starting Origin)`,
      coords: originCoords,
      category: 'Corridor',
      icon: originIcon,
      description: 'Journey starting point / doorstep departure.'
    },
    {
      id: 'pt_destination',
      name: `${destination} (Destination Hub)`,
      coords: destCoords,
      category: 'Corridor',
      icon: destIcon,
      description: 'Target destination hub.'
    }
  ];

  // Add hotel point if present in current trip
  if (currentTrip?.accommodations?.[0]) {
    const hotel = currentTrip.accommodations[0];
    const hotelCoords: [number, number] = [
      hotel.lat || destCoords[0] + 0.015,
      hotel.lng || destCoords[1] + 0.012
    ];
    mapPoints.push({
      id: 'pt_hotel',
      name: hotel.name,
      coords: hotelCoords,
      category: 'Stay',
      icon: hotelIcon,
      description: `${hotel.type} • Check-in: ${hotel.checkIn}`
    });
  }

  // Add itinerary points if present
  if (currentTrip?.itinerary) {
    currentTrip.itinerary.forEach((day) => {
      day.items.forEach((item, idx) => {
        if (item.category !== 'Transit' && idx < 2) {
          const lat = destCoords[0] + (idx % 2 === 0 ? 0.01 : -0.01) * (day.dayNumber * 0.8);
          const lng = destCoords[1] + (idx % 2 === 0 ? -0.01 : 0.015) * (day.dayNumber * 0.8);
          mapPoints.push({
            id: `item_${day.dayNumber}_${idx}`,
            name: `Day ${day.dayNumber}: ${item.title}`,
            coords: [lat, lng],
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

  const polylineCoords: [number, number][] = [originCoords, destCoords];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Geospatial Routing Engine
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Interactive Travel Route Map
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real interactive OpenStreetMap route rendering source station, destination, stops, and accommodations.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          {(['All', 'Corridor', 'Stay', 'Activities'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-white text-blue-700 shadow-xs'
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-4">
        
        {/* Route Status Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-800">Direct Route Corridor:</span>
            <span className="font-bold text-blue-700">{origin}</span>
            <span>➔</span>
            <span className="font-bold text-red-600">{destination}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>{filteredPoints.length} pins rendered</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">OpenStreetMap Live</span>
          </div>
        </div>

        {/* Actual Real Interactive Leaflet Map */}
        <div className="w-full h-[450px] rounded-lg overflow-hidden border border-slate-200 relative">
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

            {/* Fit bounds dynamically */}
            <FitBounds points={[originCoords, destCoords]} />

            {/* Connecting Polyline Corridor */}
            <Polyline
              positions={polylineCoords}
              pathOptions={{
                color: '#2563eb',
                weight: 4,
                opacity: 0.8,
                dashArray: '8, 8'
              }}
            />

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

        {/* Pin Location Quick List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {filteredPoints.map((pt) => (
            <div
              key={pt.id}
              className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start gap-2.5"
            >
              <div className="p-1.5 rounded-md bg-white border border-slate-200 text-blue-600 shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-slate-800 truncate">{pt.name}</h4>
                <p className="text-slate-500 text-[11px] truncate">{pt.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
