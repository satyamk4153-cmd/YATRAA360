import fs from 'fs';
import path from 'path';
import {
  User,
  Trip,
  TripMember,
  Transport,
  Accommodation,
  ItineraryDay,
  Expense,
  ExpenseSplit,
  Budget,
  Booking,
  WeatherSnapshot,
  TripChangeLog,
  NotificationItem,
  HiddenGem
} from '../types';
import { TravelDataService } from '../services/travel-data';
import { AIService } from '../services/ai-service';

interface DatabaseSchema {
  users: Record<string, User>;
  trips: Record<string, Trip>;
  members: Record<string, TripMember[]>;
  transports: Record<string, Transport[]>;
  accommodations: Record<string, Accommodation[]>;
  itinerary: Record<string, ItineraryDay[]>;
  expenses: Record<string, Expense[]>;
  expenseSplits: Record<string, ExpenseSplit[]>;
  budgets: Record<string, Budget>;
  bookings: Record<string, Booking[]>;
  weather: Record<string, WeatherSnapshot[]>;
  hiddenGems: Record<string, HiddenGem[]>;
  changeLogs: Record<string, TripChangeLog[]>;
  notifications: Record<string, NotificationItem[]>;
}

const DB_FILE = path.join(__dirname, '../../data/yatra360_db.json');

class DatabaseStore {
  private data: DatabaseSchema = {
    users: {},
    trips: {},
    members: {},
    transports: {},
    accommodations: {},
    itinerary: {},
    expenses: {},
    expenseSplits: {},
    budgets: {},
    bookings: {},
    weather: {},
    hiddenGems: {},
    changeLogs: {},
    notifications: {}
  };

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || {},
          trips: parsed.trips || {},
          members: parsed.members || {},
          transports: parsed.transports || {},
          accommodations: parsed.accommodations || {},
          itinerary: parsed.itinerary || {},
          expenses: parsed.expenses || {},
          expenseSplits: parsed.expenseSplits || {},
          budgets: parsed.budgets || {},
          bookings: parsed.bookings || {},
          weather: parsed.weather || {},
          hiddenGems: parsed.hiddenGems || {},
          changeLogs: parsed.changeLogs || {},
          notifications: parsed.notifications || {}
        };
      }
      this.migrateLegacyData();
    } catch (err) {
      console.warn('Could not load database from disk, using fresh in-memory schema.', err);
    }
  }

  private migrateLegacyData() {
    // Ensure default demo user exists for developer testing / legacy trip ownership
    const demoUserId = 'usr_demo_yatra';
    if (!this.data.users[demoUserId]) {
      // Hash of "demo1234"
      this.data.users[demoUserId] = {
        id: demoUserId,
        email: 'demo@yatra360.app',
        name: 'Demo Traveller',
        // $2a$10$WqU1qYFzB3wT... bcrypt hash for 'demo1234'
        passwordHash: '$2a$10$n8rTGBuD.RzP72kL3p4i8edYlqP1mQ8g6V6l6u7iW6m5uL9wR2qee',
        createdAt: new Date().toISOString()
      };
    }

    // Attach userId to any legacy trips missing it
    let modified = false;
    for (const tripId of Object.keys(this.data.trips)) {
      const trip = this.data.trips[tripId];
      if (!trip.userId) {
        trip.userId = demoUserId;
        modified = true;
      }
    }

    if (modified) {
      this.saveToDisk();
    }
  }

  public saveToDisk() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tempFile = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      try {
        if (fs.existsSync(DB_FILE)) {
          fs.unlinkSync(DB_FILE);
        }
        fs.renameSync(tempFile, DB_FILE);
      } catch {
        // Fallback for Windows file lock edge case
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      }
    } catch (err) {
      console.error('Failed saving to database file:', err);
    }
  }

  // Users CRUD
  public getAllUsers(): User[] {
    return Object.values(this.data.users);
  }

  public getUserById(id: string): User | undefined {
    return this.data.users[id];
  }

  public getUserByEmail(email: string): User | undefined {
    const target = email.toLowerCase().trim();
    return Object.values(this.data.users).find(u => u.email.toLowerCase() === target);
  }

  public saveUser(user: User): User {
    this.data.users[user.id] = user;
    this.saveToDisk();
    return user;
  }

  // Trips CRUD
  public getAllTrips(): Trip[] {
    return Object.values(this.data.trips);
  }

  public getTripsByUser(userId: string): Trip[] {
    return Object.values(this.data.trips).filter(t => t.userId === userId);
  }

  public getTrip(id: string): Trip | undefined {
    return this.data.trips[id];
  }

  public saveTrip(trip: Trip): Trip {
    this.data.trips[trip.id] = trip;
    this.saveToDisk();
    return trip;
  }

  public deleteTrip(id: string): boolean {
    if (!this.data.trips[id]) return false;
    delete this.data.trips[id];
    delete this.data.members[id];
    delete this.data.transports[id];
    delete this.data.accommodations[id];
    delete this.data.itinerary[id];
    delete this.data.expenses[id];
    delete this.data.expenseSplits[id];
    delete this.data.budgets[id];
    delete this.data.bookings[id];
    delete this.data.weather[id];
    delete this.data.hiddenGems[id];
    delete this.data.changeLogs[id];
    delete this.data.notifications[id];
    this.saveToDisk();
    return true;
  }

  // Members CRUD
  public getMembers(tripId: string): TripMember[] {
    return this.data.members[tripId] || [];
  }

  public setMembers(tripId: string, members: TripMember[]): TripMember[] {
    this.data.members[tripId] = members;
    this.saveToDisk();
    return members;
  }

  // Transports CRUD
  public getTransports(tripId: string): Transport[] {
    return this.data.transports[tripId] || [];
  }

  public setTransports(tripId: string, transports: Transport[]): Transport[] {
    this.data.transports[tripId] = transports;
    this.saveToDisk();
    return transports;
  }

  // Accommodations CRUD
  public getAccommodations(tripId: string): Accommodation[] {
    return this.data.accommodations[tripId] || [];
  }

  public setAccommodations(tripId: string, accommodations: Accommodation[]): Accommodation[] {
    this.data.accommodations[tripId] = accommodations;
    this.saveToDisk();
    return accommodations;
  }

  // Itinerary CRUD
  public getItinerary(tripId: string): ItineraryDay[] {
    const existing = this.data.itinerary[tripId] || [];
    const trip = this.data.trips[tripId];
    if (trip && trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const expectedDays = Math.max(2, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      if (existing.length <= 1 && expectedDays > 1) {
        // Expand the itinerary using AIService
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
        this.data.itinerary[tripId] = generated.itinerary;
        if (!this.data.weather[tripId] || this.data.weather[tripId].length === 0) {
          this.data.weather[tripId] = generated.weather;
        }
        if (!this.data.hiddenGems[tripId] || this.data.hiddenGems[tripId].length === 0) {
          this.data.hiddenGems[tripId] = generated.hiddenGems;
        }
        this.saveToDisk();
        return generated.itinerary;
      }
    }
    return existing;
  }

  public setItinerary(tripId: string, itinerary: ItineraryDay[]): ItineraryDay[] {
    this.data.itinerary[tripId] = itinerary;
    this.saveToDisk();
    return itinerary;
  }

  // Expenses CRUD
  public getExpenses(tripId: string): Expense[] {
    return this.data.expenses[tripId] || [];
  }

  public setExpenses(tripId: string, expenses: Expense[]): Expense[] {
    this.data.expenses[tripId] = expenses;
    this.saveToDisk();
    return expenses;
  }

  // Budget CRUD
  public getBudget(tripId: string): Budget | undefined {
    return this.data.budgets[tripId];
  }

  public setBudget(tripId: string, budget: Budget): Budget {
    this.data.budgets[tripId] = budget;
    this.saveToDisk();
    return budget;
  }

  // Bookings CRUD
  public getBookings(tripId: string): Booking[] {
    return this.data.bookings[tripId] || [];
  }

  public setBookings(tripId: string, bookings: Booking[]): Booking[] {
    this.data.bookings[tripId] = bookings;
    this.saveToDisk();
    return bookings;
  }

  // Weather Snapshots
  public getWeather(tripId: string): WeatherSnapshot[] {
    if (this.data.weather[tripId] && this.data.weather[tripId].length > 0) {
      return this.data.weather[tripId];
    }
    const itinerary = this.data.itinerary[tripId] || [];
    if (itinerary.length > 0) {
      const weatherSnapshots: WeatherSnapshot[] = itinerary.map(d => ({
        id: `w_snap_${d.dayNumber}`,
        tripId,
        date: `Day ${d.dayNumber} (${d.date})`,
        condition: d.weatherForecast?.condition || 'Sunny',
        tempC: d.weatherForecast?.tempC || 25,
        precipitationChance: d.weatherForecast?.precipitationChance || 10,
        windSpeed: '12 km/h NW',
        alertLevel: d.weatherForecast?.alertLevel || 'None',
        summary: d.weatherForecast?.summary || 'Pleasant weather.'
      }));
      this.data.weather[tripId] = weatherSnapshots;
      this.saveToDisk();
      return weatherSnapshots;
    }
    return [];
  }

  public setWeather(tripId: string, weather: WeatherSnapshot[]): WeatherSnapshot[] {
    this.data.weather[tripId] = weather;
    this.saveToDisk();
    return weather;
  }

  // Hidden Gems
  public getHiddenGems(tripId?: string): HiddenGem[] {
    if (tripId && this.data.hiddenGems[tripId] && this.data.hiddenGems[tripId].length > 0) {
      return this.data.hiddenGems[tripId];
    }
    if (tripId && this.data.trips[tripId]) {
      const gems = TravelDataService.getHiddenGemsForDestination(this.data.trips[tripId].destination, tripId);
      this.data.hiddenGems[tripId] = gems;
      this.saveToDisk();
      return gems;
    }
    const all = Object.values(this.data.hiddenGems).flat();
    return all.length > 0 ? all : [];
  }

  public setHiddenGems(tripId: string, gems: HiddenGem[]): HiddenGem[] {
    this.data.hiddenGems[tripId] = gems;
    this.saveToDisk();
    return gems;
  }

  // Change Logs
  public getChangeLogs(tripId: string): TripChangeLog[] {
    return this.data.changeLogs[tripId] || [];
  }

  public addChangeLog(tripId: string, log: TripChangeLog): TripChangeLog {
    if (!this.data.changeLogs[tripId]) this.data.changeLogs[tripId] = [];
    this.data.changeLogs[tripId].unshift(log); // newest first
    this.saveToDisk();
    return log;
  }

  // Notifications
  public getNotifications(tripId: string): NotificationItem[] {
    return this.data.notifications[tripId] || [];
  }

  public setNotifications(tripId: string, notifications: NotificationItem[]): NotificationItem[] {
    this.data.notifications[tripId] = notifications;
    this.saveToDisk();
    return notifications;
  }

  public addNotification(tripId: string, notif: NotificationItem): NotificationItem {
    if (!this.data.notifications[tripId]) this.data.notifications[tripId] = [];
    this.data.notifications[tripId].unshift(notif);
    this.saveToDisk();
    return notif;
  }
}

export const db = new DatabaseStore();
