import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeName, UserRole, NavigationModule, Parcel, SimulationRunResult } from '../types';
import { api } from '../services/api';

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
  selectedParcel: Parcel | null;
  customPolygonCoords: number[][] | null;
  setCustomPolygonCoords: (coords: number[][] | null) => void;
  activeScenarioResult: SimulationRunResult | null;
  setActiveScenarioResult: (res: SimulationRunResult | null) => void;
  currentSimulationHour: number;
  setCurrentSimulationHour: React.Dispatch<React.SetStateAction<number>>;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  sendCopilotQuery: (q: string) => void;
  copilotQueryToInject: string | null;
  setCopilotQueryToInject: (q: string | null) => void;
  refreshParcels: () => Promise<void>;
  isDemoMode: boolean;
  active3DWaterHeight: number;
  setActive3DWaterHeight: (h: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>('holocore');
  const [currentView, setCurrentView] = useState<NavigationModule>('landing');
  const [userRole, setUserRole] = useState<UserRole>('Urban Planner');
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState<string>('P-101');
  const [customPolygonCoords, setCustomPolygonCoords] = useState<number[][] | null>(null);
  const [activeScenarioResult, setActiveScenarioResult] = useState<SimulationRunResult | null>(null);
  const [currentSimulationHour, setCurrentSimulationHour] = useState<number>(6);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotQueryToInject, setCopilotQueryToInject] = useState<string | null>(null);
  const [active3DWaterHeight, setActive3DWaterHeight] = useState<number>(1.8);
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
    } catch (e) {
      console.warn('Failed to load parcels from backend:', e);
    }
  };

  const selectedParcel = parcels.find(p => p.id === selectedParcelId) || (parcels.length > 0 ? parcels[0] : null);

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
        active3DWaterHeight,
        setActive3DWaterHeight
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
