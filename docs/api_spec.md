# SmritiNER REST API Specification

Base URL: `http://127.0.0.1:8000/api`  
Interactive Swagger Docs: `http://127.0.0.1:8000/docs`  
ReDoc: `http://127.0.0.1:8000/redoc`  

---

## 1. System Health
### `GET /health`
Returns system operational state, ML model status, and ethics disclaimer.

**Response 200 OK**:
```json
{
  "status": "healthy",
  "service": "SmritiNER Backend API",
  "timestamp_utc": "2026-09-10T14:15:00.000000",
  "database": "connected",
  "ml_adaptive_engine": "loaded",
  "prototype_disclaimer": "RESEARCH PROTOTYPE: For cognitive engagement support and performance-based adaptation. DOES NOT diagnose, treat, or cure dementia or Alzheimer's disease."
}
```

---

## 2. User & Patient Profile Management
### `POST /api/users`
Creates or retrieves an anonymized patient profile.

**Request Body**:
```json
{
  "id": "NER-PAT-4821",
  "name_alias": "Aita Hemaprabha",
  "age_band": "70-79",
  "preferred_language": "as",
  "caregiver_contact": "ASHA Worker Runjun / Morigaon PHC",
  "cohort": "adaptive"
}
```

### `GET /api/users/{id}`
Fetches patient demographics and cohort.

---

## 3. Cognitive Gaming & Adaptive Engine
### `POST /api/games/result`
Core research endpoint. Submits gameplay telemetry, queries recent history, evaluates through the ML adaptive difficulty engine, and returns next difficulty parameters with an explainable rationale.

**Request Body**:
```json
{
  "user_id": "NER-PAT-4821",
  "game_type": "memory_matching",
  "current_difficulty": 2,
  "accuracy": 0.94,
  "response_time_ms": 2100.0,
  "attempts": 3,
  "completed": true,
  "hints_used": 0,
  "session_duration_s": 42.0,
  "adaptation_mode": "adaptive"
}
```

**Response 200 OK**:
```json
{
  "session_id": 61,
  "user_id": "NER-PAT-4821",
  "game_type": "memory_matching",
  "performance_score": 83.5,
  "speed_score": 86.8,
  "accuracy_percent": 94.0,
  "current_difficulty": 2,
  "next_difficulty": 3,
  "adaptation_direction": "INCREASE",
  "adaptation_rationale": "ML model recommended Level 3 based on high accuracy (94%) and speed stability.",
  "game_parameters": {
    "pairs": 4,
    "cards": 8,
    "grid": "2x4",
    "reveal_ms": 2000,
    "hints_allowed": 2,
    "distractors": 0
  },
  "clinical_disclaimer": "Research Prototype: Performance-based adaptation only. Not a medical diagnosis or therapy."
}
```

---

## 4. Analytics & Caregiver Monitoring
### `GET /api/analytics/{user_id}`
Returns longitudinal metrics, accuracy trends, reaction times, and intelligent non-clinical wellness alerts.

### `GET /api/analytics/{user_id}/comparison`
Computes empirical comparative statistics between Fixed Difficulty (Cohort A) and Adaptive Difficulty (Cohort B), including Welch's $t$-test and Cohen's $d$ effect size.

---

## 5. Daily Living Reminders
### `GET /api/reminders/{user_id}`
Lists scheduled reminders.

### `POST /api/reminders`
Creates a new reminder.

### `PATCH /api/reminders/{id}/acknowledge`
Marks reminder as completed today.

---

## 6. Offline Batch Synchronization
### `POST /api/sync`
Ingests batch of sessions queued locally in offline storage.

**Request Body**:
```json
{
  "batch_id": "batch_1726000000",
  "user_id": "NER-PAT-4821",
  "sessions": [
    {
      "user_id": "NER-PAT-4821",
      "game_type": "attention_concentration",
      "difficulty_level": 2,
      "accuracy": 0.90,
      "response_time_ms": 2300.0,
      "attempts": 8,
      "completed": true,
      "session_duration_s": 45.0,
      "hints_used": 0,
      "adaptation_mode": "adaptive"
    }
  ]
}
```

---

## 7. Research Data Export
### `GET /api/export/csv/{user_id}`
Downloads session records formatted as CSV for external statistical software (SPSS, R, Python pandas). Use `user_id = all` to export the full comparative study dataset.
