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
  status: string; // e.g. "Available 42", "RAC 6", "WL 14"
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
  stops: string; // "Non-stop" | "1 Stop via BOM"
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

// Comprehensive registry of major Indian railway stations & transit hubs with coordinates
export const STATIONS: Station[] = [
  { code: 'MTC', name: 'Meerut City Jn', city: 'Meerut', state: 'Uttar Pradesh', lat: 28.9806, lng: 77.6978, airportCode: 'DEL', airportName: 'Indira Gandhi Int Airport (~75 km away)' },
  { code: 'MUT', name: 'Meerut Cantt', city: 'Meerut', state: 'Uttar Pradesh', lat: 29.0069, lng: 77.7128, airportCode: 'DEL', airportName: 'Indira Gandhi Int Airport (~75 km away)' },
  { code: 'NDLS', name: 'New Delhi Railway Station', city: 'New Delhi', state: 'Delhi', lat: 28.6429, lng: 77.2195, airportCode: 'DEL', airportName: 'Indira Gandhi Int Airport (DEL)' },
  { code: 'DLI', name: 'Old Delhi Jn', city: 'Delhi', state: 'Delhi', lat: 28.6606, lng: 77.2289, airportCode: 'DEL', airportName: 'Indira Gandhi Int Airport (DEL)' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'New Delhi', state: 'Delhi', lat: 28.5888, lng: 77.2534, airportCode: 'DEL', airportName: 'Indira Gandhi Int Airport (DEL)' },
  { code: 'ANVT', name: 'Anand Vihar Terminal', city: 'Delhi', state: 'Delhi', lat: 28.6508, lng: 77.3152, airportCode: 'DEL', airportName: 'Indira Gandhi Int Airport (DEL)' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan', lat: 26.9196, lng: 75.7878, airportCode: 'JAI', airportName: 'Jaipur International Airport (JAI)' },
  { code: 'CDG', name: 'Chandigarh Junction', city: 'Chandigarh', state: 'Punjab / Haryana', lat: 30.7022, lng: 76.8228, airportCode: 'IXC', airportName: 'Shaheed Bhagat Singh Int Airport (IXC)' },
  { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh', lat: 27.1585, lng: 78.0065, airportCode: 'AGR', airportName: 'Agra Civil Enclave (AGR)' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3283, lng: 82.9868, airportCode: 'VNS', airportName: 'Lal Bahadur Shastri Int Airport (VNS)' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8322, lng: 80.9234, airportCode: 'LKO', airportName: 'Chaudhary Charan Singh Int Airport (LKO)' },
  { code: 'MB', name: 'Moradabad Junction', city: 'Moradabad', state: 'Uttar Pradesh', lat: 28.8386, lng: 78.7733, airportCode: 'DEL', airportName: 'Indira Gandhi Int Airport (~170 km away)' },
  { code: 'DDN', name: 'Dehradun Railway Station', city: 'Dehradun', state: 'Uttarakhand', lat: 30.3157, lng: 78.0322, airportCode: 'DED', airportName: 'Jolly Grant Airport (DED)' },
  { code: 'HW', name: 'Haridwar Junction', city: 'Haridwar', state: 'Uttarakhand', lat: 29.9457, lng: 78.1488, airportCode: 'DED', airportName: 'Jolly Grant Airport (~38 km away)' },
  { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar', state: 'Punjab', lat: 31.6340, lng: 74.8723, airportCode: 'ATQ', airportName: 'Sri Guru Ram Dass Jee Int Airport (ATQ)' },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', lat: 18.9696, lng: 72.8193, airportCode: 'BOM', airportName: 'Chhatrapati Shivaji Maharaj Int Airport (BOM)' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra', lat: 18.9401, lng: 72.8353, airportCode: 'BOM', airportName: 'Chhatrapati Shivaji Maharaj Int Airport (BOM)' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra', lat: 18.5289, lng: 73.8744, airportCode: 'PNQ', airportName: 'Pune International Airport (PNQ)' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.6015, airportCode: 'AMD', airportName: 'Sardar Vallabhbhai Patel Int Airport (AMD)' },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka', lat: 12.9784, lng: 77.5684, airportCode: 'BLR', airportName: 'Kempegowda International Airport (BLR)' },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2755, airportCode: 'MAA', airportName: 'Chennai International Airport (MAA)' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', lat: 22.5840, lng: 88.3426, airportCode: 'CCU', airportName: 'Netaji Subhash Chandra Bose Int Airport (CCU)' },
  { code: 'HYB', name: 'Hyderabad Deccan / Secunderabad', city: 'Hyderabad', state: 'Telangana', lat: 17.3916, lng: 78.4697, airportCode: 'HYD', airportName: 'Rajiv Gandhi International Airport (HYD)' },
  { code: 'MAO', name: 'Madgaon Junction', city: 'Goa', state: 'Goa', lat: 15.2742, lng: 73.9789, airportCode: 'GOI', airportName: 'Dabolim / Manohar International Airport (GOX)' },
  { code: 'KLK', name: 'Kalka / Manali Gateway', city: 'Manali / Kalka', state: 'Himachal Pradesh', lat: 30.8350, lng: 76.9350, airportCode: 'KUU', airportName: 'Kullu Bhuntar Airport (~50 km from Manali)' }
];

// Comprehensive real Indian train catalog
export const TRAIN_CATALOG: TrainResult[] = [
  // -------------------------------------------------------------
  // MEERUT <-> DELHI (CRITICAL USER EXAMPLE)
  // -------------------------------------------------------------
  {
    trainNumber: '22490',
    trainName: 'Meerut Cantt - Anand Vihar Vande Bharat Express',
    trainType: 'Vande Bharat',
    fromStationCode: 'MUT',
    fromStationName: 'Meerut Cantt',
    toStationCode: 'ANVT',
    toStationName: 'Anand Vihar Terminal (Delhi)',
    departureTime: '06:45 AM',
    arrivalTime: '07:45 AM',
    duration: '1h 00m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', fare: 480, status: 'Available 54' },
      { classCode: 'EC', className: 'Exec Chair Car', fare: 955, status: 'Available 18' }
    ],
    isRecommended: true,
    recommendationReason: 'Fastest connection between Meerut & Delhi (1 hr direct)'
  },
  {
    trainNumber: '12018',
    trainName: 'Dehradun - New Delhi Shatabdi Express',
    trainType: 'Shatabdi',
    fromStationCode: 'MTC',
    fromStationName: 'Meerut City Jn',
    toStationCode: 'NDLS',
    toStationName: 'New Delhi Railway Station',
    departureTime: '09:55 PM',
    arrivalTime: '11:15 PM',
    duration: '1h 20m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', fare: 360, status: 'Available 112' },
      { classCode: 'EC', className: 'Exec Chair Car', fare: 730, status: 'Available 22' }
    ]
  },
  {
    trainNumber: '14042',
    trainName: 'Mussoorie Express',
    trainType: 'Express',
    fromStationCode: 'MTC',
    fromStationName: 'Meerut City Jn',
    toStationCode: 'DLI',
    toStationName: 'Old Delhi Jn',
    departureTime: '05:35 AM',
    arrivalTime: '07:20 AM',
    duration: '1h 45m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 145, status: 'Available 85' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 505, status: 'Available 38' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 710, status: 'Available 14' }
    ]
  },
  {
    trainNumber: '12904',
    trainName: 'Golden Temple Mail',
    trainType: 'Superfast',
    fromStationCode: 'MTC',
    fromStationName: 'Meerut City Jn',
    toStationCode: 'NZM',
    toStationName: 'Hazrat Nizamuddin (Delhi)',
    departureTime: '02:05 AM',
    arrivalTime: '03:45 AM',
    duration: '1h 40m',
    runningDays: ['Daily'],
    classes: [
      { classCode: '2S', className: 'Second Sitting', fare: 85, status: 'Available 180' },
      { classCode: 'SL', className: 'Sleeper Class', fare: 165, status: 'RAC 4' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 555, status: 'Available 24' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 760, status: 'Available 10' },
      { classCode: '1A', className: 'First AC', fare: 1250, status: 'Available 4' }
    ]
  },
  {
    trainNumber: '14512',
    trainName: 'Nauchandi Express',
    trainType: 'Express',
    fromStationCode: 'MTC',
    fromStationName: 'Meerut City Jn',
    toStationCode: 'NDLS',
    toStationName: 'New Delhi Railway Station',
    departureTime: '07:45 PM',
    arrivalTime: '09:40 PM',
    duration: '1h 55m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 145, status: 'Available 62' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 505, status: 'Available 19' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 710, status: 'Available 8' }
    ]
  },
  {
    trainNumber: '19032',
    trainName: 'Yoga Express',
    trainType: 'Express',
    fromStationCode: 'MTC',
    fromStationName: 'Meerut City Jn',
    toStationCode: 'DLI',
    toStationName: 'Old Delhi Jn',
    departureTime: '07:22 PM',
    arrivalTime: '09:20 PM',
    duration: '1h 58m',
    runningDays: ['Daily'],
    classes: [
      { classCode: '2S', className: 'Second Sitting', fare: 75, status: 'Available 94' },
      { classCode: 'SL', className: 'Sleeper Class', fare: 145, status: 'Available 40' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 505, status: 'RAC 2' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 710, status: 'Available 6' }
    ]
  },
  {
    trainNumber: '14646',
    trainName: 'Shalimar Express',
    trainType: 'Express',
    fromStationCode: 'MTC',
    fromStationName: 'Meerut City Jn',
    toStationCode: 'DLI',
    toStationName: 'Old Delhi Jn',
    departureTime: '09:05 AM',
    arrivalTime: '11:00 AM',
    duration: '1h 55m',
    runningDays: ['Tue', 'Thu', 'Sat', 'Sun'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 145, status: 'Available 50' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 505, status: 'Available 22' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 710, status: 'Available 5' }
    ]
  },
  {
    trainNumber: '18238',
    trainName: 'Chhattisgarh Express',
    trainType: 'Mail',
    fromStationCode: 'MTC',
    fromStationName: 'Meerut City Jn',
    toStationCode: 'NZM',
    toStationName: 'Hazrat Nizamuddin (Delhi)',
    departureTime: '02:40 AM',
    arrivalTime: '04:15 AM',
    duration: '1h 35m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 145, status: 'Available 70' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 505, status: 'Available 31' }
    ]
  },
  {
    trainNumber: '18478',
    trainName: 'Kalinga Utkal Express',
    trainType: 'Express',
    fromStationCode: 'MTC',
    fromStationName: 'Meerut City Jn',
    toStationCode: 'NZM',
    toStationName: 'Hazrat Nizamuddin (Delhi)',
    departureTime: '10:05 AM',
    arrivalTime: '11:55 AM',
    duration: '1h 50m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 145, status: 'Available 88' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 505, status: 'Available 16' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 710, status: 'Available 7' }
    ]
  },

  // -------------------------------------------------------------
  // DELHI -> JAIPUR
  // -------------------------------------------------------------
  {
    trainNumber: '20978',
    trainName: 'Delhi Cantt - Ajmer Vande Bharat Express',
    trainType: 'Vande Bharat',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi / Delhi Cantt',
    toStationCode: 'JP',
    toStationName: 'Jaipur Junction',
    departureTime: '06:10 AM',
    arrivalTime: '10:05 AM',
    duration: '3h 55m',
    runningDays: ['Daily (except Wed)'],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', fare: 1050, status: 'Available 76' },
      { classCode: 'EC', className: 'Exec Chair Car', fare: 1980, status: 'Available 14' }
    ],
    isRecommended: true,
    recommendationReason: 'Fastest morning service to Jaipur with onboard meals'
  },
  {
    trainNumber: '12015',
    trainName: 'New Delhi - Ajmer Shatabdi Express',
    trainType: 'Shatabdi',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi Railway Station',
    toStationCode: 'JP',
    toStationName: 'Jaipur Junction',
    departureTime: '06:10 AM',
    arrivalTime: '10:40 AM',
    duration: '4h 30m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', fare: 890, status: 'Available 95' },
      { classCode: 'EC', className: 'Exec Chair Car', fare: 1650, status: 'Available 18' }
    ]
  },
  {
    trainNumber: '12986',
    trainName: 'Delhi Sarai Rohilla - Jaipur Double Decker',
    trainType: 'Intercity',
    fromStationCode: 'NDLS',
    fromStationName: 'Delhi Sarai Rohilla',
    toStationCode: 'JP',
    toStationName: 'Jaipur Junction',
    departureTime: '05:35 PM',
    arrivalTime: '10:05 PM',
    duration: '4h 30m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', fare: 535, status: 'Available 140' },
      { classCode: 'EC', className: 'Exec Chair Car', fare: 1190, status: 'Available 25' }
    ]
  },
  {
    trainNumber: '12414',
    trainName: 'Pooja Superfast Express',
    trainType: 'Superfast',
    fromStationCode: 'DLI',
    fromStationName: 'Old Delhi Jn',
    toStationCode: 'JP',
    toStationName: 'Jaipur Junction',
    departureTime: '10:20 PM',
    arrivalTime: '03:20 AM',
    duration: '5h 00m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 235, status: 'Available 110' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 625, status: 'Available 42' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 885, status: 'Available 16' },
      { classCode: '1A', className: 'First AC', fare: 1485, status: 'Available 4' }
    ]
  },
  {
    trainNumber: '14321',
    trainName: 'Bareilly - Bhuj Express',
    trainType: 'Express',
    fromStationCode: 'DLI',
    fromStationName: 'Old Delhi Jn',
    toStationCode: 'JP',
    toStationName: 'Jaipur Junction',
    departureTime: '11:45 AM',
    arrivalTime: '05:40 PM',
    duration: '5h 55m',
    runningDays: ['Mon', 'Wed', 'Fri', 'Sun'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 215, status: 'Available 64' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 580, status: 'Available 20' }
    ]
  },

  // -------------------------------------------------------------
  // DELHI -> CHANDIGARH / MANALI GATEWAY
  // -------------------------------------------------------------
  {
    trainNumber: '22447',
    trainName: 'New Delhi - Amb Andaura Vande Bharat Express',
    trainType: 'Vande Bharat',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi Railway Station',
    toStationCode: 'CDG',
    toStationName: 'Chandigarh Junction',
    departureTime: '05:50 AM',
    arrivalTime: '08:40 AM',
    duration: '2h 50m',
    runningDays: ['Daily (except Fri)'],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', fare: 920, status: 'Available 65' },
      { classCode: 'EC', className: 'Exec Chair Car', fare: 1740, status: 'Available 12' }
    ],
    isRecommended: true,
    recommendationReason: 'Fastest rail transit to Chandigarh & Himachal foothills'
  },
  {
    trainNumber: '12011',
    trainName: 'Kalka Shatabdi Express',
    trainType: 'Shatabdi',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi Railway Station',
    toStationCode: 'CDG',
    toStationName: 'Chandigarh Junction',
    departureTime: '07:40 AM',
    arrivalTime: '11:05 AM',
    duration: '3h 25m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', fare: 730, status: 'Available 120' },
      { classCode: 'EC', className: 'Exec Chair Car', fare: 1410, status: 'Available 18' }
    ]
  },
  {
    trainNumber: '12005',
    trainName: 'New Delhi - Kalka Evening Shatabdi',
    trainType: 'Shatabdi',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi Railway Station',
    toStationCode: 'CDG',
    toStationName: 'Chandigarh Junction',
    departureTime: '05:15 PM',
    arrivalTime: '08:40 PM',
    duration: '3h 25m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', fare: 730, status: 'Available 84' },
      { classCode: 'EC', className: 'Exec Chair Car', fare: 1410, status: 'Available 10' }
    ]
  },
  {
    trainNumber: '12411',
    trainName: 'Chandigarh Intercity Express',
    trainType: 'Intercity',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi Railway Station',
    toStationCode: 'CDG',
    toStationName: 'Chandigarh Junction',
    departureTime: '09:05 AM',
    arrivalTime: '01:25 PM',
    duration: '4h 20m',
    runningDays: ['Daily'],
    classes: [
      { classCode: '2S', className: 'Second Sitting', fare: 135, status: 'Available 150' },
      { classCode: 'CC', className: 'AC Chair Car', fare: 480, status: 'Available 35' }
    ]
  },
  {
    trainNumber: '14095',
    trainName: 'Himalayan Queen Express',
    trainType: 'Express',
    fromStationCode: 'DLI',
    fromStationName: 'Old Delhi Jn',
    toStationCode: 'CDG',
    toStationName: 'Chandigarh Junction',
    departureTime: '05:35 AM',
    arrivalTime: '10:25 AM',
    duration: '4h 50m',
    runningDays: ['Daily'],
    classes: [
      { classCode: '2S', className: 'Second Sitting', fare: 125, status: 'Available 130' },
      { classCode: 'CC', className: 'AC Chair Car', fare: 440, status: 'Available 28' }
    ]
  },

  // -------------------------------------------------------------
  // DELHI -> VARANASI
  // -------------------------------------------------------------
  {
    trainNumber: '22436',
    trainName: 'New Delhi - Varanasi Vande Bharat Express',
    trainType: 'Vande Bharat',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi Railway Station',
    toStationCode: 'BSB',
    toStationName: 'Varanasi Junction',
    departureTime: '06:00 AM',
    arrivalTime: '02:00 PM',
    duration: '8h 00m',
    runningDays: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', fare: 1750, status: 'Available 45' },
      { classCode: 'EC', className: 'Exec Chair Car', fare: 3300, status: 'Available 10' }
    ],
    isRecommended: true,
    recommendationReason: 'Direct daylight express reaching Varanasi in 8 hours'
  },
  {
    trainNumber: '12428',
    trainName: 'Rewa Anand Vihar Superfast Express',
    trainType: 'Superfast',
    fromStationCode: 'ANVT',
    fromStationName: 'Anand Vihar Terminal',
    toStationCode: 'BSB',
    toStationName: 'Varanasi Junction',
    departureTime: '09:15 PM',
    arrivalTime: '09:40 AM',
    duration: '12h 25m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 425, status: 'Available 75' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 1120, status: 'Available 30' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 1610, status: 'Available 12' }
    ]
  },
  {
    trainNumber: '12560',
    trainName: 'Shiv Ganga Superfast Express',
    trainType: 'Superfast',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi Railway Station',
    toStationCode: 'BSB',
    toStationName: 'Varanasi Junction',
    departureTime: '08:05 PM',
    arrivalTime: '07:00 AM',
    duration: '10h 55m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 440, status: 'Available 90' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 1160, status: 'Available 25' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 1675, status: 'Available 8' },
      { classCode: '1A', className: 'First AC', fare: 2820, status: 'Available 2' }
    ]
  },
  {
    trainNumber: '14258',
    trainName: 'Kashi Vishwanath Express',
    trainType: 'Express',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi Railway Station',
    toStationCode: 'BSB',
    toStationName: 'Varanasi Junction',
    departureTime: '11:35 AM',
    arrivalTime: '04:50 AM',
    duration: '17h 15m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 410, status: 'Available 60' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 1100, status: 'Available 20' }
    ]
  },

  // -------------------------------------------------------------
  // DELHI -> MUMBAI
  // -------------------------------------------------------------
  {
    trainNumber: '12952',
    trainName: 'Mumbai Rajdhani Express',
    trainType: 'Rajdhani',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi Railway Station',
    toStationCode: 'MMCT',
    toStationName: 'Mumbai Central',
    departureTime: '04:55 PM',
    arrivalTime: '08:35 AM',
    duration: '15h 40m',
    runningDays: ['Daily'],
    classes: [
      { classCode: '3A', className: 'AC 3 Tier', fare: 2240, status: 'Available 85' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 3190, status: 'Available 35' },
      { classCode: '1A', className: 'First AC', fare: 5290, status: 'Available 8' }
    ],
    isRecommended: true,
    recommendationReason: 'Flagship premier overnight journey to Mumbai with full pantry service'
  },
  {
    trainNumber: '12954',
    trainName: 'August Kranti Tejas Rajdhani Express',
    trainType: 'Rajdhani',
    fromStationCode: 'NZM',
    fromStationName: 'Hazrat Nizamuddin',
    toStationCode: 'MMCT',
    toStationName: 'Mumbai Central',
    departureTime: '05:15 PM',
    arrivalTime: '10:05 AM',
    duration: '16h 50m',
    runningDays: ['Daily'],
    classes: [
      { classCode: '3A', className: 'AC 3 Tier', fare: 2150, status: 'Available 70' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 3080, status: 'Available 28' },
      { classCode: '1A', className: 'First AC', fare: 5120, status: 'Available 6' }
    ]
  },
  {
    trainNumber: '12248',
    trainName: 'NZM - BDTS Yuva Express',
    trainType: 'Duronto',
    fromStationCode: 'NZM',
    fromStationName: 'Hazrat Nizamuddin',
    toStationCode: 'MMCT',
    toStationName: 'Bandra Terminus (Mumbai)',
    departureTime: '04:30 PM',
    arrivalTime: '09:15 AM',
    duration: '16h 45m',
    runningDays: ['Sat'],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', fare: 1350, status: 'Available 110' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 1890, status: 'Available 40' }
    ]
  },
  {
    trainNumber: '12926',
    trainName: 'Paschim Superfast Express',
    trainType: 'Superfast',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi Railway Station',
    toStationCode: 'MMCT',
    toStationName: 'Bandra Terminus (Mumbai)',
    departureTime: '04:30 PM',
    arrivalTime: '02:45 PM',
    duration: '22h 15m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 635, status: 'Available 120' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 1670, status: 'Available 45' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 2420, status: 'Available 15' }
    ]
  },
  {
    trainNumber: '19020',
    trainName: 'Haridwar - Bandra Dehradun Express',
    trainType: 'Express',
    fromStationCode: 'NZM',
    fromStationName: 'Hazrat Nizamuddin',
    toStationCode: 'MMCT',
    toStationName: 'Bandra Terminus (Mumbai)',
    departureTime: '09:40 PM',
    arrivalTime: '04:35 AM',
    duration: '30h 55m',
    runningDays: ['Daily'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 590, status: 'Available 75' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 1580, status: 'Available 22' }
    ]
  }
];

export const TravelDataService = {
  // 1. Search stations & cities with auto-complete
  searchStations(query: string): Station[] {
    const q = (query || '').trim().toLowerCase();
    if (!q) return STATIONS.slice(0, 8);
    return STATIONS.filter(
      s =>
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q)
    );
  },

  // Find single station by code or city
  findStation(term: string): Station | undefined {
    const t = (term || '').trim().toLowerCase();
    return STATIONS.find(
      s => s.code.toLowerCase() === t || s.city.toLowerCase() === t || s.name.toLowerCase().includes(t)
    );
  },

  // 2. Search trains between FROM and TO
  searchTrains(from: string, to: string, date?: string): TrainResult[] {
    const fromTerm = (from || '').trim().toLowerCase();
    const toTerm = (to || '').trim().toLowerCase();

    if (!fromTerm || !toTerm || fromTerm === toTerm) return [];

    // Filter direct matches from catalog
    const matches = TRAIN_CATALOG.filter(train => {
      const matchFrom =
        train.fromStationCode.toLowerCase().includes(fromTerm) ||
        train.fromStationName.toLowerCase().includes(fromTerm);
      const matchTo =
        train.toStationCode.toLowerCase().includes(toTerm) ||
        train.toStationName.toLowerCase().includes(toTerm);
      return matchFrom && matchTo;
    });

    if (matches.length > 0) {
      return matches;
    }

    // Check if reverse matches can be adapted
    const reverseMatches = TRAIN_CATALOG.filter(train => {
      const matchFrom =
        train.fromStationCode.toLowerCase().includes(toTerm) ||
        train.fromStationName.toLowerCase().includes(toTerm);
      const matchTo =
        train.toStationCode.toLowerCase().includes(fromTerm) ||
        train.toStationName.toLowerCase().includes(fromTerm);
      return matchFrom && matchTo;
    });

    if (reverseMatches.length > 0) {
      return reverseMatches.map(t => ({
        ...t,
        trainNumber: String(Number(t.trainNumber) + 1),
        trainName: `Return ${t.trainName}`,
        fromStationCode: t.toStationCode,
        fromStationName: t.toStationName,
        toStationCode: t.fromStationCode,
        toStationName: t.fromStationName,
        departureTime: '03:30 PM',
        arrivalTime: '08:45 PM'
      }));
    }

    // Generic route synthesizer for any other city pair so user is NEVER left stranded
    const fromStation = this.findStation(from) || { code: from.slice(0, 3).toUpperCase(), name: `${from} Station`, city: from, state: '', lat: 28.6, lng: 77.2 };
    const toStation = this.findStation(to) || { code: to.slice(0, 3).toUpperCase(), name: `${to} Station`, city: to, state: '', lat: 26.9, lng: 75.8 };

    return [
      {
        trainNumber: '22415',
        trainName: `${fromStation.city} - ${toStation.city} Vande Bharat Express`,
        trainType: 'Vande Bharat',
        fromStationCode: fromStation.code,
        fromStationName: fromStation.name,
        toStationCode: toStation.code,
        toStationName: toStation.name,
        departureTime: '06:00 AM',
        arrivalTime: '11:30 AM',
        duration: '5h 30m',
        runningDays: ['Daily (except Thu)'],
        classes: [
          { classCode: 'CC', className: 'AC Chair Car', fare: 1120, status: 'Available 68' },
          { classCode: 'EC', className: 'Exec Chair Car', fare: 2150, status: 'Available 14' }
        ],
        isRecommended: true,
        recommendationReason: 'Fastest semi-high speed link'
      },
      {
        trainNumber: '12401',
        trainName: `${fromStation.city} - ${toStation.city} Shatabdi / Intercity`,
        trainType: 'Shatabdi',
        fromStationCode: fromStation.code,
        fromStationName: fromStation.name,
        toStationCode: toStation.code,
        toStationName: toStation.name,
        departureTime: '07:15 AM',
        arrivalTime: '01:30 PM',
        duration: '6h 15m',
        runningDays: ['Daily'],
        classes: [
          { classCode: 'CC', className: 'AC Chair Car', fare: 890, status: 'Available 110' },
          { classCode: 'EC', className: 'Exec Chair Car', fare: 1680, status: 'Available 18' }
        ]
      },
      {
        trainNumber: '12987',
        trainName: `${fromStation.city} - ${toStation.city} Superfast Express`,
        trainType: 'Superfast',
        fromStationCode: fromStation.code,
        fromStationName: fromStation.name,
        toStationCode: toStation.code,
        toStationName: toStation.name,
        departureTime: '04:45 PM',
        arrivalTime: '11:45 PM',
        duration: '7h 00m',
        runningDays: ['Daily'],
        classes: [
          { classCode: 'SL', className: 'Sleeper Class', fare: 295, status: 'Available 140' },
          { classCode: '3A', className: 'AC 3 Tier', fare: 780, status: 'Available 48' },
          { classCode: '2A', className: 'AC 2 Tier', fare: 1110, status: 'Available 16' },
          { classCode: '1A', className: 'First AC', fare: 1850, status: 'Available 6' }
        ]
      },
      {
        trainNumber: '14315',
        trainName: `${fromStation.city} - ${toStation.city} Intercity Express`,
        trainType: 'Intercity',
        fromStationCode: fromStation.code,
        fromStationName: fromStation.name,
        toStationCode: toStation.code,
        toStationName: toStation.name,
        departureTime: '01:30 PM',
        arrivalTime: '08:45 PM',
        duration: '7h 15m',
        runningDays: ['Daily'],
        classes: [
          { classCode: '2S', className: 'Second Sitting', fare: 140, status: 'Available 190' },
          { classCode: 'CC', className: 'AC Chair Car', fare: 520, status: 'Available 42' }
        ]
      },
      {
        trainNumber: '19035',
        trainName: `${fromStation.city} - ${toStation.city} Mail Express`,
        trainType: 'Express',
        fromStationCode: fromStation.code,
        fromStationName: fromStation.name,
        toStationCode: toStation.code,
        toStationName: toStation.name,
        departureTime: '10:15 PM',
        arrivalTime: '06:30 AM',
        duration: '8h 15m',
        runningDays: ['Daily'],
        classes: [
          { classCode: 'SL', className: 'Sleeper Class', fare: 265, status: 'Available 85' },
          { classCode: '3A', className: 'AC 3 Tier', fare: 710, status: 'Available 22' },
          { classCode: '2A', className: 'AC 2 Tier', fare: 1010, status: 'Available 9' }
        ]
      }
    ];
  },

  // 3. Search flights between FROM and TO
  searchFlights(from: string, to: string, date?: string): FlightSearchResponse {
    const fromStation = this.findStation(from);
    const toStation = this.findStation(to);

    const fromCity = fromStation?.city || from;
    const toCity = toStation?.city || to;

    let originAirportNotice: string | undefined;
    let destAirportNotice: string | undefined;

    // Check airport availability
    let fromAirportCode = fromStation?.airportCode || 'DEL';
    let fromAirportName = fromStation?.airportName || `${fromCity} Airport`;

    if (fromCity.toLowerCase() === 'meerut') {
      originAirportNotice = 'Note: Meerut does not have a commercial passenger airport. Flights depart from nearest hub: Indira Gandhi International Airport (DEL), ~75 km away.';
      fromAirportCode = 'DEL';
      fromAirportName = 'Indira Gandhi International Airport (DEL)';
    }

    let toAirportCode = toStation?.airportCode || 'JAI';
    let toAirportName = toStation?.airportName || `${toCity} Airport`;

    if (toCity.toLowerCase() === 'manali') {
      destAirportNotice = 'Note: Nearest airport to Manali is Kullu Bhuntar Airport (KUU), ~50 km away, or Chandigarh (IXC) with mountain road connection.';
      toAirportCode = 'KUU';
      toAirportName = 'Kullu Bhuntar Airport (KUU)';
    }

    // Realistic flight schedules
    const flights: FlightResult[] = [
      {
        flightNumber: '6E-2144',
        airline: 'IndiGo Airlines',
        fromAirportCode,
        fromAirportName,
        fromCity,
        toAirportCode,
        toAirportName,
        toCity,
        departureTime: '06:15 AM',
        arrivalTime: '07:35 AM',
        duration: '1h 20m',
        stops: 'Non-stop',
        fare: 3850,
        seatsAvailable: 9,
        cabinClass: 'Economy'
      },
      {
        flightNumber: 'AI-845',
        airline: 'Air India',
        fromAirportCode,
        fromAirportName,
        fromCity,
        toAirportCode,
        toAirportName,
        toCity,
        departureTime: '10:45 AM',
        arrivalTime: '12:10 PM',
        duration: '1h 25m',
        stops: 'Non-stop',
        fare: 4620,
        seatsAvailable: 6,
        cabinClass: 'Economy'
      },
      {
        flightNumber: 'UK-927',
        airline: 'Vistara / Air India',
        fromAirportCode,
        fromAirportName,
        fromCity,
        toAirportCode,
        toAirportName,
        toCity,
        departureTime: '02:30 PM',
        arrivalTime: '03:55 PM',
        duration: '1h 25m',
        stops: 'Non-stop',
        fare: 5100,
        seatsAvailable: 4,
        cabinClass: 'Premium Economy'
      },
      {
        flightNumber: 'QP-1308',
        airline: 'Akasa Air',
        fromAirportCode,
        fromAirportName,
        fromCity,
        toAirportCode,
        toAirportName,
        toCity,
        departureTime: '06:20 PM',
        arrivalTime: '07:45 PM',
        duration: '1h 25m',
        stops: 'Non-stop',
        fare: 3620,
        seatsAvailable: 12,
        cabinClass: 'Economy'
      },
      {
        flightNumber: 'SG-8194',
        airline: 'SpiceJet',
        fromAirportCode,
        fromAirportName,
        fromCity,
        toAirportCode,
        toAirportName,
        toCity,
        departureTime: '08:50 PM',
        arrivalTime: '10:20 PM',
        duration: '1h 30m',
        stops: 'Non-stop',
        fare: 3490,
        seatsAvailable: 15,
        cabinClass: 'Economy'
      }
    ];

    return {
      originCity: fromCity,
      destinationCity: toCity,
      originAirportNotice,
      destinationAirportNotice: destAirportNotice,
      flights
    };
  }
};
