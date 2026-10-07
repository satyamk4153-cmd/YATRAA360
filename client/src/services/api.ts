import {
  FullTripData,
  WhatIfScenarioInput,
  WhatIfSimulationResult,
  WeatherCondition,
  Station,
  TrainResult,
  FlightSearchResponse,
  AuthResponse,
  AuthUser,
  WeatherForecastResponse,
  GeocodedLocation,
  RouteResponse,
  Trip,
  ExpenseCategory,
  ExpenseSplit,
  TripCreationPayload
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

function getAuthHeader(): Record<string, string> {
  try {
    const token = localStorage.getItem('yatra360_auth_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Ignore storage errors
  }
  return {};
}

export const api = {
  // -------------------------------------------------------------
  // AUTHENTICATION
  // -------------------------------------------------------------
  async register(
    nameOrData: string | { name: string; email: string; password: string },
    emailArg?: string,
    passwordArg?: string
  ): Promise<AuthResponse> {
    const payload =
      typeof nameOrData === 'object'
        ? nameOrData
        : { name: nameOrData, email: emailArg, password: passwordArg };

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(
    emailOrCreds: string | { email: string; password: string },
    passwordArg?: string
  ): Promise<AuthResponse> {
    const payload =
      typeof emailOrCreds === 'object'
        ? emailOrCreds
        : { email: emailOrCreds, password: passwordArg };

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid credentials');
    return data;
  },

  async getMe(): Promise<{ user: AuthUser }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to authenticate');
    return data;
  },

  // -------------------------------------------------------------
  // TRIPS & REPAIR
  // -------------------------------------------------------------
  async getDemoTrip(): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/demo`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load demo trip');
    const data = await res.json();
    return data.trip;
  },

  async getTrip(id: string): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Trip ${id} not found`);
    }
    const data = await res.json();
    return data.trip;
  },

  async getTrips(): Promise<Trip[]> {
    const res = await fetch(`${API_BASE}/trips`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to list trips');
    const data = await res.json();
    return data.trips || [];
  },

  async createTrip(payload: TripCreationPayload): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create trip');
    return data.trip;
  },

  async updateTrip(
    id: string,
    payload: Partial<{
      travellersCount: number;
      budget: number;
      travelStyle: string;
      transportPreference: string;
      accommodationPreference: string;
      status: string;
    }>
  ): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update trip');
    return data.trip;
  },

  async deleteTrip(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return res.ok;
  },

  // -------------------------------------------------------------
  // MEMBERS CRUD
  // -------------------------------------------------------------
  async addMember(
    tripId: string,
    member: { name: string; email?: string; phone?: string; role?: string }
  ): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(member)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add member');
    return data.trip;
  },

  async deleteMember(tripId: string, memberId: string): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/members/${memberId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete member');
    return data.trip;
  },

  // -------------------------------------------------------------
  // EXPENSES & GROUP SPLITS CRUD
  // -------------------------------------------------------------
  async addExpense(
    tripId: string,
    expense: {
      title: string;
      amount: number;
      category: string;
      paidByMemberId?: string;
      splitType?: 'Equal' | 'Exact' | 'Custom';
      splits?: ExpenseSplit[];
      notes?: string;
    }
  ): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(expense)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add expense');
    return data.trip;
  },

  async updateExpense(
    tripId: string,
    expenseId: string,
    payload: Partial<{
      title: string;
      amount: number;
      category: string;
      paidByMemberId: string;
      splitType: 'Equal' | 'Exact' | 'Custom';
      splits: ExpenseSplit[];
      notes: string;
    }>
  ): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/expenses/${expenseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update expense');
    return data.trip;
  },

  async deleteExpense(tripId: string, expenseId: string): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete expense');
    return data.trip;
  },

  // -------------------------------------------------------------
  // REAL WEATHER API
  // -------------------------------------------------------------
  async getWeatherForecast(
    latOrParams: number | { lat: number; lng: number; destination?: string; startDate?: string; endDate?: string },
    lngArg?: number,
    destArg: string = 'Destination'
  ): Promise<WeatherForecastResponse> {
    let lat: number;
    let lng: number;
    let destination: string;

    if (typeof latOrParams === 'object') {
      lat = latOrParams.lat;
      lng = latOrParams.lng;
      destination = latOrParams.destination || 'Destination';
    } else {
      lat = latOrParams;
      lng = lngArg ?? 28.6139;
      destination = destArg;
    }

    const res = await fetch(
      `${API_BASE}/weather/forecast?lat=${lat}&lng=${lng}&destination=${encodeURIComponent(destination)}`,
      {
        headers: { ...getAuthHeader() }
      }
    );
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Live weather is temporarily unavailable.');
    }
    return data.forecast;
  },

  // -------------------------------------------------------------
  // REAL GEOCODING API
  // -------------------------------------------------------------
  async searchLocations(query: string): Promise<GeocodedLocation[]> {
    if (!query || query.trim().length < 2) return [];
    const res = await fetch(`${API_BASE}/geocoding/search?q=${encodeURIComponent(query.trim())}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  },

  async geocodeLocation(query: string): Promise<GeocodedLocation | null> {
    const results = await this.searchLocations(query);
    return results.length > 0 ? results[0] : null;
  },

  // -------------------------------------------------------------
  // REAL ROAD ROUTING API (OSRM)
  // -------------------------------------------------------------
  async getRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    mode: string = 'driving'
  ): Promise<RouteResponse> {
    const res = await fetch(
      `${API_BASE}/routes?originLat=${originLat}&originLng=${originLng}&destinationLat=${destLat}&destinationLng=${destLng}&mode=${mode}`,
      {
        headers: { ...getAuthHeader() }
      }
    );
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Route unavailable');
    }
    const route: RouteResponse = data.route;
    if (route && !route.coordinates) {
      route.coordinates = route.geometry;
    }
    if (route && !route.durationFormatted) {
      const hrs = Math.floor(route.durationMinutes / 60);
      const mins = route.durationMinutes % 60;
      route.durationFormatted = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} mins`;
    }
    return route;
  },

  async getRoutes(params: {
    originLat: number;
    originLng: number;
    destinationLat: number;
    destinationLng: number;
    mode?: string;
  }): Promise<RouteResponse> {
    return this.getRoute(
      params.originLat,
      params.originLng,
      params.destinationLat,
      params.destinationLng,
      params.mode || 'driving'
    );
  },

  // -------------------------------------------------------------
  // ITINERARY CRUD & REPLAN
  // -------------------------------------------------------------
  async addItineraryItem(tripId: string, item: unknown): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/itinerary/item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(item)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add itinerary activity');
    return data.trip;
  },

  async updateItineraryItem(tripId: string, itemId: string, patch: unknown): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/itinerary/item/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(patch)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update itinerary activity');
    return data.trip;
  },

  async deleteItineraryItem(tripId: string, itemId: string): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/itinerary/item/${itemId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete activity');
    return data.trip;
  },

  async replanItinerary(tripId: string, reason?: string): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/replan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to replan');
    return data.trip;
  },

  async updateTransportTiming(
    tripId: string,
    transportId: string,
    departureTime: string,
    arrivalTime?: string
  ): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/transports/${transportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ departureTime, arrivalTime })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update transport');
    return data.trip;
  },

  // -------------------------------------------------------------
  // WEATHER SIMULATION (WHAT-IF)
  // -------------------------------------------------------------
  async simulateWeather(
    tripId: string,
    dayNumber: number,
    condition: WeatherCondition,
    autoApply: boolean = true
  ): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/simulate-weather`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ dayNumber, condition, autoApply })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Weather simulation failed');
    return data.trip;
  },

  // -------------------------------------------------------------
  // HIDDEN GEMS
  // -------------------------------------------------------------
  async getHiddenGems(city: string) {
    const res = await fetch(`${API_BASE}/hidden-gems?city=${encodeURIComponent(city)}`, {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    return data.gems || [];
  },

  async addHiddenGem(
    tripId: string,
    gemId: string,
    dayNumber: number = 2,
    replaceItemId?: string
  ): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/itinerary/gem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ gemId, dayNumber, replaceItemId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add hidden gem');
    return data.trip;
  },

  // -------------------------------------------------------------
  // WHAT-IF SCENARIOS
  // -------------------------------------------------------------
  async runWhatIfSimulation(
    tripId: string,
    scenario: WhatIfScenarioInput
  ): Promise<WhatIfSimulationResult> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/what-if`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(scenario)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Simulation failed');
    return data.simulation;
  },

  async simulateWhatIf(
    tripId: string,
    scenario: WhatIfScenarioInput
  ): Promise<WhatIfSimulationResult> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(scenario)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Simulation failed');
    return data.simulation;
  },

  async applySimulation(
    tripId: string,
    simulatedTripData: FullTripData
  ): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/simulate/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ simulatedTripData })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to apply simulation');
    return data.trip;
  },

  // -------------------------------------------------------------
  // AI COPILOT
  // -------------------------------------------------------------
  async askCopilot(tripId: string, question: string): Promise<{ answer: string; groundedIn: string }> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/copilot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Copilot query failed');
    return data;
  },

  // -------------------------------------------------------------
  // TRAIN & FLIGHT SEARCH
  // -------------------------------------------------------------
  async searchStations(query: string = ''): Promise<Station[]> {
    const res = await fetch(`${API_BASE}/stations?q=${encodeURIComponent(query)}`, {
      headers: { ...getAuthHeader() }
    });
    const data = await res.json();
    return data.stations || [];
  },

  async searchTrains(
    from: string,
    to: string,
    date: string = '2026-10-15'
  ): Promise<TrainResult[]> {
    const res = await fetch(
      `${API_BASE}/trains/search?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(
        to
      )}&date=${encodeURIComponent(date)}`,
      {
        headers: { ...getAuthHeader() }
      }
    );
    const data = await res.json();
    return data.trains || [];
  },

  async searchFlights(
    from: string,
    to: string,
    date: string = '2026-10-15'
  ): Promise<FlightSearchResponse> {
    const res = await fetch(
      `${API_BASE}/flights/search?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(
        to
      )}&date=${encodeURIComponent(date)}`,
      {
        headers: { ...getAuthHeader() }
      }
    );
    const data = await res.json();
    return data;
  },

  async selectTransport(
    tripId: string,
    transport: {
      transportType: 'Train' | 'Flight';
      provider: string;
      identifier: string;
      departureStation: string;
      arrivalStation: string;
      departureTime: string;
      arrivalTime: string;
      price: number;
      status?: string;
    }
  ): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/select-transport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(transport)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to select transport');
    return data.trip;
  }
};
