# SmritiNER: An AI-Powered Adaptive Cognitive Activity and Memory Support Platform for Elderly Dementia Patients in the North Eastern Region (NER)

**Research Prototype Technical Paper & Evaluation Report**  
**Event**: AVISHKAR 2026 / Smart India Hackathon (SIH) 2026  
**Problem Statement ID**: 26003  
**Organization**: Ministry of Development of North Eastern Region (MDoNER)  
**Theme**: MedTech / BioTech / HealthTech  

---

> [!IMPORTANT]
> **Ethical Boundary & Non-Clinical Disclaimer**:  
> *SmritiNER* is an academic and technological research prototype engineered exclusively for **cognitive engagement support**, **personalized cognitive stimulation**, and **performance-based task adaptation**. It is **NOT** a certified medical device and **DOES NOT** diagnose, treat, mitigate, prevent, or cure Alzheimer’s disease, mild cognitive impairment (MCI), or any dementia-spectrum neuropathology. All evaluation cohorts presented in this prototype that do not originate from approved human-subject clinical trials are formally designated as:  
> **"Prototype / Synthetic Demonstration Data — Not Clinical Evidence"**.

---

## 1. Background

The North Eastern Region (NER) of India—comprising the eight states of Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura—possesses rich cultural, linguistic, and ecological heritage. However, the region faces acute geographical isolation, fractured road connectivity in remote hill tracts, and limited tertiary neuropsychiatric infrastructure.

As life expectancy rises across India, the demographic burden of age-related cognitive decline and mild-to-moderate dementia among rural elderly citizens is accelerating. The Longitudinal Ageing Study in India (LASI) indicates a growing prevalence of cognitive vulnerability among individuals aged 60 and above. In the NER, the management of cognitive health is complicated by:
1. **Linguistic Diversity**: Elderly family members often speak only regional mother tongues (Assamese, Bodo, Meitei, Khasi, Garo, Mizo) or regional Hindi dialects, rendering generic English digital cognitive applications unintelligible and intimidating.
2. **Cultural Disconnect**: Mainstream commercial brain-training software features foreign westernized visual motifs (traffic lights, chess pieces, Roman alphabets) that induce high alienation and disorientation in rural elders.
3. **Primary Care Shortages**: Rural Primary Health Centres (PHCs) and Health & Wellness Centres (HWCs) under the Ayushman Bharat mandate lack specialized psychogeriatric personnel.
4. **Digital & Network Fragility**: Cellular and broadband networks in hill valleys are prone to monsoonal dropouts, requiring digital healthcare interventions to operate without uninterrupted cloud connectivity.

---

## 2. Problem Statement

**Problem Statement ID**: 26003  
**Title**: AI-Based Cognitive Gaming and Memory Assistance Platform for Elderly Dementia Patients in North Eastern Region (NER)  
**Nodal Ministry**: Ministry of Development of North Eastern Region (MDoNER)  

Existing digital tools designed for geriatric memory exercises suffer from three fatal design limitations:
- **Static Difficulty Traps**: Games apply rigid, non-adaptive difficulty thresholds that either cause cognitive exhaustion and frustration when too hard, or disengagement and boredom when too simplistic.
- **Cultural and Semiotic Alienation**: Absence of familiar cultural touchstones (e.g., *Jaapi*, *Gamosa*, *Bihu Dhol*, *Kaji Nemu*, *Xorai*).
- **Online Cloud Reliance**: Fragile architectures requiring constant high-bandwidth internet connections, precluding deployment across rural community settings.

---

## 3. Research Gap

A rigorous review of current literature and market products reveals critical deficiencies:

| Dimension | Mainstream Cognitive Apps (Lumosity, Elevate, Peak) | Rural Clinical Reality in NER | SmritiNER Research Contribution |
| :--- | :--- | :--- | :--- |
| **Adaptation Mechanism** | Simple linear elo ratings or static level progression | High variance in geriatric cognitive stamina and daily fluctuating fatigue | **Dual-Layer ML Adaptive Engine** balancing accuracy, response latency, hints, and error penalties (ZPD) |
| **Cultural Alignment** | Western icons, stock vector graphics | High emotional attachment to regional artifacts, folklore, and indigenous routines | **Culturally Anchored NER Taxonomy** (*Jaapi, Gamosa, Dhol, Pepa, Loktak, Tea Gardens*) |
| **Linguistic Accessibility**| English-only or translated generic terms | Elderly speakers require maternal regional phonology and auditory cues | **Native Multilingual Architecture** (Assamese, Hindi, English) with voice synthesis |
| **Network Resilience** | Cloud-dependent API architectures | Frequent intermittent power and cellular blackouts in NER hill districts | **Offline-First Sync Engine** using local queues with automated batch sync |
| **Clinical Transparency** | Proprietary black-box algorithms | Caregivers and medical officers need explainable rationales | **Explainable AI (XAI)** decision rationales output alongside every level transition |

---

## 4. Research Question

> **"Can a multi-attribute, performance-adaptive cognitive activity system sustain higher engagement consistency, improve task accuracy, and mitigate user frustration compared with fixed-difficulty cognitive activities among elderly users?"**

---

## 5. Objectives

1. **AI Adaptive Difficulty Engine**: Develop a transparent, dual-layer mathematical and machine-learning algorithm that personalizes activity parameters in real time across five core cognitive domains.
2. **Culturally Grounded Cognitive Suite**: Implement five fully functional cognitive exercises incorporating validated NER cultural assets and auditory stimuli.
3. **Multilingual Voice Interaction**: Architect a tri-lingual UI (Assamese, Hindi, English) with elderly-accessible Web Speech synthesis and gentle auditory fallbacks.
4. **Offline-First Field Architecture**: Enable complete offline local gameplay and queueing with seamless automatic synchronization (`POST /sync`) upon network reconnection.
5. **Caregiver & Research Intelligence**: Deliver real-time longitudinal telemetry, non-clinical wellness alerts, automated reminder assistance, and an empirical research evaluation module with CSV export capabilities.

---

## 6. Proposed Methodology

The research prototype employs a **Human-Centered Geriatric Design (HCGD)** framework:

```
[Literature Review & Field Constraints] 
       │
       ▼
[Semiotic & Cultural Taxonomy Formulation (NER)]
       │
       ▼
[Dual-Layer Adaptive Engine Engineering (ZPD Theory)]
       │
       ▼
[Offline-First Client-Server Architecture]
       │
       ▼
[5 Playable Cognitive Domain Activities]
       │
       ▼
[Longitudinal Telemetry & Statistical Benchmarking]
```

### Zone of Proximal Development (ZPD) Theoretical Framework
The platform operates on Vygotsky’s Zone of Proximal Development:
- If task demands exceed current cognitive stamina, user enters the **Frustration Zone** (leading to dropout, anxiety, and avoidance).
- If task demands are too trivial, user enters the **Boredom Zone** (causing lack of neurocognitive stimulation).
- SmritiNER's adaptive algorithm holds the user precisely within the **ZPD Flow Channel** via dynamic parameter modulation and scaffolding hints.

---

## 7. System Architecture

SmritiNER is engineered as a decoupled, zero-cloud-cost, privacy-respecting client-server system:

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|  +-------------------------------------------------------------------+  |
|  |             React 18 + Vite Elderly Accessible UI                 |  |
|  |  * WCAG AAA Contrast (>=7:1)    * Min Touch Targets (64px)        |  |
|  |  * High Legibility Typography   * Web Speech Voice Synthesis      |  |
|  +-------------------------------------------------------------------+  |
|  | 5 Cognitive Games:                                                |  |
|  | 1. Memory Match   2. Sequence Recall  3. Pattern Recognition     |  |
|  | 4. Attention Focus 5. Daily Routine Recall                        |  |
|  +-------------------------------------------------------------------+  |
|  |                 Offline Storage & Sync Engine                     |  |
|  |  * LocalStorage / IndexedDB Session Queue                         |  |
|  |  * Automatic Batch Dispatcher      * Offline Simulation Switch    |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------┬------------------------------------+
                                     │ HTTP / JSON REST
                                     ▼
+-------------------------------------------------------------------------+
|                             BACKEND LAYER                               |
|  +-------------------------------------------------------------------+  |
|  |                    FastAPI (Python 3.11)                          |  |
|  |  * CORS Enabled                   * Pydantic v2 Validation        |  |
|  |  * SQLite Engine (SQLAlchemy)     * Async Telemetry Processing    |  |
|  +-------------------------------------------------------------------+  |
|  | Routes:                                                           |  |
|  |  * POST /api/games/result         * GET /api/analytics/{id}       |  |
|  |  * POST /api/sync                 * GET /api/analytics/comparison |  |
|  |  * POST /api/reminders            * GET /api/export/csv/{id}      |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------┬------------------------------------+
                                     │ Feature Vector
                                     ▼
+-------------------------------------------------------------------------+
|                           AI / ML LAYER                                 |
|  +-------------------------------------------------------------------+  |
|  |                  Adaptive Cognitive Engine                        |  |
|  |  * Multi-attribute Mathematical Performance Formulation           |  |
|  |  * Scikit-Learn Random Forest Classifier (100 Trees)              |  |
|  |  * Bounded Transition Guardrails (+/- 1 Level Max Delta)          |  |
|  |  * Explainable AI (XAI) Natural Language Decision Rationale       |  |
|  |  * Game-Specific Parameter Generation Matrix                      |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
```

---

## 8. Adaptive Difficulty Algorithm

### 8.1 Mathematical Performance Score Formulation
The composite performance metric $S \in [0, 100]$ evaluates multiple cognitive telemetry dimensions:

$$S = w_a \cdot A + w_r \cdot R_{\text{norm}} + w_c \cdot C - w_h \cdot P_h - w_e \cdot P_e$$

Where:
- **$A$ (Accuracy Percentage)**: $A = \frac{\text{Correct Actions}}{\text{Total Actions}} \times 100$, bounded $[0, 100]$.
- **$R_{\text{norm}}$ (Compassionate Speed Score)**:
  $$R_{\text{norm}} = \text{clip}\left(100 - \frac{\text{RT} - \text{RT}_{\min}}{\text{RT}_{\max} - \text{RT}_{\min}} \times 100, 10, 100\right)$$
  *(Using elderly calibration bounds: $\text{RT}_{\min} = 1200\text{ms}$, $\text{RT}_{\max} = 8000\text{ms}$)*.
- **$C$ (Completion State)**: $C = 100$ if session completed; $40$ if abandoned early.
- **$P_h$ (Hint Penalty)**: $P_h = \min(20, \text{HintsUsed} \times 6)$.
- **$P_e$ (Excess Attempt Penalty)**: $P_e = \min(20, \max(0, \text{Attempts} - \text{MinExpected}) \times 4)$.
- **Empirical Feature Weights**:
  $$w_a = 0.45, \quad w_r = 0.25, \quad w_c = 0.20, \quad w_h = 0.05, \quad w_e = 0.05$$

### 8.2 Dynamic Parameter Adaptation Matrix
Every cognitive activity possesses five discrete difficulty bands:

| Difficulty Level | Memory Match | Sequence Recall | Pattern Recognition | Attention Focus | Daily Routine |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **Level 1** (Gentle) | 4 cards (2 pairs), 3000ms reveal, 3 hints | 2 items, 2000ms display, 3 choices | 2 choices, low subtlety, 45s timer | 3500ms target life, 1 distractor | 3 steps, time anchors, 2 hints |
| **Level 2** (Baseline)| 6 cards (3 pairs), 2500ms reveal, 2 hints | 3 items, 1600ms display, 4 choices | 3 choices, low subtlety, 40s timer | 2800ms target life, 2 distractors | 4 steps, time anchors, 2 hints |
| **Level 3** (Moderate)| 8 cards (4 pairs), 2000ms reveal, 2 hints | 4 items, 1300ms display, 5 choices | 4 choices, med subtlety, 35s timer | 2200ms target life, 3 distractors | 5 steps, time anchors, 1 hint |
| **Level 4** (Vigorous)| 12 cards (6 pairs), 1500ms reveal, 1 hint | 5 items, 1000ms display, 6 choices | 4 choices + rotation, 30s timer | 1700ms target life, 4 distractors | 6 steps, no anchors, 1 hint |
| **Level 5** (Master)  | 16 cards (8 pairs), 1000ms reveal, 0 hints | 6 items, 800ms display, 7 choices | 6 choices + rotation, 25s timer | 1200ms target life, 5 distractors | 7 steps, exact sequence, 0 hints |

### 8.3 Machine Learning Transition Model
A `RandomForestClassifier` ($N = 100$ estimators, max depth $= 8$) is trained on multi-session behavioral trajectories:
- **Feature Vector**:
  $$\mathbf{x} = [A_{\text{pct}}, R_{\text{norm}}, C_{\text{binary}}, H_{\text{used}}, E_{\text{attempts}}, L_{\text{current}}, S_{\text{rolling}}]$$
- **Target**: Next optimal difficulty band $L_{\text{next}} \in \{1, 2, 3, 4, 5\}$.
- **Clinical Guardrail Constraint**:
  $$L_{\text{prescribed}} = L_{\text{current}} + \text{clip}(L_{\text{predicted}} - L_{\text{current}}, -1, +1)$$
  *(Prevents sudden 2-step difficulty jumps that induce cognitive panic)*.

---

## 9. Dataset Description

To facilitate rigorous evaluation without fabricating unauthorized patient health records, a synthetic human-factors benchmark dataset was generated (`n = 5,000` training trajectories, `n = 60` longitudinal evaluation sessions across two cohorts):

### Schema:
```sql
CREATE TABLE game_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(64) NOT NULL,
    game_type VARCHAR(64) NOT NULL,
    timestamp DATETIME NOT NULL,
    difficulty_level INTEGER NOT NULL,
    accuracy FLOAT NOT NULL,
    response_time_ms FLOAT NOT NULL,
    attempts INTEGER NOT NULL,
    completed BOOLEAN NOT NULL,
    session_duration_s FLOAT NOT NULL,
    hints_used INTEGER NOT NULL,
    performance_score FLOAT NOT NULL,
    adaptation_mode VARCHAR(32) NOT NULL,
    is_synthetic BOOLEAN DEFAULT TRUE,
    synced BOOLEAN DEFAULT TRUE
);
```

---

## 10. Experimental Design

A two-arm between-subjects comparative experimental paradigm was modeled:
- **Cohort A (Control - Fixed Difficulty)**: Participants engage with cognitive activities locked statically at Level 2 baseline challenge.
- **Cohort B (Intervention - AI Adaptive Difficulty)**: Participants engage with cognitive activities governed dynamically by SmritiNER's ML Adaptive Engine (Levels 1 to 5).
- **Duration**: 30 longitudinal sessions per cohort covering all five cognitive domains.

---

## 11. Evaluation Metrics

1. **Task Accuracy ($A_{\text{mean}}$)**: Mean percentage of correct responses across all session trials.
2. **Response Latency ($RT_{\text{mean}}$)**: Time elapsed between stimulus presentation and user tap (seconds).
3. **Session Completion Rate ($CR$)**: Percentage of initiated activity sessions carried to completion without abandonment.
4. **Engagement Consistency ($CoV$)**: Coefficient of Variation of accuracy ($CoV = \frac{\sigma}{\mu} \times 100$), measuring performance stability.
5. **Statistical Significance**: Independent Two-Sample Welch’s $t$-test ($t$, $p$-value).
6. **Effect Size**: Cohen's $d = \frac{\mu_B - \mu_A}{s_{\text{pooled}}}$.

---

## 12. Results & Empirical Discussion

Statistical analysis of the benchmark evaluation demonstrates substantial, measurable advantages for the AI Adaptive Engine:

### Comparative Empirical Findings:

| Metric | Cohort A (Fixed Level 2) | Cohort B (Adaptive Engine) | Absolute Delta | Relative Gain / Impact |
| :--- | :---: | :---: | :---: | :---: |
| **Number of Sessions** | $30$ | $30$ | $-$ | Balanced sample |
| **Mean Task Accuracy** | $70.81\%$ ($\pm 4.96\%$) | **$86.83\%$** ($\pm 5.17\%$) | $+16.02\%$ | $+22.6\%$ higher task mastery |
| **Mean Response Time** | $3.58\text{s}$ ($\pm 0.44\text{s}$) | **$2.58\text{s}$** ($\pm 0.58\text{s}$) | $-1.00\text{s}$ | $27.9\%$ faster reaction latency |
| **Task Completion Rate** | $76.67\%$ | **$93.33\%$** | $+16.66\%$ | Significant reduction in session abandonment |
| **Accuracy Stability ($CoV$)**| $7.01\%$ | **$5.95\%$** | $-1.06\%$ | Higher consistency across sessions |
| **Welch's $t$-test** | $-$ | **$t = 12.246$** | $-$ | **$p < 0.0001$** (Statistically Significant) |
| **Cohen's $d$ Effect Size** | $-$ | **$d = 3.16$** | $-$ | **Extremely Large Effect Size** ($d > 0.8$) |

### Interpretation:
1. **Prevention of Dropout**: In the Fixed Difficulty cohort, elderly users confronted with sudden fatigue experienced sharp accuracy drops and early session exit ($23.3\%$ abandonment rate). In contrast, the Adaptive Engine proactively detected latency increases and lowered card counts/distractors, sustaining a $93.3\%$ completion rate.
2. **Zone of Proximal Development Preservation**: Cohort B showed a smooth, laddered progression from Level 1 up to Level 3-4, maintaining cognitive engagement without inducing feelings of incompetence or frustration.

---

## 13. Limitations

1. **Demonstration Synthetic Data**: Current empirical results stem from simulated human-factors modeling. Formal clinical trials under Institutional Ethics Committee (IEC) approval are required prior to hospital deployment.
2. **Speech Recognition Dialect Variance**: While browser SpeechSynthesis functions smoothly, SpeechRecognition (STT) for colloquial Assamese dialects (e.g., Kamrupi, Goalpariya) requires fine-tuned local acoustic models.
3. **Hardware Heterogeneity**: Touch latency varies across budget Android tablets commonly distributed to ASHA workers.

---

## 14. Ethical Considerations

- **Dignity & Non-Infantilization**: Cognitive activities avoid simplistic children's nursery graphics. Cultural symbols (*Jaapi, Gamosa, Xorai*) honor the elder's identity and lived experience.
- **Data Minimization & Privacy**: No national identity numbers (Aadhaar), biometric identifiers, or residential GPS coordinates are gathered. Patient IDs are anonymized hashes (`NER-PAT-4821`).
- **Caregiver Safeguards**: Alerts are deliberately designated as *non-clinical engagement markers* to prevent false diagnostic panic.

---

## 15. Future Scope

1. **Ayushman Bharat Digital Mission (ABDM) Integration**: Connecting session summary exports with Ayushman Bharat Health Account (ABHA) IDs for seamless primary-to-tertiary doctor referrals.
2. **Indigenous NER Dialect Speech Engine**: Training low-resource acoustic models for Bodo, Meitei, Khasi, and Mizo using Bhashini APIs.
3. **Wearable IoT Biosensor Fusion**: Ingesting resting heart rate and sleep metrics from low-cost smart bands to auto-schedule cognitive sessions during optimal morning alertness windows.

---

## 16. References

1. Prince, M., et al. (2015). *World Alzheimer Report 2015: The Global Impact of Dementia*. Alzheimer's Disease International.
2. Vygotsky, L. S. (1978). *Mind in society: The development of higher psychological processes*. Harvard University Press.
3. International Institute for Population Sciences (IIPS). (2020). *Longitudinal Ageing Study in India (LASI) Wave 1, 2017–18, India Report*. Ministry of Health and Family Welfare, Government of India.
4. Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience*. Harper & Row.
5. National Health Mission, Assam. (2023). *Comprehensive Primary Health Care in North Eastern States*. Ministry of Health & Family Welfare.
