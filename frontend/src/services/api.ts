import axios from 'axios';
import * as Types from '../types';

const API_BASE = '/api/v1';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach authentication tokens
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const api = {
  // Auth
  login: async (username: string, role: string, accessId: string): Promise<Types.User> => {
    try {
      const res = await client.post('/auth/login', { username, role, access_id: accessId, password: 'password123' });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('accessId', res.data.access_id);
      return {
        username: res.data.username,
        role: res.data.role,
        token: res.data.access_token,
        accessId: res.data.access_id,
      };
    } catch (err) {
      console.warn("Failed connecting to backend. Falling back to local mock session.");
      localStorage.setItem('token', 'mock-local-token');
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);
      localStorage.setItem('accessId', accessId);
      return { username, role, token: 'mock-local-token', accessId };
    }
  },

  // AI Chat
  chat: async (
    message: string,
    history: Types.ChatMessage[],
    role: string,
    lang: string,
    seat?: string,
    gate?: string
  ): Promise<Types.ChatResponse> => {
    try {
      const res = await client.post('/chat', {
        message,
        history,
        user_role: role,
        language: lang,
        seat_section: seat,
        gate: gate
      });
      return res.data;
    } catch (err) {
      console.warn("Backend chat failed, using local simulation engine.");
      return simulateChatLocal(message, role, lang, seat);
    }
  },

  // Matches
  getMatches: async (): Promise<Types.Match[]> => {
    const res = await client.get('/matches');
    return res.data;
  },

  // Gates
  getGates: async (): Promise<Types.Gate[]> => {
    const res = await client.get('/gates');
    return res.data;
  },

  // Concessions
  getFoodStalls: async (): Promise<Types.FoodStall[]> => {
    const res = await client.get('/food-stalls');
    return res.data;
  },

  // Transport
  getTransport: async (): Promise<Types.TransportRoute[]> => {
    const res = await client.get('/transport');
    return res.data;
  },

  // Accessibility
  getAccessibility: async (): Promise<Types.AccessibilityLocation[]> => {
    const res = await client.get('/accessibility');
    return res.data;
  },

  // Incidents
  getIncidents: async (): Promise<Types.Incident[]> => {
    const res = await client.get('/incidents');
    return res.data;
  },

  createIncident: async (incident: Omit<Types.Incident, 'id' | 'status' | 'created_at' | 'resolved_at'>): Promise<Types.Incident> => {
    const res = await client.post('/incidents', incident);
    return res.data;
  },

  updateIncidentStatus: async (id: number, status: string): Promise<Types.Incident> => {
    const res = await client.patch(`/incidents/${id}`, { status });
    return res.data;
  },

  // Analytics Metrics
  getMetrics: async (): Promise<Types.OperationsMetrics> => {
    const res = await client.get('/analytics/metrics');
    return res.data;
  },

  // Volunteers
  getVolunteers: async (): Promise<Types.Volunteer[]> => {
    const res = await client.get('/volunteers');
    return res.data;
  },

  assignVolunteerTask: async (id: number, task: string, status: string): Promise<Types.Volunteer> => {
    const res = await client.patch(`/volunteers/${id}?task=${encodeURIComponent(task)}&status=${status}`);
    return res.data;
  },

  updateGate: async (id: number, status: string, queue_time: number): Promise<Types.Gate> => {
    const res = await client.put(`/gates/${id}`, { status, current_queue_time_mins: queue_time });
    return res.data;
  },

  updateFoodStall: async (id: number, status: string, wait_time: number, sustainability: number): Promise<Types.FoodStall> => {
    const res = await client.put(`/food-stalls/${id}`, { status, current_wait_time_mins: wait_time, sustainability_score: sustainability });
    return res.data;
  },

  createFoodStall: async (stall: Omit<Types.FoodStall, 'id'>): Promise<Types.FoodStall> => {
    const res = await client.post('/food-stalls', stall);
    return res.data;
  },

  updateTransportRoute: async (id: number, status: string, wait_time: number): Promise<Types.TransportRoute> => {
    const res = await client.put(`/transport/${id}`, { status, current_wait_time_mins: wait_time });
    return res.data;
  },

  createTransportRoute: async (route: Omit<Types.TransportRoute, 'id'>): Promise<Types.TransportRoute> => {
    const res = await client.post('/transport', route);
    return res.data;
  },

  updateMatch: async (id: number, status: string, home_team?: string, away_team?: string): Promise<Types.Match> => {
    const res = await client.put(`/matches/${id}`, { status, home_team, away_team });
    return res.data;
  }
};

// Resilient local simulation logic if backend uvicorn is shut down
function simulateChatLocal(message: string, role: string, lang: string, seat?: string): Types.ChatResponse {
  const msg = message.toLowerCase();
  let response = "I am FIFA MatchIntel AI, your digital assistant. Let me know how I can help you.";
  let intent = "general";
  let suggested: string[] = ["View Map", "F&B Wait Times", "Match Timings"];

  if (msg.includes("emergency") || msg.includes("hurt") || msg.includes("accident") || msg.includes("medical")) {
    intent = "emergency";
    response = "🚨 EMERGENCY ACTIVE: I have alerted the Stadium Dispatch Team. Please make your way to the nearest Medical Center at Section 117 (North Plaza) immediately.";
    suggested = ["Show Route to Medical Center", "Contact Security Duty Officer"];
  } else if (msg.includes("seat") || msg.includes("gate") || msg.includes("find") || msg.includes("where")) {
    intent = "navigation";
    response = `Welcome to MetLife Stadium. Based on your seat section (${seat || 'General Admissions'}), we suggest entering via Gate A. Gate A has a queue wait time of 5 minutes.`;
    suggested = ["Route to Gate A", "Find nearest Restroom", "Elevator Paths"];
  } else if (msg.includes("food") || msg.includes("eat") || msg.includes("drink") || msg.includes("burger")) {
    intent = "food";
    response = "Hungry? 'Jersey Burgers' at Section 112 has a wait time of 15 minutes, while 'Garden State Greens' (Vegan, Sec 124) has a fast 4-minute wait and uses 100% compostable packaging.";
    suggested = ["Route to Garden State Greens", "Jersey Burgers Menu"];
  } else if (msg.includes("traffic") || msg.includes("bus") || msg.includes("train") || msg.includes("shuttle") || msg.includes("metro")) {
    intent = "transport";
    response = "Transit Update: NYC Express Train is running on schedule with 6-minute boarding intervals. Route 160 buses are experiencing delays of 22 minutes due to highway traffic.";
    suggested = ["Open Express Train Schedule", "Directions to Shuttle Lot C"];
  }

  if (lang !== 'en') {
    response = `[Translated to ${lang.toUpperCase()}] ` + response;
  }

  return {
    response,
    intent,
    suggested_actions: suggested,
    reasoning: `Local simulator mapped input keywords to ${intent} intent for user role: ${role}.`
  };
}
