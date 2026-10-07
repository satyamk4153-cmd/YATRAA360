import React, { useState } from 'react';
import { useTripStore } from '../store/tripStore';
import { DestinationSelector } from './DestinationSelector';
import {
  Compass,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Train,
  Plane,
  Building2,
  Home,
  Car,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const DoorToDoorView: React.FC = () => {
  const { currentTrip, searchOrigin, searchDestination, setView, addToast } = useTripStore();

  const origin = searchOrigin || currentTrip?.trip.origin || 'Meerut';
  const destination = searchDestination || currentTrip?.trip.destination || 'New Delhi';

  const outbound = currentTrip?.transports?.find(t => !t.isReturn) || currentTrip?.transports?.[0];
  const isFlight = outbound?.type === 'Flight';

  // State for user customizing doorstep address
  const [homeAddress, setHomeAddress] = useState(`${origin} Central / Residence`);
  const [destAddress, setDestAddress] = useState(`${destination} City Center / Hotel`);
  const [firstMileBooked, setFirstMileBooked] = useState(false);
  const [lastMileBooked, setLastMileBooked] = useState(false);

  // Estimations
  const firstMileDist = '12 km';
  const firstMileTime = '25 mins';
  const firstMileFare = 280;

  const mainTransitDist = origin.toLowerCase() === 'meerut' && destination.toLowerCase() === 'new delhi'
    ? '75 km'
    : '450 km';
  const mainTransitTime = outbound?.arrivalTime && outbound?.departureTime ? '1h 15m' : '3h 30m';
  const mainTransitFare = outbound?.price || 480;

  const lastMileDist = '8 km';
  const lastMileTime = '20 mins';
  const lastMileFare = 220;

  const totalCost = (firstMileBooked ? firstMileFare : 0) + mainTransitFare + (lastMileBooked ? lastMileFare : 0);
  const totalSuggestedCost = (!firstMileBooked ? firstMileFare : 0) + (!lastMileBooked ? lastMileFare : 0);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Complete Journey Topology
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Door-to-Door Travel Orchestration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Unified travel trajectory: from your starting home doorstep to the transit terminal, intercity rail/air transit, and final destination.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
          Seamless 5-Stage Corridor
        </span>
      </div>

      {/* Destination Selector for Route Recalculation */}
      <DestinationSelector compact showDateAndMode={false} />

      {/* Corridor Summary Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-xs text-slate-500 block">Total Est. Distance</span>
          <span className="text-lg font-bold text-slate-900">~{mainTransitDist}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Doorstep to Destination</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-xs text-slate-500 block">Est. Journey Time</span>
          <span className="text-lg font-bold text-slate-900">~{mainTransitTime} + buffers</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Includes first &amp; last mile</span>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-xs text-slate-500 block">Booked / Total Cost</span>
          <span className="text-lg font-bold text-blue-700">₹{totalCost.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            + ₹{totalSuggestedCost} suggested local transfers
          </span>
        </div>
      </div>

      {/* Door to Door Segments Timeline */}
      <div className="space-y-4">
        
        {/* SEGMENT 1: User Origin Doorstep */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <Home className="w-4 h-4 text-blue-600" /> Stage 1: Starting Origin (Doorstep)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
              User Origin
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Your Starting Pickup Address
              </label>
              <input
                type="text"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="e.g. Civil Lines, Meerut / Home"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Departure Window</span>
                <span className="font-bold text-slate-800">
                  {outbound?.departureTime ? `45 mins before ${outbound.departureTime}` : '06:00 AM'}
                </span>
              </div>
              <span className="text-emerald-700 font-semibold text-xs">Ready</span>
            </div>
          </div>
        </div>

        {/* SEGMENT 2: First-Mile Transit (Local cab to Station / Airport) */}
        <div className={`bg-white rounded-xl border p-5 shadow-xs space-y-3 ${
          firstMileBooked ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-4 h-4 text-slate-600" /> Stage 2: First-Mile Transfer to Terminal
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
              firstMileBooked
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {firstMileBooked ? 'BOOKED' : 'SUGGESTED TRANSFER'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-bold text-slate-900">
                Local Electric Cab / Auto to {outbound?.departureStation || `${origin} Station`}
              </h4>
              <p className="text-slate-500 mt-0.5">
                Distance: {firstMileDist} • Est. Time: {firstMileTime} • Approx Cost: ₹{firstMileFare}
              </p>
            </div>

            <button
              onClick={() => {
                setFirstMileBooked(!firstMileBooked);
                addToast(
                  firstMileBooked ? 'Removed cab booking from door-to-door plan' : 'Confirmed first-mile cab transfer!',
                  firstMileBooked ? 'info' : 'success'
                );
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                firstMileBooked
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              {firstMileBooked ? '✓ Cab Confirmed (₹280)' : '+ Mark Cab as Booked'}
            </button>
          </div>
        </div>

        {/* SEGMENT 3: Main Intercity Transit (Train or Flight) */}
        <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              {isFlight ? <Plane className="w-4 h-4 text-blue-600" /> : <Train className="w-4 h-4 text-blue-600" />}
              Stage 3: Main Intercity Journey
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              SELECTED TRANSIT
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {outbound?.provider || `${origin} to ${destination} Rail Service`}
              </h4>
              <p className="text-slate-500 mt-0.5">
                Route: {outbound?.departureStation || `${origin} Terminal`} ➔ {outbound?.arrivalStation || `${destination} Terminal`}
              </p>
              <p className="text-slate-400 mt-0.5">
                Schedule: {outbound?.departureTime || '07:00 AM'} to {outbound?.arrivalTime || '08:30 AM'} • PNR: {outbound?.pnr || 'CONFIRMED'}
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-slate-400 block text-[11px]">Fare Total</span>
              <span className="text-base font-bold text-slate-900">₹{mainTransitFare.toLocaleString('en-IN')}</span>
              <button
                onClick={() => setView('bookings')}
                className="mt-1 text-blue-600 hover:underline font-semibold block text-[11px]"
              >
                Change Transport ➔
              </button>
            </div>
          </div>
        </div>

        {/* SEGMENT 4: Last-Mile Transit (Station to Hotel/Destination) */}
        <div className={`bg-white rounded-xl border p-5 shadow-xs space-y-3 ${
          lastMileBooked ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-4 h-4 text-slate-600" /> Stage 4: Last-Mile Transfer to Destination
            </span>
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
              lastMileBooked
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {lastMileBooked ? 'BOOKED' : 'SUGGESTED TRANSFER'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h4 className="font-bold text-slate-900">
                Station Taxi / Metro to {destAddress}
              </h4>
              <p className="text-slate-500 mt-0.5">
                Distance: {lastMileDist} • Est. Time: {lastMileTime} • Approx Cost: ₹{lastMileFare}
              </p>
            </div>

            <button
              onClick={() => {
                setLastMileBooked(!lastMileBooked);
                addToast(
                  lastMileBooked ? 'Removed arrival taxi from plan' : 'Confirmed last-mile taxi transfer!',
                  lastMileBooked ? 'info' : 'success'
                );
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                lastMileBooked
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              {lastMileBooked ? '✓ Taxi Confirmed (₹220)' : '+ Mark Taxi as Booked'}
            </button>
          </div>
        </div>

        {/* SEGMENT 5: Final Destination */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-purple-600" /> Stage 5: Final Destination Arrival
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Base Camp / Hotel
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Destination Address / Accommodation
              </label>
              <input
                type="text"
                value={destAddress}
                onChange={(e) => setDestAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="e.g. Connaught Place, New Delhi"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Arrival Buffer</span>
                <span className="font-bold text-slate-800">
                  {outbound?.arrivalTime ? `~30 mins after ${outbound.arrivalTime}` : '09:30 AM'}
                </span>
              </div>
              <span className="text-purple-700 font-semibold text-xs">Hotel Check-in</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
