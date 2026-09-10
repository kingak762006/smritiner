import os
from datetime import datetime, timedelta
import numpy as np
from sqlalchemy.orm import Session

from .database import engine, Base, SessionLocal
from .models import User, GameSession, Reminder


def seed_demonstration_database():
    """
    Populates the database with realistic synthetic demonstration research data.
    Clearly flags all records as SYNTHETIC DEMONSTRATION DATA.
    """
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.id == "NER-PAT-4821").first():
            print("[Seed] Database already contains demonstration records.")
            return

        print("[Seed] Initializing SmritiNER demonstration cohort...")

        # 1. Primary Patient Profile (Adaptive Cohort)
        patient_adaptive = User(
            id="NER-PAT-4821",
            name_alias="Aita Hemaprabha (আইতা হেমপ্ৰভা)",
            age_band="70-79",
            preferred_language="as",
            caregiver_contact="Mridul B. (Son) / ASHA Worker Runjun (Morigaon PHC)",
            cohort="adaptive"
        )
        db.add(patient_adaptive)

        # 2. Control Patient Profile (Fixed Difficulty Cohort)
        patient_fixed = User(
            id="NER-PAT-3910",
            name_alias="Koka Birendra (ককা বীৰেন্দ্ৰ)",
            age_band="75-84",
            preferred_language="as",
            caregiver_contact="Geeta B. (Daughter) / Nagaon District Hospital",
            cohort="fixed"
        )
        db.add(patient_fixed)
        db.commit()

        # 3. Seed Standard Reminders for Patient 4821
        reminders_data = [
            ("Morning BP Medicine (Amlodipine 5mg)", "medication", "07:30 AM", "Daily"),
            ("Drink a glass of warm water with Kaji Nemu", "hydration", "08:15 AM", "Daily"),
            ("Morning courtyard walk in gentle sunshine", "activity", "09:00 AM", "Daily"),
            ("Wholesome lunch with steamed rice & leafy greens", "meal", "01:00 PM", "Daily"),
            ("Weekly Primary Health Centre (PHC) Checkup", "appointment", "04:30 PM", "Weekly"),
            ("Night Heart Medicine (Atorvastatin 10mg)", "medication", "09:00 PM", "Daily")
        ]
        for title, cat, time_s, freq in reminders_data:
            rem = Reminder(
                user_id="NER-PAT-4821",
                title=title,
                category=cat,
                time_str=time_s,
                frequency=freq,
                is_active=True,
                last_acknowledged=datetime.utcnow() - timedelta(hours=12)
            )
            db.add(rem)
        db.commit()

        # 4. Generate 30 Adaptive Sessions (Cohort B)
        # Demonstrates cognitive stability, learning slope, and adaptive difficulty ladder (Level 1 -> 3)
        games_cycle = [
            "memory_matching",
            "sequence_recall",
            "pattern_recognition",
            "attention_concentration",
            "daily_routine"
        ]

        base_time = datetime.utcnow() - timedelta(days=30)
        current_diff = 1

        for i in range(30):
            g_type = games_cycle[i % len(games_cycle)]
            sess_time = base_time + timedelta(days=i, hours=np.random.randint(9, 17), minutes=np.random.randint(5, 55))

            # Adaptive progression: gradual mastery
            if i < 4:
                current_diff = 1
                acc = np.random.uniform(78.0, 92.0)
                rt = np.random.uniform(3200.0, 4100.0)
            elif i < 12:
                current_diff = 2
                acc = np.random.uniform(82.0, 95.0)
                rt = np.random.uniform(2500.0, 3200.0)
            elif i < 22:
                current_diff = 3
                acc = np.random.uniform(80.0, 93.0)
                rt = np.random.uniform(2100.0, 2800.0)
            else:
                # Occasional step into level 4
                current_diff = 3 if np.random.rand() > 0.4 else 4
                acc = np.random.uniform(84.0, 96.0)
                rt = np.random.uniform(1900.0, 2600.0)

            completed = True if np.random.rand() > 0.05 else False
            hints = 0 if acc > 88.0 else (1 if acc > 75.0 else 2)
            speed_score = max(10.0, min(100.0, (1.0 - (rt - 1200) / (8000 - 1200)) * 100))
            score = (0.45 * acc) + (0.25 * speed_score) + (0.20 * (100 if completed else 40)) - (hints * 3)

            sess = GameSession(
                user_id="NER-PAT-4821",
                game_type=g_type,
                timestamp=sess_time,
                difficulty_level=current_diff,
                accuracy=round(acc / 100.0, 3),
                response_time_ms=round(rt, 1),
                attempts=1 if acc > 85.0 else 2,
                completed=completed,
                session_duration_s=round(np.random.uniform(45.0, 90.0), 1),
                hints_used=hints,
                performance_score=round(score, 1),
                adaptation_mode="adaptive",
                rationale=f"Adaptive Engine dynamically tuned challenge to Level {current_diff} (ZPD).",
                is_synthetic=True,
                synced=True
            )
            db.add(sess)

        # 5. Generate 30 Fixed Difficulty Sessions (Cohort A - Control)
        # Difficulty locked at 2; exhibits cognitive fatigue and plateau
        for i in range(30):
            g_type = games_cycle[i % len(games_cycle)]
            sess_time = base_time + timedelta(days=i, hours=np.random.randint(9, 17), minutes=np.random.randint(5, 55))

            # Fixed difficulty: higher variance, frustration dips
            acc = np.random.uniform(62.0, 80.0)
            rt = np.random.uniform(2800.0, 4400.0)
            completed = True if np.random.rand() > 0.22 else False
            hints = np.random.choice([1, 2, 3])
            speed_score = max(10.0, min(100.0, (1.0 - (rt - 1200) / (8000 - 1200)) * 100))
            score = (0.45 * acc) + (0.25 * speed_score) + (0.20 * (100 if completed else 40)) - (hints * 3)

            sess = GameSession(
                user_id="NER-PAT-3910",
                game_type=g_type,
                timestamp=sess_time,
                difficulty_level=2,  # Fixed Level 2
                accuracy=round(acc / 100.0, 3),
                response_time_ms=round(rt, 1),
                attempts=np.random.randint(1, 4),
                completed=completed,
                session_duration_s=round(np.random.uniform(40.0, 110.0), 1),
                hints_used=hints,
                performance_score=round(score, 1),
                adaptation_mode="fixed",
                rationale="Control session: Static difficulty held at Level 2.",
                is_synthetic=True,
                synced=True
            )
            db.add(sess)

        db.commit()
        print("[Seed] Successfully populated 60 synthetic research sessions and 6 reminders.")

    except Exception as e:
        db.rollback()
        print(f"[Seed] Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demonstration_database()
