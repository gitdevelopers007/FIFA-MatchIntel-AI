export interface User {
  username: string;
  role: string;
  token?: string;
  accessId?: string;
}

export interface Match {
  id: number;
  home_team: string;
  away_team: string;
  date_time: string;
  stadium_id: number;
  status: string;
}

export interface Gate {
  id: number;
  name: string;
  stadium_id: number;
  status: 'open' | 'closed' | 'congested';
  latitude: number | null;
  longitude: number | null;
  current_queue_time_mins: number;
}

export interface FoodStall {
  id: number;
  name: string;
  type: string;
  location: string;
  status: 'open' | 'closed' | 'busy';
  current_wait_time_mins: number;
  sustainability_score: number;
}

export interface MedicalStation {
  id: number;
  name: string;
  location: string;
  status: string;
  active_staff_count: number;
  has_aed: boolean;
}

export interface SecurityPost {
  id: number;
  name: string;
  location: string;
  status: string;
  active_officers_count: number;
}

export interface Volunteer {
  id: number;
  name: string;
  status: string;
  assigned_gate_id: number | null;
  current_task: string | null;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  category: 'crowd' | 'medical' | 'security' | 'maintenance' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  status: 'reported' | 'active' | 'resolved';
  created_at: string;
  resolved_at: string | null;
  reported_by_role: string;
}

export interface Notification {
  id: number;
  recipient_role: string;
  title: string;
  message: string;
  type: 'emergency' | 'info' | 'task';
  created_at: string;
  is_read: boolean;
}

export interface TransportRoute {
  id: number;
  name: string;
  type: 'bus' | 'train' | 'shuttle' | 'taxi';
  destination: string;
  status: 'normal' | 'delayed' | 'suspended';
  current_wait_time_mins: number;
}

export interface AccessibilityLocation {
  id: number;
  name: string;
  type: 'elevator' | 'ramp' | 'accessible_restroom' | 'tactile_path';
  location: string;
  status: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  response: string;
  intent: string;
  suggested_actions: string[];
  reasoning?: string;
}

export interface OperationsMetrics {
  total_occupancy: number;
  active_incidents: number;
  active_volunteers: number;
  avg_gate_queue_mins: number;
  sustainability_score: number;
  crowd_risk_level: 'low' | 'medium' | 'high' | 'critical';
  incident_stats: Record<string, number>;
  transport_status: Record<string, number>;
}
