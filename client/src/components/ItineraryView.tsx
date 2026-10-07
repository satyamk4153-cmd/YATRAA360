import React, { useState } from 'react';
import { useTripStore } from '../store/tripStore';
import {
  CalendarDays,
  Clock,
  MapPin,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  Sparkles,
  Plus,
  CloudRain,
  ShieldAlert,
  CheckCircle2,
  Copy,
  ChevronRight
} from 'lucide-react';
import { ItineraryItem, ItineraryCategory } from '../types';

export const ItineraryView: React.FC = () => {
  const {
    currentTrip,
    replanItinerary,
    updateItineraryItem,
    deleteItineraryItem,
    addItineraryItem
  } = useTripStore();

  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [editModalItem, setEditModalItem] = useState<ItineraryItem | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New Item State
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItineraryCategory>('Activity');
  const [newItemStart, setNewItemStart] = useState('02:00 PM');
  const [newItemEnd, setNewItemEnd] = useState('03:30 PM');
  const [newItemLoc, setNewItemLoc] = useState('');
  const [newItemCost, setNewItemCost] = useState('0');

  if (!currentTrip) return null;

  const { itinerary, trip } = currentTrip;
  const tripDaysCount = trip?.startDate && trip?.endDate
    ? Math.max(1, Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1)
    : (itinerary?.length || 1);
  const activeDay = itinerary.find(d => d.dayNumber === selectedDayNum) || itinerary[0];

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalItem) return;
    await updateItineraryItem(editModalItem.id, editModalItem);
    setEditModalItem(null);
  };

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle) return;
    await addItineraryItem({
      dayNumber: selectedDayNum,
      title: newItemTitle,
      description: newItemDesc,
      category: newItemCategory,
      startTime: newItemStart,
      endTime: newItemEnd,
      location: newItemLoc || `${trip.destination} Local Area`,
      cost: Number(newItemCost) || 0,
      isWeatherSensitive: false
    });
    setNewItemTitle('');
    setNewItemDesc('');
    setAddModalOpen(false);
  };

  const handleDuplicate = async (item: ItineraryItem) => {
    await addItineraryItem({
      dayNumber: selectedDayNum,
      title: `${item.title} (Copy)`,
      description: item.description,
      category: item.category,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location,
      cost: item.cost,
      isWeatherSensitive: item.isWeatherSensitive
    });
  };

  const toggleLock = async (item: ItineraryItem) => {
    await updateItineraryItem(item.id, { isLocked: !item.isLocked });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* Top Header & Replan Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Daily Schedule</span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Trip Itinerary</h1>
          <p className="text-xs text-slate-500 mt-1">
            Your activities by day. Manual edits are tagged <span className="text-purple-700 font-semibold">USER_MODIFIED</span> and preserved during AI re-plans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add Activity</span>
          </button>

          <button
            onClick={() => replanItinerary('Re-optimizing unlocked pace')}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Replan</span>
          </button>
        </div>
      </div>

      {/* Banner if itinerary has fewer days than trip duration */}
      {tripDaysCount > (itinerary?.length || 0) && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold">Multi-Day Journey Schedule: </span>
              <span>Your trip spans <strong>{tripDaysCount} days</strong> ({trip.startDate} to {trip.endDate}), currently displaying <strong>{itinerary?.length || 0} planned day(s)</strong>.</span>
            </div>
          </div>
          <button
            onClick={() => replanItinerary(`Generate complete ${tripDaysCount}-day schedule`)}
            className="px-3.5 py-1.5 rounded-lg bg-blue-700 text-white font-bold hover:bg-blue-800 transition-colors shrink-0 cursor-pointer text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Fill All {tripDaysCount} Days</span>
          </button>
        </div>
      )}

      {/* Days Tabs Bar */}
      {itinerary && itinerary.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {itinerary.map((day) => {
            const isSelected = day.dayNumber === selectedDayNum;
            const dateDisplay = day.date ? (day.date.length > 5 ? day.date.slice(5) : day.date) : '';
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDayNum(day.dayNumber)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span>Day {day.dayNumber}</span>
                {dateDisplay && <span className="text-[10px] opacity-75 font-normal">({dateDisplay})</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Day Header */}
      {activeDay && (
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Day {activeDay.dayNumber}: {activeDay.theme}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeDay.items?.length || 0} activities • {activeDay.date}
            </p>
          </div>

          {activeDay.weatherForecast && (
            <div className={`flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg border ${
              activeDay.weatherForecast.alertLevel === 'Warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-sky-50 border-sky-200 text-sky-800'
            }`}>
              <CloudRain className={`w-4 h-4 ${activeDay.weatherForecast.alertLevel === 'Warning' ? 'text-amber-600' : 'text-sky-500'}`} />
              <div>
                <span className="font-bold">{activeDay.weatherForecast.condition}</span> • {activeDay.weatherForecast.tempC}°C • {activeDay.weatherForecast.precipitationChance ?? 5}% rain
                {activeDay.weatherForecast.alertLevel === 'Warning' && (
                  <span className="text-[10px] block text-amber-700">Weather alert – indoor alternatives suggested</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty Itinerary or Empty Day State */}
      {(!itinerary || itinerary.length === 0) ? (
        <div className="p-10 rounded-xl bg-white border border-slate-200 text-center space-y-3">
          <CalendarDays className="w-10 h-10 text-blue-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Itinerary Days Planned Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Generate an AI-optimized schedule with door-to-door transit, accommodation check-in, and activities.
          </p>
          <button
            onClick={() => replanItinerary('Initialize complete journey schedule')}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 flex items-center gap-2 mx-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Itinerary</span>
          </button>
        </div>
      ) : activeDay && (!activeDay.items || activeDay.items.length === 0) ? (
        <div className="p-8 rounded-xl bg-white border border-slate-200 text-center space-y-3">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No activities scheduled for Day {activeDay.dayNumber}</h3>
          <p className="text-xs text-slate-500">
            Add custom sightseeing, meals, or leisure stops, or click Replan to generate activities.
          </p>
          <div className="flex justify-center gap-2 pt-1">
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Add Activity</span>
            </button>
            <button
              onClick={() => replanItinerary(`Optimize Day ${activeDay.dayNumber} activities`)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Populate Day</span>
            </button>
          </div>
        </div>
      ) : (
        /* Items List */
        <div className="space-y-3">
          {activeDay?.items?.map((item, idx) => {
            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  item.isUserModified
                    ? 'bg-white border-purple-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                
                {/* Left Time & Title */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {item.startTime} – {item.endTime}
                    </span>
                    
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {item.category}
                    </span>

                    {item.isUserModified && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                        CUSTOMIZED
                      </span>
                    )}

                    {item.isLocked && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}

                    {item.isWeatherSensitive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200 flex items-center gap-1">
                        <CloudRain className="w-3 h-3" /> Outdoor
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.location}
                    </span>
                    <span className="font-semibold text-emerald-700">
                      {item.cost > 0 ? `₹${item.cost.toLocaleString('en-IN')}` : 'Free'}
                    </span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center pt-2 md:pt-0">
                  <button
                    onClick={() => toggleLock(item)}
                    className={`p-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      item.isLocked
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-700'
                    }`}
                    title={item.isLocked ? 'Unlock item' : 'Lock item (prevents AI re-ordering)'}
                  >
                    {item.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setEditModalItem(item)}
                    className="p-2 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDuplicate(item)}
                    className="p-2 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                    title="Duplicate Item"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => deleteItineraryItem(item.id)}
                    className="p-2 rounded-lg text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Weather Alternative banner if sensitive */}
              {item.isWeatherSensitive && item.weatherAlternative && activeDay.weatherForecast?.alertLevel === 'Warning' && (
                <div className="mt-3 p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-800 flex items-start gap-2">
                  <CloudRain className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sky-800">Indoor Alternative: </span>
                    <span>{item.weatherAlternative.title} ({item.weatherAlternative.location})</span>
                    <p className="text-[11px] text-sky-700 mt-0.5">{item.weatherAlternative.indoorReason}</p>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
      )}

      {/* Edit Item Modal */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Edit Itinerary Activity</h3>
              <button onClick={() => setEditModalItem(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none">×</button>
            </div>
            <p className="text-xs text-slate-500">
              Changes will be tagged as <span className="text-purple-700 font-semibold">CUSTOMIZED</span> so AI re-plans preserve them.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editModalItem.title}
                  onChange={(e) => setEditModalItem({ ...editModalItem, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editModalItem.description}
                  onChange={(e) => setEditModalItem({ ...editModalItem, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={editModalItem.startTime}
                    onChange={(e) => setEditModalItem({ ...editModalItem, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">End Time</label>
                  <input
                    type="text"
                    value={editModalItem.endTime}
                    onChange={(e) => setEditModalItem({ ...editModalItem, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    value={editModalItem.location}
                    onChange={(e) => setEditModalItem({ ...editModalItem, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    value={editModalItem.cost}
                    onChange={(e) => setEditModalItem({ ...editModalItem, cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalItem(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white cursor-pointer transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Item Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add Activity — Day {selectedDayNum}</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none">×</button>
            </div>
            
            <form onSubmit={handleAddItemSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pottery Workshop, Sunrise Viewpoint, Local Market"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief details about this activity..."
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="02:00 PM"
                    value={newItemStart}
                    onChange={(e) => setNewItemStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="03:30 PM"
                    value={newItemEnd}
                    onChange={(e) => setNewItemEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Old Bazaar"
                    value={newItemLoc}
                    onChange={(e) => setNewItemLoc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white cursor-pointer transition-colors"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
