# YATRA360 — "Plan. Explore. Adapt. Return."
### Next-Generation Fully Reactive AI Travel Operating System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-cyan.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-teal.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Reactive%20Tests-8%2F8%20Passing-emerald.svg)]()

> **YATRA360** is not a static demo or one-off itinerary generator. It is a **data-driven, fully reactive travel operating system** that orchestrates a traveller's entire journey from their home doorstep to their destination and back to their doorstep. Every parameter is interconnected through a centralized dependency engine and normalized database.

---

## 🌟 Core USP: Full Reactivity & Single Source of Truth

Traditional travel planners generate a static document that instantly becomes obsolete when plans change. **YATRA360 is reactive**:

```
[ USER / WEATHER / TIME SHIFT ]
               │
               ▼
[ Centralized Database Layer ] ──> [ Reactive Dependency Engine ]
                                                │
       ┌────────────────────────────────────────┼────────────────────────────────────────┐
       ▼                                        ▼                                        ▼
[ Group & Costs ]                      [ Logistics & Rooms ]                   [ Itinerary & Weather ]
• Splitwise Matrix                     • Hotel Rooms Math.ceil(Pax/2)          • Weather Risk Radar
• Per-Person Budget                    • Transport Seats & Pricing             • Indoor Replanning
• Dynamic Settlements                  • Timing Downstream Shifts              • USER_MODIFIED Lock
```

### Automatic Reactive Cascades
1. **Traveller Count Changed (e.g. 4 ➔ 6 travellers)**:
   - Auto-scales hotel room reservations (`Math.ceil(6/2) = 3 rooms`) and total stay costs.
   - Adjusts transport seat reservations (e.g. `6 Confirmed Seats`).
   - Expands group roster placeholders and recalculates per-person budget target.
   - Re-balances Splitwise group settlement shares.
2. **Expense Added (e.g. +₹3,500 Shopping)**:
   - Updates total spent, remaining balance, and budget progress percentage.
   - Adjusts category allocation breakdown and flags discretionary spending anomalies.
   - Generates AI budget recommendations to offset costs on upcoming days.
3. **Transport Timing Shifted (e.g. 07:00 AM ➔ 10:00 AM Departure)**:
   - Recalculates estimated arrival time.
   - Shifts downstream Day 1 hotel check-in and afternoon schedule without modifying locked items.
4. **Weather Condition Changed (e.g. Sunny ➔ Heavy Rain)**:
   - Detects weather-sensitive outdoor activities (e.g. Solang Valley Trek).
   - Flags danger levels and presents curated indoor cultural/gastronomy alternatives.
   - 1-click swap preserving manual user customizations.
5. **Hidden Gem Added**:
   - Seamlessly integrates into daily schedule, recalculating travel distances and budget.

---

## 🏗️ System Architecture

### Monorepo Structure
```
YATRAA/
├── client/                     # Vite + React 19 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/         # 16 High-Fidelity Responsive Views & Navigation
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── DashboardView.tsx
│   │   │   ├── CreateTripView.tsx
│   │   │   ├── DoorToDoorView.tsx
│   │   │   ├── ItineraryView.tsx
│   │   │   ├── InteractiveMapView.tsx
│   │   │   ├── GroupManagerView.tsx
│   │   │   ├── BudgetExpensesView.tsx
│   │   │   ├── WhatIfSimulatorView.tsx
│   │   │   ├── WeatherCenterView.tsx
│   │   │   ├── HiddenGemsView.tsx
│   │   │   ├── BookingsTransportView.tsx
│   │   │   ├── SafetyCenterView.tsx
│   │   │   ├── TravelConnectView.tsx
│   │   │   ├── CopilotView.tsx
│   │   │   └── TripHistoryView.tsx
│   │   ├── store/              # Zustand Reactive Store with instant client mutations
│   │   ├── services/           # Typed API Client
│   │   └── types/              # Unified domain interfaces
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── db/                 # Normalized Relational Persistence Store & Demo Seeder
│   │   ├── engine/             # Reactive Dependency & Topological Recalculation Engine
│   │   ├── services/           # AI Service Layer (AIPlanner, Replanner, Copilot)
│   │   ├── routes/             # Clean REST API endpoints
│   │   └── index.ts            # Server entrypoint (Port 3001)
│   ├── test/                   # Automated reactive cascade verification suite
│   └── package.json
│
├── package.json                # Root concurrent scripts
└── README.md                   # System documentation
```

---

## 📊 Database Schema (18 Normalized Entity Models)

1. `Trip` — Unique ID, title, origin, destination, dates, travellers count, budget, style, status.
2. `TripMember` — ID, trip ID, name, email, phone, role (Organizer/Co-Leader/Member), paid amount, balance.
3. `TravellerProfile` — Age, dietary restrictions, emergency contact.
4. `Transport` — Outbound & Return high-speed train/flight/cab, departure/arrival times & stations, PNR, seats, fare.
5. `Accommodation` — Hotel name, type, check-in, check-out, price per night, total price, room count, booking ref, coordinates.
6. `ItineraryDay` — Day number, date, theme, weather forecast, notes, items array.
7. `ItineraryItem` — ID, day ID, title, start/end time, category, cost, `isLocked`, `isUserModified`, `isWeatherSensitive`, weather alternative.
8. `Destination` — Name, city, state, country, description, latitude, longitude.
9. `HiddenGem` — Name, city, description, crowd level (Very Low/Low/Moderate), cost, opening hours, safety info, best time, coordinates.
10. `Expense` — Title, amount, category, payer member ID, split type, date, receipt notes.
11. `ExpenseSplit` — Member ID, share amount, settlement status.
12. `Budget` — Total budget and 7 category allocations (Transport, Stay, Food, Activities, Shopping, Emergency, Misc).
13. `Booking` — Reservation type, item name, reference code, status (Confirmed/Pending).
14. `WeatherSnapshot` — Date, condition, temperature in °C, precipitation chance, alert level.
15. `EmergencyContact` — Name, relation, phone, priority rank, notes.
16. `ChatMessage` & `ChatRoom` — Trip chat history with sender ID, timestamps, AI copilot responses.
17. `ActivityVote` — Activity polls with member approvals/disapprovals.
18. `TripChangeLog` — Timestamped audit trail with old values, new values, reasons, and undo support.

---

## ⚡ 16 Complete Application Views

| View | Capabilities |
| :--- | :--- |
| **1. Landing** | High-energy Hero, Door-to-Door Journey Visualizer, 1-Click Interactive Demo launcher |
| **2. Dashboard** | Real-time KPI cards (Budget, Spent, Remaining, Per-person, Weather radar, Next activity, Quick modifiers) |
| **3. Create Trip** | Comprehensive Door-to-Door wizard with starting location, destination, budget, and travel preferences |
| **4. Door-to-Door** | Complete operational flow from Doorstep Pick-up ➔ Outbound Rail ➔ Hotel ➔ In-Destination ➔ Inbound ➔ Doorstep |
| **5. Itinerary** | Daily timeline, item locking, `USER_MODIFIED` badge preservation, duplicate/edit/delete, AI Replan |
| **6. Interactive Map** | Geospatial corridor tracking origin, transit stations, hotel base camp, and itinerary pins |
| **7. Group & Splits** | Member roster, role management, Splitwise-style balance matrix, UPI settlement assistant |
| **8. Reactive Budget** | Category progress bars, expense logging, spending anomaly warnings, AI financial advice |
| **9. What-If Sandbox** | Side-by-side simulation (Current vs Simulated) testing budget, travellers, delay, or weather before applying |
| **10. Weather Center** | Live forecasts, weather radar status, scenario simulator, indoor alternatives with 1-click apply |
| **11. Hidden Gems** | Curated catalog of low-crowd trails with safety notes and 1-click itinerary integration |
| **12. Bookings & Transit**| Rail/Flight PNRs, confirmed hotel rooms, and departure time adjustment cascading into itinerary |
| **13. Safety Center** | 1-Click SOS emergency distress beacon with GPS coordinates, 24/7 helplines, and safety checklist |
| **14. Travel Connect** | Real-time group chatroom, democratic activity voting polls, and privacy-first solo traveller connect |
| **15. Yatra Copilot** | Contextual AI chat assistant with live access to trip budget, members, weather, and schedule |
| **16. Trip History & PDF**| Full timestamped audit trail of all changes and complete offline PDF Trip Package generation |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js `v18.0+` or `v20.0+` or `v24.0+`
- npm `v9.0+` or `v10.0+` or `v11.0+`

### Installation & Run

1. **Clone or open repository**:
   ```bash
   cd YATRAA
   ```

2. **Install all dependencies (Root, Server, and Client)**:
   ```bash
   npm install
   npm run dev
   ```

3. **Open the Application**:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3001](http://localhost:3001)

4. **Run Reactive Test Suite**:
   ```bash
   npm test
   ```

---

## 🏆 Hackathon Demonstration Flow (Step-by-Step)

Follow this demonstration walkthrough to showcase the platform:

1. **Launch App**: Open [http://localhost:5173](http://localhost:5173) and click **"Try Demo"** (or **"Launch Interactive Demo"**).
2. **Inspect Initial State**:
   - Origin: **Moradabad** ➔ Destination: **Manali**
   - 4 Travellers (Satyam, Rahul, Aman, Neha)
   - Budget: **₹40,000** (Spent: **₹18,500**, Remaining: **₹21,500**)
   - Hotel: **2 Rooms** allocated at Pineview Eco Retreat.
3. **Trigger Traveller Count Cascade (4 ➔ 6 Travellers)**:
   - On Dashboard or Group page, click **6P**.
   - Notice: Hotel room requirements auto-scale to **3 Rooms**, transport reservations update to 6 seats, and per-person cost target re-adjusts.
4. **Trigger Expense Addition (+₹3,500 Shopping)**:
   - Click **"Log Expense"**, enter ₹3,500 under Shopping (Pashmina shawls).
   - Notice: Total spent jumps to **₹22,000**, remaining drops to **₹18,000**, shopping category bar alerts in red, and AI financial warning triggers.
5. **Trigger Transport Timing Shift (07:00 AM ➔ 10:00 AM)**:
   - In Dashboard or Bookings page, toggle train departure to **10:00 AM**.
   - Notice: Arrival shifts to **04:30 PM**, hotel check-in time shifts, and Day 1 afternoon itinerary items downstream re-schedule automatically.
6. **Simulate Weather Shift (Heavy Rain on Day 2)**:
   - In Weather Center, click **"🌧️ Heavy Rain"**.
   - Notice: Outdoor Solang Valley nature trek is flagged as a risk, and indoor cultural alternative (*Himalayan Art, Culture & Heritage Museum*) is substituted.
7. **Open What-If Sandbox Simulator**:
   - Open What-If Sandbox. Reduce budget to **₹30,000** and set 6 travellers.
   - Inspect side-by-side comparison between Current Plan vs Simulated Plan, then click **"Apply All Simulated Changes"**.
8. **Explore & Add Hidden Gems**:
   - Open Hidden Gems, review *Jogini Falls Secret Upper Trail* and click **"Add to Day 2 Itinerary"**.
9. **Query Yatra Copilot**:
   - Open AI Copilot and click the question chip:
     *"It's raining tomorrow, we have 6 people and ₹2,000 left for tomorrow. What should we do?"*
   - Observe the response utilizing the live data (6 travellers, ₹18,000 remaining, indoor museum alternative).
10. **Test Safety Center & SOS**:
    - Open Safety Center and click **"TRIGGER EMERGENCY SOS"** to observe live beacon dispatch with coordinates.
11. **Export Offline PDF**:
    - Open History & PDF and click **"Download Trip PDF Pack"** to export the comprehensive travel manifest.

---

## 📜 License
MIT License. Built for hackathon demonstration with reactive architecture.
# YATRAA360
