import React, { useState, useEffect } from 'react';
import { useTripStore } from '../store/tripStore';
import { api } from '../services/api';
import {
  Gem,
  MapPin,
  Clock,
  ShieldCheck,
  Plus,
  Users,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { HiddenGem } from '../types';

export const HiddenGemsView: React.FC = () => {
  const { currentTrip, addHiddenGem, setView, addToast } = useTripStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [targetDay, setTargetDay] = useState<number>(2);
  const [fetchedGems, setFetchedGems] = useState<HiddenGem[]>([]);
  const [isLoadingGems, setIsLoadingGems] = useState(false);
  const [addedGemId, setAddedGemId] = useState<string | null>(null);

  const trip = currentTrip?.trip;
  const itinerary = currentTrip?.itinerary || [];
  const storeGems = currentTrip?.hiddenGems || [];

  const fallbackDestinationGems: HiddenGem[] = React.useMemo(() => {
    const tripId = trip?.id || 'demo-trip';
    const dest = (trip?.destination || '').toLowerCase();
    const destName = trip?.destination || 'Destination';
    if (dest.includes('jaipur')) {
      return [
        {
          id: 'gem_panna_meena',
          tripId,
          destinationCity: 'Jaipur',
          name: 'Panna Meena Ka Kund Stepwell',
          description: '16th-century symmetrical geometric stepwell featuring criss-cross stairs, carved recessed doorways, and peaceful morning ambience.',
          category: 'Heritage & Architecture',
          location: 'Near Anokhi Museum, Amer',
          distance: '11.5 km North of City Center',
          crowdLevel: 'Low',
          cost: 0,
          openingHours: '06:00 AM - 06:00 PM',
          safetyInfo: 'Take care while descending steep ancient stone steps.',
          bestTime: 'Early Morning (07:00 AM - 09:30 AM)',
          lat: 26.9856,
          lng: 75.8542,
          imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
          isSaved: true
        },
        {
          id: 'gem_galta_ji',
          tripId,
          destinationCity: 'Jaipur',
          name: 'Galta Ji Sun Temple & Sacred Kunds',
          description: 'Ancient mountain-pass temple complex with natural mineral springs, pink sandstone pavilions, and sunset valley views.',
          category: 'Culture & Nature',
          location: 'Galta Valley, Eastern Hills',
          distance: '10 km East of Hawa Mahal',
          crowdLevel: 'Low',
          cost: 0,
          openingHours: '05:30 AM - 07:30 PM',
          safetyInfo: 'Quiet valley hike; secure food items from friendly resident macaques.',
          bestTime: 'Sunset (05:00 PM - 06:45 PM)',
          lat: 26.9158,
          lng: 75.8622,
          imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80',
          isSaved: false
        },
        {
          id: 'gem_anokhi',
          tripId,
          destinationCity: 'Jaipur',
          name: 'Anokhi Museum of Hand Printing',
          description: 'Housed in a magnificently restored stone haveli, showcasing centuries of indigenous Rajasthani block printing with live artisan demonstrations.',
          category: 'Artisans & Crafts',
          location: 'Kheri Gate, Amer Town',
          distance: '12 km North',
          crowdLevel: 'Very Low',
          cost: 100,
          openingHours: '10:30 AM - 05:00 PM',
          safetyInfo: 'Paved, air-cooled indoor museum space.',
          bestTime: 'Mid-Day (11:30 AM - 02:00 PM)',
          lat: 26.9892,
          lng: 75.8524,
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
          isSaved: false
        },
        {
          id: 'gem_gaitore',
          tripId,
          destinationCity: 'Jaipur',
          name: 'Gaitore Royal Cenotaphs (Chhatris)',
          description: 'Exquisite white marble cenotaphs of Jaipur’s Maharajas nestled inside a tranquil valley amphitheatre beneath Nahargarh Fort.',
          category: 'Architecture',
          location: 'Foot of Nahargarh Hills',
          distance: '5.2 km from Old City',
          crowdLevel: 'Very Low',
          cost: 30,
          openingHours: '09:00 AM - 05:00 PM',
          safetyInfo: 'Very serene and well maintained garden paths.',
          bestTime: 'Morning (09:00 AM - 11:30 AM)',
          lat: 26.9402,
          lng: 75.8247,
          imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80',
          isSaved: true
        }
      ];
    }
    return [
      {
        id: `gem_artisan_${dest}`,
        tripId,
        destinationCity: destName,
        name: `${destName} Historic Artisan & Craft Guild`,
        description: `Overlooked heritage quarter where local craftsmen practice traditional regional arts, handlooms, and indigenous stone/wood carving.`,
        category: 'Artisans & Crafts',
        location: `Old ${destName} Historic Bazaar`,
        distance: '3.2 km from City Center',
        crowdLevel: 'Low',
        cost: 0,
        openingHours: '10:00 AM - 07:00 PM',
        safetyInfo: 'Safe walking streets with local guided tours available.',
        bestTime: 'Morning (10:00 AM - 12:30 PM)',
        lat: 28.6139,
        lng: 77.2090,
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
        isSaved: true
      },
      {
        id: `gem_nature_${dest}`,
        tripId,
        destinationCity: destName,
        name: `${destName} Secluded Nature Trail & Viewpoint`,
        description: `Peaceful nature trail through green ridges and panoramic viewpoints, far removed from crowded tourist buses.`,
        category: 'Nature & Trails',
        location: `${destName} Ridge Path`,
        distance: '5.8 km from Downtown',
        crowdLevel: 'Very Low',
        cost: 0,
        openingHours: '06:00 AM - 06:30 PM',
        safetyInfo: 'Wear comfortable walking shoes; carry water.',
        bestTime: 'Sunrise & Early Morning (06:30 AM - 09:00 AM)',
        lat: 28.6200,
        lng: 77.2100,
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        isSaved: false
      },
      {
        id: `gem_culinary_${dest}`,
        tripId,
        destinationCity: destName,
        name: `Heritage Multi-Generational Culinary Haunt`,
        description: `Celebrated secret street diner serving legendary regional delicacies perfected over 70 years with organic clay oven cooking.`,
        category: 'Food & Culinary',
        location: `${destName} Old Bazaar Gate`,
        distance: '2.1 km from Central Station',
        crowdLevel: 'Low',
        cost: 350,
        openingHours: '11:30 AM - 10:30 PM',
        safetyInfo: 'Freshly prepared hot royal recipes.',
        bestTime: 'Lunch (12:30 PM - 02:30 PM)',
        lat: 28.6180,
        lng: 77.2150,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        isSaved: false
      }
    ];
  }, [trip?.destination, trip?.id]);

  const displayGems = storeGems.length > 0
    ? storeGems
    : (fetchedGems.length > 0 ? fetchedGems : fallbackDestinationGems);

  useEffect(() => {
    // If store has no gems for this trip, auto-fetch destination gems
    if (storeGems.length === 0 && trip?.destination) {
      let isCancelled = false;
      setIsLoadingGems(true);
      api.getHiddenGems(trip.destination)
        .then(gems => {
          if (!isCancelled && gems.length > 0) {
            setFetchedGems(gems);
          }
        })
        .catch(err => {
          console.warn('Could not auto-fetch gems:', err);
        })
        .finally(() => {
          if (!isCancelled) setIsLoadingGems(false);
        });

      return () => {
        isCancelled = true;
      };
    }
  }, [storeGems.length, trip?.destination]);

  // Ensure target day matches available itinerary days
  useEffect(() => {
    if (itinerary.length > 0) {
      const dayExists = itinerary.some(d => d.dayNumber === targetDay);
      if (!dayExists) {
        setTargetDay(itinerary[1]?.dayNumber || itinerary[0]?.dayNumber || 1);
      }
    }
  }, [itinerary, targetDay]);

  if (!currentTrip || !trip) return null;

  const handleAddGem = async (gemId: string) => {
    try {
      await addHiddenGem(gemId, targetDay);
      setAddedGemId(gemId);
      addToast(`Added gem to Day ${targetDay} schedule!`, 'success');
      setTimeout(() => setAddedGemId(null), 3000);
    } catch (err: any) {
      addToast(err.message || 'Failed to add gem', 'error');
    }
  };

  const categories = ['All', ...Array.from(new Set(displayGems.map(g => g.category).filter(Boolean)))];

  const filteredGems = selectedCategory === 'All'
    ? displayGems
    : displayGems.filter(g => g.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <Gem className="w-3.5 h-3.5" /> Curated Local Discoveries
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            Hidden Gems & Off-Beat Spots
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Low-crowd, authentic cultural spots in <strong className="text-slate-700">{trip.destination}</strong>. Adding a gem automatically schedules it into your itinerary, route map, and budget.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-slate-600 font-semibold whitespace-nowrap">Schedule into:</label>
          <select
            value={targetDay}
            onChange={(e) => setTargetDay(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:border-blue-500"
          >
            {itinerary.map((d) => (
              <option key={d.id} value={d.dayNumber}>
                Day {d.dayNumber} ({d.date.slice(5)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories Filter Strip */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Gems Grid */}
      {isLoadingGems ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200 p-8 space-y-3">
          <Sparkles className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Curating Hidden Spots for {trip.destination}...</h3>
          <p className="text-xs text-slate-500">Retrieving uncrowded stepwells, nature trails, artisan workshops, and heritage sights.</p>
        </div>
      ) : filteredGems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8 space-y-4">
          <Compass className="w-10 h-10 text-emerald-600 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-900">No Hidden Gems found for this filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Explore gems from other categories or reset the filter to view all curated spots in {trip.destination}.
            </p>
          </div>
          <button
            onClick={() => setSelectedCategory('All')}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer transition-colors"
          >
            Show All Spots
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGems.map((gem) => {
            const isJustAdded = addedGemId === gem.id;
            return (
              <div
                key={gem.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all group"
              >
                <div>
                  {/* Image & Badge */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={gem.imageUrl}
                      alt={gem.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-sm">
                        {gem.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-700 border border-white">
                        Crowd: {gem.crowdLevel}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 right-3 text-white text-xs font-bold drop-shadow-md">
                      {gem.cost === 0 ? 'Free Entry' : `₹${gem.cost.toLocaleString('en-IN')}`}
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
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{gem.location} ({gem.distance})</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Best Time: {gem.bestTime}</span>
                      </div>

                      <div className="flex items-start gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-slate-600 leading-tight">{gem.safetyInfo}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleAddGem(gem.id)}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isJustAdded
                        ? 'bg-emerald-600 text-white border border-emerald-600'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Added to Day {targetDay} Itinerary!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add to Day {targetDay} Itinerary</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

