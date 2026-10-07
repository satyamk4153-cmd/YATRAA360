import React from 'react';
import { useTripStore, AppView } from '../store/tripStore';
import {
  LayoutDashboard,
  CalendarDays,
  DoorClosed,
  MapPin,
  Users,
  PiggyBank,
  Sparkles,
  CloudSun,
  Gem,
  Bot,
  History,
  Train
} from 'lucide-react';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ElementType;
  badge?: string;
  color?: string;
}

export const Sidebar: React.FC = () => {
  const { activeView, setView, currentTrip, searchOrigin, searchDestination } = useTripStore();

  if (!currentTrip || activeView === 'landing' || activeView === 'create-trip' || activeView === 'auth') {
    return null;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Trains & Flights', icon: Train, badge: 'Search' },
    { id: 'map', label: 'Interactive Map', icon: MapPin },
    { id: 'door-to-door', label: 'Door-to-Door', icon: DoorClosed },
    { id: 'itinerary', label: 'Daily Itinerary', icon: CalendarDays },
    { id: 'budget', label: 'Reactive Budget', icon: PiggyBank, color: 'text-amber-600' },
    { id: 'group', label: 'Group & Splits', icon: Users, badge: `${currentTrip.members?.length || 0}` },
    { id: 'what-if', label: 'What-If Sandbox', icon: Sparkles, color: 'text-purple-600' },
    { id: 'weather', label: 'Weather Center', icon: CloudSun, color: 'text-sky-600' },
    { id: 'hidden-gems', label: 'Hidden Gems', icon: Gem, color: 'text-emerald-600' },
    { id: 'copilot', label: 'Yatra Copilot', icon: Bot, color: 'text-blue-600' },
    { id: 'history', label: 'Trip History', icon: History }
  ];

  const origin = searchOrigin || currentTrip.trip.origin;
  const destination = searchDestination || currentTrip.trip.destination;

  return (
    <aside className="w-60 shrink-0 hidden lg:block bg-white border-r border-slate-200 p-3 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      {/* Active Journey Card */}
      <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
          Active Journey
        </span>
        <h3 className="text-xs font-bold text-slate-800 truncate">
          {origin} ➔ {destination}
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {currentTrip.trip.startDate}
        </p>
        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">{currentTrip.trip.travellersCount} Travellers</span>
          <span className="font-bold text-slate-800">₹{currentTrip.trip.budget.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-800 font-bold border-l-2 border-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : item.color || 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-blue-200 text-blue-900'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
