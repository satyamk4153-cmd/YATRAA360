import React, { useState, useEffect, useRef } from 'react';
import { useTripStore } from '../store/tripStore';
import { api } from '../services/api';
import { Station } from '../types';
import { ArrowLeftRight, MapPin, Search, AlertCircle, Train, Plane, Calendar } from 'lucide-react';

interface DestinationSelectorProps {
  onSearchSubmit?: () => void;
  showDateAndMode?: boolean;
  compact?: boolean;
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  onSearchSubmit,
  showDateAndMode = true,
  compact = false
}) => {
  const {
    searchOrigin,
    searchDestination,
    searchDate,
    travelMode,
    setSearchOrigin,
    setSearchDestination,
    setSearchDate,
    setTravelMode,
    swapSearchLocations,
    addToast
  } = useTripStore();

  const [originInput, setOriginInput] = useState(searchOrigin);
  const [destInput, setDestInput] = useState(searchDestination);
  const [originSuggestions, setOriginSuggestions] = useState<Station[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<Station[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Sync inputs with store
  useEffect(() => {
    setOriginInput(searchOrigin);
  }, [searchOrigin]);

  useEffect(() => {
    setDestInput(searchDestination);
  }, [searchDestination]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setShowOriginDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions for origin
  useEffect(() => {
    if (!originInput.trim()) {
      setOriginSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await api.searchStations(originInput);
        setOriginSuggestions(results);
      } catch (_) {}
    }, 150);
    return () => clearTimeout(timer);
  }, [originInput]);

  // Fetch suggestions for destination
  useEffect(() => {
    if (!destInput.trim()) {
      setDestSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await api.searchStations(destInput);
        setDestSuggestions(results);
      } catch (_) {}
    }, 150);
    return () => clearTimeout(timer);
  }, [destInput]);

  const handleSelectOrigin = (station: Station) => {
    const chosen = station.city || station.name;
    if (chosen.toLowerCase() === destInput.trim().toLowerCase()) {
      setValidationError('Source and Destination cannot be the same station or city.');
      return;
    }
    setValidationError(null);
    setOriginInput(chosen);
    setSearchOrigin(chosen);
    setShowOriginDropdown(false);
  };

  const handleSelectDest = (station: Station) => {
    const chosen = station.city || station.name;
    if (chosen.toLowerCase() === originInput.trim().toLowerCase()) {
      setValidationError('Source and Destination cannot be the same station or city.');
      return;
    }
    setValidationError(null);
    setDestInput(chosen);
    setSearchDestination(chosen);
    setShowDestDropdown(false);
  };

  const handleSwap = () => {
    const temp = originInput;
    setOriginInput(destInput);
    setDestInput(temp);
    swapSearchLocations();
    setValidationError(null);
  };

  const handleOriginBlur = () => {
    setTimeout(() => {
      if (originInput.trim() && originInput.trim().toLowerCase() === destInput.trim().toLowerCase()) {
        setValidationError('Source and Destination cannot be identical.');
      } else if (originInput.trim()) {
        setValidationError(null);
        setSearchOrigin(originInput.trim());
      }
    }, 200);
  };

  const handleDestBlur = () => {
    setTimeout(() => {
      if (destInput.trim() && destInput.trim().toLowerCase() === originInput.trim().toLowerCase()) {
        setValidationError('Source and Destination cannot be identical.');
      } else if (destInput.trim()) {
        setValidationError(null);
        setSearchDestination(destInput.trim());
      }
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originInput.trim() || !destInput.trim()) {
      setValidationError('Please enter both source and destination.');
      return;
    }
    if (originInput.trim().toLowerCase() === destInput.trim().toLowerCase()) {
      setValidationError('Source and Destination cannot be the same.');
      return;
    }
    setValidationError(null);
    setSearchOrigin(originInput.trim());
    setSearchDestination(destInput.trim());
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${compact ? 'p-3' : 'p-5'}`}>
      
      {/* Mode Selector Tabs */}
      {showDateAndMode && (
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setTravelMode('Train')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                travelMode === 'Train'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Train className="w-3.5 h-3.5 text-blue-600" />
              <span>Trains</span>
            </button>
            <button
              type="button"
              onClick={() => setTravelMode('Flight')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                travelMode === 'Flight'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plane className="w-3.5 h-3.5 text-blue-600" />
              <span>Flights</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 hidden sm:block">
            Search live Indian rail &amp; flight connectivity
          </div>
        </div>
      )}

      {/* Validation Alert */}
      {validationError && (
        <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Input Fields Row */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Source / From Field */}
        <div className="md:col-span-4 relative" ref={originRef}>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            From (City / Station)
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={originInput}
              onChange={(e) => {
                setOriginInput(e.target.value);
                setShowOriginDropdown(true);
                setValidationError(null);
              }}
              onFocus={() => setShowOriginDropdown(true)}
              onBlur={handleOriginBlur}
              placeholder="e.g. Meerut, New Delhi, Mumbai"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showOriginDropdown && originSuggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {originSuggestions.map((st) => (
                <div
                  key={st.code}
                  onMouseDown={() => handleSelectOrigin(st)}
                  className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{st.city}</span>
                    <span className="text-slate-500 ml-1">({st.name})</span>
                    <span className="block text-[10px] text-slate-400">{st.state}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-600">
                    {st.code}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex items-center justify-center pt-5">
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Origin and Destination"
            className="p-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Destination / To Field */}
        <div className="md:col-span-4 relative" ref={destRef}>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            To (Destination City / Station)
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={destInput}
              onChange={(e) => {
                setDestInput(e.target.value);
                setShowDestDropdown(true);
                setValidationError(null);
              }}
              onFocus={() => setShowDestDropdown(true)}
              onBlur={handleDestBlur}
              placeholder="e.g. New Delhi, Jaipur, Varanasi"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {showDestDropdown && destSuggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {destSuggestions.map((st) => (
                <div
                  key={st.code}
                  onMouseDown={() => handleSelectDest(st)}
                  className="px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{st.city}</span>
                    <span className="text-slate-500 ml-1">({st.name})</span>
                    <span className="block text-[10px] text-slate-400">{st.state}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 font-mono text-[10px] font-bold text-blue-700">
                    {st.code}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date Field */}
        <div className="md:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Travel Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Search Submit Button */}
        <div className="md:col-span-1 pt-5">
          <button
            type="submit"
            className="w-full py-2.5 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Go</span>
            <span className="md:hidden">Search</span>
          </button>
        </div>

      </form>

      {/* Helpful Pre-set Popular Corridor Links */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="text-[11px] font-medium text-slate-400">Popular Corridors:</span>
        {[
          { from: 'Meerut', to: 'New Delhi' },
          { from: 'New Delhi', to: 'Jaipur' },
          { from: 'New Delhi', to: 'Chandigarh' },
          { from: 'New Delhi', to: 'Varanasi' },
          { from: 'New Delhi', to: 'Mumbai' }
        ].map((corr, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setOriginInput(corr.from);
              setDestInput(corr.to);
              setSearchOrigin(corr.from);
              setSearchDestination(corr.to);
              setValidationError(null);
            }}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
          >
            {corr.from} ➔ {corr.to}
          </button>
        ))}
      </div>

    </div>
  );
};
