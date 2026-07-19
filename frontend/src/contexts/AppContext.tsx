import React, { useState, useEffect, useCallback } from 'react';
import * as Types from '../types';
import { api } from '../services/api';
import { AppContext } from './AppContextCore';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRoleState] = useState<string>(() => localStorage.getItem('role') || '');
  const [accessId, setAccessIdState] = useState<string>(() => localStorage.getItem('accessId') || '');
  const [language, setLanguage] = useState<string>('en');
  const [theme, setThemeState] = useState<string>('dark');
  const [seatSection, setSeatSection] = useState<string>('Section 112');
  const [userGate, setUserGate] = useState<string>('Gate A');
  const [selectedMatchId, setSelectedMatchId] = useState<number>(1);
  const [activeRoute, setActiveRoute] = useState<string>('home');
  const [notifications, setNotifications] = useState<Types.Notification[]>([]);
  const [incidents, setIncidents] = useState<Types.Incident[]>([]);
  const [gates, setGates] = useState<Types.Gate[]>([]);
  const [foodStalls, setFoodStalls] = useState<Types.FoodStall[]>([]);
  const [routes, setRoutes] = useState<Types.TransportRoute[]>([]);
  const [metrics, setMetrics] = useState<Types.OperationsMetrics | null>(null);
  const [matches, setMatches] = useState<Types.Match[]>([]);

  const setUserRole = (role: string) => {
    setUserRoleState(role);
    localStorage.setItem('role', role);
  };

  const setAccessId = (id: string) => {
    setAccessIdState(id);
    localStorage.setItem('accessId', id);
  };

  const setTheme = (t: string) => {
    setThemeState(t);
    document.documentElement.classList.remove('light', 'dark', 'contrast');
    if (t === 'contrast') {
      document.documentElement.classList.add('contrast');
    } else if (t === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const addNotification = (title: string, message: string, type: 'emergency' | 'info' | 'task') => {
    const newNotif: Types.Notification = {
      id: Date.now(),
      recipient_role: userRole,
      title,
      message,
      type,
      created_at: new Date().toISOString(),
      is_read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch {
      console.warn("Failed to load incidents from server.");
    }
  }, []);

  const reportIncident = async (title: string, desc: string, category: Types.Incident['category'], severity: Types.Incident['severity'], location: string) => {
    try {
      const newInc = await api.createIncident({
        title,
        description: desc,
        category,
        severity,
        location,
        reported_by_role: userRole
      });
      setIncidents(prev => [newInc, ...prev]);
      addNotification("Incident Reported", `${title} logged successfully at ${location}.`, 'info');
    } catch {
      console.warn("Failed to report incident to server. Logging locally.");
      const mockInc: Types.Incident = {
        id: Date.now(),
        title,
        description: desc,
        category,
        severity,
        location,
        status: 'reported',
        created_at: new Date().toISOString(),
        resolved_at: null,
        reported_by_role: userRole
      };
      setIncidents(prev => [mockInc, ...prev]);
      addNotification("Incident Created Locally", `${title} saved on client database.`, 'info');
    }
  };

  const updateIncident = async (id: number, status: Types.Incident['status']) => {
    try {
      const updated = await api.updateIncidentStatus(id, status);
      setIncidents(prev => prev.map(inc => inc.id === id ? updated : inc));
      addNotification("Incident Updated", `Status marked as ${status}.`, 'info');
    } catch {
      console.warn("Local update of incident status.");
      setIncidents(prev => prev.map(inc => inc.id === id ? {
        ...inc,
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null
      } : inc));
    }
  };

  const fetchGates = useCallback(async () => {
    try {
      const data = await api.getGates();
      setGates(data);
    } catch {
      // Mock fallback data
      setGates([
        { id: 1, name: "A (Verizon)", stadium_id: 1, status: 'open', latitude: 0, longitude: 0, current_queue_time_mins: 5 },
        { id: 2, name: "B (Hampton)", stadium_id: 1, status: 'open', latitude: 0, longitude: 0, current_queue_time_mins: 12 },
        { id: 3, name: "C (Pepsi)", stadium_id: 1, status: 'congested', latitude: 0, longitude: 0, current_queue_time_mins: 28 },
        { id: 4, name: "D (SAP)", stadium_id: 1, status: 'open', latitude: 0, longitude: 0, current_queue_time_mins: 8 },
        { id: 5, name: "VIP Gate", stadium_id: 1, status: 'open', latitude: 0, longitude: 0, current_queue_time_mins: 2 },
      ]);
    }
  }, []);

  const fetchFoodStalls = useCallback(async () => {
    try {
      const data = await api.getFoodStalls();
      setFoodStalls(data);
    } catch {
      setFoodStalls([
        { id: 1, name: "Jersey Burgers", type: "Fast Food", location: "Concourse A, Sec 112", status: 'open', current_wait_time_mins: 15, sustainability_score: 4.2 },
        { id: 2, name: "Garden State Greens", type: "Healthy / Vegan", location: "Concourse B, Sec 124", status: 'open', current_wait_time_mins: 4, sustainability_score: 4.9 },
        { id: 3, name: "Liberty Tacos", type: "Halal / Gluten-Free", location: "Concourse C, Sec 208", status: 'open', current_wait_time_mins: 18, sustainability_score: 4.6 },
        { id: 4, name: "Big Apple Pretzels", type: "Snacks", location: "Upper Level, Sec 315", status: 'open', current_wait_time_mins: 8, sustainability_score: 4.1 },
        { id: 5, name: "Stadium Hydration Hub", type: "Beverages", location: "Concourse A, Sec 102", status: 'open', current_wait_time_mins: 2, sustainability_score: 5.0 }
      ]);
    }
  }, []);

  const fetchTransport = useCallback(async () => {
    try {
      const data = await api.getTransport();
      setRoutes(data);
    } catch {
      setRoutes([
        { id: 1, name: "Express Train NYC", type: 'train', destination: "New York Penn Station", status: 'normal', current_wait_time_mins: 6 },
        { id: 2, name: "Shuttle A", type: 'shuttle', destination: "Off-site Lot 1", status: 'normal', current_wait_time_mins: 4 },
        { id: 3, name: "Route 160 bus", type: 'bus', destination: "Port Authority Bus Terminal", status: 'delayed', current_wait_time_mins: 22 },
        { id: 4, name: "VIP Chauffeur Line", type: 'taxi', destination: "Newark Airport", status: 'normal', current_wait_time_mins: 8 },
      ]);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await api.getMetrics();
      setMetrics(data);
    } catch {
      setMetrics({
        total_occupancy: 68450,
        active_incidents: incidents.filter(i => i.status !== 'resolved').length,
        active_volunteers: 2,
        avg_gate_queue_mins: 11,
        sustainability_score: 4.56,
        crowd_risk_level: 'medium',
        incident_stats: { crowd: 1, medical: 0, security: 0, maintenance: 1, general: 0 },
        transport_status: { normal: 3, delayed: 1, suspended: 0 }
      });
    }
  }, [incidents]);

  const fetchMatches = useCallback(async () => {
    try {
      const data = await api.getMatches();
      setMatches(data);
    } catch {
      setMatches([
        { id: 1, home_team: "USA", away_team: "England", date_time: new Date().toISOString(), stadium_id: 1, status: "scheduled" },
        { id: 2, home_team: "Mexico", away_team: "Argentina", date_time: new Date().toISOString(), stadium_id: 1, status: "scheduled" },
        { id: 3, home_team: "Canada", away_team: "Brazil", date_time: new Date().toISOString(), stadium_id: 1, status: "scheduled" }
      ]);
    }
  }, []);

  const updateGateState = async (id: number, status: Types.Gate['status'], queue_time: number) => {
    try {
      const res = await api.updateGate(id, status, queue_time);
      setGates(prev => prev.map(g => g.id === id ? res : g));
      addNotification("Gate Updated", `Gate ${res.name} wait set to ${queue_time}m (${status}).`, 'info');
    } catch {
      setGates(prev => prev.map(g => g.id === id ? { ...g, status, current_queue_time_mins: queue_time } : g));
    }
  };

  const updateFoodStallState = async (id: number, status: Types.FoodStall['status'], wait_time: number, sustainability: number) => {
    try {
      const res = await api.updateFoodStall(id, status, wait_time, sustainability);
      setFoodStalls(prev => prev.map(s => s.id === id ? res : s));
      addNotification("Concession Updated", `${res.name} wait set to ${wait_time}m.`, 'info');
    } catch {
      setFoodStalls(prev => prev.map(s => s.id === id ? { ...s, status, current_wait_time_mins: wait_time, sustainability_score: sustainability } : s));
    }
  };

  const createFoodStallState = async (name: string, type: string, location: string, status: Types.FoodStall['status'], wait_time: number, sustainability: number) => {
    try {
      const res = await api.createFoodStall({ name, type, location, status, current_wait_time_mins: wait_time, sustainability_score: sustainability });
      setFoodStalls(prev => [...prev, res]);
      addNotification("Concession Added", `Stall ${name} created.`, 'info');
    } catch {
      const mock: Types.FoodStall = { id: Date.now(), name, type, location, status, current_wait_time_mins: wait_time, sustainability_score: sustainability };
      setFoodStalls(prev => [...prev, mock]);
    }
  };

  const updateTransportRouteState = async (id: number, status: Types.TransportRoute['status'], wait_time: number) => {
    try {
      const res = await api.updateTransportRoute(id, status, wait_time);
      setRoutes(prev => prev.map(r => r.id === id ? res : r));
      addNotification("Transport Updated", `Route ${res.name} wait set to ${wait_time}m (${status}).`, 'info');
    } catch {
      setRoutes(prev => prev.map(r => r.id === id ? { ...r, status, current_wait_time_mins: wait_time } : r));
    }
  };

  const createTransportRouteState = async (name: string, type: Types.TransportRoute['type'], destination: string, status: Types.TransportRoute['status'], wait_time: number) => {
    try {
      const res = await api.createTransportRoute({ name, type, destination, status, current_wait_time_mins: wait_time });
      setRoutes(prev => [...prev, res]);
      addNotification("Transport Route Added", `Route ${name} to ${destination} created.`, 'info');
    } catch {
      const mock: Types.TransportRoute = { id: Date.now(), name, type, destination, status, current_wait_time_mins: wait_time };
      setRoutes(prev => [...prev, mock]);
    }
  };

  const updateMatchState = async (id: number, status: Types.Match['status'], home_team?: string, away_team?: string) => {
    try {
      const res = await api.updateMatch(id, status, home_team, away_team);
      setMatches(prev => prev.map(m => m.id === id ? res : m));
      addNotification("Match Updated", `Match status set to ${status}.`, 'info');
    } catch {
      setMatches(prev => prev.map(m => m.id === id ? { ...m, status, home_team: home_team || m.home_team, away_team: away_team || m.away_team } : m));
    }
  };

  // Run initial state loading
  useEffect(() => {
    fetchGates();
    fetchFoodStalls();
    fetchTransport();
    fetchIncidents();
    fetchMetrics();
    fetchMatches();
    // Default theme setting
    setTheme('dark');
  }, [fetchFoodStalls, fetchGates, fetchIncidents, fetchMatches, fetchMetrics, fetchTransport, userRole]);

  // Periodically refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      fetchIncidents();
      fetchMetrics();
      fetchGates();
      fetchMatches();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchGates, fetchIncidents, fetchMatches, fetchMetrics]);

  return (
    <AppContext.Provider value={{
      userRole,
      setUserRole,
      accessId,
      setAccessId,
      language,
      setLanguage,
      theme,
      setTheme,
      seatSection,
      setSeatSection,
      userGate,
      setUserGate,
      selectedMatchId,
      setSelectedMatchId,
      activeRoute,
      setActiveRoute,
      notifications,
      addNotification,
      clearNotifications,
      incidents,
      fetchIncidents,
      reportIncident,
      updateIncident,
      gates,
      fetchGates,
      foodStalls,
      fetchFoodStalls,
      routes,
      fetchTransport,
      metrics,
      fetchMetrics,
      matches,
      fetchMatches,
      updateGateState,
      updateFoodStallState,
      createFoodStallState,
      updateTransportRouteState,
      createTransportRouteState,
      updateMatchState
    }}>
      {children}
    </AppContext.Provider>
  );
};
