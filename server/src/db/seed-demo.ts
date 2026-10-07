import { db } from './index';
import {
  Trip,
  TripMember,
  Transport,
  Accommodation,
  ItineraryDay,
  Expense,
  Budget,
  Booking,
  WeatherSnapshot,
  HiddenGem,
  TripChangeLog,
  NotificationItem
} from '../types';

export function seedDemoTrip(): Trip {
  const tripId = 'demo-manali-trip-2026';

  const trip: Trip = {
    id: tripId,
    userId: 'usr_demo_yatra',
    title: 'Moradabad to Manali Himalayan Odyssey',
    origin: 'Moradabad',
    destination: 'Manali',
    startDate: '2026-10-15',
    endDate: '2026-10-18',
    travellersCount: 4,
    budget: 40000,
    transportPreference: 'Train',
    accommodationPreference: 'Boutique Hotel',
    travelStyle: 'Balanced',
    interests: ['History', 'Food', 'Hidden Places', 'Nature Trails'],
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const members: TripMember[] = [
    {
      id: 'mem_satyam',
      tripId,
      name: 'Satyam Sharma',
      email: 'satyam@yatra360.app',
      phone: '+91 98765 11001',
      role: 'Organizer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      paidAmount: 9500,
      balance: 4875
    },
    {
      id: 'mem_rahul',
      tripId,
      name: 'Rahul Verma',
      email: 'rahul@yatra360.app',
      phone: '+91 98765 11002',
      role: 'Co-Leader',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      paidAmount: 7200,
      balance: 2575
    },
    {
      id: 'mem_aman',
      tripId,
      name: 'Aman Gupta',
      email: 'aman@yatra360.app',
      phone: '+91 98765 11003',
      role: 'Member',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      paidAmount: 1800,
      balance: -2825
    },
    {
      id: 'mem_neha',
      tripId,
      name: 'Neha Singh',
      email: 'neha@yatra360.app',
      phone: '+91 98765 11004',
      role: 'Member',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      paidAmount: 0,
      balance: -4625
    }
  ];

  const transports: Transport[] = [
    {
      id: 't_outbound',
      tripId,
      type: 'Train',
      provider: 'Vande Bharat Express (22435)',
      identifier: '22435',
      departureStation: 'Moradabad Junction (MB)',
      arrivalStation: 'Chandigarh / Anandpur Sahib (CDG)',
      departureTime: '07:00 AM',
      arrivalTime: '01:30 PM',
      price: 7200,
      status: 'Confirmed',
      isReturn: false,
      seats: 'Coach C4, Seats 21-24 (4 Confirmed)',
      pnr: '2456-789123',
      notes: 'Doorstep pickup cab scheduled from Moradabad at 05:45 AM.'
    },
    {
      id: 't_return',
      tripId,
      type: 'Train',
      provider: 'Vande Bharat Express (22436)',
      identifier: '22436',
      departureStation: 'Chandigarh Junction (CDG)',
      arrivalStation: 'Moradabad Junction (MB)',
      departureTime: '03:00 PM',
      arrivalTime: '09:30 PM',
      price: 7200,
      status: 'Confirmed',
      isReturn: true,
      seats: 'Coach C5, Seats 18-21 (4 Confirmed)',
      pnr: '2456-789124',
      notes: 'Drop-off cab from Moradabad Station to Home Doorstep ~10:15 PM.'
    }
  ];

  const accommodations: Accommodation[] = [
    {
      id: 'acc_manali_retreat',
      tripId,
      name: 'Manali Pineview Eco Retreat & Spa',
      type: 'Boutique Hotel',
      address: 'Log Huts Area, Old Manali Road, Manali, HP 175131',
      checkIn: '2026-10-15 02:30 PM',
      checkOut: '2026-10-18 11:00 AM',
      pricePerNight: 3200,
      totalPrice: 19200, // 2 rooms * 3 nights * 3200
      roomCount: 2,
      bookingRef: 'HTL-MNL-88219',
      amenities: ['Mountain View Balcony', 'High-Speed WiFi', 'Heated Bedding', 'Organic Breakfast Buffet', 'Fireside Lounge'],
      lat: 32.2432,
      lng: 77.1892
    }
  ];

  const itinerary: ItineraryDay[] = [
    {
      id: 'day_1',
      tripId,
      dayNumber: 1,
      date: '2026-10-15',
      theme: 'Doorstep Departure, Scenic Train & Old Manali Arrival',
      weatherForecast: {
        condition: 'Sunny',
        tempC: 18,
        precipitationChance: 5,
        alertLevel: 'None',
        summary: 'Crisp, sunny autumn mountain weather.'
      },
      items: [
        {
          id: 'item_d1_1',
          dayId: 'day_1',
          tripId,
          title: 'Doorstep Cab Pick-up from Moradabad Home',
          description: 'Pre-scheduled electric taxi arrives at home to transfer all 4 travellers with baggage to Moradabad Railway Station.',
          category: 'Transit',
          startTime: '05:45 AM',
          endTime: '06:30 AM',
          location: 'Civil Lines, Moradabad',
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
          id: 'item_d1_2',
          dayId: 'day_1',
          tripId,
          title: 'Board Vande Bharat Express (Train 22435)',
          description: 'Comfortable air-conditioned express train journey with onboard breakfast and scenic foothills views.',
          category: 'Transit',
          startTime: '07:00 AM',
          endTime: '01:30 PM',
          location: 'Moradabad Junction Platform 1',
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
          id: 'item_d1_3',
          dayId: 'day_1',
          tripId,
          title: 'Scenic Mountain Transfer & Hotel Check-in',
          description: 'Private connecting tempo cab reaches Manali via panoramic valley highway. Check into Pineview Eco Retreat.',
          category: 'Check-in',
          startTime: '02:30 PM',
          endTime: '04:00 PM',
          location: 'Pineview Eco Retreat, Old Manali',
          cost: 1200,
          status: 'Planned',
          isLocked: false,
          isUserModified: false,
          isWeatherSensitive: false,
          lat: 32.2432,
          lng: 77.1892,
          orderIndex: 3
        },
        {
          id: 'item_d1_4',
          dayId: 'day_1',
          tripId,
          title: 'Old Manali Heritage Walk & Cafe Welcome Dinner',
          description: 'Stroll across apple orchards and wooden bridges, enjoying wood-fired trout pizza and spiced apple tea at Cafe 1947.',
          category: 'Food',
          startTime: '05:30 PM',
          endTime: '08:30 PM',
          location: 'Old Manali Promenade',
          cost: 1400,
          status: 'Planned',
          isLocked: false,
          isUserModified: false,
          isWeatherSensitive: true,
          weatherAlternative: {
            title: 'Artisanal Himalayan Hearth Indoor Bistro',
            description: 'Cozy indoor dining sanctuary featuring wood-fired dining, live acoustic folk music, and warm herbal teas.',
            category: 'Food',
            location: 'Old Manali Indoor Arcade',
            cost: 1500,
            indoorReason: 'Shielded from outdoor rain & cold winds.'
          },
          lat: 32.245,
          lng: 77.189,
          orderIndex: 4
        }
      ]
    },
    {
      id: 'day_2',
      tripId,
      dayNumber: 2,
      date: '2026-10-16',
      theme: 'Solang Valley Nature Hike, Authentic Dham & Cultural Heritage',
      weatherForecast: {
        condition: 'Sunny',
        tempC: 17,
        precipitationChance: 10,
        alertLevel: 'None',
        summary: 'Clear skies and gentle valley breeze.'
      },
      items: [
        {
          id: 'item_d2_1',
          dayId: 'day_2',
          tripId,
          title: 'Solang Valley Panoramic Trek & Pine Forest Walk',
          description: 'Guided morning nature trek along crystal clear streams and mountain vantage points with views of snow-capped peaks.',
          category: 'Activity',
          startTime: '09:00 AM',
          endTime: '01:00 PM',
          location: 'Solang Valley Nature Trail',
          cost: 1000,
          status: 'Planned',
          isLocked: false,
          isUserModified: false,
          isWeatherSensitive: true,
          weatherAlternative: {
            title: 'Himalayan Art, Culture & Heritage Museum',
            description: 'State-of-the-art interactive cultural gallery displaying folk wooden architecture, traditional textiles, and virtual valley tour.',
            category: 'Sightseeing',
            location: 'Himalayan Heritage Complex, Manali',
            cost: 500,
            indoorReason: 'Completely indoor climate-controlled sanctuary safe from rain and muddy tracks.'
          },
          lat: 32.3167,
          lng: 77.1667,
          orderIndex: 1
        },
        {
          id: 'item_d2_2',
          dayId: 'day_2',
          tripId,
          title: 'Authentic Himachali Traditional Dham Lunch',
          description: 'Seven-course royal feast served on leaf platters, cooked with local yogurt, madra, and wild herbs by local botis.',
          category: 'Food',
          startTime: '01:30 PM',
          endTime: '03:00 PM',
          location: 'Naggar Traditional Heritage Rasoi',
          cost: 1200,
          status: 'Planned',
          isLocked: false,
          isUserModified: false,
          isWeatherSensitive: false,
          lat: 32.1464,
          lng: 77.1685,
          orderIndex: 2
        },
        {
          id: 'item_d2_3',
          dayId: 'day_2',
          tripId,
          title: 'Naggar Castle & Himalayan Woodcraft Artisans',
          description: 'Tour 15th-century wood-and-stone castle architecture overlooking the Beas valley, meeting local artisans.',
          category: 'Sightseeing',
          startTime: '03:30 PM',
          endTime: '06:00 PM',
          location: 'Naggar Castle Heritage Site',
          cost: 600,
          status: 'Planned',
          isLocked: false,
          isUserModified: false,
          isWeatherSensitive: false,
          lat: 32.1464,
          lng: 77.1685,
          orderIndex: 3
        },
        {
          id: 'item_d2_4',
          dayId: 'day_2',
          tripId,
          title: 'Courtyard Campfire & Stargazing Session',
          description: 'Evening open fire with roasted chestnuts, local warm apple cider, and acoustic guitar under clear mountain skies.',
          category: 'Activity',
          startTime: '07:30 PM',
          endTime: '09:30 PM',
          location: 'Pineview Retreat Open Lawn',
          cost: 400,
          status: 'Planned',
          isLocked: false,
          isUserModified: false,
          isWeatherSensitive: true,
          weatherAlternative: {
            title: 'Indoor Fireside Board Game & Acoustic Music Night',
            description: 'Warm indoor fireside lounge with hot spiced cocoa, board games, and travel trivia in the hotel library.',
            category: 'Rest',
            location: 'Pineview Fireside Library Lounge',
            cost: 200,
            indoorReason: 'Protected from mountain rain & chilly wind.'
          },
          lat: 32.2432,
          lng: 77.1892,
          orderIndex: 4
        }
      ]
    },
    {
      id: 'day_3',
      tripId,
      dayNumber: 3,
      date: '2026-10-17',
      theme: 'High Altitude Mountain Pass & Apple Orchard Trail',
      weatherForecast: {
        condition: 'Partly Cloudy',
        tempC: 15,
        precipitationChance: 15,
        alertLevel: 'None',
        summary: 'Cool mountain air with picturesque cloud formations.'
      },
      items: [
        {
          id: 'item_d3_1',
          dayId: 'day_3',
          tripId,
          title: 'Rohtang Pass / Atal Tunnel High Altitude Tour',
          description: 'Scenic high-altitude drive through the engineering marvel of Atal Tunnel into the rugged Lahaul valley.',
          category: 'Activity',
          startTime: '08:30 AM',
          endTime: '01:00 PM',
          location: 'Atal Tunnel North Portal',
          cost: 1600,
          status: 'Planned',
          isLocked: false,
          isUserModified: false,
          isWeatherSensitive: true,
          weatherAlternative: {
            title: 'Manu Temple & Tibetan Monastery Cultural Tour',
            description: 'Visit tranquil indoor prayer halls, spin prayer wheels, and explore Buddhist art exhibitions.',
            category: 'Sightseeing',
            location: 'Old Manali Monastery Arcade',
            cost: 400,
            indoorReason: 'Safe indoor cultural immersion when high pass is misty.'
          },
          lat: 32.3639,
          lng: 77.1438,
          orderIndex: 1
        },
        {
          id: 'item_d3_2',
          dayId: 'day_3',
          tripId,
          title: 'Himalayan Trout Fishery & Organic Orchard Picnic',
          description: 'Sample fresh river trout cooked over coal and pick crisp autumnal apples directly from private orchard trees.',
          category: 'Food',
          startTime: '01:30 PM',
          endTime: '03:30 PM',
          location: 'Haripur Organic Apple Orchards',
          cost: 1100,
          status: 'Planned',
          isLocked: false,
          isUserModified: false,
          isWeatherSensitive: false,
          lat: 32.18,
          lng: 77.17,
          orderIndex: 2
        },
        {
          id: 'item_d3_3',
          dayId: 'day_3',
          tripId,
          title: 'Mall Road Handicraft & Woolen Pashmina Shopping',
          description: 'Explore certified handloom stores for authentic Kullu shawls, wooden carvings, and pine honey.',
          category: 'Shopping',
          startTime: '04:30 PM',
          endTime: '07:30 PM',
          location: 'Mall Road Promenade',
          cost: 1500,
          status: 'Planned',
          isLocked: false,
          isUserModified: false,
          isWeatherSensitive: false,
          lat: 32.2396,
          lng: 77.1887,
          orderIndex: 3
        }
      ]
    },
    {
      id: 'day_4',
      tripId,
      dayNumber: 4,
      date: '2026-10-18',
      theme: 'Farewell Himalayas, Return Express & Doorstep Arrival',
      weatherForecast: {
        condition: 'Sunny',
        tempC: 19,
        precipitationChance: 5,
        alertLevel: 'None',
        summary: 'Clear skies for a smooth return journey.'
      },
      items: [
        {
          id: 'item_d4_1',
          dayId: 'day_4',
          tripId,
          title: 'Sunrise Valley Breakfast & Checkout',
          description: 'Final breakfast overlooking the snow peaks, packing bags, and completing rapid checkout.',
          category: 'Food',
          startTime: '08:00 AM',
          endTime: '10:00 AM',
          location: 'Pineview Eco Retreat',
          cost: 800,
          status: 'Planned',
          isLocked: false,
          isUserModified: false,
          isWeatherSensitive: false,
          lat: 32.2432,
          lng: 77.1892,
          orderIndex: 1
        },
        {
          id: 'item_d4_2',
          dayId: 'day_4',
          tripId,
          title: 'Valley Transfer to Chandigarh Station',
          description: 'Private connecting transfer cab delivers group to the station platform well before train departure.',
          category: 'Check-out',
          startTime: '10:30 AM',
          endTime: '02:15 PM',
          location: 'Chandigarh Junction Station',
          cost: 1500,
          status: 'Planned',
          isLocked: true,
          isUserModified: false,
          isWeatherSensitive: false,
          lat: 30.7333,
          lng: 76.7794,
          orderIndex: 2
        },
        {
          id: 'item_d4_3',
          dayId: 'day_4',
          tripId,
          title: 'Board Return Vande Bharat Express (Train 22436)',
          description: 'Relax on high-speed rail with evening tea and dinner served on board.',
          category: 'Return Transit',
          startTime: '03:00 PM',
          endTime: '09:30 PM',
          location: 'Chandigarh Station Platform 2',
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
          id: 'item_d4_4',
          dayId: 'day_4',
          tripId,
          title: 'Doorstep Drop-off Taxi to Moradabad Home',
          description: 'Final door-to-door leg: Pre-arranged cab transfers all travellers safely from station to their home doorstep.',
          category: 'Return Transit',
          startTime: '09:45 PM',
          endTime: '10:30 PM',
          location: 'Civil Lines, Moradabad',
          cost: 650,
          status: 'Planned',
          isLocked: true,
          isUserModified: false,
          isWeatherSensitive: false,
          lat: 28.8386,
          lng: 78.7733,
          orderIndex: 4
        }
      ]
    }
  ];

  const expenses: Expense[] = [
    {
      id: 'exp_1',
      tripId,
      title: 'Vande Bharat Express Outbound + Inbound Tickets (4 Pax)',
      amount: 7200,
      category: 'Transport',
      paidByMemberId: 'mem_rahul',
      paidByName: 'Rahul Verma',
      splitType: 'Equal',
      date: '2026-10-10',
      notes: 'IRCTC booking confirmed under PNR 2456-789123'
    },
    {
      id: 'exp_2',
      tripId,
      title: 'Pineview Eco Retreat Advance Deposit (2 Deluxe Rooms, 3 Nights)',
      amount: 9500,
      category: 'Accommodation',
      paidByMemberId: 'mem_satyam',
      paidByName: 'Satyam Sharma',
      splitType: 'Equal',
      date: '2026-10-11',
      notes: 'Advance booking paid with breakfast included'
    },
    {
      id: 'exp_3',
      tripId,
      title: 'Highway Dhaba Meals & Spiced Chai for Group',
      amount: 1800,
      category: 'Food',
      paidByMemberId: 'mem_aman',
      paidByName: 'Aman Gupta',
      splitType: 'Equal',
      date: '2026-10-15',
      notes: 'Group brunch during transit stop'
    }
  ];

  const budget: Budget = {
    id: `b_${tripId}`,
    tripId,
    totalBudget: 40000,
    transportAllocated: 11200,
    accommodationAllocated: 12800,
    foodAllocated: 8000,
    activitiesAllocated: 4800,
    shoppingAllocated: 2000,
    emergencyAllocated: 800,
    miscAllocated: 400
  };

  const bookings: Booking[] = [
    {
      id: 'bk_1',
      tripId,
      type: 'Train',
      itemName: 'Vande Bharat Express (Moradabad ➔ Chandigarh)',
      referenceCode: 'PNR-2456-789123',
      amount: 7200,
      status: 'Confirmed',
      bookingDate: '2026-10-10',
      details: { coach: 'C4', seats: '21, 22, 23, 24', meal: 'Veg Breakfast Included' }
    },
    {
      id: 'bk_2',
      tripId,
      type: 'Hotel',
      itemName: 'Manali Pineview Eco Retreat (2 Valley View Rooms)',
      referenceCode: 'HTL-MNL-88219',
      amount: 19200,
      status: 'Confirmed',
      bookingDate: '2026-10-11',
      details: { checkIn: '15 Oct 02:30 PM', checkOut: '18 Oct 11:00 AM', rooms: 2 }
    }
  ];

  const weather: WeatherSnapshot[] = [
    {
      id: 'w_d1',
      tripId,
      date: 'Day 1 (15 Oct)',
      condition: 'Sunny',
      tempC: 18,
      precipitationChance: 5,
      windSpeed: '10 km/h NW',
      alertLevel: 'None',
      summary: 'Pleasant autumn mountain sunshine. Ideal for travel & evening stroll.'
    },
    {
      id: 'w_d2',
      tripId,
      date: 'Day 2 (16 Oct)',
      condition: 'Sunny',
      tempC: 17,
      precipitationChance: 10,
      windSpeed: '12 km/h W',
      alertLevel: 'None',
      summary: 'Clear blue skies over Solang Valley and Naggar.'
    },
    {
      id: 'w_d3',
      tripId,
      date: 'Day 3 (17 Oct)',
      condition: 'Partly Cloudy',
      tempC: 15,
      precipitationChance: 15,
      windSpeed: '15 km/h NW',
      alertLevel: 'None',
      summary: 'Gentle mountain breeze with intermittent sunlight.'
    },
    {
      id: 'w_d4',
      tripId,
      date: 'Day 4 (18 Oct)',
      condition: 'Sunny',
      tempC: 19,
      precipitationChance: 5,
      windSpeed: '8 km/h NW',
      alertLevel: 'None',
      summary: 'Clear skies for pleasant transit.'
    }
  ];

  const hiddenGems: HiddenGem[] = [
    {
      id: 'gem_jogini',
      tripId,
      destinationCity: 'Manali',
      name: 'Jogini Falls Secret Upper Trail',
      description: 'A tranquil secluded trail climbing above the tourist waterfall through centuries-old deodar trees and wild apple orchards.',
      category: 'Nature & Trek',
      location: 'Vashisht Upper Woods, 4.2 km from Mall Road',
      distance: '4.2 km',
      crowdLevel: 'Low',
      cost: 0,
      openingHours: '06:00 AM - 05:30 PM',
      safetyInfo: 'Moderate slope. Wear sturdy boots with rubber soles.',
      bestTime: 'Morning (08:00 AM - 11:00 AM)',
      lat: 32.268,
      lng: 77.195,
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      isSaved: true
    },
    {
      id: 'gem_sajla',
      tripId,
      destinationCity: 'Manali',
      name: 'Sajla Ancient Cedar Grove & Waterfalls',
      description: 'Hidden village adorned with a 12th-century stone temple, uncrowded waterfall pool, and rustic organic woodfire tea stalls.',
      category: 'Heritage & Nature',
      location: 'Sajla Village, Left Bank Road',
      distance: '10.5 km South',
      crowdLevel: 'Very Low',
      cost: 50,
      openingHours: '07:00 AM - 07:00 PM',
      safetyInfo: 'Paved village walkway, very safe for group walking.',
      bestTime: 'Afternoon (02:00 PM - 04:30 PM)',
      lat: 32.185,
      lng: 77.172,
      imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
      isSaved: false
    },
    {
      id: 'gem_naggar_craft',
      tripId,
      destinationCity: 'Manali',
      name: 'Naggar Himalayan Artisan Guild & Woodcrafts',
      description: 'Overlooked medieval guild where master woodcarvers practice traditional Kathkuni architecture and handloom spinning.',
      category: 'Culture & Art',
      location: 'Lower Naggar Historic Quarter',
      distance: '18.5 km from City Center',
      crowdLevel: 'Low',
      cost: 100,
      openingHours: '09:00 AM - 06:00 PM',
      safetyInfo: 'Easy accessibility with authentic souvenir opportunities.',
      bestTime: 'Late Afternoon (03:30 PM - 06:00 PM)',
      lat: 32.146,
      lng: 77.168,
      imageUrl: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=600&q=80',
      isSaved: false
    }
  ];

  const changeLogs: TripChangeLog[] = [
    {
      id: 'log_init',
      tripId,
      timestamp: '10:00 AM',
      fieldChanged: 'Trip Initialized',
      oldValue: 'None',
      newValue: 'Moradabad ➔ Manali (4 Pax, ₹40,000)',
      reason: 'Created complete door-to-door itinerary with outbound & return journey.',
      canUndo: false
    }
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif_welcome',
      tripId,
      title: 'Door-to-Door Journey Ready',
      message: 'Your complete 4-day travel operating plan from Moradabad to Manali has been generated.',
      type: 'success',
      isRead: false,
      timestamp: new Date().toISOString()
    }
  ];

  // Save all into DB
  db.saveTrip(trip);
  db.setMembers(tripId, members);
  db.setTransports(tripId, transports);
  db.setAccommodations(tripId, accommodations);
  db.setItinerary(tripId, itinerary);
  db.setExpenses(tripId, expenses);
  db.setBudget(tripId, budget);
  db.setBookings(tripId, bookings);
  db.setWeather(tripId, weather);
  db.setHiddenGems(tripId, hiddenGems);
  db.setNotifications(tripId, notifications);
  changeLogs.forEach(l => db.addChangeLog(tripId, l));

  return trip;
}
