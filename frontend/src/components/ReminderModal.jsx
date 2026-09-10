import React, { useEffect } from 'react';
import { Bell, CheckCircle2, Clock, X } from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { useI18n } from '../i18n';
import { api } from '../services/api';

export default function ReminderModal({ reminder, onClose, onAcknowledge }) {
  const { t, getVoiceLocale } = useI18n();

  useEffect(() => {
    if (reminder) {
      voiceService.playGentleTone('chime');
      const voiceText = `${reminder.title}. Scheduled for ${reminder.time_str}.`;
      voiceService.speak(voiceText, getVoiceLocale());
    }
  }, [reminder, getVoiceLocale]);

  if (!reminder) return null;

  const handleDone = async () => {
    await api.acknowledgeReminder(reminder.id);
    if (onAcknowledge) onAcknowledge(reminder.id);
    onClose();
  };

  const getCategoryEmoji = (cat) => {
    switch (cat) {
      case 'medication': return '💊';
      case 'hydration': return '🥛';
      case 'meal': return '🍲';
      case 'activity': return '🚶';
      case 'appointment': return '🏥';
      default: return '⏰';
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-reminder-title">
      <div className="modal-card">
        <div style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>
          {getCategoryEmoji(reminder.category)}
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          <Bell size={24} />
          <span>{reminder.time_str}</span>
        </div>

        <h2 id="modal-reminder-title" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: 1.3 }}>
          {reminder.title}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            className="btn-big btn-primary"
            onClick={handleDone}
            style={{ width: '100%', minHeight: '68px', fontSize: '1.35rem' }}
          >
            <CheckCircle2 size={28} />
            <span>{t('reminders_mark_done')}</span>
          </button>

          <button
            className="btn-big btn-secondary"
            onClick={onClose}
            style={{ width: '100%', minHeight: '56px', fontSize: '1.15rem' }}
          >
            <Clock size={24} />
            <span>{t('reminders_snooze')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
