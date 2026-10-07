import fs from 'fs';
import path from 'path';
import {
  Trip,
  TripMember,
  Transport,
  Accommodation,
  ItineraryDay,
  ItineraryItem,
  Expense,
  ExpenseSplit,
  Budget,
  Booking,
  WeatherSnapshot,
  EmergencyContact,
  ChatMessage,
  ActivityVote,
  TripChangeLog,
  NotificationItem,
  HiddenGem,
  FullTripData,
  TripMetrics
} from '../types';

interface DatabaseSchema {
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
  emergencyContacts: Record<string, EmergencyContact[]>;
  hiddenGems: Record<string, HiddenGem[]>;
  chatMessages: Record<string, ChatMessage[]>;
  activityVotes: Record<string, ActivityVote[]>;
  changeLogs: Record<string, TripChangeLog[]>;
  notifications: Record<string, NotificationItem[]>;
}

const DB_FILE = path.join(__dirname, '../../data/yatra360_db.json');

class DatabaseStore {
  private data: DatabaseSchema = {
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
    emergencyContacts: {},
    hiddenGems: {},
    chatMessages: {},
    activityVotes: {},
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
        this.data = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not load database from disk, using fresh in-memory schema.', err);
    }
  }

  public saveToDisk() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed saving to database file:', err);
    }
  }

  // Trips CRUD
  public getAllTrips(): Trip[] {
    return Object.values(this.data.trips);
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
    delete this.data.emergencyContacts[id];
    delete this.data.hiddenGems[id];
    delete this.data.chatMessages[id];
    delete this.data.activityVotes[id];
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
    return this.data.itinerary[tripId] || [];
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
    return this.data.weather[tripId] || [];
  }

  public setWeather(tripId: string, weather: WeatherSnapshot[]): WeatherSnapshot[] {
    this.data.weather[tripId] = weather;
    this.saveToDisk();
    return weather;
  }

  // Emergency Contacts
  public getEmergencyContacts(tripId: string): EmergencyContact[] {
    return this.data.emergencyContacts[tripId] || [];
  }

  public setEmergencyContacts(tripId: string, contacts: EmergencyContact[]): EmergencyContact[] {
    this.data.emergencyContacts[tripId] = contacts;
    this.saveToDisk();
    return contacts;
  }

  // Hidden Gems
  public getHiddenGems(tripId?: string): HiddenGem[] {
    if (tripId && this.data.hiddenGems[tripId]) {
      return this.data.hiddenGems[tripId];
    }
    // Return global/trip default gems
    const all = Object.values(this.data.hiddenGems).flat();
    return all.length > 0 ? all : [];
  }

  public setHiddenGems(tripId: string, gems: HiddenGem[]): HiddenGem[] {
    this.data.hiddenGems[tripId] = gems;
    this.saveToDisk();
    return gems;
  }

  // Chat Messages
  public getChatMessages(tripId: string): ChatMessage[] {
    return this.data.chatMessages[tripId] || [];
  }

  public addChatMessage(tripId: string, msg: ChatMessage): ChatMessage {
    if (!this.data.chatMessages[tripId]) this.data.chatMessages[tripId] = [];
    this.data.chatMessages[tripId].push(msg);
    this.saveToDisk();
    return msg;
  }

  // Activity Votes
  public getActivityVotes(tripId: string): ActivityVote[] {
    return this.data.activityVotes[tripId] || [];
  }

  public setActivityVotes(tripId: string, votes: ActivityVote[]): ActivityVote[] {
    this.data.activityVotes[tripId] = votes;
    this.saveToDisk();
    return votes;
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
