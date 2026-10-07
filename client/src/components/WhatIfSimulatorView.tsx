import React, { useState, useEffect } from 'react';
import { useTripStore } from '../store/tripStore';
import { api } from '../services/api';
import {
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Layers,
  Wallet,
  Users,
  Clock,
  CloudRain
} from 'lucide-react';
import { WhatIfSimulationResult, WeatherCondition } from '../types';

export const WhatIfSimulatorView: React.FC = () => {
  const { currentTrip, setCurrentTrip, addToast } = useTripStore();

  const [simBudget, setSimBudget] = useState(currentTrip?.trip.budget || 40000);
  const [simTravellers, setSimTravellers] = useState(currentTrip?.trip.travellersCount || 4);
  const [simDelay, setSimDelay] = useState(0);
  const [simWeather, setSimWeather] = useState<WeatherCondition>('Heavy Rain');

  const [simulationResult, setSimulationResult] = useState<WhatIfSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    runSimulation();
  }, [simBudget, simTravellers, simDelay, simWeather, currentTrip]);

  const runSimulation = async () => {
    if (!currentTrip) return;
    setIsSimulating(true);
    try {
      const res = await api.simulateWhatIf(currentTrip.trip.id, {
        budget: simBudget,
        travellersCount: simTravellers,
        transportDelayHours: simDelay,
        weatherCondition: simWeather,
        weatherOverrideDay: 2
      });
      setSimulationResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApplyChanges = async () => {
    if (!currentTrip || !simulationResult) return;
    try {
      const updated = await api.applySimulation(currentTrip.trip.id, simulationResult.simulatedTripData);
      setCurrentTrip(updated);
      addToast('Sandbox simulation applied to live trip!', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleReset = () => {
    if (!currentTrip) return;
    setSimBudget(currentTrip.trip.budget);
    setSimTravellers(currentTrip.trip.travellersCount);
    setSimDelay(0);
    setSimWeather('Heavy Rain');
  };

  if (!currentTrip) return null;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
            Sandbox Simulation
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">What-If Simulator</h1>
          <p className="text-xs text-slate-500 mt-1">
            Test hypothetical budget shifts, extra travellers, train delays, or weather changes — without affecting your live trip until you click Apply.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleApplyChanges}
            disabled={!simulationResult}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply to Real Trip</span>
          </button>
        </div>
      </div>

      {/* Simulator Control Sliders */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-800">
          Hypothetical Scenario Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Budget Slider */}
          <div className="space-y-2 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-amber-600" />
                Budget
              </span>
              <span className="font-bold text-emerald-700">₹{simBudget.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="15000"
              max="80000"
              step="2500"
              value={simBudget}
              onChange={(e) => setSimBudget(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹15K</span>
              <span>₹40K (Live)</span>
              <span>₹80K</span>
            </div>
          </div>

          {/* Travellers Slider */}
          <div className="space-y-2 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                Travellers
              </span>
              <span className="font-bold text-purple-700">{simTravellers} Pax</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={simTravellers}
              onChange={(e) => setSimTravellers(Number(e.target.value))}
              className="w-full accent-purple-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1</span>
              <span>4 (Live)</span>
              <span>12</span>
            </div>
          </div>

          {/* Transport Delay */}
          <div className="space-y-2 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                Train Delay
              </span>
              <span className="font-bold text-sky-700">+{simDelay} hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              value={simDelay}
              onChange={(e) => setSimDelay(Number(e.target.value))}
              className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>On Time</span>
              <span>+3h</span>
              <span>+6h</span>
            </div>
          </div>

          {/* Weather Shift */}
          <div className="space-y-2 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-pink-600" />
                Day 2 Weather
              </span>
              <span className="font-bold text-slate-700 text-[11px]">{simWeather}</span>
            </div>
            <select
              value={simWeather}
              onChange={(e) => setSimWeather(e.target.value as WeatherCondition)}
              className="w-full px-2.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs focus:outline-none focus:border-blue-500 font-medium mt-1"
            >
              <option value="Sunny">☀️ Sunny / Clear</option>
              <option value="Heavy Rain">🌧️ Heavy Rain Warning</option>
              <option value="Thunderstorm">⛈️ Thunderstorm</option>
              <option value="Snow">❄️ Snowfall</option>
            </select>
          </div>

        </div>
      </div>

      {/* Side-by-Side Comparison */}
      {simulationResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Current Live Plan */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Baseline</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
                Current Live Plan
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Budget:</span>
                <span className="font-bold text-slate-900">₹{simulationResult.currentMetrics.totalBudget.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Travellers:</span>
                <span className="font-bold text-slate-900">{currentTrip.trip.travellersCount} Pax</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Per-Person Budget:</span>
                <span className="font-bold text-slate-900">₹{simulationResult.currentMetrics.perPersonBudget.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Budget Health:</span>
                <span className="font-bold text-emerald-700">{simulationResult.currentMetrics.budgetHealthStatus}</span>
              </div>
            </div>
          </div>

          {/* Simulated Sandbox Plan */}
          <div className="bg-white p-6 rounded-xl border border-purple-300 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-200">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Simulated Sandbox</span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold">
                {isSimulating ? 'Calculating...' : 'Simulated Plan'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Simulated Budget:</span>
                <span className="font-bold text-purple-700">₹{simulationResult.simulatedMetrics.totalBudget.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Simulated Travellers:</span>
                <span className="font-bold text-purple-700">{simTravellers} Pax</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Per-Person Budget:</span>
                <span className="font-bold text-purple-700">₹{simulationResult.simulatedMetrics.perPersonBudget.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Simulated Health:</span>
                <span className={`font-bold ${
                  simulationResult.simulatedMetrics.budgetHealthStatus === 'Exceeded'
                    ? 'text-red-600'
                    : simulationResult.simulatedMetrics.budgetHealthStatus === 'Warning'
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}>
                  {simulationResult.simulatedMetrics.budgetHealthStatus}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Differences Matrix & AI Recommendations */}
      {simulationResult && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-700" />
            <span>Impact Analysis & Recommendations</span>
          </h3>

          {/* Differences Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {simulationResult.differences.map((diff, i) => (
              <div
                key={i}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="text-slate-500 block">{diff.field}</span>
                  <span className="text-slate-800 font-semibold">{diff.currentValue} → <span className="text-blue-700 font-bold">{diff.simulatedValue}</span></span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  diff.impact === 'warning'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : diff.impact === 'negative'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {diff.impact}
                </span>
              </div>
            ))}
          </div>

          {/* AI Recommendations */}
          {simulationResult.aiRecommendations.length > 0 && (
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-800">
              <span className="font-bold text-purple-900 flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-4 h-4 text-purple-700" /> AI Advisory:
              </span>
              <p className="leading-relaxed">{simulationResult.aiRecommendations[0]}</p>
            </div>
          )}

          {/* Itinerary Adjustments Preview */}
          {simulationResult.itineraryAdjustments.length > 0 && (
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Downstream Itinerary Adaptations:</span>
              <p className="text-slate-600 leading-relaxed">{simulationResult.itineraryAdjustments[0]}</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              onClick={handleApplyChanges}
              className="px-6 py-2.5 rounded-lg font-bold text-xs bg-blue-700 hover:bg-blue-800 text-white cursor-pointer transition-colors"
            >
              Apply All Changes to Live Trip
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
