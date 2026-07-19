from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, List, Literal, Optional

UserRole = Literal["fan", "volunteer", "security", "medical", "organizer", "transport"]
IncidentCategory = Literal["crowd", "medical", "security", "maintenance", "general"]
IncidentSeverity = Literal["low", "medium", "high", "critical"]
IncidentStatus = Literal["reported", "active", "resolved"]
GateStatus = Literal["open", "closed", "congested"]
FoodStallStatus = Literal["open", "closed", "busy"]
TransportStatus = Literal["normal", "delayed", "suspended"]
MatchStatus = Literal["scheduled", "live", "finished"]
ChatIntent = Literal["emergency", "navigation", "transport", "food", "crowd", "operations", "general"]
ChatRole = Literal["user", "assistant", "system"]

# User Schemas
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: UserRole

class UserLogin(UserBase):
    password: str
    role: Optional[UserRole] = None
    access_id: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: UserRole
    username: str
    access_id: str

# Match Schemas
class MatchResponse(BaseModel):
    id: int
    home_team: str
    away_team: str
    date_time: datetime
    stadium_id: int
    status: MatchStatus
    class Config:
        from_attributes = True

# Gate Schemas
class GateResponse(BaseModel):
    id: int
    name: str
    stadium_id: int
    status: GateStatus
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    current_queue_time_mins: int
    class Config:
        from_attributes = True

# Incident Schemas
class IncidentBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=120)
    description: str = Field(..., min_length=3, max_length=1000)
    category: IncidentCategory
    severity: IncidentSeverity
    location: str = Field(..., min_length=2, max_length=120)

class IncidentCreate(IncidentBase):
    reported_by_role: UserRole

class IncidentUpdate(BaseModel):
    status: IncidentStatus
    resolved_at: Optional[datetime] = None

class IncidentResponse(IncidentBase):
    id: int
    status: IncidentStatus
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
    status: TransportStatus
    current_wait_time_mins: int = Field(..., ge=0, le=180)
    class Config:
        from_attributes = True

# Food Stall Schemas
class FoodStallResponse(BaseModel):
    id: int
    name: str
    type: str
    location: str
    status: FoodStallStatus
    current_wait_time_mins: int = Field(..., ge=0, le=180)
    sustainability_score: float = Field(..., ge=0, le=5)
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
    role: ChatRole
    content: str = Field(..., min_length=1, max_length=2000)

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[ChatMessage] = Field(default_factory=list)
    user_role: UserRole = "fan"
    language: str = "en"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    seat_section: Optional[str] = None
    gate: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    intent: ChatIntent
    suggested_actions: List[str] = Field(default_factory=list)
    reasoning: Optional[str] = None

# Operations Dashboard Metrics
class OperationsMetrics(BaseModel):
    total_occupancy: int
    active_incidents: int
    active_volunteers: int
    avg_gate_queue_mins: int
    sustainability_score: float
    crowd_risk_level: str
    incident_stats: Dict[str, int]
    transport_status: Dict[str, int]

# Resource Update/Create Schemas
class GateUpdate(BaseModel):
    status: GateStatus
    current_queue_time_mins: int = Field(..., ge=0, le=180)

class FoodStallUpdate(BaseModel):
    status: FoodStallStatus
    current_wait_time_mins: int = Field(..., ge=0, le=180)
    sustainability_score: float = Field(..., ge=0, le=5)

class FoodStallCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    type: str = Field(..., min_length=2, max_length=60)
    location: str = Field(..., min_length=2, max_length=120)
    status: FoodStallStatus = "open"
    current_wait_time_mins: int = Field(default=5, ge=0, le=180)
    sustainability_score: float = Field(default=4.5, ge=0, le=5)

class TransportRouteUpdate(BaseModel):
    status: TransportStatus
    current_wait_time_mins: int = Field(..., ge=0, le=180)

class TransportRouteCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=40)
    type: str = Field(..., min_length=2, max_length=40)
    destination: str = Field(..., min_length=2, max_length=120)
    status: TransportStatus = "normal"
    current_wait_time_mins: int = Field(default=10, ge=0, le=180)

class MatchUpdate(BaseModel):
    status: MatchStatus
    home_team: Optional[str] = None
    away_team: Optional[str] = None
