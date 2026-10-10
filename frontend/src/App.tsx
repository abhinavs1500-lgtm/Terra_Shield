import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AICopilotDrawer } from './components/layout/AICopilotDrawer';

// Views
import { LandingPageView } from './components/views/LandingPageView';
import { OverviewView } from './components/views/OverviewView';
import { GeospatialMapView } from './components/views/GeospatialMapView';
import { DigitalTwin3DView } from './components/views/DigitalTwin3DView';
import { LandIntelligenceView } from './components/views/LandIntelligenceView';
import { HazardIntelligenceView } from './components/views/HazardIntelligenceView';
import { DisasterSimulatorView } from './components/views/DisasterSimulatorView';
import { InfrastructureGraphView } from './components/views/InfrastructureGraphView';
import { DamageAssessmentView } from './components/views/DamageAssessmentView';
import { RecoveryOptimizerView } from './components/views/RecoveryOptimizerView';
import { EnvironmentalView } from './components/views/EnvironmentalView';
import { AIResearchLabView } from './components/views/AIResearchLabView';
import { ReportsView } from './components/views/ReportsView';
import { DataSourcesView } from './components/views/DataSourcesView';
import { SettingsView } from './components/views/SettingsView';

export const App: React.FC = () => {
  const { currentView } = useApp();

  // If user is on the landing page, render immersive full-screen landing view
  if (currentView === 'landing') {
    return (
      <div className="h-screen w-screen overflow-hidden bg-ts-bg font-sans text-ts-text">
        <LandingPageView />
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <OverviewView />;
      case 'map':
        return <GeospatialMapView />;
      case 'digital-twin':
        return <DigitalTwin3DView />;
      case 'land':
        return <LandIntelligenceView />;
      case 'hazard':
        return <HazardIntelligenceView />;
      case 'simulator':
        return <DisasterSimulatorView />;
      case 'infrastructure':
        return <InfrastructureGraphView />;
      case 'damage':
        return <DamageAssessmentView />;
      case 'recovery':
        return <RecoveryOptimizerView />;
      case 'environmental':
        return <EnvironmentalView />;
      case 'research-lab':
        return <AIResearchLabView />;
      case 'reports':
        return <ReportsView />;
      case 'data-sources':
        return <DataSourcesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-ts-bg font-sans text-ts-text">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative bg-ts-bg">
          {renderView()}
        </main>
        <AICopilotDrawer />
      </div>
    </div>
  );
};
