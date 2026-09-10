import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Award, CheckCircle, Volume2, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useI18n } from '../i18n';
import { api } from '../services/api';
import { voiceService } from '../services/voiceService';
import VoicePrompt from '../components/VoicePrompt';

const INSTRUMENTS = [
  { id: 'dhol', label_en: 'Bihu Dhol', label_as: 'ঢোল', label_hi: 'ढोल', label_mr: 'बिहू ढोल', icon: '🥁', color: '#D97706' },
  { id: 'pepa', label_en: 'Pepa Horn', label_as: 'পেঁপা', label_hi: 'पेपा', label_mr: 'पेपा (शिंगाचे वाद्य)', icon: '🎺', color: '#059669' },
  { id: 'gogona', label_en: 'Gogona', label_as: 'গগনা', label_hi: 'गगना', label_mr: 'गगना वाद्य', icon: '🎵', color: '#2563EB' },
  { id: 'bhortaal', label_en: 'Bhortaal', label_as: 'ভৰতাল', label_hi: 'ताल', label_mr: 'झांज / ताल', icon: '🔔', color: '#7C3AED' },
  { id: 'flute', label_en: 'Bamboo Flute', label_as: 'বাঁহী', label_hi: 'बांसुरी', label_mr: 'बांबूची बासरी', icon: '🪈', color: '#DB2777' },
  { id: 'xorai', label_en: 'Xorai Bell', label_as: 'শৰাই', label_hi: 'शराई', label_mr: 'शराई (तबक)', icon: '🏆', color: '#DC2626' }
];

export default function SequenceRecallGame({ onBack, userId = 'NER-PAT-4821', currentDifficulty = 2 }) {
  const { t, locale } = useI18n();

  const [difficulty, setDifficulty] = useState(currentDifficulty);
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [isPlayingSeq, setIsPlayingSeq] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const seqTimeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    seqTimeoutsRef.current.forEach(clearTimeout);
    seqTimeoutsRef.current = [];
  };

  const getSequenceLength = (diff) => {
    switch (diff) {
      case 1: return 2;
      case 2: return 3;
      case 3: return 4;
      case 4: return 5;
      case 5: return 6;
      default: return 3;
    }
  };

  const getDisplayDuration = (diff) => {
    switch (diff) {
      case 1: return 1800;
      case 2: return 1400;
      case 3: return 1100;
      case 4: return 900;
      case 5: return 750;
      default: return 1400;
    }
  };

  const startNewRound = (diff = difficulty) => {
    clearAllTimeouts();
    const length = getSequenceLength(diff);
    // Pick unique or pleasant repeating instruments
    const newSeq = [];
    for (let i = 0; i < length; i++) {
      const randomItem = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
      newSeq.push(randomItem);
    }

    setSequence(newSeq);
    setUserSequence([]);
    setHighlightedIndex(null);
    setIsCompleted(false);
    setEvalResult(null);
    setStartTime(Date.now());

    // Play the sequence to user after brief delay
    const startTimer = setTimeout(() => {
      playSequenceToUser(newSeq, diff);
    }, 500);
    seqTimeoutsRef.current.push(startTimer);
  };

  const playSequenceToUser = (seqToPlay, diff = difficulty) => {
    clearAllTimeouts();
    setIsPlayingSeq(true);
    setUserSequence([]);
    const stepDuration = getDisplayDuration(diff);

    seqToPlay.forEach((item, index) => {
      const t1 = setTimeout(() => {
        setHighlightedIndex(item.id);
        voiceService.playGentleTone('chime');
      }, index * stepDuration);
      seqTimeoutsRef.current.push(t1);

      const t2 = setTimeout(() => {
        setHighlightedIndex(null);
      }, (index * stepDuration) + (stepDuration * 0.7));
      seqTimeoutsRef.current.push(t2);
    });

    const endTimer = setTimeout(() => {
      setIsPlayingSeq(false);
      voiceService.playGentleTone('hint');
    }, seqToPlay.length * stepDuration);
    seqTimeoutsRef.current.push(endTimer);
  };

  const switchDifficulty = (lvl) => {
    setDifficulty(lvl);
    startNewRound(lvl);
  };

  useEffect(() => {
    startNewRound(difficulty);
    return () => {
      clearAllTimeouts();
    };
  }, []);

  const handleInstrumentClick = (instrument) => {
    if (isPlayingSeq || isCompleted) return;

    voiceService.playGentleTone('chime');
    const nextIndex = userSequence.length;
    const targetItem = sequence[nextIndex];

    const newUserSeq = [...userSequence, instrument];
    setUserSequence(newUserSeq);

    if (instrument.id !== targetItem.id) {
      // Mistake made: gentle feedback and allow retry
      voiceService.playGentleTone('chime');
      setTimeout(() => {
        setUserSequence([]);
        playSequenceToUser(sequence, difficulty);
      }, 800);
      return;
    }

    // Correct step
    if (newUserSeq.length === sequence.length) {
      // Sequence completed successfully!
      handleGameCompletion(true);
    }
  };

  const handleGameCompletion = async (success) => {
    setIsCompleted(true);
    confetti({ particleCount: 50, spread: 60 });
    voiceService.playGentleTone('success');

    const durationSeconds = Math.max(4, Math.round((Date.now() - startTime) / 1000));
    const responseTimeMs = Math.round((durationSeconds * 1000) / sequence.length);

    try {
      const result = await api.submitGameResult({
        user_id: userId,
        game_type: 'sequence_recall',
        current_difficulty: difficulty,
        accuracy: 1.0,
        response_time_ms: responseTimeMs,
        attempts: 1 + hintsUsed,
        completed: true,
        hints_used: hintsUsed,
        session_duration_s: durationSeconds,
        adaptation_mode: 'adaptive'
      });
      setEvalResult(result);
    } catch (e) {
      console.warn('API submission fallback:', e);
    }
  };

  const handleReplaySequence = () => {
    if (isPlayingSeq || isCompleted) return;
    setHintsUsed((prev) => prev + 1);
    playSequenceToUser(sequence, difficulty);
  };

  const getItemLabel = (item) => {
    if (locale === 'as') return item.label_as;
    if (locale === 'hi') return item.label_hi;
    if (locale === 'mr') return item.label_mr || item.label_hi;
    return item.label_en;
  };

  return (
    <div className="game-play-card">
      <div className="game-play-header">
        <button onClick={onBack} className="btn-big btn-secondary" aria-label="Go Back">
          <ArrowLeft size={24} />
          <span>{t('btn_back_home')}</span>
        </button>

        <div style={{ textAlign: 'center' }}>
          <h2 className="game-play-title">{t('games.sequence_recall.title')}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>{t('difficulty_level')}:</span>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => switchDifficulty(lvl)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: '2px solid var(--border-strong)',
                  background: difficulty === lvl ? 'var(--primary)' : '#F3EFE6',
                  color: difficulty === lvl ? '#FFFFFF' : 'var(--text-main)',
                  cursor: 'pointer',
                  boxShadow: difficulty === lvl ? '0 2px 6px rgba(12, 97, 61, 0.4)' : 'none'
                }}
                aria-label={`Select Level ${lvl}`}
              >
                Level {lvl}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => switchDifficulty(difficulty)} className="btn-big btn-secondary" aria-label="Restart Activity">
          <RefreshCw size={24} />
          <span>{t('btn_restart')}</span>
        </button>
      </div>

      <VoicePrompt
        text={
          isPlayingSeq
            ? "Watch closely as the festive musical instruments play in sequence."
            : t('games.sequence_recall.prompt')
        }
      />

      {/* Progress & Guidance Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          {isPlayingSeq ? (
            <span style={{ color: 'var(--accent-gold)' }}>🎵 Playing Rhythm Sequence...</span>
          ) : (
            <span>Your Turn: <strong>{userSequence.length} / {sequence.length} tapped</strong></span>
          )}
        </div>

        <button
          onClick={handleReplaySequence}
          className="btn-big btn-accent"
          disabled={isPlayingSeq || isCompleted}
          style={{ minHeight: '52px', fontSize: '1.15rem' }}
        >
          <Volume2 size={22} />
          <span>Replay Sequence (Hint)</span>
        </button>
      </div>

      {/* Instrument Selection Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.25rem', margin: '2rem 0' }}>
        {INSTRUMENTS.map((inst) => {
          const isLit = highlightedIndex === inst.id;
          return (
            <button
              key={inst.id}
              onClick={() => handleInstrumentClick(inst)}
              disabled={isPlayingSeq || isCompleted}
              style={{
                aspectRatio: '1',
                borderRadius: 'var(--radius-md)',
                border: isLit ? `5px solid ${inst.color}` : '4px solid var(--border-strong)',
                background: isLit ? '#FEF3C7' : 'var(--bg-surface)',
                transform: isLit ? 'scale(1.08)' : 'scale(1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isLit ? '0 8px 24px rgba(217, 119, 6, 0.4)' : 'var(--shadow-md)',
                transition: 'all 0.15s ease',
                padding: '1rem'
              }}
              aria-label={getItemLabel(inst)}
            >
              <span style={{ fontSize: '3.2rem', marginBottom: '0.4rem' }}>{inst.icon}</span>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {getItemLabel(inst)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Completion Panel */}
      {isCompleted && (
        <div style={{ marginTop: '2rem', padding: '1.75rem', background: 'var(--primary-subtle)', borderRadius: 'var(--radius-lg)', border: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
            <CheckCircle size={36} />
            <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{t('encouragement_great')}</h3>
          </div>

          {evalResult && (
            <div style={{ marginTop: '1rem', background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 700 }}>
                <span>{t('score_label')}: <strong style={{ color: 'var(--primary)' }}>{evalResult.performance_score} / 100</strong></span>
                <span>Next Difficulty: <strong style={{ color: 'var(--accent-gold)' }}>Level {evalResult.next_difficulty}</strong></span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                💡 <strong>AI Adaptation Rationale:</strong> {evalResult.adaptation_rationale}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => switchDifficulty(evalResult?.next_difficulty || difficulty)} className="btn-big btn-primary" style={{ flex: 1 }}>
              <Award size={26} />
              <span>Continue to Next Level</span>
            </button>
            <button onClick={onBack} className="btn-big btn-secondary" style={{ flex: 1 }}>
              <span>{t('btn_back_home')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
