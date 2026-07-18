from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # admin, fan, volunteer, security, medical, organizer, transport
    created_at = Column(DateTime, default=datetime.utcnow)

class Stadium(Base):
    __tablename__ = "stadiums"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    city = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    
    matches = relationship("Match", back_populates="stadium")
    gates = relationship("Gate", back_populates="stadium")

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True, index=True)
    home_team = Column(String, nullable=False)
    away_team = Column(String, nullable=False)
    date_time = Column(DateTime, nullable=False)
    stadium_id = Column(Integer, ForeignKey("stadiums.id"))
    status = Column(String, default="scheduled") # scheduled, live, finished
    
    stadium = relationship("Stadium", back_populates="matches")

class Gate(Base):
    __tablename__ = "gates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    stadium_id = Column(Integer, ForeignKey("stadiums.id"))
    status = Column(String, default="open") # open, closed, congested
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    current_queue_time_mins = Column(Integer, default=5)
    
    stadium = relationship("Stadium", back_populates="gates")
    seats = relationship("Seat", back_populates="gate")

class Seat(Base):
    __tablename__ = "seats"
    id = Column(Integer, primary_key=True, index=True)
    section = Column(String, nullable=False)
    row = Column(String, nullable=False)
    number = Column(String, nullable=False)
    gate_id = Column(Integer, ForeignKey("gates.id"))
    category = Column(String, nullable=False) # VIP, Category 1, Category 2, Accessible
    
    gate = relationship("Gate", back_populates="seats")

class Parking(Base):
    __tablename__ = "parking"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    occupied = Column(Integer, default=0)
    price = Column(Float, default=20.0)
    status = Column(String, default="open") # open, full, closed

class FoodStall(Base):
    __tablename__ = "food_stalls"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False) # Beverage, Fast Food, Healthy, Halal, Vegan
    location = Column(String, nullable=False) # e.g. "Concourse A, Level 1"
    status = Column(String, default="open") # open, closed, busy
    current_wait_time_mins = Column(Integer, default=5)
    sustainability_score = Column(Float, default=4.5) # e.g. compostable packaging, locally sourced

class MedicalStation(Base):
    __tablename__ = "medical_stations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    status = Column(String, default="active") # active, closed
    active_staff_count = Column(Integer, default=2)
    has_aed = Column(Boolean, default=True)

class SecurityPost(Base):
    __tablename__ = "security_posts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    status = Column(String, default="active")
    active_officers_count = Column(Integer, default=4)

class Volunteer(Base):
    __tablename__ = "volunteers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="available") # available, busy, offline
    assigned_gate_id = Column(Integer, ForeignKey("gates.id"), nullable=True)
    current_task = Column(String, nullable=True)

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False) # crowd, medical, security, maintenance, general
    severity = Column(String, nullable=False) # low, medium, high, critical
    location = Column(String, nullable=False)
    status = Column(String, default="reported") # reported, active, resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    reported_by_role = Column(String, nullable=False)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    recipient_role = Column(String, nullable=False) # all, fan, volunteer, security, medical, organizer
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info") # emergency, info, task
    created_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)

class TransportRoute(Base):
    __tablename__ = "transport_routes"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # bus, train, shuttle, taxi
    destination = Column(String, nullable=False)
    status = Column(String, default="normal") # normal, delayed, suspended
    current_wait_time_mins = Column(Integer, default=10)

class CrowdReport(Base):
    __tablename__ = "crowd_reports"
    id = Column(Integer, primary_key=True, index=True)
    zone = Column(String, nullable=False) # e.g. "Zone A", "Gate 1 Concourse"
    crowd_level = Column(String, nullable=False) # low, medium, high, critical
    sensor_reading = Column(Float, nullable=False) # index from 0.0 to 1.0
    recorded_at = Column(DateTime, default=datetime.utcnow)

class AccessibilityLocation(Base):
    __tablename__ = "accessibility_locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # elevator, ramp, accessible_restroom, tactile_path
    location = Column(String, nullable=False)
    status = Column(String, default="operational") # operational, maintenance

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    user_role = Column(String, nullable=False)
    user_context = Column(String, nullable=False)
    recommendation_text = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    performed_by = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(String, nullable=True)
