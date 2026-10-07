export type TravelStyle = 'Relaxed' | 'Fast-Paced' | 'Adventure' | 'Cultural' | 'Budget' | 'Luxury' | 'Balanced';
export type TransportPreference = 'Train' | 'Flight' | 'Bus' | 'Self-Drive' | 'Cab' | 'Mixed';
export type AccommodationPreference = 'Hostel' | 'Boutique Hotel' | 'Resort' | 'Homestay' | 'Luxury Hotel' | 'Budget Hotel';
export type MemberRole = 'Organizer' | 'Co-Leader' | 'Member';
export type ExpenseCategory = 'Transport' | 'Accommodation' | 'Food' | 'Activities' | 'Shopping' | 'Emergency' | 'Miscellaneous';
export type ItineraryCategory = 'Transit' | 'Activity' | 'Food' | 'Sightseeing' | 'Shopping' | 'Rest' | 'Check-in' | 'Check-out' | 'Hidden Gem' | 'Return Transit' | 'Culture';
export type WeatherCondition = 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Light Rain' | 'Heavy Rain' | 'Thunderstorm' | 'Snow' | 'Foggy';
export type WeatherAlertLevel = 'None' | 'Advisory' | 'Warning' | 'Severe';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export type AuthUser = User;

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface Trip {
  id: string;
  userId?: string;
  title: string;
  origin: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  travellersCount: number;
  budget: number; // Total budget in INR (₹)
  transportPreference: TransportPreference;
  accommodationPreference: AccommodationPreference;
  travelStyle: TravelStyle;
  interests: string[];
  status: 'Planning' | 'Active' | 'Completed' | 'Archived';
  createdAt: string;
  updatedAt: string;
}

export interface TripSummary {
  id: string;
  title: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface TripCreationMemberInput {
  name: string;
  role?: MemberRole;
  email?: string;
  phone?: string;
}

export interface TripCreationPayload {
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
  members?: TripCreationMemberInput[];
}

export interface TripMember {
  id: string;
  tripId: string;
  name: string;
  email: string;
  phone: string;
  role: MemberRole;
  avatar?: string;
  paidAmount: number;
  balance: number;
  roomPreference?: string;
  transportPreference?: string;
}

export interface TravellerProfile {
  id: string;
  memberId: string;
  age?: number;
  dietary?: string;
  physicalAbility?: string;
}

export interface Transport {
  id: string;
  tripId: string;
  type: 'Train' | 'Flight' | 'Bus' | 'Cab' | 'Metro';
  provider: string;
  identifier: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  status: 'Scheduled' | 'Confirmed' | 'Delayed' | 'Cancelled' | 'Selected';
  isReturn: boolean;
  seats?: string;
  pnr?: string;
  notes?: string;
}

export interface Accommodation {
  id: string;
  tripId: string;
  name: string;
  type: string;
  address: string;
  checkIn: string;
  checkOut: string;
  pricePerNight: number;
  totalPrice: number;
  roomCount: number;
  bookingRef?: string;
  amenities: string[];
  lat: number;
  lng: number;
}

export interface ItineraryItem {
  id: string;
  dayId: string;
  tripId: string;
  title: string;
  description: string;
  category: ItineraryCategory;
  startTime: string;
  endTime: string;
  location: string;
  cost: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Skipped';
  isLocked: boolean;
  isUserModified: boolean;
  isWeatherSensitive: boolean;
  weatherAlternative?: {
    title: string;
    description: string;
    category: ItineraryCategory;
    location: string;
    cost: number;
    indoorReason: string;
  };
  lat?: number;
  lng?: number;
  orderIndex: number;
}

export type ItineraryActivity = ItineraryItem;

export interface ItineraryDay {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  theme: string;
  weatherForecast?: {
    condition: WeatherCondition;
    tempC: number;
    precipitationChance: number;
    alertLevel: WeatherAlertLevel;
    summary: string;
  };
  notes?: string;
  items: ItineraryItem[];
}

export interface Destination {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  description: string;
  lat: number;
  lng: number;
  category: string;
  imageUrl: string;
}

export interface HiddenGem {
  id: string;
  tripId?: string;
  destinationCity: string;
  name: string;
  description: string;
  category: string;
  location: string;
  distance: string;
  crowdLevel: 'Very Low' | 'Low' | 'Moderate' | 'High';
  cost: number;
  openingHours: string;
  safetyInfo: string;
  bestTime: string;
  lat: number;
  lng: number;
  imageUrl: string;
  isSaved?: boolean;
}

export interface ExpenseSplit {
  id?: string;
  expenseId?: string;
  memberId: string;
  memberName?: string;
  amount?: number;
  shareAmount?: number;
  isSettled?: boolean;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidByMemberId: string;
  paidByName?: string;
  splitType: 'Equal' | 'Exact' | 'Custom';
  splits?: ExpenseSplit[];
  date: string;
  receiptUrl?: string;
  notes?: string;
}

export interface Settlement {
  id: string;
  tripId: string;
  fromMemberId: string;
  fromMemberName: string;
  toMemberId: string;
  toMemberName: string;
  amount: number;
  status: 'Pending' | 'Settled';
}

export interface Budget {
  id: string;
  tripId: string;
  totalBudget: number;
  transportAllocated: number;
  accommodationAllocated: number;
  foodAllocated: number;
  activitiesAllocated: number;
  shoppingAllocated: number;
  emergencyAllocated: number;
  miscAllocated: number;
}

export interface Booking {
  id: string;
  tripId: string;
  type: 'Flight' | 'Train' | 'Hotel' | 'Activity' | 'Cab';
  itemName: string;
  referenceCode: string;
  amount: number;
  status: 'Confirmed' | 'Pending' | 'Mock/Demo';
  bookingDate: string;
  details: Record<string, unknown>;
}

export interface WeatherSnapshot {
  id: string;
  tripId: string;
  date: string;
  condition: WeatherCondition;
  tempC: number;
  precipitationChance: number;
  windSpeed: string;
  alertLevel: WeatherAlertLevel;
  summary: string;
}

export interface CurrentWeather {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  condition: WeatherCondition;
  description: string;
  updatedAt: string;
}

export interface DailyForecastDay {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
  weatherCode: number;
  condition: WeatherCondition;
  description: string;
}

export type WeatherDay = DailyForecastDay;

export interface WeatherForecastResponse {
  destination: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  daily: DailyForecastDay[];
  isLive: boolean;
  provider: string;
  updatedAt?: string;
  error?: string;
}

export type WeatherForecast = WeatherForecastResponse;

export interface GeocodedLocation {
  latitude: number;
  longitude: number;
  displayName: string;
  city: string;
  state: string;
  country: string;
}

export interface RouteResponse {
  success: boolean;
  distanceKm: number;
  durationMinutes: number;
  durationFormatted?: string;
  geometry: [number, number][]; // [lat, lng] array
  coordinates?: [number, number][];
  provider: string;
  mode: string;
  error?: string;
}

export interface TripChangeLog {
  id: string;
  tripId: string;
  timestamp: string;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  reason: string;
  canUndo: boolean;
  undone?: boolean;
}

export interface NotificationItem {
  id: string;
  tripId: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  isRead: boolean;
  timestamp: string;
}

export interface TripMetrics {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  projectedTotalCost: number;
  perPersonBudget: number;
  perPersonSpent: number;
  perPersonProjected: number;
  budgetHealthStatus: 'Healthy' | 'Moderate' | 'Warning' | 'Exceeded';
  categoryBreakdown: {
    category: ExpenseCategory;
    allocated: number;
    spent: number;
    remaining: number;
    percentageSpent: number;
  }[];
  categorySpend?: Record<string, number>;
  categorySpending?: Record<string, number>;
  spendingAlerts: string[];
  aiFinancialAdvice: string[];
  groupBalances: {
    memberId: string;
    name: string;
    paid: number;
    shouldPay: number;
    netBalance: number;
  }[];
  settlements: Settlement[];
  settledAmount: number;
  outstandingAmount: number;
}

export interface FullTripData {
  trip: Trip;
  members: TripMember[];
  transports: Transport[];
  accommodations: Accommodation[];
  itinerary: ItineraryDay[];
  expenses: Expense[];
  budget: Budget;
  bookings: Booking[];
  weather: WeatherSnapshot[];
  hiddenGems: HiddenGem[];
  changeLogs: TripChangeLog[];
  metrics: TripMetrics;
  notifications: NotificationItem[];
}

export interface WhatIfScenarioInput {
  budget?: number;
  travellersCount?: number;
  daysDelta?: number;
  transportDelayHours?: number;
  weatherOverrideDay?: number;
  weatherCondition?: WeatherCondition;
}

export interface WhatIfSimulationResult {
  scenarioName: string;
  currentMetrics: TripMetrics;
  simulatedMetrics: TripMetrics;
  differences: {
    field: string;
    currentValue: string | number;
    simulatedValue: string | number;
    impact: 'positive' | 'neutral' | 'negative' | 'warning';
  }[];
  itineraryAdjustments: string[];
  aiRecommendations: string[];
  simulatedTripData: FullTripData;
}

export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  airportCode?: string;
  airportName?: string;
}

export interface TrainClassOption {
  classCode: string;
  className: string;
  fare: number;
  status: string;
}

export interface TrainResult {
  trainNumber: string;
  trainName: string;
  trainType: 'Vande Bharat' | 'Rajdhani' | 'Shatabdi' | 'Duronto' | 'Intercity' | 'Superfast' | 'Express' | 'Mail';
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  runningDays: string[];
  classes: TrainClassOption[];
  isRecommended?: boolean;
  recommendationReason?: string;
}

export interface FlightResult {
  flightNumber: string;
  airline: string;
  fromAirportCode: string;
  fromAirportName: string;
  fromCity: string;
  toAirportCode: string;
  toAirportName: string;
  toCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
  fare: number;
  seatsAvailable: number;
  cabinClass: string;
}

export interface FlightSearchResponse {
  originCity: string;
  destinationCity: string;
  originAirportNotice?: string;
  destinationAirportNotice?: string;
  flights: FlightResult[];
}
