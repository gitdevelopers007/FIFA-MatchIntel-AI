import unittest
from datetime import UTC, datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.core.database import Base
from backend.app.models.models import (
    AccessibilityLocation,
    FoodStall,
    Gate,
    Incident,
    MedicalStation,
    Stadium,
    TransportRoute,
)
from backend.app.schemas.schemas import ChatRequest
from backend.app.services.ai_service import AIService


class AIServiceFallbackTests(unittest.TestCase):
    def setUp(self):
        engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
        )
        Base.metadata.create_all(bind=engine)
        session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        self.db = session_factory()

        self.db.add(Stadium(id=1, name="MetLife Stadium", city="East Rutherford", capacity=82500))
        self.db.add_all(
            [
                Gate(name="A", stadium_id=1, status="open", current_queue_time_mins=4),
                Gate(name="C", stadium_id=1, status="congested", current_queue_time_mins=28),
                FoodStall(
                    name="Garden State Greens",
                    type="Vegan",
                    location="Section 124",
                    status="open",
                    current_wait_time_mins=3,
                    sustainability_score=4.9,
                ),
                MedicalStation(
                    name="North Clinic",
                    location="Section 117",
                    status="active",
                    active_staff_count=4,
                    has_aed=True,
                ),
                TransportRoute(
                    name="160",
                    type="bus",
                    destination="Port Authority",
                    status="delayed",
                    current_wait_time_mins=22,
                ),
                TransportRoute(
                    name="Express Rail",
                    type="train",
                    destination="New York Penn",
                    status="normal",
                    current_wait_time_mins=6,
                ),
                AccessibilityLocation(
                    name="North Elevator",
                    type="elevator",
                    location="Section 118",
                    status="operational",
                ),
                Incident(
                    title="Gate C crowding",
                    description="Queue pressure near turnstiles",
                    category="crowd",
                    severity="medium",
                    location="Gate C",
                    status="active",
                    created_at=datetime.now(UTC),
                    reported_by_role="security",
                ),
            ]
        )
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_emergency_response_uses_medical_station_context(self):
        request = ChatRequest(message="medical emergency near gate c", user_role="fan")

        response = AIService.generate_response(self.db, request)

        self.assertEqual(response.intent, "emergency")
        self.assertIn("North Clinic", response.response)
        self.assertIn("Medical Dispatch Team", response.response)

    def test_transport_response_recommends_normal_alternative(self):
        request = ChatRequest(message="is the bus delayed?", user_role="fan")

        response = AIService.generate_response(self.db, request)

        self.assertEqual(response.intent, "transport")
        self.assertIn("160", response.response)
        self.assertIn("Express Rail", response.response)

    def test_food_response_prioritizes_sustainable_fast_stall(self):
        request = ChatRequest(message="show vegan food", user_role="fan")

        response = AIService.generate_response(self.db, request)

        self.assertEqual(response.intent, "food")
        self.assertIn("Garden State Greens", response.response)
        self.assertGreaterEqual(len(response.suggested_actions), 2)

    def test_transport_response_handles_missing_routes(self):
        self.db.query(TransportRoute).delete()
        self.db.commit()
        request = ChatRequest(message="show train schedule", user_role="fan")

        response = AIService.generate_response(self.db, request)

        self.assertEqual(response.intent, "transport")
        self.assertIn("No live transport routes", response.response)


if __name__ == "__main__":
    unittest.main()
