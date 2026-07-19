import unittest

from backend.app.schemas.schemas import UserLogin
from fastapi import HTTPException

from backend.app.api.endpoints import login, require_session


class AuthEndpointTests(unittest.TestCase):
    def test_login_returns_session_token_without_mock_marker(self):
        response = login(
            UserLogin(
                username="SecurityOfficer_A",
                password="",
                role="security",
                access_id="SEC-4512",
            )
        )

        self.assertEqual(response["role"], "security")
        self.assertEqual(response["access_id"], "SEC-4512")
        self.assertTrue(response["access_token"].startswith("session-"))
        self.assertNotIn("mock", response["access_token"].lower())

    def test_login_infers_role_when_role_is_missing(self):
        response = login(
            UserLogin(
                username="volunteer_ops",
                password="",
                access_id="VOL-7704",
            )
        )

        self.assertEqual(response["role"], "volunteer")
        self.assertEqual(response["token_type"], "bearer")

    def test_require_session_accepts_session_token(self):
        token = require_session("Bearer session-abc123")

        self.assertEqual(token, "session-abc123")

    def test_require_session_rejects_missing_token(self):
        with self.assertRaises(HTTPException) as context:
            require_session("")

        self.assertEqual(context.exception.status_code, 401)

    def test_require_session_rejects_untrusted_token(self):
        with self.assertRaises(HTTPException) as context:
            require_session("Bearer random-token")

        self.assertEqual(context.exception.status_code, 401)


if __name__ == "__main__":
    unittest.main()
