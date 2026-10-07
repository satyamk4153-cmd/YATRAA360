import { create } from 'zustand';
import {
  FullTripData,
  WeatherCondition,
  TrainResult,
  FlightResult,
  User,
  LoginCredentials,
  RegisterData,
  TripSummary,
  ExpenseSplit,
  TripCreationPayload,
  ItineraryActivity
} from '../types';
import { api } from '../services/api';

export type AppView =
  | 'auth'
  | 'landing'
  | 'dashboard'
  | 'create-trip'
  | 'door-to-door'
  | 'itinerary'
  | 'map'
  | 'group'
  | 'expenses'
  | 'budget'
  | 'what-if'
  | 'weather'
  | 'hidden-gems'
  | 'bookings'
  | 'copilot'
  | 'history';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface TripState {
  // Authentication State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  userTrips: TripSummary[];

  // App & Trip State
  currentTrip: FullTripData | null;
  activeView: AppView;
  isLoading: boolean;
  error: string | null;
  toasts: Toast[];

  // Cross-Page Destination & Transport Search State
  searchOrigin: string;
  searchDestination: string;
  searchDate: string;
  travelMode: 'Train' | 'Flight';
  selectedTrain: TrainResult | null;
  selectedFlight: FlightResult | null;

  // Auth Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  loadUserTrips: () => Promise<void>;

  // Trip & View Actions
  setView: (view: AppView) => void;
  loadDemoTrip: () => Promise<void>;
  loadTrip: (id: string) => Promise<void>;
  setCurrentTrip: (trip: FullTripData) => void;
  createTrip: (payload: TripCreationPayload) => Promise<void>;

  // Search actions
  setSearchOrigin: (origin: string) => void;
  setSearchDestination: (dest: string) => void;
  setSearchDate: (date: string) => void;
  setTravelMode: (mode: 'Train' | 'Flight') => void;
  swapSearchLocations: () => void;
  selectTrainAndApply: (train: TrainResult, classCode?: string) => Promise<void>;
  selectFlightAndApply: (flight: FlightResult) => Promise<void>;

  // Reactive Handlers
  updateTravellersCount: (count: number) => Promise<void>;
  updateBudget: (budget: number) => Promise<void>;
  addExpense: (expense: {
    title: string;
    amount: number;
    category: string;
    paidByMemberId?: string;
    splitType?: 'Equal' | 'Exact' | 'Custom';
    splits?: ExpenseSplit[];
    notes?: string;
  }) => Promise<void>;
  updateExpense: (
    id: string,
    expense: Partial<{
      title: string;
      amount: number;
      category: string;
      paidByMemberId: string;
      splitType?: 'Equal' | 'Exact' | 'Custom';
      splits?: ExpenseSplit[];
      notes: string;
    }>
  ) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateTransportTiming: (transportId: string, depTime: string, arrTime?: string) => Promise<void>;
  simulateWeather: (dayNumber: number, condition: WeatherCondition, autoApply?: boolean) => Promise<void>;
  addHiddenGem: (gemId: string, dayNumber?: number, replaceItemId?: string) => Promise<void>;
  replanItinerary: (reason?: string) => Promise<void>;
  updateItineraryItem: (itemId: string, patch: Partial<ItineraryActivity>) => Promise<void>;
  deleteItineraryItem: (itemId: string) => Promise<void>;
  addItineraryItem: (item: Partial<ItineraryActivity> & { dayNumber?: number }) => Promise<void>;
  addMember: (member: { name: string; email?: string; phone?: string; role?: string }) => Promise<void>;
  deleteMember: (memberId: string) => Promise<void>;

  // Toasts
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

// Initial stored values
const savedSearch = (() => {
  try {
    const raw = localStorage.getItem('yatra_search_state');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const initialToken = localStorage.getItem('yatra360_auth_token');

export const useTripStore = create<TripState>((set, get) => ({
  // Authentication State
  user: null,
  token: initialToken,
  isAuthenticated: !!initialToken,
  userTrips: [],

  currentTrip: null,
  activeView: initialToken ? 'dashboard' : 'auth',
  isLoading: false,
  error: null,
  toasts: [],

  // Default search values
  searchOrigin: savedSearch?.origin || 'Meerut',
  searchDestination: savedSearch?.destination || 'New Delhi',
  searchDate: savedSearch?.date || new Date().toISOString().split('T')[0],
  travelMode: savedSearch?.travelMode || 'Train',
  selectedTrain: null,
  selectedFlight: null,

  setView: (view) => set({ activeView: view }),

  addToast: (message, type = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },

  // Auth Operations
  checkAuth: async () => {
    const token = localStorage.getItem('yatra360_auth_token');
    if (!token) {
      set({ isAuthenticated: false, user: null, activeView: 'auth' });
      return;
    }
    try {
      const res = await api.getMe();
      if (res && res.user) {
        set({
          user: res.user,
          isAuthenticated: true,
          token
        });
        await get().loadUserTrips();
        // If currentTrip is not set yet, attempt to restore the most recent trip
        const trips = get().userTrips;
        if (!get().currentTrip && trips.length > 0) {
          await get().loadTrip(trips[0].id);
        }
      } else {
        localStorage.removeItem('yatra360_auth_token');
        set({ isAuthenticated: false, user: null, activeView: 'auth' });
      }
    } catch {
      localStorage.removeItem('yatra360_auth_token');
      set({ isAuthenticated: false, user: null, activeView: 'auth' });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.login(credentials);
      localStorage.setItem('yatra360_auth_token', res.token);
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        activeView: 'dashboard'
      });
      get().addToast(`Welcome back, ${res.user.name}!`, 'success');
      await get().loadUserTrips();
      const trips = get().userTrips;
      if (trips.length > 0) {
        await get().loadTrip(trips[0].id);
      }
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      set({ isLoading: false, error: errorMsg });
      get().addToast(errorMsg, 'error');
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.register(data);
      localStorage.setItem('yatra360_auth_token', res.token);
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
        activeView: 'dashboard',
        userTrips: [],
        currentTrip: null
      });
      get().addToast(`Account created successfully! Welcome to Yatraa360.`, 'success');
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed';
      set({ isLoading: false, error: errorMsg });
      get().addToast(errorMsg, 'error');
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('yatra360_auth_token');
    localStorage.removeItem('yatra360_active_trip');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      currentTrip: null,
      userTrips: [],
      activeView: 'auth'
    });
    get().addToast('Signed out successfully.', 'info');
  },

  loadUserTrips: async () => {
    try {
      const trips = await api.getTrips();
      set({ userTrips: trips });
    } catch {
      set({ userTrips: [] });
    }
  },

  setCurrentTrip: (trip) => {
    set({
      currentTrip: trip,
      searchOrigin: trip.trip.origin || get().searchOrigin,
      searchDestination: trip.trip.destination || get().searchDestination
    });
    try {
      localStorage.setItem('yatra360_active_trip', JSON.stringify(trip));
    } catch {
      // Ignore storage errors
    }
  },

  setSearchOrigin: (origin) => {
    set({ searchOrigin: origin });
    try {
      const state = {
        origin,
        destination: get().searchDestination,
        date: get().searchDate,
        travelMode: get().travelMode
      };
      localStorage.setItem('yatra_search_state', JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  },

  setSearchDestination: (dest) => {
    set({ searchDestination: dest });
    try {
      const state = {
        origin: get().searchOrigin,
        destination: dest,
        date: get().searchDate,
        travelMode: get().travelMode
      };
      localStorage.setItem('yatra_search_state', JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  },

  setSearchDate: (date) => {
    set({ searchDate: date });
    try {
      const state = {
        origin: get().searchOrigin,
        destination: get().searchDestination,
        date,
        travelMode: get().travelMode
      };
      localStorage.setItem('yatra_search_state', JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  },

  setTravelMode: (mode) => {
    set({ travelMode: mode });
    try {
      const state = {
        origin: get().searchOrigin,
        destination: get().searchDestination,
        date: get().searchDate,
        travelMode: mode
      };
      localStorage.setItem('yatra_search_state', JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  },

  swapSearchLocations: () => {
    const { searchOrigin, searchDestination } = get();
    set({
      searchOrigin: searchDestination,
      searchDestination: searchOrigin
    });
    get().addToast(`Swapped route: ${searchDestination} ➔ ${searchOrigin}`, 'info');
  },

  selectTrainAndApply: async (train, classCode) => {
    set({ selectedTrain: train, selectedFlight: null });
    const trip = get().currentTrip;
    const selectedClass = train.classes.find((c) => c.classCode === classCode) || train.classes[0];
    const fare = (selectedClass?.fare || 450) * (trip?.trip.travellersCount || 1);

    if (trip) {
      try {
        const updated = await api.selectTransport(trip.trip.id, {
          transportType: 'Train',
          provider: `${train.trainName} (${train.trainNumber})`,
          identifier: train.trainNumber,
          departureStation: `${train.fromStationName} (${train.fromStationCode})`,
          arrivalStation: `${train.toStationName} (${train.toStationCode})`,
          departureTime: train.departureTime,
          arrivalTime: train.arrivalTime,
          price: fare,
          status: 'Selected'
        });
        set({ currentTrip: updated });
        get().addToast(
          `Selected ${train.trainName} (${selectedClass?.classCode} - ₹${fare.toLocaleString('en-IN')}). Journey updated!`,
          'success'
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to select transport';
        get().addToast(msg, 'error');
      }
    } else {
      get().addToast(`Selected ${train.trainName} (${selectedClass?.classCode})`, 'success');
    }
  },

  selectFlightAndApply: async (flight) => {
    set({ selectedFlight: flight, selectedTrain: null });
    const trip = get().currentTrip;
    const totalFare = flight.fare * (trip?.trip.travellersCount || 1);

    if (trip) {
      try {
        const updated = await api.selectTransport(trip.trip.id, {
          transportType: 'Flight',
          provider: `${flight.airline} (${flight.flightNumber})`,
          identifier: flight.flightNumber,
          departureStation: `${flight.fromAirportName} (${flight.fromAirportCode})`,
          arrivalStation: `${flight.toAirportName} (${flight.toAirportCode})`,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          price: totalFare,
          status: 'Selected'
        });
        set({ currentTrip: updated });
        get().addToast(
          `Selected ${flight.airline} ${flight.flightNumber} (₹${totalFare.toLocaleString('en-IN')}). Journey updated!`,
          'success'
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to select transport';
        get().addToast(msg, 'error');
      }
    } else {
      get().addToast(`Selected ${flight.airline} ${flight.flightNumber}`, 'success');
    }
  },

  loadDemoTrip: async () => {
    set({ isLoading: true, error: null });
    try {
      const trip = await api.getDemoTrip();
      set({
        currentTrip: trip,
        searchOrigin: trip.trip.origin,
        searchDestination: trip.trip.destination,
        activeView: 'dashboard',
        isLoading: false
      });
      get().addToast(`Loaded ${trip.trip.origin} ➔ ${trip.trip.destination} Demo Journey`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not load demo trip';
      set({ error: msg, isLoading: false });
      get().addToast('Could not load demo trip', 'error');
    }
  },

  loadTrip: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const trip = await api.getTrip(id);
      set({
        currentTrip: trip,
        searchOrigin: trip.trip.origin,
        searchDestination: trip.trip.destination,
        isLoading: false
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load trip';
      set({ error: msg, isLoading: false });
    }
  },

  createTrip: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const trip = await api.createTrip(payload);
      set({
        currentTrip: trip,
        searchOrigin: trip.trip.origin,
        searchDestination: trip.trip.destination,
        activeView: 'dashboard',
        isLoading: false
      });
      await get().loadUserTrips();
      get().addToast(`Created journey to ${trip.trip.destination}!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create trip';
      set({ error: msg, isLoading: false });
      get().addToast('Failed to create trip', 'error');
    }
  },

  updateTravellersCount: async (count) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.updateTrip(trip.trip.id, { travellersCount: count });
      set({ currentTrip: updated });
      get().addToast(`Traveller count updated to ${count}. Rooms & splits recalculated.`, 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      get().addToast(msg, 'error');
    }
  },

  updateBudget: async (budget) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.updateTrip(trip.trip.id, { budget });
      set({ currentTrip: updated });
      get().addToast(`Total budget updated to ₹${budget.toLocaleString('en-IN')}. Remaining balance recalculated.`, 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      get().addToast(msg, 'error');
    }
  },

  addExpense: async (expense) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.addExpense(trip.trip.id, expense);
      set({ currentTrip: updated });
      get().addToast(
        `Added ₹${expense.amount.toLocaleString('en-IN')} expense (${expense.category}). Real-time budget & settlement updated!`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add expense';
      get().addToast(msg, 'error');
    }
  },

  updateExpense: async (id, expense) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.updateExpense(trip.trip.id, id, expense);
      set({ currentTrip: updated });
      get().addToast('Expense updated and budget & settlement refreshed.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update expense';
      get().addToast(msg, 'error');
    }
  },

  deleteExpense: async (id) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.deleteExpense(trip.trip.id, id);
      set({ currentTrip: updated });
      get().addToast('Expense removed and settlement recalculated.', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete expense';
      get().addToast(msg, 'error');
    }
  },

  updateTransportTiming: async (transportId, depTime, arrTime) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.updateTransportTiming(trip.trip.id, transportId, depTime, arrTime);
      set({ currentTrip: updated });
      get().addToast(`Transport timing shifted to ${depTime}. Schedule updated.`, 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update timing';
      get().addToast(msg, 'error');
    }
  },

  simulateWeather: async (dayNumber, condition, autoApply = true) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.simulateWeather(trip.trip.id, dayNumber, condition, autoApply);
      set({ currentTrip: updated });
      get().addToast(`Simulated ${condition} on Day ${dayNumber}. Weather alternatives updated.`, 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to simulate weather';
      get().addToast(msg, 'error');
    }
  },

  addHiddenGem: async (gemId, dayNumber = 2, replaceItemId) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.addHiddenGem(trip.trip.id, gemId, dayNumber, replaceItemId);
      set({ currentTrip: updated });
      get().addToast('Location integrated into itinerary.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add location';
      get().addToast(msg, 'error');
    }
  },

  replanItinerary: async (reason) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.replanItinerary(trip.trip.id, reason);
      set({ currentTrip: updated });
      get().addToast('Itinerary optimized while preserving your custom items.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to replan itinerary';
      get().addToast(msg, 'error');
    }
  },

  updateItineraryItem: async (itemId, patch) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.updateItineraryItem(trip.trip.id, itemId, patch);
      set({ currentTrip: updated });
      get().addToast('Itinerary activity updated.', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update activity';
      get().addToast(msg, 'error');
    }
  },

  deleteItineraryItem: async (itemId) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.deleteItineraryItem(trip.trip.id, itemId);
      set({ currentTrip: updated });
      get().addToast('Activity removed from itinerary.', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete activity';
      get().addToast(msg, 'error');
    }
  },

  addItineraryItem: async (item) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.addItineraryItem(trip.trip.id, item);
      set({ currentTrip: updated });
      get().addToast('Custom activity added.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add activity';
      get().addToast(msg, 'error');
    }
  },

  addMember: async (member) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.addMember(trip.trip.id, member);
      set({ currentTrip: updated });
      get().addToast(`Added ${member.name}. Expense settlement updated.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add member';
      get().addToast(msg, 'error');
    }
  },

  deleteMember: async (memberId) => {
    const trip = get().currentTrip;
    if (!trip) return;
    try {
      const updated = await api.deleteMember(trip.trip.id, memberId);
      set({ currentTrip: updated });
      get().addToast('Member removed and group settlement recalculated.', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete member';
      get().addToast(msg, 'error');
    }
  }
}));
