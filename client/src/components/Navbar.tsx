import React, { useState } from 'react';
import { useTripStore, AppView } from '../store/tripStore';
import {
  Compass,
  Train,
  MapPin,
  Wallet,
  PlusCircle,
  Menu,
  X,
  LogOut,
  User as UserIcon
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentTrip,
    activeView,
    setView,
    user,
    logout,
    searchOrigin,
    searchDestination
  } = useTripStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const metrics = currentTrip?.metrics;
  const origin = searchOrigin || currentTrip?.trip.origin || 'Meerut';
  const destination = searchDestination || currentTrip?.trip.destination || 'New Delhi';

  const handleNav = (view: AppView) => {
    setView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNav(currentTrip ? 'dashboard' : 'create-trip')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                YATRAA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                Rail &amp; Travel
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              Plan • Explore • Adapt • Return
            </p>
          </div>
        </div>

        {/* Live Trip Status Indicator (when trip is active) */}
        {currentTrip && (
          <div className="hidden md:flex items-center gap-3 bg-slate-50 py-1.5 px-3.5 rounded-full border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                {origin} ➔ {destination}
              </span>
            </div>

            <div className="h-3 w-px bg-slate-300" />

            <button
              onClick={() => handleNav('bookings')}
              className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Search Trains & Flights"
            >
              <Train className="w-3.5 h-3.5 text-indigo-600" />
              <span>Trains &amp; Flights</span>
            </button>

            <div className="h-3 w-px bg-slate-300" />

            <button
              onClick={() => handleNav('map')}
              className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Interactive Road & Rail Map"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Map</span>
            </button>

            {metrics && (
              <>
                <div className="h-3 w-px bg-slate-300" />
                <button
                  onClick={() => handleNav('budget')}
                  className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                  title="View Reactive Budget"
                >
                  <Wallet className="w-3.5 h-3.5 text-amber-600" />
                  <span>₹{metrics.remainingBudget.toLocaleString('en-IN')} left</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Navigation CTAs & User Menu */}
        <div className="flex items-center gap-2">
          {currentTrip && (
            <button
              onClick={() => handleNav('bookings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold hidden sm:flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeView === 'bookings'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Train className="w-3.5 h-3.5" />
              <span>Bookings</span>
            </button>
          )}

          <button
            onClick={() => handleNav('create-trip')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">New Plan</span>
          </button>

          {/* User profile & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 p-4 space-y-2 text-xs font-medium">
          <button
            onClick={() => handleNav('dashboard')}
            className="w-full text-left py-2 px-3 rounded hover:bg-slate-100"
          >
            Dashboard
          </button>
          <button
            onClick={() => handleNav('bookings')}
            className="w-full text-left py-2 px-3 rounded hover:bg-slate-100"
          >
            Trains &amp; Flights Search
          </button>
          <button
            onClick={() => handleNav('map')}
            className="w-full text-left py-2 px-3 rounded hover:bg-slate-100"
          >
            Interactive Map
          </button>
          <button
            onClick={() => handleNav('door-to-door')}
            className="w-full text-left py-2 px-3 rounded hover:bg-slate-100"
          >
            Door-to-Door Journey
          </button>
          <button
            onClick={() => handleNav('budget')}
            className="w-full text-left py-2 px-3 rounded hover:bg-slate-100"
          >
            Reactive Budget
          </button>
          <button
            onClick={() => handleNav('group')}
            className="w-full text-left py-2 px-3 rounded hover:bg-slate-100"
          >
            Group &amp; Expense Settlement
          </button>
          {user && (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded hover:bg-rose-50 text-rose-600 font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out ({user.name})</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
