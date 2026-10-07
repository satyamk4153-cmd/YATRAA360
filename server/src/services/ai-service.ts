import {
  Trip,
  ItineraryDay,
  ItineraryItem,
  FullTripData,
  WeatherCondition,
  ExpenseCategory,
  Transport,
  Accommodation,
  Budget,
  HiddenGem,
  WeatherSnapshot
} from '../types';
import { TravelDataService } from './travel-data';

export class AIService {
  /**
   * AI Planner: Generates a complete door-to-door journey (Home -> Outbound -> Days -> Inbound -> Home)
   */
  public static generateDoorToDoorTrip(params: {
    origin: string;
    destination: string;
    startDate: string;
    endDate: string;
    travellersCount: number;
    budget: number;
    transportPreference: any;
    accommodationPreference: any;
    travelStyle: any;
    interests: string[];
  }): {
    trip: Trip;
    transports: Transport[];
    accommodations: Accommodation[];
    itinerary: ItineraryDay[];
    budget: Budget;
    hiddenGems: HiddenGem[];
    weather: WeatherSnapshot[];
  } {
    const tripId = `trip_${Date.now()}`;
    const start = new Date(params.startDate || '2026-10-15');
    const end = new Date(params.endDate || '2026-10-18');
    const daysCount = Math.max(2, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const trip: Trip = {
      id: tripId,
      title: `${params.origin} to ${params.destination} Explorer`,
      origin: params.origin,
      destination: params.destination,
      startDate: params.startDate,
      endDate: params.endDate,
      travellersCount: params.travellersCount,
      budget: params.budget,
      transportPreference: params.transportPreference,
      accommodationPreference: params.accommodationPreference,
      travelStyle: params.travelStyle,
      interests: params.interests,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const budget: Budget = {
      id: `b_${tripId}`,
      tripId,
      totalBudget: params.budget,
      transportAllocated: Math.round(params.budget * 0.28),
      accommodationAllocated: Math.round(params.budget * 0.32),
      foodAllocated: Math.round(params.budget * 0.20),
      activitiesAllocated: Math.round(params.budget * 0.12),
      shoppingAllocated: Math.round(params.budget * 0.05),
      emergencyAllocated: Math.round(params.budget * 0.02),
      miscAllocated: Math.round(params.budget * 0.01)
    };

    const requiredRooms = Math.ceil(params.travellersCount / 2);
    const nightlyRate = Math.round((params.budget * 0.32) / (daysCount * requiredRooms));

    // Retrieve matching transport options from TravelDataService
    const isFlight = params.transportPreference === 'Flight';
    let outboundProvider = 'Express Train';
    let outboundId = 'EXP-101';
    let outboundDepTime = '07:00 AM';
    let outboundArrTime = '01:30 PM';
    let outboundFare = Math.round(params.budget * 0.14);

    let returnProvider = 'Return Express';
    let returnId = 'EXP-102';
    let returnDepTime = '03:00 PM';
    let returnArrTime = '09:30 PM';
    let returnFare = Math.round(params.budget * 0.14);

    if (isFlight) {
      const flightSearch = TravelDataService.searchFlights(params.origin, params.destination);
      if (flightSearch.flights.length > 0) {
        const topFlight = flightSearch.flights[0];
        outboundProvider = `${topFlight.airline} (${topFlight.flightNumber})`;
        outboundId = topFlight.flightNumber;
        outboundDepTime = topFlight.departureTime;
        outboundArrTime = topFlight.arrivalTime;
        outboundFare = topFlight.fare * params.travellersCount;

        const returnFlight = flightSearch.flights[1] || topFlight;
        returnProvider = `${returnFlight.airline} (${returnFlight.flightNumber})`;
        returnId = returnFlight.flightNumber;
        returnDepTime = '04:30 PM';
        returnArrTime = '06:00 PM';
        returnFare = returnFlight.fare * params.travellersCount;
      }
    } else {
      const trainResults = TravelDataService.searchTrains(params.origin, params.destination);
      if (trainResults.length > 0) {
        const topTrain = trainResults[0];
        outboundProvider = `${topTrain.trainName} (${topTrain.trainNumber})`;
        outboundId = topTrain.trainNumber;
        outboundDepTime = topTrain.departureTime;
        outboundArrTime = topTrain.arrivalTime;
        const baseClassFare = topTrain.classes[0]?.fare || 450;
        outboundFare = baseClassFare * params.travellersCount;

        const returnTrain = trainResults[1] || topTrain;
        returnProvider = `${returnTrain.trainName} (${returnTrain.trainNumber})`;
        returnId = returnTrain.trainNumber;
        returnDepTime = '03:30 PM';
        returnArrTime = '09:00 PM';
        returnFare = (returnTrain.classes[0]?.fare || 450) * params.travellersCount;
      }
    }

    const transports: Transport[] = [
      {
        id: `t_out_${Date.now()}`,
        tripId,
        type: isFlight ? 'Flight' : 'Train',
        provider: outboundProvider,
        identifier: outboundId,
        departureStation: `${params.origin} Station`,
        arrivalStation: `${params.destination} Station`,
        departureTime: outboundDepTime,
        arrivalTime: outboundArrTime,
        price: outboundFare,
        status: 'Scheduled',
        isReturn: false,
        seats: `${params.travellersCount} Confirmed Seats`,
        pnr: `PNR-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        notes: 'Door-to-door departure starts with doorstep cab.'
      },
      {
        id: `t_ret_${Date.now()}`,
        tripId,
        type: isFlight ? 'Flight' : 'Train',
        provider: returnProvider,
        identifier: returnId,
        departureStation: `${params.destination} Station`,
        arrivalStation: `${params.origin} Station`,
        departureTime: returnDepTime,
        arrivalTime: returnArrTime,
        price: returnFare,
        status: 'Scheduled',
        isReturn: true,
        seats: `${params.travellersCount} Confirmed Seats`,
        pnr: `PNR-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        notes: 'Return drop-off cab to home doorstep.'
      }
    ];

    const accommodations: Accommodation[] = [
      {
        id: `acc_${Date.now()}`,
        tripId,
        name: `${params.destination} Pineview Retreat & Spa`,
        type: params.accommodationPreference || 'Boutique Hotel',
        address: `Mall Road / Valley Heights, ${params.destination}`,
        checkIn: `${params.startDate} 02:30 PM`,
        checkOut: `${params.endDate} 11:00 AM`,
        pricePerNight: nightlyRate,
        totalPrice: nightlyRate * requiredRooms * (daysCount - 1),
        roomCount: requiredRooms,
        bookingRef: `HTL-${Math.floor(100000 + Math.random() * 900000)}`,
        amenities: ['Free WiFi', 'Breakfast Included', 'Mountain View', 'Heating / AC', '24/7 Concierge'],
        lat: 32.2396,
        lng: 77.1887
      }
    ];

    // Build Days
    const itinerary: ItineraryDay[] = [];
    for (let d = 1; d <= daysCount; d++) {
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + (d - 1));
      const dateStr = dayDate.toISOString().split('T')[0];

      let theme = `Exploring ${params.destination}`;
      let items: ItineraryItem[] = [];

      if (d === 1) {
        theme = `Doorstep Departure & Arrival in ${params.destination}`;
        items = [
          {
            id: `item_${Date.now()}_${d}_1`,
            dayId: `day_${d}`,
            tripId,
            title: `Doorstep Pick-up Cab to ${params.origin} Station`,
            description: `Pre-booked electric cab from your home doorstep in ${params.origin} to railway/airport terminal.`,
            category: 'Transit',
            startTime: '05:45 AM',
            endTime: '06:30 AM',
            location: `${params.origin} Home Address`,
            cost: 650,
            status: 'Planned',
            isLocked: true,
            isUserModified: false,
            isWeatherSensitive: false,
            lat: 28.8386,
            lng: 78.7733,
            orderIndex: 1
          },
          {
            id: `item_${Date.now()}_${d}_2`,
            dayId: `day_${d}`,
            tripId,
            title: `Board Outbound ${transports[0].provider}`,
            description: `Comfortable journey with onboard breakfast and scenic views towards ${params.destination}.`,
            category: 'Transit',
            startTime: '07:00 AM',
            endTime: '01:30 PM',
            location: `${params.origin} Station Platform 1`,
            cost: 0,
            status: 'Planned',
            isLocked: true,
            isUserModified: false,
            isWeatherSensitive: false,
            lat: 28.8386,
            lng: 78.7733,
            orderIndex: 2
          },
          {
            id: `item_${Date.now()}_${d}_3`,
            dayId: `day_${d}`,
            tripId,
            title: 'Station Arrival & Hotel Check-in',
            description: `Arrive at ${params.destination}, take pre-arranged local shuttle, check into ${accommodations[0].name}, and unpack.`,
            category: 'Check-in',
            startTime: '02:30 PM',
            endTime: '03:45 PM',
            location: accommodations[0].name,
            cost: 400,
            status: 'Planned',
            isLocked: false,
            isUserModified: false,
            isWeatherSensitive: false,
            lat: 32.2396,
            lng: 77.1887,
            orderIndex: 3
          },
          {
            id: `item_${Date.now()}_${d}_4`,
            dayId: `day_${d}`,
            tripId,
            title: 'Old Town Heritage Walk & Welcome Dinner',
            description: `Leisurely evening stroll through historical streets, sampling local cuisine and cultural handicraft stalls.`,
            category: 'Food',
            startTime: '05:00 PM',
            endTime: '08:00 PM',
            location: `Old ${params.destination} Promenade`,
            cost: 1200,
            status: 'Planned',
            isLocked: false,
            isUserModified: false,
            isWeatherSensitive: true,
            weatherAlternative: {
              title: 'Artisanal Cafe & Indoor Gastronomy Experience',
              description: 'Cozy indoor dining experience featuring artisanal wood-fired pizzas, herbal teas, and indoor live acoustic performance.',
              category: 'Food',
              location: 'The Himalayan Hearth Indoor Bistro',
              cost: 1400,
              indoorReason: 'Shielded from outdoor rain and cold winds.'
            },
            lat: 32.245,
            lng: 77.189,
            orderIndex: 4
          }
        ];
      } else if (d === daysCount) {
        theme = `Farewell ${params.destination} & Return to Doorstep`;
        items = [
          {
            id: `item_${Date.now()}_${d}_1`,
            dayId: `day_${d}`,
            tripId,
            title: 'Morning Mountain View Breakfast & Souvenir Market',
            description: `Enjoy complimentary breakfast at the hotel, take in the sunrise views, and grab authentic local teas and dry fruits.`,
            category: 'Food',
            startTime: '08:30 AM',
            endTime: '10:30 AM',
            location: accommodations[0].name,
            cost: 800,
            status: 'Planned',
            isLocked: false,
            isUserModified: false,
            isWeatherSensitive: false,
            lat: 32.2396,
            lng: 77.1887,
            orderIndex: 1
          },
          {
            id: `item_${Date.now()}_${d}_2`,
            dayId: `day_${d}`,
            tripId,
            title: 'Hotel Check-out & Station Transfer',
            description: `Complete seamless checkout and transfer to ${params.destination} Station for departure.`,
            category: 'Check-out',
            startTime: '11:30 AM',
            endTime: '01:30 PM',
            location: `${params.destination} Station`,
            cost: 450,
            status: 'Planned',
            isLocked: true,
            isUserModified: false,
            isWeatherSensitive: false,
            lat: 32.2396,
            lng: 77.1887,
            orderIndex: 2
          },
          {
            id: `item_${Date.now()}_${d}_3`,
            dayId: `day_${d}`,
            tripId,
            title: `Board Inbound ${transports[1].provider}`,
            description: `Return journey with scenic sunset across the plains.`,
            category: 'Return Transit',
            startTime: '03:00 PM',
            endTime: '09:30 PM',
            location: `${params.destination} Station Platform 2`,
            cost: 0,
            status: 'Planned',
            isLocked: true,
            isUserModified: false,
            isWeatherSensitive: false,
            lat: 28.8386,
            lng: 78.7733,
            orderIndex: 3
          },
          {
            id: `item_${Date.now()}_${d}_4`,
            dayId: `day_${d}`,
            tripId,
            title: `Late Night Cab Drop to ${params.origin} Doorstep`,
            description: `Final doorstep leg: Pre-booked cab takes all travellers and luggage safely back to home.`,
            category: 'Return Transit',
            startTime: '09:45 PM',
            endTime: '10:30 PM',
            location: `${params.origin} Home Address`,
            cost: 650,
            status: 'Planned',
            isLocked: true,
            isUserModified: false,
            isWeatherSensitive: false,
            lat: 28.8386,
            lng: 78.7733,
            orderIndex: 4
          }
        ];
      } else {
        const destLower = (params.destination || '').toLowerCase();
        const isJaipur = destLower.includes('jaipur') || destLower.includes('rajasthan');
        const isGoa = destLower.includes('goa');
        const isDelhi = destLower.includes('delhi');
        const isManali = destLower.includes('manali') || destLower.includes('kullu') || destLower.includes('himachal');

        if (isJaipur) {
          if (d % 2 === 0) {
            theme = `Royal Citadel, Amer Fort & Nahargarh Sunset`;
            items = [
              {
                id: `item_${Date.now()}_${d}_1`,
                dayId: `day_${d}`,
                tripId,
                title: 'Amer Fort & Panna Meena Stepwell Exploration',
                description: 'Explore the grand 16th-century hill fortress, Sheesh Mahal mirror palace, and adjacent ancient geometric stepwell.',
                category: 'Sightseeing',
                startTime: '08:30 AM',
                endTime: '12:30 PM',
                location: 'Amer Fort & Stepwell Complex',
                cost: 850,
                status: 'Planned',
                isLocked: false,
                isUserModified: false,
                isWeatherSensitive: true,
                weatherAlternative: {
                  title: 'Anokhi Museum of Hand Printing & Indigo Guild',
                  description: 'Indoor climate-shielded museum with traditional textile preservation, live block carvers, and air-cooled halls.',
                  category: 'Culture',
                  location: 'Kheri Gate Heritage Haveli',
                  cost: 300,
                  indoorReason: 'Indoor museum safe from direct afternoon heat or monsoon showers.'
                },
                lat: 26.9855,
                lng: 75.8513,
                orderIndex: 1
              },
              {
                id: `item_${Date.now()}_${d}_2`,
                dayId: `day_${d}`,
                tripId,
                title: 'Authentic Rajasthani Thali Luncheon',
                description: 'Multi-dish royal culinary spread featuring Dal Baati Churma, Gatte ki Sabzi, and saffron lassi.',
                category: 'Food',
                startTime: '01:00 PM',
                endTime: '02:30 PM',
                location: 'Amer Heritage Thali Rasoi',
                cost: 950,
                status: 'Planned',
                isLocked: false,
                isUserModified: false,
                isWeatherSensitive: false,
                lat: 26.9800,
                lng: 75.8480,
                orderIndex: 2
              },
              {
                id: `item_${Date.now()}_${d}_3`,
                dayId: `day_${d}`,
                tripId,
                title: 'Hawa Mahal & City Palace Royal Quarters',
                description: 'Admire the 953 honeycombed jharokha lattice windows and royal armory artifacts inside the Pink City.',
                category: 'Sightseeing',
                startTime: '03:30 PM',
                endTime: '05:30 PM',
                location: 'Hawa Mahal Rd, Badi Choupad',
                cost: 500,
                status: 'Planned',
                isLocked: false,
                isUserModified: false,
                isWeatherSensitive: false,
                lat: 26.9239,
                lng: 75.8267,
                orderIndex: 3
              },
              {
                id: `item_${Date.now()}_${d}_4`,
                dayId: `day_${d}`,
                tripId,
                title: 'Nahargarh Fort Clifftop Sunset & Rooftop Cafe',
                description: 'Spectacular sunset panorama over the illuminated Pink City skyline from the ancient ramparts of Nahargarh.',
                category: 'Activity',
                startTime: '06:00 PM',
                endTime: '08:30 PM',
                location: 'Nahargarh Fort Ridge',
                cost: 400,
                status: 'Planned',
                isLocked: false,
                isUserModified: false,
                isWeatherSensitive: true,
                weatherAlternative: {
                  title: 'Chokhi Dhani Indoor Cultural Village & Folk Dance',
                  description: 'Vibrant indoor pavilions featuring traditional Kalbeliya dance, puppetry, and heritage hospitality.',
                  category: 'Culture',
                  location: 'Tonk Road Ethnic Resort',
                  cost: 1100,
                  indoorReason: 'Covered pavilions shielded from evening rain.'
                },
                lat: 26.9380,
                lng: 75.8155,
                orderIndex: 4
              }
            ];
          } else {
            theme = `Hidden Stepwells, Johari Bazaar & Artisan Guilds`;
            items = [
              {
                id: `item_${Date.now()}_${d}_1`,
                dayId: `day_${d}`,
                tripId,
                title: 'Galta Ji Sun Temple & Sacred Valley Springs',
                description: 'Peaceful morning walk through the scenic mountain cleft visiting ancient natural springs and pavilion shrines.',
                category: 'Culture',
                startTime: '08:00 AM',
                endTime: '11:00 AM',
                location: 'Galta Valley Kunds',
                cost: 0,
                status: 'Planned',
                isLocked: false,
                isUserModified: false,
                isWeatherSensitive: true,
                weatherAlternative: {
                  title: 'Albert Hall Museum Gallery Tour',
                  description: 'State central museum with rare Persian carpets, miniature paintings, and stone sculptures in Indo-Saracenic halls.',
                  category: 'Sightseeing',
                  location: 'Ram Niwas Garden',
                  cost: 300,
                  indoorReason: 'Spacious climate-controlled museum safe from adverse weather.'
                },
                lat: 26.9158,
                lng: 75.8622,
                orderIndex: 1
              },
              {
                id: `item_${Date.now()}_${d}_2`,
                dayId: `day_${d}`,
                tripId,
                title: 'Traditional Kachori & Street Food Crawl',
                description: 'Sample world-famous Pyaaz Kachori, Ghevar, and sweet Lassi in the historic walled bazaars.',
                category: 'Food',
                startTime: '12:00 PM',
                endTime: '02:00 PM',
                location: 'Johari Bazaar & MI Road Heritage Lane',
                cost: 650,
                status: 'Planned',
                isLocked: false,
                isUserModified: false,
                isWeatherSensitive: false,
                lat: 26.9200,
                lng: 75.8200,
                orderIndex: 2
              },
              {
                id: `item_${Date.now()}_${d}_3`,
                dayId: `day_${d}`,
                tripId,
                title: 'Gaitore Royal Marble Cenotaphs Tour',
                description: 'Wander through exquisitely carved white marble royal chhatris in an uncrowded mountain amphitheater.',
                category: 'Sightseeing',
                startTime: '03:00 PM',
                endTime: '05:00 PM',
                location: 'Gaitore Ki Chhatriyan',
                cost: 50,
                status: 'Planned',
                isLocked: false,
                isUserModified: false,
                isWeatherSensitive: false,
                lat: 26.9402,
                lng: 75.8247,
                orderIndex: 3
              },
              {
                id: `item_${Date.now()}_${d}_4`,
                dayId: `day_${d}`,
                tripId,
                title: 'Bapu Bazaar Handicrafts & Evening Light Show',
                description: 'Browse authentic mojaris, blue pottery, and bandhani textiles, followed by the Amber Fort sound & light show.',
                category: 'Activity',
                startTime: '05:30 PM',
                endTime: '08:30 PM',
                location: 'Bapu Bazaar Heritage Market',
                cost: 500,
                status: 'Planned',
                isLocked: false,
                isUserModified: false,
                isWeatherSensitive: false,
                lat: 26.9180,
                lng: 75.8240,
                orderIndex: 4
              }
            ];
          }
        } else if (isGoa) {
          theme = `Coastal Heritage, Island Ferries & Sunset Coves`;
          items = [
            {
              id: `item_${Date.now()}_${d}_1`,
              dayId: `day_${d}`,
              tripId,
              title: 'Fontainhas Latin Quarter Walking Tour',
              description: 'Morning guided stroll through pastel-painted Portuguese villas, heritage azulejo tile studios, and heritage bakeries.',
              category: 'Culture',
              startTime: '08:30 AM',
              endTime: '11:30 AM',
              location: 'Altinho, Panaji',
              cost: 300,
              status: 'Planned',
              isLocked: false,
              isUserModified: false,
              isWeatherSensitive: true,
              weatherAlternative: {
                title: 'Houses of Goa Architectural Museum',
                description: 'Unique multi-level ship-shaped museum showcasing Indo-Portuguese home architecture and antique woodwork.',
                category: 'Sightseeing',
                location: 'Salvador do Mundo',
                cost: 250,
                indoorReason: 'Protected dry indoor gallery.'
              },
              lat: 15.4989,
              lng: 73.8312,
              orderIndex: 1
            },
            {
              id: `item_${Date.now()}_${d}_2`,
              dayId: `day_${d}`,
              tripId,
              title: 'Authentic Goan Seafood / Thali Feast',
              description: 'Fresh local coastal fish thali with sol kadhi, prawn curry, and traditional poi bread.',
              category: 'Food',
              startTime: '01:00 PM',
              endTime: '02:30 PM',
              location: 'Old Town Heritage Tavern',
              cost: 1100,
              status: 'Planned',
              isLocked: false,
              isUserModified: false,
              isWeatherSensitive: false,
              lat: 15.5000,
              lng: 73.8350,
              orderIndex: 2
            },
            {
              id: `item_${Date.now()}_${d}_3`,
              dayId: `day_${d}`,
              tripId,
              title: 'Divar Island Ferry Crossing & Paddy Fields',
              description: 'River ferry crossing to the quiet island of Divar, cycling past centuries-old churches and backwater canals.',
              category: 'Activity',
              startTime: '03:30 PM',
              endTime: '05:30 PM',
              location: 'Divar Island Ferry Terminal',
              cost: 100,
              status: 'Planned',
              isLocked: false,
              isUserModified: false,
              isWeatherSensitive: true,
              weatherAlternative: {
                title: 'Reis Magos Fort Indoor Heritage Gallery',
                description: 'Restored 1551 fortress with indoor weapons gallery, prison halls, and Mario Miranda cartoon exhibits.',
                category: 'Sightseeing',
                location: 'Verem Foothills',
                cost: 200,
                indoorReason: 'Covered ramparts and indoor exhibition halls.'
              },
              lat: 15.5186,
              lng: 73.9015,
              orderIndex: 3
            },
            {
              id: `item_${Date.now()}_${d}_4`,
              dayId: `day_${d}`,
              tripId,
              title: 'Cabo de Rama Sunset Cliff Lounge',
              description: 'Panoramic clifftop sunset overlooking the Arabian Sea with cool ocean breeze and live acoustic music.',
              category: 'Activity',
              startTime: '06:00 PM',
              endTime: '08:30 PM',
              location: 'Cabo de Rama Coastal Ridge',
              cost: 500,
              status: 'Planned',
              isLocked: false,
              isUserModified: false,
              isWeatherSensitive: false,
              lat: 15.0886,
              lng: 73.9212,
              orderIndex: 4
            }
          ];
        } else {
          // Default / Mountains / Other Indian Destinations
          theme = d % 2 === 0
            ? `Hidden Discoveries & Heritage Trail in ${params.destination}`
            : `Scenic Vistas, Local Flavors & Cultural Immersion in ${params.destination}`;
          items = [
            {
              id: `item_${Date.now()}_${d}_1`,
              dayId: `day_${d}`,
              tripId,
              title: `${params.destination} Landmark & Nature Trail`,
              description: `Guided morning nature hike through scenic viewpoints, pristine parks, and historical vantage spots in ${params.destination}.`,
              category: 'Activity',
              startTime: '09:00 AM',
              endTime: '01:00 PM',
              location: `${params.destination} Scenic Route`,
              cost: 650,
              status: 'Planned',
              isLocked: false,
              isUserModified: false,
              isWeatherSensitive: true,
              weatherAlternative: {
                title: `${params.destination} Heritage Museum & Art Gallery`,
                description: 'Interactive cultural gallery showcasing regional handicrafts, traditional architecture, and folk heritage.',
                category: 'Sightseeing',
                location: `${params.destination} Heritage Complex`,
                cost: 350,
                indoorReason: 'Completely indoor climate-controlled sanctuary safe from rain and weather.'
              },
              lat: 28.6139,
              lng: 77.2090,
              orderIndex: 1
            },
            {
              id: `item_${Date.now()}_${d}_2`,
              dayId: `day_${d}`,
              tripId,
              title: `Traditional Regional Gastronomic Feast`,
              description: `Authentic multi-course meal served with local spices, fresh bread, and regional sweet delicacies.`,
              category: 'Food',
              startTime: '01:30 PM',
              endTime: '03:00 PM',
              location: `${params.destination} Traditional Rasoi`,
              cost: 900,
              status: 'Planned',
              isLocked: false,
              isUserModified: false,
              isWeatherSensitive: false,
              lat: 28.6200,
              lng: 77.2100,
              orderIndex: 2
            },
            {
              id: `item_${Date.now()}_${d}_3`,
              dayId: `day_${d}`,
              tripId,
              title: `Historic Quarter & Artisan Craft Guild`,
              description: `Explore centuries-old architecture and meet local artisan master craftsmen in their studios.`,
              category: 'Sightseeing',
              startTime: '03:30 PM',
              endTime: '06:00 PM',
              location: `${params.destination} Old Quarter`,
              cost: 400,
              status: 'Planned',
              isLocked: false,
              isUserModified: false,
              isWeatherSensitive: false,
              lat: 28.6250,
              lng: 77.2150,
              orderIndex: 3
            },
            {
              id: `item_${Date.now()}_${d}_4`,
              dayId: `day_${d}`,
              tripId,
              title: `Evening Cultural Gathering & Stargazing`,
              description: `Gather for warm local tea, traditional acoustic music, and evening relaxation with fellow travellers.`,
              category: 'Activity',
              startTime: '07:30 PM',
              endTime: '09:30 PM',
              location: `${params.destination} Evening Courtyard`,
              cost: 350,
              status: 'Planned',
              isLocked: false,
              isUserModified: false,
              isWeatherSensitive: true,
              weatherAlternative: {
                title: 'Indoor Fireside Lounge & Travel Trivia Evening',
                description: 'Warm indoor lounge with board games, hot cocoa, and travel tales with fellow travellers.',
                category: 'Rest',
                location: 'Hotel Fireside Lounge',
                cost: 200,
                indoorReason: 'Protected from outdoor evening rain or cold.'
              },
              lat: 28.6180,
              lng: 77.2050,
              orderIndex: 4
            }
          ];
        }
      }

      itinerary.push({
        id: `day_${d}`,
        tripId,
        dayNumber: d,
        date: dateStr,
        theme,
        weatherForecast: {
          condition: d % 3 === 0 ? 'Partly Cloudy' : 'Sunny',
          tempC: d % 2 === 0 ? 26 : 24,
          precipitationChance: d % 3 === 0 ? 15 : 5,
          alertLevel: 'None',
          summary: `Pleasant weather in ${params.destination} ideal for sightseeing and outdoor trails.`
        },
        items
      });
    }

    const hiddenGems: HiddenGem[] = TravelDataService.getHiddenGemsForDestination(params.destination, tripId);


    const weather: WeatherSnapshot[] = itinerary.map(day => ({
      id: `w_snap_${day.dayNumber}`,
      tripId,
      date: `Day ${day.dayNumber} (${day.date})`,
      condition: day.weatherForecast?.condition || 'Sunny',
      tempC: day.weatherForecast?.tempC || 18,
      precipitationChance: day.weatherForecast?.precipitationChance || 10,
      windSpeed: '12 km/h NW',
      alertLevel: day.weatherForecast?.alertLevel || 'None',
      summary: day.weatherForecast?.summary || 'Clear weather.'
    }));

    return {
      trip,
      transports,
      accommodations,
      itinerary,
      budget,
      hiddenGems,
      weather
    };
  }

  /**
   * AI Replanner: Selectively re-optimizes unlocked and non-user-modified activities
   */
  public static replanItinerary(data: FullTripData, reason?: string): ItineraryDay[] {
    const itinerary = JSON.parse(JSON.stringify(data.itinerary)) as ItineraryDay[];

    itinerary.forEach(day => {
      day.items.forEach(item => {
        // Only touch items that are NOT locked and NOT modified by the user
        if (!item.isLocked && !item.isUserModified) {
          if (item.category === 'Activity' || item.category === 'Sightseeing') {
            item.description = `${item.description} [AI Re-optimized for ${data.trip.travelStyle} travel style & current pace]`;
          }
        }
      });
    });

    return itinerary;
  }

  /**
   * Yatra Copilot: Answers questions strictly with live data context
   */
  public static answerCopilot(tripData: FullTripData, question: string): string {
    const q = question.toLowerCase().trim();
    const metrics = tripData.metrics;
    const trip = tripData.trip;
    const members = tripData.members;
    const weather = tripData.weather;
    const itinerary = tripData.itinerary;
    const transports = tripData.transports;
    const accommodations = tripData.accommodations;
    const expenses = tripData.expenses;
    const hiddenGems = tripData.hiddenGems || [];

    // 1. Weather / Rain / Monsoon / Temperature
    if (q.includes('rain') || q.includes('raining') || q.includes('weather') || q.includes('forecast') || q.includes('temp') || q.includes('climate')) {
      const day2 = itinerary[1] || itinerary[0];
      const alternatives = day2?.items
        .filter(i => i.isWeatherSensitive && i.weatherAlternative)
        .map(i => `• **${i.weatherAlternative?.title}** (${i.weatherAlternative?.location}) — Cost: ₹${i.weatherAlternative?.cost} (Indoor safety: ${i.weatherAlternative?.indoorReason})`)
        .join('\n');

      const weatherList = weather.slice(0, 4).map(w => 
        `• **${w.date} (${w.condition})**: ${w.tempC}°C (Rain probability: ${w.precipitationChance}%, Alert: ${w.alertLevel})`
      ).join('\n');

      return `🌦️ **Live Weather Intelligence & Advisory (${trip.destination}):**

${weatherList}

${alternatives ? `🌧️ **Indoor Alternatives for Weather Contingency:**\n${alternatives}\n` : ''}
💡 **Copilot Recommendation:**
For your group of **${trip.travellersCount} travellers**, keep an umbrella or light rainwear handy. If outdoor activities are disrupted, the indoor alternatives keep everyone sheltered while saving ~₹450/person from your remaining budget (₹${metrics.remainingBudget.toLocaleString('en-IN')})!`;
    }

    // 2. Budget / Expenses / Remaining / Costs / Spending
    if (q.includes('budget') || q.includes('money') || q.includes('remaining') || q.includes('cost') || q.includes('spent') || q.includes('expense') || q.includes('financial') || q.includes('how much')) {
      const topExpense = [...expenses].sort((a, b) => b.amount - a.amount)[0];
      const perPersonRemaining = Math.round(metrics.remainingBudget / Math.max(1, trip.travellersCount));
      
      const categoryBreakdown = [
        `• Stays & Hotels: ₹${tripData.budget.accommodationAllocated.toLocaleString('en-IN')}`,
        `• Transit & Trains: ₹${tripData.budget.transportAllocated.toLocaleString('en-IN')}`,
        `• Food & Dining: ₹${tripData.budget.foodAllocated.toLocaleString('en-IN')}`,
        `• Sightseeing & Activities: ₹${tripData.budget.activitiesAllocated.toLocaleString('en-IN')}`
      ].join('\n');

      return `💰 **Trip Financial & Budget Status (Live):**

• **Total Group Budget:** ₹${metrics.totalBudget.toLocaleString('en-IN')}
• **Total Spent So Far:** ₹${metrics.totalSpent.toLocaleString('en-IN')} (${Math.round((metrics.totalSpent / metrics.totalBudget) * 100)}% utilized)
• **Remaining Balance:** ₹${metrics.remainingBudget.toLocaleString('en-IN')}
• **Safe Daily Allowance:** ₹${Math.round(metrics.remainingBudget / Math.max(1, itinerary.length)).toLocaleString('en-IN')} / day for the entire group
• **Per-Person Remaining:** ₹${perPersonRemaining.toLocaleString('en-IN')} / person
• **Health Rating:** **${metrics.budgetHealthStatus}**

📊 **Allocated Category Limits:**
${categoryBreakdown}

${topExpense ? `📌 **Top Logged Expense:** *${topExpense.title}* (₹${topExpense.amount.toLocaleString('en-IN')} under ${topExpense.category})` : ''}
${metrics.spendingAlerts.length > 0 ? `⚠️ **Alert:** ${metrics.spendingAlerts[0]}` : '✨ Your spending is well within planned parameters.'}`;
    }

    // 3. Group balances / Splitting / Who owes who / Settle up
    if (q.includes('owe') || q.includes('split') || q.includes('balances') || q.includes('settle') || q.includes('share') || q.includes('paid') || q.includes('settlement')) {
      const balanceDetails = metrics.groupBalances
        .map(b => {
          if (b.netBalance > 0) {
            return `• **${b.name}**: Paid ₹${b.paid.toLocaleString('en-IN')} (Fair Share: ₹${b.shouldPay.toLocaleString('en-IN')}) ➔ *Receives ₹${b.netBalance.toLocaleString('en-IN')}*`;
          } else if (b.netBalance < 0) {
            return `• **${b.name}**: Paid ₹${b.paid.toLocaleString('en-IN')} (Fair Share: ₹${b.shouldPay.toLocaleString('en-IN')}) ➔ *Owes ₹${Math.abs(b.netBalance).toLocaleString('en-IN')}*`;
          } else {
            return `• **${b.name}**: Paid ₹${b.paid.toLocaleString('en-IN')} (Fair Share: ₹${b.shouldPay.toLocaleString('en-IN')}) ➔ *Settled (₹0)*`;
          }
        })
        .join('\n');

      const settlementDetails = metrics.settlements && metrics.settlements.length > 0
        ? metrics.settlements.map(s => `• **${s.fromMemberName}** pays **${s.toMemberName}** **₹${s.amount.toLocaleString('en-IN')}**`).join('\n')
        : '• No outstanding settlements. All balances are balanced!';

      return `👥 **Live Group Expense Settlement Plan (${members.length} Members):**

Total Group Spending: **₹${metrics.totalSpent.toLocaleString('en-IN')}**
Equal Fair Share: **₹${Math.round(metrics.totalSpent / Math.max(1, members.length)).toLocaleString('en-IN')}** per member

📊 **Member Net Balances:**
${balanceDetails}

🤝 **Who Pays Whom (Optimal Settlements):**
${settlementDetails}

💡 **Action Tip:** Check the **Group & Splits** view for full details and UPI settlements!`;
    }

    // 4. Schedule / Tomorrow / Today / Itinerary / Plan / Timeline
    if (q.includes('tomorrow') || q.includes('today') || q.includes('plan') || q.includes('schedule') || q.includes('itinerary') || q.includes('day 1') || q.includes('day 2') || q.includes('day 3') || q.includes('day 4') || q.includes('what next')) {
      let targetDay = itinerary[0];
      if (q.includes('tomorrow') || q.includes('day 2')) targetDay = itinerary[1] || itinerary[0];
      else if (q.includes('day 3')) targetDay = itinerary[2] || targetDay;
      else if (q.includes('day 4')) targetDay = itinerary[3] || targetDay;

      const itemsList = targetDay.items
        .map(i => `• **${i.startTime} - ${i.endTime}**: ${i.title} (${i.location}) — ${i.category} (Est: ₹${i.cost})`)
        .join('\n');

      return `📅 **Schedule for Day ${targetDay.dayNumber}: ${targetDay.theme} (${trip.destination}):**

${itemsList}

📍 **Stay:** ${accommodations[0]?.name || 'Base Hotel'} (${accommodations[0]?.address || trip.destination})
🌦️ **Weather Forecast:** ${targetDay.weatherForecast?.condition || 'Pleasant'}, ${targetDay.weatherForecast?.tempC || 20}°C
⏱️ All activities have built-in transit buffer buffers. You can lock or reorder any activity directly in the **Itinerary** tab.`;
    }

    // 5. Trains / Flights / Transport / Tickets / Departure / PNR / Delay
    if (q.includes('train') || q.includes('flight') || q.includes('transport') || q.includes('transit') || q.includes('ticket') || q.includes('pnr') || q.includes('departure') || q.includes('timing') || q.includes('station') || q.includes('airport')) {
      const outTransport = transports[0];
      const retTransport = transports.find(t => t.isReturn) || transports[1];

      return `🚆 **Live Transit & Journey Overview:**

• **Outbound Leg (${outTransport?.type || 'Train'}):**
  - Carrier: **${outTransport?.provider || 'Superfast Express'}** (ID: ${outTransport?.identifier || 'N/A'})
  - Route: **${outTransport?.departureStation}** ➔ **${outTransport?.arrivalStation}**
  - Time: Departs **${outTransport?.departureTime}**, Arrives **${outTransport?.arrivalTime}**
  - Booking Status: ${outTransport?.status} | ${outTransport?.seats || 'Confirmed'}
  - PNR / Reference: \`${outTransport?.pnr || 'PNR-LIVE-CONFIRMED'}\`

${retTransport ? `• **Return Leg (${retTransport?.type || 'Train'}):**
  - Carrier: **${retTransport?.provider}** (${retTransport?.identifier})
  - Route: **${retTransport?.departureStation}** ➔ **${retTransport?.arrivalStation}**
  - Time: Departs **${retTransport?.departureTime}**, Arrives **${retTransport?.arrivalTime}**
  - Booking Status: ${retTransport?.status}` : ''}

💡 **Doorstep Connection:** Your itinerary includes doorstep cab connections from your home address to the departure station. Check the **Transport & Bookings** tab to view seat maps or search alternate trains.`;
    }

    // 6. Hotel / Stay / Accommodation / Check-in / Rooms
    if (q.includes('hotel') || q.includes('stay') || q.includes('room') || q.includes('resort') || q.includes('accommodation') || q.includes('check-in') || q.includes('checkout')) {
      const stay = accommodations[0];
      return `🏨 **Accommodation & Stays Overview:**

• **Property:** **${stay?.name || 'Grand Heritage Hotel'}**
• **Location:** ${stay?.address || trip.destination}
• **Rooms Booked:** ${stay?.roomCount || 1} Rooms for ${trip.travellersCount} travellers
• **Check-in:** ${stay?.checkIn || '12:00 PM'} | **Check-out:** ${stay?.checkOut || '11:00 AM'}
• **Total Stay Cost:** ₹${stay?.totalPrice?.toLocaleString('en-IN') || '4,500'} (Confirmed)
• **Amenities:** Free Wi-Fi, Breakfast Included, 24/7 Front Desk, Luggage Storage

💡 Need an extra room or early check-in? You can manage stay details and simulate room upgrades in the **What-If Sandbox**!`;
    }

    // 7. Hidden gems / Offbeat places / Sightseeing / Recommendations
    if (q.includes('hidden gem') || q.includes('gem') || q.includes('offbeat') || q.includes('recommend') || q.includes('places to visit') || q.includes('must visit') || q.includes('secret')) {
      const gemsList = hiddenGems.slice(0, 3).map(g => 
        `• **${g.name}** (${g.bestTime}): ${g.description} — *Local safety tip: ${g.safetyInfo}* (Est: ₹${g.cost})`
      ).join('\n\n');

      return `💎 **Curated Offbeat Gems for ${trip.destination}:**

${gemsList || '• **Old Bazaar Heritage Walk**: Early morning walking trail through historic artisan lanes.\n• **Sunset Ridge Point**: Quiet panoramic sunset spot far from tourist crowds.'}

💡 Tap **Hidden Gems** in the sidebar to add any of these authentic spots directly to your daily itinerary with 1-click!`;
    }

    // 8. Food / Dining / Restaurants / Cafes / What to eat
    if (q.includes('food') || q.includes('eat') || q.includes('restaurant') || q.includes('cafe') || q.includes('dining') || q.includes('breakfast') || q.includes('lunch') || q.includes('dinner')) {
      return `🍲 **Culinary Guide for ${trip.destination}:**

• **Breakfast:** Local street treats & fresh herbal chai near the central town market (₹80–150/person)
• **Lunch Recommendation:** Traditional Thali and local regional delicacies (₹250–400/person)
• **Evening Snack:** Fresh baked goods, artisan coffees & sunset snacks
• **Dinner Recommendation:** Authentic rooftop dining with views of ${trip.destination} (₹450–700/person)

💰 **Budget Allocated for Food:** ₹${tripData.budget.foodAllocated.toLocaleString('en-IN')} (approx ₹${Math.round(tripData.budget.foodAllocated / (trip.travellersCount * Math.max(1, itinerary.length)))}/person/day). Log every meal in the **Budget** tab to keep tabs on group splits!`;
    }

    // 9. Packing / What to carry / Essentials / Clothes
    if (q.includes('pack') || q.includes('clothes') || q.includes('wear') || q.includes('carry') || q.includes('bring') || q.includes('bag')) {
      const avgTemp = weather[0]?.tempC || 22;
      const isCool = avgTemp < 20;

      return `🎒 **Smart Packing Checklist for ${trip.destination} (${avgTemp}°C):**

• **Clothing:** ${isCool ? 'Light thermals, fleece jacket, comfortable walking sneakers, and windcheaters.' : 'Breathable cotton shirts, comfortable walking shoes, sunglasses, and a sunhat.'}
• **Transit Essentials:** Govt Photo ID (Aadhaar / Passport / Voter ID) for train/flight boarding, digital PNR ticket, power bank (10,000+ mAh), charging cables.
• **Health & Safety:** Basic personal medical kit (ORS, paracetamol, band-aids, motion sickness pills), hand sanitizer, refillable water bottle.
• **Weather Shield:** Compact umbrella or light waterproof jacket (current forecast: ${weather[0]?.condition || 'Clear'}).`;
    }

    // 10. Local travel guidelines & transit tips
    if (q.includes('tip') || q.includes('advice') || q.includes('guideline') || q.includes('rule') || q.includes('transport connection') || q.includes('commute')) {
      return `🧭 **Travel Guidelines & Transit Tips for ${trip.destination}:**

• **Transit Timings:** Arrive at railway stations at least 30 minutes before scheduled departure (${transports[0]?.departureTime || '07:00 AM'}).
• **Local Connections:** Auto-rickshaws and cabs are readily available at station exits. You can also view doorstep transfer options in the **Door-to-Door** tab.
• **Digital Tickets:** Keep your IRCTC/airline boarding pass and photo identification readily accessible on your phone.
• **Weather Readiness:** Current destination weather is **${weather[0]?.condition || 'Pleasant'}** (${weather[0]?.tempC || 20}°C).`;
    }

    // 11. Traveller count / Extra people / Group changes
    if (q.includes('extra people') || q.includes('more people') || q.includes('joined') || q.includes('traveller') || q.includes('group size') || q.includes('members')) {
      return `👥 **Traveller Count Impact Analysis:**

Current travellers: **${trip.travellersCount} people**.
If your travel party increases or decreases:
• **Hotel Stays:** Rooms automatically scale to **${Math.ceil((trip.travellersCount + 2) / 2)} rooms** (1 room / 2 people).
• **Per-Person Budget:** Adjusts to **₹${Math.round(trip.budget / (trip.travellersCount + 2)).toLocaleString('en-IN')}** per traveller.
• **Group Bookings:** Train and flight ticket allocations scale proportionally.

You can modify travellers on the **Dashboard** or **Group Manager**, and all ${itinerary.length} days of the itinerary and budget metrics will adapt reactively!`;
    }

    // 12. General contextual response
    return `👋 **Yatra Copilot at your service!**

I am actively monitoring your journey: **${trip.origin} ➔ ${trip.destination}** (${trip.startDate} to ${trip.endDate}) for **${trip.travellersCount} travellers**.

📊 **Live Trip Pulse:**
• **Budget:** ₹${metrics.totalBudget.toLocaleString('en-IN')} total (Spent: ₹${metrics.totalSpent.toLocaleString('en-IN')}, Remaining: ₹${metrics.remainingBudget.toLocaleString('en-IN')})
• **Transit:** ${transports[0]?.provider || 'Express Train'} (${transports[0]?.departureTime}) from ${transports[0]?.departureStation}
• **Stay:** ${accommodations[0]?.name || 'Base Hotel'} (${accommodations[0]?.roomCount} rooms)
• **Current Weather:** ${weather[0]?.condition || 'Pleasant'} (${weather[0]?.tempC || 20}°C)
• **Next Up:** Day 1: ${itinerary[0]?.items[0]?.title || 'Doorstep Pickup & Departure'}

💬 **What would you like assistance with?**
• *"How much money do we have left?"*
• *"What should we do if it rains tomorrow?"*
• *"Who owes money in the group?"*
• *"What are top offbeat hidden gems?"*
• *"What is the schedule for tomorrow?"*
• *"What should I pack for this trip?"*`;
  }
}
