import { offlineStorage } from './offlineStorage';

const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');

export const api = {
  async getPatientProfile(userId = 'NER-PAT-4821') {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`);
      if (!res.ok) throw new Error('Patient not found');
      return await res.json();
    } catch (e) {
      // Local fallback for offline mode
      return {
        id: userId,
        name_alias: 'Aita Hemaprabha (আইতা হেমপ্ৰভা)',
        age_band: '70-79',
        preferred_language: 'as',
        caregiver_contact: 'Mridul B. (Son) / ASHA Worker Runjun (Morigaon PHC)',
        cohort: 'adaptive'
      };
    }
  },

  async submitGameResult(data) {
    // Check if offline or simulation active
    if (!offlineStorage.isOnline()) {
      console.log('[API] Client is offline; saving to local queue');
      offlineStorage.enqueueSession(data);

      // Compute client-side adaptation fallback
      const accPct = data.accuracy > 1.0 ? data.accuracy : data.accuracy * 100.0;
      const speedScore = Math.max(10, Math.min(100, (1.0 - (data.response_time_ms - 1200) / 6800) * 100));
      const compPct = data.completed ? 100 : 40;
      const perfScore = (0.45 * accPct) + (0.25 * speedScore) + (0.20 * compPct) - (data.hints_used * 4);

      let nextDiff = data.current_difficulty;
      let dir = 'MAINTAIN';
      let rationale = 'Offline local adaptation: Maintained steady cognitive load.';

      if (perfScore >= 82 && accPct >= 85 && data.hints_used <= 1) {
        nextDiff = Math.min(5, data.current_difficulty + 1);
        dir = 'INCREASE';
        rationale = `Offline Rule Engine: High mastery (Score: ${perfScore.toFixed(0)}). Elevated challenge to Level ${nextDiff}.`;
      } else if (perfScore <= 50 || accPct < 60 || data.hints_used >= 3 || !data.completed) {
        nextDiff = Math.max(1, data.current_difficulty - 1);
        dir = 'DECREASE';
        rationale = `Offline Rule Engine: Cognitive friction detected. Reduced challenge to Level ${nextDiff} to maintain confidence.`;
      }

      return {
        session_id: Date.now(),
        user_id: data.user_id,
        game_type: data.game_type,
        performance_score: Math.round(perfScore),
        speed_score: Math.round(speedScore),
        accuracy_percent: Math.round(accPct),
        current_difficulty: data.current_difficulty,
        next_difficulty: nextDiff,
        adaptation_direction: dir,
        adaptation_rationale: rationale,
        game_parameters: { difficulty_level: nextDiff },
        clinical_disclaimer: 'Research Prototype: Performance-based adaptation only (Offline Mode).',
        is_offline_cached: true
      };
    }

    // Online submission
    const res = await fetch(`${API_BASE}/games/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error(`Submission failed: ${res.statusText}`);
    }
    return await res.json();
  },

  async getPatientAnalytics(userId = 'NER-PAT-4821') {
    try {
      const res = await fetch(`${API_BASE}/analytics/${userId}`);
      if (!res.ok) throw new Error('Analytics failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async getResearchComparison(userId = 'NER-PAT-4821') {
    try {
      const res = await fetch(`${API_BASE}/analytics/${userId}/comparison`);
      if (!res.ok) throw new Error('Comparison failed');
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async getReminders(userId = 'NER-PAT-4821') {
    try {
      const res = await fetch(`${API_BASE}/reminders/${userId}`);
      if (!res.ok) throw new Error('Reminders failed');
      return await res.json();
    } catch (e) {
      return [
        { id: 1, title: 'Morning BP Medicine (Amlodipine 5mg)', category: 'medication', time_str: '07:30 AM', is_active: true },
        { id: 2, title: 'Drink warm water with lemon', category: 'hydration', time_str: '08:15 AM', is_active: true },
        { id: 3, title: 'Morning garden walk', category: 'activity', time_str: '09:00 AM', is_active: true }
      ];
    }
  },

  async acknowledgeReminder(id) {
    try {
      const res = await fetch(`${API_BASE}/reminders/${id}/acknowledge`, { method: 'PATCH' });
      return await res.json();
    } catch (e) {
      return { status: 'acknowledged_locally' };
    }
  },

  async triggerSeed() {
    try {
      const res = await fetch(`${API_BASE}/demo/seed`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { message: 'Seed triggered' };
    }
  }
};
