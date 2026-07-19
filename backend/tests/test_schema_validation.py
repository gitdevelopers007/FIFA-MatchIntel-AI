import unittest

from pydantic import ValidationError

from backend.app.schemas.schemas import (
    ChatRequest,
    FoodStallUpdate,
    GateUpdate,
    IncidentCreate,
)


class SchemaValidationTests(unittest.TestCase):
    def test_chat_rejects_empty_message(self):
        with self.assertRaises(ValidationError):
            ChatRequest(message="")

    def test_gate_wait_time_is_bounded(self):
        with self.assertRaises(ValidationError):
            GateUpdate(status="open", current_queue_time_mins=181)

    def test_food_sustainability_score_is_bounded(self):
        with self.assertRaises(ValidationError):
            FoodStallUpdate(
                status="open",
                current_wait_time_mins=10,
                sustainability_score=6,
            )

    def test_incident_rejects_unknown_category(self):
        with self.assertRaises(ValidationError):
            IncidentCreate(
                title="Broken escalator",
                description="Escalator stopped near concourse",
                category="unknown",
                severity="medium",
                location="Section 112",
                reported_by_role="volunteer",
            )


if __name__ == "__main__":
    unittest.main()
