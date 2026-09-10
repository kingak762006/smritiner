"""
Offline ML Model Trainer for Adaptive Cognitive Difficulty Engine
Generates synthetic cognitive trajectory benchmark data and trains a
RandomForestClassifier to predict the optimal cognitive challenge band (1-5).

Research Prototype: AVISHKAR 2026 / SIH 2026 Problem Statement 26003
Ministry of Development of North Eastern Region (MDoNER)
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

MODEL_OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "cognitive_model.joblib")
BENCHMARK_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "synthetic_training_trajectories.csv")


def generate_synthetic_cognitive_dataset(n_samples: int = 5000, random_state: int = 42) -> pd.DataFrame:
    """
    Generates synthetic multi-session data reflecting elderly cognitive interaction patterns:
    - Cognitively robust sessions (high accuracy, quick reaction, few hints)
    - Borderline / fatigue sessions (moderate accuracy, slowing speed, increased hints)
    - Distressed / high cognitive friction sessions (low accuracy, long response latency, dropped completion)
    """
    np.random.seed(random_state)
    records = []

    for _ in range(n_samples):
        # Current difficulty 1 to 5
        curr_diff = np.random.choice([1, 2, 3, 4, 5], p=[0.25, 0.30, 0.25, 0.12, 0.08])

        # Underlying cognitive state latent variable (-1.0: severe friction, 0.0: baseline, +1.0: high fluency)
        latent_ability = np.random.normal(0.0, 0.6)

        # Accuracy influenced by ability and difficulty
        base_acc = 75.0 + (latent_ability * 20.0) - ((curr_diff - 2) * 8.0)
        accuracy_pct = np.clip(np.random.normal(base_acc, 8.0), 10.0, 100.0)

        # Speed score (higher = faster, elderly baseline)
        base_speed = 60.0 + (latent_ability * 22.0) - ((curr_diff - 1) * 6.0)
        speed_score = np.clip(np.random.normal(base_speed, 12.0), 10.0, 100.0)

        # Completion probability
        comp_prob = 1.0 / (1.0 + np.exp(-((accuracy_pct - 45.0) / 10.0)))
        completed = 1.0 if np.random.rand() < comp_prob else 0.0

        # Hints used (0 to 4)
        if accuracy_pct < 55.0:
            hints_used = np.random.choice([1, 2, 3, 4], p=[0.2, 0.3, 0.3, 0.2])
        elif accuracy_pct < 75.0:
            hints_used = np.random.choice([0, 1, 2], p=[0.4, 0.4, 0.2])
        else:
            hints_used = np.random.choice([0, 1], p=[0.85, 0.15])

        # Attempts
        attempts = 1 + np.random.poisson(lam=max(0.2, (100.0 - accuracy_pct) / 25.0))

        # Rolling past performance score
        rolling_score = np.clip(
            (0.45 * accuracy_pct) + (0.25 * speed_score) + (0.20 * (completed * 100)) - (hints_used * 4) + np.random.normal(0, 4),
            0.0, 100.0
        )

        # Ground truth target difficulty (ZPD heuristic boundary)
        if accuracy_pct >= 85.0 and speed_score >= 60.0 and hints_used <= 1 and completed == 1.0:
            target_diff = min(5, curr_diff + 1)
        elif accuracy_pct < 60.0 or hints_used >= 3 or completed == 0.0 or speed_score < 30.0:
            target_diff = max(1, curr_diff - 1)
        else:
            target_diff = curr_diff

        records.append({
            "accuracy_pct": round(accuracy_pct, 2),
            "speed_score": round(speed_score, 2),
            "completed": completed,
            "hints_used": int(hints_used),
            "attempts": int(attempts),
            "current_difficulty": int(curr_diff),
            "rolling_score": round(rolling_score, 2),
            "target_difficulty": int(target_diff)
        })

    df = pd.DataFrame(records)
    return df


def train_and_export_model():
    print("[Trainer] Generating synthetic cognitive trajectories (n=5000)...")
    df = generate_synthetic_cognitive_dataset(n_samples=5000)

    # Save dataset to /data directory for research replication
    os.makedirs(os.path.dirname(BENCHMARK_DATA_PATH), exist_ok=True)
    df.to_csv(BENCHMARK_DATA_PATH, index=False)
    print(f"[Trainer] Saved training benchmark dataset to: {BENCHMARK_DATA_PATH}")

    feature_cols = [
        "accuracy_pct",
        "speed_score",
        "completed",
        "hints_used",
        "attempts",
        "current_difficulty",
        "rolling_score"
    ]
    X = df[feature_cols]
    y = df["target_difficulty"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

    print("[Trainer] Fitting Random Forest Classifier (n_estimators=100)...")
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        random_state=42,
        class_weight="balanced"
    )
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n[Trainer] Model Evaluation Accuracy: {acc * 100:.2f}%\n")
    print(classification_report(y_test, y_pred, digits=4))

    # Feature importances
    importances = dict(zip(feature_cols, rf.feature_importances_))
    print("[Trainer] Feature Importances:")
    for feat, imp in sorted(importances.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {feat:20s}: {imp * 100:.2f}%")

    # Persist model
    joblib.dump(rf, MODEL_OUTPUT_PATH)
    print(f"\n[Trainer] Successfully persisted ML model to: {MODEL_OUTPUT_PATH}")


if __name__ == "__main__":
    train_and_export_model()
