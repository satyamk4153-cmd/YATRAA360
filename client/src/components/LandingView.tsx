import React from 'react';
import { useTripStore } from '../store/tripStore';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Users,
  Wallet,
  CloudRain,
  Train,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setView, loadDemoTrip, isLoading } = useTripStore();

  const features = [
    {
      icon: Train,
      title: 'Train & Flight Search',
      desc: 'Search Indian Railways schedules, compare Vande Bharat, Rajdhani, Shatabdi and more. Compare with flights and book directly on official portals.',
      color: 'text-blue-700',
      bg: 'bg-blue-50'
    },
    {
      icon: Compass,
      title: 'Door-to-Door Journey',
      desc: 'Complete journey from your home doorstep — cab to station, train, hotel check-in, daily activities, and return leg all in one place.',
      color: 'text-indigo-700',
      bg: 'bg-indigo-50'
    },
    {
      icon: RefreshCw,
      title: 'Reactive Planning',
      desc: 'Change travellers, adjust budget, switch transport — everything recalculates instantly. Hotel rooms, expense splits, and itinerary all update together.',
      color: 'text-teal-700',
      bg: 'bg-teal-50'
    },
    {
      icon: CloudRain,
      title: 'Weather-Aware Itinerary',
      desc: 'Monitors weather forecasts and suggests sheltered indoor alternatives when conditions change, without disrupting your manually set preferences.',
      color: 'text-sky-700',
      bg: 'bg-sky-50'
    },
    {
      icon: Wallet,
      title: 'Group Budget & Splits',
      desc: 'Track expenses, split costs fairly across group members Splitwise-style, and get alerts when spending approaches your budget limit.',
      color: 'text-amber-700',
      bg: 'bg-amber-50'
    },
    {
      icon: MapPin,
      title: 'OSRM Road & Route Geometry',
      desc: 'Real road routing with accurate highway geometries and Leaflet bounds. Integrates doorstep cabs with intercity train corridors.',
      color: 'text-rose-700',
      bg: 'bg-rose-50'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Hero Section */}
      <div className="pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
          <Train className="w-3.5 h-3.5" />
          <span>India's Complete Travel & Railway Planning App</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Plan your journey.{' '}
          <span className="text-blue-700">
            From doorstep to destination.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Search trains and flights, plan your full itinerary, manage group expenses and stay informed about weather — all in one connected app for Indian travel.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={loadDemoTrip}
            disabled={isLoading}
            className="px-6 py-3 rounded-lg font-semibold text-sm bg-blue-700 hover:bg-blue-800 text-white shadow-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Loading Demo Trip...' : 'Try Demo Trip'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setView('create-trip')}
            className="px-6 py-3 rounded-lg font-semibold text-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Plan New Trip</span>
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Meerut → New Delhi demo included</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Real Indian Railways train schedules</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No sign-up required</span>
        </div>
      </div>

      {/* Journey Steps Preview */}
      <div className="py-8 border-t border-slate-200">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Complete journey flow</p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center">
          {[
            { icon: '🏠', label: 'Home', sub: 'Doorstep cab' },
            { icon: '🚉', label: 'Station', sub: 'Check-in' },
            { icon: '🚆', label: 'Train', sub: 'Reserved seat' },
            { icon: '🏨', label: 'Hotel', sub: 'Auto-booked' },
            { icon: '🗺️', label: 'Sightseeing', sub: 'Day activities' },
            { icon: '🍽️', label: 'Dining', sub: 'Curated spots' },
            { icon: '🚄', label: 'Return', sub: 'Confirmed leg' },
            { icon: '🏡', label: 'Home', sub: 'Safe return' }
          ].map((step, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center gap-1 hover:border-blue-300 hover:shadow-sm transition-all">
              <span className="text-xl">{step.icon}</span>
              <span className="text-[11px] font-bold text-slate-700">{step.label}</span>
              <span className="text-[10px] text-slate-400 hidden sm:block">{step.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-12 border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Everything you need for a well-planned trip
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Built specifically for Indian travel — trains, local cabs, regional weather, and group coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className={`w-9 h-9 rounded-lg ${f.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4.5 h-4.5 ${f.color}`} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="py-12 border-t border-slate-200 text-center">
        <div className="p-8 sm:p-10 rounded-2xl bg-slate-50 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            Ready to plan your next journey?
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">
            Load the demo trip to explore all features, or start planning your own journey right away.
          </p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <button
              onClick={loadDemoTrip}
              disabled={isLoading}
              className="px-6 py-3 rounded-lg font-semibold text-sm bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <span>{isLoading ? 'Loading...' : 'Load Demo Trip'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('create-trip')}
              className="px-6 py-3 rounded-lg font-semibold text-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 cursor-pointer transition-colors"
            >
              Plan Custom Trip
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
