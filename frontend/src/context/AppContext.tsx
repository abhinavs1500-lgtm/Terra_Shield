import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeName, UserRole, NavigationModule, Parcel, SimulationRunResult } from '../types';
import { api, getIsBackendLive } from '../services/api';
import { FALLBACK_PARCELS, FALLBACK_SIMULATION_RESULT } from '../services/fallbackData';

interface AppContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  currentView: NavigationModule;
  setCurrentView: (v: NavigationModule) => void;
  userRole: UserRole;
  setUserRole: (r: UserRole) => void;
  parcels: Parcel[];
  selectedParcelId: string;
  setSelectedParcelId: (id: string) => void;
  selectedParcel: Parcel;
  customPolygonCoords: number[][] | null;
  setCustomPolygonCoords: (coords: number[][] | null) => void;
  activeScenarioResult: SimulationRunResult;
  setActiveScenarioResult: (res: SimulationRunResult) => void;
  currentSimulationHour: number;
  setCurrentSimulationHour: React.Dispatch<React.SetStateAction<number>>;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  sendCopilotQuery: (q: string) => void;
  copilotQueryToInject: string | null;
  setCopilotQueryToInject: (q: string | null) => void;
  refreshParcels: () => Promise<void>;
  isDemoMode: boolean;
  isBackendConnected: boolean;
  active3DWaterHeight: number;
  setActive3DWaterHeight: (h: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>('holocore');
  const [currentView, setCurrentView] = useState<NavigationModule>('landing');
  const [userRole, setUserRole] = useState<UserRole>('Urban Planner');
  
  // Seed with fallback parcels immediately so UI is never blank
  const [parcels, setParcels] = useState<Parcel[]>(FALLBACK_PARCELS);
  const [selectedParcelId, setSelectedParcelId] = useState<string>('P-101');
  const [customPolygonCoords, setCustomPolygonCoords] = useState<number[][] | null>(null);
  
  // Seed with fallback simulation result immediately
  const [activeScenarioResult, setActiveScenarioResult] = useState<SimulationRunResult>(FALLBACK_SIMULATION_RESULT);
  const [currentSimulationHour, setCurrentSimulationHour] = useState<number>(12);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotQueryToInject, setCopilotQueryToInject] = useState<string | null>(null);
  const [active3DWaterHeight, setActive3DWaterHeight] = useState<number>(1.8);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const isDemoMode = true;

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('terrashield_theme', newTheme);
  };

  useEffect(() => {
    const savedTheme = (localStorage.getItem('terrashield_theme') as ThemeName) || 'holocore';
    setTheme(savedTheme);
    refreshParcels();
  }, []);

  const refreshParcels = async () => {
    try {
      const data = await api.getParcels();
      if (data && data.length > 0) {
        setParcels(data);
      }
      setIsBackendConnected(getIsBackendLive());
    } catch (e) {
      console.warn('Backend unavailable, operating in verified standalone demonstration mode:', e);
      setIsBackendConnected(false);
    }
  };

  // Safe parcel accessor guarantee: always returns a valid Parcel
  const selectedParcel =
    parcels.find(p => p.id === selectedParcelId) ||
    parcels[0] ||
    FALLBACK_PARCELS[0];

  const sendCopilotQuery = (query: string) => {
    setCopilotQueryToInject(query);
    setIsCopilotOpen(true);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        currentView,
        setCurrentView,
        userRole,
        setUserRole,
        parcels,
        selectedParcelId,
        setSelectedParcelId,
        selectedParcel,
        customPolygonCoords,
        setCustomPolygonCoords,
        activeScenarioResult,
        setActiveScenarioResult,
        currentSimulationHour,
        setCurrentSimulationHour,
        isCopilotOpen,
        setIsCopilotOpen,
        sendCopilotQuery,
        copilotQueryToInject,
        setCopilotQueryToInject,
        refreshParcels,
        isDemoMode,
        isBackendConnected,
        active3DWaterHeight,
        setActive3DWaterHeight
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
