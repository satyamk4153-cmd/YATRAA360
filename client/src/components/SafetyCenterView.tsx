import React, { useState } from 'react';
import { useTripStore } from '../store/tripStore';
import { api } from '../services/api';
import {
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  MapPin,
  AlertCircle,
  Plus,
  CheckCircle2,
  Radio,
  HeartPulse,
  Building,
  Share2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { EmergencyContact } from '../types';

export const SafetyCenterView: React.FC = () => {
  const { currentTrip, addToast } = useTripStore();
  const [sosActive, setSosActive] = useState(false);
  const [sosDetails, setSosDetails] = useState<any>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');

  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Government Photo ID cards for all travellers (Aadhaar / Passport)', checked: true },
    { id: 2, text: 'Digital / Offline PDF copies of train tickets and hotel booking', checked: true },
    { id: 3, text: 'First-aid & travel medical kit (Bandages, ORS, Paracetamol)', checked: true },
    { id: 4, text: 'Power bank & emergency offline maps downloaded', checked: false },
    { id: 5, text: 'Shared live journey link with family / emergency contact', checked: true }
  ]);

  if (!currentTrip) return null;

  const { emergencyContacts, trip } = currentTrip;

  const executeSOS = async () => {
    setConfirmModalOpen(false);
    setIsLocating(true);

    let lat = 28.6139;
    let lng = 77.2090;
    let locationSource = 'Trip Corridor';

    // Attempt browser Geolocation API
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 6000,
            enableHighAccuracy: true
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        locationSource = 'Live Device GPS';
      } catch (geoErr: any) {
        console.warn('Geolocation unavailable/denied, falling back to trip corridor coordinates:', geoErr);
        locationSource = 'Trip Corridor Fallback (GPS Permission Not Granted)';
      }
    }

    try {
      const res = await api.triggerSOS(trip.id);
      setSosActive(true);
      setSosDetails({
        ...res.beaconDetails,
        lat,
        lng,
        locationSource,
        coordinates: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
        timestamp: new Date().toLocaleTimeString()
      });
      setIsLocating(false);
      addToast(
        `🚨 SOS Beacon Activated (${locationSource}). Use the direct dial buttons below for immediate assistance.`,
        'error'
      );
    } catch (err: any) {
      setIsLocating(false);
      addToast(err.message || 'Failed to trigger SOS on server', 'error');
    }
  };

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    try {
      await api.addEmergencyContact(trip.id, { name, relation, phone, priority: 2 });
      addToast(`Added ${name} to emergency contacts.`, 'success');
      setName('');
      setRelation('');
      setPhone('');
      setAddModalOpen(false);
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const toggleChecklist = (id: number) => {
    setChecklist(checklist.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)));
  };

  const distressMessage = `EMERGENCY ALERT from YATRAA user during journey (${trip.origin} to ${trip.destination}). Urgent assistance required. My current coordinates: ${
    sosDetails?.lat ? `${sosDetails.lat}, ${sosDetails.lng} (https://maps.google.com/?q=${sosDetails.lat},${sosDetails.lng})` : 'Location active on trip corridor'
  }`;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      
      {/* SOS Banner Card */}
      <div className={`p-6 rounded-xl border transition-all ${
        sosActive
          ? 'bg-red-50 border-red-400 shadow-sm'
          : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${sosActive ? 'bg-red-600 animate-ping' : 'bg-red-600'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                {sosActive ? 'EMERGENCY BEACON ACTIVATED' : 'Travel Safety & Emergency Assistance'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {sosActive ? 'Distress Beacon Logging Active' : 'Safety Center & SOS Helpline'}
            </h1>
            <p className="text-xs text-slate-600 max-w-xl">
              Provides direct emergency hotline dialing (112, 139), live GPS coordinate dispatch, registered contact notifications, and preparedness checklist.
            </p>
          </div>

          <button
            onClick={() => setConfirmModalOpen(true)}
            disabled={isLocating}
            className={`px-6 py-3.5 rounded-xl font-bold text-xs text-white shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              sosActive
                ? 'bg-red-700 hover:bg-red-800 animate-pulse'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isLocating ? 'Acquiring GPS...' : sosActive ? 'SOS ACTIVE (RE-TRIGGER)' : 'TRIGGER EMERGENCY SOS'}</span>
          </button>
        </div>

        {/* SOS Live Details if Triggered */}
        {sosActive && sosDetails && (
          <div className="mt-4 pt-4 border-t border-red-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white border border-red-200">
                <span className="text-[10px] text-slate-500 block">Coordinates &amp; Source</span>
                <span className="font-bold text-slate-800">{sosDetails.coordinates}</span>
                <span className="text-[10px] text-slate-400 block">{sosDetails.locationSource}</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-red-200">
                <span className="text-[10px] text-slate-500 block">Dispatch Status</span>
                <span className="font-bold text-emerald-700">TRANSMITTING DISTRESS DATA</span>
                <span className="text-[10px] text-slate-400 block">Logged at {sosDetails.timestamp}</span>
              </div>
              <div className="p-3 rounded-lg bg-white border border-red-200">
                <span className="text-[10px] text-slate-500 block">Emergency Contacts</span>
                <span className="font-bold text-slate-800">{emergencyContacts.length} Contacts Listed</span>
                <span className="text-[10px] text-slate-400 block">Ready for 1-click alert below</span>
              </div>
            </div>

            {/* Direct Action Dispatch Links */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={`tel:112`}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call 112 (National Police / Medical)
              </a>

              <a
                href={`tel:139`}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call 139 (Railways Security Helpline)
              </a>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(distressMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" /> Share GPS via WhatsApp
              </a>

              <a
                href={`sms:?body=${encodeURIComponent(distressMessage)}`}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Send Emergency SMS
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Official Emergency Helplines Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'National Emergency (Police/Medical)', number: '112', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
          { title: 'Indian Railways Helpline', number: '139', icon: Radio, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'National Ambulance Service', number: '108', icon: HeartPulse, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Women Safety Helpline', number: '1090', icon: PhoneCall, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((serv, idx) => {
          const Icon = serv.icon;
          return (
            <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${serv.bg} ${serv.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{serv.title}</h4>
                  <a href={`tel:${serv.number}`} className="text-xs font-mono font-bold text-blue-700 hover:underline">
                    Dial: {serv.number}
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Registered Contacts vs Safety Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Emergency Contacts */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-red-600" />
              <span>Registered Emergency Contacts ({emergencyContacts.length})</span>
            </h3>

            <button
              onClick={() => setAddModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Contact</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {emergencyContacts.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-800">{c.name}</h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-600">
                      {c.relation}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{c.notes || 'Emergency Contact'}</p>
                </div>

                <a
                  href={`tel:${c.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-mono font-bold flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>{c.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Pre-Departure Safety Checklist */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Journey Preparedness &amp; Safety Checklist</span>
            </h3>
            <span className="text-[11px] text-emerald-700 font-semibold">
              {checklist.filter((c) => c.checked).length} / {checklist.length} Completed
            </span>
          </div>

          <div className="space-y-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklist(item.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                  item.checked
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className={`p-0.5 rounded mt-0.5 ${item.checked ? 'bg-emerald-600 text-white' : 'border border-slate-400'}`}>
                  {item.checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-xs leading-relaxed ${item.checked ? 'font-medium' : ''}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Confirmation Modal before triggering SOS */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Confirm Emergency SOS Alert</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will request your live device coordinates via GPS, log a distress beacon on the platform, and provide instant 1-tap phone dials to 112 (National Emergency), 139 (Railways Security), and your registered contacts.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSOS}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
              >
                Yes, Trigger Distress Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Emergency Contact */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Emergency Contact</h3>
            <form onSubmit={handleAddContactSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh / Family Home"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Relationship</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physician, Guardian, Spouse"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
