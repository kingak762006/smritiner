"""
AI-Powered Adaptive Cognitive Difficulty Engine for SmritiNER
Research Prototype for AVISHKAR 2026 / SIH 2026 (Problem Statement 26003)
Ministry of Development of North Eastern Region (MDoNER)

IMPORTANT ETHICAL & CLINICAL NOTICE:
This engine provides cognitive engagement support, personalized cognitive
exercises, and performance-based adaptation. It DOES NOT diagnose, treat,
or cure dementia or Alzheimer's disease.
"""

import os
import math
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd

# Try importing joblib and sklearn; fallback gracefully if artifact not yet trained
try:
    import joblib
    HAS_JOBLIB = True
except ImportError:
    HAS_JOBLIB = False

MODEL_PATH = os.path.join(os.path.dirname(__file__), "cognitive_model.joblib")


class AdaptiveDifficultyEngine:
    """
    Dual-layer Adaptive Cognitive Engine:
    Layer 1: Transparent, interpretable mathematical scoring & parameter mapping.
    Layer 2: Trained Machine Learning transition model (Random Forest / Gradient Boosted)
             with rule-based clinical guardrails (ZPD - Zone of Proximal Development).
    """

    # Game-specific parameter adaptation templates across Difficulty Levels 1-5
    GAME_PARAMETERS = {
        "memory_matching": {
            1: {"pairs": 2, "cards": 4, "grid": "2x2", "reveal_ms": 3000, "hints_allowed": 3, "distractors": 0},
            2: {"pairs": 3, "cards": 6, "grid": "2x3", "reveal_ms": 2500, "hints_allowed": 2, "distractors": 0},
            3: {"pairs": 4, "cards": 8, "grid": "2x4", "reveal_ms": 2000, "hints_allowed": 2, "distractors": 0},
            4: {"pairs": 6, "cards": 12, "grid": "3x4", "reveal_ms": 1500, "hints_allowed": 1, "distractors": 0},
            5: {"pairs": 8, "cards": 16, "grid": "4x4", "reveal_ms": 1000, "hints_allowed": 0, "distractors": 0},
        },
        "sequence_recall": {
            1: {"length": 2, "display_ms": 2000, "interval_ms": 500, "choices_count": 3, "hints_allowed": 2},
            2: {"length": 3, "display_ms": 1600, "interval_ms": 400, "choices_count": 4, "hints_allowed": 2},
            3: {"length": 4, "display_ms": 1300, "interval_ms": 350, "choices_count": 5, "hints_allowed": 1},
            4: {"length": 5, "display_ms": 1000, "interval_ms": 300, "choices_count": 6, "hints_allowed": 1},
            5: {"length": 6, "display_ms": 800,  "interval_ms": 200, "choices_count": 7, "hints_allowed": 0},
        },
        "pattern_recognition": {
            1: {"options_count": 2, "rotation": False, "feature_subtlety": "low", "time_limit_s": 45},
            2: {"options_count": 3, "rotation": False, "feature_subtlety": "low", "time_limit_s": 40},
            3: {"options_count": 4, "rotation": False, "feature_subtlety": "medium", "time_limit_s": 35},
            4: {"options_count": 4, "rotation": True,  "feature_subtlety": "medium", "time_limit_s": 30},
            5: {"options_count": 6, "rotation": True,  "feature_subtlety": "high", "time_limit_s": 25},
        },
        "attention_concentration": {
            1: {"target_lifetime_ms": 3500, "distractors_count": 1, "spawn_rate_ms": 2200, "total_targets": 6},
            2: {"target_lifetime_ms": 2800, "distractors_count": 2, "spawn_rate_ms": 1800, "total_targets": 8},
            3: {"target_lifetime_ms": 2200, "distractors_count": 3, "spawn_rate_ms": 1500, "total_targets": 10},
            4: {"target_lifetime_ms": 1700, "distractors_count": 4, "spawn_rate_ms": 1200, "total_targets": 12},
            5: {"target_lifetime_ms": 1200, "distractors_count": 5, "spawn_rate_ms": 950,  "total_targets": 15},
        },
        "daily_routine": {
            1: {"steps_count": 3, "category": "morning", "time_anchors": True, "hints_allowed": 2},
            2: {"steps_count": 4, "category": "daylight", "time_anchors": True, "hints_allowed": 2},
            3: {"steps_count": 5, "category": "full_day", "time_anchors": True, "hints_allowed": 1},
            4: {"steps_count": 6, "category": "full_day_distractors", "time_anchors": False, "hints_allowed": 1},
            5: {"steps_count": 7, "category": "precise_schedule", "time_anchors": False, "hints_allowed": 0},
        }
    }

    def __init__(self):
        self.ml_model = None
        self._load_ml_model()

    def _load_ml_model(self):
        if HAS_JOBLIB and os.path.exists(MODEL_PATH):
            try:
                self.ml_model = joblib.load(MODEL_PATH)
                print(f"[AdaptiveEngine] Loaded trained ML model from {MODEL_PATH}")
            except Exception as e:
                print(f"[AdaptiveEngine] Warning loading ML model: {e}. Using rule-based fallback.")
                self.ml_model = None
        else:
            self.ml_model = None

    @staticmethod
    def calculate_speed_score(response_time_ms: float, min_expected_ms: float = 1200.0, max_expected_ms: float = 8000.0) -> float:
        """
        Normalizes reaction latency into an elderly-attuned speed score (0 to 100).
        Lower response time = higher score, bounded with compassionate bounds to avoid rushing.
        """
        if response_time_ms <= min_expected_ms:
            return 100.0
        if response_time_ms >= max_expected_ms:
            return 10.0
        normalized = 1.0 - ((response_time_ms - min_expected_ms) / (max_expected_ms - min_expected_ms))
        return float(np.clip(normalized * 100.0, 10.0, 100.0))

    def calculate_performance_score(
        self,
        accuracy: float,          # 0.0 to 1.0 (or 0 to 100)
        response_time_ms: float,
        attempts: int,
        completed: bool,
        hints_used: int = 0,
        expected_min_attempts: int = 1
    ) -> float:
        """
        Transparent, multi-attribute Performance Score formula:
        S = w_a * Accuracy + w_r * SpeedScore + w_c * Completion - w_h * HintPenalty - w_e * AttemptPenalty
        """
        acc_pct = accuracy if accuracy > 1.0 else accuracy * 100.0
        speed_score = self.calculate_speed_score(response_time_ms)
        completion_pct = 100.0 if completed else 40.0
        hint_penalty = min(20.0, hints_used * 6.0)
        excess_attempts = max(0, attempts - expected_min_attempts)
        attempt_penalty = min(20.0, excess_attempts * 4.0)

        # Weighted composite score
        w_acc = 0.45
        w_speed = 0.25
        w_comp = 0.20
        w_hint = 0.05
        w_att = 0.05

        score = (
            (w_acc * acc_pct) +
            (w_speed * speed_score) +
            (w_comp * completion_pct) -
            (w_hint * hint_penalty) -
            (w_att * attempt_penalty)
        )
        return float(np.clip(score, 0.0, 100.0))

    def evaluate_session(
        self,
        game_type: str,
        current_difficulty: int,
        accuracy: float,
        response_time_ms: float,
        attempts: int,
        completed: bool,
        hints_used: int = 0,
        session_duration_s: float = 60.0,
        history_scores: Optional[List[float]] = None
    ) -> Dict[str, Any]:
        """
        Main decision engine entry point.
        Evaluates session metrics, calculates composite score, predicts next difficulty,
        generates personalized game parameters, and outputs an explainable rationale.
        """
        current_difficulty = max(1, min(5, current_difficulty))
        acc_pct = accuracy if accuracy > 1.0 else accuracy * 100.0
        speed_score = self.calculate_speed_score(response_time_ms)
        perf_score = self.calculate_performance_score(
            accuracy=accuracy,
            response_time_ms=response_time_ms,
            attempts=attempts,
            completed=completed,
            hints_used=hints_used
        )

        history_scores = history_scores or []
        rolling_score = np.mean(history_scores[-3:] + [perf_score]) if history_scores else perf_score

        # Determine next difficulty recommendation
        predicted_difficulty = current_difficulty
        rationale = ""
        adaptation_direction = "MAINTAIN"

        # Check if ML model is available
        if self.ml_model is not None:
            try:
                features = pd.DataFrame([{
                    "accuracy_pct": acc_pct,
                    "speed_score": speed_score,
                    "completed": 1.0 if completed else 0.0,
                    "hints_used": hints_used,
                    "attempts": attempts,
                    "current_difficulty": current_difficulty,
                    "rolling_score": rolling_score
                }])
                ml_pred = int(self.ml_model.predict(features)[0])
                # Clinical Guardrail: Restrict transition to max delta of +/- 1
                delta = int(np.clip(ml_pred - current_difficulty, -1, 1))
                predicted_difficulty = current_difficulty + delta
                used_ml = True
            except Exception as ex:
                used_ml = False
        else:
            used_ml = False

        if not used_ml:
            # Rule-based Transparent Adaptation Matrix (Zone of Proximal Development)
            if perf_score >= 82.0 and acc_pct >= 85.0 and hints_used <= 1:
                # High performance -> Increase challenge
                if current_difficulty < 5:
                    predicted_difficulty = current_difficulty + 1
                    adaptation_direction = "INCREASE"
                    rationale = (
                        f"High cognitive mastery detected (Score: {perf_score:.1f}, Accuracy: {acc_pct:.0f}%, "
                        f"Reaction: {response_time_ms/1000:.1f}s). Elevating to Level {predicted_difficulty} "
                        f"to sustain engagement within Zone of Proximal Development."
                    )
                else:
                    adaptation_direction = "MAINTAIN_MAX"
                    rationale = (
                        f"Excellent consistency at peak Level 5 (Score: {perf_score:.1f}). "
                        f"Maintaining maximum difficulty."
                    )
            elif perf_score <= 50.0 or acc_pct < 60.0 or hints_used >= 3 or not completed:
                # Low performance / fatigue -> Reduce stress & provide scaffolding
                if current_difficulty > 1:
                    predicted_difficulty = current_difficulty - 1
                    adaptation_direction = "DECREASE"
                    rationale = (
                        f"Fatigue or increased task friction observed (Score: {perf_score:.1f}, Accuracy: {acc_pct:.0f}%, "
                        f"Hints: {hints_used}). Lowering to Level {predicted_difficulty} to reduce cognitive load "
                        f"and reinforce confidence."
                    )
                else:
                    adaptation_direction = "MAINTAIN_MIN"
                    rationale = (
                        f"Patient encountered challenge at baseline Level 1 (Score: {perf_score:.1f}). "
                        f"Maintaining Level 1 with enhanced auditory cues and maximum hint assistance."
                    )
            else:
                # Balanced performance -> Maintain steady state
                adaptation_direction = "MAINTAIN"
                rationale = (
                    f"Stable cognitive engagement (Score: {perf_score:.1f}, Accuracy: {acc_pct:.0f}%). "
                    f"Maintaining Level {current_difficulty} for consolidation."
                )

        if used_ml and not rationale:
            if predicted_difficulty > current_difficulty:
                adaptation_direction = "INCREASE"
                rationale = f"ML model recommended Level {predicted_difficulty} based on high accuracy ({acc_pct:.0f}%) and speed stability."
            elif predicted_difficulty < current_difficulty:
                adaptation_direction = "DECREASE"
                rationale = f"ML model recommended Level {predicted_difficulty} to mitigate cognitive fatigue and error rate."
            else:
                adaptation_direction = "MAINTAIN"
                rationale = f"ML model recommended maintaining Level {current_difficulty} for consolidation."

        # Fetch parameter set for the target game and predicted level
        game_key = game_type.lower().replace(" ", "_")
        if game_key in self.GAME_PARAMETERS:
            game_params = self.GAME_PARAMETERS[game_key].get(predicted_difficulty, self.GAME_PARAMETERS[game_key][1])
        else:
            game_params = {"difficulty_level": predicted_difficulty}

        return {
            "performance_score": round(perf_score, 2),
            "speed_score": round(speed_score, 2),
            "accuracy_percent": round(acc_pct, 1),
            "current_difficulty": current_difficulty,
            "next_difficulty": predicted_difficulty,
            "adaptation_direction": adaptation_direction,
            "adaptation_rationale": rationale,
            "game_parameters": game_params,
            "clinical_disclaimer": "Research Prototype: Performance-based adaptation only. Not a medical diagnosis or therapy."
        }


# Global singleton instance
engine = AdaptiveDifficultyEngine()


if __name__ == "__main__":
    print("Testing Adaptive Difficulty Engine...")
    test_result = engine.evaluate_session(
        game_type="memory_matching",
        current_difficulty=2,
        accuracy=0.92,
        response_time_ms=2100.0,
        attempts=3,
        completed=True,
        hints_used=0,
        session_duration_s=45.0
    )
    print("Test Result:", test_result)
