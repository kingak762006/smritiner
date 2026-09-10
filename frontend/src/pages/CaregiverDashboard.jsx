import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  User, Activity, Bell, AlertTriangle, CheckCircle2, TrendingUp, Clock, Award, ShieldAlert, Plus
} from 'lucide-react';
import { api } from '../services/api';
import { useI18n } from '../i18n';

export default function CaregiverDashboard({ userId = 'NER-PAT-4821' }) {
  const { t, locale } = useI18n();
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getElderTitle = () => {
    if (locale === 'as') return 'হেমপ্ৰভা (নাগৰিক / অংশগ্ৰহণকাৰী)';
    if (locale === 'hi') return 'हेमप्रभा (नागरिक व प्रतिभागी)';
    if (locale === 'mr') return 'हेमप्रभा (नागरिक व खेळाडू)';
    return 'Hemaprabha (Participant / Citizen)';
  };

  // New reminder form state
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newCategory, setNewCategory] = useState('medication');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profData, analyticsData, remData] = await Promise.all([
        api.getPatientProfile(userId),
        api.getPatientAnalytics(userId),
        api.getReminders(userId)
      ]);
      setProfile(profData);
      setAnalytics(analyticsData);
      setReminders(remData);
    } catch (e) {
      console.warn('Dashboard data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: newTitle,
          time_str: newTime,
          category: newCategory,
          frequency: 'Daily'
        })
      });
      if (res.ok) {
        setNewTitle('');
        fetchData();
      }
    } catch (err) {
      console.warn('Error adding reminder:', err);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.4rem' }}>Loading Caregiver Portal...</div>;
  }

  const sessionHistory = analytics?.session_history || [];
  const activityData = Object.entries(analytics?.activity_breakdown || {}).map(([game, data]) => ({
    game: game.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    accuracy: data.mean_accuracy,
    response_time: data.mean_response_time_s
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Patient Profile Card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '3px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary-subtle)',
            border: '3px solid var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem'
          }}>
            🧠
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {getElderTitle()}
              </h2>
              <span style={{ background: '#D1FAE5', color: '#065F46', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '0.9rem' }}>
                {profile?.cohort?.toUpperCase()} COHORT
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.25rem' }}>
              ID: <strong>{profile?.id}</strong> | Age: <strong>{profile?.age_band}</strong> | Language: <strong>{profile?.preferred_language?.toUpperCase()}</strong>
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.15rem' }}>
              Primary Healthcare Contact: <strong>{profile?.caregiver_contact}</strong>
            </p>
          </div>
        </div>

        <button onClick={fetchData} className="btn-big btn-secondary" style={{ minHeight: '52px', fontSize: '1.1rem' }}>
          Refresh Telemetry
        </button>
      </div>

      {/* Real-time KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '3px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>
            <Activity size={22} />
            <span>Avg Accuracy</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            {analytics?.avg_accuracy || 0}%
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Longitudinal benchmark</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '3px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', fontWeight: 700, fontSize: '1.1rem' }}>
            <Clock size={22} />
            <span>Reaction Latency</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            {analytics?.avg_response_time_s || 0}s
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Average decision time</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '3px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7C3AED', fontWeight: 700, fontSize: '1.1rem' }}>
            <Award size={22} />
            <span>Current Challenge</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            Level {analytics?.current_difficulty || 1}
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Dynamic ZPD adaptation</div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '3px solid var(--border-strong)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: 700, fontSize: '1.1rem' }}>
            <CheckCircle2 size={22} />
            <span>Completion Rate</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            {analytics?.completion_rate || 0}%
          </div>
          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Total {analytics?.total_sessions || 0} sessions</div>
        </div>
      </div>

      {/* Intelligent Non-Clinical Wellness Alerts */}
      <div style={{
        background: '#FFFBEB',
        border: '3px solid #F59E0B',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#B45309', fontWeight: 800, fontSize: '1.4rem', marginBottom: '1rem' }}>
          <ShieldAlert size={26} />
          <span>Caregiver Cognitive Wellness Alerts</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {analytics?.alerts?.map((alertMsg, idx) => (
            <div key={idx} style={{ background: 'white', border: '2px solid #FDE68A', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '1.1rem', fontWeight: 600, color: '#78350F' }}>
              🔔 {alertMsg}
            </div>
          ))}
        </div>

        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#92400E', fontStyle: 'italic' }}>
          * Notice: Alerts are heuristic engagement markers to support caregiver observations. They do NOT constitute medical or neurological diagnoses.
        </p>
      </div>

      {/* Longitudinal Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.75rem' }}>
        {/* Accuracy vs Session */}
        <div style={{ background: 'var(--bg-surface)', border: '3px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Accuracy Progression (% over Sessions)
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="session_number" label={{ value: 'Session', position: 'insideBottomRight', offset: -5 }} />
                <YAxis domain={[40, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} name="Accuracy (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reaction Latency vs Session */}
        <div style={{ background: 'var(--bg-surface)', border: '3px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Response Time Trend (seconds)
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="session_number" label={{ value: 'Session', position: 'insideBottomRight', offset: -5 }} />
                <YAxis domain={[0, 6]} />
                <Tooltip />
                <Line type="monotone" dataKey="response_time_s" stroke="var(--accent-gold)" strokeWidth={3} dot={{ r: 4 }} name="Response Time (s)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Difficulty Level Progression */}
        <div style={{ background: 'var(--bg-surface)', border: '3px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Adaptive Difficulty Ladder (Level 1 to 5)
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="session_number" />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip />
                <Line type="stepAfter" dataKey="difficulty_level" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4 }} name="Difficulty Level" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Breakdown Bar Chart */}
        <div style={{ background: 'var(--bg-surface)', border: '3px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Accuracy by Cognitive Domain
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="game" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="accuracy" fill="var(--primary)" name="Mean Accuracy (%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reminder Management Panel */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '3px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Bell size={26} color="var(--accent-gold)" />
          <span>Patient Reminders & Living Routine Schedule</span>
        </h3>

        {/* Current Reminders List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {reminders.map((r) => (
            <div key={r.id} style={{
              border: '2px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: r.is_active ? 'var(--bg-surface)' : '#F3F4F6'
            }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>{r.title}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                  {r.time_str} | {r.category}
                </div>
              </div>
              <span style={{ fontSize: '1.6rem' }}>{r.category === 'medication' ? '💊' : r.category === 'hydration' ? '🥛' : '⏰'}</span>
            </div>
          ))}
        </div>

        {/* Add New Reminder Form */}
        <form onSubmit={handleAddReminder} style={{
          background: 'var(--bg-surface-subtle)',
          border: '2px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: '2 1 240px' }}>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Reminder Title:
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Afternoon Hydration & Tea"
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
            />
          </div>

          <div style={{ flex: '1 1 140px' }}>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Time:
            </label>
            <input
              type="text"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="04:00 PM"
              required
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
            />
          </div>

          <div style={{ flex: '1 1 140px' }}>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Category:
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-strong)' }}
            >
              <option value="medication">Medication 💊</option>
              <option value="hydration">Hydration 🥛</option>
              <option value="meal">Meal 🍲</option>
              <option value="activity">Activity 🚶</option>
              <option value="appointment">Appointment 🏥</option>
            </select>
          </div>

          <button type="submit" className="btn-big btn-primary" style={{ minHeight: '52px', fontSize: '1.1rem' }}>
            <Plus size={22} />
            <span>Add Reminder</span>
          </button>
        </form>
      </div>
    </div>
  );
}
