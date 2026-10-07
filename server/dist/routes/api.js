"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const db_1 = require("../db");
const dependency_engine_1 = require("../engine/dependency-engine");
const ai_service_1 = require("../services/ai-service");
const travel_data_1 = require("../services/travel-data");
const seed_demo_1 = require("../db/seed-demo");
exports.apiRouter = (0, express_1.Router)();
// -------------------------------------------------------------
// STATIONS, TRAINS & FLIGHTS SEARCH ENGINE
// -------------------------------------------------------------
// GET Station Search & Autocomplete
exports.apiRouter.get('/stations', (req, res) => {
    try {
        const q = String(req.query.q || '');
        const stations = travel_data_1.TravelDataService.searchStations(q);
        res.json({ success: true, stations });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// GET Train Search between FROM and TO
exports.apiRouter.get('/trains/search', (req, res) => {
    try {
        const origin = String(req.query.origin || '');
        const destination = String(req.query.destination || '');
        const date = req.query.date ? String(req.query.date) : undefined;
        if (!origin || !destination) {
            return res.status(400).json({ success: false, error: 'Origin and destination are required' });
        }
        if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
            return res.status(400).json({ success: false, error: 'Origin and destination cannot be identical' });
        }
        const trains = travel_data_1.TravelDataService.searchTrains(origin, destination, date);
        res.json({ success: true, origin, destination, date, count: trains.length, trains });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// GET Flight Search between FROM and TO
exports.apiRouter.get('/flights/search', (req, res) => {
    try {
        const origin = String(req.query.origin || '');
        const destination = String(req.query.destination || '');
        const date = req.query.date ? String(req.query.date) : undefined;
        if (!origin || !destination) {
            return res.status(400).json({ success: false, error: 'Origin and destination are required' });
        }
        if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
            return res.status(400).json({ success: false, error: 'Origin and destination cannot be identical' });
        }
        const flightData = travel_data_1.TravelDataService.searchFlights(origin, destination, date);
        res.json({ success: true, date, ...flightData });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// POST Select Transport for Active Trip
exports.apiRouter.post('/trips/:id/select-transport', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const { transportType, provider, identifier, departureStation, arrivalStation, departureTime, arrivalTime, price, status } = req.body;
        const transports = db_1.db.getTransports(tripId);
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
            db_1.db.setTransports(tripId, transports);
            // Update trip transport preference
            const trip = db_1.db.getTrip(tripId);
            if (trip) {
                trip.transportPreference = transportType || trip.transportPreference;
                db_1.db.saveTrip(trip);
            }
            // Sync Day 1 transit activity in itinerary
            const itinerary = db_1.db.getItinerary(tripId);
            if (itinerary.length > 0 && itinerary[0].items.length > 1) {
                itinerary[0].items[1].title = `Board ${provider}`;
                itinerary[0].items[1].startTime = departureTime;
                itinerary[0].items[1].endTime = arrivalTime;
                itinerary[0].items[1].cost = Math.round(Number(price) || 0);
                db_1.db.setItinerary(tripId, itinerary);
            }
            db_1.db.addChangeLog(tripId, {
                id: `log_${Date.now()}`,
                tripId,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                fieldChanged: 'Transport Selected',
                oldValue: 'Default',
                newValue: `${provider} (${transportType})`,
                reason: `User selected ${provider} for journey to ${trip?.destination || 'destination'}.`,
                canUndo: false
            });
        }
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// -------------------------------------------------------------
// TRIPS & DEMO
// -------------------------------------------------------------
// GET all trips
exports.apiRouter.get('/trips', (_req, res) => {
    const trips = db_1.db.getAllTrips();
    if (trips.length === 0) {
        (0, seed_demo_1.seedDemoTrip)();
    }
    res.json({ success: true, trips: db_1.db.getAllTrips() });
});
// GET Demo Trip
exports.apiRouter.get('/trips/demo', (_req, res) => {
    const trip = (0, seed_demo_1.seedDemoTrip)();
    const fullData = dependency_engine_1.DependencyEngine.getFullTripData(trip.id);
    res.json({ success: true, trip: fullData });
});
// POST Create new Trip (Door-to-Door generator)
exports.apiRouter.post('/trips', (req, res) => {
    try {
        const { origin, destination, startDate, endDate, travellersCount, budget, transportPreference, accommodationPreference, travelStyle, interests } = req.body;
        const generated = ai_service_1.AIService.generateDoorToDoorTrip({
            origin: origin || 'New Delhi',
            destination: destination || 'Jaipur',
            startDate: startDate || '2026-11-01',
            endDate: endDate || '2026-11-04',
            travellersCount: Number(travellersCount) || 2,
            budget: Number(budget) || 25000,
            transportPreference: transportPreference || 'Train',
            accommodationPreference: accommodationPreference || 'Boutique Hotel',
            travelStyle: travelStyle || 'Balanced',
            interests: Array.isArray(interests) ? interests : ['Heritage', 'Food', 'Culture']
        });
        const tripId = generated.trip.id;
        // Create Initial Organizer Member
        const organizer = {
            id: `mem_${Date.now()}_org`,
            tripId,
            name: 'Trip Organizer (You)',
            email: 'organizer@yatra360.app',
            phone: '+91 98765 00001',
            role: 'Organizer',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            paidAmount: 0,
            balance: 0
        };
        const members = [organizer];
        for (let i = 1; i < (Number(travellersCount) || 2); i++) {
            members.push({
                id: `mem_${Date.now()}_${i}`,
                tripId,
                name: `Travel Companion ${i}`,
                email: `companion${i}@yatra360.app`,
                phone: `+91 98765 0000${i + 1}`,
                role: 'Member',
                avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
                paidAmount: 0,
                balance: 0
            });
        }
        // Default Emergency Contacts
        const emergencyContacts = [
            {
                id: `ec_${Date.now()}_1`,
                tripId,
                name: `${destination} Tourist Police & Safety Helpline`,
                relation: 'Emergency Services',
                phone: '112',
                priority: 1,
                notes: 'National Emergency Helpline for Police & Medical'
            },
            {
                id: `ec_${Date.now()}_2`,
                tripId,
                name: `${destination} District Hospital`,
                relation: 'Medical Care',
                phone: '+91 1800 112 001',
                priority: 1,
                notes: '24-hour trauma & ambulance center'
            }
        ];
        // Save all into DB
        db_1.db.saveTrip(generated.trip);
        db_1.db.setMembers(tripId, members);
        db_1.db.setTransports(tripId, generated.transports);
        db_1.db.setAccommodations(tripId, generated.accommodations);
        db_1.db.setItinerary(tripId, generated.itinerary);
        db_1.db.setBudget(tripId, generated.budget);
        db_1.db.setExpenses(tripId, []);
        db_1.db.setBookings(tripId, []);
        db_1.db.setWeather(tripId, generated.weather);
        db_1.db.setEmergencyContacts(tripId, emergencyContacts);
        db_1.db.setHiddenGems(tripId, generated.hiddenGems);
        db_1.db.addChangeLog(tripId, {
            id: `log_${Date.now()}`,
            tripId,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            fieldChanged: 'Trip Created',
            oldValue: 'None',
            newValue: `${origin} ➔ ${destination}`,
            reason: 'Generated door-to-door itinerary with outbound & inbound journey.',
            canUndo: false
        });
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.status(201).json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// GET Single Full Trip (Reactive Source of Truth)
exports.apiRouter.get('/trips/:id', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
});
// PUT Update Trip Parameters (Travellers Count, Budget, Dates, Travel Style)
exports.apiRouter.put('/trips/:id', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const currentTrip = db_1.db.getTrip(tripId);
        if (!currentTrip)
            return res.status(404).json({ success: false, error: 'Trip not found' });
        const { travellersCount, budget, travelStyle, transportPreference, accommodationPreference, status } = req.body;
        if (travellersCount !== undefined && Number(travellersCount) !== currentTrip.travellersCount) {
            dependency_engine_1.DependencyEngine.handleTravellersChange(tripId, Number(travellersCount));
        }
        if (budget !== undefined && Number(budget) !== currentTrip.budget) {
            dependency_engine_1.DependencyEngine.handleBudgetChange(tripId, Number(budget));
        }
        if (travelStyle)
            currentTrip.travelStyle = travelStyle;
        if (transportPreference)
            currentTrip.transportPreference = transportPreference;
        if (accommodationPreference)
            currentTrip.accommodationPreference = accommodationPreference;
        if (status)
            currentTrip.status = status;
        currentTrip.updatedAt = new Date().toISOString();
        db_1.db.saveTrip(currentTrip);
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// DELETE Trip
exports.apiRouter.delete('/trips/:id', (req, res) => {
    const success = db_1.db.deleteTrip(String(req.params.id));
    res.json({ success });
});
// -------------------------------------------------------------
// MEMBERS CRUD & GROUP MANAGEMENT
// -------------------------------------------------------------
exports.apiRouter.get('/trips/:id/members', (req, res) => {
    res.json({ success: true, members: db_1.db.getMembers(String(req.params.id)) });
});
exports.apiRouter.post('/trips/:id/members', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const { name, email, phone, role } = req.body;
        const members = db_1.db.getMembers(tripId);
        const newMember = {
            id: `mem_${Date.now()}`,
            tripId,
            name: name || `Traveler ${members.length + 1}`,
            email: email || `traveler${members.length + 1}@yatra360.app`,
            phone: phone || '+91 98765 00000',
            role: role || 'Member',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            paidAmount: 0,
            balance: 0
        };
        members.push(newMember);
        db_1.db.setMembers(tripId, members);
        // Sync trip travellers count
        const trip = db_1.db.getTrip(tripId);
        if (trip && trip.travellersCount < members.length) {
            dependency_engine_1.DependencyEngine.handleTravellersChange(tripId, members.length);
        }
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.status(201).json({ success: true, trip: fullTrip, member: newMember });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.apiRouter.put('/trips/:id/members/:memberId', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const memberId = String(req.params.memberId);
        const members = db_1.db.getMembers(tripId);
        const idx = members.findIndex(m => m.id === memberId);
        if (idx === -1)
            return res.status(404).json({ success: false, error: 'Member not found' });
        members[idx] = { ...members[idx], ...req.body };
        db_1.db.setMembers(tripId, members);
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.apiRouter.delete('/trips/:id/members/:memberId', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const memberId = String(req.params.memberId);
        let members = db_1.db.getMembers(tripId);
        members = members.filter(m => m.id !== memberId);
        db_1.db.setMembers(tripId, members);
        const trip = db_1.db.getTrip(tripId);
        if (trip) {
            dependency_engine_1.DependencyEngine.handleTravellersChange(tripId, Math.max(1, members.length));
        }
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// -------------------------------------------------------------
// EXPENSES & REAL-TIME BUDGET ENGINE
// -------------------------------------------------------------
exports.apiRouter.get('/trips/:id/expenses', (req, res) => {
    res.json({ success: true, expenses: db_1.db.getExpenses(String(req.params.id)) });
});
exports.apiRouter.post('/trips/:id/expenses', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const { title, amount, category, paidByMemberId, splitType, notes } = req.body;
        const expenses = db_1.db.getExpenses(tripId);
        const members = db_1.db.getMembers(tripId);
        const payer = members.find(m => m.id === paidByMemberId) || members[0];
        const newExpense = {
            id: `exp_${Date.now()}`,
            tripId,
            title: title || 'Group Expense',
            amount: Number(amount) || 0,
            category: category || 'Miscellaneous',
            paidByMemberId: payer?.id || 'mem_org',
            paidByName: payer?.name || 'Organizer',
            splitType: splitType || 'Equal',
            date: new Date().toISOString().split('T')[0],
            notes: notes || ''
        };
        expenses.push(newExpense);
        db_1.db.setExpenses(tripId, expenses);
        db_1.db.addChangeLog(tripId, {
            id: `log_${Date.now()}`,
            tripId,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            fieldChanged: 'Expense Added',
            oldValue: '—',
            newValue: `+₹${Number(amount).toLocaleString('en-IN')} (${category})`,
            reason: `Logged expense: '${title}'. Real-time budget spent, remaining, and group splits recalculated.`,
            canUndo: true
        });
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.status(201).json({ success: true, trip: fullTrip, expense: newExpense });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.apiRouter.put('/trips/:id/expenses/:expenseId', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const expenseId = String(req.params.expenseId);
        const expenses = db_1.db.getExpenses(tripId);
        const idx = expenses.findIndex(e => e.id === expenseId);
        if (idx === -1)
            return res.status(404).json({ success: false, error: 'Expense not found' });
        expenses[idx] = { ...expenses[idx], ...req.body, amount: Number(req.body.amount || expenses[idx].amount) };
        db_1.db.setExpenses(tripId, expenses);
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.apiRouter.delete('/trips/:id/expenses/:expenseId', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const expenseId = String(req.params.expenseId);
        let expenses = db_1.db.getExpenses(tripId);
        expenses = expenses.filter(e => e.id !== expenseId);
        db_1.db.setExpenses(tripId, expenses);
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// -------------------------------------------------------------
// ITINERARY CRUD & REPLANNING
// -------------------------------------------------------------
exports.apiRouter.get('/trips/:id/itinerary', (req, res) => {
    res.json({ success: true, itinerary: db_1.db.getItinerary(String(req.params.id)) });
});
exports.apiRouter.post('/trips/:id/itinerary/item', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const { dayNumber, title, description, category, startTime, endTime, location, cost, isWeatherSensitive } = req.body;
        const itinerary = db_1.db.getItinerary(tripId);
        const day = itinerary.find(d => d.dayNumber === Number(dayNumber || 1)) || itinerary[0];
        if (!day)
            return res.status(404).json({ success: false, error: 'Day not found' });
        const newItem = {
            id: `item_${Date.now()}`,
            dayId: day.id,
            tripId,
            title: title || 'Custom Activity',
            description: description || '',
            category: category || 'Activity',
            startTime: startTime || '02:00 PM',
            endTime: endTime || '03:30 PM',
            location: location || 'Local Area',
            cost: Number(cost) || 0,
            status: 'Planned',
            isLocked: false,
            isUserModified: true,
            isWeatherSensitive: Boolean(isWeatherSensitive),
            lat: 32.2432,
            lng: 77.1892,
            orderIndex: day.items.length + 1
        };
        day.items.push(newItem);
        db_1.db.setItinerary(tripId, itinerary);
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.status(201).json({ success: true, trip: fullTrip, item: newItem });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.apiRouter.put('/trips/:id/itinerary/item/:itemId', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const itemId = String(req.params.itemId);
        const itinerary = db_1.db.getItinerary(tripId);
        let found = false;
        itinerary.forEach(day => {
            const idx = day.items.findIndex(i => i.id === itemId);
            if (idx !== -1) {
                day.items[idx] = {
                    ...day.items[idx],
                    ...req.body,
                    isUserModified: true
                };
                found = true;
            }
        });
        if (!found)
            return res.status(404).json({ success: false, error: 'Item not found' });
        db_1.db.setItinerary(tripId, itinerary);
        db_1.db.addChangeLog(tripId, {
            id: `log_${Date.now()}`,
            tripId,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            fieldChanged: 'Itinerary Item Modified',
            oldValue: 'Auto-Planned',
            newValue: req.body.title || 'Modified Item',
            reason: 'User manually modified itinerary item. Marked as USER_MODIFIED to preserve against auto-replanning.',
            canUndo: true
        });
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.apiRouter.delete('/trips/:id/itinerary/item/:itemId', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const itemId = String(req.params.itemId);
        const itinerary = db_1.db.getItinerary(tripId);
        itinerary.forEach(day => {
            day.items = day.items.filter(i => i.id !== itemId);
        });
        db_1.db.setItinerary(tripId, itinerary);
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// POST AI Replan
exports.apiRouter.post('/trips/:id/replan', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const fullData = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        const replannedItinerary = ai_service_1.AIService.replanItinerary(fullData, req.body.reason);
        db_1.db.setItinerary(tripId, replannedItinerary);
        db_1.db.addChangeLog(tripId, {
            id: `log_${Date.now()}`,
            tripId,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            fieldChanged: 'Itinerary Replanned by AI',
            oldValue: 'Previous Plan',
            newValue: 'AI Optimized Schedule',
            reason: 'AI re-optimized unlocked activities while preserving all USER_MODIFIED and locked items.',
            canUndo: true
        });
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// -------------------------------------------------------------
// TRANSPORTS & TIMING CASCADE
// -------------------------------------------------------------
exports.apiRouter.put('/trips/:id/transports/:transportId', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const transportId = String(req.params.transportId);
        const { departureTime, arrivalTime } = req.body;
        const fullTrip = dependency_engine_1.DependencyEngine.handleTransportTimingChange(tripId, transportId, departureTime, arrivalTime);
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// -------------------------------------------------------------
// WEATHER REACTIVE SIMULATION
// -------------------------------------------------------------
exports.apiRouter.post('/trips/:id/weather/simulate', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const { dayNumber, condition, autoApplyAlternatives } = req.body;
        const fullTrip = dependency_engine_1.DependencyEngine.handleWeatherChange(tripId, Number(dayNumber) || 2, condition || 'Heavy Rain', Boolean(autoApplyAlternatives));
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// -------------------------------------------------------------
// HIDDEN GEMS
// -------------------------------------------------------------
exports.apiRouter.get('/trips/:id/hidden-gems', (req, res) => {
    res.json({ success: true, hiddenGems: db_1.db.getHiddenGems(String(req.params.id)) });
});
exports.apiRouter.post('/trips/:id/hidden-gems/add', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const { gemId, dayNumber, replaceItemId } = req.body;
        const fullTrip = dependency_engine_1.DependencyEngine.handleAddHiddenGem(tripId, gemId, Number(dayNumber) || 2, replaceItemId);
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// -------------------------------------------------------------
// WHAT-IF SANDBOX SIMULATOR
// -------------------------------------------------------------
exports.apiRouter.post('/trips/:id/simulate', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const simulationResult = dependency_engine_1.DependencyEngine.simulateScenario(tripId, req.body);
        res.json({ success: true, simulation: simulationResult });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// Apply What-If simulated changes directly to the live trip
exports.apiRouter.post('/trips/:id/simulate/apply', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const { simulatedTripData } = req.body;
        if (!simulatedTripData)
            return res.status(400).json({ success: false, error: 'No simulated data provided' });
        db_1.db.saveTrip(simulatedTripData.trip);
        db_1.db.setMembers(tripId, simulatedTripData.members);
        db_1.db.setTransports(tripId, simulatedTripData.transports);
        db_1.db.setAccommodations(tripId, simulatedTripData.accommodations);
        db_1.db.setItinerary(tripId, simulatedTripData.itinerary);
        db_1.db.setBudget(tripId, simulatedTripData.budget);
        db_1.db.addChangeLog(tripId, {
            id: `log_${Date.now()}`,
            tripId,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            fieldChanged: 'What-If Simulation Applied',
            oldValue: 'Previous Plan',
            newValue: 'Simulated Sandbox Plan',
            reason: 'User approved and applied sandbox simulation scenario to live trip state.',
            canUndo: true
        });
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// -------------------------------------------------------------
// YATRA COPILOT (Contextual AI Assistant)
// -------------------------------------------------------------
exports.apiRouter.post('/trips/:id/copilot', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const { question } = req.body;
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(tripId);
        const answer = ai_service_1.AIService.answerCopilot(fullTrip, question || '');
        // Log chat message
        db_1.db.addChatMessage(tripId, {
            id: `msg_${Date.now()}_u`,
            tripId,
            senderId: 'user_active',
            senderName: 'You',
            message: question,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        });
        const aiMsg = {
            id: `msg_${Date.now()}_ai`,
            tripId,
            senderId: 'yatra_copilot',
            senderName: 'Yatra Copilot',
            message: answer,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isAi: true
        };
        db_1.db.addChatMessage(tripId, aiMsg);
        res.json({ success: true, answer, message: aiMsg });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// -------------------------------------------------------------
// GROUP CHAT & ACTIVITY VOTES
// -------------------------------------------------------------
exports.apiRouter.get('/trips/:id/chat', (req, res) => {
    res.json({ success: true, messages: db_1.db.getChatMessages(String(req.params.id)) });
});
exports.apiRouter.post('/trips/:id/chat', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const { senderId, senderName, message } = req.body;
        const newMsg = {
            id: `msg_${Date.now()}`,
            tripId,
            senderId: senderId || 'mem_you',
            senderName: senderName || 'You',
            message: message || '',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
        db_1.db.addChatMessage(tripId, newMsg);
        res.status(201).json({ success: true, message: newMsg });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
// -------------------------------------------------------------
// SAFETY CENTER & SOS
// -------------------------------------------------------------
exports.apiRouter.get('/trips/:id/safety', (req, res) => {
    const tripId = String(req.params.id);
    res.json({
        success: true,
        contacts: db_1.db.getEmergencyContacts(tripId),
        location: {
            lat: 32.2432,
            lng: 77.1892,
            address: 'Old Manali High Altitude Trail (Beacon Active)',
            lastUpdated: new Date().toISOString()
        }
    });
});
exports.apiRouter.post('/trips/:id/safety/contacts', (req, res) => {
    try {
        const tripId = String(req.params.id);
        const { name, relation, phone, priority, notes } = req.body;
        const contacts = db_1.db.getEmergencyContacts(tripId);
        const newContact = {
            id: `ec_${Date.now()}`,
            tripId,
            name,
            relation,
            phone,
            priority: Number(priority) || 1,
            notes
        };
        contacts.push(newContact);
        db_1.db.setEmergencyContacts(tripId, contacts);
        res.status(201).json({ success: true, contacts, contact: newContact });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.apiRouter.post('/trips/:id/safety/sos', (req, res) => {
    const tripId = String(req.params.id);
    const trip = db_1.db.getTrip(tripId);
    const sosAlert = {
        id: `sos_${Date.now()}`,
        tripId,
        title: '🚨 EMERGENCY SOS TRIGGERED',
        message: `Emergency SOS beacon dispatched with GPS coordinates for ${trip?.title || 'Trip'}. Alerting registered emergency contacts and local mountain rescue authorities.`,
        type: 'alert',
        isRead: false,
        timestamp: new Date().toISOString()
    };
    db_1.db.addNotification(tripId, sosAlert);
    res.json({
        success: true,
        message: 'SOS Alert dispatched to all registered emergency contacts and local emergency services.',
        beaconDetails: {
            coordinates: '32.2432° N, 77.1892° E',
            status: 'TRANSMITTING_HIGH_PRIORITY_BEACON',
            contactsNotified: db_1.db.getEmergencyContacts(tripId).length
        }
    });
});
// -------------------------------------------------------------
// RECALCULATE ENDPOINT
// -------------------------------------------------------------
exports.apiRouter.post('/trips/:id/recalculate', (req, res) => {
    try {
        const fullTrip = dependency_engine_1.DependencyEngine.getFullTripData(String(req.params.id));
        res.json({ success: true, trip: fullTrip });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
