import React, { useState } from 'react';
import { useTripStore } from '../store/tripStore';
import {
  Compass,
  Calendar,
  Users,
  Wallet,
  Train,
  Check,
  MapPin
} from 'lucide-react';

export const CreateTripView: React.FC = () => {
  const { createTrip, isLoading, setView } = useTripStore();

  const [origin, setOrigin] = useState('Meerut');
  const [destination, setDestination] = useState('Jaipur');
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-18');
  const [travellersCount, setTravellersCount] = useState(4);
  const [budget, setBudget] = useState(30000);
  const [transportPreference, setTransportPreference] = useState('Train');
  const [accommodationPreference, setAccommodationPreference] = useState('Boutique Hotel');
  const [travelStyle, setTravelStyle] = useState('Balanced');
  const [interests, setInterests] = useState<string[]>(['History', 'Food', 'Hidden Places']);

  const interestOptions = [
    'History',
    'Food',
    'Hidden Places',
    'Nature Trails',
    'Photography',
    'Architecture',
    'Culture & Arts',
    'Adventure'
  ];

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTrip({
      origin,
      destination,
      startDate,
      endDate,
      travellersCount,
      budget,
      transportPreference,
      accommodationPreference,
      travelStyle,
      interests
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-5 h-5 text-blue-700" />
          <h1 className="text-2xl font-extrabold text-slate-900">
            Plan New Journey
          </h1>
        </div>
        <p className="text-slate-500 text-sm">
          Fill in your journey details and the planning engine will generate a complete door-to-door itinerary with transport, hotels, and activities.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        
        {/* Origin & Destination */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Route
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                From (Origin)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Meerut, New Delhi, Mumbai"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                To (Destination)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Jaipur, Manali, Goa, Rishikesh"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Travel Dates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Departure Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Return Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />
            </div>
          </div>
        </div>

        {/* Travellers & Budget */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Group & Budget
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Number of Travellers
                </label>
                <span className="text-xs font-bold text-blue-700">{travellersCount} people</span>
              </div>
              <input
                type="range"
                min="1"
                max="16"
                value={travellersCount}
                onChange={(e) => setTravellersCount(Number(e.target.value))}
                className="w-full accent-blue-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Solo (1)</span>
                <span>Group (4)</span>
                <span>Large (16)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Total Budget (₹)
                </label>
                <span className="text-xs font-bold text-emerald-700">₹{budget.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="150000"
                step="2500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹5,000</span>
                <span>₹50,000</span>
                <span>₹1,50,000+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Train className="w-4 h-4 text-blue-600" />
            Preferences
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Transport
              </label>
              <select
                value={transportPreference}
                onChange={(e) => setTransportPreference(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="Train">Train (Vande Bharat / Express)</option>
                <option value="Flight">Flight (Fastest)</option>
                <option value="Bus">Luxury Volvo Bus</option>
                <option value="Cab">Private Intercity Cab</option>
                <option value="Self-Drive">Self-Drive</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Accommodation
              </label>
              <select
                value={accommodationPreference}
                onChange={(e) => setAccommodationPreference(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="Boutique Hotel">Boutique Hotel</option>
                <option value="Resort">Mountain Resort</option>
                <option value="Homestay">Heritage Homestay</option>
                <option value="Hostel">Backpacker Hostel</option>
                <option value="Budget Hotel">Budget Hotel</option>
                <option value="Luxury Hotel">5-Star Luxury</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1.5">
                Travel Style
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="Balanced">Balanced (Comfort + Exploration)</option>
                <option value="Relaxed">Relaxed (Slow & Leisurely)</option>
                <option value="Adventure">Adventure & Hiking</option>
                <option value="Cultural">Deep Cultural & Heritage</option>
                <option value="Budget">Budget Backpacking</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="text-xs font-medium text-slate-700 block mb-2">
            Interests & Highlights
          </label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((opt) => {
              const selected = interests.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggleInterest(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                    selected
                      ? 'bg-blue-700 text-white border-blue-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-700'
                  }`}
                >
                  {selected && <Check className="w-3 h-3" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setView('landing')}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 rounded-lg font-bold text-sm bg-blue-700 hover:bg-blue-800 text-white shadow-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Compass className="w-4 h-4" />
            <span>{isLoading ? 'Planning your journey...' : 'Create My Journey'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
