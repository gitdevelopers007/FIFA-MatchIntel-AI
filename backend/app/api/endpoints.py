from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import hashlib
import logging
from backend.app.core.database import get_db
from backend.app.schemas import schemas
from backend.app.services.data_services import DataService
from backend.app.services.ai_service import AIService

logger = logging.getLogger(__name__)
router = APIRouter()


def require_session(authorization: str = Header(default="")) -> str:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="A bearer session token is required.",
        )
    if not (token.startswith("session-") or token == "local-session-fallback"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token.",
        )
    return token

# ----------------- AUTH ENDPOINTS -----------------
@router.post("/auth/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin):
    try:
        # Respect explicit role selection, fallback to username substring match
        username = login_data.username.lower()
        role = login_data.role
        access_id = login_data.access_id
        if not role:
            role = "fan"
            if "volunteer" in username:
                role = "volunteer"
            elif "security" in username:
                role = "security"
            elif "medical" in username:
                role = "medical"
            elif "organizer" in username or "ops" in username:
                role = "organizer"
            elif "transport" in username:
                role = "transport"
        access_id = access_id or f"ACCESS-{role.upper()}"
        token_seed = f"{username}:{role}:{access_id}"
        access_token = hashlib.sha256(token_seed.encode("utf-8")).hexdigest()

        logger.info(f"User {username} logged in with role: {role}, ID: {access_id}")
        return {
            "access_token": f"session-{access_token}",
            "token_type": "bearer",
            "role": role,
            "username": login_data.username,
            "access_id": access_id
        }
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication pipeline error"
        )

# ----------------- AI CHAT -----------------
@router.post("/chat", response_model=schemas.ChatResponse)
def chat_completion(
    request: schemas.ChatRequest,
    db: Session = Depends(get_db),
    _: str = Depends(require_session),
):
    try:
        response = AIService.generate_response(db, request)
        return response
    except Exception as e:
        logger.error(f"AI response generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI Service is currently unavailable. Please try again later."
        )

# ----------------- STADIUM DATA -----------------
@router.get("/matches", response_model=List[schemas.MatchResponse])
def get_matches(db: Session = Depends(get_db)):
    try:
        return DataService.get_matches(db)
    except Exception as e:
        logger.error(f"Failed to fetch matches: {str(e)}")
        raise HTTPException(status_code=500, detail="Database read failure")

@router.get("/gates", response_model=List[schemas.GateResponse])
def get_gates(db: Session = Depends(get_db)):
    try:
        return DataService.get_stadium_gates(db)
    except Exception as e:
        logger.error(f"Failed to fetch gates: {str(e)}")
        raise HTTPException(status_code=500, detail="Database read failure")

@router.get("/food-stalls", response_model=List[schemas.FoodStallResponse])
def get_food_stalls(db: Session = Depends(get_db)):
    try:
        return DataService.get_food_stalls(db)
    except Exception as e:
        logger.error(f"Failed to fetch food stalls: {str(e)}")
        raise HTTPException(status_code=500, detail="Database read failure")

@router.get("/transport", response_model=List[schemas.TransportRouteResponse])
def get_transport(db: Session = Depends(get_db)):
    try:
        return DataService.get_transport_routes(db)
    except Exception as e:
        logger.error(f"Failed to fetch transport routes: {str(e)}")
        raise HTTPException(status_code=500, detail="Database read failure")

@router.get("/accessibility", response_model=List[schemas.AccessibilityLocationResponse])
def get_accessibility(db: Session = Depends(get_db)):
    try:
        return DataService.get_accessibility_locations(db)
    except Exception as e:
        logger.error(f"Failed to fetch accessibility routes: {str(e)}")
        raise HTTPException(status_code=500, detail="Database read failure")

# ----------------- INCIDENT REPORTING -----------------
@router.get("/incidents", response_model=List[schemas.IncidentResponse])
def get_incidents(db: Session = Depends(get_db)):
    try:
        return DataService.get_all_incidents(db)
    except Exception as e:
        logger.error(f"Failed to fetch incidents: {str(e)}")
        raise HTTPException(status_code=500, detail="Database read failure")

@router.post("/incidents", response_model=schemas.IncidentResponse)
def report_incident(
    incident: schemas.IncidentCreate,
    db: Session = Depends(get_db),
    _: str = Depends(require_session),
):
    try:
        new_inc = DataService.create_incident(db, incident)
        logger.info(f"New incident logged: {new_inc.title} at {new_inc.location}")
        return new_inc
    except Exception as e:
        logger.error(f"Failed to create incident: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to log incident reports")

@router.patch("/incidents/{incident_id}", response_model=schemas.IncidentResponse)
def update_incident_status(
    incident_id: int,
    update: schemas.IncidentUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(require_session),
):
    try:
        updated = DataService.update_incident_status(db, incident_id, update.status)
        if not updated:
            raise HTTPException(status_code=404, detail="Incident not found")
        logger.info(f"Incident {incident_id} status updated to {update.status}")
        return updated
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to update incident: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal update error")

# ----------------- OPERATIONS & ANALYTICS -----------------
@router.get("/analytics/metrics", response_model=schemas.OperationsMetrics)
def get_operations_metrics(db: Session = Depends(get_db)):
    try:
        return DataService.get_operations_metrics(db)
    except Exception as e:
        logger.error(f"Failed to calculate analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Analytics aggregator failure")

# ----------------- VOLUNTEER WORKLISTS -----------------
@router.get("/volunteers")
def get_volunteers(db: Session = Depends(get_db)):
    try:
        return DataService.get_volunteers(db)
    except Exception as e:
        logger.error(f"Failed to load volunteers: {str(e)}")
        raise HTTPException(status_code=500, detail="Database read failure")

@router.patch("/volunteers/{volunteer_id}")
def update_volunteer_task(
    volunteer_id: int,
    task: str,
    status: str = "busy",
    db: Session = Depends(get_db),
    _: str = Depends(require_session),
):
    try:
        updated = DataService.update_volunteer_task(db, volunteer_id, task, status)
        if not updated:
            raise HTTPException(status_code=404, detail="Volunteer record not found")
        return updated
    except Exception as e:
        logger.error(f"Failed to update volunteer: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal update error")

# ----------------- LIVE CONFIG / MUTATION ENDPOINTS -----------------
@router.put("/gates/{gate_id}", response_model=schemas.GateResponse)
def update_gate(
    gate_id: int,
    update: schemas.GateUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(require_session),
):
    try:
        res = DataService.update_gate(db, gate_id, update.status, update.current_queue_time_mins)
        if not res:
            raise HTTPException(status_code=404, detail="Gate not found")
        return res
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update gate {gate_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Database write failure")

@router.put("/food-stalls/{stall_id}", response_model=schemas.FoodStallResponse)
def update_food_stall(
    stall_id: int,
    update: schemas.FoodStallUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(require_session),
):
    try:
        res = DataService.update_food_stall(db, stall_id, update.status, update.current_wait_time_mins, update.sustainability_score)
        if not res:
            raise HTTPException(status_code=404, detail="Concession stall not found")
        return res
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update food stall {stall_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Database write failure")

@router.post("/food-stalls", response_model=schemas.FoodStallResponse)
def create_food_stall(
    stall: schemas.FoodStallCreate,
    db: Session = Depends(get_db),
    _: str = Depends(require_session),
):
    try:
        return DataService.create_food_stall(
            db, stall.name, stall.type, stall.location, stall.status, stall.current_wait_time_mins, stall.sustainability_score
        )
    except Exception as e:
        logger.error(f"Failed to create food stall: {str(e)}")
        raise HTTPException(status_code=500, detail="Database write failure")

@router.put("/transport/{route_id}", response_model=schemas.TransportRouteResponse)
def update_transport_route(
    route_id: int,
    update: schemas.TransportRouteUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(require_session),
):
    try:
        res = DataService.update_transport_route(db, route_id, update.status, update.current_wait_time_mins)
        if not res:
            raise HTTPException(status_code=404, detail="Transit route not found")
        return res
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update transit route {route_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Database write failure")

@router.post("/transport", response_model=schemas.TransportRouteResponse)
def create_transport_route(
    route: schemas.TransportRouteCreate,
    db: Session = Depends(get_db),
    _: str = Depends(require_session),
):
    try:
        return DataService.create_transport_route(
            db, route.name, route.type, route.destination, route.status, route.current_wait_time_mins
        )
    except Exception as e:
        logger.error(f"Failed to create transport route: {str(e)}")
        raise HTTPException(status_code=500, detail="Database write failure")

@router.put("/matches/{match_id}", response_model=schemas.MatchResponse)
def update_match(
    match_id: int,
    update: schemas.MatchUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(require_session),
):
    try:
        res = DataService.update_match(db, match_id, update.status, update.home_team, update.away_team)
        if not res:
            raise HTTPException(status_code=404, detail="Match details not found")
        return res
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update match {match_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Database write failure")
