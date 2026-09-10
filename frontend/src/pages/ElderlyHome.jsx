import React, { useState, useEffect } from 'react';
import { Play, Bell, CheckCircle, Clock } from 'lucide-react';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import VoicePrompt from '../components/VoicePrompt';
import ReminderModal from '../components/ReminderModal';

export default function ElderlyHome({ onSelectGame, userId = 'NER-PAT-4821' }) {
  const { t } = useI18n();
  const [reminders, setReminders] = useState([]);
  const [activeModalReminder, setActiveModalReminder] = useState(null);

  useEffect(() => {
    async function loadReminders() {
      const data = await api.getReminders(userId);
      setReminders(data);
      // Auto-prompt the first unacknowledged morning medication reminder
      const unack = data.find(r => r.is_active && !r.last_acknowledged);
      if (unack) {
        setTimeout(() => {
          setActiveModalReminder(unack);
        }, 1200);
      }
    }
    loadReminders();
  }, [userId]);

  const games = [
    {
      id: 'memory_matching',
      icon: '👒',
      title: t('games.memory_matching.title'),
      subtitle: t('games.memory_matching.subtitle'),
      desc: t('games.memory_matching.desc')
    },
    {
      id: 'sequence_recall',
      icon: '🥁',
      title: t('games.sequence_recall.title'),
      subtitle: t('games.sequence_recall.subtitle'),
      desc: t('games.sequence_recall.desc')
    },
    {
      id: 'pattern_recognition',
      icon: '🦏',
      title: t('games.pattern_recognition.title'),
      subtitle: t('games.pattern_recognition.subtitle'),
      desc: t('games.pattern_recognition.desc')
    },
    {
      id: 'attention_concentration',
      icon: '🍃',
      title: t('games.attention_concentration.title'),
      subtitle: t('games.attention_concentration.subtitle'),
      desc: t('games.attention_concentration.desc')
    },
    {
      id: 'daily_routine',
      icon: '🥛',
      title: t('games.daily_routine.title'),
      subtitle: t('games.daily_routine.subtitle'),
      desc: t('games.daily_routine.desc')
    }
  ];

  const handleReminderDone = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, last_acknowledged: new Date().toISOString() } : r));
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          {t('welcome_elderly')}
        </h2>
      </div>

      <VoicePrompt text={t('welcome_elderly')} />

      {/* Reminders Bar */}
      {reminders.length > 0 && (
        <div style={{
          background: 'var(--accent-gold-subtle)',
          border: '3px solid var(--accent-gold)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.75rem',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '1.3rem' }}>
              <Bell size={26} />
              <span>{t('reminders_heading')}</span>
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tap to acknowledge</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {reminders.map((rem) => {
              const isAcknowledged = !!rem.last_acknowledged;
              return (
                <button
                  key={rem.id}
                  onClick={() => setActiveModalReminder(rem)}
                  style={{
                    flex: '0 0 auto',
                    background: isAcknowledged ? '#E5E7EB' : 'white',
                    border: '2px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    opacity: isAcknowledged ? 0.7 : 1
                  }}
                  aria-label={rem.title}
                >
                  <span style={{ fontSize: '1.5rem' }}>{rem.category === 'medication' ? '💊' : rem.category === 'hydration' ? '🥛' : '⏰'}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{rem.title}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{rem.time_str}</div>
                  </div>
                  {isAcknowledged ? <CheckCircle size={22} color="var(--primary)" /> : <Clock size={22} color="var(--accent-gold)" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Cognitive Activities Large Tiles */}
      <div className="games-grid">
        {games.map((g) => (
          <div key={g.id} className="game-tile">
            <div>
              <div className="game-tile-icon">{g.icon}</div>
              <h3 className="game-tile-title">{g.title}</h3>
              <p className="game-tile-subtitle">{g.subtitle}</p>
              <p className="game-tile-desc">{g.desc}</p>
            </div>

            <button
              onClick={() => onSelectGame(g.id)}
              className="game-tile-play-btn"
              aria-label={`${t('btn_play')}: ${g.title}`}
            >
              <Play size={24} fill="currentColor" />
              <span>{t('btn_play')}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Reminder Pop-up Modal */}
      {activeModalReminder && (
        <ReminderModal
          reminder={activeModalReminder}
          onClose={() => setActiveModalReminder(null)}
          onAcknowledge={handleReminderDone}
        />
      )}
    </div>
  );
}
