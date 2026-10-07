import React, { useState } from 'react';
import { ExternalLink, Navigation, Clock, ShieldCheck, Check } from 'lucide-react';
import { openUber, openOla, openRapido } from '../services/bookingLinks';

export interface RideProviderCardProps {
  provider: 'uber' | 'ola' | 'rapido';
  rideType?: string;
  pickup: {
    address: string;
    lat?: number;
    lng?: number;
  };
  destination: {
    address: string;
    lat?: number;
    lng?: number;
  };
  estimatedFare?: string;
  eta?: string;
  className?: string;
}

export const RideProviderCard: React.FC<RideProviderCardProps> = ({
  provider,
  rideType,
  pickup,
  destination,
  estimatedFare,
  eta = '3-6 mins',
  className = '',
}) => {
  const [opening, setOpening] = useState(false);
  const [copied, setCopied] = useState(false);

  const providerConfig = {
    uber: {
      name: 'Uber',
      badge: 'Official Ride Link',
      color: 'bg-black text-white hover:bg-neutral-800 border-neutral-700',
      tagColor: 'bg-neutral-800 text-neutral-200 border-neutral-700',
      accent: 'border-l-4 border-l-black',
      defaultType: rideType || 'UberGo / Premier / Auto',
      description: 'Prefilled pickup & destination coordinates via Uber Deep Link',
      buttonText: 'Book with Uber',
      handler: () =>
        openUber({
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          pickupAddress: pickup.address,
          dropLat: destination.lat,
          dropLng: destination.lng,
          dropAddress: destination.address,
        }),
    },
    ola: {
      name: 'Ola Cabs',
      badge: 'Official Web / App Link',
      color: 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-500',
      tagColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-800',
      accent: 'border-l-4 border-l-emerald-500',
      defaultType: rideType || 'Mini / Prime / Auto',
      description: 'Prefilled pickup & drop coordinates via Ola Web/App URL',
      buttonText: 'Book with Ola',
      handler: () =>
        openOla({
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          pickupAddress: pickup.address,
          dropLat: destination.lat,
          dropLng: destination.lng,
          dropAddress: destination.address,
        }),
    },
    rapido: {
      name: 'Rapido',
      badge: 'Official Ride Portal',
      color: 'bg-amber-600 text-white hover:bg-amber-700 border-amber-500',
      tagColor: 'bg-amber-950/60 text-amber-300 border-amber-800',
      accent: 'border-l-4 border-l-amber-500',
      defaultType: rideType || 'Bike / Auto / Cab',
      description: 'Official Rapido portal. Route copied to clipboard for easy entry.',
      buttonText: 'Continue to Rapido',
      handler: () =>
        openRapido({
          pickupAddress: pickup.address,
          dropAddress: destination.address,
        }),
    },
  }[provider];

  const handleBook = () => {
    setOpening(true);
    providerConfig.handler();
    setTimeout(() => setOpening(false), 2000);
  };

  const handleCopyRoute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const routeText = `Pickup: ${pickup.address || 'My Location'}\nDropoff: ${destination.address || 'Destination'}`;
    navigator.clipboard.writeText(routeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-sm hover:border-neutral-750 transition-all ${providerConfig.accent} ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white text-base tracking-tight">{providerConfig.name}</h4>
            <span
              className={`text-2xs uppercase tracking-wider px-2 py-0.5 rounded-full border font-medium ${providerConfig.tagColor}`}
            >
              {providerConfig.badge}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">{providerConfig.defaultType}</p>
        </div>

        {estimatedFare && (
          <div className="text-right">
            <div className="text-sm font-semibold text-white">{estimatedFare}</div>
            <div className="text-2xs text-neutral-400 flex items-center justify-end gap-1">
              <Clock className="w-2.5 h-2.5" />
              <span>{eta}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-lg p-3 text-xs space-y-2 mb-3">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-neutral-500 text-2xs block uppercase tracking-wider">Pickup</span>
            <span className="text-neutral-200 font-medium truncate block">
              {pickup.address || 'Current Location / Origin'}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-400 mt-1 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-neutral-500 text-2xs block uppercase tracking-wider">Dropoff</span>
            <span className="text-neutral-200 font-medium truncate block">
              {destination.address || 'Destination Hub'}
            </span>
          </div>
        </div>
      </div>

      <div className="text-2xs text-neutral-400 flex items-center justify-between mb-3 px-0.5">
        <span className="flex items-center gap-1 text-neutral-500">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          {providerConfig.description}
        </span>
        <button
          type="button"
          onClick={handleCopyRoute}
          className="text-neutral-400 hover:text-neutral-200 underline decoration-dotted text-2xs transition-colors inline-flex items-center gap-1"
        >
          {copied ? (
            <>
              <Check className="w-2.5 h-2.5 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            'Copy route'
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={handleBook}
        disabled={opening}
        className={`w-full py-2.5 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-2 border transition-all ${providerConfig.color}`}
      >
        <Navigation className="w-3.5 h-3.5" />
        <span>{opening ? `Opening ${providerConfig.name}...` : providerConfig.buttonText}</span>
        <ExternalLink className="w-3 h-3 opacity-70" />
      </button>
    </div>
  );
};
