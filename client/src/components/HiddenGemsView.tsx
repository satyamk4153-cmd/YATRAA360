import React, { useState } from 'react';
import { useTripStore } from '../store/tripStore';
import {
  Gem,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { HiddenGem } from '../types';

export const HiddenGemsView: React.FC = () => {
  const { currentTrip, addHiddenGem, setView } = useTripStore();
  const [selectedGem, setSelectedGem] = useState<HiddenGem | null>(null);
  const [targetDay, setTargetDay] = useState<number>(2);

  if (!currentTrip) return null;

  const { hiddenGems, trip } = currentTrip;

  const handleAddGem = async (gemId: string) => {
    await addHiddenGem(gemId, targetDay);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Curated Local Discoveries
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            Hidden Gems & Off-Beat Trails
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Low-crowd spots in {trip.destination}. Adding a gem updates your itinerary, route, and budget automatically.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-slate-600 font-semibold whitespace-nowrap">Add to Day:</label>
          <select
            value={targetDay}
            onChange={(e) => setTargetDay(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
          >
            {currentTrip.itinerary.map((d) => (
              <option key={d.id} value={d.dayNumber}>
                Day {d.dayNumber} ({d.date.slice(5)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hiddenGems.map((gem) => {
          return (
            <div
              key={gem.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div>
                {/* Image & Badge */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={gem.imageUrl}
                    alt={gem.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-sm">
                      {gem.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-700 border border-white">
                      Crowd: {gem.crowdLevel}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {gem.name}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {gem.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{gem.location} ({gem.distance})</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Best Time: {gem.bestTime}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[11px] text-slate-600">{gem.safetyInfo}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => handleAddGem(gem.id)}
                  className="w-full py-2.5 rounded-lg font-bold text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Day {targetDay} Itinerary</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
