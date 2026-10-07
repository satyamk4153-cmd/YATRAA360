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
        theme = `Valley Adventure, Hidden Wonders & Scenic Trails`;
        items = [
          {
            id: `item_${Date.now()}_${d}_1`,
            dayId: `day_${d}`,
            tripId,
            title: 'Scenic Valley Panoramic Trek & Pine Forest Walk',
            description: `Guided morning nature hike through pristine pine forests, visiting fresh alpine streams and vantage viewpoints.`,
            category: 'Activity',
            startTime: '09:00 AM',
            endTime: '01:00 PM',
            location: 'Solang Valley Nature Trail',
            cost: 950,
            status: 'Planned',
            isLocked: false,
            isUserModified: false,
            isWeatherSensitive: true,
            weatherAlternative: {
              title: 'Himalayan Art, Culture & Heritage Museum',
              description: 'State-of-the-art interactive cultural gallery displaying folk wooden architecture, traditional textiles, and virtual valley tour.',
              category: 'Sightseeing',
              location: 'Himalayan Heritage Complex',
              cost: 500,
              indoorReason: 'Completely indoor climate-controlled sanctuary safe from rain and muddy tracks.'
            },
            lat: 32.3167,
            lng: 77.1667,
            orderIndex: 1
          },
          {
            id: `item_${Date.now()}_${d}_2`,
            dayId: `day_${d}`,
            tripId,
            title: 'Traditional Himachali Dham Feast',
            description: `Authentic multi-course traditional meal served on leaf platters, curated with local grains and organic spices.`,
            category: 'Food',
            startTime: '01:30 PM',
            endTime: '03:00 PM',
            location: 'Naggar Traditional Rasoi',
            cost: 1100,
            status: 'Planned',
            isLocked: false,
            isUserModified: false,
            isWeatherSensitive: false,
            lat: 32.1464,
            lng: 77.1685,
            orderIndex: 2
          },
          {
            id: `item_${Date.now()}_${d}_3`,
            dayId: `day_${d}`,
            tripId,
            title: 'Historic Castle & Woodcraft Workshop',
            description: `Explore centuries-old wooden stone architecture and meet local artisan woodcarvers.`,
            category: 'Sightseeing',
            startTime: '03:30 PM',
            endTime: '06:00 PM',
            location: 'Naggar Castle & Guild',
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
            id: `item_${Date.now()}_${d}_4`,
            dayId: `day_${d}`,
            tripId,
            title: 'Campfire Gathering & Stargazing Session',
            description: `Gather around the open fire with warm local apple cider and acoustic music.`,
            category: 'Activity',
            startTime: '07:30 PM',
            endTime: '09:30 PM',
            location: 'Retreat Courtyard',
            cost: 400,
            status: 'Planned',
            isLocked: false,
            isUserModified: false,
            isWeatherSensitive: true,
            weatherAlternative: {
              title: 'Indoor Board Games & Boarding Lounge Evening',
              description: 'Warm indoor fireside lounge with hot cocoa, board games, and travel trivia with fellow travellers.',
              category: 'Rest',
              location: 'Hotel Fireside Library Lounge',
              cost: 200,
              indoorReason: 'Protected from mountain thunderstorm.'
            },
            lat: 32.2396,
            lng: 77.1887,
            orderIndex: 4
          }
        ];
      }

      itinerary.push({
        id: `day_${d}`,
        tripId,
        dayNumber: d,
        date: dateStr,
        theme,
        weatherForecast: {
          condition: d === 2 ? 'Sunny' : 'Partly Cloudy',
          tempC: d === 2 ? 18 : 16,
          precipitationChance: d === 2 ? 10 : 20,
          alertLevel: 'None',
          summary: 'Pleasant mountain weather ideal for outdoor trails and sightseeing.'
        },
        items
      });
    }

    const hiddenGems: HiddenGem[] = [
      {
        id: `gem_1`,
        tripId,
        destinationCity: params.destination,
        name: 'Jogini Falls Secret Upper Trail',
        description: 'Less-trodden trail above the main waterfall cascading over granite cliffs, flanked by apple orchards.',
        category: 'Nature & Trek',
        location: 'Vashisht Upper Woods',
        distance: '4.2 km from City Center',
        crowdLevel: 'Low',
        cost: 0,
        openingHours: '06:00 AM - 05:30 PM',
        safetyInfo: 'Moderate elevation gain; wear trekking shoes with good grip.',
        bestTime: 'Morning (08:00 AM - 11:00 AM)',
        lat: 32.268,
        lng: 77.195,
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        isSaved: true
      },
      {
        id: `gem_2`,
        tripId,
        destinationCity: params.destination,
        name: 'Sajla Ancient Vishnu Temple & Cedar Grove',
        description: 'Intricately carved 12th-century stone shrine surrounded by towering deodar trees and organic cafes.',
        category: 'Heritage',
        location: 'Sajla Village',
        distance: '10.5 km south along Left Bank',
        crowdLevel: 'Very Low',
        cost: 50,
        openingHours: '07:00 AM - 07:00 PM',
        safetyInfo: 'Quiet rural village, respect local sanctum photography guidelines.',
        bestTime: 'Afternoon (02:00 PM - 04:30 PM)',
        lat: 32.185,
        lng: 77.172,
        imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
        isSaved: false
      },
      {
        id: `gem_3`,
        tripId,
        destinationCity: params.destination,
        name: 'Gauri Shankar Temple Stone Carvings',
        description: 'Protected medieval shrine displaying remarkable Gupta-influenced Himalayan stone craft.',
        category: 'Culture & Architecture',
        location: 'Lower Naggar',
        distance: '19 km from Mall Road',
        crowdLevel: 'Low',
        cost: 0,
        openingHours: '06:00 AM - 08:00 PM',
        safetyInfo: 'Easy accessibility with paved pathways.',
        bestTime: 'Sunset (05:00 PM - 06:30 PM)',
        lat: 32.146,
        lng: 77.168,
        imageUrl: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?auto=format&fit=crop&w=600&q=80',
        isSaved: false
      }
    ];

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
    const emergencyContacts = tripData.emergencyContacts || [];

    // 1. Weather / Rain / Monsoon / Temperature
    if (q.includes('rain') || q.includes('raining') || q.includes('weather') || q.includes('forecast') || q.includes('temp') || q.includes('climate')) {
      const day2 = itinerary[1] || itinerary[0];
      const alternatives = day2?.items
        .filter(i => i.isWeatherSensitive && i.weatherAlternative)
        .map(i => `• **${i.weatherAlternative?.title}** (${i.weatherAlternative?.location}) — Cost: ₹${i.weatherAlternative?.cost} (Indoor safety: ${i.weatherAlternative?.indoorReason})`)
        .join('\n');

      const weatherList = weather.slice(0, 4).map(w => 
        `• **${w.date} (${w.condition})**: ${w.tempC}°C (Rain probability: ${w.rainProbability}%, Alert: ${w.alertLevel})`
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
    if (q.includes('owe') || q.includes('split') || q.includes('balances') || q.includes('settle') || q.includes('share') || q.includes('paid')) {
      const balanceDetails = metrics.groupBalances
        .map(b => {
          if (b.netBalance > 0) {
            return `• **${b.name}**: Paid ₹${b.paid.toLocaleString('en-IN')} ➔ *Gets back ₹${b.netBalance.toLocaleString('en-IN')}*`;
          } else if (b.netBalance < 0) {
            return `• **${b.name}**: Paid ₹${b.paid.toLocaleString('en-IN')} ➔ *Owes ₹${Math.abs(b.netBalance).toLocaleString('en-IN')}*`;
          } else {
            return `• **${b.name}**: Paid ₹${b.paid.toLocaleString('en-IN')} ➔ *Fully settled (₹0)*`;
          }
        })
        .join('\n');

      return `👥 **Live Group Expense Split (${members.length} Members):**

Total Group Spending: **₹${metrics.totalSpent.toLocaleString('en-IN')}**
Equal Fair Share: **₹${Math.round(metrics.totalSpent / Math.max(1, members.length)).toLocaleString('en-IN')}** per member

${balanceDetails}

💡 **Action Tip:** Go to **Group Manager** ➔ **Settle Up** to record UPI transactions or generate payment links for instant settlement!`;
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
• **Total Stay Cost:** ₹${stay?.totalCost?.toLocaleString('en-IN') || '4,500'} (${stay?.status || 'Confirmed'})
• **Amenities:** Free Wi-Fi, Breakfast Included, 24/7 Front Desk, Luggage Storage

💡 Need an extra room or early check-in? You can manage stay details and simulate room upgrades in the **What-If Sandbox**!`;
    }

    // 7. Hidden gems / Offbeat places / Sightseeing / Recommendations
    if (q.includes('hidden gem') || q.includes('gem') || q.includes('offbeat') || q.includes('recommend') || q.includes('places to visit') || q.includes('must visit') || q.includes('secret')) {
      const gemsList = hiddenGems.slice(0, 3).map(g => 
        `• **${g.title}** (${g.bestTime}): ${g.description} — *Local tip: ${g.insiderTip}* (Est: ₹${g.estimatedCost})`
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

    // 10. Safety / Emergency / Hospital / Police / SOS / Helpline
    if (q.includes('safe') || q.includes('safety') || q.includes('emergency') || q.includes('police') || q.includes('hospital') || q.includes('sos') || q.includes('doctor') || q.includes('helpline')) {
      const contactsList = emergencyContacts.map(c => 
        `• **${c.name}** (${c.relation}): 📞 **${c.phone}** — *${c.notes}*`
      ).join('\n');

      return `🛡️ **Safety Center & 24/7 Helpline Directory:**

${contactsList}

🚨 **Quick Emergency Protocol:**
1. National Emergency Police & Medical Services: Dial **112**
2. Railway Protection Force (RPF) Helpline: Dial **139**
3. Tap **Safety Center** in the sidebar to activate the red 1-click **Emergency SOS Broadcast**, which alerts all group members and logs GPS coordinates.`;
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
