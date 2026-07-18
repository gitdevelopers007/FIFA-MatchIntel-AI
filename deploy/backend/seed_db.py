from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import sys

# Add project root to python path to avoid import errors
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.core.database import SessionLocal, engine, Base
from backend.app.models.models import (
    Stadium, Match, Gate, Seat, Parking, FoodStall, MedicalStation,
    SecurityPost, Volunteer, TransportRoute, AccessibilityLocation, CrowdReport
)

def seed():
    # Make sure tables are created
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        print("Seeding database...")
        
        # 1. Stadium
        stadium = Stadium(name="MetLife Stadium", city="East Rutherford, NJ", capacity=82500)
        db.add(stadium)
        db.commit()
        db.refresh(stadium)
        
        # 2. Gates
        gates = [
            Gate(name="A (Verizon Gate)", stadium_id=stadium.id, status="open", current_queue_time_mins=5, latitude=40.8135, longitude=-74.0745),
            Gate(name="B (Hampton Gate)", stadium_id=stadium.id, status="open", current_queue_time_mins=12, latitude=40.8122, longitude=-74.0730),
            Gate(name="C (Pepsi Gate)", stadium_id=stadium.id, status="congested", current_queue_time_mins=28, latitude=40.8115, longitude=-74.0750),
            Gate(name="D (SAP Gate)", stadium_id=stadium.id, status="open", current_queue_time_mins=8, latitude=40.8128, longitude=-74.0765),
            Gate(name="VIP & Media Entrance", stadium_id=stadium.id, status="open", current_queue_time_mins=2, latitude=40.8140, longitude=-74.0755),
        ]
        db.add_all(gates)
        db.commit()
        
        # 3. Matches
        matches = [
            Match(home_team="France", away_team="Spain", date_time=datetime.utcnow() - timedelta(days=3), stadium_id=stadium.id, status="finished"),
            Match(home_team="England", away_team="Argentina", date_time=datetime.utcnow() - timedelta(days=2), stadium_id=stadium.id, status="finished"),
            Match(home_team="France", away_team="England", date_time=datetime.utcnow() + timedelta(days=1), stadium_id=stadium.id, status="scheduled"),
            Match(home_team="Spain", away_team="Argentina", date_time=datetime.utcnow() + timedelta(days=2), stadium_id=stadium.id, status="scheduled"),
        ]
        db.add_all(matches)
        
        # 4. Parking
        parking_lots = [
            Parking(name="Lot A (Gold)", capacity=1200, occupied=980, price=45.0, status="open"),
            Parking(name="Lot B (Silver)", capacity=2500, occupied=2480, price=30.0, status="full"),
            Parking(name="Lot C (General)", capacity=4000, occupied=1500, price=20.0, status="open"),
            Parking(name="Lot D (VIP/Press)", capacity=500, occupied=420, price=75.0, status="open"),
        ]
        db.add_all(parking_lots)
        
        # 5. Food Stalls
        stalls = [
            FoodStall(name="Jersey Burgers", type="Fast Food", location="Concourse A, Sec 112", status="open", current_wait_time_mins=15, sustainability_score=4.2),
            FoodStall(name="Garden State Greens", type="Healthy / Vegan", location="Concourse B, Sec 124", status="open", current_wait_time_mins=4, sustainability_score=4.9),
            FoodStall(name="Liberty Tacos", type="Halal / Gluten-Free", location="Concourse C, Sec 208", status="open", current_wait_time_mins=18, sustainability_score=4.6),
            FoodStall(name="Big Apple Pretzels", type="Snacks", location="Upper Level, Sec 315", status="open", current_wait_time_mins=8, sustainability_score=4.1),
            FoodStall(name="Stadium Hydration Hub", type="Beverages", location="Concourse A, Sec 102", status="open", current_wait_time_mins=2, sustainability_score=5.0), # uses bio-cups
        ]
        db.add_all(stalls)
        
        # 6. Medical Stations
        meds = [
            MedicalStation(name="First Aid North", location="Level 1, Section 117", status="active", active_staff_count=3, has_aed=True),
            MedicalStation(name="First Aid South", location="Level 2, Section 230", status="active", active_staff_count=2, has_aed=True),
            MedicalStation(name="Main Medical Hub", location="Level 1, near Plaza Entry", status="active", active_staff_count=6, has_aed=True),
        ]
        db.add_all(meds)
        
        # 7. Security Posts
        security = [
            SecurityPost(name="Command Center East", location="Plaza Concourse East", status="active", active_officers_count=8),
            SecurityPost(name="Response Hub West", location="Plaza Concourse West", status="active", active_officers_count=6),
            SecurityPost(name="Field Level Post", location="Tunnel Tunnel 3", status="active", active_officers_count=4),
        ]
        db.add_all(security)
        
        # 8. Volunteers
        volunteers = [
            Volunteer(name="Sophia Hernandez", status="busy", assigned_gate_id=gates[0].id, current_task="Guiding international visitors at Verizon Gate"),
            Volunteer(name="Liam Chen", status="available", assigned_gate_id=gates[1].id, current_task="None"),
            Volunteer(name="Elena Rostova", status="busy", assigned_gate_id=gates[2].id, current_task="Directing wheelchair crowds at Gate C ramp"),
            Volunteer(name="Aisha Bello", status="available", assigned_gate_id=gates[3].id, current_task="None"),
        ]
        db.add_all(volunteers)
        
        # 9. Transport Routes
        routes = [
            TransportRoute(name="Express Train NYC (Secaucus Junction)", type="train", destination="New York Penn Station", status="normal", current_wait_time_mins=6),
            TransportRoute(name="Shuttle A (Meadowlands Parking)", type="shuttle", destination="Off-site Lot 1", status="normal", current_wait_time_mins=4),
            TransportRoute(name="Route 160 bus line", type="bus", destination="Port Authority Bus Terminal", status="delayed", current_wait_time_mins=22),
            TransportRoute(name="VIP Chauffeur Line", type="taxi", destination="Newark Airport (EWR)", status="normal", current_wait_time_mins=8),
        ]
        db.add_all(routes)
        
        # 10. Accessibility Locations
        acc_locs = [
            AccessibilityLocation(name="North Ramp (ADA compliant)", type="ramp", location="Gates A/B Plaza", status="operational"),
            AccessibilityLocation(name="Southwest Elevator", type="elevator", location="Concourse D, Sec 140", status="operational"),
            AccessibilityLocation(name="Accessible Restroom Suite A", type="accessible_restroom", location="Concourse A, Sec 105", status="operational"),
            AccessibilityLocation(name="Braille & Tactile Directory", type="tactile_path", location="Gate A Foyer", status="operational"),
        ]
        db.add_all(acc_locs)
        
        # 11. Crowd Sensor Reports
        crowd_reports = [
            CrowdReport(zone="Gate A Plaza", crowd_level="low", sensor_reading=0.22),
            CrowdReport(zone="Gate C Tunnel", crowd_level="critical", sensor_reading=0.88),
            CrowdReport(zone="Concourse Level 1 East", crowd_level="medium", sensor_reading=0.45),
            CrowdReport(zone="Concourse Level 1 West", crowd_level="high", sensor_reading=0.68),
            CrowdReport(zone="Concourse Level 2 Center", crowd_level="low", sensor_reading=0.15),
        ]
        db.add_all(crowd_reports)
        
        db.commit()
        print("Database seeded successfully with realistic FIFA World Cup data!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
