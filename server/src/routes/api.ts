import { Router, Response } from 'express';
import { db } from '../db';
import { DependencyEngine } from '../engine/dependency-engine';
import { AIService } from '../services/ai-service';
import { TravelDataService } from '../services/travel-data';
import { AuthService } from '../services/auth-service';
import { WeatherService } from '../services/weather-service';
import { GeocodingService } from '../services/geocoding-service';
import { RoutingService } from '../services/routing-service';
import { seedDemoTrip } from '../db/seed-demo';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  Trip,
  TripMember,
  Expense,
  ExpenseSplit,
  ItineraryItem,
  ItineraryDay,
  NotificationItem
} from '../types';

export const apiRouter = Router();

// Helper to enforce ownership
function verifyTripOwnership(req: AuthenticatedRequest, trip: Trip | undefined, res: Response): boolean {
  if (!trip) {
    res.status(404).json({ success: false, error: 'Trip not found' });
    return false;
  }
  // Public sample journey allows preview/dev access
  if (trip.id === 'demo-manali-trip-2026') {
    return true;
  }
  // For user-owned trips, authentication is strictly required
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required to access this trip' });
    return false;
  }
  if (trip.userId && trip.userId !== req.user.id) {
    res.status(403).json({ success: false, error: 'Access denied: You do not own this trip' });
    return false;
  }
  return true;
}

// -------------------------------------------------------------
// AUTHENTICATION
// -------------------------------------------------------------

apiRouter.post('/auth/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const authData = await AuthService.register(name, email, password);
    res.status(201).json({ success: true, ...authData });
  } catch (err: any) {
    const status = err.message.includes('already exists') ? 409 : 400;
    res.status(status).json({ success: false, error: err.message || 'Registration failed' });
  }
});

apiRouter.post('/auth/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    const authData = await AuthService.login(email, password);
    res.json({ success: true, ...authData });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message || 'Invalid credentials' });
  }
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = AuthService.getUserProfile(req.user!.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// REAL WEATHER API
// -------------------------------------------------------------

apiRouter.get('/weather/forecast', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const lat = parseFloat(String(req.query.lat));
    const lng = parseFloat(String(req.query.lng));
    const destination = req.query.destination ? String(req.query.destination) : 'Destination';

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, error: 'Valid latitude and longitude are required' });
    }

    const forecast = await WeatherService.getForecast(lat, lng, destination);
    res.json({ success: true, forecast });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Live weather is temporarily unavailable.' });
  }
});

// -------------------------------------------------------------
// REAL GEOCODING
// -------------------------------------------------------------

apiRouter.get('/geocoding/search', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = String(req.query.q || '');
    if (!q.trim()) {
      return res.json({ success: true, results: [] });
    }
    const results = await GeocodingService.searchLocations(q);
    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// REAL ROAD ROUTING (OSRM)
// -------------------------------------------------------------

apiRouter.get('/routes', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const originLat = parseFloat(String(req.query.originLat));
    const originLng = parseFloat(String(req.query.originLng));
    const destLat = parseFloat(String(req.query.destinationLat));
    const destLng = parseFloat(String(req.query.destinationLng));
    const mode = req.query.mode ? String(req.query.mode) : 'driving';

    if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
      return res.status(400).json({
        success: false,
        error: 'Valid originLat, originLng, destinationLat, and destinationLng parameters are required'
      });
    }

    const route = await RoutingService.getRoute(originLat, originLng, destLat, destLng, mode);
    res.json({ success: route.success, route });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Routing failed' });
  }
});

// -------------------------------------------------------------
// STATIONS, TRAINS & FLIGHTS SEARCH ENGINE
// -------------------------------------------------------------

apiRouter.get('/stations', (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = String(req.query.q || '');
    const stations = TravelDataService.searchStations(q);
    res.json({ success: true, stations });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/trains/search', (req: AuthenticatedRequest, res: Response) => {
  try {
    const origin = String(req.query.origin || req.query.from || '');
    const destination = String(req.query.destination || req.query.to || '');
    const date = req.query.date ? String(req.query.date) : undefined;

    if (!origin || !destination) {
      return res.status(400).json({ success: false, error: 'Origin and destination are required' });
    }

    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return res.status(400).json({ success: false, error: 'Origin and destination cannot be identical' });
    }

    const trains = TravelDataService.searchTrains(origin, destination, date);
    res.json({ success: true, origin, destination, date, count: trains.length, trains });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/flights/search', (req: AuthenticatedRequest, res: Response) => {
  try {
    const origin = String(req.query.origin || req.query.from || '');
    const destination = String(req.query.destination || req.query.to || '');
    const date = req.query.date ? String(req.query.date) : undefined;

    if (!origin || !destination) {
      return res.status(400).json({ success: false, error: 'Origin and destination are required' });
    }

    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return res.status(400).json({ success: false, error: 'Origin and destination cannot be identical' });
    }

    const flightData = TravelDataService.searchFlights(origin, destination, date);
    res.json({ success: true, date, ...flightData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// TRIPS & LIFECYCLE
// -------------------------------------------------------------

// GET all trips for current authenticated user
apiRouter.get('/trips', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    const userTrips = db.getTripsByUser(req.user.id);
    return res.json({ success: true, trips: userTrips });
  }
  // If unauthenticated, return empty array without auto-generating demo trip
  res.json({ success: true, trips: [] });
});

// Explicit demo trip loader for optional developer test action
apiRouter.get('/trips/demo', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const trip = seedDemoTrip();
  if (req.user) {
    trip.userId = req.user.id;
    db.saveTrip(trip);
  }
  const fullData = DependencyEngine.getFullTripData(trip.id);
  res.json({ success: true, trip: fullData });
});

// GET Single Full Trip (Reactive Source of Truth)
apiRouter.get('/trips/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.json({ success: true, trip: fullTrip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch trip' });
  }
});

// POST Create new Trip
apiRouter.post('/trips', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      origin,
      destination,
      startDate,
      endDate,
      travellersCount,
      budget,
      transportPreference,
      accommodationPreference,
      travelStyle,
      interests
    } = req.body;

    if (!origin || typeof origin !== 'string' || !origin.trim()) {
      return res.status(400).json({ success: false, error: 'Origin is required and must be a valid string' });
    }
    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      return res.status(400).json({ success: false, error: 'Destination is required and must be a valid string' });
    }

    const parsedPax = Number(travellersCount);
    if (travellersCount !== undefined && (isNaN(parsedPax) || parsedPax <= 0 || !Number.isInteger(parsedPax))) {
      return res.status(400).json({ success: false, error: 'Travellers count must be a positive integer' });
    }

    const parsedBudget = Number(budget);
    if (budget !== undefined && (isNaN(parsedBudget) || parsedBudget <= 0)) {
      return res.status(400).json({ success: false, error: 'Budget must be a positive number' });
    }

    const tripId = `trip_${Date.now()}`;
    const safePax = parsedPax || 4;
    const safeBudget = parsedBudget || 35000;
    const safeStart = startDate || new Date().toISOString().split('T')[0];
    const safeEnd = endDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    const ownerId = req.user?.id || 'usr_demo_yatra';

    const generated = AIService.generateDoorToDoorTrip({
      origin: origin.trim(),
      destination: destination.trim(),
      startDate: safeStart,
      endDate: safeEnd,
      travellersCount: safePax,
      budget: safeBudget,
      transportPreference: transportPreference || 'Train',
      accommodationPreference: accommodationPreference || 'Boutique Hotel',
      travelStyle: travelStyle || 'Balanced',
      interests: Array.isArray(interests) ? interests : ['Sightseeing', 'Food', 'Culture']
    });

    const newTrip: Trip = {
      ...generated.trip,
      id: tripId,
      userId: ownerId,
      title: `${origin.trim()} to ${destination.trim()} Expedition`
    };

    db.saveTrip(newTrip);

    // Map members using user-specified member inputs if provided
    const inputMembers = Array.isArray(req.body.members) ? req.body.members : [];
    const members: TripMember[] = [];

    // Add first member (Organizer)
    const firstInput = inputMembers[0];
    members.push({
      id: `mem_${tripId}_1`,
      tripId,
      name: firstInput?.name?.trim() || req.user?.name || 'You (Organizer)',
      email: firstInput?.email?.trim() || req.user?.email || 'organizer@yatra360.app',
      phone: firstInput?.phone?.trim() || '+91 98765 00001',
      role: 'Organizer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      paidAmount: 0,
      balance: 0
    });

    // Add subsequent members up to safePax or total inputs
    const totalPax = Math.max(safePax, inputMembers.length);
    for (let i = 1; i < totalPax; i++) {
      const customMem = inputMembers[i];
      const memberNum = i + 1;
      members.push({
        id: `mem_${tripId}_${memberNum}`,
        tripId,
        name: customMem?.name?.trim() || `Traveller ${memberNum}`,
        email: customMem?.email?.trim() || `traveller${memberNum}@yatra360.app`,
        phone: customMem?.phone?.trim() || `+91 98765 0000${memberNum}`,
        role: customMem?.role || (memberNum === 2 ? 'Co-Leader' : 'Member'),
        avatar: `https://images.unsplash.com/photo-${1507003211169 + memberNum}?auto=format&fit=crop&w=120&q=80`,
        paidAmount: 0,
        balance: 0
      });
    }

    db.setMembers(tripId, members);
    db.setTransports(tripId, generated.transports);
    db.setAccommodations(tripId, generated.accommodations);
    db.setItinerary(tripId, generated.itinerary);
    db.setBudget(tripId, generated.budget);
    db.setWeather(tripId, generated.weather);
    db.setHiddenGems(tripId, generated.hiddenGems);
    db.setExpenses(tripId, []);
    db.setBookings(tripId, []);
    db.setNotifications(tripId, [
      {
        id: `notif_${Date.now()}`,
        tripId,
        title: 'Complete Journey Operating Plan Ready',
        message: `Plan for ${newTrip.title} generated with ${generated.itinerary.length} daily schedules, live weather, and curated hidden spots for ${newTrip.destination}.`,
        type: 'success',
        isRead: false,
        timestamp: new Date().toISOString()
      }
    ]);

    const fullData = DependencyEngine.getFullTripData(tripId);
    res.status(201).json({ success: true, trip: fullData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create trip' });
  }
});

// PUT Update Trip Parameters
apiRouter.put('/trips/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const currentTrip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, currentTrip, res)) return;

    const { travellersCount, budget, travelStyle, transportPreference, accommodationPreference, status } = req.body;

    if (travellersCount !== undefined) {
      const parsedPax = Number(travellersCount);
      if (isNaN(parsedPax) || parsedPax <= 0 || !Number.isInteger(parsedPax)) {
        return res.status(400).json({ success: false, error: 'Travellers count must be a positive integer' });
      }
      DependencyEngine.handleTravellersChange(tripId, parsedPax);
    }

    if (budget !== undefined) {
      const parsedBudget = Number(budget);
      if (isNaN(parsedBudget) || parsedBudget <= 0) {
        return res.status(400).json({ success: false, error: 'Budget must be a positive number' });
      }
      DependencyEngine.handleBudgetChange(tripId, parsedBudget);
    }

    const trip = db.getTrip(tripId)!;
    if (travelStyle) trip.travelStyle = travelStyle;
    if (transportPreference) trip.transportPreference = transportPreference;
    if (accommodationPreference) trip.accommodationPreference = accommodationPreference;
    if (status) trip.status = status;
    trip.updatedAt = new Date().toISOString();
    db.saveTrip(trip);

    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.json({ success: true, trip: fullTrip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update trip' });
  }
});

// DELETE Trip
apiRouter.delete('/trips/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    db.deleteTrip(tripId);
    res.json({ success: true, message: `Trip '${tripId}' deleted successfully` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete trip' });
  }
});

// POST Select Transport for Active Trip
apiRouter.post('/trips/:id/select-transport', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const { transportType, provider, identifier, departureStation, arrivalStation, departureTime, arrivalTime, price, status } = req.body;

    const transports = db.getTransports(tripId);
    if (transports.length > 0) {
      transports[0] = {
        ...transports[0],
        type: transportType || transports[0].type,
        provider: provider || transports[0].provider,
        identifier: identifier || transports[0].identifier,
        departureStation: departureStation || transports[0].departureStation,
        arrivalStation: arrivalStation || transports[0].arrivalStation,
        departureTime: departureTime || transports[0].departureTime,
        arrivalTime: arrivalTime || transports[0].arrivalTime,
        price: Number(price) || transports[0].price,
        status: status || 'Confirmed'
      };
      db.setTransports(tripId, transports);

      trip!.transportPreference = transportType || trip!.transportPreference;
      db.saveTrip(trip!);

      const itinerary = db.getItinerary(tripId);
      if (itinerary.length > 0 && itinerary[0].items.length > 1) {
        itinerary[0].items[1].title = `Board ${provider}`;
        itinerary[0].items[1].startTime = departureTime;
        itinerary[0].items[1].endTime = arrivalTime;
        itinerary[0].items[1].cost = Math.round(Number(price) || 0);
        db.setItinerary(tripId, itinerary);
      }
    }

    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.json({ success: true, trip: fullTrip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// MEMBERS CRUD
// -------------------------------------------------------------

apiRouter.get('/trips/:id/members', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const trip = db.getTrip(String(req.params.id));
  if (!verifyTripOwnership(req, trip, res)) return;
  res.json({ success: true, members: db.getMembers(String(req.params.id)) });
});

apiRouter.post('/trips/:id/members', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const { name, email, phone, role } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Member name is required' });
    }

    const members = db.getMembers(tripId);
    const newMember: TripMember = {
      id: `mem_${Date.now()}`,
      tripId,
      name: name.trim(),
      email: email ? String(email).trim() : '',
      phone: phone ? String(phone).trim() : '',
      role: role || 'Member',
      paidAmount: 0,
      balance: 0
    };

    members.push(newMember);
    db.setMembers(tripId, members);

    // Update traveller count
    trip!.travellersCount = members.length;
    db.saveTrip(trip!);

    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.status(201).json({ success: true, trip: fullTrip, member: newMember });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to add member' });
  }
});

apiRouter.delete('/trips/:id/members/:memberId', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const memberId = String(req.params.memberId);
    let members = db.getMembers(tripId);

    if (members.length <= 1) {
      return res.status(400).json({ success: false, error: 'A trip must have at least one member' });
    }

    members = members.filter(m => m.id !== memberId);
    db.setMembers(tripId, members);

    trip!.travellersCount = members.length;
    db.saveTrip(trip!);

    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.json({ success: true, trip: fullTrip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// EXPENSES & REAL-TIME SETTLEMENT ENGINE
// -------------------------------------------------------------

apiRouter.get('/trips/:id/expenses', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const trip = db.getTrip(String(req.params.id));
  if (!verifyTripOwnership(req, trip, res)) return;
  res.json({ success: true, expenses: db.getExpenses(String(req.params.id)) });
});

apiRouter.post('/trips/:id/expenses', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const { title, amount, category, paidByMemberId, splitType, splits, notes } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Expense title is required and cannot be empty' });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Expense amount must be a positive number' });
    }

    const members = db.getMembers(tripId);
    const payer = members.find(m => m.id === paidByMemberId) || members[0];
    const finalSplitType = splitType === 'Exact' || splitType === 'Custom' ? splitType : 'Equal';

    let validatedSplits: ExpenseSplit[] | undefined = undefined;

    if (finalSplitType === 'Exact' || finalSplitType === 'Custom') {
      if (!Array.isArray(splits) || splits.length === 0) {
        return res.status(400).json({
          success: false,
          error: `${finalSplitType} split requires split allocation for each member`
        });
      }

      const splitTotal = splits.reduce((sum: number, s: any) => sum + (Number(s.shareAmount !== undefined ? s.shareAmount : s.amount) || 0), 0);
      if (Math.abs(splitTotal - numericAmount) > 1) {
        return res.status(400).json({
          success: false,
          error: `The sum of splits (₹${splitTotal}) must exactly equal the total expense amount (₹${numericAmount})`
        });
      }

      const expId = `exp_${Date.now()}`;
      validatedSplits = splits.map((s: any) => ({
        id: `spl_${Date.now()}_${s.memberId}`,
        expenseId: expId,
        memberId: s.memberId,
        shareAmount: Number(s.shareAmount !== undefined ? s.shareAmount : s.amount) || 0
      }));
    }

    const expenses = db.getExpenses(tripId);
    const validCategories = ['Transport', 'Accommodation', 'Food', 'Activities', 'Shopping', 'Emergency', 'Miscellaneous'];
    const finalCategory = validCategories.includes(category) ? category : 'Food';

    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      tripId,
      title: title.trim(),
      amount: numericAmount,
      category: finalCategory,
      paidByMemberId: payer?.id || members[0]?.id,
      paidByName: payer?.name || members[0]?.name,
      splitType: finalSplitType,
      splits: validatedSplits,
      date: new Date().toISOString().split('T')[0],
      notes: notes || ''
    };

    expenses.push(newExpense);
    db.setExpenses(tripId, expenses);

    db.addChangeLog(tripId, {
      id: `log_${Date.now()}`,
      tripId,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      fieldChanged: 'Expense Added',
      oldValue: '—',
      newValue: `+₹${numericAmount.toLocaleString('en-IN')} (${finalCategory})`,
      reason: `Logged expense '${title.trim()}'. Group settlements and balances recalculated.`,
      canUndo: true
    });

    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.status(201).json({ success: true, trip: fullTrip, expense: newExpense });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create expense' });
  }
});

apiRouter.put('/trips/:id/expenses/:expenseId', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const expenseId = String(req.params.expenseId);
    const expenses = db.getExpenses(tripId);
    const idx = expenses.findIndex(e => e.id === expenseId);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Expense not found' });

    const target = expenses[idx];
    const { title, amount, category, paidByMemberId, splitType, splits, notes } = req.body;

    if (title) target.title = String(title).trim();
    if (amount !== undefined) {
      const num = Number(amount);
      if (isNaN(num) || num <= 0) return res.status(400).json({ success: false, error: 'Invalid amount' });
      target.amount = num;
    }
    if (category) target.category = category;
    if (paidByMemberId) {
      const members = db.getMembers(tripId);
      const payer = members.find(m => m.id === paidByMemberId);
      if (payer) {
        target.paidByMemberId = payer.id;
        target.paidByName = payer.name;
      }
    }
    if (splitType) target.splitType = splitType;
    if (splits) {
      if ((target.splitType === 'Exact' || target.splitType === 'Custom') && Array.isArray(splits) && splits.length > 0) {
        const splitTotal = splits.reduce((sum: number, s: any) => sum + (Number(s.shareAmount !== undefined ? s.shareAmount : s.amount) || 0), 0);
        if (Math.abs(splitTotal - target.amount) > 1) {
          return res.status(400).json({
            success: false,
            error: `The sum of splits (₹${splitTotal}) must exactly equal the total expense amount (₹${target.amount})`
          });
        }
        target.splits = splits.map((s: any) => ({
          id: s.id || `spl_${Date.now()}_${s.memberId}`,
          expenseId: target.id,
          memberId: s.memberId,
          shareAmount: Number(s.shareAmount !== undefined ? s.shareAmount : s.amount) || 0
        }));
      } else {
        target.splits = splits;
      }
    }
    if (notes !== undefined) target.notes = notes;

    db.setExpenses(tripId, expenses);

    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.json({ success: true, trip: fullTrip, expense: target });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/trips/:id/expenses/:expenseId', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const expenseId = String(req.params.expenseId);
    let expenses = db.getExpenses(tripId);
    expenses = expenses.filter(e => e.id !== expenseId);
    db.setExpenses(tripId, expenses);

    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.json({ success: true, trip: fullTrip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// ITINERARY CRUD
// -------------------------------------------------------------

apiRouter.get('/trips/:id/itinerary', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const trip = db.getTrip(String(req.params.id));
  if (!verifyTripOwnership(req, trip, res)) return;
  res.json({ success: true, itinerary: db.getItinerary(String(req.params.id)) });
});

apiRouter.post('/trips/:id/itinerary/item', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const { dayNumber, title, description, category, startTime, endTime, location, cost, isWeatherSensitive, lat, lng } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Activity title is required' });
    }

    const dayNum = Number(dayNumber) || 1;
    const itinerary = db.getItinerary(tripId);
    let day = itinerary.find(d => d.dayNumber === dayNum);
    if (!day) {
      day = {
        id: `day_${tripId}_${dayNum}`,
        tripId,
        dayNumber: dayNum,
        date: new Date().toISOString().split('T')[0],
        theme: `Day ${dayNum} Exploration`,
        items: []
      };
      itinerary.push(day);
    }

    const newItem: ItineraryItem = {
      id: `act_${Date.now()}`,
      dayId: day.id,
      tripId,
      title: title.trim(),
      description: description || '',
      category: category || 'Activity',
      startTime: startTime || '10:00 AM',
      endTime: endTime || '12:00 PM',
      location: location || trip!.destination,
      cost: Number(cost) || 0,
      status: 'Planned',
      isLocked: false,
      isUserModified: true,
      isWeatherSensitive: Boolean(isWeatherSensitive),
      lat: typeof lat === 'number' ? lat : 28.6139,
      lng: typeof lng === 'number' ? lng : 77.2090,
      orderIndex: day.items.length
    };

    day.items.push(newItem);
    db.setItinerary(tripId, itinerary);

    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.status(201).json({ success: true, trip: fullTrip, item: newItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/trips/:id/itinerary/item/:itemId', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const itemId = String(req.params.itemId);
    const itinerary = db.getItinerary(tripId);

    let foundItem: ItineraryItem | null = null;
    for (const day of itinerary) {
      const item = day.items.find(i => i.id === itemId);
      if (item) {
        Object.assign(item, req.body);
        item.isUserModified = true;
        foundItem = item;
        break;
      }
    }

    if (!foundItem) return res.status(404).json({ success: false, error: 'Activity item not found' });

    db.setItinerary(tripId, itinerary);
    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.json({ success: true, trip: fullTrip, item: foundItem });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/trips/:id/itinerary/item/:itemId', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const itemId = String(req.params.itemId);
    const itinerary = db.getItinerary(tripId);

    for (const day of itinerary) {
      day.items = day.items.filter(i => i.id !== itemId);
    }

    db.setItinerary(tripId, itinerary);
    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.json({ success: true, trip: fullTrip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/trips/:id/replan', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const fullData = DependencyEngine.getFullTripData(tripId);
    let optimized: ItineraryDay[];

    // If current itinerary is missing, has 0 days, or all days have 0 items, regenerate a complete full itinerary
    const needsFullGeneration = !fullData.itinerary || fullData.itinerary.length === 0 || fullData.itinerary.every(d => !d.items || d.items.length === 0);
    if (needsFullGeneration) {
      const generated = AIService.generateDoorToDoorTrip({
        origin: trip.origin,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        travellersCount: trip.travellersCount,
        budget: trip.budget,
        transportPreference: trip.transportPreference,
        accommodationPreference: trip.accommodationPreference,
        travelStyle: trip.travelStyle,
        interests: trip.interests
      });
      optimized = generated.itinerary;
      db.setItinerary(tripId, optimized);
      db.setWeather(tripId, generated.weather);
      db.setHiddenGems(tripId, generated.hiddenGems);
    } else {
      optimized = AIService.replanItinerary(fullData, req.body.reason);
      db.setItinerary(tripId, optimized);
    }

    const updated = DependencyEngine.getFullTripData(tripId);
    res.json({ success: true, trip: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/trips/:id/transports/:transportId', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const { departureTime, arrivalTime } = req.body;
    const transports = db.getTransports(tripId);
    const target = transports.find(t => t.id === req.params.transportId) || transports[0];

    if (target) {
      target.departureTime = departureTime || target.departureTime;
      if (arrivalTime) target.arrivalTime = arrivalTime;
      db.setTransports(tripId, transports);
    }

    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.json({ success: true, trip: fullTrip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// WEATHER SIMULATION (WHAT-IF)
// -------------------------------------------------------------

apiRouter.post('/trips/:id/weather/simulate', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const { dayNumber, condition, autoApplyAlternatives } = req.body;
    const fullTrip = DependencyEngine.handleWeatherChange(
      tripId,
      Number(dayNumber) || 2,
      condition || 'Heavy Rain',
      autoApplyAlternatives !== false
    );
    res.json({ success: true, trip: fullTrip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// HIDDEN GEMS
// -------------------------------------------------------------

apiRouter.get('/hidden-gems', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const city = String(req.query.city || '');
  const gems = TravelDataService.getHiddenGemsForDestination(city);
  res.json({ success: true, gems });
});

apiRouter.get('/trips/:id/hidden-gems', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const tripId = String(req.params.id);
  let gems = db.getHiddenGems(tripId);
  if (!gems || gems.length === 0) {
    const trip = db.getTrip(tripId);
    if (trip) {
      gems = TravelDataService.getHiddenGemsForDestination(trip.destination, tripId);
      db.setHiddenGems(tripId, gems);
    }
  }
  res.json({ success: true, gems });
});

apiRouter.post('/trips/:id/hidden-gems/add', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const { gemId, dayNumber, replaceItemId } = req.body;
    const fullTrip = DependencyEngine.handleAddHiddenGem(tripId, gemId, Number(dayNumber) || 2, replaceItemId);
    res.json({ success: true, trip: fullTrip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/trips/:id/itinerary/gem', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const { gemId, dayNumber, replaceItemId } = req.body;
    const fullTrip = DependencyEngine.handleAddHiddenGem(tripId, gemId, Number(dayNumber) || 2, replaceItemId);
    res.json({ success: true, trip: fullTrip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// -------------------------------------------------------------
// WHAT-IF SANDBOX
// -------------------------------------------------------------

apiRouter.post('/trips/:id/simulate', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const simulation = DependencyEngine.simulateScenario(tripId, req.body);
    res.json({ success: true, simulation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/trips/:id/simulate/apply', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const { simulatedTripData } = req.body;
    if (!simulatedTripData) return res.status(400).json({ success: false, error: 'simulatedTripData required' });

    db.saveTrip(simulatedTripData.trip);
    db.setMembers(tripId, simulatedTripData.members);
    db.setTransports(tripId, simulatedTripData.transports);
    db.setAccommodations(tripId, simulatedTripData.accommodations);
    db.setItinerary(tripId, simulatedTripData.itinerary);
    db.setExpenses(tripId, simulatedTripData.expenses);
    db.setBudget(tripId, simulatedTripData.budget);

    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.json({ success: true, trip: fullTrip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// AI COPILOT
// -------------------------------------------------------------

apiRouter.post('/trips/:id/copilot', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const { question } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    const fullTrip = DependencyEngine.getFullTripData(tripId);
    const answer = AIService.answerCopilot(fullTrip, question);

    res.json({
      success: true,
      answer,
      message: {
        id: `ai_${Date.now()}`,
        sender: 'copilot',
        text: answer,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to process copilot query' });
  }
});

// -------------------------------------------------------------
// RECALCULATE ENDPOINT
// -------------------------------------------------------------
apiRouter.post('/trips/:id/recalculate', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const tripId = String(req.params.id);
    const trip = db.getTrip(tripId);
    if (!verifyTripOwnership(req, trip, res)) return;

    const fullTrip = DependencyEngine.getFullTripData(tripId);
    res.json({ success: true, trip: fullTrip });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
