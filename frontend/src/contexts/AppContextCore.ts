import { createContext } from 'react';
import * as Types from '../types';

export interface AppContextType {
  userRole: string;
  setUserRole: (role: string) => void;
  accessId: string;
  setAccessId: (id: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  seatSection: string;
  setSeatSection: (sec: string) => void;
  userGate: string;
  setUserGate: (gate: string) => void;
  selectedMatchId: number;
  setSelectedMatchId: (id: number) => void;
  activeRoute: string;
  setActiveRoute: (route: string) => void;
  notifications: Types.Notification[];
  addNotification: (title: string, message: string, type: 'emergency' | 'info' | 'task') => void;
  clearNotifications: () => void;
  incidents: Types.Incident[];
  fetchIncidents: () => Promise<void>;
  reportIncident: (title: string, desc: string, category: Types.Incident['category'], severity: Types.Incident['severity'], location: string) => Promise<void>;
  updateIncident: (id: number, status: Types.Incident['status']) => Promise<void>;
  gates: Types.Gate[];
  fetchGates: () => Promise<void>;
  foodStalls: Types.FoodStall[];
  fetchFoodStalls: () => Promise<void>;
  routes: Types.TransportRoute[];
  fetchTransport: () => Promise<void>;
  metrics: Types.OperationsMetrics | null;
  fetchMetrics: () => Promise<void>;
  matches: Types.Match[];
  fetchMatches: () => Promise<void>;
  updateGateState: (id: number, status: Types.Gate['status'], queue_time: number) => Promise<void>;
  updateFoodStallState: (id: number, status: Types.FoodStall['status'], wait_time: number, sustainability: number) => Promise<void>;
  createFoodStallState: (name: string, type: string, location: string, status: Types.FoodStall['status'], wait_time: number, sustainability: number) => Promise<void>;
  updateTransportRouteState: (id: number, status: Types.TransportRoute['status'], wait_time: number) => Promise<void>;
  createTransportRouteState: (name: string, type: Types.TransportRoute['type'], destination: string, status: Types.TransportRoute['status'], wait_time: number) => Promise<void>;
  updateMatchState: (id: number, status: Types.Match['status'], home_team?: string, away_team?: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
