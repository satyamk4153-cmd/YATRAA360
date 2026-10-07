import { seedDemoTrip } from '../src/db/seed-demo';
import { DependencyEngine } from '../src/engine/dependency-engine';
import { db } from '../src/db';
import { AIService } from '../src/services/ai-service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ TEST PASSED: ${message}`);
  }
}

console.log('🧪 Starting YATRA360 Reactive Dependency Engine Test Suite...\n');

// 1. Initial State
const trip = seedDemoTrip();
const initialData = DependencyEngine.getFullTripData(trip.id);

assert(initialData.trip.travellersCount === 4, 'Initial travellers count is 4');
assert(initialData.trip.budget === 40000, 'Initial budget is ₹40,000');
assert(initialData.metrics.totalSpent === 18500, 'Initial total spent is ₹18,500');
assert(initialData.metrics.remainingBudget === 21500, 'Initial remaining budget is ₹21,500');
assert(initialData.accommodations[0].roomCount === 2, 'Initial rooms required is 2 (for 4 people)');

// 2. Cascade Test: Change Travellers Count (4 -> 6)
console.log('\n--- Testing Travellers Count Cascade (4 -> 6) ---');
const dataAfter6Pax = DependencyEngine.handleTravellersChange(trip.id, 6);

assert(dataAfter6Pax.trip.travellersCount === 6, 'Trip travellers count updated to 6');
assert(dataAfter6Pax.members.length === 6, 'Group member list auto-expanded to 6');
assert(dataAfter6Pax.accommodations[0].roomCount === 3, 'Hotel room requirement auto-scaled to 3 rooms (Math.ceil(6/2))');
assert(dataAfter6Pax.metrics.perPersonBudget === Math.round(40000 / 6), 'Per-person budget recalculated accurately');
assert(dataAfter6Pax.transports[0].seats?.includes('6 Seats') ?? false, 'Transport reservation updated to 6 seats');

// 3. Cascade Test: Add Expense (₹3,500 Shopping)
console.log('\n--- Testing Expense Addition Cascade (+₹3,500 Shopping) ---');
const expenses = db.getExpenses(trip.id);
expenses.push({
  id: 'exp_test_shop',
  tripId: trip.id,
  title: 'Handmade Pashmina Shawls & Kullu Woodcrafts',
  amount: 3500,
  category: 'Shopping',
  paidByMemberId: 'mem_satyam',
  paidByName: 'Satyam Sharma',
  splitType: 'Equal',
  date: '2026-10-16'
});
db.setExpenses(trip.id, expenses);
const dataAfterExpense = DependencyEngine.getFullTripData(trip.id);

assert(dataAfterExpense.metrics.totalSpent === 22000, 'Total spent updated to ₹22,000 (18,500 + 3,500)');
assert(dataAfterExpense.metrics.remainingBudget === 18000, 'Remaining budget updated to ₹18,000 (40,000 - 22,000)');
const shoppingCat = dataAfterExpense.metrics.categoryBreakdown.find(c => c.category === 'Shopping');
assert(shoppingCat?.spent === 3500, 'Shopping category breakdown records ₹3,500 spent');
assert(dataAfterExpense.metrics.spendingAlerts.length > 0, 'Spending alert triggered for discretionary shopping increase');

// 4. Cascade Test: Change Transport Timing (07:00 AM -> 10:00 AM)
console.log('\n--- Testing Transport Timing Shift Cascade (07:00 AM -> 10:00 AM) ---');
const dataAfterTimeShift = DependencyEngine.handleTransportTimingChange(
  trip.id,
  dataAfterExpense.transports[0].id,
  '10:00 AM',
  '04:30 PM'
);

assert(dataAfterTimeShift.transports[0].departureTime === '10:00 AM', 'Train departure time shifted to 10:00 AM');
assert(dataAfterTimeShift.transports[0].arrivalTime === '04:30 PM', 'Train arrival time shifted to 04:30 PM');
assert(dataAfterTimeShift.itinerary[0].items[2].startTime === '04:30 PM', 'Day 1 Hotel check-in time downstream adjusted to 04:30 PM');

// 5. Cascade Test: Weather Adaptation (Heavy Rain on Day 2)
console.log('\n--- Testing Weather Simulation & Indoor Alternative Cascade ---');
const dataAfterRain = DependencyEngine.handleWeatherChange(trip.id, 2, 'Heavy Rain', true);

assert(dataAfterRain.weather[1].condition === 'Heavy Rain', 'Weather snapshot updated to Heavy Rain');
assert(dataAfterRain.weather[1].alertLevel === 'Warning', 'Weather alert level set to Warning');
assert(dataAfterRain.itinerary[1].items[0].title.includes('Museum') || dataAfterRain.itinerary[1].items[0].description.includes('Indoor Alternative'), 'Weather sensitive outdoor trek swapped with indoor cultural alternative');

// 6. Cascade Test: What-If Sandbox Simulator
console.log('\n--- Testing What-If Sandbox Simulator ---');
const simResult = DependencyEngine.simulateScenario(trip.id, {
  budget: 30000,
  travellersCount: 6,
  weatherCondition: 'Heavy Rain'
});

assert(simResult.simulatedMetrics.totalBudget === 30000, 'Simulated budget is ₹30,000');
assert(dataAfterRain.trip.budget === 40000, 'Original live trip budget remains un-mutated at ₹40,000');
assert(simResult.differences.length >= 2, 'Sandbox captured side-by-side differences');

// 7. Cascade Test: Adding Hidden Gem
console.log('\n--- Testing Hidden Gem Insertion ---');
const dataAfterGem = DependencyEngine.handleAddHiddenGem(trip.id, 'gem_jogini', 2);
const day2Gem = dataAfterGem.itinerary[1].items.find(i => i.title.includes('Jogini'));
assert(day2Gem !== undefined, 'Hidden gem successfully integrated into Day 2 itinerary');

// 8. Copilot Context Test
console.log('\n--- Testing AI Yatra Copilot Grounded Response ---');
const copilotResponse = AIService.answerCopilot(
  dataAfterGem,
  "It's raining tomorrow, we have 6 people and ₹2,000 left for tomorrow. What should we do?"
);
assert(copilotResponse.includes('Weather Adaptation') || copilotResponse.includes('6 travellers'), 'Copilot leveraged live weather, traveller count, and budget state in response');

console.log('\n🎉 ALL 8 REACTIVE ENGINE TESTS PASSED SUCCESSFULLY! 🚀\n');
