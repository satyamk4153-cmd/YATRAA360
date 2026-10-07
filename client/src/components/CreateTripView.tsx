import React, { useState } from 'react';
import { useTripStore } from '../store/tripStore';
import {
  Compass,
  Calendar,
  Users,
  Wallet,
  Train,
  Check,
  MapPin,
  UserPlus,
  Trash2
} from 'lucide-react';

interface MemberDraft {
  id: string;
  name: string;
  role: 'Organizer' | 'Co-Leader' | 'Member';
  email: string;
  phone: string;
}

export const CreateTripView: React.FC = () => {
  const { createTrip, isLoading, setView, user } = useTripStore();

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

  // Member names and co-travellers state - prompt user for real names
  const [members, setMembers] = useState<MemberDraft[]>([
    { id: 'mem_1', name: user?.name || 'You (Organizer)', role: 'Organizer', email: user?.email || '', phone: '' },
    { id: 'mem_2', name: '', role: 'Co-Leader', email: '', phone: '' },
    { id: 'mem_3', name: '', role: 'Member', email: '', phone: '' },
    { id: 'mem_4', name: '', role: 'Member', email: '', phone: '' }
  ]);

  const handleSliderChange = (count: number) => {
    const safeCount = Math.max(1, count);
    setTravellersCount(safeCount);
    setMembers(prev => {
      if (safeCount > prev.length) {
        const added: MemberDraft[] = [];
        for (let i = prev.length; i < safeCount; i++) {
          added.push({
            id: `mem_${Date.now()}_${i + 1}`,
            name: '',
            role: i === 1 ? 'Co-Leader' : 'Member',
            email: '',
            phone: ''
          });
        }
        return [...prev, ...added];
      } else if (safeCount < prev.length) {
        return prev.slice(0, safeCount);
      }
      return prev;
    });
  };

  const handleAddMember = () => {
    const nextIdx = members.length + 1;
    const newMember: MemberDraft = {
      id: `mem_${Date.now()}_${nextIdx}`,
      name: '',
      role: nextIdx === 2 ? 'Co-Leader' : 'Member',
      email: '',
      phone: ''
    };
    const updated = [...members, newMember];
    setMembers(updated);
    setTravellersCount(updated.length);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) return;
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    setTravellersCount(updated.length);
  };

  const handleMemberChange = (id: string, field: 'name' | 'email' | 'phone', value: string) => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, [field]: value } : m)));
  };

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
      travellersCount: members.length,
      budget,
      transportPreference,
      accommodationPreference,
      travelStyle,
      interests,
      members: members.map((m, idx) => ({
        name: m.name.trim() || (idx === 0 ? (user?.name || 'You (Organizer)') : `Traveller ${idx + 1}`),
        role: m.role,
        email: m.email.trim() || undefined,
        phone: m.phone.trim() || undefined
      }))
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
                onChange={(e) => handleSliderChange(Number(e.target.value))}
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

          {/* Member Names & Co-Travellers Input Form */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Traveller Names & Contact ({members.length})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Add member names so they appear in bookings, tickets, daily schedule, and group expense splits.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddMember}
                className="self-start sm:self-auto px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Traveller</span>
              </button>
            </div>

            {members.length > 1 && (
              <div className="mb-3.5 p-3 rounded-lg bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-950">Who is travelling with you? </span>
                  <span>Please type the names of all companions below so railway &amp; airline tickets, hotel rooms, and expense splits are generated under their names.</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map((mem, idx) => (
                <div
                  key={mem.id}
                  className={`p-3.5 rounded-lg border transition-all space-y-2 ${
                    idx > 0 && !mem.name.trim()
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <span className={`w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold ${
                        idx === 0 ? 'bg-blue-600' : 'bg-indigo-600'
                      }`}>
                        {idx + 1}
                      </span>
                      {idx === 0 ? 'Lead Organizer (You)' : `Traveller ${idx + 1}`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        mem.role === 'Organizer'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : mem.role === 'Co-Leader'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {mem.role}
                      </span>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(mem.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                          title="Remove traveller"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <input
                        type="text"
                        placeholder={idx === 0 ? "Your Full Name (Organizer)" : `Enter Traveller ${idx + 1} Full Name (e.g. Priya, Rohit...)`}
                        value={mem.name}
                        onChange={(e) => handleMemberChange(mem.id, 'name', e.target.value)}
                        className={`w-full px-2.5 py-1.5 rounded-md bg-white border text-xs focus:outline-none transition-colors ${
                          idx > 0 && !mem.name.trim()
                            ? 'border-amber-300 focus:border-blue-500 text-slate-900 placeholder:text-amber-600/70'
                            : 'border-slate-300 focus:border-blue-500 text-slate-900'
                        }`}
                      />
                      {idx > 0 && !mem.name.trim() && (
                        <p className="text-[10px] text-amber-700 font-medium mt-1">
                          Type companion name to personalise tickets and expenses
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={mem.email}
                        onChange={(e) => handleMemberChange(mem.id, 'email', e.target.value)}
                        className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-slate-800 text-[11px] focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={mem.phone}
                        onChange={(e) => handleMemberChange(mem.id, 'phone', e.target.value)}
                        className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-slate-800 text-[11px] focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
