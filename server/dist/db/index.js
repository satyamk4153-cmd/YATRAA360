"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_FILE = path_1.default.join(__dirname, '../../data/yatra360_db.json');
class DatabaseStore {
    data = {
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
    loadFromDisk() {
        try {
            const dir = path_1.default.dirname(DB_FILE);
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            if (fs_1.default.existsSync(DB_FILE)) {
                const raw = fs_1.default.readFileSync(DB_FILE, 'utf-8');
                this.data = JSON.parse(raw);
            }
        }
        catch (err) {
            console.warn('Could not load database from disk, using fresh in-memory schema.', err);
        }
    }
    saveToDisk() {
        try {
            const dir = path_1.default.dirname(DB_FILE);
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            fs_1.default.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Failed saving to database file:', err);
        }
    }
    // Trips CRUD
    getAllTrips() {
        return Object.values(this.data.trips);
    }
    getTrip(id) {
        return this.data.trips[id];
    }
    saveTrip(trip) {
        this.data.trips[trip.id] = trip;
        this.saveToDisk();
        return trip;
    }
    deleteTrip(id) {
        if (!this.data.trips[id])
            return false;
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
    getMembers(tripId) {
        return this.data.members[tripId] || [];
    }
    setMembers(tripId, members) {
        this.data.members[tripId] = members;
        this.saveToDisk();
        return members;
    }
    // Transports CRUD
    getTransports(tripId) {
        return this.data.transports[tripId] || [];
    }
    setTransports(tripId, transports) {
        this.data.transports[tripId] = transports;
        this.saveToDisk();
        return transports;
    }
    // Accommodations CRUD
    getAccommodations(tripId) {
        return this.data.accommodations[tripId] || [];
    }
    setAccommodations(tripId, accommodations) {
        this.data.accommodations[tripId] = accommodations;
        this.saveToDisk();
        return accommodations;
    }
    // Itinerary CRUD
    getItinerary(tripId) {
        return this.data.itinerary[tripId] || [];
    }
    setItinerary(tripId, itinerary) {
        this.data.itinerary[tripId] = itinerary;
        this.saveToDisk();
        return itinerary;
    }
    // Expenses CRUD
    getExpenses(tripId) {
        return this.data.expenses[tripId] || [];
    }
    setExpenses(tripId, expenses) {
        this.data.expenses[tripId] = expenses;
        this.saveToDisk();
        return expenses;
    }
    // Budget CRUD
    getBudget(tripId) {
        return this.data.budgets[tripId];
    }
    setBudget(tripId, budget) {
        this.data.budgets[tripId] = budget;
        this.saveToDisk();
        return budget;
    }
    // Bookings CRUD
    getBookings(tripId) {
        return this.data.bookings[tripId] || [];
    }
    setBookings(tripId, bookings) {
        this.data.bookings[tripId] = bookings;
        this.saveToDisk();
        return bookings;
    }
    // Weather Snapshots
    getWeather(tripId) {
        return this.data.weather[tripId] || [];
    }
    setWeather(tripId, weather) {
        this.data.weather[tripId] = weather;
        this.saveToDisk();
        return weather;
    }
    // Emergency Contacts
    getEmergencyContacts(tripId) {
        return this.data.emergencyContacts[tripId] || [];
    }
    setEmergencyContacts(tripId, contacts) {
        this.data.emergencyContacts[tripId] = contacts;
        this.saveToDisk();
        return contacts;
    }
    // Hidden Gems
    getHiddenGems(tripId) {
        if (tripId && this.data.hiddenGems[tripId]) {
            return this.data.hiddenGems[tripId];
        }
        // Return global/trip default gems
        const all = Object.values(this.data.hiddenGems).flat();
        return all.length > 0 ? all : [];
    }
    setHiddenGems(tripId, gems) {
        this.data.hiddenGems[tripId] = gems;
        this.saveToDisk();
        return gems;
    }
    // Chat Messages
    getChatMessages(tripId) {
        return this.data.chatMessages[tripId] || [];
    }
    addChatMessage(tripId, msg) {
        if (!this.data.chatMessages[tripId])
            this.data.chatMessages[tripId] = [];
        this.data.chatMessages[tripId].push(msg);
        this.saveToDisk();
        return msg;
    }
    // Activity Votes
    getActivityVotes(tripId) {
        return this.data.activityVotes[tripId] || [];
    }
    setActivityVotes(tripId, votes) {
        this.data.activityVotes[tripId] = votes;
        this.saveToDisk();
        return votes;
    }
    // Change Logs
    getChangeLogs(tripId) {
        return this.data.changeLogs[tripId] || [];
    }
    addChangeLog(tripId, log) {
        if (!this.data.changeLogs[tripId])
            this.data.changeLogs[tripId] = [];
        this.data.changeLogs[tripId].unshift(log); // newest first
        this.saveToDisk();
        return log;
    }
    // Notifications
    getNotifications(tripId) {
        return this.data.notifications[tripId] || [];
    }
    setNotifications(tripId, notifications) {
        this.data.notifications[tripId] = notifications;
        this.saveToDisk();
        return notifications;
    }
    addNotification(tripId, notif) {
        if (!this.data.notifications[tripId])
            this.data.notifications[tripId] = [];
        this.data.notifications[tripId].unshift(notif);
        this.saveToDisk();
        return notif;
    }
}
exports.db = new DatabaseStore();
