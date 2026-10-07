import { db } from '../db';
import {
  Trip,
  TripMetrics,
  Settlement,
  ExpenseCategory,
  FullTripData,
  WeatherCondition,
  ItineraryDay,
  ItineraryItem,
  NotificationItem,
  WhatIfScenarioInput,
  WhatIfSimulationResult
} from '../types';

export class DependencyEngine {
  /**
   * Recalculates complete trip financial metrics, group balances, and spending alerts.
   */
  public static calculateMetrics(tripId: string): TripMetrics {
    const trip = db.getTrip(tripId);
    const budget = db.getBudget(tripId);
    const expenses = db.getExpenses(tripId);
    const members = db.getMembers(tripId);
    const transports = db.getTransports(tripId);
    const accommodations = db.getAccommodations(tripId);
    const itinerary = db.getItinerary(tripId);

    const totalBudget = budget ? budget.totalBudget : (trip?.budget || 0);
    const totalSpent = expenses.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);
    const remainingBudget = totalBudget - totalSpent;

    const travellersCount = Math.max(1, trip?.travellersCount || members.length || 1);

    // Calculate projected cost:
    // Fixed transport + Fixed accommodation + Itinerary item planned costs + Logged expenses
    const transportCommitted = transports.reduce((acc, t) => acc + (Number(t.price) || 0), 0);
    const accommodationCommitted = accommodations.reduce((acc, a) => acc + (Number(a.totalPrice) || 0), 0);
    
    let plannedActivitiesCost = 0;
    itinerary.forEach(day => {
      day.items?.forEach(item => {
        plannedActivitiesCost += (Number(item.cost) || 0);
      });
    });

    const projectedTotalCost = Math.max(
      totalSpent,
      transportCommitted + accommodationCommitted + plannedActivitiesCost + totalSpent
    );

    const perPersonBudget = Math.round(totalBudget / travellersCount);
    const perPersonSpent = Math.round(totalSpent / travellersCount);
    const perPersonProjected = Math.round(projectedTotalCost / travellersCount);

    let budgetHealthStatus: 'Healthy' | 'Moderate' | 'Warning' | 'Exceeded' = 'Healthy';
    const spentRatio = totalBudget > 0 ? totalSpent / totalBudget : 0;
    if (spentRatio > 1.0) {
      budgetHealthStatus = 'Exceeded';
    } else if (spentRatio > 0.85) {
      budgetHealthStatus = 'Warning';
    } else if (spentRatio > 0.65) {
      budgetHealthStatus = 'Moderate';
    }

    // Category Breakdown
    const categories: ExpenseCategory[] = [
      'Transport',
      'Accommodation',
      'Food',
      'Activities',
      'Shopping',
      'Emergency',
      'Miscellaneous'
    ];

    const categoryAllocations: Record<ExpenseCategory, number> = {
      Transport: budget?.transportAllocated ?? Math.round(totalBudget * 0.25),
      Accommodation: budget?.accommodationAllocated ?? Math.round(totalBudget * 0.30),
      Food: budget?.foodAllocated ?? Math.round(totalBudget * 0.20),
      Activities: budget?.activitiesAllocated ?? Math.round(totalBudget * 0.15),
      Shopping: budget?.shoppingAllocated ?? Math.round(totalBudget * 0.05),
      Emergency: budget?.emergencyAllocated ?? Math.round(totalBudget * 0.03),
      Miscellaneous: budget?.miscAllocated ?? Math.round(totalBudget * 0.02)
    };

    const categorySpentMap: Record<ExpenseCategory, number> = {
      Transport: 0,
      Accommodation: 0,
      Food: 0,
      Activities: 0,
      Shopping: 0,
      Emergency: 0,
      Miscellaneous: 0
    };

    expenses.forEach(exp => {
      const cat = exp.category || 'Miscellaneous';
      if (categorySpentMap[cat] !== undefined) {
        categorySpentMap[cat] += Number(exp.amount) || 0;
      } else {
        categorySpentMap['Miscellaneous'] += Number(exp.amount) || 0;
      }
    });

    const categoryBreakdown = categories.map(cat => {
      const allocated = categoryAllocations[cat] || 0;
      const spent = categorySpentMap[cat] || 0;
      const remaining = allocated - spent;
      const percentageSpent = allocated > 0 ? Math.round((spent / allocated) * 100) : (spent > 0 ? 100 : 0);
      return {
        category: cat,
        allocated,
        spent,
        remaining,
        percentageSpent
      };
    });

    // Spending Alerts
    const spendingAlerts: string[] = [];
    const aiFinancialAdvice: string[] = [];

    if (totalSpent > totalBudget && totalBudget > 0) {
      spendingAlerts.push(`Budget exceeded by ₹${(totalSpent - totalBudget).toLocaleString('en-IN')}! Review non-essential expenses.`);
      aiFinancialAdvice.push('Critical: Current spending has overshot total budget. Switch to self-catering or free cultural walking tours for upcoming days.');
    } else if (remainingBudget < totalBudget * 0.20 && remainingBudget > 0) {
      spendingAlerts.push(`Low remaining budget alert: ₹${remainingBudget.toLocaleString('en-IN')} remaining (${Math.round((remainingBudget / totalBudget) * 100)}%).`);
    }

    const shoppingSpent = categorySpentMap['Shopping'] || 0;
    const shoppingAllocated = categoryAllocations['Shopping'] || totalBudget * 0.05;
    if (shoppingSpent > shoppingAllocated && totalBudget > 0) {
      spendingAlerts.push(`High discretionary spend: Shopping (₹${shoppingSpent.toLocaleString('en-IN')}) has exceeded the allocated ₹${shoppingAllocated.toLocaleString('en-IN')} budget.`);
      aiFinancialAdvice.push('Your discretionary shopping increased. Consider opting for group passes or lower-cost indoor cafes for tomorrow to maintain balance.');
    }

    const foodSpent = categorySpentMap['Food'] || 0;
    if (foodSpent > (categoryAllocations['Food'] || 1) * 1.1) {
      spendingAlerts.push('Food spending has surpassed the initial allocation.');
    }

    // Group Balances & Debt Simplification Settlement Algorithm
    const memberCount = Math.max(1, members.length);
    const memberPaidMap: Record<string, number> = {};
    const memberFairShareMap: Record<string, number> = {};

    members.forEach(m => {
      memberPaidMap[m.id] = 0;
      memberFairShareMap[m.id] = 0;
    });

    expenses.forEach(exp => {
      const payerId = exp.paidByMemberId;
      const amount = Number(exp.amount) || 0;
      if (payerId && memberPaidMap[payerId] !== undefined) {
        memberPaidMap[payerId] += amount;
      }

      // Calculate fair share per member based on splitType
      if ((exp.splitType === 'Exact' || exp.splitType === 'Custom') && exp.splits && exp.splits.length > 0) {
        exp.splits.forEach(s => {
          if (memberFairShareMap[s.memberId] !== undefined) {
            memberFairShareMap[s.memberId] += Number(s.shareAmount) || 0;
          }
        });
      } else {
        // Equal split across all members
        const share = amount / memberCount;
        members.forEach(m => {
          memberFairShareMap[m.id] += share;
        });
      }
    });

    const groupBalances = members.map(m => {
      const paid = Math.round(memberPaidMap[m.id] || 0);
      const shouldPay = Math.round(memberFairShareMap[m.id] || 0);
      const netBalance = Math.round(paid - shouldPay);
      return {
        memberId: m.id,
        name: m.name,
        paid,
        shouldPay,
        netBalance
      };
    });

    // Update members in DB with accurate paidAmount and balance
    let membersUpdated = false;
    members.forEach(m => {
      const b = groupBalances.find(gb => gb.memberId === m.id);
      if (b && (m.paidAmount !== b.paid || m.balance !== b.netBalance)) {
        m.paidAmount = b.paid;
        m.balance = b.netBalance;
        membersUpdated = true;
      }
    });
    if (membersUpdated) {
      db.setMembers(tripId, members);
    }

    // Debt Simplification Algorithm
    // Separate into debtors (netBalance < 0) and creditors (netBalance > 0)
    interface BalanceEntry {
      id: string;
      name: string;
      balance: number;
    }

    const debtors: BalanceEntry[] = groupBalances
      .filter(b => b.netBalance < 0)
      .map(b => ({ id: b.memberId, name: b.name, balance: b.netBalance }))
      .sort((a, b) => a.balance - b.balance); // most negative first

    const creditors: BalanceEntry[] = groupBalances
      .filter(b => b.netBalance > 0)
      .map(b => ({ id: b.memberId, name: b.name, balance: b.netBalance }))
      .sort((a, b) => b.balance - a.balance); // most positive first

    const settlements: Settlement[] = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      const debitRem = Math.abs(debtor.balance);
      const creditRem = creditor.balance;
      const amount = Math.min(debitRem, creditRem);

      if (amount > 0) {
        settlements.push({
          id: `stl_${tripId}_${debtor.id}_${creditor.id}_${settlements.length + 1}`,
          tripId,
          fromMemberId: debtor.id,
          fromMemberName: debtor.name,
          toMemberId: creditor.id,
          toMemberName: creditor.name,
          amount: Math.round(amount),
          status: 'Pending'
        });
      }

      debtor.balance += amount;
      creditor.balance -= amount;

      if (Math.abs(debtor.balance) < 0.5) dIdx++;
      if (creditor.balance < 0.5) cIdx++;
    }

    const settledAmount = settlements.filter(s => s.status === 'Settled').reduce((sum, s) => sum + s.amount, 0);
    const outstandingAmount = settlements.filter(s => s.status === 'Pending').reduce((sum, s) => sum + s.amount, 0);

    return {
      totalBudget,
      totalSpent,
      remainingBudget,
      projectedTotalCost,
      perPersonBudget,
      perPersonSpent,
      perPersonProjected,
      budgetHealthStatus,
      categoryBreakdown,
      spendingAlerts,
      aiFinancialAdvice,
      groupBalances,
      settlements,
      settledAmount,
      outstandingAmount
    };
  }

  /**
   * Recalculates everything when the traveller count changes:
   * - Adjusts room requirements (1 room per 2 travellers)
   * - Updates accommodation pricing
   * - Updates group member count
   * - Recalculates per-person costs & splits
   */
  public static handleTravellersChange(tripId: string, newCount: number): FullTripData {
    const trip = db.getTrip(tripId);
    if (!trip) throw new Error('Trip not found');

    const oldCount = trip.travellersCount;
    trip.travellersCount = newCount;
    trip.updatedAt = new Date().toISOString();
    db.saveTrip(trip);

    // Update accommodations room count and total price
    const accommodations = db.getAccommodations(tripId);
    const requiredRooms = Math.ceil(newCount / 2);
    accommodations.forEach(acc => {
      acc.roomCount = requiredRooms;
      acc.totalPrice = acc.pricePerNight * requiredRooms * 3; // base on stay duration
    });
    db.setAccommodations(tripId, accommodations);

    // Update transports seats/pricing
    const transports = db.getTransports(tripId);
    transports.forEach(t => {
      t.seats = `${newCount} Seats (${t.type === 'Flight' ? 'Economy' : 'AC Chair / 3A'})`;
    });
    db.setTransports(tripId, transports);

    // Synchronize members array
    let members = db.getMembers(tripId);
    if (newCount > members.length) {
      const needed = newCount - members.length;
      const indianNames = ['Rohan', 'Ananya', 'Vikram', 'Pooja', 'Karan', 'Sneha', 'Arjun', 'Simran'];
      for (let i = 0; i < needed; i++) {
        const name = indianNames[(members.length + i) % indianNames.length];
        members.push({
          id: `m_${Date.now()}_${i}`,
          tripId,
          name: `${name} (Co-Traveller)`,
          email: `${name.toLowerCase()}@yatra360.app`,
          phone: `+91 98765 ${10000 + members.length + i}`,
          role: 'Member',
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`,
          paidAmount: 0,
          balance: 0
        });
      }
    } else if (newCount < members.length && newCount >= 1) {
      // Remove excess non-organizer members
      members = members.slice(0, newCount);
    }
    db.setMembers(tripId, members);

    // Record change log
    db.addChangeLog(tripId, {
      id: `log_${Date.now()}`,
      tripId,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      fieldChanged: 'Travellers Count',
      oldValue: `${oldCount} travellers`,
      newValue: `${newCount} travellers`,
      reason: `Group expanded to ${newCount}. Updated accommodation to ${requiredRooms} rooms, auto-adjusted per-person costs.`,
      canUndo: true
    });

    db.addNotification(tripId, {
      id: `notif_${Date.now()}`,
      tripId,
      title: 'Group Size Updated',
      message: `Trip traveller count changed from ${oldCount} to ${newCount}. Per-person expenses, transport seats, and hotel room requirements recalculated.`,
      type: 'info',
      isRead: false,
      timestamp: new Date().toISOString()
    });

    return DependencyEngine.getFullTripData(tripId);
  }

  /**
   * Recalculates budget allocations and health when the total budget changes.
   */
  public static handleBudgetChange(tripId: string, newBudget: number): FullTripData {
    const trip = db.getTrip(tripId);
    if (!trip) throw new Error('Trip not found');

    const oldBudget = trip.budget;
    trip.budget = newBudget;
    trip.updatedAt = new Date().toISOString();
    db.saveTrip(trip);

    // Reallocate budget
    const budget = db.getBudget(tripId) || {
      id: `b_${tripId}`,
      tripId,
      totalBudget: newBudget,
      transportAllocated: Math.round(newBudget * 0.25),
      accommodationAllocated: Math.round(newBudget * 0.30),
      foodAllocated: Math.round(newBudget * 0.20),
      activitiesAllocated: Math.round(newBudget * 0.15),
      shoppingAllocated: Math.round(newBudget * 0.05),
      emergencyAllocated: Math.round(newBudget * 0.03),
      miscAllocated: Math.round(newBudget * 0.02)
    };

    budget.totalBudget = newBudget;
    budget.transportAllocated = Math.round(newBudget * 0.25);
    budget.accommodationAllocated = Math.round(newBudget * 0.30);
    budget.foodAllocated = Math.round(newBudget * 0.20);
    budget.activitiesAllocated = Math.round(newBudget * 0.15);
    budget.shoppingAllocated = Math.round(newBudget * 0.05);
    budget.emergencyAllocated = Math.round(newBudget * 0.03);
    budget.miscAllocated = Math.round(newBudget * 0.02);
    db.setBudget(tripId, budget);

    db.addChangeLog(tripId, {
      id: `log_${Date.now()}`,
      tripId,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      fieldChanged: 'Trip Budget',
      oldValue: `₹${oldBudget.toLocaleString('en-IN')}`,
      newValue: `₹${newBudget.toLocaleString('en-IN')}`,
      reason: `Budget updated to ₹${newBudget.toLocaleString('en-IN')}. Proportional category allocations recalculated.`,
      canUndo: true
    });

    return DependencyEngine.getFullTripData(tripId);
  }

  /**
   * Transport timing shift propagation:
   * When departure time changes (e.g. 7:00 AM -> 10:00 AM):
   * - Shifts arrival time
   * - Shifts hotel check-in
   * - Cascades into Day 1 afternoon activities
   */
  public static handleTransportTimingChange(
    tripId: string,
    transportId: string,
    newDepartureTime: string,
    newArrivalTime?: string
  ): FullTripData {
    const transports = db.getTransports(tripId);
    const transport = transports.find(t => t.id === transportId) || transports[0];
    if (!transport) throw new Error('Transport not found');

    const oldDep = transport.departureTime;
    transport.departureTime = newDepartureTime;
    if (newArrivalTime) {
      transport.arrivalTime = newArrivalTime;
    }

    db.setTransports(tripId, transports);

    // Update itinerary Day 1 items
    const itinerary = db.getItinerary(tripId);
    if (itinerary.length > 0 && !transport.isReturn) {
      const day1 = itinerary[0];
      // Adjust items on Day 1 that happen after arrival
      day1.items.forEach(item => {
        if (item.category === 'Transit' && item.title.includes('Depart')) {
          item.startTime = newDepartureTime;
        } else if (item.category === 'Check-in' || item.title.includes('Hotel Check-in')) {
          item.startTime = newArrivalTime || '03:30 PM';
        } else if (item.orderIndex >= 3 && !item.isLocked) {
          // Shift timing slightly later
          item.startTime = '05:00 PM';
          item.endTime = '07:30 PM';
          item.description = `${item.description} (Rescheduled due to revised transport timing)`;
        }
      });
      db.setItinerary(tripId, itinerary);
    }

    // Update hotel check-in time
    const accommodations = db.getAccommodations(tripId);
    if (accommodations.length > 0 && newArrivalTime) {
      accommodations[0].checkIn = `Check-in scheduled after arrival (~${newArrivalTime})`;
      db.setAccommodations(tripId, accommodations);
    }

    db.addChangeLog(tripId, {
      id: `log_${Date.now()}`,
      tripId,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      fieldChanged: 'Transport Departure Time',
      oldValue: oldDep,
      newValue: newDepartureTime,
      reason: `Train/Flight departure adjusted. Shifted arrival to ${transport.arrivalTime}, updated hotel check-in & Day 1 afternoon schedule.`,
      canUndo: true
    });

    db.addNotification(tripId, {
      id: `notif_${Date.now()}`,
      tripId,
      title: 'Transport Schedule Updated',
      message: `Departure time shifted to ${newDepartureTime}. Downstream itinerary items and hotel check-in timing have been automatically adjusted.`,
      type: 'warning',
      isRead: false,
      timestamp: new Date().toISOString()
    });

    return DependencyEngine.getFullTripData(tripId);
  }

  /**
   * Weather Reactive Adaptation:
   * When weather condition changes (e.g. Heavy Rain on Day 2):
   * - Flags outdoor activities
   * - Suggests or activates indoor alternatives
   * - Logs the event & notifies user
   */
  public static handleWeatherChange(
    tripId: string,
    dayNumber: number,
    newCondition: WeatherCondition,
    autoApplyAlternatives: boolean = false
  ): FullTripData {
    const weatherList = db.getWeather(tripId);
    const snap = weatherList.find(w => w.date.includes(`Day ${dayNumber}`) || w.id.includes(`d${dayNumber}`));
    if (snap) {
      snap.condition = newCondition;
      snap.tempC = newCondition === 'Heavy Rain' ? 14 : (newCondition === 'Snow' ? -2 : 22);
      snap.precipitationChance = newCondition === 'Heavy Rain' ? 95 : (newCondition === 'Light Rain' ? 60 : 10);
      snap.alertLevel = newCondition === 'Heavy Rain' || newCondition === 'Thunderstorm' ? 'Warning' : 'None';
      snap.summary = newCondition === 'Heavy Rain'
        ? 'Heavy rainfall warning. Mountain trails, outdoor treks, and open view-points face slippery terrain and low visibility.'
        : `${newCondition} conditions expected.`;
      db.setWeather(tripId, weatherList);
    }

    const itinerary = db.getItinerary(tripId);
    const targetDay = itinerary.find(d => d.dayNumber === dayNumber) || itinerary[1] || itinerary[0];

    if (targetDay) {
      if (targetDay.weatherForecast) {
        targetDay.weatherForecast.condition = newCondition;
        targetDay.weatherForecast.alertLevel = newCondition === 'Heavy Rain' ? 'Warning' : 'None';
      }

      if (newCondition === 'Heavy Rain' || newCondition === 'Thunderstorm') {
        targetDay.items.forEach(item => {
          if (item.isWeatherSensitive) {
            if (autoApplyAlternatives && item.weatherAlternative && !item.isLocked) {
              // Swap with indoor alternative
              const alt = item.weatherAlternative;
              item.title = alt.title;
              item.description = `${alt.description} [Indoor Alternative applied for Heavy Rain]`;
              item.category = alt.category;
              item.location = alt.location;
              item.cost = alt.cost;
              item.isUserModified = true;
            }
          }
        });
        db.setItinerary(tripId, itinerary);
      }
    }

    db.addChangeLog(tripId, {
      id: `log_${Date.now()}`,
      tripId,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      fieldChanged: `Day ${dayNumber} Weather`,
      oldValue: 'Clear / Sunny',
      newValue: newCondition,
      reason: `Weather updated to ${newCondition}. Outdoor activity risks evaluated and indoor alternatives prepared.`,
      canUndo: true
    });

    db.addNotification(tripId, {
      id: `notif_${Date.now()}`,
      tripId,
      title: `Weather Alert: ${newCondition} on Day ${dayNumber}`,
      message: `Day ${dayNumber} contains outdoor activities that may be disrupted. Check indoor alternatives in the Weather Center or Itinerary.`,
      type: 'alert',
      isRead: false,
      timestamp: new Date().toISOString()
    });

    return DependencyEngine.getFullTripData(tripId);
  }

  /**
   * Helper to parse time strings like '04:30 PM' or '16:30' into minutes since midnight.
   */
  public static parseTimeToMinutes(timeStr: string): number | null {
    if (!timeStr) return null;
    const clean = timeStr.trim();
    const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const minutes = parseInt(ampmMatch[2], 10);
      const period = ampmMatch[3].toUpperCase();
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
    const milMatch = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (milMatch) {
      return parseInt(milMatch[1], 10) * 60 + parseInt(milMatch[2], 10);
    }
    return null;
  }

  /**
   * Helper to format minutes since midnight into 'hh:mm A' format.
   */
  public static formatMinutesToTime(minutes: number): string {
    const wrapped = ((minutes % 1440) + 1440) % 1440;
    const hours24 = Math.floor(wrapped / 60);
    const mins = wrapped % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours12)}:${pad(mins)} ${period}`;
  }

  /**
   * Adds or replaces an itinerary activity with a Hidden Gem.
   * If replacing, updates the selected item.
   * If appending, checks existing items for time conflicts and schedules in an available slot.
   */
  public static handleAddHiddenGem(
    tripId: string,
    gemId: string,
    targetDayNumber: number = 2,
    replaceItemId?: string
  ): FullTripData {
    const gems = db.getHiddenGems(tripId);
    const gem = gems.find(g => g.id === gemId) || gems[0];
    if (!gem) throw new Error('Hidden gem not found');

    const itinerary = db.getItinerary(tripId);
    const day = itinerary.find(d => d.dayNumber === targetDayNumber) || itinerary[0];
    if (!day) throw new Error('Itinerary day not found');

    if (replaceItemId) {
      const idx = day.items.findIndex(i => i.id === replaceItemId);
      if (idx !== -1) {
        day.items[idx] = {
          id: `item_gem_${Date.now()}`,
          dayId: day.id,
          tripId,
          title: `Hidden Gem: ${gem.name}`,
          description: `${gem.description} (Crowd Level: ${gem.crowdLevel}, Best Time: ${gem.bestTime})`,
          category: 'Hidden Gem',
          startTime: day.items[idx].startTime,
          endTime: day.items[idx].endTime,
          location: gem.location,
          cost: gem.cost,
          status: 'Planned',
          isLocked: false,
          isUserModified: true,
          isWeatherSensitive: false,
          lat: gem.lat,
          lng: gem.lng,
          orderIndex: day.items[idx].orderIndex
        };
      }
    } else {
      // Find a conflict-free time slot for a 2-hour visit (duration = 120 mins)
      const durationMins = 120;
      let chosenStart = 16 * 60 + 30; // Default candidate: 04:30 PM (990 mins)
      let chosenEnd = chosenStart + durationMins; // 06:30 PM (1110 mins)

      // Collect busy intervals from existing items
      const busySlots: { start: number; end: number }[] = [];
      day.items.forEach(item => {
        const s = DependencyEngine.parseTimeToMinutes(item.startTime);
        const e = DependencyEngine.parseTimeToMinutes(item.endTime);
        if (s !== null && e !== null && e > s) {
          busySlots.push({ start: s, end: e });
        }
      });

      const hasConflict = (start: number, end: number) => {
        return busySlots.some(slot => Math.max(start, slot.start) < Math.min(end, slot.end));
      };

      if (hasConflict(chosenStart, chosenEnd)) {
        // Try candidate slots across the day from 09:00 AM to 08:00 PM
        const candidateStarts = [
          10 * 60,       // 10:00 AM
          11 * 60 + 30,  // 11:30 AM
          14 * 60,       // 02:00 PM
          15 * 60 + 30,  // 03:30 PM
          17 * 60,       // 05:00 PM
          18 * 60,       // 06:00 PM
          19 * 60        // 07:00 PM
        ];

        let foundSlot = false;
        for (const candidate of candidateStarts) {
          if (!hasConflict(candidate, candidate + durationMins)) {
            chosenStart = candidate;
            chosenEnd = candidate + durationMins;
            foundSlot = true;
            break;
          }
        }

        // If all standard candidates conflict, find the maximum end time and append after with buffer
        if (!foundSlot && busySlots.length > 0) {
          const maxEnd = Math.max(...busySlots.map(b => b.end));
          chosenStart = Math.min(maxEnd + 15, 22 * 60 - durationMins);
          chosenEnd = chosenStart + durationMins;
        }
      }

      const formattedStartTime = DependencyEngine.formatMinutesToTime(chosenStart);
      const formattedEndTime = DependencyEngine.formatMinutesToTime(chosenEnd);

      const orderIdx = day.items.length + 1;
      day.items.push({
        id: `item_gem_${Date.now()}`,
        dayId: day.id,
        tripId,
        title: `Hidden Gem: ${gem.name}`,
        description: `${gem.description} (Crowd Level: ${gem.crowdLevel}, Best Time: ${gem.bestTime})`,
        category: 'Hidden Gem',
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        location: gem.location,
        cost: gem.cost,
        status: 'Planned',
        isLocked: false,
        isUserModified: true,
        isWeatherSensitive: false,
        lat: gem.lat,
        lng: gem.lng,
        orderIndex: orderIdx
      });

      // Sort items chronologically by start time while preserving order index
      day.items.sort((a, b) => {
        const timeA = DependencyEngine.parseTimeToMinutes(a.startTime) ?? 0;
        const timeB = DependencyEngine.parseTimeToMinutes(b.startTime) ?? 0;
        return timeA - timeB;
      });
      day.items.forEach((item, i) => {
        item.orderIndex = i + 1;
      });
    }

    db.setItinerary(tripId, itinerary);

    db.addChangeLog(tripId, {
      id: `log_${Date.now()}`,
      tripId,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      fieldChanged: 'Itinerary - Hidden Gem Added',
      oldValue: replaceItemId ? 'Standard Sightseeing' : 'None',
      newValue: gem.name,
      reason: `Added hidden gem '${gem.name}' (${gem.crowdLevel} crowd) into Day ${targetDayNumber} itinerary.`,
      canUndo: true
    });

    return DependencyEngine.getFullTripData(tripId);
  }

  /**
   * What-If Sandbox Simulator:
   * Generates a side-by-side simulation comparison without modifying the live database.
   */
  public static simulateScenario(tripId: string, input: WhatIfScenarioInput): WhatIfSimulationResult {
    const currentData = DependencyEngine.getFullTripData(tripId);
    const currentMetrics = currentData.metrics;

    // Clone deep data for simulation
    const simTrip: Trip = JSON.parse(JSON.stringify(currentData.trip));
    const simMembers = JSON.parse(JSON.stringify(currentData.members));
    const simTransports = JSON.parse(JSON.stringify(currentData.transports));
    const simAccommodations = JSON.parse(JSON.stringify(currentData.accommodations));
    const simItinerary: ItineraryDay[] = JSON.parse(JSON.stringify(currentData.itinerary));
    const simExpenses = JSON.parse(JSON.stringify(currentData.expenses));
    const simBudget = JSON.parse(JSON.stringify(currentData.budget));

    const differences: WhatIfSimulationResult['differences'] = [];
    const itineraryAdjustments: string[] = [];
    const aiRecommendations: string[] = [];

    // Apply simulated changes
    if (input.budget !== undefined && input.budget !== currentData.trip.budget) {
      differences.push({
        field: 'Total Budget',
        currentValue: `₹${currentData.trip.budget.toLocaleString('en-IN')}`,
        simulatedValue: `₹${input.budget.toLocaleString('en-IN')}`,
        impact: input.budget < currentData.trip.budget ? 'warning' : 'positive'
      });
      simTrip.budget = input.budget;
      simBudget.totalBudget = input.budget;
      if (input.budget < currentData.trip.budget) {
        aiRecommendations.push(`At ₹${input.budget.toLocaleString('en-IN')}, consider substituting private cab rentals with local electric buses or shared transit.`);
      }
    }

    if (input.travellersCount !== undefined && input.travellersCount !== currentData.trip.travellersCount) {
      differences.push({
        field: 'Travellers Count',
        currentValue: `${currentData.trip.travellersCount} people`,
        simulatedValue: `${input.travellersCount} people`,
        impact: 'neutral'
      });
      simTrip.travellersCount = input.travellersCount;
      const simRooms = Math.ceil(input.travellersCount / 2);
      simAccommodations.forEach((a: any) => {
        a.roomCount = simRooms;
        a.totalPrice = a.pricePerNight * simRooms * 3;
      });
      differences.push({
        field: 'Hotel Rooms Required',
        currentValue: `${Math.ceil(currentData.trip.travellersCount / 2)} rooms`,
        simulatedValue: `${simRooms} rooms`,
        impact: 'neutral'
      });
    }

    if (input.transportDelayHours) {
      differences.push({
        field: 'Transport Delay',
        currentValue: 'On Time',
        simulatedValue: `+${input.transportDelayHours} hrs delay`,
        impact: 'negative'
      });
      itineraryAdjustments.push(`Day 1 afternoon check-in and local cafe exploration will be compressed by ${input.transportDelayHours} hours.`);
    }

    if (input.weatherCondition && input.weatherCondition === 'Heavy Rain') {
      differences.push({
        field: `Day ${input.weatherOverrideDay || 2} Weather`,
        currentValue: 'Sunny / Clear',
        simulatedValue: 'Heavy Rain Warning',
        impact: 'warning'
      });
      itineraryAdjustments.push('Outdoor mountain viewpoint & trek will be replaced with Himalayan Cultural Museum and artisanal cafe.');
      aiRecommendations.push('Heavy rain detected in simulation: Pack waterproof gear and prioritize indoor cultural activities.');
    }

    // Calculate simulated metrics
    const simTotalBudget = simTrip.budget;
    const simTotalSpent = simExpenses.reduce((acc: number, e: any) => acc + (Number(e.amount) || 0), 0);
    const simRemaining = simTotalBudget - simTotalSpent;
    const simTravellers = Math.max(1, simTrip.travellersCount);
    const simPerPersonBudget = Math.round(simTotalBudget / simTravellers);
    const simPerPersonSpent = Math.round(simTotalSpent / simTravellers);
    const simPerPersonProjected = Math.round(simTotalBudget / simTravellers);

    const simulatedMetrics: TripMetrics = {
      ...currentMetrics,
      totalBudget: simTotalBudget,
      totalSpent: simTotalSpent,
      remainingBudget: simRemaining,
      perPersonBudget: simPerPersonBudget,
      perPersonSpent: simPerPersonSpent,
      perPersonProjected: simPerPersonProjected,
      budgetHealthStatus: simRemaining < 0 ? 'Exceeded' : (simRemaining < simTotalBudget * 0.2 ? 'Warning' : 'Healthy')
    };

    const simulatedTripData: FullTripData = {
      trip: simTrip,
      members: simMembers,
      transports: simTransports,
      accommodations: simAccommodations,
      itinerary: simItinerary,
      expenses: simExpenses,
      budget: simBudget,
      bookings: currentData.bookings,
      weather: currentData.weather,
      hiddenGems: currentData.hiddenGems,
      changeLogs: currentData.changeLogs,
      metrics: simulatedMetrics,
      notifications: currentData.notifications
    };

    return {
      scenarioName: 'Sandbox Simulation',
      currentMetrics,
      simulatedMetrics,
      differences,
      itineraryAdjustments,
      aiRecommendations,
      simulatedTripData
    };
  }

  /**
   * Assembles the complete normalized trip dataset with reactive metrics.
   */
  public static getFullTripData(tripId: string): FullTripData {
    const trip = db.getTrip(tripId);
    if (!trip) throw new Error(`Trip with ID '${tripId}' not found`);

    const members = db.getMembers(tripId);
    const transports = db.getTransports(tripId);
    const accommodations = db.getAccommodations(tripId);
    const itinerary = db.getItinerary(tripId);
    const expenses = db.getExpenses(tripId);
    const budget = db.getBudget(tripId) || {
      id: `b_${tripId}`,
      tripId,
      totalBudget: trip.budget,
      transportAllocated: Math.round(trip.budget * 0.25),
      accommodationAllocated: Math.round(trip.budget * 0.30),
      foodAllocated: Math.round(trip.budget * 0.20),
      activitiesAllocated: Math.round(trip.budget * 0.15),
      shoppingAllocated: Math.round(trip.budget * 0.05),
      emergencyAllocated: Math.round(trip.budget * 0.03),
      miscAllocated: Math.round(trip.budget * 0.02)
    };
    const bookings = db.getBookings(tripId);
    const weather = db.getWeather(tripId);
    const hiddenGems = db.getHiddenGems(tripId);
    const changeLogs = db.getChangeLogs(tripId);
    const notifications = db.getNotifications(tripId);
    const metrics = DependencyEngine.calculateMetrics(tripId);

    return {
      trip,
      members,
      transports,
      accommodations,
      itinerary,
      expenses,
      budget,
      bookings,
      weather,
      hiddenGems,
      changeLogs,
      metrics,
      notifications
    };
  }
}
