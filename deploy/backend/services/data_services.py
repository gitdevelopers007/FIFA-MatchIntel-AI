from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.models import (
    Gate, FoodStall, MedicalStation, SecurityPost, Volunteer,
    Incident, TransportRoute, CrowdReport, AccessibilityLocation, Match, Seat, Stadium
)
from backend.app.schemas.schemas import IncidentCreate, OperationsMetrics
from datetime import datetime

class DataService:
    @staticmethod
    def get_stadium_gates(db: Session, stadium_id: int = 1):
        return db.query(Gate).filter(Gate.stadium_id == stadium_id).all()
        
    @staticmethod
    def get_food_stalls(db: Session):
        return db.query(FoodStall).all()

    @staticmethod
    def get_medical_stations(db: Session):
        return db.query(MedicalStation).all()
        
    @staticmethod
    def get_security_posts(db: Session):
        return db.query(SecurityPost).all()
        
    @staticmethod
    def get_transport_routes(db: Session):
        return db.query(TransportRoute).all()

    @staticmethod
    def get_active_incidents(db: Session):
        return db.query(Incident).filter(Incident.status != "resolved").all()

    @staticmethod
    def get_all_incidents(db: Session):
        return db.query(Incident).order_by(Incident.created_at.desc()).all()

    @staticmethod
    def create_incident(db: Session, incident_in: IncidentCreate):
        db_incident = Incident(
            title=incident_in.title,
            description=incident_in.description,
            category=incident_in.category,
            severity=incident_in.severity,
            location=incident_in.location,
            reported_by_role=incident_in.reported_by_role,
            status="reported",
            created_at=datetime.utcnow()
        )
        db.add(db_incident)
        db.commit()
        db.refresh(db_incident)
        return db_incident

    @staticmethod
    def update_incident_status(db: Session, incident_id: int, status: str):
        db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if db_incident:
            db_incident.status = status
            if status == "resolved":
                db_incident.resolved_at = datetime.utcnow()
            db.commit()
            db.refresh(db_incident)
        return db_incident

    @staticmethod
    def get_volunteers(db: Session):
        return db.query(Volunteer).all()

    @staticmethod
    def update_volunteer_task(db: Session, volunteer_id: int, task: str, status: str = "busy"):
        v = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
        if v:
            v.current_task = task
            v.status = status
            db.commit()
            db.refresh(v)
        return v

    @staticmethod
    def get_accessibility_locations(db: Session):
        return db.query(AccessibilityLocation).all()

    @staticmethod
    def get_matches(db: Session):
        return db.query(Match).all()

    @staticmethod
    def get_stadium_context_string(db: Session) -> str:
        """
        Formats a comprehensive, structured text context from the local DB
        for the AI prompt injection.
        """
        gates = db.query(Gate).all()
        stalls = db.query(FoodStall).all()
        meds = db.query(MedicalStation).all()
        incidents = db.query(Incident).filter(Incident.status != "resolved").all()
        routes = db.query(TransportRoute).all()
        acc = db.query(AccessibilityLocation).all()

        context_lines = []
        context_lines.append("STADIUM CURRENT CONDITIONS (FACTS):")
        
        context_lines.append("\nGates Wait Times and Status:")
        for g in gates:
            context_lines.append(f"- Gate {g.name}: Status: {g.status}, Wait time: {g.current_queue_time_mins} mins")

        context_lines.append("\nFood & Beverage Stands:")
        for s in stalls:
            context_lines.append(f"- {s.name} at {s.location}: Status: {s.status}, Type: {s.type}, Wait time: {s.current_wait_time_mins} mins, Sustainability: {s.sustainability_score}/5.0")

        context_lines.append("\nMedical Facilities:")
        for m in meds:
            context_lines.append(f"- Station {m.name} at {m.location}: Status: {m.status}, AED Available: {m.has_aed}, Staff: {m.active_staff_count}")

        context_lines.append("\nActive Incidents:")
        if not incidents:
            context_lines.append("- No active incidents.")
        for i in incidents:
            context_lines.append(f"- [{i.severity.upper()}] {i.title} at {i.location} (Category: {i.category}, Status: {i.status})")

        context_lines.append("\nTransportation Routes:")
        for r in routes:
            context_lines.append(f"- Route {r.name} ({r.type} to {r.destination}): Status: {r.status}, Next boarding: {r.current_wait_time_mins} mins wait")

        context_lines.append("\nAccessibility Ramps & Elevators:")
        for a in acc:
            context_lines.append(f"- {a.name} at {a.location}: Status: {a.status}, Type: {a.type}")

        return "\n".join(context_lines)

    @staticmethod
    def get_operations_metrics(db: Session) -> OperationsMetrics:
        # Sum gate wait times as proxy metrics
        gates = db.query(Gate).all()
        avg_queue = int(sum(g.current_queue_time_mins for g in gates) / len(gates)) if gates else 0
        
        active_incidents = db.query(Incident).filter(Incident.status != "resolved").count()
        active_volunteers = db.query(Volunteer).filter(Volunteer.status == "busy").count()
        
        # Incident category breakdown
        incidents = db.query(Incident).all()
        incident_stats = {"crowd": 0, "medical": 0, "security": 0, "maintenance": 0, "general": 0}
        for inc in incidents:
            if inc.category in incident_stats:
                incident_stats[inc.category] += 1
                
        # Transport status breakdown
        routes = db.query(TransportRoute).all()
        transport_status = {"normal": 0, "delayed": 0, "suspended": 0}
        for r in routes:
            if r.status in transport_status:
                transport_status[r.status] += 1

        # Sustainability score
        stalls = db.query(FoodStall).all()
        avg_sust = sum(s.sustainability_score for s in stalls) / len(stalls) if stalls else 4.5

        # Crowd risk level assessment
        reports = db.query(CrowdReport).order_by(CrowdReport.recorded_at.desc()).limit(5).all()
        max_density = max((r.sensor_reading for r in reports), default=0.4)
        if max_density > 0.8:
            risk = "critical"
        elif max_density > 0.6:
            risk = "high"
        elif max_density > 0.3:
            risk = "medium"
        else:
            risk = "low"

        return OperationsMetrics(
            total_occupancy=68450, # Mock live occupancy
            active_incidents=active_incidents,
            active_volunteers=active_volunteers,
            avg_gate_queue_mins=avg_queue,
            sustainability_score=round(avg_sust, 2),
            crowd_risk_level=risk,
            incident_stats=incident_stats,
            transport_status=transport_status
        )

    @staticmethod
    def update_gate(db: Session, gate_id: int, status: str, queue_time: int):
        gate = db.query(Gate).filter(Gate.id == gate_id).first()
        if gate:
            gate.status = status
            gate.current_queue_time_mins = queue_time
            db.commit()
            db.refresh(gate)
        return gate

    @staticmethod
    def update_food_stall(db: Session, stall_id: int, status: str, wait_time: int, sustainability: float):
        stall = db.query(FoodStall).filter(FoodStall.id == stall_id).first()
        if stall:
            stall.status = status
            stall.current_wait_time_mins = wait_time
            stall.sustainability_score = sustainability
            db.commit()
            db.refresh(stall)
        return stall

    @staticmethod
    def create_food_stall(db: Session, name: str, stall_type: str, location: str, status: str, wait_time: int, sustainability: float):
        stall = FoodStall(
            name=name,
            type=stall_type,
            location=location,
            status=status,
            current_wait_time_mins=wait_time,
            sustainability_score=sustainability
        )
        db.add(stall)
        db.commit()
        db.refresh(stall)
        return stall

    @staticmethod
    def update_transport_route(db: Session, route_id: int, status: str, wait_time: int):
        route = db.query(TransportRoute).filter(TransportRoute.id == route_id).first()
        if route:
            route.status = status
            route.current_wait_time_mins = wait_time
            db.commit()
            db.refresh(route)
        return route

    @staticmethod
    def create_transport_route(db: Session, name: str, route_type: str, destination: str, status: str, wait_time: int):
        route = TransportRoute(
            name=name,
            type=route_type,
            destination=destination,
            status=status,
            current_wait_time_mins=wait_time
        )
        db.add(route)
        db.commit()
        db.refresh(route)
        return route

    @staticmethod
    def update_match(db: Session, match_id: int, status: str, home_team: str = None, away_team: str = None):
        match = db.query(Match).filter(Match.id == match_id).first()
        if match:
            match.status = status
            if home_team:
                match.home_team = home_team
            if away_team:
                match.away_team = away_team
            db.commit()
            db.refresh(match)
        return match

