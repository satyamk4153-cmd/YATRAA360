"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const travel_data_1 = require("./travel-data");
class AIService {
    /**
     * AI Planner: Generates a complete door-to-door journey (Home -> Outbound -> Days -> Inbound -> Home)
     */
    static generateDoorToDoorTrip(params) {
        const tripId = `trip_${Date.now()}`;
        const start = new Date(params.startDate || '2026-10-15');
        const end = new Date(params.endDate || '2026-10-18');
        const daysCount = Math.max(2, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const trip = {
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
        const budget = {
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
            const flightSearch = travel_data_1.TravelDataService.searchFlights(params.origin, params.destination);
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
        }
        else {
            const trainResults = travel_data_1.TravelDataService.searchTrains(params.origin, params.destination);
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
        const transports = [
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
        const accommodations = [
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
        const itinerary = [];
        for (let d = 1; d <= daysCount; d++) {
            const dayDate = new Date(start);
            dayDate.setDate(dayDate.getDate() + (d - 1));
            const dateStr = dayDate.toISOString().split('T')[0];
            let theme = `Exploring ${params.destination}`;
            let items = [];
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
            }
            else if (d === daysCount) {
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
            }
            else {
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
        const hiddenGems = [
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
        const weather = itinerary.map(day => ({
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
    static replanItinerary(data, reason) {
        const itinerary = JSON.parse(JSON.stringify(data.itinerary));
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
    static answerCopilot(tripData, question) {
        const q = question.toLowerCase();
        const metrics = tripData.metrics;
        const trip = tripData.trip;
        const members = tripData.members;
        const weather = tripData.weather;
        const itinerary = tripData.itinerary;
        const transports = tripData.transports;
        const accommodations = tripData.accommodations;
        const expenses = tripData.expenses;
        // Check specific question patterns:
        // 1. "It's raining tomorrow, we have 6 people and ₹2,000 left for tomorrow. What should we do?"
        if (q.includes('rain') || q.includes('raining') || (q.includes('weather') && q.includes('tomorrow'))) {
            const day2 = itinerary[1] || itinerary[0];
            const alternatives = day2?.items
                .filter(i => i.isWeatherSensitive && i.weatherAlternative)
                .map(i => `• **${i.weatherAlternative?.title}** (${i.weatherAlternative?.location}) — Cost: ₹${i.weatherAlternative?.cost} (Indoor safety: ${i.weatherAlternative?.indoorReason})`)
                .join('\n');
            return `🌧️ **Weather Adaptation Advisory for Day 2 (${trip.destination}):**

With **${trip.travellersCount} travellers** and your current daily budget, outdoor trails are susceptible to slippery conditions. Here is your curated indoor adaptation:

${alternatives || '• Visit the **Himalayan Art, Culture & Heritage Museum** (₹500 for group pass)\n• Enjoy cozy wood-fired pizza & herbal teas at **The Himalayan Hearth Indoor Bistro**'}

💡 **Copilot Recommendation:**
Your remaining budget is **₹${metrics.remainingBudget.toLocaleString('en-IN')}**. Replacing the outdoor trek with these indoor alternatives saves approximately **₹450/person** while keeping the group completely sheltered! Would you like me to apply this replan to Day 2?`;
        }
        // 2. "How much money do we have left?" / "Budget status"
        if (q.includes('how much') || q.includes('money left') || q.includes('remaining') || q.includes('budget')) {
            const topExpense = [...expenses].sort((a, b) => b.amount - a.amount)[0];
            return `💰 **Trip Financial Health (Live):**

• **Total Budget:** ₹${metrics.totalBudget.toLocaleString('en-IN')}
• **Total Spent So Far:** ₹${metrics.totalSpent.toLocaleString('en-IN')}
• **Remaining Balance:** ₹${metrics.remainingBudget.toLocaleString('en-IN')}
• **Per-Person Remaining:** ₹${Math.round(metrics.remainingBudget / Math.max(1, trip.travellersCount)).toLocaleString('en-IN')} / person
• **Health Status:** **${metrics.budgetHealthStatus}**

${topExpense ? `📌 Largest logged expense: *${topExpense.title}* (₹${topExpense.amount.toLocaleString('en-IN')} in ${topExpense.category})` : ''}
${metrics.spendingAlerts.length > 0 ? `⚠️ *Alert:* ${metrics.spendingAlerts[0]}` : '✨ Spending is on track.'}`;
        }
        // 3. "What is my plan tomorrow?" / "Day 2 plan"
        if (q.includes('plan tomorrow') || q.includes('tomorrow') || q.includes('what is my plan') || q.includes('schedule')) {
            const targetDay = itinerary[1] || itinerary[0];
            const itemsList = targetDay.items
                .map(i => `• **${i.startTime} - ${i.endTime}**: ${i.title} (${i.location})`)
                .join('\n');
            return `📅 **Schedule for Day ${targetDay.dayNumber} (${targetDay.theme}):**

${itemsList}

🌦️ **Forecast:** ${targetDay.weatherForecast?.condition || 'Clear'}, ${targetDay.weatherForecast?.tempC || 18}°C.
📍 **Hotel:** ${accommodations[0]?.name || 'Base Hotel'}`;
        }
        // 4. "Who owes money in the group?" / "Group split"
        if (q.includes('owe') || q.includes('split') || q.includes('balances') || q.includes('settle')) {
            const balanceDetails = metrics.groupBalances
                .map(b => {
                if (b.netBalance > 0) {
                    return `• **${b.name}**: Paid ₹${b.paid.toLocaleString('en-IN')} ➔ *Gets back ₹${b.netBalance.toLocaleString('en-IN')}*`;
                }
                else if (b.netBalance < 0) {
                    return `• **${b.name}**: Paid ₹${b.paid.toLocaleString('en-IN')} ➔ *Owes ₹${Math.abs(b.netBalance).toLocaleString('en-IN')}*`;
                }
                else {
                    return `• **${b.name}**: Paid ₹${b.paid.toLocaleString('en-IN')} ➔ *All settled (₹0)*`;
                }
            })
                .join('\n');
            return `👥 **Live Group Expense Split (${members.length} Members):**

Total Group Spending: **₹${metrics.totalSpent.toLocaleString('en-IN')}**
Equal Share per Person: **₹${Math.round(metrics.totalSpent / Math.max(1, members.length)).toLocaleString('en-IN')}**

${balanceDetails}

💡 Tap **Group Manager** ➔ **Settle Up** to record UPI settlements.`;
        }
        // 5. "We have two extra people now" / "6 people" / "traveller count"
        if (q.includes('extra people') || q.includes('more people') || q.includes('joined') || q.includes('travellers')) {
            return `👥 **Traveller Count Impact Analysis:**

Current travellers: **${trip.travellersCount} people**.
If you increase group size:
• Hotel room requirement scales to **${Math.ceil((trip.travellersCount + 2) / 2)} rooms** (1 room / 2 people).
• Per-person budget adjusts to **₹${Math.round(trip.budget / (trip.travellersCount + 2)).toLocaleString('en-IN')}**.
• Group transport bookings will automatically reserve additional seats.

You can modify this instantly on the Dashboard or Group page, and all ${itinerary.length} days of the itinerary will recalculate!`;
        }
        // 6. "Train departure changed to 10 AM" / "delay"
        if (q.includes('train') || q.includes('flight') || q.includes('departure') || q.includes('delayed') || q.includes('timing')) {
            const outTransport = transports[0];
            return `🚆 **Transport Timing & Downstream Cascade:**

• **Current Outbound:** ${outTransport?.provider} departing at **${outTransport?.departureTime}** from ${outTransport?.departureStation}.
• **Arrival in ${trip.destination}:** Estimated at **${outTransport?.arrivalTime}**.
• **Hotel Check-in:** Scheduled at **${accommodations[0]?.checkIn}**.

Changing departure time shifts the downstream Day 1 arrival buffer, hotel luggage drop-off, and afternoon activities without touching locked items.`;
        }
        // 7. General fallback using deep contextual knowledge
        return `👋 **Yatra Copilot at your service!**

I am monitoring your journey: **${trip.origin} ➔ ${trip.destination}** (${trip.startDate} to ${trip.endDate}) for **${trip.travellersCount} travellers**.

📊 **Current Status:**
• Budget: ₹${metrics.totalBudget.toLocaleString('en-IN')} (Spent: ₹${metrics.totalSpent.toLocaleString('en-IN')}, Remaining: ₹${metrics.remainingBudget.toLocaleString('en-IN')})
• Active Stay: ${accommodations[0]?.name || 'Pineview Retreat'} (${accommodations[0]?.roomCount} rooms)
• Weather Condition: ${weather[0]?.condition || 'Sunny'} (${weather[0]?.tempC || 18}°C)
• Next Activity: ${itinerary[0]?.items[0]?.title || 'Depart from Home Doorstep'}

Ask me anything about changing members, weather risks, budget splits, or discovering hidden gems!`;
    }
}
exports.AIService = AIService;
