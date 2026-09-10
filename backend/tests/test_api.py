"""
Comprehensive Automated Test Suite for SmritiNER Backend
Tests all API endpoints, ML difficulty adaptation logic, offline sync, and research analytics.
"""

import sys
import os
import unittest
from fastapi.testclient import TestClient

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.main import app
from app.seed import seed_demonstration_database

client = TestClient(app)


class TestSmritiNERBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_demonstration_database()

    def test_01_health_check(self):
        res = client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("ml_adaptive_engine", data)
        self.assertIn("prototype_disclaimer", data)
        print("  [PASS] Health Check Endpoint Verified")

    def test_02_get_user(self):
        res = client.get("/api/users/NER-PAT-4821")
        self.assertEqual(res.status_code, 200)
        user = res.json()
        self.assertEqual(user["id"], "NER-PAT-4821")
        self.assertEqual(user["preferred_language"], "as")
        print("  [PASS] User Retrieval Verified")

    def test_03_create_user(self):
        res = client.post("/api/users", json={
            "id": "NER-PAT-TEST01",
            "name_alias": "Participant Test",
            "age_band": "60-69",
            "preferred_language": "hi",
            "cohort": "adaptive"
        })
        self.assertEqual(res.status_code, 200)
        user = res.json()
        self.assertEqual(user["id"], "NER-PAT-TEST01")
        print("  [PASS] User Creation Verified")

    def test_04_adaptive_game_high_performance(self):
        # High performance input (Accuracy 95%, reaction 1800ms)
        payload = {
            "user_id": "NER-PAT-4821",
            "game_type": "memory_matching",
            "current_difficulty": 2,
            "accuracy": 0.95,
            "response_time_ms": 1800.0,
            "attempts": 3,
            "completed": True,
            "hints_used": 0,
            "session_duration_s": 40.0,
            "adaptation_mode": "adaptive"
        }
        res = client.post("/api/games/result", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["performance_score"], 80.0)
        self.assertEqual(data["next_difficulty"], 3)  # Elevated by +1
        self.assertIn("ML model recommended Level 3", data["adaptation_rationale"])
        print("  [PASS] Adaptive Engine (Elevation) Verified")

    def test_05_adaptive_game_friction_performance(self):
        # Low performance input (Accuracy 45%, reaction 6000ms, 3 hints)
        payload = {
            "user_id": "NER-PAT-4821",
            "game_type": "memory_matching",
            "current_difficulty": 3,
            "accuracy": 0.45,
            "response_time_ms": 6000.0,
            "attempts": 6,
            "completed": True,
            "hints_used": 3,
            "session_duration_s": 75.0,
            "adaptation_mode": "adaptive"
        }
        res = client.post("/api/games/result", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertLessEqual(data["performance_score"], 60.0)
        self.assertEqual(data["next_difficulty"], 2)  # Decreased by -1 to reduce cognitive friction
        print("  [PASS] Adaptive Engine (De-escalation / Scaffolding) Verified")

    def test_06_analytics_patient(self):
        res = client.get("/api/analytics/NER-PAT-4821")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["total_sessions"], 30)
        self.assertIn("avg_accuracy", data)
        self.assertIn("session_history", data)
        self.assertIn("alerts", data)
        print("  [PASS] Caregiver Longitudinal Analytics Verified")

    def test_07_research_comparison(self):
        res = client.get("/api/analytics/NER-PAT-4821/comparison")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("fixed_cohort", data)
        self.assertIn("adaptive_cohort", data)
        self.assertIn("statistical_evaluation", data)
        stats = data["statistical_evaluation"]
        self.assertIn("t_statistic", stats)
        self.assertIn("p_value", stats)
        self.assertIn("cohens_d_effect_size", stats)
        self.assertIn("watermark", data)
        print(f"  [PASS] Empirical Research Evaluation Verified (t={stats['t_statistic']}, d={stats['cohens_d_effect_size']})")

    def test_08_reminders(self):
        res = client.get("/api/reminders/NER-PAT-4821")
        self.assertEqual(res.status_code, 200)
        reminders = res.json()
        self.assertGreaterEqual(len(reminders), 3)
        rem_id = reminders[0]["id"]

        # Acknowledge reminder
        patch_res = client.patch(f"/api/reminders/{rem_id}/acknowledge")
        self.assertEqual(patch_res.status_code, 200)
        self.assertIsNotNone(patch_res.json()["last_acknowledged"])
        print("  [PASS] Reminders CRUD and Acknowledgment Verified")

    def test_09_offline_batch_sync(self):
        sync_payload = {
            "batch_id": "test_batch_001",
            "user_id": "NER-PAT-4821",
            "sessions": [
                {
                    "user_id": "NER-PAT-4821",
                    "game_type": "attention_concentration",
                    "difficulty_level": 2,
                    "accuracy": 0.88,
                    "response_time_ms": 2200.0,
                    "attempts": 8,
                    "completed": True,
                    "session_duration_s": 45.0,
                    "hints_used": 0,
                    "adaptation_mode": "adaptive"
                }
            ]
        }
        res = client.post("/api/sync", json=sync_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["records_synced"], 1)
        print("  [PASS] Offline Batch Ingestion Verified")

    def test_10_csv_research_export(self):
        res = client.get("/api/export/csv/all")
        self.assertEqual(res.status_code, 200)
        self.assertIn("text/csv", res.headers.get("content-type", ""))
        lines = res.text.strip().split("\n")
        self.assertGreaterEqual(len(lines), 60)
        self.assertIn("session_id,user_id,game_type", lines[0])
        print(f"  [PASS] Research CSV Export Verified ({len(lines)} CSV rows)")


if __name__ == "__main__":
    print("\n--- Running SmritiNER Automated Backend Test Suite ---")
    unittest.main(verbosity=1)
