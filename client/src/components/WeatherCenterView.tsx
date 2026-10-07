import React, { useState } from 'react';
import { useTripStore } from '../store/tripStore';
import {
  CloudSun,
  CloudRain,
  Sun,
  CloudLightning,
  Snowflake,
  AlertTriangle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { WeatherCondition } from '../types';

export const WeatherCenterView: React.FC = () => {
  const { currentTrip, simulateWeather } = useTripStore();
  const [selectedDay, setSelectedDay] = useState<number>(2);

  if (!currentTrip) return null;

  const { weather, itinerary } = currentTrip;
  const targetItineraryDay = itinerary.find(d => d.dayNumber === selectedDay) || itinerary[1] || itinerary[0];
  const targetWeather = weather.find(w => w.date.includes(`Day ${selectedDay}`) || w.id.includes(`d${selectedDay}`)) || weather[1] || weather[0];

  const outdoorItems = targetItineraryDay?.items.filter(i => i.isWeatherSensitive) || [];

  const handleScenarioClick = async (cond: WeatherCondition, autoApply: boolean = true) => {
    await simulateWeather(selectedDay, cond, autoApply);
  };

  const getWeatherIcon = (cond: WeatherCondition) => {
    switch (cond) {
      case 'Sunny': return <Sun className="w-6 h-6 text-amber-500" />;
      case 'Light Rain':
      case 'Heavy Rain': return <CloudRain className="w-6 h-6 text-sky-600" />;
      case 'Thunderstorm': return <CloudLightning className="w-6 h-6 text-purple-600" />;
      case 'Snow': return <Snowflake className="w-6 h-6 text-cyan-600" />;
      default: return <CloudSun className="w-6 h-6 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Environmental Adaptation</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Weather Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Weather changes flag outdoor hazards and prepare indoor alternatives. Switch scenarios to test how your itinerary adapts.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {weather.map((w, idx) => (
            <button
              key={w.id}
              onClick={() => setSelectedDay(idx + 1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedDay === idx + 1
                  ? 'bg-sky-700 text-white border-sky-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              Day {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Day Forecast Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {weather.map((w, idx) => {
          const isSelected = selectedDay === idx + 1;
          return (
            <div
              key={w.id}
              onClick={() => setSelectedDay(idx + 1)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-sky-300 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-600">Day {idx + 1}</span>
                {w.alertLevel === 'Warning' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                    Alert
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Normal
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {getWeatherIcon(w.condition)}
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{w.condition}</h4>
                  <p className="text-xs text-slate-500">{w.tempC}°C • {w.precipitationChance}% rain</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                {w.summary}
              </p>
            </div>
          );
        })}
      </div>

      {/* Active Day Scenario Simulator */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Day {selectedDay} — Weather Scenario Test
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch conditions to see outdoor activity risks and indoor alternatives.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleScenarioClick('Sunny', false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                targetWeather?.condition === 'Sunny'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:border-amber-200'
              }`}
            >
              ☀️ Sunny
            </button>
            <button
              onClick={() => handleScenarioClick('Heavy Rain', true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                targetWeather?.condition === 'Heavy Rain'
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-sky-50 hover:border-sky-200'
              }`}
            >
              🌧️ Heavy Rain
            </button>
            <button
              onClick={() => handleScenarioClick('Thunderstorm', true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                targetWeather?.condition === 'Thunderstorm'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-purple-50 hover:border-purple-200'
              }`}
            >
              ⛈️ Thunderstorm
            </button>
            <button
              onClick={() => handleScenarioClick('Snow', true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                targetWeather?.condition === 'Snow'
                  ? 'bg-cyan-600 text-white border-cyan-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-cyan-50 hover:border-cyan-200'
              }`}
            >
              ❄️ Snow
            </button>
          </div>
        </div>

        {/* Outdoor Activities Risk Evaluator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-sky-600" />
              Day {selectedDay} Outdoor Activities ({outdoorItems.length})
            </span>
            <span className="text-xs text-slate-500">
              Condition: <span className="font-bold text-slate-800">{targetWeather?.condition}</span>
            </span>
          </div>

          {outdoorItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              ✅ No weather-sensitive outdoor activities scheduled for Day {selectedDay}.
            </div>
          ) : (
            <div className="space-y-3">
              {outdoorItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    targetWeather?.alertLevel === 'Warning'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200">
                          Outdoor
                        </span>
                        {targetWeather?.alertLevel === 'Warning' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> At Risk
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{item.description}</p>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        {item.startTime} – {item.endTime} • {item.location}
                      </span>
                    </div>

                    {item.weatherAlternative && (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs max-w-sm space-y-1">
                        <span className="font-bold text-sky-700 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Indoor Alternative
                        </span>
                        <p className="font-semibold text-slate-800">{item.weatherAlternative.title}</p>
                        <p className="text-[11px] text-slate-500">{item.weatherAlternative.indoorReason}</p>
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
