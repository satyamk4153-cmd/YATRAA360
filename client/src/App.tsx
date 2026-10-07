import React, { useEffect } from 'react';
import { useTripStore } from './store/tripStore';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { AuthView } from './components/AuthView';
import { ErrorBoundary } from './components/ErrorBoundary';

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
import { CopilotView } from './components/CopilotView';
import { TripHistoryView } from './components/TripHistoryView';
import { LandingView } from './components/LandingView';
import { Compass, Plus, Sparkles, FolderOpen } from 'lucide-react';

export function App() {
  const {
    isAuthenticated,
    checkAuth,
    currentTrip,
    activeView,
    setView,
    loadDemoTrip,
    isLoading
  } = useTripStore();

  useEffect(() => {
    // Check and restore existing session from JWT on mount
    checkAuth();
  }, []);

  // Unauthenticated flow
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans antialiased">
        <AuthView />
        <ToastContainer />
      </div>
    );
  }

  // Authenticated: Render active view
  const renderActiveView = () => {
    // If user has no active trip and is on landing, allow them to view landing or prompt creation
    if (activeView === 'landing') {
      return <LandingView />;
    }

    if (activeView === 'create-trip') {
      return <CreateTripView />;
    }

    if (activeView === 'history') {
      return <TripHistoryView />;
    }

    // If authenticated but has no trips created or loaded yet
    if (!currentTrip) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[65vh] p-8 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            No Active Trip Selected
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-md">
            Create your first travel itinerary to access live weather, OSRM road routing,
            door-to-door transit schedules, and automated debt-simplification settlements.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setView('create-trip')}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Trip</span>
            </button>
            <button
              type="button"
              onClick={() => loadDemoTrip()}
              disabled={isLoading}
              className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Load Demo Journey (Dev)</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/60 w-full flex items-center justify-center gap-6 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => setView('history')}
              className="hover:text-slate-600 flex items-center gap-1.5 transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>View Past Trips</span>
            </button>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
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
      case 'copilot':
        return <CopilotView />;
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
          <ErrorBoundary fallbackTitle="Section Error">
            {renderActiveView()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Floating Reactive Toast Alerts */}
      <ToastContainer />
    </div>
  );
}

export default App;
