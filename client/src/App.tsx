import React, { useEffect } from 'react';
import { useTripStore } from './store/tripStore';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';

import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { CreateTripView } from './components/CreateTripView';
import { DoorToDoorView } from './components/DoorToDoorView';
import { ItineraryView } from './components/ItineraryView';
import { InteractiveMapView } from './components/InteractiveMapView';
import { GroupManagerView } from './components/GroupManagerView';
import { BudgetExpensesView } from './components/BudgetExpensesView';
import { WhatIfSimulatorView } from './components/WhatIfSimulatorView';
import { WeatherCenterView } from './components/WeatherCenterView';
import { HiddenGemsView } from './components/HiddenGemsView';
import { BookingsTransportView } from './components/BookingsTransportView';
import { SafetyCenterView } from './components/SafetyCenterView';
import { TravelConnectView } from './components/TravelConnectView';
import { CopilotView } from './components/CopilotView';
import { TripHistoryView } from './components/TripHistoryView';

export function App() {
  const { currentTrip, activeView, loadDemoTrip } = useTripStore();

  useEffect(() => {
    // If no trip loaded on initial start, auto-load demo trip in background
    if (!currentTrip) {
      loadDemoTrip();
    }
  }, []);

  const renderActiveView = () => {
    if (!currentTrip || activeView === 'landing') {
      return <LandingView />;
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'create-trip':
        return <CreateTripView />;
      case 'door-to-door':
        return <DoorToDoorView />;
      case 'itinerary':
        return <ItineraryView />;
      case 'map':
        return <InteractiveMapView />;
      case 'group':
        return <GroupManagerView />;
      case 'expenses':
      case 'budget':
        return <BudgetExpensesView />;
      case 'what-if':
        return <WhatIfSimulatorView />;
      case 'weather':
        return <WeatherCenterView />;
      case 'hidden-gems':
        return <HiddenGemsView />;
      case 'bookings':
        return <BookingsTransportView />;
      case 'safety':
        return <SafetyCenterView />;
      case 'chat':
        return <TravelConnectView />;
      case 'copilot':
        return <CopilotView />;
      case 'history':
        return <TripHistoryView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar />

      {/* Main App Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating Reactive Toast Alerts */}
      <ToastContainer />
    </div>
  );
}

export default App;
