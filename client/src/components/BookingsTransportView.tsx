import React, { useState, useEffect } from 'react';
import { useTripStore } from '../store/tripStore';
import { api } from '../services/api';
import { DestinationSelector } from './DestinationSelector';
import { TrainResult, FlightResult, FlightSearchResponse, Transport } from '../types';
import {
  Train,
  Plane,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Filter,
  ArrowUpDown,
  AlertCircle,
  RefreshCw,
  Edit2,
  Sparkles,
  Info,
  Scale,
  Car,
  Copy,
  Check
} from 'lucide-react';
import { RideProviderCard } from './RideProviderCard';
import {
  openIRCTC,
  openFlightBooking,
  copyJourneyDetailsToClipboard
} from '../services/bookingLinks';

export const BookingsTransportView: React.FC = () => {
  const {
    currentTrip,
    searchOrigin,
    searchDestination,
    searchDate,
    travelMode,
    setTravelMode,
    selectTrainAndApply,
    selectFlightAndApply,
    updateTransportTiming,
    addToast
  } = useTripStore();

  const [activeTab, setActiveTab] = useState<'Trains' | 'Flights' | 'Rides' | 'Compare' | 'Confirmed'>('Trains');
  const [copiedDetails, setCopiedDetails] = useState(false);
  const [trains, setTrains] = useState<TrainResult[]>([]);
  const [flightData, setFlightData] = useState<FlightSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Train filters & sorting
  const [trainTypeFilter, setTrainTypeFilter] = useState<string>('All');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'departure' | 'duration' | 'fare'>('departure');

  // Booking modal for official redirect
  const [bookingModal, setBookingModal] = useState<{
    type: 'Train' | 'Flight';
    item: TrainResult | FlightResult;
    selectedClass?: string;
  } | null>(null);

  // Timing adjustment modal for confirmed booking
  const [editingTransport, setEditingTransport] = useState<Transport | null>(null);
  const [depTime, setDepTime] = useState('');
  const [arrTime, setArrTime] = useState('');

  // Fetch search data whenever searchOrigin or searchDestination changes
  const fetchData = React.useCallback(async () => {
    if (!searchOrigin || !searchDestination || searchOrigin.toLowerCase() === searchDestination.toLowerCase()) {
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const [trainRes, flightRes] = await Promise.all([
        api.searchTrains(searchOrigin, searchDestination, searchDate).catch((e) => {
          console.warn('Train search warning:', e);
          return [];
        }),
        api.searchFlights(searchOrigin, searchDestination, searchDate).catch((e) => {
          console.warn('Flight search warning:', e);
          return null;
        })
      ]);

      setTrains(trainRes);
      setFlightData(flightRes);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch transport options. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  }, [searchOrigin, searchDestination, searchDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync travelMode from store into activeTab if user switched in DestinationSelector
  useEffect(() => {
    if (travelMode === 'Flight') {
      setActiveTab((prev) => (prev === 'Trains' ? 'Flights' : prev));
    } else if (travelMode === 'Train') {
      setActiveTab((prev) => (prev === 'Flights' ? 'Trains' : prev));
    }
  }, [travelMode]);

  // Filter and sort trains
  const filteredTrains = trains
    .filter((t) => {
      if (trainTypeFilter !== 'All' && t.trainType !== trainTypeFilter) return false;
      if (classFilter !== 'All') {
        const hasClass = t.classes.some((c) => c.classCode === classFilter);
        if (!hasClass) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'departure') {
        return a.departureTime.localeCompare(b.departureTime);
      }
      if (sortBy === 'duration') {
        return parseInt(a.duration) - parseInt(b.duration);
      }
      if (sortBy === 'fare') {
        const fareA = a.classes[0]?.fare || 0;
        const fareB = b.classes[0]?.fare || 0;
        return fareA - fareB;
      }
      return 0;
    });

  const handleOfficialTrainRedirect = (train: TrainResult, selectedClass?: string) => {
    openIRCTC({
      source: train.fromStationName || searchOrigin,
      destination: train.toStationName || searchDestination,
      journeyDate: searchDate,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      classCode: selectedClass
    });
    addToast(
      `Redirecting to official IRCTC portal. Journey details copied to clipboard.`,
      'info'
    );
    setBookingModal(null);
  };

  const handleOfficialFlightRedirect = (flight: FlightResult) => {
    openFlightBooking({
      origin: flight.fromCity || searchOrigin,
      destination: flight.toCity || searchDestination,
      departureDate: searchDate
    });
    addToast(
      `Redirecting to official flight portal for ${flight.airline} ${flight.flightNumber}. Complete booking securely.`,
      'info'
    );
    setBookingModal(null);
  };

  const handleTimingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransport || !currentTrip) return;
    await updateTransportTiming(editingTransport.id, depTime, arrTime);
    setEditingTransport(null);
  };

  const activeTransports = currentTrip?.transports || [];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Railway &amp; Aviation Booking Engine
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Transport &amp; Confirmed Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search all available train services, flight options, compare journey times, and book directly on official portals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
            Route: {searchOrigin} ➔ {searchDestination}
          </span>
        </div>
      </div>

      {/* Destination Selector Bar */}
      <DestinationSelector onSearchSubmit={fetchData} />

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('Trains');
              setTravelMode('Train');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'Trains'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>All Trains ({trains.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('Flights');
              setTravelMode('Flight');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'Flights'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Flights ({flightData?.flights?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('Compare')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'Compare'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare Train vs Flight</span>
          </button>

          <button
            onClick={() => setActiveTab('Rides')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'Rides'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Cabs &amp; Auto (Uber / Ola / Rapido)</span>
          </button>

          <button
            onClick={() => setActiveTab('Confirmed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'Confirmed'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>My Booked Transits ({activeTransports.length})</span>
          </button>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">
            Searching connected travel data for {searchOrigin} ➔ {searchDestination}...
          </h3>
          <p className="text-xs text-slate-500">
            Checking Indian Railways schedules and commercial flight routes.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-sm font-bold text-red-800">Transport Search Error</h3>
          <p className="text-xs text-red-600 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Retry Search
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: TRAINS LIST                                              */}
      {/* ============================================================== */}
      {activeTab === 'Trains' && !isLoading && !error && (
        <div className="space-y-4">
          
          {/* Filter & Sort Controls */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter Type:
              </span>
              {['All', 'Vande Bharat', 'Shatabdi', 'Rajdhani', 'Superfast', 'Express', 'Intercity'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTrainTypeFilter(type)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    trainTypeFilter === type
                      ? 'bg-blue-100 text-blue-800 font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-none"
              >
                <option value="departure">Departure Time</option>
                <option value="duration">Fastest (Duration)</option>
                <option value="fare">Lowest Fare</option>
              </select>
            </div>
          </div>

          {/* Results Summary Notice */}
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing <strong>{filteredTrains.length}</strong> trains from{' '}
              <strong>{searchOrigin}</strong> to <strong>{searchDestination}</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              IRCTC schedules include Vande Bharat, Shatabdi, Superfast &amp; Express services.
            </span>
          </div>

          {/* Empty State */}
          {filteredTrains.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
              <Train className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-700">No matching trains found for this filter</h3>
              <p className="text-xs text-slate-500">
                Try resetting your train type or class filters to view all services.
              </p>
              <button
                onClick={() => {
                  setTrainTypeFilter('All');
                  setClassFilter('All');
                }}
                className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Trains Cards List */}
          <div className="space-y-3">
            {filteredTrains.map((train) => {
              const isVandeBharat = train.trainType === 'Vande Bharat';
              return (
                <div
                  key={train.trainNumber}
                  className={`bg-white rounded-xl p-5 border transition-all ${
                    isVandeBharat
                      ? 'border-blue-300 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Train Info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          #{train.trainNumber}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{train.trainName}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isVandeBharat
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {train.trainType}
                        </span>
                        {train.isRecommended && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" /> Recommendation
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>Runs: {train.runningDays.join(', ')}</span>
                        <span>•</span>
                        <span>Duration: <strong className="text-slate-700">{train.duration}</strong></span>
                      </div>
                    </div>

                    {/* Schedule Timing Box */}
                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">{train.departureTime}</span>
                        <span className="text-[11px] text-slate-500">{train.fromStationCode}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <div className="text-right">
                        <span className="font-bold text-sm text-slate-900 block">{train.arrivalTime}</span>
                        <span className="text-[11px] text-slate-500">{train.toStationCode}</span>
                      </div>
                    </div>

                  </div>

                  {/* Available Classes & Pricing Row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-500">Classes:</span>
                      {train.classes.map((cls) => (
                        <div
                          key={cls.classCode}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center gap-2"
                        >
                          <span className="font-bold text-slate-800">{cls.classCode}</span>
                          <span className="text-slate-500">₹{cls.fare}</span>
                          <span
                            className={`text-[10px] font-semibold px-1 rounded ${
                              cls.status.startsWith('Available')
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {cls.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectTrainAndApply(train)}
                        className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="Set this train as primary transport for active trip"
                      >
                        Select for Journey
                      </button>

                      <button
                        onClick={() => setBookingModal({ type: 'Train', item: train })}
                        className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Book Ticket</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: FLIGHTS LIST                                             */}
      {/* ============================================================== */}
      {activeTab === 'Flights' && !isLoading && !error && (
        <div className="space-y-4">
          
          {/* Airport Distance Notices if City has no commercial airport */}
          {(flightData?.originAirportNotice || flightData?.destinationAirportNotice) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Regional Airport Connectivity Advisory</span>
              </div>
              {flightData.originAirportNotice && <p>{flightData.originAirportNotice}</p>}
              {flightData.destinationAirportNotice && <p>{flightData.destinationAirportNotice}</p>}
            </div>
          )}

          {/* Results Summary */}
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing commercial flights connecting{' '}
              <strong>{flightData?.originCity || searchOrigin}</strong> to{' '}
              <strong>{flightData?.destinationCity || searchDestination}</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              Live scheduled airlines: IndiGo, Air India, Vistara, Akasa Air, SpiceJet.
            </span>
          </div>

          {/* Flight Cards */}
          <div className="space-y-3">
            {flightData?.flights && flightData.flights.length > 0 ? (
              flightData.flights.map((flight) => (
                <div
                  key={flight.flightNumber}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-all space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Airline & Flight Number */}
                    <div>
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-blue-600" />
                        <h3 className="text-base font-bold text-slate-900">{flight.airline}</h3>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {flight.flightNumber}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {flight.stops}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {flight.cabinClass} • {flight.seatsAvailable} seats available
                      </p>
                    </div>

                    {/* Flight Schedule Timing */}
                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">{flight.departureTime}</span>
                        <span className="text-[11px] text-slate-500">{flight.fromAirportCode} ({flight.fromCity})</span>
                      </div>
                      <div className="text-center px-2">
                        <span className="text-[10px] text-slate-400 block">{flight.duration}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400 mx-auto" />
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-slate-900 block">{flight.arrivalTime}</span>
                        <span className="text-[11px] text-slate-500">{flight.toAirportCode} ({flight.toCity})</span>
                      </div>
                    </div>

                    {/* Pricing & Booking */}
                    <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Starting from</span>
                        <span className="text-base font-bold text-slate-900">₹{flight.fare.toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => selectFlightAndApply(flight)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          title="Set this flight as primary transport for active trip"
                        >
                          Select
                        </button>

                        <button
                          onClick={() => setBookingModal({ type: 'Flight', item: flight })}
                          className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <span>Book Flight</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 space-y-2">
                <Plane className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Direct Commercial Flights Found</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Direct commercial air service between {searchOrigin} and {searchDestination} is unavailable.
                  Consider railway transit options or regional connecting flights via Delhi (DEL).
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: TRAVEL COMPARISON (TRAIN vs FLIGHT)                       */}
      {/* ============================================================== */}
      {activeTab === 'Compare' && !isLoading && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-700" />
              <span>Side-by-Side Comparison: {searchOrigin} ➔ {searchDestination}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Compare transit durations, luggage convenience, and approximate pricing between rail and air services.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Train Column */}
              <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Train className="w-4 h-4 text-blue-600" />
                    <span>Indian Railways</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    City Center to City Center
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-blue-100">
                    <span className="text-slate-500">Transit Duration</span>
                    <strong className="text-slate-800">
                      {trains[0]?.duration || '1h - 4h'} (Direct Station to Station)
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-100">
                    <span className="text-slate-500">Price Range</span>
                    <strong className="text-slate-800">
                      ₹{trains[0]?.classes[0]?.fare || 145} – ₹{trains[0]?.classes[trains[0].classes.length - 1]?.fare || 955}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-100">
                    <span className="text-slate-500">Check-in Buffer Needed</span>
                    <strong className="text-slate-800">15 – 25 mins prior</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-blue-100">
                    <span className="text-slate-500">Luggage Allowance</span>
                    <strong className="text-emerald-700">Generous (40 - 50 kg per passenger)</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Convenience</span>
                    <strong className="text-slate-800">No airport road transfer; central terminals</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('Trains');
                    setTravelMode('Train');
                  }}
                  className="w-full mt-2 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  View &amp; Select Trains
                </button>
              </div>

              {/* Flight Column */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Plane className="w-4 h-4 text-blue-600" />
                    <span>Commercial Airline</span>
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                    Airport Corridor
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Flight Air Time</span>
                    <strong className="text-slate-800">{flightData?.flights[0]?.duration || '1h 20m'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Price Range</span>
                    <strong className="text-slate-800">
                      ₹{flightData?.flights[0]?.fare.toLocaleString('en-IN') || '3,490'} – ₹5,500+
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Airport Buffer Needed</span>
                    <strong className="text-amber-800">1.5 – 2 hours (Security &amp; Boarding)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Luggage Allowance</span>
                    <strong className="text-slate-800">15 kg check-in + 7 kg cabin</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Convenience</span>
                    <strong className="text-slate-800">Fastest for long distances (&gt; 500 km)</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('Flights');
                    setTravelMode('Flight');
                  }}
                  className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  View &amp; Select Flights
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: LOCAL RIDES (UBER / OLA / RAPIDO)                          */}
      {/* ============================================================== */}
      {activeTab === 'Rides' && (
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    On-Demand Rides
                  </span>
                  <span className="text-2xs text-slate-500">Official Provider Deep Links</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Local &amp; Intercity Ride Booking
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct deep links for Uber, Ola, and Rapido with pickup ({searchOrigin}) and destination ({searchDestination}) coordinates.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                Route: {searchOrigin} ➔ {searchDestination}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <RideProviderCard
                provider="uber"
                pickup={{ address: searchOrigin }}
                destination={{ address: searchDestination }}
                rideType="UberGo / Premier / Auto / Intercity"
                estimatedFare="₹1,200 – ₹1,800"
                eta="3-5 mins"
              />

              <RideProviderCard
                provider="ola"
                pickup={{ address: searchOrigin }}
                destination={{ address: searchDestination }}
                rideType="Mini / Prime Sedan / Outstation"
                estimatedFare="₹1,150 – ₹1,750"
                eta="4-6 mins"
              />

              <RideProviderCard
                provider="rapido"
                pickup={{ address: searchOrigin }}
                destination={{ address: searchDestination }}
                rideType="Auto / Bike / Cab"
                estimatedFare="₹250 – ₹1,100"
                eta="2-4 mins"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-2xs text-slate-600 flex items-center justify-between">
              <span>
                Note: All rides redirect to official apps/portals with SSL verification. Yatraa360 does not intermediate payment credentials.
              </span>
              <span className="font-semibold text-slate-700">Official Portals</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CONFIRMED TRANSITS IN ACTIVE TRIP                        */}
      {/* ============================================================== */}
      {activeTab === 'Confirmed' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Journey Reservations</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirmed legs connected to your active trip. Changing schedules will ripple downstream into itinerary activities.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                {activeTransports.length} Confirmed Legs
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {activeTransports.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {t.isReturn ? 'Return Journey' : 'Outbound Journey'}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{t.provider}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">PNR: {t.pnr} • {t.seats}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{t.departureStation}</span>
                      <span className="font-bold text-slate-800">{t.departureTime}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">{t.arrivalStation}</span>
                      <span className="font-bold text-slate-800">{t.arrivalTime}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Fare: <strong className="text-slate-900">₹{t.price.toLocaleString('en-IN')}</strong></span>
                    <button
                      onClick={() => {
                        setEditingTransport(t);
                        setDepTime(t.departureTime);
                        setArrTime(t.arrivalTime);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-slate-600" />
                      <span>Adjust Timing</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: OFFICIAL BOOKING REDIRECTION                            */}
      {/* ============================================================== */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {bookingModal.type === 'Train' ? (
                  <>
                    <Train className="w-5 h-5 text-indigo-600" />
                    <span>Official Railway Booking (IRCTC)</span>
                  </>
                ) : (
                  <>
                    <Plane className="w-5 h-5 text-indigo-600" />
                    <span>Official Airline Booking Portal</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setBookingModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <p className="font-semibold">Official Ticketing Notice:</p>
              <p>
                {bookingModal.type === 'Train'
                  ? 'IRCTC requires individual Indian Railways authentication & CAPTCHA on irctc.co.in. Your journey details can be copied below for seamless entry.'
                  : 'Official airline booking opens securely with route parameters prefilled on Google Flights.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <strong className="text-slate-800">
                  {bookingModal.type === 'Train'
                    ? (bookingModal.item as TrainResult).trainName
                    : `${(bookingModal.item as FlightResult).airline} (${(bookingModal.item as FlightResult).flightNumber})`}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Route:</span>
                <strong className="text-slate-800">{searchOrigin} ➔ {searchDestination}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Travel Date:</span>
                <strong className="text-slate-800">{searchDate}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Fare:</span>
                <strong className="text-slate-800">
                  ₹{bookingModal.type === 'Train'
                    ? ((bookingModal.item as TrainResult).classes[0]?.fare || 450)
                    : (bookingModal.item as FlightResult).fare}
                </strong>
              </div>
            </div>

            {bookingModal.type === 'Train' && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-600 text-2xs">Copy details to paste into IRCTC search:</span>
                <button
                  type="button"
                  onClick={() => {
                    const t = bookingModal.item as TrainResult;
                    copyJourneyDetailsToClipboard({
                      source: searchOrigin,
                      destination: searchDestination,
                      journeyDate: searchDate,
                      trainNumber: t.trainNumber,
                      trainName: t.trainName,
                      classCode: bookingModal.selectedClass
                    });
                    setCopiedDetails(true);
                    setTimeout(() => setCopiedDetails(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedDetails ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Journey Details</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBookingModal(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (bookingModal.type === 'Train') {
                    handleOfficialTrainRedirect(bookingModal.item as TrainResult, bookingModal.selectedClass);
                  } else {
                    handleOfficialFlightRedirect(bookingModal.item as FlightResult);
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Continue to Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADJUST TIMING                                            */}
      {/* ============================================================== */}
      {editingTransport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Adjust Transport Schedule</h3>
            <p className="text-xs text-slate-500">
              Updating departure and arrival timings will automatically propagate downstream into arrival cab buffers and hotel check-in.
            </p>

            <form onSubmit={handleTimingSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Departure Time</label>
                <input
                  type="text"
                  required
                  value={depTime}
                  onChange={(e) => setDepTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Arrival Time</label>
                <input
                  type="text"
                  required
                  value={arrTime}
                  onChange={(e) => setArrTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTransport(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
