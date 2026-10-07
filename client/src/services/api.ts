import {
  FullTripData,
  WhatIfScenarioInput,
  WhatIfSimulationResult,
  ChatMessage,
  WeatherCondition,
  Station,
  TrainResult,
  FlightSearchResponse
} from '../types';

const API_BASE = '/api';

export const api = {
  // Fetch Demo Trip
  async getDemoTrip(): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/demo`);
    if (!res.ok) throw new Error('Failed to load demo trip');
    const data = await res.json();
    return data.trip;
  },

  // Fetch Single Trip
  async getTrip(id: string): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${id}`);
    if (!res.ok) throw new Error(`Trip ${id} not found`);
    const data = await res.json();
    return data.trip;
  },

  // List All Trips
  async getTrips(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/trips`);
    if (!res.ok) throw new Error('Failed to list trips');
    const data = await res.json();
    return data.trips;
  },

  // Create New Trip
  async createTrip(payload: {
    origin: string;
    destination: string;
    startDate: string;
    endDate: string;
    travellersCount: number;
    budget: number;
    transportPreference: string;
    accommodationPreference: string;
    travelStyle: string;
    interests: string[];
  }): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create trip');
    const data = await res.json();
    return data.trip;
  },

  // Update Trip Parameters (Travellers, Budget, Style)
  async updateTrip(id: string, payload: Partial<{
    travellersCount: number;
    budget: number;
    travelStyle: string;
    transportPreference: string;
    accommodationPreference: string;
  }>): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update trip');
    const data = await res.json();
    return data.trip;
  },

  // Members CRUD
  async addMember(tripId: string, member: { name: string; email?: string; phone?: string; role?: string }): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
    if (!res.ok) throw new Error('Failed to add member');
    const data = await res.json();
    return data.trip;
  },

  async deleteMember(tripId: string, memberId: string): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/members/${memberId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete member');
    const data = await res.json();
    return data.trip;
  },

  // Expenses CRUD
  async addExpense(tripId: string, expense: {
    title: string;
    amount: number;
    category: string;
    paidByMemberId?: string;
    notes?: string;
  }): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    if (!res.ok) throw new Error('Failed to add expense');
    const data = await res.json();
    return data.trip;
  },

  async deleteExpense(tripId: string, expenseId: string): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/expenses/${expenseId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete expense');
    const data = await res.json();
    return data.trip;
  },

  // Itinerary CRUD & Replan
  async addItineraryItem(tripId: string, item: any): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/itinerary/item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to add itinerary item');
    const data = await res.json();
    return data.trip;
  },

  async updateItineraryItem(tripId: string, itemId: string, patch: any): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/itinerary/item/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    if (!res.ok) throw new Error('Failed to update itinerary item');
    const data = await res.json();
    return data.trip;
  },

  async deleteItineraryItem(tripId: string, itemId: string): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/itinerary/item/${itemId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete itinerary item');
    const data = await res.json();
    return data.trip;
  },

  async replanItinerary(tripId: string, reason?: string): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/replan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Failed to replan');
    const data = await res.json();
    return data.trip;
  },

  // Transport Timing Shift
  async updateTransportTiming(tripId: string, transportId: string, departureTime: string, arrivalTime?: string): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/transports/${transportId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ departureTime, arrivalTime })
    });
    if (!res.ok) throw new Error('Failed to update transport');
    const data = await res.json();
    return data.trip;
  },

  // Weather Simulation
  async simulateWeather(tripId: string, dayNumber: number, condition: WeatherCondition, autoApplyAlternatives: boolean = true): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/weather/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayNumber, condition, autoApplyAlternatives })
    });
    if (!res.ok) throw new Error('Failed to simulate weather');
    const data = await res.json();
    return data.trip;
  },

  // Hidden Gems
  async addHiddenGem(tripId: string, gemId: string, dayNumber: number = 2, replaceItemId?: string): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/hidden-gems/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gemId, dayNumber, replaceItemId })
    });
    if (!res.ok) throw new Error('Failed to add hidden gem');
    const data = await res.json();
    return data.trip;
  },

  // What-If Sandbox Simulation
  async simulateWhatIf(tripId: string, input: WhatIfScenarioInput): Promise<WhatIfSimulationResult> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (!res.ok) throw new Error('Failed to run simulation');
    const data = await res.json();
    return data.simulation;
  },

  async applySimulation(tripId: string, simulatedTripData: FullTripData): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/simulate/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulatedTripData })
    });
    if (!res.ok) throw new Error('Failed to apply simulation');
    const data = await res.json();
    return data.trip;
  },

  // Yatra Copilot
  async askCopilot(tripId: string, question: string): Promise<{ answer: string; message: ChatMessage }> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    if (!res.ok) throw new Error('Failed to get answer from copilot');
    return await res.json();
  },

  // Safety SOS
  async triggerSOS(tripId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/safety/sos`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to trigger SOS');
    return await res.json();
  },

  async addEmergencyContact(tripId: string, contact: any): Promise<any> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/safety/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });
    if (!res.ok) throw new Error('Failed to add emergency contact');
    return await res.json();
  },

  // Chat
  async getChat(tripId: string): Promise<ChatMessage[]> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/chat`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages;
  },

  async sendChatMessage(tripId: string, message: string, senderName: string = 'You'): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, senderName })
    });
    if (!res.ok) throw new Error('Failed to send chat message');
    const data = await res.json();
    return data.message;
  },

  // Update Expense
  async updateExpense(tripId: string, expenseId: string, payload: Partial<{ title: string; amount: number; category: string; paidByMemberId: string; notes: string }>): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/expenses/${expenseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update expense');
    const data = await res.json();
    return data.trip;
  },

  // Search Stations & Cities
  async searchStations(query: string): Promise<Station[]> {
    const res = await fetch(`${API_BASE}/stations?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.stations || [];
  },

  // Search Trains
  async searchTrains(origin: string, destination: string, date?: string): Promise<TrainResult[]> {
    const params = new URLSearchParams({ origin, destination });
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE}/trains/search?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to search trains');
    }
    const data = await res.json();
    return data.trains || [];
  },

  // Search Flights
  async searchFlights(origin: string, destination: string, date?: string): Promise<FlightSearchResponse> {
    const params = new URLSearchParams({ origin, destination });
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE}/flights/search?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to search flights');
    }
    return await res.json();
  },

  // Select Transport for Trip
  async selectTransport(tripId: string, transport: {
    transportType: 'Train' | 'Flight';
    provider: string;
    identifier: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
    status?: string;
  }): Promise<FullTripData> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/select-transport`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transport)
    });
    if (!res.ok) throw new Error('Failed to select transport');
    const data = await res.json();
    return data.trip;
  }
};
