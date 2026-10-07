import React, { useState, useEffect } from 'react';
import { useTripStore } from '../store/tripStore';
import { api } from '../services/api';
import { WeatherForecast, WeatherCondition, DailyForecastDay } from '../types';
import {
  CloudSun,
  CloudRain,
  Sun,
  CloudLightning,
  Snowflake,
  AlertTriangle,
  Sparkles,
  Wind,
  Droplets,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  Radio,
  SlidersHorizontal
} from 'lucide-react';

export const WeatherCenterView: React.FC = () => {
  const { currentTrip, searchDestination, simulateWeather } = useTripStore();
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Live Weather API State
  const [liveWeather, setLiveWeather] = useState<WeatherForecast | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const destinationName = searchDestination || currentTrip?.trip.destination || 'New Delhi';

  useEffect(() => {
    let isCancelled = false;
    setIsLiveLoading(true);
    setLiveError(null);

    const fetchLiveForecast = async () => {
      try {
        // Resolve destination coordinates first
        const geo = await api.geocodeLocation(destinationName);
        if (isCancelled) return;

        const lat = geo?.latitude ?? 28.6139;
        const lng = geo?.longitude ?? 77.2090;

        const forecast = await api.getWeatherForecast({
          lat,
          lng,
          destination: destinationName,
          startDate: currentTrip?.trip.startDate,
          endDate: currentTrip?.trip.endDate
        });

        if (isCancelled) return;
        setLiveWeather(forecast);
        setIsLiveLoading(false);
      } catch (err: unknown) {
        if (isCancelled) return;
        const msg = err instanceof Error ? err.message : 'Live weather is temporarily unavailable.';
        setLiveError(msg);
        setIsLiveLoading(false);
      }
    };

    fetchLiveForecast();

    return () => {
      isCancelled = true;
    };
  }, [destinationName, currentTrip?.trip.startDate, currentTrip?.trip.endDate]);

  if (!currentTrip) return null;

  const { itinerary } = currentTrip;
  const simulatedWeatherList = (currentTrip.weather && currentTrip.weather.length > 0)
    ? currentTrip.weather
    : (itinerary || []).map(d => ({
        id: `w_snap_${d.dayNumber}`,
        tripId: currentTrip.trip.id,
        date: `Day ${d.dayNumber} (${d.date})`,
        condition: d.weatherForecast?.condition || 'Sunny',
        tempC: d.weatherForecast?.tempC || 25,
        precipitationChance: d.weatherForecast?.precipitationChance || 10,
        windSpeed: '12 km/h NW',
        alertLevel: d.weatherForecast?.alertLevel || 'None',
        summary: d.weatherForecast?.summary || 'Pleasant weather.'
      }));

  const targetItineraryDay =
    itinerary.find((d) => d.dayNumber === selectedDay) || itinerary[0];
  const targetSimulatedWeather =
    simulatedWeatherList.find(
      (w) => w?.date?.includes(`Day ${selectedDay}`) || w?.id?.includes(`d${selectedDay}`)
    ) || simulatedWeatherList[0];

  const outdoorItems = targetItineraryDay?.items?.filter((i) => i.isWeatherSensitive) || [];

  const handleScenarioClick = async (cond: WeatherCondition, autoApply: boolean = true) => {
    await simulateWeather(selectedDay, cond, autoApply);
  };

  const getWeatherIcon = (cond?: string) => {
    const c = (cond || '').toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-5 h-5 text-sky-600" />;
    if (c.includes('thunder') || c.includes('storm')) return <CloudLightning className="w-5 h-5 text-purple-600" />;
    if (c.includes('snow')) return <Snowflake className="w-5 h-5 text-cyan-600" />;
    if (c.includes('clear') || c.includes('sunny')) return <Sun className="w-5 h-5 text-amber-500" />;
    return <CloudSun className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 animate-pulse text-sky-600" /> Live Feed &amp; What-If
            </span>
            <span className="text-2xs text-slate-500">Destination: {destinationName}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Weather Intelligence Center</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Live Open-Meteo meteorological forecasts with separate sandbox simulation for testing wet-weather indoor contingency plans.
          </p>
        </div>
      </div>

      {/* SECTION 1: REAL LIVE WEATHER (Open-Meteo API) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Live Weather Forecast ({destinationName})
            </h2>
            <span className="text-3xs uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified Open-Meteo API
            </span>
          </div>
          {liveWeather && (
            <span className="text-2xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated: {new Date(liveWeather.updatedAt || (liveWeather.current as any)?.updatedAt || Date.now()).toLocaleTimeString()}
            </span>
          )}
        </div>

        {isLiveLoading ? (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
            <span className="text-xs">Fetching meteorological telemetry from Open-Meteo...</span>
          </div>
        ) : liveError ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Live weather is temporarily unavailable.</strong>
              <p className="text-2xs mt-0.5 text-amber-700">{liveError}</p>
            </div>
          </div>
        ) : liveWeather ? (
          <div className="space-y-4">
            {/* Current Conditions Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 via-white to-slate-50 border border-sky-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white border border-sky-200 shadow-xs">
                  {getWeatherIcon(liveWeather.current.condition || liveWeather.current.description || (liveWeather.current as any).weatherDescription)}
                </div>
                <div>
                  <div className="text-xs text-sky-700 font-semibold uppercase tracking-wider">
                    Current Temperature
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {liveWeather.current.temperature}°C
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {liveWeather.current.description || (liveWeather.current as any).weatherDescription || liveWeather.current.condition || 'Clear'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-slate-600 border-t md:border-t-0 pt-2 md:pt-0">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-3xs text-slate-400 block uppercase">Wind Speed</span>
                    <span className="font-semibold">{liveWeather.current.windSpeed} km/h</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  <div>
                    <span className="text-3xs text-slate-400 block uppercase">Rain Chance</span>
                    <span className="font-semibold">{liveWeather.daily[0]?.precipitationProbability ?? 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Forecast Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {liveWeather.daily.slice(0, 7).map((d: DailyForecastDay) => {
                const maxT = d.temperatureMax ?? (d as any).tempMax ?? '--';
                const minT = d.temperatureMin ?? (d as any).tempMin ?? '--';
                const condDesc = d.description || (d as any).weatherDescription || d.condition || 'Clear';
                return (
                  <div
                    key={d.date}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center hover:border-slate-300 transition-colors"
                  >
                    <span className="text-3xs text-slate-500 font-medium block">
                      {new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                    </span>
                    <div className="my-1.5 flex justify-center">
                      {getWeatherIcon(d.condition || condDesc)}
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {maxT}° / {minT}°
                    </div>
                    <span className="text-3xs text-sky-600 block mt-0.5">
                      {d.precipitationProbability}% rain
                    </span>
                    <span className="text-3xs text-slate-400 block truncate mt-0.5" title={condDesc}>
                      {condDesc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {/* SECTION 2: SIMULATION & WHAT-IF CONTINGENCY PLANNER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                What-If Weather Simulation (Contingency Sandbox)
              </h2>
            </div>
            <p className="text-2xs text-slate-500 mt-0.5">
              Simulate adverse weather scenarios to trigger indoor itinerary alternatives without altering live telemetry.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {simulatedWeatherList.map((_, idx) => (
              <button
                key={`day_btn_${idx + 1}`}
                type="button"
                onClick={() => setSelectedDay(idx + 1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  selectedDay === idx + 1
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Day {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Simulator controls */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-2xs font-semibold text-slate-600 uppercase tracking-wider block">
              Simulate condition for Day {selectedDay}:
            </span>
            <span className="text-xs text-slate-800 font-medium">
              Current Simulated State: <strong>{targetSimulatedWeather?.condition}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['Sunny', 'Heavy Rain', 'Thunderstorm', 'Snow'] as WeatherCondition[]).map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => handleScenarioClick(cond, true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                  targetSimulatedWeather?.condition === cond
                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cond === 'Sunny' ? '☀️' : cond === 'Heavy Rain' ? '🌧️' : cond === 'Thunderstorm' ? '⛈️' : '❄️'} {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Outdoor Activities Risk Evaluator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Day {selectedDay} Weather-Sensitive Activities ({outdoorItems.length})
            </span>
            <span className="text-slate-500">
              Risk Level:{' '}
              <strong
                className={
                  targetSimulatedWeather?.alertLevel === 'Warning' ? 'text-amber-600' : 'text-emerald-600'
                }
              >
                {targetSimulatedWeather?.alertLevel || 'Normal'}
              </strong>
            </span>
          </div>

          {outdoorItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
              No weather-sensitive outdoor activities scheduled for Day {selectedDay}.
            </div>
          ) : (
            <div className="space-y-3">
              {outdoorItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    targetSimulatedWeather?.alertLevel === 'Warning'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <span className="px-2 py-0.5 rounded text-3xs font-bold bg-sky-100 text-sky-700">
                          Outdoor
                        </span>
                        {targetSimulatedWeather?.alertLevel === 'Warning' && (
                          <span className="px-2 py-0.5 rounded text-3xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" /> Rain Hazard
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{item.description}</p>
                      <span className="text-2xs text-slate-400 mt-1 block">
                        {item.startTime} – {item.endTime} • {item.location}
                      </span>
                    </div>

                    {item.weatherAlternative && (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs max-w-sm space-y-1 shadow-2xs">
                        <span className="font-bold text-indigo-700 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Indoor Contingency
                        </span>
                        <p className="font-semibold text-slate-800">{item.weatherAlternative.title}</p>
                        <p className="text-2xs text-slate-500">{item.weatherAlternative.indoorReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
