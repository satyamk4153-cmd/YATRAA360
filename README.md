# YATRA360 — "Plan. Explore. Adapt. Return."
### Production Reactive Travel Operating System

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-cyan.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-teal.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Production%20Tests-10%2F10%20Passing-emerald.svg)]()

> **YATRA360** is a full-stack, data-driven, reactive travel operating system that orchestrates a traveller's entire journey from their home doorstep to their destination and back. Featuring real Open-Meteo weather forecasting, OpenStreetMap geocoding, real OSRM road geometry routing, authenticated multi-user trip isolation, and a debt-simplification settlement engine.

---

## 🌟 Core Architecture & Single Source of Truth

Traditional travel planners generate static itineraries that become obsolete the moment delays or budget shifts occur. **YATRA360 is reactive**:

```
[ USER INPUT / REAL ROAD ROUTING / OPEN-METEO WEATHER ]
                        │
                        ▼
            [ Authenticated REST API ]
                        │
                        ▼
      [ Normalized Database (Users + Trips) ]
                        │
                        ▼
        [ Reactive Dependency Engine ]
                        │
   ┌────────────────────┼────────────────────┐
   ▼                    ▼                    ▼
[ Group Settlements ] [ Logistics & Rooms ] [ Itinerary & Weather ]
• Greedy Debt-Simpl.  • Hotel Rooms Math.   • Real Open-Meteo Live API
• Equal / Exact /     • Outbound/Return     • OSRM Road Geometry
  Custom Splits         Seats & Timing      • Weather Radar & Warnings
• "Aman pays Rahul"   • Downstream Shifts   • User-Lock Preservation
```

### Automatic Reactive Cascades
1. **Traveller Count Changed (e.g., 4 ➔ 6 travellers)**:
   - Auto-scales hotel room reservations (`Math.ceil(6/2) = 3 rooms`) and total stay costs.
   - Adjusts transport seat reservations (e.g., `6 Confirmed Seats`).
   - Expands group roster placeholders and recalculates per-person budget target.
   - Re-balances group settlement shares.
2. **Expense Added (e.g., +₹3,500 Shopping)**:
   - Updates total spent, remaining balance, and budget progress percentage.
   - Adjusts category allocation breakdown and flags discretionary spending anomalies.
   - Generates AI budget recommendations to offset costs on upcoming days.
3. **Transport Timing Shifted (e.g., 07:00 AM ➔ 10:00 AM Departure)**:
   - Recalculates estimated arrival time.
   - Shifts downstream Day 1 hotel check-in and afternoon schedule without modifying locked items.
4. **Weather Condition Changed (e.g., Clear ➔ Heavy Rain)**:
   - Detects weather-sensitive outdoor activities.
   - Flags danger levels and presents curated indoor cultural/gastronomy alternatives.
   - 1-click swap preserving manual user customizations.
5. **Hidden Gem Added**:
   - Seamlessly integrates into daily schedule with conflict detection.

---

## 🏗️ System Architecture

### Monorepo Structure
```
YATRAA360/
├── client/                     # Vite + React 19 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Production Responsive Views & Navigation
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── AuthView.tsx            # Login & Register UI with validation
│   │   │   ├── DashboardView.tsx
│   │   │   ├── CreateTripView.tsx
│   │   │   ├── DoorToDoorView.tsx
│   │   │   ├── ItineraryView.tsx
│   │   │   ├── InteractiveMapView.tsx  # Leaflet + OSRM real road routing
│   │   │   ├── GroupManagerView.tsx    # Debt simplification settlement plan
│   │   │   ├── BudgetExpensesView.tsx  # Equal, Exact, Custom split manager
│   │   │   ├── WhatIfSimulatorView.tsx
│   │   │   ├── WeatherCenterView.tsx   # Live Open-Meteo + simulation sandbox
│   │   │   ├── HiddenGemsView.tsx
│   │   │   ├── BookingsTransportView.tsx # IRCTC, Flights, Uber, Ola, Rapido
│   │   │   ├── RideProviderCard.tsx    # Standardized cab/auto provider card
│   │   │   ├── CopilotView.tsx
│   │   │   └── TripHistoryView.tsx
│   │   ├── store/              # Zustand Reactive Store with auth & session state
│   │   ├── services/           # Typed API Client & Centralized Booking Redirects
│   │   └── types/              # Unified domain interfaces
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── db/                 # Normalized JSON Store & User Account Persistence
│   │   ├── engine/             # Reactive Dependency & Debt Simplification Engine
│   │   ├── middleware/         # JWT Authentication Middleware & Trip Ownership
│   │   ├── services/           # Open-Meteo Weather, OSRM Routing, Geocoding, Auth
│   │   ├── routes/             # REST API endpoints
│   │   └── index.ts            # Server entrypoint (Port 3001)
│   ├── test/                   # Automated backend verification test suite (10/10)
│   └── package.json
│
├── package.json                # Root orchestration scripts
└── README.md                   # System documentation
```

---

## 🛡️ Security, Authentication & Trip Isolation

- **User Authentication**: Secure password hashing with `bcryptjs` and JSON Web Token (JWT) session cookies/headers.
- **Trip Isolation**: Every trip is strictly owned by an authenticated user (`userId`). Requests for trip details, expenses, itinerary updates, or simulations reject cross-user access with `403 Forbidden` / `404 Not Found`.
- **Session Continuity**: Browser refresh restores active user credentials via `/api/auth/me`.
- **Zero Mock Fallbacks Labeled as Live**: Live weather and road routing use real external APIs (Open-Meteo and OSRM), clearly demarcated from simulation sandboxes.

---

## ⚡ 14 Complete Application Views

| View | Capabilities |
| :--- | :--- |
| **1. Authentication** | High-security Login & Registration with email validation, password toggles, and token issuance |
| **2. Dashboard** | Real-time KPI cards (Budget, Spent, Remaining, Per-person, Live weather radar, Next activity) |
| **3. Create Trip** | Comprehensive Door-to-Door wizard with starting location, destination, budget, and travel preferences |
| **4. Door-to-Door** | Complete operational flow from Doorstep Pick-up ➔ Outbound Transit ➔ Hotel ➔ In-Destination ➔ Inbound ➔ Doorstep |
| **5. Itinerary** | Daily timeline, item locking, `USER_MODIFIED` badge preservation, duplicate/edit/delete, AI Replan |
| **6. Interactive Map** | Geospatial corridor tracking real OSRM road geometry, waypoint markers, and road-following paths |
| **7. Group & Splits** | Algorithmic debt simplification settlement plan ("Aman pays Rahul ₹2,575"), roster, balance matrix |
| **8. Reactive Budget** | Category progress bars, Equal/Exact/Custom expense logging, spending anomaly warnings |
| **9. What-If Sandbox** | Side-by-side simulation (Current vs Simulated) testing budget, travellers, delay, or weather before applying |
| **10. Weather Center** | Real-time Open-Meteo live forecasts, weather codes, precipitation chances, and simulation sandbox |
| **11. Hidden Gems** | Curated catalog of low-crowd trails with safety notes and 1-click itinerary integration with conflict prevention |
| **12. Bookings & Transit**| IRCTC 1-click journey summary copy, Google Flights, and verified Uber, Ola, and Rapido cab/auto booking options |
| **13. Yatra Copilot** | Contextual assistant with live access to trip budget, member balances, weather, and schedule |
| **14. Trip History & PDF**| Full timestamped audit trail of all changes and complete offline PDF Trip Package generation |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js `v18.0+`, `v20.0+`, or `v24.0+`
- npm `v9.0+` or higher

### Installation & Run

1. **Install dependencies**:
   ```bash
   npm install
   npm run build
   ```

2. **Start Development Environment**:
   ```bash
   npm run dev
   ```

3. **Access Application**:
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3001](http://localhost:3001)

4. **Run Production Test Suite**:
   ```bash
   npm test
   ```

---

## 📜 License
MIT License. Built for production travel operating system architecture.
