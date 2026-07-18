from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

# User Schemas
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: str

class UserLogin(UserBase):
    password: str
    role: Optional[str] = None
    access_id: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    access_id: str

# Match Schemas
class MatchResponse(BaseModel):
    id: int
    home_team: str
    away_team: str
    date_time: datetime
    stadium_id: int
    status: str
    class Config:
        from_attributes = True

# Gate Schemas
class GateResponse(BaseModel):
    id: int
    name: str
    stadium_id: int
    status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    current_queue_time_mins: int
    class Config:
        from_attributes = True

# Incident Schemas
class IncidentBase(BaseModel):
    title: str
    description: str
    category: str  # crowd, medical, security, maintenance, general
    severity: str  # low, medium, high, critical
    location: str

class IncidentCreate(IncidentBase):
    reported_by_role: str

class IncidentUpdate(BaseModel):
    status: str
    resolved_at: Optional[datetime] = None

class IncidentResponse(IncidentBase):
    id: int
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    reported_by_role: str
    class Config:
        from_attributes = True

# Notification Schemas
class NotificationCreate(BaseModel):
    recipient_role: str
    title: str
    message: str
    type: str = "info"

class NotificationResponse(BaseModel):
    id: int
    recipient_role: str
    title: str
    message: str
    type: str
    created_at: datetime
    is_read: bool
    class Config:
        from_attributes = True

# Transport Route Schemas
class TransportRouteResponse(BaseModel):
    id: int
    name: str
    type: str
    destination: str
    status: str
    current_wait_time_mins: int
    class Config:
        from_attributes = True

# Food Stall Schemas
class FoodStallResponse(BaseModel):
    id: int
    name: str
    type: str
    location: str
    status: str
    current_wait_time_mins: int
    sustainability_score: float
    class Config:
        from_attributes = True

# Crowd Report Schemas
class CrowdReportResponse(BaseModel):
    id: int
    zone: str
    crowd_level: str
    sensor_reading: float
    recorded_at: datetime
    class Config:
        from_attributes = True

# Accessibility Location Schemas
class AccessibilityLocationResponse(BaseModel):
    id: int
    name: str
    type: str
    location: str
    status: str
    class Config:
        from_attributes = True

# Chat Schemas
class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    user_role: str = "fan"
    language: str = "en"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    seat_section: Optional[str] = None
    gate: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    intent: str
    suggested_actions: List[str] = []
    reasoning: Optional[str] = None

# Operations Dashboard Metrics
class OperationsMetrics(BaseModel):
    total_occupancy: int
    active_incidents: int
    active_volunteers: int
    avg_gate_queue_mins: int
    sustainability_score: float
    crowd_risk_level: str
    incident_stats: dict
    transport_status: dict

# Resource Update/Create Schemas
class GateUpdate(BaseModel):
    status: str
    current_queue_time_mins: int

class FoodStallUpdate(BaseModel):
    status: str
    current_wait_time_mins: int
    sustainability_score: float

class FoodStallCreate(BaseModel):
    name: str
    type: str
    location: str
    status: str = "open"
    current_wait_time_mins: int = 5
    sustainability_score: float = 4.5

class TransportRouteUpdate(BaseModel):
    status: str
    current_wait_time_mins: int

class TransportRouteCreate(BaseModel):
    name: str
    type: str
    destination: str
    status: str = "normal"
    current_wait_time_mins: int = 10

class MatchUpdate(BaseModel):
    status: str
    home_team: Optional[str] = None
    away_team: Optional[str] = None

