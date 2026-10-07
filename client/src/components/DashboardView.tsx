import React, { useState, useEffect } from 'react';
import { useTripStore } from '../store/tripStore';
import { api } from '../services/api';
import {
  Wallet,
  Users,
  CloudSun,
  Calendar,
  Compass,
  ArrowRight,
  AlertTriangle,
  Train,
  Bot,
  Plus,
  Gem,
  Sparkles
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentTrip,
    setView,
    updateTravellersCount,
    updateBudget,
    addExpense,
    updateTransportTiming,
    simulateWeather
  } = useTripStore();

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('Shopping');

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [newBudgetVal, setNewBudgetVal] = useState(currentTrip?.trip.budget || 40000);

  // Live Open-Meteo Telemetry State
  const [liveWeather, setLiveWeather] = useState<{
    temperature: number;
    condition: string;
    precipitationProbability: number;
    windSpeed: number;
    description: string;
    isLive: boolean;
  } | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const dest = currentTrip?.trip.destination;
    if (!dest) return;

    const fetchLive = async () => {
      try {
        const geo = await api.geocodeLocation(dest);
        if (isCancelled) return;
        const lat = geo?.latitude ?? 28.6139;
        const lng = geo?.longitude ?? 77.2090;
        const forecast = await api.getWeatherForecast({ lat, lng, destination: dest });
        if (isCancelled) return;
        if (forecast?.current) {
          setLiveWeather({
            temperature: forecast.current.temperature,
            condition: forecast.current.condition || 'Sunny',
            precipitationProbability: forecast.daily?.[0]?.precipitationProbability ?? 5,
            windSpeed: forecast.current.windSpeed ?? 10,
            description: forecast.current.description || 'Pleasant weather',
            isLive: forecast.isLive ?? true
          });
        }
      } catch {
        // Fallback to simulated/store snapshot
      }
    };

    fetchLive();
    return () => {
      isCancelled = true;
    };
  }, [currentTrip?.trip.destination]);

  if (!currentTrip) return null;

  const { trip, metrics, transports, accommodations, itinerary, weather } = currentTrip;
  const outboundTransport = transports.find(t => !t.isReturn) || transports[0];
  const returnTransport = transports.find(t => t.isReturn) || transports[1];
  const nextActivity = itinerary[0]?.items[0];

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;
    await addExpense({
      title: expTitle,
      amount: Number(expAmount),
      category: expCategory,
      paidByMemberId: currentTrip.members[0]?.id
    });
    setExpTitle('');
    setExpAmount('');
    setExpenseModalOpen(false);
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBudget(Number(newBudgetVal));
    setBudgetModalOpen(false);
  };

  const budgetPct = Math.min(100, Math.round((metrics.totalSpent / (metrics.totalBudget || 1)) * 100));

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      
      {/* Active Trip Header */}
      <div className="bg-blue-700 text-white p-6 sm:p-7 rounded-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                {trip.status} Trip
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white/90 text-[11px] font-semibold">
                {trip.travelStyle} Style
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {trip.origin} → {trip.destination}
            </h1>
            
            <p className="text-sm text-blue-100 mt-1 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {trip.startDate} – {trip.endDate} ({itinerary.length} days)</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {trip.travellersCount} travellers</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setExpenseModalOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Expense</span>
            </button>
            <button
              onClick={() => setView('copilot')}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/30 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Yatra Copilot</span>
            </button>
            <button
              onClick={() => setView('what-if')}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/30 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>What-If Sandbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spending Alerts */}
      {metrics.spendingAlerts && metrics.spendingAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-amber-800">Budget Alert</p>
            <p className="mt-0.5 text-amber-700">{metrics.spendingAlerts[0]}</p>
          </div>
          <button
            onClick={() => setView('budget')}
            className="px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold text-[11px] shrink-0 border border-amber-200 cursor-pointer"
          >
            Review Budget
          </button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Budget Card */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-amber-600" /> Total Budget</span>
            <button 
              onClick={() => setBudgetModalOpen(true)}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
            >
              Edit
            </button>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ₹{metrics.totalBudget.toLocaleString('en-IN')}
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Spent: ₹{metrics.totalSpent.toLocaleString('en-IN')}</span>
              <span className={`font-semibold ${metrics.remainingBudget > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                ₹{metrics.remainingBudget.toLocaleString('en-IN')} left
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  metrics.budgetHealthStatus === 'Exceeded'
                    ? 'bg-red-500'
                    : metrics.budgetHealthStatus === 'Warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Travellers Card */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-purple-600" /> Travellers</span>
            <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
              Reactive
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{trip.travellersCount}</span>
            <span className="text-xs text-slate-500">people</span>
          </div>
          
          <div className="mt-3 flex items-center gap-1.5">
            {[2, 4, 6, 8].map((count) => (
              <button
                key={count}
                onClick={() => updateTravellersCount(count)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  trip.travellersCount === count
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            Auto-scales {accommodations[0]?.roomCount || Math.ceil(trip.travellersCount / 2)} hotel rooms
          </p>
        </div>

        {/* Transport Card */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-medium flex items-center gap-1.5"><Train className="w-3.5 h-3.5 text-blue-600" /> Outbound</span>
            <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              {outboundTransport?.type}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {outboundTransport?.provider}
          </div>
          
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Departure</span>
              <span className="font-bold text-slate-800">{outboundTransport?.departureTime}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Arrival</span>
              <span className="font-bold text-slate-800">{outboundTransport?.arrivalTime}</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
            <button
              onClick={() => updateTransportTiming(outboundTransport.id, '07:00 AM', '01:30 PM')}
              className={`flex-1 py-1 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                outboundTransport.departureTime === '07:00 AM'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              07:00 AM
            </button>
            <button
              onClick={() => updateTransportTiming(outboundTransport.id, '10:00 AM', '04:30 PM')}
              className={`flex-1 py-1 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                outboundTransport.departureTime === '10:00 AM'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              10:00 AM
            </button>
          </div>
        </div>

        {/* Weather Card */}
        {(() => {
          const fallbackWeather = weather?.[0] || weather?.[1] || {
            condition: 'Sunny',
            tempC: 22,
            precipitationChance: 5,
            alertLevel: 'None'
          };
          const displayTemp = liveWeather ? liveWeather.temperature : (fallbackWeather.tempC ?? 22);
          const displayCond = liveWeather ? liveWeather.condition : (fallbackWeather.condition || 'Sunny');
          const displayRain = liveWeather ? liveWeather.precipitationProbability : (fallbackWeather.precipitationChance ?? 5);
          const displayDesc = liveWeather ? liveWeather.description : 'Pleasant travel weather';

          return (
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-medium flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-sky-600" />
                  {trip.destination} Weather
                </span>
                {liveWeather?.isLive ? (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Open-Meteo
                  </span>
                ) : (
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                    fallbackWeather.alertLevel === 'Severe' || fallbackWeather.alertLevel === 'Warning'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : fallbackWeather.alertLevel === 'Advisory'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {fallbackWeather.alertLevel || 'None'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div>
                  <span className="text-lg font-bold text-slate-900">{displayCond}</span>
                  <span className="text-xs text-slate-500 block">
                    {displayTemp}°C • {displayRain}% rain • {displayDesc}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5">
                <button
                  onClick={() => simulateWeather(1, 'Sunny', false)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    displayCond === 'Sunny'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ☀️ Sunny
                </button>
                <button
                  onClick={() => simulateWeather(1, 'Heavy Rain', true)}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    displayCond === 'Heavy Rain'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  🌧️ Rain
                </button>
              </div>
            </div>
          );
        })()}

      </div>

      {/* Door-to-Door + Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Door-to-Door Journey Steps */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-700" />
              <h3 className="font-bold text-slate-900 text-sm">Door-to-Door Journey</h3>
            </div>
            <button
              onClick={() => setView('door-to-door')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Path</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">🚕</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Doorstep Cab Pick-up</h4>
                  <p className="text-[11px] text-slate-500">{trip.origin} Home → Railway Station (05:45 AM)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Confirmed
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">🚆</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{outboundTransport.provider}</h4>
                  <p className="text-[11px] text-slate-500">{outboundTransport.departureStation} ({outboundTransport.departureTime}) → {outboundTransport.arrivalStation} ({outboundTransport.arrivalTime})</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200">
                {outboundTransport.seats}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">🏨</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{accommodations[0]?.name}</h4>
                  <p className="text-[11px] text-slate-500">{accommodations[0]?.roomCount} rooms • Check-in: {accommodations[0]?.checkIn}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200">
                {trip.travellersCount} Pax
              </span>
            </div>

            {nextActivity && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🗺️</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{nextActivity.title}</h4>
                    <p className="text-[11px] text-slate-500">Day 1 • {nextActivity.startTime} – {nextActivity.endTime}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold border border-teal-200">
                  {nextActivity.category}
                </span>
              </div>
            )}

            {returnTransport && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🔄</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Return: {returnTransport.provider}</h4>
                    <p className="text-[11px] text-slate-500">{returnTransport.departureStation} ({returnTransport.departureTime}) → {returnTransport.arrivalStation} ({returnTransport.arrivalTime})</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold border border-slate-300">
                  {returnTransport.seats || 'Reserved'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links Sidebar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-700" />
            Quick Actions
          </h3>
          
          <p className="text-xs text-slate-500 leading-relaxed p-3 rounded-lg bg-slate-50 border border-slate-200">
            Live trip: <span className="font-semibold text-slate-800">{trip.travellersCount} travellers</span>, <span className="font-semibold text-emerald-700">₹{metrics.remainingBudget.toLocaleString('en-IN')} remaining</span>, {weather[0]?.condition} weather.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => setView('bookings')}
              className="w-full py-2.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Train className="w-3.5 h-3.5" />
              <span>Search Trains & Flights</span>
            </button>
            <button
              onClick={() => setView('itinerary')}
              className="w-full py-2.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>View Itinerary</span>
            </button>
            <button
              onClick={() => setView('budget')}
              className="w-full py-2.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Manage Budget</span>
            </button>
            <button
              onClick={() => setView('hidden-gems')}
              className="w-full py-2.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Gem className="w-3.5 h-3.5" />
              <span>Explore Hidden Gems</span>
            </button>
            <button
              onClick={() => setView('group')}
              className="w-full py-2.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Group &amp; Expense Splits</span>
            </button>
          </div>
        </div>
      </div>

      {/* Log Expense Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Log Group Expense</h3>
              <button onClick={() => setExpenseModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none">×</button>
            </div>
            <p className="text-xs text-slate-500">
              Adding this expense will recalculate total spent, remaining balance, and group split balances instantly.
            </p>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lunch at restaurant, Cab fare, Museum entry"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="500"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="Shopping">Shopping</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Activities">Activities</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white cursor-pointer transition-colors"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {budgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Adjust Trip Budget</h3>
              <button onClick={() => setBudgetModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none">×</button>
            </div>
            <p className="text-xs text-slate-500">
              Modifying the total budget instantly adjusts category allocations, per-person projections, and spending warnings.
            </p>

            <form onSubmit={handleBudgetSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Total Trip Budget (₹)</label>
                <input
                  type="number"
                  required
                  min="5000"
                  step="1000"
                  value={newBudgetVal}
                  onChange={(e) => setNewBudgetVal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBudgetModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white cursor-pointer transition-colors"
                >
                  Save & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
